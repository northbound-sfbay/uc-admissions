'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { RECENT_YEARS, TYPE_DATA_URLS, TYPE_MAP_VIEW, CAMPUSES } from '@/lib/constants'
import { getYearData, yieldRate, fmt, pct, admitColor, schoolKey } from '@/lib/utils'
import type { School } from '@/lib/types'

interface Props {
  allSchools: School[]
  schoolsByType: Record<string, School[]>
  loadedTypes: Set<string>
  schoolCoords: Record<string, { lat: number; lng: number }>
  allCounties: string[]
  onSchoolClick: (school: School) => void
  onEnsureTypeLoaded: (type: string) => Promise<void>
}

const CA_TYPES = new Set(['CA Public', 'CA Private', 'Other'])

export default function LeafletMap({
  allSchools, schoolsByType, loadedTypes, schoolCoords, allCounties,
  onSchoolClick, onEnsureTypeLoaded,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<import('leaflet').Map | null>(null)
  const markersRef      = useRef<import('leaflet').CircleMarker[]>([])
  const markerByIdRef   = useRef<Map<string, import('leaflet').CircleMarker>>(new Map())
  const countyLayerRef  = useRef<import('leaflet').GeoJSON | null>(null)
  const typeDropPanelRef = useRef<HTMLDivElement>(null)

  const [mapYear,       setMapYear]       = useState(() => String(new Date().getFullYear() - 1))
  const [mapCampus,     setMapCampus]     = useState('universitywide')
  const [mapCounty,     setMapCounty]     = useState('')
  const [mapSchoolInput, setMapSchoolInput] = useState('')
  const [typeDropOpen,  setTypeDropOpen]  = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['CA Public'])
  const [schoolCount,   setSchoolCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [mapReady,      setMapReady]      = useState(false)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return
    import('leaflet').then(L => {
      const map = L.map(mapContainerRef.current!, { center: [37.0, -119.5], zoom: 6 })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map)
      mapRef.current = map
      setMapReady(true)

      // Load county outlines
      fetch('/data/ca_counties.geojson').then(r => r.json()).then(geojson => {
        countyLayerRef.current = L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0], {
          style: { color: '#6b7280', weight: 0.8, fillOpacity: 0, opacity: 0.5 },
          onEachFeature(feature, layer) {
            (layer as { _countyName?: string })._countyName = feature.properties?.name ?? ''
          },
        }).addTo(map)
      }).catch(() => {})
    })
  }, [])

  // Update markers whenever relevant state changes (including after map init)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    import('leaflet').then(L => updateMap(L))
  }, [allSchools, schoolCoords, mapYear, mapCampus, mapCounty, selectedTypes, mapReady])

  function updateMap(L: typeof import('leaflet')) {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    markerByIdRef.current.clear()

    const showCounty = selectedTypes.length === 0 || selectedTypes.some(t => CA_TYPES.has(t))
    if (countyLayerRef.current) {
      countyLayerRef.current.setStyle({ opacity: showCounty ? 0.5 : 0, fillOpacity: 0 })
    }

    let count = 0
    for (const school of allSchools) {
      if (selectedTypes.length > 0 && !selectedTypes.includes(school.school_type)) continue
      if (!RECENT_YEARS.some(yr => (school.years?.[yr]?.app ?? 0) > 0)) continue

      const coord = schoolCoords[schoolKey(school)]
      if (!coord) continue

      if (mapCounty && CA_TYPES.has(school.school_type)) {
        if (school.county !== mapCounty) continue
      }

      const yearObj = school.years?.[mapYear]
      const d = getYearData(yearObj, mapCampus, 'all')
      if (!d && mapCampus !== 'universitywide') continue

      const color = admitColor(d?.admit_rate ?? null)
      const marker = L.circleMarker([coord.lat, coord.lng], {
        radius: 6, fillColor: color,
        color: 'rgba(0,0,0,.28)', weight: 1, fillOpacity: 0.82,
      })

      const typeLabel = school.school_type && school.school_type !== 'CA Public'
        ? `<div class="tt-row"><span class="tt-label">Type</span><span class="tt-value">${school.school_type}</span></div>` : ''

      marker.bindTooltip(`
        <div class="map-tooltip">
          <div class="tt-name">${school.school_name}</div>
          <div class="tt-loc">${school.city}${school.county ? ', ' + school.county : ''}</div>
          ${typeLabel}
          <div class="tt-row"><span class="tt-label">Applicants</span><span class="tt-value">${fmt(d?.app)}</span></div>
          <div class="tt-row"><span class="tt-label">Admit Rate</span><span class="tt-value">${pct(d?.admit_rate)}</span></div>
          <div class="tt-row"><span class="tt-label">Yield Rate</span><span class="tt-value">${pct(yieldRate(d))}</span></div>
          <div class="tt-row"><span class="tt-label">Enrollees</span><span class="tt-value">${fmt(d?.enr)}</span></div>
        </div>`, { sticky: true, opacity: 1, className: '' })

      marker.on('click', () => {
        onSchoolClick(school)
        if (window.innerWidth < 900) {
          document.querySelector('.charts-row')?.scrollIntoView({ behavior: 'smooth' })
        }
      })

      const key = schoolKey(school)
      marker.addTo(map)
      markersRef.current.push(marker)
      markerByIdRef.current.set(key, marker)
      count++
    }
    setSchoolCount(count)
  }

  function flashMarker(key: string) {
    const marker = markerByIdRef.current.get(key)
    if (!marker) return
    let flashes = 0
    const origColor = (marker.options as { fillColor?: string }).fillColor ?? '#888'
    const interval = setInterval(() => {
      const hl = flashes % 2 === 0
      marker.setStyle({ fillColor: hl ? '#fff' : origColor, radius: hl ? 10 : 6 })
      if (++flashes >= 6) { clearInterval(interval); marker.setStyle({ fillColor: origColor, radius: 6 }) }
    }, 250)
  }

  function highlightCounty(countyName: string) {
    if (!countyLayerRef.current) return
    countyLayerRef.current.eachLayer(layer => {
      const l = layer as import('leaflet').Path & { _countyName?: string }
      const match = countyName && l._countyName?.toLowerCase() === countyName.toLowerCase()
      l.setStyle({ color: match ? '#003262' : '#6b7280', weight: match ? 2.5 : 0.8, fillOpacity: match ? 0.06 : 0, opacity: match ? 1 : 0.5 })
      if (match && 'getBounds' in l && mapRef.current) {
        mapRef.current.flyToBounds((l as import('leaflet').Polygon).getBounds(), { padding: [30, 30], duration: 0.6 })
      }
    })
  }

  async function handleTypeChange(type: string, checked: boolean) {
    const next = checked ? [...selectedTypes, type] : selectedTypes.filter(t => t !== type)
    setSelectedTypes(next)
    if (checked && !loadedTypes.has(type)) {
      setLoading(true)
      await onEnsureTypeLoaded(type)
      setLoading(false)
    }
    if (next.length === 1 && checked) {
      const view = TYPE_MAP_VIEW[next[0]] ?? TYPE_MAP_VIEW['CA Public']
      mapRef.current?.setView(view.center, view.zoom, { animate: true, duration: 0.8 })
    }
  }

  // Build year options
  const yearOptions = Array.from({ length: 32 }, (_, i) => String(2025 - i))

  return (
    <div className="map-card">
      <div className="map-controls">
        {/* School finder */}
        <div className="map-school-picker">
          <label className="ctrl-label">Find School</label>
          <div className="school-search-wrap">
            <input
              className="school-input"
              type="text"
              placeholder="Search school…"
              value={mapSchoolInput}
              autoComplete="off"
              onChange={e => {
                setMapSchoolInput(e.target.value)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const q = mapSchoolInput.toLowerCase()
                  const found = allSchools.find(s => s.school_name.toLowerCase().includes(q))
                  if (found) {
                    const key = schoolKey(found)
                    const coord = schoolCoords[key]
                    if (coord && mapRef.current) {
                      mapRef.current.flyTo([coord.lat, coord.lng], 13, { duration: 0.8 })
                      setTimeout(() => flashMarker(key), 900)
                    }
                    setMapSchoolInput('')
                  }
                }
              }}
            />
          </div>
        </div>

        {/* School type */}
        <div className="filter-group">
          <span className="ctrl-label">School Type</span>
          <div className="type-dropdown">
            <button
              className="type-dropdown-btn"
              type="button"
              onClick={() => setTypeDropOpen(o => !o)}
            >
              {selectedTypes.length === 0 ? 'All types' :
               selectedTypes.length === 1 ? selectedTypes[0] :
               selectedTypes.length === 2 ? selectedTypes.join(', ') :
               `${selectedTypes.length} types selected`}
            </button>
            <div ref={typeDropPanelRef} className={`type-dropdown-panel${typeDropOpen ? '' : ' hidden'}`}>
              {['CA Public', 'CA Private', 'Non-CA Domestic', 'Foreign', 'Other'].map(type => (
                <label key={type} className="type-check">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={e => handleTypeChange(type, e.target.checked)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* County */}
        {(selectedTypes.length === 0 || selectedTypes.some(t => CA_TYPES.has(t))) && (
          <div className="filter-group">
            <label className="ctrl-label">County</label>
            <select value={mapCounty} onChange={e => { setMapCounty(e.target.value); highlightCounty(e.target.value) }}>
              <option value="">All counties</option>
              {allCounties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Campus */}
        <div className="filter-group">
          <label className="ctrl-label">Campus</label>
          <select value={mapCampus} onChange={e => setMapCampus(e.target.value)}>
            {CAMPUSES.map(c => <option key={c} value={c}>{c === 'universitywide' ? 'Universitywide' : c}</option>)}
          </select>
        </div>

        {/* Year */}
        <div className="filter-group">
          <label className="ctrl-label">Year</label>
          <select value={mapYear} onChange={e => setMapYear(e.target.value)}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Legend */}
        <div className="map-legend-inline">
          <span className="ctrl-label">Admit Rate</span>
          <div className="map-legend">
            <span className="dot high"></span><span>≥75%</span>
            <span className="dot mid"></span><span>50–74%</span>
            <span className="dot low"></span><span>&lt;50%</span>
          </div>
        </div>

        <span className="map-school-count">
          {loading ? 'Loading…' : `${schoolCount.toLocaleString()} schools`}
        </span>
      </div>

      {/* Close dropdown on outside click */}
      {typeDropOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          onClick={() => setTypeDropOpen(false)}
        />
      )}

      <div ref={mapContainerRef} className="map-container" />
    </div>
  )
}
