import fs from 'fs'
import path from 'path'
import type { School } from './types'
import { recentYear } from './data'

type Summary = School & { latest_year: string | null; latest_applicants: number | null }
let summaries: Summary[] | undefined

export function getPeerSchools(school: School) {
  if (!school.county) return []
  summaries ??= JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/school-index.json'), 'utf8')) as Summary[]
  const year = recentYear(school)
  const applicants = year ? school.years[year]?.app ?? 0 : 0
  return summaries
    .filter(candidate => candidate.school_id !== school.school_id && candidate.county === school.county && candidate.school_type === school.school_type && candidate.latest_year === year && (candidate.latest_applicants ?? 0) > 0)
    .sort((a, b) => Number(b.city === school.city) - Number(a.city === school.city) || Math.abs((a.latest_applicants ?? 0) - applicants) - Math.abs((b.latest_applicants ?? 0) - applicants) || a.school_name.localeCompare(b.school_name))
    .slice(0, 3)
}
