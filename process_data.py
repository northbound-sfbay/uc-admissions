"""
Process UC Admissions by Source School data.

Reads:
  - data/raw/year_YYYY.csv               → CA public high schools, universitywide
  - data/raw/campus_SLUG_year_YYYY.csv   → CA public, per-campus
  - data/raw/type_{SLUG}_year_YYYY.csv   → other school types, universitywide
  - data/raw/type_campus_{TYPE}_{CAMPUS}_year_YYYY.csv → non-public, per-campus

Output: data/admissions.json
Schema per school:
{
  "school_id": "50944",
  "school_name": "...",
  "school_type": "CA Public",   // "CA Public" | "CA Private" | "Non-CA Domestic" | "Foreign" | "Other"
  "city": "...",
  "county": "...",
  "years": {
    "2024": {
      "app": 81, "adm": 67, "enr": 27, "admit_rate": 0.8272,
      "by_ethnicity": {
        "African American": {"app": 9, "adm": 7, "enr": null, "admit_rate": 0.7778},
        ...  (null means no data for that ethnicity)
      },
      "by_campus": {
        "Berkeley": {"app": 30, "adm": 5, "enr": 3, "admit_rate": 0.167},
        ...  (only campuses with any data)
      }
    }
  }
}
"""

import json
import re
from pathlib import Path

RAW_DIR = Path('data/raw')
OUTPUT_FILE = Path('data/admissions.json')
OUTPUT_FILE.parent.mkdir(exist_ok=True)

ETHNICITIES = [
    'African American', 'American Indian', 'Hispanic/ Latinx',
    'Pacific Islander', 'Asian', 'White', 'Domestic Unknown', "Int'l",
]

CAMPUS_SLUGS = {
    'berkeley':     'Berkeley',
    'davis':        'Davis',
    'irvine':       'Irvine',
    'los_angeles':  'Los Angeles',
    'merced':       'Merced',
    'riverside':    'Riverside',
    'san_diego':    'San Diego',
    'santa_barbara':'Santa Barbara',
    'santa_cruz':   'Santa Cruz',
}

# Maps file-name slug → human-readable school_type label
TYPE_SLUG_TO_LABEL = {
    'ca_private':    'CA Private',
    'nonca_domestic':'Non-CA Domestic',
    'foreign':       'Foreign',
    'other':         'Other',
}


def parse_int(v):
    if not v or not v.strip():
        return None
    try:
        return int(v.strip().replace(',', ''))
    except ValueError:
        return None


def parse_csv(filepath):
    """Parse a Crosstab TSV (UTF-16) file. Returns list of row dicts."""
    with open(filepath, 'rb') as f:
        raw = f.read()
    text = raw.decode('utf-16')
    lines = text.split('\n')
    if not lines:
        return []
    headers = lines[0].rstrip('\r').split('\t')
    rows = []
    for line in lines[1:]:
        line = line.rstrip('\r')
        if not line.strip():
            continue
        parts = line.split('\t')
        while len(parts) < len(headers):
            parts.append('')
        row = dict(zip(headers, parts))
        ct = row.get('Count', '').strip()
        if ct not in ('App', 'Adm', 'Enr'):
            continue
        calc1 = row.get('Calculation1', '').strip()
        m = re.search(r'(\d+)\s*$', calc1)
        row['_school_id'] = m.group(1) if m else calc1
        row['_school_name'] = row.get('School', '').strip()
        row['_city'] = row.get('City', '').strip()
        row['_county'] = row.get('County/State/ Territory', '').strip()
        row['_ct'] = ct
        rows.append(row)
    return rows


def build_school_key(row, school_type):
    # Include school_type in key so same ID across types doesn't collide
    return (row['_school_id'], school_type)


def empty_counts():
    return {'app': None, 'adm': None, 'enr': None, 'admit_rate': None}


def set_count(d, ct, val):
    field = {'App': 'app', 'Adm': 'adm', 'Enr': 'enr'}[ct]
    d[field] = val


def compute_admit_rate(d):
    if d['app'] and d['adm'] and d['app'] > 0:
        d['admit_rate'] = round(d['adm'] / d['app'], 4)


def process_type_files(school_data, files, school_type_label):
    """Process a list of year CSV files for one school type."""
    files = sorted(files)
    print(f'  {school_type_label}: {len(files)} files')
    for fp in files:
        m = re.search(r'year_(\d{4})\.csv', fp.name)
        if not m:
            continue
        year = m.group(1)
        try:
            rows = parse_csv(fp)
        except Exception as e:
            print(f'    Error {fp.name}: {e}')
            continue
        for row in rows:
            key = build_school_key(row, school_type_label)
            if key not in school_data:
                school_data[key] = {
                    'school_id':   row['_school_id'],
                    'school_name': row['_school_name'],
                    'school_type': school_type_label,
                    'city':        row['_city'],
                    'county':      row['_county'],
                    'years': {},
                }
            if year not in school_data[key]['years']:
                school_data[key]['years'][year] = {
                    **empty_counts(),
                    'by_ethnicity': {eth: empty_counts() for eth in ETHNICITIES},
                    'by_campus': {},
                }
            yr = school_data[key]['years'][year]
            ct = row['_ct']
            set_count(yr, ct, parse_int(row.get('All', '')))
            for eth in ETHNICITIES:
                set_count(yr['by_ethnicity'][eth], ct, parse_int(row.get(eth, '')))

    # Compute admit rates; clean up empty ethnicity entries
    for key, school in school_data.items():
        if school['school_type'] != school_type_label:
            continue
        for yr in school['years'].values():
            compute_admit_rate(yr)
            for eth in ETHNICITIES:
                e = yr['by_ethnicity'][eth]
                compute_admit_rate(e)
                if e['app'] is None and e['adm'] is None and e['enr'] is None:
                    yr['by_ethnicity'][eth] = None


def process_universitywide(school_data):
    """Process year_YYYY.csv (CA Public) files."""
    files = list(RAW_DIR.glob('year_*.csv'))
    process_type_files(school_data, files, 'CA Public')

    counts = {y: sum(1 for s in school_data.values() if y in s['years'])
              for y in {yr for s in school_data.values() for yr in s['years']}}
    years_sorted = sorted(counts)
    if years_sorted:
        print(f'    Years: {years_sorted[0]}–{years_sorted[-1]}, '
              f'schools range: {min(counts.values())}–{max(counts.values())}')


def process_other_types(school_data):
    """Process type_{slug}_year_YYYY.csv files for other school categories."""
    for slug, label in TYPE_SLUG_TO_LABEL.items():
        files = list(RAW_DIR.glob(f'type_{slug}_year_*.csv'))
        if not files:
            print(f'  {label}: no files found (skip)')
            continue
        process_type_files(school_data, files, label)


def process_campus(school_data):
    """Process campus_SLUG_year_YYYY.csv → by_campus on CA Public schools."""
    campus_files = sorted(RAW_DIR.glob('campus_*_year_*.csv'))
    print(f'\nCampus files: {len(campus_files)}')

    found_slugs = set()
    for fp in campus_files:
        m = re.search(r'campus_(.+)_year_(\d{4})\.csv', fp.name)
        if m:
            found_slugs.add(m.group(1))
    print(f'  Campus slugs found: {sorted(found_slugs)}')

    for fp in campus_files:
        m = re.search(r'campus_(.+)_year_(\d{4})\.csv', fp.name)
        if not m:
            continue
        slug, year = m.group(1), m.group(2)
        campus_name = CAMPUS_SLUGS.get(slug, slug.replace('_', ' ').title())

        try:
            rows = parse_csv(fp)
        except Exception as e:
            print(f'  Error {fp.name}: {e}')
            continue

        for row in rows:
            key = build_school_key(row, 'CA Public')
            val = parse_int(row.get('All', ''))
            if val is None:
                continue

            if key not in school_data:
                school_data[key] = {
                    'school_id':   row['_school_id'],
                    'school_name': row['_school_name'],
                    'school_type': 'CA Public',
                    'city':        row['_city'],
                    'county':      row['_county'],
                    'years': {},
                }
            school = school_data[key]
            if year not in school['years']:
                school['years'][year] = {
                    **empty_counts(),
                    'by_ethnicity': {eth: None for eth in ETHNICITIES},
                    'by_campus': {},
                }
            yr = school['years'][year]
            if campus_name not in yr['by_campus']:
                yr['by_campus'][campus_name] = empty_counts()
            set_count(yr['by_campus'][campus_name], row['_ct'], val)

    # Compute admit rates for campus entries
    for school in school_data.values():
        for yr in school['years'].values():
            for cd in yr['by_campus'].values():
                compute_admit_rate(cd)

    campus_entry_count = sum(
        len(yr['by_campus'])
        for s in school_data.values()
        for yr in s['years'].values()
    )
    print(f'  Total campus-year entries: {campus_entry_count}')


def process_type_campus(school_data):
    """Process type_campus_{type}_{campus}_year_YYYY.csv → by_campus on non-public schools."""
    type_campus_files = sorted(RAW_DIR.glob('type_campus_*_year_*.csv'))
    print(f'\nType+campus files: {len(type_campus_files)}')

    for fp in type_campus_files:
        m = re.search(r'type_campus_(.+)_(berkeley|davis|irvine|los_angeles|merced|riverside|san_diego|santa_barbara|santa_cruz)_year_(\d{4})\.csv', fp.name)
        if not m:
            continue

        type_slug, campus_slug, year = m.group(1), m.group(2), m.group(3)
        school_type_label = TYPE_SLUG_TO_LABEL.get(type_slug)
        if not school_type_label:
            print(f'  Unknown school type slug in {fp.name} (skip)')
            continue

        campus_name = CAMPUS_SLUGS.get(campus_slug, campus_slug.replace('_', ' ').title())

        try:
            rows = parse_csv(fp)
        except Exception as e:
            print(f'  Error {fp.name}: {e}')
            continue

        for row in rows:
            key = build_school_key(row, school_type_label)
            val = parse_int(row.get('All', ''))
            if val is None:
                continue

            if key not in school_data:
                school_data[key] = {
                    'school_id':   row['_school_id'],
                    'school_name': row['_school_name'],
                    'school_type': school_type_label,
                    'city':        row['_city'],
                    'county':      row['_county'],
                    'years': {},
                }

            school = school_data[key]
            if year not in school['years']:
                school['years'][year] = {
                    **empty_counts(),
                    'by_ethnicity': {eth: None for eth in ETHNICITIES},
                    'by_campus': {},
                }

            yr = school['years'][year]
            if campus_name not in yr['by_campus']:
                yr['by_campus'][campus_name] = empty_counts()
            set_count(yr['by_campus'][campus_name], row['_ct'], val)

    for school in school_data.values():
        for yr in school['years'].values():
            for cd in yr['by_campus'].values():
                compute_admit_rate(cd)

    type_campus_entry_count = sum(
        len(yr['by_campus'])
        for s in school_data.values()
        for yr in s['years'].values()
        if s['school_type'] != 'CA Public'
    )
    print(f'  Total non-public campus-year entries: {type_campus_entry_count}')


def main():
    school_data = {}

    print('Processing universitywide (CA Public)...')
    process_universitywide(school_data)

    print('\nProcessing other school types...')
    process_other_types(school_data)

    print('\nProcessing campus breakdowns...')
    process_campus(school_data)

    print('\nProcessing non-public campus breakdowns...')
    process_type_campus(school_data)

    result = sorted(school_data.values(), key=lambda s: (s['school_type'], s['school_name']))

    all_years = sorted({yr for s in result for yr in s['years']})
    all_campuses = sorted({
        c for s in result for yr in s['years'].values() for c in yr['by_campus']
    })

    type_counts = {}
    for s in result:
        type_counts[s['school_type']] = type_counts.get(s['school_type'], 0) + 1

    print(f'\nTotal schools: {len(result)}')
    print(f'By type: {type_counts}')
    print(f'Years: {all_years[0]}–{all_years[-1]} ({len(all_years)})')
    print(f'Campuses with data: {all_campuses}')

    # Write one JSON file per school type (for lazy loading in website)
    by_type = {}
    for s in result:
        by_type.setdefault(s['school_type'], []).append(s)

    slug_map = {
        'CA Public':       'ca_public',
        'CA Private':      'ca_private',
        'Non-CA Domestic': 'nonca_domestic',
        'Foreign':         'foreign',
        'Other':           'other',
    }

    for stype, schools in sorted(by_type.items()):
        slug = slug_map.get(stype, stype.lower().replace(' ', '_').replace('-', '_'))
        out_path = Path(f'data/admissions_{slug}.json')
        with open(out_path, 'w') as f:
            json.dump(schools, f, separators=(',', ':'))
        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f'  Written {out_path} ({len(schools)} schools, {size_mb:.1f} MB)')

    # Also write combined file
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(result, f, separators=(',', ':'))
    size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    print(f'Written {OUTPUT_FILE} ({size_mb:.1f} MB, all types combined)')


if __name__ == '__main__':
    main()
