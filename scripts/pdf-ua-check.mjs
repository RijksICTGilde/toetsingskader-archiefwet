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
function metUitgepakteStreams(buf) {
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
  const gemist = MARKERS.filter(([marker]) => !inhoud.includes(marker))
  const aanwezig = MARKERS.length - gemist.length
  console.log(`${pad} — ${aanwezig}/${MARKERS.length} markers, ${buf.length} bytes`)
  for (const [marker, uitleg] of gemist) {
    console.log(`    ontbreekt ${marker} — ${uitleg}`)
    ontbreekt++
  }
}

console.log(`\n${bestanden.length} PDF('s) gecontroleerd, ${ontbreekt} ontbrekende marker(s).`)
process.exit(ontbreekt > 0 ? 1 : 0)
