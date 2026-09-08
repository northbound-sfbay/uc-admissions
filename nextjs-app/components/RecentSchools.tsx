'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { trackEvent } from '@/lib/analytics'

type Entry = { slug: string; name: string }
const STORAGE_KEY = 'uc-recent-schools'
const UPDATE_EVENT = 'uc-recent-schools-updated'
function snapshot() {
  try { return localStorage.getItem(STORAGE_KEY) ?? '[]' } catch { return '[]' }
}
function entries(raw: string): Entry[] {
  try {
    const stored: unknown = JSON.parse(raw)
    return Array.isArray(stored) ? stored.filter((item): item is Entry => typeof item?.slug === 'string' && /^\d+-[a-z0-9-]+$/.test(item.slug) && typeof item?.name === 'string').slice(0, 6) : []
  } catch { return [] }
}
function subscribe(listener: () => void) {
  window.addEventListener('storage', listener)
  window.addEventListener(UPDATE_EVENT, listener)
  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener(UPDATE_EVENT, listener)
  }
}

export default function RecentSchools({ current }: { current?: Entry }) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => '[]')
  const slug = current?.slug
  const name = current?.name
  const schools = entries(stored).filter(item => item.slug !== slug)
  useEffect(() => {
    if (!slug || !name) return
    try {
      const previous = entries(snapshot()).filter(item => item.slug !== slug)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([{ slug, name }, ...previous].slice(0, 6)))
      window.dispatchEvent(new Event(UPDATE_EVENT))
    } catch { /* Storage is optional; browsing works without it. */ }
  }, [slug, name])
  if (!schools.length) return null
  return (
    <nav className="recent-schools" aria-label="Recently viewed schools" data-navigation-source="recent_schools">
      <span>Recently viewed</span>
      {schools.slice(0, 4).map(school => <a key={school.slug} href={`/school/${school.slug}`}>{school.name}</a>)}
      <button type="button" onClick={() => {
        try { localStorage.removeItem(STORAGE_KEY) } catch { /* Optional storage. */ }
        window.dispatchEvent(new Event(UPDATE_EVENT))
        trackEvent('recent_schools_clear')
      }}>Clear</button>
    </nav>
  )
}
