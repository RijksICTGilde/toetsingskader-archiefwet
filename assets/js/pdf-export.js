// Statische PDF-export. Knoppen met data-pdf-url leveren de JSON-data.
// Gebruikt de vendored pdfMake-globals (window.createPdf/addFonts/
// addVirtualFileSystem) en window.TKPDF (converter + base64-assets).
(function () {
  var BRAND = '#007bc7'
  var dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  var styles = {
    h2: { fontSize: 16, bold: true, color: BRAND, margin: [0, 14, 0, 6] },
    h3: { fontSize: 13, bold: true, margin: [0, 10, 0, 4] },
    h4: { fontSize: 11, bold: true, margin: [0, 8, 0, 2] },
    h5: { fontSize: 10.5, bold: true, margin: [0, 6, 0, 2] },
    h6: { fontSize: 10.5, bold: true, italics: true, margin: [0, 6, 0, 2] },
    para: { fontSize: 10.5, margin: [0, 0, 0, 6], lineHeight: 1.25 },
    list: { fontSize: 10.5, margin: [8, 0, 0, 6] },
    callout: { fontSize: 11, italics: true, color: '#154273', margin: [0, 4, 0, 10] },
    kern: { fontSize: 11, bold: true, margin: [0, 0, 0, 10] },
    section: { fontSize: 14, bold: true, color: BRAND, margin: [0, 18, 0, 8] },
    disclaimerH: { fontSize: 13, bold: true, color: BRAND, margin: [0, 18, 0, 6] },
    coverTitle: { fontSize: 26, bold: true, color: BRAND, margin: [0, 0, 0, 24] },
    coverMeta: { fontSize: 12, color: '#666666', margin: [0, 4, 0, 0] }
  }

  var DISCLAIMER = [
    'Dit is een automatisch gegenereerd document op basis van de online versie van het toetsingskader.',
    'De inhoud is in ontwikkeling en kan wijzigen; raadpleeg voor de actuele tekst altijd de website.',
    'Aan dit document kunnen geen rechten worden ontleend.'
  ]

  function parse(html, opts) {
    var doc = new DOMParser().parseFromString('<!DOCTYPE html><html><body>' + (html || '') + '</body></html>', 'text/html')
    return window.TKPDF.elementToPdfContent(doc.body, opts)
  }

  function originOf(url) {
    try { return new URL(url).origin } catch (e) { return '' }
  }

  // Titelpagina (zoals de DPIA-/AI-verordening-PDF's): gecentreerde stack met
  // titel, downloaddatum, bron en versie; logo komt uit de running header.
  // pageBreak: 'after' → de inhoud begint op pagina 2.
  function cover(data) {
    return [{
      stack: [
        { text: data.titel, style: 'coverTitle' },
        { text: 'Gedownload op ' + dateFmt.format(new Date()), style: 'coverMeta' },
        { text: [{ text: 'Bron: ' }, { text: data.url, link: data.url, color: BRAND, decoration: 'underline' }], style: 'coverMeta' },
        { text: 'Versie: ' + (data.versie || 'onbekend'), style: 'coverMeta' }
      ],
      alignment: 'center',
      margin: [0, 170, 0, 0],
      pageBreak: 'after'
    }]
  }

  function disclaimer() {
    return [
      { text: 'Belangrijke informatie', style: 'disclaimerH' },
      { ul: DISCLAIMER, fontSize: 9.5, color: '#444444' }
    ]
  }

  function kernBlocks(html, ctx) {
    var blocks = parse(html, ctx)
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].style === 'para') blocks[i].style = 'kern'
    }
    return blocks
  }

  function normSection(n, asSection, pageBreak, ctx) {
    // Linkcontext per norm: unieke voetnoot-prefix (anders botsen #fn:N van
    // verschillende normen in de kader-PDF) + site-origin + norm-bestemmingen.
    var opts = { prefix: 'n' + (n.norm_id || '') + '-', origin: ctx.origin, normDests: ctx.normDests }
    var blocks = []
    if (asSection) {
      var head = { text: n.titel, style: 'section' }
      if (pageBreak) head.pageBreak = 'before'
      if (n.slug) head.id = 'norm-' + n.slug
      blocks.push(head)
    }
    if (n.kern_html) {
      blocks.push({ text: 'Kern van de norm', style: 'h4', margin: [0, 0, 0, 2] })
      blocks = blocks.concat(kernBlocks(n.kern_html, opts))
    }
    blocks = blocks.concat(parse(n.body_html, opts))
    return blocks
  }

  function buildNorm(data) {
    // Titelpagina → inhoud → disclaimer (colofon) achteraan. Geen in-PDF-
    // norm-sprongen (normDests null) → kruisverwijzingen worden site-links.
    var ctx = { origin: originOf(data.url), normDests: null }
    return { content: cover(data).concat(normSection(data, false, false, ctx)).concat(disclaimer()) }
  }

  function buildKader(data) {
    // Titelpagina → normen (eerste sluit aan op de cover, rest op nieuwe
    // pagina) → disclaimer. Geen losse intro-pagina.
    // Kruisverwijzingen tussen normen → in-PDF-sprong naar de norm-sectie.
    var normDests = {}
    for (var j = 0; j < data.normen.length; j++) {
      if (data.normen[j].slug) normDests[data.normen[j].slug] = 'norm-' + data.normen[j].slug
    }
    var ctx = { origin: originOf(data.url), normDests: normDests }
    var content = cover(data)
    for (var i = 0; i < data.normen.length; i++) content = content.concat(normSection(data.normen[i], true, i > 0, ctx))
    return { content: content.concat(disclaimer()) }
  }

  function docDefinition(data) {
    var base = data.kind === 'kader' ? buildKader(data) : buildNorm(data)
    base.pageSize = 'A4'
    base.pageMargins = [48, 92, 48, 56]
    base.defaultStyle = { font: 'ROSans', fontSize: 10.5, color: '#1a1a1a' }
    base.styles = styles
    base.info = { title: data.titel, author: 'Inspectie Overheidsinformatie en Erfgoed', subject: 'Versie: ' + (data.versie || '') }
    base.header = function () {
      // Logo gecentreerd bovenaan elke pagina (running letterhead), zonder lijn.
      return {
        columns: [{ text: '', width: '*' }, { svg: window.TKPDF.PDF_LOGO_SVG, width: 28 }, { text: '', width: '*' }],
        margin: [0, 14, 0, 0]
      }
    }
    base.footer = function (currentPage, pageCount) {
      // Dunne scheidingslijn + alleen paginanummer (versie/datum staan op de
      // titelpagina, niet in de voet).
      return {
        stack: [
          { canvas: [{ type: 'line', x1: 48, y1: 0, x2: 547, y2: 0, lineWidth: 0.5, lineColor: '#dddddd' }] },
          { text: 'Pagina ' + currentPage + ' van ' + pageCount, alignment: 'center', fontSize: 8, color: '#999999', margin: [0, 5, 0, 0] }
        ],
        margin: [0, 6, 0, 0]
      }
    }
    return base
  }

  function slugify(s) {
    return (s || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function generate(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('PDF-data niet gevonden: ' + url)
      return res.json()
    }).then(function (data) {
      window.addVirtualFileSystem(window.TKPDF.PDF_VFS)
      window.addFonts(window.TKPDF.PDF_FONTS)
      window.createPdf(docDefinition(data)).download(slugify(data.titel) + '.pdf')
    })
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-pdf-url]') : null
    if (!btn) return
    e.preventDefault()
    // Dubbelklik tijdens genereren negeren (voorheen via CSS pointer-events).
    if (btn.getAttribute('aria-busy') === 'true') return
    btn.setAttribute('aria-busy', 'true')
    // Alleen het tekstlabel wisselen, niet de hele knop — anders sneuvelt het
    // icoon (textContent bevat geen <svg>). Val terug op de knop zelf als er
    // geen apart label-<span> is.
    var label = btn.querySelector('span') || btn
    var original = label.textContent
    label.textContent = 'PDF wordt gemaakt…'
    generate(btn.getAttribute('data-pdf-url'))
      .catch(function (err) { console.error(err); window.alert('Het maken van de PDF is mislukt. Probeer het later opnieuw.') })
      .then(function () { btn.removeAttribute('aria-busy'); label.textContent = original })
  })
})();
