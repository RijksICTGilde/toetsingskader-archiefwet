// Het oordeel over een veraPDF-rapport: wanneer de CI-stap rood moet worden.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { beoordeel } from '../../scripts/pdf-verapdf.mjs'

const job = (name, { compliant = true, ruleSummaries = [], jobEndStatus = 'normal' } = {}) => ({
  itemDetails: { name: path.resolve(name) },
  validationResult: [{ profileName: 'PDF/UA-1 validation profile', jobEndStatus, compliant, details: { ruleSummaries } }],
})
const rapport = (...jobs) => ({ report: { jobs } })

test('conform bestand: geen fout, geen regels', () => {
  assert.deepEqual(beoordeel(rapport(job('a.pdf')), ['a.pdf']), [{ bestand: 'a.pdf', regels: [] }])
})

test('mislukte regel komt terug met clausule, aantal en plek', () => {
  const r = job('a.pdf', {
    compliant: false,
    ruleSummaries: [
      { clause: '7.18.5', testNumber: 2, status: 'failed', failedChecks: 2, description: 'Links shall contain …', checks: [{ status: 'failed', context: 'annots[0]' }, { status: 'failed', context: 'annots[1]' }] },
      { clause: '7.1', testNumber: 3, status: 'passed', failedChecks: 0, description: 'ok', checks: [] },
    ],
  })
  const [uit] = beoordeel(rapport(r), ['a.pdf'])
  assert.equal(uit.fout, undefined)
  assert.deepEqual(uit.regels, [{ regel: '7.18.5-2', aantal: 2, beschrijving: 'Links shall contain …', plekken: ['annots[0]', 'annots[1]'] }])
})

test('bestand dat veraPDF overslaat of niet afmaakt is een fout, geen groen', () => {
  const uit = beoordeel(rapport(job('a.pdf'), job('c.pdf', { jobEndStatus: 'timeout' }), { itemDetails: { name: path.resolve('d.pdf') }, validationResult: [] }), ['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf'])
  assert.equal(uit[0].fout, undefined)
  assert.match(uit[1].fout, /niet in het rapport/)
  assert.match(uit[2].fout, /afgebroken/)
  assert.match(uit[3].fout, /niet gevalideerd/)
})

test('niet conform zonder mislukte regel is ook een fout', () => {
  const [uit] = beoordeel(rapport(job('a.pdf', { compliant: false })), ['a.pdf'])
  assert.match(uit.fout, /niet conform/)
})
