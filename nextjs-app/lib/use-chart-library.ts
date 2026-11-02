'use client'

import { useEffect, useState } from 'react'
import type { Chart as ChartType } from 'chart.js'

type ChartConstructor = typeof ChartType
let library: Promise<ChartConstructor> | undefined

function loadCharts() {
  if (!library) {
    library = import('./chart-library').then(module => module.Chart)
      .catch(error => { library = undefined; throw error })
  }
  return library
}

// Search controls render first. Both panels share one deferred library request.
export function useChartLibrary() {
  const [Chart, setChart] = useState<ChartConstructor | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancelled = false
    const load = () => {
      void loadCharts().then(value => { if (!cancelled) setChart(() => value) })
        .catch(() => { if (!cancelled) setFailed(true) })
    }
    const idle = 'requestIdleCallback' in window
    const handle = idle ? window.requestIdleCallback(load, { timeout: 1500 }) : window.setTimeout(load, 0)
    return () => {
      cancelled = true
      if (idle) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
    }
  }, [])
  return { Chart, failed }
}
