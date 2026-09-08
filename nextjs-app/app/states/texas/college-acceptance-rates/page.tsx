/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation preserves the site ad lifecycle. */
import type { Metadata } from 'next'
import TexasAdmissionsTable from '@/components/TexasAdmissionsTable'
import { texasAdmissions, TEXAS_ADMISSIONS_PATH, acceptanceRate, admissionNumber, admissionPercent } from '@/lib/texas-admissions'

const CANONICAL = `https://collegeacceptance.info${TEXAS_ADMISSIONS_PATH}`
const TITLE = 'Texas College Acceptance Rates: Fall 2025 Data, Updated 2026'
const DESCRIPTION = 'Compare Texas applicant acceptance rates at 37 public universities, including UT Austin and Texas A&M. Official THECB Fall 2017–2025 data released July 2026.'
export const metadata: Metadata = {
  title: `${TITLE} | collegeacceptance.info`, description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: CANONICAL, type: 'website' },
}

const faq = [
  { question: 'Is this Fall 2026 Texas admissions data?', answer: 'No. THECB released this report on July 14, 2026, but its latest entering class is Fall 2025. The high-school destination dataset covers Fall 2019–2024. Publication year, admissions year, and high-school graduation year are different.' },
  { question: 'Are these overall or out-of-state acceptance rates?', answer: 'These rates use the report’s Texas applicant and Texas accepted counts. The separate all-applicant column includes out-of-state applicants, but the workbook does not provide a matching all-applicant accepted total. It cannot supply an overall or out-of-state acceptance rate.' },
  { question: 'Can I find a Texas high school’s acceptance rate?', answer: 'The university report gives institution-level admission counts. The high-school reports show enrollment destinations. Dividing a high school’s UT Austin enrollees by its graduates measures a destination share, not an acceptance rate.' },
  { question: 'Does automatic admission guarantee a major at UT Austin?', answer: 'No. UT Austin’s catalog says automatic admission to the university does not guarantee the requested major. Its current admissions page lists a top 5% threshold for eligible Summer/Fall 2026 and Spring 2027 applicants, and Summer/Fall 2027 and Spring 2028 applicants.' },
]

export default function TexasCollegeAcceptanceRatesPage() {
  const { latestYear, years, institutions } = texasAdmissions
  const featured = ['003658', '003632', '003652', '009741', '003644', '010115'].map(code => institutions.find(i => i.ficeCode === code)!)
  const ut = featured[0].years[latestYear]
  const tamu = featured[1].years[latestYear]
  const datasetLd = {
    '@context': 'https://schema.org', '@type': 'Dataset', name: TITLE, description: DESCRIPTION,
    url: CANONICAL, temporalCoverage: '2017/2025', dateModified: texasAdmissions.verifiedAt,
    creator: { '@type': 'Organization', name: 'Texas Higher Education Coordinating Board' },
    citation: texasAdmissions.sourceUrl, spatialCoverage: { '@type': 'State', name: 'Texas' },
    variableMeasured: ['Texas applicants', 'Texas accepted', 'Texas enrolled'],
    distribution: { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://collegeacceptance.info/data/texas-admissions.json' },
  }
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) }
  const breadcrumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Texas', item: 'https://collegeacceptance.info/states/texas' },
    { '@type': 'ListItem', position: 2, name: 'Texas college acceptance rates', item: CANONICAL },
  ] }
  return <>
    {[datasetLd, faqLd, breadcrumbs].map((value, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }} />)}
    <header className="state-home-header">
      <nav className="state-home-nav" aria-label="Primary navigation">
        <a className="state-home-brand" href="/">collegeacceptance.info</a>
        <div className="state-home-nav-links"><a href="/states/texas">Texas</a><a href="/states/texas/high-schools">High schools</a><a href="/insights">Insights</a></div>
      </nav>
      <div className="state-home-hero texas-detail-hero"><div className="state-home-hero-copy">
        <p className="state-home-kicker">Released July 14, 2026 · Checked September 7, 2026</p>
        <h1>Texas college acceptance rates for Texas applicants</h1>
        <p>Compare official first-time undergraduate admissions at {institutions.length} Texas public universities. The latest results cover <strong>Fall {latestYear}</strong>, with nine years of history.</p>
        <div className="state-home-actions"><a className="report-entry-link primary" href="#compare-universities">Compare universities</a><a className="report-entry-link" href="#data-years">What is new in 2026?</a></div>
      </div></div>
    </header>
    <main className="state-home-shell"><div className="state-home-band texas-detail-band">
      <section className="state-home-section answer-block">
        <h2>What are the latest Texas college acceptance rates?</h2>
        <p>In THECB&apos;s Fall {latestYear} Texas-applicant data, UT Austin accepted {admissionNumber(ut.texasAccepted)} of {admissionNumber(ut.texasApplicants)} applicants ({admissionPercent(acceptanceRate(ut))}), and Texas A&amp;M accepted {admissionNumber(tamu.texasAccepted)} of {admissionNumber(tamu.texasApplicants)} ({admissionPercent(acceptanceRate(tamu))}). These percentages apply to <strong>Texas applicants in this report</strong>. They are not overall rates across all residency groups or predictions for an individual student.</p>
        <p><a href={texasAdmissions.sourceUrl}>Source: THECB admissions workbook, Fall 2025 tab, institution Total rows.</a></p>
      </section>
      <section className="state-home-section" id="compare-universities">
        <h2>Compare Texas public university admissions, 2017–2025</h2>
        <p>Choose an entering class, find a university, or sort by applicant volume or acceptance rate. The change column compares the same institution and applicant group with the preceding year.</p>
        <TexasAdmissionsTable institutions={institutions} years={years} />
      </section>
      <section className="state-home-section">
        <h2>How have rates changed at six major Texas universities?</h2>
        <p>Follow the same Texas-applicant measure across nine entering classes. Changes reflect the reported applicant pool and admission outcomes; this table does not isolate policy effects, major selectivity, or school quality.</p>
        <div className="article-table-wrap" tabIndex={0} role="region" aria-label="Texas acceptance-rate trends, scroll horizontally">
          <table className="article-table benchmark-table"><caption>Texas-applicant acceptance rates by entering fall</caption>
            <thead><tr><th scope="col">University</th>{years.map(year => <th scope="col" key={year}>{year}</th>)}</tr></thead>
            <tbody>{featured.map(item => <tr key={item.ficeCode}><th scope="row">{item.name}</th>{years.map(year => <td key={year}>{admissionPercent(acceptanceRate(item.years[year]))}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="state-home-section" id="data-years">
        <h2>Which Texas data was updated in 2026?</h2>
        <div className="article-table-wrap"><table className="article-table">
          <thead><tr><th scope="col">Report or policy</th><th scope="col">Release or review</th><th scope="col">What the year means</th></tr></thead>
          <tbody>
            <tr><td><a href={texasAdmissions.sourceUrl}>University applicants, acceptance and enrollment</a></td><td>July 14, 2026 release</td><td>Fall 2017–2025 entering classes; the comparison above.</td></tr>
            <tr><td><a href="/states/texas/high-schools">High-school college destinations</a></td><td>Official hub checked September 7, 2026</td><td>Latest campus file listed: 2023–2024 graduates enrolling in Fall 2024.</td></tr>
            <tr><td><a href="https://reportcenter.highered.texas.gov/reports/data/high-school-graduates-gpa-in-higher-education-2023-2024-xls/">First-year college GPA</a></td><td>February 19, 2026 release</td><td>2023–2024 graduates&apos; performance in FY 2025; already included on the high-school pages.</td></tr>
            <tr><td><a href="https://admissions.utexas.edu/apply/review-decision-process/">UT Austin automatic admission</a></td><td>Policy checked September 7, 2026</td><td>Top 5% for eligible Summer/Fall 2026–Spring 2027 applicants and Summer/Fall 2027–Spring 2028 applicants.</td></tr>
          </tbody>
        </table></div>
        <p>The new admissions workbook contains no Fall 2026 results. A report published in 2026 can describe an earlier class. The <a href="https://www.txhighereddata.org/high-school-graduates/hsgradsenrolled/">official high-school enrollment hub</a> still lists Fall 2024 as its latest campus cohort.</p>
        <p>For UT Austin, class rank is one part of eligibility, and automatic university admission does not guarantee a requested major. Use the <a href="https://catalog.utexas.edu/general-information/admission/undergraduate-admission/">current university catalog</a> for requirements. The workbook&apos;s historical “Top 10” category is not a statement of today&apos;s automatic-admission cutoff.</p>
      </section>
      <section className="state-home-section">
        <h2>Connect university admissions with your high school&apos;s destinations</h2>
        <p>University admission rates describe the people who applied. The school profiles answer a different question: where recent graduates enrolled. Use both views with their own reporting years and denominators.</p>
        <div className="state-home-module-grid">
          <div><h3><a href="/states/texas/high-schools">Find your Texas high school</a></h3><p>College-going trends, published destinations, and first-year GPA bands across 1,765 school profiles.</p></div>
          <div><h3><a href="/college/university-of-texas-at-austin/feeder-schools">UT Austin feeder schools</a></h3><p>Reported enrollment by high school and county, Fall 2019–2024.</p></div>
          <div><h3><a href="/college/texas-am-university/feeder-schools">Texas A&amp;M feeder schools</a></h3><p>Explore the schools sending graduates to Texas A&amp;M and compare their graduate shares.</p></div>
        </div>
      </section>
      <section className="state-home-section" id="methodology">
        <h2>Sources and methodology</h2>
        <p>We retain each university&apos;s “Total” row from the <a href={texasAdmissions.sourceUrl}>THECB 2017–2025 workbook</a>, joining years by its six-digit FICE institution identifier. Rates divide “Accepted (Total Texas)” by “Applied (Total Texas).” Counts retain source values; rates round to one decimal, and changes use unrounded rates. Statewide rows are kept separately in the <a href="/data/texas-admissions.json">downloadable data</a> and are not added to the university rows.</p>
        <p>The <a href="https://www.texaseducationinfo.org/infopage/tpeir_hed_admission.html">state admissions reporting documentation</a> describes completed applications. University news releases and Common Data Sets can use different populations and reporting definitions. For example, UT Austin&apos;s <a href="https://news.utexas.edu/2025/09/18/ut-sets-all-time-highs-for-enrollment-and-student-performance/">Fall 2025 news release</a> reports 90,690 freshman applications, while this THECB workbook lists {admissionNumber(ut.allApplicants)} in its all-applicant column. Those denominators should not be combined with the Texas accepted count.</p>
        <p>The workbook covers public universities; it does not provide admissions rates for private universities such as Rice, Baylor, SMU, or TCU. Its all-applicant counts lack matching all-applicant accepted totals, and its class-rank columns lack matching applicant denominators. We therefore do not derive overall, out-of-state, or non-automatic-admission rates. Source row numbers in the table refer to the selected “Fall YEAR” worksheet.</p>
      </section>
      <section className="state-home-section"><h2>Texas admissions FAQ</h2><div className="state-home-faq-grid">{faq.map(item => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</div></section>
    </div></main>
    <footer><p><a href="/states/texas">Texas data</a> · <a href="/insights">Insights</a> · <a href="/">UC admissions tool</a></p></footer>
  </>
}
