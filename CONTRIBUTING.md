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
| `## Normuitleg` | uitwerking (verplicht), met daarbinnen: |
| `### <thema>` | subkop, bijvoorbeeld "Besturing" |
| `#### Voorschrift` | wat de Inspectie toetst |
| `#### Criteria` | waaraan getoetst wordt (lijst met `-`) |
| `#### Indicatoren` | hoe vastgesteld wordt of aan het criterium is voldaan (lijst met `-`) |
| `## Reikwijdte` | op welke documenten de norm van toepassing is (optioneel) |
| `## Zie ook` | verwijzingen naar andere normen of onderwerpen (optioneel) |

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
