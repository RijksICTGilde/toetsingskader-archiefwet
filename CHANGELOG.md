# Changelog

Alle noemenswaardige wijzigingen aan dit project worden in dit bestand
gedocumenteerd.

Het format is gebaseerd op [Keep a Changelog v1.1.0][kac], en dit
changelog volgt [Semantic Versioning][semver].

[kac]: https://keepachangelog.com/nl/1.1.0/
[semver]: https://semver.org/lang/nl/

## [Unreleased]

### Gewijzigd

- Bollendiagram herontworpen naar een hub-and-spoke-visualisatie.
- Navigatievolgorde: Normen vóór Over.
- Footer beperkt tot contact, privacy, cookies, toegankelijkheid,
  kwetsbaarheid melden en terug naar hoofdsite.
- Voorschriften worden genummerd (`<norm>.<n>`, bv. 1.1, 1.2).
- Toelichting is inklapbaar (standaard dicht); Toelichting en Referenties
  delen één (thema-)accordeonstijl.
- Heading-hiërarchie in Normuitleg verduidelijkt (voorschrift als accent-kop,
  duidelijke overgang tussen thema's).

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

## [0.1.0] - 2026-06-17

- Normcontent verplaatst van YAML front matter naar markdown-body met
  vaste koppen; bronnen zijn nu standaard markdown-voetnoten. Validator
  en redacteursdocumentatie vernieuwd; training toegevoegd
  (`docs/training-contentbeheer.html`).
- Eerste versie van het Toetsingskader Archiefwet als publieke Hugo-site.

[Unreleased]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.1.0
