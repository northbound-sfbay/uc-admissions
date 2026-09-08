import analysis from '@/public/data/uc-analysis.json'
import DataStoryLayout from '@/components/DataStoryLayout'
import ArticleCtaLink from '@/components/ArticleCtaLink'
import { DATA_STORIES, storyMetadata } from '@/lib/data-stories'
import { makeSlug, titleCase } from '@/lib/utils'
import { toolHref } from '@/lib/tool-state'

const story = DATA_STORIES[0]
const data = analysis.comparison
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const number = (value: number) => value.toLocaleString('en-US')
export const metadata = storyMetadata(story)

export default function CampusComparisonPage() {
  return <DataStoryLayout story={story}
    answer={<><h2>Many leading feeder schools overlap, but their campus outcomes differ</h2><p>In this group of {data.schoolCount} California high schools, {data.top20Overlap} schools appear in both campuses’ top 20 by Fall 2025 admit count. Across the same school group, UCLA admitted {percent(data.campuses[0].admitRate)} of reported applicants and UC Berkeley admitted {percent(data.campuses[1].admitRate)}. These are school-cohort rates; the applicants at the two campuses are not necessarily the same people.</p></>}
    methodology={<p>Include California public and private high schools with at least {data.minApplicants} reported applicants and a reported, valid admit count at both UCLA and UC Berkeley in Fall {analysis.year}. This produces {data.schoolCount} schools. Rank each campus’s top 20 within that cohort by admits, then applicants, then school ID to break ties. The school comparison table selects the 12 schools with the largest combined application counts, using the same ID tie-breaker. A school outside this group may still appear on a campus’s full feeder page.</p>}
    questions={[
      { question: 'Are UCLA and Berkeley feeder schools the same?', answer: `${data.top20Overlap} of the top 20 schools by admitted-student count overlap within this ${data.schoolCount}-school comparison group. “Feeder” describes historical volume, not a special admissions agreement.` },
      { question: 'Does the higher cohort rate make Berkeley easier for my student?', answer: 'No. Applicants, majors and academic profiles differ by campus and school. These aggregate outcomes do not estimate an individual applicant’s probability of admission.' },
      { question: 'Why is my school missing from this table?', answer: 'The visible table highlights 12 high-application-volume schools. The larger comparison group also requires at least 50 applicants and reported admit counts at both campuses. Use school lookup for the full individual profile.' },
    ]}>
    <section><h2>Compare the denominator before the rank</h2><p>A campus can receive many more applications from a school without admitting proportionally more students. That is why a count-based feeder ranking and an admit-rate comparison answer different questions.</p>
      <div className="cohort-rate-cards">{data.campuses.map(campus => <div key={campus.key}><h3>{campus.label}</h3><strong>{percent(campus.admitRate)}</strong><p>{number(campus.adm)} admits ÷ {number(campus.app)} applicants</p><p>Same {data.schoolCount}-school group · Fall {analysis.year}</p><div className="cohort-rate-track" aria-hidden="true"><span style={{ width: percent(campus.admitRate) }} /></div><small>Shared scale: 0–100%</small></div>)}</div>
      <p className="article-caption">These figures exclude schools without complete qualifying counts at both campuses. For a different population—the full campus entering class—use the <a href="/uc-admission-rates">campus-wide benchmarks</a>.</p>
    </section>
    <section><h2>The same high schools, viewed at both campuses</h2><p>The rows are ordered by combined applicant volume. Each cell shows the admit rate and its underlying counts. The cohort baselines above provide context, not a prediction for any school.</p>
      <div className="article-table-wrap"><table className="article-table paired-school-table"><caption>Fall 2025 · 12 highest-application-volume schools in the matched group</caption><thead><tr><th scope="col">High school</th><th scope="col">UCLA</th><th scope="col">UC Berkeley</th><th scope="col">Explore</th></tr></thead><tbody>
        {data.schools.map(school => <tr key={school.school_id}><th scope="row"><ArticleCtaLink href={`/school/${makeSlug(school.school_id, school.school_name)}`} eventParams={{ article_slug: story.slug, target_type: 'school' }}>{titleCase(school.school_name)}</ArticleCtaLink><small>{school.city} · {school.county}</small></th>
          {school.campuses.map(campus => <td key={campus.key}><strong>{percent(campus.admitRate)}</strong><small>{number(campus.adm)} admits / {number(campus.app)} applicants</small></td>)}
          <td><ArticleCtaLink href={toolHref(school.school_id, [school.school_id], 'Los Angeles', 'all', 'Berkeley', 'all')} eventParams={{ article_slug: story.slug, target_type: 'comparison' }}>Open both campus charts →</ArticleCtaLink></td></tr>)}
      </tbody></table></div>
    </section>
    <div className="content_hint" />
    <section><h2>A larger campus rate does not describe every school</h2><p>Within the displayed schools, Canyon Crest Academy and American High School have higher UCLA rates than Berkeley rates, even though the combined cohort has a higher Berkeley rate. Read the school’s applicant counts and history alongside the aggregate before drawing a conclusion.</p><p>This variation is exactly why a useful comparison starts with the same school and year. It cannot tell us whether the same students applied to both campuses, which majors they chose, or how those applicants differed.</p></section>
    <section className="article-cta-panel"><h2>Continue with the campus you are researching</h2><p>The full feeder pages contain the broader school lists and campus-specific counts.</p><nav className="article-example-links" aria-label="Campus feeder rankings">{data.campuses.map(campus => <ArticleCtaLink key={campus.slug} href={`/feeder-schools/${campus.slug}`} eventParams={{ article_slug: story.slug, target_type: 'feeder' }}>{campus.label} feeder schools →</ArticleCtaLink>)}</nav></section>
  </DataStoryLayout>
}
