# Changelog

Alle noemenswaardige wijzigingen aan dit project worden in dit bestand
gedocumenteerd.

Het format is gebaseerd op [Keep a Changelog v1.1.0][kac], en dit
changelog volgt [Semantic Versioning][semver].

[kac]: https://keepachangelog.com/nl/1.1.0/
[semver]: https://semver.org/lang/nl/

## [Unreleased]

### Toegevoegd

- Pagina "Samenhang van de normen" (`/samenhang/`) met het bollendiagram, de
  uitleg over richten/verrichten en de relatie met DUTO. Bevat een
  placeholder voor de nog te leveren procesplaat.
- Sectie "Onderwerpen en begrippen" (`/onderwerpen/`): alfabetische index met
  een pagina per begrip, op basis van het document "Onderwerpen en
  verwijzingen". Eigen A-Z-template met letternavigatie. Passende maatregelen
  en risicobenadering staat hier als een van de onderwerpen.

### Gewijzigd

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
- Navigatie uitgebreid met Samenhang en Onderwerpen.
- Bollendiagram herontworpen naar een hub-and-spoke-visualisatie.
- Navigatievolgorde: Normen vóór Over.
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

- Feedback-blok van de normpagina's (de `params.feedback`-config blijft).

### Opgelost

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
