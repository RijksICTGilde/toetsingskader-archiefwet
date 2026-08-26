# Feedback algemeen, op de normbladen inbeheername en beheer en overzicht, en op de onderwerpen

Ontvangen 25 augustus 2026, derde ronde (na `feedback-normbladen-3-4-5.md` en
`feedback-normbladen-6-7-8-en-kader.md`). Algemene punten over de opmaak van
alle normpagina's, de inleiding en de samenhangpagina, normblad 1 en 2, en de
sectie Onderwerpen. Een aantal punten is als vraag gesteld; de gemaakte keuze
staat per punt in "Verwerking" en onder "Keuzes".

De feedback staat hieronder woord voor woord.

## De feedback, onbewerkt

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

## Verwerking

| # | Punt | Verwerkt in |
|---|---|---|
| 1 | Kop "Normanalyse …" weg | `title` van alle acht normen is nu de normnaam, bijv. "Inbeheername en beheer" |
| 2 | Nummer bij de kern | **nog te doen**: layout (`layouts/_partials/kern-kop.html`), staat op de lijst in de PR |
| 3 | Versiezin te groot | `assets/css/main.css`, `.page-meta`: kleiner en gedempt |
| 4 | "centrale" weg uit de eerste zin | `content/over/inleiding.md` |
| 5 | DUTO-tekst weg bij Samenhang | `content/samenhang.md`: sectie "Relatie met DUTO" vervangen door een korte "Beschikbaar en leesbaar" met verwijzing |
| 6 | Eigen tegel voor DUTO onder Over | nieuw `content/over/duurzame-toegankelijkheid.md` (weight 2); de DUTO-sectie uit de inleiding is daarheen verhuisd; Doel, Wettelijk kader, Opbouw en Doelgroep schuiven een plek op |
| 7 | Kopje "Invloed per onderwerp" | `content/onderwerpen/passende-maatregelen.md` → "De risicobenadering per norm" |
| 8 | 1.2 "omschrijving" vet | `content/normen/01-beheer.md` |
| 9 | 1.3 link naar Feitelijk beheer | `01-beheer.md`, "worden [toegepast](#feitelijk-beheer)" |
| 10 | 1.5 "Alleen wanneer dergelijke categorieën bestaan" vet | `01-beheer.md` |
| 11 | 1.6 / 1.8 hover en link niet te onderscheiden | `assets/css/main.css`: link-met-hover krijgt een doorgetrokken blauwe lijn, pure hover blijft zwart met stippellijn; zie "Keuzes" |
| 12 | Kern norm 2: zin over aggregatieniveau weg | `content/normen/02-overzicht.md`, `kern` |
| 13 | 2.1 punt aan het eind | `02-overzicht.md` |
| 14 | 2.2 hovers applicatie/systeem met bronlink | `02-overzicht.md`, `[^applicatie]` en `[^systeem]` → itpedia.nl ("Welcome IT professional") |
| 15 | Eerste zin van de onderwerpenindex weg | `content/onderwerpen/_index.md` |
| 16 | Voetnoten op de onderwerpenpagina's | aangrijpingspunt (1), audittrail (2, incl. NIST-link), classificatie/aggregatie (1, tweemaal gebruikt), document (3), samenhang/interpreteerbaar (1); letterlijk uit "9) Onderwerpen en Verwijzingen" |
| 17 | "(voorkomen van)" weg; link vanuit norm 5 | `content/onderwerpen/incidenten-voorkomen.md`, `title`; `content/normen/05-betrouwbaar.md`, "incidenten" in de kern linkt naar het onderwerp |
| 18 | Norm 4 linkt niet naar hardware/programmatuur | **stond al**: `04-metadateren.md` linkt bij voorschrift 4.3 op "hardware, besturingsprogrammatuur en toepassingsprogrammatuur" |
| 19 | Norm 4 linkt niet naar integriteitscheck | **stond al**: `04-metadateren.md` linkt bij voorschrift 4.3 op "integriteitschecks" |

Punt 18 en 19 zijn waarschijnlijk tegen de gepubliceerde v0.2.0 gecontroleerd;
op `main` staan die links sinds de migratie van de normbladen.

## Keuzes bij de vragen

**Hover versus link.** De site kent drie gevallen: een gewone link (blauw,
doorgetrokken), een hover (zwart, stippellijn) en een woord dat beide is —
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
staat daarom ook in `afwijkingen-van-het-normblad.md`.
