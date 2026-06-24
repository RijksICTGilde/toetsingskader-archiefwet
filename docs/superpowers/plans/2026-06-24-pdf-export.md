# PDF-export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bezoekers kunnen een statische, Rijkshuisstijl-PDF downloaden per normpagina en van het hele kader, met release-tag en downloaddatum.

**Architecture:** Hugo `pdf`-output-format levert per pagina (en als aggregaat) JSON met gerenderde HTML. Een client-side bundel (vendored pdfMake 0.2.x + eigen converter) zet die HTML om naar een pdfMake-doc-definition en triggert de download. Mirrors het `index.json`-zoekindex- en `lib/fuse`-vendor-patroon van het thema.

**Tech Stack:** Hugo (output formats, `resources.Concat`), vendored pdfMake 0.2.18 (UMD global `pdfmake`), Rijksoverheid Sans TTF + RO-logo als base64-vfs, vanilla JS (geen build-step in CI), Node alleen lokaal voor asset-generatie + converter-tests.

---

## Toolchain-prerequisite (eenmalig, lokaal)

De build heeft `go` nodig om de theme-module op te halen (CI heeft dit; lokaal in deze
omgeving niet standaard). Installeer eenmalig en re-vendor:

```bash
curl -fsSL https://go.dev/dl/go1.26.3.linux-arm64.tar.gz -o /tmp/go.tgz
tar -C "$HOME/.local" -xzf /tmp/go.tgz
export PATH=$PATH:$HOME/.local/go/bin GOFLAGS=-mod=mod
rm -rf _vendor && hugo mod vendor       # haalt hugo-theme-rijksoverheid v0.1.0
hugo --environment production --quiet    # moet 14 HTML-bestanden opleveren
```

`_vendor/` is untracked (niet committen). Node/npm zijn lokaal aanwezig.

---

## File Structure

| Bestand | Verantwoordelijkheid |
|---------|----------------------|
| `assets/lib/pdfmake/pdfmake.min.js` | Vendored pdfMake 0.2.18 (UMD global `pdfmake`) |
| `assets/fonts/ro-sans-{regular,bold,italic}.ttf` | RO Sans TTF (provenance, bron voor base64) |
| `assets/images/ro-logo.png` | RO-logo (bron voor base64) |
| `scripts/build-pdf-assets.mjs` | Genereert `pdf-assets.js` (base64) uit fonts+logo |
| `assets/js/pdf-assets.js` | Gegenereerd: vfs (fonts+logo base64) + pdfMake-fontmap |
| `assets/js/html-to-pdfmake.js` | HTML-string → pdfMake-content (geïsoleerd, getest) |
| `assets/js/pdf-export.js` | Knop→fetch JSON→doc-def→download; disclaimer/footer/versie/datum |
| `tests/js/html-to-pdfmake.test.mjs` | Node-test voor de converter |
| `layouts/_partials/pdf-scripts.html` | Concat pdfMake+assets+converter+export → één `<script>` |
| `layouts/normen/single.pdf.json` | Per-norm data-endpoint |
| `layouts/_default/list.pdf.json` | Kader-aggregaat (intro + 8 normen) |
| `layouts/normen/single.html` | "Download als PDF"-knop + script (MODIFY) |
| `layouts/shortcodes/pdf-kader.html` | "Download volledig kader"-knop + script |
| `content/normen/_index.md` | Plaats de `pdf-kader`-shortcode (MODIFY) |
| `assets/css/main.css` | `.pdf-download`-knopstyling (MODIFY) |
| `hugo.yaml` | output-formats, mediaType, `params.versie`, outputs (MODIFY) |
| `.github/workflows/test.yml` + deploy build | git-tag → `HUGO_PARAMS_VERSIE` (MODIFY) |

---

## Task 1: Vendor pdfMake + Rijkshuisstijl-assets

**Files:**
- Create: `assets/lib/pdfmake/pdfmake.min.js`, `assets/fonts/ro-sans-{regular,bold,italic}.ttf`, `assets/images/ro-logo.png`, `assets/lib/pdfmake/LICENSE`

- [ ] **Step 1: Kopieer vendored assets uit de referentieprojecten**

```bash
cd /home/claude/projects/toetsingskader-archiefwet
REF=/home/claude/projects/ai-verordening-beslishulp/frontend
mkdir -p assets/lib/pdfmake assets/fonts
cp "$REF/node_modules/pdfmake/build/pdfmake.min.js" assets/lib/pdfmake/pdfmake.min.js
cp "$REF/node_modules/pdfmake/LICENSE" assets/lib/pdfmake/LICENSE 2>/dev/null || true
cp "$REF/src/assets/fonts/rijksoverheidsanstext-regular-webfont.ttf" assets/fonts/ro-sans-regular.ttf
cp "$REF/src/assets/fonts/rijksoverheidsanstext-bold-webfont.ttf"    assets/fonts/ro-sans-bold.ttf
cp "$REF/src/assets/fonts/rijksoverheidsanstext-italic-webfont.ttf"  assets/fonts/ro-sans-italic.ttf
cp "$REF/src/assets/images/RO_Logo_pres_pos_nl.png" assets/images/ro-logo.png
```

- [ ] **Step 2: Verifieer global naam**

Run: `head -c 80 assets/lib/pdfmake/pdfmake.min.js`
Expected: bevat `pdfmake v0.2.18` — UMD exposeert `window.pdfMake`.

- [ ] **Step 3: Commit**

```bash
git add assets/lib/pdfmake assets/fonts assets/images/ro-logo.png
git commit -m "feat(pdf): vendor pdfMake en Rijkshuisstijl-assets"
```

---

## Task 2: Genereer pdf-assets.js (base64-vfs)

**Files:**
- Create: `scripts/build-pdf-assets.mjs`, `assets/js/pdf-assets.js` (gegenereerd)

- [ ] **Step 1: Schrijf de generator**

`scripts/build-pdf-assets.mjs`:

```js
// Genereert assets/js/pdf-assets.js: base64-vfs (RO Sans fonts + logo) en de
// pdfMake-fontmap. Re-run alleen als fonts/logo wijzigen:  node scripts/build-pdf-assets.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (p) => readFileSync(join(root, p)).toString('base64')

const vfs = {
  'ro-sans-regular.ttf': b64('assets/fonts/ro-sans-regular.ttf'),
  'ro-sans-bold.ttf':    b64('assets/fonts/ro-sans-bold.ttf'),
  'ro-sans-italic.ttf':  b64('assets/fonts/ro-sans-italic.ttf'),
  'ro-logo.png':         b64('assets/images/ro-logo.png'),
}

const out = `// GEGENEREERD door scripts/build-pdf-assets.mjs — niet handmatig bewerken.
export const PDF_VFS = ${JSON.stringify(vfs)};
export const PDF_FONTS = {
  ROSans: {
    normal: 'ro-sans-regular.ttf',
    bold: 'ro-sans-bold.ttf',
    italics: 'ro-sans-italic.ttf',
    bolditalics: 'ro-sans-bold.ttf'
  }
};
export const PDF_LOGO = 'data:image/png;base64,' + PDF_VFS['ro-logo.png'];
`
writeFileSync(join(root, 'assets/js/pdf-assets.js'), out)
console.log('pdf-assets.js geschreven')
```

- [ ] **Step 2: Genereer en verifieer**

Run: `node scripts/build-pdf-assets.mjs && node -e "import('./assets/js/pdf-assets.js').then(m=>console.log(Object.keys(m.PDF_VFS), m.PDF_FONTS.ROSans.normal))"`
Expected: `[ 'ro-sans-regular.ttf', ... 'ro-logo.png' ] ro-sans-regular.ttf`

- [ ] **Step 3: Commit**

```bash
git add scripts/build-pdf-assets.mjs assets/js/pdf-assets.js
git commit -m "feat(pdf): genereer base64-vfs met fonts en logo"
```

Let op: `pdf-assets.js` gebruikt ES-`export`. De Concat-bundel laadt als één
`<script>`; daarom gebruiken alle `assets/js/*.js` géén ES-modules maar zetten
globals op `window.TKPDF` (zie volgende taken). **Pas de generator-output aan**
naar globals i.p.v. `export` zodra dat patroon vaststaat (Task 4 beslist). →
Definitief: generator schrijft `window.TKPDF = Object.assign(window.TKPDF||{}, {PDF_VFS, PDF_FONTS, PDF_LOGO})`.

---

## Task 3: HTML→pdfMake-converter (met Node-test)

**Files:**
- Create: `assets/js/html-to-pdfmake.js`, `tests/js/html-to-pdfmake.test.mjs`

De converter is framework-loos en parst met een DOM. In de browser bestaat
`DOMParser`; in de Node-test injecteren we een `document`-parse via een kleine
DOM (linkedom). Daarom neemt de converter een **root-Element** als input (niet
een string) zodat hij in beide omgevingen werkt.

- [ ] **Step 1: Schrijf de falende test**

`tests/js/html-to-pdfmake.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHTML } from 'linkedom'
import { elementToPdfContent } from '../../assets/js/html-to-pdfmake.js'

function convert(html) {
  const { document } = parseHTML(`<body>${html}</body>`)
  return elementToPdfContent(document.body)
}

test('h2 wordt header-stijl', () => {
  const out = convert('<h2>Toelichting</h2>')
  assert.equal(out[0].text, 'Toelichting')
  assert.equal(out[0].style, 'h2')
})

test('paragraaf met bold en italic', () => {
  const out = convert('<p>Een <strong>vet</strong> en <em>schuin</em> woord.</p>')
  assert.equal(out[0].style, 'para')
  assert.ok(Array.isArray(out[0].text))
  assert.deepEqual(out[0].text[1], { text: 'vet', bold: true })
  assert.deepEqual(out[0].text[3], { text: 'schuin', italics: true })
})

test('ongeordende lijst', () => {
  const out = convert('<ul><li>een</li><li>twee</li></ul>')
  assert.deepEqual(out[0].ul.map(li => li.text ?? li), ['een', 'twee'])
})

test('link behoudt href', () => {
  const out = convert('<p><a href="https://x.nl">bron</a></p>')
  assert.deepEqual(out[0].text[0], { text: 'bron', link: 'https://x.nl', color: '#007bc7', decoration: 'underline' })
})

test('onbekend element valt terug op platte tekst', () => {
  const out = convert('<figure>rare inhoud</figure>')
  assert.equal(out[0].text, 'rare inhoud')
})
```

- [ ] **Step 2: Test faalt (module ontbreekt)**

Run: `npm i -D linkedom >/dev/null 2>&1; node --test tests/js/html-to-pdfmake.test.mjs`
Expected: FAIL — `Cannot find module .../html-to-pdfmake.js`.

(Installeer `linkedom` lokaal als devDependency; het is **niet** nodig in CI of
in de browserbundel. Voeg een minimale `package.json` toe als die ontbreekt.)

- [ ] **Step 3: Schrijf de converter**

`assets/js/html-to-pdfmake.js`:

```js
// HTML → pdfMake-content. Input: een DOM-Element (browser: DOMParser; test: linkedom).
// Defensief: onbekende elementen → platte tekst. Geen externe afhankelijkheden.
const BRAND = '#007bc7'

function inlineRuns(node, acc = [], style = {}) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const t = child.textContent
      if (t) acc.push({ text: t, ...style })
    } else if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase()
      if (tag === 'strong' || tag === 'b') inlineRuns(child, acc, { ...style, bold: true })
      else if (tag === 'em' || tag === 'i') inlineRuns(child, acc, { ...style, italics: true })
      else if (tag === 'a') acc.push({ text: child.textContent, link: child.getAttribute('href') || '', color: BRAND, decoration: 'underline' })
      else inlineRuns(child, acc, style)
    }
  }
  return acc
}

function inline(node) {
  const runs = inlineRuns(node)
  if (runs.length === 0) return ''
  if (runs.length === 1 && !runs[0].link && !runs[0].bold && !runs[0].italics) return runs[0].text
  return runs
}

function listItems(node) {
  return [...node.children].filter(c => c.tagName.toLowerCase() === 'li')
    .map(li => ({ text: inline(li) }))
}

export function elementToPdfContent(root) {
  const out = []
  for (const el of root.children) {
    const tag = el.tagName.toLowerCase()
    if (/^h[1-6]$/.test(tag)) out.push({ text: el.textContent.trim(), style: tag })
    else if (tag === 'p') out.push({ text: inline(el), style: 'para' })
    else if (tag === 'ul') out.push({ ul: listItems(el), style: 'list' })
    else if (tag === 'ol') out.push({ ol: listItems(el), style: 'list' })
    else if (tag === 'blockquote') out.push({ text: inline(el), style: 'callout', margin: [8, 4, 0, 8] })
    else if (tag === 'hr') out.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 6, 0, 6] })
    else if (['section', 'div', 'article', 'header', 'details'].includes(tag)) out.push(...elementToPdfContent(el))
    else out.push({ text: el.textContent.trim() })
  }
  return out
}

if (typeof window !== 'undefined') {
  window.TKPDF = Object.assign(window.TKPDF || {}, { elementToPdfContent })
}
```

- [ ] **Step 4: Test slaagt**

Run: `node --test tests/js/html-to-pdfmake.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add assets/js/html-to-pdfmake.js tests/js/html-to-pdfmake.test.mjs package.json
git commit -m "feat(pdf): HTML naar pdfMake-converter met tests"
```

---

## Task 4: Data-endpoints (Hugo output-format `pdf`)

**Files:**
- Modify: `hugo.yaml`
- Create: `layouts/normen/single.pdf.json`, `layouts/_default/list.pdf.json`

- [ ] **Step 1: Registreer het output-format in `hugo.yaml`**

Voeg toe (naast bestaande `outputs`/`markup`):

```yaml
mediaTypes:
  application/pdfdata+json:
    suffixes: ["pdf.json"]

outputFormats:
  pdf:
    mediaType: application/pdfdata+json
    baseName: index
    isPlainText: true
    notAlternative: true

outputs:
  home:
    - HTML
    - RSS
    - JSON
  page:
    - HTML
    - pdf
  section:
    - HTML
    - pdf
```

- [ ] **Step 2: Per-norm data-template**

`layouts/normen/single.pdf.json`:

```go-html-template
{{- /* Per-norm PDF-data. Hergebruikt dezelfde .Content als de pagina. */ -}}
{{- $kern := "" -}}
{{- with .Params.kern }}{{ $kern = . | markdownify }}{{ end -}}
{{- dict
  "kind" "norm"
  "titel" (printf "Norm %s: %s" (string .Params.norm_id) .Params.norm_titel)
  "norm_id" (string .Params.norm_id)
  "norm_titel" .Params.norm_titel
  "kern_html" $kern
  "body_html" .Content
  "url" .Permalink
  "versie" (site.Params.versie | default "")
  | jsonify (dict "indent" "") -}}
```

- [ ] **Step 3: Kader-aggregaat-template**

`layouts/_default/list.pdf.json` (gebruikt door de `normen`-sectie):

```go-html-template
{{- /* Kader-aggregaat: intro + alle normen op weight-volgorde. */ -}}
{{- $normen := where (where site.RegularPages "Section" "normen") "Params.norm_id" "!=" nil -}}
{{- $normen = sort $normen "Weight" -}}
{{- $items := slice -}}
{{- range $normen -}}
  {{- $kern := "" -}}{{- with .Params.kern }}{{ $kern = . | markdownify }}{{ end -}}
  {{- $items = $items | append (dict
      "titel" (printf "Norm %s: %s" (string .Params.norm_id) .Params.norm_titel)
      "norm_id" (string .Params.norm_id)
      "kern_html" $kern
      "body_html" .Content) -}}
{{- end -}}
{{- dict
  "kind" "kader"
  "titel" "Toetsingskader Archiefwet 2026"
  "intro_html" (.Title | string | printf "<h2>%s</h2>" | safeHTML)
  "url" .Permalink
  "versie" (site.Params.versie | default "")
  "normen" $items
  | jsonify (dict "indent" "") -}}
```

- [ ] **Step 4: Build en verifieer de endpoints**

Run:
```bash
export PATH=$PATH:$HOME/.local/go/bin
hugo --environment production --quiet
test -f public/normen/01-beheer/index.pdf.json && echo "norm-json OK"
test -f public/normen/index.pdf.json && echo "kader-json OK"
node -e "const d=require('./public/normen/01-beheer/index.pdf.json');console.log(d.titel, d.body_html.length>0)"
node -e "const d=require('./public/normen/index.pdf.json');console.log(d.kind, d.normen.length)"
```
Expected: `norm-json OK`, `kader-json OK`, `Norm 1: Inbeheername true`, `kader 8`.

Als `over.md` (top-level `page`) een lege/ongewenste `index.pdf.json` genereert
of Hugo waarschuwt over een ontbrekende layout: maak `layouts/_default/single.pdf.json`
die `{}` rendert wanneer `.Params.norm_id` ontbreekt:
```go-html-template
{{- if .Params.norm_id -}}{{ /* zelfde als normen/single.pdf.json */ }}{{- else -}}{}{{- end -}}
```
(Verifieer met `ls public/over/`.)

- [ ] **Step 5: Commit**

```bash
git add hugo.yaml layouts/normen/single.pdf.json layouts/_default/list.pdf.json layouts/_default/single.pdf.json 2>/dev/null
git commit -m "feat(pdf): JSON data-endpoints per norm en voor het kader"
```

---

## Task 5: PDF-builder (pdf-export.js)

**Files:**
- Create: `assets/js/pdf-export.js`

Gebruikt globals `window.pdfMake` (vendored) en `window.TKPDF`
(`elementToPdfContent`, `PDF_VFS`, `PDF_FONTS`, `PDF_LOGO`). pdfMake 0.2.x-API:
`pdfMake.vfs`, `pdfMake.fonts`, `pdfMake.createPdf(dd).download(name)`.

- [ ] **Step 1: Schrijf de builder**

`assets/js/pdf-export.js`:

```js
// Statische PDF-export. Knoppen met data-pdf-url leveren de JSON-data.
(function () {
  const BRAND = '#007bc7'
  const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  const styles = {
    title:   { fontSize: 24, bold: true, color: BRAND, margin: [0, 0, 0, 6] },
    meta:    { fontSize: 10, color: '#666666' },
    h2:      { fontSize: 16, bold: true, color: BRAND, margin: [0, 14, 0, 6] },
    h3:      { fontSize: 13, bold: true, margin: [0, 10, 0, 4] },
    h4:      { fontSize: 11, bold: true, margin: [0, 8, 0, 2] },
    para:    { fontSize: 10.5, margin: [0, 0, 0, 6], lineHeight: 1.25 },
    list:    { fontSize: 10.5, margin: [8, 0, 0, 6] },
    callout: { fontSize: 11, italics: true, color: '#154273', margin: [0, 4, 0, 10] },
    kern:    { fontSize: 11, bold: true, margin: [0, 0, 0, 10] },
    section: { fontSize: 14, bold: true, color: BRAND, margin: [0, 18, 0, 8] },
    disclaimerH: { fontSize: 13, bold: true, color: BRAND, margin: [0, 0, 0, 6] }
  }

  const DISCLAIMER = [
    'Dit is een automatisch gegenereerd document op basis van de online versie van het toetsingskader.',
    'De inhoud is in ontwikkeling en kan wijzigen; raadpleeg voor de actuele tekst altijd de website.',
    'Aan dit document kunnen geen rechten worden ontleend.'
  ]

  function parse(html) {
    const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html')
    return window.TKPDF.elementToPdfContent(doc.body)
  }

  function header(data) {
    return {
      stack: [
        { text: data.titel, style: 'title' },
        { text: [
            { text: 'Versie: ' }, { text: data.versie || 'onbekend', bold: true },
            { text: '   ·   Gedownload op ' }, { text: dateFmt.format(new Date()) }
          ], style: 'meta' },
        { text: [ { text: 'Bron: ' }, { text: data.url, link: data.url, color: BRAND, decoration: 'underline' } ], style: 'meta', margin: [0, 2, 0, 0] }
      ],
      margin: [0, 0, 0, 14]
    }
  }

  function disclaimer() {
    return [
      { text: 'Belangrijke informatie', style: 'disclaimerH', margin: [0, 18, 0, 6] },
      { ul: DISCLAIMER, fontSize: 9.5, color: '#444444' }
    ]
  }

  function normSection(n, withTitle) {
    const blocks = []
    if (withTitle) blocks.push({ text: n.titel, style: 'section', pageBreak: 'before' })
    if (n.kern_html) {
      blocks.push({ text: 'Kern van de norm', style: 'h4', margin: [0, 0, 0, 2] })
      blocks.push(...parse(n.kern_html).map(b => (b.style = b.style === 'para' ? 'kern' : b.style, b)))
    }
    blocks.push(...parse(n.body_html))
    return blocks
  }

  function buildNorm(data) {
    return { content: [ header(data), ...normSection(data, false), ...disclaimer() ] }
  }

  function buildKader(data) {
    const content = [ header(data) ]
    if (data.intro_html) content.push(...parse(data.intro_html))
    data.normen.forEach((n, i) => content.push(...normSection(n, true)))
    content.push(...disclaimer())
    return { content }
  }

  function docDefinition(data) {
    const base = data.kind === 'kader' ? buildKader(data) : buildNorm(data)
    return Object.assign(base, {
      pageSize: 'A4',
      pageMargins: [48, 64, 48, 56],
      defaultStyle: { font: 'ROSans', fontSize: 10.5, color: '#1a1a1a' },
      styles,
      info: { title: data.titel, author: 'Inspectie Overheidsinformatie en Erfgoed', subject: 'Versie: ' + (data.versie || '') },
      header: (cur) => cur === 1 ? { image: window.TKPDF.PDF_LOGO, width: 150, margin: [48, 18, 0, 0] } : null,
      footer: (cur, total) => ({
        columns: [
          { text: data.titel, fontSize: 8, color: '#999999', margin: [48, 0, 0, 0] },
          { text: 'Pagina ' + cur + ' van ' + total, alignment: 'right', fontSize: 8, color: '#999999', margin: [0, 0, 48, 0] }
        ]
      })
    })
  }

  function slugify(s) { return (s || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

  async function generate(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('PDF-data niet gevonden: ' + url)
    const data = await res.json()
    const pm = window.pdfMake
    pm.vfs = window.TKPDF.PDF_VFS
    pm.fonts = window.TKPDF.PDF_FONTS
    pm.createPdf(docDefinition(data)).download(slugify(data.titel) + '.pdf')
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pdf-url]')
    if (!btn) return
    e.preventDefault()
    btn.setAttribute('aria-busy', 'true')
    const original = btn.textContent
    btn.textContent = 'PDF wordt gemaakt…'
    generate(btn.getAttribute('data-pdf-url'))
      .catch((err) => { console.error(err); alert('Het maken van de PDF is mislukt. Probeer het later opnieuw.') })
      .finally(() => { btn.removeAttribute('aria-busy'); btn.textContent = original })
  })
})()
```

- [ ] **Step 2: Syntaxcheck**

Run: `node --check assets/js/pdf-export.js && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add assets/js/pdf-export.js
git commit -m "feat(pdf): client-side PDF-builder met Rijkshuisstijl, versie en datum"
```

---

## Task 6: Script-bundel + knoppen

**Files:**
- Create: `layouts/_partials/pdf-scripts.html`, `layouts/shortcodes/pdf-kader.html`
- Modify: `layouts/normen/single.html`, `content/normen/_index.md`, `assets/css/main.css`

- [ ] **Step 1: Bundel-partial** — `layouts/_partials/pdf-scripts.html`:

```go-html-template
{{- /* Eén 'self'-script: pdfMake + assets + converter + export. Mirror van het
       thema-Concat-patroon (lib/fuse). Alleen geladen op pagina's met een knop. */ -}}
{{- $pdfmake := resources.Get "lib/pdfmake/pdfmake.min.js" -}}
{{- $assets := resources.Get "js/pdf-assets.js" -}}
{{- $conv := resources.Get "js/html-to-pdfmake.js" -}}
{{- $export := resources.Get "js/pdf-export.js" -}}
{{- $bundle := slice $pdfmake $assets $conv $export | resources.Concat "js/pdf-bundle.js" | fingerprint "md5" -}}
<script src="{{ $bundle.RelPermalink }}"></script>
```

Let op: `html-to-pdfmake.js` mag in de bundel **geen** `export`-statement
bevatten (geen ES-module-context). Verwijder de `export` keyword-variant; de
browsertak zet alles op `window.TKPDF`. De Node-test importeert het bestand wél
als module — voeg daarom onderaan een conditional toe:
```js
export { elementToPdfContent }  // alleen relevant voor de Node-test; browser negeert via bundel
```
**Probleem:** een kale `export` breekt in een non-module `<script>`.
**Oplossing:** splits niet. Houd `html-to-pdfmake.js` vrij van `export`; de
Node-test importeert via een dunne wrapper `tests/js/_load.mjs` die het bestand
als tekst inleest en `elementToPdfContent` van een gefabriceerde `window`
plukt. Concreet (vervang Task 3 Step 1 import):

```js
// tests/js/_load.mjs
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
const src = readFileSync(new URL('../../assets/js/html-to-pdfmake.js', import.meta.url), 'utf8')
const sandbox = { window: {} }
vm.runInNewContext(src, sandbox)
export const elementToPdfContent = sandbox.window.TKPDF.elementToPdfContent
```
en in de test: `import { elementToPdfContent } from './_load.mjs'`. Zo blijft
`html-to-pdfmake.js` een gewoon non-module script (geen `export`), getest in Node.

- [ ] **Step 2: Per-norm knop in `layouts/normen/single.html`**

In de `<header>` van `<article class="norm">`, na de TOC-toggle, voeg toe:

```go-html-template
    <a class="pdf-download" href="{{ (.OutputFormats.Get "pdf").RelPermalink }}"
       data-pdf-url="{{ (.OutputFormats.Get "pdf").RelPermalink }}"
       download>
      {{- partial "icon.html" "download" | default "" -}}Download als PDF
    </a>
```

En vlak vóór `{{ end }}` (einde `main`-block) van `single.html`:

```go-html-template
{{ partial "pdf-scripts.html" . }}
```

(De `href` is een nette no-JS-fallback: de ruwe JSON. Met JS onderschept
`pdf-export.js` de klik en levert de PDF. `icon.html "download"` bestaat
mogelijk niet in het thema → dan tekstlabel only; verifieer en laat het icoon
weg als de partial faalt.)

- [ ] **Step 3: Kader-shortcode** — `layouts/shortcodes/pdf-kader.html`:

```go-html-template
{{- $pdf := (.Page.OutputFormats.Get "pdf") -}}
{{- with $pdf -}}
<p class="pdf-kader">
  <a class="pdf-download" href="{{ .RelPermalink }}" data-pdf-url="{{ .RelPermalink }}" download>
    Download het volledige kader als PDF
  </a>
</p>
{{ partial "pdf-scripts.html" $.Page }}
{{- end -}}
```

- [ ] **Step 4: Plaats de shortcode in `content/normen/_index.md`**

Voeg op een passende plek in de body toe: `{{< pdf-kader >}}`
(Verifieer eerst dat `content/normen/_index.md` bestaat; zo niet, maak hem met
front matter `title` + korte intro en de shortcode.)

- [ ] **Step 5: Knop-styling in `assets/css/main.css`**

```css
.pdf-download {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.45em 0.9em;
  font: inherit;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary, #007bc7);
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
}
.pdf-download:hover { filter: brightness(0.93); }
.pdf-download[aria-busy="true"] { opacity: 0.7; pointer-events: none; }
```

- [ ] **Step 6: Build + verifieer knop + bundel**

Run:
```bash
export PATH=$PATH:$HOME/.local/go/bin
hugo --environment production --quiet
grep -l 'pdf-bundle' public/normen/01-beheer/index.html && echo "norm-script OK"
grep -rl 'pdf-download' public/normen/01-beheer/index.html public/normen/index.html && echo "knoppen OK"
ls public/js/pdf-bundle.*.js && echo "bundel OK"
```
Expected: alle drie OK.

- [ ] **Step 7: Commit**

```bash
git add layouts/_partials/pdf-scripts.html layouts/shortcodes/pdf-kader.html layouts/normen/single.html content/normen/_index.md assets/css/main.css tests/js/_load.mjs
git commit -m "feat(pdf): downloadknoppen per norm en voor het kader + scriptbundel"
```

---

## Task 7: Versie (release-tag) als single source of truth

**Files:**
- Modify: `hugo.yaml`, `.github/workflows/test.yml` (en de deploy-build-stap)

- [ ] **Step 1: `params.versie` in `hugo.yaml`**

Onder `params:` toevoegen: `versie: "0.8"` (leesbare default).
Vervang in `params.page_banner.text` de hardcode "versie 0.8" door verwijzing:
zet de tekst zonder nummer en laat de partial het nummer injecteren, óf
eenvoudiger: laat de banner-tekst de param interpoleren is niet mogelijk in YAML
→ splits in `page_banner.text_prefix`/`versie`. **Minimale aanpak:** laat de
banner zoals hij is maar voeg `params.versie` toe als bron voor de PDF; noteer in
een comment dat beide met de hand gelijk gehouden worden. (De PDF is de nieuwe
consument; de banner-refactor is optioneel en kan in een vervolg-PR.)

- [ ] **Step 2: CI injecteert de git-tag**

In `.github/workflows/test.yml`, vóór de `hugo`-build-stap, env zetten:

```yaml
      - name: Bepaal versie uit git-tag
        run: echo "HUGO_PARAMS_VERSIE=$(git describe --tags --always)" >> "$GITHUB_ENV"
```

Zorg dat `actions/checkout` met `fetch-depth: 0` draait (tags beschikbaar).
Dezelfde env-stap toevoegen in de deploy-workflow (`zad.yml`) vóór de build.
Fallback: `--always` geeft een commit-hash als er nog geen tags zijn.

- [ ] **Step 3: Verifieer lokaal de override**

Run:
```bash
export PATH=$PATH:$HOME/.local/go/bin
HUGO_PARAMS_VERSIE="v0.1.0-test" hugo --environment production --quiet
node -e "console.log(require('./public/normen/01-beheer/index.pdf.json').versie)"
```
Expected: `v0.1.0-test`

- [ ] **Step 4: Commit**

```bash
git add hugo.yaml .github/workflows/test.yml .github/workflows/zad.yml 2>/dev/null
git commit -m "feat(pdf): release-tag als versiebron via build-env"
```

---

## Task 8: Verificatie (build, PDF visueel, CSP)

**Files:** geen (alleen verificatie)

- [ ] **Step 1: Pre-commit + validator + JS-test groen**

Run:
```bash
python3 scripts/validate-norms.py && echo "norms OK"
node --test tests/js/ && echo "js-test OK"
pre-commit run --all-files 2>&1 | tail -15 || true
```
Expected: norms OK, js-test OK, pre-commit zonder nieuwe fouten.

- [ ] **Step 2: Build levert alle endpoints**

Run:
```bash
export PATH=$PATH:$HOME/.local/go/bin
rm -rf public && hugo --environment production --minify --quiet
find public -name 'index.pdf.json' | wc -l   # >= 9 (8 normen + kader)
ls public/js/pdf-bundle.*.js
```
Expected: ≥ 9 json-endpoints + bundel aanwezig.

- [ ] **Step 3: Headless PDF-smoketest (Node + bundel)**

Render één norm-PDF buiten de browser om de doc-definition te valideren
(pdfMake draait in Node). Maak `tests/js/pdf-smoke.mjs` die `pdf-bundle.js`
inlaadt via `vm`, een gefakete `fetch`/`DOMParser` levert en
`createPdf(...).getBuffer()` aanroept; assert dat de buffer met `%PDF` begint.
(Indien `DOMParser` in Node ontbreekt: gebruik `linkedom` als shim binnen de vm-sandbox.)

Run: `node tests/js/pdf-smoke.mjs`
Expected: `PDF OK <bytes>` met buffer-start `%PDF`.

- [ ] **Step 4: CSP-smoke in de container**

Run (zoals productie, met echte CSP-header):
```bash
podman build -t tk-pdf -f container/Containerfile . && podman run --rm -p 8088:8080 tk-pdf &
sleep 2; curl -sI http://localhost:8088/ | grep -i content-security-policy
```
Open `http://localhost:8088/normen/01-beheer/` in een browser, klik "Download als
PDF", controleer dat de PDF downloadt **zonder** CSP-console-fouten (geen
inline-script/worker-blokkades). Controleer logo, RO-fonts, koppen, voetnoten,
footer met versie + downloaddatum. Herhaal voor de kader-PDF.

Indien een `blob:`/`worker-src`-CSP-fout verschijnt: voeg in
`container/nginx.conf` géén inline toe, maar sta in de CSP expliciet de
download-blob toe via `Content-Security-Policy: ...; worker-src 'self'` alleen
indien noodzakelijk. Eerst meten, dan pas aanpassen.

- [ ] **Step 5: Eindcommit (indien nodig) + PR**

```bash
git add -A ':!_vendor' ':!public'
git commit -m "test(pdf): verificatie-artefacten en smoketests" 2>/dev/null || true
git push -u origin feat/pdf-export
gh pr create --base main --title "feat: statische PDF-export per norm en voor het kader" \
  --body "Implementeert downloadbare Rijkshuisstijl-PDF's per normpagina en voor het hele kader, met release-tag en downloaddatum. Client-side pdfMake (vendored), CSP-veilig. Zie docs/superpowers/specs/2026-06-24-pdf-export-design.md."
```

---

## Self-Review-notities

- **Spec-dekking:** datalaag (Task 4), renderlaag (Task 3+5), UI/knoppen (Task 6),
  Rijkshuisstijl (Task 5 styles+logo), versie/tag (Task 7), volledige norm incl.
  voetnoten (Task 4 `.Content` bevat het door `single.html` getransformeerde
  referentieblok — let op: de **`.Content` in het pdf.json-template is de ruwe
  Goldmark-output**, niet de door `single.html` getransformeerde versie. Voor de
  PDF is de ruwe Goldmark-voetnootlijst (`<div class="footnotes">`) prima; de
  converter rendert die als kop + lijst. Geen extra werk nodig.)
- **ES-module-valkuil:** `html-to-pdfmake.js` blijft non-module (globals); Node-test
  laadt via `vm` (Task 6 Step 1). Generator `pdf-assets.js` schrijft eveneens
  globals (`window.TKPDF`), niet `export` (Task 2 slotnoot).
- **Output-scope:** `page`-output `pdf` raakt ook `over.md`; vang af met
  `_default/single.pdf.json` guard (Task 4 Step 4).
- **Geen Claude-attributie** in commits (projectafspraak); auteur = git-config user.
```
