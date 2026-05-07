import type { MetadataRoute } from 'next'

const BASE_URL = 'https://collegeacceptance.info'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/report/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
