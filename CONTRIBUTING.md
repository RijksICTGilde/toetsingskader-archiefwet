# Bijdragen aan het Toetsingskader Archiefwet

Fijn dat je wilt bijdragen. Dit project beheert het toetsingskader van de
Inspectie Overheidsinformatie en Erfgoed (Inspectie OE&E) voor de Archiefwet
2026. Iedere bijdrage, van een typefout tot een inhoudelijke correctie,
wordt gewaardeerd.

## Soorten bijdragen

We verwelkomen onder andere de volgende bijdragen:

- **Bugs en technische issues**: meld via [GitHub Issues](https://github.com/RijksICTGilde/toetsingskader-archiefwet/issues).
- **Inhoudelijke correcties op normen-tekst**: open een issue voor discussie
  of dien direct een pull request in met de voorgestelde wijziging.
- **Feature-verzoeken**: beschrijf het probleem en de gewenste oplossing in
  een issue, zodat we er samen over kunnen sparren.
- **Taal- en vertaalverbeteringen**: verbeteringen aan formuleringen,
  consistentie of toegankelijkheid van de tekst zijn altijd welkom.

## Voor redacteuren (zonder technische achtergrond)

Normpagina's bewerk je rechtstreeks op GitHub — er hoeft niets
geïnstalleerd te worden. Zie ook de training in
`docs/training-contentbeheer.html` (download en open in je browser).

### Een pagina aanpassen

1. Ga naar de map [`content/normen/`](content/normen/) en klik op de norm.
2. Klik rechtsboven op het potlood-icoon ("Edit this file").
3. Pas de tekst aan. Boven in het bestand (tussen de `---`-strepen) staan
   alleen titel, kern en synoniemen; de rest van de pagina is gewone tekst
   met koppen.
4. Klik op "Commit changes…", kies **"Create a new branch"** en start een
   pull request. Je wijziging gaat nooit direct live.
5. Wacht op de automatische controle (groen vinkje). Bij een rood kruis:
   klik op "Details" — de foutmelding vertelt in het Nederlands wat er
   mis is en op welke regel.

### Opbouw van een normpagina

| Kop | Betekenis |
|---|---|
| `## Toelichting` | uitleg van de norm (verplicht) |
| `## Voorschriften` | uitwerking (verplicht), met daarbinnen: |
| `### <thema>` | optionele subkop, alleen als het normblad er een heeft (bijvoorbeeld "Besturing") |
| `#### Voorschrift` | de norm zelf, als eis geformuleerd ("Het verantwoordelijke overheidsorgaan heeft …"), niet als toetsvraag |
| `##### Criteria` / `##### Criterium` | onder het voorschrift: waaraan getoetst wordt (lijst met `-`); enkelvoud als het normblad dat schrijft |
| `##### Indicatoren` / `##### Indicator` | onder het voorschrift: hoe vastgesteld wordt of aan het criterium is voldaan (lijst met `-`); enkelvoud als het normblad dat schrijft |
| `## Reikwijdte` | op welke documenten de norm van toepassing is (optioneel; mag een achtervoegsel hebben, zoals "Reikwijdte inbeheername en beheer") |
| `## Gerelateerde onderwerpen` | verwijzingen naar andere normen of onderwerpen (optioneel) |

### Bronnen (voetnoten)

Zet `[^naam]` direct achter het woord dat je onderbouwt en zet de bron
eronder. De nummering en de bronnenlijst onderaan de pagina gaan vanzelf.

```markdown
Een document moet in beheer zijn.[^aw-4-1-lid-1]

[^aw-4-1-lid-1]: Aw, artikel 4.1, lid 1. [Bekijk bron](https://zoek.officielebekendmakingen.nl/kst-35968-2.html)
```

- Dezelfde bron nog een keer gebruiken? Typ alleen opnieuw `[^aw-4-1-lid-1]`
  (zonder de regel eronder te herhalen).
- Een bron zonder link mag ook: laat het `[Bekijk bron](…)`-deel weg.
- Namen: kleine letters, cijfers en koppeltekens (bv. `[^kamerstuk-35968]`).

## Pre-commit

Dit project gebruikt [pre-commit](https://pre-commit.com/) om wijzigingen
lokaal te valideren. Installatie is verplicht (lokaal én via CI):

```bash
pip install pre-commit
pre-commit install
```

De hooks valideren onder meer:

- **Norm-frontmatter** via `scripts/validate-norms.py` (controleert de YAML
  van bestanden onder `content/normen/`).
- **EOF en whitespace** (trailing whitespace, einde-bestand-newline).

Draai handmatig over alle bestanden vóór je een PR opent:

```bash
pre-commit run --all-files
```

## Workflow

1. Fork de repository of maak een feature-branch aan (indien je
   schrijfrechten hebt).
2. Maak je wijziging in een kleine, gerichte commit (of een handvol).
3. Zorg dat `just build` lokaal slaagt en alle pre-commit-hooks groen zijn.
4. Open een pull request tegen `main` met een duidelijke beschrijving van
   wat je wijzigt en waarom.
5. Wacht op review. We streven naar een reactie binnen redelijke termijn.
6. Na akkoord wordt de PR gemerged.

## Changelog

Elke PR die de site, de PDF's of de inhoud verandert, zet een regel onder
`## [Unreleased]` in [`CHANGELOG.md`](CHANGELOG.md):

- **Merkt een bezoeker of PDF-lezer het?** Dan een regel onder Toegevoegd,
  Gewijzigd, Verwijderd of Opgelost, in gewone taal: wat er voor de lezer
  verandert, zonder bestandsnamen, code of PR-nummers. Deze regels staan op
  de site, in het blok Versies van de website op de pagina Totstandkoming.
- **Raakt het alleen bouw, CI, configuratie of tests?** Dan onder
  `### Techniek`; daar mag het technisch.
- **Allebei?** Dan een publieksregel én een regel onder Techniek.
- Updates van dependencies (Dependabot) krijgen geen regel.

Bij een release komen de regels onder `[Unreleased]` in een nieuwe sectie
met versienummer en datum; zie [Een release maken](#een-release-maken).

## Een release maken

Een release is een knop, een pull request en een merge. Hieronder staat
`X.Y.Z` voor de nieuwe versie (zie het release-proces in
[`GOVERNANCE.md`](GOVERNANCE.md) voor de keuze van het nummer).

1. Controleer `## [Unreleased]` in `CHANGELOG.md`. Een lege sectie geeft een
   foutmelding.
2. Start in Actions de workflow **Prepare release** op `main` en vul de versie
   in, zonder `v`.
3. De workflow opent de pull request `Release vX.Y.Z`. Daarin staat de inhoud
   van `[Unreleased]` onder `## [X.Y.Z] - <datum>`, en de versie en datum in
   `publiccode.yml`. Controleer de tekst, de datum en de CI.
4. Merge de pull request. **Release** maakt de tag `vX.Y.Z` en publiceert de
   GitHub release met de tekst uit de changelog. Daarmee zet **Deploy to
   ZAD** de site live.

Zonder de workflow kan het ook: draai `node scripts/release.mjs X.Y.Z` in een
gewone pull request, merge die en publiceer daarna op GitHub een release met
de tag `vX.Y.Z` op `main`. De tekst voor de release geeft
`node scripts/release.mjs --notes X.Y.Z`.

Een release zonder sectie `## [X.Y.Z]` in `CHANGELOG.md` gaat niet live:
**Deploy to ZAD** stopt dan voor het bouwen, en **Test** faalt zolang de
laatste tag geen sectie heeft. Herstel het met een pull request die de sectie
toevoegt; publiceer de release daarna opnieuw (verwijder eerst release en tag).

### Eenmalige instelling

**Prepare release** en **Release** gebruiken een token van een GitHub App.
Met het standaard `GITHUB_TOKEN` draaien de tests niet op de release-PR en
start een release de deploy niet. Een eigenaar van de organisatie
RijksICTGilde maakt een App met **Contents** en **Pull requests** op **Read
and write**, installeert die op deze repository en maakt hier een environment
`release` (alleen branch `main`) met de variabele `RELEASE_APP_CLIENT_ID` en
het secret `RELEASE_APP_PRIVATE_KEY`. De stappen staan uitgeschreven in
[CONTRIBUTING.md van hugo-theme-rijksoverheid](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/blob/main/CONTRIBUTING.md#eenmalige-instelling);
dezelfde App kan ook deze repository krijgen.

## Stijl

- **Taal**: alle commit-messages, PR-beschrijvingen, issues en documentatie
  zijn in het Nederlands.
- **Conventional commits**: optioneel maar gewaardeerd. Veelgebruikte
  prefixes zijn `feat:`, `fix:`, `chore:`, `docs:` en `refactor:`. Voorbeeld:
  `fix: typo in norm A.1.2 hersteld`.
- **Korte, beschrijvende commits** met een onderwerpregel van max. 72
  tekens.

## Tests en CI

Controleer lokaal vóór je een PR opent:

```bash
just build          # Hugo-build moet slagen
pre-commit run --all-files
```

In CI draaien dezelfde stappen, aangevuld met
[htmltest](https://github.com/wjdp/htmltest) op de gerenderde site om
gebroken links en HTML-fouten op te sporen.

## Inhoudelijke wijzigingen aan normen-tekst

Wijzigingen onder `content/normen/` raken de juridisch-inhoudelijke kern
van het toetsingskader. Vermeld in de PR-beschrijving expliciet:

- **Wie heeft de inhoudelijke wijziging geverifieerd?** (naam of rol)
- **Is dit afgestemd met de Inspectie OE&E?** (ja/nee, met korte
  toelichting)

PR's zonder deze informatie kunnen niet inhoudelijk worden gemerged.

## Vragen?

- Open een [GitHub Issue](https://github.com/RijksICTGilde/toetsingskader-archiefwet/issues)
  voor publieke vragen of discussie.
- Of mail naar <toetsingskader@inspectie-oe.nl> voor inhoudelijke vragen
  aan de inspectie.

Bedankt voor je bijdrage!
