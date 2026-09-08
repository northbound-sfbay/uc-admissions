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
const { readToolState, toolHref } = load('tool-state')
const readHref = href => readToolState(new URL(href, 'https://collegeacceptance.info').search)

test('shared comparisons restore independent filters and school choices', () => {
  const state = readHref(toolHref('52350', ['52350', '52970'], 'Los Angeles', 'Hispanic/ Latinx', 'Berkeley', "Int'l"))
  assert.deepEqual(state, { school: '52350', compare: ['52350', '52970'], hasCompare: true, campus: 'Los Angeles', ethnicity: 'Hispanic/ Latinx', compareCampus: 'Berkeley', compareEthnicity: "Int'l" })
})
test('an intentionally empty comparison survives reload', () => {
  assert.equal(readHref(toolHref('52350', [])).hasCompare, true)
  assert.deepEqual(readHref(toolHref('52350', [])).compare, [])
  assert.equal(readToolState('').hasCompare, false)
})
test('untrusted URLs cannot supply invalid IDs or filter names', () => {
  const state = readToolState('?school=../../privacy&compare=1,1,bad,2&campus=invalid&ethnicity=invalid')
  assert.equal(state.school, '')
  assert.deepEqual(state.compare, ['1', '2'])
  assert.equal(state.campus, 'universitywide')
  assert.equal(state.ethnicity, 'all')
})
test('comparison URLs cap unique schools at eight', () => {
  const ids = Array.from({ length: 12 }, (_, i) => String(i + 1))
  assert.deepEqual(readHref(toolHref('1', ids)).compare, ids.slice(0, 8))
  assert.equal(readToolState('?compare=' + ids.join(',')).compare.length, 8)
})
