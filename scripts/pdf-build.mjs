// Genereert de PDF's uit de pdfdata-JSON in de gebouwde site, met pdfkit.
//
// Gebruik:  hugo --environment production --minify   (absolute baseURL!)
//           node scripts/pdf-build.mjs public          (of: npm run build:pdf)
//
// Niet met `--baseURL /` bouwen: url/site_url in de pdfdata-JSON worden dan
// site-relatief en belanden zo in de linkannotaties — een gedownloade PDF kan
// die nergens tegen oplossen. De contractcontrole hieronder vangt dat.
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
import { schrijfNorm, ankersVan } from './pdf-html.mjs'
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

// "1 september 2026" in Nederlandse tijd, zonder te vertrouwen op nl-locale-
// data: Alpine's Node (containerbuild) heeft alleen de Engelse ICU-set en zou
// "September 1, 2026" geven; de tijdzone voorkomt dat een nachtelijke build
// de vorige dag stempelt.
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
function datumNL(d) {
  const delen = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'numeric', year: 'numeric' })
      .formatToParts(d).filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)])
  )
  return `${delen.day} ${MAANDEN[delen.month - 1]} ${delen.year}`
}

// Titelpagina: dezelfde regels als de eerdere exports. De datum is de
// bouwdatum — er wordt niets meer bij de bezoeker gegenereerd.
function titelpagina(pdf, titel, data) {
  pdf.nieuwePagina()
  pdf.doc.y = 92 + 168 // zelfde witruimte boven de titel als de oude export
  pdf.kop(1, titel, { stijl: 'cover', uitlijning: 'center' })
  const datum = datumNL(new Date())
  pdf.alinea([{ text: `Gegenereerd op ${datum}` }], { stijl: 'meta', uitlijning: 'center' })
  // Eén run: pdfkit centreert een doorlopende reeks runs over elkaar heen.
  pdf.alinea([{ text: `Bron: ${data.url}`, link: data.url }], { stijl: 'meta', uitlijning: 'center' })
  pdf.alinea([{ text: `Versie: ${data.versie || 'onbekend'}` }], { stijl: 'meta', uitlijning: 'center' })
}

// Versieregel achterin — de vorm die de feedback van 25 augustus 2026 vroeg in
// plaats van het blok "Belangrijke informatie": één zin met het versienummer
// en een link naar de site (site-root, niet de pagina: bij de kader-PDF is dat
// /normen/). Geen "in ontwikkeling en kan wijzigen" meer; die zin is weg.
function colofon(pdf, data) {
  const site = data.site_url || data.url
  pdf.alinea(
    [
      { text: `Dit is versie ${data.versie || 'onbekend'} van het toetsingskader. Bekijk voor de actuele versie ` },
      { text: site, link: site },
      { text: '. Aan dit document kunnen geen rechten worden ontleend.' },
    ],
    { stijl: 'colofon' }
  )
}

async function bouwNorm(data) {
  const pdf = nieuw(data)
  titelpagina(pdf, data.titel, data)
  pdf.nieuwePagina()
  schrijfNorm(pdf, data, { siteUrl: data.site_url, paginaUrl: data.url, bladwijzer: pdf.doc.outline })
  colofon(pdf, data)
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
    // Geen eigen nummering: de normtitels dragen hun nummer al ("1. …").
    { stijl: 'toc', label: false }
  )

  // Kruisverwijzingen tussen normen worden sprongen binnen het document; per
  // norm reizen de echte ankers mee, zodat een link naar een anker dat alleen
  // op de site bestaat naar het begin van die norm springt.
  const normDests = {}
  for (const n of data.normen) {
    if (n.slug) normDests[n.slug] = { dest: `norm-${n.norm_id}`, prefix: `n${n.norm_id}-`, ankers: ankersVan(n) }
  }

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
      paginaUrl: norm.slug ? `${data.site_url.replace(/\/$/, '')}/normen/${norm.slug}/` : data.url,
      bladwijzer: bw,
      normDests,
    })
  }
  colofon(pdf, data)
  return { bytes: await pdf.einde(), paginas: gevonden }
}

async function bouwKader(data) {
  const eerste = await bouwKaderEenmaal(data, null)
  const tweede = await bouwKaderEenmaal(data, eerste.paginas)
  if (JSON.stringify(eerste.paginas) !== JSON.stringify(tweede.paginas)) {
    // Twee doorlopen over dezelfde invoer horen deterministisch te zijn; als
    // het bijschrijven van " — <nr>" de paginaval verschuift is dat een
    // layoutprobleem dat opgelost moet worden, geen degradatie om stil door
    // te laten (de vorige stille terugval was in geen enkele controle
    // zichtbaar).
    console.error('  paginatelling verschoof tussen de twee doorlopen; inhoudsopgave zou verkeerde nummers dragen')
    console.error(`  eerste: ${JSON.stringify(eerste.paginas)}  tweede: ${JSON.stringify(tweede.paginas)}`)
    process.exit(1)
  }
  return tweede.bytes
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
  // Dubbele norm_id: bestemmingen "norm-<id>" en prefixen "n<id>-" zouden
  // botsen en elke verwijzing op de verkeerde norm laten landen.
  const ids = normen.map((n) => n.norm_id)
  for (const id of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) {
    fouten.push(`norm_id "${id}" komt meer dan één keer voor`)
  }
  for (const norm of normen) {
    // De pijplijn registreert zelf named destinations ("kern"); die doen in
    // de botsingscontrole mee, want pdfkit overschrijft een dubbele naam
    // zwijgend en elke sprong landt dan op de laatste schrijver.
    const synth = norm.kern_html ? '<p id="kern"></p>' : ''
    const { document } = parseHTML(`<!DOCTYPE html><html><body><h1>x</h1>${synth}${norm.body_html || ''}</body></html>`)
    for (const f of kopvolgordeFouten(document)) console.warn(`  norm ${norm.norm_id}: ${f} — in de PDF genormaliseerd naar één niveau dieper`)
    for (const id of dubbeleIdFouten(document)) fouten.push(`norm ${norm.norm_id}: dubbel anker "${id}"`)
  }
  return fouten
}

// Contract tussen de Hugo-templates en dit script: een hernoemd JSON-veld zou
// anders stil een PDF zonder kern of body opleveren, en een relatieve URL zou
// als dode linkannotatie in de PDF belanden.
function contractFouten(data) {
  const fouten = []
  const normen = data.kind === 'kader' ? data.normen : [data]
  for (const n of normen) {
    if (!n.kern_html) fouten.push(`norm ${n.norm_id}: kern_html ontbreekt (validator eist een kern — veldnaam in de template gewijzigd?)`)
    // Geen fout: een kern-only norm is geldig (layouts/normen/single.html
    // belooft er expliciet een PDF voor). Wel melden, want een hernoemd
    // JSON-veld zou hetzelfde beeld geven.
    if (!n.body_html) console.warn(`  norm ${n.norm_id}: body_html is leeg — kern-only norm, of een gewijzigde veldnaam in de template?`)
  }
  for (const veld of ['url', 'site_url']) {
    if (!/^https?:\/\//.test(data[veld] || '')) {
      fouten.push(`${veld} is niet absoluut ("${data[veld]}") — bouw met een absolute baseURL, niet met --baseURL /`)
    }
  }
  return fouten
}

const alleData = bestanden.map((bestand) => ({ bestand, data: JSON.parse(fs.readFileSync(bestand, 'utf8')) }))

// Het kaderdocument moet elke norm dekken die ook een eigen PDF krijgt; een
// versmalde paginaquery zou anders stil een norm uit het verzamel-PDF laten
// vallen terwijl alle controles groen blijven.
{
  const losseNormen = alleData.filter(({ data }) => data.kind === 'norm').length
  const kader = alleData.find(({ data }) => data.kind === 'kader')
  if (kader && kader.data.normen.length !== losseNormen) {
    console.error(`kader-PDF dekt ${kader.data.normen.length} normen, maar er zijn ${losseNormen} losse norm-PDF's — query in layouts/normen/list.pdfdata.json versmald?`)
    process.exit(1)
  }
}

let geschreven = 0
for (const { bestand, data } of alleData) {
  if (!data.kind) {
    fs.rmSync(bestand) // lege stub van een pagina zonder norm_id
    continue
  }
  const doel = bestand.replace(/index\.pdfdata\.json$/, 'index.pdf')
  const fouten = [...contractFouten(data), ...structuurFouten(data)]
  if (fouten.length) {
    for (const f of fouten) console.error(`${path.relative(root, bestand)} — ${f}`)
    process.exit(1)
  }
  const bytes = data.kind === 'kader' ? await bouwKader(data) : await bouwNorm(data)
  fs.writeFileSync(doel, bytes)
  // De JSON is invoer, geen pagina: laten staan betekent een kale kopie van
  // elke normtekst op de gedeployde site.
  fs.rmSync(bestand)
  geschreven++
  console.log(`${path.relative(root, doel)} — ${Math.round(bytes.length / 1024)} kB`)
}

console.log(`\n${geschreven} PDF('s) geschreven. Controleer met: npm run test:pdf-ua`)
