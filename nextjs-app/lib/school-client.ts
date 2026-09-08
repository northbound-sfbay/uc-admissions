import type { School } from './types'
import { schoolKey } from './utils'

let indexPromise: Promise<School[]> | undefined
const requests = new Map<string, Promise<School>>()

export function loadSchoolIndex(): Promise<School[]> {
  if (!indexPromise) {
    indexPromise = fetch('/data/school-index.json')
      .then(response => {
        if (!response.ok) throw new Error('School search could not load. Please try again.')
        return response.json() as Promise<School[]>
      })
      .catch(error => { indexPromise = undefined; throw error })
  }
  return indexPromise
}

export function loadSchool(school: School): Promise<School> {
  if (Object.keys(school.years).length) return Promise.resolve(school)
  const key = schoolKey(school)
  if (!requests.has(key)) {
    const type = school.school_type === 'CA Private' ? 'ca_private' : 'ca_public'
    requests.set(key, fetch(`/data/schools/${type}/${encodeURIComponent(school.school_id)}.json`)
      .then(response => {
        if (!response.ok) throw new Error('This school could not load. Please try again.')
        return response.json() as Promise<School>
      })
      .catch(error => { requests.delete(key); throw error }))
  }
  return requests.get(key)!
}
