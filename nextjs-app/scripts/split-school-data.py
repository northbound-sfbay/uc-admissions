#!/usr/bin/env python3
"""
Pre-build script: split per-type admissions JSON into per-school files.

Output:
  school-data/ca_public/{id}.json
  school-data/ca_private/{id}.json
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
PUBLIC_DIR  = Path('public')
TOP_N       = 300

# Only build school pages for CA schools (public + private)
TYPE_FILES = {
    'ca_public':  DATA_DIR / 'admissions_ca_public.json',
    'ca_private': DATA_DIR / 'admissions_ca_private.json',
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

        for school in schools:
            sid = school['school_id']
            out_path = out_type_dir / f'{sid}.json'
            with open(out_path, 'w') as f:
                json.dump(school, f, separators=(',', ':'))

        all_ca_schools.extend(schools)
        print(f'  Wrote {len(schools)} files to {out_type_dir}/')

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
