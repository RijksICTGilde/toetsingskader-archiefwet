// Toegankelijkheidstests die een echte browser nodig hebben.
//
// Gebruik:  hugo --baseURL / --destination .a11y/public
//           node scripts/a11y-browser.mjs .a11y/public      (of: npm run test:a11y:browser)
//
// Waarom naast scripts/a11y-scan.mjs: die draait op jsdom en heeft dus geen
// layout-engine. Alles wat afmetingen, berekende kleuren of echte
// toetsenbordfocus nodig heeft — contrast, reflow, tekstvergroting,
// tekstafstand, focus-niet-afgedekt — kan daar niet worden vastgesteld en stond
// in docs/toegankelijkheidsonderzoek-2026-08.md als "nog te doen". Dit script
// dekt die categorieën met Chromium via Playwright.
//
// Bouw de site met `--baseURL /`: met de productie-baseURL verwijzen de CSS- en
// JS-links naar het live domein, laden ze hier niet, en meet je een pagina
// zonder stylesheet.
//
// Exit-gedrag. Fataal (exit 1) zijn de categorieën zonder interpretatieruimte:
//   axe:*        — een axe-violation is een violation
//   reflow-320   — horizontale overloop op 320px is meetbaar en eenduidig
// Waarschuwing (exit 0, wel in de log) zijn de categorieën waar een mens naar
// moet kijken:
//   focus-indicator — een element zonder outline of box-shadow kan focus ook met
//                     een rand- of achtergrondwissel aangeven
//   focus-obscured  — een sticky header of meldbalk over een element is soms
//                     bedoeld gedrag en soms bevinding 17
//   tekstzoom-200   — dit is bevinding 18, een bekende thema-bug (thema-issue
//                     #12). Fataal maken zou elke PR rood maken tot upstream
//                     het oplost.
//   tekstafstand    — zelfde meting, andere trigger (1.4.12)
// Losse bevindingen die elders belegd zijn, staan in `KNOWN` en worden ook
// gedegradeerd tot waarschuwing, mét de reden in de log.
//
// Zet A11Y_BROWSER_STRICT=1 om álle categorieën fataal te maken; doe dat zodra
// thema-issue #12 rond is.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { createRequire } from 'node:module'

const root = process.argv[2] || '.a11y/public'
const STRICT = process.env.A11Y_BROWSER_STRICT === '1'
const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core'), 'utf8')
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const FATAL = ['axe:', 'reflow-320']

// Bekende bevindingen die elders belegd zijn. Ze blijven in de log staan, maar
// als waarschuwing: fataal maken zou elke PR rood houden tot het thema is
// bijgewerkt, en dan wordt de scan genegeerd in plaats van gelezen. Elk item
// verwijst naar het issue dat het afhandelt; haal het weg zodra dat rond is.
const KNOWN = [
  {
    category: 'reflow-320',
    match: /^div\.hero\b/,
    reason: 'hugo-theme-rijksoverheid#12 — .hero heeft een vaste hoogte met overflow hidden',
  },
]

// 320 x 512 CSS-px is de reflow-eis van 1.4.10 (1280px bij 400% zoom).
const REFLOW = { width: 320, height: 512 }
const DESKTOP = { width: 1280, height: 900 }

// WCAG 1.4.12 Text Spacing — de waarden die een gebruiker moet kunnen forceren
// zonder verlies van inhoud of functionaliteit.
const TEXT_SPACING_CSS = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-block-end: 2em !important; }
`
// WCAG 1.4.4 — tekst tot 200% vergroten. Alleen de wortelfontgrootte verdubbelen
// bootst tekst-only zoom na: rem-gebaseerde layouts groeien mee, vaste
// px-hoogtes niet. Dat laatste is precies bevinding 18.
const TEXT_ZOOM_CSS = `html { font-size: 200% !important; }`

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
}

/* De site één keer inlezen en indexeren: URL-pad → absoluut bestandspad.

   Deze opzet is er om padinjectie onmogelijk te maken in plaats van hem af te
   weren. Een `path.join(root, req.url)` met een controle achteraf is fragiel —
   `startsWith(root)` zonder padscheider laat `/tmp/pub` door voor
   `/tmp/publiek-geheim`, en na een tweede `join` (map → index.html) moet je
   opnieuw controleren. Hier komt het bestandspad altijd uit onze eigen
   directory-walk; het verzoek is alleen een sleutel in een Map. Er ís dus geen
   padexpressie waar gebruikersinvoer in zit.

   Retourneert ook de lijst met te testen pagina's, uit dezelfde walk. */
function readSite(dir) {
  const abs = path.resolve(dir)
  const files = new Map()
  const pages = []
  const toUrl = p => '/' + path.relative(abs, p).split(path.sep).join('/')

  const walk = d => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) { walk(p); continue }
      files.set(toUrl(p), p)
      if (entry.name === 'index.html') {
        // Een map is opvraagbaar met én zonder afsluitende slash.
        const dirUrl = toUrl(path.dirname(p)).replace(/\/$/, '')
        files.set(dirUrl === '' ? '/' : `${dirUrl}/`, p)
        if (dirUrl !== '') files.set(dirUrl, p)
        pages.push(dirUrl === '' ? '/' : `${dirUrl}/`)
      } else if (entry.name.endsWith('.html')) {
        pages.push(toUrl(p))
      }
    }
  }
  walk(abs)
  return { files, pages }
}

function serve(files) {
  const server = http.createServer((req, res) => {
    let urlPath
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0])
    } catch {
      return res.writeHead(400).end('bad request')
    }
    const file = files.get(urlPath)
    if (!file) return res.writeHead(404).end('not found')
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

/* Elementen waarvan de inhoud niet meer past én die de overloop wegknippen.
   Dit is de standaardmeting voor "verlies van inhoud" bij 1.4.4 en 1.4.12:
   `overflow: hidden` plus scrollHeight > clientHeight betekent dat er tekst
   buiten beeld valt zonder scrollmogelijkheid.

   Deze functie wordt in de browser uitgevoerd, dus geen imports en geen
   afhankelijkheden op modulescope. */
function clippedElements() {
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    // Visueel-verborgen tekst (`.visually-hidden` en varianten) is per definitie
    // 1x1px met overflow hidden; die zou anders elke pagina vervuilen.
    if (el.clientWidth <= 4 || el.clientHeight <= 4) continue
    const overY = (cs.overflowY === 'hidden' || cs.overflowY === 'clip') && el.scrollHeight > el.clientHeight + 2
    const overX = (cs.overflowX === 'hidden' || cs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 2
    if (!overY && !overX) continue
    if (!el.textContent.trim()) continue
    out.push({
      id: describe(el),
      over: overY ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth,
      axis: overY ? 'hoogte' : 'breedte',
    })
  }
  return out.slice(0, 6)

  function describe(el) {
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/).join('.')
      : ''
    return el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + cls
  }
}

/* Eén Tab-stop beschrijven: heeft het gefocuste element een focusindicator, en
   ligt er iets over? elementFromPoint geeft het bovenste element op een punt;
   is dat niet het gefocuste element, geen kind en geen ouder ervan, dan ligt er
   iets over (WCAG 2.4.11). */
function describeFocus() {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) return null
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const cls = typeof el.className === 'string' && el.className.trim()
    ? '.' + el.className.trim().split(/\s+/).join('.')
    : ''
  const id = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + cls
  // `outline-style: auto` is de UA-focusring van Chromium; die heeft geen
  // betrouwbare computed width, dus die apart accepteren.
  const ring = s => s.outlineStyle === 'auto' ||
    (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
    (Boolean(s.boxShadow) && s.boxShadow !== 'none')
  // Ook op ::before/::after kijken: `.card-grid.clickable` zet bewust
  // `outline: none` op de link en de ring als box-shadow op ::after. Zonder deze
  // twee extra metingen is dat een systematische fout-positief.
  const hasRing = ring(cs) ||
    ring(getComputedStyle(el, '::after')) || ring(getComputedStyle(el, '::before'))

  // Afdekking meten met het midden plus de vier hoeken. Eén afgedekte hoek is
  // niet genoeg om te concluderen: bij een ronde link (de bollen in het
  // bollendiagram) liggen de hoeken van de bounding box buiten de vorm en raken
  // ze de buren. Daarom: het midden telt, of minstens twee hoeken die door
  // hetzelfde element worden afgedekt.
  const center = [r.left + r.width / 2, r.top + r.height / 2]
  const corners = [
    [r.left + 2, r.top + 2], [r.right - 2, r.top + 2],
    [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2],
  ]
  const hitAt = ([x, y]) => {
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return null
    const hit = document.elementFromPoint(x, y)
    if (!hit || hit === el || el.contains(hit) || hit.contains(el)) return null
    const cls = typeof hit.className === 'string' && hit.className.trim()
      ? '.' + hit.className.trim().split(/\s+/)[0]
      : ''
    return hit.tagName.toLowerCase() + cls
  }
  let coveredBy = hitAt(center)
  // Bij een SVG-link (de bollen in het bollendiagram) is de bounding box een
  // rechthoek om een ronde vorm: de hoeken liggen buiten de bol en raken de
  // buren. Daar telt alleen het midden.
  if (!coveredBy && !(el.ownerSVGElement || el instanceof SVGElement)) {
    const tally = {}
    for (const c of corners) {
      const name = hitAt(c)
      if (name) tally[name] = (tally[name] || 0) + 1
    }
    coveredBy = Object.keys(tally).find(name => tally[name] >= 2) || null
  }
  return { id, hasRing, coveredBy, sized: r.width > 0 && r.height > 0 }
}

const findings = new Map()
function add(url, category, message) {
  const key = `${category}|${message}`
  const seen = findings.get(key)
  if (seen) { seen.count++; return }
  findings.set(key, { url, category, message, count: 1 })
}

async function tabWalk(page, url) {
  await page.evaluate(() => document.activeElement?.blur?.())
  let first = null
  for (let i = 0; i < 150; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(describeFocus)
    if (!info) break
    // Terug bij de eerste stop: de tabring is rond, stoppen.
    if (first === null) first = info.id
    else if (info.id === first) break
    if (!info.sized) continue
    if (!info.hasRing) {
      add(url, 'focus-indicator', `${info.id} — geen outline en geen box-shadow bij toetsenbordfocus, ook niet op ::before/::after (2.4.7); controleer of een rand- of achtergrondwissel de indicator vormt`)
    }
    if (info.coveredBy) {
      add(url, 'focus-obscured', `${info.id} — focus afgedekt door ${info.coveredBy} (2.4.11)`)
    }
  }
}

const { files, pages: urls } = readSite(root)
const server = await serve(files)
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()
// De meldbalk van de zoekfunctie verschijnt alleen met een ?q=-parameter; dat is
// de situatie van bevinding 17 (zwevende melding dekt de focus af).
const extra = ['/normen/01-beheer/?q=beheer']

console.log(`${urls.length} pagina's + ${extra.length} variant(en) in Chromium${STRICT ? ' (strict)' : ''}\n`)

for (const url of [...urls, ...extra]) {
  const page = await browser.newPage({ viewport: DESKTOP })
  await page.goto(base + url, { waitUntil: 'load' })

  // 1. axe-core mét de layout-afhankelijke regels (contrast, doelgrootte).
  await page.addScriptTag({ content: axeSrc })
  const res = await page.evaluate(
    tags => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS)
  for (const v of res.violations) {
    // Bij color-contrast de gemeten kleuren en ratio meenemen: een
    // contrastbevinding zonder getallen is niet na te trekken.
    const detail = v.nodes.slice(0, 3).map(n => {
      const d = n.any?.find(c => c.data?.contrastRatio)?.data
      return n.target.join(' ') + (d ? ` (${d.fgColor} op ${d.bgColor} = ${d.contrastRatio}:1, nodig ${d.expectedContrastRatio})` : '')
    }).join(', ')
    add(url, `axe:${v.id}`, `${v.nodes.length}x ${v.help} — ${detail}`)
  }

  // 2. Toetsenborddoorloop: focusindicator (2.4.7) en focus-niet-afgedekt (2.4.11).
  await tabWalk(page, url)

  // 3. Tekstvergroting tot 200% (1.4.4).
  await page.addStyleTag({ content: TEXT_ZOOM_CSS })
  for (const c of await page.evaluate(clippedElements)) {
    add(url, 'tekstzoom-200', `${c.id} — inhoud valt ${c.over}px buiten de ${c.axis} en wordt weggeknipt (1.4.4)`)
  }

  // 4. Tekstafstand (1.4.12), op een schone pagina.
  await page.reload({ waitUntil: 'load' })
  await page.addStyleTag({ content: TEXT_SPACING_CSS })
  for (const c of await page.evaluate(clippedElements)) {
    add(url, 'tekstafstand', `${c.id} — inhoud valt ${c.over}px buiten de ${c.axis} bij aangepaste tekstafstand (1.4.12)`)
  }

  // 5. Reflow op 320px: geen horizontale scroll, geen weggeknipte inhoud (1.4.10).
  await page.setViewportSize(REFLOW)
  await page.reload({ waitUntil: 'load' })
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    if (doc.scrollWidth <= doc.clientWidth + 1) return null
    const culprits = [...document.querySelectorAll('body *')]
      .filter(el => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .slice(0, 4)
      .map(el => el.tagName.toLowerCase() +
        (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''))
    return { extra: doc.scrollWidth - doc.clientWidth, culprits }
  })
  if (overflow) {
    add(url, 'reflow-320', `${overflow.extra}px horizontale overloop; verdacht: ${overflow.culprits.join(', ') || 'onbekend'} (1.4.10)`)
  }
  for (const c of await page.evaluate(clippedElements)) {
    add(url, 'reflow-320', `${c.id} — inhoud valt ${c.over}px buiten de ${c.axis} op 320px (1.4.10)`)
  }

  await page.close()
}

await browser.close()
server.close()

const known = f => KNOWN.find(k => k.category === f.category && k.match.test(f.message))
const isFatal = f => STRICT || (FATAL.some(prefix => f.category.startsWith(prefix)) && !known(f))
const all = [...findings.values()]
const fatal = all.filter(isFatal)
const warn = all.filter(f => !isFatal(f))

for (const f of [...fatal, ...warn]) {
  // f.count telt trefférs, niet pagina's: één pagina kan dezelfde melding
  // meerdere keren opleveren (acht diagramlinks, tien inhoudsopgavelinks).
  const where = f.count > 1 ? ` [${f.count}x, o.a. ${f.url}]` : ` [${f.url}]`
  const belegd = known(f) ? ` — bekend: ${known(f).reason}` : ''
  console.log(`${isFatal(f) ? 'FOUT' : 'WAAR'} [${f.category}] ${f.message}${where}${belegd}`)
}
console.log(`\n${urls.length + extra.length} pagina's: ${fatal.length} fout(en), ${warn.length} waarschuwing(en).`)
if (!STRICT && warn.length) {
  console.log('Waarschuwingen laten de build niet falen; zie de kop van dit script en het toegankelijkheidsonderzoek.')
}
process.exit(fatal.length > 0 ? 1 : 0)
