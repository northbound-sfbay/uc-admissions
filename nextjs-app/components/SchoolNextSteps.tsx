import type { School } from '@/lib/types'
import { getPeerSchools } from '@/lib/peers'
import { makeSlug, titleCase } from '@/lib/utils'
import { countyPageHref } from '@/lib/county'
import { toolHref } from '@/lib/tool-state'
import RelatedDataStories from './RelatedDataStories'

export default function SchoolNextSteps({ school }: { school: School }) {
  const peers = getPeerSchools(school)
  return (
    <section className="next-steps" aria-labelledby="next-steps-title" data-navigation-source="school_next_steps">
      <h2 id="next-steps-title">Explore your next comparison</h2>
      <p>Schools of the same type and reporting year, prioritizing the same city and then similar application volumes in the same county. These are comparison starting points, not a ranking of school quality.</p>
      <div className="peer-grid">
        {peers.map(peer => <div className="peer-card" key={peer.school_id}>
          <a href={`/school/${makeSlug(peer.school_id, peer.school_name)}`}>{titleCase(peer.school_name)}</a>
          <span>{peer.city} · Fall {peer.latest_year}</span>
          <a className="peer-compare" href={toolHref(school.school_id, [school.school_id, peer.school_id])}>Compare these schools →</a>
        </div>)}
      </div>
      <nav className="discovery-links" aria-label="Campus and county context">
        <a href={toolHref(school.school_id, [], 'Los Angeles')}>This school’s UCLA trend</a>
        <a href={toolHref(school.school_id, [], 'Berkeley')}>This school’s Berkeley trend</a>
        {school.county && <a href={countyPageHref(school.county)}>Explore {school.county} County</a>}
        <a href="/feeder-schools/uc-davis">UC Davis feeder schools</a>
      </nav>
      <RelatedDataStories county={school.county} />
    </section>
  )
}
