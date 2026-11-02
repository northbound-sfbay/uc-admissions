import { INSIGHT_PAGES } from '@/lib/insight-pages'

export const dynamic = 'force-static'

export function GET() {
  const entries = INSIGHT_PAGES.map(page =>
    `<url><loc>https://collegeacceptance.info${page.path}</loc><lastmod>${page.updated}</lastmod></url>`
  ).join('\n')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
