import { ADMIT_HIGH, ADMIT_MID, ADMIT_LOW, ADMIT_NONE } from './constants'
import type { School, YearData } from './types'

export function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export function fmt(v: number | null | undefined): string {
  if (v == null) return '—'
  return v.toLocaleString()
}

export function pct(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '—'
  return (v * 100).toFixed(decimals) + '%'
}

export function rateColor(rate: number | null): string {
  if (rate == null) return 'text-gray-400'
  if (rate >= 0.75) return 'text-green-600'
  if (rate >= 0.50) return 'text-amber-600'
  return 'text-red-600'
}

export function makeSlug(id: string, name: string): string {
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${id}-${nameSlug}`
}

export function schoolKey(school: School): string {
  return `${school.school_type ?? 'CA Public'}:${school.school_id}`
}

export function getYearData(
  yearObj: YearData | undefined,
  campus: string,
  ethnicity: string
): { app: number | null; adm: number | null; enr: number | null; admit_rate: number | null } | null {
  if (!yearObj) return null
  if (campus === 'universitywide') {
    return ethnicity === 'all' ? yearObj : (yearObj.by_ethnicity?.[ethnicity] ?? null)
  }
  return ethnicity === 'all' ? (yearObj.by_campus?.[campus] ?? null) : null
}

export function yieldRate(d: { adm: number | null; enr: number | null } | null): number | null {
  if (!d || !d.adm || d.enr == null) return null
  return d.enr / d.adm
}

export function admitColor(rate: number | null | undefined): string {
  if (rate == null) return ADMIT_NONE
  if (rate >= 0.75) return ADMIT_HIGH
  if (rate >= 0.50) return ADMIT_MID
  return ADMIT_LOW
}

export function recentYear(school: School): string | null {
  return (
    Object.keys(school.years)
      .sort()
      .reverse()
      .find(yr => (school.years[yr]?.app ?? 0) > 0) ?? null
  )
}
