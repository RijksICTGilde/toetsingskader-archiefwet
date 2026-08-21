# Changelog

Alle noemenswaardige wijzigingen aan dit project worden in dit bestand
gedocumenteerd.

Het format is gebaseerd op [Keep a Changelog v1.1.0][kac], en dit
changelog volgt [Semantic Versioning][semver].

[kac]: https://keepachangelog.com/nl/1.1.0/
[semver]: https://semver.org/lang/nl/

## [Unreleased]

### Toegevoegd

- Normen 2 tot en met 8 gevuld met de teksten uit de normbladen (4e iteratie):
  kern, synoniemen, toelichting, voorschriften met criteria en indicatoren,
  reikwijdte en "Zie ook". De PLACEHOLDER-stubs zijn daarmee weg; norm 1 was
  al eerder gemigreerd.
- Begrippenpagina "Werkproces", met de definitie die als losse zin onder norm 3
  stond. Het woord "werkproces" in de toelichting linkt ernaar — dezelfde
  hover-oplossing als bij de begrippen hieronder.
- Begrippenpagina's voor de termen waar de normbladen om een hover vroegen:
  "Applicatie en systeem", "Structuur", "Verschijningsvorm" en "Strategisch
  informatieoverleg (SIO)". De hover-opmerkingen zijn verwerkt als link naar
  de begrippenindex of, bij een externe bron, als link naar de kennisbank van
  het Nationaal Archief (niveau van maatregelen, overwegingen bij
  implementatie, vindbaar, betrouwbaar, digitaal vernietigen,
  overheidsinformatie binnen de informatiehuishouding).
- Pagina "Samenhang van de normen" (`/samenhang/`) met het bollendiagram, de
  uitleg over richten/verrichten en de relatie met DUTO.
- Sectie "Onderwerpen en begrippen" (`/onderwerpen/`): alfabetische index met
  een pagina per begrip, op basis van het document "Onderwerpen en
  verwijzingen". Eigen A-Z-template, gegroepeerd per beginletter. Passende
  maatregelen en risicobenadering staat hier als een van de onderwerpen.

### Gewijzigd

- Feedbackronde op de normbladen ordenen, metadateren en informatiebeveiliging
  verwerkt:
  - De paginatitels volgen het normblad: "Normanalyse ordenen", "Normanalyse
    metadateren" en "Normanalyse informatiebeveiliging en betrouwbaar" (was
    "Normanalyse Ordeningsstructuur", "Normanalyse Metadata" en "Normanalyse
    informatiebeveiliging en betrouwbaarheid van documenten").
  - Norm 4: de bron bij NEN-ISO 23081-1:2017 wees naar een DMS-bestand dat
    buiten de organisatie niet te openen is; hij wijst nu naar
    [NEN-ISO 23081-1:2017 nl](https://www.nen.nl/nen-iso-23081-1-2017-nl-269387)
    op nen.nl.
  - Norm 4: de drie zinnen die de categorieën documenten inleiden ("Alle
    documenten, ongeacht de bewaartermijn …", "Digitale documenten met een
    bewaartermijn langer dan tien jaar …", "Over te brengen documenten …") zijn
    tussenkopjes (`###`) op hetzelfde niveau als "Feitelijk beheer" bij norm 1.
    Ze liepen als losse alinea door in het voorschrift ervoor.
  - Norm 4: hover bij "structuur" leest "aan een bericht dat bijlagen bevat";
    de bron bij het permanent uniek identificatiekenmerk (voorschrift 4.3) is
    "Ar, artikel 2.7; Ar, artikel 2.8; Archiefregeling, Toelichting, 2.2
    Aanvullende eisen voor langdurig te bewaren documenten in digitale vorm,
    p.37."
  - Norm 5: de hover bij "informatiebeveiliging" in de toelichting noemt nu de
    onderwerpen waar de Inspectie zich niet op richt (firewalls, encryptie,
    antivirussoftware, MFA, patchen). Toegevoegd aan de bestaande bronvoetnoot
    op dat woord in plaats van als tweede voetnoot: twee voetnootmarkeringen
    achter elkaar geven één zwevend nummer, omdat de tooltip-transformatie in
    `layouts/normen/single.html` het voorafgaande woord pakt.
  - Norm 5: de twee back-upindicatoren bij voorschrift 5.1 stonden ingesprongen
    en staan nu op hetzelfde niveau als de andere indicatoren; de bron bij 5.1
    scheidt de twee vindplaatsen met een puntkomma; de bron bij het laatste
    criterium van 5.4 legt uit wat "ongeoorloofd" betekent en is niet langer
    een half afgemaakte notitie.
- Kop boven de kern noemt de norm: "Kern van ordenen" in plaats van "Kern van
  de norm", op de normpagina, in de inhoudsopgave en in de PDF. Uit
  `norm_titel`, dus voor alle acht normen tegelijk.
- Sectiekop `## Normuitleg` heet `## Voorschriften`, in alle acht normbladen
  en in de validator, de training voor contentbeheer en de accentlijn-CSS.
- Norm 3 (Ordenen) verwerkt naar het herziene normblad: de kern is de
  kerntekst uit het normblad zelf, met bronvermelding (Ar, artikel 2.2,
  eerste lid); de drie voorschriften staan als norm geformuleerd in plaats
  van als toetsvraag ("De Inspectie toetst of …"); "overdragen" is
  "overbrengen" in de toelichting; de twee bronnen bij voorschrift 3.3 staan
  in de volgorde van het normblad (artikel vóór toelichting).
- De kaart op `/normen/` houdt de kortere omschrijving uit het
  introductiedocument (front matter `kern_kaart`), zodat de normpagina de
  normbladtekst kan tonen zonder dat de index verandert.
- De review op normblad Ordenen gold expliciet voor alle normbladen; die twee
  punten zijn nu ook op de normen 1, 2 en 4 tot en met 8 doorgevoerd:
  - De `kern` is de kerntekst uit het normblad zelf, met bronvermelding
    (`kern_bron`/`kern_bron_url`). De kortere zin uit "0) Introductie" die er
    stond staat nu in `kern_kaart` en blijft dus op de kaart in `/normen/`.
    Waar die normbladtekst ook als eerste alinea onder `## Toelichting` stond
    (normen 2, 4, 5, 6 en 7) is die dubbeling weg.
  - De voorschriften zijn letterlijk de normbladtekst en staan als eis
    geformuleerd ("Het verantwoordelijke overheidsorgaan heeft …") in plaats
    van als toetsvraag ("De Inspectie toetst of …"). De bronvoetnoten bleven
    gelijk. `CONTRIBUTING.md` en de training voor contentbeheer beschrijven
    die vorm nu ook; `CONTRIBUTING.md` noemde daar bovendien nog de oude kop
    `## Normuitleg`.
- De tekst van de normbladen staat nu woord voor woord op de site. De
  redactionele bewerkingen die er tot nu toe op zaten zijn teruggedraaid: de
  spellings- en congruentiecorrecties op het normblad ("emailapplicaties",
  "maateregelen", "plaats vond", "Metadata wordt", "de inhoud … zijn", het
  ontbrekende haakje in "(digitaal of papier."), de uitgeschreven afkortingen
  in de lopende tekst ("WOO", "etc.", "SIO", "functies/rollen"), en de
  normnamen uit normblad 8 in plaats van de sitenaamgeving. Ook de vier zinnen
  die de site had toegevoegd om naar de kennisbank van het Nationaal Archief
  te linken (architectuur/overwegingen bij implementatie, niveau van
  maatregelen, digitaal vernietigen, aangrijpingspunt) staan niet in de
  normbladen en zijn eruit; die vier externe links vervallen daarmee.
  Vervolgens is ook de rest gelijkgetrokken, zodat de normpagina's nu op elk
  punt het normblad volgen:
  - **Koppen.** De paginatitel is de normbladtitel ("Normanalyse Metadata"),
    de kop boven de kern komt uit het nieuwe front-matter-veld `kern_kop`
    ("Kern van Ordeningsstructuur" — die titels wijken af van de normnamen die
    de site verder voert, dus `norm_titel` blijft ongemoeid en daarmee ook het
    bollendiagram, de kaarten op `/normen/` en de navigatie). `## Zie ook`
    heet `## Gerelateerde onderwerpen`, norm 1 heeft weer
    `## Reikwijdte inbeheername en beheer`, en `#### Criteria`/`#### Indicatoren`
    staan in het enkelvoud waar het normblad dat schrijft. De dertien
    `### <thema>`-koppen die de site zelf had bedacht zijn weg; alleen
    "Besturing" en "Feitelijk beheer" blijven, want die staan in normblad 1.
  - **Voetnoten.** 57 bronvermeldingen zijn letterlijk de normbladtekst
    geworden ("Aw, Memorie van Toelichting", "AW1995", "p.34", "t.b.v.").
    Twee blijven afwijken: `hyperlink-duto` (het normblad geeft daar de
    instructie "Hyperlink naar DUTO", geen bron) en de bron bij voorschrift
    3.3, waarvan de reviewer expliciet de volgorde vroeg.
  - **Synoniemen en gerelateerde onderwerpen** volgen de lijsten uit het
    normblad. Norm 5 verliest daarmee zijn sectie, want normblad 7 heeft er
    geen; termen zonder eigen pagina staan als platte tekst.
  - De validator, de unittests, de PDF-export, de training en `CONTRIBUTING.md`
    zijn op het nieuwe formaat gezet. `### <thema>` is optioneel geworden en
    enkelvoudige subkoppen zijn niet langer een fout.

  Buiten de regel blijft alleen "overbrengen" in norm 3 — die correctie vroeg
  de reviewer zelf — en de `<<…>>`-markeringen, die een linkinstructie zijn en
  geen tekst.
- Thema bijgewerkt naar `hugo-theme-rijksoverheid` v0.2.0. Daarin zitten vijf
  toegankelijkheidsfixes die hier als tijdelijke overrides stonden
  (focusindicatoren in de zoekresultaten, het zoekveld en de footerlinks; het
  contrast van de sneltoetshint; de meldbalk die de focus kon afdekken) plus
  de "naar boven"-knop als theme-component.
- Norm 1 (Inbeheername en beheer) bijgewerkt naar het herziene normblad
  "1) Normanalyse beheer" (4e iteratie): toelichting aangevuld met archiveren
  by design, de koppeling van categorieën aan het selectiebesluit en de
  publicatie van de beheerregeling; criteria voor passende maatregelen
  uitgebreid (alle opslagomgevingen, actueel, worden toegepast); het SIO is
  verplaatst naar een indicator bij het voorschrift over de omschrijving van
  passende maatregelen; het informatiebeheerplan is een indicator bij het
  voorschrift over periodieke evaluatie geworden; migratie/conversie/
  vervanging en vernietiging toegevoegd aan de beheertaken, en het opslaan en
  verwerken binnen de Europese Unie daaruit verwijderd.
- "Terug naar boven"-knop op elke pagina, zichtbaar zodra er meer dan een
  schermhoogte is gescrold — bedoeld voor de lange normpagina's.
- Versienummer van het toetsingskader staat nu ook als label in de paginavoet,
  naast de laatst-gewijzigd-datum. Dat blijft staan wanneer de beta-banner
  verdwijnt.
- De "Over"-index toont dezelfde boxed card-grid als de normen-index.
- Voetnootnummers in de PDF staan als superscript (kleiner en hoger), zoals op
  de site.
- De `kern` van de normen 1, 2, 3, 4 en 8 komt nu overeen met de
  geactualiseerde inhoudsopgave uit "0) Introductie toetsingskader"; de
  oudere formuleringen op de site zijn vervallen.
- Normen hernoemd zodat bestandsnaam, `norm_id` en `norm_titel` overeenkomen
  met de volgorde uit de introductie van het toetsingskader:
  `03-ordeningsstructuur` → `03-ordenen`, `04-metadatering` →
  `04-metadateren`, `06-vernietigen` → `05-betrouwbaar` (titel nu
  "Informatiebeveiliging en betrouwbaar"), `05-vindbaarheid` →
  `06-vindbaar`, `07-informatiebeveiliging` → `07-vernietigen`. Oude URL's
  blijven werken via aliases.
- "Over" is een sectie geworden met losse pagina's per onderwerp (inleiding,
  doel, wettelijk kader, opbouw en indeling, doelgroep, passende maatregelen
  en risicobenadering), met de herziene teksten uit de introductie.
- Homepage: tekst over beheer aangepast aan de actuele introductie; het
  bollendiagram staat niet meer op de homepage maar op de samenhang-pagina,
  met links naar samenhang, passende maatregelen en de index.
- "Niet van toepassing" bij criteria en indicatoren vervangen door
  "Bij dit voorschrift zijn geen aanvullende criteria/indicatoren"
  (voorlopige formulering).
- Hoofdnavigatie uitgebreid met Onderwerpen en Samenhang; de volgorde is nu
  Home, Normen, Onderwerpen, Samenhang, Over.
- Bollendiagram herontworpen naar een hub-and-spoke-visualisatie.
- Footer beperkt tot contact, privacy, cookies, toegankelijkheid,
  kwetsbaarheid melden en terug naar hoofdsite.
- Voorschriften worden genummerd (`<norm>.<n>`, bv. 1.1, 1.2).
- Toelichting is inklapbaar (standaard dicht); Toelichting en Referenties
  delen één (thema-)accordeonstijl.
- Heading-hiërarchie in Normuitleg verduidelijkt (voorschrift als accent-kop,
  duidelijke overgang tussen thema's).
- PDF-export toegevoegd: downloadbare Rijkshuisstijl-PDF per normpagina en
  voor het hele toetsingskader, met titelpagina, release-tag en
  downloaddatum. Client-side gegenereerd met pdfMake; CSP-veilig. Als
  briefhoofd op elke pagina de volledige logo-lockup: Rijksoverheidslint met
  "Inspectie Overheidsinformatie en Erfgoed" en "Ministerie van Onderwijs,
  Cultuur en Wetenschap". Het lint staat horizontaal gecentreerd en loopt af
  aan de bovenrand van de pagina, zoals de huisstijl voorschrijft.

### Verwijderd

- De project-eigen "naar boven"-knop (`layouts/baseof.html`,
  `_partials/terug-naar-boven.html`, `js/back-to-top.js`,
  `css/terug-naar-boven.css`). De knop komt nu uit het thema, aangezet met
  `back_to_top: true`. Daarmee vervalt ook de baseof-shadow. Het thema zet
  geen `scroll-behavior: smooth` meer, dus anchors springen direct.
- Feedback-blok van de normpagina's (de `params.feedback`-config blijft).
- De card-grid naar de secties op de homepage: die dupliceerde de
  hoofdnavigatie. De tegels ("Wat is het?", "Voor wie?", "Wanneer?", "Waar
  beginnen?") blijven.
- De leeswijzer-callout op `/normen/`: voorschrift, criterium en indicator
  staan al uitgelegd op [Opbouw en indeling](/over/opbouw-en-indeling/).

### Opgelost

- Voorschriftnummering (`<norm>.<n>`) ontbrak in de PDF-export; de nummering
  is nu gedeeld tussen webpagina en PDF, zowel per norm als in de kader-PDF.
- Interne normverwijzingen gecorrigeerd: "(gecontroleerd) vernietigen" wees
  naar de norm "Betrouwbaar" maar hoort naar "Gecontroleerd vernietigen"
  (`07-informatiebeveiliging`); "risicobenadering"/"risicoanalyse" wezen naar
  de sectie-index in plaats van de over-pagina.
- Voetnoot-verwijzingen werken nu ook na een spatie of leesteken en op links
  (geen lege of op-een-leesteken-geplaatste hover-term meer); een term die
  tegelijk een interne link is, wordt blauw met de voetnoot-stippellijn.
- Zoek-highlight knipt links in de paginatekst niet meer op.
- "Op deze pagina"-TOC volgt de actieve sectie nu vloeiend mee; voorheen
  verdween de highlight in de voorschrift-/criteria-/indicator-blokken
  (project-scroll-spy; thema-fix als upstream-PR ingediend).

## [0.1.0] - 2026-06-17

- Normcontent verplaatst van YAML front matter naar markdown-body met
  vaste koppen; bronnen zijn nu standaard markdown-voetnoten. Validator
  en redacteursdocumentatie vernieuwd; training toegevoegd
  (`docs/training-contentbeheer.html`).
- Eerste versie van het Toetsingskader Archiefwet als publieke Hugo-site.

[Unreleased]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.1.0
