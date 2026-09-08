import data from '@/public/data/texas-admissions.json'

export type TexasAdmissionYear = {
  texasApplicants: number | null
  texasAccepted: number | null
  texasEnrolled: number | null
  allApplicants: number | null
  sourceRow: number
  sourceName: string
}
export type TexasAdmissionInstitution = {
  ficeCode: string
  name: string
  years: Record<string, TexasAdmissionYear>
}

export const texasAdmissions = data as Omit<typeof data, 'institutions'> & {
  institutions: TexasAdmissionInstitution[]
}
export const TEXAS_ADMISSIONS_PATH = '/states/texas/college-acceptance-rates'

export function acceptanceRate(row: TexasAdmissionYear | undefined): number | null {
  return row?.texasApplicants && row.texasAccepted != null
    ? row.texasAccepted / row.texasApplicants * 100
    : null
}

export function rateChange(current: TexasAdmissionYear | undefined, previous: TexasAdmissionYear | undefined): number | null {
  const a = acceptanceRate(current)
  const b = acceptanceRate(previous)
  return a == null || b == null ? null : a - b
}

export function admissionNumber(value: number | null | undefined): string {
  return value == null ? 'Not reported' : value.toLocaleString('en-US')
}

export function admissionPercent(value: number | null | undefined): string {
  return value == null ? 'Not reported' : `${value.toFixed(1)}%`
}
