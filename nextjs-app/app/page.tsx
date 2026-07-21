import type { Metadata } from 'next'
import InteractiveToolLoader from '@/components/InteractiveToolLoader'
import SiteFooter from '@/components/SiteFooter'

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
      <InteractiveToolLoader />
      <SiteFooter />
    </>
  )
}
