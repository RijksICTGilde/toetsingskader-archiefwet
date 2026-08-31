// Integratietest voor de pdfkit-pijplijn: van norm-HTML naar een getagde PDF,
// gecontroleerd op de gegenereerde bytes met pdf-lib. Draait zonder browser.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PDFDocument, PDFDict, PDFName } from 'pdf-lib'
import { TaggedPdf, laadFonts, laadBriefhoofd } from '../../scripts/pdf-tagged.mjs'
import { schrijfNorm, runsVan } from '../../scripts/pdf-html.mjs'
import { parseHTML } from 'linkedom'

const fonts = laadFonts()
const briefhoofdSvg = laadBriefhoofd()

const BODY = `
<h2 id="toelichting">Toelichting</h2>
<p>Een alinea met een bron.<sup id="fnref:1"><a href="#fn:1" class="footnote-ref" role="doc-noteref">1</a></sup>
En een <a href="/onderwerpen/document/">interne link</a>.</p>
<h2 id="voorschriften">Voorschriften</h2>
<h4 id="voorschrift">Voorschrift 3.1</h4>
<p>Het orgaan heeft <strong>regels</strong> vastgesteld.</p>
<h4 id="criteria">Criteria</h4>
<ul><li>Eerste criterium.</li><li>Tweede criterium.</li></ul>
<div class="footnotes" role="doc-endnotes"><hr><ol>
<li id="fn:1"><p>Aw, artikel 4.1. <a href="https://example.org">Bekijk bron</a>&#160;<a href="#fnref:1" class="footnote-backref" role="doc-backlink">&#8617;&#65038;</a></p></li>
</ol></div>`

const DATA = {
  kind: 'norm',
  titel: 'Ordenen',
  norm_id: '3',
  kern_html: '<p>De kerntekst van de norm.</p>',
  kern_bron_html: '<p>Bron: Ar, artikel 2.2.</p>',
  body_html: BODY,
  url: 'https://example.org/normen/03-ordenen/',
  site_url: 'https://example.org/',
  site_titel: 'Toetsingskader Archiefwet',
  versie: 'v0.0.0-test',
  taal: 'nl',
}

async function bouw() {
  const pdf = new TaggedPdf({ titel: 'Test', taal: 'nl', versie: 'v0', fonts, briefhoofdSvg })
  pdf.nieuwePagina()
  schrijfNorm(pdf, DATA, { siteUrl: DATA.site_url, bladwijzer: pdf.doc.outline })
  return PDFDocument.load(await pdf.einde())
}

function structTelling(doc) {
  const telling = {}
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFDict) {
      const s = obj.get(PDFName.of('S'))
      if (s && /^\/(Document|H[1-6]|P|L|LI|LBody)$/.test(String(s))) {
        telling[String(s)] = (telling[String(s)] || 0) + 1
      }
    }
  }
  return telling
}

test('structuurboom: koppen, alinea’s en echte lijsten', async () => {
  const doc = await bouw()
  const t = structTelling(doc)
  assert.equal(t['/Document'], 1)
  // Kern, Toelichting, Voorschriften, Bronnen als H2; Voorschrift/Criteria als H4.
  assert.equal(t['/H2'], 4, JSON.stringify(t))
  assert.equal(t['/H4'], 2, JSON.stringify(t))
  // Criteria (2) + bronnen (1) als LI met LBody eronder.
  assert.equal(t['/L'], 2, JSON.stringify(t))
  assert.equal(t['/LI'], 3, JSON.stringify(t))
  assert.equal(t['/LBody'], 3, JSON.stringify(t))
})

test('catalogus: taal, MarkInfo en documenttitel', async () => {
  const doc = await bouw()
  const cat = doc.catalog
  assert.equal(String(cat.get(PDFName.of('Lang'))), '(nl)')
  const markInfo = doc.context.lookup(cat.get(PDFName.of('MarkInfo')))
  assert.equal(String(markInfo.get(PDFName.of('Marked'))), 'true')
  assert.ok(cat.get(PDFName.of('Outlines')), 'bladwijzers aanwezig')
})

test('runsVan: voetnootmarkering wordt superscript-sprong, backref verdwijnt', () => {
  const { document } = parseHTML(`<body><p>tekst<sup id="fnref:1"><a href="#fn:1" class="footnote-ref">1</a></sup>
    <a href="#fnref:1" class="footnote-backref">↩</a></p></body>`)
  const runs = runsVan(document.querySelector('p'), { prefix: 'n3-', siteUrl: 'https://x.nl/' })
  const marker = runs.find((r) => r.sup)
  assert.ok(marker, 'superscript-run')
  assert.equal(marker.goTo, 'n3-fn:1')
  assert.ok(!runs.some((r) => r.text.includes('↩')), 'backref weg')
})

test('runsVan: interne links worden sitelinks, externe blijven', () => {
  const { document } = parseHTML(`<body><p><a href="/onderwerpen/document/">begrip</a> en
    <a href="https://extern.example/">extern</a></p></body>`)
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://site.nl/' })
  assert.equal(runs.find((r) => r.text === 'begrip').link, 'https://site.nl/onderwerpen/document/')
  assert.equal(runs.find((r) => r.text === 'extern').link, 'https://extern.example/')
})

test('vetgedrukte tekst behoudt zijn opmaak als aparte run', () => {
  const { document } = parseHTML('<body><p>Het orgaan heeft <strong>regels</strong> vastgesteld.</p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.deepEqual(runs.map((r) => !!r.bold), [false, true, false])
})
