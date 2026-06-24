// HTML -> pdfMake-content. Input: een DOM-Element (browser: DOMParser-body;
// test: linkedom). Defensief: onbekende elementen vallen terug op platte tekst.
// Geen externe afhankelijkheden, geen ES-modules (de bundel is een plain script).
(function () {
  var BRAND = '#007bc7'

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
          // Voetnoot-↩-backlinks weglaten: betekenisloos in een PDF.
          if ((child.getAttribute('class') || '').indexOf('footnote-backref') === -1) {
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
      if (children[i].tagName.toLowerCase() === 'li') out.push({ text: inline(children[i]) })
    }
    return out
  }

  function elementToPdfContent(root) {
    var out = []
    var children = root.children
    for (var i = 0; i < children.length; i++) {
      var el = children[i]
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
