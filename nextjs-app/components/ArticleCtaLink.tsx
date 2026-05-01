'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { trackEvent, type AnalyticsParams } from '@/lib/analytics'

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  eventParams?: AnalyticsParams
  children: ReactNode
}

export default function ArticleCtaLink({
  href,
  eventParams = {},
  children,
  onClick,
  ...props
}: Props) {
  return (
    <a
      href={href}
      onClick={event => {
        trackEvent('article_cta_click', {
          target_url: href,
          ...eventParams,
        })
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
