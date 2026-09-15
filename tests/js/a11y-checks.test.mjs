// Unittests voor de projecteigen controles uit scripts/a11y-checks.mjs.
//
// Een detector die stilzwijgend stopt met detecteren meldt niets, en dat ziet er
// uit als "alles in orde". Elke controle heeft daarom een positief én een
// negatief geval.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHTML } from 'linkedom'
import {
  zwevendeVoetnootFouten, korteRefTermFouten,
  legeAltFouten, zonderHash, kopvolgordeFouten, dubbeleIdFouten,
} from '../../scripts/a11y-checks.mjs'

const dom = (body) => parseHTML(`<!DOCTYPE html><html><body>${body}</body></html>`).document

const KALE_MARKERING = '<sup id="fnref:1"><a href="#fn:1" class="footnote-ref" role="doc-noteref">1</a></sup>'
const GOEDE_REF = '<span class="ref-wrapper" id="fnref:1"><a href="#fn:1" class="ref-term" aria-describedby="fnref:1-bron">houden</a><span class="ref-tooltip" role="note"><span id="fnref:1-bron">Aw, artikel 4.1.</span></span></span>'

test('zwevende voetnoot: kale markering op een normpagina is een fout', () => {
  assert.deepEqual(zwevendeVoetnootFouten(dom(KALE_MARKERING), '/normen/01-beheer/'), ['#fn:1'])
})

test('zwevende voetnoot: een omgezette ref-term is geen fout', () => {
  assert.deepEqual(zwevendeVoetnootFouten(dom(GOEDE_REF), '/normen/01-beheer/'), [])
})

test('zwevende voetnoot: telt overal waar de transformatie draait, niet op onbewerkte pagina\u2019s', () => {
  const kaal = '<p>tekst<sup id="fnref:1"><a href="#fn:1" class="footnote-ref">1</a></sup></p>'
  // Transformatie gedraaid (blok weg) maar marker gemist → fout, ook buiten /normen/.
  assert.deepEqual(zwevendeVoetnootFouten(dom(kaal), '/over/doel/'), ['#fn:1'])
  // Onbewerkte pagina (homepage/404): het Goldmark-blok staat er nog → correcte voetnoot.
  assert.deepEqual(zwevendeVoetnootFouten(dom(kaal + '<div class="footnotes"><ol><li id="fn:1">bron</li></ol></div>'), '/'), [])
})

test('korte ref-term: alleen interpunctie is een fout', () => {
  const html = '<a href="#fn:1" class="ref-term">):</a>'
  assert.deepEqual(korteRefTermFouten(dom(html)), ['):'])
})

test('korte ref-term: een woord met aanhangende interpunctie mag', () => {
  const html = '<a href="#fn:1" class="ref-term">bron.</a>'
  assert.deepEqual(korteRefTermFouten(dom(html)), [])
})

test('korte ref-term: een cijfer telt als inhoud', () => {
  const html = '<a href="#fn:1" class="ref-term">4.1</a>'
  assert.deepEqual(korteRefTermFouten(dom(html)), [])
})

test('lege alt: een niet-aangemerkte afbeelding is een fout', () => {
  assert.deepEqual(legeAltFouten(dom('<img src="/images/proef.png" alt="">')), ['/images/proef'])
})

test('lege alt: de hero staat op de decoratief-lijst', () => {
  assert.deepEqual(legeAltFouten(dom('<img src="/images/hero_hu_b08cab36f00ecf30.webp" alt="">')), [])
})

test('lege alt: een gevulde alt is nooit een fout', () => {
  assert.deepEqual(legeAltFouten(dom('<img src="/images/proef.png" alt="Een proef">')), [])
})

test('zonderHash haalt extensie, Hugo-suffix en fingerprint weg', () => {
  assert.equal(zonderHash('/images/hero_hu_b08cab36f00ecf30.webp'), '/images/hero')
  assert.equal(zonderHash('/images/logo.9f2a1c4e8b7d6a5f0e3c2b1a09876543.svg'), '/images/logo')
  assert.equal(zonderHash('/images/plaat.png'), '/images/plaat')
})

// --- Print-HTML: kopvolgorde en dubbele id's --------------------------------
// Beide controles bestaan voor de PDF-generatie: scripts/pdf-build.mjs leidt de
// structuurboom uit de koppen af, en het kaderdocument zet acht normen met
// eigen voetnootnummering achter elkaar.

test('kopvolgorde: een oplopende reeks zonder sprongen is goed', () => {
  assert.deepEqual(kopvolgordeFouten(dom('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>')), [])
})

test('kopvolgorde: een overgeslagen niveau is een fout', () => {
  const fouten = kopvolgordeFouten(dom('<h1>A</h1><h3>C</h3>'))
  assert.equal(fouten.length, 1)
  assert.match(fouten[0], /h1 → h3/)
})

test('kopvolgorde: terugspringen naar een hoger niveau mag', () => {
  assert.deepEqual(kopvolgordeFouten(dom('<h1>A</h1><h2>B</h2><h4>X</h4>')).length, 1)
  assert.deepEqual(kopvolgordeFouten(dom('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2><h3>E</h3>')), [])
})

test('kopvolgorde: een tweede h1 is een fout, een derde telt niet nog eens mee', () => {
  const fouten = kopvolgordeFouten(dom('<h1>A</h1><h1>B</h1><h1>C</h1>'))
  assert.equal(fouten.length, 1)
  assert.match(fouten[0], /meer dan één <h1>/)
})

test('dubbele id: geprefixte ankers per norm botsen niet', () => {
  assert.deepEqual(dubbeleIdFouten(dom('<p id="n1-fn:1">a</p><p id="n2-fn:1">b</p>')), [])
})

test('dubbele id: hetzelfde anker twee keer is een fout', () => {
  assert.deepEqual(dubbeleIdFouten(dom('<p id="fn:1">a</p><p id="fn:1">b</p>')), ['fn:1'])
})
