// Toegankelijkheidstests die een echte browser nodig hebben.
//
// Gebruik:  hugo --baseURL / --destination .a11y/public && node scripts/a11y-browser.mjs .a11y/public
//           (of: npm run test:a11y:browser)
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
// Exit 1 bij een harde overtreding (axe, reflow, tekstvergroting, tekstafstand,
// focus afgedekt). De categorie "focus-indicator" is een waarschuwing: een
// element zonder outline of box-shadow kan focus ook met een rand- of
// achtergrondwissel aangeven, en dat onderscheid vraagt een oog.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { createRequire } from 'node:module'

const root = process.argv[2] || '.a11y/public'
const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core'), 'utf8')
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// 320 x 512 CSS-px is de reflow-eis van 1.4.10 (1280 px bij 400% zoom).
const REFLOW = { width: 320, height: 512 }
const DESKTOP = { width: 1280, height: 900 }

// WCAG 1.4.12 Text Spacing — de vier waarden die een gebruiker moet kunnen
// forceren zonder verlies van inhoud of functionaliteit.
const TEXT_SPACING_CSS = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-block-end: 2em !important; }
`
// WCAG 1.4.4 — tekstvergroting tot 200% zonder hulpmiddel. Alleen de
// wortelfontgrootte verdubbelen bootst tekst-only zoom na; rem-gebaseerde
// layouts groeien mee, vaste px-hoogtes niet (dat is precies bevinding 18).
const TEXT_ZOOM_CSS = `html { font-size: 200% !important; }`

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
}

function serve(dir) {
  const server = http.createServer((req, res) => {
    let p = path.join(dir, decodeURIComponent(req.url.split('?')[0]))
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html')
    if (!p.startsWith(path.resolve(dir)) && !p.startsWith(dir)) return res.writeHead(403).end()
    if (!fs.existsSync(p)) return res.writeHead(404).end('not found')
    res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' })
    fs.createReadStream(p).pipe(res)
  })
  return new Promise(resolve => server.listen(0, () => resolve(server)))
}

function pages(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) pages(p, acc)
    else if (entry.name === 'index.html') acc.push('/' + path.relative(dir, path.dirname(p)) + (path.dirname(p) === dir ? '' : '/'))
    else if (entry.name.endsWith('.html')) acc.push('/' + path.relative(dir, p))
  }
  return acc.map(u => u.replace(/^\/\//, '/'))
}

const findings = []
const add = (url, category, message, fatal = true) => findings.push({ url, category, message, fatal })

/* Elementen waarvan de inhoud niet meer past én die overloop wegknippen.
   Dit is de standaardmeting voor "verlies van inhoud" bij 1.4.4 en 1.4.12:
   `overflow: hidden` plus scrollHeight > clientHeight betekent dat er tekst
   buiten beeld valt zonder scrollmogelijkheid. */
const CLIPPED = `() => {
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const hiddenY = cs.overflowY === 'hidden' || cs.overflowY === 'clip'
    const hiddenX = cs.overflowX === 'hidden' || cs.overflowX === 'clip'
    const overY = hiddenY && el.scrollHeight > el.clientHeight + 2
    const overX = hiddenX && el.scrollWidth > el.clientWidth + 2
    if (!overY && !overX) continue
    if (!el.textContent.trim()) continue
    const id = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
      (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '')
    out.push({ id, over: overY ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth, axis: overY ? 'hoogte' : 'breedte' })
  }
  return out.slice(0, 6)
}`

/* Loop met Tab door de pagina en rapporteer per stop:
   - of er een focusindicator is (outline of box-shadow) — 2.4.7 / 1.4.11
   - of de focus wordt afgedekt door iets anders — 2.4.11
   elementFromPoint geeft het bovenste element op een punt; is dat niet het
   gefocuste element, geen kind en geen ouder ervan, dan ligt er iets over. */
async function tabWalk(page, url) {
  await page.evaluate(() => document.body.focus())
  const seen = new Set()
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      const id = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
        (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')
      const hasOutline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
      const hasShadow = cs.boxShadow && cs.boxShadow !== 'none'
      // Vier punten net binnen de rand plus het midden: één afgedekte hoek is
      // al genoeg om de indicator onzichtbaar te maken.
      const probes = [
        [r.left + r.width / 2, r.top + r.height / 2],
        [r.left + 2, r.top + 2], [r.right - 2, r.top + 2],
        [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2],
      ]
      let coveredBy = null
      for (const [x, y] of probes) {
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
        const hit = document.elementFromPoint(x, y)
        if (!hit || hit === el || el.contains(hit) || hit.contains(el)) continue
        coveredBy = hit.tagName.toLowerCase() + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\s+/)[0] : '')
        break
      }
      return { id, hasOutline, hasShadow, coveredBy, offscreen: r.width === 0 && r.height === 0 }
    })
    if (!info) break
    const key = info.id + i
    if (seen.has(info.id) && i > 60) break
    seen.add(key)
    if (info.offscreen) continue
    if (!info.hasOutline && !info.hasShadow) add(url, 'focus-indicator', `${info.id} — geen outline en geen box-shadow bij toetsenbordfocus (2.4.7); controleer of een rand- of achtergrondwissel de indicator vormt`, false)
    if (info.coveredBy) add(url, 'focus-obscured', `${info.id} — focus afgedekt door ${info.coveredBy} (2.4.11)`)
  }
}

const server = await serve(root)
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()
const urls = pages(root)
// De meldbalk van de zoekfunctie verschijnt alleen met een ?q=-parameter; dat
// is de situatie van bevinding 17 (zwevende melding dekt de focus af).
const extra = ['/normen/01-beheer/?q=beheer']

console.log(`${urls.length} pagina's + ${extra.length} variant(en) in Chromium\n`)

for (const url of [...urls, ...extra]) {
  const page = await browser.newPage({ viewport: DESKTOP })
  await page.goto(base + url, { waitUntil: 'load' })

  // 1. axe-core mét de layout-afhankelijke regels (contrast, doelgrootte).
  await page.addScriptTag({ content: axeSrc })
  const res = await page.evaluate(t => window.axe.run(document, { runOnly: { type: 'tag', values: t } }), TAGS)
  for (const v of res.violations) {
    add(url, `axe:${v.id}`, `${v.nodes.length}x ${v.help} — ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(', ')}`)
  }

  // 2. Toetsenborddoorloop: focusindicator en focus-niet-afgedekt.
  await tabWalk(page, url)

  // 3. Tekstvergroting tot 200% (1.4.4).
  await page.addStyleTag({ content: TEXT_ZOOM_CSS })
  for (const c of await page.evaluate(CLIPPED)) {
    add(url, 'tekstzoom-200', `${c.id} — inhoud valt ${c.over}px buiten de ${c.axis} en wordt weggeknipt (1.4.4)`)
  }
  await page.reload({ waitUntil: 'load' })

  // 4. Tekstafstand (1.4.12).
  await page.addStyleTag({ content: TEXT_SPACING_CSS })
  for (const c of await page.evaluate(CLIPPED)) {
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
      .map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''))
    return { extra: doc.scrollWidth - doc.clientWidth, culprits }
  })
  if (overflow) add(url, 'reflow-320', `${overflow.extra}px horizontale overloop; verdacht: ${overflow.culprits.join(', ') || 'onbekend'} (1.4.10)`)
  for (const c of await page.evaluate(CLIPPED)) {
    add(url, 'reflow-320', `${c.id} — inhoud valt ${c.over}px buiten de ${c.axis} op 320px (1.4.10)`)
  }

  await page.close()
}

await browser.close()
server.close()

const fatal = findings.filter(f => f.fatal)
const warn = findings.filter(f => !f.fatal)
for (const f of [...fatal, ...warn]) {
  console.log(`${f.fatal ? 'FAIL' : 'WAAR'} ${f.url} — [${f.category}] ${f.message}`)
}
console.log(`\n${fatal.length} overtreding(en), ${warn.length} waarschuwing(en) over ${urls.length + extra.length} pagina's.`)
process.exit(fatal.length > 0 ? 1 : 0)
