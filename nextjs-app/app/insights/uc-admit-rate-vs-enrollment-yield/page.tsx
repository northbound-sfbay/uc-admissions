import analysis from '@/public/data/uc-analysis.json'
import DataStoryLayout from '@/components/DataStoryLayout'
import ArticleCtaLink from '@/components/ArticleCtaLink'
import { DATA_STORIES, storyMetadata } from '@/lib/data-stories'

const story = DATA_STORIES[2]
const data = analysis.enrollment
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const number = (value: number) => value.toLocaleString('en-US')
const ucla = data.campuses[0], davis = data.campuses[2]
export const metadata = storyMetadata(story)

export default function EnrollmentYieldPage() {
  return <DataStoryLayout story={story}
    answer={<><h2>A higher admit rate can lead to a similar enrollment share</h2><p>Within the same {data.schoolCount} California high schools, UC Davis admitted {percent(davis.admitRate)} of applicants and UCLA admitted {percent(ucla.admitRate)} in Fall 2025. Yet both campuses enrolled about five students per 100 applicants. The difference is enrollment yield: the share of admitted students who enrolled.</p></>}
    methodology={<p>Include California public and private high schools reporting at least {data.minApplicants} applicants, at least {data.minAdmits} admits, and complete applicants/admits/enrollees at UCLA, UC Berkeley, UC Davis and UC San Diego in Fall {analysis.year}. The same {data.schoolCount} schools contribute to each campus. This selects schools with substantial, fully reported outcomes at all four campuses and does not represent all high schools. Campus applicants are not matched individuals.</p>}
    questions={[
      { question: 'What is the difference between admit rate and enrollment yield?', answer: 'Admit rate is admitted students divided by applicants. Enrollment yield is enrolled students divided by admitted students. They describe different steps and have different denominators.' },
      { question: 'Does a low yield mean a university is worse?', answer: 'No. The counts do not reveal why admitted students enrolled elsewhere or did not enroll. They cannot distinguish factors such as other offers, cost, location, programs or personal preferences.' },
      { question: 'Can I multiply admit rate by yield?', answer: 'Yes, when the counts describe the same school or cohort, campus and entering year: admits/applicants × enrolled/admits = enrolled/applicants. Do not multiply rates from different populations or years.' },
    ]}>
    <section><h2>Three measures, three different questions</h2><div className="article-table-wrap"><table className="article-table"><thead><tr><th scope="col">Measure</th><th scope="col">Calculation</th><th scope="col">Question answered</th></tr></thead><tbody>
      <tr><th scope="row">Admit rate</th><td>Admits ÷ applicants</td><td>What share of applicants received an offer?</td></tr>
      <tr><th scope="row">Enrollment yield</th><td>Enrollees ÷ admits</td><td>What share of admitted students enrolled?</td></tr>
      <tr><th scope="row">Enrollment per applicant</th><td>Enrollees ÷ applicants</td><td>What share of applicants ultimately enrolled?</td></tr>
    </tbody></table></div></section>
    <section><h2>Compare the four campuses within the same school group</h2><p>Keeping the schools fixed makes the reporting basis clearer. It still does not establish that the same students applied to each campus.</p><div className="article-table-wrap"><table className="article-table"><caption>Fall 2025 · Matched {data.schoolCount}-school cohort</caption><thead><tr><th scope="col">Campus</th><th scope="col">Applicants</th><th scope="col">Admits</th><th scope="col">Enrolled</th><th scope="col">Admit rate</th><th scope="col">Yield</th></tr></thead><tbody>{data.campuses.map(campus => <tr key={campus.key}><th scope="row"><ArticleCtaLink href={`/feeder-schools/${campus.slug}`} eventParams={{ article_slug: story.slug, target_type: 'feeder' }}>{campus.label}</ArticleCtaLink></th><td>{number(campus.app)}</td><td>{number(campus.adm)}</td><td>{number(campus.enr)}</td><td>{percent(campus.admitRate)}</td><td>{percent(campus.yieldRate)}</td></tr>)}</tbody></table></div></section>
    <div className="content_hint" />
    <section><h2>Put both rates over one common denominator</h2><p>These bars express enrolled students per 100 applicants. UC Davis and UCLA finish close to each other on this measure, despite the different proportions receiving offers.</p>
      <figure className="enrollment-bars"><div className="enrollment-scale" aria-hidden="true"><span>0</span><span>5</span><span>10</span></div>{data.campuses.map(campus => <div className="enrollment-bar-row" key={campus.key}><strong>{campus.label}</strong><div className="enrollment-bar-track" aria-hidden="true"><span style={{ width: `${campus.enrolledPerApplicant / 0.1 * 100}%` }} /></div><span>{(campus.enrolledPerApplicant * 100).toFixed(1)} per 100</span></div>)}<figcaption>Shared scale: 0–10 enrolled students per 100 applicants. Counts and denominators are shown in the table above.</figcaption></figure>
      <p>For UC Davis, {number(davis.enr)} enrolled ÷ {number(davis.app)} applicants = {percent(davis.enrolledPerApplicant)}. For UCLA, {number(ucla.enr)} ÷ {number(ucla.app)} = {percent(ucla.enrolledPerApplicant)}. This is arithmetic within each campus’s cohort, not evidence about which offers the same individual students received.</p>
    </section>
    <section><h2>Use this distinction when reading a school profile</h2><ol className="article-steps"><li>Choose one campus and year so the counts refer to the same entering group.</li><li>Read applicants and admits together to understand the admit rate.</li><li>Compare enrollees with admits to understand yield.</li><li>Use several years and the school’s own context before interpreting a one-year change.</li></ol><p>The <a href="/counselors">counselor resource page</a> offers a short guide to using these figures in family conversations. The dataset describes outcomes; it does not explain students’ enrollment decisions.</p></section>
  </DataStoryLayout>
}
