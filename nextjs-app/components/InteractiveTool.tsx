'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import TimeSeriesPanel from './TimeSeriesPanel'
import ComparePanel, { type CmpEntry } from './ComparePanel'
import { TYPE_DATA_URLS, COORDS_URL, NONPUBLIC_COORDS_URL, MAX_CMP, RECENT_YEARS } from '@/lib/constants'
import { schoolKey, makeSlug } from '@/lib/utils'
import type { School } from '@/lib/types'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false, loading: () => <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading map…</div> })

export default function InteractiveTool() {
  const COUNTY_PAGE_OPTIONS = [
    { label: 'Santa Clara', slug: 'santa-clara' },
    { label: 'Alameda', slug: 'alameda' },
    { label: 'Los Angeles', slug: 'los-angeles' },
    { label: 'Orange', slug: 'orange' },
    { label: 'San Diego', slug: 'san-diego' },
  ]

  const [allSchools,    setAllSchools]    = useState<School[]>([])
  const [schoolsByType, setSchoolsByType] = useState<Record<string, School[]>>({})
  const [loadedTypes,   setLoadedTypes]   = useState<Set<string>>(new Set())
  const [schoolCoords,  setSchoolCoords]  = useState<Record<string, { lat: number; lng: number }>>({})
  const [allCounties,   setAllCounties]   = useState<string[]>([])
  const [loading,       setLoading]       = useState(true)
  const [loadingMsg,    setLoadingMsg]    = useState('Loading admissions data…')

  const [tsSelectedSchool, setTsSelectedSchool] = useState<School | null>(null)
  const [tsCampus,         setTsCampus]         = useState('universitywide')
  const [tsEthnicity,      setTsEthnicity]      = useState('all')
  const [tsInput,          setTsInput]          = useState('')

  const [cmpSelected,   setCmpSelected]   = useState<CmpEntry[]>([])
  const [cmpCampus,     setCmpCampus]     = useState('universitywide')
  const [cmpEthnicity,  setCmpEthnicity]  = useState('all')
  const [countyPageSlug, setCountyPageSlug] = useState('santa-clara')

  const allSchoolsRef    = useRef<School[]>([])
  const schoolsByTypeRef = useRef<Record<string, School[]>>({})
  const loadedTypesRef   = useRef<Set<string>>(new Set())
  const schoolCoordsRef  = useRef<Record<string, { lat: number; lng: number }>>({})

  // Initial data load
  useEffect(() => {
    async function load() {
      setLoadingMsg('Loading admissions data…')
      const [caPublic, caPrivate, pubCoords, nonpubCoords] = await Promise.all([
        fetch(TYPE_DATA_URLS['CA Public']).then(r => r.json() as Promise<School[]>),
        fetch(TYPE_DATA_URLS['CA Private']).then(r => r.json() as Promise<School[]>).catch(() => [] as School[]),
        fetch(COORDS_URL).then(r => r.json() as Promise<{ school_type?: string; school_id: string; lat: number; lng: number }[]>),
        fetch(NONPUBLIC_COORDS_URL).then(r => r.json() as Promise<{ school_type?: string; school_id: string; lat: number; lng: number }[]>).catch(() => []),
      ])

      const byType: Record<string, School[]> = {
        'CA Public':  caPublic,
        'CA Private': caPrivate,
      }
      const loaded = new Set(['CA Public', 'CA Private'])
      const coords: Record<string, { lat: number; lng: number }> = {}
      for (const c of [...pubCoords, ...nonpubCoords]) {
        coords[`${c.school_type ?? 'CA Public'}:${c.school_id}`] = { lat: c.lat, lng: c.lng }
      }

      const all = [...caPublic, ...caPrivate]
      const counties = [...new Set(caPublic.map(s => s.county).filter(Boolean))].sort()

      schoolsByTypeRef.current = byType
      loadedTypesRef.current   = loaded
      allSchoolsRef.current    = all
      schoolCoordsRef.current  = coords

      setSchoolsByType(byType)
      setLoadedTypes(new Set(loaded))
      setAllSchools(all)
      setSchoolCoords(coords)
      setAllCounties(counties)
      setLoading(false)

      // Set default school
      const def = caPublic.find(s => s.school_name.toUpperCase().includes('PALO ALTO') && s.school_name.toUpperCase().includes('HIGH')) ?? caPublic[0]
      if (def) selectTsSchool(def, { updateUrl: false, updateMeta: false })

      // Default compare
      const defaults = [
        caPublic.find(s => s.school_name.toUpperCase().includes('PALO ALTO SENIOR HIGH')),
        caPublic.find(s => s.school_name.toUpperCase().includes('LOWELL HIGH SCHOOL') && s.city === 'San Francisco'),
      ].filter(Boolean) as School[]
      setCmpSelected(defaults.map((school, i) => ({ school, colorIdx: i })))

      // Apply URL param
      const id = new URLSearchParams(window.location.search).get('school')
      if (id) {
        const found = all.find(s => s.school_id === id)
        if (found) selectTsSchool(found)
      }

      // Background-load Foreign
      fetch(TYPE_DATA_URLS['Foreign']).then(r => r.json() as Promise<School[]>).then(schools => {
        schoolsByTypeRef.current['Foreign'] = schools
        loadedTypesRef.current.add('Foreign')
        const next = Object.values(schoolsByTypeRef.current).flat()
        allSchoolsRef.current = next
        setSchoolsByType({ ...schoolsByTypeRef.current })
        setLoadedTypes(new Set(loadedTypesRef.current))
        setAllSchools(next)
      }).catch(() => {})
    }

    load().catch(err => {
      setLoadingMsg('Failed to load data: ' + err.message)
    })
  }, [])

  function selectTsSchool(
    school: School,
    options: { updateUrl?: boolean; updateMeta?: boolean } = {}
  ) {
    const { updateUrl = true, updateMeta = true } = options
    setTsSelectedSchool(school)
    setTsInput(school.school_name)

    if (updateUrl) {
      const slug = makeSlug(school.school_id, school.school_name)
      window.history.replaceState(null, '', `/school/${slug}`)
    }

    if (updateMeta) {
      document.title = `${school.school_name} | UC Admissions | collegeacceptance.info`
      document.querySelector('meta[name="description"]')?.setAttribute('content',
        `UC admissions data for ${school.school_name}, ${school.city}. View trends from 1994–2025.`)
    }
  }

  const handleSelectTsSchool = useCallback((school: School) => {
    selectTsSchool(school)
  }, [])

  const handleMapSchoolClick = useCallback((school: School) => {
    selectTsSchool(school)
    setCmpSelected(prev => {
      const key = schoolKey(school)
      if (prev.some(e => schoolKey(e.school) === key)) return prev
      if (prev.length >= MAX_CMP) return prev
      return [...prev, { school, colorIdx: prev.length }]
    })
  }, [])

  const handleAddCmp = useCallback((school: School) => {
    setCmpSelected(prev => {
      const key = schoolKey(school)
      if (prev.some(e => schoolKey(e.school) === key)) return prev
      if (prev.length >= MAX_CMP) return prev
      return [...prev, { school, colorIdx: prev.length }]
    })
  }, [])

  const handleRemoveCmp = useCallback((key: string) => {
    setCmpSelected(prev => {
      const next = prev.filter(e => schoolKey(e.school) !== key)
      return next.map((e, i) => ({ ...e, colorIdx: i }))
    })
  }, [])

  const ensureTypeLoaded = useCallback(async (type: string) => {
    if (loadedTypesRef.current.has(type) || !TYPE_DATA_URLS[type]) return
    const schools = await fetch(TYPE_DATA_URLS[type]).then(r => r.json() as Promise<School[]>).catch(() => [] as School[])
    schoolsByTypeRef.current[type] = schools
    loadedTypesRef.current.add(type)
    const next = Object.values(schoolsByTypeRef.current).flat()
    allSchoolsRef.current = next
    setSchoolsByType({ ...schoolsByTypeRef.current })
    setLoadedTypes(new Set(loadedTypesRef.current))
    setAllSchools(next)
    setSchoolCoords({ ...schoolCoordsRef.current })
  }, [])

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <p className="loading-msg">{loadingMsg}</p>
          </div>
        </div>
      )}

      <header>
        <div className="header-inner">
          <h1>UC Admissions by California High School</h1>
          <p className="subtitle">Fall 1994 – 2025 · Applicants, Admits &amp; Enrollees by school, campus, and ethnicity</p>
        </div>
      </header>

      <main>
        <section className="seo-intro" aria-label="About this tool">
          <p>This tool lets you look up <strong>University of California admissions data</strong> for any California high school from <strong>Fall 1994 through Fall 2025</strong>. Browse applicant counts, admission rates, and enrollment numbers across all nine undergraduate UC campuses — Berkeley, Los Angeles, San Diego, Davis, Santa Barbara, Irvine, Santa Cruz, Riverside, and Merced — broken down by ethnicity. Data is sourced from the <a href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school" rel="noopener">UC Information Center</a>.</p>
        </section>

        <div className="notes-bar">
          <div className="notes-title">Notes</div>
          <ul>
            <li>Universitywide applicant counts reflect <strong>applications</strong>, not unique students — a student applying to multiple campuses is counted once per campus.</li>
            <li>UC moved to an online application system around <strong>2002</strong>.</li>
            <li>Since <strong>1986</strong>, students can apply to multiple UC campuses in a single application (<a href="https://www.latimes.com/archives/la-xpm-1985-05-20-mn-16535-story.html" target="_blank" rel="noopener">LA Times, 1985</a>).</li>
          </ul>
        </div>

        <div className="charts-row">
          <TimeSeriesPanel
            allSchools={allSchools}
            selectedSchool={tsSelectedSchool}
            campus={tsCampus}
            ethnicity={tsEthnicity}
            onSelectSchool={handleSelectTsSchool}
            onCampusChange={setTsCampus}
            onEthnicityChange={setTsEthnicity}
            tsInput={tsInput}
            onTsInputChange={v => { setTsInput(v) }}
          />
          <ComparePanel
            allSchools={allSchools}
            selected={cmpSelected}
            campus={cmpCampus}
            ethnicity={cmpEthnicity}
            onAdd={handleAddCmp}
            onRemove={handleRemoveCmp}
            onCampusChange={setCmpCampus}
            onEthnicityChange={setCmpEthnicity}
          />
        </div>

        {!loading && (
          <LeafletMap
            allSchools={allSchools}
            schoolsByType={schoolsByType}
            loadedTypes={loadedTypes}
            schoolCoords={schoolCoords}
            allCounties={allCounties}
            onSchoolClick={handleMapSchoolClick}
            onEnsureTypeLoaded={ensureTypeLoaded}
          />
        )}

        <section className="county-entry-panel" aria-label="Browse by county">
          <div className="county-entry-copy">
            <div className="ctrl-label">Browse by County</div>
            <p>
              Explore feeder schools, admit rates, and countywide UC trends.
            </p>
          </div>
          <div className="county-entry-actions">
            <div className="filter-group county-entry-select">
              <label className="ctrl-label" htmlFor="county-page-select">County</label>
              <select
                id="county-page-select"
                value={countyPageSlug}
                onChange={e => setCountyPageSlug(e.target.value)}
              >
                {COUNTY_PAGE_OPTIONS.map(option => (
                  <option key={option.slug} value={option.slug}>{option.label}</option>
                ))}
              </select>
            </div>
            <a className="county-entry-link" href={`/county/${countyPageSlug}`}>
              View county page →
            </a>
          </div>
        </section>
      </main>

      <footer>
        <p>Data: <a href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school" target="_blank" rel="noopener">UC Information Center</a> · School locations: California Dept. of Education &amp; OpenStreetMap contributors · Map: © CARTO · <a href="/about">About this site</a> · <a href="/privacy">Privacy Policy</a></p>
      </footer>
    </>
  )
}
