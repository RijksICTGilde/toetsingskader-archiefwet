// Projecteigen controles op de gebouwde HTML, naast axe. Pure functies (DOM in,
// bevindingen uit) zodat ze testbaar zijn zonder Hugo-build. Aangeroepen vanuit
// scripts/a11y-scan.mjs; tests in tests/js/a11y-checks.test.mjs.

// --- Zwevende voetnootmarkeringen -------------------------------------------
// Een `footnote-ref` die de ref-term-transformatie van `normen/single.html` heeft
// gemist, is een zwevend nummer zonder brontekst. Controle op de gerenderde HTML,
// niet op de markdown: Goldmark voorspellen met regex werkte twee kanten op
// verkeerd (zie scripts/validate-norms.py). Alleen normpagina's — elders is een
// gewone Goldmark-voetnoot correct, en `/normen/` is een list-template.
export function zwevendeVoetnootFouten(document, url) {
  if (!url.startsWith('/normen/') || url === '/normen/') return []
  return [...document.querySelectorAll('a.footnote-ref')].map(a => a.getAttribute('href') || '(zonder href)')
}

// --- Ref-term die alleen uit interpunctie bestaat ----------------------------
// Is het blok vóór de markering alleen interpunctie ("):"), dan slaagt de
// transformatie maar wordt de ref-term een klikdoel van een paar pixels — WCAG
// 2.5.8 vraagt 24x24 CSS-px of genoeg ruimte. Onzichtbaar voor de controle
// hierboven; daarom apart.
const LETTER_OF_CIJFER = /[\p{L}\p{N}]/u

export function korteRefTermFouten(document) {
  return [...document.querySelectorAll('a.ref-term')]
    .map(a => (a.textContent || '').trim())
    .filter(tekst => tekst.length > 0 && !LETTER_OF_CIJFER.test(tekst))
}

// --- Draft-voorbehoud -------------------------------------------------------
// Het voorbehoud komt via `_partials/versie-zin.html` en hangt aan
// `.Params.show_lastmod`. Vergeet je dat op een nieuwe pagina, dan staat er
// normatief ogende tekst zonder voorbehoud. Uitzonderingen dragen geen
// kadertekst.
export const GEEN_VOORBEHOUD_NODIG = new Map([
  ['/404.html', 'foutpagina; toont geen normtekst maar vier ingangen'],
  ['/tags/', 'lege taxonomiepagina (disableKinds, bevinding 14)'],
  ['/categories/', 'lege taxonomiepagina (disableKinds, bevinding 14)'],
])
// Sinds 25 augustus 2026 zonder "nog in ontwikkeling"; de versiezin zelf is het
// voorbehoud (versienummer + datum laatst aangepast).
export const VOORBEHOUD = 'van het toetsingskader'

export function voorbehoudFout(document, url) {
  if (GEEN_VOORBEHOUD_NODIG.has(url)) return null
  return document.body.textContent.includes(VOORBEHOUD) ? null : url
}

// De zin staat hierboven overgetikt. Zonder deze controle kleurt een aangepaste
// formulering élke pagina rood met een melding die de verkeerde oorzaak noemt.
export function voorbehoudBronFout(partialBron) {
  return partialBron.includes(VOORBEHOUD)
    ? null
    : 'layouts/_partials/versie-zin.html bevat de zin niet meer; werk VOORBEHOUD bij in scripts/a11y-checks.mjs'
}

// --- Lege alt ---------------------------------------------------------------
// Een lege alt op een informatieve afbeelding is een 1.1.1-fout die niemand
// vangt: axe leest hem als "bewust decoratief" en .htmltest.yml zet
// `IgnoreAltEmpty: true`. Vandaar deze expliciete lijst, met reden per item.
export const DECORATIEF = new Map([
  ['/images/hero', 'Hero op de homepage; de <h1> eronder zegt hetzelfde (bevinding 20).'],
])

// "/images/hero_hu_b08cab36f00ecf30.webp" → "/images/hero", zodat de sleutel niet
// verandert bij hercompressie. Extensie, `_hu_<hex>` en fingerprint-hash kunnen in
// beide volgordes staan, dus in een lus tot er niets meer af gaat.
export const zonderHash = src => {
  let s = (src || '').replace(/\.[a-z0-9]+$/i, '')
  for (let vorig = null; vorig !== s;) {
    vorig = s
    s = s.replace(/_hu_[0-9a-f]+$/i, '').replace(/\.[0-9a-f]{32,}$/i, '')
  }
  return s
}

export function legeAltFouten(document) {
  return [...document.querySelectorAll('img[alt=""]')]
    .map(img => zonderHash(img.getAttribute('src')))
    .filter(sleutel => !DECORATIEF.has(sleutel))
    .map(sleutel => sleutel || '(zonder src)')
}
