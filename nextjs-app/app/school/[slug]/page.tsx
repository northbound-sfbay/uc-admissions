import { notFound } from 'next/navigation'
import Link from 'next/link'
import SchoolPageAnalytics from '@/components/SchoolPageAnalytics'
import { readSchoolById, getTop300, idFromSlug, recentYear } from '@/lib/data'
import { countyPageHref } from '@/lib/county'
import { FEEDER_CAMPUSES } from '@/lib/feeder-options'
import { titleCase, fmt, pct, rateColor } from '@/lib/utils'
import type { Metadata } from 'next'
import type { School, YearData } from '@/lib/types'

// ── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const top300 = getTop300()
  return top300.map(s => ({ slug: s.slug }))
}

// ISR: non-top-300 pages are built on first visit and cached for 24h
export const revalidate = 86400

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const school = readSchoolById(idFromSlug(slug))
  if (!school) return {}

  const yr = recentYear(school)
  const d = yr ? school.years[yr] : null
  const name = titleCase(school.school_name)
  const loc = [school.city, school.county].filter(Boolean).join(', ')
  const rateStr = d?.admit_rate != null
    ? ` ${pct(d.admit_rate, 0)} UC admit rate in ${yr}.`
    : ''

  const title = `${name} UC Admissions Trends | Admit Rates & History`
  const description =
    `Explore UC admissions trends, admit rates, and history for ${name} in ${loc}.${rateStr} ` +
    `View applicants, admits, and enrollment data from 1994–2025 across all UC campuses.`

  return {
    title,
    description,
    alternates: { canonical: `https://collegeacceptance.info/school/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://collegeacceptance.info/school/${slug}`,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

const CAMPUSES = [
  'Berkeley', 'Los Angeles', 'San Diego', 'Davis',
  'Santa Barbara', 'Irvine', 'Santa Cruz', 'Riverside', 'Merced',
]

function AdmitRateBadge({ rate }: { rate: number | null }) {
  const color = rateColor(rate)
  return <span className={`font-bold ${color}`}>{pct(rate)}</span>
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="chart-panel" style={{ height: 'auto' }}>
      <div className="panel-controls">
        <div className="ctrl-label">School Detail</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', maxWidth: '60ch', lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </div>
      <div className="panel-body" style={{ paddingTop: '14px' }}>
        {children}
      </div>
    </section>
  )
}

function YearSummary({ yr, d }: { yr: string; d: YearData }) {
  return (
    <SectionCard
      title={`Fall ${yr} Snapshot`}
      description="Latest universitywide totals for this school across all UC campuses."
    >
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', background: '#fff' }}>
          <div className="ctrl-label" style={{ marginBottom: '4px' }}>
            Applicants
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>
            {fmt(d.app)}
          </div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', background: '#fff' }}>
          <div className="ctrl-label" style={{ marginBottom: '4px' }}>
            Admitted
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>
            {fmt(d.adm)}
          </div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', background: '#fff' }}>
          <div className="ctrl-label" style={{ marginBottom: '4px' }}>
            Enrolled
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1 }}>
            {fmt(d.enr)}
          </div>
        </div>
        <div style={{ border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 16px', background: '#eff6ff' }}>
          <div className="ctrl-label" style={{ marginBottom: '4px', color: 'var(--uc-blue)' }}>
            Admit Rate
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>
            <AdmitRateBadge rate={d.admit_rate} />
          </div>
          <div style={{ marginTop: '6px', fontSize: '.8rem', color: 'var(--text-muted)' }}>
            Admitted ÷ applicants
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function CampusTable({ d }: { d: YearData }) {
  const campusRows = CAMPUSES
    .map(campus => ({ campus, data: d.by_campus?.[campus] ?? null }))
    .filter(row => row.data?.app != null)

  if (!campusRows.length) return null

  return (
    <SectionCard
      title="By Campus"
      description="How this school performed at each UC campus in the most recent fall term."
    >
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm" style={{ minWidth: '560px' }}>
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 pt-1 font-medium">Campus</th>
              <th className="pb-3 pt-1 font-medium text-right">Applicants</th>
              <th className="pb-3 pt-1 font-medium text-right">Admitted</th>
              <th className="pb-3 pt-1 font-medium text-right">Admit Rate</th>
            </tr>
          </thead>
          <tbody>
            {campusRows.map(({ campus, data }) => (
              <tr key={campus} className="odd:bg-gray-50/60">
                <td className="border-b border-gray-100 py-3 font-medium text-gray-800">UC {campus}</td>
                <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(data?.app)}</td>
                <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(data?.adm)}</td>
                <td className="border-b border-gray-100 py-3 text-right font-semibold">
                  <AdmitRateBadge rate={data?.admit_rate ?? null} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

function EthnicityTable({ d }: { d: YearData }) {
  const rows = Object.entries(d.by_ethnicity ?? {})
    .filter(([, e]) => e?.app != null)
    .sort(([, a], [, b]) => (b?.app ?? 0) - (a?.app ?? 0))

  if (!rows.length) return null

  return (
    <SectionCard
      title="By Ethnicity"
      description="Most recent universitywide breakdown by ethnicity for this school."
    >
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm" style={{ minWidth: '560px' }}>
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 pt-1 font-medium">Group</th>
              <th className="pb-3 pt-1 font-medium text-right">Applicants</th>
              <th className="pb-3 pt-1 font-medium text-right">Admitted</th>
              <th className="pb-3 pt-1 font-medium text-right">Admit Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([ethnicity, e]) => (
              <tr key={ethnicity} className="odd:bg-gray-50/60">
                <td className="border-b border-gray-100 py-3 text-gray-800">{ethnicity}</td>
                <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(e?.app)}</td>
                <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(e?.adm)}</td>
                <td className="border-b border-gray-100 py-3 text-right font-semibold">
                  <AdmitRateBadge rate={e?.admit_rate ?? null} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

function TrendTable({ school }: { school: School }) {
  const years = Object.keys(school.years).sort().reverse().slice(0, 10)

  return (
    <SectionCard
      title="10-Year Trend"
      description="Recent universitywide trend for applicants, admits, enrollment, and admit rate."
    >
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm" style={{ minWidth: '640px' }}>
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 pt-1 font-medium">Year</th>
              <th className="pb-3 pt-1 font-medium text-right">Applicants</th>
              <th className="pb-3 pt-1 font-medium text-right">Admitted</th>
              <th className="pb-3 pt-1 font-medium text-right">Enrolled</th>
              <th className="pb-3 pt-1 font-medium text-right">Admit Rate</th>
            </tr>
          </thead>
          <tbody>
            {years.map(yr => {
              const d = school.years[yr]
              return (
                <tr key={yr} className="odd:bg-gray-50/60">
                  <td className="border-b border-gray-100 py-3 font-medium text-gray-800">{yr}</td>
                  <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(d.app)}</td>
                  <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(d.adm)}</td>
                  <td className="border-b border-gray-100 py-3 text-right text-gray-600">{fmt(d.enr)}</td>
                  <td className="border-b border-gray-100 py-3 text-right font-semibold">
                    <AdmitRateBadge rate={d.admit_rate} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const id = idFromSlug(slug)
  const school = readSchoolById(id)

  if (!school) notFound()

  // Redirect if slug doesn't match canonical form
  const yr = recentYear(school)
  const d = yr ? school.years[yr] : null
  const name = titleCase(school.school_name)
  const loc = [school.city, school.county].filter(Boolean).join(', ')
  const relatedFeederLinks = FEEDER_CAMPUSES.map(campus => ({
    href: `/feeder-schools/${campus.slug}`,
    label: `Top feeder schools to ${campus.label}`,
    sublabel: `See highest-volume schools, admit rates, and trends for ${campus.label}.`,
  }))

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `UC Admissions Data — ${name}`,
    description: `University of California admissions data for ${name} in ${loc} from 1994 to 2025.`,
    url: `https://collegeacceptance.info/school/${slug}`,
    keywords: [
      `${name} UC admissions`,
      `${name} acceptance rate`,
      `${school.city} high school UC`,
      'University of California admissions',
    ],
    temporalCoverage: '1994/2025',
    creator: {
      '@type': 'Organization',
      name: 'University of California',
      url: 'https://www.universityofcalifornia.edu',
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://collegeacceptance.info/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'School Pages',
        item: 'https://collegeacceptance.info/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name,
        item: `https://collegeacceptance.info/school/${slug}`,
      },
    ],
  }

  return (
    <>
      <SchoolPageAnalytics
        schoolSlug={slug}
        schoolName={school.school_name}
        county={school.county}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header>
          <div className="header-inner">
            <Link href="/" className="text-sm text-blue-200 hover:text-white">
              ← UC Admissions by High School
            </Link>
          </div>
        </header>

        <main>
          {/* School heading */}
          <section className="map-card">
            <div className="map-controls" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="ctrl-label">
                  School Profile
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.05 }}>
                  {name}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  {loc}
                  {school.school_type !== 'CA Public' && (
                    <span style={{ marginLeft: '8px', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                      {school.school_type}
                    </span>
                  )}
                </div>
              </div>
              {yr && (
                <div
                  style={{
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    borderRadius: '999px',
                    padding: '8px 14px',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    color: 'var(--uc-blue)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Latest available data: Fall {yr}
                </div>
              )}
            </div>
          </section>

          {/* Most recent year summary */}
          {yr && d && <YearSummary yr={yr} d={d} />}

          {/* Manual ad placement for Journey/Mediavine */}
          <div className="content_hint" aria-hidden="true" />

          <section className="charts-row" style={{ alignItems: 'start' }}>
            {/* Campus breakdown */}
            {yr && d && <CampusTable d={d} />}

            {/* Ethnicity breakdown */}
            {yr && d && <EthnicityTable d={d} />}
          </section>

          {/* 10-year trend */}
          <TrendTable school={school} />

          {/* Link to full interactive tool */}
          <div className="content_hint" aria-hidden="true" />

          <section className="notes-bar" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text)', marginBottom: '12px' }}>
              View charts, compare schools, and explore the map in the full interactive tool.
            </p>
            <a
              href={`/?school=${school.school_id}`}
              className="county-entry-link"
              style={{ background: 'var(--uc-blue)', color: '#fff', borderColor: 'var(--uc-blue)' }}
            >
              Open in Interactive Tool →
            </a>
          </section>

          <section className="map-card">
            <div className="map-controls" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div className="ctrl-label">Explore Next</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--uc-blue)', lineHeight: 1.2 }}>
                  Related county and feeder pages
                </div>
              </div>
            </div>
            <div className="related-links-body">
              <div className="related-links-group">
                <div className="related-links-group-title">County Page</div>
                <div className="related-links-list">
                  <Link href={countyPageHref(school.county)} className="related-links-item">
                    {school.county} County UC admissions
                    <span className="related-links-item-sub">
                      See top schools, admit rates, and countywide trends.
                    </span>
                  </Link>
                </div>
              </div>

              <div className="related-links-group">
                <div className="related-links-group-title">Major UC Feeder Pages</div>
                <div className="related-links-list">
                  {relatedFeederLinks.map(link => (
                    <Link key={link.href} href={link.href} className="related-links-item">
                      {link.label}
                      <span className="related-links-item-sub">{link.sublabel}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Data source */}
          <p className="text-xs text-gray-400 text-center pb-4">
            Data source:{' '}
            <a
              href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              UC Information Center
            </a>
            . Fall 1994–2025.
          </p>
        </main>
      </div>
    </>
  )
}
