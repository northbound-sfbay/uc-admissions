import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readSchoolById, getTop300, idFromSlug, recentYear } from '@/lib/data'
import { titleCase, fmt, pct, rateColor, makeSlug } from '@/lib/utils'
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

  const title = `${name} | UC Admissions Data | collegeacceptance.info`
  const description =
    `UC admissions data for ${name} in ${loc}.${rateStr} ` +
    `View applicants, admits, and enrollment trends from 1994–2025 across all UC campuses.`

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

function YearSummary({ yr, d }: { yr: string; d: YearData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Fall {yr} — Universitywide
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-900">{fmt(d.app)}</div>
          <div className="text-sm text-gray-500 mt-1">Applicants</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-900">{fmt(d.adm)}</div>
          <div className="text-sm text-gray-500 mt-1">Admitted</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-900">{fmt(d.enr)}</div>
          <div className="text-sm text-gray-500 mt-1">Enrolled</div>
        </div>
      </div>
      <div className="text-center text-2xl">
        Admit Rate: <AdmitRateBadge rate={d.admit_rate} />
      </div>
    </div>
  )
}

function CampusTable({ d }: { d: YearData }) {
  const campusRows = CAMPUSES
    .map(campus => ({ campus, data: d.by_campus?.[campus] ?? null }))
    .filter(row => row.data?.app != null)

  if (!campusRows.length) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">By Campus</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="pb-2 font-medium">Campus</th>
            <th className="pb-2 font-medium text-right">Applicants</th>
            <th className="pb-2 font-medium text-right">Admitted</th>
            <th className="pb-2 font-medium text-right">Admit Rate</th>
          </tr>
        </thead>
        <tbody>
          {campusRows.map(({ campus, data }) => (
            <tr key={campus} className="border-b border-gray-50">
              <td className="py-2 font-medium text-gray-800">UC {campus}</td>
              <td className="py-2 text-right text-gray-600">{fmt(data?.app)}</td>
              <td className="py-2 text-right text-gray-600">{fmt(data?.adm)}</td>
              <td className="py-2 text-right">
                <AdmitRateBadge rate={data?.admit_rate ?? null} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EthnicityTable({ d }: { d: YearData }) {
  const rows = Object.entries(d.by_ethnicity ?? {})
    .filter(([, e]) => e?.app != null)
    .sort(([, a], [, b]) => (b?.app ?? 0) - (a?.app ?? 0))

  if (!rows.length) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">By Ethnicity</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="pb-2 font-medium">Group</th>
            <th className="pb-2 font-medium text-right">Applicants</th>
            <th className="pb-2 font-medium text-right">Admitted</th>
            <th className="pb-2 font-medium text-right">Admit Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([ethnicity, e]) => (
            <tr key={ethnicity} className="border-b border-gray-50">
              <td className="py-2 text-gray-800">{ethnicity}</td>
              <td className="py-2 text-right text-gray-600">{fmt(e?.app)}</td>
              <td className="py-2 text-right text-gray-600">{fmt(e?.adm)}</td>
              <td className="py-2 text-right">
                <AdmitRateBadge rate={e?.admit_rate ?? null} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TrendTable({ school }: { school: School }) {
  const years = Object.keys(school.years).sort().reverse().slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        10-Year Trend (Universitywide)
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="pb-2 font-medium">Year</th>
            <th className="pb-2 font-medium text-right">Applicants</th>
            <th className="pb-2 font-medium text-right">Admitted</th>
            <th className="pb-2 font-medium text-right">Enrolled</th>
            <th className="pb-2 font-medium text-right">Admit Rate</th>
          </tr>
        </thead>
        <tbody>
          {years.map(yr => {
            const d = school.years[yr]
            return (
              <tr key={yr} className="border-b border-gray-50">
                <td className="py-2 font-medium text-gray-800">{yr}</td>
                <td className="py-2 text-right text-gray-600">{fmt(d.app)}</td>
                <td className="py-2 text-right text-gray-600">{fmt(d.adm)}</td>
                <td className="py-2 text-right text-gray-600">{fmt(d.enr)}</td>
                <td className="py-2 text-right">
                  <AdmitRateBadge rate={d.admit_rate} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
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
  const canonical = makeSlug(school.school_id, school.school_name)
  // (slug mismatch handling can be added later if needed)

  const yr = recentYear(school)
  const d = yr ? school.years[yr] : null
  const name = titleCase(school.school_name)
  const loc = [school.city, school.county].filter(Boolean).join(', ')

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-[#003262] text-white px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-sm text-blue-200 hover:text-white">
              ← UC Admissions by High School
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* School heading */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-500 mt-1">
              {loc}
              {school.school_type !== 'CA Public' && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {school.school_type}
                </span>
              )}
            </p>
          </div>

          {/* Most recent year summary */}
          {yr && d && <YearSummary yr={yr} d={d} />}

          {/* Campus breakdown */}
          {yr && d && <CampusTable d={d} />}

          {/* Ethnicity breakdown */}
          {yr && d && <EthnicityTable d={d} />}

          {/* 10-year trend */}
          <TrendTable school={school} />

          {/* Link to full interactive tool */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
            <p className="text-gray-700 mb-3">
              View charts, compare schools, and explore the map in the full interactive tool.
            </p>
            <Link
              href={`/?school=${school.school_id}`}
              className="inline-block bg-[#003262] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
            >
              Open in Interactive Tool →
            </Link>
          </div>

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
