# Ontwerp: statische PDF-export per norm en voor het hele kader

**Datum:** 2026-06-24
**Branch:** `feat/pdf-export`
**Status:** ontwerp ter review

## Doel

Bezoekers kunnen een PDF downloaden (a) per normpagina en (b) van het hele
toetsingskader. De PDF is *statisch*: er worden geen antwoorden ingevuld (anders
dan bij `par-dpia-form` / `ai-verordening-beslishulp`). Elke PDF draagt het
**versienummer (release-tag)** en de **datum van downloaden**.

Inspiratie komt van de twee genoemde projecten: beide gebruiken **pdfMake**
(client-side JS) met ingebedde Rijksoverheid-fonts, een doc-definition, een
disclaimer-blok, en versie + tijdstempel in de PDF. Die aanpak nemen we over,
aangepast aan een Hugo static site (i.p.v. een Vue-SPA) met strikte CSP.

## Gekozen uitgangspunten (door gebruiker bevestigd)

- **Generatie:** client-side pdfMake, gebundeld via Hugo's asset-pipeline.
- **Stijl:** volle Rijkshuisstijl (logo, RO Sans-fonts, brand-accent `#007bc7`).
- **Versie:** git-tag, via build geïnjecteerd als Hugo-param (met fallback).
- **Inhoud per norm:** volledige normpagina inclusief voetnoten/bronnen.

## Architectuur — drie lagen

Spiegelt het bestaande `layouts/index.json`-zoekindexpatroon.

### 1. Datalaag (Hugo output-format `pdf`)

Nieuw output-format `pdf` met mediaType `application/json`.

- **Per norm** (`layouts/normen/single.pdf.json`): rendert de pagina als JSON:
  ```json
  {
    "kind": "norm",
    "titel": "Norm 1: Inbeheername",
    "norm_id": "1",
    "norm_titel": "Inbeheername",
    "kern_html": "<p>…</p>",
    "body_html": "<h2>Toelichting</h2>…",
    "url": "https://…/normen/01-beheer/",
    "versie": "v0.1.0"
  }
  ```
  `body_html` is de gerenderde `.Content` (zelfde transform als de pagina, dus
  voetnoten al verwerkt). De client converteert HTML → pdfMake-content.
- **Hele kader** (aggregaat, `layouts/normen/list.pdf.json` of op home):
  intro (`content/_index.md` of `normen/_index.md`) + array van alle 8 normen in
  `weight`-volgorde. Eén fetch levert alles voor de kader-PDF.

Geconfigureerd in `hugo.yaml` onder `outputFormats`, `mediaTypes` en
`outputs` (per kind: `normen`/`section`/`home` krijgen het `pdf`-format erbij,
net zoals `home` nu `JSON` heeft voor de zoekindex).

### 2. Renderlaag (client-side JS)

- `assets/js/pdf-export.js` — entrypoint. Vindt knoppen met `data-pdf-url`,
  fetcht de JSON, bouwt de pdfMake-doc-definition, triggert download.
- `assets/js/html-to-pdfmake.js` — kleine, geïsoleerde converter: neemt een
  HTML-string, parset met `DOMParser`, mapt elementen (`h2..h4`, `p`, `ul/ol/li`,
  `blockquote.callout`, `a`, `strong/em`, voetnoot-/referentieblok) → pdfMake
  `Content`. Eén verantwoordelijkheid, los te begrijpen en te testen.
- `assets/js/pdf-assets.js` — RO Sans-fonts (regular/bold/italic, hergebruikt
  uit de referentieprojecten) en RO-logo als base64, plus pdfMake-vfs/fontmap.
  `bolditalics` mapt op `bold` (geen vierde TTF beschikbaar).

Bundelen via Hugo `js.Build` (esbuild, ingebouwd) → één `/js/pdf-export.js`
als `'self'`-script. pdfMake komt als npm-loze vendored build of via
`hugo mod`/`assets` — concreet in het plan; voorkeur: vendored pdfMake-bestand
in `assets/lib/` zodat er geen Node-buildstap in CI nodig is (zoals het thema
Fuse.js vendort onder `assets/lib/fuse`).

### 3. UI

- `layouts/normen/single.html`: "Download als PDF"-knop in de `<header>`,
  naast de TOC-toggle. `data-pdf-url="{{ .OutputFormats.Get "pdf").RelPermalink }}"`.
- Normen-index (`layouts/normen/list.html` of home): "Download volledig kader
  (PDF)"-knop met de aggregaat-URL.
- Styling via thema-`.button`-class waar mogelijk; minimale eigen CSS in
  `assets/css/main.css` indien nodig.
- Script alleen laden op pagina's met een knop.

## PDF-opmaak (volle Rijkshuisstijl)

Overgenomen van de referentieprojecten:

- Kop: RO-logo (gecentreerd), documenttitel.
- RO Sans-fonts; brand-accent `#007bc7` voor koppen/lijnen.
- Kern-callout, dan koppenhiërarchie (Toelichting, Normuitleg met
  voorschrift/criteria/indicatoren, Reikwijdte, Zie ook).
- Voetnoten/bronnen als genummerde lijst achteraan (uit het referentieblok).
- Disclaimer-blok ("Belangrijke informatie") zoals de referentieprojecten.
- Footer op elke pagina: **versie (release-tag)** · **downloaddatum**
  (`Intl.DateTimeFormat('nl-NL', …)`) · bron-URL · paginanummering.
- PDF-metadata: title, subject = `Versie: <tag>`.

## Versie (release-tag) injectie

- Nieuwe `params.versie` in `hugo.yaml` (één bron van waarheid).
- De page-banner ("Dit is versie 0.8 …") leest voortaan dezelfde param i.p.v.
  een hardcode — voorkomt divergentie.
- CI (`.github/workflows/test.yml` build-stap en de deploy-build) zet
  `HUGO_PARAMS_VERSIE="$(git describe --tags --always)"` vóór `hugo`.
  - **Fallback:** de repo heeft nog geen tags; `--always` geeft dan een korte
    commit-hash i.p.v. een fatal. De Hugo-param houdt een leesbare default
    (bv. `"0.8"`) zodat een lokale build zonder env ook werkt.
- De `pdf.json`-templates en de page-banner gebruiken `site.Params.versie`.

## CSP

Geen wijziging aan `container/nginx.conf` nodig:

- Bundled script is `'self'` (huidige CSP staat `script-src` toe via
  `default-src 'self'`); geen inline script/style.
- Fonts en logo zitten als base64 *in* de JS (pdfMake-vfs), dus geen externe
  `font-src`/`img-src`.
- pdfMake draait zonder web-worker (worker zou `blob:`-worker-src eisen, wat de
  CSP blokkeert) — expliciet de niet-worker-codepad gebruiken.
- Blob-download via `URL.createObjectURL` + `<a download>` valt niet onder de
  CSP-fetch-directives en werkt onder `default-src 'self'`.
- **Verificatie:** na implementatie download testen op een PR-preview/in de
  container met de echte CSP-header, niet alleen `hugo server`.

## Componenten (units)

| Unit | Bestand | Verantwoordelijkheid |
|------|---------|----------------------|
| Norm-data | `layouts/normen/single.pdf.json` | Eén norm → JSON |
| Kader-data | `layouts/normen/list.pdf.json` (of home) | Intro + 8 normen → JSON |
| Converter | `assets/js/html-to-pdfmake.js` | HTML-string → pdfMake-content |
| Assets | `assets/js/pdf-assets.js` | base64-fonts/logo + vfs/fontmap |
| Export | `assets/js/pdf-export.js` | knop → fetch → doc-def → download |
| pdfMake | `assets/lib/pdfmake/…` | vendored library |
| UI/knop | `layouts/normen/single.html`, list/home | knoppen met `data-pdf-url` |
| Config | `hugo.yaml` | output-formats, mediaType, `params.versie` |
| CI | `.github/workflows/*` | git-tag → `HUGO_PARAMS_VERSIE` |

## Testen / verificatie

Het project heeft nu **geen** JS-testinfra (alleen Python `unittest` +
pre-commit + `htmltest`). We voegen geen Node-toolchain toe als dat niet hoeft.

- **Build:** `just build` moet slagen met de nieuwe output-formats.
- **Visueel (projectconventie):** download en open de PDF voor home/over/één
  norm + de kader-PDF; controleer logo, fonts, koppen, voetnoten, footer met
  versie + datum.
- **CSP-smoke:** test download in de container met echte CSP-header.
- **Converter:** klein en defensief houden (onbekende elementen → platte tekst);
  optioneel later een losse Node-smoketest, niet in CI v1 (YAGNI).
- `validate-norms.py` en bestaande tests blijven groen (geen contentwijziging).

## Out of scope

- Antwoorden/formulier-invoer (bewust statisch).
- Server-side/build-time PDF-rendering (datum moet downloaddatum zijn).
- JS-unit-testharness in CI (kan later).
- Vertaling/meertaligheid.

## Open punten voor het plan

1. pdfMake leveren: vendored bestand in `assets/lib/` vs. `hugo mod`/npm —
   voorkeur vendored (geen CI-Node).
2. Aggregaat-data op `normen`-sectie vs. home — voorkeur sectie (`list.pdf.json`).
3. Exacte fontnamen/licentienotitie bij het hergebruiken van de RO-TTF's.
