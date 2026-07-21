import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  getTexasHighSchool,
  getTexasHighSchoolSlugs,
  getTexasOutcomeData,
  texasHighSchoolHref,
  texasHighSchoolSlug,
  type TexasGpaBands,
  type TexasGpaGroup,
} from '@/lib/texas-outcomes'

type PageProps = {
  params: Promise<{ slug: string }>
}

const BASE_URL = 'https://collegeacceptance.info'

const GPA_BANDS: Array<{ key: keyof TexasGpaBands; label: string }> = [
  { key: 'under2', label: 'Below 2.0' },
  { key: 'from2To249', label: '2.0–2.49' },
  { key: 'from25To299', label: '2.5–2.99' },
  { key: 'from3To349', label: '3.0–3.49' },
  { key: 'over35', label: 'Above 3.5' },
  { key: 'unknown', label: 'Unknown' },
]

function formatNumber(value: number | null | undefined): string {
  return value == null ? 'Suppressed' : value.toLocaleString()
}

function formatPercent(value: number | null | undefined): string {
  return value == null ? 'Suppressed' : `${value.toFixed(1)}%`
}

function groupStudentCount(group: TexasGpaGroup | undefined): number {
  return group?.students ?? 0
}

export function generateStaticParams() {
  return getTexasHighSchoolSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const school = getTexasHighSchool(slug)
  if (!school) return {}
  const year = school.latestYear
  const title = `${school.schoolName} College Enrollment Outcomes ${year}`
  const description =
    `See ${school.schoolName} college-going trends, complete ${year} destination list, UT Austin enrollment, four-year/two-year mix, and first-year GPA bands.`
  const canonical = `${BASE_URL}${texasHighSchoolHref(school)}`

  return {
    title: `${title} | collegeacceptance.info`,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function TexasHighSchoolPage({ params }: PageProps) {
  const { slug } = await params
  const school = getTexasHighSchool(slug)
  if (!school) notFound()
  if (slug !== texasHighSchoolSlug(school)) permanentRedirect(texasHighSchoolHref(school))

  const dataset = getTexasOutcomeData()
  const latestYear = school.latestYear
  const latest = school.years[latestYear]
  const gpa = latest.gpa
  const publicFourYear = gpa?.publicFourYear
  const publicTwoYear = gpa?.publicTwoYear
  const independent = gpa?.independent
  const sectorTotal = groupStudentCount(publicFourYear)
    + groupStudentCount(publicTwoYear)
    + groupStudentCount(independent)
  const publicFourYearShare = sectorTotal
    ? (groupStudentCount(publicFourYear) / sectorTotal) * 100
    : null
  const publicTwoYearShare = sectorTotal
    ? (groupStudentCount(publicTwoYear) / sectorTotal) * 100
    : null
  const independentShare = sectorTotal
    ? (groupStudentCount(independent) / sectorTotal) * 100
    : null
  const canonical = `${BASE_URL}${texasHighSchoolHref(school)}`
  const title = `${school.schoolName} college enrollment outcomes`
  const description =
    `Official Texas enrollment outcomes for ${school.schoolName}, including destinations, UT Austin enrollment, sector mix, and GPA bands.`
  const years = dataset.years.filter(({ key }) => school.years[key])
  const faq = [
    {
      question: `What is ${school.schoolName}'s college-going rate?`,
      answer:
        `For ${latestYear}, THECB found ${formatNumber(latest.enrolled)} of ${formatNumber(latest.trackableGraduates)} trackable graduates in covered enrollment records, a ${formatPercent(latest.enrollmentRate)} tracked enrollment rate.`,
    },
    {
      question: `How many ${school.schoolName} graduates enrolled at UT Austin?`,
      answer:
        `${formatNumber(latest.utAustinEnrollment)} ${latestYear} graduates were separately reported as enrolling at UT Austin, equal to ${formatPercent(latest.utAustinShareOfGraduates)} of all graduates. Small destination counts may be grouped into Other rows.`,
    },
    {
      question: `Is this an acceptance rate for ${school.schoolName}?`,
      answer:
        'No. These are enrollment outcomes after high school. The source does not report applications, admission offers, or a high-school-level acceptance rate.',
    },
  ]

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Texas', item: `${BASE_URL}/states/texas` },
      { '@type': 'ListItem', position: 3, name: 'Texas high schools', item: `${BASE_URL}/states/texas/high-schools` },
      { '@type': 'ListItem', position: 4, name: school.schoolName, item: canonical },
    ],
  }
  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: title,
    description,
    url: canonical,
    temporalCoverage: `${years[0]?.key ?? latestYear}/${latestYear}`,
    spatialCoverage: { '@type': 'State', name: 'Texas' },
    identifier: school.campusCode,
    creator: { '@type': 'Organization', name: 'collegeacceptance.info' },
    citation: [dataset.sourceUrl, dataset.gpaSourceUrl],
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
            <Link href="/states/texas">Texas</Link>
            <Link href="/states/texas/high-schools">All Texas high schools</Link>
            <Link href="/college/university-of-texas-at-austin/feeder-schools">UT Austin feeders</Link>
          </div>
        </nav>
      </header>

      <main className="state-home-shell">
        <div className="state-home-band texas-detail-band">
          <section className="state-home-section texas-directory-hero">
            <p className="state-home-kicker">{school.county} County · {school.district}</p>
            <h1>{school.schoolName} college enrollment outcomes</h1>
            <p>
              Follow graduates from this Texas campus into covered higher-education records.
              Compare {years[0]?.key ?? latestYear}–{latestYear} college-going trends, every
              published destination, UT Austin enrollment, sector mix, and first-year GPA bands.
            </p>
            <p className="article-caption">Texas campus code: {school.campusCode}</p>
          </section>

          <section className="state-home-section answer-block">
            <h2>{school.schoolName} college-going snapshot</h2>
            <p>
              In {latestYear}, {formatNumber(latest.enrolled)} of{' '}
              {formatNumber(latest.trackableGraduates)} trackable graduates were found in covered
              Texas enrollment records, a <strong>{formatPercent(latest.enrollmentRate)}</strong>
              {' '}tracked enrollment rate. {formatNumber(latest.utAustinEnrollment)} graduates had
              a separately reported UT Austin enrollment row ({formatPercent(latest.utAustinShareOfGraduates)}
              {' '}of all graduates). These are enrollment outcomes, not acceptance rates.
            </p>
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">College-going trend</p>
            <h2>Graduates found in Texas higher-education records</h2>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>Class year</th>
                    <th>Graduates</th>
                    <th>Trackable graduates</th>
                    <th>Enrolled</th>
                    <th>Tracked enrollment rate</th>
                    <th>Not found</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map(({ key }) => {
                    const row = school.years[key]
                    return (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{formatNumber(row.graduates)}</td>
                        <td>{formatNumber(row.trackableGraduates)}</td>
                        <td>{formatNumber(row.enrolled)}</td>
                        <td>{formatPercent(row.enrollmentRate)}</td>
                        <td>{formatNumber(row.notFound)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">UT Austin</p>
            <h2>UT Austin enrollment from {school.schoolName}</h2>
            <p>
              A value appears only when THECB publishes UT Austin separately for this school.
              Smaller school-to-institution counts may be rolled into an aggregate Other public
              four-year row.
            </p>
            <div className="texas-ut-year-grid">
              {years.map(({ key }) => {
                const row = school.years[key]
                return (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{formatNumber(row.utAustinEnrollment)}</strong>
                    <small>{formatPercent(row.utAustinShareOfGraduates)} of graduates</small>
                  </div>
                )
              })}
            </div>
            <p className="article-caption">
              <Link href="/college/university-of-texas-at-austin/feeder-schools">
                Compare this school with the statewide UT Austin feeder-school ranking.
              </Link>
            </p>
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">{latestYear} destinations</p>
            <h2>Complete published college destination list</h2>
            <p>
              All {formatNumber(latest.destinations.length)} destination rows retained from the
              campus file are shown below. Named institutions keep their six-digit FICE code;
              Other rows combine institutions suppressed by THECB at the school level.
            </p>
            <div className="article-table-wrap texas-long-table">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>FICE code</th>
                    <th>Students</th>
                    <th>Share of graduates</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.destinations.map((destination, index) => (
                    <tr key={`${destination.ficeCode ?? destination.name}-${index}`}>
                      <td>
                        {destination.name}
                        {destination.institutionCount ? (
                          <small className="texas-table-sub">
                            {formatNumber(destination.institutionCount)} institutions combined
                          </small>
                        ) : null}
                      </td>
                      <td>{destination.ficeCode ?? '—'}</td>
                      <td>{formatNumber(destination.students)}</td>
                      <td>{formatPercent((destination.students / latest.graduates) * 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">First-year sector mix</p>
            <h2>Public four-year, public two-year, and independent enrollment</h2>
            {gpa ? (
              <>
                <p>
                  THECB&apos;s separate GPA report assigns each student to the sector where they earned
                  the most semester credit hours during the academic year. Because this is an
                  academic-year measure, it may differ from the fall-only destination count above.
                </p>
                <div className="state-home-proof texas-sector-grid">
                  <div className="state-home-proof-item">
                    <strong>{formatNumber(publicFourYear?.students)}</strong>
                    <span>public four-year · {formatPercent(publicFourYearShare)}</span>
                  </div>
                  <div className="state-home-proof-item">
                    <strong>{formatNumber(publicTwoYear?.students)}</strong>
                    <span>public two-year · {formatPercent(publicTwoYearShare)}</span>
                  </div>
                  <div className="state-home-proof-item">
                    <strong>{formatNumber(independent?.students)}</strong>
                    <span>independent · {formatPercent(independentShare)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p>No matching sector data is available in the GPA workbook for this school-year.</p>
            )}
          </section>

          <section className="state-home-section">
            <p className="state-home-kicker">First-year performance</p>
            <h2>GPA bands by public college sector</h2>
            {publicFourYear?.bands || publicTwoYear?.bands ? (
              <>
                <div className="article-table-wrap">
                  <table className="article-table benchmark-table">
                    <thead>
                      <tr>
                        <th>College sector</th>
                        {GPA_BANDS.map(band => <th key={band.key}>{band.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Public four-year</td>
                        {GPA_BANDS.map(band => (
                          <td key={band.key}>{formatNumber(publicFourYear?.bands?.[band.key])}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Public two-year</td>
                        {GPA_BANDS.map(band => (
                          <td key={band.key}>{formatNumber(publicTwoYear?.bands?.[band.key])}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="article-caption">
                  GPA counts cover graduates attending Texas public institutions. THECB suppresses
                  GPA detail when fewer than five students attend a public sector.
                </p>
              </>
            ) : (
              <p>
                GPA-band detail is suppressed or unavailable for this school-year. THECB omits the
                breakdown when fewer than five students attend the relevant public sector.
              </p>
            )}
          </section>

          <section className="state-home-section">
            <h2>Methodology and caveats</h2>
            <ul>
              <li>
                Enrollment source: <a href={dataset.sourceUrl} target="_blank" rel="noopener">
                  {dataset.sourceLabel}
                </a>.
              </li>
              <li>
                GPA source: <a href={dataset.gpaSourceUrl} target="_blank" rel="noopener">
                  {dataset.gpaSourceLabel}
                </a>.
              </li>
              <li>
                Tracked enrollment rate equals enrolled graduates divided by graduates excluding
                records THECB classifies as not trackable.
              </li>
              <li>
                Not found does not necessarily mean a graduate did not attend college; it means the
                graduate was not located in the records covered by this Texas report.
              </li>
            </ul>
          </section>

          <section className="state-home-section">
            <h2>{school.schoolName} FAQ</h2>
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
          <Link href="/states/texas/high-schools">All Texas high schools</Link> |{' '}
          <Link href="/states/texas">Texas outcomes</Link> |{' '}
          <Link href="/college/university-of-texas-at-austin/feeder-schools">UT Austin feeders</Link>
        </p>
      </footer>
    </>
  )
}
