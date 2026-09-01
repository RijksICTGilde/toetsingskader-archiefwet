// Genereert de PDF's uit de pdfdata-JSON in de gebouwde site, met pdfkit.
//
// Gebruik:  hugo --baseURL / --destination public
//           node scripts/pdf-build.mjs public        (of: npm run build:pdf)
//
// Voor elke `…/index.pdfdata.json` komt er een `…/index.pdf` naast te staan;
// de JSON zelf wordt daarna opgeruimd (tussenproduct, geen sitepagina).
//
// Zelfde oplossing als de AI-verordening-beslishulp
// (MinBZK/ai-verordening-beslishulp#1047): pdfkit met een handgebouwde
// structuurboom via markStructureContent(). Anders dan daar draait dit bij de
// build in Node in plaats van in de browser — de inhoud is statisch, dus de
// downloadlink blijft een gewoon bestand en er is geen browser of Chromium
// meer nodig. Zie docs/besluit-toegankelijke-pdf.md (§11).
//
// Controle achteraf: npm run test:pdf-ua (markers + structuurelementen).
import fs from 'node:fs'
import path from 'node:path'
import { parseHTML } from 'linkedom'
import { TaggedPdf, laadFonts, laadBriefhoofd } from './pdf-tagged.mjs'
import { schrijfNorm } from './pdf-html.mjs'
import { kopvolgordeFouten, dubbeleIdFouten } from './a11y-checks.mjs'

const root = process.argv[2] || 'public'

const fonts = laadFonts()
const briefhoofdSvg = laadBriefhoofd()

function vindPdfdata(dir) {
  const uit = []
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name === 'index.pdfdata.json') uit.push(p)
    }
  }
  walk(path.resolve(dir))
  return uit.sort()
}

function nieuw(data) {
  return new TaggedPdf({
    titel: data.kind === 'kader' ? data.titel : `${data.titel} | ${data.site_titel}`,
    taal: data.taal,
    versie: data.versie,
    fonts,
    briefhoofdSvg,
  })
}

// Titelpagina: dezelfde regels als de eerdere exports. De datum is de
// bouwdatum — er wordt niets meer bij de bezoeker gegenereerd.
function titelpagina(pdf, titel, data) {
  pdf.nieuwePagina()
  pdf.doc.y = 92 + 168 // zelfde witruimte boven de titel als de oude export
  pdf.kop(1, titel, { stijl: 'cover', uitlijning: 'center' })
  const datum = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long' }).format(new Date())
  pdf.alinea([{ text: `Gegenereerd op ${datum}` }], { stijl: 'meta', uitlijning: 'center' })
  // Eén run: pdfkit centreert een doorlopende reeks runs over elkaar heen.
  pdf.alinea([{ text: `Bron: ${data.url}`, link: data.url }], { stijl: 'meta', uitlijning: 'center' })
  pdf.alinea([{ text: `Versie: ${data.versie || 'onbekend'}` }], { stijl: 'meta', uitlijning: 'center' })
}

// "Belangrijke informatie" achterin, met het voorbehoud — de drie regels die
// al in de pdfMake-export stonden.
function colofon(pdf, url) {
  pdf.kop(2, 'Belangrijke informatie', { stijl: 'colofonH' })
  pdf.lijst(
    [
      [{ text: 'Dit is een automatisch gegenereerd document op basis van de online versie van het toetsingskader.' }],
      [
        { text: 'De inhoud is in ontwikkeling en kan wijzigen; raadpleeg voor de actuele tekst altijd ' },
        { text: url, link: url },
        { text: '.' },
      ],
      [{ text: 'Aan dit document kunnen geen rechten worden ontleend.' }],
    ],
    { stijl: 'colofon' }
  )
}

async function bouwNorm(data) {
  const pdf = nieuw(data)
  titelpagina(pdf, data.titel, data)
  pdf.nieuwePagina()
  schrijfNorm(pdf, data, { siteUrl: data.site_url, bladwijzer: pdf.doc.outline })
  colofon(pdf, data.url)
  return pdf.einde()
}

// Kader in twee doorlopen: de inhoudsopgave staat vóór de normen, dus de
// paginanummers zijn pas na een eerste opbouw bekend. De tweede doorloop zet
// ze erbij; de nummers rechts veranderen de paginaval niet, en dat wordt
// gecontroleerd — wijkt de telling af, dan liever een inhoudsopgave zonder
// nummers dan een die ernaast zit. (Zelfde afweging als de vorige pijplijn.)
async function bouwKaderEenmaal(data, paginas) {
  const pdf = nieuw(data)
  titelpagina(pdf, data.titel, data)

  pdf.nieuwePagina()
  pdf.kop(2, 'Inhoudsopgave', { stijl: 'sectie' })
  pdf.lijst(
    data.normen.map((n) => {
      const runs = [{ text: n.titel, goTo: `norm-${n.norm_id}` }]
      const p = paginas?.[n.norm_id]
      // Het nummer is navigatiehulp naast de link; gedempt, zoals eerst.
      if (p) runs.push({ text: `  —  ${p}`, color: '#666666' })
      return runs
    }),
    { stijl: 'toc', geordend: true }
  )

  const gevonden = {}
  for (const norm of data.normen) {
    pdf.nieuwePagina() // elke norm op een eigen pagina, zoals eerst
    gevonden[norm.norm_id] = pdf.paginaNummer()
    const bw = pdf.bladwijzer(norm.titel)
    pdf.kop(2, norm.titel, { stijl: 'sectie', id: `norm-${norm.norm_id}` })
    schrijfNorm(pdf, norm, {
      prefix: `n${norm.norm_id}-`,
      kopShift: 1,
      siteUrl: data.site_url,
      bladwijzer: bw,
    })
  }
  colofon(pdf, data.url)
  return { bytes: await pdf.einde(), paginas: gevonden }
}

async function bouwKader(data) {
  const eerste = await bouwKaderEenmaal(data, null)
  const tweede = await bouwKaderEenmaal(data, eerste.paginas)
  const gelijk = JSON.stringify(eerste.paginas) === JSON.stringify(tweede.paginas)
  if (!gelijk) console.warn('  inhoudsopgave zonder paginanummers: de telling verschoof tussen de doorlopen')
  return gelijk ? tweede.bytes : eerste.bytes
}

const bestanden = vindPdfdata(root)
if (bestanden.length === 0) {
  console.error(`Geen index.pdfdata.json gevonden onder ${root}.`)
  console.error('Deze stap ruimt zijn eigen invoer op, dus draait één keer per')
  console.error('Hugo-build. Bouw de site opnieuw en probeer het dan nog eens.')
  process.exit(1)
}

// De structuurboom volgt de koppen en ankers uit de content. Een dubbel anker
// is fataal: verwijzingen landen dan op de verkeerde bron. Een overgeslagen
// kopniveau (`## Voorschriften` → `#### Voorschrift`, zoals de normbladen het
// schrijven) normaliseert scripts/pdf-html.mjs in de PDF-tags; dat wordt hier
// gemeld, zodat zichtbaar blijft waar de boom van de content afwijkt.
function structuurFouten(data) {
  const fouten = []
  const normen = data.kind === 'kader' ? data.normen : [data]
  for (const norm of normen) {
    const { document } = parseHTML(`<!DOCTYPE html><html><body><h1>x</h1>${norm.kern_html ? '<h2>Kern</h2>' : ''}${norm.body_html || ''}</body></html>`)
    for (const f of kopvolgordeFouten(document)) console.warn(`  norm ${norm.norm_id}: ${f} — in de PDF genormaliseerd naar één niveau dieper`)
    for (const id of dubbeleIdFouten(document)) fouten.push(`norm ${norm.norm_id}: dubbel anker "${id}"`)
  }
  return fouten
}

for (const bestand of bestanden) {
  const data = JSON.parse(fs.readFileSync(bestand, 'utf8'))
  if (!data.kind) {
    fs.rmSync(bestand) // lege stub van een pagina zonder norm_id
    continue
  }
  const doel = bestand.replace(/index\.pdfdata\.json$/, 'index.pdf')
  const fouten = structuurFouten(data)
  if (fouten.length) {
    for (const f of fouten) console.error(`${path.relative(root, bestand)} — ${f}`)
    process.exit(1)
  }
  const bytes = data.kind === 'kader' ? await bouwKader(data) : await bouwNorm(data)
  fs.writeFileSync(doel, bytes)
  // De JSON is invoer, geen pagina: laten staan betekent een kale kopie van
  // elke normtekst op de gedeployde site.
  fs.rmSync(bestand)
  console.log(`${path.relative(root, doel)} — ${Math.round(bytes.length / 1024)} kB`)
}

console.log(`\n${bestanden.length} PDF('s) geschreven. Controleer met: npm run test:pdf-ua`)
