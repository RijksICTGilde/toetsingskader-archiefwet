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

// Kop- en voetregel staan buiten de inhoud en komen dus niet in de
// structuurboom terecht. Wat hier staat mag daarom nooit de enige plek zijn waar
// iets staat: het paginanummer is navigatiehulp op papier, de titel herhaalt de
// <h1>. Chromium wisselt de placeholders (title, pageNumber, totalPages) in.
const KOPREGEL = `
  <div style="width:100%;font-family:sans-serif;font-size:7pt;color:#4a4a4a;
              padding:0 20mm;border-bottom:0.2mm solid #cfcfcf;margin-bottom:3mm;">
    <span class="title"></span>
  </div>`

const VOETREGEL = `
  <div style="width:100%;font-family:sans-serif;font-size:7pt;color:#4a4a4a;
              padding:0 20mm;display:flex;justify-content:space-between;">
    <span>Toetsingskader Archiefwet</span>
    <span><span class="pageNumber"></span> van <span class="totalPages"></span></span>
  </div>`

const { files, prints } = readSite(root)
if (prints.length === 0) {
  console.error(`Geen index.print.html gevonden onder ${root}. Is de site gebouwd?`)
  process.exit(1)
}

const server = await serve(files)
const { port } = server.address()
const browser = await chromium.launch()
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
  })
  const kb = Math.round(fs.statSync(doel).size / 1024)
  console.log(`${path.relative(root, doel)} — ${kb} kB`)
}

await browser.close()
server.close()
console.log(`\n${prints.length} PDF('s) geschreven. Controleer met: npm run test:pdf-ua`)
