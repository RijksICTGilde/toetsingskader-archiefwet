# hugo-theme-RO

Hugo-thema voor Rijksoverheid-sites, gebaseerd op het
[moza-site](https://github.com/RijksICTGilde/moza-site) design system.
Levert layout, components en design-tokens; consumer-sites brengen hun
eigen content + project-specifieke styling mee.

## Snelstart

`hugo.yaml`:

```yaml
baseURL: https://example.rijksoverheid.nl/
title: Mijn RO-site
locale: nl
defaultContentLanguage: nl
enableGitInfo: true

module:
  imports:
    - path: github.com/RijksICTGilde/hugo-theme-ro

menus:
  main:
    - { name: Home, pageRef: /, weight: 1 }

params:
  tagline: "Korte tagline onder de banner"
  footer:
    tagline: "Eén Overheid. Voor iedereen!"
  search:
    enable: true
    priority_sections: []   # optioneel: ['blogs', 'docs'] etc.
```

Bouw:

```bash
hugo mod get -u github.com/RijksICTGilde/hugo-theme-ro
hugo server
```

Vereist Hugo ≥ 0.162 (AVIF image-encoding, `locale` config-key).

## Lokale theme-ontwikkeling

Voor parallelle ontwikkeling aan thema + site:

```bash
# In je consumer-project:
git clone git@github.com:RijksICTGilde/hugo-theme-RO.git ../hugo-theme-RO-local
```

In `config/development/module.yaml` (absolute pad sinds Hugo 0.159):

```yaml
replacements:
  - "github.com/RijksICTGilde/hugo-theme-ro -> /absolute/path/to/hugo-theme-RO-local"
```

Of via env-var (bv. met direnv):

```bash
export HUGO_MODULE_REPLACEMENTS="github.com/RijksICTGilde/hugo-theme-ro -> $PWD/../hugo-theme-RO-local"
hugo server
```

## Architectuur

- **CSS-pipeline**: tokens.css → fonts.css → base.css → layout.css →
  `components/*.css` glob → consumer's `assets/css/*.css` (excl.
  theme-namen). Eén gefingerprinte stylesheet via `_partials/head.html`.
- **Design tokens** in `assets/css/tokens.css` — `--color-*`, `--font-*`,
  `--content-max-width`, `--radius-*`. Consumers overrulen op `:root`-
  niveau (bv. `--color-primary`, `--color-banner`).
- **JS-bundle**: `base.js` + `toc.js` + Fuse + `search.js` concatenated
  + fingerprinted via `_partials/scripts.html`.
- **Image processing**: AVIF + WebP via `resources.Resize`, served via
  `<picture>` met AVIF-source en WebP-fallback in `<img>`.

## Components

| Component | Doel |
|---|---|
| `.card-grid` (+ `.boxed`, `.clickable`, `.columns-2`) | Responsive grid + opt-in border/click/columns |
| `.box` (+ `.box--info` enz.) | Niet-klikbare content-container, semantische varianten |
| `blockquote.callout` (+ `.muted`/`.warning`/`.success`/`.danger`, `.corner-*`) | Info-block met header + content; via `{{< callout titel="..." >}}` shortcode |
| `.references` (+ inline `.ref-tooltip`) | Footnote-accordeon onderaan + inline tooltip-markers; opt-in via `show_referenties` frontmatter |
| `.button` (+ `.button-outline`, `.button-ghost`) | Knoppen |
| `.search-modal` | Fuzzy site-search via Fuse.js; sectie-priority via `params.search.priority_sections` |
| `.page-banner` (+ `.page-banner--warning`/`--info`) | Site-wide melding bovenaan via `params.page_banner` |
| `.page-nav` | Prev/next binnen reeks; opt-in via `prev_next: true` op section `_index.md` |
| `.breadcrumb`, `.toc` | Standaard breadcrumbs + sticky TOC |
| Header / Footer | Site-shell met `--color-banner` token (default `--color-rijksblauw`) |

Externe links: gebruik partial `render-link.html` (autodetect external/
private/internal) zodat `rel="external"` + icon consistent zijn.

## Shortcodes

| Shortcode | Doel |
|---|---|
| `{{< callout titel="..." variant="muted\|warning\|success\|danger" corner="..." >}}body{{< /callout >}}` | Info-block |
| `{{< tiles columns="2\|3" aria="..." field="tiles" >}}` | Card-grid uit `params.tiles` frontmatter |
| `{{< card-grid section="..." >}}` | Card-grid van pages in een section |

## Per-page frontmatter

```yaml
---
title: ""
description: ""
weight: 0                   # sort-volgorde binnen section
prev_next: true             # in section _index.md: enable prev/next-nav
manual_layout: true         # in section _index.md: body bepaalt layout (geen auto-cards)
show_lastmod: true          # toon "laatst aangepast" footer
show_referenties: true      # render referenties-accordeon (vereist .Params.referenties)
cascade:                    # propageer params naar alle descendants
  show_lastmod: true
toc: false                  # disable auto-TOC voor deze pagina
---
```

## Licentie

[EUPL v1.2](LICENSE)
