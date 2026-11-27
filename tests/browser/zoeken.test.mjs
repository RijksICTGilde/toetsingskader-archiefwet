// Zoeken in Chromium over de gebouwde site, met de zoekfunctie van het theme.
// Bouw eerst: hugo --minify --quiet --baseURL / --destination .a11y/public
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { chromium } from 'playwright'

const root = path.resolve(process.env.SITE_DIR || '.a11y/public')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

let server, browser, page, base

before(async () => {
  assert.ok(fs.existsSync(path.join(root, 'index.json')), `${root}/index.json ontbreekt; bouw de site eerst`)
  // Vooraf een lijst met bestanden: een pad uit de request komt zo nooit bij fs.
  const files = new Map()
  for (const rel of fs.readdirSync(root, { recursive: true })) {
    const file = path.join(root, rel)
    if (!fs.statSync(file).isFile()) continue
    const url = '/' + rel.split(path.sep).join('/')
    files.set(url, file)
    if (url.endsWith('/index.html')) files.set(url.slice(0, -'index.html'.length), file)
  }
  server = http.createServer((req, res) => {
    const file = files.get(req.url.split('?')[0])
    if (!file) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
  browser = await chromium.launch()
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(base + '/', { waitUntil: 'load' })
  await page.locator('.search-trigger:visible').first().click()
})

after(async () => {
  await browser?.close()
  server?.close()
})

/** De paden van de resultaten voor een woord, in de volgorde van de lijst. */
async function zoek (woord) {
  await page.fill('#search-input', woord)
  await page.waitForFunction(w => {
    const lijst = document.getElementById('search-results')
    const link = lijst.querySelector('a.search-result-item')
    return link ? new URL(link.href).searchParams.get('q') === w : lijst.textContent.includes(`"${w}"`)
  }, woord, { timeout: 5000 })
  return page.$$eval('#search-results a.search-result-item', links => links.map(a => new URL(a.href).pathname))
}

test('"vinden" geeft norm 6 als eerste resultaat (feedback 25 augustus 2026)', async () => {
  const paden = await zoek('vinden')
  assert.equal(paden[0], '/normen/06-vindbaar/', paden.join(', '))
})

test('elk synoniem uit de front matter vindt zijn pagina', async () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'))
  const metSynoniemen = index.filter(item => item.synonyms)
  assert.ok(metSynoniemen.length > 0, 'geen enkele pagina met synonyms in index.json')
  const gemist = []
  for (const item of metSynoniemen) {
    // index.json plakt de synoniemen aan elkaar; de losse woorden staan in de front matter.
    const bestand = path.join('content', item.url.replace(/\/$/, '') + '.md')
    const blok = fs.readFileSync(bestand, 'utf8').match(/^synonyms:\n((?:[ \t]+- .+\n)+)/m)
    assert.ok(blok, `${bestand}: synonyms niet gevonden als YAML-lijst`)
    const synoniemen = [...blok[1].matchAll(/- (.+)/g)].map(m => m[1].trim().replace(/^["']|["']$/g, ''))
    for (const woord of synoniemen) {
      if (!(await zoek(woord)).includes(item.url)) gemist.push(`${woord} -> ${item.url}`)
    }
  }
  assert.deepEqual(gemist, [])
})
