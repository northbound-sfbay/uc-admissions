import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleCtaLink from '@/components/ArticleCtaLink'

const CANONICAL = 'https://collegeacceptance.info/insights/uc-acceptance-rates-2026'
const ARTICLE_SLUG = 'uc-acceptance-rates-2026'
const TITLE = 'UC Acceptance Rates 2026: Official Results by Campus'
const DESCRIPTION =
  'See official Fall 2026 UC acceptance rates for every campus, 2025 comparisons, California admit totals, and why the new rates are preliminary.'

export const metadata: Metadata = {
  title: `${TITLE} | collegeacceptance.info`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const CAMPUS_RESULTS = [
  {
    campus: 'UC Berkeley',
    shortName: 'Berkeley',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/berkeley/first-year-admit-data.html',
    applicants: 133154,
    admits: 13967,
    rate2025: 11.4,
    rate2026: 10.5,
    delta: -0.9,
  },
  {
    campus: 'UCLA',
    shortName: 'UCLA',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/ucla/first-year-admit-data.html',
    applicants: 146692,
    admits: 15903,
    rate2025: 9.4,
    rate2026: 10.8,
    delta: 1.4,
  },
  {
    campus: 'UC San Diego',
    shortName: 'San Diego',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/san-diego/first-year-admit-data.html',
    applicants: 141767,
    admits: 38571,
    rate2025: 28.4,
    rate2026: 27.2,
    delta: -1.2,
  },
  {
    campus: 'UC Irvine',
    shortName: 'Irvine',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/irvine/first-year-admit-data.html',
    applicants: 126005,
    admits: 38165,
    rate2025: 28.7,
    rate2026: 30.3,
    delta: 1.6,
  },
  {
    campus: 'UC Santa Barbara',
    shortName: 'Santa Barbara',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/santa-barbara/first-year-admit-data.html',
    applicants: 108512,
    admits: 47716,
    rate2025: 38.3,
    rate2026: 44.0,
    delta: 5.7,
  },
  {
    campus: 'UC Davis',
    shortName: 'Davis',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/davis/first-year-admit-data.html',
    applicants: 104864,
    admits: 48015,
    rate2025: 44.6,
    rate2026: 45.8,
    delta: 1.1,
  },
  {
    campus: 'UC Santa Cruz',
    shortName: 'Santa Cruz',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/santa-cruz/first-year-admit-data.html',
    applicants: 79048,
    admits: 64867,
    rate2025: 72.9,
    rate2026: 82.1,
    delta: 9.2,
  },
  {
    campus: 'UC Riverside',
    shortName: 'Riverside',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/riverside/first-year-admit-data.html',
    applicants: 72542,
    admits: 63958,
    rate2025: 87.4,
    rate2026: 88.2,
    delta: 0.7,
  },
  {
    campus: 'UC Merced',
    shortName: 'Merced',
    href: 'https://admission.universityofcalifornia.edu/campuses-majors/merced/first-year-admit-data.html',
    applicants: 49426,
    admits: 46812,
    rate2025: 97.7,
    rate2026: 94.7,
    delta: -3.0,
  },
]

const FAQ = [
  {
    question: 'Are the Fall 2026 UC acceptance rates official?',
    answer:
      'Yes. The University of California published the campus figures in July 2026. They are preliminary and reflect admission offers through June 17, 2026, so later waitlist activity can change them.',
  },
  {
    question: 'What was the overall UC acceptance rate for Fall 2026?',
    answer:
      'UC admitted 153,272 of 205,431 unique first-year applicants, a systemwide first-year admit rate of 74.6%. The widely reported 78% rate applies only to California-resident first-year applicants admitted to at least one UC campus.',
  },
  {
    question: 'Which UC campus had the lowest acceptance rate in 2026?',
    answer:
      'UC Berkeley had the lowest overall first-year admit rate at 10.5%, narrowly below UCLA at 10.8%. Among California-resident applicants alone, UCLA remained more selective.',
  },
  {
    question: 'Why did the UC Santa Cruz acceptance rate increase so much?',
    answer:
      'UC Santa Cruz admitted substantially more students and began inviting some UC-eligible students who had not originally selected the campus to add it without an application fee. That process makes a simple year-over-year rate comparison less informative.',
  },
  {
    question: 'Is Fall 2026 UC admissions data available by high school?',
    answer:
      'Not yet. The latest searchable high-school source data is Fall 2025. Based on the UC Information Center update schedule, Fall 2026 source-school results are likely to arrive around February or March 2027.',
  },
  {
    question: 'Do these campus rates show admission chances by major?',
    answer:
      'No. These are campus-wide first-year rates. Competition can differ by college, school, or academic discipline, and the campus rate should not be treated as an individual prediction.',
  },
]

function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

function formatDelta(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} pp`
}

function JsonLd() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: '2026-08-26',
    dateModified: '2026-08-26',
    author: {
      '@type': 'Organization',
      name: 'collegeacceptance.info',
    },
    publisher: {
      '@type': 'Organization',
      name: 'collegeacceptance.info',
    },
    mainEntityOfPage: CANONICAL,
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
        name: 'Insights',
        item: 'https://collegeacceptance.info/insights',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: TITLE,
        item: CANONICAL,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  )
}

export default function UcAcceptanceRates2026Article() {
  return (
    <>
      <JsonLd />

      <header>
        <div className="header-inner article-header-inner">
          <Link href="/insights" className="text-sm text-blue-200 hover:text-white">
            UC Admissions Insights
          </Link>
          <h1>UC acceptance rates 2026: official results for every campus</h1>
          <p className="subtitle">
            Preliminary Fall 2026 first-year admission offers, campus changes, and the limits of the headline numbers.
          </p>
        </div>
      </header>

      <main className="article-shell">
        <article className="article-card">
          <div className="article-kicker">New UC data</div>
          <p className="article-byline">By collegeacceptance.info · Updated August 26, 2026</p>

          <p className="article-deck">
            The University of California&apos;s Fall 2026 admissions results are out. UC admitted a
            record number of California first-year students, while campus rates moved in very
            different directions: UC Berkeley became slightly more selective than UCLA overall,
            and UC Santa Cruz posted the year&apos;s largest increase.
          </p>

          <section className="article-stat-grid" aria-label="Fall 2026 UC admissions summary">
            <div className="article-stat-card">
              <strong>74.6%</strong>
              <span>Systemwide first-year admit rate, all residencies</span>
            </div>
            <div className="article-stat-card">
              <strong>78.4%</strong>
              <span>California-resident first-year admit rate</span>
            </div>
            <div className="article-stat-card">
              <strong>153,272</strong>
              <span>Unique first-year students admitted to at least one UC</span>
            </div>
            <div className="article-stat-card">
              <strong>29,372</strong>
              <span>California Community College students offered admission</span>
            </div>
          </section>

          <section className="answer-block" aria-label="Short answer">
            <h2>Short answer</h2>
            <p>
              For Fall 2026, UC admitted 153,272 of 205,431 unique first-year applicants, producing
              a 74.6% systemwide first-year admit rate. Campus rates ranged from 10.5% at UC
              Berkeley to 94.7% at UC Merced. These are preliminary admission-offer figures through
              June 17, 2026, not final enrollment results or a prediction for an individual student.
            </p>
          </section>

          <section>
            <h2>Key takeaways from the Fall 2026 release</h2>
            <ul className="article-steps">
              <li>
                First-year applications were almost unchanged, but UC issued about 2.6% more
                first-year admission offers than in the prior preliminary release.
              </li>
              <li>
                UC Berkeley&apos;s 10.5% overall rate was narrowly lower than UCLA&apos;s 10.8% rate.
              </li>
              <li>
                UC Santa Cruz and UC Santa Barbara recorded the largest increases in campus admit
                rates, while UC Merced, UC San Diego, and UC Berkeley declined.
              </li>
              <li>
                The 78% headline applies to California first-year applicants admitted somewhere in
                the UC system, not to admission at any particular campus.
              </li>
              <li>
                The searchable high-school dataset remains Fall 2025; Fall 2026 source-school data
                is not yet available.
              </li>
            </ul>
          </section>

          <section>
            <h2>How UC campus admit rates changed from 2025 to 2026</h2>
            <p>
              The systemwide story was modest, but the campus changes were not. The chart shows the
              percentage-point movement in each campus&apos;s preliminary first-year admit rate.
            </p>
            <div className="rate-change-card" aria-label="Change in UC campus admit rates from 2025 to 2026">
              <div className="rate-change-legend" aria-hidden="true">
                <span>Lower rate</span>
                <span>Higher rate</span>
              </div>
              <div className="rate-change-list">
                {CAMPUS_RESULTS.map(row => (
                  <div className="rate-change-row" key={row.campus}>
                    <strong>{row.shortName}</strong>
                    <div className="rate-change-plot" aria-hidden="true">
                      <div className="rate-change-half rate-change-negative">
                        {row.delta < 0 && (
                          <span
                            className="rate-change-bar decrease"
                            style={{ width: `${Math.abs(row.delta) / 9.2 * 100}%` }}
                          />
                        )}
                      </div>
                      <div className="rate-change-half rate-change-positive">
                        {row.delta > 0 && (
                          <span
                            className="rate-change-bar increase"
                            style={{ width: `${row.delta / 9.2 * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                    <span className={row.delta >= 0 ? 'rate-delta increase' : 'rate-delta decrease'}>
                      {formatDelta(row.delta)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>UC campus</th>
                    <th>2026 applicants</th>
                    <th>2026 admits</th>
                    <th>2025 rate</th>
                    <th>2026 rate</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPUS_RESULTS.map(row => (
                    <tr key={row.campus}>
                      <td>
                        <a href={row.href} target="_blank" rel="noopener">
                          {row.campus}
                        </a>
                      </td>
                      <td>{formatCount(row.applicants)}</td>
                      <td>{formatCount(row.admits)}</td>
                      <td>{row.rate2025.toFixed(1)}%</td>
                      <td>{row.rate2026.toFixed(1)}%</td>
                      <td className={row.delta >= 0 ? 'rate-delta increase' : 'rate-delta decrease'}>
                        {formatDelta(row.delta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="article-caption">
              Fall 2026 figures come from UC&apos;s current campus admit profiles. Fall 2025 rates are
              calculated from UC&apos;s preliminary application and admission tables. UC revises these
              snapshots as waitlist and record updates are processed, so small differences from
              later Information Center totals are expected.
            </p>
          </section>

          <section>
            <h2>Berkeley and UCLA moved in opposite directions</h2>
            <p>
              UC Berkeley received about 5% more first-year applications than in the comparable
              2025 release but made 484 fewer offers. Its rate fell from approximately 11.4% to
              10.5%. UCLA&apos;s application count was nearly flat, while its offers increased by 2,243,
              raising its rate from 9.4% to 10.8%.
            </p>
            <aside className="article-pullquote">
              Berkeley was the most selective UC campus overall in 2026, but UCLA remained more
              selective among California-resident first-year applicants.
            </aside>
          </section>

          <section>
            <h2>Why the Santa Cruz increase needs context</h2>
            <p>
              UC Santa Cruz admitted 64,867 first-year applicants, about 34% more than in the prior
              preliminary release. Its admit rate rose from approximately 72.9% to 82.1%.
            </p>
            <p>
              The change was not only about ordinary applicant demand. According to the{' '}
              <a
                href="https://www.latimes.com/california/story/2026-07-29/uc-fall-2026-admissions-rates-berkeley-ucla"
                target="_blank"
                rel="noopener"
              >
                Los Angeles Times&apos; reporting on the UC release
              </a>
              , Santa Cruz joined Riverside and Merced in inviting some UC-eligible students who
              had not originally selected the campus to add it without an application fee. Those
              students are then reviewed with the regular pool. That makes the 82.1% rate a poor
              shortcut for estimating the odds of someone who originally chose Santa Cruz.
            </p>
          </section>

          <section>
            <h2>What the 78% California admit rate actually means</h2>
            <p>
              UC received 130,211 applications from California-resident first-year students and
              admitted 102,031 of them somewhere in the nine-campus undergraduate system. That is
              78.4%, rounded by UC to 78%.
            </p>
            <p>
              The count is systemwide and unduplicated: a student is counted once even if several
              campuses admitted them. Campus application and admit counts work differently because
              the same student can appear in multiple campus totals. That is why adding the nine
              campus rows does not produce the systemwide number.
            </p>
            <p>
              The 78% figure also does not mean that a student had a 78% chance at UCLA, Berkeley,
              San Diego, or any other specific campus. Major or discipline competition can make a
              campus-wide rate even less representative of an individual application.
            </p>
          </section>

          <section className="article-cta-panel">
            <h2>Compare the campus results with your high school</h2>
            <p>
              Fall 2026 campus-wide rates are now available, while the latest searchable
              high-school source data remains Fall 2025. Use the school lookup to compare applicant
              volume, campus mix, admits, enrollment, and GPA across multiple years.
            </p>
            <div className="insights-actions">
              <ArticleCtaLink
                href="/"
                className="report-entry-link primary"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'homepage_search',
                  target_label: 'Search your high school',
                }}
              >
                Search your high school
              </ArticleCtaLink>
              <ArticleCtaLink
                href="/uc-admission-rates"
                className="report-entry-link"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'broad_rates_page',
                  target_label: 'Explore UC admission rates',
                }}
              >
                Explore UC admission rates
              </ArticleCtaLink>
              <ArticleCtaLink
                href="/rankings"
                className="report-entry-link"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'rankings_page',
                  target_label: 'View Fall 2025 rankings',
                }}
              >
                View Fall 2025 rankings
              </ArticleCtaLink>
            </div>
            <div className="article-example-links">
              <ArticleCtaLink
                href="/feeder-schools/ucla"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'feeder_page',
                  target_label: 'UCLA feeder schools',
                }}
              >
                UCLA feeder schools
              </ArticleCtaLink>
              <ArticleCtaLink
                href="/feeder-schools/uc-berkeley"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'feeder_page',
                  target_label: 'UC Berkeley feeder schools',
                }}
              >
                UC Berkeley feeder schools
              </ArticleCtaLink>
              <ArticleCtaLink
                href="/insights/uc-admission-rates-by-high-school"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'related_article',
                  target_label: 'How to read high-school admit rates',
                }}
              >
                How to read high-school admit rates
              </ArticleCtaLink>
            </div>
          </section>

          <section>
            <h2>What is preliminary and what comes next</h2>
            <p>
              UC&apos;s current admissions tables reflect offers through June 17, 2026. Campuses may
              continue admitting students from waitlists, and admitted students can change their
              plans during the summer. These figures therefore describe admission offers, not the
              final composition of the entering class.
            </p>
            <p>
              UC expects final Fall 2026 enrollment data in December 2026. Its public dashboard
              schedule lists fall admissions updates in February, and the current source-school
              dashboard was updated in March 2026. Based on that cadence, Fall 2026 high-school data
              will likely become available around February or March 2027.
            </p>
          </section>

          <section>
            <h2>FAQ</h2>
            <div className="article-faq-list">
              {FAQ.map(item => (
                <div key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Methodology and sources</h2>
            <p>
              The 2026 campus table uses the University of California&apos;s current first-year admit
              profiles. The systemwide applicant and admit totals come from UC Office of the
              President application and admissions fact sheets. Rates are admits divided by
              applicants and are rounded to one decimal place.
            </p>
            <p>
              The 2025 comparison uses UC&apos;s preliminary 2025 application and admission tables so
              that the comparison is close to the same stage of the annual admissions cycle. It
              should not be mixed with high-school source-school rates, which cover a different
              population and reporting view.
            </p>
            <ul>
              <li>
                <a
                  href="https://www.universityofcalifornia.edu/press-room/uc-admits-record-number-california-students"
                  target="_blank"
                  rel="noopener"
                >
                  UC Fall 2026 admissions announcement
                </a>
              </li>
              <li>
                <a
                  href="https://www.ucop.edu/institutional-research-academic-planning/_files/factsheets/2026/admissions-fact-sheet-data-tables.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  UCOP Fall 2026 admissions fact sheet and data tables
                </a>
              </li>
              <li>
                <a
                  href="https://ucop.edu/institutional-research-academic-planning/_files/factsheets/2026/information-summary.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  UCOP Fall 2026 application highlights
                </a>
              </li>
              <li>
                <a
                  href="https://ucop.edu/institutional-research-academic-planning/_files/factsheets/2025/table-1a-undergraduate-application-summary-counts.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  UCOP Fall 2025 preliminary application table
                </a>
              </li>
              <li>
                <a
                  href="https://www.ucop.edu/institutional-research-academic-planning/_files/factsheets/2025/admissions-table-1a.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  UCOP Fall 2025 preliminary admission table
                </a>
              </li>
              <li>
                <a
                  href="https://www.universityofcalifornia.edu/about-uc/information-center/admissions-source-school"
                  target="_blank"
                  rel="noopener"
                >
                  UC Admissions by Source School dashboard
                </a>
              </li>
              <li>
                <a
                  href="https://www.universityofcalifornia.edu/about-uc/information-center/dashboard-update-schedule"
                  target="_blank"
                  rel="noopener"
                >
                  UC Information Center update schedule
                </a>
              </li>
            </ul>
          </section>
        </article>
      </main>

      <footer>
        <p>
          <Link href="/insights">UC Admissions Insights</Link> · <Link href="/">UC admissions tool</Link> ·{' '}
          <Link href="/about">About</Link>
        </p>
      </footer>
    </>
  )
}
