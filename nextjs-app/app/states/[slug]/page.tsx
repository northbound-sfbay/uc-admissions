import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import StateOutcomeExplorer from '@/components/StateOutcomeExplorer'
import {
  getStateOutcomeProfile,
  getStateOutcomeSlugs,
  type StateOutcomeProfile,
  type StateOutcomeTable,
} from '@/lib/state-outcomes'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getStateOutcomeSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = getStateOutcomeProfile(slug)
  if (!profile) return {}

  return {
    title: `${profile.title} | collegeacceptance.info`,
    description: profile.description,
    alternates: { canonical: profile.canonical },
    openGraph: {
      title: profile.title,
      description: profile.description,
      url: profile.canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: profile.title,
      description: profile.description,
    },
  }
}

function JsonLd({ profile }: { profile: StateOutcomeProfile }) {
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: profile.title,
    description: profile.description,
    url: profile.canonical,
    creator: {
      '@type': 'Organization',
      name: 'collegeacceptance.info',
    },
    spatialCoverage: {
      '@type': 'AdministrativeArea',
      name: profile.name,
    },
    temporalCoverage: profile.sourceYearLabel,
    citation: profile.sources.map(source => source.href),
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: profile.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  )
}

function DataTable({ table }: { table: StateOutcomeTable }) {
  return (
    <section className="state-home-section">
      <h2>{table.title}</h2>
      <p>{table.note}</p>
      <div className="article-table-wrap">
        <table className="article-table">
          <thead>
            <tr>
              {table.columns.map(column => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => (
              <tr key={row.join('|')}>
                {row.map((cell, index) => (
                  <td key={`${row.join('|')}-${index}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default async function StateOutcomePage({ params }: PageProps) {
  const { slug } = await params
  const profile = getStateOutcomeProfile(slug)
  if (!profile) notFound()

  return (
    <>
      <JsonLd profile={profile} />

      <header className="state-home-header">
        <nav className="state-home-nav" aria-label="Primary navigation">
          <Link href="/" className="state-home-brand">
            collegeacceptance.info
          </Link>
          <div className="state-home-nav-links">
            <Link href="/">UC tool</Link>
            <Link href="/rankings">Rankings</Link>
            <Link href="/insights">Insights</Link>
            <Link href="/states">States</Link>
          </div>
        </nav>

        <div className="state-home-hero">
          <div className="state-home-hero-copy">
            <p className="state-home-kicker">{profile.abbreviation} college outcomes</p>
            <h1>Texas college outcomes by high school</h1>
            <p>
              Search official Texas high-school graduate records to see college-going trends,
              destination institutions, and the share of graduates found in covered Texas
              higher-ed enrollment data.
            </p>
            <div className="state-home-actions">
              <a href="#texas-high-school-outcomes" className="report-entry-link primary">
                Search high schools
              </a>
              <a href="#texas-data-sources" className="report-entry-link">
                View sources
              </a>
            </div>
          </div>

          <div className="state-home-proof" aria-label={`${profile.name} state data highlights`}>
            {profile.heroStats.map(stat => (
              <div className="state-home-proof-item" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="state-home-shell">
        <section className="state-home-product" id="texas-high-school-outcomes">
          <div className="state-home-section-heading">
            <p className="state-home-kicker">Interactive school lookup</p>
            <h2>Start with a Texas high school</h2>
            <p>
              Compare graduates, tracked college enrollment, and top destination institutions
              across the available 2019-2024 campus-level files.
            </p>
          </div>
          <StateOutcomeExplorer stateSlug={profile.slug} stateName={profile.name} />
        </section>

        <section className="state-home-band">
          <div className="state-home-section">
            <h2>What this page is for</h2>
            <p>{profile.shortAnswer}</p>
          </div>

          <section className="state-home-section" id="texas-data-sources">
            <h2>What the official data can answer</h2>
            <p>{profile.sourceSummary}</p>
            <div className="article-table-wrap">
              <table className="article-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Use on the site</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.sources.map(source => (
                    <tr key={source.href}>
                      <td>
                        <a href={source.href} target="_blank" rel="noopener">
                          {source.label}
                        </a>
                      </td>
                      <td>{source.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {profile.tables.map(table => (
            <DataTable table={table} key={table.title} />
          ))}

          <section className="state-home-section">
            <h2>What to build next</h2>
            <div className="state-home-module-grid">
              {profile.productModules.map(module => (
                <div key={module.title}>
                  <span>{module.status}</span>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="state-home-section">
            <h2>Important caveats</h2>
            <ul>
              {profile.caveats.map(caveat => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </section>

          <section className="state-home-section">
            <h2>FAQ</h2>
            <div className="state-home-faq-grid">
              {profile.faqs.map(faq => (
                <div key={faq.question}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>

      <footer>
        <p>
          <Link href="/">UC admissions tool</Link> | <Link href="/states">States</Link> |{' '}
          <Link href="/rankings">Rankings</Link> | <Link href="/about">About</Link>
        </p>
      </footer>
    </>
  )
}
