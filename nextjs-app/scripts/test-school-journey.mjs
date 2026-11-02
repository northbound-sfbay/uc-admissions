import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))

// Load these pure TS modules without adding a test runner to the client bundle.
function load(name) {
  const filename = path.join(scriptDirectory, '../lib', name + '.ts')
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const result = { exports: {} }
  new Function('require', 'module', 'exports', source)(id => load(id.replace('./', '')), result, result.exports)
  return result.exports
}
const { rememberSchoolNavigation, completeSchoolNavigation } = load('school-journey')
const key = 'uc_pending_school_navigation'
function fixture() {
  const store = new Map(), events = []
  globalThis.window = {
    location: new URL('https://collegeacceptance.info/insights/uc-admission-rates-by-high-school'),
    sessionStorage: { setItem: (k,v) => store.set(k,v), getItem: k => store.get(k), removeItem: k => store.delete(k) },
    gtag: (...args) => events.push(args),
  }
  globalThis.document = { referrer: window.location.href }
  return { store, events, arrive: () => { window.location = new URL('https://collegeacceptance.info/school/1-example') } }
}

test('finder completion requires arrival, fires once, and preserves interaction attribution', () => {
  const { events, arrive, store } = fixture()
  rememberSchoolNavigation('/school/1-example', 'high_school_guide', true)
  assert.equal(events.length, 0)
  arrive()
  completeSchoolNavigation('1-example')
  completeSchoolNavigation('1-example')
  assert.deepEqual(events.map(e => e[1]), ['school_profile_open', 'school_search_complete'])
  assert.equal(events[0][2].interaction_source, 'high_school_guide')
  assert.equal(events[0][2].origin_page, '/insights/uc-admission-rates-by-high-school')
  assert.equal(events[1][2].destination, 'school_profile')
  assert.equal('source' in events[0][2], false)
  assert.equal(store.size, 0)
})
test('ordinary links confirm a profile without inventing a search completion', () => {
  const {events, arrive} = fixture()
  rememberSchoolNavigation('/school/1-example', 'peer_schools')
  arrive()
  completeSchoolNavigation('1-example')
  assert.deepEqual(events.map(e => e[1]), ['school_profile_open'])
})
test('direct arrivals, wrong destination, old evidence and wrong referrers do not count', () => {
  for (const invalid of ['absent','destination','expired','future','referrer','external-referrer','missing-referrer','malformed']) {
    const {events, arrive, store} = fixture()
    rememberSchoolNavigation('/school/1-example', 'guide', true)
    const pending = JSON.parse(store.get(key))
    if (invalid === 'absent') store.clear()
    if (invalid === 'destination') pending.path = '/school/2-different'
    if (invalid === 'expired') pending.createdAt -= 301000
    if (invalid === 'future') pending.createdAt += 60000
    if (!['absent','malformed'].includes(invalid)) store.set(key, JSON.stringify(pending))
    if (invalid === 'malformed') store.set(key, '{bad')
    if (invalid === 'referrer') document.referrer = 'https://collegeacceptance.info/other'
    if (invalid === 'external-referrer') document.referrer = 'https://example.com/insights/uc-admission-rates-by-high-school'
    if (invalid === 'missing-referrer') document.referrer = ''
    arrive()
    completeSchoolNavigation('1-example')
    assert.equal(events.length, 0, invalid)
    assert.equal(store.size, 0, invalid)
  }
})
test('external links, other route families and unavailable storage leave navigation usable', () => {
  const {store, events} = fixture()
  rememberSchoolNavigation('https://example.com/school/1-example', 'guide')
  rememberSchoolNavigation('/insights/example', 'guide')
  assert.equal(store.size, 0)
  window.sessionStorage = { setItem() { throw new Error('blocked') }, getItem() { throw new Error('blocked') } }
  assert.doesNotThrow(() => rememberSchoolNavigation('/school/1-example', 'guide'))
  assert.doesNotThrow(() => completeSchoolNavigation('1-example'))
  assert.equal(events.length, 0)
})
