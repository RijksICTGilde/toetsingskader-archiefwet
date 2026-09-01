// Integratietest: doc-definition uit echte norm-JSON, met gestubte
// pdfMake-renderer en linkedom als DOMParser.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DOMParser, parseHTML } from 'linkedom'

const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8')

// realm-globals opzetten
const { document } = parseHTML('<!DOCTYPE html><html><body></body></html>')
globalThis.window = globalThis
globalThis.document = document
globalThis.DOMParser = DOMParser

let captured = null
globalThis.addVirtualFileSystem = () => {}
globalThis.addFonts = () => {}
globalThis.createPdf = (dd) => { captured = dd; return { download() {} } }

// scripts in deze realm laden (non-module globals)
new Function(read('assets/js/pdf-assets.js'))()
new Function(read('assets/js/html-to-pdfmake.js'))()
new Function(read('assets/js/pdf-export.js'))()

function clickWith(json) {
  captured = null
  globalThis.fetch = async () => ({ ok: true, json: async () => json })
  const a = document.createElement('a')
  a.setAttribute('data-pdf-url', '/x/index.pdf.json')
  document.body.appendChild(a)
  a.click()
  // generate() is async; geef de microtasks tijd
  return new Promise((r) => setTimeout(r, 50)).then(() => captured)
}

test('kern zonder kop: de kerntekst volgt direct op de titelpagina', async () => {
  // De kern-callout op de website heeft geen kop (keuze 31 augustus 2026), dus
  // de PDF zet er ook geen "Kern van …" boven. Een oude JSON met `kern_kop`
  // mag dat niet terugbrengen.
  const dd = await clickWith({
    kind: 'norm',
    titel: 'Norm 3: Ordenen',
    norm_id: '3',
    norm_titel: 'Ordenen',
    kern_kop: '3. Kern van ordenen',
    kern_html: '<p>Een kerntekst van voldoende lengte.</p>',
    body_html: '<h2>Toelichting</h2><p>Tekst.</p>',
  })
  const koppen = dd.content.filter(b => typeof b.text === 'string' && /Kern van /.test(b.text))
  assert.deepEqual(koppen, [], 'geen kern-kop in de PDF')
  // content[0] is de titelpagina; de kern komt er direct achter.
  assert.equal(dd.content[1].style, 'para')
  assert.match(dd.content[1].text, /^Een kerntekst/)
  assert.equal(dd.content[2].style, 'h2')
  assert.equal(dd.content[2].text, 'Toelichting')
})

test('norm-doc: header, kern, body, disclaimer, fonts', async () => {
  const norm = JSON.parse(read('public/normen/01-beheer/index.pdf.json'))
  const dd = await clickWith(norm)
  assert.ok(dd, 'doc-definition gemaakt')
  assert.equal(dd.defaultStyle.font, 'ROSans')
  assert.ok(Array.isArray(dd.content))
  // titelpagina (content[0]): titel + versie + datum + bron, met pageBreak
  const cover = dd.content[0]
  const coverText = JSON.stringify(cover)
  assert.match(coverText, /Versie/)
  assert.match(coverText, /Gedownload op/)
  assert.match(coverText, /Bron/)
  assert.equal(cover.pageBreak, 'after')
  // Kern zonder kop, net als de callout op de website: de kerntekst is de
  // eerste alinea na de titelpagina.
  assert.ok(!dd.content.some(b => typeof b.text === 'string' && /Kern van /.test(b.text)), 'geen kern-kop')
  const kernBlock = dd.content[1]
  assert.equal(kernBlock.style, 'para')
  assert.ok(typeof kernBlock.text === 'string' && kernBlock.text.length > 10, 'kerntekst gerenderd')
  // versieregel i.p.v. disclaimerblok: "Dit is versie … Bekijk voor de actuele versie <url>."
  assert.ok(dd.content.some(b => Array.isArray(b.text) && JSON.stringify(b.text).includes('Bekijk voor de actuele versie')), 'versieregel aanwezig')
  // header (logo op elke pagina) + footer (stack met paginanummer)
  assert.match(JSON.stringify(dd.footer(2, 5)), /Pagina 2 van 5/)
  const A4 = { width: 595.28, height: 841.89 }
  const lint = dd.header(1, 6, A4).find(c => c.svg)
  assert.ok(lint, 'lint aanwezig')
  assert.match(lint.svg, /^<svg/)
  // Het lint loopt af aan de bovenrand (y = 0) en staat horizontaal gecentreerd;
  // zonder dat zweeft het logo los onder de paginarand.
  assert.equal(lint.absolutePosition.y, 0, 'lint tegen de bovenrand')
  assert.equal(lint.absolutePosition.x + lint.width / 2, A4.width / 2, 'lint horizontaal gecentreerd')
  // Rijkshuisstijl-lockup: lint + organisatienaam + ministerie (OCW).
  const wordmark = dd.header(1, 6, A4).find(c => c.stack)
  assert.match(JSON.stringify(wordmark), /Inspectie Overheidsinformatie en Erfgoed/)
  assert.match(JSON.stringify(wordmark), /Ministerie van Onderwijs, Cultuur en Wetenschap/)
  assert.ok(wordmark.absolutePosition.x > lint.absolutePosition.x + lint.width, 'woordmerk rechts van het lint')
  assert.ok(dd.header(2, 6, A4).find(c => c.svg), 'logo ook op pagina 2 (running letterhead)')
  // De viewer moet de documenttitel tonen, niet de bestandsnaam. `tagged` blijft
  // uit: zonder structuurboom zou die vlag een onwaarheid zijn (bevinding 6).
  assert.equal(dd.info.title, norm.titel, 'documenttitel in de Info-dictionary')
  assert.equal(dd.displayTitle, true, 'ViewerPreferences /DisplayDocTitle')
  assert.ok(!dd.tagged, 'niet als getagd gemarkeerd zolang er geen structuurboom is')
})

test('kader-doc: inhoudsopgave + 8 normen op eigen pagina, in toc opgenomen', async () => {
  const kader = JSON.parse(read('public/normen/index.pdf.json'))
  const dd = await clickWith(kader)
  assert.ok(dd)
  // Klikbare inhoudsopgave aanwezig (na de cover).
  const toc = dd.content.find(b => b.toc)
  assert.ok(toc, 'toc-node aanwezig')
  assert.match(JSON.stringify(toc.toc.title), /Inhoudsopgave/)
  // 8 norm-secties, elk op een nieuwe pagina én opgenomen in de inhoudsopgave.
  const sections = dd.content.filter(b => b.style === 'section')
  assert.equal(sections.length, 8)
  assert.ok(sections.every(s => s.pageBreak === 'before'), 'elke norm op nieuwe pagina')
  assert.ok(sections.every(s => s.tocItem === true), 'elke norm in de inhoudsopgave')
})
