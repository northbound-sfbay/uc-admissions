#!/usr/bin/env python3
"""Deterministic, reviewed analysis cohorts; never modifies source admissions data."""
import hashlib
import json
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
YEAR = '2025'
YEARS = [str(year) for year in range(2021, 2026)]
CAMPUSES = [('Los Angeles', 'UCLA', 'ucla'), ('Berkeley', 'UC Berkeley', 'uc-berkeley'),
            ('Davis', 'UC Davis', 'uc-davis'), ('San Diego', 'UC San Diego', 'uc-san-diego')]
BAY_COUNTIES = ['Alameda', 'Contra Costa', 'Marin', 'Napa', 'San Francisco', 'San Mateo',
                'Santa Clara', 'Solano', 'Sonoma']


def valid_counts(row, min_app=50, min_adm=0, enrollment=False):
    keys = ['app', 'adm'] + (['enr'] if enrollment else [])
    return (isinstance(row, dict)
            and all(type(row.get(key)) is int and row[key] >= 0 for key in keys)
            and row['app'] >= min_app and row['app'] > 0
            and min_adm <= row['adm'] <= row['app']
            and (not enrollment or row['enr'] <= row['adm']))


def campus_row(school, year, campus):
    return school.get('years', {}).get(year, {}).get('by_campus', {}).get(campus)


def totals(schools, year, campus, enrollment=False):
    rows = [campus_row(school, year, campus) for school in schools]
    assert rows and all(valid_counts(row, 1, enrollment=enrollment) for row in rows)
    result = {key: sum(row[key] for row in rows) for key in ['app', 'adm']}
    result['admitRate'] = result['adm'] / result['app']
    if enrollment:
        result['enr'] = sum(row['enr'] for row in rows)
        result['yieldRate'] = result['enr'] / result['adm'] if result['adm'] else None
        result['enrolledPerApplicant'] = result['enr'] / result['app']
    return result


def identity(school):
    return {key: school[key] for key in ['school_id', 'school_name', 'school_type', 'city', 'county']}


def build_analysis(schools):
    pair = [school for school in schools if all(valid_counts(campus_row(school, YEAR, campus))
                                              for campus, _, _ in CAMPUSES[:2])]
    pair.sort(key=lambda school: school['school_id'])
    ranked = {campus: sorted(pair, key=lambda school: (-campus_row(school, YEAR, campus)['adm'],
                  -campus_row(school, YEAR, campus)['app'], school['school_id'])) for campus, _, _ in CAMPUSES[:2]}
    first_top = {school['school_id'] for school in ranked['Los Angeles'][:20]}
    second_top = {school['school_id'] for school in ranked['Berkeley'][:20]}
    displayed = sorted(pair, key=lambda school: (-sum(campus_row(school, YEAR, campus)['app']
                        for campus, _, _ in CAMPUSES[:2]), school['school_id']))[:12]
    comparison = {
        'schoolCount': len(pair), 'minApplicants': 50,
        'schoolIds': [school['school_id'] for school in pair],
        'top20Overlap': len(first_top & second_top),
        'campuses': [{ 'key': key, 'label': label, 'slug': slug, **totals(pair, YEAR, key)}
                     for key, label, slug in CAMPUSES[:2]],
        'schools': [{**identity(school), 'campuses': [
            {'key': key, 'label': label, **totals([school], YEAR, key)}
            for key, label, _ in CAMPUSES[:2]]} for school in displayed],
    }
    trend_schools = [school for school in schools if school['county'] in BAY_COUNTIES and all(
        valid_counts(campus_row(school, year, campus), 20) for year in YEARS for campus, _, _ in CAMPUSES)]
    trend_schools.sort(key=lambda school: school['school_id'])
    trends = {
        'schoolCount': len(trend_schools), 'minApplicants': 20, 'counties': BAY_COUNTIES,
        'schoolIds': [school['school_id'] for school in trend_schools],
        'campuses': [{'key': key, 'label': label, 'slug': slug, 'years': [
            {'year': year, **totals(trend_schools, year, key)} for year in YEARS]}
            for key, label, slug in CAMPUSES],
    }
    yield_schools = [school for school in schools if all(valid_counts(campus_row(school, YEAR, campus),
        50, 20, enrollment=True) for campus, _, _ in CAMPUSES)]
    yield_schools.sort(key=lambda school: school['school_id'])
    enrollment = {
        'schoolCount': len(yield_schools), 'minApplicants': 50, 'minAdmits': 20,
        'schoolIds': [school['school_id'] for school in yield_schools],
        'campuses': [{'key': key, 'label': label, 'slug': slug, **totals(yield_schools, YEAR, key, True)}
                     for key, label, slug in CAMPUSES],
    }
    return {'year': YEAR, 'years': YEARS, 'comparison': comparison, 'trends': trends, 'enrollment': enrollment}


def main():
    schools, fingerprints = [], {}
    for kind in ['ca_public', 'ca_private']:
        path = APP_ROOT.parent / 'data' / f'admissions_{kind}.json'
        raw = path.read_bytes()
        fingerprints[path.name] = hashlib.sha256(raw).hexdigest()
        schools.extend(json.loads(raw))
    analysis = build_analysis(schools)
    analysis['sources'] = fingerprints
    assert all(analysis[key]['schoolCount'] > 0 for key in ['comparison', 'trends', 'enrollment'])
    output = APP_ROOT / 'public' / 'data' / 'uc-analysis.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(analysis, indent=2) + '\n')
    print('UC analysis cohorts:', {key: analysis[key]['schoolCount'] for key in ['comparison', 'trends', 'enrollment']})


if __name__ == '__main__':
    main()
