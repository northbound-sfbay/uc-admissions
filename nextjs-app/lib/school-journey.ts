import { trackEvent } from './analytics'

const KEY = 'uc_pending_school_navigation'
const MAX_AGE = 5 * 60 * 1000

type SchoolNavigation = {
  path: string
  originPage: string
  interactionSource: string
  selected: boolean
  createdAt: number
}

// Short-lived, tab-local evidence of a deliberate navigation. No user identifier.
// GA's own session boundary must still be used when constructing a funnel.
export function rememberSchoolNavigation(href: string, interactionSource: string, selected = false) {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin || !/^\/school\/[^/]+$/.test(url.pathname)) return
    const navigation: SchoolNavigation = {
      path: url.pathname, originPage: window.location.pathname,
      interactionSource, selected, createdAt: Date.now(),
    }
    window.sessionStorage.setItem(KEY, JSON.stringify(navigation))
  } catch { /* Navigation and search must still work when storage is unavailable. */ }
}

export function completeSchoolNavigation(schoolSlug: string) {
  if (typeof window === 'undefined') return
  try {
    const raw = window.sessionStorage.getItem(KEY)
    window.sessionStorage.removeItem(KEY)
    if (!raw) return
    const pending = JSON.parse(raw) as SchoolNavigation
    const referrer = new URL(document.referrer)
    const age = Date.now() - pending.createdAt
    if (pending.path !== `/school/${schoolSlug}` || pending.path !== window.location.pathname ||
        !Number.isFinite(age) || age < 0 || age > MAX_AGE ||
        referrer.origin !== window.location.origin || referrer.pathname !== pending.originPage) return
    const params = {
      school_slug: schoolSlug,
      origin_page: pending.originPage,
      interaction_source: pending.interactionSource,
      navigation_method: pending.selected ? 'school_search' : 'internal_link',
    }
    trackEvent('school_profile_open', params)
    if (pending.selected) trackEvent('school_search_complete', { ...params, destination: 'school_profile' })
  } catch { /* Missing referrer/storage means unconfirmed, never a fabricated success. */ }
}
