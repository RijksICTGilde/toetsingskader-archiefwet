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
  open-source-proces.
- **Rechten op `main`**: een ruleset op de standaardbranch laat wijzigingen
  alleen binnenkomen via een pull request met minstens één goedkeuring, en
  blokkeert force-push en verwijderen. Eén beheerder mag die regel omzeilen.
  Wie schrijfrechten heeft (en dus mag mergen en releasen), staat in de
  instellingen van de repository.

## Besluitvorming over inhoud

Wijzigingen aan de **normen-tekst** (`content/normen/`) en andere
toetsingskader-inhoud vallen onder de eindverantwoordelijkheid van de
Inspectie OE&E. Concreet betekent dit:

- Inhoudelijke PR's worden niet gemerged zonder review door
  inspectie-personeel of een door de inspectie aangewezen reviewer. Dit is
  een afspraak: GitHub dwingt alleen af dat er één goedkeuring is, niet van
  wie.
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
  (`vMAJOR.MINOR.PATCH`, als Git-tag). PATCH bij kleine correcties, MINOR
  bij nieuwe of uitgebreide inhoud, MAJOR bij grote, ingrijpende
  wijzigingen.
- **Pull request**: elke PR (behalve die van bots, zoals Dependabot) krijgt een
  preview op ZAD, op `https://frontend-pr-<nummer>-toets-hn7.rig.prd1.gn2.quattro.rijksapps.nl/`.
  De link staat als reactie in de PR; bij sluiten wordt de preview
  opgeruimd.
- **Merge naar `main`**: draait de tests, maar verandert de
  productiesite niet. `main` kan dus voorlopen op wat live staat.
- **Release**: pas het publiceren van een GitHub-release met een nieuwe
  tag zet de site live op <https://toetsingskader.inspectie-oe.nl/archiefwet/>.
  De pipeline (`.github/workflows/zad.yml`) bouwt dan een image met die
  tag; het versienummer op de site en in de PDF's is de tag.
- **Een release maken**: de workflow **Prepare release** opent een PR die
  `[Unreleased]` in `CHANGELOG.md` onder het nieuwe versienummer zet; na de
  merge publiceert de workflow **Release** de tag en de GitHub release. Zie
  "Een release maken" in [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Changelog afgedwongen**: een lege `[Unreleased]` geeft geen release, een
  release zonder sectie `## [X.Y.Z]` in `CHANGELOG.md` gaat niet live, en de
  tests falen zolang de laatste tag geen sectie heeft.

## Vragen over governance

Open een GitHub Issue of mail naar <toetsingskader@inspectie-oe.nl>.
