import type { Metadata } from 'next'
import Link from 'next/link'

const CANONICAL = 'https://collegeacceptance.info/insights/uc-admission-rates-by-high-school'
const TITLE = 'UC Admission Rates by High School: How to Read the Data'
const DESCRIPTION =
  'Learn what UC admission rates by high school mean, how applicants, admits, enrollees, GPA, and campus rates are calculated, and how to look up your school.'

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

const CAMPUS_BENCHMARKS = [
  ['UCLA', '88,267', '7,863', '8.9%'],
  ['UC Berkeley', '71,750', '9,102', '12.7%'],
  ['UC San Diego', '86,639', '21,332', '24.6%'],
  ['UC Irvine', '85,584', '18,680', '21.8%'],
  ['UC Santa Barbara', '73,885', '23,786', '32.2%'],
  ['UC Davis', '68,388', '25,225', '36.9%'],
  ['UC Santa Cruz', '51,879', '37,004', '71.3%'],
  ['UC Riverside', '60,765', '52,907', '87.1%'],
  ['UC Merced', '42,412', '40,854', '96.3%'],
]

const FAQ = [
  {
    question: 'Where can I find UC admission rates by high school?',
    answer:
      'You can search UC admission rates by high school using the interactive lookup on collegeacceptance.info. It shows applicants, admits, enrollees, admit rates, campus breakdowns, ethnicity views, and trends from Fall 1994 through Fall 2025.',
  },
  {
    question: 'Is UC admission rate the same as UC acceptance rate?',
    answer:
      'In casual searches, people often use admission rate and acceptance rate to mean the same thing. In this data, the clearer term is admit rate: admits divided by applicants.',
  },
  {
    question: 'Are high-school UC admit rates official?',
    answer:
      'The underlying data comes from the University of California Admissions by Source School tables. This site makes the data easier to search, compare, and interpret.',
  },
  {
    question: 'Why does a high school universitywide UC rate differ from UCLA or Berkeley rates?',
    answer:
      'Universitywide rates combine outcomes across UC campuses. UCLA and UC Berkeley are much more selective than some other UC campuses, so campus-specific rates can look very different from the overall school rate.',
  },
  {
    question: 'Does a high school UC admit rate predict my student odds?',
    answer:
      'No. It is historical context for a group of applicants from that school. It should not be treated as an individual admissions prediction.',
  },
  {
    question: 'Why do some GPA or admit-rate fields appear blank?',
    answer:
      'UC suppresses or omits some small-count categories. Blank values often mean there were too few students to report a reliable number.',
  },
]

function JsonLd() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: '2026-05-01',
    dateModified: '2026-05-01',
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

export default function UcAdmissionRatesByHighSchoolArticle() {
  return (
    <>
      <JsonLd />

      <header>
        <div className="header-inner">
          <Link href="/insights" className="text-sm text-blue-200 hover:text-white">
            Insights
          </Link>
          <h1>UC admission rates by high school: how to read the data</h1>
          <p className="subtitle">
            Applicants, admits, enrollees, GPA, campus mix, and why one admit-rate number is not enough.
          </p>
        </div>
      </header>

      <main className="article-shell">
        <article className="article-card">
          <p className="article-kicker">Admissions data explainer</p>

          <section className="answer-block" aria-label="Short answer">
            <h2>Short answer</h2>
            <p>
              UC admission rates by high school show how many students from a source school applied
              to, were admitted by, and enrolled at University of California campuses. They are useful
              for understanding a school&apos;s UC track record, but they are not the same thing as an
              individual student&apos;s chance of admission.
            </p>
            <p>
              The best use is to compare several signals together: applicant volume, admits,
              enrollment, campus mix, GPA profile, and trends over time.
            </p>
          </section>

          <section>
            <h2>Key takeaways</h2>
            <ul>
              <li>UC high-school admit rate usually means admits divided by applicants for a specific school, year, and campus or universitywide view.</li>
              <li>A high admit rate does not automatically mean a school is easier or better; it may reflect campus mix, applicant self-selection, or a smaller applicant pool.</li>
              <li>Campus-specific rates matter because UCLA, UC Berkeley, UC San Diego, UC Davis, UC Irvine, and UC Merced have very different selectivity patterns.</li>
              <li>GPA data adds context because rising admitted GPAs can show that the applicant pool is becoming stronger even when admit rates look stable.</li>
              <li>The most useful view is a time series for one high school, not a one-year screenshot.</li>
            </ul>
          </section>

          <section>
            <h2>What &quot;UC admission rate by high school&quot; means</h2>
            <p>
              In the UC source-school data, the basic fields are applicants, admits, and enrollees.
              The admit rate is calculated as:
            </p>
            <p className="formula">admits / applicants</p>
            <p>
              For example, if a high school had 100 applicants to UC and 70 admits, its admit rate
              would be 70%. That number is descriptive. It tells you what happened to applicants
              from that school in a specific year and data view.
            </p>
            <p>
              It does not tell you that a future student has a 70% chance of admission. Individual
              outcomes depend on campus choice, major, GPA, courses, essays, activities, residency,
              and many other factors that are not captured in the source-school table.
            </p>
          </section>

          <section>
            <h2>Quick definitions</h2>
            <div className="article-table-wrap">
              <table className="article-table">
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Meaning</th>
                    <th>Why it matters</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Applicants</td>
                    <td>Students who applied to UC from a source school</td>
                    <td>Shows demand and applicant volume</td>
                  </tr>
                  <tr>
                    <td>Admits</td>
                    <td>Students who received an offer of admission</td>
                    <td>Shows how many applicants cleared UC review</td>
                  </tr>
                  <tr>
                    <td>Enrollees</td>
                    <td>Students who accepted an offer and enrolled</td>
                    <td>Shows actual matriculation, not just admission</td>
                  </tr>
                  <tr>
                    <td>Admit rate</td>
                    <td>Admits divided by applicants</td>
                    <td>Useful, but incomplete by itself</td>
                  </tr>
                  <tr>
                    <td>Yield</td>
                    <td>Enrollees divided by admits</td>
                    <td>Shows whether admitted students actually chose UC</td>
                  </tr>
                  <tr>
                    <td>GPA profile</td>
                    <td>Average applicant, admit, and enrollee GPA</td>
                    <td>Helps separate applicant strength from UC selectivity</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Fall 2025 campus benchmark</h2>
            <p>
              In the Fall 2025 California public and private high-school source-school data used by
              this site, 1,705 schools had at least one UC applicant. Across those schools, the data
              includes 129,703 applicants, 100,296 admits, and 41,887 enrollees in the universitywide
              view.
            </p>
            <div className="article-table-wrap">
              <table className="article-table benchmark-table">
                <thead>
                  <tr>
                    <th>UC campus</th>
                    <th>Applicants</th>
                    <th>Admits</th>
                    <th>Admit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPUS_BENCHMARKS.map(([campus, applicants, admits, rate]) => (
                    <tr key={campus}>
                      <td>{campus}</td>
                      <td>{applicants}</td>
                      <td>{admits}</td>
                      <td>{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              This benchmark shows why one UC admit-rate number is too broad. A school can have
              strong outcomes at some campuses and weaker outcomes at others. A universitywide rate
              can hide that difference.
            </p>
          </section>

          <section>
            <h2>Why campus mix changes the story</h2>
            <p>
              Suppose two high schools both show a 75% universitywide UC admit rate. They may not
              be comparable.
            </p>
            <p>
              One school might send many applications to UCLA, UC Berkeley, and UC San Diego.
              Another might send most applications to UC Riverside, UC Santa Cruz, and UC Merced.
              The universitywide admit rate alone would miss that difference.
            </p>
            <p>
              That is why a good high-school UC analysis should show campus-by-campus outcomes. For
              a family comparing schools, the better question is not only &quot;what is the UC admit
              rate?&quot; but also &quot;which UC campuses are students applying to and getting into?&quot;
            </p>
          </section>

          <section>
            <h2>Why applicant volume matters</h2>
            <p>
              Applicant volume tells you how much confidence to place in a rate. A school with 10
              applicants and 8 admits has an 80% admit rate, but that number can swing dramatically
              from year to year. A school with 400 applicants and 300 admits has a 75% admit rate
              based on a much larger pool.
            </p>
            <p>
              For high schools with large applicant pools, trends are usually more informative than
              a single year. For smaller schools, it is safer to look at multi-year patterns instead
              of over-interpreting one data point.
            </p>
          </section>

          <section>
            <h2>Why GPA context matters</h2>
            <p>
              GPA data helps explain whether a trend is about UC selectivity, applicant quality, or
              both.
            </p>
            <p>
              If a school&apos;s admitted GPA rises over time while the admit rate stays flat, that may
              mean UC admission is becoming more competitive for that school. If applicant GPA rises
              and admits rise too, the school may simply be sending a stronger applicant pool.
            </p>
            <p>
              The UC source-school data includes average GPA for applicants, admits, and enrollees
              where enough students are present to report it. UC describes freshman GPA in this
              dataset as weighted, capped high school GPA for 10th and 11th grade college-preparatory
              courses.
            </p>
          </section>

          <section className="article-cta-panel">
            <h2>Look up your high school</h2>
            <p>
              Start with the interactive UC admissions tool, then compare campus-specific admit
              rates, enrollment, and GPA context for your school.
            </p>
            <div className="insights-actions">
              <Link href="/" className="report-entry-link primary">
                Search your high school
              </Link>
              <Link href="/uc-admission-rates" className="report-entry-link">
                View UC admission rates
              </Link>
            </div>
            <div className="article-example-links">
              <Link href="/school/50410-burlingame-high-school">Burlingame High School</Link>
              <Link href="/school/50130-arcadia-high-school">Arcadia High School</Link>
              <Link href="/school/52970-lowell-high-school">Lowell High School</Link>
              <Link href="/feeder-schools/ucla">UCLA feeder schools</Link>
              <Link href="/feeder-schools/uc-berkeley">UC Berkeley feeder schools</Link>
            </div>
          </section>

          <section>
            <h2>What this data should not be used for</h2>
            <p>
              Do not use a high school&apos;s UC admit rate as a direct probability for an individual
              student. The data does not show intended major, course rigor, essays, activities,
              recommendation context, first-generation status, family income, or individual academic
              details.
            </p>
            <p>
              It is best used as historical context, not a prediction engine. It is also important
              to distinguish campus-specific rates from universitywide rates because UC campuses
              have different applicant pools and selectivity.
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
            <h2>Methodology and source notes</h2>
            <p>
              This article uses local calculations from the collegeacceptance.info Fall 2025
              California public and private high-school source-school dataset. The source is the
              University of California Information Center&apos;s Admissions by Source School data.
            </p>
            <p>
              UC&apos;s source page defines applicants, admits, and enrollees, and notes that the
              tables include freshman applicant counts, admit counts, enrollee counts, and mean GPA
              by source school.
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
          <Link href="/insights">UC Admissions Insights</Link> · <Link href="/">UC admissions tool</Link> ·{' '}
          <Link href="/about">About</Link>
        </p>
      </footer>
    </>
  )
}
