// Gedrag van assets/js/toc-default-open.js: de "Op deze pagina"-TOC staat
// standaard open, maar een opgeslagen voorkeur wint altijd.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseHTML } from 'linkedom'

const src = readFileSync(new URL('../../assets/js/toc-default-open.js', import.meta.url), 'utf8')

// Rendert de markup zoals layouts/normen/single.html en het thema die opleveren:
// toggle met aria-expanded="false" + aside zonder is-open.
function setup({ stored = null, storageThrows = false, withToc = true } = {}) {
  const { document } = parseHTML(`<!doctype html><html><body>
    <article>
      <header>
        <button class="toc-toggle" aria-expanded="false" aria-controls="toc">
          <span class="visually-hidden">Inhoudsopgave tonen</span>
        </button>
      </header>
    </article>
    ${withToc ? '<aside id="toc" class="toc" aria-label="Op deze pagina"></aside>' : ''}
  </body></html>`)

  const store = { 'toc-open': stored }
  const localStorage = {
    getItem(key) {
      if (storageThrows) throw new Error('localStorage geblokkeerd')
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
  }

  // Het script is een plain browser-IIFE: draaien met document/localStorage
  // als parameters i.p.v. globals, zodat tests elkaar niet beinvloeden.
  new Function('document', 'localStorage', src)(document, localStorage)
  return document
}

test('zonder opgeslagen voorkeur: TOC open en toggle-status in sync', () => {
  const doc = setup({ stored: null })
  const toc = doc.getElementById('toc')
  const toggle = doc.querySelector('.toc-toggle')

  assert.ok(toc.classList.contains('is-open'))
  assert.equal(toggle.getAttribute('aria-expanded'), 'true')
  assert.equal(toggle.querySelector('.visually-hidden').textContent, 'Inhoudsopgave verbergen')
})

test('opgeslagen voorkeur "false": TOC blijft dicht (thema-status ongemoeid)', () => {
  const doc = setup({ stored: 'false' })
  const toggle = doc.querySelector('.toc-toggle')

  assert.equal(doc.getElementById('toc').classList.contains('is-open'), false)
  assert.equal(toggle.getAttribute('aria-expanded'), 'false')
  assert.equal(toggle.querySelector('.visually-hidden').textContent, 'Inhoudsopgave tonen')
})

test('opgeslagen voorkeur "true": het thema heeft al geopend, wij raken niets aan', () => {
  const doc = setup({ stored: 'true' })
  // Het thema zet is-open zelf; ons script mag die status niet dupliceren of
  // terugdraaien. Hier staat de aside nog dicht, dus "niets doen" is zichtbaar.
  assert.equal(doc.getElementById('toc').classList.contains('is-open'), false)
})

test('geblokkeerde localStorage: valt terug op standaard open', () => {
  const doc = setup({ storageThrows: true })
  assert.ok(doc.getElementById('toc').classList.contains('is-open'))
})

test('pagina zonder TOC: geen fout', () => {
  assert.doesNotThrow(() => setup({ withToc: false }))
})
