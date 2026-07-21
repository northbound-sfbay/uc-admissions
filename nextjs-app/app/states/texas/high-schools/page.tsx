import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getTexasOutcomeData,
  getTexasSchoolsAlphabetically,
  texasHighSchoolHref,
} from '@/lib/texas-outcomes'

const CANONICAL = 'https://collegeacceptance.info/states/texas/high-schools'
const TITLE = 'Texas High School College Enrollment Outcomes'
const DESCRIPTION =
  'Browse individual Texas high-school outcome pages with college-going rates, complete destination lists, UT Austin enrollment, sector mix, and first-year GPA bands.'

export const metadata: Metadata = {
  title: `${TITLE} | collegeacceptance.info`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: CANONICAL, type: 'website' },
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export default function TexasHighSchoolIndexPage() {
  const dataset = getTexasOutcomeData()
  const schools = getTexasSchoolsAlphabetically()
  const latestYear = dataset.years.at(-1)?.key ?? '2024'
  const latestSchools = schools.filter(school => school.years[latestYear]).length

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Texas high-school outcome profiles',
      numberOfItems: schools.length,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />

      <header className="state-home-header">
        <nav className="state-home-nav" aria-label="Primary navigation">
          <Link href="/" className="state-home-brand">collegeacceptance.info</Link>
          <div className="state-home-nav-links">
            <Link href="/states/texas">Texas</Link>
            <Link href="/college/university-of-texas-at-austin/feeder-schools">UT Austin feeders</Link>
            <Link href="/rankings">UC rankings</Link>
            <Link href="/insights">Insights</Link>
          </div>
        </nav>
      </header>

      <main className="state-home-shell">
        <div className="state-home-band texas-detail-band">
          <section className="state-home-section texas-directory-hero">
            <p className="state-home-kicker">Texas school directory</p>
            <h1>Texas high-school college enrollment outcomes</h1>
            <p>
              Open an indexable profile for any school in the 2019–2024 THECB campus files.
              Each profile includes college-going trends, every published destination row,
              UT Austin enrollment, public four-year/two-year mix, and first-year GPA bands.
            </p>
            <div className="article-stat-grid">
              <div className="article-stat-card">
                <strong>{formatNumber(schools.length)}</strong>
                <span>schools across the six-year file</span>
              </div>
              <div className="article-stat-card">
                <strong>{formatNumber(latestSchools)}</strong>
                <span>schools reporting in {latestYear}</span>
              </div>
              <div className="article-stat-card">
                <strong>2019–2024</strong>
                <span>available graduating classes</span>
              </div>
            </div>
          </section>

          <section className="state-home-section answer-block">
            <h2>What can I find for a Texas high school?</h2>
            <p>
              These pages show where graduates enrolled in covered Texas higher education records.
              They answer college-going and destination questions; they do not report applications,
              admission offers, or school-level acceptance rates.
            </p>
          </section>

          <section className="state-home-section">
            <div className="texas-directory-heading">
              <div>
                <p className="state-home-kicker">All reporting schools</p>
                <h2>Browse by county and school</h2>
              </div>
              <Link href="/college/university-of-texas-at-austin/feeder-schools" className="report-entry-link primary">
                See UT Austin feeder schools
              </Link>
            </div>
            <p>
              The table is sorted by county. The year shown is the most recent year available for
              that campus code, which may be earlier than {latestYear} for closed or renamed schools.
            </p>
            <div className="article-table-wrap texas-directory-table">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>High school</th>
                    <th>County</th>
                    <th>Latest year</th>
                    <th>Graduates</th>
                    <th>College-going rate</th>
                    <th>UT Austin</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map(school => {
                    const yearData = school.years[school.latestYear]
                    return (
                      <tr key={school.campusCode}>
                        <td>
                          <Link href={texasHighSchoolHref(school)}>{school.schoolName}</Link>
                          <small className="texas-table-sub">
                            {school.district} · campus {school.campusCode}
                          </small>
                        </td>
                        <td>{school.county}</td>
                        <td>{school.latestYear}</td>
                        <td>{formatNumber(yearData.graduates)}</td>
                        <td>{formatPercent(yearData.enrollmentRate)}</td>
                        <td>{formatNumber(yearData.utAustinEnrollment)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer>
        <p>
          <Link href="/states/texas">Texas outcomes</Link> |{' '}
          <Link href="/college/university-of-texas-at-austin/feeder-schools">UT Austin feeders</Link> |{' '}
          <Link href="/">UC admissions tool</Link>
        </p>
      </footer>
    </>
  )
}
