# Texas admissions refresh and visibility implementation

Reviewed September 7, 2026. This extends the concurrent UC growth work with a specific Texas data release and useful links into existing school profiles.

## Existing coverage and new sources

- Production baseline `dade86d` includes 1,765 Texas high-school profiles, 1,629 schools in the Fall 2024 file, 2019–2024 destinations, first-year GPA data, and UT Austin feeder enrollment.
- The earlier ad-revenue strategy mentioned protecting Texas pages but deferred further expansion. This update addresses Texas directly while retaining the existing UC work.
- THECB's [report index](https://reportcenter.highered.texas.gov/reports/data/) lists **Applicants, Acceptance, and Enrollment 2017–2025**, published **July 14, 2026**. The [workbook](https://reportcenter.highered.texas.gov/reports/data/applicants-acceptance-and-enrollment-2017-2025/) has 37 institutions and nine years. This is Fall 2025 admissions data released in 2026, not Fall 2026 results.
- The [high-school destination hub](https://www.txhighereddata.org/high-school-graduates/hsgradsenrolled/) and its campus report dropdown still end with 2023–2024 graduates. The existing GPA data already includes the February 19, 2026 release covering those graduates' performance in FY 2025.
- [UT Austin's current admissions policy](https://admissions.utexas.edu/apply/review-decision-process/) lists top 5% for eligible Summer/Fall 2026–Spring 2027 and Summer/Fall 2027–Spring 2028 applicants. Link to full eligibility requirements; the percentage alone does not establish eligibility or guarantee the requested major.

## Content briefs

### University admissions comparison

- Primary query: Texas college acceptance rates.
- Secondary/AEO questions: latest Texas admissions data 2026; UT Austin Texas applicant acceptance rate; Texas A&M Texas applicant acceptance rate; whether Fall 2026 data is available; overall versus Texas-applicant rates.
- Intent and reader: students, parents, and counselors comparing Texas public universities and checking which entering class the latest report describes.
- Archetype: source-based interactive comparison and reporting-year guide.
- Title: Texas College Acceptance Rates: Fall 2025 Data, Updated 2026.
- H1: Texas college acceptance rates for Texas applicants.
- Meta description: Compare Texas applicant acceptance rates at 37 public universities, including UT Austin and Texas A&M. Official THECB Fall 2017–2025 data released July 2026.
- URL: `/states/texas/college-acceptance-rates` (one evergreen destination).
- Data: institution Total rows, Texas applied/accepted/enrolled, separate all-applicant counts, source row and FICE identifiers; suppressed cells remain null.
- Thesis: compare matching applicant groups and reporting years. A 2026 release is not a 2026 entering class, and university admissions and school destinations answer different questions.
- Tables: searchable/sortable university comparison with year selector and prior-year percentage-point changes; nine-year table for six major universities; release/cohort reference table.
- Links: Texas hub, school directory, UT Austin and Texas A&M feeders, original official sources, downloadable JSON.
- Risks: residency-denominator mixing; report definitions differing from institutional CDS or news releases; treating public university coverage as all colleges; suppressed counts; misleading 2026 labeling. Explicit copy and import validation address these. No separate generic UT admissions article competing with this comparison.

### Texas A&M feeder schools

- Primary query: Texas A&M feeder schools.
- Secondary/AEO: high schools sending students to Texas A&M; Texas A&M enrollment by high school; whether feeder counts are acceptance rates.
- Intent and reader: Texas families exploring their high school's college destinations.
- Archetype: original ranking and enrollment trend.
- Title: Texas A&M Feeder Schools: High School Enrollment, 2019–2024.
- H1: Texas A&M feeder schools, 2019–2024.
- Meta description: See which Texas high schools send the most graduates to Texas A&M. Compare reported enrollment, share of graduates, and six years of official THECB destination data.
- URL: `/college/texas-am-university/feeder-schools`.
- Data: existing campus destinations with FICE `003632` only. No change to underlying high-school counts.
- Insight: 6,639 separately reported Fall 2024 enrollees across 440 schools; Coppell H S leads with 91. Provide graduate shares alongside volume so school size is visible.
- Charts/tables: six-year enrollment bars, top-75 high-school table with profile links.
- Links: school profiles, full directory, UT Austin feeders, new university admissions comparison.
- Risks: small destination counts grouped into Other; exclusion of private/out-of-state high schools; conflating separate A&M campuses; calling enrollment an admit rate. State these limits next to the data and in methodology.

## Data refresh and checks

`nextjs-app/scripts/build-texas-admissions.py` downloads the explicit source only when run. `--source` permits replay against a saved workbook. It validates worksheet years, column headers, unique FICE/year keys, count ordering, and reported acceptance rates before replacing the committed JSON. No live scrape runs during a website build.

The JSON includes a source URL, publication date, verification date, workbook SHA-256, and source row for each institution/year. It retains statewide rows separately and does not reconstruct masked numbers or derive overall/nonresident/non-automatic rates from mismatched columns.

Independent openpyxl extraction checked all **1,296 imported institution counts** and nine statewide accepted totals against the workbook. The high-school JSON is unchanged. Production build, focused lint, HTTP metadata/link checks, and browser interaction/layout checks are part of the release gate. The concurrent growth commit resolves the earlier navigation lint rule conflict; run full-project lint again after integration.

## Discovery and measurement

Both pages are linked from Insights, the Texas hub, and contextual notices on Texas school/directory/UT feeder pages. Named Texas A&M and UT Austin destinations in school tables link to their feeder pages. Both new routes are in the sitemap with canonicals, one H1, visible source definitions, and matching structured data.

Track Texas as a separate cohort in the existing weekly/monthly growth review: `/states/texas*`, `/college/university-of-texas-at-austin/feeder-schools`, and `/college/texas-am-university/feeder-schools`. Review 7-, 28-, and 90-day Search Console impressions, clicks, CTR, position and query mix; GA landing views, engagement and onward browsing; Journey pageviews, revenue, and RPM when the sample supports comparison. Do not claim a Texas traffic baseline or lift from the UC-wide figures.

Check indexing and discovery before expanding more Texas pages. A useful next investment depends on actual Texas search queries and engagement. Keep source freshness independent from publication dates and avoid inventing Fall 2026 acceptance rates while waiting for comparable official records.

## Concurrent production work

Changes are isolated in `/Users/lee/Documents/projects/uc_college_texas_update` on `codex/texas-data-visibility`. The original growth checkout is left untouched. Growth commit `40310f9` was incorporated, preserving its native anchors, new counselor route, feeder pagination, lightweight school loading and analytics/ad lifecycle changes. Fetch origin/main and verify the live deployment immediately before deployment; merge newer production work, retain native anchors and `/counselors`, rebuild, and compare the complete live sitemap inventory before pushing. Use an ordinary fast-forward push so a concurrently advanced main cannot be overwritten.
