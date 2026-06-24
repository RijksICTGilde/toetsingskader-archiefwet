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
  // header bevat versie + bron-link
  const headerText = JSON.stringify(dd.content[0])
  assert.match(headerText, /Versie/)
  assert.match(headerText, /Gedownload op/)
  // kern aanwezig
  assert.ok(dd.content.some(b => b.text === 'Kern van de norm'))
  // disclaimer aan het eind
  assert.ok(dd.content.some(b => b.ul && typeof b.ul[0] === 'string' && b.ul[0].includes('automatisch gegenereerd')))
  // header/footer-functies leveren objecten
  assert.ok(dd.header(1))
  assert.equal(dd.header(2), null)
  assert.ok(dd.footer(1, 3).columns)
  // logo ingebed (officieel lint-SVG)
  assert.ok(dd.header(1).svg)
  assert.match(dd.header(1).svg, /^<svg/)
})

test('kader-doc: 8 normen met pageBreaks', async () => {
  const kader = JSON.parse(read('public/normen/index.pdf.json'))
  const dd = await clickWith(kader)
  assert.ok(dd)
  const sections = dd.content.filter(b => b.style === 'section')
  assert.equal(sections.length, 8)
  assert.ok(sections.every(s => s.pageBreak === 'before'))
})
