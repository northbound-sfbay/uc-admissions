# College Acceptance content calendar

Updated September 8, 2026. This publication register and evidence-dependent queue replaces the stale May–June planned schedule. Private search and earnings metrics belong in local growth reviews. See `weekly-seo-aeo-review-workflow.md` for the operating process.

## Current destinations

| Page | Role | Next useful action |
|---|---|---|
| `/` | School lookup | School profile or saved comparison |
| `/uc-admission-rates` | Campus-wide benchmarks | Campus feeder detail |
| `/insights/uc-acceptance-rates-2026` | Preliminary Fall 2026 campus release | Finalized school history with year caveat |
| `/insights/uc-admission-rates-by-high-school` | Interpretation; updated September 8 to clarify 2026 versus 2025 | School lookup |
| `/insights/uc-gpa-by-high-school` | GPA interpretation | School GPA detail |
| `/insights/uc-admissions-by-source-school` | Source and methodology | School/campus data |
| `/counselors` | Shareable counseling resource | School lookup and interpretation |
| `/states/texas/college-acceptance-rates` | Texas university applications, acceptances and enrollment | University/year comparison |
| `/college/texas-am-university/feeder-schools` | Texas high-school enrollment destinations | High-school detail |

## Initial analysis release: September 8, 2026

| URL | Distinct question | Cohort | Next useful action |
|---|---|---|---|
| `/insights/ucla-vs-uc-berkeley-feeder-schools` | Do the same schools show the same pattern at UCLA and Berkeley? | 386 California schools, Fall 2025, qualifying counts at both campuses | School profile, restored two-campus comparison or feeder lists |
| `/insights/bay-area-uc-admission-trends` | Did applications and admits move together over five years? | Same 127 Bay Area schools, 2021–2025, four campuses | School history or county context |
| `/insights/uc-admit-rate-vs-enrollment-yield` | Why do admit rate and enrollment tell different stories? | Same 51 California schools, Fall 2025, complete counts at four campuses | School/campus detail or counselor guide |

The stories use existing source records and reproducible calculations in `nextjs-app/scripts/build-uc-analysis.py`. Downloadable `/data/uc-analysis.json` contains analyzed counts and cohort school IDs. No admissions records are edited. Every story has a visible Insights listing and contextual links.

## Review and publishing queue

| Window | Work | Release condition |
|---|---|---|
| Week 1 | Rendering, navigation, sitemap and tracking | Resolve regressions; do not infer demand from tiny samples |
| Weeks 2–4 | Improve one existing page with a relevant query opportunity; inspect article discovery | Query/page evidence and an accurate answer |
| First complete 28 days | Evaluate the three-story cohort and acquisition versus depth | Select the next brief from results |
| Months 2–3 | Up to two additional analyses per month, or meaningful existing-page updates | Distinct intent, qualifying data and authorized implementation |
| Day 90 | Assess rolling-30-day traffic, revenue and RPM against the private runbook | Set next quarter from observed results |

Possible follow-ups are hypotheses: another campus pair, a regional trend with visible demand, or GPA context for a school/campus query. Reuse the calculation and review process; do not clone pages for every campus/county combination. Existing feeder pages and guides already serve several topics from the older plan.
