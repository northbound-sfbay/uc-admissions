import { CAMPUSES, ETHNICITIES, MAX_CMP } from './constants'

export function readToolState(search: string) {
  const params = new URLSearchParams(search)
  const school = params.get('school') ?? ''
  const compare = [...new Set((params.get('compare') ?? '').split(',').filter(id => /^\d+$/.test(id)))].slice(0, MAX_CMP)
  const campus = params.get('campus') ?? 'universitywide'
  const ethnicity = params.get('ethnicity') ?? 'all'
  const compareCampus = params.get('compareCampus') ?? campus
  const compareEthnicity = params.get('compareEthnicity') ?? ethnicity
  return {
    school: /^\d+$/.test(school) ? school : '', compare, hasCompare: params.has('compare'),
    campus: CAMPUSES.includes(campus) ? campus : 'universitywide',
    ethnicity: ETHNICITIES.includes(ethnicity) ? ethnicity : 'all',
    compareCampus: CAMPUSES.includes(compareCampus) ? compareCampus : 'universitywide',
    compareEthnicity: ETHNICITIES.includes(compareEthnicity) ? compareEthnicity : 'all',
  }
}

export function toolHref(school: string, compare: string[] = [], campus = 'universitywide', ethnicity = 'all', compareCampus = campus, compareEthnicity = ethnicity) {
  const params = new URLSearchParams({ school })
  params.set('compare', [...new Set(compare)].slice(0, MAX_CMP).join(','))
  if (campus !== 'universitywide') params.set('campus', campus)
  if (ethnicity !== 'all') params.set('ethnicity', ethnicity)
  if (compareCampus !== campus) params.set('compareCampus', compareCampus)
  if (compareEthnicity !== ethnicity) params.set('compareEthnicity', compareEthnicity)
  return `/?${params.toString()}#school-tool`
}
