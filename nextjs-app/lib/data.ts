import fs from 'fs'
import path from 'path'
import type { GpaSchool, GpaYearData, School, Top300Entry } from './types'

const SCHOOL_DATA_ROOT = path.join(process.cwd(), 'school-data')
const SCHOOL_GPA_DATA_ROOT = path.join(process.cwd(), 'school-gpa-data')
const TYPE_DIRS = ['ca_public', 'ca_private']

function typeDirsForSchoolType(schoolType?: string) {
  if (schoolType === 'CA Public') return ['ca_public']
  if (schoolType === 'CA Private') return ['ca_private']
  return TYPE_DIRS
}

export function readSchoolById(id: string): School | null {
  for (const dir of TYPE_DIRS) {
    const filePath = path.join(SCHOOL_DATA_ROOT, dir, `${id}.json`)
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as School
    }
  }
  return null
}

export function readGpaSchoolById(id: string, schoolType?: string): GpaSchool | null {
  for (const dir of typeDirsForSchoolType(schoolType)) {
    const filePath = path.join(SCHOOL_GPA_DATA_ROOT, dir, `${id}.json`)
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as GpaSchool
    }
  }
  return null
}

export function getTop300(): Top300Entry[] {
  const filePath = path.join(process.cwd(), 'public', 'top300.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Top300Entry[]
}

/** Extract school ID from a slug like "52350-palo-alto-senior-high-school" */
export function idFromSlug(slug: string): string {
  return slug.split('-')[0]
}

/** Most recent year that has applicant data */
export function recentYear(school: School): string | null {
  return (
    Object.keys(school.years)
      .sort()
      .reverse()
      .find(yr => (school.years[yr]?.app ?? 0) > 0) ?? null
  )
}

function hasGpaValue(data: GpaYearData | undefined): boolean {
  if (!data) return false
  if (data.app_gpa !== null || data.adm_gpa !== null || data.enr_gpa !== null) return true
  return Object.values(data.by_campus).some(row =>
    row.app_gpa !== null || row.adm_gpa !== null || row.enr_gpa !== null
  )
}

export function recentGpaYear(school: GpaSchool | null): string | null {
  if (!school) return null
  return (
    Object.keys(school.years)
      .sort()
      .reverse()
      .find(yr => hasGpaValue(school.years[yr])) ?? null
  )
}
