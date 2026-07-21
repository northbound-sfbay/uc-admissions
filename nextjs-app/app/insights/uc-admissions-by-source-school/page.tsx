import type { Metadata } from 'next'
import Link from 'next/link'

const CANONICAL = 'https://collegeacceptance.info/insights/uc-admissions-by-source-school'
const TITLE = 'UC Admissions by Source School: How to Read the Data'
const DESCRIPTION =
  'A methodology guide to UC admissions by source school data: applicants, admits, enrollees, admit rates, campus views, ethnicity views, and common limitations.'

const FAQ = [
  {
    question: 'What is UC admissions by source school data?',
    answer:
      'UC admissions by source school data reports applicants, admits, and enrollees by high school, campus, year, and selected student categories. It is a historical school-level dataset, not an individual admissions prediction.',
  },
  {
    question: 'Is UC source data the same as acceptance-rate data?',
    answer:
      'The source-school tables include the inputs needed to calculate admit rates: admits divided by applicants. Families often search for this as UC acceptance rates by high school.',
  },
  {
    question: 'Why can a school have a high UC admit rate?',
    answer:
      "A high rate can reflect applicant mix, campus mix, academic preparation, applicant volume, and where students applied. It does not prove that attending the school improves one student's odds.",
  },
  {
    question: 'Why are some school or campus numbers blank?',
    answer:
      'Small-count rows may be suppressed, omitted, or incomplete. Blank values should be treated as unavailable data rather than zero students or a zero percent admit rate.',
  },
]

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

function JsonLd() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: '2026-05-16',
    dateModified: '2026-05-16',
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

export default function UcAdmissionsBySourceSchoolPage() {
  return (
    <>
      <JsonLd />

      <header>
        <div className="header-inner article-header-inner">
          <Link href="/insights" className="text-sm text-blue-200 hover:text-white">
            UC Admissions Insights
          </Link>
          <h1>UC admissions by source school: how to read the data</h1>
          <p className="subtitle">
            Methodology notes for applicants, admits, enrollees, admit rates, campus views, and source-school limits.
          </p>
        </div>
      </header>

      <main className="article-shell">
        <article className="article-card">
          <div className="article-kicker">Methodology</div>
          <p className="article-byline">By collegeacceptance.info · Updated May 16, 2026</p>

          <p className="article-deck">
            UC admissions by source school data is the foundation for the high-school lookup,
            school pages, feeder pages, county pages, and UC acceptance-rate views on this site.
            It is useful because it shows actual historical outcomes by high school. It is limited
            because those outcomes describe groups of applicants, not one student&apos;s odds.
          </p>

          <section className="answer-block" aria-label="Short answer">
            <h2>Short answer</h2>
            <p>
              UC source data reports how many students from a high school applied to UC, were
              admitted, and enrolled. The admit rate is admits divided by applicants; many families
              search for the same number as a UC acceptance rate by high school.
            </p>
          </section>

          <section>
            <h2>What the dataset can answer</h2>
            <ul className="article-steps">
              <li>How many students from a high school applied to UC in a given fall term.</li>
              <li>How many were admitted and how many enrolled.</li>
              <li>How results differ by UC campus, including UCLA, UC Berkeley, UC San Diego, UC Davis, and the other undergraduate campuses.</li>
              <li>How a school&apos;s applicant volume, admit rate, and yield changed over time.</li>
              <li>Which schools send the most admits to a campus in feeder-school rankings.</li>
            </ul>
          </section>

          <section>
            <h2>What each field means</h2>
            <div className="article-table-wrap">
              <table className="article-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Meaning</th>
                    <th>How to use it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Applicants</td>
                    <td>Students from a source school who applied to UC.</td>
                    <td>Use this to understand demand and sample size.</td>
                  </tr>
                  <tr>
                    <td>Admits</td>
                    <td>Students who received a UC admission offer.</td>
                    <td>Use this for feeder-school volume and campus-specific outcome comparisons.</td>
                  </tr>
                  <tr>
                    <td>Enrollees</td>
                    <td>Admitted students who enrolled.</td>
                    <td>Use this to understand whether admits actually chose UC.</td>
                  </tr>
                  <tr>
                    <td>Admit rate</td>
                    <td>Admits divided by applicants.</td>
                    <td>Use this as historical context, not as an individual prediction.</td>
                  </tr>
                  <tr>
                    <td>Campus view</td>
                    <td>The same measures filtered to one UC campus.</td>
                    <td>Use this because UCLA or UC Berkeley can differ sharply from the universitywide rate.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Common mistakes</h2>
            <ul className="article-steps">
              <li>Treating a school&apos;s UC admit rate as one student&apos;s chance of admission.</li>
              <li>Comparing a 20-applicant school with a 400-applicant school without noticing sample size.</li>
              <li>Using a universitywide UC rate when the real question is UCLA, UC Berkeley, or another specific campus.</li>
              <li>Assuming a high feeder-school rank means a special admissions relationship.</li>
              <li>Reading blank or suppressed values as zero.</li>
            </ul>
          </section>

          <section className="article-cta-panel">
            <h2>Use the data</h2>
            <p>
              Start with the high-school lookup, then use school pages, campus feeder pages,
              county pages, and the UC admission-rate explainer to compare results carefully.
            </p>
            <div className="article-example-links">
              <Link href="/">Search a high school</Link>
              <Link href="/uc-admission-rates">UC admission rates</Link>
              <Link href="/feeder-schools/ucla">UCLA feeder schools</Link>
              <Link href="/rankings">UC rankings</Link>
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

          <p className="article-caption">
            Source:{' '}
            <a
              href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
              target="_blank"
              rel="noopener"
            >
              University of California Information Center admissions by source school
            </a>
            . collegeacceptance.info reorganizes the source-school data into searchable school,
            campus, county, and feeder-school pages.
          </p>
        </article>
      </main>
    </>
  )
}
