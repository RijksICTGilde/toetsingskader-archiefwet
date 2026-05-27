# hugo-theme-RO

Hugo-thema voor Rijksoverheid-sites, gebaseerd op het [NLDD design system](https://github.com/MinBZK/storybook).

## Snelstart voor een nieuwe site

Maak een minimale `hugo.yaml`:

```yaml
baseURL: https://example.rijksoverheid.nl/
title: Mijn RO-site
languageCode: nl
defaultContentLanguage: nl

module:
  imports:
    - path: github.com/RijksICTGilde/hugo-theme-ro

params:
  tagline: "Voor inwoners en bedrijven"
  footer:
    tagline: "Eén Overheid. Voor iedereen!"
    columns:
      primary_label: "Zie ook"
      secondary_label: "Over deze site"

menus:
  main:
    - { name: Home, pageRef: /, weight: 1 }
  footer-primary:
    - { name: Documentatie, pageRef: /docs, weight: 1 }
  footer-secondary:
    - { name: Privacy, pageRef: /privacy, weight: 1 }
```

Pull het thema en bouw:

```bash
hugo mod get -u github.com/RijksICTGilde/hugo-theme-ro
hugo server
```

## Lokale theme-development tegen een echte consumer

Tijdens v0.1 dev leeft het thema als subdirectory binnen
`toetsingskader-archiefwet` op branch `hugo-theme-rijksoverheid`.
Zie de README op die branch-root voor instructies.

Wanneer het thema is geëxtraheerd naar de eigen `hugo-theme-RO` repo
en je wil lokaal tegen een consumer werken:

```bash
# In je consumer-project:
git clone git@github.com:RijksICTGilde/hugo-theme-RO.git ../hugo-theme-RO-local
```

In `config/development/module.yaml` (let op: pas pad aan op je systeem
— Hugo accepteert geen relatieve paden vanaf 0.159):

```yaml
replacements:
  - "github.com/RijksICTGilde/hugo-theme-ro -> /absolute/path/to/hugo-theme-RO-local"
```

Of via env-var (bv. met direnv):

```bash
export HUGO_MODULE_REPLACEMENTS="github.com/RijksICTGilde/hugo-theme-ro -> $PWD/../hugo-theme-RO-local"
hugo server
```

`hugo server` (default `--environment development`) gebruikt de
replacement; `hugo --environment production` valt terug op de gepubliceerde
module-versie.

## Architectuur

- **NLDD CSS gevendor'd uit npm** naar `assets/css/nldd/`. Hugo Pipes
  (`resources.Concat`) bundelt het samen met theme-CSS in één
  gefingerprinted stylesheet via `_partials/head.html`.
- **Markdown-prose** wordt in templates gewrapt in `<nldd-rich-text>`.
  Geen Lit/JS-runtime nodig; we gebruiken alleen NLDD's CSS via
  element-selectors. Mermaid is een opt-in voor consumers die zelf
  mermaid.js laden.
- **Layouts/components** geënt op moza-site's UX, hertaald naar
  NLDD-tokens (`--primitives-*`, `--semantics-*`, `--components-*`).

Volledige ontwerpdocumentatie:
[hugo-theme-RO/docs/superpowers/specs/2026-05-27-hugo-theme-ro-design.md](https://github.com/RijksICTGilde/hugo-theme-RO/blob/main/docs/superpowers/specs/2026-05-27-hugo-theme-ro-design.md)

## Components

Voor visuele documentatie van alle components, start Storybook:

```bash
npm install
npm run storybook   # opens at http://localhost:6006
```

Beschikbare components in v0.1:

| Component | Doel |
|---|---|
| `.card` (+`--accent-border`, `--subtle`) | Klikbare tegel in een raster |
| `.card-grid` | Responsive grid wrapper |
| `.box` (+`--subtle`, `--accent`) | Niet-klikbare content-container |
| `.callout` (+`--info`/`--warning`/`--success`/`--danger`) | Type-meaning info-block |
| `.button` (+`--outline`, `--ghost`, `--link`) | Knoppen |
| `.header`, `.footer` | Site-shell |
| `.breadcrumbs` | Kruimelpad |
| `.skip-link` | A11y skip-nav |
| Utilities | `.visually-hidden`, `.section-heading--underline` |

## Per-page frontmatter (optional)

```yaml
---
title: ""
description: ""
weight: 0

toc: true | false           # v0.2
breadcrumbs: false          # disable for specific page

og_image: "images/og/x.png"
noindex: false
---
```

## Development

```bash
npm install
npm run vendor:nldd    # update gevendor'de NLDD assets
npm run storybook      # component-docs op :6006
npm run build-storybook
```

## NLDD updates

Wekelijks draait een GitHub Actions workflow (`.github/workflows/vendor-nldd.yaml`
op branch-root tijdens dev) en opent een PR met de nieuwste
`@nldd/design-system` versie. Review de diff in `assets/css/nldd/`
voordat je merget.

## Hugo version

Vereist Hugo ≥ 0.146 (unified template lookup).

## Licentie

[EUPL v1.2](LICENSE)
