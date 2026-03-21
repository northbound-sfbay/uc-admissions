/** Convert "PALO ALTO SENIOR HIGH SCHOOL" → "Palo Alto Senior High School" */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

/** Format a number or return "—" */
export function fmt(v: number | null | undefined): string {
  if (v == null) return '—'
  return v.toLocaleString()
}

/** Format a rate as percentage or return "—" */
export function pct(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '—'
  return (v * 100).toFixed(decimals) + '%'
}

/** Color class for an admit rate */
export function rateColor(rate: number | null): string {
  if (rate == null) return 'text-gray-400'
  if (rate >= 0.75) return 'text-green-600'
  if (rate >= 0.50) return 'text-amber-600'
  return 'text-red-600'
}

/** Generate a URL slug: "{id}-{name-slug}" */
export function makeSlug(id: string, name: string): string {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${id}-${nameSlug}`
}
