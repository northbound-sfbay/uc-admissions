import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer>
      <p>
        Data:{' '}
        <a
          href="https://www.universityofcalifornia.edu/about-us/information-center/admissions-source-school"
          target="_blank"
          rel="noopener"
        >
          UC Information Center
        </a>{' '}
        · School locations: California Dept. of Education &amp; OpenStreetMap contributors · Map: © CARTO ·{' '}
        <Link href="/rankings">Rankings</Link> ·{' '}
        <Link href="/states">State admissions data</Link> ·{' '}
        <Link href="/states/texas">Texas high-school outcomes</Link> ·{' '}
        <Link href="/insights/uc-admissions-by-source-school">Methodology</Link> ·{' '}
        <Link href="/insights">Insights</Link> ·{' '}
        <Link href="/about">About this site</Link> ·{' '}
        <Link href="/privacy">Privacy Policy</Link>
      </p>
    </footer>
  )
}
