// HTML -> pdfMake-content. Input: een DOM-Element (browser: DOMParser-body;
// test: linkedom). Defensief: onbekende elementen vallen terug op platte tekst.
// Geen externe afhankelijkheden, geen ES-modules (de bundel is een plain script).
(function () {
  var BRAND = '#007bc7'
  // Prefix voor interne voetnoot-bestemmingen (uniek per norm in de kader-PDF).
  // Gezet door elementToPdfContent; recursie laat hem ongemoeid.
  var linkPrefix = ''

  function footnoteDest(href) {
    var m = (href || '').match(/#fn:?(.+)$/)
    return m ? linkPrefix + 'fn-' + m[1] : null
  }

  function inlineRuns(node, acc, style) {
    var children = node.childNodes
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.nodeType === 3) {
        // Witruimte samenvouwen tot één spatie (zoals HTML); voorkomt dat
        // opmaak-newlines in de bron als regeleinden in de PDF belanden
        // (bv. lijstnummer los van de tekst in de bronnenlijst).
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
            // Voetnoot-nummer: interne sprong naar de bron in de bronnenlijst.
            var dest = footnoteDest(child.getAttribute('href'))
            var ref = { text: child.textContent, color: BRAND }
            if (dest) ref.linkToDestination = dest
            acc.push(ref)
          } else {
            acc.push({ text: child.textContent, link: child.getAttribute('href') || '', color: BRAND, decoration: 'underline' })
          }
        } else inlineRuns(child, acc, style)
      }
    }
    return acc
  }

  function inline(node) {
    var runs = inlineRuns(node, [], {})
    // Witruimte-runs aan de randen weghalen en de buitenste tekst trimmen
    // (block-gedrag van HTML), zodat tekst niet met een spatie/regel begint.
    while (runs.length && /^\s*$/.test(runs[0].text)) runs.shift()
    while (runs.length && /^\s*$/.test(runs[runs.length - 1].text)) runs.pop()
    if (runs.length) {
      runs[0].text = runs[0].text.replace(/^\s+/, '')
      runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '')
    }
    if (runs.length === 0) return ''
    if (runs.length === 1 && !runs[0].link && !runs[0].bold && !runs[0].italics) return runs[0].text
    return runs
  }

  function listItems(node) {
    var out = []
    var children = node.children
    for (var i = 0; i < children.length; i++) {
      var li = children[i]
      if (li.tagName.toLowerCase() !== 'li') continue
      var item = { text: inline(li) }
      // Bronnenlijst-item met id="fn:N" → pdfMake-bestemming, zodat de
      // voetnoot-nummers ernaartoe kunnen springen.
      var liId = li.getAttribute && li.getAttribute('id')
      var m = liId && liId.match(/^fn:?(.+)$/)
      if (m) item.id = linkPrefix + 'fn-' + m[1]
      out.push(item)
    }
    return out
  }

  function elementToPdfContent(root, prefix) {
    // Alleen de top-level aanroep zet de prefix; recursie (div/section) erft 'm.
    if (typeof prefix === 'string') linkPrefix = prefix
    var out = []
    var children = root.childNodes
    for (var i = 0; i < children.length; i++) {
      var el = children[i]
      // Losse tekst op blokniveau (bv. een ééngeregelde markdownify-output
      // zonder <p>, zoals de kern) als alinea opnemen i.p.v. negeren.
      if (el.nodeType === 3) {
        var bare = el.textContent.replace(/\s+/g, ' ').trim()
        if (bare) out.push({ text: bare, style: 'para' })
        continue
      }
      if (el.nodeType !== 1) continue
      var tag = el.tagName.toLowerCase()
      if (/^h[1-6]$/.test(tag)) out.push({ text: el.textContent.trim(), style: tag })
      else if (tag === 'p') out.push({ text: inline(el), style: 'para' })
      else if (tag === 'ul') out.push({ ul: listItems(el), style: 'list' })
      else if (tag === 'ol') out.push({ ol: listItems(el), style: 'list' })
      else if (tag === 'blockquote') out.push({ text: inline(el), style: 'callout', margin: [8, 4, 0, 8] })
      else if (tag === 'hr') out.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 6, 0, 6] })
      else if (tag === 'section' || tag === 'div' || tag === 'article' || tag === 'header' || tag === 'details') out.push.apply(out, elementToPdfContent(el))
      else { var t = el.textContent.trim(); if (t) out.push({ text: t }) }
    }
    return out
  }

  var g = typeof window !== 'undefined' ? window : globalThis
  g.TKPDF = g.TKPDF || {}
  g.TKPDF.elementToPdfContent = elementToPdfContent
})();
