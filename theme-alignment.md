# Theme alignment & suggesties

Overzicht van wat er in dit project nog niet uit `hugo-theme-ro`-componenten
is opgebouwd, en suggesties voor uitbreiding van het thema. Bedoeld als
levend document — hak ervan af zodra iets is opgepakt.

## 1. Aanpassingen in dit project (alignment met theme)

### 1.1 Compat-shim weghalen
**Wat**: `:root` in `assets/css/main.css` aliast `--mox-*` tokens naar
`--toepassing-*`. Tijdelijke oplossing voor de theme-rename.

**Hoe op te lossen**: alle `--mox-*` referenties in `main.css` en
`bollendiagram.css` vervangen door `--toepassing-*`. Daarna shim verwijderen.

**Blokkers**: theme's eigen `theme.css`, `hero.css`, `card-grid.css` (legacy)
verwijzen óók nog naar `--mox-*`. Pas zodra die upstream zijn gemigreerd
(zie §2.2) kan de shim definitief weg.

### 1.2 Leeswijzer-blok → `.feedback-info`
**Wat**: `.leeswijzer` styling in `main.css` (border-inline-start + subtle
info-blue achtergrond).

**Theme-equivalent**: `.feedback.feedback-info` — zelfde semantiek (info
callout), zelfde kleurpalet.

**Hoe**: HTML-markup omzetten van `<div class="leeswijzer">` naar
`<aside class="feedback feedback-info"><div>...</div></aside>` (let op:
theme-component verwacht specifieke nested structuur met SVG-icoon).
`.leeswijzer` CSS verwijderen.

### 1.3 Disclaimer-banner → `.feedback-warning.feedback-page-banner`
**Wat**: `.disclaimer-banner` in `baseof.html` (full-width gele strook
"Versie 0.8 in ontwikkeling").

**Theme-equivalent**: `.feedback.feedback-warning.feedback-page-banner` —
het thema heeft expliciet een `feedback-page-banner` modifier voor
full-width banners.

**Hoe**: HTML omzetten naar de `.feedback`-structuur met juiste icoon en
modifier-classes. `.disclaimer-banner` CSS verwijderen.

### 1.4 Card-grid (legacy) uitfaseren
**Wat**: `.card-grid` (uit oude theme `card-grid.css`) wordt nog gebruikt op
`/normen` voor de overzichts-tegels. Theme heeft sinds april 2026
`.tile-grid` als opvolger.

**Hoe**:
- `layouts/normen/list.html`: `<div class="card-grid">` → `<div class="tile-grid">`
- `<article class="card norm-card-themed">` → `<article class="tile norm-tile-themed">`
- `.card-grid .card` overrides in `main.css` migreren naar `.tile-grid .tile`
- Overweeg of de norm-badge nog past binnen `.tile`-structuur (theme's
  `.tile header` verwacht img + h2)

### 1.5 Custom `page.html` override review
**Wat**: `layouts/page.html` overschrijft theme's `page.html` om de
auto-gegenereerde `<aside class="toc">` weg te laten.

**Theme-mechanisme**: theme's `page.html` checkt `.Params.toc != false`,
dus `toc: false` in front matter zou ook werken zonder override.

**Hoe op te lossen**: test of `toc: false` in `_index.md` / `over.md` /
`risicobenadering.md` etc. voldoende is om de TOC weg te laten. Zo ja:
verwijder `layouts/page.html`. Behoud alleen als we ook de markup-classes
(`page-article`, `markup-content`) zelf willen aanbrengen.

### 1.6 `_shortcodes/tile-grid.html` override opschonen
**Wat**: `layouts/_shortcodes/tile-grid.html` is een lokale fix voor een
upstream parse-error.

**Hoe op te lossen**: zodra upstream patch met de fix is gepubliceerd
(zie §2.1), de override verwijderen.

### 1.7 Norm-page side-nav heroverwegen
**Wat**: `layouts/normen/single.html` gebruikt eigen `.sidebar` + `.side-nav`
+ `partials/norm-toc.html`. Theme heeft nu `.toc`-component met sticky
positie en `main:has(.toc)`-grid (in `assets/css/components/toc.css`).

**Verschil**: thema's TOC is auto-gegenereerd uit headings; onze TOC komt
uit `front matter` (kern, toelichting, normuitleg-titels, etc.) waardoor
sub-secties met dynamic `id`-anchors gelinkt kunnen worden.

**Optie A**: laat custom side-nav staan — biedt meer controle, lijst
normen + huidige TOC samen.
**Optie B**: forceer `## Kern van de norm` etc. als markdown-headings in
de body, dan kan theme's auto-TOC dit oppakken.

Optie A is pragmatischer; geen actie tenzij we conformiteit boven
gebruiksgemak willen.

### 1.8 Hero overrides minimaliseren
**Wat**: `main > .hero` styling in `main.css` doet 100vw "pull-out" en
witte overlay-card met afgeronde hoek.

**Theme-equivalent**: `assets/css/components/hero.css` levert basis hero
styling (image + title + text). Geen "100vw bleed met overlay-card"
variant.

**Hoe op te lossen**: óf upstream een `hero--overlay` modifier voorstellen
(zie §2.5), óf onze override accepteren als project-specifieke variant.

### 1.9 Markup-content list-restore opschonen
**Wat**: `.markup-content ul/ol/li` in `main.css` herstelt list-styling
die thema's reset weghaalt.

**Theme-context**: thema reset list-styles in `nav` blokken specifiek voor
navigatie-componenten. Ons probleem ontstaat als die reset breder is
toegepast dan nodig.

**Hoe op te lossen**: review of de reset in `_reset.css`/`style.css` echt
zo breed is. Zo ja → §2.6 voor upstream voorstel; zo nee → onze override
kan weg.

## 2. Voorstellen voor hugo-theme-ro upstream

### 2.1 Parse-error in `_shortcodes/tile-grid.html` (BLOKKEREND)
Bestand bevat:
```
Usage: {{</* tile-grid section="onderwerpen" */>}}
```
binnen een Hugo template-comment `{{/* ... */}}`. De inner `*/` sluit de
buitenste comment voortijdig. Hugo's parser geeft daarom
`comment ends before closing delimiter` op deze file en breekt de hele
build voor projecten die deze theme-versie gebruiken.

**Voorstel**: doc-comment met shortcode-syntax verplaatsen buiten de
template-comment, of de inner `*/` escapen.

### 2.2 Resterende `--mox-*` in theme-CSS migreren
Bestanden in het thema die nog `--mox-*` gebruiken na de rename:
- `assets/css/theme.css`
- `assets/css/components/hero.css`
- `assets/css/components/card-grid.css` (legacy, kan ook weg als `.tile-grid` de opvolger is)

**Voorstel**: alle `--mox-*` vervangen door `--toepassing-*` in deze
bestanden. Eventueel een short-lived alias-block voor backwards
compatibility.

### 2.3 Ingebouwde header search-trigger
Veel content-sites willen een zoekknop in de hoofdnavigatie die een
modal opent (vaak Pagefind- of Algolia-gestuurd). Onze project-eigen
`header.html` voegt dit handmatig toe.

**Voorstel**: optionele search-trigger in theme's `_partials/header.html`,
gestuurd via `params.search.trigger.modal` of vergelijkbaar. Theme levert
de knop + minimale styling; project levert de modal-implementatie.

### 2.4 Pagefind/zoek-modal als theme-partial
Onze `_partials/search-modal.html` met bijbehorende JS en CSS is in feite
generiek bruikbaar voor elke content-site die Pagefind wil draaien.

**Voorstel**: `_partials/search-modal.html` opnemen in het thema, met
opt-in via `params.search.engine: pagefind`. Project hoeft dan alleen
nog Pagefind te genereren tijdens build.

### 2.5 Hero-variant met overlay-card
Onze hero pakt 100vw breedte en plaatst een witte overlay-card met
afgeronde hoek + schaduw over de afbeelding. Veel Rijksoverheid-sites
gebruiken dit patroon.

**Voorstel**: tweede hero-variant of `hero-overlay.html` partial met
overlay-positionering en card-styling.

### 2.6 Reset niet te breed toepassen
Indien `_reset.css` of `style.css` `ul`/`ol`/`li` styling globaal reset:
**voorstel** om dat te beperken tot navigatie-componenten (`nav ul, nav ol`)
zodat content-pagina's niet hun eigen restore-CSS hoeven te schrijven.

### 2.7 Tile non-clickable variant
`.tile` is nu primair klikbaar (`.tile header h2 a::after { inset: 0 }`).
Voor introducerende info-blokjes (icoon + titel + body, niet klikbaar)
moet je het anchor weglaten en je krijgt geen pseudo-element overlap,
maar wel de aangrijpende styling van de andere tiles.

**Voorstel**: `.tile--static` of `.tile.is-static` modifier waarbij geen
anchor verwacht wordt — focus/hover staan dan uit. Project's
`.info-tile` zou daarop kunnen aansluiten.

### 2.8 `details`/`summary` chevron-styling
Theme's `summary::before { content: url(.../icon-chevron.svg) }` werkt
goed maar is niet bestand tegen relatieve URL-resolving in alle setups
(bv. wanneer style.css via `resources.Concat` wordt gebundled). De
absolute URL of een SVG-mask zou robuuster zijn.

**Voorstel**: `mask-image` met `currentcolor` zodat de chevron zich
aanpast aan tekstkleur en geen externe resource-resolving nodig heeft.

## 3. Bekende open issues

- [ ] Theme is nog in beweging (componenten worden hernoemd, css-bestanden
  toegevoegd/weggehaald). Project moet meebewegen; CSS-bundle in
  `head.html` gebruikt nu `with` per resource om robuust te zijn.
- [ ] Compat-shim `--mox-* → --toepassing-*` is functioneel maar maakt
  debuggen lastiger (twee namen voor hetzelfde token).
- [ ] `card.html` partial is uit het thema verdwenen; `tile.html` is de
  opvolger maar onze homepage gebruikt al direct `.tile` (geen partial).
