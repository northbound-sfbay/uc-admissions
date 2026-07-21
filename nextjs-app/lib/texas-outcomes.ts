import fs from 'fs'
import path from 'path'

export type TexasDestination = {
  name: string
  ficeCode: string | null
  students: number
  aggregate: boolean
  institutionCount?: number
}

export type TexasGpaBands = {
  under2: number | null
  from2To249: number | null
  from25To299: number | null
  from3To349: number | null
  over35: number | null
  unknown: number | null
}

export type TexasGpaGroup = {
  students: number | null
  suppressed: boolean
  bands?: TexasGpaBands
}

export type TexasGpaData = {
  sourceLabel: string
  sourceUrl: string
  publicFourYear?: TexasGpaGroup
  publicTwoYear?: TexasGpaGroup
  independent?: TexasGpaGroup
}

export type TexasOutcomeYearData = {
  graduates: number
  trackableGraduates: number
  enrolled: number
  enrollmentRate: number
  coverageGap: number
  coverageGapRate: number
  notFound: number
  notTrackable: number
  destinationTotal: number
  destinations: TexasDestination[]
  utAustinEnrollment: number
  utAustinShareOfGraduates: number
  gpa?: TexasGpaData
}

export type TexasOutcomeSchool = {
  id: string
  campusCode: string
  schoolName: string
  district: string
  county: string
  state: 'TX'
  latestYear: string
  years: Record<string, TexasOutcomeYearData>
}

export type TexasOutcomeDataset = {
  stateSlug: 'texas'
  stateName: 'Texas'
  abbreviation: 'TX'
  generatedAt: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
  gpaSourceLabel: string
  gpaSourceUrl: string
  utAustinFiceCode: string
  years: Array<{ key: string; label: string }>
  schools: TexasOutcomeSchool[]
}

export type UtFeederSchoolRow = {
  school: TexasOutcomeSchool
  year: string
  students: number
  graduates: number
  shareOfGraduates: number
}

export type UtFeederYear = {
  year: string
  students: number
  reportingSchools: number
}

export type UtFeederCounty = {
  county: string
  students: number
  reportingSchools: number
  shareOfReportedEnrollment: number
}

const DATA_PATH = path.join(
  process.cwd(),
  'public',
  'data',
  'state-outcomes',
  'texas.json'
)

let cachedDataset: TexasOutcomeDataset | null = null
let cachedSchoolMap: Map<string, TexasOutcomeSchool> | null = null

export function texasSchoolNameSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function texasHighSchoolSlug(school: TexasOutcomeSchool): string {
  return `${school.campusCode}-${texasSchoolNameSlug(school.schoolName)}`
}

export function texasHighSchoolHref(school: TexasOutcomeSchool): string {
  return `/states/texas/high-schools/${texasHighSchoolSlug(school)}`
}

export function getTexasOutcomeData(): TexasOutcomeDataset {
  if (!cachedDataset) {
    cachedDataset = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as TexasOutcomeDataset
  }
  return cachedDataset
}

function getTexasSchoolMap(): Map<string, TexasOutcomeSchool> {
  if (!cachedSchoolMap) {
    cachedSchoolMap = new Map(
      getTexasOutcomeData().schools.map(school => [school.campusCode, school])
    )
  }
  return cachedSchoolMap
}

export function getTexasHighSchoolSlugs(): string[] {
  return getTexasOutcomeData().schools.map(texasHighSchoolSlug)
}

export function getTexasHighSchool(slug: string): TexasOutcomeSchool | null {
  const campusCode = slug.match(/^(\d{9})(?:-|$)/)?.[1]
  if (!campusCode) return null
  return getTexasSchoolMap().get(campusCode) ?? null
}

export function getTexasSchoolsAlphabetically(): TexasOutcomeSchool[] {
  return [...getTexasOutcomeData().schools].sort(
    (a, b) => a.county.localeCompare(b.county)
      || a.schoolName.localeCompare(b.schoolName)
      || a.campusCode.localeCompare(b.campusCode)
  )
}

export function getUtAustinFeederData() {
  const dataset = getTexasOutcomeData()
  const trend: UtFeederYear[] = dataset.years.map(({ key }) => {
    const rows = dataset.schools
      .map(school => school.years[key]?.utAustinEnrollment ?? 0)
      .filter(students => students > 0)
    return {
      year: key,
      students: rows.reduce((sum, students) => sum + students, 0),
      reportingSchools: rows.length,
    }
  })

  const latestYear = [...trend].reverse().find(row => row.students > 0)?.year ?? '2024'
  const topSchools: UtFeederSchoolRow[] = dataset.schools
    .map(school => {
      const yearData = school.years[latestYear]
      return {
        school,
        year: latestYear,
        students: yearData?.utAustinEnrollment ?? 0,
        graduates: yearData?.graduates ?? 0,
        shareOfGraduates: yearData?.utAustinShareOfGraduates ?? 0,
      }
    })
    .filter(row => row.students > 0)
    .sort(
      (a, b) => b.students - a.students
        || b.shareOfGraduates - a.shareOfGraduates
        || a.school.schoolName.localeCompare(b.school.schoolName)
    )

  const latestTotal = topSchools.reduce((sum, row) => sum + row.students, 0)
  const countyMap = new Map<string, { students: number; schools: number }>()
  for (const row of topSchools) {
    const county = countyMap.get(row.school.county) ?? { students: 0, schools: 0 }
    county.students += row.students
    county.schools += 1
    countyMap.set(row.school.county, county)
  }
  const counties: UtFeederCounty[] = Array.from(countyMap.entries())
    .map(([county, values]) => ({
      county,
      students: values.students,
      reportingSchools: values.schools,
      shareOfReportedEnrollment: latestTotal ? (values.students / latestTotal) * 100 : 0,
    }))
    .sort((a, b) => b.students - a.students || a.county.localeCompare(b.county))

  const centralTexasCounties = new Set(['Bastrop', 'Caldwell', 'Hays', 'Travis', 'Williamson'])
  const centralTexasStudents = counties
    .filter(row => centralTexasCounties.has(row.county))
    .reduce((sum, row) => sum + row.students, 0)

  return {
    dataset,
    latestYear,
    latestTotal,
    trend,
    topSchools,
    counties,
    centralTexasStudents,
    centralTexasShare: latestTotal ? (centralTexasStudents / latestTotal) * 100 : 0,
  }
}
