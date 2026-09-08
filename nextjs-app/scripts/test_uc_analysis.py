import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('analysis', Path(__file__).with_name('build-uc-analysis.py'))
analysis = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analysis)


class AnalysisTests(unittest.TestCase):
    def test_missing_counts_are_not_zero(self):
        self.assertFalse(analysis.valid_counts({'app': 100, 'adm': None}))
        self.assertFalse(analysis.valid_counts({'app': 100, 'adm': 20, 'enr': None}, enrollment=True))
        self.assertTrue(analysis.valid_counts({'app': 100, 'adm': 0, 'enr': 0}, enrollment=True))

    def test_impossible_counts_and_small_groups_are_excluded(self):
        for row in [None, {'app': 49, 'adm': 20}, {'app': 100, 'adm': 101}, {'app': True, 'adm': 1}]:
            self.assertFalse(analysis.valid_counts(row))
        self.assertFalse(analysis.valid_counts({'app': 100, 'adm': 20, 'enr': 21}, enrollment=True))

    def test_aggregate_is_ratio_of_sums(self):
        schools = [{'years': {'2025': {'by_campus': {'Davis': row}}}} for row in
                   [{'app': 100, 'adm': 50, 'enr': 10}, {'app': 900, 'adm': 90, 'enr': 20}]]
        result = analysis.totals(schools, '2025', 'Davis', True)
        self.assertAlmostEqual(result['admitRate'], 0.14)
        self.assertAlmostEqual(result['yieldRate'], 30 / 140)
        self.assertAlmostEqual(result['enrolledPerApplicant'], 0.03)

    def test_trend_cohort_requires_every_year_and_campus(self):
        def school(sid):
            return {'school_id': sid, 'school_name': sid, 'school_type': 'CA Public',
                    'city': 'Test', 'county': 'Alameda', 'years': {year: {'by_campus': {
                        campus: {'app': 100, 'adm': 30, 'enr': 10} for campus, _, _ in analysis.CAMPUSES}}
                        for year in analysis.YEARS}}
        complete, missing = school('1'), school('2')
        del missing['years']['2022']['by_campus']['Davis']
        result = analysis.build_analysis([complete, missing])
        self.assertEqual(result['trends']['schoolIds'], ['1'])
        self.assertEqual(result['comparison']['schoolCount'], 2)
        self.assertEqual(result['enrollment']['schoolCount'], 2)


if __name__ == '__main__':
    unittest.main()
