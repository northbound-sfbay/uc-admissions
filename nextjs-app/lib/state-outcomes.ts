export type StateOutcomeSource = {
  label: string
  href: string
  description: string
}

export type StateOutcomeStat = {
  label: string
  value: string
  detail: string
}

export type StateOutcomeTable = {
  title: string
  note: string
  columns: string[]
  rows: string[][]
}

export type StateOutcomeProfile = {
  slug: string
  abbreviation: string
  name: string
  title: string
  description: string
  canonical: string
  updatedLabel: string
  sourceYearLabel: string
  shortAnswer: string
  sourceSummary: string
  heroStats: StateOutcomeStat[]
  sources: StateOutcomeSource[]
  tables: StateOutcomeTable[]
  productModules: Array<{
    title: string
    description: string
    status: string
    href?: string
  }>
  nextPages: Array<{
    path: string
    purpose: string
  }>
  caveats: string[]
  faqs: Array<{
    question: string
    answer: string
  }>
}

const BASE_URL = 'https://collegeacceptance.info'

export const STATE_OUTCOME_PROFILES: StateOutcomeProfile[] = [
  {
    slug: 'texas',
    abbreviation: 'TX',
    name: 'Texas',
    title: 'Texas College Enrollment and High School Outcomes',
    description:
      'Use official Texas higher-ed data to understand where Texas high-school graduates enroll, with indexable school profiles, complete destination lists, UT Austin feeder trends, and first-year GPA bands.',
    canonical: `${BASE_URL}/states/texas`,
    updatedLabel: 'Updated July 21, 2026',
    sourceYearLabel: 'FY 2024 graduates entering higher education in Fall 2024',
    shortAnswer:
      'Texas is the first non-California expansion because THECB publishes high-school-to-college destination files by campus, district, county, and destination institution. You can now browse one indexable page per Texas high school and compare reported UT Austin feeder enrollment without mislabeling those outcomes as acceptance rates.',
    sourceSummary:
      'The Texas Higher Education Coordinating Board publishes a long statewide summary from Fall 2000 through Fall 2024, annual campus destination files, and separate first-year GPA files. The site joins the 2019–2024 files on stable nine-digit campus codes and retains all published destination rows plus six-digit FICE codes. The files report enrollment outcomes, not admissions offers.',
    heroStats: [
      {
        value: '382,023',
        label: 'Texas graduates',
        detail: 'Total FY 2024 high-school graduates in the THECB statewide file.',
      },
      {
        value: '166,795',
        label: 'Texas higher-ed enrollments',
        detail: 'Public 4-year, public 2-year, and independent college enrollments in Fall 2024.',
      },
      {
        value: '47.7%',
        label: 'Trackable enrollment rate',
        detail: 'Enrolled divided by graduates after excluding 32,500 not-trackable records.',
      },
      {
        value: '1,629',
        label: 'High schools in campus file',
        detail: 'High schools with more than 25 graduates in the downloaded campus-level XLS.',
      },
    ],
    sources: [
      {
        label: 'TXHigherEdData high-school graduates hub',
        href: 'https://www.txhighereddata.org/high-school-graduates/hsgradsenrolled/',
        description:
          'Official entry point for Texas high-school graduates enrolled in higher education the following fall.',
      },
      {
        label: 'Fall 2024 statewide summary XLS',
        href: 'https://reportcenter.highered.texas.gov/reports/data/high-school-graduates-enrolled-in-higher-education-statewide-summary-fall-2000-fall-2024-xls/',
        description:
          'Statewide totals by destination and student ethnicity from Fall 2000 through Fall 2024.',
      },
      {
        label: 'Fall 2024 campus-level XLS',
        href: 'https://reportcenter.highered.texas.gov/reports/data/high-school-graduates-enrolled-in-higher-education-by-campus-fall-2024-xls/',
        description:
          'High-school, district, county, destination institution, and student-count rows for FY 2024 graduates.',
      },
      {
        label: 'Report Center data index',
        href: 'https://reportcenter.highered.texas.gov/reports/data/?startRow=41',
        description:
          'Official THECB index where the annual campus-level XLS files are listed by fall year.',
      },
      {
        label: 'High-school graduates GPA in higher education',
        href: 'https://www.txhighereddata.org/high-school-graduates/high-school-graduates-gpa-in-higher-education/',
        description:
          'Official first-year GPA bands and public four-year/two-year sector counts by Texas high school.',
      },
    ],
    tables: [
      {
        title: 'Texas statewide destination mix',
        note:
          'Counts are from the Fall 2024 THECB statewide XLS. The enrollment rate uses the report denominator that excludes not-trackable records.',
        columns: ['Destination', 'Students', 'Share of all graduates'],
        rows: [
          ['Public 4-year institution', '80,604', '21.1%'],
          ['Public 2-year institution', '74,736', '19.6%'],
          ['Independent university or college', '11,455', '3.0%'],
          ['Not trackable', '32,500', '8.5%'],
          ['Not found in Texas higher-ed records', '182,728', '47.8%'],
        ],
      },
      {
        title: 'Top named Texas destinations in the campus file',
        note:
          'This starter table aggregates named institutions in the Fall 2024 campus-level XLS and excludes "Other," "Not found," and "Not trackable" rows.',
        columns: ['Destination institution', 'Students'],
        rows: [
          ['Texas A&M University', '6,639'],
          ['University of Texas Rio Grande Valley', '5,827'],
          ['Dallas College District', '5,405'],
          ['Texas State University', '5,362'],
          ['University of Texas at Austin', '4,950'],
          ['San Jacinto College', '4,607'],
          ['University of North Texas', '3,968'],
          ['University of Texas at San Antonio', '3,883'],
        ],
      },
      {
        title: 'Starter high-school outcome examples',
        note:
          "These are not acceptance rates. They show the share of a high school's graduates found in Texas higher-ed enrollment records, filtering to schools with at least 250 graduates.",
        columns: ['High school', 'District', 'Graduates', 'Tracked enrollment rate'],
        rows: [
          ['John B Alexander H S', 'United ISD', '729', '72.4%'],
          ["O'Connor H S", 'Northside ISD', '619', '69.5%'],
          ['Sharyland H S', 'Sharyland ISD', '410', '69.0%'],
          ['John A Dubiski Career H S', 'Grand Prairie ISD', '335', '66.3%'],
          ['Veterans Memorial Early College H S', 'Brownsville ISD', '522', '65.9%'],
          ['Eagle Pass H S', 'Eagle Pass ISD', '544', '65.6%'],
        ],
      },
    ],
    productModules: [
      {
        title: 'Texas high-school destination pages',
        description:
          'Browse one page per Texas high school with complete destinations, college-going trends, UT Austin enrollment, sector mix, and GPA bands.',
        status: 'Live',
        href: '/states/texas/high-schools',
      },
      {
        title: 'UT Austin feeder schools',
        description:
          'Compare 2019–2024 reported UT Austin enrollment, leading high schools, graduate shares, and county patterns.',
        status: 'Live',
        href: '/college/university-of-texas-at-austin/feeder-schools',
      },
      {
        title: 'Texas automatic admission explainer',
        description:
          'Pair the destination data with Texas top-percent automatic-admission rules and explicit policy review dates.',
        status: 'Planned',
      },
    ],
    nextPages: [
      {
        path: '/states/texas/high-schools',
        purpose: 'Index of Texas high schools with complete individual enrollment-outcome pages.',
      },
      {
        path: '/states/texas/automatic-admission',
        purpose: 'Explain top-percent automatic admission and link to Texas public university profiles.',
      },
      {
        path: '/college/university-of-texas-at-austin/feeder-schools',
        purpose: 'UT Austin feeder enrollment trends, leading schools, graduate shares, and geography.',
      },
    ],
    caveats: [
      'The THECB high-school destination files are enrollment records, not admit or application records.',
      'The state-level THECB summary runs back to Fall 2000, but the local high-school chart uses the annual campus-level files available for Fall 2019 through Fall 2024.',
      '"Not found" does not necessarily mean a graduate did not attend college; the report is scoped to the institutions covered by the source.',
      'The campus-level file is limited to high schools with more than 25 graduates and suppresses small destination counts into "Other" rows.',
      'The GPA report uses activity across the academic year and may not match the fall-only enrollment counts; GPA bands are suppressed for public sectors with fewer than five students.',
    ],
    faqs: [
      {
        question: 'Does Texas publish high-school college acceptance rates?',
        answer:
          'The useful public Texas source is mainly college destination data: where graduates enrolled after high school. Acceptance-rate pages should use college-level IPEDS, Scorecard, and Common Data Set sources rather than treating destination records as admissions offers.',
      },
      {
        question: 'What Texas content should be built first?',
        answer:
          'The high-school destination pages and UT Austin feeder page are live. The next useful layer is policy-aware Texas college profiles using admissions sources that are distinct from the THECB enrollment outcomes.',
      },
    ],
  },
]

export function getStateOutcomeProfile(slug: string): StateOutcomeProfile | undefined {
  return STATE_OUTCOME_PROFILES.find(profile => profile.slug === slug)
}

export function getStateOutcomeSlugs(): string[] {
  return STATE_OUTCOME_PROFILES.map(profile => profile.slug)
}
