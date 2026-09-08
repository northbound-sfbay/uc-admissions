/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation preserves the site ad lifecycle. */
import type { Metadata } from 'next'
import { getTexasCollegeFeeders } from '@/lib/texas-feeders'
import { texasHighSchoolHref } from '@/lib/texas-outcomes'
import { admissionNumber as number, admissionPercent as percent } from '@/lib/texas-admissions'

const TITLE = 'Texas A&M Feeder Schools: High School Enrollment, 2019–2024'
const DESCRIPTION = 'See which Texas high schools send the most graduates to Texas A&M. Compare reported enrollment, share of graduates, and six years of official THECB destination data.'
const CANONICAL = 'https://collegeacceptance.info/college/texas-am-university/feeder-schools'
export const metadata: Metadata = {
  title: `${TITLE} | collegeacceptance.info`, description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: CANONICAL, type: 'website' },
}

export default function TexasAmFeederSchoolsPage() {
  const feeder = getTexasCollegeFeeders('003632')
  const top = feeder.schools[0]
  const max = Math.max(...feeder.trend.map(row => row.students))
  const faq = [
    { question: 'What does a Texas A&M feeder school mean here?', answer: 'A Texas public high school with a separately published count of graduates enrolling at Texas A&M University, FICE 003632. The label does not imply a formal relationship or an admissions preference.' },
    { question: 'Are these Texas A&M acceptance rates by high school?', answer: 'No. THECB’s destination reports record enrollment. They do not contain high-school applicant or accepted counts. The share of graduates is enrolled students divided by all graduates, not an acceptance rate.' },
    { question: 'Does this include every Texas A&M campus?', answer: 'No. These totals use only the Texas A&M University destination identified by FICE 003632. Galveston and other A&M institutions have separate source identifiers and are excluded.' },
    { question: 'Is there a 2026 feeder-school dataset?', answer: 'The official high-school destination hub checked September 7, 2026 lists Fall 2024 as its latest campus-level cohort. The university admissions report released July 2026 covers Fall 2025 and uses a different population.' },
  ]
  const structured = [
    { '@context': 'https://schema.org', '@type': 'Dataset', name: TITLE, description: DESCRIPTION, url: CANONICAL, temporalCoverage: '2019/2024', citation: feeder.dataset.sourceUrl, creator: { '@type': 'Organization', name: 'collegeacceptance.info' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Texas', item: 'https://collegeacceptance.info/states/texas' }, { '@type': 'ListItem', position: 2, name: 'Texas A&M feeder schools', item: CANONICAL }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
  ]
  return <>
    {structured.map((value, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }} />)}
    <header className="state-home-header">
      <nav className="state-home-nav" aria-label="Primary navigation"><a className="state-home-brand" href="/">collegeacceptance.info</a><div className="state-home-nav-links"><a href="/states/texas">Texas</a><a href="/states/texas/high-schools">High schools</a><a href="/states/texas/college-acceptance-rates">Acceptance rates</a><a href="/insights">Insights</a></div></nav>
      <div className="state-home-hero texas-detail-hero"><div className="state-home-hero-copy">
        <p className="state-home-kicker">Texas A&amp;M enrollment data · Reviewed September 7, 2026</p>
        <h1>Texas A&amp;M feeder schools, 2019–2024</h1>
        <p>Explore Texas public high schools by the number of graduates reported as enrolling at Texas A&amp;M University. See the leading schools, their graduate shares, and six years of enrollment trends.</p>
        <div className="state-home-actions"><a className="report-entry-link primary" href="#top-feeders">See top schools</a><a className="report-entry-link" href="/college/university-of-texas-at-austin/feeder-schools">Compare UT Austin feeders</a></div>
      </div><div className="state-home-proof"><div className="state-home-proof-item"><strong>{number(feeder.total)}</strong><span>separately reported enrollees in {feeder.year}</span></div><div className="state-home-proof-item"><strong>{number(feeder.schools.length)}</strong><span>high schools with a named Texas A&amp;M row</span></div></div></div>
    </header>
    <main className="state-home-shell"><div className="state-home-band texas-detail-band">
      <section className="state-home-section answer-block"><h2>Which high school sends the most students to Texas A&amp;M?</h2>
        <p>In the Fall {feeder.year} campus file, <a href={texasHighSchoolHref(top.school)}>{top.school.schoolName}</a> in {top.school.district} had the largest separately published Texas A&amp;M enrollment: <strong>{number(top.students)} graduates</strong>, or {percent(top.share)} of its {number(top.graduates)} graduates. School size affects the count; the graduate share provides additional context. Neither measure is an admissions probability.</p>
        <p><a href={feeder.dataset.sourceUrl}>Source: THECB high-school enrollment destination files.</a></p>
      </section>
      <section className="state-home-section"><h2>Reported enrollment by graduating class</h2><p>Each total sums named Texas A&amp;M rows from reporting high schools. Counts grouped into “Other” destinations cannot be assigned to a particular university.</p>
        <div className="texas-trend-list" aria-label="Reported Texas A&M enrollment trend">{feeder.trend.map(row => <div className="texas-trend-row" key={row.year}><strong>{row.year}</strong><div className="texas-trend-track" aria-hidden="true"><span style={{ width: `${row.students / max * 100}%` }} /></div><span>{number(row.students)} students</span><small>{row.schools} schools</small></div>)}</div>
      </section>
      <section className="state-home-section" id="top-feeders"><h2>Top 75 Texas high schools by Texas A&amp;M enrollment</h2><p>Ranked by separately reported enrollees in {feeder.year}, with alphabetical ordering for equal counts. Open a school to see all of its reported college destinations, college-going trends, and GPA bands.</p>
        <div className="article-table-wrap" tabIndex={0} role="region" aria-label="Texas A&M feeder rankings, scroll horizontally"><table className="article-table benchmark-table"><caption>Fall {feeder.year} enrollment at Texas A&amp;M University, FICE 003632</caption><thead><tr><th scope="col">High school</th><th scope="col">County</th><th scope="col">Graduates</th><th scope="col">Texas A&amp;M enrollees</th><th scope="col">Share of graduates</th></tr></thead><tbody>{feeder.schools.slice(0, 75).map(row => <tr key={row.school.campusCode}><th scope="row"><a href={texasHighSchoolHref(row.school)}>{row.school.schoolName}</a><small className="texas-table-sub">{row.school.district}</small></th><td>{row.school.county}</td><td>{number(row.graduates)}</td><td>{number(row.students)}</td><td>{percent(row.share)}</td></tr>)}</tbody></table></div>
        <p><a href="/states/texas/high-schools">Browse all Texas high-school profiles</a> for schools beyond this top 75.</p>
      </section>
      <section className="state-home-section"><h2>Looking for Texas A&amp;M&apos;s acceptance rate?</h2><p>The <a href="/states/texas/college-acceptance-rates">Texas public university admissions comparison</a> contains Fall 2025 Texas-applicant and acceptance counts released by THECB in July 2026. It uses university-level admission records, while this page uses high-school enrollment destinations through Fall 2024. Those populations and years should remain separate.</p></section>
      <section className="state-home-section"><h2>Methodology and coverage</h2><p>We join annual 2019–2024 campus files by nine-digit high-school campus code and select named destinations with the six-digit FICE code 003632. The university&apos;s Galveston destination and other A&amp;M system institutions have different codes. Each graduate share divides the named destination count by all graduates at that high school.</p><p>The source covers public high schools with more than 25 graduates. Destination counts below five are grouped into “Other” rows. An absent school or named destination does not prove zero enrollment. These totals exclude suppressed destinations, private high schools, and out-of-state schools, and should not be interpreted as the full university freshman class. The source hub was checked September 7, 2026; Fall 2024 remains its latest listed campus cohort.</p></section>
      <section className="state-home-section"><h2>Texas A&amp;M feeder-school FAQ</h2><div className="state-home-faq-grid">{faq.map(item => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</div></section>
    </div></main><footer><p><a href="/states/texas">Texas outcomes</a> · <a href="/college/university-of-texas-at-austin/feeder-schools">UT Austin feeders</a> · <a href="/states/texas/college-acceptance-rates">Texas acceptance rates</a></p></footer>
  </>
}
