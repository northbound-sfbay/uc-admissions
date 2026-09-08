import type { ReactNode } from 'react'
import SiteFooter from './SiteFooter'
import SchoolFinder from './SchoolFinder'
import ArticleCtaLink from './ArticleCtaLink'
import { DATA_STORIES, SOURCE_URL, STORY_DATE, storyHref, type DataStory } from '@/lib/data-stories'

export default function DataStoryLayout({ story, answer, children, methodology, questions }: {
  story: DataStory; answer: ReactNode; children: ReactNode; methodology: ReactNode;
  questions: { question: string; answer: string }[];
}) {
  const url = `https://collegeacceptance.info${storyHref(story)}`
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: story.title, description: story.description,
      datePublished: STORY_DATE, dateModified: STORY_DATE, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'collegeacceptance.info', url: 'https://collegeacceptance.info/about' },
      publisher: { '@type': 'Organization', name: 'collegeacceptance.info' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://collegeacceptance.info' },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: 'https://collegeacceptance.info/insights' },
      { '@type': 'ListItem', position: 3, name: story.title, item: url },
    ] },
  ]
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <header><div className="header-inner article-header-inner"><a href="/insights">College Acceptance Insights</a><h1>{story.title}</h1><p className="subtitle">Original analysis of UC source-school data · Finalized through Fall 2025</p></div></header>
    <main className="article-shell"><article className="article-card data-story" data-navigation-source={story.slug}>
      <p className="article-kicker">{story.eyebrow}</p>
      <p className="article-byline">By <a href="/about">collegeacceptance.info</a> · Published September 8, 2026 · <a href="#methodology">Source and methodology</a></p>
      <section className="answer-block" aria-label="The finding">{answer}</section>
      {children}
      <section className="article-cta-panel"><h2>Look up your school’s own results</h2>
        <p>These study groups have specific reporting requirements. Your school’s profile may still have useful data even if it is outside a study group.</p>
        <SchoolFinder source={story.slug} />
        <ArticleCtaLink href="/" eventParams={{ article_slug: story.slug, target_type: 'tool' }}>Open the school comparison tool →</ArticleCtaLink>
      </section>
      <section id="methodology"><h2>Source, method and limitations</h2>{methodology}
        <p>Calculated from the site’s existing California public and private high-school records in the <a href={SOURCE_URL}>University of California admissions by source school</a> dataset. All figures here use individual-campus records. A student may apply to more than one campus, so cross-campus application totals do not represent unique people.</p>
        <p>Rates are ratios of summed reported counts, rather than averages of school percentages. Missing or suppressed counts are excluded under the stated rules and are never changed to zero. These are selected school cohorts, not campus-wide acceptance rates. Applicant characteristics can change even when the schools stay the same. Historical outcomes do not predict one student’s chances or show that a particular high school causes an admissions advantage.</p>
        <p><a href="/data/uc-analysis.json" download>Download analyzed counts and cohort school IDs (JSON)</a>. The <a href="https://github.com/northbound-sfbay/uc-admissions/blob/main/nextjs-app/scripts/build-uc-analysis.py">calculation script</a> reproduces the analysis from the existing source records.</p>
        <p>For the separate preliminary campus-wide release, see <a href="/insights/uc-acceptance-rates-2026">Fall 2026 UC acceptance rates</a>. The <a href="/insights/uc-admissions-by-source-school">source-school methodology guide</a> explains the underlying fields.</p>
      </section>
      <section><h2>Questions about this comparison</h2><div className="article-faq-list">{questions.map(item => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</div></section>
      <nav className="article-example-links" aria-label="Related analyses">{DATA_STORIES.filter(item => item.slug !== story.slug).map(item => <ArticleCtaLink key={item.slug} href={storyHref(item)} eventParams={{ article_slug: story.slug, target_type: 'insight' }}>{item.title}</ArticleCtaLink>)}</nav>
    </article></main><SiteFooter />
  </>
}
