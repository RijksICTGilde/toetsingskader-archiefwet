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

// `alt=""` is de juiste waarde voor een decoratieve afbeelding, maar op een
// informatieve afbeelding is het een 1.1.1-fout die geen enkele geautomatiseerde
// controle vangt: axe leest een lege alt als "bewust decoratief" en .htmltest.yml
// zet `IgnoreAltEmpty: true` sitebreed aan om de hero door te laten. Daarom hier
// een expliciete lijst: wie een afbeelding decoratief noemt, zet hem erbij en
// legt in één zin uit waarom. Alles daarbuiten met een lege alt is een fout.
// Sleutel is het `src`-pad zonder fingerprint-hash.
const DECORATIEF = new Map([
  ['/images/hero', 'Hero op de homepage; de <h1> eronder zegt hetzelfde (bevinding 20).'],
])
// Van "/images/hero_hu_b08cab36f00ecf30.webp" naar "/images/hero": eerst de
// extensie eraf, dan Hugo's image-processing-suffix (`_hu_<hex>`) en een
// eventuele fingerprint-hash. Zonder dat verandert de sleutel bij elke
// hercompressie van de afbeelding.
const zonderHash = src => (src || '')
  .replace(/\.[a-z0-9]+$/i, '')
  .replace(/_hu_[0-9a-f]+$/i, '')
  .replace(/\.[0-9a-f]{32,}$/i, '')

function legeAltFouten(document) {
  const fouten = []
  for (const img of document.querySelectorAll('img[alt=""]')) {
    const sleutel = zonderHash(img.getAttribute('src'))
    if (!DECORATIEF.has(sleutel)) fouten.push(sleutel || '(zonder src)')
  }
  return fouten
}

const files = htmlFiles(root)
let total = 0

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
  for (const src of legeAltFouten(dom.window.document)) {
    total++
    console.log(`${url} — lege-alt [serious] 1x: alt="" op een afbeelding die niet als decoratief is aangemerkt`)
    console.log(`    ${src} — vul de alt, of zet het pad in DECORATIEF in ${path.relative(process.cwd(), new URL(import.meta.url).pathname)}`)
  }
  dom.window.close()
}

console.log(`\n${files.length} pagina's gescand, ${total} overtredingen.`)
process.exit(total > 0 ? 1 : 0)
