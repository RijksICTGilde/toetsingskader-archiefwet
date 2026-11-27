// Release-administratie: Unreleased naar een versie, de tekst van een release,
// publiccode.yml en de CLI.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareChangelog, preparePubliccode, releaseNotes, today } from '../../scripts/release.mjs'

const SCRIPT = fileURLToPath(new URL('../../scripts/release.mjs', import.meta.url))
const REPO = 'https://github.com/RijksICTGilde/toetsingskader-archiefwet'
const HEAD = '# Changelog\n\nIntro.\n\n[kac]: https://keepachangelog.com/nl/1.1.0/\n\nUitleg.\n\n'

const bron = `${HEAD}## [Unreleased]

### Gewijzigd

- Nieuw ding, met “aanhalingstekens” en é.

### Techniek

- Technisch ding.

## [1.0.2] - 2026-11-24

### Opgelost

- Oud.

## [1.0.1] - 2026-11-23

### Techniek

- Ouder.

[Unreleased]: ${REPO}/compare/v1.0.2...HEAD
[1.0.2]: ${REPO}/releases/tag/v1.0.2
[1.0.1]: ${REPO}/releases/tag/v1.0.1
`

test('zet Unreleased onder de nieuwe versie en laat Unreleased leeg achter', () => {
  const uit = prepareChangelog(bron, '1.1.0', '2026-12-01')
  assert.match(
    uit,
    /## \[Unreleased\]\n\n## \[1\.1\.0\] - 2026-12-01\n\n### Gewijzigd\n\n- Nieuw ding, met “aanhalingstekens” en é\.\n\n### Techniek\n\n- Technisch ding\.\n\n## \[1\.0\.2\] - 2026-11-24\n/,
  )
  assert.equal((uit.match(/^## \[Unreleased\]/gm) ?? []).length, 1)
  assert.ok(uit.startsWith(HEAD), 'de kop van het bestand blijft ongemoeid')
})

test('werkt de compare-link bij en zet de nieuwe link eronder', () => {
  const uit = prepareChangelog(bron, '1.1.0', '2026-12-01')
  assert.ok(
    uit.endsWith(
      `[Unreleased]: ${REPO}/compare/v1.1.0...HEAD\n[1.1.0]: ${REPO}/releases/tag/v1.1.0\n[1.0.2]: ${REPO}/releases/tag/v1.0.2\n[1.0.1]: ${REPO}/releases/tag/v1.0.1\n`,
    ),
  )
})

test('zonder linkverwijzingen komt de link onderaan', () => {
  const uit = prepareChangelog(`${HEAD}## [Unreleased]\n\n- Iets.\n`, '1.0.0', '2026-12-01')
  assert.ok(uit.endsWith(`\n\n[1.0.0]: ${REPO}/releases/tag/v1.0.0\n`))
})

test('weigert een lege Unreleased, ook met alleen koppen', () => {
  const leeg = bron.replace(/## \[Unreleased\][\s\S]*?(?=## \[1\.0\.2\])/, '## [Unreleased]\n\n')
  assert.throws(() => prepareChangelog(leeg, '1.1.0', '2026-12-01'), /leeg/)
  const koppen = leeg.replace('## [Unreleased]\n', '## [Unreleased]\n\n### Toegevoegd\n\n### Techniek\n')
  assert.throws(() => prepareChangelog(koppen, '1.1.0', '2026-12-01'), /leeg/)
})

test('weigert een changelog zonder Unreleased', () => {
  assert.throws(() => prepareChangelog(`${HEAD}## [1.0.0]\n\n- x\n`, '1.1.0', '2026-12-01'), /Unreleased/)
})

test('weigert een ongeldige, bestaande of lagere versie', () => {
  for (const v of ['1.0', 'v1.1.0', '01.1.0', '1.1.0-rc1', '1.1.0+x', '', ' 1.1.0', '1.1.0 ', 'a.b.c', '1.2.3.4']) {
    assert.throws(() => prepareChangelog(bron, v, '2026-12-01'), /Ongeldige versie/, JSON.stringify(v))
  }
  assert.throws(() => prepareChangelog(bron, '1.0.2', '2026-12-01'), /staat al/)
  assert.throws(() => prepareChangelog(bron, '1.0.0', '2026-12-01'), /niet hoger/)
  assert.throws(() => prepareChangelog(bron.replace('1.0.2] - 2026-11-24', '1.0.10] - 2026-11-24'), '1.0.9', '2026-12-01'), /niet hoger/)
})

test('releaseNotes geeft de sectie zonder kop en zonder linkverwijzingen', () => {
  assert.equal(releaseNotes(bron, '1.0.2'), '### Opgelost\n\n- Oud.\n')
  assert.equal(releaseNotes(bron, '1.0.1'), '### Techniek\n\n- Ouder.\n')
  assert.equal(releaseNotes(prepareChangelog(bron, '1.1.0', '2026-12-01'), '1.1.0'), releaseNotes(bron.replace('## [Unreleased]', '## [1.1.0]'), '1.1.0'))
})

test('releaseNotes weigert een ontbrekende of lege sectie', () => {
  assert.throws(() => releaseNotes(bron, '1.1.0'), /mist de kop '## \[1\.1\.0\]'/)
  assert.throws(() => releaseNotes(bron, '1.0'), /Ongeldige versie/)
  const leeg = bron.replace('## [1.0.2] - 2026-11-24\n\n### Opgelost\n\n- Oud.\n', '## [1.0.2] - 2026-11-24\n\n### Opgelost\n')
  assert.throws(() => releaseNotes(leeg, '1.0.2'), /leeg/)
  // 1.0.1 is geen 1.0.10.
  assert.throws(() => releaseNotes(bron.replace('## [1.0.1]', '## [1.0.10]'), '1.0.1'), /mist de kop/)
})

test('publiccode.yml krijgt versie en datum, de rest blijft', () => {
  const yml = 'name: x\nsoftwareVersion: "1.0.2"\nreleaseDate: "2026-11-24"\nsoftwareType: "standalone/web"\n'
  assert.equal(
    preparePubliccode(yml, '1.1.0', '2026-12-01'),
    'name: x\nsoftwareVersion: "1.1.0"\nreleaseDate: "2026-12-01"\nsoftwareType: "standalone/web"\n',
  )
  assert.throws(() => preparePubliccode('name: x\n', '1.1.0', '2026-12-01'), /softwareVersion/)
})

test('today geeft de Amsterdamse datum', () => {
  // 23:30 UTC op 30 juni is al 1 juli in Amsterdam (zomertijd).
  assert.equal(today(new Date('2026-06-30T23:30:00Z')), '2026-07-01')
  assert.equal(today(new Date('2026-01-15T12:00:00Z')), '2026-01-15')
})

test('CLI: voorbereiden, release-tekst en exit 1 bij fouten', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-test-'))
  fs.writeFileSync(path.join(dir, 'CHANGELOG.md'), bron)
  fs.writeFileSync(path.join(dir, 'publiccode.yml'), 'softwareVersion: "1.0.2"\nreleaseDate: "2026-11-24"\n')

  execFileSync('node', [SCRIPT, '1.1.0', '--dir', dir])
  assert.match(fs.readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf8'), /^## \[1\.1\.0\] - \d{4}-\d{2}-\d{2}$/m)
  assert.match(fs.readFileSync(path.join(dir, 'publiccode.yml'), 'utf8'), /^softwareVersion: "1\.1\.0"\nreleaseDate: "\d{4}-\d{2}-\d{2}"\n$/)

  const notes = execFileSync('node', [SCRIPT, '--notes', '1.1.0', '--dir', dir], { encoding: 'utf8' })
  assert.match(notes, /^### Gewijzigd\n\n- Nieuw ding/)

  const again = spawnSync('node', [SCRIPT, '1.2.0', '--dir', dir], { encoding: 'utf8' })
  assert.equal(again.status, 1)
  assert.match(again.stderr, /leeg/)

  const missing = spawnSync('node', [SCRIPT, '--notes', '1.3.0', '--dir', dir], { encoding: 'utf8' })
  assert.equal(missing.status, 1)
  assert.equal(missing.stdout, '')
  assert.match(missing.stderr, /mist de kop/)

  assert.equal(spawnSync('node', [SCRIPT, '--dir', dir], { encoding: 'utf8' }).status, 2)
})
