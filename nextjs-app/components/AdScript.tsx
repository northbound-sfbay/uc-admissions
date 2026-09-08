'use client'

import { useEffect } from 'react'

// Initialize Journey after React has hydrated the document and its control layout.
// Real document navigation reinitializes ads; filters never refresh the wrapper.
export default function AdScript() {
  useEffect(() => {
    if (!['collegeacceptance.info', 'www.collegeacceptance.info'].includes(window.location.hostname)) return
    if (document.getElementById('journey-script')) return
    const script = document.createElement('script')
    script.id = 'journey-script'
    script.async = true
    script.setAttribute('data-noptimize', '1')
    script.setAttribute('data-cfasync', 'false')
    script.src = 'https://scripts.scriptwrapper.com/tags/aa59193f-60f2-447a-8f32-c32465b3f92b.js'
    document.head.appendChild(script)
  }, [])
  return null
}
