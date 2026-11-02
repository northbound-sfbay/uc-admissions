'use client'

import { useEffect } from 'react'
import { completeSchoolNavigation } from '@/lib/school-journey'
import { trackEvent } from '@/lib/analytics'

interface Props {
  schoolSlug: string
  schoolName: string
  county: string
}

export default function SchoolPageAnalytics({ schoolSlug, schoolName, county }: Props) {
  useEffect(() => {
    let sourcePage = 'direct'

    if (document.referrer) {
      try {
        sourcePage = new URL(document.referrer).pathname || 'direct'
      } catch {
        sourcePage = 'direct'
      }
    }

    completeSchoolNavigation(schoolSlug)
    trackEvent('school_page_view', {
      school_slug: schoolSlug,
      school_name: schoolName,
      county,
      source_page: sourcePage,
    })
  }, [county, schoolName, schoolSlug])

  return null
}
