import type { Metadata } from 'next'
import InteractiveToolLoader from '@/components/InteractiveToolLoader'
import SiteFooter from '@/components/SiteFooter'
import RelatedDataStories from '@/components/RelatedDataStories'

export const metadata: Metadata = {
  title: 'UC Acceptance Rates by High School | UC Admissions Data',
  description: 'Find UC acceptance rates by high school using Fall 2025 results. Compare school outcomes and view preliminary Fall 2026 UC campus acceptance rates.',
  alternates: { canonical: 'https://collegeacceptance.info' },
  openGraph: {
    title: 'UC Acceptance Rates by High School | UC Admissions Data',
    description: 'Find UC acceptance rates by high school using Fall 2025 results. Compare school outcomes and view preliminary Fall 2026 UC campus acceptance rates.',
    url: 'https://collegeacceptance.info',
    type: 'website',
    images: [{ url: 'https://collegeacceptance.info/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UC Acceptance Rates by High School | UC Admissions Data',
    description: 'Find UC acceptance rates by high school using Fall 2025 results. Compare school outcomes and view preliminary Fall 2026 UC campus acceptance rates.',
    images: ['https://collegeacceptance.info/og-image.png'],
  },
}

export default function Home() {
  return (
    <>
      <header><div className="header-inner"><h1>UC admissions by high school</h1><p className="subtitle">Official source-school outcomes · Fall 1994–2025</p></div></header>
      <main className="lookup-main">
        <p className="lookup-intro">Search your high school’s UC applicants, admits and enrollment, then compare campus results.</p>
        <p className="data-freshness-note">
          <strong>Latest school-level data: Fall 2025.</strong>{' '}
          Next UC update expected February 2027, based on UC’s{' '}
          <a href="https://www.universityofcalifornia.edu/about-uc/information-center/dashboard-update-schedule" target="_blank" rel="noopener noreferrer">published update schedule</a>.
          {' '}Timing may change.
        </p>
        <nav className="lookup-paths" aria-label="Choose your admissions data" data-navigation-source="home_data_paths">
          <a href="#school-tool" className="school-profile-action">Find your high school ↓</a>
          <a href="/insights/uc-acceptance-rates-2026">See preliminary 2026 UC campus acceptance rates →</a>
          <a href="/insights/uc-admission-rates-by-high-school#data-year">Why school results use Fall 2025</a>
        </nav>
        <InteractiveToolLoader />
        <RelatedDataStories all />
        <section className="seo-intro">
          <h2>Understand your school’s UC outcomes</h2>
          <p>Explore applicants, admits, enrollment, and admit rates across all nine undergraduate UC campuses. Start with your high school, then compare campus and year patterns. The <a href="/insights/uc-admissions-by-source-school">source-school guide</a> explains the calculations and their limits.</p>
          <nav className="discovery-links" aria-label="Admissions guides"><a href="/uc-admission-rates">UC campus admission-rate benchmarks</a><a href="/insights/uc-gpa-by-high-school">Understand UC GPA data</a><a href="/counselors">Counselor resources</a></nav>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
