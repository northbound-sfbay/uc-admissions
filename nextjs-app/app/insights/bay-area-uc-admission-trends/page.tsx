import analysis from '@/public/data/uc-analysis.json'
import DataStoryLayout from '@/components/DataStoryLayout'
import CohortTrendChart from '@/components/CohortTrendChart'
import ArticleCtaLink from '@/components/ArticleCtaLink'
import { DATA_STORIES, storyMetadata } from '@/lib/data-stories'

const story = DATA_STORIES[1]
const data = analysis.trends
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const change = (value: number) => `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}`
const number = (value: number) => value.toLocaleString('en-US')
const davis = data.campuses.find(campus => campus.key === 'Davis')!
const first = davis.years[0], last = davis.years.at(-1)!
export const metadata = storyMetadata(story)

export default function BayAreaTrendsPage() {
  return <DataStoryLayout story={story}
    answer={<><h2>More UC Davis applications, fewer admits in this fixed school group</h2><p>Across the same {data.schoolCount} Bay Area high schools, UC Davis applications rose from {number(first.app)} in 2021 to {number(last.app)} in 2025, while admits fell from {number(first.adm)} to {number(last.adm)}. The resulting admit rate moved from {percent(first.admitRate)} to {percent(last.admitRate)}. UCLA’s endpoint rate was nearly unchanged, showing that the four campuses did not move together.</p></>}
    methodology={<p>Use the nine Bay Area counties listed in the regional directory. A school must report at least {data.minApplicants} applicants and a valid admit count at all four campuses in every year from 2021 through 2025. The same {data.schoolCount} schools therefore contribute to every campus and every year. This deliberately excludes schools with gaps or small application groups. Schools may have different applicant populations each year, so the fixed school list is not a fixed student population.</p>}
    questions={[
      { question: 'Did every UC campus become harder to enter from Bay Area schools?', answer: 'No uniform pattern appears in this selected cohort. The endpoint changes differ by campus, and rates fluctuate between years. This analysis does not estimate how admission difficulty changed for an otherwise identical student.' },
      { question: 'Does this cover every Bay Area high school?', answer: `No. It covers ${data.schoolCount} schools with at least 20 applicants and reported admit counts at each of four campuses in every year from 2021 through 2025. Missing and smaller observations are excluded.` },
      { question: 'Why show applications as well as acceptance rates?', answer: 'Admits divided by applicants determines the rate. A changing rate can reflect movement in both counts. Showing only the percentage hides whether the applicant pool expanded or the number of offers changed.' },
    ]}>
    <section><h2>Five years on the same scale</h2><p>The chart keeps the school group fixed and shows every year. UC Davis’s 2025 rate recovered from 2024 while remaining below 2021. UC Berkeley’s 2024 increase also makes its latest-year decline look different from a simple five-year straight line.</p><CohortTrendChart campuses={data.campuses} /></section>
    <section><h2>Separate application growth from changes in offers</h2><p>These are changes between Fall 2021 and Fall 2025. Rate differences are in percentage points; changes in applicant and admit counts are percentages relative to 2021. Changes are calculated before rounding.</p>
      <div className="article-table-wrap"><table className="article-table"><caption>Same {data.schoolCount} schools in each row</caption><thead><tr><th scope="col">Campus</th><th scope="col">Applicants</th><th scope="col">Admits</th><th scope="col">2021 rate</th><th scope="col">2025 rate</th><th scope="col">Rate change</th></tr></thead><tbody>{data.campuses.map(campus => {
        const start = campus.years[0], end = campus.years.at(-1)!
        return <tr key={campus.key}><th scope="row"><ArticleCtaLink href={`/feeder-schools/${campus.slug}`} eventParams={{ article_slug: story.slug, target_type: 'feeder' }}>{campus.label}</ArticleCtaLink></th><td>{change(end.app / start.app - 1)}%</td><td>{change(end.adm / start.adm - 1)}%</td><td>{percent(start.admitRate)}</td><td>{percent(end.admitRate)}</td><td>{change(end.admitRate - start.admitRate)} pp</td></tr>
      })}</tbody></table></div>
    </section>
    <div className="content_hint" />
    <section><h2>Read your school against its own history</h2><p>A regional average supplies context. It does not mean an individual school moved in the same direction, or that a campus changed its treatment of that school. Different application choices, majors and applicant profiles remain possible explanations that these counts cannot separate.</p><nav className="article-example-links" aria-label="Example Bay Area school profiles"><ArticleCtaLink href="/school/53466-monta-vista-high-school" eventParams={{ article_slug: story.slug, target_type: 'school' }}>Monta Vista High School</ArticleCtaLink><ArticleCtaLink href="/school/50970-mission-san-jose-high-school" eventParams={{ article_slug: story.slug, target_type: 'school' }}>Mission San Jose High School</ArticleCtaLink><ArticleCtaLink href="/school/52970-lowell-high-school" eventParams={{ article_slug: story.slug, target_type: 'school' }}>Lowell High School</ArticleCtaLink></nav></section>
    <section><h2>Browse the region</h2><p>These are the nine counties used to define the region. County pages include schools outside the stricter five-year comparison group.</p><nav className="article-example-links" aria-label="Bay Area county directories">{data.counties.map(county => <ArticleCtaLink key={county} href={`/county/${county.toLowerCase().replace(/ /g, '-')}`} eventParams={{ article_slug: story.slug, target_type: 'county' }}>{county} County</ArticleCtaLink>)}</nav></section>
    <section><h2>Full reported counts behind the chart</h2><details className="story-data-details"><summary>Show all five years of applicants, admits and rates</summary><div className="article-table-wrap"><table className="article-table"><caption>Reported campus counts for the fixed Bay Area school cohort</caption><thead><tr><th scope="col">Campus</th><th scope="col">Fall year</th><th scope="col">Applicants</th><th scope="col">Admits</th><th scope="col">Admit rate</th></tr></thead><tbody>{data.campuses.flatMap(campus => campus.years.map(year => <tr key={`${campus.key}-${year.year}`}><th scope="row">{campus.label}</th><td>{year.year}</td><td>{number(year.app)}</td><td>{number(year.adm)}</td><td>{percent(year.admitRate)}</td></tr>))}</tbody></table></div></details></section>
  </DataStoryLayout>
}
