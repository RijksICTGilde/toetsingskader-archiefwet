// Integratietest voor de pdfkit-pijplijn: van norm-HTML naar een getagde PDF,
// gecontroleerd op de gegenereerde bytes (pdf-lib voor de objecten, uitgepakte
// content-streams voor de BDC-tags). Draait zonder browser.
import { test } from 'node:test'
import assert from 'node:assert/strict'
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

// Dezelfde uitpakker als de CI-gate, zodat test en gate dezelfde bytes zien.
import { metUitgepakteStreams as uitgepakt } from '../../scripts/pdf-ua-check.mjs'

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
  const { document } = parseHTML('<body><p>zie <a href="/normen/01-beheer/">norm 1</a> en <a href="/normen/03-ordenen/#voorschriften">daar</a> en <a href="../07-vernietigen/">relatief</a> en <a href="https://x.nl/normen/01-beheer/">voluit</a> en <a href="/onderwerpen/document/">een begrip</a></p></body>')
  const normDests = { '01-beheer': { dest: 'norm-1', prefix: 'n1-' }, '03-ordenen': { dest: 'norm-3', prefix: 'n3-' }, '07-vernietigen': { dest: 'norm-7', prefix: 'n7-' } }
  const ctx = { prefix: 'n2-', siteUrl: 'https://x.nl/', basisUrl: 'https://x.nl/normen/02-overzicht/', normDests }
  const runs = runsVan(document.querySelector('p'), ctx)
  assert.equal(runs.find((r) => r.text === 'norm 1').goTo, 'norm-1')
  assert.equal(runs.find((r) => r.text === 'daar').goTo, 'n3-voorschriften')
  assert.equal(runs.find((r) => r.text === 'relatief').goTo, 'norm-7')
  assert.equal(runs.find((r) => r.text === 'voluit').goTo, 'norm-1')
  assert.equal(runs.find((r) => r.text === 'een begrip').link, 'https://x.nl/onderwerpen/document/')
})

test('kale tekst in een <div>-wrapper valt niet weg', () => {
  const uit = []
  const nep = { alinea: (runs) => uit.push(runs), kop: () => {}, bladwijzer: () => {}, citaat: () => {}, lijst: () => {} }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<div>Let op: <p>alinea.</p></div>' }, { siteUrl: DATA.site_url })
  const alle = uit.flat().map((r) => r.text).join('|')
  assert.ok(alle.includes('Let op:'), alle)
  assert.ok(alle.includes('alinea.'), alle)
})

test('kern die precies één link is houdt zijn link', () => {
  const uit = []
  const nep = { alinea: (runs, o) => uit.push({ runs, o }), kop: () => {}, bladwijzer: () => {}, citaat: () => {}, lijst: () => {} }
  schrijfNorm(nep, { ...DATA, body_html: '', kern_html: '<a href="/onderwerpen/document/">documenten</a>' }, { siteUrl: DATA.site_url })
  assert.equal(uit[0].runs[0].link, 'https://example.org/onderwerpen/document/')
  assert.equal(uit[0].o.id, 'kern')
})

test('link naar een layout-anker (#referenties) wordt een sitelink, geen dode sprong', () => {
  const { document } = parseHTML('<body><p><a href="#referenties">bronnen</a></p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: 'n1-', siteUrl: 'https://x.nl/', basisUrl: 'https://x.nl/normen/01-beheer/' })
  assert.equal(runs[0].link, 'https://x.nl/normen/01-beheer/#referenties')
  assert.equal(runs[0].goTo, undefined)
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

test('blockquote wordt een citaat; een lijst erin verdwijnt niet', () => {
  const uit = []
  const nep = { alinea: (runs) => uit.push(['p', runs]), kop: () => {}, lijst: (items) => uit.push(['l', items]), citaat: (alineas) => uit.push(['q', alineas]), bladwijzer: () => {} }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<blockquote><p>intro</p><ul><li>een</li><li>twee</li></ul></blockquote>' }, { siteUrl: DATA.site_url })
  const citaat = uit.find(([t]) => t === 'q')
  assert.ok(citaat, 'citaat aanwezig')
  assert.equal(citaat[1][0].map((r) => r.text).join(''), 'intro')
  assert.ok(citaat[1][0].every((r) => r.italics), 'citaat cursief')
  const lijst = uit.find(([t]) => t === 'l')
  assert.ok(lijst, 'lijst aanwezig')
  assert.equal(lijst[1].length, 2)
})

test('dubbele bestemming of sprong naar niets is een bouwfout', async () => {
  const pdf1 = new TaggedPdf({ titel: 'T', taal: 'nl', versie: 'v0', fonts, briefhoofdSvg })
  pdf1.nieuwePagina()
  pdf1.alinea([{ text: 'a' }], { id: 'kern' })
  assert.throws(() => pdf1.alinea([{ text: 'b' }], { id: 'kern' }), /dubbele bestemming/)
  const pdf2 = new TaggedPdf({ titel: 'T', taal: 'nl', versie: 'v0', fonts, briefhoofdSvg })
  pdf2.nieuwePagina()
  pdf2.alinea([{ text: 'zie ', goTo: 'bestaat-niet' }])
  await assert.rejects(() => pdf2.einde(), /niet-bestaande bestemming/)
})

test('h1 in de body blijft een kop en H-tags klemmen op 6', () => {
  const koppen = []
  const nep = { alinea: () => { throw new Error('kop werd alinea') }, lijst: () => {}, bladwijzer: () => {}, citaat: () => {}, kop: (n, runs, o) => koppen.push({ n, o }) }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<h1 id="x">Kop</h1><h2 id="a">A</h2><h3 id="b">B</h3><h4 id="c">C</h4><h5 id="d">D</h5><h6 id="e">E</h6>' }, { siteUrl: DATA.site_url, kopShift: 1 })
  assert.deepEqual(koppen.map((k) => k.n), [2, 3, 4, 5, 6, 6].slice(0, koppen.length))
  assert.ok(koppen.every((k) => k.n <= 6), JSON.stringify(koppen.map((k) => k.n)))
})

test('voetnoot met een geneste lijst houdt die lijst in de bronnen', () => {
  const uit = []
  const nep = { alinea: () => {}, kop: () => {}, bladwijzer: () => {}, citaat: () => {}, lijst: (items, o) => uit.push({ items, o }) }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<div class="footnotes" role="doc-endnotes"><ol><li id="fn:1"><p>Bronnen:</p><ul><li>Aw 4.1</li><li>Ar 2.2</li></ul></li></ol></div>' }, { siteUrl: DATA.site_url })
  const bron = uit.find((u) => u.o?.stijl === 'bronnen')
  assert.ok(bron, 'bronnenlijst aanwezig')
  const seg = bron.items[0].segmenten
  assert.ok(seg.some((x) => x.sub?.items?.length === 2), JSON.stringify(seg))
})

test('h5 blijft een kop (H5-tag), geen alinea', () => {
  const koppen = []
  const nep = { alinea: () => {}, lijst: () => {}, bladwijzer: () => {}, kop: (n, runs, o) => koppen.push({ n, o }) }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<h2 id="a">A</h2><h3 id="b">B</h3><h4 id="c">C</h4><h5 id="d">D</h5>' }, { siteUrl: DATA.site_url })
  assert.deepEqual(koppen.map((k) => k.n), [2, 3, 4, 5])
  assert.equal(koppen[3].o.stijl, 'h4')
})

test('link die over de paginagrens loopt houdt zijn annotatie op de vervolgpagina', async () => {
  // pdfkit's endMarkedContent() (het briefhoofd op pageAdded) wist link/goTo
  // uit de live opties van een doorlopende run; de link verloor dan zijn
  // annotaties op de nieuwe pagina.
  const lang = {
    ...DATA, kern_html: '',
    body_html: '<h2 id="t">Toelichting</h2><p>' + 'Aanloop tot onderaan de pagina. '.repeat(140) +
      '<a href="https://example.org/lang/">' + 'een heel lange linktekst die over de paginagrens heen wikkelt '.repeat(20) + '</a>slot.</p>',
  }
  const { doc } = await bouw(lang)
  assert.ok(doc.getPageCount() >= 2, `pagina's: ${doc.getPageCount()}`)
  const perPagina = doc.getPages().map((p) => (p.node.Annots() ? p.node.Annots().size() : 0))
  // De link begint op pagina 1 en wikkelt de grens over: beide pagina's
  // moeten annotaties dragen (zonder de _textOptions-fix had pagina 2 er nul).
  assert.ok(perPagina[0] > 0 && perPagina[1] > 0, `annotaties per pagina: ${perPagina}`)
})

test('runsVan: <br> wordt een regeleinde, geen aan elkaar geplakte woorden', () => {
  const { document } = parseHTML('<body><p>regel een<br>regel twee</p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.ok(runs.some((r) => r.text.includes('\n')), JSON.stringify(runs))
})

test('runsVan: <img> is een bouwfout, geen stil weggelaten afbeelding', () => {
  const { document } = parseHTML('<body><p>voor <img src="a.png" alt="beeld"> na</p></body>')
  assert.throws(() => runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://x.nl/' }), /wordt nog niet ondersteund/)
})

test('<ol start="3"> nummert in de PDF ook vanaf 3', () => {
  const uit = []
  const nep = { alinea: () => {}, kop: () => {}, bladwijzer: () => {}, citaat: () => {}, lijst: (items, o) => uit.push(o) }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<ol start="3"><li>eerste</li></ol>' }, { siteUrl: DATA.site_url })
  assert.equal(uit[0].start, 3)
})

test('blockquote met kale tekst en inline nadruk verliest niets', () => {
  const uit = []
  const nep = { alinea: () => { throw new Error('buiten het citaat beland') }, kop: () => {}, bladwijzer: () => {}, citaat: (a) => uit.push(a), lijst: () => {} }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<blockquote>tekst <em>nadruk</em></blockquote>' }, { siteUrl: DATA.site_url })
  const tekst = uit[0][0].map((r) => r.text).join('')
  assert.equal(tekst, 'tekst nadruk')
})

test('spatie binnen <strong>/<em> blijft staan (geen "voorvet")', () => {
  const { document } = parseHTML('<body><p>voor<strong> vet</strong> na</p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.equal(runs.map((r) => r.text).join(''), 'voor vet na')
})

test('lijst-item met alléén een sublijst houdt zijn bestemming (build breekt niet)', async () => {
  const pdf = new TaggedPdf({ titel: 'T', taal: 'nl', versie: 'v0', fonts, briefhoofdSvg })
  pdf.nieuwePagina()
  pdf.alinea([{ text: 'zie ', goTo: 'fn:1' }])
  pdf.lijst([{ segmenten: [{ sub: { items: [[{ text: 'sub' }]], geordend: false } }], id: 'fn:1' }])
  await pdf.einde() // gooit zonder de registratie: "sprong naar niet-bestaande bestemming"
})

test('relatieve link lost op tegen de pagina-URL', () => {
  const { document } = parseHTML('<body><p><a href="../doel/">doel</a> en <a href="bijlage.pdf">bijlage</a></p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://site.nl/', basisUrl: 'https://site.nl/normen/03-ordenen/' })
  assert.equal(runs.find((r) => r.text === 'doel').link, 'https://site.nl/normen/doel/')
  assert.equal(runs.find((r) => r.text === 'bijlage').link, 'https://site.nl/normen/03-ordenen/bijlage.pdf')
})

test('geneste <ol start="5"> houdt zijn beginwaarde', () => {
  const { document } = parseHTML('<body><ol start="3"><li>x<ol start="5"><li>y</li></ol></li></ol></body>')
  const items = lijstItems(document.querySelector('ol'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.equal(items[0].segmenten.find((s) => s.sub).sub.start, 5)
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

test('runsVan: protocol-relatieve link wordt geen sitepad', () => {
  const { document } = parseHTML('<body><p><a href="//nationaalarchief.nl/x">na</a></p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://site.nl/' })
  assert.equal(runs[0].link, 'https://nationaalarchief.nl/x')
})

test('lijstItems: geneste lijst wordt een segment op zijn plek, tekst erna blijft erna', () => {
  const { document } = parseHTML('<body><ul><li>Boven<ul><li>onder een</li><li>onder twee</li></ul> tenzij anders bepaald.</li></ul></body>')
  const items = lijstItems(document.querySelector('ul'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.equal(items.length, 1)
  const seg = items[0].segmenten
  assert.equal(seg.length, 3, JSON.stringify(seg))
  assert.equal(seg[0].runs.map((r) => r.text).join(''), 'Boven')
  assert.equal(seg[1].sub.items.length, 2)
  assert.equal(seg[1].sub.geordend, false)
  assert.equal(seg[2].runs.map((r) => r.text).join('').trim(), 'tenzij anders bepaald.')
})

test('voetnoot met vervolgalinea houdt beide alinea’s in de bronnenlijst', () => {
  const uit = []
  const nep = { alinea: () => {}, kop: () => {}, bladwijzer: () => {}, lijst: (items) => uit.push(items) }
  schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<div class="footnotes" role="doc-endnotes"><ol><li id="fn:1"><p>Eerste alinea.</p><p>Tweede alinea.</p></li></ol></div>' }, { siteUrl: DATA.site_url })
  const bron = uit[0][0]
  const tekst = bron.segmenten.flatMap((seg) => seg.runs || []).map((r) => r.text).join('')
  assert.ok(tekst.includes('Eerste alinea.') && tekst.includes('Tweede alinea.'), tekst)
})

test('tabel in de body is een bouwfout, geen stille woordenbrij', () => {
  const nep = { alinea: () => {}, kop: () => {}, bladwijzer: () => {}, lijst: () => {} }
  assert.throws(
    () => schrijfNorm(nep, { ...DATA, kern_html: '', body_html: '<table><tbody><tr><td>a</td></tr></tbody></table>' }, { siteUrl: DATA.site_url }),
    /wordt nog niet ondersteund/
  )
})

test('vetgedrukte tekst behoudt zijn opmaak als aparte run', () => {
  const { document } = parseHTML('<body><p>Het orgaan heeft <strong>regels</strong> vastgesteld.</p></body>')
  const runs = runsVan(document.querySelector('p'), { prefix: '', siteUrl: 'https://x.nl/' })
  assert.deepEqual(runs.map((r) => !!r.bold), [false, true, false])
})
