// Toegankelijkheidstests die een echte browser nodig hebben.
//
// Gebruik:  hugo --baseURL / --destination .a11y/public
//           node scripts/a11y-browser.mjs .a11y/public      (of: npm run test:a11y:browser)
//
// Aanvulling op scripts/a11y-scan.mjs: dat draait op jsdom, dus zonder
// layout-engine. Contrast, reflow, tekstvergroting, tekstafstand en
// focus-niet-afgedekt vragen echte afmetingen en focus; die meet dit script in
// Chromium.
//
// Bouwen met `--baseURL /`, anders wijzen de CSS- en JS-links naar het live
// domein en meet je een pagina zonder stylesheet.
//
// Fataal (exit 1): axe:* en reflow-320 — geen interpretatieruimte. De rest is
// waarschuwing, omdat er een mens naar moet kijken: focus kan ook uit een rand-
// of achtergrondwissel komen, een balk over een element is soms bedoeld, en
// tekstzoom-200/tekstafstand is bevinding 18 (thema-issue #12) die elke PR rood
// zou houden. `KNOWN` degradeert losse bevindingen op dezelfde grond.
// A11Y_BROWSER_STRICT=1 maakt alles fataal; aanzetten zodra #12 rond is.
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

// Elders belegde bevindingen: wel in de log, niet fataal, met het issue erbij.
// Weghalen zodra dat rond is.
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

// WCAG 1.4.12 — de tekstafstand die een gebruiker moet kunnen forceren.
const TEXT_SPACING_CSS = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-block-end: 2em !important; }
`
// WCAG 1.4.4 — alleen de wortelfontgrootte verdubbelen bootst tekst-only zoom na:
// rem groeit mee, vaste px-hoogtes niet. Dat laatste is bevinding 18.
const TEXT_ZOOM_CSS = `html { font-size: 200% !important; }`

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
}

/* De site indexeren: URL-pad → absoluut bestandspad, plus de lijst te testen
   pagina's. Padinjectie is onmogelijk in plaats van afgeweerd: elk pad komt uit
   onze eigen walk en het verzoek is enkel een sleutel in een Map, dus er is geen
   padexpressie met gebruikersinvoer. */
function readSite(dir) {
  const abs = path.resolve(dir)
  const files = new Map()
  const pages = []
  const toUrl = p => '/' + path.relative(abs, p).split(path.sep).join('/')

  // Alias-stubs (`<meta http-equiv="refresh">`) navigeren weg terwijl axe wordt
  // ingespoten en bevatten geen inhoud. Niet toetsen, wel serveren.
  const isRedirect = p => /http-equiv=["']?refresh/i.test(fs.readFileSync(p, 'utf8'))

  const walk = d => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) { walk(p); continue }
      files.set(toUrl(p), p)
      if (entry.name === 'index.html') {
        // Map opvraagbaar met én zonder afsluitende slash.
        const dirUrl = toUrl(path.dirname(p)).replace(/\/$/, '')
        files.set(dirUrl === '' ? '/' : `${dirUrl}/`, p)
        if (dirUrl !== '') files.set(dirUrl, p)
        if (!isRedirect(p)) pages.push(dirUrl === '' ? '/' : `${dirUrl}/`)
      } else if (entry.name.endsWith('.html')) {
        if (!isRedirect(p)) pages.push(toUrl(p))
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

/* Standaardmeting voor "verlies van inhoud" (1.4.4, 1.4.12): `overflow: hidden`
   plus scrollHeight > clientHeight = tekst buiten beeld zonder scroll.
   Draait in de browser, dus geen imports of modulescope. */
function clippedElements() {
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    // Visueel-verborgen tekst is per definitie 1x1px met overflow hidden.
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

/* Eén Tab-stop: heeft het element een focusindicator, en ligt er iets over?
   elementFromPoint geeft het bovenste element; is dat geen kind of ouder van het
   gefocuste element, dan dekt het af (WCAG 2.4.11). */
function describeFocus() {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) return null
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const cls = typeof el.className === 'string' && el.className.trim()
    ? '.' + el.className.trim().split(/\s+/).join('.')
    : ''
  const id = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + cls
  // `outline-style: auto` (UA-ring van Chromium) heeft geen bruikbare width.
  const ring = s => s.outlineStyle === 'auto' ||
    (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
    (Boolean(s.boxShadow) && s.boxShadow !== 'none')
  // Ook ::before/::after: `.card-grid.clickable` zet de ring als box-shadow op
  // ::after. Zonder die metingen een systematische fout-positief.
  const hasRing = ring(cs) ||
    ring(getComputedStyle(el, '::after')) || ring(getComputedStyle(el, '::before'))

  // Midden plus vier hoeken. Bij een ronde link liggen de hoeken buiten de vorm
  // en raken ze de buren, dus: het midden telt, of twee hoeken met dezelfde dader.
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
  // Bij SVG (de bollen) telt alleen het midden; zie hierboven.
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
    // Tabring is rond.
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
// De meldbalk verschijnt alleen met ?q= — de situatie van bevinding 17.
const extra = ['/normen/01-beheer/?q=beheer']

console.log(`${urls.length} pagina's + ${extra.length} variant(en) in Chromium${STRICT ? ' (strict)' : ''}\n`)

for (const url of [...urls, ...extra]) {
  const page = await browser.newPage({ viewport: DESKTOP })
  await page.goto(base + url, { waitUntil: 'load' })

  // 1. axe-core, incl. de layout-afhankelijke regels.
  //
  await page.addScriptTag({ content: axeSrc })
  const rules = {}
  const res = await page.evaluate(
    ([tags, rules]) => window.axe.run(document, { runOnly: { type: 'tag', values: tags }, rules }),
    [TAGS, rules])
  for (const v of res.violations) {
    // Kleuren en ratio meenemen; anders is de bevinding niet na te trekken.
    const detail = v.nodes.slice(0, 3).map(n => {
      const d = n.any?.find(c => c.data?.contrastRatio)?.data
      return n.target.join(' ') + (d ? ` (${d.fgColor} op ${d.bgColor} = ${d.contrastRatio}:1, nodig ${d.expectedContrastRatio})` : '')
    }).join(', ')
    add(url, `axe:${v.id}`, `${v.nodes.length}x ${v.help} — ${detail}`)
  }

  // (De vroegere print-HTML-uitzonderingen zijn weg: de PDF wordt sinds de
  // pdfkit-pijplijn niet meer uit HTML gerenderd. De toegankelijkheid van de
  // PDF zelf bewaken scripts/pdf-build.mjs en scripts/pdf-ua-check.mjs.)

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
  // f.count telt treffers, niet pagina's.
  const where = f.count > 1 ? ` [${f.count}x, o.a. ${f.url}]` : ` [${f.url}]`
  const belegd = known(f) ? ` — bekend: ${known(f).reason}` : ''
  console.log(`${isFatal(f) ? 'FOUT' : 'WAAR'} [${f.category}] ${f.message}${where}${belegd}`)
}
console.log(`\n${urls.length + extra.length} pagina's: ${fatal.length} fout(en), ${warn.length} waarschuwing(en).`)
if (!STRICT && warn.length) {
  console.log('Waarschuwingen laten de build niet falen; zie de kop van dit script en het toegankelijkheidsonderzoek.')
}
process.exit(fatal.length > 0 ? 1 : 0)
