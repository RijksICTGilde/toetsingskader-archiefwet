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
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFString } from 'pdf-lib'
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
//
// Eén afwijking van die export: het paginanummer stond daar in #999999, wat op
// wit 2,85:1 haalt. Hier is dat #666666 (5,74:1). Geen enkele controle kijkt
// hiernaar — axe ziet alleen de print-HTML en pdf-ua-check alleen de vier
// markers — dus dit is met de hand nagerekend.

const PT = 96 / 72 // Kop- en voetregel rekenen in CSS-px op 96 dpi.
const pt = n => `${(n * PT).toFixed(2)}px`

// Het briefhoofd is één SVG: het lint met het woordmerk als contouren ernaast
// (assets/print/briefhoofd.svg, gemaakt door scripts/build-briefhoofd.py). Dat
// moet, want in dit document laadt geen enkel lettertype — ook niet als
// data:-URI. Gemeten op de gegenereerde PDF viel de tekst terug op DejaVu Sans,
// een derde breder dan Rijksoverheid Sans.
//
// In de oude export stond het lint gecentreerd op de pagina ((breedte - 26) / 2)
// en tegen de bovenrand aan. Vandaar `calc(50% - 13pt)` en de negatieve
// bovenmarge: Chromium zet de koptekst standaard een stuk onder de paginarand.
function koptekst({ uri, breed, hoog }) {
  return `<style>
    body { margin: 0; }
    img { margin-left: calc(50% - ${pt(13)}); margin-top: ${pt(-15)};
          width: ${pt(breed)}; height: ${pt(hoog)}; display: block; }
  </style>
  <div style="width:100%"><img src="${uri}" alt=""></div>`
}

// Alleen het paginanummer; versie en datum staan op de titelpagina. De lijn
// loopt van marge tot marge, net als de canvas-lijn in de oude export. De tekst
// staat in de standaard schreefloze van de renderende omgeving: het paginanummer
// verandert per pagina en kan dus geen contour zijn, en een lettertype laden kan
// hier niet. Acht punt grijs, dus het verschil is klein.
function voettekst() {
  return `<style>
    body { margin: 0; }
    .voet { margin: 0 ${pt(48)}; padding-top: ${pt(5)}; border-top: 0.5pt solid #dddddd;
            text-align: center; font-size: 8pt; color: #666666;
            font-family: Verdana, sans-serif; }
  </style>
  <div style="width:100%">
    <div class="voet">Pagina <span class="pageNumber"></span> van <span class="totalPages"></span></div>
  </div>`
}

function dataUri(pad, mime) {
  return `data:${mime};base64,${fs.readFileSync(pad).toString('base64')}`
}

// Uit de repository en niet uit de gebouwde site: het briefhoofd hoort bij de
// PDF-generatie en wordt door geen enkele pagina gebruikt, dus Hugo publiceert
// het niet. Ontbreekt het, dan is dat een bouwfout — een briefhoofd zonder lint
// is geen briefhoofd.
function briefhoofd() {
  const pad = new URL('../assets/print/briefhoofd.svg', import.meta.url)
  const svg = fs.readFileSync(pad, 'utf8')
  const maat = attr => Number(svg.match(new RegExp(`${attr}="([\\d.]+)"`))?.[1])
  const breed = maat('width')
  const hoog = maat('height')
  if (!breed || !hoog) throw new Error(`Geen bruikbare afmetingen in ${pad}`)
  return { uri: dataUri(pad, 'image/svg+xml'), breed, hoog }
}

// --- Paginanummers in de inhoudsopgave --------------------------------------
//
// Chromium kent `target-counter()` niet, dus in HTML is niet te weten op welke
// pagina een norm begint. Wat wél kan: het document één keer renderen, de
// bladwijzers uit die PDF lezen — die dragen per kop een verwijzing naar een
// pagina-object — en het document daarna opnieuw renderen met de nummers erin.
//
// Dat de eerste doorloop geen nummers had, verandert niets aan de paginering:
// de nummers komen rechts op regels die er al waren. De aanroeper controleert
// dat alsnog op de paginatelling en valt bij verschil terug op de eerste versie.
function paginaPerKop(doc) {
  const ctx = doc.context
  const paginas = new Map()
  doc.getPages().forEach((p, i) => paginas.set(p.ref.tag, i + 1))

  const tekst = v => (v instanceof PDFHexString || v instanceof PDFString ? v.decodeText() : String(v))

  const paginaVan = item => {
    let d = item.get(PDFName.of('Dest'))
    if (!d) {
      const actie = ctx.lookup(item.get(PDFName.of('A')), PDFDict)
      if (actie) d = actie.get(PDFName.of('D'))
    }
    const arr = ctx.lookup(d, PDFArray)
    return arr ? paginas.get(arr.get(0).tag) : undefined
  }

  // Alleen de bovenste twee niveaus: dieper zitten de voorschriften, en die
  // staan niet in de inhoudsopgave.
  const uit = new Map()
  const loop = (ref, diepte) => {
    while (ref) {
      const item = ctx.lookup(ref, PDFDict)
      if (!item) return
      const titel = tekst(ctx.lookup(item.get(PDFName.of('Title'))))
      const pagina = paginaVan(item)
      if (titel && pagina && !uit.has(titel)) uit.set(titel, pagina)
      const kind = item.get(PDFName.of('First'))
      if (kind && diepte < 1) loop(kind, diepte + 1)
      ref = item.get(PDFName.of('Next'))
    }
  }
  const outlines = ctx.lookup(doc.catalog.get(PDFName.of('Outlines')), PDFDict)
  if (outlines) loop(outlines.get(PDFName.of('First')), 0)
  return uit
}

// Zet de nummers in de DOM van de al geladen pagina. Geeft terug hoeveel er
// zijn ingevuld; 0 betekent "dit document heeft geen inhoudsopgave" of "de
// koppen waren niet terug te vinden", en dan blijft de eerste PDF staan.
async function vulInhoudsopgave(page, pdfBytes) {
  const heeftToc = await page.$('.pdf-toc a[href^="#norm-"]')
  if (!heeftToc) return 0
  let paginas
  try {
    paginas = paginaPerKop(await PDFDocument.load(pdfBytes))
  } catch (e) {
    console.warn(`  bladwijzers niet te lezen (${e.message}); inhoudsopgave zonder nummers`)
    return 0
  }
  return page.evaluate(paren => {
    let n = 0
    for (const li of document.querySelectorAll('.pdf-toc li')) {
      const link = li.querySelector('a')
      const pagina = paren[link?.textContent.trim()]
      if (!pagina) continue
      const span = document.createElement('span')
      span.className = 'pdf-toc-pagina'
      // aria-hidden: de bladwijzer en de link doen het werk voor wie navigeert;
      // een los nummer achter elke regel voegt daar niets aan toe.
      span.setAttribute('aria-hidden', 'true')
      span.textContent = String(pagina)
      li.appendChild(span)
      n++
    }
    return n
  }, Object.fromEntries(paginas))
}

const { files, prints } = readSite(root)
if (prints.length === 0) {
  console.error(`Geen index.print.html gevonden onder ${root}.`)
  console.error('Deze stap ruimt zijn eigen invoer op, dus draait één keer per')
  console.error('Hugo-build. Bouw de site opnieuw en probeer het dan nog eens.')
  process.exit(1)
}

const KOPREGEL = koptekst(briefhoofd())
const VOETREGEL = voettekst()

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

const PDF_OPTIES = {
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
}

for (const { url, bestand } of prints) {
  const doel = bestand.replace(/index\.print\.html$/, 'index.pdf')
  await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'networkidle' })
  // Zonder deze wachtstap kan de eerste pagina met een fallback-letter renderen.
  await page.evaluate(() => document.fonts.ready)

  let bytes = await page.pdf(PDF_OPTIES)

  // Tweede doorloop voor de inhoudsopgave: de paginanummers komen uit de PDF
  // van de eerste. Zie vulInhoudsopgave hierboven voor waarom dat zo moet.
  const gevuld = await vulInhoudsopgave(page, bytes)
  if (gevuld) {
    const opnieuw = await page.pdf(PDF_OPTIES)
    const voor = (await PDFDocument.load(bytes)).getPageCount()
    const na = (await PDFDocument.load(opnieuw)).getPageCount()
    if (voor === na) {
      bytes = opnieuw
      console.log(`  inhoudsopgave: ${gevuld} paginanummers ingevuld`)
    } else {
      // De nummers zouden nu naar de verkeerde pagina wijzen. Liever een
      // inhoudsopgave zonder nummers dan een die ernaast zit.
      console.warn(`  inhoudsopgave overgeslagen: paginatelling veranderde van ${voor} naar ${na}`)
    }
  }

  fs.writeFileSync(doel, bytes)
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
