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
  voorbehoudFout, voorbehoudBronFout, VOORBEHOUD,
  legeAltFouten, kopvolgordeFouten, dubbeleIdFouten,
} from './a11y-checks.mjs'

const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core'), 'utf8')
const root = process.argv[2] || 'public'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Alias-stubs bevatten geen inhoud; overslaan houdt de telling zuiver.
// Zelfde filter als in a11y-browser.mjs.
const isRedirect = p => /http-equiv=["']?refresh/i.test(fs.readFileSync(p, 'utf8'))

// Print-HTML (`…/index.print.html`) is de invoer voor de PDF-generatie.
const isPrint = p => p.endsWith('.print.html')

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

// De print-HTML wordt door scripts/pdf-build.mjs opgeruimd zodra de PDF's er
// staan. Draait deze scan dáárna, dan zijn er geen bestanden meer om de
// kopvolgorde en de dubbele id's op te controleren en meldt hij "0
// overtredingen" over een lege verzameling. Dat ziet eruit als goed nieuws.
if (!files.some(isPrint)) {
  console.log('LET OP: geen *.print.html gevonden; de controles op kopvolgorde en')
  console.log('dubbele id\'s hebben niets gezien. Bouw de site opnieuw en draai deze')
  console.log('scan vóór `npm run build:pdf`.\n')
}

// Klopt de zin in a11y-checks.mjs nog met de partial? Zo niet, dan wordt elke
// pagina hieronder rood met een melding die de verkeerde oorzaak noemt. Pad
// relatief aan dit script: de scan draait ook vanuit een andere map.
const versieZinPad = new URL('../layouts/_partials/versie-zin.html', import.meta.url)
const bronFout = voorbehoudBronFout(fs.readFileSync(versieZinPad, 'utf8'))
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
    // Zonder layout-engine levert color-contrast alleen ruis op.
    rules: { 'color-contrast': { enabled: false } },
  })
  for (const v of res.violations) {
    total += v.nodes.length
    console.log(`${url} — ${v.id} [${v.impact}] ${v.nodes.length}x: ${v.help}`)
    for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')}`)
  }
  // De print-HTML is de invoer voor de PDF, geen sitepagina. Axe hierboven geldt
  // onverkort, maar de projecteigen controles hieronder toetsen de UX van de
  // site: de ref-term-tooltips uit `normen/single.html` staan er bewust niet in,
  // want op papier is een genummerde voetnoot met een bronnenlijst juist goed.
  // In plaats daarvan de twee dingen waar de structuurboom van de PDF op staat.
  if (isPrint(file)) {
    for (const fout of kopvolgordeFouten(dom.window.document)) {
      total++
      console.log(`${url} — kopvolgorde [serious] 1x: ${fout}`)
      console.log('    Chromium leidt de structuurboom van de PDF uit de koppen af; een sprong is daar een structuurfout')
    }
    for (const id of dubbeleIdFouten(dom.window.document)) {
      total++
      console.log(`${url} — dubbel-id [serious] 1x: id "${id}" komt meer dan één keer voor`)
      console.log('    verwijzingen landen op de eerste; geef de ankers per norm een prefix')
    }
    dom.window.close()
    continue
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
    console.log(`    ${src} — vul de alt, of zet het pad in DECORATIEF in scripts/a11y-checks.mjs`)
  }
  dom.window.close()
}

console.log(`\n${files.length} pagina's gescand, ${total} overtredingen.`)
process.exit(total > 0 ? 1 : 0)
