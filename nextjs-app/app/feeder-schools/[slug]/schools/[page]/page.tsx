import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFeederData } from '@/lib/feeder'
import FeederRankings, { FEEDER_PAGE_SIZE } from '@/components/FeederRankings'
import SchoolFinder from '@/components/SchoolFinder'
import SiteFooter from '@/components/SiteFooter'

type Props = { params: Promise<{ slug: string; page: string }> }
export const revalidate = 86400

function readPage(slug: string, value: string) {
  const data = getFeederData(slug)
  const page = Number(value)
  if (!data || !/^[1-9]\d*$/.test(value) || page < 2 || page > Math.ceil(data.rankedSchools.length / FEEDER_PAGE_SIZE)) notFound()
  return { data, page }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page: value } = await params
  const { data, page } = readPage(slug, value)
  return { title: `${data.campusLabel} Feeder Schools ${data.displayYear} — Page ${page}`, description: `Browse California high schools ranked by ${data.campusLabel} admits, with applicants, enrollment, and admit rates. Page ${page}.`, alternates: { canonical: `https://collegeacceptance.info/feeder-schools/${slug}/schools/${page}` } }
}

export default async function RankingPage({ params }: Props) {
  const { slug, page: value } = await params
  const { data, page } = readPage(slug, value)
  return <><header><div className="header-inner"><a href={`/feeder-schools/${slug}`}>← {data.campusLabel} feeder overview</a></div></header><main>
    <h1>{data.campusLabel} feeder schools: page {page}</h1>
    <p>Historical Fall {data.displayYear} outcomes, ranked by admitted students. These results are not individual admissions predictions.</p>
    <SchoolFinder source="feeder_rankings" /><FeederRankings data={data} page={page} />
  </main><SiteFooter /></>
}
