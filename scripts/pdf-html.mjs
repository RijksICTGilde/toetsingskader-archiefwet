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
  // Protocol-relatief ("//host/pad") is al absoluut; er een sitepad van maken
  // zou "<site>//host/pad" opleveren.
  if (href.startsWith('//')) return 'https:' + href
  const basis = siteUrl.replace(/\/$/, '')
  return href.startsWith('/') ? basis + href : href
}

/**
 * In het kaderdocument wordt een verwijzing naar een andere norm een sprong
 * bínnen het document in plaats van een weblink: wie de PDF offline of als
 * bijlage leest, blijft in het document (zelfde gedrag als de oude export met
 * `normDests`). ctx.normDests: slug → { dest: 'norm-<id>', prefix: 'n<id>-' }.
 */
function normSprong(href, normDests) {
  if (!normDests) return null
  const m = href.match(/^\/normen\/([^/#]+)\/?(?:#(.+))?$/)
  if (!m) return null
  const doel = normDests[m[1]]
  if (!doel) return null
  return m[2] ? doel.prefix + m[2] : doel.dest
}

const isLijst = (el) => el.nodeType === 1 && /^(ul|ol)$/i.test(el.tagName)

/**
 * Inline-inhoud van een element naar runs voor TaggedPdf.
 * ctx: { prefix, siteUrl, underlineLinks }. Geneste lijsten binnen een <li>
 * worden overgeslagen; die verwerkt lijstItems() apart als L in de LI.
 */
export function runsVan(el, ctx, basis = {}) {
  const runs = []
  for (const kind of el.childNodes) {
    if (kind.nodeType === 3) {
      const t = kind.textContent.replace(/\s+/g, ' ')
      if (t) runs.push({ ...basis, text: t })
      continue
    }
    if (kind.nodeType !== 1 || isLijst(kind)) continue
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
        const sprong = normSprong(href, ctx.normDests)
        if (sprong) run.goTo = sprong
        else {
          run.link = absoluteLink(href, ctx.siteUrl)
          if (ctx.underlineLinks) run.underline = true
        }
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
 * <ul>/<ol> → items voor TaggedPdf.lijst(). Elk item is een reeks segmenten in
 * documentvolgorde: tekst en geneste lijsten wisselen elkaar af, zodat
 * "tekst, sublijst, tekst" in de PDF dezelfde volgorde houdt als op de site
 * (runsVan alleen zou de tekst ná de sublijst ervóór plakken).
 */
export function lijstItems(lijstEl, ctx) {
  return [...lijstEl.children].map((li) => {
    const segmenten = []
    let buffer = null
    const spoel = () => {
      if (!buffer) return
      const runs = runsVan(buffer, ctx)
      if (runs.length) segmenten.push({ runs })
      buffer = null
    }
    for (const node of [...li.childNodes]) {
      if (node.nodeType === 1 && isLijst(node)) {
        spoel()
        segmenten.push({ sub: { items: lijstItems(node, ctx), geordend: node.tagName.toLowerCase() === 'ol' } })
      } else {
        buffer = buffer || li.ownerDocument.createElement('span')
        buffer.appendChild(node)
      }
    }
    spoel()
    return { segmenten, id: li.getAttribute('id') ? ctx.prefix + li.getAttribute('id') : undefined }
  })
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
  const { prefix = '', kopShift = 0, siteUrl, sectie, bladwijzer, normDests } = opties
  const ctx = { prefix, siteUrl, normDests }

  // --- Kern -------------------------------------------------------------------
  // Zonder kop, net als op de site (keuze 31 augustus 2026, zie
  // docs/afwijkingen-van-het-normblad.md): de kerntekst is de eerste alinea
  // onder de titel. Wel een named destination, voor wie ernaar verwijst.
  if (data.kern_html) {
    blokken(data.kern_html).forEach((blok, i) => {
      pdf.alinea(runsVan(blok, ctx), { ouder: sectie, id: i === 0 ? prefix + 'kern' : undefined })
    })
    for (const blok of blokken(data.kern_bron_html || '')) {
      pdf.alinea(runsVan(blok, ctx), { stijl: 'bronnen', ouder: sectie })
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
  const heeftBlokkinderen = (el) => [...el.children].some((k) => /^(p|ul|ol|h[1-6]|blockquote|div|section|article|figure)$/i.test(k.tagName))
  const verwerk = (el) => {
    const tag = el.tagName.toLowerCase()
    const m = tag.match(/^h([1-6])$/)
    if (m) {
      // Ook h1 (de validator verbiedt hem in normteksten, maar stil een
      // alinea van een kop maken mag nooit) en geklemd op H2–H6: PDF 1.7 kent
      // geen H7, en onder de documenttitel begint de body op H2.
      const niveau = Number(m[1])
      for (const k of [...tagVoor.keys()]) if (k > niveau) tagVoor.delete(k)
      const tagNiveau = tagVoor.get(niveau) ?? Math.min(Math.max(niveau + kopShift, 2), vorigTag + 1, 6)
      tagVoor.set(niveau, tagNiveau)
      vorigTag = tagNiveau
      const id = el.getAttribute('id')
      // Als runs, niet als platte tekst: een kop kan een voetnootmarkering
      // dragen (norm 4), en die moet superscript blijven én springen.
      // Stijl h5/h6 bestaat niet apart; die tonen als h4.
      pdf.kop(tagNiveau, runsVan(el, ctx), {
        stijl: 'h' + Math.min(Math.max(niveau, 2), 4),
        id: id ? prefix + id : undefined,
        ouder: sectie,
      })
      if (niveau === 2 && bladwijzer) pdf.bladwijzer(el.textContent.trim(), { ouder: bladwijzer })
    } else if (tag === 'p') {
      const runs = runsVan(el, ctx)
      if (runs.length) pdf.alinea(runs, { ouder: sectie })
    } else if (isLijst(el)) {
      pdf.lijst(lijstItems(el, ctx), { geordend: tag === 'ol', ouder: sectie })
    } else if (tag === 'blockquote') {
      // Citaat: de alinea's als P bínnen een BlockQuote-element, cursief als
      // visueel onderscheid; een lijst in het citaat gaat als gewone lijst
      // verder (inhoud en volgorde boven citaat-semantiek).
      const alineas = []
      for (const kind of el.children) {
        if (kind.tagName.toLowerCase() === 'p') alineas.push(runsVan(kind, ctx).map((r) => ({ italics: true, ...r })))
        else verwerk(kind)
      }
      if (!alineas.length && el.textContent.trim() && ![...el.children].length) {
        alineas.push(runsVan(el, ctx).map((r) => ({ italics: true, ...r })))
      }
      if (alineas.length) pdf.citaat(alineas, { ouder: sectie })
    } else if (/^(table|thead|tbody|figure|pre)$/.test(tag)) {
      // Nog niet ondersteund in de structuurboom. Stil platslaan tot één
      // alinea zou de site en de "toegankelijke" PDF uiteen laten lopen
      // zonder dat een controle het ziet — dan liever een bouwfout.
      throw new Error(`<${tag}> wordt nog niet ondersteund in de PDF-pijplijn (scripts/pdf-html.mjs); ` +
        'bouw er structuurondersteuning voor of haal het element uit de content')
    } else if (tag === 'hr') {
      pdf.lijn()
    } else if (heeftBlokkinderen(el)) {
      // Wrapper (blockquote, div, …): de blokken erin verwerken in plaats van
      // alles door runsVan te halen — die slaat lijsten juist over.
      for (const kind of el.children) verwerk(kind)
    } else if (el.textContent.trim()) {
      pdf.alinea(runsVan(el, ctx), { ouder: sectie })
    }
  }
  for (const el of document.body.children) verwerk(el)

  // --- Bronnen ----------------------------------------------------------------
  // Goldmark zet de voetnoten zonder kop; zonder "Bronnen" valt wie op koppen
  // navigeert midden in een genummerde lijst (zelfde keuze als de oude exports).
  if (voetnoten) {
    pdf.kop(2 + kopShift, 'Bronnen', { stijl: 'bronnenH', ouder: sectie })
    // Via lijstItems, net als de lijsten in de body: alle alinea's van een
    // voetnoot komen mee, en een geneste lijst in een voetnoot blijft een
    // lijst in plaats van stilletjes te verdwijnen.
    const items = lijstItems(voetnoten, { ...ctx, underlineLinks: true })
    pdf.lijst(items, { stijl: 'bronnen', geordend: true, ouder: sectie })
  }
}

/**
 * Losse HTML (kern, bron) als blokelementen. Een `kern` uit de front matter
 * markdownified zonder <p>; staat er dan een inline element in (een link),
 * dan zijn `children` alleen dat element en zou de rest van de tekst
 * verdwijnen (norm 5). Daarom: zijn er tekstknopen op het hoogste niveau, dan
 * is het geheel één alinea.
 */
function blokken(html) {
  if (!html || !html.trim()) return []
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`)
  const losseTekst = [...document.body.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  if (!losseTekst && document.body.children.length) return [...document.body.children]
  const p = document.createElement('p')
  p.innerHTML = document.body.innerHTML
  return [p]
}
