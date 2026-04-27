"""
Process UC freshman GPA by source school crosstab data.

Reads:
  data/raw_gpa/gpa_{TYPE}_{CAMPUS_SCOPE}_year_{YYYY}.csv

Writes:
  data/gpa_{TYPE}.json
  data/gpa.json

Schema per school:
{
  "school_id": "50944",
  "school_name": "...",
  "school_type": "CA Public",
  "city": "...",
  "county": "...",
  "years": {
    "2025": {
      "app_gpa": 3.69,
      "adm_gpa": 3.76,
      "enr_gpa": 3.88,
      "by_campus": {
        "Berkeley": {"app_gpa": 4.02, "adm_gpa": 4.18, "enr_gpa": 4.21}
      }
    }
  }
}
"""

import csv
import json
import re
from pathlib import Path

RAW_DIR = Path('data/raw_gpa')
OUTPUT_FILE = Path('data/gpa.json')

TYPE_SLUG_TO_LABEL = {
    'ca_public': 'CA Public',
    'ca_private': 'CA Private',
    'nonca_domestic': 'Non-CA Domestic',
    'foreign': 'Foreign',
}

CAMPUS_SLUG_TO_LABEL = {
    'universitywide': 'Universitywide',
    'berkeley': 'Berkeley',
    'davis': 'Davis',
    'irvine': 'Irvine',
    'los_angeles': 'Los Angeles',
    'merced': 'Merced',
    'riverside': 'Riverside',
    'san_diego': 'San Diego',
    'santa_barbara': 'Santa Barbara',
    'santa_cruz': 'Santa Cruz',
}

FILE_RE = re.compile(
    r'^gpa_(ca_public|ca_private|nonca_domestic|foreign)_'
    r'(universitywide|berkeley|davis|irvine|los_angeles|merced|riverside|san_diego|santa_barbara|santa_cruz)_'
    r'year_(\d{4})\.csv$'
)


def normalize_header(value):
    return re.sub(r'[^a-z0-9]+', '_', (value or '').strip().lower()).strip('_')


def slugify(value):
    value = re.sub(r'[^a-z0-9]+', '-', (value or '').strip().lower())
    return value.strip('-') or 'unknown'


def decode_text(path):
    raw = path.read_bytes()
    for encoding in ('utf-16', 'utf-8-sig', 'utf-8'):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode('latin-1')


def parse_float(value):
    if value is None:
        return None
    text = str(value).strip().replace(',', '')
    if not text or text.lower() in {'null', '%null%', 'nan'}:
        return None
    try:
        return round(float(text), 3)
    except ValueError:
        return None


def value_for(row, *candidates):
    normalized = {normalize_header(k): v for k, v in row.items()}
    for candidate in candidates:
        candidate_norm = normalize_header(candidate)
        if candidate_norm in normalized:
            return normalized[candidate_norm]
    return ''


def first_matching_header(row, predicate):
    for key, value in row.items():
        if predicate(normalize_header(key)):
            return value
    return ''


def gpa_value(row, prefix):
    direct_candidates = {
        'app': ('App GPA', 'Applicant GPA', 'Application GPA'),
        'adm': ('Adm GPA', 'Admit GPA', 'Admitted GPA', 'Admission GPA'),
        'enr': ('Enrl GPA', 'Enr GPA', 'Enroll GPA', 'Enrolled GPA'),
    }[prefix]
    direct = value_for(row, *direct_candidates)
    if direct:
        return parse_float(direct)

    return parse_float(first_matching_header(
        row,
        lambda h: 'gpa' in h and (
            (prefix == 'app' and ('app' in h or 'applicant' in h)) or
            (prefix == 'adm' and ('adm' in h or 'admit' in h or 'admitted' in h)) or
            (prefix == 'enr' and ('enr' in h or 'enrl' in h or 'enroll' in h))
        )
    ))


def school_id_for(row, school_name, city, county, school_type):
    calc = value_for(row, 'Calculation1', 'School Code', 'School ID', 'CDS Code')
    match = re.search(r'(\d+)\s*$', calc or '')
    if match:
        return normalize_school_id(match.group(1))
    if calc:
        return calc.strip()
    return f'generated:{slugify(school_type)}:{slugify(school_name)}:{slugify(city)}:{slugify(county)}'


def normalize_school_id(value):
    text = (value or '').strip()
    if text.isdigit():
        return str(int(text))
    return text


def parse_csv(path):
    text = decode_text(path)
    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        return []

    reader = csv.DictReader(lines, delimiter='\t')
    rows = []
    for row in reader:
        school_name = value_for(row, 'School')
        if not school_name or school_name.strip().lower() in {'null', '%null%'}:
            continue
        rows.append(row)
    return rows


def empty_gpa():
    return {'app_gpa': None, 'adm_gpa': None, 'enr_gpa': None}


def set_if_present(target, source):
    for key, value in source.items():
        if value is not None:
            target[key] = value


def process_file(school_data, path):
    match = FILE_RE.match(path.name)
    if not match:
        return False

    type_slug, campus_slug, year = match.groups()
    school_type = TYPE_SLUG_TO_LABEL[type_slug]
    campus_name = CAMPUS_SLUG_TO_LABEL[campus_slug]

    rows = parse_csv(path)
    for row in rows:
        school_name = value_for(row, 'School').strip()
        city = value_for(row, 'City').strip()
        county = (
            value_for(row, 'County/State/ Country')
            or value_for(row, 'County/State/ Territory')
            or value_for(row, 'County/State/Country')
            or value_for(row, 'County')
        ).strip()
        school_id = school_id_for(row, school_name, city, county, school_type)
        key = (school_id, school_type)

        record = {
            'app_gpa': gpa_value(row, 'app'),
            'adm_gpa': gpa_value(row, 'adm'),
            'enr_gpa': gpa_value(row, 'enr'),
        }
        if all(value is None for value in record.values()):
            continue

        if key not in school_data:
            school_data[key] = {
                'school_id': school_id,
                'school_name': school_name,
                'school_type': school_type,
                'city': city,
                'county': county,
                'years': {},
            }

        school = school_data[key]
        school['city'] = school['city'] or city
        school['county'] = school['county'] or county
        year_data = school['years'].setdefault(year, {**empty_gpa(), 'by_campus': {}})

        if campus_slug == 'universitywide':
            set_if_present(year_data, record)
        else:
            campus_data = year_data['by_campus'].setdefault(campus_name, empty_gpa())
            set_if_present(campus_data, record)

    return True


def main():
    if not RAW_DIR.exists():
        raise SystemExit(f'{RAW_DIR} does not exist. Run gpa_scraper.js first.')

    school_data = {}
    files = sorted(RAW_DIR.glob('gpa_*_year_*.csv'))
    matched = 0

    for path in files:
        try:
            if process_file(school_data, path):
                matched += 1
        except Exception as exc:
            print(f'Error processing {path.name}: {exc}')

    result = sorted(school_data.values(), key=lambda s: (s['school_type'], s['school_name'], s['city']))
    by_type = {}
    for school in result:
        by_type.setdefault(school['school_type'], []).append(school)

    print(f'Processed raw GPA files: {matched}/{len(files)}')
    print(f'Total schools with GPA data: {len(result)}')

    slug_by_label = {label: slug for slug, label in TYPE_SLUG_TO_LABEL.items()}
    for school_type, schools in sorted(by_type.items()):
        slug = slug_by_label[school_type]
        output = Path(f'data/gpa_{slug}.json')
        with output.open('w') as f:
            json.dump(schools, f, separators=(',', ':'))
        print(f'  Written {output} ({len(schools)} schools, {output.stat().st_size / (1024 * 1024):.1f} MB)')

    with OUTPUT_FILE.open('w') as f:
        json.dump(result, f, separators=(',', ':'))
    print(f'Written {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size / (1024 * 1024):.1f} MB)')


if __name__ == '__main__':
    main()
