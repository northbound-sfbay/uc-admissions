#!/usr/bin/env python3
"""Extract THECB institution Total rows, preserving suppressed values and provenance.

Usage: python3 scripts/build-texas-admissions.py [--source /path/to/report.xlsx]
Downloads only when explicitly run. Website builds use the committed JSON.
"""
import argparse
import hashlib
import json
import re
import urllib.request
import zipfile
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

SOURCE_URL = 'https://reportcenter.highered.texas.gov/reports/data/applicants-acceptance-and-enrollment-2017-2025/'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
OUTPUT = Path(__file__).resolve().parents[1] / 'public/data/texas-admissions.json'


def number(value):
    if value in ('', '*'):
        return None
    result = float(value)
    if result < 0 or not result.is_integer():
        raise ValueError(f'Unexpected count: {value}')
    return int(result)


def extract(source):
    institutions, statewide, years = {}, {}, []
    with zipfile.ZipFile(source) as archive:
        strings = [
            ''.join(n.text or '' for n in item.findall('.//m:t', NS))
            for item in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', NS)
        ]
        relationships = {
            r.attrib['Id']: r.attrib['Target']
            for r in ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        }
        sheets = ET.fromstring(archive.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)
        for sheet in sheets:
            match = re.fullmatch(r'Fall (\d{4})', sheet.attrib['name'])
            if not match:
                continue
            year = match[1]
            years.append(year)
            target = relationships[sheet.attrib[f'{{{REL_NS}}}id']]
            target = target.lstrip('/') if target.startswith('/') else f'xl/{target}'
            rows = ET.fromstring(archive.read(target)).findall('m:sheetData/m:row', NS)
            seen, headers = set(), {}
            for row in rows:
                cells = {}
                for cell in row.findall('m:c', NS):
                    column = re.sub(r'\d', '', cell.attrib['r'])
                    raw = cell.find('m:v', NS)
                    value = raw.text if raw is not None else ''
                    if cell.attrib.get('t') == 's':
                        value = strings[int(value)]
                    elif cell.attrib.get('t') == 'inlineStr':
                        value = ''.join(n.text or '' for n in cell.findall('.//m:t', NS))
                    cells[column] = ' '.join(value.split())
                if row.attrib['r'] == '4':
                    headers = cells
                    for column, label in {'A': 'FICE Code', 'C': 'Category', 'D': 'Applied (Total Texas)', 'E': 'Accepted (Total Texas)', 'O': 'Total Applicants, Including Out-of-State'}.items():
                        if cells.get(column) != label:
                            raise ValueError(f'{sheet.attrib["name"]}: changed {column} header')
                if cells.get('C') != 'Total':
                    continue
                code = cells['A']
                if not headers or not re.fullmatch(r'\d{6}', code) or code in seen:
                    raise ValueError(f'Invalid or duplicate institution: {year} {code}')
                seen.add(code)
                data = {key: number(cells.get(col, '')) for key, col in {
                    'texasApplicants': 'D', 'texasAccepted': 'E', 'texasEnrolled': 'G', 'allApplicants': 'O',
                }.items()}
                applied, accepted, enrolled = (data[k] for k in ('texasApplicants', 'texasAccepted', 'texasEnrolled'))
                if applied is not None and accepted is not None:
                    if accepted > applied:
                        raise ValueError(f'Acceptances exceed applications: {year} {code}')
                    reported = cells.get('F', '')
                    if applied and reported not in ('', '*') and abs(accepted / applied - float(reported)) > 0.0006:
                        raise ValueError(f'Rate does not reconcile: {year} {code}')
                if enrolled is not None and accepted is not None and enrolled > accepted:
                    raise ValueError(f'Enrollment exceeds acceptances: {year} {code}')
                if data['allApplicants'] is not None and applied is not None and data['allApplicants'] < applied:
                    raise ValueError(f'All applicants less than Texas applicants: {year} {code}')
                data['sourceRow'] = int(row.attrib['r'])
                data['sourceName'] = cells['B']
                if code == '999999':
                    statewide[year] = data
                else:
                    institution = institutions.setdefault(code, {'ficeCode': code, 'name': cells['B'], 'years': {}})
                    institution['name'] = cells['B']
                    institution['years'][year] = data
            if len(seen) < 30 or year not in statewide:
                raise ValueError(f'Incomplete sheet: {year}')
    if sorted(years) != [str(y) for y in range(2017, 2026)]:
        raise ValueError('Unexpected reporting years; review source before extending coverage')
    return {
        'sourceTitle': 'THECB Applicants, Acceptance, and Enrollment 2017–2025',
        'sourceUrl': SOURCE_URL,
        'sourceIndexUrl': 'https://reportcenter.highered.texas.gov/reports/data/',
        'sourcePublishedAt': '2026-07-14',
        'verifiedAt': date.today().isoformat(),
        'sourceSha256': hashlib.sha256(Path(source).read_bytes()).hexdigest(),
        'population': 'First-time undergraduate Texas applicants, institution Total rows',
        'years': sorted(years),
        'latestYear': max(years),
        'institutions': sorted(institutions.values(), key=lambda x: x['name']),
        'statewide': statewide,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path)
    args = parser.parse_args()
    if args.source:
        result = extract(args.source)
    else:
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.xlsx') as report:
            with urllib.request.urlopen(SOURCE_URL, timeout=60) as response:
                report.write(response.read())
            report.flush()
            result = extract(report.name)
    OUTPUT.write_text(json.dumps(result, indent=2) + '\n')
    print(f'Wrote {len(result["institutions"])} institutions, {len(result["years"])} years to {OUTPUT}')
