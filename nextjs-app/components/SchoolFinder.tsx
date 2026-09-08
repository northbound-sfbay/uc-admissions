'use client'

import { useEffect, useState } from 'react'
import SchoolAutocomplete from './SchoolAutocomplete'
import { loadSchoolIndex } from '@/lib/school-client'
import { makeSlug } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import type { School } from '@/lib/types'

export default function SchoolFinder({ source = 'school_header' }: { source?: string }) {
  const [schools, setSchools] = useState<School[]>([])
  const [error, setError] = useState(false)
  function load() {
    setError(false)
    loadSchoolIndex().then(setSchools).catch(() => setError(true))
  }
  useEffect(() => { loadSchoolIndex().then(setSchools).catch(() => setError(true)) }, [])
  return (
    <div className="quick-school-finder" data-tool-controls>
      <label className="ctrl-label">Find a California high school</label>
      <SchoolAutocomplete placeholder="Search school name or city…" allSchools={schools} onSelect={school => {
        const href = `/school/${makeSlug(school.school_id, school.school_name)}`
        trackEvent('school_search_complete', { source, school_slug: makeSlug(school.school_id, school.school_name), target_url: href })
        window.location.assign(href)
      }} />
      {error && <p role="status">Search could not load. <button type="button" onClick={load}>Try again</button></p>}
    </div>
  )
}
