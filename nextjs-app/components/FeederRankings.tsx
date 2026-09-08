import type { FeederPageData } from '@/lib/feeder'
import { feederSchoolHref } from '@/lib/feeder'

export const FEEDER_PAGE_SIZE = 50

export default function FeederRankings({ data, page = 1 }: { data: FeederPageData; page?: number }) {
  const pageCount = Math.ceil(data.rankedSchools.length / FEEDER_PAGE_SIZE)
  const start = (page - 1) * FEEDER_PAGE_SIZE
  const href = (number: number) => number === 1 ? `/feeder-schools/${data.slug}#full-rankings` : `/feeder-schools/${data.slug}/schools/${number}`
  return (
    <section className="map-card" id="full-rankings" data-navigation-source="feeder_rankings">
      <div className="panel-controls"><h2>California schools ranked by {data.campusLabel} admits</h2><p>Fall {data.displayYear} · {data.rankedSchools.length.toLocaleString()} schools · Showing {start + 1}–{Math.min(start + FEEDER_PAGE_SIZE, data.rankedSchools.length)}</p></div>
      <div className="rankings-table-wrap">
        <table className="rankings-table growth-rankings"><thead><tr><th scope="col">Rank / School</th><th scope="col">City</th><th scope="col">Applicants</th><th scope="col">Admitted</th><th scope="col">Enrolled</th><th scope="col">Admit rate</th></tr></thead>
          <tbody>{data.rankedSchools.slice(start, start + FEEDER_PAGE_SIZE).map((school, i) => <tr key={school.school_id}>
            <th scope="row"><span className="rank-number">{start + i + 1}.</span> <a href={feederSchoolHref(school.school_id, school.school_name)}>{school.school_name}</a><small>{school.school_type} · {school.county}</small></th>
            <td>{school.city}</td><td>{school.app.toLocaleString()}</td><td>{school.adm.toLocaleString()}</td><td>{school.enr.toLocaleString()}</td><td>{school.admitRate == null ? '—' : `${(school.admitRate * 100).toFixed(1)}%`}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <nav className="ranking-pagination" aria-label="Ranking pages">
        {page > 1 && <a href={href(page - 1)}>← Previous 50 schools</a>}
        <span>Page {page} of {pageCount}</span>
        {page < pageCount && <a href={href(page + 1)}>Next 50 schools →</a>}
      </nav>
    </section>
  )
}
