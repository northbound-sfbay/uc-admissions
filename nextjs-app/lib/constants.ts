export const ALL_YEARS = Array.from({ length: 32 }, (_, i) => String(1994 + i))
export const RECENT_YEARS = ALL_YEARS.slice(-3)

export const CMP_COLORS = [
  '#003262', '#e85d04', '#16a34a', '#dc2626',
  '#7c3aed', '#0284c7', '#b45309', '#0f766e',
]

export const ADMIT_HIGH = '#16a34a'
export const ADMIT_MID  = '#d97706'
export const ADMIT_LOW  = '#dc2626'
export const ADMIT_NONE = '#94a3b8'

export const TYPE_DATA_URLS: Record<string, string> = {
  'CA Public':       '/data/admissions_ca_public.json',
  'CA Private':      '/data/admissions_ca_private.json',
  'Non-CA Domestic': '/data/admissions_nonca_domestic.json',
  'Foreign':         '/data/admissions_foreign.json',
  'Other':           '/data/admissions_other.json',
}

export const COORDS_URL            = '/data/school_coords.json'
export const NONPUBLIC_COORDS_URL  = '/data/school_coords_nonpublic.json'
export const COUNTIES_URL          = '/data/ca_counties.geojson'

export const TYPE_MAP_VIEW: Record<string, { center: [number, number]; zoom: number }> = {
  'CA Public':       { center: [37.0, -119.5], zoom: 6 },
  'CA Private':      { center: [37.0, -119.5], zoom: 6 },
  'Other':           { center: [37.0, -119.5], zoom: 6 },
  'Non-CA Domestic': { center: [38.0, -96.0],  zoom: 4 },
  'Foreign':         { center: [20.0,   0.0],  zoom: 2 },
}

export const MAX_CMP = 8

export const CAMPUSES = [
  'universitywide', 'Berkeley', 'Davis', 'Irvine', 'Los Angeles',
  'Merced', 'Riverside', 'San Diego', 'Santa Barbara', 'Santa Cruz',
]

export const ETHNICITIES = [
  'African American', 'American Indian', 'Hispanic/ Latinx',
  'Pacific Islander', 'Asian', 'White', 'Domestic Unknown', "Int'l",
]
