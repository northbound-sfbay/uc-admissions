'use client'

import { useState } from 'react'
import {
  acceptanceRate, admissionNumber, admissionPercent, rateChange,
  type TexasAdmissionInstitution,
} from '@/lib/texas-admissions'
import styles from './TexasAdmissionsTable.module.css'

export default function TexasAdmissionsTable({ institutions, years }: {
  institutions: TexasAdmissionInstitution[]
  years: string[]
}) {
  const [year, setYear] = useState(years.at(-1)!)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')
  const previousYear = String(Number(year) - 1)
  const rows = institutions.filter(item => item.years[year] &&
    `${item.name} ${item.years[year].sourceName}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'rate'
      ? (acceptanceRate(a.years[year]) ?? Infinity) - (acceptanceRate(b.years[year]) ?? Infinity) || a.name.localeCompare(b.name)
      : sort === 'applicants'
        ? (b.years[year].texasApplicants ?? -1) - (a.years[year].texasApplicants ?? -1) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name))

  return <>
    <div className={styles.controls}>
      <label>Find a university<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="University name" /></label>
      <label>Entering fall<select value={year} onChange={e => setYear(e.target.value)}>{[...years].reverse().map(y => <option key={y}>{y}</option>)}</select></label>
      <label>Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="name">University name</option><option value="rate">Lowest acceptance rate</option><option value="applicants">Most Texas applicants</option></select></label>
    </div>
    <p role="status">{rows.length} universities · Fall {year} · Texas applicants</p>
    <div className={`article-table-wrap ${styles.table}`} tabIndex={0} role="region" aria-label="Texas university admissions table, scroll horizontally for all columns">
      <table className="article-table benchmark-table">
        <caption>First-time undergraduate Texas applicants and outcomes, Fall {year}</caption>
        <thead><tr><th scope="col">University</th><th scope="col">Texas applicants</th><th scope="col">Texas accepted</th><th scope="col">Texas acceptance rate</th><th scope="col">Change vs. {previousYear}</th><th scope="col">Texas enrolled</th></tr></thead>
        <tbody>{rows.map(item => {
          const row = item.years[year]
          const change = rateChange(row, item.years[previousYear])
          return <tr key={item.ficeCode}>
            <th scope="row">{row.sourceName}<small className="texas-table-sub">FICE {item.ficeCode} · source row {row.sourceRow}</small></th>
            <td>{admissionNumber(row.texasApplicants)}</td><td>{admissionNumber(row.texasAccepted)}</td>
            <td><strong>{admissionPercent(acceptanceRate(row))}</strong></td>
            <td>{change == null ? 'Not available' : `${change > 0 ? '+' : ''}${change.toFixed(1)} pp`}</td>
            <td>{admissionNumber(row.texasEnrolled)}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
    {rows.length === 0 && <p>No universities match that name. Try a shorter search.</p>}
    <p>“pp” means percentage points. “Not reported” preserves blank or masked source cells; it does not mean zero. Historical university names follow the selected year&apos;s source. Acceptance rate = Texas accepted ÷ Texas applicants.</p>
  </>
}
