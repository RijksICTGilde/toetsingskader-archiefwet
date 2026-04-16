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
