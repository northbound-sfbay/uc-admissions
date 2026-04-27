'use client'

import { useEffect } from 'react'
import { trackEvent, type AnalyticsParams } from '@/lib/analytics'

export default function ReportPreviewAnalytics({
  params,
}: {
  params: AnalyticsParams
}) {
  useEffect(() => {
    trackEvent('report_preview_open', params)
  }, [params])

  return null
}
