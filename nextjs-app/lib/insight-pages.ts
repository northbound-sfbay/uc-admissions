import { DATA_STORIES, STORY_DATE, storyHref } from './data-stories'

export const INSIGHT_PAGES = [
  { path: '/insights', updated: '2026-09-08' },
  { path: '/insights/uc-admission-rates-by-high-school', updated: '2026-11-02' },
  { path: '/insights/uc-acceptance-rates-2026', updated: '2026-08-26' },
  { path: '/insights/uc-admissions-by-source-school', updated: '2026-09-08' },
  { path: '/insights/uc-gpa-by-high-school', updated: '2026-09-08' },
  ...DATA_STORIES.map(story => ({ path: storyHref(story), updated: STORY_DATE })),
]
