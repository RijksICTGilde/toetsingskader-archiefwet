// Van norm-HTML (uit index.pdfdata.json) naar TaggedPdf-aanroepen.
//
// De vervanger van de replaceRE-reeks uit de vroegere print-templates: dezelfde
// bewerkingen (terugspringpijlen weg, voetnoot-items plat, kop "Bronnen",
// interne links absoluut, ankerprefix per norm in het kaderdocument), maar op
// een echte DOM en met de structuurboom als uitvoer in plaats van HTML.
import { parseHTML } from 'linkedom'

/**
 * Interne links worden sitelinks. Via de URL-resolver tegen de pagina-URL,
 * zodat óók "../doel/", "bijlage.pdf" en "//host/pad" kloppen — een relatieve
 * URI in een gedownloade PDF lost nergens tegen op.
 */
function absoluteLink(href, basisUrl) {
  if (!href) return href
  try {
    return new URL(href, basisUrl).href
  } catch {
    return href
  }
}

/**
 * In het kaderdocument wordt een verwijzing naar een andere norm een sprong
 * bínnen het document in plaats van een weblink: wie de PDF offline of als
 * bijlage leest, blijft in het document (zelfde gedrag als de oude export met
 * `normDests`). ctx.normDests: slug → { dest: 'norm-<id>', prefix: 'n<id>-' }.
 */
function normSprong(href, ctx) {
  if (!ctx.normDests) return null
  // Op de opgeloste URL matchen, zodat óók "../07-vernietigen/", een volledige
  // https-link en een root-relatief pad een sprong worden — een vormvaste
  // regex liet die stil degraderen tot weblinks.
  let abs, site
  try {
    abs = new URL(href, ctx.basisUrl || ctx.siteUrl)
    site = new URL(ctx.siteUrl)
  } catch {
    return null
  }
  if (abs.origin !== site.origin) return null
  const pad = abs.pathname.match(/^\/normen\/([^/]+)\/?$/)
  if (!pad) return null
  const doel = ctx.normDests[pad[1]]
  if (!doel) return null
  const anker = abs.hash ? abs.hash.slice(1) : ''
  return anker ? doel.prefix + anker : doel.dest
}

const isLijst = (el) => el.nodeType === 1 && /^(ul|ol)$/i.test(el.tagName)

// Ankers die layouts (niet body_html) op de sitepagina zetten; zie runsVan.
const SITE_ANKERS = new Set(['referenties'])

/** `start` van een <ol>, met 0 als geldige waarde (Number(...) || 1 at hem op). */
function olStart(el) {
  const s = Number(el.getAttribute('start'))
  return el.hasAttribute('start') && Number.isFinite(s) ? s : 1
}

/**
 * Inline-inhoud van een element naar runs voor TaggedPdf.
 * ctx: { prefix, siteUrl, underlineLinks }. Geneste lijsten binnen een <li>
 * worden overgeslagen; die verwerkt lijstItems() apart als L in de LI.
 */
export function runsVan(el, ctx, basis = {}, top = true) {
  const runs = []
  for (const kind of el.childNodes) {
    if (kind.nodeType === 3) {
      const t = kind.textContent.replace(/\s+/g, ' ')
      if (t) runs.push({ ...basis, text: t })
      continue
    }
    if (kind.nodeType !== 1 || isLijst(kind)) continue
    const tag = kind.tagName.toLowerCase()
    if (tag === 'br') {
      // Hard regeleinde: als \n schrijft pdfkit een nieuwe regel. Zonder deze
      // run plakten de woorden eromheen aan elkaar.
      runs.push({ ...basis, text: '\n' })
      continue
    }
    if (tag === 'img') {
      throw new Error('<img> wordt nog niet ondersteund in de PDF-pijplijn (scripts/pdf-html.mjs); ' +
        'een afbeelding zou stilletjes uit de PDF verdwijnen terwijl de site hem toont')
    }
    if (tag === 'strong' || tag === 'b') runs.push(...runsVan(kind, ctx, { ...basis, bold: true }, false))
    else if (tag === 'em' || tag === 'i') runs.push(...runsVan(kind, ctx, { ...basis, italics: true }, false))
    else if (tag === 'sup') runs.push(...runsVan(kind, ctx, { ...basis, sup: true }, false))
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
        // Ankers die de site-layout maakt (niet de body) bestaan niet in de
        // PDF; een sprong ernaartoe zou de build op geldige content breken.
        // Die worden een link naar de pagina zelf.
        if (SITE_ANKERS.has(href.slice(1))) {
          run.link = (ctx.basisUrl || ctx.siteUrl) + href
          if (ctx.underlineLinks) run.underline = true
        } else {
          run.goTo = ctx.prefix + href.slice(1)
        }
      } else {
        const sprong = normSprong(href, ctx)
        if (sprong) run.goTo = sprong
        else {
          run.link = absoluteLink(href, ctx.basisUrl || ctx.siteUrl)
          if (ctx.underlineLinks) run.underline = true
        }
      }
      if (run.text) runs.push(run)
    } else runs.push(...runsVan(kind, ctx, basis, false))
  }
  // Blokgedrag van HTML: randwitruimte weg — maar alléén op blokniveau. Deze
  // functie recursiveert voor strong/em/sup, en daar zou de trim de spatie
  // bínnen het element opeten ("voor<strong> vet</strong>" werd "voorvet").
  if (top && runs.length) {
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
        segmenten.push({ sub: {
          items: lijstItems(node, ctx),
          geordend: node.tagName.toLowerCase() === 'ol',
          start: olStart(node),
        } })
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
  const { prefix = '', kopShift = 0, siteUrl, paginaUrl, sectie, bladwijzer, normDests } = opties
  const ctx = { prefix, siteUrl, basisUrl: paginaUrl || siteUrl, normDests }

  // --- Kern -------------------------------------------------------------------
  // Zonder kop, net als op de site (keuze 31 augustus 2026, zie
  // docs/afwijkingen-van-het-normblad.md): de kerntekst is de eerste alinea
  // onder de titel. Wel een named destination, voor wie ernaar verwijst.
  if (data.kern_html) {
    // De bestemming aan het eerste blok mét tekst: een leeg eerste blok zou
    // hem stil overslaan, waarna elke #kern-sprong de build breekt.
    let kernId = prefix + 'kern'
    for (const blok of blokken(data.kern_html)) {
      const runs = runsVan(blok, ctx)
      if (!runs.length) continue
      pdf.alinea(runs, { ouder: sectie, id: kernId })
      kernId = undefined
    }
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
  // Kinderen van body of van een wrapper verwerken met een buffer voor kale
  // tekst en inline elementen: "<div>Let op: <p>…</p></div>" toont "Let op:"
  // op de site, dus dat mag hier niet stilletjes wegvallen.
  const verwerkKinderen = (nodes, doc) => {
    let buffer = null
    const spoel = () => {
      if (!buffer) return
      const runs = runsVan(buffer, ctx)
      if (runs.length) pdf.alinea(runs, { ouder: sectie })
      buffer = null
    }
    for (const node of [...nodes]) {
      if (node.nodeType === 1 && /^(p|ul|ol|h[1-6]|blockquote|div|section|article|figure|table|thead|tbody|pre|img|hr)$/i.test(node.tagName)) {
        spoel()
        verwerk(node)
      } else {
        buffer = buffer || doc.createElement('span')
        buffer.appendChild(node)
      }
    }
    spoel()
  }
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
      pdf.lijst(lijstItems(el, ctx), {
        geordend: tag === 'ol',
        // `start` van de <ol> meenemen: een hervatte nummering ("3. 4.") mag
        // in de PDF niet stilletjes weer bij 1 beginnen.
        start: olStart(el),
        ouder: sectie,
      })
    } else if (tag === 'blockquote') {
      // Citaat: de alinea's als P bínnen een BlockQuote-element, cursief als
      // visueel onderscheid; een lijst in het citaat gaat als gewone lijst
      // verder (inhoud en volgorde boven citaat-semantiek). Kale tekst en
      // inline elementen (unsafe-HTML zonder <p>) bufferen als alinea, zodat
      // er niets stilletjes wegvalt.
      const alineas = []
      let buffer = null
      const spoel = () => {
        if (!buffer) return
        const runs = runsVan(buffer, ctx).map((r) => ({ italics: true, ...r }))
        if (runs.length) alineas.push(runs)
        buffer = null
      }
      for (const kind of [...el.childNodes]) {
        const kindTag = kind.nodeType === 1 ? kind.tagName.toLowerCase() : null
        if (kindTag === 'p') {
          spoel()
          alineas.push(runsVan(kind, ctx).map((r) => ({ italics: true, ...r })))
        } else if (kindTag && /^(ul|ol|h[1-6]|blockquote|div|section|table|figure|pre|img)$/.test(kindTag)) {
          spoel()
          verwerk(kind)
        } else {
          buffer = buffer || el.ownerDocument.createElement('span')
          buffer.appendChild(kind)
        }
      }
      spoel()
      if (alineas.length) pdf.citaat(alineas, { ouder: sectie })
    } else if (/^(table|thead|tbody|figure|pre|img)$/.test(tag)) {
      // Nog niet ondersteund in de structuurboom. Stil platslaan tot één
      // alinea zou de site en de "toegankelijke" PDF uiteen laten lopen
      // zonder dat een controle het ziet — dan liever een bouwfout.
      throw new Error(`<${tag}> wordt nog niet ondersteund in de PDF-pijplijn (scripts/pdf-html.mjs); ` +
        'bouw er structuurondersteuning voor of haal het element uit de content')
    } else if (tag === 'hr') {
      pdf.lijn()
    } else if (heeftBlokkinderen(el)) {
      // Wrapper (div, section, …): de blokken erin verwerken in plaats van
      // alles door runsVan te halen — die slaat lijsten juist over; kale
      // tekst tussen de blokken buffert mee.
      verwerkKinderen(el.childNodes, el.ownerDocument)
    } else if (el.textContent.trim()) {
      pdf.alinea(runsVan(el, ctx), { ouder: sectie })
    }
  }
  verwerkKinderen(document.body.childNodes, document)

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
  // Alleen als de kinderen echte blokken zijn: een kern die louter uit inline
  // elementen bestaat (precies één <a>, of "<em>x</em> <a>y</a>") zou anders
  // per element door de blokverwerking gaan en zijn link/nadruk verliezen.
  const BLOK = /^(p|ul|ol|h[1-6]|blockquote|div|section|table|figure|pre|hr)$/i
  const kinderen = [...document.body.children]
  if (!losseTekst && kinderen.length && kinderen.every((k) => BLOK.test(k.tagName))) return kinderen
  const p = document.createElement('p')
  p.innerHTML = document.body.innerHTML
  return [p]
}
