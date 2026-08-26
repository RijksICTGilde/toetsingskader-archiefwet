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
  legeAltFouten, zonderHash,
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

test('zwevende voetnoot: buiten /normen/ telt een kale markering niet', () => {
  // De transformatie zit alleen in normen/single.html; elders is een
  // Goldmark-voetnoot correct en zou melden alleen de bron kosten.
  assert.deepEqual(zwevendeVoetnootFouten(dom(KALE_MARKERING), '/samenhang/'), [])
  assert.deepEqual(zwevendeVoetnootFouten(dom(KALE_MARKERING), '/onderwerpen/audittrail/'), [])
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
