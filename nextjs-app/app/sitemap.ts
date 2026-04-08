import fs from 'fs'
import path from 'path'
import type { MetadataRoute } from 'next'
import { getCountySlugs } from '@/lib/county'
import { getFeederSlugs } from '@/lib/feeder'

const BASE_URL = 'https://collegeacceptance.info'
const SCHOOL_DATA_ROOT = path.join(process.cwd(), 'school-data')
const SCHOOL_TYPE_DIRS = ['ca_public', 'ca_private'] as const

function makeSlug(id: string, name: string): string {
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${id}-${nameSlug}`
}

function getSchoolEntries() {
  const schools: Array<{ school_id: string; school_name: string }> = []

  for (const dir of SCHOOL_TYPE_DIRS) {
    const fullDir = path.join(SCHOOL_DATA_ROOT, dir)
    for (const fileName of fs.readdirSync(fullDir)) {
      const school = JSON.parse(
        fs.readFileSync(path.join(fullDir, fileName), 'utf8')
      ) as { school_id: string; school_name: string }
      schools.push({
        school_id: school.school_id,
        school_name: school.school_name,
      })
    }
  }

  return schools
}

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date()

  const coreUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: generatedAt,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: generatedAt,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: generatedAt,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  const countyUrls: MetadataRoute.Sitemap = getCountySlugs().map(slug => ({
    url: `${BASE_URL}/county/${slug}`,
    lastModified: generatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const feederUrls: MetadataRoute.Sitemap = getFeederSlugs().map(slug => ({
    url: `${BASE_URL}/feeder-schools/${slug}`,
    lastModified: generatedAt,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  const schoolUrls: MetadataRoute.Sitemap = getSchoolEntries().map(({ school_id, school_name }) => ({
    url: `${BASE_URL}/school/${makeSlug(school_id, school_name)}`,
    lastModified: generatedAt,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))

  return [
    ...coreUrls,
    ...countyUrls,
    ...feederUrls,
    ...schoolUrls,
  ]
}
