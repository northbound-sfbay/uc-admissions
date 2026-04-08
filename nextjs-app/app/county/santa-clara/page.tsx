import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { makeSlug, titleCase } from '@/lib/utils'
import type { School } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Santa Clara County High Schools for UC Admissions | Mockup | collegeacceptance.info',
  description:
    'Mockup county landing page for Santa Clara County high schools and UC admissions trends.',
  alternates: { canonical: 'https://collegeacceptance.info/county/santa-clara' },
}

const DATA_DIRS = ['ca_public', 'ca_private']
const CAMPUS_HIGHLIGHTS = [
  { key: 'Los Angeles', label: 'UCLA' },
  { key: 'Berkeley', label: 'UC Berkeley' },
  { key: 'San Diego', label: 'UC San Diego' },
  { key: 'Davis', label: 'UC Davis' },
]

type SchoolRow = {
  school_id: string
  school_name: string
  city: string
  school_type: string
  app: number
  adm: number
  enr: number
  admitRate: number | null
}

type CampusRow = {
  campus: string
  school_id: string
  school_name: string
  city: string
  adm: number
}

type AdmitRateRow = {
  school_id: string
  school_name: string
  city: string
  app: number
  adm: number
  admitRate: number | null
}

function fmtNumber(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString()
}

function fmtPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function loadCountySchools(county: string): School[] {
  const root = path.join(process.cwd(), 'school-data')
  const schools: School[] = []

  for (const dir of DATA_DIRS) {
    const fullDir = path.join(root, dir)
    for (const fileName of fs.readdirSync(fullDir)) {
      const school = JSON.parse(fs.readFileSync(path.join(fullDir, fileName), 'utf8')) as School
      if (school.county === county) schools.push(school)
    }
  }

  return schools
}

function latestAvailableYear(schools: School[]): string {
  const years = new Set<string>()
  for (const school of schools) {
    for (const [year, data] of Object.entries(school.years)) {
      if ((data.app ?? 0) > 0 || (data.adm ?? 0) > 0 || (data.enr ?? 0) > 0) {
        years.add(year)
      }
    }
  }

  return Array.from(years).sort().at(-1) ?? '2025'
}

function latestCampusDataYear(schools: School[]): string {
  const years = new Set<string>()
  for (const school of schools) {
    for (const [year, data] of Object.entries(school.years)) {
      const hasCampusData = Object.values(data.by_campus ?? {}).some(
        campus => (campus?.app ?? 0) > 0 || (campus?.adm ?? 0) > 0 || (campus?.enr ?? 0) > 0
      )
      if (hasCampusData) years.add(year)
    }
  }

  return Array.from(years).sort().at(-1) ?? latestAvailableYear(schools)
}

function buildCountyData(county: string) {
  const schools = loadCountySchools(county)
  const displayYear = latestAvailableYear(schools)
  const campusDisplayYear = latestCampusDataYear(schools)
  const schoolsWithYear = schools.filter(s => {
    const year = s.years[displayYear]
    return year && ((year.app ?? 0) > 0 || (year.adm ?? 0) > 0 || (year.enr ?? 0) > 0)
  })
  const schoolsWithCampusYear = schools.filter(s => {
    const year = s.years[campusDisplayYear]
    return year && ((year.app ?? 0) > 0 || (year.adm ?? 0) > 0 || (year.enr ?? 0) > 0)
  })

  const rankedSchools: SchoolRow[] = schoolsWithYear
    .map(s => {
      const year = s.years[displayYear]
      return {
        school_id: s.school_id,
        school_name: titleCase(s.school_name),
        city: s.city,
        school_type: s.school_type,
        app: year.app ?? 0,
        adm: year.adm ?? 0,
        enr: year.enr ?? 0,
        admitRate: year.admit_rate ?? null,
      }
    })
    .sort((a, b) => b.app - a.app)

  const totals = rankedSchools.reduce(
    (acc, school) => {
      acc.app += school.app
      acc.adm += school.adm
      acc.enr += school.enr
      return acc
    },
    { app: 0, adm: 0, enr: 0 }
  )

  const campusHighlights: CampusRow[] = CAMPUS_HIGHLIGHTS.map(campus => {
    const topSchool = schoolsWithCampusYear
      .map(s => {
        const campusData = s.years[campusDisplayYear].by_campus?.[campus.key]
        return {
          campus: campus.label,
          school_id: s.school_id,
          school_name: titleCase(s.school_name),
          city: s.city,
          adm: campusData?.adm ?? 0,
        }
      })
      .sort((a, b) => b.adm - a.adm)[0]

    return topSchool
  }).filter(row => row.adm > 0)

  return {
    county,
    displayYear,
    campusDisplayYear,
    schoolsWithYearCount: schoolsWithYear.length,
    totals,
    rankedSchools,
    topSchools: rankedSchools.slice(0, 5),
    topAdmitRateSchools: rankedSchools
      .filter(s => s.app >= 100 && s.admitRate != null)
      .sort((a, b) => (b.admitRate ?? 0) - (a.admitRate ?? 0))
      .slice(0, 5)
      .map<AdmitRateRow>(s => ({
        school_id: s.school_id,
        school_name: s.school_name,
        city: s.city,
        app: s.app,
        adm: s.adm,
        admitRate: s.admitRate,
      })),
    campusHighlights,
    weightedAdmitRate: totals.app > 0 ? totals.adm / totals.app : null,
  }
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

export default function SantaClaraCountyMockPage() {
  const countyData = buildCountyData('Santa Clara')

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
        <section className="seo-intro" aria-label="About this county page">
          <p>
            This mockup shows how a <strong>county landing page</strong> could fit into the current site without
            changing the overall visual style. Using the existing dataset, this page summarizes
            <strong> Santa Clara County UC admissions in Fall {countyData.displayYear}</strong>, ranks the county&apos;s top high
            schools, highlights feeder patterns to major UC campuses, and links users into individual school pages.
          </p>
        </section>

        <div className="notes-bar">
          <div className="notes-title">County Page Concept</div>
          <ul>
            <li>The numbers on this page are now pulled from the actual local dataset for Santa Clara County.</li>
            <li>Universitywide applicant and admit counts reflect applications and admissions across UC campuses, not unique students.</li>
            <li>The page focuses on user-facing rankings and feeder patterns rather than SEO planning notes.</li>
            <li>Each school listed here links directly to its detailed admissions page.</li>
          </ul>
        </div>

        <section className="charts-row" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <StatPanel
            label="County Schools"
            value={fmtNumber(countyData.schoolsWithYearCount)}
            detail={`${countyData.county} County schools with Fall ${countyData.displayYear} UC admissions records`}
          />
          <StatPanel
            label={`${countyData.displayYear} Applicants`}
            value={fmtNumber(countyData.totals.app)}
            detail={`Total UC applications from county high schools in Fall ${countyData.displayYear}`}
          />
          <StatPanel
            label={`${countyData.displayYear} Admits`}
            value={fmtNumber(countyData.totals.adm)}
            detail={`Universitywide UC admits across all county schools in Fall ${countyData.displayYear}`}
          />
          <StatPanel
            label="Avg Admit Rate"
            value={fmtPercent(countyData.weightedAdmitRate)}
            detail={`Weighted countywide admit rate in Fall ${countyData.displayYear}`}
          />
        </section>

        <section className="charts-row" style={{ alignItems: 'start' }}>
          <div className="chart-panel" style={{ height: '760px' }}>
            <div className="panel-controls">
              <div className="ctrl-label">{countyData.county} County</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                Highest-volume UC applicant schools
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--text-muted)', maxWidth: '58ch' }}>
                Ranked by total universitywide UC applicants in Fall {countyData.displayYear}. This is the broadest
                county-level view and the best entry point into individual school pages.
              </div>
            </div>

            <div className="panel-body" style={{ paddingTop: '14px', gap: '12px', overflowY: 'auto' }}>
              {countyData.topSchools.map((school, index) => (
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
                        <Link href={`/school/${makeSlug(school.school_id, school.school_name)}`} style={{ color: 'var(--uc-blue)' }}>
                          {school.school_name}
                        </Link>
                      </div>
                      <div className="chart-sub" style={{ marginTop: '4px' }}>
                        {school.city}
                        {school.school_type !== 'CA Public' ? ` · ${school.school_type}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>{fmtNumber(school.app)}</div>
                      <div className="ctrl-label" style={{ marginBottom: 0 }}>Applicants</div>
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
                        width: `${(school.app / countyData.topSchools[0].app) * 100}%`,
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
            <div className="chart-panel" style={{ height: '372px' }}>
              <div className="panel-controls">
                <div className="ctrl-label">Campus Feeders</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                  Top county feeders by campus
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>
                  Latest campus-level data available: Fall {countyData.campusDisplayYear}.
                </div>
              </div>
              <div className="panel-body" style={{ paddingTop: '8px', gap: '10px', overflowY: 'auto' }}>
                {countyData.campusHighlights.map(row => (
                  <div
                    key={`${row.campus}-${row.school_id}`}
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
                      <div className="ctrl-label" style={{ marginBottom: '2px' }}>{row.campus}</div>
                      <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>
                        <Link href={`/school/${makeSlug(row.school_id, row.school_name)}`} style={{ color: 'var(--text)' }}>
                          {row.school_name}
                        </Link>
                      </div>
                      <div className="chart-sub" style={{ marginTop: '2px' }}>{row.city}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>{fmtNumber(row.adm)}</div>
                      <div className="ctrl-label" style={{ marginBottom: 0 }}>Admits</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-panel" style={{ height: '372px' }}>
              <div className="panel-controls">
                <div className="ctrl-label">Highest Admit Rates</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                  Top county schools by admit rate
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>
                  Schools with at least 100 universitywide UC applicants in Fall {countyData.displayYear}.
                </div>
              </div>
              <div className="panel-body" style={{ paddingTop: '8px', gap: '10px', overflowY: 'auto' }}>
                {countyData.topAdmitRateSchools.map((school, index) => (
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
                        <Link href={`/school/${makeSlug(school.school_id, school.school_name)}`} style={{ color: 'var(--text)' }}>
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
                {countyData.county} County schools ranked by applicants, admits, and admit rate
              </div>
            </div>
            <div className="map-school-count">{countyData.rankedSchools.length} schools with Fall {countyData.displayYear} records</div>
          </div>

          <div style={{ overflowX: 'auto', padding: '8px 16px 16px' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 pt-2 font-medium">School</th>
                  <th className="pb-3 pt-2 font-medium">City</th>
                  <th className="pb-3 pt-2 font-medium">Type</th>
                  <th className="pb-3 pt-2 font-medium text-right">Applicants</th>
                  <th className="pb-3 pt-2 font-medium text-right">Admitted</th>
                  <th className="pb-3 pt-2 font-medium text-right">Enrolled</th>
                  <th className="pb-3 pt-2 font-medium text-right">Admit Rate</th>
                </tr>
              </thead>
              <tbody>
                {countyData.rankedSchools.map((school, index) => (
                  <tr key={school.school_id} className={index % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="border-b border-gray-100 py-3 font-medium text-gray-800">
                      <Link href={`/school/${makeSlug(school.school_id, school.school_name)}`} style={{ color: 'var(--uc-blue)' }}>
                        {school.school_name}
                      </Link>
                    </td>
                    <td className="border-b border-gray-100 py-3 text-gray-600">{school.city}</td>
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

      <footer>
        <p>County page mockup using actual Santa Clara County admissions data from the local dataset.</p>
      </footer>
    </>
  )
}
