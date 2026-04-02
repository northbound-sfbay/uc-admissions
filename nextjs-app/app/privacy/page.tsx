import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | collegeacceptance.info',
  description: 'Privacy policy for collegeacceptance.info.',
  alternates: { canonical: 'https://collegeacceptance.info/privacy' },
}

const SECTION: React.CSSProperties = {
  borderTop: '1px solid var(--border)',
  paddingTop: '1.5rem',
  marginTop: '1.5rem',
}

const H3: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 700,
  marginBottom: '0.6rem',
  color: 'var(--text)',
}

const P: React.CSSProperties = {
  marginBottom: '0.75rem',
  lineHeight: '1.7',
}

export default function PrivacyPage() {
  return (
    <>
      <header>
        <div className="header-inner">
          <h1>UC Admissions by California High School</h1>
          <p className="subtitle">Fall 1994 – 2025 · Applicants, Admits &amp; Enrollees by school, campus, and ethnicity</p>
        </div>
      </header>

      <main style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'var(--text)',
        fontSize: '0.95rem',
        lineHeight: '1.7',
      }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>Privacy Policy</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Last updated: April 2026</p>

        <p style={P}>
          This privacy policy describes how collegeacceptance.info ("this site") collects and uses
          information when you visit. This site does not collect any personally identifiable
          information directly.
        </p>

        <div style={SECTION}>
          <h3 style={H3}>Analytics</h3>
          <p style={P}>
            This site uses <strong>Google Analytics</strong> to collect anonymous usage data such
            as pages visited, time on site, and general geographic region. This data is used solely
            to understand how visitors use the site. Google Analytics may use cookies to track
            sessions. You can opt out via the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
              Google Analytics opt-out browser add-on
            </a>.
          </p>
        </div>

        <div style={SECTION}>
          <h3 style={H3}>Advertising</h3>
          <p style={P}>
            This site uses <strong>Mediavine</strong> (Journey by Mediavine) to serve
            advertisements. Mediavine and its advertising partners may use cookies, web beacons,
            and similar tracking technologies to serve ads based on your interests and prior visits
            to this and other websites.
          </p>
          <p style={P}>
            Mediavine's advertising partners include Google and other third-party ad networks. For
            more information on how Mediavine handles data, see the{' '}
            <a href="https://www.mediavine.com/privacy-policy/" target="_blank" rel="noopener">
              Mediavine Privacy Policy
            </a>.
          </p>
          <p style={P}>
            To opt out of interest-based advertising, you can visit:
          </p>
          <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <a href="https://optout.aboutads.info/" target="_blank" rel="noopener">Digital Advertising Alliance (DAA) opt-out</a>
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener">Network Advertising Initiative (NAI) opt-out</a>
            </li>
            <li>
              <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener">Your Online Choices (EU)</a>
            </li>
          </ul>
        </div>

        <div style={SECTION}>
          <h3 style={H3}>Cookies</h3>
          <p style={P}>
            This site uses cookies through Google Analytics and Mediavine for analytics and
            advertising purposes as described above. You can control cookies through your browser
            settings; disabling cookies may affect site functionality.
          </p>
        </div>

        <div style={SECTION}>
          <h3 style={H3}>Data</h3>
          <p style={P}>
            All admissions data displayed on this site is sourced from the publicly available{' '}
            <a href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school" target="_blank" rel="noopener">
              UC Information Center
            </a>. No user-submitted data is stored or shared.
          </p>
        </div>

        <div style={SECTION}>
          <h3 style={H3}>Contact</h3>
          <p style={{ ...P, marginBottom: '1.5rem' }}>
            If you have questions about this privacy policy, you can reach out via the{' '}
            <a href="https://github.com/northbound-sfbay/uc-admissions/issues" target="_blank" rel="noopener">
              GitHub repository
            </a>.
          </p>
        </div>

        <Link href="/" style={{ color: '#2563eb', fontSize: '0.9rem' }}>← Back to the tool</Link>
      </main>

      <footer>
        <p>Data: <a href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school" target="_blank" rel="noopener">UC Information Center</a> · School locations: California Dept. of Education &amp; OpenStreetMap contributors · Map: © CARTO · <a href="/about">About this site</a> · <a href="/privacy">Privacy Policy</a></p>
      </footer>
    </>
  )
}
