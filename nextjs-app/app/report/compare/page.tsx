import type { Metadata } from 'next'
import Link from 'next/link'
import ReportPreviewAnalytics from '@/components/ReportPreviewAnalytics'
import { readSchoolById, recentYear } from '@/lib/data'
import { titleCase, fmt, pct, makeSlug } from '@/lib/utils'
import type { School } from '@/lib/types'

export const metadata: Metadata = {
  title: 'UC Admissions Comparison Report Preview | collegeacceptance.info',
  description: 'Preview a paid UC admissions comparison report for up to three high schools.',
}

function parseSchools(value: string | undefined): School[] {
  if (!value) return []
  return value
    .split(',')
    .map(id => readSchoolById(id.trim()))
    .filter((school): school is School => school !== null)
    .slice(0, 3)
}

function latestRow(school: School) {
  const year = recentYear(school)
  const data = year ? school.years[year] : null
  return { year, data }
}

export default async function ComparisonReportPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ schools?: string; campus?: string; ethnicity?: string }>
}) {
  const query = await searchParams
  const schools = parseSchools(query.schools)
  const campus = query.campus && query.campus !== 'universitywide' ? query.campus : 'Universitywide'
  const ethnicity = query.ethnicity && query.ethnicity !== 'all' ? query.ethnicity : 'All students'
  const reportTitle = schools.length
    ? schools.map(school => titleCase(school.school_name)).join(' vs ')
    : 'High School UC Admissions Comparison'

  return (
    <>
      <ReportPreviewAnalytics
        params={{
          report_type: 'comparison',
          price: 39,
          school_count: schools.length,
          campus,
          ethnicity,
        }}
      />

      <header>
        <div className="header-inner">
          <Link href="/" className="text-sm text-blue-200 hover:text-white">
            ← Back to UC Admissions by High School
          </Link>
        </div>
      </header>

      <main className="report-page">
        <section className="report-hero">
          <div>
            <div className="ctrl-label">Comparison Report Preview</div>
            <h1>{reportTitle}</h1>
            <p>
              A paid comparison report for families weighing UC admissions patterns across up to
              three high schools. Current focus: {campus} · {ethnicity}.
            </p>
          </div>
          <div className="report-price-card">
            <span className="report-price">$39</span>
            <span className="report-price-sub">Up to 3 high schools</span>
          </div>
        </section>

        {!schools.length && (
          <section className="report-panel">
            <h2>Select schools to preview a comparison</h2>
            <p className="report-muted">
              Add schools in the comparison tool, then open the report preview from the report panel.
            </p>
            <Link href="/" className="county-entry-link">
              Open comparison tool →
            </Link>
          </section>
        )}

        {!!schools.length && (
          <>
            <section className="report-panel">
              <div className="ctrl-label">Latest Snapshot</div>
              <h2>Side-by-side UC outcomes</h2>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>High School</th>
                      <th>Year</th>
                      <th>Applicants</th>
                      <th>Admits</th>
                      <th>Admit Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map(school => {
                      const row = latestRow(school)
                      return (
                        <tr key={school.school_id}>
                          <td>
                            <Link href={`/school/${makeSlug(school.school_id, school.school_name)}`}>
                              {titleCase(school.school_name)}
                            </Link>
                          </td>
                          <td>{row.year ?? '—'}</td>
                          <td>{fmt(row.data?.app)}</td>
                          <td>{fmt(row.data?.adm)}</td>
                          <td>{pct(row.data?.admit_rate)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="report-grid">
              {schools.map(school => {
                const row = latestRow(school)
                return (
                  <div key={school.school_id} className="report-panel">
                    <div className="ctrl-label">{school.city}, {school.county}</div>
                    <h2>{titleCase(school.school_name)}</h2>
                    <div className="report-insight-list">
                      <p>
                        Latest universitywide admit rate:{' '}
                        <strong>{pct(row.data?.admit_rate)}</strong>
                      </p>
                      <p>
                        Latest applicant volume:{' '}
                        <strong>{fmt(row.data?.app)}</strong>
                      </p>
                      <p>
                        Full report adds campus-specific comparisons, trend deltas, and peer
                        context across the selected schools.
                      </p>
                    </div>
                  </div>
                )
              })}
            </section>
          </>
        )}

        <section className="report-panel report-lock-panel">
          <div>
            <div className="ctrl-label">Full Report</div>
            <h2>Included in the paid comparison</h2>
          </div>
          <div className="report-lock-grid">
            <span>Side-by-side 10-year trend tables</span>
            <span>Campus-by-campus comparison</span>
            <span>Applicant, admit, and enrollment momentum</span>
            <span>Strongest UC campus fit by school</span>
            <span>PDF-ready summary for family discussion</span>
            <span>Interpretation notes and data caveats</span>
          </div>
        </section>
      </main>
    </>
  )
}
