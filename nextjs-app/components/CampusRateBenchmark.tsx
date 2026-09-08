const CAMPUS_RATE_BENCHMARKS = [
  { campus: 'UCLA', applicants: 88267, admits: 7863, rate: 0.089 },
  { campus: 'UC Berkeley', applicants: 71750, admits: 9102, rate: 0.127 },
  { campus: 'UC San Diego', applicants: 86639, admits: 21332, rate: 0.246 },
  { campus: 'UC Irvine', applicants: 85584, admits: 18680, rate: 0.218 },
  { campus: 'UC Santa Barbara', applicants: 73885, admits: 23786, rate: 0.322 },
  { campus: 'UC Davis', applicants: 68388, admits: 25225, rate: 0.369 },
  { campus: 'UC Santa Cruz', applicants: 51879, admits: 37004, rate: 0.713 },
  { campus: 'UC Riverside', applicants: 60765, admits: 52907, rate: 0.871 },
  { campus: 'UC Merced', applicants: 42412, admits: 40854, rate: 0.963 },
]

function formatCount(value: number) {
  return value.toLocaleString()
}

function formatRate(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export default function CampusRateBenchmark() {
  return (
    <section className="uc-rate-benchmark" aria-label="Fall 2025 UC campus admission-rate benchmarks">
      <div className="uc-rate-benchmark-copy">
        <div className="ctrl-label">Fall 2025 campus benchmark</div>
        <p>
          Approximate admit rates from California public and private high-school source-school
          records. Use these as a campus baseline, then search a high school below for the
          school-specific trend.
        </p>
      </div>
      <div className="uc-rate-benchmark-list">
        {CAMPUS_RATE_BENCHMARKS.map(row => (
          <div className="uc-rate-benchmark-chip" key={row.campus}>
            <span>{row.campus}</span>
            <strong>{formatRate(row.rate)}</strong>
            <em>{formatCount(row.admits)} / {formatCount(row.applicants)}</em>
          </div>
        ))}
      </div>
    </section>
  )
}
