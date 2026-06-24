// Statische PDF-export. Knoppen met data-pdf-url leveren de JSON-data.
// Gebruikt de vendored pdfMake-globals (window.createPdf/addFonts/
// addVirtualFileSystem) en window.TKPDF (converter + base64-assets).
(function () {
  var BRAND = '#007bc7'
  var dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  var styles = {
    title: { fontSize: 24, bold: true, color: BRAND, margin: [0, 0, 0, 6] },
    meta: { fontSize: 10, color: '#666666' },
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
    disclaimerH: { fontSize: 13, bold: true, color: BRAND, margin: [0, 18, 0, 6] }
  }

  var DISCLAIMER = [
    'Dit is een automatisch gegenereerd document op basis van de online versie van het toetsingskader.',
    'De inhoud is in ontwikkeling en kan wijzigen; raadpleeg voor de actuele tekst altijd de website.',
    'Aan dit document kunnen geen rechten worden ontleend.'
  ]

  function parse(html) {
    var doc = new DOMParser().parseFromString('<!DOCTYPE html><html><body>' + (html || '') + '</body></html>', 'text/html')
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
      { text: 'Belangrijke informatie', style: 'disclaimerH' },
      { ul: DISCLAIMER, fontSize: 9.5, color: '#444444' }
    ]
  }

  function kernBlocks(html) {
    var blocks = parse(html)
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].style === 'para') blocks[i].style = 'kern'
    }
    return blocks
  }

  function normSection(n, asSection) {
    var blocks = []
    if (asSection) blocks.push({ text: n.titel, style: 'section', pageBreak: 'before' })
    if (n.kern_html) {
      blocks.push({ text: 'Kern van de norm', style: 'h4', margin: [0, 0, 0, 2] })
      blocks = blocks.concat(kernBlocks(n.kern_html))
    }
    blocks = blocks.concat(parse(n.body_html))
    return blocks
  }

  function buildNorm(data) {
    return { content: [header(data)].concat(normSection(data, false)).concat(disclaimer()) }
  }

  function buildKader(data) {
    var content = [header(data)]
    if (data.intro_html) content = content.concat(parse(data.intro_html))
    for (var i = 0; i < data.normen.length; i++) content = content.concat(normSection(data.normen[i], true))
    content = content.concat(disclaimer())
    return { content: content }
  }

  function docDefinition(data) {
    var base = data.kind === 'kader' ? buildKader(data) : buildNorm(data)
    base.pageSize = 'A4'
    base.pageMargins = [48, 72, 48, 56]
    base.defaultStyle = { font: 'ROSans', fontSize: 10.5, color: '#1a1a1a' }
    base.styles = styles
    base.info = { title: data.titel, author: 'Inspectie Overheidsinformatie en Erfgoed', subject: 'Versie: ' + (data.versie || '') }
    base.header = function (currentPage) {
      return currentPage === 1 ? { image: window.TKPDF.PDF_LOGO, width: 150, margin: [48, 20, 0, 0] } : null
    }
    base.footer = function (currentPage, pageCount) {
      return {
        columns: [
          { text: data.titel, fontSize: 8, color: '#999999', margin: [48, 0, 0, 0] },
          { text: 'Pagina ' + currentPage + ' van ' + pageCount, alignment: 'right', fontSize: 8, color: '#999999', margin: [0, 0, 48, 0] }
        ]
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
    btn.setAttribute('aria-busy', 'true')
    var original = btn.textContent
    btn.textContent = 'PDF wordt gemaakt…'
    generate(btn.getAttribute('data-pdf-url'))
      .catch(function (err) { console.error(err); window.alert('Het maken van de PDF is mislukt. Probeer het later opnieuw.') })
      .then(function () { btn.removeAttribute('aria-busy'); btn.textContent = original })
  })
})();
