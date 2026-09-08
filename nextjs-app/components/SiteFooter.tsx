
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
        <a href="/counselors">Counselor resources</a> ·{' '}
        <a href="/rankings">Rankings</a> ·{' '}
        <a href="/states">State admissions data</a> ·{' '}
        <a href="/states/texas">Texas high-school outcomes</a> ·{' '}
        <a href="/insights/uc-admissions-by-source-school">Methodology</a> ·{' '}
        <a href="/insights">Insights</a> ·{' '}
        <a href="/about">About this site</a> ·{' '}
        <a href="/privacy">Privacy Policy</a>
      </p>
    </footer>
  )
}
