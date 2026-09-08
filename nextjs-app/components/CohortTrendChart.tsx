type Series = { label: string; years: { year: string; admitRate: number }[] }
const COLORS = ['#174b80', '#9a4d00', '#6b359b', '#08746f']
const DASHES = ['none', '8 3', '2 3', '9 3 2 3']

export default function CohortTrendChart({ campuses }: { campuses: Series[] }) {
  const maximum = Math.max(0.2, Math.ceil(Math.max(...campuses.flatMap(c => c.years.map(y => y.admitRate))) * 10) / 10)
  const ticks = Array.from({ length: Math.round(maximum * 10) + 1 }, (_, i) => i / 10)
  const left = 52, right = 650, top = 24, bottom = 232
  const x = (index: number) => left + (right - left) * index / (campuses[0].years.length - 1)
  const y = (rate: number) => bottom - rate / maximum * (bottom - top)
  return <figure className="cohort-trend-figure">
    <p className="chart-scroll-note">Scroll sideways to see all five years.</p>
    <div className="cohort-chart-scroll" tabIndex={0} role="region" aria-label="Five-year admit-rate chart; scroll horizontally on small screens"><svg viewBox="0 0 680 270" role="img" aria-labelledby="cohort-chart-title cohort-chart-description">
      <title id="cohort-chart-title">Five-year admit rates for the same Bay Area school cohort</title>
      <desc id="cohort-chart-description">Four campus series from 2021 to 2025 on a shared percentage scale. The full applicants and admits table follows this chart.</desc>
      {ticks.map(tick => <g key={tick}><line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="#dce4ec" /><text x={left - 10} y={y(tick) + 4} textAnchor="end">{Math.round(tick * 100)}%</text></g>)}
      {campuses[0].years.map((point, i) => <text key={point.year} x={x(i)} y={bottom + 25} textAnchor="middle">{point.year}</text>)}
      {campuses.map((campus, i) => <g key={campus.label}>
        <polyline fill="none" stroke={COLORS[i]} strokeWidth="3" strokeDasharray={DASHES[i]} points={campus.years.map((point, j) => `${x(j)},${y(point.admitRate)}`).join(' ')} />
        {campus.years.map((point, j) => <circle key={point.year} cx={x(j)} cy={y(point.admitRate)} r="3.5" fill={COLORS[i]}><title>{campus.label}, {point.year}: {(point.admitRate * 100).toFixed(1)}%</title></circle>)}
      </g>)}
    </svg></div>
    <div className="cohort-chart-legend">{campuses.map((campus, i) => <span key={campus.label}><svg viewBox="0 0 28 6" aria-hidden="true"><line x1="0" x2="28" y1="3" y2="3" stroke={COLORS[i]} strokeWidth="3" strokeDasharray={DASHES[i]} /></svg>{campus.label}</span>)}</div>
    <figcaption>Each line follows the same schools and uses summed admits ÷ summed applicants. Individual years fluctuate; the endpoint comparison is not a fitted trend or a claim of steady change.</figcaption>
  </figure>
}
