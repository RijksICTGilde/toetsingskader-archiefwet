// Toegankelijkheidsscan over de gebouwde site: axe-core via jsdom.
//
// Gebruik:  hugo && node scripts/a11y-scan.mjs public
// Exit 1 zodra er een violation is, zodat dit in CI kan draaien.
//
// Beperking: jsdom heeft geen layout-engine, dus color-contrast en target-size
// komen als "incomplete" terug. Die dekt scripts/a11y-browser.mjs af.
import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import {
  zwevendeVoetnootFouten, korteRefTermFouten,
  legeAltFouten,
} from './a11y-checks.mjs'

const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core'), 'utf8')
const root = process.argv[2] || 'public'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Alias-stubs bevatten geen inhoud; overslaan houdt de telling zuiver.
// Zelfde filter als in a11y-browser.mjs.
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

for (const file of files) {
  const url = '/' + path.relative(root, file).replace(/index\.html$/, '')
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { pretendToBeVisual: true, runScripts: 'outside-only' })
  dom.window.eval(axeSrc)
  const res = await dom.window.axe.run(dom.window.document, {
    runOnly: { type: 'tag', values: TAGS },
    // Zonder layout-engine levert color-contrast alleen ruis op.
    rules: { 'color-contrast': { enabled: false } },
  })
  for (const v of res.violations) {
    total += v.nodes.length
    console.log(`${url} — ${v.id} [${v.impact}] ${v.nodes.length}x: ${v.help}`)
    for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')}`)
  }
  // De structuurcontroles voor de PDF (kopvolgorde, dubbele ankers) draaien
  // niet meer hier maar in scripts/pdf-build.mjs, op de pdfdata-JSON: sinds de
  // pdfkit-pijplijn is er geen print-HTML meer om te scannen.
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
    console.log(`    ${src} — vul de alt, of zet het pad in DECORATIEF in scripts/a11y-checks.mjs`)
  }
  dom.window.close()
}

console.log(`\n${files.length} pagina's gescand, ${total} overtredingen.`)
process.exit(total > 0 ? 1 : 0)
