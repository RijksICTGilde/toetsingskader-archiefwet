// Integratietest voor de pdfkit-pijplijn: van norm-HTML naar een getagde PDF,
// gecontroleerd op de gegenereerde bytes (pdf-lib voor de objecten, uitgepakte
// content-streams voor de BDC-tags). Draait zonder browser.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import { PDFDocument, PDFDict, PDFName } from 'pdf-lib'
import { TaggedPdf, laadFonts, laadBriefhoofd } from '../../scripts/pdf-tagged.mjs'
import { schrijfNorm, runsVan, lijstItems } from '../../scripts/pdf-html.mjs'
import { parseHTML } from 'linkedom'

const fonts = laadFonts()
const briefhoofdSvg = laadBriefhoofd()

const BODY = `
<h2 id="toelichting">Toelichting</h2>
<p>Een alinea met een bron.<sup id="fnref:1"><a href="#fn:1" class="footnote-ref" role="doc-noteref">1</a></sup>
En een <a href="/onderwerpen/document/">interne link</a> gevolgd door gewone tekst die niet klikbaar mag zijn.</p>
<h2 id="voorschriften">Voorschriften</h2>
<h4 id="voorschrift">Voorschrift 3.1<sup id="fnref:2"><a href="#fn:2" class="footnote-ref">2</a></sup></h4>
<p>Het orgaan heeft <strong>regels</strong> vastgesteld.</p>
<h4 id="criteria">Criteria</h4>
<ul><li>Eerste criterium.</li><li>Tweede criterium met sublijst:<ul><li>sub een;</li><li>sub twee.</li></ul></li></ul>
<div class="footnotes" role="doc-endnotes"><hr><ol>
<li id="fn:1"><p>Aw, artikel 4.1. <a href="https://example.org">Bekijk bron</a>&#160;<a href="#fnref:1" class="footnote-backref" role="doc-backlink">&#8617;&#65038;</a></p></li>
<li id="fn:2"><p>Ar, artikel 2.2.&#160;<a href="#fnref:2" class="footnote-backref" role="doc-backlink">&#8617;&#65038;</a></p></li>
</ol></div>`

const DATA = {
  kind: 'norm',
  titel: '3. Ordenen',
  norm_id: '3',
  // Zoals norm 5 op de site: kern zonder <p>, met een inline link erin.
  kern_html: 'De kerntekst van de norm, óók wanneer <a href="/onderwerpen/incidenten-voorkomen/">incidenten</a> zich voordoen.',
  kern_bron_html: '<p>Bron: Ar, artikel 2.2.</p>',
  body_html: BODY,
  url: 'https://example.org/normen/03-ordenen/',
  site_url: 'https://example.org/',
  site_titel: 'Toetsingskader Archiefwet',
  versie: 'v0.0.0-test',
  taal: 'nl',
}

async function bouw(data = DATA) {
  const pdf = new TaggedPdf({ titel: 'Test', taal: 'nl', versie: 'v0', fonts, briefhoofdSvg })
  pdf.nieuwePagina()
  schrijfNorm(pdf, data, { siteUrl: data.site_url, bladwijzer: pdf.doc.outline })
  const bytes = await pdf.einde()
  return { bytes, doc: await PDFDocument.load(bytes) }
}

function structTelling(doc) {
  const telling = {}
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFDict) {
      const s = obj.get(PDFName.of('S'))
      if (s && /^\/(Document|H[1-6]|P|L|LI|LBody|Link)$/.test(String(s))) {
        telling[String(s)] = (telling[String(s)] || 0) + 1
      }
    }
  }
  return telling
}

// Alle FlateDecode-streams uitpakken, zodat de content-streams doorzoekbaar zijn.
function uitgepakt(bytes) {
  const delen = [bytes.toString('latin1')]
  let i = 0
  while ((i = bytes.indexOf('stream', i)) !== -1) {
    let start = i + 6
    if (bytes[start] === 0x0d) start++
    if (bytes[start] === 0x0a) start++
    const eind = bytes.indexOf('endstream', start)
    if (eind === -1) break
    try { delen.push(zlib.inflateSync(bytes.subarray(start, eind)).toString('latin1')) } catch { /* geen flate */ }
    i = eind + 9
  }
  return delen.join('\n')
}

test('structuurboom: koppen, alinea’s, echte (geneste) lijsten, geen kern-kop', async () => {
  const { doc } = await bouw()
  const t = structTelling(doc)
  assert.equal(t['/Document'], 1)
  // Toelichting, Voorschriften, Bronnen — géén "Kern van de norm" (keuze 31 augustus 2026).
  assert.equal(t['/H2'], 3, JSON.stringify(t))
  // Voorschrift/Criteria zijn h4 na h2 (het normblad slaat ### over) → H3.
  assert.equal(t['/H3'], 2, JSON.stringify(t))
  assert.equal(t['/H4'], undefined, JSON.stringify(t))
  // Criteria (2 items) + sublijst (2) + bronnen (2): drie L's, zes LI's.
  assert.equal(t['/L'], 3, JSON.stringify(t))
  assert.equal(t['/LI'], 6, JSON.stringify(t))
  assert.equal(t['/LBody'], 6, JSON.stringify(t))
})

test('links zijn Link-structuurelementen met OBJR, en lopen niet door in de volgende run', async () => {
  const { bytes, doc } = await bouw()
  const t = structTelling(doc)
  // kern-link, interne link, 2 voetnootmarkeringen (1 in een kop), bronlink = 5.
  assert.equal(t['/Link'], 5, JSON.stringify(t))
  const inhoud = uitgepakt(bytes)
  assert.ok(inhoud.includes('/Type /OBJR'), 'annotaties hangen als OBJR in de boom')
  // Evenveel annotaties als link-runs: een link die door zou lopen in de
  // volgende `continued`-run zou er meer opleveren.
  let annots = 0
  for (const page of doc.getPages()) {
    const a = page.node.Annots()
    annots += a ? a.size() : 0
  }
  assert.equal(annots, 5, `annotaties: ${annots}`)
})

test('content-stream-tags kloppen met de boom (geen /undefined BDC)', async () => {
  const { bytes } = await bouw()
  const inhoud = uitgepakt(bytes)
  assert.ok(!/\/undefined\s*<<\s*\/MCID/.test(inhoud), 'BDC zonder tagnaam')
  for (const tag of ['/P', '/H2', '/H3', '/LBody', '/Link']) {
    assert.ok(new RegExp(`${tag}\\s*<<\\s*/MCID`).test(inhoud), `BDC voor ${tag}`)
  }
})

test('kern zonder <p> maar met inline link blijft één volledige alinea', () => {
  const opgeslagen = []
  const nep = {
    alinea: (runs, o) => opgeslagen.push({ runs, o }),
    kop: () => {}, lijst: () => {}, bladwijzer: () => {},
  }
  schrijfNorm(nep, { ...DATA, body_html: '' }, { siteUrl: DATA.site_url })
  const kern = opgeslagen[0].runs.map((r) => r.text).join('')
  assert.equal(kern, 'De kerntekst van de norm, óók wanneer incidenten zich voordoen.')
  assert.equal(opgeslagen[0].runs.find((r) => r.link)?.link, 'https://example.org/onderwerpen/incidenten-voorkomen/')
  assert.equal(opgeslagen[0].o.id, 'kern')
})

test('voetnoot in een kop blijft superscript met sprong', () => {
  const koppen = []
  const nep = { alinea: () => {}, lijst: () => {}, bladwijzer: () => {}, kop: (n, runs, o) => koppen.push({ n, runs, o }) }
  schrijfNorm(nep, { ...DATA, kern_html: '' }, { siteUrl: DATA.site_url })
  const vs = koppen.find((k) => k.runs.some?.((r) => r.text.startsWith('Voorschrift 3.1')))
  assert.ok(vs, 'kop gevonden')
  const marker = vs.runs.find((r) => r.sup)
  assert.equal(marker.text, '2')
  assert.equal(marker.goTo, 'fn:2')
})

test('briefhoofd staat op elke pagina, ook na een automatische paginaovergang', async () => {
  // Lange body zodat pdfkit zelf pagina's toevoegt midden in een alinea.
  const lang = { ...DATA, kern_html: '', body_html: '<h2 id="t">Toelichting</h2>' + '<p>' + 'Woorden die doorlopen tot over de paginagrens. '.repeat(400) + '</p>' }
  const { bytes, doc } = await bouw(lang)
  assert.ok(doc.getPageCount() >= 3, `pagina's: ${doc.getPageCount()}`)
  const inhoud = uitgepakt(bytes)
  // Per pagina twee Pagination-artifacts: briefhoofd en voetregel.
  const artifacts = (inhoud.match(/\/Artifact\s*<<\s*\/Type\s*\/Pagination/g) || []).length
  assert.equal(artifacts, doc.getPageCount() * 2, `artifacts: ${artifacts}`)
})

test('kader: verwijzing naar een andere norm wordt een sprong binnen het document', () => {
  const { document } = parseHTML('<body><p>zie <a href="/normen/01-beheer/">norm 1</a> en <a href="/normen/03-ordenen/#voorschriften">daar</a> en <a href="/onderwerpen/document/">een begrip</a></p></body>')
  const normDests = { '01-beheer': { dest: 'norm-1', prefix: 'n1-' }, '03-ordenen': { dest: 'norm-3', prefix: 'n3-' } }
  const runs = runsVan(document.querySelector('p'), { prefix: 'n2-', siteUrl: 'https://x.nl/', normDests })
  assert.equal(runs.find((r) => r.text === 'norm 1').goTo, 'norm-1')
  assert.equal(runs.find((r) => r.text === 'daar').goTo, 'n3-voorschriften')
  assert.equal(runs.find((r) => r.text === 'een begrip').link, 'https://x.nl/onderwerpen/document/')
})

test('voetnootmarkering staat bóven de basislijn (superscript, geen "4.21")', async () => {
  const { bytes } = await bouw()
  const inhoud = uitgepakt(bytes)
  // Tekstfragmenten: "1 0 0 1 x y Tm" gevolgd door Tf/Tj. De marker is de
  // enige run op ±6.8pt; zijn y (PDF: hoger = groter) moet boven die van de
  // omringende 10.5pt-tekst op dezelfde regel liggen.
  const frags = [...inhoud.matchAll(/1 0 0 1 ([\d.]+) ([\d.]+) Tm\n\/F\d+ ([\d.]+) Tf/g)]
    .map((m) => ({ x: +m[1], y: +m[2], size: +m[3] }))
  const sup = frags.find((f) => f.size < 8 && f.size > 5)
  assert.ok(sup, 'superscript-fragment gevonden')
  const buur = frags.filter((f) => f.size > 10 && Math.abs(f.y - sup.y) < 12 && f !== sup)
    .sort((a, b) => Math.abs(a.x - sup.x) - Math.abs(b.x - sup.x))[0]
  assert.ok(buur, 'buurfragment gevonden')
  assert.ok(sup.y > buur.y + 1, `marker (y=${sup.y}) hoort boven de tekst (y=${buur.y})`)
})

test('lijst in een wrapper (blockquote) verdwijnt niet uit de PDF', () => {
  const uit = []
  const nep = { alinea: (runs) => uit.push(['p', runs]), kop: () => {}, lijst: (items) => uit.push(['l', items]), bladwijzer: () => {} }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<blockquote><p>intro</p><ul><li>een</li><li>twee</li></ul></blockquote>' }, { siteUrl: DATA.site_url })
  const lijst = uit.find(([t]) => t === 'l')
  assert.ok(lijst, 'lijst aanwezig')
  assert.equal(lijst[1].length, 2)
})

test('h5 blijft een kop (H5-tag), geen alinea', () => {
  const koppen = []
  const nep = { alinea: () => {}, lijst: () => {}, bladwijzer: () => {}, kop: (n, runs, o) => koppen.push({ n, o }) }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<h2 id="a">A</h2><h3 id="b">B</h3><h4 id="c">C</h4><h5 id="d">D</h5>' }, { siteUrl: DATA.site_url })
  assert.deepEqual(koppen.map((k) => k.n), [2, 3, 4, 5])
  assert.equal(koppen[3].o.stijl, 'h4')
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

test('lijstItems: geneste lijst wordt sub, niet platgeslagen in de tekst', () => {
  const { document } = parseHTML('<body><ul><li>Boven<ul><li>onder een</li><li>onder twee</li></ul></li></ul></body>')
  const items = lijstItems(document.querySelector('ul'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.equal(items.length, 1)
  assert.equal(items[0].runs.map((r) => r.text).join(''), 'Boven')
  assert.equal(items[0].sub.items.length, 2)
  assert.equal(items[0].sub.geordend, false)
})

test('vetgedrukte tekst behoudt zijn opmaak als aparte run', () => {
  const { document } = parseHTML('<body><p>Het orgaan heeft <strong>regels</strong> vastgesteld.</p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.deepEqual(runs.map((r) => !!r.bold), [false, true, false])
})
