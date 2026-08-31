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
  assert.equal(ref.sup, true, 'voetnoot-nummer als superscript (kleiner en hoger)')
  assert.equal(ref.fontSize, undefined, 'geen expliciete fontSize: pdfMake schaalt sup zelf')
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

test('lijstitem dat alléén een norm-sprong is behoudt die sprong (kader)', () => {
  // Regressie: een lijstitem dat alleen een link is, mag niet worden
  // platgeslagen tot een string — dan is het dode zwarte tekst.
  const out = convertWith('<ul><li><a href="/normen/03-ordenen/">Ordenen</a></li></ul>', { origin: 'https://x.nl', normDests: { '03-ordenen': 'norm-03-ordenen' } })
  const item = out[0].ul[0].text
  assert.ok(Array.isArray(item), 'geen kale string: de run met linkToDestination moet blijven')
  assert.equal(item[0].linkToDestination, 'norm-03-ordenen')
  assert.equal(item[0].text, 'Ordenen')
})

test('alinea die alléén een voetnootnummer is behoudt superscript', () => {
  const out = convertWith('<p><sup id="fnref:1"><a href="#fn:1" class="footnote-ref">1</a></sup></p>', { prefix: 'n1-' })
  const runs = out[0].text
  assert.ok(Array.isArray(runs), 'geen kale string: sup en linkToDestination moeten blijven')
  assert.equal(runs[0].sup, true)
  assert.equal(runs[0].linkToDestination, 'n1-fn-1')
})

test('voetnoot in een kop wordt superscript met sprong, geen kaal nummer', () => {
  // Norm 4: de ###-kop "Digitale documenten met een bewaartermijn …" draagt
  // [^ar-artikel-2-8]. Met textContent las de PDF "… metadataschema:17".
  const out = convertWith('<h3 id="x">Kop met bron<sup id="fnref:17"><a href="#fn:17" class="footnote-ref">17</a></sup></h3>', { prefix: 'n4-' })
  assert.equal(out[0].style, 'h3')
  assert.ok(Array.isArray(out[0].text), 'runs, geen platte tekst')
  const ref = out[0].text.find(r => r.sup)
  assert.ok(ref, 'voetnootnummer als superscript')
  assert.equal(ref.text, '17')
  assert.equal(ref.linkToDestination, 'n4-fn-17')
  assert.equal(out[0].text[0].text, 'Kop met bron')
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

test('bronnenlijst krijgt een kop en de voetnootstijl (klein), niet de body-lijststijl', () => {
  const out = convertWith(
    '<p>tekst</p><div class="footnotes" role="doc-endnotes"><hr><ol><li id="fn:1"><p>Aw, artikel 4.2. <a href="#x">Bekijk bron</a></p></li></ol></div>',
    { prefix: 'n1-' }
  )
  const kop = out.find(b => b.style === 'footnotesH')
  assert.ok(kop, 'kop boven de bronnenlijst')
  assert.equal(kop.text, 'Bronnen')

  const lijst = out.find(b => b.ol)
  assert.ok(lijst, 'de bronnenlijst zelf')
  assert.equal(lijst.style, 'footnotes', 'eigen stijl i.p.v. de body-lijststijl')
  assert.equal(lijst.ol[0].id, 'n1-fn-1', 'bestemming blijft werken')

  // De <hr> uit het footnotes-blok verdwijnt: de kop markeert de sectie al.
  assert.ok(!out.some(b => b.canvas), 'geen scheidingslijn meer')
})

test('een gewone ol buiten het footnotes-blok houdt de body-lijststijl', () => {
  const out = convert('<ol><li>een</li></ol>')
  assert.equal(out[0].style, 'list')
})
