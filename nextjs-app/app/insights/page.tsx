import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'UC Admissions Insights | collegeacceptance.info',
  description:
    'Data-backed explainers on UC admission rates, source-school trends, campus feeder patterns, and GPA context for California high schools.',
  alternates: { canonical: 'https://collegeacceptance.info/insights' },
  openGraph: {
    title: 'UC Admissions Insights',
    description:
      'Data-backed explainers on UC admission rates, source-school trends, campus feeder patterns, and GPA context.',
    url: 'https://collegeacceptance.info/insights',
    type: 'website',
  },
}

const ARTICLES = [
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
          <h1>UC Admissions Insights</h1>
          <p className="subtitle">
            Data-backed explainers for reading UC high-school admissions trends.
          </p>
        </div>
      </header>

      <main className="insights-shell">
        <section className="insights-hero">
          <div className="ctrl-label">Insights</div>
          <h2>Use the UC data more carefully</h2>
          <p>
            These articles explain how to interpret UC source-school data: admit rates, applicant
            volume, campus mix, GPA trends, feeder patterns, and enrollment outcomes.
          </p>
          <div className="insights-actions">
            <Link href="/" className="report-entry-link primary">
              Search your high school
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
