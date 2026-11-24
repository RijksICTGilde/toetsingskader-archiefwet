# 0008: Feedback algemeen, op normblad 1 en 2 en op de onderwerpen verwerkt

Datum: 2026-08-25

## Status

Geaccepteerd. De keuze over hover en link is op 15 september 2026 aangepast; de kop boven de kern is op 31 augustus 2026 vervallen.

## Besluit

De feedback van 25 augustus 2026 (derde ronde) is overgenomen. Bij drie punten die als vraag waren gesteld, is een keuze gemaakt: het onderscheid tussen hover en link, een eigen pagina voor duurzame toegankelijkheid, en vet in voorschrift 1.2 en 1.5.

## Achtergrond

De ronde telde negentien punten over de opmaak van alle normpagina's, de inleiding, de samenhangpagina, normblad 1 en 2 en de sectie Onderwerpen.

## Overwegingen

- Een link moet als link herkenbaar zijn (WCAG 1.4.1). Alle onderstreepte woorden zwart maken kan daarom niet.
- De tekst over DUTO stond op twee plekken, in de inleiding en bij de samenhang.
- Vet in voorschrift 1.2 en 1.5 wijkt af van het normblad en is daarom vastgelegd ([PDR 0004](0004-normtekst-woord-voor-woord-review-gaat-voor.md)).

## Details

- De kop "Normanalyse …" is weg; de titel van een normpagina is de naam van de norm.
- De versiezin is kleiner en gedempt.
- Hover en link: wat naar een pagina gaat, is blauw met een doorgetrokken lijn, ook als er een hover op zit. Wat alleen een hover is, heeft een stippellijn. Sinds 15 september 2026 is een term met hover en link gestippeld en staat de paginalink in de tooltip en in de bronnenlijst.
- De tekst over DUTO staat op één pagina onder Over. De inleiding verwijst ernaar; de samenhangpagina houdt alleen de zin die het diagram uitlegt.
- Normblad 1 en 2: vet, een link naar Feitelijk beheer, een geschrapte zin in de kern van norm 2 en bronlinks bij de hovers op applicaties en systemen.
- Onderwerpen: de eerste zin van de index is weg, de voetnoten zijn toegevoegd en "(voorkomen van)" is uit de titel.
- Het nummer bij de kern is niet meer uitgevoerd: sinds 31 augustus 2026 heeft de kern geen kop.

## Impact

### Gebruikers

Een bezoeker ziet aan de lijn onder een woord of het een toelichting toont of naar een pagina gaat.

### Redactie

De tekst over duurzame toegankelijkheid staat op één plek.

## Alternatieven

- Alle onderstreepte woorden zwart. Niet gekozen; een link is dan niet te herkennen.
- De tekst over DUTO op twee plekken laten staan. Niet gekozen; de feedback vroeg de tekst bij Samenhang weg te halen.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/feedback-algemeen-normblad-1-2-onderwerpen.md`, dat met deze PDR is vervallen.

Ontvangen 25 augustus 2026, derde ronde (na `0006-feedback-normbladen-3-4-5.md` en
`0007-feedback-normbladen-6-7-8-en-kaderpaginas.md`). Algemene punten over de opmaak van
alle normpagina's, de inleiding en de samenhangpagina, normblad 1 en 2, en de
sectie Onderwerpen. Een aantal punten is als vraag gesteld; de gemaakte keuze
staat per punt in "Verwerking" en onder "Keuzes".

De feedback staat hieronder woord voor woord.

### De feedback, onbewerkt

> **Algemeen:**
>
> - De kopteksten "normanalyse <inbeheername en beheer>" kunnen weg?
> - Kern van <<>> moet denk ik een nummer krijgen, zodat de nummering van de
>   voorschriften logisch wordt?
> - De zin "Versie v0.2.0 van het toetsingskader. De inhoud is nog in
>   ontwikkeling en kan wijzigen. Deze pagina is voor het laatst aangepast op
>   maandag 10 augustus 2026." Is wel opvallend en groot.
>
> **Inleiding:**
>
> - Eerste zin "centrale" weghalen?
> - Bij de "inleiding" is een tekst over de relatie met DUTO opgenomen, maar
>   ook bij "samenhang". Bij "Samenhang" kan het weg.
> - Misschien kan er een tegel gemaakt worden bij "Over" specifiek voor de
>   tekst over DUTO?
> - Het kopje "Invloed per onderwerp" onder "passende maatregelen en
>   risicobenadering" is geen goed kopje. We moeten iets anders verzinnen
>
> **In beheername en beheer**
>
> - 1.2. "omschrijving" is niet vet gedrukt
> - 1.3. laatste criterium: De passende maatregelen worden toegepast. Hier
>   ontbreekt een link naar feitelijk beheer (kopje boven 1.8)
> - 1.5. "Alleen wanneer dergelijke categorieën bestaan" is niet vetgedrukt.
> - 1.6. criteria -> "overzicht" en "ordening" zijn hoovers, geen hyperlinks.
>   Soms zijn woorden met streepjes blauw, soms zwart. Opmaak is niet
>   eenduidig? Moet gewoon zwart zijn?
> - 1.8. ik zie nu geen verschil tussen een hoover of een link?
>   "Gecontroleerd vernietigen" heeft nu een blauwe doorgetrokken streep.
>
> **Overzicht**
>
> - In kader: De zin "Een overzicht kan zowel individuele documenten als
>   documenten op een hoger aggregatieniveau bevatten." Is niet duidelijk,
>   bovendien komt het aggregatieniveau niet terug in de tekst. Dus gewoon
>   weghalen?
> - 2.1. de punt ontbreekt aan het einde van de zin
> - 2.2. de hoovers bij "applicaties" en "systemen" bevatten niet ook de link
>   naar de externe website.
>
> **Onderwerpen en begrippen:**
>
> - Ik vind het niet direct duidelijk dat je op de link kan klikken voor meer
>   informatie. Misschien de eerste zin gewoon weghalen.
> - De voetnoten bij aangrijpingspunt, audittrail, document e.v. ontbreken.
> - Incidenten (voorkomen van) -> (voorkomen van) kan weg. Vanuit het normblad
>   informatiebeveiliging wordt niet vanaf het woord "incidenten" in het kader
>   naar dit onderwerp gelinkt.
> - Vanuit het normblad metadata wordt bij "hardware" niet verwezen naar
>   "Metadata - hardware, besturingsprogrammatuur en toepassingsprogrammatuur"
> - Vanuit het normblad metadata wordt niet verwezen naar "Metadata -
>   integriteitscheck" onder 4.3

### Verwerking

- Nr. 1
  - Punt: Kop "Normanalyse …" weg
  - Verwerkt in: `title` van alle acht normen is nu de normnaam, bijv. "Inbeheername en beheer"
- Nr. 2
  - Punt: Nummer bij de kern
  - Verwerkt in: **nog te doen**: layout (`layouts/_partials/kern-kop.html`), staat op de lijst in de PR
- Nr. 3
  - Punt: Versiezin te groot
  - Verwerkt in: `assets/css/main.css`, `.page-meta`: kleiner en gedempt
- Nr. 4
  - Punt: "centrale" weg uit de eerste zin
  - Verwerkt in: `content/over/inleiding.md`
- Nr. 5
  - Punt: DUTO-tekst weg bij Samenhang
  - Verwerkt in: `content/samenhang.md`: sectie "Relatie met DUTO" vervangen door een korte "Beschikbaar en leesbaar" met verwijzing
- Nr. 6
  - Punt: Eigen tegel voor DUTO onder Over
  - Verwerkt in: nieuw `content/over/duurzame-toegankelijkheid.md` (weight 2); de DUTO-sectie uit de inleiding is daarheen verhuisd; Doel, Wettelijk kader, Opbouw en Doelgroep schuiven een plek op
- Nr. 7
  - Punt: Kopje "Invloed per onderwerp"
  - Verwerkt in: `content/onderwerpen/passende-maatregelen.md` → "De risicobenadering per norm"
- Nr. 8
  - Punt: 1.2 "omschrijving" vet
  - Verwerkt in: `content/normen/01-beheer.md`
- Nr. 9
  - Punt: 1.3 link naar Feitelijk beheer
  - Verwerkt in: `01-beheer.md`, "worden [toegepast](#feitelijk-beheer)"
- Nr. 10
  - Punt: 1.5 "Alleen wanneer dergelijke categorieën bestaan" vet
  - Verwerkt in: `01-beheer.md`
- Nr. 11
  - Punt: 1.6 / 1.8 hover en link niet te onderscheiden
  - Verwerkt in: `assets/css/main.css`: link-met-hover krijgt een doorgetrokken blauwe lijn, pure hover blijft zwart met stippellijn; zie "Keuzes"
- Nr. 12
  - Punt: Kern norm 2: zin over aggregatieniveau weg
  - Verwerkt in: `content/normen/02-overzicht.md`, `kern`
- Nr. 13
  - Punt: 2.1 punt aan het eind
  - Verwerkt in: `02-overzicht.md`
- Nr. 14
  - Punt: 2.2 hovers applicatie/systeem met bronlink
  - Verwerkt in: `02-overzicht.md`, `[^applicatie]` en `[^systeem]` → itpedia.nl ("Welcome IT professional")
- Nr. 15
  - Punt: Eerste zin van de onderwerpenindex weg
  - Verwerkt in: `content/onderwerpen/_index.md`
- Nr. 16
  - Punt: Voetnoten op de onderwerpenpagina's
  - Verwerkt in: aangrijpingspunt (1), audittrail (2, incl. NIST-link), classificatie/aggregatie (1, tweemaal gebruikt), document (3), samenhang/interpreteerbaar (1); letterlijk uit "9) Onderwerpen en Verwijzingen"
- Nr. 17
  - Punt: "(voorkomen van)" weg; link vanuit norm 5
  - Verwerkt in: `content/onderwerpen/incidenten-voorkomen.md`, `title`; `content/normen/05-betrouwbaar.md`, "incidenten" in de kern linkt naar het onderwerp
- Nr. 18
  - Punt: Norm 4 linkt niet naar hardware/programmatuur
  - Verwerkt in: **stond al**: `04-metadateren.md` linkt bij voorschrift 4.3 op "hardware, besturingsprogrammatuur en toepassingsprogrammatuur"
- Nr. 19
  - Punt: Norm 4 linkt niet naar integriteitscheck
  - Verwerkt in: **stond al**: `04-metadateren.md` linkt bij voorschrift 4.3 op "integriteitschecks"

Punt 18 en 19 zijn waarschijnlijk tegen de gepubliceerde v0.2.0 gecontroleerd;
op `main` staan die links sinds de migratie van de normbladen.

### Keuzes bij de vragen

**Hover versus link.** De site kent drie gevallen: een gewone link (blauw,
doorgetrokken), een hover (zwart, stippellijn) en een woord dat beide is,
een link naar een andere pagina mét een bron erachter. Die laatste was blauw
mét stippellijn, en dat is de "soms blauw, soms zwart" uit 1.6. Nu: alles wat
klikbaar naar een pagina gaat is blauw en doorgetrokken (ook als er een hover
op zit), alles wat alleen een hover is, is zwart met stippellijn. "Gecontroleerd
vernietigen" in 1.8 was al een gewone link en is daarom terecht blauw en
doorgetrokken. Niet "gewoon zwart": dan is een link niet meer als link te
herkennen (WCAG 1.4.1).

**DUTO-pagina.** De tekst uit de inleiding (definitie plus de zin dat het
toetsingskader erbij aansluit) en de duiding uit de samenhangpagina (welke
kenmerken als norm zijn uitgewerkt) staan nu samen op één pagina onder Over.
De inleiding verwijst ernaar; de samenhangpagina houdt alleen de zin over de
vervaagde bollen beschikbaar en leesbaar, omdat die het diagram uitlegt.

**Vet in 1.2 en 1.5.** Het normblad gebruikt geen vet; de nadruk is hier op
verzoek toegevoegd. Dit is een bewuste afwijking van de normbladtekst en
staat daarom ook in `0004-normtekst-woord-voor-woord-review-gaat-voor.md`.
