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
