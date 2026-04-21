import type { Metadata } from 'next'
import InteractiveToolLoader from '@/components/InteractiveToolLoader'

export const metadata: Metadata = {
  title: 'UC Admissions by California High School | Interactive Trends & Charts',
  description: 'Explore UC admissions trends for California high schools with interactive charts, admit rates, applicants, and enrollment data from Fall 1994 to Fall 2025.',
  alternates: { canonical: 'https://collegeacceptance.info' },
  openGraph: {
    title: 'UC Admissions by California High School | Interactive Trends & Charts',
    description: 'Explore UC admissions trends for California high schools with interactive charts, admit rates, applicants, and enrollment data from Fall 1994 to Fall 2025.',
    url: 'https://collegeacceptance.info',
    type: 'website',
    images: [{ url: 'https://collegeacceptance.info/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UC Admissions by California High School | Interactive Trends & Charts',
    description: 'Explore UC admissions trends for California high schools with interactive charts, admit rates, applicants, and enrollment data from Fall 1994 to Fall 2025.',
    images: ['https://collegeacceptance.info/og-image.png'],
  },
}

export default function Home() {
  return <InteractiveToolLoader />
}
