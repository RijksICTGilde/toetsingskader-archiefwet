// Release-administratie in CHANGELOG.md en publiccode.yml (CONTRIBUTING.md,
// "Een release maken").
//
// Gebruik:  node scripts/release.mjs X.Y.Z [--dir <map>]
//             zet de inhoud van `## [Unreleased]` onder `## [X.Y.Z] - <datum>`,
//             werkt de linkverwijzingen bij en zet softwareVersion en
//             releaseDate in publiccode.yml. Weigert een lege [Unreleased].
//           node scripts/release.mjs --notes X.Y.Z [--dir <map>]
//             drukt de sectie van X.Y.Z af (de tekst van de GitHub release).
//             Exit 1 als de sectie ontbreekt of leeg is.
//
// <map> is de map met CHANGELOG.md en publiccode.yml, standaard de huidige.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const REPO_URL = 'https://github.com/RijksICTGilde/toetsingskader-archiefwet'
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const REF_LINE = /^\[[^\]]+\]: /

// Datum van vandaag in Europe/Amsterdam als YYYY-MM-DD (en-CA geeft die vorm).
export function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function checkVersion(version) {
  if (!SEMVER.test(version ?? '')) {
    throw new Error(`Ongeldige versie '${version}': verwacht X.Y.Z (SemVer, zonder 'v').`)
  }
}

function compare(a, b) {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number))
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

function isHeading(line, version) {
  const kop = `## [${version}]`
  return line === kop || line.startsWith(`${kop} `)
}

// Regels [start, end) van de sectie onder de kop op `start`: tot de volgende
// `## [`-kop of de linkverwijzingen onderaan.
function sectionEnd(lines, start) {
  const end = lines.findIndex((l, i) => i > start && (/^## \[/.test(l) || REF_LINE.test(l)))
  return end === -1 ? lines.length : end
}

// Lege `###`-koppen tellen niet als inhoud.
function hasContent(body) {
  return body.some((l) => l.trim() !== '' && !/^###\s/.test(l))
}

function trim(body) {
  const out = [...body]
  while (out.length && out[0].trim() === '') out.shift()
  while (out.length && out[out.length - 1].trim() === '') out.pop()
  return out
}

export function prepareChangelog(changelog, version, date) {
  checkVersion(version)
  const lines = changelog.split('\n')
  if (lines.some((l) => isHeading(l, version)) || lines.some((l) => l.startsWith(`[${version}]: `))) {
    throw new Error(`Versie ${version} staat al in CHANGELOG.md.`)
  }
  const latest = lines
    .map((l) => l.match(/^## \[(\d+\.\d+\.\d+)\]/)?.[1])
    .filter(Boolean)
    .sort(compare)
    .at(-1)
  if (latest && compare(version, latest) <= 0) {
    throw new Error(`Versie ${version} is niet hoger dan de laatste versie in CHANGELOG.md (${latest}).`)
  }

  const start = lines.findIndex((l) => /^## \[Unreleased\]\s*$/.test(l))
  if (start === -1) throw new Error("Geen '## [Unreleased]' gevonden in CHANGELOG.md.")
  const end = sectionEnd(lines, start)
  const body = lines.slice(start + 1, end)
  if (!hasContent(body)) {
    throw new Error("De sectie '## [Unreleased]' is leeg: er valt niets uit te brengen.")
  }

  const rest = lines.slice(end)
  const ref = `[${version}]: ${REPO_URL}/releases/tag/v${version}`
  const unreleasedRef = rest.findIndex((l) => l.startsWith('[Unreleased]: '))
  if (unreleasedRef !== -1) {
    rest[unreleasedRef] = `[Unreleased]: ${REPO_URL}/compare/v${version}...HEAD`
    rest.splice(unreleasedRef + 1, 0, ref)
  } else {
    const refAt = rest.findIndex((l) => REF_LINE.test(l))
    if (refAt === -1) {
      while (rest.length && rest[rest.length - 1].trim() === '') rest.pop()
      rest.push('', ref, '')
    } else {
      rest.splice(refAt, 0, ref)
    }
  }

  return [...lines.slice(0, start + 1), '', `## [${version}] - ${date}`, '', ...trim(body), '', ...rest].join('\n')
}

export function releaseNotes(changelog, version) {
  checkVersion(version)
  const lines = changelog.split('\n')
  const start = lines.findIndex((l) => isHeading(l, version))
  if (start === -1) {
    throw new Error(`CHANGELOG.md mist de kop '## [${version}]'. Zet de release eerst in de changelog.`)
  }
  const body = lines.slice(start + 1, sectionEnd(lines, start))
  if (!hasContent(body)) throw new Error(`De sectie '## [${version}]' in CHANGELOG.md is leeg.`)
  return trim(body).join('\n') + '\n'
}

export function preparePubliccode(text, version, date) {
  checkVersion(version)
  let found = 0
  const out = text
    .replace(/^softwareVersion: .*$/m, () => (found++, `softwareVersion: "${version}"`))
    .replace(/^releaseDate: .*$/m, () => (found++, `releaseDate: "${date}"`))
  if (found !== 2) throw new Error("publiccode.yml mist 'softwareVersion' of 'releaseDate'.")
  return out
}

function main(argv) {
  const args = argv.slice(2)
  let dir = process.cwd()
  const dirAt = args.indexOf('--dir')
  if (dirAt !== -1) {
    dir = path.resolve(args[dirAt + 1] ?? '')
    args.splice(dirAt, 2)
  }
  const notes = args[0] === '--notes'
  if (notes) args.shift()
  if (args.length !== 1) {
    console.error('Gebruik: node scripts/release.mjs [--notes] X.Y.Z [--dir <map>]')
    process.exit(2)
  }
  const version = args[0]
  const changelogPath = path.join(dir, 'CHANGELOG.md')
  const publiccodePath = path.join(dir, 'publiccode.yml')

  try {
    const changelog = fs.readFileSync(changelogPath, 'utf8')
    if (notes) {
      process.stdout.write(releaseNotes(changelog, version))
      return
    }
    const date = today()
    const nieuw = prepareChangelog(changelog, version, date)
    const publiccode = preparePubliccode(fs.readFileSync(publiccodePath, 'utf8'), version, date)
    fs.writeFileSync(changelogPath, nieuw)
    fs.writeFileSync(publiccodePath, publiccode)
    console.log(`Release ${version} voorbereid (${date}).`)
  } catch (e) {
    console.error(`Fout: ${e.message}`)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv)
