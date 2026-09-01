// Getagde PDF-opbouw met pdfkit: elk tekstblok wordt via markStructureContent()
// aan een structuurelement gekoppeld, zodat de PDF een leesvolgorde met echte
// koppen, lijsten en links krijgt (WCAG 1.3.1, EN 301 549 §10, PDF/UA-1).
//
// Zelfde aanpak als de AI-verordening-beslishulp
// (MinBZK/ai-verordening-beslishulp#1047, frontend/src/services/pdfTagged.ts),
// maar in Node bij de build: de inhoud is statisch, dus de bezoeker hoeft niets
// te genereren en de downloadlink blijft een gewoon bestand.
//
// Drie pdfkit-eigenaardigheden waar deze code omheen werkt — allemaal gemeten
// op de gegenereerde bytes, zie tests/js/pdf-tagged.test.mjs:
//
// 1. Opties van een `continued`-run erven over naar de volgende run zodra die
//    ze op `undefined` laat (text.js, _initOptions). Een link zou dan tot het
//    einde van de alinea doorlopen. Vandaar: link/goTo/destination altijd
//    expliciet, `null` als er niets is.
// 2. Een link-annotatie krijgt alleen /StructParent en een OBJR in de boom als
//    de tekst binnen een `struct('Link', [closure])` wordt geschreven (dan is
//    _currentStructureElement een Link). goTo() krijgt dat zelfs dan niet
//    vanzelf; daarvoor krijgt goTo tijdens die closure het structParent mee.
// 3. Tekst die onder page.maxY() begint "past niet" en opent een nieuwe pagina;
//    en een alinea die zelf over de paginagrens loopt roept addPage() aan
//    buiten onze eigen nieuwePagina() om. Vandaar het briefhoofd op het
//    `pageAdded`-event en de voetregel met de ondermarge tijdelijk op nul.
//
// Maten en kleuren komen uit de eerdere exports: A4, marges [48, 92, 48, 56]pt,
// RO Sans, brand #007bc7.
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import fs from 'node:fs'

const BRAND = '#007bc7' // 4,51:1 op wit — de ondergrens, niet verlagen.
const TEKST = '#1a1a1a'
const META = '#666666' // 5,74:1
const NOOT = '#444444'
const LIJN = '#dddddd' // decoratief, geen betekenisdrager

const A4 = { breed: 595.28, hoog: 841.89 }
const MARGE = { top: 92, bottom: 56, left: 48, right: 48 }
const INSPRING = 14 // per lijstniveau

// Stijlen: fontgrootte, vet, kleur, marge boven/onder (pt).
const STIJL = {
  cover: { size: 26, bold: true, color: BRAND, boven: 0, onder: 24 },
  sectie: { size: 20, bold: true, color: BRAND, boven: 0, onder: 16 },
  h2: { size: 16, bold: true, color: BRAND, boven: 14, onder: 6 },
  h3: { size: 13, bold: true, color: TEKST, boven: 10, onder: 4 },
  h4: { size: 11, bold: true, color: TEKST, boven: 8, onder: 2 },
  para: { size: 10.5, bold: false, color: TEKST, boven: 0, onder: 6 },
  meta: { size: 12, bold: false, color: META, boven: 4, onder: 0 },
  bronnenH: { size: 10, bold: true, color: BRAND, boven: 14, onder: 4 },
  bronnen: { size: 8.5, bold: false, color: NOOT, boven: 0, onder: 2 },
  colofon: { size: 9.5, bold: false, color: NOOT, boven: 16, onder: 2 },
  toc: { size: 11, bold: false, color: TEKST, boven: 0, onder: 6 },
}

const REGEL = 1.25 // line-height, gelijk aan de site en de oude export

export class TaggedPdf {
  /**
   * @param {object} opties  titel, taal, versie, fonts {normal,bold,italic:
   *   Buffer}, briefhoofdSvg (string, optioneel)
   */
  constructor(opties) {
    this.doc = new PDFDocument({
      pdfVersion: '1.7',
      lang: opties.taal || 'nl-NL',
      tagged: true,
      displayTitle: true,
      autoFirstPage: false,
      bufferPages: true,
      size: 'A4',
      margins: MARGE,
      info: {
        Title: opties.titel,
        Author: 'Inspectie Overheidsinformatie en Erfgoed',
        Subject: 'Versie: ' + (opties.versie || ''),
        Creator: 'toetsingskader-archiefwet (pdfkit)',
      },
    })
    this.doc.registerFont('Body', opties.fonts.normal)
    this.doc.registerFont('BodyBold', opties.fonts.bold)
    this.doc.registerFont('BodyItalic', opties.fonts.italic)
    this.briefhoofdSvg = opties.briefhoofdSvg
    // Op élke pagina, ook de pagina's die pdfkit zelf opent als een alinea
    // over de grens loopt (zie kop van dit bestand, punt 3).
    this.doc.on('pageAdded', () => this.#briefhoofd())
    this.root = this.doc.struct('Document')
    this.doc.addStructure(this.root)
    this.klaar = new Promise((resolve) => {
      const delen = []
      this.doc.on('data', (d) => delen.push(d))
      this.doc.on('end', () => resolve(Buffer.concat(delen)))
    })
  }

  #briefhoofdX = null
  #dests = new Set()
  #sprongen = new Set()

  font(run) {
    if (run.bold) return 'BodyBold'
    if (run.italics) return 'BodyItalic'
    return 'Body'
  }

  /**
   * Briefhoofd als artifact (buiten de leesvolgorde). Als Form XObject: de
   * SVG-operatoren (±73 kB per pagina) worden één keer vastgelegd en per
   * pagina met één `Do` hergebruikt — zonder dat was het kaderdocument voor
   * ruim de helft herhaald briefhoofd.
   */
  #briefhoofd() {
    if (!this.briefhoofdSvg) return
    const { doc } = this
    const x = doc.x
    const y = doc.y
    if (!this.#briefhoofdX) {
      // De operatoren die SVGtoPDF in de paginastroom zou schrijven, opvangen
      // en in een eigen stream-object zetten. Het briefhoofd is louter paden
      // (contouren, geen tekst), dus het object heeft geen Resources nodig;
      // SVGtoPDF omsluit alles met q…Q, dus er lekt geen graphics state.
      const delen = []
      const orig = doc.addContent
      doc.addContent = (data) => { delen.push(data); return doc }
      try {
        // Het lint stond in de oude export gecentreerd (26pt breed) tegen de
        // bovenrand; het SVG heeft het lint op x=0..26, dus het geheel begint
        // op paginamidden − 13pt.
        SVGtoPDF(doc, this.briefhoofdSvg, A4.breed / 2 - 13, 0)
      } finally {
        doc.addContent = orig
      }
      const xobj = doc.ref({
        Type: 'XObject',
        Subtype: 'Form',
        BBox: [0, 0, A4.breed, A4.hoog],
      })
      xobj.end(Buffer.from(delen.join('\n'), 'binary'))
      this.#briefhoofdX = xobj
    }
    doc.page.xobjects['BH1'] = this.#briefhoofdX
    doc.markContent('Artifact', { type: 'Pagination' })
    doc.addContent('/BH1 Do')
    doc.endMarkedContent()
    doc.x = x
    doc.y = y
  }

  nieuwePagina() {
    this.doc.addPage()
    this.doc.x = MARGE.left
    this.doc.y = MARGE.top
  }

  paginaNummer() {
    return this.doc.bufferedPageRange().count
  }

  /**
   * Kop als H<niveau>. `inhoud` is een string of een array runs (een kop kan
   * een voetnootmarkering dragen — norm 4 doet dat). Zet ook een named
   * destination als er een id is.
   */
  kop(niveau, inhoud, { stijl, id, ouder, uitlijning } = {}) {
    const s = STIJL[stijl || 'h' + niveau]
    const runs = (typeof inhoud === 'string' ? [{ text: inhoud }] : inhoud).map((r) => ({ bold: s.bold, ...r }))
    this.#blok('H' + niveau, runs, s, { id, ouder, uitlijning })
  }

  /** Alinea; runs = [{text, bold, italics, sup, underline, color, link, goTo}]. */
  alinea(runs, { stijl = 'para', ouder, id, uitlijning } = {}) {
    this.#blok('P', runs, STIJL[stijl], { id, ouder, uitlijning })
  }

  /**
   * Lijst als L → LI → LBody. Items zijn arrays van runs, {runs, id} of
   * {segmenten: [{runs} | {sub: {items, geordend}}], id}: segmenten schrijven
   * in documentvolgorde binnen de LBody, met een geneste lijst als L ín die
   * LBody — zo blijft "tekst, sublijst, tekst" op volgorde. Genummerde
   * lijsten krijgen het nummer in de tekst; pdfkit nummert niet zelf.
   * `label: false` voor items die al een nummer dragen (de inhoudsopgave).
   */
  lijst(items, { stijl = 'para', geordend = false, start = 1, label = true, ouder } = {}) {
    this.#lijstIn(ouder || this.root, items, { s: STIJL[stijl], geordend, start, label, inspring: 0 })
    this.doc.y += STIJL[stijl].onder
  }

  #lijstIn(ouderEl, items, { s, geordend, start, label, inspring }) {
    const l = this.doc.struct('L')
    ouderEl.add(l)
    items.forEach((item, i) => {
      const segmenten = Array.isArray(item)
        ? [{ runs: item }]
        : item.segmenten || (item.runs ? [{ runs: item.runs }] : [])
      const id = Array.isArray(item) ? undefined : item.id
      const li = this.doc.struct('LI')
      l.add(li)
      const lbody = this.doc.struct('LBody')
      li.add(lbody)
      let eersteTekst = true
      for (const seg of segmenten) {
        if (seg.runs) {
          const prefix = eersteTekst && label ? [{ text: geordend ? `${start + i}. ` : '•  ' }] : []
          this.#tekstBlok(lbody, [...prefix, ...seg.runs], s, { id: eersteTekst ? id : undefined, inspring: inspring + INSPRING })
          eersteTekst = false
        } else if (seg.sub?.items?.length) {
          this.#lijstIn(lbody, seg.sub.items, { s, geordend: !!seg.sub.geordend, start: 1, label: true, inspring: inspring + INSPRING })
        }
      }
      lbody.end()
      li.end()
    })
    l.end()
  }

  /**
   * Citaat: alinea's (arrays van runs) als P binnen één BlockQuote-element,
   * zodat een aanhaling zich in de structuurboom onderscheidt van de eigen
   * normtekst.
   */
  citaat(alineas, { stijl = 'para', ouder } = {}) {
    const bq = this.doc.struct('BlockQuote')
    ;(ouder || this.root).add(bq)
    for (const runs of alineas) this.#blok('P', runs, STIJL[stijl], { ouder: bq })
    bq.end()
  }

  /** Horizontale lijn als artifact (decoratie, geen inhoud). */
  lijn() {
    const { doc } = this
    doc.markContent('Artifact', { type: 'Layout' })
    doc.moveTo(MARGE.left, doc.y).lineTo(A4.breed - MARGE.right, doc.y).lineWidth(0.5).strokeColor(LIJN).stroke()
    doc.endMarkedContent()
    doc.y += 8
  }

  #blok(tag, runs, s, { id, ouder, uitlijning } = {}) {
    const el = this.doc.struct(tag)
    ;(ouder || this.root).add(el)
    this.#tekstBlok(el, runs, s, { id, uitlijning })
    el.end()
  }

  /**
   * Runs binnen één structuurelement schrijven. Runs met link of goTo gaan in
   * een eigen Link-kind (punt 2 in de kop); de rest in marked content van het
   * element zelf. Het element krijgt daardoor meerdere MCID's — dat mag.
   */
  #tekstBlok(el, runs, s, { id, inspring = 0, uitlijning } = {}) {
    const { doc } = this
    const tagNaam = el.dictionary.data.S // pdfkit bewaart /S als string
    doc.y += s.boven
    // Past de eerste regel niet meer boven de ondermarge, dan eerst zelf een
    // nieuwe pagina; loopt het blok daarna door over de grens, dan doet
    // pdfkit dat en tekent `pageAdded` het briefhoofd.
    if (doc.y + s.size * REGEL > A4.hoog - MARGE.bottom) this.nieuwePagina()
    const x = MARGE.left + inspring
    const breedte = A4.breed - MARGE.left - MARGE.right - inspring

    let open = false
    const openMC = () => { if (!open) { el.add(doc.markStructureContent(tagNaam)); open = true } }
    const sluitMC = () => { if (open) { doc.endMarkedContent(); open = false } }

    runs.forEach((run, i) => {
      // Bestemmingen bewaken: pdfkit overschrijft een dubbele named
      // destination zwijgend (elke sprong landt dan op de laatste schrijver)
      // en een sprong naar een niet-bestaande naam doet stil niets. Beide
      // zijn hier een bouwfout; einde() controleert de sprongen.
      const dest = (i === 0 && id) || null
      if (dest) {
        if (this.#dests.has(dest)) throw new Error(`dubbele bestemming "${dest}": elke verwijzing ernaar zou op de laatste landen`)
        this.#dests.add(dest)
      }
      if (run.goTo) this.#sprongen.add(run.goTo)
      const opties = {
        width: breedte,
        lineGap: s.size * (REGEL - 1),
        continued: i < runs.length - 1,
        align: uitlijning || 'left',
        // `underline` alleen waar de oude opmaak hem had (de bronnenlijst); in
        // de lopende tekst is het kleurverschil 3,86:1 het onderscheid (1.4.1).
        underline: !!run.underline,
        // Expliciet null, nooit undefined: zie punt 1 in de kop.
        link: run.link || null,
        goTo: run.goTo || null,
        destination: dest,
      }
      doc
        .font(this.font(run))
        .fontSize(run.sup ? s.size * 0.65 : s.size)
        .fillColor(run.color || (run.link || run.goTo ? BRAND : s.color))
      // Echte superscript: pdfkit legt de basislijn standaard op ascender ×
      // de éígen fontgrootte vanaf de bovenkant van de regel, waardoor een
      // kleinere marker op of onder de basislijn belandde ("4.21"). Een
      // numerieke `baseline` b legt de basislijn b pt boven het invoegpunt:
      // gewone runs expliciet op −ascender × s.size (gelijk aan de default),
      // sup-runs een derde regelhoogte hoger. Altijd expliciet, ook hier:
      // `baseline` erft net als link/goTo over naar de volgende
      // `continued`-run zodra hij undefined is (punt 1 in de kop).
      const basis = -(doc._font.ascender / 1000) * s.size
      opties.baseline = run.sup ? basis + 0.33 * s.size : basis
      const schrijf = () => (i === 0 ? doc.text(run.text, x, doc.y, opties) : doc.text(run.text, opties))

      if (run.link || run.goTo) {
        sluitMC()
        // De closure loopt binnen struct(): _currentStructureElement is dan
        // dit Link-element, zodat link() er structParent van maakt. goTo()
        // doet dat niet uit zichzelf; tijdelijk bijgeleerd.
        const origGoTo = doc.goTo
        doc.goTo = (gx, gy, gw, gh, naam, o) => origGoTo.call(doc, gx, gy, gw, gh, naam, { ...o, structParent: doc._currentStructureElement })
        try {
          const link = doc.struct('Link', [schrijf])
          el.add(link)
          link.end()
        } finally {
          doc.goTo = origGoTo
        }
      } else {
        openMC()
        schrijf()
      }
    })
    sluitMC()
    doc.y += s.onder
  }

  /** Bladwijzer (outline). Geeft het item terug voor geneste bladwijzers. */
  bladwijzer(titel, { ouder } = {}) {
    return (ouder || this.doc.outline).addItem(titel)
  }

  /**
   * Afronden: voetregel met paginanummers op elke pagina (artifact, buiten de
   * leesvolgorde — navigatiehulp op papier) en dan de bytes.
   */
  async einde() {
    const { doc } = this
    const dood = [...this.#sprongen].filter((naam) => !this.#dests.has(naam))
    if (dood.length) {
      throw new Error(`sprong naar niet-bestaande bestemming(en): ${dood.join(', ')} — ` +
        'controleer de ankers in de content (een typefout, of een anker dat wel op de site maar niet in de PDF bestaat)')
    }
    const totaal = doc.bufferedPageRange().count
    for (let i = 0; i < totaal; i++) {
      doc.switchToPage(i)
      // De voetregel staat in de ondermarge, onder page.maxY(); zonder deze
      // truc opent pdfkit per pagina een lege extra (punt 3 in de kop).
      const ondermarge = doc.page.margins.bottom
      doc.page.margins.bottom = 0
      doc.markContent('Artifact', { type: 'Pagination' })
      const y = A4.hoog - MARGE.bottom + 14
      doc.moveTo(MARGE.left, y - 5).lineTo(A4.breed - MARGE.right, y - 5).lineWidth(0.5).strokeColor(LIJN).stroke()
      doc
        .font('Body')
        .fontSize(8)
        .fillColor(META)
        .text(`Pagina ${i + 1} van ${totaal}`, MARGE.left, y, {
          width: A4.breed - MARGE.left - MARGE.right,
          align: 'center',
          lineBreak: false,
        })
      doc.endMarkedContent()
      doc.page.margins.bottom = ondermarge
    }
    this.root.end()
    doc.end()
    return this.klaar
  }
}

/** De drie RO Sans-snedes uit assets/fonts, als Buffers voor registerFont. */
export function laadFonts(root = new URL('..', import.meta.url)) {
  const lees = (p) => fs.readFileSync(new URL(p, root))
  return {
    normal: lees('assets/fonts/ro-sans-regular.ttf'),
    bold: lees('assets/fonts/ro-sans-bold.ttf'),
    italic: lees('assets/fonts/ro-sans-italic.ttf'),
  }
}

/** Het briefhoofd-SVG (lint + woordmerk als contouren). */
export function laadBriefhoofd(root = new URL('..', import.meta.url)) {
  return fs.readFileSync(new URL('assets/print/briefhoofd.svg', root), 'utf8')
}
