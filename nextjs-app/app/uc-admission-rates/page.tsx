import type { Metadata } from 'next'
import InteractiveToolLoader from '@/components/InteractiveToolLoader'

export const metadata: Metadata = {
  title: 'UC Admission Rates by High School | Interactive UC Trends',
  description:
    'Look up UC admission rates and acceptance-rate trends by California high school, UC campus, year, and ethnicity from Fall 1994 through Fall 2025.',
  alternates: { canonical: 'https://collegeacceptance.info/uc-admission-rates' },
  openGraph: {
    title: 'UC Admission Rates by High School | Interactive UC Trends',
    description:
      'Search UC admission rates by high school and compare applicants, admits, enrollment, and campus trends from Fall 1994 through Fall 2025.',
    url: 'https://collegeacceptance.info/uc-admission-rates',
    type: 'website',
    images: [{ url: 'https://collegeacceptance.info/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UC Admission Rates by High School',
    description:
      'Interactive UC admission-rate lookup by high school, campus, year, and ethnicity.',
    images: ['https://collegeacceptance.info/og-image.png'],
  },
}

export default function UcAdmissionRatesPage() {
  return <InteractiveToolLoader variant="uc-rates" />
}
