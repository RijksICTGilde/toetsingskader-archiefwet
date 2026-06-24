// Integratietest: bouwt een echte doc-definition uit gegenereerde norm-JSON.
// pdfMake-renderer wordt gestubt; DOMParser komt van linkedom. Valideert dat
// converter + builder + pdfMake-API-aanroepen samen een geldige structuur leveren.
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
  // kop "Kern van de norm" aanwezig én de kerntekst zelf gerenderd (niet leeg)
  const kernIdx = dd.content.findIndex(b => b.text === 'Kern van de norm')
  assert.ok(kernIdx !== -1, 'kern-kop aanwezig')
  const kernBlock = dd.content[kernIdx + 1]
  assert.equal(kernBlock.style, 'kern')
  assert.ok(typeof kernBlock.text === 'string' && kernBlock.text.length > 10, 'kerntekst gerenderd')
  // disclaimer
  assert.ok(dd.content.some(b => b.ul && typeof b.ul[0] === 'string' && b.ul[0].includes('automatisch gegenereerd')))
  // header (logo op elke pagina) + footer (stack met paginanummer)
  assert.match(JSON.stringify(dd.footer(2, 5)), /Pagina 2 van 5/)
  const logoCol = dd.header(1).columns.find(c => c.svg)
  assert.ok(logoCol, 'logo-kolom aanwezig')
  assert.match(logoCol.svg, /^<svg/)
  assert.ok(dd.header(2).columns.find(c => c.svg), 'logo ook op pagina 2 (running letterhead)')
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
