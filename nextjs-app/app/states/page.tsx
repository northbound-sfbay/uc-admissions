import type { Metadata } from 'next'
import { STATE_OUTCOME_PROFILES } from '@/lib/state-outcomes'

const CANONICAL = 'https://collegeacceptance.info/states'
const TITLE = 'College Acceptance Data by State'
const DESCRIPTION =
  'Browse state-by-state college acceptance and high-school outcome data sources, starting with Texas official postsecondary enrollment datasets.'

export const metadata: Metadata = {
  title: `${TITLE} | collegeacceptance.info`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'website',
  },
}

function JsonLd() {
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    hasPart: STATE_OUTCOME_PROFILES.map(profile => ({
      '@type': 'WebPage',
      name: profile.title,
      url: profile.canonical,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
    />
  )
}

export default function StatesPage() {
  return (
    <>
      <JsonLd />

      <header>
        <div className="header-inner article-header-inner">
          <a href="/" className="text-sm text-blue-200 hover:text-white">
            collegeacceptance.info
          </a>
          <h1>College acceptance data by state</h1>
          <p className="subtitle">
            Official state outcome sources for expanding beyond UC and California.
          </p>
        </div>
      </header>

      <main className="insights-shell">
        <section className="insights-hero">
          <div className="ctrl-label">State expansion</div>
          <h2>Start where official data creates a real product</h2>
          <p>
            Texas is the first non-UC state hub because its official postsecondary outcome files
            support real high-school destination trends. These pages separate college-going and
            destination outcomes from true admissions or acceptance-rate sources.
          </p>
          <div className="insights-actions">
            <a href="/states/texas" className="report-entry-link primary">
              Texas
            </a>
            <a href="/rankings" className="report-entry-link">
              UC rankings
            </a>
          </div>
        </section>

        <section className="insights-list" aria-label="State outcome hubs">
          {STATE_OUTCOME_PROFILES.map(profile => (
            <a className="insight-card" href={`/states/${profile.slug}`} key={profile.slug}>
              <span>{profile.abbreviation} starter hub</span>
              <h3>{profile.title}</h3>
              <p>{profile.description}</p>
              <strong>View state data plan</strong>
            </a>
          ))}
        </section>
      </main>

      <footer>
        <p>
          <a href="/">UC admissions tool</a> | <a href="/states">States</a> |{' '}
          <a href="/insights">Insights</a> | <a href="/about">About</a>
        </p>
      </footer>
    </>
  )
}
