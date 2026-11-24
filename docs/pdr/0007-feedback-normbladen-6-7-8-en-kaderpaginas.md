# 0007: Feedback op de normbladen vindbaar, vernietigen en periodieke evaluatie en op de kaderpagina's verwerkt

Datum: 2026-08-25

## Status

Geaccepteerd. Vijf punten zijn op 31 augustus 2026 hersteld na een regressie.

## Besluit

De feedback van 25 augustus 2026 (tweede ronde) op norm 6, 7 en 8, de sectie Over en drie onderwerpenpagina's is overgenomen. De rangorde van synoniemen in de zoekfunctie valt buiten een contentronde en is als scriptwijziging apart opgepakt.

## Achtergrond

De ronde telde 31 punten: kaartteksten, titels, bronnen met een puntkomma tussen de vindplaatsen, hovers, voetnoten en enkele tekstcorrecties.

## Overwegingen

- Een review gaat voor de tekst van het normblad ([PDR 0004](0004-normtekst-woord-voor-woord-review-gaat-voor.md)).
- De zoekfunctie komt uit het thema en weegt alleen titel en inhoud. Een synoniem telde daardoor even zwaar als een willekeurig woord.

## Details

- Norm 6, 7 en 8: titels, kaartteksten, bronnen en hovers volgens de feedback.
- Over: kaartteksten van Wettelijk kader en Doelgroep, de voetnoot bij de Position Paper, het blauwe blok zonder titel en met een bron, en de hover bij "document".
- Onderwerpen: bronnen bij metadata hardware en programmatuur, metadata integriteitscheck en passende maatregelen.
- Zoeken: de synoniemen hebben een eigen sleutel met een hoger gewicht in een lokale `assets/js/search.js` ([PDR 0009](0009-openstaande-punten-uit-de-feedbackrondes.md)).
- Regressie: pull request 79 was eerder afgesplitst en zette bij het mergen de punten 20 tot en met 24 terug. Ze zijn op 31 augustus 2026 hersteld.

## Impact

### Gebruikers

Een zoekopdracht op een synoniem, zoals "vinden", zet de bijbehorende norm bovenaan.

### Ontwikkelteam

Een branch die vóór een feedbackronde is afgesplitst, kan verwerkte punten terugzetten. Controleer dat bij het mergen.

## Alternatieven

- De rangorde in het thema oplossen. Het brondocument noemt het thema en een lokale override als mogelijkheden; uitgevoerd is de lokale override.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/feedback-normbladen-6-7-8-en-kader.md`, dat met deze PDR is vervallen.

Ontvangen 25 augustus 2026. Tweede ronde, na `0006-feedback-normbladen-3-4-5.md`.
Raakt norm 6 (vindbaar), norm 7 (vernietigen), norm 8 (periodieke evaluatie),
de sectie "Over het toetsingskader" en drie onderwerpenpagina's. Eén punt is
niet in content op te lossen (zoekranking synoniemen); zie "Verwerking".

De feedback staat hieronder woord voor woord, zodat later na te lopen is wat er
precies gevraagd is. Wat er sitebreed geldt over afwijken van de normbladtekst
staat in `0004-normtekst-woord-voor-woord-review-gaat-voor.md`.

### De feedback, onbewerkt

> **6. Normblad 'vindbaar'**
>
> Op de titelpagina: Normen | Toetsingskader Archiefwet
>
> - Tekstje in het blokje moet zijn: "Een document moet binnen een redelijke
>   termijn na creatie of ontvangst vindbaar zijn."
>
> Het normblad zelf: Normanalyse Vindbaarheid | Toetsingskader Archiefwet
> Titel: is "Normanalyse Vindbaarheid" moet zijn "Normanalyse vindbaar".
>
> Kern van…: Geen opmerkingen
>
> Toelichting:
>
> - Tweede alinea verwijzing onder het woord 'zijn' (laatste woord). Deze gaat
>   nu naar één bron, maar er is er nog een. Dus: Ab, artikel 2.1, eerste lid,
>   onder a; Ab, Nota van Toelichting, I Algemeen deel, 2. Duurzame
>   toegankelijkheid, vindbaar, p.10.
> - Derde alinea moet bij de woorden "categorieën documenten" een
>   bronverwijzing opnemen naar: Aw, artikel 5.1, lid 2, onderdeel a.
> - Ook derde alinea: bij het woord "invulling" een hoover met een link opnemen
>   naar deze site:
>   https://www.nationaalarchief.nl/archiveren/kennisbank/niveau-van-maatregelen-overwegingen-generiek-deel.
>
> Synoniemen (gecontroleerd via zoekfunctie):
>
> - Vinden: het normblad is pas het tweede resultaat en dan slaat die alleen aan
>   op het woord 'vinden' in een voorschrift op de pagina van het normblad.
>
> Voorschriften:
>
> - Voorschrift 6.1, de bronverwijzing bij het woord 'documenten' de (eerste)
>   "en" vervangen door een ";". Dus: Aw, artikel 4.1 en 4.2; Ar, Toelichting,
>   Algemeen Deel, onder Vinden, weergeven, exporteren en raadplegen, p. 36.
> - Criteria 6.1, derde bullet: bij dit ene criterium staan nu twee
>   verwijzingen naar dezelfde pagina van passende maatregelen, maar bij de
>   andere criteria niets. Deze mogen beide weg.
> - Voorschrift 6.2, de bronverwijzing bij het woord 'documenten' de "en"
>   vervangen door een ";". Dus: Ab, artikel 2.1, lid a; Ab, Nota van
>   Toelichting, I Algemeen deel, 2. Duurzame toegankelijkheid, vindbaar, p.10.
> - Indicatoren 6.2: hoover plaatsen bij de woorden "centrale plaats":
>   Vindbaar, Vindbaar | Nationaal Archief.
> - Voorschrift 6.3: Bronverwijzing tweede 'en' verwijderen. Dus: Ab, artikel
>   2.1, eerste lid; Ar, Toelichting, p. 34, artikel 2.2, 2.3 en 2.5; Ar,
>   Toelichting, p.50 en 53.
> - Voorschrift 6.4: bronverwijzing eerste 'en' verwijderen. Dus: Ab, artikel
>   2.1, eerste lid, onder a; Ab, Nota van Toelichting, Vindbaar, p.10.
>
> Referenties (indien niet met de bovenstaande punten al gewijzigd):
>
> - 4. Aw, artikel 4.1 en 4.2; Ar, Toelichting, Algemeen Deel, onder Vinden,
>   weergeven, exporteren en raadplegen, p. 36.
> - 5. Ab, artikel 2.1, lid a; Ab, Nota van Toelichting, I Algemeen deel, 2.
>   Duurzame toegankelijkheid, vindbaar, p.10.
> - 6. Ab, artikel 2.1, eerste lid; Ar, Toelichting, p. 34, artikel 2.2, 2.3
>   en 2.5; Ar, Toelichting, p.50 en 53.
> - 7. Ab, artikel 2.1, eerste lid, onder a; Ab, Nota van Toelichting,
>   Vindbaar, p.10.
>
> **7. Normblad Gecontroleerd vernietigen**
>
> Op de titelpagina: Normen | Toetsingskader Archiefwet
>
> - Het blokje "7. Gecontroleerd vernietigen" moet zijn: "7. Vernietigen".
>
> Het normblad zelf: Normanalyse vernietigen | Toetsingskader Archiefwet
>
> Kern van…
>
> - Nu "Kern van gecontroleerd vernietigen" moet zijn "Kern van vernietigen"
> - Bronvermelding de 'en' weghalen en een "Ar" toevoegen. Dus: Bron: Aw,
>   artikel 5.3, eerste lid; Ab, artikel 4.1; Ar, artikel 4.1; Ar, artikel 4.2.
>
> Toelichting: Geen opmerkingen
>
> Synoniemen (gecontroleerd met zoekoptie): Geen opmerkingen
>
> Voorschriften:
>
> - Criteria 7.4, derde bullet: hoover toevoegen bij de woorden "om te
>   bewijzen":
>   https://www.nationaalarchief.nl/archiveren/kennisbank/hoe-kun-je-digitaal-vernietigen#collapse-86789.
>
> Reikwijdte:
>
> - Toevoegen haakje sluiten: "(digitaal of papier)."
>
> **8. Normblad Periodieke evaluatie**
>
> Op de titelpagina: Normen | Toetsingskader Archiefwet
>
> - De tekst in het blokje periodieke evaluatie wat inkorten. Dus: "Het
>   archiefbeheer wordt door het verantwoordelijke overheidsorgaan periodiek
>   geëvalueerd op basis van de kwaliteitseisen voor duurzame
>   toegankelijkheid."
>
> Het normblad zelf: Normanalyse Periodieke evaluatie | Toetsingskader Archiefwet
>
> - Titel: "Normanalyse Periodieke Evaluatie" moet worden: "Normanalyse
>   periodieke evaluatie". (hoofdletter aanpassen).
>
> **Over: Over het toetsingskader | Toetsingskader Archiefwet**
>
> - Tekst bij blokje 'wettelijk kader' aan passen naar: "Archief wet- en
>   regelgeving en wat de wet verstaat onder een document."
> - Tekst bij blokje 'doelgroep' aanpassen naar: "Welke organisaties onder het
>   toezicht van de Inspectie vallen."
>
> **Inleiding: Inleiding | Toetsingskader Archiefwet**
>
> - Eerste alinea mist de voetnoot: "Dit sluit ook aan bij de Position Paper
>   nieuwe Archiefwet. De commissie bestond uit een aantal leden van de NEN
>   Commissie Informatie- en Archiefmanagement en de VNG Adviescommissie.
>   Position paper Archiefwet - KIA community."
> - Titel "Definitie duurzame toegankelijkheid" in het blauwe blok is nu
>   dubbel. Kan weg.
> - Bronverwijzing toevoegen in het blauwe blok (woord 'noodzakelijk'): Module
>   1 - De waarde van de duurzame toegankelijkheid | Nationaal Archief (tekst:
>   "De waarde van de duurzame toegankelijkheid").
>
> **Doel van het toetsingskader:** Geen opmerkingen.
>
> **Wettelijk kader: Wettelijk kader | Toetsingskader Archiefwet**
>
> - Tweede alinea (De Archiefwet definieert…) mist een hoover bij de term
>   'document'. Graag toevoegen: "In de Archiefwet 1995 waren dit
>   "archiefbescheiden"."
>
> **Opbouw en indeling: Opbouw en indeling | Toetsingskader Archiefwet**
>
> - Voorschriften, criteria en indicatoren: de zin voor de bullets is dubbel in
>   combinatie met de alinea erboven. Dus "In dit toetsingskader wordt
>   onderscheid gemaakt tussen voorschriften, criteria en indicatoren." –
>   verwijderen.
>
> **Doelgroep: Doelgroep | Toetsingskader Archiefwet**
>
> - Komma toevoegen: "Diensten, agentschappen, rijksinspecties, etc."
>
> **Onderwerpen J t/m R**
>
> In feite is dit dus alleen onderwerp metadata…, metadata integriteitscheck,
> planning- en controlcyclus.
>
> Overzichtspagina: Onderwerpen en begrippen | Toetsingskader Archiefwet
>
> - Bij 'Passende maatregelen en risicobenadering' komma weghalen: "Wat
>   passende maatregelen zijn en hoe een risicobenadering ruimte biedt voor
>   maatwerk binnen de wettelijke normen."
>
> Onderliggende pagina's:
>
> - Metadata - hardware, besturingsprogrammatuur en toepassingsprogrammatuur
>   - Bij de eerste alinea (woord 'toepassingsprogrammatuur') nog een
>     bronverwijzing toevoegen: "Ar, artikel 2.8, sub a."
>   - Bij de tweede (laatste) alinea bronverwijzing toevoegen: "Ar,
>     Toelichting, Hoofdstuk 2, Aanvullende eisen voor langdurig te bewaren
>     documenten, aanvullende metadata, p. 38."
> - Metadata – integriteitscheck
>   - Bronverwijzing toevoegen bij eerste zin bij het woord 'opgenomen': "Ar,
>     artikel 2.8, sub b."
>   - Bronverwijzing toevoegen bij de tweede zin 'zijn': "Ab, artikel 2.1, sub
>     e."
> - Passende maatregelen en risicobenadering
>   - Eerste alinea na het kopje 'Risicobenadering…', eerste zin,
>     bronverwijzing bij het laatste woord 'documenten' toevoegen: "Aw,
>     Memorie van Toelichting, Kamerstukken II 2021/22, 35968, nr. 3, 4.1
>     Duurzame toegankelijkheid."
>   - Volgende alinea, eerste zin, laatste woord 'regelgeving' bron toevoegen:
>     "Aw, artikel 4.1, lid 2."
> - Planning- en controlcyclus: Geen opmerkingen.

### Verwerking

- Nr. 1
  - Punt: Kaarttekst norm 6
  - Verwerkt in: `content/normen/06-vindbaar.md`, `kern_kaart`
- Nr. 2
  - Punt: Titel norm 6 → "Normanalyse vindbaar"
  - Verwerkt in: `06-vindbaar.md`, `title`
- Nr. 3
  - Punt: Toelichting alinea 2, bron bij "zijn" met twee vindplaatsen
  - Verwerkt in: `06-vindbaar.md`, nieuwe `[^ab-artikel-2-1-lid-1-onder-a-nota-vindbaar-p10]`; de oude `[^ab-nota-van-toelichting-vindbaar-p10]` blijft voor indicator 6.2
- Nr. 4
  - Punt: Bron bij "categorieën documenten" (alinea 3)
  - Verwerkt in: `06-vindbaar.md`, `[^aw-artikel-5-1-lid-2-onderdeel-a]`
- Nr. 5
  - Punt: Hover bij "invulling" naar de kennisbank
  - Verwerkt in: `06-vindbaar.md`, `[^na-niveau-van-maatregelen]`
- Nr. 6
  - Punt: Zoekranking synoniem "vinden"
  - Verwerkt in: **niet in content op te lossen**, zie hieronder
- Nr. 7
  - Punt: Bron 6.1: puntkomma
  - Verwerkt in: `06-vindbaar.md`, `[^aw-artikel-4-1-4-2-ar-toelichting-vinden]`
- Nr. 8
  - Punt: Criteria 6.1, derde bullet: twee links weg
  - Verwerkt in: `06-vindbaar.md`, woorden blijven staan
- Nr. 9
  - Punt: Bron 6.2: puntkomma
  - Verwerkt in: `06-vindbaar.md`, `[^ab-artikel-2-1-lid-a-nota-vindbaar]`
- Nr. 10
  - Punt: Hover bij "centrale plaats" (indicatoren 6.2)
  - Verwerkt in: `06-vindbaar.md`, `[^na-vindbaar]`
- Nr. 11
  - Punt: Bron 6.3: tweede "en" → puntkomma
  - Verwerkt in: `06-vindbaar.md`, `[^ab-artikel-2-1-ar-toelichting-p34-50-53]`
- Nr. 12
  - Punt: Bron 6.4: "en" → puntkomma
  - Verwerkt in: `06-vindbaar.md`, `[^ab-artikel-2-1-lid-1-onder-a-nota-vindbaar]`
- Nr. 13
  - Punt: Referenties 4 tot 7
  - Verwerkt in: gedekt door 7, 9, 11, 12
- Nr. 14
  - Punt: Kaart "7. Vernietigen" en kop "Kern van vernietigen"
  - Verwerkt in: `content/normen/07-vernietigen.md`, `norm_titel`; label in `layouts/shortcodes/bollendiagram.html` meegenomen
- Nr. 15
  - Punt: Bron onder de kern van norm 7
  - Verwerkt in: `07-vernietigen.md`, `kern_bron`
- Nr. 16
  - Punt: Hover bij "om te bewijzen" (criteria 7.4)
  - Verwerkt in: `07-vernietigen.md`: "om te bewijzen" is een link naar de kennisbank mét `[^na-digitaal-vernietigen]`, zodat de hover op alle drie de woorden staat (een kale voetnoot pakt alleen het laatste woord)
- Nr. 17
  - Punt: Haakje sluiten in de reikwijdte
  - Verwerkt in: `07-vernietigen.md`
- Nr. 18
  - Punt: Kaarttekst norm 8 ingekort
  - Verwerkt in: `content/normen/08-periodieke-evaluatie.md`, `kern_kaart`
- Nr. 19
  - Punt: Titel norm 8 → "Normanalyse periodieke evaluatie"
  - Verwerkt in: `08-periodieke-evaluatie.md`, `title`
- Nr. 20
  - Punt: Kaarttekst "Wettelijk kader"
  - Verwerkt in: `content/over/wettelijk-kader.md`, `description`
- Nr. 21
  - Punt: Kaarttekst "Doelgroep"
  - Verwerkt in: `content/over/doelgroep.md`, `description`
- Nr. 22
  - Punt: Voetnoot Position Paper in de inleiding
  - Verwerkt in: `content/over/inleiding.md`, `[^position-paper-archiefwet]` → <https://kiacommunity.nl/documents/73772>
- Nr. 23
  - Punt: Titel van het blauwe blok weg
  - Verwerkt in: `inleiding.md`, `titel` van de callout verwijderd
- Nr. 24
  - Punt: Bron in het blauwe blok
  - Verwerkt in: `inleiding.md`, voetnoot `[^na-module-1]` op "noodzakelijk" in een `callout-md`-blok (shortcode uit #82)
- Nr. 25
  - Punt: Hover "archiefbescheiden" bij "document"
  - Verwerkt in: `content/over/wettelijk-kader.md`, `[^archiefbescheiden]`, zie hieronder
- Nr. 26
  - Punt: Dubbele zin in "Opbouw en indeling" weg
  - Verwerkt in: `content/over/opbouw-en-indeling.md`
- Nr. 27
  - Punt: Komma in de doelgroeplijst
  - Verwerkt in: `content/over/doelgroep.md`
- Nr. 28
  - Punt: Komma weg in kaarttekst passende maatregelen
  - Verwerkt in: `content/onderwerpen/passende-maatregelen.md`, `description`
- Nr. 29
  - Punt: Twee bronnen bij metadata hardware/programmatuur
  - Verwerkt in: `content/onderwerpen/metadata-hardware-en-programmatuur.md`, `[^ar-artikel-2-8-sub-a]`, `[^ar-toelichting-aanvullende-metadata-p38]`
- Nr. 30
  - Punt: Twee bronnen bij metadata integriteitscheck
  - Verwerkt in: `content/onderwerpen/metadata-integriteitscheck.md`, `[^ar-artikel-2-8-sub-b]`, `[^ab-artikel-2-1-sub-e]`
- Nr. 31
  - Punt: Twee bronnen bij passende maatregelen
  - Verwerkt in: `passende-maatregelen.md`, `[^kamerstukken-35968-nr-3-duurzame-toegankelijkheid]`, `[^aw-artikel-4-1-lid-2]`

### Regressie en herstel (31 augustus 2026)

PR #79 (`62df65d`) was afgesplitst vóór deze PR en zette bij het mergen vijf
punten van hierboven terug: 20 en 21 (kaartteksten Wettelijk kader en
Doelgroep), 22 (voetnoot Position Paper in de inleiding), 23 en 24 (titel en
bron van het blauwe blok, dat blok verhuisde in #79 naar
`content/over/duurzame-toegankelijkheid.md` als gewone `callout` mét titel en
zonder bron). Alle vijf zijn op 31 augustus 2026 hersteld in de huidige
bestanden; het blauwe blok staat nu op de DUTO-pagina als `callout-md` zonder
titel, met `[^na-module-1]` op "noodzakelijk".

### Eén afwijking van de letterlijke vraag

**Punt 6 (zoekranking "vinden") is niet verwerkt.** De zoekfunctie komt uit het
thema (`hugo-theme-rijksoverheid`, `assets/js/search.js`) en weegt alleen
`title` (gewicht 2) en `content` (gewicht 1). De synoniemen worden door
`layouts/index.json` wél meegegeven, als apart veld én achter de tekst geplakt,
maar de zoekfunctie kent er geen eigen gewicht aan toe. Een synoniem telt dus
even zwaar als een willekeurig woord in de tekst. Oplossen betekent een
`synoniemen`-key met hoger gewicht in `search.js`, in het thema of als lokale
override. Dat is een scriptwijziging en valt buiten deze contentronde.

**Punt 25: "document" op Wettelijk kader** is een voetnoot; sinds #82 draait de
tooltip-transformatie ook op de Over-pagina's, dus het wordt daar een hover.
