import type { Metadata } from 'next'
import InteractiveToolLoader from '@/components/InteractiveToolLoader'

export const metadata: Metadata = {
  title: 'UC Admissions by High School | California UC Acceptance Rates 1994–2025',
  description: 'Look up UC admissions data for any California high school — applicants, admits, enrollees, and acceptance rates by year, campus, and ethnicity from 1994 to 2025.',
  alternates: { canonical: 'https://collegeacceptance.info' },
  openGraph: {
    title: 'UC Admissions by High School | California UC Acceptance Rates 1994–2025',
    description: 'Look up UC admissions data for any California high school — applicants, admits, enrollees, and acceptance rates by year, campus, and ethnicity from 1994 to 2025.',
    url: 'https://collegeacceptance.info',
    type: 'website',
    images: [{ url: 'https://collegeacceptance.info/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UC Admissions by High School | California UC Acceptance Rates 1994–2025',
    description: 'Look up UC admissions data for any California high school — applicants, admits, enrollees, and acceptance rates by year, campus, and ethnicity from 1994 to 2025.',
    images: ['https://collegeacceptance.info/og-image.png'],
  },
}

export default function Home() {
  return <InteractiveToolLoader />
}
