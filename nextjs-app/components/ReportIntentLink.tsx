'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { trackEvent, type AnalyticsParams } from '@/lib/analytics'

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  eventName?: string
  eventParams?: AnalyticsParams
  children: ReactNode
}

export default function ReportIntentLink({
  href,
  eventName = 'report_cta_click',
  eventParams = {},
  children,
  onClick,
  ...props
}: Props) {
  return (
    <a
      href={href}
      onClick={event => {
        trackEvent(eventName, eventParams)
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
