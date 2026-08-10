// Projecteigen controles op de gebouwde HTML, naast wat axe kan vaststellen.
//
// Ze staan hier als losse, pure functies (DOM in, lijst met bevindingen uit)
// zodat ze te testen zijn zonder een Hugo-build; zie tests/js/a11y-checks.test.mjs.
// `scripts/a11y-scan.mjs` roept ze aan tijdens de scan over `public/`.

// --- Zwevende voetnootmarkeringen -------------------------------------------
// `layouts/normen/single.html` vervangt elke voetnootmarkering door een ref-term
// met tooltip (`.ref-wrapper` + `aria-describedby`). Dat gebeurt met twee
// replaceRE-patronen; wat geen van beide matcht, blijft staan als het kale
// `<sup><a class="footnote-ref">N</a></sup>` van Goldmark: een zwevend nummer
// zonder brontekst, en voor een schermlezergebruiker een verwijzing naar niets.
//
// Bewust een controle op de gerenderde HTML en niet op de markdown. De oorzaken
// lopen uiteen — nadruk, code, doorhaling, een link met opgemaakte linktekst,
// twee markeringen achter elkaar — en ze voorspellen vraagt om het namaken van
// Goldmark in reguliere expressies. Dat is geprobeerd en het werkte twee kanten
// op verkeerd; zie de toelichting in scripts/validate-norms.py.
//
// Alléén op normpagina's. De ref-term-transformatie zit in `normen/single.html`
// en nergens anders, dus op een pagina buiten /normen/ is een gewone
// Goldmark-voetnoot correct en volledig toegankelijk: nummer, link naar de
// bronnenlijst en een backlink terug. Die hier melden zou een CI-fout opleveren
// die alleen te verhelpen is door de bronvermelding weg te halen.
// `/normen/` zelf hoort er níét bij: dat is de sectie-index, gerenderd door een
// list-template, en ook daar draait de transformatie niet.
export function zwevendeVoetnootFouten(document, url) {
  if (!url.startsWith('/normen/') || url === '/normen/') return []
  return [...document.querySelectorAll('a.footnote-ref')].map(a => a.getAttribute('href') || '(zonder href)')
}

// --- Ref-term die alleen uit interpunctie bestaat ----------------------------
// Patroon B in `normen/single.html` maakt van het blok vóór de markering de
// ref-term. Staat daar alleen interpunctie ("):"), dan lukt de transformatie
// wél — er blijft geen `footnote-ref` over — maar het resultaat is een klikdoel
// van een paar pixels. WCAG 2.5.8 Target Size (Minimum, AA) vraagt 24 bij 24
// CSS-pixels, of genoeg onderlinge ruimte; een tekstlink van twee leestekens
// midden in een zin haalt geen van beide.
//
// Dit is het geval dat de controle op zwevende markeringen niet ziet, en het is
// de reden dat die controle alleen níét genoeg is.
const LETTER_OF_CIJFER = /[\p{L}\p{N}]/u

export function korteRefTermFouten(document) {
  return [...document.querySelectorAll('a.ref-term')]
    .map(a => (a.textContent || '').trim())
    .filter(tekst => tekst.length > 0 && !LETTER_OF_CIJFER.test(tekst))
}

// --- Draft-voorbehoud -------------------------------------------------------
// Het voorbehoud ("De inhoud is nog in ontwikkeling en kan wijzigen") bereikt
// een pagina via `_partials/versie-zin.html`, aangeroepen vanuit de paginavoet
// en vanuit de shortcode `versielabel` op de homepage. De voet hangt aan
// `.Params.show_lastmod`; wie dat op een nieuwe pagina vergeet, publiceert
// normatief ogende tekst zonder voorbehoud, en niets merkt dat op.
//
// De uitzonderingen dragen geen inhoud uit het toetsingskader.
export const GEEN_VOORBEHOUD_NODIG = new Map([
  ['/404.html', 'foutpagina; toont geen normtekst maar vier ingangen'],
  ['/tags/', 'lege taxonomiepagina (disableKinds, bevinding 14)'],
  ['/categories/', 'lege taxonomiepagina (disableKinds, bevinding 14)'],
])
export const VOORBEHOUD = 'in ontwikkeling en kan wijzigen'

export function voorbehoudFout(document, url) {
  if (GEEN_VOORBEHOUD_NODIG.has(url)) return null
  return document.body.textContent.includes(VOORBEHOUD) ? null : url
}

// `versie-zin.html` noemt zichzelf de enige bron van deze zin, maar de zin staat
// hierboven overgetikt. Wie de formulering daar aanpast, zou anders élke
// inhoudspagina rood zien met een melding die naar de verkeerde oorzaak wijst
// ("zet show_lastmod"). Deze controle draait één keer per scan en zegt wat er
// echt aan de hand is.
export function voorbehoudBronFout(partialBron) {
  return partialBron.includes(VOORBEHOUD)
    ? null
    : 'layouts/_partials/versie-zin.html bevat de zin niet meer; werk VOORBEHOUD bij in scripts/a11y-checks.mjs'
}

// --- Lege alt ---------------------------------------------------------------
// `alt=""` is de juiste waarde voor een decoratieve afbeelding, maar op een
// informatieve afbeelding is het een 1.1.1-fout die geen enkele geautomatiseerde
// controle vangt: axe leest een lege alt als "bewust decoratief" en
// .htmltest.yml zet `IgnoreAltEmpty: true` sitebreed aan om de hero door te
// laten. Daarom een expliciete lijst: wie een afbeelding decoratief noemt, zet
// hem erbij en legt in één zin uit waarom.
export const DECORATIEF = new Map([
  ['/images/hero', 'Hero op de homepage; de <h1> eronder zegt hetzelfde (bevinding 20).'],
])

// Van "/images/hero_hu_b08cab36f00ecf30.webp" naar "/images/hero": eerst de
// extensie eraf, dan Hugo's image-processing-suffix (`_hu_<hex>`) en een
// eventuele fingerprint-hash. Zonder dat verandert de sleutel bij elke
// hercompressie van de afbeelding.
// Beide suffixen kunnen samen voorkomen (Hugo verwerkt de afbeelding én zet er
// een fingerprint op), en in beide volgordes. Daarom in een lus tot er niets
// meer af gaat, en niet één keer per patroon: `$`-geankerde vervangingen op een
// vaste volgorde laten de tweede combinatie ongemoeid.
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
