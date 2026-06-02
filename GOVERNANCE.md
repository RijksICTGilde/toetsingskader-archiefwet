# Governance

Dit document beschrijft hoe het Toetsingskader Archiefwet wordt bestuurd:
wie verantwoordelijk is voor de inhoud, wie voor de techniek, en hoe
besluiten worden genomen.

## Eigenaarschap

- **Inhoudelijk eigenaar**: de **Inspectie Overheidsinformatie en Erfgoed
  (Inspectie OE&E)** is verantwoordelijk voor de tekst van het
  toetsingskader, de normen en de bijbehorende toetsingscriteria. De
  inspectie bepaalt de inhoudelijke koers en autoriseert wijzigingen aan
  normen.
- **Technisch onderhoud**: het **Rijks ICT Gilde** verzorgt het onderhoud
  van de Hugo-site, de CI/CD-pipeline, de infrastructuur en het
  open-source-proces. Merge-rechten en review-routing zijn vastgelegd in
  [`.github/CODEOWNERS`](.github/CODEOWNERS).

## Besluitvorming over inhoud

Wijzigingen aan de **normen-tekst** (`content/normen/`) en andere
toetsingskader-inhoud vallen onder de eindverantwoordelijkheid van de
Inspectie OE&E. Concreet betekent dit:

- Inhoudelijke PR's worden niet gemerged zonder review door
  inspectie-personeel of een door de inspectie aangewezen reviewer.
- De inspectie heeft vetorecht over inhoudelijke wijzigingen.
- Tekstuele verbeteringen (typo's, formulering) kunnen door
  tech-maintainers worden gemerged, mits ze de strekking van een norm
  niet wijzigen.

Zie [`CONTRIBUTING.md`](CONTRIBUTING.md) voor de PR-vereisten bij
inhoudelijke wijzigingen.

## Besluitvorming over techniek

Tech-keuzes (theme-updates, build-pipeline, dependencies,
deploy-strategie) worden binnen het Rijks ICT Gilde genomen. Bij
controversiële of impactvolle wijzigingen (grote refactors, verandering
van publicatie-URL, breaking changes voor bijdragers) wordt eerst een
GitHub Issue aangemaakt voor publieke discussie voordat implementatie
start.

## Release-proces

- **Versiebeheer**: [Semantic Versioning](https://semver.org/lang/nl/)
  (`MAJOR.MINOR.PATCH`). Releases worden gemarkeerd met een Git-tag.
- **Deployment**: elke merge naar `main` triggert een automatische
  deployment via de **ZAD-pipeline**. De productieomgeving weerspiegelt
  dus altijd de laatste staat van `main`.

## Vragen over governance

Open een GitHub Issue of mail naar <toetsingskader@inspectie-oe.nl>.
