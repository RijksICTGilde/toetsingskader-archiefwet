// Van norm-HTML (uit index.pdfdata.json) naar TaggedPdf-aanroepen.
//
// De vervanger van de replaceRE-reeks uit de vroegere print-templates: dezelfde
// bewerkingen (terugspringpijlen weg, voetnoot-items plat, kop "Bronnen",
// interne links absoluut, ankerprefix per norm in het kaderdocument), maar op
// een echte DOM en met de structuurboom als uitvoer in plaats van HTML.
import { parseHTML } from 'linkedom'

/** Interne links worden sitelinks, precies zoals de print-HTML dat deed. */
function absoluteLink(href, siteUrl) {
  if (!href || /^[a-z]+:/i.test(href)) return href
  const basis = siteUrl.replace(/\/$/, '')
  return href.startsWith('/') ? basis + href : href
}

/**
 * Inline-inhoud van een element naar runs voor TaggedPdf.alinea()/lijst().
 * ctx: { prefix, siteUrl, underlineLinks }
 */
export function runsVan(el, ctx, basis = {}) {
  const runs = []
  for (const kind of el.childNodes) {
    if (kind.nodeType === 3) {
      const t = kind.textContent.replace(/\s+/g, ' ')
      if (t) runs.push({ ...basis, text: t })
      continue
    }
    if (kind.nodeType !== 1) continue
    const tag = kind.tagName.toLowerCase()
    if (tag === 'strong' || tag === 'b') runs.push(...runsVan(kind, ctx, { ...basis, bold: true }))
    else if (tag === 'em' || tag === 'i') runs.push(...runsVan(kind, ctx, { ...basis, italics: true }))
    else if (tag === 'sup') runs.push(...runsVan(kind, ctx, { ...basis, sup: true }))
    else if (tag === 'a') {
      const cls = kind.getAttribute('class') || ''
      const href = kind.getAttribute('href') || ''
      if (cls.includes('footnote-backref')) continue // pijltjes: geen doel op papier
      const run = { ...basis, text: kind.textContent.replace(/\s+/g, ' ') }
      if (cls.includes('footnote-ref')) {
        // Sprong naar de bronnenlijst, als superscript zoals op de site.
        run.sup = true
        run.goTo = ctx.prefix + href.replace(/^#/, '')
      } else if (href.startsWith('#')) {
        run.goTo = ctx.prefix + href.slice(1)
      } else {
        run.link = absoluteLink(href, ctx.siteUrl)
        if (ctx.underlineLinks) run.underline = true
      }
      if (run.text) runs.push(run)
    } else runs.push(...runsVan(kind, ctx, basis))
  }
  // Blokgedrag van HTML: randwitruimte weg.
  if (runs.length) {
    runs[0].text = runs[0].text.replace(/^\s+/, '')
    runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '')
  }
  return runs.filter((r) => r.text)
}

/**
 * Eén norm in het document schrijven: kern, body, bronnenlijst.
 *
 * @param pdf     TaggedPdf
 * @param data    één item uit index.pdfdata.json (titel, kern_html, body_html…)
 * @param opties  prefix     ankerprefix ("n3-") in het kaderdocument
 *                kopShift   0 (losse norm) of 1 (kader: h2 → H3)
 *                siteUrl    voor absolute links
 *                sectie     structuurelement om in te schrijven (kader)
 *                bladwijzer outline-ouder voor de subkoppen
 */
export function schrijfNorm(pdf, data, opties) {
  const { prefix = '', kopShift = 0, siteUrl, sectie, bladwijzer } = opties
  const ctx = { prefix, siteUrl }

  // --- Kern: een sectie met een kop, geen citaat (zie print.css-historie). ---
  if (data.kern_html) {
    pdf.kop(2 + kopShift, 'Kern van de norm', { stijl: 'h2', id: prefix + 'kern', ouder: sectie })
    if (bladwijzer) pdf.bladwijzer('Kern van de norm', { ouder: bladwijzer })
    for (const blok of blokken(data.kern_html)) {
      pdf.alinea(runsVan(blok, ctx), { ouder: sectie })
    }
    for (const blok of blokken(data.kern_bron_html || '')) {
      pdf.alinea(runsVan(blok, ctx), { stijl: 'colofon', ouder: sectie })
    }
  }

  // --- Body -----------------------------------------------------------------
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${data.body_html || ''}</body></html>`)

  // Bronnenlijst apart nemen; Goldmark zet hem in <div class="footnotes">.
  const voetnoten = document.querySelector('.footnotes ol')
  document.querySelector('.footnotes')?.remove()

  // Kopniveaus voor de structuurboom. De normbladen slaan niveaus over
  // (`## Voorschriften` → `#### Voorschrift`, zonder `###`-thema), en dat is
  // woord-voor-woord zo afgesproken. In de PDF mag een kop hoogstens één niveau
  // dieper dan de vorige (PDF/UA, "juiste insluiting via nesting"), dus de tag
  // wordt genormaliseerd: H2 → H3 in plaats van H4. De opmaak volgt wél het
  // oorspronkelijke niveau, zodat "Voorschrift" er blijft uitzien als op de site.
  //
  // Gelijke HTML-niveaus krijgen gelijke tags: na `## Voorschriften` wordt de
  // eerste `#### Voorschrift` H3, en de `#### Criteria` erna óók H3 — niet H4.
  // Daarvoor onthoudt `tagVoor` per HTML-niveau de gekozen tag; een kop op een
  // hoger niveau vergeet de diepere mappings, want daaronder begint de telling
  // opnieuw.
  const tagVoor = new Map()
  let vorigTag = 1 + kopShift // de documenttitel (of de normtitel in het kader)
  for (const el of document.body.children) {
    const tag = el.tagName.toLowerCase()
    const m = tag.match(/^h([2-4])$/)
    if (m) {
      const niveau = Number(m[1])
      for (const k of [...tagVoor.keys()]) if (k > niveau) tagVoor.delete(k)
      const tagNiveau = tagVoor.get(niveau) ?? Math.min(niveau + kopShift, vorigTag + 1)
      tagVoor.set(niveau, tagNiveau)
      vorigTag = tagNiveau
      const id = el.getAttribute('id')
      pdf.kop(tagNiveau, el.textContent.trim(), {
        stijl: 'h' + niveau,
        id: id ? prefix + id : undefined,
        ouder: sectie,
      })
      if (niveau === 2 && bladwijzer) pdf.bladwijzer(el.textContent.trim(), { ouder: bladwijzer })
    } else if (tag === 'p') {
      const runs = runsVan(el, ctx)
      if (runs.length) pdf.alinea(runs, { ouder: sectie })
    } else if (tag === 'ul' || tag === 'ol') {
      pdf.lijst(
        [...el.children].map((li) => runsVan(li, ctx)),
        { geordend: tag === 'ol', ouder: sectie }
      )
    } else if (el.textContent.trim()) {
      pdf.alinea(runsVan(el, ctx), { ouder: sectie })
    }
  }

  // --- Bronnen ----------------------------------------------------------------
  // Goldmark zet de voetnoten zonder kop; zonder "Bronnen" valt wie op koppen
  // navigeert midden in een genummerde lijst (zelfde keuze als de oude
  // exports; tests/js/a11y-checks.test.mjs waakt hierover).
  if (voetnoten) {
    pdf.kop(2 + kopShift, 'Bronnen', { stijl: 'bronnenH', ouder: sectie })
    const items = [...voetnoten.children].map((li) => {
      // Goldmark wikkelt de brontekst in een <p>; plat is hij een echte LBody.
      const p = li.querySelector('p')
      const bron = p || li
      return {
        runs: runsVan(bron, { ...ctx, underlineLinks: true }),
        id: prefix + (li.getAttribute('id') || ''),
      }
    })
    pdf.lijst(items, { stijl: 'bronnen', geordend: true, ouder: sectie })
  }
}

/** Losse HTML (kern, bron) als blokelementen; kale tekst wordt één alinea. */
function blokken(html) {
  if (!html || !html.trim()) return []
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`)
  const kinderen = [...document.body.children]
  if (kinderen.length) return kinderen
  const p = document.createElement('p')
  p.textContent = document.body.textContent.trim()
  return [p]
}
