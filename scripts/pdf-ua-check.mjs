// Controleert of een PDF de markers draagt die een schermlezer nodig heeft.
//
// Gebruik:  node scripts/pdf-ua-check.mjs bestand.pdf [meer.pdf …]
// Exit 1 zodra één van de gecontroleerde PDF's een verplichte marker mist.
//
// Waarom dit los van de andere scans staat: axe en htmltest kijken naar HTML.
// De PDF-export is een niet-webdocument en valt onder EN 301 549 §10; wat daar
// misgaat is met geen enkele HTML-controle te zien. Zie bevinding 6 in
// docs/toegankelijkheidsonderzoek-2026-08.md en het besluit in
// docs/besluit-toegankelijke-pdf.md.
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
// De markers staan in de catalogus. Die kan als los object in de PDF staan
// (leesbaar in de ruwe bytes) of in een gecomprimeerde object-stream, dus
// worden alle FlateDecode-streams uitgepakt en meegezocht. Een marker die
// alleen in een uitgepakte stream staat telt net zo goed.
import fs from 'node:fs'
import zlib from 'node:zlib'
import { pathToFileURL } from 'node:url'
import { PDFDocument, PDFName } from 'pdf-lib'

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
    try {
      const doc = await PDFDocument.load(buf, { updateMetadata: false })
      cat = doc.catalog
      ctx = doc.context
    } catch {
      // niet-parsebaar: de substringcontrole hieronder meldt wat er mist
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
    const gemist = MARKERS.filter(([marker]) =>
      cat ? !inCatalogus[marker](cat, ctx) : !inhoud.includes(marker))
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
  }

  console.log(`\n${bestanden.length} PDF('s) gecontroleerd, ${ontbreekt} ontbrekende marker(s).`)
  process.exit(ontbreekt > 0 ? 1 : 0)
}
