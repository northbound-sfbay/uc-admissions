import { getTexasOutcomeData } from '@/lib/texas-outcomes'

export function getTexasCollegeFeeders(ficeCode: string) {
  const dataset = getTexasOutcomeData()
  const year = dataset.years.at(-1)!.key
  const enrollment = (school: typeof dataset.schools[number], key: string) =>
    school.years[key]?.destinations.filter(d => !d.aggregate && d.ficeCode === ficeCode)
      .reduce((sum, d) => sum + d.students, 0) ?? 0
  const schools = dataset.schools.map(school => {
    const students = enrollment(school, year)
    const graduates = school.years[year]?.graduates ?? 0
    return { school, students, graduates, share: graduates ? students / graduates * 100 : 0 }
  }).filter(row => row.students > 0).sort((a, b) => b.students - a.students || a.school.schoolName.localeCompare(b.school.schoolName))
  const trend = dataset.years.map(({ key }) => {
    const counts = dataset.schools.map(s => enrollment(s, key)).filter(n => n > 0)
    return { year: key, students: counts.reduce((sum, n) => sum + n, 0), schools: counts.length }
  })
  return { year, schools, trend, total: schools.reduce((sum, r) => sum + r.students, 0), dataset }
}
