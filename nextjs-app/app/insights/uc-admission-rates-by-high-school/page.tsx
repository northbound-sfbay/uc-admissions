import type { Metadata } from 'next'
import Link from 'next/link'

const CANONICAL = 'https://collegeacceptance.info/insights/uc-admission-rates-by-high-school'
const TITLE = 'UC Admission Rates by High School: What the Data Shows'
const DESCRIPTION =
  'UC admission rates by high school can be useful, but one number can mislead. See how campus mix, applicant volume, GPA, and enrollment change the story.'

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
  ['UC Irvine', '85,584', '18,680', '21.8%'],
  ['UC San Diego', '86,639', '21,332', '24.6%'],
  ['UC Santa Barbara', '73,885', '23,786', '32.2%'],
  ['UC Davis', '68,388', '25,225', '36.9%'],
  ['UC Santa Cruz', '51,879', '37,004', '71.3%'],
  ['UC Riverside', '60,765', '52,907', '87.1%'],
  ['UC Merced', '42,412', '40,854', '96.3%'],
]

const STAT_CARDS = [
  {
    label: 'California high schools with 2025 UC applicants',
    value: '1,705',
  },
  {
    label: 'Applicants in the universitywide source-school view',
    value: '129,703',
  },
  {
    label: 'Universitywide admit rate in that view',
    value: '77.3%',
  },
  {
    label: 'Admitted students who enrolled',
    value: '41.8%',
  },
]

const FIELD_DEFINITIONS = [
  ['Applicants', 'Students who applied to UC from a source school', 'Shows demand and applicant volume'],
  ['Admits', 'Students who received an offer of admission', 'Shows how many applicants cleared UC review'],
  ['Enrollees', 'Students who accepted an offer and enrolled', 'Shows actual matriculation, not just admission'],
  ['Admit rate', 'Admits divided by applicants', 'Useful, but incomplete by itself'],
  ['Yield', 'Enrollees divided by admits', 'Shows whether admitted students actually chose UC'],
  ['GPA profile', 'Average applicant, admit, and enrollee GPA', 'Helps separate applicant strength from UC selectivity'],
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
        <div className="header-inner article-header-inner">
          <Link href="/insights" className="text-sm text-blue-200 hover:text-white">
            UC Admissions Insights
          </Link>
          <h1>UC admission rates by high school can be useful - if you know what you are looking at</h1>
          <p className="subtitle">
            A data guide to applicants, admits, enrollment, GPA and campus mix in the latest UC source-school tables.
          </p>
        </div>
      </header>

      <main className="article-shell">
        <article className="article-card">
          <div className="article-kicker">Data analysis</div>
          <p className="article-byline">By collegeacceptance.info · Updated May 1, 2026</p>

          <p className="article-deck">
            Families often search for a single UC acceptance rate for a high school. The data is
            more useful than that - and more complicated. A school&apos;s UC record depends on who
            applied, where they applied, how strong the applicant pool was, and whether admitted
            students actually enrolled.
          </p>

          <section className="article-stat-grid" aria-label="Fall 2025 UC source-school snapshot">
            {STAT_CARDS.map(card => (
              <div className="article-stat-card" key={card.label}>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
              </div>
            ))}
          </section>

          <section className="answer-block" aria-label="Short answer">
            <h2>Short answer</h2>
            <p>
              UC admission rates by high school show how many students from a source school applied
              to, were admitted by and enrolled at University of California campuses. They are best
              read as a historical record for a group of applicants, not as an individual student&apos;s
              odds of admission.
            </p>
          </section>

          <section>
            <h2>The headline number hides the campus story</h2>
            <p>
              In the Fall 2025 California public and private high-school source-school data used by
              this site, the universitywide admit rate was 77.3%. That sounds simple. But the same
              dataset shows UCLA at 8.9%, UC Berkeley at 12.7%, UC San Diego at 24.6% and UC Merced
              at 96.3%.
            </p>
            <p>
              That spread is the reason a single UC rate can mislead. A high school with a 75%
              universitywide rate could be sending many applications to less selective UC campuses.
              Another school with the same universitywide rate could be sending many applicants to
              UCLA, Berkeley and San Diego. Those are very different stories.
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
            <p className="article-caption">
              Fall 2025 campus benchmark from California public and private high-school source-school records used by this site.
            </p>
          </section>

          <section>
            <h2>The best school comparison starts with volume</h2>
            <p>
              Applicant count is the first reality check. A school with 10 applicants and 8 admits
              has an 80% admit rate, but that percentage can swing sharply the next year. A school
              with 400 applicants and 300 admits has a 75% admit rate based on a much larger pool.
            </p>
            <p>
              That does not make the larger school better. It makes the trend easier to interpret.
              For small applicant pools, a multi-year view matters more than a single annual rate.
              For large applicant pools, campus-by-campus changes can reveal whether students are
              shifting toward more selective campuses or whether admissions outcomes are improving.
            </p>
            <aside className="article-pullquote">
              The question is not just &quot;what was the admit rate?&quot; It is &quot;what kind of applicant pool produced that rate?&quot;
            </aside>
          </section>

          <section>
            <h2>GPA changes how the trend should be read</h2>
            <p>
              A rising admit rate can look like better odds. A falling admit rate can look like a
              tougher year. But GPA data adds a second layer: it helps separate student strength
              from campus selectivity.
            </p>
            <p>
              If admitted GPAs rise while admit rates stay flat, the bar may be moving up. If
              applicant GPA rises and admits rise too, the school may be sending a stronger applicant
              pool. If enrollment GPA differs from admitted GPA, it may show which admitted students
              actually chose UC.
            </p>
            <p>
              UC&apos;s source-school tables include average GPA for applicants, admits and enrollees
              when enough students are present to report it. UC describes freshman GPA in this data
              as weighted, capped high school GPA for 10th and 11th grade college-preparatory
              courses.
            </p>
          </section>

          <section className="article-cta-panel">
            <h2>Look up your school&apos;s UC trend</h2>
            <p>
              Search a California high school, then compare applicants, admits, enrollment, campus
              mix and GPA context across time.
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
            <h2>How to read a high-school page in five minutes</h2>
            <p>
              Start with the latest year, but do not stop there. A useful read of a school page
              usually follows this order:
            </p>
            <ol className="article-steps">
              <li>Check applicant volume. Small pools need more caution.</li>
              <li>Compare universitywide results with campus-specific results.</li>
              <li>Look at several years, not only the latest cycle.</li>
              <li>Use GPA to judge whether the applicant pool changed.</li>
              <li>Compare admits with enrollees to see whether students actually chose UC.</li>
            </ol>
          </section>

          <section>
            <h2>What each field means</h2>
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
                  {FIELD_DEFINITIONS.map(([term, meaning, why]) => (
                    <tr key={term}>
                      <td>{term}</td>
                      <td>{meaning}</td>
                      <td>{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>What this data should not be used for</h2>
            <p>
              Do not use a high school&apos;s UC admit rate as a direct probability for an individual
              student. The data does not show intended major, course rigor, essays, activities,
              recommendation context, first-generation status, family income or individual academic
              details.
            </p>
            <p>
              It is best used as historical context. The strongest use is comparing a school&apos;s
              applicant volume, campus mix, GPA profile and admit trends over time.
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
              UC&apos;s source page defines applicants, admits and enrollees, and notes that the tables
              include freshman applicant counts, admit counts, enrollee counts and mean GPA by source
              school. Some small-count fields are blank because UC does not report every small group.
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
