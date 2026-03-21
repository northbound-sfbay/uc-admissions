import type { MetadataRoute } from 'next'
import top300 from '@/public/top300.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://collegeacceptance.info'

  const schoolUrls = (top300 as { slug: string }[]).map(({ slug }) => ({
    url: `${base}/school/${slug}`,
    lastModified: new Date('2025-03-01'),
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    ...schoolUrls,
  ]
}
