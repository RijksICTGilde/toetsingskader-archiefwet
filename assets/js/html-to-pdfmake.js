// HTML -> pdfMake-content. Input: een DOM-Element (browser: DOMParser-body;
// test: linkedom). Defensief: onbekende elementen vallen terug op platte tekst.
// Geen externe afhankelijkheden, geen ES-modules (de bundel is een plain script).
(function () {
  var BRAND = '#007bc7'
  // Linkcontext, gezet door elementToPdfContent (recursie laat 'm ongemoeid):
  //  linkPrefix — uniek prefix voor voetnoot-bestemmingen (per norm in de kader).
  //  linkOrigin — site-origin om root-relatieve links absoluut te maken.
  //  normDests  — map van norm-slug → in-PDF-bestemming (alleen in de kader-PDF);
  //               null in de losse norm-PDF.
  var linkPrefix = ''
  var linkOrigin = ''
  var normDests = null

  function footnoteDest(href) {
    var m = (href || '').match(/#fn:?(.+)$/)
    return m ? linkPrefix + 'fn-' + m[1] : null
  }

  // Interne link: in de kader-PDF een sprong naar de norm-sectie, anders een
  // absolute link naar de site. Alleen kleur als signaal, geen onderstreping.
  function crossRefLink(text, href) {
    var run = { text: text, color: BRAND }
    if (!href) { return { text: text } }
    if (href.charAt(0) === '/') {
      var slug = (href.match(/^\/normen\/([^/?#]+)\/?/) || [])[1]
      if (normDests && slug && normDests[slug]) run.linkToDestination = normDests[slug]
      else run.link = linkOrigin + href
    } else {
      run.link = href
    }
    return run
  }

  function inlineRuns(node, acc, style) {
    var children = node.childNodes
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.nodeType === 3) {
        // Witruimte samenvouwen zoals HTML; anders worden opmaak-newlines
        // regeleinden in de PDF.
        var t = child.textContent.replace(/\s+/g, ' ')
        if (t) acc.push(Object.assign({ text: t }, style))
      } else if (child.nodeType === 1) {
        var tag = child.tagName.toLowerCase()
        if (tag === 'strong' || tag === 'b') inlineRuns(child, acc, Object.assign({}, style, { bold: true }))
        else if (tag === 'em' || tag === 'i') inlineRuns(child, acc, Object.assign({}, style, { italics: true }))
        else if (tag === 'a') {
          var cls = child.getAttribute('class') || ''
          if (cls.indexOf('footnote-backref') !== -1) {
            // ↩-backlink weglaten: betekenisloos in een PDF.
          } else if (cls.indexOf('footnote-ref') !== -1) {
            // Sprong naar de bronnenlijst. `sup` schaalt pdfMake zelf naar
            // 0.58×, mits er geen expliciete fontSize op staat.
            var dest = footnoteDest(child.getAttribute('href'))
            var ref = { text: child.textContent, color: BRAND, sup: true }
            if (dest) ref.linkToDestination = dest
            acc.push(ref)
          } else {
            acc.push(crossRefLink(child.textContent, child.getAttribute('href') || ''))
          }
        } else inlineRuns(child, acc, style)
      }
    }
    return acc
  }

  function inline(node) {
    var runs = inlineRuns(node, [], {})
    // Randwitruimte weg (block-gedrag van HTML).
    while (runs.length && /^\s*$/.test(runs[0].text)) runs.shift()
    while (runs.length && /^\s*$/.test(runs[runs.length - 1].text)) runs.pop()
    if (runs.length) {
      runs[0].text = runs[0].text.replace(/^\s+/, '')
      runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '')
    }
    if (runs.length === 0) return ''
    // Eén kale run mag een string worden. Toetsen op "alleen een text-sleutel",
    // niet op een lijstje: linkToDestination, color en sup vielen daarmee weg.
    var keys = Object.keys(runs[0])
    if (runs.length === 1 && keys.length === 1 && keys[0] === 'text') return runs[0].text
    return runs
  }

  function listItems(node) {
    var out = []
    var children = node.children
    for (var i = 0; i < children.length; i++) {
      var li = children[i]
      if (li.tagName.toLowerCase() !== 'li') continue
      var item = { text: inline(li) }
      // id="fn:N" → bestemming voor de voetnoot-nummers.
      var liId = li.getAttribute && li.getAttribute('id')
      var m = liId && liId.match(/^fn:?(.+)$/)
      if (m) item.id = linkPrefix + 'fn-' + m[1]
      out.push(item)
    }
    return out
  }

  function elementToPdfContent(root, opts) {
    // Alleen top-level zet de linkcontext; recursie erft 'm.
    if (opts) {
      if (typeof opts.prefix === 'string') linkPrefix = opts.prefix
      if (typeof opts.origin === 'string') linkOrigin = opts.origin
      if (opts.normDests !== undefined) normDests = opts.normDests
    }
    var out = []
    var children = root.childNodes
    for (var i = 0; i < children.length; i++) {
      var el = children[i]
      // Losse tekst op blokniveau (kern zonder <p>) als alinea, niet negeren.
      if (el.nodeType === 3) {
        var bare = el.textContent.replace(/\s+/g, ' ').trim()
        if (bare) out.push({ text: bare, style: 'para' })
        continue
      }
      if (el.nodeType !== 1) continue
      var tag = el.tagName.toLowerCase()
      // Koppen via inline(), net als alinea's: een voetnoot in een kop (norm 4,
      // "Digitale documenten met een bewaartermijn …[^ar-artikel-2-8]") werd
      // met textContent een kaal nummer zonder superscript of sprong.
      if (/^h[1-6]$/.test(tag)) out.push({ text: inline(el), style: tag })
      else if (tag === 'p') out.push({ text: inline(el), style: 'para' })
      else if (tag === 'ul') out.push({ ul: listItems(el), style: 'list' })
      else if (tag === 'ol') out.push({ ol: listItems(el), style: 'list' })
      else if (tag === 'blockquote') out.push({ text: inline(el), style: 'callout', margin: [8, 4, 0, 8] })
      else if (tag === 'hr') out.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 6, 0, 6] })
      // Goldmarks footnotes-blok is de bronnenlijst; zonder eigen behandeling
      // wordt het een <ol> op body-grootte. Kop i.p.v. <hr>: een lijn zonder
      // label zegt niet wát er volgt.
      else if ((el.getAttribute('class') || '').indexOf('footnotes') !== -1) {
        var ol = el.querySelector && el.querySelector('ol')
        if (ol) {
          out.push({ text: 'Bronnen', style: 'footnotesH' })
          out.push({ ol: listItems(ol), style: 'footnotes' })
        }
      }
      else if (tag === 'section' || tag === 'div' || tag === 'article' || tag === 'header' || tag === 'details') out.push.apply(out, elementToPdfContent(el))
      else { var t = el.textContent.trim(); if (t) out.push({ text: t }) }
    }
    return out
  }

  var g = typeof window !== 'undefined' ? window : globalThis
  g.TKPDF = g.TKPDF || {}
  g.TKPDF.elementToPdfContent = elementToPdfContent
})();
