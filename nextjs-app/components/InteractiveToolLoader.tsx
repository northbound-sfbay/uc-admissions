'use client'

import dynamic from 'next/dynamic'

const InteractiveTool = dynamic(() => import('./InteractiveTool'), {
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

export default function InteractiveToolLoader() {
  return <InteractiveTool />
}
