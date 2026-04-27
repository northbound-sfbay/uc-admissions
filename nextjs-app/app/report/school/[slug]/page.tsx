import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReportPreviewAnalytics from '@/components/ReportPreviewAnalytics'
import { readSchoolById, idFromSlug, recentYear } from '@/lib/data'
import { titleCase, fmt, pct } from '@/lib/utils'
import type { School, YearData } from '@/lib/types'

const FOCUS_CAMPUSES = ['Los Angeles', 'Berkeley', 'San Diego', 'Davis']

export const metadata: Metadata = {
  title: 'UC Admissions Report Preview | collegeacceptance.info',
  description: 'Preview a paid UC admissions trend report for a high school.',
}

function yearData(school: School, year: string | null): YearData | null {
  return year ? school.years[year] ?? null : null
}

function trendDelta(school: School, field: 'app' | 'adm') {
  const years = Object.keys(school.years).sort()
  const recent = years.at(-1)
  const previous = years.findLast(year => year !== recent && (school.years[year]?.[field] ?? 0) > 0)
  if (!recent || !previous) return null

  const recentValue = school.years[recent]?.[field] ?? null
  const previousValue = school.years[previous]?.[field] ?? null
  if (!recentValue || !previousValue) return null

  return {
    fromYear: previous,
    toYear: recent,
    value: (recentValue - previousValue) / previousValue,
  }
}

function campusRows(data: YearData | null) {
  return FOCUS_CAMPUSES.map(campus => {
    const row = data?.by_campus?.[campus]
    return {
      campus: campus === 'Los Angeles' ? 'UCLA' : `UC ${campus}`,
      app: row?.app ?? null,
      adm: row?.adm ?? null,
      admitRate: row?.admit_rate ?? null,
    }
  })
}

export default async function SchoolReportPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const school = readSchoolById(idFromSlug(slug))
  if (!school) notFound()

  const name = titleCase(school.school_name)
  const yr = recentYear(school)
  const data = yearData(school, yr)
  const applicantTrend = trendDelta(school, 'app')
  const admitTrend = trendDelta(school, 'adm')

  return (
    <>
      <ReportPreviewAnalytics
        params={{
          report_type: 'single_school',
          price: 19,
          school_slug: slug,
          school_name: name,
          county: school.county,
        }}
      />

      <header>
        <div className="header-inner">
          <Link href={`/school/${slug}`} className="text-sm text-blue-200 hover:text-white">
            ← Back to {name}
          </Link>
        </div>
      </header>

      <main className="report-page">
        <section className="report-hero">
          <div>
            <div className="ctrl-label">Report Preview</div>
            <h1>{name} UC Admissions Trend Report</h1>
            <p>
              A paid high school report for families comparing UC admissions trends, campus mix,
              and recent momentum for {name}.
            </p>
          </div>
          <div className="report-price-card">
            <span className="report-price">$19</span>
            <span className="report-price-sub">Single high school report</span>
          </div>
        </section>

        <section className="report-grid">
          <div className="report-panel">
            <div className="ctrl-label">Latest Snapshot</div>
            <h2>Fall {yr ?? '2025'} summary</h2>
            <div className="report-stat-grid">
              <div>
                <span>Applicants</span>
                <strong>{fmt(data?.app)}</strong>
              </div>
              <div>
                <span>Admits</span>
                <strong>{fmt(data?.adm)}</strong>
              </div>
              <div>
                <span>Enrolled</span>
                <strong>{fmt(data?.enr)}</strong>
              </div>
              <div>
                <span>Admit Rate</span>
                <strong>{pct(data?.admit_rate)}</strong>
              </div>
            </div>
          </div>

          <div className="report-panel">
            <div className="ctrl-label">Momentum</div>
            <h2>Trend signals</h2>
            <div className="report-insight-list">
              <p>
                Applicants:{' '}
                <strong>
                  {applicantTrend ? pct(applicantTrend.value) : 'Preview in full report'}
                </strong>
                {applicantTrend && ` from ${applicantTrend.fromYear} to ${applicantTrend.toYear}`}
              </p>
              <p>
                Admits:{' '}
                <strong>
                  {admitTrend ? pct(admitTrend.value) : 'Preview in full report'}
                </strong>
                {admitTrend && ` from ${admitTrend.fromYear} to ${admitTrend.toYear}`}
              </p>
              <p>Full report adds 10-year context, county rank, and comparable-school benchmarks.</p>
            </div>
          </div>
        </section>

        <section className="report-panel">
          <div className="ctrl-label">Campus Preview</div>
          <h2>Major UC campus breakdown</h2>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>Applicants</th>
                  <th>Admits</th>
                  <th>Admit Rate</th>
                </tr>
              </thead>
              <tbody>
                {campusRows(data).map(row => (
                  <tr key={row.campus}>
                    <td>{row.campus}</td>
                    <td>{fmt(row.app)}</td>
                    <td>{fmt(row.adm)}</td>
                    <td>{pct(row.admitRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-panel report-lock-panel">
          <div>
            <div className="ctrl-label">Full Report</div>
            <h2>Included in the paid version</h2>
          </div>
          <div className="report-lock-grid">
            <span>10-year trend interpretation</span>
            <span>County ranking and peer context</span>
            <span>UCLA, Berkeley, UCSD, Davis focus notes</span>
            <span>Comparable high school benchmarks</span>
            <span>PDF-ready summary for family discussion</span>
            <span>Data caveats and interpretation guidance</span>
          </div>
        </section>
      </main>
    </>
  )
}
