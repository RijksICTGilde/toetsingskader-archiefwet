// Toegankelijkheidsscan over de gebouwde site: axe-core via jsdom.
//
// Gebruik:  hugo && node scripts/a11y-scan.mjs public
// Exit 1 zodra er een violation is, zodat dit in CI kan draaien.
//
// Beperking: jsdom heeft geen layout-engine. Regels die afmetingen of
// berekende kleuren nodig hebben (color-contrast, target-size) komen als
// "incomplete" terug en moeten handmatig worden nagelopen — zie
// docs/toegankelijkheidsonderzoek-2026-08.md. Structuur-, naam- en
// ARIA-regels draaien wel volwaardig.
import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import {
  zwevendeVoetnootFouten, korteRefTermFouten,
  voorbehoudFout, voorbehoudBronFout, VOORBEHOUD,
  legeAltFouten,
} from './a11y-checks.mjs'

const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core'), 'utf8')
const root = process.argv[2] || 'public'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Alias-stubs van Hugo (<meta http-equiv="refresh">) bevatten geen inhoud om
// te toetsen; ze overslaan houdt de telling gelijk aan het aantal echte
// pagina's. Zelfde filter als in a11y-browser.mjs.
const isRedirect = p => /http-equiv=["']?refresh/i.test(fs.readFileSync(p, 'utf8'))

function htmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) htmlFiles(p, acc)
    else if (entry.name.endsWith('.html') && !isRedirect(p)) acc.push(p)
  }
  return acc
}

const files = htmlFiles(root)
let total = 0

// Eén keer vooraf: klopt de zin in a11y-checks.mjs nog met de partial die hem
// rendert? Zo niet, dan zou elke pagina hieronder rood worden met een melding
// die naar de verkeerde oorzaak wijst.
const bronFout = voorbehoudBronFout(fs.readFileSync('layouts/_partials/versie-zin.html', 'utf8'))
if (bronFout) {
  total++
  console.log(`— draft-voorbehoud [moderate] 1x: ${bronFout}`)
}

for (const file of files) {
  const url = '/' + path.relative(root, file).replace(/index\.html$/, '')
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { pretendToBeVisual: true, runScripts: 'outside-only' })
  dom.window.eval(axeSrc)
  const res = await dom.window.axe.run(dom.window.document, {
    runOnly: { type: 'tag', values: TAGS },
    // color-contrast heeft een layout-engine nodig; in jsdom levert die regel
    // alleen ruis op. Contrast is handmatig nagerekend uit de design tokens.
    rules: { 'color-contrast': { enabled: false } },
  })
  for (const v of res.violations) {
    total += v.nodes.length
    console.log(`${url} — ${v.id} [${v.impact}] ${v.nodes.length}x: ${v.help}`)
    for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')}`)
  }
  if (voorbehoudFout(dom.window.document, url)) {
    total++
    console.log(`${url} — draft-voorbehoud [moderate] 1x: pagina zonder "${VOORBEHOUD}"`)
    console.log(`    zet show_lastmod: true in de front matter, of neem de pagina op in GEEN_VOORBEHOUD_NODIG met een reden`)
  }
  for (const href of zwevendeVoetnootFouten(dom.window.document, url)) {
    total++
    console.log(`${url} — zwevende-voetnoot [serious] 1x: voetnootmarkering zonder ref-term en zonder tooltip`)
    console.log(`    ${href} — de markering staat achter opmaak of aan het begin van een regel; hang hem aan gewone tekst`)
  }
  for (const tekst of korteRefTermFouten(dom.window.document)) {
    total++
    console.log(`${url} — korte-ref-term [serious] 1x: ref-term bestaat alleen uit interpunctie`)
    console.log(`    "${tekst}" — te klein als klikdoel (WCAG 2.5.8); zet de voetnootmarkering achter een woord`)
  }
  for (const src of legeAltFouten(dom.window.document)) {
    total++
    console.log(`${url} — lege-alt [serious] 1x: alt="" op een afbeelding die niet als decoratief is aangemerkt`)
    console.log(`    ${src} — vul de alt, of zet het pad in DECORATIEF in ${path.relative(process.cwd(), new URL(import.meta.url).pathname)}`)
  }
  dom.window.close()
}

console.log(`\n${files.length} pagina's gescand, ${total} overtredingen.`)
process.exit(total > 0 ? 1 : 0)
