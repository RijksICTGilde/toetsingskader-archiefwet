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

test('kern-kop komt uit kern_kop, niet uit norm_titel', async () => {
  // De koppen volgen het normblad woord voor woord: normblad 3 heet
  // "Kern van Ordeningsstructuur" terwijl de norm op de site "Ordenen" heet.
  // De PDF moet dezelfde kop tonen als de pagina en de inhoudsopgave.
  const dd = await clickWith({
    kind: 'norm',
    titel: 'Norm 3: Ordenen',
    norm_id: '3',
    norm_titel: 'Ordenen',
    kern_kop: 'Kern van Ordeningsstructuur',
    kern_html: '<p>Een kerntekst van voldoende lengte.</p>',
    body_html: '<h2>Toelichting</h2><p>Tekst.</p>',
  })
  const kop = dd.content.find(b => typeof b.text === 'string' && b.text.startsWith('Kern van '))
  assert.equal(kop.text, 'Kern van Ordeningsstructuur')
})

test('kern-kop valt terug op norm_titel als kern_kop ontbreekt', async () => {
  const dd = await clickWith({
    kind: 'norm',
    titel: 'Norm 3: Ordenen',
    norm_id: '3',
    norm_titel: 'Ordenen',
    kern_html: '<p>Een kerntekst van voldoende lengte.</p>',
    body_html: '<h2>Toelichting</h2><p>Tekst.</p>',
  })
  const kop = dd.content.find(b => typeof b.text === 'string' && b.text.startsWith('Kern van '))
  assert.equal(kop.text, 'Kern van ordenen')
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
  // Kern als h2 (zoals Toelichting) + kerntekst als alinea.
  // De kop noemt de norm, net als op de website (layouts/_partials/kern-kop.html).
  const kernIdx = dd.content.findIndex(b => typeof b.text === 'string' && b.text.startsWith('Kern van '))
  assert.ok(kernIdx !== -1, 'kern-kop aanwezig')
  assert.equal(dd.content[kernIdx].style, 'h2', 'kern-kop als sectiekop (h2)')
  const kernBlock = dd.content[kernIdx + 1]
  assert.equal(kernBlock.style, 'para')
  assert.ok(typeof kernBlock.text === 'string' && kernBlock.text.length > 10, 'kerntekst gerenderd')
  // disclaimer
  assert.ok(dd.content.some(b => b.ul && typeof b.ul[0] === 'string' && b.ul[0].includes('automatisch gegenereerd')))
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
