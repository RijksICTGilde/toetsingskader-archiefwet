# Informatiebehoefte — proces-matige view

Dit document beschrijft welke informatie we van juristen en beleidsmakers
nodig hebben om de proces-view (nu als PoC gebouwd op `/processen/opname/`)
door te ontwikkelen tot een volwaardige tweede ingang op het toetsingskader.

De PoC is bewust minimaal: het tagt twee voorschriften in norm 1 met
`processen: ["opname"]` en toont die gebundeld op een eigen pagina. Alle
vragen hieronder gaan over **wat we nodig hebben om dit schaalbaar en
inhoudelijk correct te maken**.

## 1. De lijst van processtappen

**Vraag**: Welke processtappen onderscheiden juristen/beleidsmakers in de
levenscyclus van een document onder de Archiefwet 2026?

Voorlopige werklijst (te bevestigen/aan te passen):

- [ ] Opname (inbeheername)
- [ ] Beheren (lopend onderhoud)
- [ ] Vinden en raadplegen
- [ ] Migreren, converteren, vervangen
- [ ] Vernietigen
- [ ] Overbrengen naar archiefdienst
- [ ] Evalueren / kwaliteitsborging

**Nodig per processtap**:

- Een **korte naam** (URL-slug + titel)
- Een **eenregelomschrijving** (voor de kaart op `/processen/`)
- Een **langere beschrijving** (1–3 alinea's op de processtap-pagina):
  wat is het, wanneer gebeurt het, wat is het startpunt en eindpunt?
- Welke **wetsartikelen** zijn primair van toepassing (Aw/Ab/Ar)?
- Welke **synoniemen** of oude termen gebruikten organisaties hiervoor?

**Ontwerpkeuzes die we samen moeten maken**:

1. Is "opname" hetzelfde als "inbeheername"? (Norm 1 heet
   "Inbeheername en beheer" — is dat één processtap of twee?)
2. Vallen "migreren", "converteren" en "vervangen" onder één
   processtap of moeten die uit elkaar?
3. Is "evalueren" een processtap in dezelfde zin als de andere, of is
   het een meta-proces dat boven de andere hangt?

## 2. Tagging van voorschriften aan processtappen

**Vraag**: Welke voorschriften horen bij welke processtap(pen)?

Dit is het meest arbeidsintensieve onderdeel. Per voorschrift in
`content/normen/*.md` moet worden bepaald welke processtap(pen) erop van
toepassing zijn. Een voorschrift kan bij meerdere processtappen horen.

**Nodig**: een matrix/spreadsheet met:

| Norm | Voorschrift (eerste zin) | Processtap(pen) |
|------|--------------------------|-----------------|
| 1    | De Inspectie toetst of regels voor het archiefbeheer…  | ? |
| 1    | De Inspectie toetst of in de beheerregels… passende maatregelen… | ? |
| …    | …                                                  | ? |

**Beslisregels die we nodig hebben**:

1. Wanneer een voorschrift gaat over **beleid/regels** (bv. "de
   beheerregels bevatten…"), tel je het dan bij de processtap waar
   die regels op van toepassing zijn, of bij een aparte processtap
   "beleid/besturing"?
2. Mag een voorschrift aan álle processtappen worden gekoppeld als het
   algemeen is, of willen we per voorschrift max. 1–2 processtappen?
3. Moeten **criteria en indicatoren** los getagd kunnen worden, of erven
   die altijd van het voorschrift?

## 3. Prioriteit: welke proces eerst?

**Vraag**: Welke processtap is voor de **gebruiker** het meest urgent om
als eerste volledig uitgewerkt te hebben?

De productvisie noemt drie doelgroepen:

- **Onder toezicht staande organisaties** — willen weten "wat moet ik
  inrichten"
- **Inspecteurs** — willen consistent toetsen
- **Stelselpartijen** — willen transparantie

Waarschijnlijk is "opname" de juiste start omdat daar de meeste
voorschriften samenkomen (norm 1 + norm 2/3/4 werken daar op in). Maar
als juristen/beleidsmakers anders prioriteren, horen we dat graag.

## 4. Inhoudelijke onderbouwing per processtap

**Vraag**: Wat moet er boven de lijst voorschriften op elke processtap-
pagina staan zodat die pagina op zichzelf bruikbaar is?

Opties die we kunnen overwegen (ter keuze):

- **Wettelijke basis** — welke artikelen vormen de juridische kern?
- **Risicobenadering** — hoe kan een organisatie differentiëren in deze
  processtap? (Dit staat nu al per norm op `/risicobenadering/`, maar
  zou per processtap ook waardevol kunnen zijn.)
- **Handelingsperspectief** — "als organisatie moet u minstens:",
  "als inspecteur toetst u op:". Dit is nieuwe content die we samen
  moeten schrijven.
- **Raakvlak met andere processtappen** — "opname raakt aan: overzicht,
  ordening, metadata". Kan deels automatisch uit de voorschrift-tagging
  worden afgeleid.
- **Veelvoorkomende situaties/voorbeelden** — concrete praktijk-
  scenario's (bv. "een e-mail binnenkomend", "een document in een
  vakapplicatie").

## 5. Relatie tot bestaande taxonomie

**Vraag**: Hoe verhoudt "processtap" zich tot het bestaande veld
`gerelateerde_onderwerpen` in de front matter?

Nu al komen daar begrippen als "Opname", "Migratie en conversie",
"Kwaliteitssysteem / periodieke evaluatie" in voor. Zijn dat dezelfde
concepten als processtappen, of een aparte laag (onderwerpen =
fijnmaziger)?

**Keuzes**:

1. Vervangen we `gerelateerde_onderwerpen` door een gestructureerde
   processtap-tagging?
2. Of houden we beide: processen = grove levenscyclus, onderwerpen =
   fijnmazige concepten?

## 6. Redactionele governance

**Vraag**: Wie bepaalt en beheert de processtap-tagging en -beschrijvingen?

- Wie tagt voorschriften (juristen, beleid, beide)?
- Wie reviewt/accordeert?
- Hoe voorkomen we dat de normen-tekst en processtap-tekst uit elkaar
  lopen bij toekomstige wijzigingen?
- Moeten processtap-beschrijvingen dezelfde juridische review doorlopen
  als normteksten?

## Concreet: volgende stap

Als bovenstaande vragen beantwoord zijn (of in een werksessie besproken),
is de vervolgactie:

1. Vastleggen definitieve lijst processtappen → stubs aanmaken in
   `content/processen/`
2. Tagging-matrix invullen (norm × voorschrift × processtap) → batch-
   gewijs front matter updaten in `content/normen/*.md`
3. Per processtap-pagina minstens `kort` en `beschrijving` schrijven
4. Valideren (script uitbreiden) dat alle gebruikte processtap-waarden
   in de gesloten lijst voorkomen

## Wat niet nodig is van juristen/beleidsmakers

Om scope-creep te voorkomen:

- **UX-keuzes** (paginalay-out, filterchips, kaartenraster) — dat regelen
  we in de templates.
- **Techniek** (Hugo-modules, CSS) — niet relevant.
- **Besluitvorming over doorontwikkeling** naar onderwerpen/rollen —
  pas nadat proces-ingang werkt.

---

# Aan te leveren door juristen / beleidsmakers

Deze sectie beschrijft **concreet** wat er opgeleverd moet worden, in
welk formaat, en in welke volgorde. Gebruik dit als checklist.

## Aanlevering 1 — Definitieve lijst processtappen

**Wat**: een lijst van processtappen met namen, volgorde en een paar
regels uitleg per stap.

**Formaat**: simpele tabel of bulletpoint-lijst (Word, Markdown of
spreadsheet — wat jullie prettig vinden). Per processtap:

| Veld                 | Voorbeeld                                            | Verplicht |
|----------------------|------------------------------------------------------|-----------|
| `korte naam`         | Opname                                               | ja        |
| `url-slug`           | `opname` (lowercase, geen spaties/accenten)          | ja        |
| `volgorde`           | 1                                                    | ja        |
| `kort (1 regel)`     | "Documenten opnemen in een beheerde omgeving zodra…" | ja        |
| `beschrijving`       | 1–3 alinea's lopende tekst                           | ja        |
| `synoniemen`         | Inbeheername, opname (DUTO)                          | nee       |
| `wettelijke basis`   | Aw art. 4.1 lid 1, Ab art. 2.1                       | aanbevolen |

**Beslispunten die jullie moeten maken** (en waarover wij graag
meedenken):

- [ ] Is "opname" = "inbeheername" of zijn dat twee stappen?
- [ ] Splitsen we "migreren / converteren / vervangen" of houden we ze
      samen?
- [ ] Is "evalueren" een processtap of een meta-laag?
- [ ] Is er een stap vóór opname (bv. "opmaken/ontvangen") of begint
      de scope pas bij opname?

**Acceptatiecriteria**:

- Elke processtap heeft een unieke `url-slug`.
- `kort` past op één regel (≤ 110 tekens).
- De lijst is in logische levenscyclus-volgorde.
- De lijst is gereviewd door minstens één jurist én één beleidsmaker.

## Aanlevering 2 — Tagging-matrix norm × voorschrift × processtap

**Wat**: voor élk voorschrift in de bestaande 8 normen één of meer
processtappen aangewezen.

**Formaat**: spreadsheet (CSV / Excel / Google Sheet). Voorbeeld:

| norm_id | voorschrift_hash                                        | processen                    |
|---------|---------------------------------------------------------|------------------------------|
| 1       | "De Inspectie toetst of regels voor het archiefbeheer…" | `besturing`                  |
| 1       | "…passende maatregelen heeft genomen om documenten…"    | `opname`, `beheren`          |
| 1       | "…alle opgemaakte en ontvangen documenten worden opgenomen…" | `opname`               |
| 2       | …                                                       | `overzicht`, `opname`        |

**Hulp die wij leveren**: wij exporteren een kant-en-klare spreadsheet
met alle ~40 voorschriften in rijen, lege `processen`-kolom, klaar om
in te vullen. Zeg het woord en we leveren dat bestand aan.

**Beslisregels die jullie vooraf moeten vastleggen**:

- [ ] Maximum aantal processtappen per voorschrift (1? 2? onbeperkt?)
- [ ] Wat doen we met voorschriften over beleid/regels (aparte
      processtap "besturing" of koppelen aan het inhoudelijke proces)?
- [ ] Worden `criteria` en `indicatoren` apart getagd of erven ze van
      het voorschrift?

**Acceptatiecriteria**:

- Elke rij heeft minstens één processtap ingevuld.
- Alle waarden in `processen` komen voor in Aanlevering 1.
- Minstens één reviewer heeft de matrix gecontroleerd.

## Aanlevering 3 — Beschrijvende content per processtap

**Wat**: per processtap een inhoudelijke tekst die bovenaan de pagina
komt, zodat de pagina op zichzelf staat (niet alleen een lijst
voorschriften).

**Formaat**: losse Word- of Markdown-bestanden, één per processtap.
Structuur per bestand:

```
# [Naam processtap]

## Wat is het?
[1–2 alinea's]

## Wanneer gebeurt het?
[1 alinea: wat triggert deze stap, wat zijn start en eind]

## Wettelijke basis
- [Artikel 1] — korte uitleg
- [Artikel 2] — korte uitleg

## Handelingsperspectief

### Voor de organisatie
[Wat moet ik minimaal doen? 3–5 bullets]

### Voor de inspecteur
[Waar toets ik op? 3–5 bullets]

## Risico's bij niet-naleving
- [Risico 1]: [wat gebeurt er als dit misgaat?]
- [Risico 2]: …

## Raakvlak met andere processtappen
[Automatisch af te leiden uit tagging, maar welke relaties wil je
expliciet benoemen?]
```

**Acceptatiecriteria**:

- Elke sectie is ingevuld of bewust leeggelaten (lege secties verbergen
  we in de template).
- Bronverwijzingen volgen dezelfde `{ref:N}`-conventie als de normen
  (wij helpen bij het omzetten).
- Juridische inhoud is gereviewd.

## Aanlevering 4 — Beslissing over `gerelateerde_onderwerpen`

**Wat**: een knoop doorhakken: vervangen we het bestaande vrije-tekst
veld `gerelateerde_onderwerpen` op de normen door de gestructureerde
processtap-tagging, of houden we beide naast elkaar?

**Formaat**: één alinea beslissing + korte motivatie.

**Keuzes**:

- [ ] Vervangen: `gerelateerde_onderwerpen` vervalt, `processen` neemt
      het over. → Cleaner, maar verlies van huidige fijnmazige termen.
- [ ] Beide houden: `processen` = levenscyclus, `gerelateerde_onderwerpen`
      = fijnmazige concepten. → Meer expressief, maar duplicatie en
      onderhoudslast.
- [ ] Onderwerpen als derde dimensie opzetten (eigen taxonomie met
      eigen pagina's). → Uitstel-optie; pas na processtap-werk.

## Aanlevering 5 — Governance-afspraken

**Wat**: vastleggen wie wat doet bij toekomstige wijzigingen.

**Formaat**: één pagina afspraken.

**Te beantwoorden vragen**:

- [ ] Wie is eigenaar van de processtap-lijst? (Inspectie? Beleid? Gedeeld?)
- [ ] Wie mag tagging wijzigen (iedereen met toegang / alleen na review)?
- [ ] Bij wijziging van een normtekst: wie checkt of de processtap-
      tagging nog klopt?
- [ ] Hoe vaak reviewen we het geheel (jaarlijks? bij elke wetswijziging)?

## Volgorde van aanlevering

De aanleveringen hebben afhankelijkheden. Werk bij voorkeur in deze
volgorde:

1. **Aanlevering 1** (processtappen-lijst) — blokkeert alle andere stappen
2. **Aanlevering 4** (onderwerpen-beslissing) — parallel met 1 te doen
3. **Aanlevering 2** (tagging-matrix) — kan pas als 1 klaar is
4. **Aanlevering 3** (content per processtap) — kan parallel met 2
5. **Aanlevering 5** (governance) — afrondend, kan gedurende het proces

## Tijdsinschatting (grove indicatie)

Van ons kant, zodra jullie aangeleverd hebben:

- Matrix-ingang werkend met alle processen: **halve dag** werk
- Content per processtap doorvoeren in templates: **halve dag** per
  processtap (afhankelijk van lengte)
- Validatiescript uitbreiden: **halve dag**

Van jullie kant, ruw geschat:

- Aanlevering 1: 1–2 werksessies van 2 uur
- Aanlevering 2: 4–8 uur (afhankelijk van mate van overeenstemming)
- Aanlevering 3: 2–4 uur per processtap

## Contact en volgende stap

Zodra Aanlevering 1 klaar is (of zelfs een eerste concept), laat het
weten — dan maken we meteen de juiste stubs in `content/processen/` en
kunnen we de matrix-ingang met écht ingevulde cellen demonstreren.
