import type { Metadata } from 'next'
import CampusRateBenchmark from '@/components/CampusRateBenchmark'
import SchoolFinder from '@/components/SchoolFinder'
import SiteFooter from '@/components/SiteFooter'
import { FEEDER_CAMPUSES } from '@/lib/feeder-options'

export const metadata: Metadata = {
  title: 'UC Admission Rates by Campus | School-Level Context',
  description: 'Compare UC campus admission-rate benchmarks from Fall 2025 California source-school records, then find your high school and explore feeder rankings.',
  alternates: { canonical: 'https://collegeacceptance.info/uc-admission-rates' },
  openGraph: { title: 'UC Admission Rates by Campus | School-Level Context', description: 'UC campus benchmarks, high-school outcomes, and how to read the differences.', url: 'https://collegeacceptance.info/uc-admission-rates', type: 'website' },
}

export default function UcAdmissionRatesPage() {
  return <>
    <header><div className="header-inner"><a href="/">UC admissions by high school</a></div></header>
    <main>
      <section className="next-steps">
        <h1>UC admission rates by campus</h1>
        <p>Campus averages give you a starting point. The benchmarks below summarize Fall 2025 California public and private high-school records; they are not the all-residency campus acceptance rates or an individual admissions prediction.</p>
        <a href="/insights/uc-acceptance-rates-2026">Looking for the preliminary Fall 2026 campus results? →</a>
      </section>
      <CampusRateBenchmark />
      <section className="next-steps"><h2>How does your school compare?</h2><SchoolFinder source="campus_benchmarks" /></section>
      <nav className="next-steps discovery-links" aria-label="UC campus feeder rankings" data-navigation-source="campus_benchmarks">
        {FEEDER_CAMPUSES.map(campus => <a key={campus.slug} href={`/feeder-schools/${campus.slug}`}>{campus.label} feeder schools</a>)}
      </nav>
      <section className="next-steps"><h2>Read acceptance rates in context</h2>
        <p>Admit rate is admits divided by applicants. A universitywide total can count the same student at several campuses. School-level results vary with applicant pools, campus choices, and years; they cannot tell you whether attending a particular school causes better outcomes.</p>
        <nav className="discovery-links"><a href="/insights/uc-admissions-by-source-school">Source and methodology</a><a href="/insights/uc-gpa-by-high-school">GPA context</a><a href="/">Compare schools in the interactive tool</a></nav>
      </section>
    </main><SiteFooter />
  </>
}
