import fs from 'fs'
import path from 'path'
import { FEEDER_CAMPUSES } from './feeder-options'
import type { GpaSchool, School } from './types'
import { makeSlug, titleCase } from './utils'

const SCHOOL_DATA_ROOT = path.join(process.cwd(), 'school-data')
const GPA_DATA_ROOT = path.join(process.cwd(), 'school-gpa-data')
const SCHOOL_JSON_DIRS = [
  path.join(SCHOOL_DATA_ROOT, 'ca_public'),
  path.join(SCHOOL_DATA_ROOT, 'ca_private'),
] as const
const GPA_JSON_DIRS = [
  path.join(GPA_DATA_ROOT, 'ca_public'),
  path.join(GPA_DATA_ROOT, 'ca_private'),
] as const

export type RankingSchoolRow = {
  school_id: string
  school_name: string
  city: string
  county: string
  school_type: string
  href: string
  app: number
  adm: number
  enr: number
  admitRate: number | null
  yieldRate: number | null
}

export type CampusRankingRow = RankingSchoolRow & {
  campusKey: string
  campusLabel: string
}

export type CampusRankingSummary = {
  campusKey: string
  campusLabel: string
  slug: string
  app: number
  adm: number
  enr: number
  admitRate: number | null
  topAdmitSchool: CampusRankingRow | null
  topAdmitRateSchool: CampusRankingRow | null
}

export type CountyRankingRow = {
  county: string
  href: string
  schools: number
  app: number
  adm: number
  enr: number
  admitRate: number | null
}

export type AdmitRateChangeRow = RankingSchoolRow & {
  priorApp: number
  priorAdm: number
  priorAdmitRate: number
  change: number
}

export type GpaRankingRow = RankingSchoolRow & {
  appGpa: number | null
  admGpa: number | null
  enrGpa: number | null
  admitMinusApplicantGpa: number | null
}

function normalizeId(id: string): string {
  return id.replace(/^0+/, '') || id
}

function identityKey(school: Pick<School, 'school_name' | 'city' | 'county' | 'school_type'>): string {
  return [
    school.school_name.trim().toUpperCase(),
    school.city.trim().toUpperCase(),
    school.county.trim().toUpperCase(),
    school.school_type.trim().toUpperCase(),
  ].join('|')
}

function countySlug(county: string): string {
  return county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function safeRate(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null
}

function rowForSchool(school: School, year: string): RankingSchoolRow | null {
  const data = school.years[year]
  if (!data) return null

  const app = data.app ?? 0
  const adm = data.adm ?? 0
  const enr = data.enr ?? 0
  if (app <= 0 && adm <= 0 && enr <= 0) return null

  return {
    school_id: school.school_id,
    school_name: titleCase(school.school_name),
    city: school.city,
    county: school.county,
    school_type: school.school_type,
    href: `/school/${makeSlug(school.school_id, school.school_name)}`,
    app,
    adm,
    enr,
    admitRate: data.admit_rate ?? safeRate(adm, app),
    yieldRate: safeRate(enr, adm),
  }
}

function campusRowForSchool(
  school: School,
  year: string,
  campusKey: string,
  campusLabel: string
): CampusRankingRow | null {
  const data = school.years[year]?.by_campus?.[campusKey]
  if (!data) return null

  const app = data.app ?? 0
  const adm = data.adm ?? 0
  const enr = data.enr ?? 0
  if (app <= 0 && adm <= 0 && enr <= 0) return null

  return {
    school_id: school.school_id,
    school_name: titleCase(school.school_name),
    city: school.city,
    county: school.county,
    school_type: school.school_type,
    href: `/school/${makeSlug(school.school_id, school.school_name)}`,
    campusKey,
    campusLabel,
    app,
    adm,
    enr,
    admitRate: data.admit_rate ?? safeRate(adm, app),
    yieldRate: safeRate(enr, adm),
  }
}

function latestYearForSchools(schools: School[]): string {
  const years = new Set<string>()
  for (const school of schools) {
    for (const [year, data] of Object.entries(school.years)) {
      if ((data.app ?? 0) > 0 || (data.adm ?? 0) > 0 || (data.enr ?? 0) > 0) years.add(year)
    }
  }

  return Array.from(years).sort().at(-1) ?? '2025'
}

function latestGpaYear(schools: GpaSchool[]): string {
  const years = new Set<string>()
  for (const school of schools) {
    for (const [year, data] of Object.entries(school.years)) {
      const hasGpa =
        data.app_gpa != null ||
        data.adm_gpa != null ||
        data.enr_gpa != null ||
        Object.values(data.by_campus ?? {}).some(
          campus => campus.app_gpa != null || campus.adm_gpa != null || campus.enr_gpa != null
        )
      if (hasGpa) years.add(year)
    }
  }

  return Array.from(years).sort().at(-1) ?? '2025'
}

function loadSchools(): School[] {
  const schools: School[] = []

  for (const fullDir of SCHOOL_JSON_DIRS) {
    if (!fs.existsSync(fullDir)) continue
    for (const fileName of fs.readdirSync(fullDir)) {
      if (!fileName.endsWith('.json')) continue
      schools.push(JSON.parse(fs.readFileSync(path.join(fullDir, fileName), 'utf8')) as School)
    }
  }

  return schools
}

function loadGpaSchools(): GpaSchool[] {
  const seen = new Set<string>()
  const schools: GpaSchool[] = []

  for (const fullDir of GPA_JSON_DIRS) {
    if (!fs.existsSync(fullDir)) continue
    for (const fileName of fs.readdirSync(fullDir)) {
      if (!fileName.endsWith('.json')) continue
      const school = JSON.parse(fs.readFileSync(path.join(fullDir, fileName), 'utf8')) as GpaSchool
      const key = identityKey(school)
      if (seen.has(key)) continue
      seen.add(key)
      schools.push(school)
    }
  }

  return schools
}

export function getStatewideRankings() {
  const schools = loadSchools()
  const displayYear = latestYearForSchools(schools)
  const rows = schools
    .map(school => rowForSchool(school, displayYear))
    .filter((row): row is RankingSchoolRow => row != null)

  const totals = rows.reduce(
    (acc, row) => {
      acc.app += row.app
      acc.adm += row.adm
      acc.enr += row.enr
      return acc
    },
    { app: 0, adm: 0, enr: 0 }
  )

  const countyMap = new Map<string, CountyRankingRow>()
  for (const row of rows) {
    const current = countyMap.get(row.county) ?? {
      county: row.county,
      href: `/county/${countySlug(row.county)}`,
      schools: 0,
      app: 0,
      adm: 0,
      enr: 0,
      admitRate: null,
    }

    current.schools += 1
    current.app += row.app
    current.adm += row.adm
    current.enr += row.enr
    current.admitRate = safeRate(current.adm, current.app)
    countyMap.set(row.county, current)
  }

  const campusSummaries: CampusRankingSummary[] = FEEDER_CAMPUSES.map(campus => {
    const campusRows = schools
      .map(school => campusRowForSchool(school, displayYear, campus.key, campus.label))
      .filter((row): row is CampusRankingRow => row != null)

    const campusTotals = campusRows.reduce(
      (acc, row) => {
        acc.app += row.app
        acc.adm += row.adm
        acc.enr += row.enr
        return acc
      },
      { app: 0, adm: 0, enr: 0 }
    )

    return {
      campusKey: campus.key,
      campusLabel: campus.label,
      slug: campus.slug,
      app: campusTotals.app,
      adm: campusTotals.adm,
      enr: campusTotals.enr,
      admitRate: safeRate(campusTotals.adm, campusTotals.app),
      topAdmitSchool: [...campusRows].sort((a, b) => b.adm - a.adm || b.app - a.app)[0] ?? null,
      topAdmitRateSchool:
        [...campusRows]
          .filter(row => row.app >= 50 && row.admitRate != null)
          .sort((a, b) => (b.admitRate ?? 0) - (a.admitRate ?? 0) || b.app - a.app)[0] ?? null,
    }
  })

  const priorYear =
    Array.from(
      schools.reduce((acc, school) => {
        for (const [year, data] of Object.entries(school.years)) {
          if (year !== displayYear && ((data.app ?? 0) > 0 || (data.adm ?? 0) > 0)) acc.add(year)
        }
        return acc
      }, new Set<string>())
    )
      .sort()
      .at(-1) ?? null

  const admitRateGainers: AdmitRateChangeRow[] = priorYear
    ? schools
        .map(school => {
          const current = rowForSchool(school, displayYear)
          const prior = rowForSchool(school, priorYear)
          if (!current || !prior || current.app < 100 || prior.app < 100) return null
          if (current.admitRate == null || prior.admitRate == null) return null
          return {
            ...current,
            priorApp: prior.app,
            priorAdm: prior.adm,
            priorAdmitRate: prior.admitRate,
            change: current.admitRate - prior.admitRate,
          }
        })
        .filter((row): row is AdmitRateChangeRow => row != null)
        .sort((a, b) => b.change - a.change)
        .slice(0, 15)
    : []

  return {
    displayYear,
    priorYear,
    schoolCount: rows.length,
    totals: {
      ...totals,
      admitRate: safeRate(totals.adm, totals.app),
      yieldRate: safeRate(totals.enr, totals.adm),
    },
    applicantLeaders: [...rows].sort((a, b) => b.app - a.app).slice(0, 25),
    admitLeaders: [...rows].sort((a, b) => b.adm - a.adm || b.app - a.app).slice(0, 25),
    admitRateLeaders: [...rows]
      .filter(row => row.app >= 100 && row.admitRate != null)
      .sort((a, b) => (b.admitRate ?? 0) - (a.admitRate ?? 0) || b.app - a.app)
      .slice(0, 25),
    yieldLeaders: [...rows]
      .filter(row => row.adm >= 75 && row.yieldRate != null)
      .sort((a, b) => (b.yieldRate ?? 0) - (a.yieldRate ?? 0) || b.adm - a.adm)
      .slice(0, 15),
    countyLeaders: Array.from(countyMap.values())
      .sort((a, b) => b.app - a.app || b.adm - a.adm)
      .slice(0, 15),
    campusSummaries,
    admitRateGainers,
  }
}

export function getGpaInsightData() {
  const schools = loadSchools()
  const gpaSchools = loadGpaSchools()
  const displayYear = latestYearForSchools(schools)
  const gpaYear = latestGpaYear(gpaSchools)
  const byNormalizedId = new Map<string, School>()
  const byIdentity = new Map<string, School>()

  for (const school of schools) {
    byNormalizedId.set(normalizeId(school.school_id), school)
    byIdentity.set(identityKey(school), school)
  }

  const rows: GpaRankingRow[] = []

  for (const gpaSchool of gpaSchools) {
    const gpaData = gpaSchool.years[gpaYear]
    if (!gpaData || (gpaData.app_gpa == null && gpaData.adm_gpa == null && gpaData.enr_gpa == null)) {
      continue
    }

    const school =
      byNormalizedId.get(normalizeId(gpaSchool.school_id)) ?? byIdentity.get(identityKey(gpaSchool))
    if (!school) continue

    const admissionsRow = rowForSchool(school, displayYear)
    if (!admissionsRow) continue

    rows.push({
      ...admissionsRow,
      appGpa: gpaData.app_gpa,
      admGpa: gpaData.adm_gpa,
      enrGpa: gpaData.enr_gpa,
      admitMinusApplicantGpa:
        gpaData.adm_gpa != null && gpaData.app_gpa != null
          ? Number((gpaData.adm_gpa - gpaData.app_gpa).toFixed(2))
          : null,
    })
  }

  const highVolumeRows = rows.filter(row => row.app >= 100 && row.admGpa != null)

  return {
    displayYear,
    gpaYear,
    gpaSchoolCount: rows.length,
    topAdmittedGpaSchools: [...highVolumeRows]
      .sort((a, b) => (b.admGpa ?? 0) - (a.admGpa ?? 0) || b.app - a.app)
      .slice(0, 15),
    largestGpaGaps: [...highVolumeRows]
      .filter(row => row.admitMinusApplicantGpa != null)
      .sort((a, b) => (b.admitMinusApplicantGpa ?? 0) - (a.admitMinusApplicantGpa ?? 0) || b.app - a.app)
      .slice(0, 15),
    volumeExamples: [...highVolumeRows]
      .sort((a, b) => b.app - a.app)
      .slice(0, 12),
  }
}
