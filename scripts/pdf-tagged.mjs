// Getagde PDF-opbouw met pdfkit: elk tekstblok wordt via markStructureContent()
// aan een structuurelement gekoppeld, zodat de PDF een leesvolgorde met echte
// koppen en lijsten krijgt (WCAG 1.3.1, EN 301 549 §10).
//
// Zelfde aanpak als de AI-verordening-beslishulp
// (MinBZK/ai-verordening-beslishulp#1047, frontend/src/services/pdfTagged.ts),
// maar in Node bij de build: de inhoud is statisch, dus de bezoeker hoeft niets
// te genereren en de downloadlink blijft een gewoon bestand.
//
// De maten en kleuren komen uit de eerdere exports (pdfMake, daarna print.css):
// A4, marges [48, 92, 48, 56]pt, RO Sans, brand #007bc7.
//
// Wie hier iets aan verandert: `npm run build:pdf && npm run test:pdf-ua`
// draait lokaal — geen browser nodig.
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

// Stijlen als [fontgrootte, vet, kleur, marge-boven, marge-onder].
const STIJL = {
  cover: { size: 26, bold: true, color: BRAND, boven: 0, onder: 24 },
  sectie: { size: 20, bold: true, color: BRAND, boven: 0, onder: 16 },
  h2: { size: 16, bold: true, color: BRAND, boven: 14, onder: 6 },
  h3: { size: 13, bold: true, color: TEKST, boven: 10, onder: 4 },
  h4: { size: 11, bold: true, color: TEKST, boven: 8, onder: 2 },
  para: { size: 10.5, bold: false, color: TEKST, boven: 0, onder: 6 },
  meta: { size: 12, bold: false, color: META, boven: 4, onder: 0 },
  bronnenH: { size: 10, bold: true, color: BRAND, boven: 14, onder: 4 },
  colofonH: { size: 13, bold: true, color: BRAND, boven: 18, onder: 6 },
  bronnen: { size: 8.5, bold: false, color: NOOT, boven: 0, onder: 2 },
  colofon: { size: 9.5, bold: false, color: NOOT, boven: 0, onder: 2 },
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
    this.root = this.doc.struct('Document')
    this.doc.addStructure(this.root)
    this.klaar = new Promise((resolve) => {
      const delen = []
      this.doc.on('data', (d) => delen.push(d))
      this.doc.on('end', () => resolve(Buffer.concat(delen)))
    })
  }

  font(run) {
    if (run.bold) return 'BodyBold'
    if (run.italics) return 'BodyItalic'
    return 'Body'
  }

  /** Nieuwe pagina met het briefhoofd als artifact (buiten de leesvolgorde). */
  nieuwePagina() {
    this.doc.addPage()
    if (this.briefhoofdSvg) {
      // Het lint stond in de oude export gecentreerd (lint 26pt breed) en
      // tegen de bovenrand; het briefhoofd-SVG is 202,282×52pt met het lint op
      // x=0..26, dus het geheel begint op paginamidden − 13pt.
      this.doc.markContent('Artifact', { type: 'Pagination' })
      SVGtoPDF(this.doc, this.briefhoofdSvg, A4.breed / 2 - 13, 0)
      this.doc.endMarkedContent()
    }
    this.doc.x = MARGE.left
    this.doc.y = MARGE.top
  }

  paginaNummer() {
    return this.doc.bufferedPageRange().count
  }

  /** Kop als H<niveau>-structuurelement; zet ook een named destination. */
  kop(niveau, tekst, { stijl, id, ouder, uitlijning } = {}) {
    const s = STIJL[stijl || 'h' + niveau]
    const tag = 'H' + niveau
    this.#blok(tag, [{ text: tekst, bold: s.bold }], s, { id, ouder, uitlijning })
  }

  /** Alinea; runs = [{text, bold, italics, sup, underline, color, link, goTo}]. */
  alinea(runs, { stijl = 'para', ouder, id, uitlijning } = {}) {
    this.#blok('P', runs, STIJL[stijl], { id, ouder, uitlijning })
  }

  /**
   * Lijst: items zijn arrays van runs (of {runs, id}). Structuur L → LI →
   * LBody, zoals de beslishulp en zoals PAC hem verwacht. Genummerde lijsten
   * krijgen het nummer in de tekst; pdfkit nummert niet zelf.
   */
  lijst(items, { stijl = 'para', geordend = false, start = 1, label = true, ouder } = {}) {
    const s = STIJL[stijl]
    const l = this.doc.struct('L')
    ;(ouder || this.root).add(l)
    items.forEach((item, i) => {
      const runs = Array.isArray(item) ? item : item.runs
      const id = Array.isArray(item) ? undefined : item.id
      const li = this.doc.struct('LI')
      l.add(li)
      const lbody = this.doc.struct('LBody')
      li.add(lbody)
      // `label: false` voor lijsten waarvan de items zelf al een nummer dragen
      // (de inhoudsopgave: de normtitels heten "1. Inbeheername en beheer").
      const prefix = !label ? [] : [{ text: geordend ? `${start + i}. ` : '•  ' }]
      this.#tekstBlok(lbody, [...prefix, ...runs], s, {
        id,
        inspring: 14,
      })
      lbody.end()
      li.end()
    })
    l.end()
    this.doc.y += s.onder
  }

  /** Horizontale lijn als artifact (decoratie, geen inhoud). */
  lijn() {
    const { doc } = this
    doc.markContent('Artifact', { type: 'Layout' })
    doc
      .moveTo(MARGE.left, doc.y)
      .lineTo(A4.breed - MARGE.right, doc.y)
      .lineWidth(0.5)
      .strokeColor(LIJN)
      .stroke()
    doc.endMarkedContent()
    doc.y += 8
  }

  #blok(tag, runs, s, { id, ouder, uitlijning } = {}) {
    const el = this.doc.struct(tag)
    ;(ouder || this.root).add(el)
    this.#tekstBlok(el, runs, s, { id, uitlijning })
    el.end()
  }

  /** Runs binnen één marked-content-blok schrijven, met stijl en paginaval. */
  #tekstBlok(el, runs, s, { id, inspring = 0, uitlijning } = {}) {
    const { doc } = this
    doc.y += s.boven
    // Past de eerste regel niet meer boven de ondermarge, dan eerst een nieuwe
    // pagina — anders schrijft pdfkit hem er zelf, maar buiten ons briefhoofd om.
    if (doc.y + s.size * REGEL > A4.hoog - MARGE.bottom) this.nieuwePagina()
    el.add(doc.markStructureContent(el.dictionary.data.S.name))
    const x = MARGE.left + inspring
    const breedte = A4.breed - MARGE.left - MARGE.right - inspring
    runs.forEach((run, i) => {
      const laatste = i === runs.length - 1
      const opties = {
        width: breedte,
        lineGap: s.size * (REGEL - 1),
        continued: !laatste,
        align: uitlijning || 'left',
        // `underline` alleen waar de oude opmaak hem had (de bronnenlijst);
        // in de lopende tekst is het kleurverschil 3,86:1 het onderscheid
        // (1.4.1), net als op print.css en in de oude export.
        underline: run.underline || false,
        link: run.link || undefined,
        goTo: run.goTo || undefined,
        destination: (i === 0 && id) || undefined,
      }
      doc
        .font(this.font(run))
        .fontSize(run.sup ? s.size * 0.65 : s.size)
        .fillColor(run.color || (run.link || run.goTo ? BRAND : s.color))
      if (i === 0) doc.text(run.text, x, doc.y, opties)
      else doc.text(run.text, opties)
    })
    doc.endMarkedContent()
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
    const totaal = doc.bufferedPageRange().count
    for (let i = 0; i < totaal; i++) {
      doc.switchToPage(i)
      doc.markContent('Artifact', { type: 'Pagination' })
      const y = A4.hoog - MARGE.bottom + 14
      doc
        .moveTo(MARGE.left, y - 5)
        .lineTo(A4.breed - MARGE.right, y - 5)
        .lineWidth(0.5)
        .strokeColor(LIJN)
        .stroke()
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
