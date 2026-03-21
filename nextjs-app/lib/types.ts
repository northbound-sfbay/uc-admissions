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

export interface Top300Entry {
  school_id: string
  school_name: string
  school_type: string
  city: string
  county: string
  slug: string
}
