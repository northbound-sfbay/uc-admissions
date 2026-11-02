'use client'

import { useEffect } from 'react'
import { rememberSchoolNavigation } from '@/lib/school-journey'
import { trackEvent } from '@/lib/analytics'

export default function GrowthAnalytics() {
  useEffect(() => {
    function click(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest('a')
      if (!anchor || event.defaultPrevented) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return
      const placement = anchor.closest('[data-navigation-source]')?.getAttribute('data-navigation-source') ?? 'content'
      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && anchor.target !== '_blank') {
        rememberSchoolNavigation(url.href, placement)
      }
      trackEvent('internal_navigation', {
        source_page: window.location.pathname,
        target_path: url.pathname,
        target_type: url.pathname.split('/')[1] || 'tool',
        placement,
      })
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])
  return null
}
