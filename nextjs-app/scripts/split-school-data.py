#!/usr/bin/env python3
"""
Pre-build script: split per-type admissions JSON into per-school files.

Output:
  school-data/ca_public/{id}.json
  school-data/ca_private/{id}.json
  school-gpa-data/ca_public/{id}.json
  school-gpa-data/ca_private/{id}.json
  public/top300.json   ← top 300 CA schools by total applicants, with slugs

Run from nextjs-app/: python3 scripts/split-school-data.py
"""

import json
import re
import os
from pathlib import Path

# Paths relative to nextjs-app/
DATA_DIR    = Path('../data')
OUT_DIR     = Path('school-data')
GPA_OUT_DIR = Path('school-gpa-data')
PUBLIC_DIR  = Path('public')
TOP_N       = 300

# Only build school pages for CA schools (public + private)
TYPE_FILES = {
    'ca_public':  DATA_DIR / 'admissions_ca_public.json',
    'ca_private': DATA_DIR / 'admissions_ca_private.json',
}

GPA_TYPE_FILES = {
    'ca_public':  DATA_DIR / 'gpa_ca_public.json',
    'ca_private': DATA_DIR / 'gpa_ca_private.json',
}


def make_slug(school_id: str, school_name: str) -> str:
    name = school_name.lower()
    name = re.sub(r"[^a-z0-9]+", '-', name)
    name = name.strip('-')
    return f"{school_id}-{name}"


def total_apps(school: dict) -> int:
    return sum(
        (yr.get('app') or 0)
        for yr in school.get('years', {}).values()
    )


def main():
    all_ca_schools = []

    for type_slug, json_path in TYPE_FILES.items():
        if not json_path.exists():
            print(f'  Skipping missing: {json_path}')
            continue

        print(f'Reading {json_path} …')
        with open(json_path) as f:
            schools = json.load(f)

        out_type_dir = OUT_DIR / type_slug
        out_type_dir.mkdir(parents=True, exist_ok=True)

        public_type_dir = PUBLIC_DIR / 'data' / 'schools' / type_slug
        public_type_dir.mkdir(parents=True, exist_ok=True)

        for school in schools:
            sid = school['school_id']
            out_path = out_type_dir / f'{sid}.json'
            with open(out_path, 'w') as f:
                json.dump(school, f, separators=(',', ':'))
            (public_type_dir / f'{sid}.json').write_text(json.dumps(school, separators=(',', ':')))

        all_ca_schools.extend(schools)
        print(f'  Wrote {len(schools)} files to {out_type_dir}/')

    for type_slug, json_path in GPA_TYPE_FILES.items():
        if not json_path.exists():
            print(f'  Skipping missing GPA data: {json_path}')
            continue

        print(f'Reading {json_path} ...')
        with open(json_path) as f:
            schools = json.load(f)

        out_type_dir = GPA_OUT_DIR / type_slug
        out_type_dir.mkdir(parents=True, exist_ok=True)

        for school in schools:
            sid = school['school_id']
            out_path = out_type_dir / f'{sid}.json'
            with open(out_path, 'w') as f:
                json.dump(school, f, separators=(',', ':'))

        print(f'  Wrote {len(schools)} GPA files to {out_type_dir}/')

    # Lightweight search/peer index: histories stay in selected-school files.
    index = []
    for school in all_ca_schools:
        years = school.get('years', {})
        latest = next((yr for yr in sorted(years, reverse=True) if (years[yr].get('app') or 0) > 0), None)
        index.append({
            **{key: school.get(key, '') for key in ('school_id', 'school_name', 'school_type', 'city', 'county')},
            'years': {}, 'latest_year': latest,
            'latest_applicants': years[latest].get('app') if latest else None,
        })
    index.sort(key=lambda school: (school['school_name'], school['school_id']))
    (PUBLIC_DIR / 'data').mkdir(parents=True, exist_ok=True)
    (PUBLIC_DIR / 'data' / 'school-index.json').write_text(json.dumps(index, separators=(',', ':')))

    # Build top300.json — sorted by total applicants
    all_ca_schools.sort(key=total_apps, reverse=True)
    top300 = []
    for school in all_ca_schools[:TOP_N]:
        sid  = school['school_id']
        slug = make_slug(sid, school['school_name'])
        top300.append({
            'school_id':   sid,
            'school_name': school['school_name'],
            'school_type': school['school_type'],
            'city':        school.get('city', ''),
            'county':      school.get('county', ''),
            'slug':        slug,
        })

    PUBLIC_DIR.mkdir(exist_ok=True)
    out_path = PUBLIC_DIR / 'top300.json'
    with open(out_path, 'w') as f:
        json.dump(top300, f, separators=(',', ':'))
    print(f'\nWrote {out_path} ({len(top300)} schools)')
    print('Done.')


if __name__ == '__main__':
    main()
