import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | UC Admissions by California High School | collegeacceptance.info',
  description:
    'Learn about collegeacceptance.info — a free tool that makes 30 years of UC admissions data accessible and digestible for California students and families.',
  alternates: { canonical: 'https://collegeacceptance.info/about' },
}

export default function AboutPage() {
  return (
    <>
      <header>
        <div className="header-inner">
          <h1>UC Admissions by California High School</h1>
          <p className="subtitle">Fall 1994 – 2025 · Applicants, Admits &amp; Enrollees by school, campus, and ethnicity</p>
        </div>
      </header>

      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About This Site</h2>

        <p style={{ marginBottom: '1.25rem', lineHeight: '1.7' }}>
          The University of California publishes detailed admissions data — applicants, admits, and
          enrollees by high school, campus, and ethnicity — going back to 1994. But the official
          source is a Tableau dashboard that can be difficult to navigate, slow to load, and hard to
          compare across years or schools.
        </p>

        <p style={{ marginBottom: '1.25rem', lineHeight: '1.7' }}>
          <strong>collegeacceptance.info</strong> was built to make that data more accessible. The
          goal is simple: give students, parents, and counselors a fast, intuitive way to explore
          UC admissions trends for any California high school — without needing to know how to use
          Tableau.
        </p>

        <h3 style={{ fontSize: '1.15rem', marginTop: '2rem', marginBottom: '0.75rem' }}>What you can do here</h3>
        <ul style={{ lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>
          <li>Look up any California high school and see its UC admissions history from 1994 to 2025</li>
          <li>Filter by UC campus — Berkeley, UCLA, San Diego, Davis, and more</li>
          <li>Break down applicants, admits, and enrollees by ethnicity</li>
          <li>Compare multiple schools side by side on a single chart</li>
          <li>Explore schools geographically on an interactive map</li>
        </ul>

        <h3 style={{ fontSize: '1.15rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Data source</h3>
        <p style={{ marginBottom: '1.25rem', lineHeight: '1.7' }}>
          All data comes directly from the{' '}
          <a
            href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
            target="_blank"
            rel="noopener"
          >
            UC Information Center
          </a>
          , the official public data repository maintained by the University of California Office of
          the President. This site does not modify the underlying numbers — it simply reorganizes
          and visualizes them in a more digestible format.
        </p>

        <h3 style={{ fontSize: '1.15rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Coverage</h3>
        <ul style={{ lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <li>Over 2,500 California high schools</li>
          <li>31 years of data: Fall 1994 through Fall 2025</li>
          <li>All nine undergraduate UC campuses</li>
          <li>Ethnicity breakdowns per school, per year, per campus</li>
        </ul>

        <p>
          <Link href="/" style={{ color: '#2563eb' }}>← Back to the tool</Link>
        </p>
      </main>

      <footer>
        <p>Data: <a href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school" target="_blank" rel="noopener">UC Information Center</a> · School locations: California Dept. of Education &amp; OpenStreetMap contributors · Map: © CARTO</p>
      </footer>
    </>
  )
}
