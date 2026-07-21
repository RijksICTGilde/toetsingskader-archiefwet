import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHTML } from 'linkedom'
import { elementToPdfContent } from './_load.mjs'

function convert(html) {
  const { document } = parseHTML('<!DOCTYPE html><html><body></body></html>')
  const div = document.createElement('div')
  div.innerHTML = html
  return elementToPdfContent(div)
}

test('h2 wordt h2-stijl', () => {
  const out = convert('<h2>Toelichting</h2>')
  assert.equal(out[0].text, 'Toelichting')
  assert.equal(out[0].style, 'h2')
})

test('paragraaf met bold en italic', () => {
  const out = convert('<p>Een <strong>vet</strong> en <em>schuin</em> woord.</p>')
  assert.equal(out[0].style, 'para')
  assert.ok(Array.isArray(out[0].text))
  assert.deepEqual(out[0].text.find(r => r.bold), { text: 'vet', bold: true })
  assert.deepEqual(out[0].text.find(r => r.italics), { text: 'schuin', italics: true })
})

test('ongeordende lijst', () => {
  const out = convert('<ul><li>een</li><li>twee</li></ul>')
  assert.deepEqual(out[0].ul.map(li => li.text), ['een', 'twee'])
})

test('link behoudt href en brand-kleur', () => {
  const out = convert('<p><a href="https://x.nl">bron</a></p>')
  assert.deepEqual(out[0].text[0], { text: 'bron', link: 'https://x.nl', color: '#007bc7' })
})

test('onbekend element valt terug op platte tekst', () => {
  const out = convert('<figure>rare inhoud</figure>')
  assert.equal(out[0].text, 'rare inhoud')
})

test('geneste section wordt platgeslagen', () => {
  const out = convert('<section><h3>Thema</h3><p>tekst</p></section>')
  assert.equal(out[0].style, 'h3')
  assert.equal(out[1].style, 'para')
})

test('voetnoot-backref-link wordt weggelaten', () => {
  const out = convert('<ol><li><p>Brontekst. <a href="#x">Bekijk bron</a> <a href="#fnref1:1" class="footnote-backref">\u21a9</a></p></li></ol>')
  const runs = out[0].ol[0].text
  assert.ok(Array.isArray(runs))
  assert.ok(runs.some(r => r.text === 'Bekijk bron'))
  assert.ok(!runs.some(r => r.text && r.text.indexOf('\u21a9') !== -1))
})

test('witruimte/newline in lijstitem wordt samengevouwen (geen losse regel)', () => {
  const out = convert('<ol><li>\n  <p>Aw, artikel 4.2. <a href="#x">Bekijk bron</a></p>\n</li></ol>')
  const runs = out[0].ol[0].text
  const flat = Array.isArray(runs) ? runs : [{ text: runs }]
  // geen enkele run mag een newline bevatten
  assert.ok(flat.every(r => !/\n/.test(r.text)), 'geen newline-runs')
  // tekst begint met de bron, niet met witruimte-regel
  assert.match((flat[0].text || '').trim(), /^Aw, artikel/)
})

function convertWith(html, opts) {
  const { document } = parseHTML('<!DOCTYPE html><html><body></body></html>')
  const div = document.createElement('div')
  div.innerHTML = html
  return elementToPdfContent(div, opts)
}

test('voetnoot-nummer wordt interne sprong (linkToDestination, met norm-prefix)', () => {
  const out = convertWith('<p>tekst<sup id="fnref:1"><a href="#fn:1" class="footnote-ref">1</a></sup></p>', { prefix: 'n1-' })
  const ref = out[0].text.find(r => r.linkToDestination)
  assert.ok(ref, 'ref-run met linkToDestination')
  assert.equal(ref.linkToDestination, 'n1-fn-1')
  assert.equal(ref.text, '1')
  assert.ok(!ref.link, 'geen externe link')
})

test('bronnenlijst-item krijgt matching bestemming-id', () => {
  const out = convertWith('<ol><li id="fn:1"><p>Bron. <a href="#x">Bekijk bron</a></p></li></ol>', { prefix: 'n1-' })
  assert.equal(out[0].ol[0].id, 'n1-fn-1')
})

test('interne norm-link wordt in-PDF-sprong als normDests gegeven (kader)', () => {
  const out = convertWith('<p>zie <a href="/normen/06-vernietigen/">Norm 6</a></p>', { origin: 'https://x.nl', normDests: { '06-vernietigen': 'norm-06-vernietigen' } })
  const link = out[0].text.find(r => r.linkToDestination)
  assert.ok(link, 'in-PDF-sprong')
  assert.equal(link.linkToDestination, 'norm-06-vernietigen')
  assert.ok(!link.link, 'geen externe link')
})

test('interne norm-link wordt absolute site-link zonder normDests (losse norm-PDF)', () => {
  const out = convertWith('<p>zie <a href="/normen/06-vernietigen/">Norm 6</a></p>', { origin: 'https://x.nl', normDests: null })
  const link = out[0].text.find(r => r.link)
  assert.equal(link.link, 'https://x.nl/normen/06-vernietigen/')
  assert.ok(!link.linkToDestination)
})

test('externe link blijft extern', () => {
  const out = convertWith('<p><a href="https://nationaalarchief.nl/x">DUTO</a></p>', { origin: 'https://x.nl', normDests: null })
  assert.equal(out[0].text[0].link, 'https://nationaalarchief.nl/x')
})
