import fs from 'fs'
import path from 'path'
import { makeSlug, titleCase } from './utils'
import type { School } from './types'
import { FEEDER_CAMPUSES } from './feeder-options'

const DATA_DIRS = ['ca_public', 'ca_private'] as const

export type FeederSchoolRow = {
  school_id: string
  school_name: string
  city: string
  county: string
  school_type: string
  app: number
  adm: number
  enr: number
  admitRate: number | null
}

export type FeederPageData = {
  campusKey: string
  campusLabel: string
  slug: string
  displayYear: string
  rankedSchools: FeederSchoolRow[]
  topSchools: FeederSchoolRow[]
  topAdmitRateSchools: FeederSchoolRow[]
  totals: {
    app: number
    adm: number
    enr: number
  }
  weightedAdmitRate: number | null
}

function loadAllSchools(): School[] {
  const root = path.join(process.cwd(), 'school-data')
  const schools: School[] = []

  for (const dir of DATA_DIRS) {
    const fullDir = path.join(root, dir)
    for (const fileName of fs.readdirSync(fullDir)) {
      schools.push(JSON.parse(fs.readFileSync(path.join(fullDir, fileName), 'utf8')) as School)
    }
  }

  return schools
}

const ALL_SCHOOLS = loadAllSchools()

function latestCampusYear(campusKey: string): string {
  const years = new Set<string>()
  for (const school of ALL_SCHOOLS) {
    for (const [year, data] of Object.entries(school.years)) {
      const campus = data.by_campus?.[campusKey]
      if ((campus?.app ?? 0) > 0 || (campus?.adm ?? 0) > 0 || (campus?.enr ?? 0) > 0) {
        years.add(year)
      }
    }
  }

  return Array.from(years).sort().at(-1) ?? '2025'
}

export function getFeederOptions(): Array<{ slug: string; label: string }> {
  return FEEDER_CAMPUSES.map(campus => ({ slug: campus.slug, label: campus.label }))
}

export function getFeederSlugs(): string[] {
  return FEEDER_CAMPUSES.map(campus => campus.slug)
}

export function getFeederData(slug: string): FeederPageData | null {
  const campusMeta = FEEDER_CAMPUSES.find(campus => campus.slug === slug)
  if (!campusMeta) return null

  const displayYear = latestCampusYear(campusMeta.key)
  const rankedSchools: FeederSchoolRow[] = ALL_SCHOOLS
    .map(school => {
      const campus = school.years[displayYear]?.by_campus?.[campusMeta.key]
      return {
        school_id: school.school_id,
        school_name: titleCase(school.school_name),
        city: school.city,
        county: school.county,
        school_type: school.school_type,
        app: campus?.app ?? 0,
        adm: campus?.adm ?? 0,
        enr: campus?.enr ?? 0,
        admitRate: campus?.admit_rate ?? null,
      }
    })
    .filter(row => row.app > 0 || row.adm > 0 || row.enr > 0)
    .sort((a, b) => b.adm - a.adm || b.app - a.app)

  const totals = rankedSchools.reduce(
    (acc, school) => {
      acc.app += school.app
      acc.adm += school.adm
      acc.enr += school.enr
      return acc
    },
    { app: 0, adm: 0, enr: 0 }
  )

  return {
    campusKey: campusMeta.key,
    campusLabel: campusMeta.label,
    slug: campusMeta.slug,
    displayYear,
    rankedSchools,
    topSchools: rankedSchools.slice(0, 5),
    topAdmitRateSchools: rankedSchools
      .filter(school => school.app >= 50 && school.admitRate != null)
      .sort((a, b) => (b.admitRate ?? 0) - (a.admitRate ?? 0))
      .slice(0, 5),
    totals,
    weightedAdmitRate: totals.app > 0 ? totals.adm / totals.app : null,
  }
}

export function feederSchoolHref(schoolId: string, schoolName: string): string {
  return `/school/${makeSlug(schoolId, schoolName)}`
}
