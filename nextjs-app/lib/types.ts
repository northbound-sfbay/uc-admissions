export interface EthnicityData {
  app: number | null
  adm: number | null
  enr: number | null
  admit_rate: number | null
}

export interface YearData {
  app: number | null
  adm: number | null
  enr: number | null
  admit_rate: number | null
  by_ethnicity: Record<string, EthnicityData | null>
  by_campus: Record<string, EthnicityData>
}

export interface School {
  school_id: string
  school_name: string
  school_type: string
  city: string
  county: string
  years: Record<string, YearData>
}

export interface GpaData {
  app_gpa: number | null
  adm_gpa: number | null
  enr_gpa: number | null
}

export interface GpaYearData extends GpaData {
  by_campus: Record<string, GpaData>
}

export interface GpaSchool {
  school_id: string
  school_name: string
  school_type: string
  city: string
  county: string
  years: Record<string, GpaYearData>
}

export interface Top300Entry {
  school_id: string
  school_name: string
  school_type: string
  city: string
  county: string
  slug: string
}
