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
  assert.deepEqual(out[0].text[0], { text: 'bron', link: 'https://x.nl', color: '#007bc7', decoration: 'underline' })
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
