import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { feederSchoolHref, getFeederData, getFeederSlugs } from '@/lib/feeder'

export const revalidate = 86400

function fmtNumber(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString()
}

function fmtPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function StatPanel({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="chart-panel" style={{ height: 'auto' }}>
      <div className="panel-controls" style={{ gap: '6px' }}>
        <div className="ctrl-label">{label}</div>
        <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{detail}</div>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return getFeederSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const feederData = getFeederData(slug)
  if (!feederData) return {}

  const title = `Top feeder schools to ${feederData.campusLabel} | collegeacceptance.info`
  const description = `See which California high schools sent the most applicants, admits, and enrollees to ${feederData.campusLabel} in Fall ${feederData.displayYear}.`

  return {
    title,
    description,
    alternates: { canonical: `https://collegeacceptance.info/feeder-schools/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://collegeacceptance.info/feeder-schools/${slug}`,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  }
}

export default async function FeederPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const feederData = getFeederData(slug)
  if (!feederData) notFound()

  return (
    <>
      <header>
        <div className="header-inner">
          <Link href="/" className="text-sm text-blue-200 hover:text-white">
            ← UC Admissions by High School
          </Link>
        </div>
      </header>

      <main>
        <section className="seo-intro" aria-label="About this feeder page">
          <p>
            This page summarizes <strong>{feederData.campusLabel} feeder-school admissions in Fall {feederData.displayYear}</strong>,
            ranks the California high schools sending the most admits to {feederData.campusLabel}, and highlights
            counties and schools with the strongest recent results.
          </p>
        </section>

        <div className="notes-bar">
          <div className="notes-title">{feederData.campusLabel} feeder page</div>
          <ul>
            <li>Applicants, admits, and enrollees here are specific to {feederData.campusLabel}, not universitywide totals.</li>
            <li>Campus-level rankings use the latest year with available campus breakdowns in the dataset.</li>
            <li>Each school listed here links directly to its detailed admissions page.</li>
          </ul>
        </div>

        <section className="charts-row" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <StatPanel
            label={`${feederData.campusLabel} Applicants`}
            value={fmtNumber(feederData.totals.app)}
            detail={`Total applicants to ${feederData.campusLabel} in Fall ${feederData.displayYear}`}
          />
          <StatPanel
            label={`${feederData.campusLabel} Admits`}
            value={fmtNumber(feederData.totals.adm)}
            detail={`Total admits to ${feederData.campusLabel} in Fall ${feederData.displayYear}`}
          />
          <StatPanel
            label={`${feederData.campusLabel} Enrolled`}
            value={fmtNumber(feederData.totals.enr)}
            detail={`Total enrollees at ${feederData.campusLabel} in Fall ${feederData.displayYear}`}
          />
          <StatPanel
            label="Avg Admit Rate"
            value={fmtPercent(feederData.weightedAdmitRate)}
            detail={`Weighted ${feederData.campusLabel} admit rate in Fall ${feederData.displayYear}`}
          />
        </section>

        <section className="charts-row" style={{ alignItems: 'start' }}>
          <div className="chart-panel" style={{ height: '760px' }}>
            <div className="panel-controls">
              <div className="ctrl-label">{feederData.campusLabel}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                Highest-volume feeder schools
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--text-muted)', maxWidth: '58ch' }}>
                Ranked by admitted students to {feederData.campusLabel} in Fall {feederData.displayYear}, with
                applicants and enrollment shown alongside.
              </div>
            </div>

            <div className="panel-body" style={{ paddingTop: '14px', gap: '12px', overflowY: 'auto' }}>
              {feederData.topSchools.map((school, index) => (
                <div
                  key={school.school_id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
                    <div>
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>{`Rank ${index + 1}`}</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--uc-blue)' }}>
                        <Link href={feederSchoolHref(school.school_id, school.school_name)} style={{ color: 'var(--uc-blue)' }}>
                          {school.school_name}
                        </Link>
                      </div>
                      <div className="chart-sub" style={{ marginTop: '4px' }}>
                        {school.city}, {school.county}
                        {school.school_type !== 'CA Public' ? ` · ${school.school_type}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>{fmtNumber(school.adm)}</div>
                      <div className="ctrl-label" style={{ marginBottom: 0 }}>Admits</div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '10px',
                      height: '8px',
                      borderRadius: '999px',
                      background: '#e8edf5',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(school.adm / feederData.topSchools[0].adm) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #003262 0%, #3b82f6 100%)',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: '12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                      gap: '10px',
                      fontSize: '.78rem',
                    }}
                  >
                    <div>
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>Applicants</div>
                      <div style={{ fontWeight: 700 }}>{fmtNumber(school.app)}</div>
                    </div>
                    <div>
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>Admits</div>
                      <div style={{ fontWeight: 700 }}>{fmtNumber(school.adm)}</div>
                    </div>
                    <div>
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>Enrolled</div>
                      <div style={{ fontWeight: 700 }}>{fmtNumber(school.enr)}</div>
                    </div>
                    <div>
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>Admit Rate</div>
                      <div style={{ fontWeight: 700 }}>{fmtPercent(school.admitRate)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div className="chart-panel" style={{ height: '760px' }}>
              <div className="panel-controls">
                <div className="ctrl-label">Highest Admit Rates</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                  Top schools by admit rate
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>
                  Schools with at least 50 {feederData.campusLabel} applicants in Fall {feederData.displayYear}.
                </div>
              </div>
              <div className="panel-body" style={{ paddingTop: '8px', gap: '10px', overflowY: 'auto' }}>
                {feederData.topAdmitRateSchools.map((school, index) => (
                  <div
                    key={school.school_id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      background: '#fff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>{`Rank ${index + 1}`}</div>
                      <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>
                        <Link href={feederSchoolHref(school.school_id, school.school_name)} style={{ color: 'var(--text)' }}>
                          {school.school_name}
                        </Link>
                      </div>
                      <div className="chart-sub" style={{ marginTop: '2px' }}>
                        {school.city} · {fmtNumber(school.app)} applicants
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>
                        {fmtPercent(school.admitRate)}
                      </div>
                      <div className="ctrl-label" style={{ marginBottom: 0 }}>Admit Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="map-card">
          <div className="map-controls" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="ctrl-label">Full Rankings</div>
              <div style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                California schools ranked by {feederData.campusLabel} admits, applicants, and admit rate
              </div>
            </div>
            <div className="map-school-count">{feederData.rankedSchools.length} schools with Fall {feederData.displayYear} records</div>
          </div>

          <div style={{ overflowX: 'auto', padding: '8px 16px 16px' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 pt-2 font-medium">School</th>
                  <th className="pb-3 pt-2 font-medium">City</th>
                  <th className="pb-3 pt-2 font-medium">County</th>
                  <th className="pb-3 pt-2 font-medium">Type</th>
                  <th className="pb-3 pt-2 font-medium text-right">Applicants</th>
                  <th className="pb-3 pt-2 font-medium text-right">Admitted</th>
                  <th className="pb-3 pt-2 font-medium text-right">Enrolled</th>
                  <th className="pb-3 pt-2 font-medium text-right">Admit Rate</th>
                </tr>
              </thead>
              <tbody>
                {feederData.rankedSchools.map((school, index) => (
                  <tr key={school.school_id} className={index % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="border-b border-gray-100 py-3 font-medium text-gray-800">
                      <Link href={feederSchoolHref(school.school_id, school.school_name)} style={{ color: 'var(--uc-blue)' }}>
                        {school.school_name}
                      </Link>
                    </td>
                    <td className="border-b border-gray-100 py-3 text-gray-600">{school.city}</td>
                    <td className="border-b border-gray-100 py-3 text-gray-600">{school.county}</td>
                    <td className="border-b border-gray-100 py-3 text-gray-600">{school.school_type}</td>
                    <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmtNumber(school.app)}</td>
                    <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmtNumber(school.adm)}</td>
                    <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmtNumber(school.enr)}</td>
                    <td className="border-b border-gray-100 py-3 text-right font-semibold">{fmtPercent(school.admitRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  )
}
