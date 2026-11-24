# 0003: De PDF wordt bij de build gegenereerd, met tags

Datum: 2026-08-13

## Status

Geaccepteerd. Gewijzigd op 31 augustus 2026: de PDF wordt gemaakt met pdfkit in plaats van met Chromium.

## Besluit

De negen PDF's van het toetsingskader worden bij het bouwen van de site gegenereerd en als statische bestanden meegeleverd, met een structuurboom (tags), een taal en bladwijzers. De pijplijn met pdfMake in de browser van de bezoeker vervalt.

## Achtergrond

Bevinding 6 uit het toegankelijkheidsonderzoek ([PDR 0001](0001-toegankelijkheid-toetsen-op-wcag-2-2-aa.md)), uitgewerkt als issue 58: de export leverde een ongetagde PDF. Gemeten op de bytes ontbraken `/StructTreeRoot`, `/MarkInfo` en `/Lang`. Een schermlezer las tachtig pagina's als één doorlopende tekst, zonder koppen en lijsten, en zonder taal. De norm is EN 301 549 paragraaf 10, met WCAG 1.3.1 en 4.1.2 en PDF/UA-1 (ISO 14289-1).

pdfMake 0.2.18 bouwt geen structuurboom. De optie `tagged: true` in de onderliggende laag zet alleen de vlag zonder tags, en dat is slechter dan een ongetagde PDF.

## Overwegingen

- De PDF is hier geen bijlage. Inspecteurs en organisaties onder toezicht gebruiken het kader offline en op papier.
- De inhoud is statisch. Negen documenten die bij elke build gelijk zijn, werden bij elke bezoeker opnieuw opgebouwd.
- Het is per saldo minder code. De gevendorde pdfMake (1,3 MB), de fonts in base64 (228 kB) en de converter vervallen. De bundel van 2,1 MB stond als blokkerend script op elke normpagina.
- Tags die uit visuele opmaak worden geraden, kloppen niet. Het Acrobat-rapport liet dat zien ([PDR 0010](0010-toegankelijkheidsrapporten-van-derden-als-nulmeting.md)). Tags die uit de structuur van de HTML volgen, kloppen wel.

## Details

- De invoer is `index.pdfdata.json` per norm (outputformat `pdfdata`). `scripts/pdf-html.mjs` vertaalt de HTML van de norm naar structuurelementen: Document, H1 tot en met H5, P, L, LI en LBody.
- `scripts/pdf-tagged.mjs` bouwt de structuurboom met pdfkit en `markStructureContent()`. Dat is dezelfde oplossing als de AI-verordening-beslishulp (MinBZK/ai-verordening-beslishulp, pull request 1047), zodat beide projecten hetzelfde patroon delen.
- `scripts/pdf-build.mjs` schrijft `index.pdf` naast elke pagina en controleert de invoer. Een dubbel anker is fataal. Een overgeslagen kopniveau wordt alleen in de PDF-tag genormaliseerd en gemeld, omdat de normbladen dat niveau zelf overslaan.
- Acceptatiecriterium: `scripts/pdf-ua-check.mjs` slaagt op alle negen documenten. De controle eist de vier markers en een gevulde boom (`/H1` en `/LBody`).
- `tests/js/pdf-tagged.test.mjs` meet op de bytes wat de markers niet zien: de tags in de content-streams komen overeen met de boom, links zijn `Link`-elementen met OBJR, en geneste lijsten blijven genest.
- De downloadknop is een gewone link naar `index.pdf` en werkt zonder JavaScript.
- De markers en een gevulde boom zijn een ondergrens. Of de tags de inhoud juist beschrijven, vraagt een handmatige doorloop met PAC of Acrobat.
- Open vraag: bestaat er bij de Inspectie of bij OCW een publicatieketen, zoals NLDoc, waar dit kader in past? Dan kan de eigen pijplijn vervallen.

## Impact

### Gebruikers

Een schermlezer kan in de PDF op koppen navigeren en leest lijsten als lijsten, in het Nederlands. De normpagina's laden zonder de bundel van 2,1 MB.

### Ontwikkelteam

`just pdf` draait volledig lokaal, zonder browser. De containerbuild maakt de PDF's en controleert ze.

### Toegankelijkheidsverklaring

De passage over de ongetagde PDF vervalt. Er blijft hooguit een aantekening dat de tags machinaal uit de structuur volgen en steekproefsgewijs met de hand worden gecontroleerd.

## Alternatieven

- De PDF in de toegankelijkheidsverklaring als niet-conform benoemen (route 1). Niet gekozen als eindsituatie, omdat het kader een normdocument is.
- Een publicatieketen van de Inspectie of OCW, zoals NLDoc (route 3). Niet uitgesloten; de vraag staat open.
- WeasyPrint met `pdf_variant='pdf/ua-1'`. Niet gekozen, omdat het Pango en Cairo in de buildketen brengt en in de ontwikkelomgeving niet draaide.
- Chromium via Playwright met `page.pdf({ tagged: true, outline: true })` op print-HTML. Dit was de keuze van 13 augustus 2026. Op 31 augustus 2026 vervangen door pdfkit: geen browser in de keten en lokaal te controleren.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/besluit-toegankelijke-pdf.md`, dat met deze PDR is vervallen.

**Datum:** 13 augustus 2026
**Status:** besluit, vastgelegd om in de toegankelijkheidsverklaring te kunnen opnemen
**Aanleiding:** bevinding 6 uit
[het toegankelijkheidsonderzoek](0001-toegankelijkheid-toetsen-op-wcag-2-2-aa.md#6-de-pdf-export-levert-een-ongetagde-pdf),
uitgewerkt als issue #58
**Norm:** EN 301 549 §10 (niet-webdocumenten), onderliggend WCAG 1.3.1 en 4.1.2 (niveau A), PDF/UA-1 (ISO 14289-1)

### 1. Het besluit

De negen PDF's worden voortaan **bij het bouwen van de site gegenereerd uit
print-HTML, met Chromium via Playwright**, en als statische bestanden
meegeleverd. De client-side pdfMake-pijplijn vervalt.

Dit is route 2 uit issue #58, met één afwijking van het oorspronkelijke
voorstel: niet WeasyPrint als engine, maar de Chromium die al in de
testketen zit. Zie §5.

Route 1 (de PDF als niet-conforme bijlage verklaren) is geen eindsituatie voor
een toezichtsinstrument, maar geldt wél zolang dit besluit nog niet is
uitgevoerd: de afwijking hoort nu in de verklaring te staan, niet pas als hij
is opgelost. Zie §9.

Route 3 (NLDoc of een publicatieketen van de Inspectie of OCW) is niet
uitgesloten. De vraag staat open in §10; als die keten bestaat, verslaat hij
route 2, want dan hoeft dit project geen eigen PDF-pijplijn te onderhouden.

### 2. Wat er mis is

Gemeten op de daadwerkelijke bytes van beide gegenereerde PDF's, inclusief het
uitpakken van alle gecomprimeerde streams:

- `/StructTreeRoot`
  - Betekenis: structuurboom: koppen, lijsten, leesvolgorde
  - Aanwezig: nee
- `/MarkInfo`, `/Marked`
  - Betekenis: vlag "dit document is getagd"
  - Aanwezig: nee
- `/Lang`
  - Betekenis: taal van het document
  - Aanwezig: nee
- `/Title` + `/DisplayDocTitle`
  - Betekenis: de viewer toont de titel, niet de bestandsnaam
  - Aanwezig: ja

Wat een gebruiker daarvan merkt: een schermlezer leest tachtig pagina's als één
lap tekst. Geen koppenlijst om op te navigeren, criteria en indicatoren zonder
lijstverband, en zonder `/Lang` een Nederlandse wettekst met een Engelse stem.

Dit is geen instelling die aan kan. pdfMake 0.2.18 bouwt geen structuurboom.
De optie `tagged: true` in de onderliggende pdfkit-laag schrijft alléén
`/MarkInfo <</Marked true>>` zonder tags, een document als getagd markeren
zonder tags is slechter dan een eerlijk ongetagde PDF, want hulpsoftware
schakelt dan over op structuur die er niet is. Die vlag staat daarom bewust
uit (`assets/js/pdf-export.js:125-127`).

### 3. Wat het Acrobat-rapport toevoegt

In `docs/toegankelijkheid/` staat een toegankelijkheidsrapport van Adobe
Acrobat XI over `toetsingskader-archiefwet-2026.pdf`, een van de site
gedownload exemplaar. Uitslag: 22 goedgekeurd, 3 mislukt, 3 handmatig te
controleren, 4 overgeslagen.

Het opvallende: Acrobat meldt "PDF-bestand met codes: Goedgekeurd", plus taal
en bladwijzers. Dat kan het gedownloade bestand niet uit zichzelf hebben, de
export schrijft geen tags, geen `/Lang` en geen bladwijzers, en dat is op de
bytes gemeten. De verklaring die past bij alle waarnemingen is dat **Acrobat
het document bij het openen zelf heeft getagd** en vervolgens zijn eigen gok
heeft gecontroleerd.

Die lezing wordt gesteund door wat er mislukt:

- Alternatieve tekst voor figuren
  - Wat een auto-tagger hier fout doet: het bollendiagram komt als beeld binnen, zonder alternatief
- `LI` moet een onderliggend item van `L` zijn
  - Wat een auto-tagger hier fout doet: losse regels worden als lijstitems geraden, zonder omhullende lijst
- Juiste insluiting via nesting (koppen)
  - Wat een auto-tagger hier fout doet: kopniveaus worden uit lettergrootte afgeleid, niet uit structuur

Dat is precies het onderscheid dat dit besluit draagt: **tags die uit een
visuele opmaak worden geraden, zijn fout; tags die uit HTML-semantiek volgen,
kloppen.** Een auto-getagde PDF haalt de checklist grotendeels, en levert de
gebruiker alsnog een verkeerde koppenboom.

Het rapport is als nulmeting in de repository opgenomen. Te bevestigen zodra
het gecontroleerde bestand weer beschikbaar is: `node scripts/pdf-ua-check.mjs`
erop draaien. Levert dat 1/4 markers op, dan staat vast dat Acrobat de tags in
de sessie heeft toegevoegd en niet de export.

### 4. Waarom route 2 en niet route 1

1. **De PDF is hier geen bijlage.** Het toetsingskader is een normdocument dat
   inspecteurs en onder toezicht staande organisaties naast hun eigen stukken
   leggen, offline en op papier. Een normdocument dat een schermlezergebruiker
   niet kan doorbladeren sluit precies de groep uit die de wet beschermt. Het
   argument "alle informatie staat ook op de site" draagt alleen zolang de PDF
   echt secundair is, en dat is hier de vraag niet.
2. **De inhoud is statisch.** Negen documenten die bij elke build hetzelfde
   zijn, worden nu bij elke bezoeker opnieuw opgebouwd. Client-side genereren
   lost een probleem op dat dit project niet heeft.
3. **Het is per saldo minder code.** De gevendorde pdfMake (1,3 MB), de
   base64-fonts (228 kB), de converter en de doc-definitie kunnen weg, met de
   tests die hun eigenaardigheden vastleggen. Daarvoor komt een
   print-stylesheet terug, die bovendien nuttig is voor wie de pagina uitprint.
   De bundel van 2,1 MB staat nu als blokkerend `<script>` op elke normpagina,
   ook voor de bezoeker die nooit iets downloadt.

### 5. Waarom Chromium en niet WeasyPrint

Het voorstel van 10 augustus koos WeasyPrint met `pdf_variant='pdf/ua-1'`. Dat
werkt, maar trekt Pango en Cairo de buildketen in, en was in de
ontwikkelomgeving niet te draaien, er is toen dan ook geen
proof-of-concept-PDF gemaakt.

Chromium hoeft niets nieuws mee te brengen:

* `playwright ^1.62.1` staat al in `devDependencies`;
* `.github/workflows/test.yml` installeert al `chromium` met systeem-libs voor
  de browsertests;
* `page.pdf({ tagged: true, outline: true })` bestaat in deze versie
  (`playwright-core/types/types.d.ts:4110`) en levert een structuurboom uit de
  DOM plus bladwijzers uit de koppen.

Dus: geen nieuwe taal in de buildketen, geen apt-regel, geen tweede
renderengine om te onderhouden. De aanpak blijft verder identiek aan het
voorstel, print-HTML uit Hugo, een print-stylesheet, en een buildstap die de
PDF's ernaast schrijft.

### 6. Wat het concreet inhoudt

#### Nieuw

- `layouts/_default/single.print.html`
  - Wat het doet: print-HTML per norm: één `<h1>`, de kern, de normuitleg, de bronnenlijst. Geen navigatie, geen zoekknop
- `layouts/normen/list.print.html`
  - Wat het doet: hetzelfde voor het hele kader, met inhoudsopgave en de acht normen achter elkaar
- `assets/css/print.css`
  - Wat het doet: paginaformaat, marges, briefhoofd via `@page`, en de koppenhiërarchie waar de structuurboom uit volgt
- `scripts/pdf-build.mjs`
  - Wat het doet: loopt over de print-HTML in `public/` en schrijft `index.pdf` ernaast, met `tagged` en `outline`
- `scripts/pdf-ua-check.mjs`
  - Wat het doet: het acceptatiecriterium: faalt zolang een van de vier markers ontbreekt

#### Weg

`assets/lib/pdfmake/`, `assets/js/pdf-assets.js`, `assets/js/html-to-pdfmake.js`,
`assets/js/pdf-export.js`, `layouts/_partials/pdf-scripts.html`, het
`pdf`-outputformat met zijn `index.pdf.json`-endpoints, en
`tests/js/html-to-pdfmake.test.mjs`, `tests/js/pdf-doc.test.mjs` en
`tests/js/pdf-render.smoke.mjs`.

De downloadknop wordt weer een gewone `<a href="…/index.pdf" download>` en
werkt daarmee ook zonder JavaScript, nu is het een `<button hidden>` die
JavaScript zichtbaar moet maken.

#### Wat niet verandert

De inhoud, de bronvermeldingen, de nummering van voorschriften (uit
`_partials/nummer-voorschriften.html`, gedeeld met de website), het
versienummer uit `site.Params.versie`, en de CSP van de container: statische
PDF's zijn gewone bestanden onder `default-src 'self'`.

De opmaak komt dicht bij de huidige export, maar niet op de pixel. Dat is
afgesproken: huisstijl bij benadering weegt hier niet op tegen de kosten van
een exacte reproductie van een pdfMake-lay-out in CSS.

### 7. Acceptatiecriterium

Af wanneer dit slaagt op alle negen documenten:

```
node scripts/pdf-ua-check.mjs public/normen/*/index.pdf public/normen/index.pdf
```

Vandaag geeft die controle 1/4 op de huidige export. Het script landt vóór de
oplossing, zodat het criterium meet in plaats van belooft.

Let wel: vier markers aanwezig is een ondergrens, geen conformiteitsverklaring.
PDF/UA vraagt ook dat de tags de inhoud kloppend beschrijven, kopniveaus in de
goede volgorde, tabellen met kopcellen, figuren met een alternatief. Precies de
drie punten waarop de auto-getagde PDF in §3 struikelt. Dat vraagt een
handmatige doorloop met PAC of Acrobat, net zoals de site een handmatige
doorloop vraagt naast de axe-scan.

### 8. Risico's, eerlijk benoemd

* **Niet lokaal te verifiëren.** Chromium start in de ontwikkelomgeving niet:
  de systeem-libs ontbreken en zijn zonder root niet te installeren, dezelfde
  beperking die de browsertests naar CI verplaatst. De print-HTML en de CSS
  zijn lokaal te bekijken, de PDF-bytes alleen in CI. Reken op enkele
  CI-rondes.
* **De huisstijl moet opnieuw.** Het briefhoofd zit nu in een
  pdfMake-headerfunctie met absolute posities; in CSS wordt dat een
  `@page`-marge. Visueel nalopen is onvermijdelijk.
* **Chromium tagt niet alles even goed.** De structuurboom volgt de DOM, dus
  wat in HTML slordig is genest, is dat in de PDF ook. De print-templates zijn
  daarom bewust strak: één `<h1>`, geen overgeslagen niveaus, echte `<ul>`,
  `<th>` in tabellen, een tekstalternatief bij het bollendiagram.
* **Buildtijd.** Negen documenten, waarvan één van tachtig pagina's. Naar
  verwachting seconden, geen minuten, maar dat is een schatting tot de eerste
  CI-run.

### 9. Tekst voor de toegankelijkheidsverklaring

Zolang dit besluit nog niet is uitgevoerd, hoort de afwijking benoemd te
worden. Concept:

> De downloadbare PDF-versies van het toetsingskader zijn niet getagd. Ze
> bevatten geen structuurinformatie (koppen, lijsten, leesvolgorde) en geen
> taalinstelling, waardoor hulpsoftware ze als doorlopende tekst leest. Dit
> voldoet niet aan EN 301 549 §10. Alle informatie uit de PDF is volledig en
> in toegankelijke vorm beschikbaar op deze website. De PDF-generatie wordt
> vervangen door een variant die wél getagde documenten oplevert; tot die tijd
> geldt de website als de toegankelijke vorm.

Na uitvoering vervalt deze passage en komt er hooguit een aantekening dat de
tags machinaal uit de HTML-structuur volgen en steekproefsgewijs handmatig
worden gecontroleerd.

### 10. Wat openstaat

**Bestaat er een NLDoc- of vergelijkbare publicatieketen** bij de Inspectie of
OCW waar dit kader in past? Zo ja, dan is route 3 beter dan wat hier wordt
gebouwd, en kan de eigen pijplijn weer weg. Die vraag is technisch niet te
beantwoorden en hoort bij het team en de opdrachtgever.


### 11. Addendum (31 augustus 2026): van Chromium naar pdfkit

Op verzoek van de gebruiker is de engine gewisseld: de PDF's worden nog steeds
**bij de build** gegenereerd (het besluit in §1 staat), maar niet meer met
Chromium uit print-HTML. In plaats daarvan bouwt `scripts/pdf-tagged.mjs` de
structuurboom zelf met **pdfkit** en `markStructureContent()`: dezelfde
oplossing als de AI-verordening-beslishulp
([MinBZK/ai-verordening-beslishulp#1047](https://github.com/MinBZK/ai-verordening-beslishulp/pull/1047)),
zodat beide projecten hetzelfde patroon en dezelfde kennis delen.

Wat dat verandert:

* **Invoer** is niet langer print-HTML maar `index.pdfdata.json` per norm
  (outputformat `pdfdata`); `scripts/pdf-html.mjs` vertaalt de norm-HTML naar
  structuurelementen (`Document → H1…H5, P, L → LI → LBody`), met de
  bewerkingen die eerst als `replaceRE` in de print-templates zaten.
* **Geen browser meer in de keten**: `just pdf` draait volledig lokaal, en de
  containerbuild heeft geen Chromium meer nodig. Het risico "niet lokaal te
  verifiëren" uit §8 is daarmee vervallen.
* **Het acceptatiecriterium is aangescherpt**: `pdf-ua-check` eist naast de
  vier markers ook een gevulde boom (`/H1` en `/LBody`), precies de val van
  een gezette vlag boven een lege boom.
* **Kopvolgorde en dubbele ankers** worden voortaan in `scripts/pdf-build.mjs`
  op de invoer gecontroleerd (voorheen op de print-HTML in de a11y-scan). Een
  dubbel anker is fataal. Een overgeslagen kopniveau niet: de normbladen
  schrijven `## Voorschriften` → `#### Voorschrift` zonder tussenkop, en dat
  staat woord voor woord op de site. De walker normaliseert het niveau alleen
  in de PDF-tag (H2 → H3 in plaats van H4; de opmaak blijft die van het
  oorspronkelijke niveau) en de build meldt waar dat gebeurt.
* De **inhoudsopgave met paginanummers** en de **bladwijzers** blijven; de
  nummers komen uit een tweede opbouw in geheugen in plaats van een tweede
  Chromium-doorloop.

Na een codereview (1 september 2026) zijn daar drie dingen aan toegevoegd die
de vier markers níét zien en die daarom in `tests/js/pdf-tagged.test.mjs` op de
bytes worden gemeten: de BDC-tags in de content-streams komen overeen met de
boom (pdfkit bewaart `/S` als string; `.name` gaf `/undefined`), links zijn
`Link`-structuurelementen met OBJR (PDF/UA-1 §7.18.5) en lopen niet door in de
volgende tekstrun (pdfkit erft `continued`-opties over zodra ze `undefined`
zijn), en geneste lijsten blijven L → LI → L. Twee inhoudelijke afwijkingen
van eerdere besluiten zijn teruggedraaid: de kern heeft in de PDF geen kop
(keuze 31 augustus) en het colofon is de versieregel van 25 augustus, niet het
blok "Belangrijke informatie".

De kanttekening uit §7 blijft onverkort gelden: markers en een gevulde boom
zijn een ondergrens; of de tags de inhoud kloppend beschrijven vraagt een
handmatige doorloop met PAC of Acrobat.
