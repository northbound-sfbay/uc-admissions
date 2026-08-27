import type { Metadata } from 'next'
import Link from 'next/link'

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
    title: 'Texas and Virginia college outcome data: first state expansion hubs',
    href: '/states',
    description:
      'Browse official state sources for Texas and Virginia high-school college destinations, postsecondary enrollment, locality admissions, and future college-profile pages.',
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
            <Link href="/" className="report-entry-link primary">
              Search your high school
            </Link>
            <Link href="/rankings" className="report-entry-link">
              View UC rankings
            </Link>
            <Link href="/states" className="report-entry-link">
              Browse TX and VA
            </Link>
            <Link href="/uc-admission-rates" className="report-entry-link">
              View UC admission rates
            </Link>
          </div>
        </section>

        <section className="insights-list" aria-label="Published insights">
          {ARTICLES.map(article => (
            <Link className="insight-card" href={article.href} key={article.href}>
              <span>{article.eyebrow}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <strong>Read article</strong>
            </Link>
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
          · <Link href="/">UC admissions tool</Link> · <Link href="/about">About</Link>
        </p>
      </footer>
    </>
  )
}
