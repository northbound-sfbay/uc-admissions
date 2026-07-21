'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { Chart, registerables } from 'chart.js'
import { trackEvent } from '@/lib/analytics'

Chart.register(...registerables)

type OutcomeYear = {
  key: string
  label: string
}

type Destination = {
  name: string
  students: number
  ficeCode?: string | null
}

type OutcomeYearData = {
  graduates: number | null
  trackableGraduates: number | null
  enrolled: number | null
  enrollmentRate: number | null
  coverageGap: number | null
  coverageGapRate: number | null
  notFound: number | null
  notTrackable: number | null
  destinations?: Destination[]
  topDestinations?: Destination[]
}

type OutcomeSchool = {
  id: string
  schoolName: string
  district: string
  county: string
  state: string
  latestYear: string | null
  years: Record<string, OutcomeYearData>
}

type StateOutcomeDataset = {
  stateSlug: string
  stateName: string
  abbreviation: string
  generatedAt: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
  years: OutcomeYear[]
  rateLabel: string
  coverageGapLabel: string
  primaryCountLabel?: string
  secondaryCountLabel?: string
  detailTitle?: string
  emptyDetailText?: string
  schools: OutcomeSchool[]
}

type Props = {
  stateSlug: string
  stateName: string
}

function formatCount(value: number | null | undefined): string {
  return value == null ? 'Suppressed' : value.toLocaleString()
}

function formatRate(value: number | null | undefined): string {
  return value == null ? 'Suppressed' : `${value.toFixed(1)}%`
}

function schoolSubtitle(school: OutcomeSchool): string {
  return [school.district, school.county ? `${school.county} County` : '']
    .filter(Boolean)
    .join(' · ')
}

function defaultSchoolId(dataset: StateOutcomeDataset): string {
  const latestYear = dataset.years[dataset.years.length - 1]?.key
  const traditionalSchool = dataset.schools.find(school => {
    const name = school.schoolName.toLowerCase()
    return !name.includes('virtual') && !name.includes('online') && !!school.years[latestYear]
  })
  return traditionalSchool?.id ?? dataset.schools[0]?.id ?? ''
}

function schoolProfileHref(stateSlug: string, school: OutcomeSchool): string | null {
  if (stateSlug !== 'texas') return null
  const nameSlug = school.schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `/states/texas/high-schools/${school.id}-${nameSlug}`
}

export default function StateOutcomeExplorer({ stateSlug, stateName }: Props) {
  const [data, setData] = useState<StateOutcomeDataset | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(-1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/data/state-outcomes/${stateSlug}.json`)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load ${stateName} outcome data`)
        return response.json() as Promise<StateOutcomeDataset>
      })
      .then(dataset => {
        if (cancelled) return
        setError('')
        setData(dataset)
        setSelectedId(defaultSchoolId(dataset))
      })
      .catch((reason: Error) => {
        if (cancelled) return
        setError(reason.message)
      })

    return () => {
      cancelled = true
    }
  }, [stateSlug, stateName])

  const selectedSchool = useMemo(() => {
    if (!data) return null
    return data.schools.find(school => school.id === selectedId) ?? data.schools[0] ?? null
  }, [data, selectedId])

  const searchResults = useMemo(() => {
    if (!data || !query.trim()) return []
    const needle = query.trim().toLowerCase()
    return data.schools
      .filter(school => {
        const haystack = `${school.schoolName} ${school.district} ${school.county}`.toLowerCase()
        return haystack.includes(needle)
      })
      .sort((a, b) => {
        const aIndex = a.schoolName.toLowerCase().indexOf(needle)
        const bIndex = b.schoolName.toLowerCase().indexOf(needle)
        return aIndex - bIndex || a.schoolName.localeCompare(b.schoolName)
      })
      .slice(0, 12)
  }, [data, query])

  const latest = useMemo(() => {
    if (!data || !selectedSchool) return null
    const latestYear = [...data.years].reverse().find(year => selectedSchool.years[year.key])
    if (!latestYear) return null
    return {
      year: latestYear,
      data: selectedSchool.years[latestYear.key],
    }
  }, [data, selectedSchool])

  useEffect(() => {
    if (!canvasRef.current || !data || !selectedSchool) return
    chartRef.current?.destroy()
    chartRef.current = null

    const labels = data.years.map(year => year.label)
    const rows = data.years.map(year => selectedSchool.years[year.key] ?? null)
    const graduates = rows.map(row => row?.graduates ?? null)
    const enrolled = rows.map(row => row?.enrolled ?? null)
    const rates = rows.map(row => row?.enrollmentRate ?? null)
    const coverageRates = rows.map(row => row?.coverageGapRate ?? null)

    if (!graduates.some(value => value != null)) return

    chartRef.current = new Chart(canvasRef.current.getContext('2d')!, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: data.primaryCountLabel ?? 'Graduates',
            data: graduates,
            backgroundColor: 'rgba(59,130,246,.34)',
            borderColor: 'rgba(59,130,246,.7)',
            borderWidth: 1,
            yAxisID: 'yCount',
            order: 3,
          },
          {
            type: 'bar',
            label: data.secondaryCountLabel ?? 'Enrolled',
            data: enrolled,
            backgroundColor: 'rgba(22,163,74,.34)',
            borderColor: 'rgba(22,163,74,.7)',
            borderWidth: 1,
            yAxisID: 'yCount',
            order: 3,
          },
          {
            type: 'line',
            label: data.rateLabel,
            data: rates,
            borderColor: '#dc2626',
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            spanGaps: true,
            yAxisID: 'yRate',
            order: 1,
          },
          {
            type: 'line',
            label: data.coverageGapLabel,
            data: coverageRates,
            borderColor: '#d97706',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5,
            tension: 0.3,
            spanGaps: true,
            yAxisID: 'yRate',
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const value = ctx.parsed.y
                if (value == null) return undefined
                if (ctx.dataset.yAxisID === 'yCount') {
                  return `${ctx.dataset.label}: ${Math.round(value).toLocaleString()}`
                }
                return `${ctx.dataset.label}: ${value.toFixed(1)}%`
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,.04)' },
            ticks: { maxRotation: 45, font: { size: 10 }, maxTicksLimit: 10 },
          },
          yCount: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: { display: true, text: 'Students', font: { size: 10 } },
            grid: { color: 'rgba(0,0,0,.06)' },
            ticks: { font: { size: 10 } },
          },
          yRate: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Rate (%)', font: { size: 10 } },
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 10 }, callback: (value: number | string) => `${value}%` },
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [data, selectedSchool])

  const selectSchool = (school: OutcomeSchool) => {
    setSelectedId(school.id)
    setQuery('')
    setActiveIdx(-1)
    setDropdownOpen(false)
    trackEvent('state_outcome_school_select', {
      state: data?.abbreviation,
      school_id: school.id,
      school_name: school.schoolName,
    })
  }

  const handleQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setActiveIdx(-1)
    setDropdownOpen(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx(index => Math.min(index + 1, searchResults.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx(index => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && activeIdx >= 0) {
      event.preventDefault()
      selectSchool(searchResults[activeIdx])
    } else if (event.key === 'Escape') {
      setQuery('')
      setActiveIdx(-1)
      setDropdownOpen(false)
    }
  }

  const hasData = !!selectedSchool && !!latest
  const topDestinations = latest?.data.destinations ?? latest?.data.topDestinations ?? []
  const profileHref = selectedSchool ? schoolProfileHref(stateSlug, selectedSchool) : null
  const primaryCountLabel = data?.primaryCountLabel ?? 'Graduates'
  const secondaryCountLabel = data?.secondaryCountLabel ?? 'Enrolled'
  const detailTitle = data?.detailTitle ?? (stateSlug === 'texas' ? 'Top destinations' : 'Destination detail')
  const emptyDetailText = data?.emptyDetailText
    ?? 'No destination list is available for the selected year.'

  return (
    <section className="state-outcome-section" aria-label={`${stateName} high-school outcome chart`}>
      <div className="chart-panel state-outcome-panel">
        <div className="panel-controls">
          <div className="school-picker-wrap">
            <label className="ctrl-label" htmlFor={`${stateSlug}-school-search`}>
              High School
            </label>
            <div className="school-search-wrap">
              <input
                id={`${stateSlug}-school-search`}
                className="school-input"
                type="text"
                placeholder={`Search ${stateName} high schools...`}
                value={query}
                autoComplete="off"
                onChange={handleQuery}
                onKeyDown={handleKeyDown}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => {
                  setActiveIdx(-1)
                  setDropdownOpen(false)
                }, 160)}
              />
              <ul className={`school-dropdown${searchResults.length && dropdownOpen ? '' : ' hidden'}`}>
                {searchResults.map((school, index) => (
                  <li
                    key={school.id}
                    className={index === activeIdx ? 'active' : ''}
                    onMouseDown={event => {
                      event.preventDefault()
                      selectSchool(school)
                    }}
                  >
                    <span className="dd-name">{school.schoolName}</span>
                    <span className="dd-loc">{schoolSubtitle(school)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="panel-body">
          <div className="chart-header">
            <div>
              <h2 className="chart-title">
                {selectedSchool?.schoolName ?? `${stateName} high-school outcomes`}
              </h2>
              <p className="chart-sub">
                {selectedSchool ? schoolSubtitle(selectedSchool) : 'Loading official state data'}
              </p>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-bar"></span>{primaryCountLabel}</span>
              <span className="legend-item"><span className="legend-bar green"></span>{secondaryCountLabel}</span>
              <span className="legend-item"><span className="legend-line red"></span>{data?.rateLabel ?? 'Rate'}</span>
              <span className="legend-item"><span className="legend-line gold"></span>{data?.coverageGapLabel ?? 'Secondary rate'}</span>
            </div>
          </div>

          <div className="state-outcome-grid">
            <div className="state-outcome-chart">
              <div className="chart-canvas-wrap">
                <canvas ref={canvasRef} style={{ display: hasData ? undefined : 'none' }} />
                {error && <div className="no-data-msg">{error}</div>}
                {!error && !hasData && <div className="no-data-msg">Loading outcome data...</div>}
              </div>
              <p className="chart-note">
                Bars = {primaryCountLabel.toLowerCase()} and {secondaryCountLabel.toLowerCase()} counts · Lines = rates · Source: {' '}
                {data ? (
                  <a href={data.sourceUrl} target="_blank" rel="noopener">{data.sourceLabel}</a>
                ) : (
                  'official state data'
                )}
              </p>
            </div>

            <aside className="state-outcome-sidebar" aria-label="Selected school summary">
              <div className="state-outcome-stats">
                <div>
                  <strong>{latest?.year.label ?? '-'}</strong>
                  <span>Latest year</span>
                </div>
                <div>
                  <strong>{formatCount(latest?.data.graduates)}</strong>
                  <span>{primaryCountLabel}</span>
                </div>
                <div>
                  <strong>{formatCount(latest?.data.enrolled)}</strong>
                  <span>{secondaryCountLabel}</span>
                </div>
                <div>
                  <strong>{formatRate(latest?.data.enrollmentRate)}</strong>
                  <span>{data?.rateLabel ?? 'Enrollment rate'}</span>
                </div>
              </div>

              <div className="state-outcome-destinations">
                <h3>{detailTitle}</h3>
                {topDestinations.length ? (
                  <ol>
                    {topDestinations.slice(0, 6).map(destination => (
                      <li key={destination.name}>
                        <span>{destination.name}</span>
                        <strong>{destination.students.toLocaleString()}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>{emptyDetailText}</p>
                )}
              </div>

              <p className="article-caption">
                {data?.sourceNote ?? 'These are postsecondary enrollment outcomes, not admission offers.'}
              </p>

              {profileHref ? (
                <a className="report-entry-link primary" href={profileHref}>
                  View complete school profile
                </a>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
