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
- **Technisch onderhoud**: het **RijksICTGilde** verzorgt het onderhoud van
  de Hugo-site, de CI/CD-pipeline, de infrastructuur en het
  open-source-proces.

## Maintainers

De huidige maintainers met merge-rechten zijn:

- @maintainer1
- @maintainer2

> Deze lijst wordt dynamisch bijgehouden via GitHub-rollen en het
> [`CODEOWNERS`](.github/CODEOWNERS)-bestand (indien aanwezig). Vul de
> placeholders hierboven in met de daadwerkelijke GitHub-handles zodra die
> bekend zijn.

## Besluitvorming over inhoud

Wijzigingen aan de **normen-tekst** (`content/normen/`) en andere
toetsingskader-inhoud vallen onder de eindverantwoordelijkheid van de
Inspectie OE&E. Concreet betekent dit:

- Inhoudelijke PR's worden niet gemerged zonder review door
  inspectie-personeel of een door de inspectie aangewezen reviewer.
- De inspectie heeft vetorecht over inhoudelijke wijzigingen.
- Tekstuele verbeteringen (typo's, formulering) kunnen door tech-maintainers
  worden gemerged, mits ze de strekking van een norm niet wijzigen.

Zie [`CONTRIBUTING.md`](CONTRIBUTING.md) voor de PR-vereisten bij
inhoudelijke wijzigingen.

## Besluitvorming over techniek

Tech-keuzes (theme-updates, build-pipeline, dependencies, deploy-strategie)
worden genomen door de maintainers binnen het RijksICTGilde. Bij
controversiële of impactvolle wijzigingen — denk aan grote refactors,
veranderingen in de publicatie-URL of breaking changes voor bijdragers —
wordt eerst een GitHub Issue aangemaakt voor publieke discussie voordat
implementatie start.

## Release-proces

- **Versiebeheer**: [Semantic Versioning](https://semver.org/lang/nl/)
  (`MAJOR.MINOR.PATCH`). Releases worden gemarkeerd met een Git-tag.
- **Deployment**: elke merge naar `main` triggert een automatische
  deployment via de **ZAD-pipeline**. De productieomgeving weerspiegelt
  dus altijd de laatste staat van `main`.
- **Tags**: een nieuwe tag wordt geplaatst bij betekenisvolle releases
  (bijv. een vastgestelde versie van het toetsingskader).

## Maintainer worden

Maintainership is geen formele aanvraagprocedure maar groeit organisch:

1. Lever consistent kwaliteitsvolle bijdragen (code, content, reviews of
   issue-triage).
2. Wees actief en constructief in discussies.
3. Word genomineerd door een bestaande maintainer; de overige maintainers
   beslissen via consensus.

Maintainers die langere tijd inactief zijn, kunnen in onderling overleg
hun rechten teruggeven of geparkeerd worden tot ze weer actief zijn.

## Vragen over governance

Vragen of voorstellen over dit document? Open een GitHub Issue of mail
naar <toetsingskader@inspectie-oe.nl>.
