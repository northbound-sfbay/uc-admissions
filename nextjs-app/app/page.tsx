import type { Metadata } from 'next'
import InteractiveToolLoader from '@/components/InteractiveToolLoader'
import SiteFooter from '@/components/SiteFooter'
import RelatedDataStories from '@/components/RelatedDataStories'

export const metadata: Metadata = {
  title: 'UC Acceptance Rates by High School | UC Admissions Data',
  description: 'Search UC acceptance rates and admissions trends by high school, with admit rates, applicants, admits, and enrollment data from Fall 1994 through Fall 2025.',
  alternates: { canonical: 'https://collegeacceptance.info' },
  openGraph: {
    title: 'UC Acceptance Rates by High School | UC Admissions Data',
    description: 'Search UC acceptance rates and admissions trends by high school, with admit rates, applicants, admits, and enrollment data from Fall 1994 through Fall 2025.',
    url: 'https://collegeacceptance.info',
    type: 'website',
    images: [{ url: 'https://collegeacceptance.info/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UC Acceptance Rates by High School | UC Admissions Data',
    description: 'Search UC acceptance rates and admissions trends by high school, with admit rates, applicants, admits, and enrollment data from Fall 1994 through Fall 2025.',
    images: ['https://collegeacceptance.info/og-image.png'],
  },
}

export default function Home() {
  return (
    <>
      <header><div className="header-inner"><h1>UC admissions by high school</h1><p className="subtitle">Official source-school outcomes · Fall 1994–2025</p></div></header>
      <main className="lookup-main">
        <p className="lookup-intro">Find your school, explore UC campus results, and compare admissions trends.</p>
        <p className="data-freshness-note">
          <strong>Latest school-level data: Fall 2025.</strong>{' '}
          Next UC update expected February 2027, based on UC’s{' '}
          <a href="https://www.universityofcalifornia.edu/about-uc/information-center/dashboard-update-schedule" target="_blank" rel="noopener noreferrer">published update schedule</a>.
          {' '}Timing may change.
        </p>
        <InteractiveToolLoader />
        <section className="compact-update" data-navigation-source="home_update">
          <h2>Looking for Fall 2026 campus results?</h2>
          <p>The new preliminary campus totals are available. School-specific outcomes above remain finalized through Fall 2025.</p>
          <a href="/insights/uc-acceptance-rates-2026">See 2026 acceptance rates for every UC campus →</a>
          <p><a href="/insights/uc-admission-rates-by-high-school#data-year">Why school-level results still use Fall 2025</a></p>
        </section>
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
