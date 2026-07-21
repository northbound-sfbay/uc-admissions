import type { Metadata } from 'next'
import Link from 'next/link'
import { getUtAustinFeederData, texasHighSchoolHref } from '@/lib/texas-outcomes'

const CANONICAL = 'https://collegeacceptance.info/college/university-of-texas-at-austin/feeder-schools'
const TITLE = 'UT Austin Feeder Schools: Texas High Schools by Enrollment'
const DESCRIPTION =
  'Explore UT Austin feeder-school enrollment from 2019–2024. Compare Texas high schools by students enrolling at UT Austin, share of graduates, and county patterns.'

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
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export default function UtAustinFeederSchoolsPage() {
  const feeder = getUtAustinFeederData()
  const topSchool = feeder.topSchools[0]
  const topCount = Math.max(...feeder.trend.map(row => row.students), 1)
  const faq = [
    {
      question: 'What does a UT Austin feeder school mean on this page?',
      answer:
        'It means a Texas high school with a reported count of recent graduates enrolling at the University of Texas at Austin. It does not imply a formal relationship with UT Austin or an admissions advantage.',
    },
    {
      question: 'Are these UT Austin acceptance rates by high school?',
      answer:
        'No. THECB reports where graduates enrolled, not how many applied or were admitted. The school share shown here is UT Austin enrollees divided by all graduates at that high school.',
    },
    {
      question: 'Why might a school show zero UT Austin enrollees?',
      answer:
        'Small school-to-institution counts are grouped by THECB into Other institution rows. A zero therefore means no separately reported UT Austin row, not necessarily that no graduate enrolled.',
    },
  ]

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://collegeacceptance.info/' },
      { '@type': 'ListItem', position: 2, name: 'Texas', item: 'https://collegeacceptance.info/states/texas' },
      { '@type': 'ListItem', position: 3, name: 'UT Austin feeder schools', item: CANONICAL },
    ],
  }
  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    temporalCoverage: '2019/2024',
    spatialCoverage: { '@type': 'State', name: 'Texas' },
    creator: { '@type': 'Organization', name: 'collegeacceptance.info' },
    citation: feeder.dataset.sourceUrl,
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="state-home-header">
        <nav className="state-home-nav" aria-label="Primary navigation">
          <Link href="/" className="state-home-brand">collegeacceptance.info</Link>
          <div className="state-home-nav-links">
            <Link href="/">UC tool</Link>
            <Link href="/states/texas">Texas</Link>
            <Link href="/states/texas/high-schools">Texas high schools</Link>
            <Link href="/insights">Insights</Link>
          </div>
        </nav>

        <div className="state-home-hero texas-detail-hero">
          <div className="state-home-hero-copy">
            <p className="state-home-kicker">UT Austin enrollment data</p>
            <h1>UT Austin feeder schools, 2019–2024</h1>
            <p>
              See which Texas high schools sent the most recent graduates to the University of
              Texas at Austin, how that enrollment changed over time, and where reported feeder
              schools are concentrated.
            </p>
            <div className="state-home-actions">
              <a href="#top-ut-feeders" className="report-entry-link primary">See top schools</a>
              <Link href="/states/texas/high-schools" className="report-entry-link">Browse all Texas schools</Link>
            </div>
          </div>

          <div className="state-home-proof" aria-label="UT Austin feeder-school highlights">
            <div className="state-home-proof-item">
              <strong>{formatNumber(feeder.latestTotal)}</strong>
              <span>reported UT Austin enrollees in {feeder.latestYear}</span>
            </div>
            <div className="state-home-proof-item">
              <strong>{formatNumber(feeder.topSchools.length)}</strong>
              <span>high schools with a separate UT Austin row</span>
            </div>
            <div className="state-home-proof-item">
              <strong>{formatNumber(topSchool.students)}</strong>
              <span>enrollees from the leading school</span>
            </div>
            <div className="state-home-proof-item">
              <strong>{formatPercent(feeder.centralTexasShare)}</strong>
              <span>from five Central Texas counties</span>
            </div>
          </div>
        </div>
      </header>

      <main className="state-home-shell">
        <div className="state-home-band texas-detail-band">
          <section className="state-home-section answer-block">
            <h2>Which high school sends the most students to UT Austin?</h2>
            <p>
              In {feeder.latestYear}, <strong>{topSchool.school.schoolName}</strong> in{' '}
              {topSchool.school.district} had the largest separately reported UT Austin enrollment:
              {' '}{formatNumber(topSchool.students)} students, or {formatPercent(topSchool.shareOfGraduates)}
              {' '}of its {formatNumber(topSchool.graduates)} graduates. These are feeder and enrollment
              figures, not applications, admission offers, or acceptance rates.
            </p>
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">Six-year trend</p>
            <h2>Reported UT Austin enrollment by graduating class</h2>
            <p>
              Totals sum the school-level rows that THECB reports separately for UT Austin. Small
              school-to-college counts are included in aggregate Other rows and cannot be assigned
              back to UT Austin.
            </p>
            <div className="texas-trend-list" aria-label="UT Austin enrollment trend 2019 to 2024">
              {feeder.trend.map(row => (
                <div className="texas-trend-row" key={row.year}>
                  <strong>{row.year}</strong>
                  <div className="texas-trend-track" aria-hidden="true">
                    <span style={{ width: `${(row.students / topCount) * 100}%` }} />
                  </div>
                  <span>{formatNumber(row.students)} students</span>
                  <small>{formatNumber(row.reportingSchools)} schools</small>
                </div>
              ))}
            </div>
          </section>

          <section className="state-home-section" id="top-ut-feeders">
            <p className="state-home-kicker">Latest class</p>
            <h2>Top Texas high schools by UT Austin enrollment</h2>
            <p>
              The graduate-share column divides reported UT Austin enrollees by all graduates at
              the high school. Open any school for its full destination list, college-going rate,
              sector mix, and first-year GPA bands.
            </p>
            <div className="article-table-wrap texas-long-table">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>High school</th>
                    <th>County</th>
                    <th>Graduates</th>
                    <th>UT Austin enrollees</th>
                    <th>Share of graduates</th>
                  </tr>
                </thead>
                <tbody>
                  {feeder.topSchools.slice(0, 75).map(row => (
                    <tr key={row.school.campusCode}>
                      <td>
                        <Link href={texasHighSchoolHref(row.school)}>{row.school.schoolName}</Link>
                        <small className="texas-table-sub">{row.school.district}</small>
                      </td>
                      <td>{row.school.county}</td>
                      <td>{formatNumber(row.graduates)}</td>
                      <td>{formatNumber(row.students)}</td>
                      <td>{formatPercent(row.shareOfGraduates)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">Geographic patterns</p>
            <h2>Where UT Austin feeder enrollment is concentrated</h2>
            <p>
              Travis, Williamson, Hays, Bastrop, and Caldwell counties account for{' '}
              {formatNumber(feeder.centralTexasStudents)} separately reported enrollees, or{' '}
              {formatPercent(feeder.centralTexasShare)} of the {feeder.latestYear} total in this
              school-level file. The leading counties statewide are below.
            </p>
            <div className="state-home-module-grid texas-county-grid">
              {feeder.counties.slice(0, 9).map(county => (
                <div key={county.county}>
                  <span>{formatPercent(county.shareOfReportedEnrollment)} of reported enrollment</span>
                  <h3>{county.county} County</h3>
                  <p>
                    {formatNumber(county.students)} UT Austin enrollees across{' '}
                    {formatNumber(county.reportingSchools)} reporting high schools.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="state-home-section">
            <h2>Methodology and limitations</h2>
            <ul>
              <li>
                Source: <a href={feeder.dataset.sourceUrl} target="_blank" rel="noopener">
                  Texas Higher Education Coordinating Board high-school graduate enrollment files
                </a> for Fall 2019 through Fall 2024.
              </li>
              <li>
                UT Austin is matched by its six-digit FICE code, {feeder.dataset.utAustinFiceCode},
                rather than by a fragile text-name match.
              </li>
              <li>
                THECB groups small school-to-institution counts into Other rows. The totals on this
                page therefore reflect separately reported UT Austin rows and are a lower bound.
              </li>
              <li>
                Enrollment is not admission. This source contains no high-school-level applicant,
                admit, or acceptance-rate fields.
              </li>
            </ul>
          </section>

          <section className="state-home-section">
            <h2>UT Austin feeder-school FAQ</h2>
            <div className="state-home-faq-grid">
              {faq.map(item => (
                <div key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer>
        <p>
          <Link href="/states/texas">Texas outcomes</Link> |{' '}
          <Link href="/states/texas/high-schools">Texas high schools</Link> |{' '}
          <Link href="/">UC admissions tool</Link>
        </p>
      </footer>
    </>
  )
}
