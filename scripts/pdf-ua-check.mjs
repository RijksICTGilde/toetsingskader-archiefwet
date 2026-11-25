// Controleert of een PDF de markers draagt die een schermlezer nodig heeft.
//
// Gebruik:  node scripts/pdf-ua-check.mjs bestand.pdf [meer.pdf …]
// Exit 1 zodra één van de gecontroleerde PDF's een verplichte marker mist.
//
// Waarom dit los van de andere scans staat: axe en htmltest kijken naar HTML.
// De PDF-export is een niet-webdocument en valt onder EN 301 549 §10; wat daar
// misgaat is met geen enkele HTML-controle te zien. Zie bevinding 6 in
// docs/pdr/0001-toegankelijkheid-toetsen-op-wcag-2-2-aa.md en het besluit in
// docs/pdr/0003-pdf-bij-de-build-genereren-met-tags.md.
//
// De markers, en wat een gebruiker merkt als ze ontbreken:
//
//   /StructTreeRoot  de structuurboom (koppen, lijsten, alinea's). Zonder deze
//                    is er niets om op te navigeren: een schermlezer leest de
//                    pagina als één lap tekst, zonder koppenlijst en zonder
//                    lijststructuur bij criteria en indicatoren.
//   /MarkInfo        de vlag "dit document is getagd". Zonder deze negeert
//                    hulpsoftware de structuur ook als hij er zou zijn.
//   /Lang            de taal. Zonder deze leest een schermlezer Nederlandse
//                    tekst mogelijk met een Engelse stem voor.
//   /DisplayDocTitle de viewer toont de documenttitel in plaats van de
//                    bestandsnaam — de PDF-tegenhanger van een paginatitel.
//
// Daarnaast de tags van wat getekend is: het briefhoofd op pagina 1 als Figure
// met /Alt, de herhaling als Artifact (logoFouten). En links naar de
// bronnenlijst hebben een beschrijving, niet alleen het nummer (nootlinkFouten).
//
// De markers staan in de catalogus. Die kan als los object in de PDF staan
// (leesbaar in de ruwe bytes) of in een gecomprimeerde object-stream, dus
// worden alle FlateDecode-streams uitgepakt en meegezocht. Een marker die
// alleen in een uitgepakte stream staat telt net zo goed.
import fs from 'node:fs'
import zlib from 'node:zlib'
import { pathToFileURL } from 'node:url'
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFNumber, PDFString, PDFHexString, PDFRawStream, decodePDFRawStream } from 'pdf-lib'

const MARKERS = [
  ['/StructTreeRoot', 'structuurboom (koppen, lijsten, leesvolgorde)'],
  ['/MarkInfo', 'vlag "document is getagd"'],
  ['/Lang', 'taal van het document'],
  ['/DisplayDocTitle', 'viewer toont de titel, niet de bestandsnaam'],
]

// Elke FlateDecode-stream uitpakken en achter de ruwe bytes plakken, zodat één
// enkele zoekactie zowel losse objecten als object-streams dekt. Streams die
// niet uit te pakken zijn (andere filter, kapot) worden overgeslagen: dit is
// een controle, geen parser.
export function metUitgepakteStreams(buf) {
  const delen = [buf.toString('latin1')]
  const bytes = buf
  let i = 0
  while ((i = bytes.indexOf('stream', i)) !== -1) {
    let start = i + 'stream'.length
    if (bytes[start] === 0x0d) start++
    if (bytes[start] === 0x0a) start++
    const eind = bytes.indexOf('endstream', start)
    if (eind === -1) break
    try {
      delen.push(zlib.inflateSync(bytes.subarray(start, eind)).toString('latin1'))
    } catch {
      // geen (geldige) FlateDecode-stream; overslaan
    }
    i = eind + 'endstream'.length
  }
  return delen.join('\n')
}

const tekstVan = (obj) => (obj instanceof PDFString || obj instanceof PDFHexString ? obj.decodeText() : '')
// Alleen cijfers is wat een schermlezer bij een voetnootmarkering zou horen.
const zegtIets = (t) => !!t && !/^[\s\d]*$/.test(t)

/**
 * Alle structuurelementen met hun inhoud: MCID's per pagina en OBJR's.
 * pdfkit zet een kaal MCID in /K met de pagina in /Pg van het element; een
 * MCR-woordenboek draagt zijn eigen /Pg.
 */
export function structElementen(doc) {
  const ctx = doc.context
  const uit = []
  const bezocht = new Set()
  const loop = (k) => {
    const obj = ctx.lookup(k)
    if (obj instanceof PDFArray) { for (const kind of obj.asArray()) loop(kind); return }
    if (!(obj instanceof PDFDict) || bezocht.has(obj)) return
    bezocht.add(obj)
    const s = obj.get(PDFName.of('S'))
    const kinderen = obj.get(PDFName.of('K'))
    if (!s) { if (kinderen) loop(kinderen); return }
    const el = { S: s.asString().slice(1), dict: obj, mcids: [], objrs: [] }
    const pg = obj.get(PDFName.of('Pg'))
    const lijst = kinderen === undefined ? [] : (ctx.lookup(kinderen) instanceof PDFArray ? ctx.lookup(kinderen).asArray() : [kinderen])
    for (const kind of lijst) {
      const o = ctx.lookup(kind)
      if (o instanceof PDFNumber) el.mcids.push({ pg, mcid: o.asNumber() })
      else if (o instanceof PDFDict && String(o.get(PDFName.of('Type'))) === '/MCR') {
        el.mcids.push({ pg: o.get(PDFName.of('Pg')) || pg, mcid: o.get(PDFName.of('MCID')).asNumber() })
      } else if (o instanceof PDFDict && String(o.get(PDFName.of('Type'))) === '/OBJR') {
        el.objrs.push(ctx.lookup(o.get(PDFName.of('Obj'))))
      } else loop(kind)
    }
    uit.push(el)
  }
  loop(doc.catalog.get(PDFName.of('StructTreeRoot')))
  return uit
}

function inhoudVanPagina(page) {
  const ctx = page.doc.context
  const c = ctx.lookup(page.node.get(PDFName.of('Contents')))
  const streams = c instanceof PDFArray ? c.asArray().map((r) => ctx.lookup(r)) : [c]
  return streams.map((s) => (s instanceof PDFRawStream ? Buffer.from(decodePDFRawStream(s).decode()).toString('latin1') : '')).join('\n')
}

/**
 * Het briefhoofd (beeldmerk met de namen van Inspectie en ministerie) is
 * getekend, geen tekst. Op pagina 1 moet het een Figure met een niet-lege
 * /Alt zijn (WCAG 1.1.1: wie het document stuurt); de herhaling op de andere
 * pagina's een Artifact. Algemener: elke `Do` (beeld of Form XObject) staat in
 * een Artifact of in een Figure met /Alt.
 */
export function logoFouten(doc) {
  const fouten = []
  const pages = doc.getPages()
  const figuren = structElementen(doc).filter((el) => el.S === 'Figure')
  const doRe = /\/([A-Za-z]+)\s*(<<(?:[^<>]|<<[^<>]*>>)*>>)?\s*BDC\s*\/([^\s/]+)\s+Do\b/g
  const alleDo = /\/[^\s/]+\s+Do\b/g
  let figuurOpEen = false
  pages.forEach((page, i) => {
    const inhoud = inhoudVanPagina(page)
    const getagd = [...inhoud.matchAll(doRe)]
    const kaal = (inhoud.match(alleDo) || []).length - getagd.length
    if (kaal > 0) fouten.push(`pagina ${i + 1}: ${kaal} getekend object(en) buiten marked content (geen Figure, geen Artifact)`)
    for (const [, tag, props, naam] of getagd) {
      if (tag === 'Artifact') continue
      if (tag !== 'Figure') {
        fouten.push(`pagina ${i + 1}: /${naam} Do staat in /${tag}, niet in Figure of Artifact`)
        continue
      }
      const mcid = Number(props?.match(/\/MCID\s+(\d+)/)?.[1])
      const el = figuren.find((f) => f.mcids.some((m) => m.mcid === mcid && m.pg === page.ref))
      const alt = el ? tekstVan(el.dict.get(PDFName.of('Alt'))).trim() : ''
      if (!alt) fouten.push(`pagina ${i + 1}: Figure (/${naam}) zonder tekstalternatief (/Alt)`)
      if (i === 0) figuurOpEen = true
      else fouten.push(`pagina ${i + 1}: herhaald briefhoofd (/${naam}) is een Figure; hoort een Artifact te zijn`)
    }
  })
  if (!figuurOpEen) fouten.push('pagina 1: briefhoofd is geen Figure met /Alt; een schermlezer zegt niet van wie het document is')
  return fouten
}

/**
 * Een link naar de bronnenlijst heeft als zichtbare tekst alleen het
 * voetnootnummer. Zonder beschrijving staat er in een linklijst "1", "10"
 * (WCAG 2.4.4). Eis: /Alt op het Link-element én /Contents op elke annotatie
 * (PDF/UA-1 7.18.5), en geen van beide alleen cijfers.
 */
export function nootlinkFouten(doc) {
  const fouten = []
  for (const el of structElementen(doc)) {
    if (el.S !== 'Link') continue
    for (const annot of el.objrs) {
      const actie = doc.context.lookup(annot?.get(PDFName.of('A')))
      const doel = tekstVan(doc.context.lookup(actie?.get?.(PDFName.of('D'))))
      if (!/(^|-)fn:[^:]+$/.test(doel)) continue
      const alt = tekstVan(el.dict.get(PDFName.of('Alt')))
      const contents = tekstVan(annot.get(PDFName.of('Contents')))
      if (!zegtIets(alt)) fouten.push(`link naar ${doel}: /Alt van het Link-element is "${alt}"`)
      if (!zegtIets(contents)) fouten.push(`link naar ${doel}: /Contents van de annotatie is "${contents}"`)
    }
  }
  return fouten
}

// Als CLI: de controle draaien. Als module (de tests importeren de
// uitpak-helper hierboven, zodat gate en test dezelfde bytes zien): niets doen.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bestanden = process.argv.slice(2)
  if (bestanden.length === 0) {
    console.error('Gebruik: node scripts/pdf-ua-check.mjs bestand.pdf [meer.pdf …]')
    process.exit(2)
  }

  let ontbreekt = 0
  for (const pad of bestanden) {
    // Een pad dat niet bestaat is hier een fout, geen uitzondering: als de
    // buildstap geen PDF heeft geschreven, is dat precies wat deze controle
    // hoort te melden. Een niet-uitgevouwen glob komt hier ook terecht.
    if (!fs.existsSync(pad)) {
      console.log(`${pad} — bestaat niet; is scripts/pdf-build.mjs gedraaid?`)
      ontbreekt++
      continue
    }
    const buf = fs.readFileSync(pad)
    if (buf.subarray(0, 5).toString() !== '%PDF-') {
      console.log(`${pad} — geen PDF`)
      ontbreekt++
      continue
    }
    const inhoud = metUitgepakteStreams(buf)
    // Verankering in de catalogus meten, niet alleen de substring: een
    // losgeraakt object ("boom bestaat, catalogus wijst er niet meer naar" —
    // precies de vlag-zonder-inhoud-klasse) zou een substring-zoektocht
    // false-groen laten passeren.
    let cat = null
    let ctx = null
    let doc = null
    try {
      doc = await PDFDocument.load(buf, { updateMetadata: false })
      cat = doc.catalog
      ctx = doc.context
    } catch (e) {
      // Fail closed: een PDF die pdf-lib niet kan parsen keurt de controle
      // af — een substring-terugval kon een kapot bestand met toevallig de
      // juiste bytes groen laten passeren.
      console.log(`${pad} — niet te parsen door pdf-lib (${e.message}); afgekeurd`)
      ontbreekt++
      continue
    }
    const inCatalogus = {
      '/StructTreeRoot': (c) => !!c.get(PDFName.of('StructTreeRoot')),
      '/MarkInfo': (c) => !!c.get(PDFName.of('MarkInfo')),
      '/Lang': (c) => !!c.get(PDFName.of('Lang')),
      '/DisplayDocTitle': (c, ctx) => {
        // De voorkeur zelf moet er staan én waar zijn; een ViewerPreferences
        // met alleen /Direction toont nog steeds de bestandsnaam.
        const vp = ctx.lookup(c.get(PDFName.of('ViewerPreferences')))
        return String(vp?.get?.(PDFName.of('DisplayDocTitle')) || '') === 'true'
      },
    }
    const gemist = MARKERS.filter(([marker]) => !inCatalogus[marker](cat, ctx))
    const aanwezig = MARKERS.length - gemist.length
    // De vier markers zijn een belofte; deze telling controleert of hij wordt
    // waargemaakt. Een /StructTreeRoot met een lege boom was precies de
    // pdfMake-val (en wat de beslishulp in MinBZK/ai-verordening-beslishulp#1047
    // mat): de vlag stond aan, de boom was leeg. Elk document heeft een kop en
    // alinea's; /LBody wordt alleen geëist als de boom zelf lijsten (/S /L)
    // claimt — een norm zonder lijsten (kern-only) is geldig en mag niet rood
    // kleuren.
    // Op /S matchen, niet op de kale naam: elke structuurknoop draagt óók een
    // parent-key "/P n 0 R", waardoor een kale /P-zoektocht nooit kan falen.
    const heeftS = (naam) => new RegExp(`/S\\s*/${naam}(?![A-Za-z])`).test(inhoud)
    const boom = []
    if (!heeftS('H1')) boom.push('/S /H1')
    if (!heeftS('P')) boom.push('/S /P')
    if (heeftS('L') && !heeftS('LBody')) boom.push('/S /LBody')
    console.log(`${pad} — ${aanwezig}/${MARKERS.length} markers, ${buf.length} bytes`)
    for (const [marker, uitleg] of gemist) {
      console.log(`    ontbreekt ${marker} — ${uitleg}`)
      ontbreekt++
    }
    for (const tag of boom) {
      console.log(`    ontbreekt ${tag} in de structuurboom — de boom is (bijna) leeg terwijl de markers er staan`)
      ontbreekt++
    }
    for (const f of logoFouten(doc)) {
      console.log(`    ${f}`)
      ontbreekt++
    }
    const noten = nootlinkFouten(doc)
    for (const f of noten.slice(0, 3)) console.log(`    ${f}`)
    if (noten.length > 3) console.log(`    … en nog ${noten.length - 3}`)
    ontbreekt += noten.length
  }

  console.log(`\n${bestanden.length} PDF('s) gecontroleerd, ${ontbreekt} ontbrekende marker(s).`)
  process.exit(ontbreekt > 0 ? 1 : 0)
}
