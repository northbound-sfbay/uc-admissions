'use client'

import dynamic from 'next/dynamic'
import type { InteractiveToolVariant } from './InteractiveTool'

type InteractiveToolLoaderProps = {
  variant?: InteractiveToolVariant
}

const InteractiveTool = dynamic<InteractiveToolLoaderProps>(() => import('./InteractiveTool'), {
  ssr: false,
  loading: () => (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <p className="loading-msg">Loading admissions data…</p>
      </div>
    </div>
  ),
})

export default function InteractiveToolLoader({ variant = 'home' }: InteractiveToolLoaderProps) {
  return <InteractiveTool variant={variant} />
}
