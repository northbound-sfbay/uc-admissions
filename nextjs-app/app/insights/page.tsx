import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'College Acceptance Insights | collegeacceptance.info',
  description:
    'Data-backed explainers on UC admission rates, source-school trends, state college-going outcomes, campus feeder patterns, and GPA context.',
  alternates: { canonical: 'https://collegeacceptance.info/insights' },
  openGraph: {
    title: 'College Acceptance Insights',
    description:
      'Data-backed explainers on UC admission rates, source-school trends, state college-going outcomes, campus feeder patterns, and GPA context.',
    url: 'https://collegeacceptance.info/insights',
    type: 'website',
  },
}

const ARTICLES = [
  {
    title: 'Texas college acceptance rates: Fall 2025 results, released in 2026',
    href: '/states/texas/college-acceptance-rates',
    description: 'Compare Texas applicants, acceptances, and enrollment at 37 public universities across nine entering classes, with clear reporting-year and residency definitions.',
    eyebrow: 'New Texas admissions data',
  },
  {
    title: 'Texas A&M feeder schools by high-school enrollment',
    href: '/college/texas-am-university/feeder-schools',
    description: 'Explore the leading Texas high schools by reported Texas A&M enrollment, shares of graduates, and trends from Fall 2019–2024.',
    eyebrow: 'Texas school destinations',
  },
  {
    title: 'UC acceptance rates 2026: official results for every campus',
    href: '/insights/uc-acceptance-rates-2026',
    description:
      'See the preliminary Fall 2026 applicant, admit, and acceptance-rate figures, compare every campus with 2025, and understand what the 78% California headline means.',
    eyebrow: 'New Fall 2026 data',
  },
  {
    title: 'UC admissions by source school: how to read the data',
    href: '/insights/uc-admissions-by-source-school',
    description:
      'Methodology notes for UC source data, applicants, admits, enrollees, admit rates, campus views, ethnicity views, and common limitations.',
    eyebrow: 'Source data guide',
  },
  {
    title: 'Texas high-school college outcome data',
    href: '/states',
    description:
      'Browse official Texas high-school college destinations, enrollment trends, university admissions, and first-year GPA data.',
    eyebrow: 'State expansion',
  },
  {
    title: 'UC GPA by high school: applicant GPA, admitted GPA, and what it means',
    href: '/insights/uc-gpa-by-high-school',
    description:
      'Use source-school GPA data carefully: compare applicant GPA, admit GPA, enrollee GPA, campus mix, and applicant volume before drawing conclusions.',
    eyebrow: 'GPA data guide',
  },
  {
    title: 'UC admission rates by high school: how to read the data',
    href: '/insights/uc-admission-rates-by-high-school',
    description:
      'Learn what UC high-school admit rates mean, how they differ from campus acceptance rates, and why applicant volume, GPA, and campus mix matter.',
    eyebrow: 'Admissions data explainer',
  },
]

export default function InsightsPage() {
  return (
    <>
      <header>
        <div className="header-inner">
          <h1>College Acceptance Insights</h1>
          <p className="subtitle">
            Data-backed explainers for reading UC and state college outcome data.
          </p>
        </div>
      </header>

      <main className="insights-shell">
        <section className="insights-hero">
          <div className="ctrl-label">Insights</div>
          <h2>Use official admissions and outcome data more carefully</h2>
          <p>
            These articles cover the latest UC campus results, explain how to interpret UC
            source-school data, and examine broader state outcome datasets: admit rates, applicant
            volume, campus mix, GPA trends, feeder patterns, college destinations, and enrollment
            outcomes.
          </p>
          <div className="insights-actions">
            <a href="/" className="report-entry-link primary">
              Search your high school
            </a>
            <a href="/rankings" className="report-entry-link">
              View UC rankings
            </a>
            <a href="/states" className="report-entry-link">
              Browse Texas data
            </a>
            <a href="/uc-admission-rates" className="report-entry-link">
              View UC admission rates
            </a>
          </div>
        </section>

        <section className="insights-list" aria-label="Published insights">
          {ARTICLES.map(article => (
            <a className="insight-card" href={article.href} key={article.href}>
              <span>{article.eyebrow}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <strong>Read article</strong>
            </a>
          ))}
        </section>
      </main>

      <footer>
        <p>
          Data:{' '}
          <a
            href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
            target="_blank"
            rel="noopener"
          >
            UC Information Center
          </a>{' '}
          · <a href="/">UC admissions tool</a> · <a href="/about">About</a>
        </p>
      </footer>
    </>
  )
}
