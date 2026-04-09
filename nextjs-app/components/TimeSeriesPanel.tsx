'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import SchoolAutocomplete from './SchoolAutocomplete'
import { trackEvent } from '@/lib/analytics'
import { ALL_YEARS, CAMPUSES, ETHNICITIES } from '@/lib/constants'
import { getYearData, yieldRate, makeSlug } from '@/lib/utils'
import type { School } from '@/lib/types'

Chart.register(...registerables)

interface Props {
  allSchools: School[]
  selectedSchool: School | null
  campus: string
  ethnicity: string
  onSelectSchool: (school: School) => void
  onCampusChange: (v: string) => void
  onEthnicityChange: (v: string) => void
  tsInput: string
  onTsInputChange: (v: string) => void
}

export default function TimeSeriesPanel({
  allSchools, selectedSchool, campus, ethnicity,
  onSelectSchool, onCampusChange, onEthnicityChange,
  tsInput, onTsInputChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const school = selectedSchool
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }

    if (!school) return

    const appData: (number | null)[]  = []
    const admRates: (number | null)[] = []
    const yldRates: (number | null)[] = []

    for (const yr of ALL_YEARS) {
      const d = getYearData(school.years?.[yr], campus, ethnicity)
      appData.push(d?.app ?? null)
      admRates.push(d?.admit_rate != null ? +(d.admit_rate * 100).toFixed(2) : null)
      const yl = yieldRate(d)
      yldRates.push(yl != null ? +(yl * 100).toFixed(2) : null)
    }

    if (!appData.some(v => v != null)) return

    chartRef.current = new Chart(canvasRef.current.getContext('2d')!, {
      data: {
        labels: ALL_YEARS,
        datasets: [
          {
            type: 'bar', label: 'Applicants', data: appData,
            backgroundColor: 'rgba(59,130,246,.38)',
            borderColor: 'rgba(59,130,246,.6)', borderWidth: 1,
            yAxisID: 'yApp', order: 2,
          },
          {
            type: 'line', label: 'Admit Rate', data: admRates,
            borderColor: '#dc2626', backgroundColor: 'transparent',
            borderWidth: 2.2, pointRadius: 2, pointHoverRadius: 5,
            tension: 0.3, spanGaps: true, yAxisID: 'yRate', order: 1,
          },
          {
            type: 'line', label: 'Yield Rate', data: yldRates,
            borderColor: '#16a34a', backgroundColor: 'transparent',
            borderWidth: 2.2, pointRadius: 2, pointHoverRadius: 5,
            tension: 0.3, spanGaps: true, yAxisID: 'yRate', order: 1,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const v = ctx.parsed.y
                if (v == null) return undefined
                return ctx.dataset.label === 'Applicants'
                  ? `Applicants: ${Math.round(v).toLocaleString()}`
                  : `${ctx.dataset.label}: ${v.toFixed(1)}%`
              },
            },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { maxRotation: 45, font: { size: 10 }, maxTicksLimit: 16 } },
          yApp: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Applicants', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.06)' }, ticks: { font: { size: 10 } } },
          yRate: { type: 'linear', position: 'right', beginAtZero: true, max: 100, title: { display: true, text: 'Rate (%)', font: { size: 10 } }, grid: { drawOnChartArea: false }, ticks: { font: { size: 10 }, callback: (v: number | string) => v + '%' } },
        },
      },
    })

    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [selectedSchool, campus, ethnicity])

  const school = selectedSchool
  const hasData = school && ALL_YEARS.some(yr => (getYearData(school.years?.[yr], campus, ethnicity)?.app ?? null) != null)
  const sub = school
    ? `${school.city}${school.county ? ', ' + school.county : ''}${school.school_type && school.school_type !== 'CA Public' ? ' · ' + school.school_type : ''}`
    : ''

  return (
    <div className="chart-panel" id="ts-panel">
      <div className="panel-controls">
        <div className="school-picker-wrap">
          <label className="ctrl-label">High School</label>
          <SchoolAutocomplete
            placeholder="Search school…"
            allSchools={allSchools}
            onSelect={onSelectSchool}
            value={tsInput}
            onChange={onTsInputChange}
          />
        </div>
        <div className="inline-filters">
          <div className="filter-group">
            <label className="ctrl-label">Campus</label>
            <select value={campus} onChange={e => onCampusChange(e.target.value)}>
              {CAMPUSES.map(c => <option key={c} value={c}>{c === 'universitywide' ? 'Universitywide' : c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="ctrl-label">Ethnic Group</label>
            <select value={ethnicity} onChange={e => onEthnicityChange(e.target.value)}>
              <option value="all">All students</option>
              {ETHNICITIES.map(e => <option key={e} value={e}>{e === "Int'l" ? 'International' : e === 'Hispanic/ Latinx' ? 'Hispanic / Latinx' : e}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="panel-body">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">{school?.school_name ?? '—'}</h2>
            <p className="chart-sub">
              {sub}
              {school && (
                <a
                  href={`/school/${makeSlug(school.school_id, school.school_name)}`}
                  onClick={() => {
                    trackEvent('lead_or_capture_click', {
                      cta_type: 'view_school_page',
                      school_slug: makeSlug(school.school_id, school.school_name),
                      school_name: school.school_name,
                    })
                  }}
                  style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  View school page →
                </a>
              )}
            </p>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-bar"></span>Applicants</span>
            <span className="legend-item"><span className="legend-line red"></span>Admit Rate</span>
            <span className="legend-item"><span className="legend-line green"></span>Yield Rate</span>
          </div>
        </div>
        <div className="chart-canvas-wrap">
          <canvas ref={canvasRef} style={{ display: hasData ? undefined : 'none' }} />
          {!hasData && school && (
            <div className="no-data-msg">No data for this selection.</div>
          )}
        </div>
        <p className="chart-note">Bars = applicants (left axis) · Lines = rates (right axis) · Yield = enrollees ÷ admits</p>
      </div>
    </div>
  )
}
