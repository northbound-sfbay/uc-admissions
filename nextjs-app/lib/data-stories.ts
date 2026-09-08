import type { Metadata } from 'next'
import analysis from '@/public/data/uc-analysis.json'

export const STORY_DATE = '2026-09-08'
export const SOURCE_URL = 'https://www.universityofcalifornia.edu/about-uc/information-center/admissions-source-school'
export const BAY_COUNTIES = ['Alameda', 'Contra Costa', 'Marin', 'Napa', 'San Francisco', 'San Mateo', 'Santa Clara', 'Solano', 'Sonoma']
export const DATA_STORIES = [
  {
    slug: 'ucla-vs-uc-berkeley-feeder-schools',
    title: 'UCLA vs. UC Berkeley feeder schools: the same schools, different outcomes',
    description: `Compare Fall 2025 UCLA and UC Berkeley applicants, admits and admission rates within the same ${analysis.comparison.schoolCount} California high schools, with school lookup and clear cohort limits.`,
    eyebrow: 'Campus comparison · Fall 2025',
  },
  {
    slug: 'bay-area-uc-admission-trends',
    title: 'Bay Area UC admission trends: what changed from 2021 to 2025?',
    description: `Follow the same ${analysis.trends.schoolCount} Bay Area high schools across five years at UCLA, UC Berkeley, UC Davis and UC San Diego. Compare application growth with admit-rate changes.`,
    eyebrow: 'Five-year regional analysis',
  },
  {
    slug: 'uc-admit-rate-vs-enrollment-yield',
    title: 'UC admit rate vs. enrollment yield: why the denominator matters',
    description: `Compare admissions and enrollment at four UC campuses using the same ${analysis.enrollment.schoolCount} California schools. See why a higher admit rate does not necessarily mean more enrollment per applicant.`,
    eyebrow: 'Admissions and enrollment explained',
  },
] as const

export type DataStory = typeof DATA_STORIES[number]
export function storyHref(story: DataStory) { return `/insights/${story.slug}` }
export function storyMetadata(story: DataStory): Metadata {
  const url = `https://collegeacceptance.info${storyHref(story)}`
  return { title: story.title, description: story.description, alternates: { canonical: url },
    openGraph: { title: story.title, description: story.description, url, type: 'article', publishedTime: STORY_DATE, modifiedTime: STORY_DATE },
    twitter: { card: 'summary', title: story.title, description: story.description } }
}
