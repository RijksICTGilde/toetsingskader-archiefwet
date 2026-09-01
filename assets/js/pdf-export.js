// Statische PDF-export. Knoppen met data-pdf-url leveren de JSON-data.
// Gebruikt de vendored pdfMake-globals (window.createPdf/addFonts/
// addVirtualFileSystem) en window.TKPDF (converter + base64-assets).
(function () {
  var BRAND = '#007bc7'
  // Rijkshuisstijl-donkerblauw: kleur van het lint en het woordmerk ernaast.
  var LOGO_BLUE = '#154273'
  // Lintbreedte in punten; SVG is 1:2, dus hoogte is het dubbele.
  var LOGO_W = 26
  var dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  var styles = {
    h2: { fontSize: 16, bold: true, color: BRAND, margin: [0, 14, 0, 6] },
    h3: { fontSize: 13, bold: true, margin: [0, 10, 0, 4] },
    h4: { fontSize: 11, bold: true, margin: [0, 8, 0, 2] },
    h5: { fontSize: 10.5, bold: true, margin: [0, 6, 0, 2] },
    h6: { fontSize: 10.5, bold: true, italics: true, margin: [0, 6, 0, 2] },
    para: { fontSize: 10.5, margin: [0, 0, 0, 6], lineHeight: 1.25 },
    list: { fontSize: 10.5, margin: [8, 0, 0, 6] },
    // Bronnenlijst leest als noot, niet als doorlopende tekst. Nummers zijn al
    // superscript (html-to-pdfmake.js).
    footnotesH: { fontSize: 10, bold: true, color: BRAND, margin: [0, 14, 0, 4] },
    footnotes: { fontSize: 8.5, color: '#444444', margin: [8, 0, 0, 6], lineHeight: 1.15 },
    callout: { fontSize: 11, italics: true, color: '#154273', margin: [0, 4, 0, 10] },
    section: { fontSize: 20, bold: true, color: BRAND, margin: [0, 0, 0, 12] },
    coverTitle: { fontSize: 26, bold: true, color: BRAND, margin: [0, 0, 0, 24] },
    coverMeta: { fontSize: 12, color: '#666666', margin: [0, 4, 0, 0] }
  }


  function parse(html, opts) {
    var doc = new DOMParser().parseFromString('<!DOCTYPE html><html><body>' + (html || '') + '</body></html>', 'text/html')
    return window.TKPDF.elementToPdfContent(doc.body, opts)
  }

  function originOf(url) {
    try { return new URL(url).origin } catch (e) { return '' }
  }

  // Titelpagina: titel, downloaddatum, bron, versie. Logo komt uit de running
  // header; pageBreak 'after' zet de inhoud op pagina 2.
  function cover(data) {
    return [{
      stack: [
        { text: data.titel, style: 'coverTitle' },
        { text: 'Gedownload op ' + dateFmt.format(new Date()), style: 'coverMeta' },
        { text: [{ text: 'Bron: ' }, { text: data.url, link: data.url, color: BRAND }], style: 'coverMeta' },
        { text: 'Versie: ' + (data.versie || 'onbekend'), style: 'coverMeta' }
      ],
      alignment: 'center',
      margin: [0, 170, 0, 0],
      pageBreak: 'after'
    }]
  }

  // Eén alinea in plaats van het blok "Belangrijke informatie" (feedback 25
  // augustus 2026): versie plus link naar de actuele versie. Het voorbehoud
  // (geen rechten) blijft; "in ontwikkeling" is op verzoek weg, alleen de kop
  // en de bulletvorm
  // zijn weg. De link gaat naar de site-root, niet naar de pagina: bij de
  // kader-PDF is data.url de /normen/-sectie.
  function disclaimer(data) {
    var site = data.site_url || data.url
    return [{
      text: [
        { text: 'Dit is versie ' + (data.versie || 'onbekend') + ' van het toetsingskader. Bekijk voor de actuele versie ' },
        { text: site, link: site, color: BRAND },
        { text: '. Aan dit document kunnen geen rechten worden ontleend.' }
      ],
      fontSize: 9.5, color: '#444444', margin: [0, 16, 0, 0]
    }]
  }

  function normSection(n, asSection, pageBreak, ctx) {
    // Prefix per norm, anders botsen de #fn:N van verschillende normen in de
    // kader-PDF.
    var opts = { prefix: 'n' + (n.norm_id || '') + '-', origin: ctx.origin, normDests: ctx.normDests }
    var blocks = []
    if (asSection) {
      // tocItem → inhoudsopgave; id → doel voor kruisverwijzingen.
      var head = { text: n.titel, style: 'section', tocItem: true }
      if (pageBreak) head.pageBreak = 'before'
      if (n.slug) head.id = 'norm-' + n.slug
      blocks.push(head)
    }
    if (n.kern_html) {
      // Kern zonder kop, net als de callout op de website (keuze 31 augustus
      // 2026): de kerntekst is de eerste alinea na de titel. Een `kern_kop` in
      // oude JSON wordt bewust genegeerd.
      blocks = blocks.concat(parse(n.kern_html, opts))
      // De bron bij de kern staat los van de kerntekst (front matter
      // `kern_bron`), dus die komt hier als eigen alinea achteraan.
      if (n.kern_bron_html) blocks = blocks.concat(parse(n.kern_bron_html, opts))
    }
    blocks = blocks.concat(parse(n.body_html, opts))
    return blocks
  }

  function buildNorm(data) {
    // normDests null → kruisverwijzingen worden site-links.
    var ctx = { origin: originOf(data.url), normDests: null }
    return { content: cover(data).concat(normSection(data, false, false, ctx)).concat(disclaimer(data)) }
  }

  function buildKader(data) {
    // Kruisverwijzingen tussen normen worden in-PDF-sprongen.
    var normDests = {}
    for (var j = 0; j < data.normen.length; j++) {
      if (data.normen[j].slug) normDests[data.normen[j].slug] = 'norm-' + data.normen[j].slug
    }
    var ctx = { origin: originOf(data.url), normDests: normDests }
    var content = cover(data)
    // Klikbare inhoudsopgave op pagina 2, uit de tocItem-koppen.
    content.push({
      toc: {
        title: { text: 'Inhoudsopgave', style: 'section', margin: [0, 0, 0, 16] },
        textStyle: { fontSize: 11, color: BRAND },
        numberStyle: { fontSize: 11, color: '#666666' }
      }
    })
    // Elke norm op een eigen pagina.
    for (var i = 0; i < data.normen.length; i++) content = content.concat(normSection(data.normen[i], true, true, ctx))
    return { content: content.concat(disclaimer(data)) }
  }

  function docDefinition(data) {
    var base = data.kind === 'kader' ? buildKader(data) : buildNorm(data)
    base.pageSize = 'A4'
    base.pageMargins = [48, 92, 48, 56]
    base.defaultStyle = { font: 'ROSans', fontSize: 10.5, color: '#1a1a1a' }
    base.styles = styles
    base.info = { title: data.titel, author: 'Inspectie Overheidsinformatie en Erfgoed', subject: 'Versie: ' + (data.versie || '') }
    // /DisplayDocTitle: viewer toont de titel i.p.v. de bestandsnaam. Géén
    // `tagged: true` — pdfMake bouwt geen structuurboom, en getagd markeren zonder
    // /StructTreeRoot misleidt hulpsoftware (bevinding 6).
    base.displayTitle = true
    base.header = function (currentPage, pageCount, pageSize) {
      // Rijkshuisstijl-lockup als running letterhead. Tekst in RO Sans i.p.v. een
      // woordmerk-SVG, zodat hij scherp en selecteerbaar blijft.
      // absolutePosition i.p.v. de header-flow: het lint moet aflopen tegen de
      // bovenrand (y = 0) en in het paginamidden staan, los van pageMargins.
      var lintX = (pageSize.width - LOGO_W) / 2
      return [
        { svg: window.TKPDF.PDF_LOGO_SVG, width: LOGO_W, absolutePosition: { x: lintX, y: 0 } },
        {
          width: 220,
          absolutePosition: { x: lintX + LOGO_W + 8, y: 16 },
          stack: [
            { text: 'Inspectie Overheidsinformatie en Erfgoed', fontSize: 9.5, bold: true, color: LOGO_BLUE, lineHeight: 1.15 },
            { text: 'Ministerie van Onderwijs, Cultuur en Wetenschap', fontSize: 8, color: LOGO_BLUE, lineHeight: 1.15, margin: [0, 1, 0, 0] }
          ]
        }
      ]
    }
    base.footer = function (currentPage, pageCount) {
      // Alleen paginanummer; versie en datum staan op de titelpagina.
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

  // Knoppen staan `hidden` in de markup: zonder JS is er geen PDF.
  var hiddenButtons = document.querySelectorAll('[data-pdf-url][hidden]')
  for (var b = 0; b < hiddenButtons.length; b++) hiddenButtons[b].removeAttribute('hidden')

  // Live region voor de voortgang (4.1.3). Knoplabel + aria-busy volstaat niet:
  // aria-busy wordt meestal genegeerd en genereren duurt seconden. Staat vanaf
  // lading leeg in de DOM, anders wordt de wijziging niet aangekondigd.
  var statusRegion = document.createElement('p')
  statusRegion.className = 'visually-hidden'
  statusRegion.setAttribute('role', 'status')
  document.body.appendChild(statusRegion)

  function announce(msg) { statusRegion.textContent = msg }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-pdf-url]') : null
    if (!btn) return
    e.preventDefault()
    // Dubbelklik tijdens genereren negeren.
    if (btn.getAttribute('aria-busy') === 'true') return
    btn.setAttribute('aria-busy', 'true')
    // Alleen het tekstlabel wisselen; textContent op de knop sloopt het icoon.
    var label = btn.querySelector('span') || btn
    var original = label.textContent
    label.textContent = 'PDF wordt gemaakt…'
    announce('De PDF wordt gemaakt. Dit kan enkele seconden duren.')
    generate(btn.getAttribute('data-pdf-url'))
      .then(function () { announce('De PDF is gemaakt en wordt gedownload.') })
      .catch(function (err) {
        console.error(err)
        announce('Het maken van de PDF is mislukt.')
        window.alert('Het maken van de PDF is mislukt. Probeer het later opnieuw.')
      })
      .then(function () { btn.removeAttribute('aria-busy'); label.textContent = original })
  })
})();
