import { BAY_COUNTIES, DATA_STORIES, storyHref } from '@/lib/data-stories'

export default function RelatedDataStories({ county, campus, all = false }: { county?: string; campus?: string; all?: boolean }) {
  const stories = DATA_STORIES.filter((story, index) => all || index === 2 ||
    (index === 0 && (!campus || ['Los Angeles', 'Berkeley'].includes(campus))) ||
    (index === 1 && county && BAY_COUNTIES.includes(county)))
  return <nav className="related-data-stories" aria-label="Data stories and comparisons" data-navigation-source="related_data_stories">
    <h2>Understand the patterns behind the numbers</h2>
    <div>{stories.map(story => <a href={storyHref(story)} key={story.slug}><span>{story.eyebrow}</span><strong>{story.title}</strong></a>)}</div>
  </nav>
}
