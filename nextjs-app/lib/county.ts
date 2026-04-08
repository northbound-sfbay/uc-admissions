import fs from 'fs'
import path from 'path'
import { makeSlug, titleCase } from './utils'
import type { School } from './types'

const DATA_DIRS = ['ca_public', 'ca_private'] as const
const CAMPUS_HIGHLIGHTS = [
  { key: 'Los Angeles', label: 'UCLA' },
  { key: 'Berkeley', label: 'UC Berkeley' },
  { key: 'San Diego', label: 'UC San Diego' },
  { key: 'Davis', label: 'UC Davis' },
]

export type CountySchoolRow = {
  school_id: string
  school_name: string
  city: string
  school_type: string
  app: number
  adm: number
  enr: number
  admitRate: number | null
}

export type CountyCampusRow = {
  campus: string
  school_id: string
  school_name: string
  city: string
  adm: number
}

export type CountyAdmitRateRow = {
  school_id: string
  school_name: string
  city: string
  app: number
  adm: number
  admitRate: number | null
}

export type CountyPageData = {
  county: string
  slug: string
  displayYear: string
  campusDisplayYear: string
  schoolsWithYearCount: number
  totals: {
    app: number
    adm: number
    enr: number
  }
  rankedSchools: CountySchoolRow[]
  topSchools: CountySchoolRow[]
  topAdmitRateSchools: CountyAdmitRateRow[]
  campusHighlights: CountyCampusRow[]
  weightedAdmitRate: number | null
}

function countySlug(county: string): string {
  return county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
const COUNTY_INDEX = new Map<string, School[]>()

for (const school of ALL_SCHOOLS) {
  if (!school.county) continue
  const slug = countySlug(school.county)
  const bucket = COUNTY_INDEX.get(slug)
  if (bucket) bucket.push(school)
  else COUNTY_INDEX.set(slug, [school])
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

export function getCountySlugs(): string[] {
  return Array.from(COUNTY_INDEX.keys()).sort()
}

export function getCountyOptions(): Array<{ label: string; slug: string }> {
  return Array.from(COUNTY_INDEX.entries())
    .map(([slug, schools]) => ({ slug, label: schools[0]?.county ?? slug }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function getCountyData(slug: string): CountyPageData | null {
  const schools = COUNTY_INDEX.get(slug)
  if (!schools?.length) return null

  const county = schools[0].county
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

  const rankedSchools: CountySchoolRow[] = schoolsWithYear
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

  const campusHighlights: CountyCampusRow[] = CAMPUS_HIGHLIGHTS.map(campus => {
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

    return topSchool && topSchool.adm > 0 ? topSchool : null
  }).filter((row): row is CountyCampusRow => row !== null)

  return {
    county,
    slug,
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
      .map(s => ({
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

export function countySchoolHref(schoolId: string, schoolName: string): string {
  return `/school/${makeSlug(schoolId, schoolName)}`
}
