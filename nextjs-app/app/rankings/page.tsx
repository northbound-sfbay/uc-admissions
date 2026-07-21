import type { Metadata } from 'next'
import Link from 'next/link'
import { getStatewideRankings, type RankingSchoolRow } from '@/lib/rankings'

const CANONICAL = 'https://collegeacceptance.info/rankings'
const TITLE = 'UC Admissions Rankings by High School'
const DESCRIPTION =
  'Rank California high schools by UC applicants, admits, admit rate, enrollment yield, county volume, and campus feeder results for Fall 2025.'

export const revalidate = 86400

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
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

function fmtNumber(value: number | null | undefined): string {
  if (value == null) return '-'
  return value.toLocaleString()
}

function fmtPercent(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function fmtPointChange(value: number | null | undefined): string {
  if (value == null) return '-'
  const sign = value > 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(1)} pts`
}

function SchoolCell({ row }: { row: RankingSchoolRow }) {
  return (
    <td>
      <Link href={row.href}>{row.school_name}</Link>
      <span className="article-caption" style={{ display: 'block', marginTop: '2px' }}>
        {row.city}, {row.county}
        {row.school_type !== 'CA Public' ? ` - ${row.school_type}` : ''}
      </span>
    </td>
  )
}

function JsonLd() {
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    creator: {
      '@type': 'Organization',
      name: 'collegeacceptance.info',
    },
    citation:
      'University of California Information Center, Admissions by Source School',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://collegeacceptance.info/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: TITLE,
        item: CANONICAL,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  )
}

export default function RankingsPage() {
  const rankings = getStatewideRankings()
  const topCampus = rankings.campusSummaries[0]

  return (
    <>
      <JsonLd />

      <header>
        <div className="header-inner article-header-inner">
          <Link href="/" className="text-sm text-blue-200 hover:text-white">
            UC Admissions by High School
          </Link>
          <h1>UC admissions rankings by high school</h1>
          <p className="subtitle">
            Fall {rankings.displayYear} statewide rankings for applicants, admits, admit rates,
            enrollment yield, counties, and campus feeder patterns.
          </p>
        </div>
      </header>

      <main className="article-shell">
        <article className="article-card">
          <div className="article-kicker">Statewide data hub</div>
          <p className="article-byline">Updated May 11, 2026</p>

          <p className="article-deck">
            This page turns the UC source-school dataset into a browseable rankings product. It is
            built for families and counselors who want to find top UC applicant schools, high-admit
            schools, campus feeders, county patterns, and schools where admitted students actually
            enroll.
          </p>

          <section className="article-stat-grid" aria-label="Fall UC statewide source-school totals">
            <div className="article-stat-card">
              <strong>{fmtNumber(rankings.schoolCount)}</strong>
              <span>California public and private schools with Fall {rankings.displayYear} UC records</span>
            </div>
            <div className="article-stat-card">
              <strong>{fmtNumber(rankings.totals.app)}</strong>
              <span>Universitywide UC applicants in this source-school view</span>
            </div>
            <div className="article-stat-card">
              <strong>{fmtNumber(rankings.totals.adm)}</strong>
              <span>Universitywide admits from California high schools</span>
            </div>
            <div className="article-stat-card">
              <strong>{fmtPercent(rankings.totals.yieldRate)}</strong>
              <span>Admitted students who enrolled at a UC campus</span>
            </div>
          </section>

          <section className="answer-block" aria-label="Short answer">
            <h2>What are the top UC high-school rankings?</h2>
            <p>
              In Fall {rankings.displayYear}, the largest statewide UC applicant schools and the
              largest UC admit schools are not always the same as the schools with the highest admit
              rates. Use applicant volume, admits, admit rate, and enrollment yield together before
              drawing conclusions from any single ranking.
            </p>
          </section>

          <section>
            <h2>Top high schools by UC applicants</h2>
            <p>
              Applicant volume shows where the most UC demand comes from. It does not by itself mean
              a school has stronger outcomes, but it is the cleanest starting point for statewide
              discovery.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Applicants</th>
                    <th>Admits</th>
                    <th>Enrolled</th>
                    <th>Admit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.applicantLeaders.slice(0, 15).map(row => (
                    <tr key={`app-${row.school_id}`}>
                      <SchoolCell row={row} />
                      <td>{fmtNumber(row.app)}</td>
                      <td>{fmtNumber(row.adm)}</td>
                      <td>{fmtNumber(row.enr)}</td>
                      <td>{fmtPercent(row.admitRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Top high schools by UC admits</h2>
            <p>
              Admit volume is the best broad feeder measure because it reflects both applicant
              volume and UC admission outcomes. Campus-specific feeder rankings below separate UCLA,
              Berkeley, San Diego, Irvine, Davis, and the other UC campuses.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Admits</th>
                    <th>Applicants</th>
                    <th>Enrolled</th>
                    <th>Admit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.admitLeaders.slice(0, 15).map(row => (
                    <tr key={`adm-${row.school_id}`}>
                      <SchoolCell row={row} />
                      <td>{fmtNumber(row.adm)}</td>
                      <td>{fmtNumber(row.app)}</td>
                      <td>{fmtNumber(row.enr)}</td>
                      <td>{fmtPercent(row.admitRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Highest UC admit rates among large applicant pools</h2>
            <p>
              This table filters to schools with at least 100 universitywide UC applicants. The
              threshold reduces noise from very small applicant pools while still allowing public
              and private schools to appear.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Admit rate</th>
                    <th>Applicants</th>
                    <th>Admits</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.admitRateLeaders.slice(0, 15).map(row => (
                    <tr key={`rate-${row.school_id}`}>
                      <SchoolCell row={row} />
                      <td>{fmtPercent(row.admitRate)}</td>
                      <td>{fmtNumber(row.app)}</td>
                      <td>{fmtNumber(row.adm)}</td>
                      <td>{fmtNumber(row.enr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Campus feeder leaders</h2>
            <p>
              Campus rankings answer a different question than the statewide tables. A high school
              can be a major UCLA feeder, a Berkeley feeder, or an Irvine feeder without ranking the
              same way universitywide.
            </p>
            <div className="insights-list" aria-label="Campus feeder leaders">
              {rankings.campusSummaries.map(campus => (
                <Link
                  className="insight-card"
                  href={`/feeder-schools/${campus.slug}`}
                  key={campus.slug}
                >
                  <span>{campus.campusLabel}</span>
                  <h3>{campus.topAdmitSchool?.school_name ?? `${campus.campusLabel} feeder schools`}</h3>
                  <p>
                    {campus.topAdmitSchool
                      ? `${campus.topAdmitSchool.adm.toLocaleString()} admits from ${campus.topAdmitSchool.app.toLocaleString()} applicants.`
                      : 'Open the campus feeder page for school-level rankings.'}
                  </p>
                  <strong>
                    {fmtPercent(campus.admitRate)} campus admit rate - view rankings
                  </strong>
                </Link>
              ))}
            </div>
            <p className="article-caption">
              Top campus feeder on this page means most admits to that UC campus in Fall{' '}
              {rankings.displayYear}, not a special admissions relationship.
            </p>
          </section>

          <section>
            <h2>County leaders by UC applicant volume</h2>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>County</th>
                    <th>Schools</th>
                    <th>Applicants</th>
                    <th>Admits</th>
                    <th>Admit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.countyLeaders.slice(0, 12).map(row => (
                    <tr key={row.county}>
                      <td>
                        <Link href={row.href}>{row.county} County</Link>
                      </td>
                      <td>{fmtNumber(row.schools)}</td>
                      <td>{fmtNumber(row.app)}</td>
                      <td>{fmtNumber(row.adm)}</td>
                      <td>{fmtPercent(row.admitRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Enrollment yield leaders</h2>
            <p>
              Yield is enrollees divided by admits. It shows whether admitted students actually
              chose a UC campus, which is a different behavior than applying or receiving an offer.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Yield</th>
                    <th>Admits</th>
                    <th>Enrolled</th>
                    <th>Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.yieldLeaders.slice(0, 12).map(row => (
                    <tr key={`yield-${row.school_id}`}>
                      <SchoolCell row={row} />
                      <td>{fmtPercent(row.yieldRate)}</td>
                      <td>{fmtNumber(row.adm)}</td>
                      <td>{fmtNumber(row.enr)}</td>
                      <td>{fmtNumber(row.app)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {rankings.priorYear && rankings.admitRateGainers.length > 0 && (
            <section>
              <h2>Largest admit-rate gains from {rankings.priorYear} to {rankings.displayYear}</h2>
              <p>
                Year-over-year changes are filtered to schools with at least 100 UC applicants in
                both years. Treat these as prompts for deeper review, not proof that admissions odds
                changed for any individual student.
              </p>
              <div className="article-table-wrap">
                <table className="article-table benchmark-table">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Change</th>
                      <th>{rankings.priorYear} rate</th>
                      <th>{rankings.displayYear} rate</th>
                      <th>{rankings.displayYear} applicants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.admitRateGainers.slice(0, 12).map(row => (
                      <tr key={`change-${row.school_id}`}>
                        <SchoolCell row={row} />
                        <td>{fmtPointChange(row.change)}</td>
                        <td>{fmtPercent(row.priorAdmitRate)}</td>
                        <td>{fmtPercent(row.admitRate)}</td>
                        <td>{fmtNumber(row.app)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="article-cta-panel">
            <h2>Use rankings as a starting point</h2>
            <p>
              Rankings show where to look. The next step is a school page with campus mix, GPA,
              ethnicity, admit-rate trend, and enrollment context.
            </p>
            <div className="insights-actions">
              <Link href="/" className="report-entry-link primary">
                Search your high school
              </Link>
              <Link href="/insights/uc-gpa-by-high-school" className="report-entry-link">
                Read the GPA guide
              </Link>
              {topCampus && (
                <Link href={`/feeder-schools/${topCampus.slug}`} className="report-entry-link">
                  View {topCampus.campusLabel} feeders
                </Link>
              )}
            </div>
          </section>

          <section>
            <h2>Methodology and source notes</h2>
            <p>
              Rankings are calculated from local collegeacceptance.info records derived from the
              University of California Information Center Admissions by Source School tables. The
              Fall {rankings.displayYear} view includes California public and private high schools.
            </p>
            <p>
              Universitywide applicant counts in UC source-school data are not the same as unique
              students applying to UC. Campus-specific pages separate each campus so users can
              distinguish UCLA, UC Berkeley, UC San Diego, UC Irvine, UC Davis, and other campus
              patterns.
            </p>
            <p>
              Source:{' '}
              <a
                href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
                target="_blank"
                rel="noopener"
              >
                University of California Admissions by Source School
              </a>
            </p>
          </section>
        </article>
      </main>

      <footer>
        <p>
          <Link href="/">UC admissions tool</Link> - <Link href="/insights">Insights</Link> -{' '}
          <Link href="/about">About</Link>
        </p>
      </footer>
    </>
  )
}
