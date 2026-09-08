'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import TimeSeriesPanel from './TimeSeriesPanel'
import ComparePanel, { type CmpEntry } from './ComparePanel'
import RecentSchools from './RecentSchools'
import { trackEvent } from '@/lib/analytics'
import { loadSchool, loadSchoolIndex } from '@/lib/school-client'
import { readToolState, toolHref } from '@/lib/tool-state'
import { TYPE_DATA_URLS, COORDS_URL, NONPUBLIC_COORDS_URL, MAX_CMP } from '@/lib/constants'
import { FEEDER_CAMPUSES } from '@/lib/feeder-options'
import { schoolKey, makeSlug } from '@/lib/utils'
import type { School } from '@/lib/types'

export type InteractiveToolVariant = 'home' | 'uc-rates'
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false, loading: () => <p role="status">Loading map…</p> })

export default function InteractiveTool() {
  const [allSchools, setAllSchools] = useState<School[]>([])
  const [tsSelectedSchool, setTsSelectedSchool] = useState<School | null>(null)
  const [tsCampus, setTsCampus] = useState('universitywide')
  const [tsEthnicity, setTsEthnicity] = useState('all')
  const [tsInput, setTsInput] = useState('')
  const [cmpSelected, setCmpSelected] = useState<CmpEntry[]>([])
  const [cmpCampus, setCmpCampus] = useState('universitywide')
  const [cmpEthnicity, setCmpEthnicity] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [shareStatus, setShareStatus] = useState('')
  const [shareFallback, setShareFallback] = useState('')
  const [schoolsByType, setSchoolsByType] = useState<Record<string, School[]>>({})
  const [loadedTypes, setLoadedTypes] = useState<Set<string>>(new Set())
  const [schoolCoords, setSchoolCoords] = useState<Record<string, { lat: number; lng: number }>>({})
  const [showMap, setShowMap] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)
  const typeRequests = useRef(new Map<string, Promise<void>>())
  const selectionRequest = useRef(0)
  const pendingComparisons = useRef(new Set<string>())

  useEffect(() => {
    let cancelled = false
    async function initialize() {
      setLoading(true)
      setError('')
      const index = await loadSchoolIndex()
      if (cancelled) return
      setAllSchools(index)
      const state = readToolState(window.location.search)
      setTsCampus(state.campus)
      setTsEthnicity(state.ethnicity)
      setCmpCampus(state.compareCampus)
      setCmpEthnicity(state.compareEthnicity)
      const selected = index.find(s => s.school_id === (state.school || '52350')) ?? index[0]
      const ids = state.hasCompare ? state.compare : [selected.school_id, '52970']
      const comparisonSchools = ids.map(id => index.find(s => s.school_id === id)).filter((s): s is School => Boolean(s))
      const [school, comparison] = await Promise.all([loadSchool(selected), Promise.all(comparisonSchools.map(loadSchool))])
      if (cancelled) return
      setTsSelectedSchool(school)
      setTsInput(school.school_name)
      setCmpSelected(comparison.map((item, i) => ({ school: item, colorIdx: i })))
      if (state.school && !index.some(item => item.school_id === state.school)) setError('That school link was not found. Search for a school below.')
      setLoading(false)
    }
    initialize().catch(() => {
      if (!cancelled) { setLoading(false); setError('School data could not load. Please try again.') }
    })
    return () => { cancelled = true }
  }, [retry])

  async function selectSchool(summary: School, source = 'school_search') {
    const request = ++selectionRequest.current
    setTsInput(summary.school_name)
    setError('')
    try {
      const school = await loadSchool(summary)
      if (request !== selectionRequest.current) return
      setTsSelectedSchool(school)
      trackEvent('school_search_complete', { source, school_slug: makeSlug(school.school_id, school.school_name) })
      trackEvent('comparison_intent', { interaction_type: 'select_school', school_slug: makeSlug(school.school_id, school.school_name) })
    } catch { if (request === selectionRequest.current) setError('This school could not load. Select it again to retry.') }
  }

  async function addComparison(summary: School) {
    const key = schoolKey(summary)
    if (cmpSelected.some(entry => schoolKey(entry.school) === key) || pendingComparisons.current.has(key)) return
    if (cmpSelected.length + pendingComparisons.current.size >= MAX_CMP) { setError(`You can compare up to ${MAX_CMP} schools. Remove one to add another.`); return }
    pendingComparisons.current.add(key)
    setError('')
    try {
      const school = await loadSchool(summary)
      setCmpSelected(previous => previous.some(entry => schoolKey(entry.school) === key) || previous.length >= MAX_CMP
        ? previous : [...previous, { school, colorIdx: previous.length }])
      trackEvent('comparison_intent', { interaction_type: 'add_compare_school', school_slug: makeSlug(school.school_id, school.school_name) })
    } catch { setError('This comparison could not load. Select the school again to retry.') }
    finally { pendingComparisons.current.delete(key) }
  }

  function changeFilter(type: string, value: string, update: (value: string) => void) {
    update(value)
    trackEvent('comparison_intent', { interaction_type: type, selection: value })
  }

  async function shareComparison() {
    if (!tsSelectedSchool) return
    const chosen = [tsSelectedSchool, ...cmpSelected.map(entry => entry.school)]
    if (chosen.some(s => !['CA Public', 'CA Private'].includes(s.school_type))) {
      setShareStatus('Share links currently support California public and private high schools.')
      return
    }
    const href = window.location.origin + toolHref(tsSelectedSchool.school_id, cmpSelected.map(entry => entry.school.school_id), tsCampus, tsEthnicity, cmpCampus, cmpEthnicity)
    try {
      await navigator.clipboard.writeText(href)
      setShareFallback('')
      setShareStatus('Comparison link copied.')
      trackEvent('comparison_share', { school_count: cmpSelected.length, method: 'copy_link' })
    } catch { setShareFallback(href); setShareStatus('Copy this link to share your comparison.') }
  }

  function ensureTypeLoaded(type: string): Promise<void> {
    const existing = typeRequests.current.get(type)
    if (existing) return existing
    const url = TYPE_DATA_URLS[type]
    if (!url) return Promise.resolve()
    const request = fetch(url).then(response => {
      if (!response.ok) throw new Error('Map data could not load.')
      return response.json() as Promise<School[]>
    }).then(schools => {
      setSchoolsByType(previous => ({ ...previous, [type]: schools }))
      setLoadedTypes(previous => new Set([...previous, type]))
      setAllSchools(previous => {
        const merged = new Map(previous.map(s => [schoolKey(s), s]))
        schools.forEach(s => merged.set(schoolKey(s), s))
        return [...merged.values()]
      })
    }).catch(error => { typeRequests.current.delete(type); throw error })
    typeRequests.current.set(type, request)
    return request
  }

  async function openMap() {
    setMapLoading(true)
    setError('')
    try {
      const [, , coords] = await Promise.all([
        ensureTypeLoaded('CA Public'), ensureTypeLoaded('CA Private'),
        Promise.all([COORDS_URL, NONPUBLIC_COORDS_URL].map(url => fetch(url).then(response => {
          if (!response.ok) throw new Error('School locations could not load.')
          return response.json() as Promise<{ school_type?: string; school_id: string; lat: number; lng: number }[]>
        }))),
      ])
      setSchoolCoords(Object.fromEntries(coords.flat().map(c => [`${c.school_type ?? 'CA Public'}:${c.school_id}`, { lat: c.lat, lng: c.lng }])))
      setShowMap(true)
      trackEvent('map_open')
    } catch { setError('The map could not load. You can still search schools, or try opening the map again.') }
    finally { setMapLoading(false) }
  }

  const counties = [...new Set(allSchools.filter(s => s.school_type === 'CA Public').map(s => s.county).filter(Boolean))].sort()
  return (
    <section id="school-tool" className="school-tool" aria-label="Search and compare high schools">
      {loading && <p className="tool-status" role="status">Loading school search and selected histories…</p>}
      {error && <p className="tool-status" role="alert">{error} <button type="button" onClick={() => setRetry(value => value + 1)}>Reload school search</button></p>}
      <div className="charts-row tool-charts" inert={loading} aria-busy={loading}>
        <TimeSeriesPanel allSchools={allSchools} selectedSchool={tsSelectedSchool} campus={tsCampus} ethnicity={tsEthnicity}
          onSelectSchool={school => { void selectSchool(school) }} onCampusChange={value => changeFilter('timeseries_campus_change', value, setTsCampus)}
          onEthnicityChange={value => changeFilter('timeseries_ethnicity_change', value, setTsEthnicity)} tsInput={tsInput} onTsInputChange={setTsInput} />
        <ComparePanel allSchools={allSchools} selected={cmpSelected} campus={cmpCampus} ethnicity={cmpEthnicity}
          onAdd={school => { void addComparison(school) }} onRemove={key => setCmpSelected(previous => previous.filter(entry => schoolKey(entry.school) !== key).map((entry, i) => ({ ...entry, colorIdx: i })))}
          onCampusChange={value => changeFilter('compare_campus_change', value, setCmpCampus)} onEthnicityChange={value => changeFilter('compare_ethnicity_change', value, setCmpEthnicity)} />
      </div>
      <div className="comparison-actions" data-tool-controls>
        <button className="county-entry-link" type="button" disabled={!tsSelectedSchool} onClick={() => { void shareComparison() }}>Copy comparison link</button>
        <span role="status">{shareStatus}</span>
        {shareFallback && <input aria-label="Comparison link" readOnly value={shareFallback} onFocus={event => event.target.select()} />}
      </div>
      <RecentSchools />
      <nav className="discovery-links" aria-label="Browse campus feeder schools" data-navigation-source="tool_campuses">
        {FEEDER_CAMPUSES.map(campus => <a key={campus.slug} href={`/feeder-schools/${campus.slug}`}>{campus.label} feeder schools</a>)}
        <a href="/rankings">Statewide rankings</a>
      </nav>
      <details className="tool-notes"><summary>How to read these figures</summary>
        <p>Universitywide applicant counts reflect applications across campuses, not unique students. Admit rate is admits divided by applicants; enrollment yield is enrollees divided by admits. These historical outcomes are not individual admission predictions.</p>
        <a href="/insights/uc-admissions-by-source-school">Read the source-school methodology</a>
      </details>
      <section className="map-entry" aria-label="Explore the school map">
        <h2>Explore schools on the map</h2>
        <p>Browse locations, counties, campus results, and school types.</p>
        {!showMap && <button type="button" className="county-entry-link" onClick={() => { void openMap() }} disabled={mapLoading}>{mapLoading ? 'Loading map and school locations…' : 'Open interactive map'}</button>}
        {showMap && <LeafletMap allSchools={allSchools} schoolsByType={schoolsByType} loadedTypes={loadedTypes} schoolCoords={schoolCoords} allCounties={counties}
          onSchoolClick={school => { void selectSchool(school, 'map'); void addComparison(school) }}
          onEnsureTypeLoaded={async type => { try { await ensureTypeLoaded(type) } catch { setError('This school type could not load. Please try again.') } }} />}
      </section>
      <noscript><p>Interactive charts need JavaScript. You can browse <a href="/rankings">school rankings</a> and <a href="/feeder-schools/ucla">campus feeder pages</a> without it.</p></noscript>
    </section>
  )
}
