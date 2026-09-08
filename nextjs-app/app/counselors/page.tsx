import type { Metadata } from 'next'
import SchoolFinder from '@/components/SchoolFinder'
import SiteFooter from '@/components/SiteFooter'
import RelatedDataStories from '@/components/RelatedDataStories'

export const metadata: Metadata = { title: 'UC Admissions Resources for School Counselors', description: 'Use official UC source-school outcomes in counseling conversations: school lookup, campus comparisons, GPA context, and clear limits on interpretation.', alternates: { canonical: 'https://collegeacceptance.info/counselors' } }

export default function CounselorsPage() {
  return <><header><div className="header-inner"><a href="/">UC admissions by high school</a></div></header><main className="article-shell"><article className="article-card">
    <h1>UC admissions resources for school counselors</h1>
    <p className="article-deck">Help families explore their school’s UC outcomes with context. The source-school records cover Fall 1994–2025.</p>
    <section><h2>Start with a school</h2><SchoolFinder source="counselor_resources" /><p>A school profile brings together applicants, admits, enrollment, campus breakdowns, and recent trends. Use the comparison links to examine nearby schools and changes over time.</p></section>
    <section><h2>A three-step conversation</h2><ol className="article-steps">
      <li><strong>Choose a campus and a year.</strong> Compare the same campus and year for each school. Adding campus application counts together can count a student more than once.</li>
      <li><strong>Read the counts alongside the rate.</strong> A small applicant group can produce large year-to-year changes. Missing or suppressed values are not zero.</li>
      <li><strong>Separate admission from enrollment.</strong> An admit rate is admits divided by applicants. Yield is enrollees divided by admits. Neither establishes that attending a particular school causes a better individual outcome.</li>
    </ol></section>
    <RelatedDataStories all />
    <section><h2>Useful pages to share</h2><nav className="discovery-links" data-navigation-source="counselor_resources"><a href="/">School lookup and shareable comparisons</a><a href="/feeder-schools/ucla">UCLA feeder patterns</a><a href="/feeder-schools/uc-davis">UC Davis feeder patterns</a><a href="/insights/uc-gpa-by-high-school">Reading GPA profiles</a><a href="/insights/uc-admissions-by-source-school">Sources and methodology</a></nav></section>
    <section><h2>Use the appropriate data year</h2><p>The <a href="/insights/uc-acceptance-rates-2026">preliminary Fall 2026 campus results</a> describe a different release from the finalized source-school data. Keep campus-wide results and school-level outcomes distinct.</p><p>Original source: <a href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school">University of California Information Center</a>. This website is an independent presentation of public data and is not affiliated with the University of California.</p></section>
  </article></main><SiteFooter /></>
}
