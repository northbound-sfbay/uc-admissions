'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import SchoolAutocomplete from './SchoolAutocomplete'
import { ALL_YEARS, CAMPUSES, ETHNICITIES, CMP_COLORS } from '@/lib/constants'
import { getYearData, schoolKey } from '@/lib/utils'
import type { School } from '@/lib/types'

Chart.register(...registerables)

export interface CmpEntry { school: School; colorIdx: number }

interface Props {
  allSchools: School[]
  selected: CmpEntry[]
  campus: string
  ethnicity: string
  onAdd: (school: School) => void
  onRemove: (key: string) => void
  onCampusChange: (v: string) => void
  onEthnicityChange: (v: string) => void
}

export default function ComparePanel({
  allSchools, selected, campus, ethnicity,
  onAdd, onRemove, onCampusChange, onEthnicityChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    if (!selected.length) return

    const datasets = selected.map(({ school, colorIdx }) => {
      const color = CMP_COLORS[colorIdx]
      return {
        label: school.school_name,
        data: ALL_YEARS.map(yr => {
          const d = getYearData(school.years?.[yr], campus, ethnicity)
          return d?.admit_rate != null ? +(d.admit_rate * 100).toFixed(2) : null
        }),
        borderColor: color,
        backgroundColor: color + '18',
        borderWidth: 2.2,
        pointRadius: 2.5, pointHoverRadius: 6,
        tension: 0.3, spanGaps: true, fill: false,
      }
    })

    chartRef.current = new Chart(canvasRef.current.getContext('2d')!, {
      type: 'line',
      data: { labels: ALL_YEARS, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true, padding: 12, boxWidth: 20 } },
          tooltip: {
            callbacks: {
              label(ctx) {
                const v = ctx.parsed.y
                if (v == null) return undefined
                const name = ctx.dataset.label!.length > 32 ? ctx.dataset.label!.slice(0, 29) + '…' : ctx.dataset.label!
                return `${name}: ${v.toFixed(1)}%`
              },
            },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { maxRotation: 45, font: { size: 10 }, maxTicksLimit: 16 } },
          y: { beginAtZero: false, title: { display: true, text: 'Admit Rate (%)', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.06)' }, ticks: { font: { size: 10 }, callback: (v: number | string) => v + '%' } },
        },
      },
    })

    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [selected, campus, ethnicity])

  const subParts = []
  if (campus !== 'universitywide') subParts.push(campus)
  if (ethnicity !== 'all') subParts.push(ethnicity)
  const sub = subParts.length ? subParts.join(' · ') : 'Universitywide · All students'

  return (
    <div className="chart-panel" id="cmp-panel">
      <div className="panel-controls">
        <div className="school-picker-wrap">
          <label className="ctrl-label">Add School to Compare</label>
          <SchoolAutocomplete
            placeholder="Search and add school…"
            allSchools={allSchools}
            onSelect={onAdd}
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
        <div className="cmp-tags">
          {!selected.length
            ? <span className="cmp-hint">Search above to add schools (up to 8)</span>
            : selected.map(({ school, colorIdx }) => {
                const color = CMP_COLORS[colorIdx]
                const key   = schoolKey(school)
                const typeLabel = school.school_type && school.school_type !== 'CA Public' ? ` · ${school.school_type}` : ''
                return (
                  <div key={key} className="cmp-chip" style={{ borderColor: color, backgroundColor: color + '16' }}>
                    <span className="chip-dot" style={{ background: color }}></span>
                    <span className="chip-name" title={school.school_name}>{school.school_name}</span>
                    <span className="chip-city">{school.city}{typeLabel}</span>
                    <button className="chip-remove" aria-label="Remove" onClick={() => onRemove(key)}>×</button>
                  </div>
                )
              })
          }
        </div>
      </div>

      <div className="panel-body">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">Admit Rate Comparison</h2>
            <p className="chart-sub">{sub}</p>
          </div>
        </div>
        <div className="chart-canvas-wrap">
          <canvas ref={canvasRef} style={{ display: selected.length ? undefined : 'none' }} />
          {!selected.length && (
            <div className="no-data-msg">Add schools above to compare admit rate trends.</div>
          )}
        </div>
        <p className="chart-note">Admit rate = Admits ÷ Applicants per year · Click a map dot to see its trend</p>
      </div>
    </div>
  )
}
