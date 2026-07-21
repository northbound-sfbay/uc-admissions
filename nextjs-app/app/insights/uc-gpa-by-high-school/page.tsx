import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleCtaLink from '@/components/ArticleCtaLink'
import { getGpaInsightData, type GpaRankingRow } from '@/lib/rankings'

const CANONICAL = 'https://collegeacceptance.info/insights/uc-gpa-by-high-school'
const ARTICLE_SLUG = 'uc-gpa-by-high-school'
const TITLE = 'UC GPA by High School: How to Read Applicant and Admit GPA'
const DESCRIPTION =
  'Understand UC GPA by high school using source-school applicant, admit, and enrollee GPA data, with high-volume school examples and caveats.'

export const revalidate = 86400

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

const FAQ = [
  {
    question: 'Where can I find UC GPA by high school?',
    answer:
      'collegeacceptance.info shows UC applicant, admit, and enrollee GPA by high school when UC reports enough data for that school and year. Search a school page, then review the GPA context alongside applicants, admits, enrollees, campus mix, and admit rate.',
  },
  {
    question: 'What does UC GPA mean in the source-school tables?',
    answer:
      'UC describes freshman GPA in these admissions data pages as high school GPA in A-G subjects, computed from 10th and 11th grade coursework and including up to eight honors courses.',
  },
  {
    question: 'Is admitted GPA the GPA needed to get into UC?',
    answer:
      'No. Admitted GPA is an average for a group of admitted students from a school. It is historical context, not a cutoff or individual prediction.',
  },
  {
    question: 'Why is GPA missing for some high schools?',
    answer:
      'UC omits or suppresses some small-count values. A blank GPA field usually means the source-school table did not report enough data for that school, year, campus, or group.',
  },
  {
    question: 'Should I compare GPA across high schools?',
    answer:
      'Use caution. GPA averages are useful context, but they do not show course rigor, intended major, essays, activities, first-generation context, income, or the individual application details UC reviews.',
  },
]

function fmtNumber(value: number | null | undefined): string {
  if (value == null) return '-'
  return value.toLocaleString()
}

function fmtPercent(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function fmtGpa(value: number | null | undefined): string {
  if (value == null) return '-'
  return value.toFixed(2)
}

function SchoolCell({ row }: { row: GpaRankingRow }) {
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
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: '2026-05-11',
    dateModified: '2026-05-11',
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

export default function UcGpaByHighSchoolArticle() {
  const gpaData = getGpaInsightData()
  const strongestGpaSchool = gpaData.topAdmittedGpaSchools[0]
  const largestGapSchool = gpaData.largestGpaGaps[0]

  return (
    <>
      <JsonLd />

      <header>
        <div className="header-inner article-header-inner">
          <Link href="/insights" className="text-sm text-blue-200 hover:text-white">
            UC Admissions Insights
          </Link>
          <h1>UC GPA by high school is useful only when you compare it with applicants and admits</h1>
          <p className="subtitle">
            A guide to UC applicant GPA, admitted GPA, enrollee GPA, and the limits of source-school averages.
          </p>
        </div>
      </header>

      <main className="article-shell">
        <article className="article-card">
          <div className="article-kicker">GPA data guide</div>
          <p className="article-byline">By collegeacceptance.info - Updated May 11, 2026</p>

          <p className="article-deck">
            Families often look for a UC GPA number that explains whether a student is competitive.
            The source-school tables are more useful than that, but also more limited. GPA should be
            read next to applicant volume, campus mix, admit rate, and enrollment behavior.
          </p>

          <section className="article-stat-grid" aria-label="UC GPA source-school coverage">
            <div className="article-stat-card">
              <strong>{fmtNumber(gpaData.gpaSchoolCount)}</strong>
              <span>Schools matched to GPA records in the local dataset</span>
            </div>
            <div className="article-stat-card">
              <strong>{gpaData.gpaYear}</strong>
              <span>Latest source-school GPA year used here</span>
            </div>
            <div className="article-stat-card">
              <strong>{strongestGpaSchool ? fmtGpa(strongestGpaSchool.admGpa) : '-'}</strong>
              <span>Highest admitted GPA among high-volume schools in this view</span>
            </div>
            <div className="article-stat-card">
              <strong>{largestGapSchool ? fmtGpa(largestGapSchool.admitMinusApplicantGpa) : '-'}</strong>
              <span>Largest admit-minus-applicant GPA gap in this view</span>
            </div>
          </section>

          <section className="answer-block" aria-label="Short answer">
            <h2>Short answer</h2>
            <p>
              UC GPA by high school shows the average GPA of applicants, admits, and enrollees from
              a source school when UC reports enough data. It is best used to understand the strength
              of a school&apos;s applicant pool and admitted group, not to estimate an individual
              student&apos;s odds.
            </p>
          </section>

          <section>
            <h2>What UC GPA means in this context</h2>
            <p>
              UC publishes GPA in its admissions data as an academic profile measure for first-year
              applicants and admitted students. UC says the GPA is based on A-G subjects from 10th
              and 11th grade coursework and includes up to eight honors courses.
            </p>
            <p>
              The important point is that this is an average for a reported group. A high school can
              have a high applicant GPA and a lower admit rate if many students apply to selective
              campuses. Another school can have a lower applicant GPA and a higher universitywide
              admit rate if its campus mix is different.
            </p>
            <aside className="article-pullquote">
              GPA is context. It is not a cutoff, and it is not a school-level admissions prediction.
            </aside>
          </section>

          <section>
            <h2>High-volume schools with the highest admitted GPA</h2>
            <p>
              This table filters to high schools with at least 100 universitywide UC applicants in
              Fall {gpaData.displayYear}. That threshold avoids highlighting tiny groups where one or
              two students can swing the average.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Admit GPA</th>
                    <th>Applicant GPA</th>
                    <th>Admit rate</th>
                    <th>Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {gpaData.topAdmittedGpaSchools.slice(0, 12).map(row => (
                    <tr key={`top-gpa-${row.school_id}`}>
                      <SchoolCell row={row} />
                      <td>{fmtGpa(row.admGpa)}</td>
                      <td>{fmtGpa(row.appGpa)}</td>
                      <td>{fmtPercent(row.admitRate)}</td>
                      <td>{fmtNumber(row.app)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Where admitted GPA most exceeds applicant GPA</h2>
            <p>
              The gap between admitted GPA and applicant GPA can show how selective the admitted
              group was relative to the full applicant group from that school. It still does not
              reveal major, rigor, activities, essays, or individual context.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th>GPA gap</th>
                    <th>Admit GPA</th>
                    <th>Applicant GPA</th>
                    <th>Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {gpaData.largestGpaGaps.slice(0, 12).map(row => (
                    <tr key={`gap-${row.school_id}`}>
                      <SchoolCell row={row} />
                      <td>{fmtGpa(row.admitMinusApplicantGpa)}</td>
                      <td>{fmtGpa(row.admGpa)}</td>
                      <td>{fmtGpa(row.appGpa)}</td>
                      <td>{fmtNumber(row.app)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Why GPA alone can mislead</h2>
            <ol className="article-steps">
              <li>UC GPA averages do not show intended major or college.</li>
              <li>Averages do not show course rigor beyond the GPA calculation itself.</li>
              <li>Campus mix matters because UCLA, Berkeley, Irvine, Davis, Merced, and other UC campuses have different applicant pools.</li>
              <li>Small-count values may be blank or unstable from year to year.</li>
              <li>Enrollee GPA can differ from admitted GPA because admitted students choose different destinations.</li>
            </ol>
          </section>

          <section className="article-cta-panel">
            <h2>Search GPA context for a specific school</h2>
            <p>
              Start with a high school, then compare GPA with applicants, admits, enrollment,
              campus mix, and the multi-year trend.
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
                href="/rankings"
                className="report-entry-link"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'rankings_page',
                  target_label: 'View UC rankings',
                }}
              >
                View UC rankings
              </ArticleCtaLink>
              <ArticleCtaLink
                href="/insights/uc-admission-rates-by-high-school"
                className="report-entry-link"
                eventParams={{
                  article_slug: ARTICLE_SLUG,
                  target_type: 'article',
                  target_label: 'Read admit-rate guide',
                }}
              >
                Read admit-rate guide
              </ArticleCtaLink>
            </div>
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
            <h2>Methodology and source notes</h2>
            <p>
              This article uses local calculations from collegeacceptance.info source-school
              admissions and GPA records. Tables are filtered to California public and private high
              schools with at least 100 universitywide UC applicants in Fall {gpaData.displayYear}.
            </p>
            <p>
              Source-school GPA fields are matched to school admissions records by source-school
              identity. Duplicate leading-zero and non-leading-zero GPA files are deduplicated by
              school name, city, county, and school type.
            </p>
            <p>
              Sources:{' '}
              <a
                href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
                target="_blank"
                rel="noopener"
              >
                University of California Admissions by Source School
              </a>{' '}
              and{' '}
              <a
                href="https://admission.universityofcalifornia.edu/campuses-majors/first-year-admit-data.html"
                target="_blank"
                rel="noopener"
              >
                UC first-year admit data notes
              </a>
            </p>
          </section>
        </article>
      </main>

      <footer>
        <p>
          <Link href="/insights">UC Admissions Insights</Link> - <Link href="/">UC admissions tool</Link> -{' '}
          <Link href="/rankings">Rankings</Link>
        </p>
      </footer>
    </>
  )
}
