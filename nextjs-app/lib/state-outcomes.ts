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
    title: 'Texas College Acceptance and High School Outcomes',
    description:
      'Use official Texas higher-ed data to understand where Texas high-school graduates enroll after graduation, with 2024 statewide counts and starter high-school destination views.',
    canonical: `${BASE_URL}/states/texas`,
    updatedLabel: 'Updated May 11, 2026',
    sourceYearLabel: 'FY 2024 graduates entering higher education in Fall 2024',
    shortAnswer:
      'Texas is the best first non-California expansion because THECB publishes high-school-to-college destination files by campus, district, county, and destination institution. The data supports college-going and destination pages now, while acceptance-rate pages should come later from IPEDS, College Scorecard, and Common Data Set sources.',
    sourceSummary:
      'The Texas Higher Education Coordinating Board publishes a long statewide summary from Fall 2000 through Fall 2024 and annual campus-level XLS files for recent cohorts. The interactive chart uses the annual campus files from Fall 2019 through Fall 2024, merging campus-code changes by high school, district, and county. The campus files report destination institutions, not admissions offers.',
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
          'Create one page per Texas high school showing graduate count, tracked college-going rate, top destination institutions, and district/county context.',
        status: 'Best immediate build',
      },
      {
        title: 'Texas automatic admission explainer',
        description:
          'Pair the destination data with Texas top-percent automatic-admission rules, but keep this as policy content with review dates.',
        status: 'Good second page',
      },
      {
        title: 'Texas college profile pages',
        description:
          'Use Scorecard/IPEDS/CDS for UT Austin, Texas A&M, Rice, Houston, UT Dallas, Texas Tech, UNT, and other major destinations.',
        status: 'National database dependency',
      },
    ],
    nextPages: [
      {
        path: '/states/texas/high-school-destinations',
        purpose: 'Searchable table of Texas high schools, graduates, tracked enrollment rate, and top destinations.',
      },
      {
        path: '/states/texas/automatic-admission',
        purpose: 'Explain top-percent automatic admission and link to Texas public university profiles.',
      },
      {
        path: '/college/university-of-texas-at-austin',
        purpose: 'First Texas college profile using IPEDS, Scorecard, and Common Data Set fields.',
      },
    ],
    caveats: [
      'The THECB high-school destination files are enrollment records, not admit or application records.',
      'The state-level THECB summary runs back to Fall 2000, but the local high-school chart uses the annual campus-level files available for Fall 2019 through Fall 2024.',
      '"Not found" does not necessarily mean a graduate did not attend college; the report is scoped to the institutions covered by the source.',
      'The campus-level file is limited to high schools with more than 25 graduates and suppresses small destination counts into "Other" rows.',
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
          'Build high-school destination pages first because the official file already has high school, district, county, destination institution, and student-count fields.',
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
