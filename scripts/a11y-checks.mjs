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

// --- Kopvolgorde ------------------------------------------------------------
// Voor de PDF-invoer (index.pdfdata.json, gecontroleerd in scripts/pdf-build.mjs),
// waar de structuurboom van de PDF uit de koppen volgt. Een overgeslagen niveau is daar geen opmaakkwestie maar
// een structuurfout: Acrobat rapporteert hem als "Juiste insluiting via nesting",
// en dat is precies waarop de auto-getagde PDF in docs/toegankelijkheid/
// struikelt. Axe dekt dit niet: `heading-order` valt onder best-practice en de
// scan draait alleen de WCAG-tags.
//
// Twee fouten, want ze hebben verschillende oorzaken: meer dan één <h1> betekent
// dat een template twee documenttitels zet, een sprong betekent dat er een
// niveau ontbreekt tussen kop en subkop.
export function kopvolgordeFouten(document) {
  const koppen = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
  const fouten = []
  let vorig = 0
  let h1s = 0
  for (const kop of koppen) {
    const niveau = Number(kop.tagName[1])
    if (niveau === 1 && ++h1s === 2) {
      fouten.push(`meer dan één <h1>; de tweede is "${tekst(kop)}"`)
    }
    if (vorig && niveau > vorig + 1) {
      fouten.push(`h${vorig} → h${niveau} slaat een niveau over bij "${tekst(kop)}"`)
    }
    vorig = niveau
  }
  return fouten
}

const tekst = el => (el.textContent || '').trim().slice(0, 60)

// --- Dubbele id's -----------------------------------------------------------
// Ook voor de PDF-invoer. Het kaderdocument zet acht normen achter elkaar en
// Goldmark nummert voetnoten per pagina, dus zonder prefix per norm bestaat
// `fn:1` acht keer. Elke verwijzing landt dan op de eerste — in een document van
// tachtig pagina's stuurt dat de lezer naar de verkeerde bron. Axe's
// `duplicate-id` is in axe 4.10 best-practice geworden en draait hier dus niet.
export function dubbeleIdFouten(document) {
  const gezien = new Set()
  const dubbel = new Set()
  for (const el of document.querySelectorAll('[id]')) {
    const id = el.getAttribute('id')
    if (gezien.has(id)) dubbel.add(id)
    else gezien.add(id)
  }
  return [...dubbel]
}
