'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function GrowthAnalytics() {
  useEffect(() => {
    function click(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest('a')
      if (!anchor || event.defaultPrevented) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return
      trackEvent('internal_navigation', {
        source_page: window.location.pathname,
        target_path: url.pathname,
        target_type: url.pathname.split('/')[1] || 'tool',
        placement: anchor.closest('[data-navigation-source]')?.getAttribute('data-navigation-source') ?? 'content',
      })
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])
  return null
}
