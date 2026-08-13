// Genereert de PDF's uit de print-HTML in de gebouwde site.
//
// Gebruik:  hugo --baseURL / --destination public
//           node scripts/pdf-build.mjs public        (of: npm run build:pdf)
//
// Voor elke `…/index.print.html` komt er een `…/index.pdf` naast te staan.
// Zie docs/besluit-toegankelijke-pdf.md voor waarom dit bij de build gebeurt en
// niet meer in de browser van de bezoeker.
//
// Waarom Chromium en niet WeasyPrint: Playwright staat al in devDependencies en
// CI installeert de browser al voor scripts/a11y-browser.mjs. `tagged: true`
// bouwt de structuurboom uit de DOM, `outline: true` maakt bladwijzers uit de
// koppen. Dat is precies waarom de print-templates strak zijn in hun koppen en
// lijsten: wat in de HTML slordig is, is het in de PDF ook.
//
// Over de HTTP-server: de print-HTML verwijst met root-relatieve paden naar de
// stylesheet en de lettertypen. Over `file://` wijzen die naar de wortel van het
// bestandssysteem en rendert Chromium een pagina zonder opmaak. Dezelfde
// oplossing als in a11y-browser.mjs: de gebouwde map even zelf serveren.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'

const root = process.argv[2] || 'public'

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
}

// Pad → bestand, plus de lijst print-pagina's. Elk pad komt uit onze eigen walk
// en het verzoek is enkel een sleutel in een Map; er is dus geen padexpressie
// met invoer van buiten.
function readSite(dir) {
  const abs = path.resolve(dir)
  const files = new Map()
  const prints = []
  const toUrl = p => '/' + path.relative(abs, p).split(path.sep).join('/')

  const walk = d => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) { walk(p); continue }
      files.set(toUrl(p), p)
      if (entry.name === 'index.print.html') prints.push({ url: toUrl(p), bestand: p })
    }
  }
  walk(abs)
  prints.sort((a, b) => a.url.localeCompare(b.url))
  return { files, prints }
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

// --- Briefhoofd en voetregel ------------------------------------------------
//
// Chromium kent geen marge-boxen uit de paginamedia-specificatie (@top-center en
// verwanten), dus de running header en footer komen uit deze templates. Ze
// worden in een eigen document gerenderd: geen stylesheet, geen lettertypen en
// géén externe bestanden — alleen `data:`-URI's worden geladen. Vandaar dat het
// lint en RO Sans hieronder worden ingebed.
//
// Wat hier staat valt buiten de structuurboom van de PDF en is voor een
// schermlezer dus onzichtbaar. Daarom staat er niets in wat nergens anders
// staat: het briefhoofd is huisstijl en het paginanummer is navigatiehulp op
// papier. De maten komen uit de oude export (`assets/js/pdf-export.js`,
// verwijderd in ba41540): lint 26pt breed op de horizontale paginamidden, het
// woordmerk 8pt ernaast, de voetregel 8pt met een lijn erboven.

const PT = 96 / 72 // Kop- en voetregel rekenen in CSS-px op 96 dpi.
const pt = n => `${(n * PT).toFixed(2)}px`

// Het lint is 1:2, dus 26pt breed is 52pt hoog. In de oude export stond het
// gecentreerd op de pagina ((breedte - 26) / 2), tegen de bovenrand aan.
// Vandaar `calc(50% - 13pt)` en de negatieve bovenmarge: Chromium zet de
// koptekst standaard een stuk onder de paginarand.
//
// Lengtes staan in px (pt * 96/72), lettergroottes in pt. Gemeten op de
// gerenderde PDF: boxmaten in px komen kloppend uit, lettergroottes in px
// vielen 1,33x te groot uit — de koptekst wordt in een eigen document met een
// eigen schaal gerenderd.
function koptekst(lintDataUri, fontCss) {
  return `<style>${fontCss}
    * { box-sizing: border-box; }
    body { margin: 0; }
    .lockup { margin-left: calc(50% - ${pt(13)}); margin-top: ${pt(-15)};
              display: flex; align-items: flex-start; }
    .lockup img { width: ${pt(26)}; height: ${pt(52)}; display: block; }
    .naam { padding: ${pt(16)} 0 0 ${pt(8)}; color: #154273;
            font-family: "RO-Sans", Verdana, sans-serif; line-height: 1.15; }
    .naam b { font-size: 9.5pt; font-weight: 700; display: block; }
    .naam span { font-size: 8pt; display: block; margin-top: ${pt(1)}; }
  </style>
  <div style="width:100%">
    <div class="lockup">
      <img src="${lintDataUri}" alt="">
      <div class="naam">
        <b>Inspectie Overheidsinformatie en Erfgoed</b>
        <span>Ministerie van Onderwijs, Cultuur en Wetenschap</span>
      </div>
    </div>
  </div>`
}

// Alleen het paginanummer; versie en datum staan op de titelpagina. De lijn
// loopt van marge tot marge, net als de canvas-lijn in de oude export.
function voettekst(fontCss) {
  return `<style>${fontCss}
    body { margin: 0; }
    .voet { margin: 0 ${pt(48)}; padding-top: ${pt(5)}; border-top: 0.5pt solid #dddddd;
            text-align: center; font-size: 8pt; color: #999999;
            font-family: "RO-Sans", Verdana, sans-serif; }
  </style>
  <div style="width:100%">
    <div class="voet">Pagina <span class="pageNumber"></span> van <span class="totalPages"></span></div>
  </div>`
}

// Het lint en de twee lettersneden komen uit de gebouwde site, zodat ze niet
// nog een keer in de repository staan. Ontbreekt er iets, dan is dat een
// bouwfout: een briefhoofd zonder lint is geen briefhoofd.
function dataUri(pad, mime) {
  return `data:${mime};base64,${fs.readFileSync(pad).toString('base64')}`
}

function briefhoofdAssets(root) {
  const lint = path.join(root, 'images/logo-rijksoverheid.svg')
  const regular = path.join(root, 'fonts/RO-SansWebText-Regular.woff2')
  const bold = path.join(root, 'fonts/RO-SansWebText-Bold.woff2')
  for (const p of [lint, regular, bold]) {
    if (!fs.existsSync(p)) throw new Error(`Ontbreekt voor het briefhoofd: ${p}`)
  }
  const face = (bestand, gewicht) => `@font-face{font-family:"RO-Sans";` +
    `src:url("${dataUri(bestand, 'font/woff2')}") format("woff2");` +
    `font-weight:${gewicht};font-style:normal;}`
  return {
    lint: dataUri(lint, 'image/svg+xml'),
    fontCss: face(regular, 400) + face(bold, 700),
  }
}

const { files, prints } = readSite(root)
if (prints.length === 0) {
  console.error(`Geen index.print.html gevonden onder ${root}. Is de site gebouwd?`)
  process.exit(1)
}

const { lint, fontCss } = briefhoofdAssets(root)
const KOPREGEL = koptekst(lint, fontCss)
const VOETREGEL = voettekst(fontCss)

const server = await serve(files)
const { port } = server.address()

// In CI komt de browser van `npx playwright install chromium`. De container-
// build gebruikt de Chromium uit Alpine, want die staat er al voor een fractie
// van de download — dan wijst PDF_CHROMIUM naar het binaire bestand. Daar draait
// de build als root, en Chromium weigert dat zonder --no-sandbox. Buiten die
// situatie blijft de sandbox gewoon aan.
const executablePath = process.env.PDF_CHROMIUM || undefined
const browser = await chromium.launch({
  executablePath,
  args: executablePath ? ['--no-sandbox'] : [],
})
const page = await browser.newPage()

// Eén vaste presentatie: geen schermmedia, geen donker schema uit de omgeving.
await page.emulateMedia({ media: 'print', colorScheme: 'light' })

for (const { url, bestand } of prints) {
  const doel = bestand.replace(/index\.print\.html$/, 'index.pdf')
  await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'networkidle' })
  // Zonder deze wachtstap kan de eerste pagina met een fallback-letter renderen.
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({
    path: doel,
    tagged: true,
    outline: true,
    printBackground: true,
    // Paginaformaat en marges komen uit @page in assets/print/print.css, zodat
    // opmaak op één plek staat.
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: KOPREGEL,
    footerTemplate: VOETREGEL,
    // Kop- en voetregel worden anders op 80% geschaald.
    scale: 1,
  })
  const kb = Math.round(fs.statSync(doel).size / 1024)
  // De print-HTML is invoer, geen pagina. Laten staan betekent een kale kopie
  // van elke normtekst op de gedeployde site, en een tweede ronde externe
  // links voor htmltest — dat laatste maakte de linkcontrole in CI ruim tien
  // keer zo traag. Wie het bestand wil bekijken, bouwt de site opnieuw; deze
  // stap draait dus één keer per build.
  fs.rmSync(bestand)
  console.log(`${path.relative(root, doel)} — ${kb} kB`)
}

await browser.close()
server.close()
console.log(`\n${prints.length} PDF('s) geschreven. Controleer met: npm run test:pdf-ua`)
