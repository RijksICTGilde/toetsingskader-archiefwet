# Toegankelijkheidsonderzoek — Toetsingskader Archiefwet

**Vooronderzoek, geen toegankelijkheidsverklaring.** Een deel van WCAG is niet
vast te stellen zonder browser, hulpsoftware en echte gebruikers; zie
[Beperkingen](#beperkingen-van-dit-onderzoek).

- **Norm:** WCAG 2.2 AA (EN 301 549, Tijdelijk besluit digitale toegankelijkheid
  overheid)
- **Omvang:** alle 14 gegenereerde pagina's van `main` (`af40029`), Hugo 0.152.2
  extended, thema v0.1.0
- **Reproduceren:** `hugo && npm run test:a11y` (`scripts/a11y-scan.mjs`)

6 augustus 2026, twee keer bijgewerkt:

- **10 augustus** — bevindingen 27 en 28 opgelost, drie thema-issues ingediend,
  browsertests toegevoegd; die leverden meteen drie nieuwe AA-bevindingen op
  (29, 30, 31).
- **12 augustus** — 1a, 1b, 1c, 12 en 17 upstream opgelost in thema v0.2.0
  ([PR #19](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/pull/19));
  de overrides zijn hier weggehaald.

---

## Samenvatting

"Blokkeert AA" betekent: zolang dit open staat, kan de site niet als
WCAG 2.2 AA-conform worden verklaard. De kolom **Status** beschrijft de stand op
de branch `chore/wcag-2.2-audit`; zie [Wat er is
opgelost](#wat-er-is-opgelost-op-deze-branch) voor de gemaakte wijzigingen.

| # | Bevinding | WCAG | Niveau | Blokkeert AA | Status |
|---|---|---|---|---|---|
| **1** | **Vijf focusindicatoren onder de norm** | 2.4.7, 1.4.11 | A, AA | ja | opgelost (d, e in dit project; a, b, c als override op het thema) |
| **2** | Bollendiagram: acht normlinks zonder toegankelijke naam | 1.3.1, 2.4.4, 4.1.2 | A | ja | opgelost |
| **3** | Bollendiagram: vier onderwerpen bestaan alleen visueel | 1.1.1, 1.3.1, 1.4.1 | A | ja | opgelost |
| **4** | Inhoudsopgave-knop meldt permanent "ingeklapt" | 4.1.2 | A | ja | opgelost |
| **5** | Placeholderteksten als koppen en labels (7 normpagina's) | 2.4.6 | AA | ja | opgelost op `feat/herziening-over-index-procesplaat`, niet hier |
| **6** | PDF-export levert een ongetagde PDF | EN 301 549 §10 | — | ja (PDF) | **open — besluit van het team nodig** (documenttitel wel gezet, 10 augustus 2026) |
| **7** | Bron-tooltip: niet te sluiten én niet gekoppeld aan de term | 1.4.13, 1.3.1 | AA, A | ja | deels: koppeling opgelost, Escape open ([thema-issue #10](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/10)) |
| **8** | Toelichting, Referenties en Kern zijn geen koppen | 1.3.1 | A | ja | opgelost |
| **9** | Zoekterm-markering wordt niet aangekondigd | 1.3.1, 4.1.3 | A, AA | ja | deels: melding wordt aangekondigd, `<mark>` open ([thema-issue #11](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/11)) |
| **10** | Sneltoets `/` niet uit te zetten of te wijzigen | 2.1.4 | A | ja | opgelost (werkt nu alleen met focus op de zoekknop) |
| **11** | Verbindingslijnen in het diagram: 1,23:1 | 1.4.11 | AA | ja | opgelost |
| **12** | Sneltoetshint `/` in de balk: 2,98:1 | 1.4.3 | AA | ja | opgelost (hint verwijderd; de sneltoets werkt sinds bevinding 10 alleen met focus op de zoekknop) |
| **13** | Statusmelding tijdens PDF-generatie niet bepaalbaar | 4.1.3 | AA | ja | opgelost |
| **14** | `lang`-fout en lege taxonomiepagina's | 3.1.2, 2.4.6 | AA | ja | opgelost (taxonomieën uitgezet) |
| 15 | Ontbrekende `}` in `main.css` zet twee regels uit | — | — | nee | opgelost |
| 16 | Skip-link verplaatst de focus niet betrouwbaar | 2.4.1 | A | te bevestigen | opgelost (override op het thema) |
| 17 | Zwevende melding kan de focus afdekken | 2.4.11 | AA | te bevestigen | opgelost via `scroll-margin`; nog in browser te bevestigen |
| 18 | Hero-tekst kan bij 200% tekstvergroting afknippen | 1.4.4 | AA | te bevestigen | open — [thema-issue #12](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/12); browsertest staat nu in CI |
| 19 | PDF-downloadlink werkt niet zonder JavaScript | — | — | nee | opgelost |
| 20 | Hero-`alt` dupliceert de `h1` eronder | 1.1.1 | A | nee | opgelost |
| 21 | `aria-label="Zoeken"` dekt zichtbare tekst niet | 2.5.3 | A | ja | opgelost (override op het thema) |
| 22 | Backlinks in de bronnenlijst heten "↩︎" | 2.4.4 | A | nee | opgelost |
| 23 | Externe links openen nieuw venster zonder melding | 1.3.1 | A | nee | opgelost (override op het thema) |
| 24 | Genest navigatielandmark, geen Escape op mobiel menu | 1.3.1 | A | nee | opgelost (override op het thema) |
| 25 | `role="status"` op een statische banner | 4.1.2 | A | nee | opgelost |
| 26 | Niet-tekstcontrast van de knopranden in de balk | 1.4.11 | AA | nee (zie toelichting) | ongewijzigd — geen fail |
| 27 | Herhaalde linktekst "Bekijk bron" | 2.4.9 | AAA | nee | opgelost (10 augustus 2026) |
| 28 | Afkortingen Aw, Ab, Ar, DUTO, SIO nergens uitgeschreven | 3.1.4 | AAA | nee | opgelost (10 augustus 2026) |
| **29** | Inhoudsopgavelinks halen de doelgrootte niet | 2.5.8 | AA | ja | opgelost (10 augustus 2026) |
| **30** | Gesloten bron-tooltip veroorzaakt 175px horizontale overloop op 320px | 1.4.10 | AA | ja | opgelost voor ≤480px; positionering open tooltip = [thema-issue #10](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/10) |
| **31** | Zoektermmarkering in een link: contrast onder 4,5:1 | 1.4.3 | AA | ja | opgelost (10 augustus 2026) |

**Kern van het beeld:** het fundament is goed — semantiek, koppenhiërarchie,
tekstcontrast, `prefers-reduced-motion`, een echte `<dialog>` voor zoeken. Eén
systematisch probleem: focus is op vijf plekken niet of nauwelijks zichtbaar.
Alle vijf met een paar regels CSS op te lossen. De PDF-export is het enige punt
dat een keuze vraagt in plaats van een patch.

---

## Wat er is opgelost op deze branch

Alles wat met code op te lossen was. Wat overblijft:

* **6 (PDF ongetagd)** — keuze uit drie routes, zie
  [§6](#6-de-pdf-export-levert-een-ongetagde-pdf).
* **18 (hero bij 200% tekstvergroting)** — de vaste `height: 300px` met
  `overflow: hidden` zit in het thema. Herschrijven raakt de positionering op
  drie breekpunten; niet verantwoord zonder browser.
* **5** — opgelost op een andere branch.

### Wijzigingen in dit project

| Bestand | Bevinding |
|---|---|
| `assets/css/main.css` | 15 (ontbrekende `}`), 1d (focus-ring PDF-knop) |
| `assets/css/bollendiagram.css` | 11 (lijncontrast 3:1), 1e (focusring buiten de bol), 3 (styling normenlijst) |
| `layouts/shortcodes/bollendiagram.html` | 2 (`aria-label` per link, `role="group"`), 3 (onderwerpen bij naam + tekstuele normenlijst) |
| `layouts/normen/single.html` | 4 (`aria-expanded`), 7 (`aria-describedby`), 8 (`<h2>` in `<summary>` en op de kern), 19 (`<button>` i.p.v. `<a>`), 22 (`aria-label` op backlinks) |
| `layouts/shortcodes/pdf-kader.html` | 19 |
| `layouts/_partials/page-banner.html` | 25 (`role="region"` i.p.v. `role="status"`) |
| `assets/js/pdf-export.js` | 13 (live region), 19 (knoppen zichtbaar maken) |
| `hugo.yaml` | 14 (`disableKinds: taxonomy, term`) |
| `content/_index.md` | 20 (`image_alt: ""`) |
| `.github/workflows/test.yml` | `npm run test:a11y` toegevoegd aan CI |

### Tijdelijke overrides op het thema

Deze bevindingen zaten in `hugo-theme-rijksoverheid` v0.1.0. Ze zijn hier
gerepareerd zodat de site nu voldoet, maar horen upstream te worden opgelost.
Beide bestanden hebben een kop die dat expliciet vermeldt; ze verdwijnen zodra
het thema is bijgewerkt.

Op 12 augustus 2026 is dat voor de CSS-helft gebeurd: 1a, 1b, 1c, 12 en 17 zijn
opgelost in thema v0.2.0 en de overrides zijn hier weggehaald. De hint van
bevinding 12 blijft in dit project wél verborgen, omdat `toegankelijkheid.js`
de sitebrede `/`-sneltoets nog neutraliseert (bevinding 10); die binding zit nog
steeds in de theme-`search.js` en is daarmee de volgende upstream-kandidaat.

| Bestand | Bevinding |
|---|---|
| ~~`assets/css/toegankelijkheid.css`~~ | ~~1a, 1b, 1c (focusindicatoren), 12 (contrast sneltoetshint), 17 (`scroll-margin` onder de meldbalk)~~ — opgelost in thema v0.2.0 |
| `assets/css/toegankelijkheid.css` | Rest: de `<h2>`-in-`<summary>`-correctie (bevinding 8), de PDF-knop (bevinding 19) en het verbergen van de sneltoetshint zolang bevinding 10 lokaal wordt opgelost |
| `assets/js/toegankelijkheid.js` | 16 (skip-link), 21 (label in name), 24 (genest landmark + Escape), 10 (`/`-sneltoets), 23 (externe-linkmelding), 9 (aankondiging van de markering) |
| `layouts/_partials/scripts.html` | shadow van het thema, alleen om het script hierboven te laden |

Nog niet vanuit dit project op te lossen en dus een thema-issue: de
`<mark>`-helft van bevinding 9, de Escape-afhandeling van de tooltip
(bevinding 7) en bevinding 18. Die drie zijn op 10 augustus 2026 ingediend als
[#10](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/10),
[#11](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/11) en
[#12](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/12).

### Aanvulling 10 augustus 2026

**27 — bronlinks krijgen een eigen naam.** Elke "Bekijk bron"-link krijgt
`aria-label="Bekijk bron: <brontekst>"`, op de tooltip én in de referentielijst
(`layouts/normen/single.html`). Het label begint met de zichtbare tekst, zodat
2.5.3 Label in Name intact blijft. Op `/normen/01-beheer/`: 46 links, 46 labels,
allemaal verschillend.

**28 — afkortingen uitgeschreven.** `layouts/_partials/afkortingen.html` wrapt
Aw, Ab, Ar, DUTO en SIO in `<abbr title="…">`, lijst in `data/afkortingen.yaml`.
Template-side, want de afkortingen staan vooral in de bronteksten van de
voetnoten, en `unsafe: false` verbiedt inline HTML in de markdown. Twee
onderhoudsvallen:

* De lijst hoort in `data/` en niet in `params:`. Hugo lowercaset
  configuratiesleutels, waardoor `DUTO` als `duto` matchte — inclusief het pad
  `/archiveren/duto` in een bronlink.
* De abbr-pass loopt **vóór** het `aria-label` van bevinding 27. Omgekeerd komt
  er markup in een attribuutwaarde.

In de content zijn `AW`/`AB`/`AR` genormaliseerd naar `Aw`/`Ab`/`Ar` (de match is
hoofdlettergevoelig). `abbr[title]` krijgt een stippellijn in `main.css`; alleen
Chrome doet dat vanzelf.

**Browsertests toegevoegd.** `scripts/a11y-browser.mjs` (Playwright + Chromium)
dekt wat jsdom niet kan: axe mét contrast en doelgrootte, reflow op 320 px,
tekstvergroting tot 200%, tekstafstand (1.4.12) en een toetsenborddoorloop op
focusindicator en focus-niet-afgedekt, inclusief de variant `?q=…` (bevinding
17). Draait in CI naast de jsdom-scan (`npm run test:a11y:browser`). Bouwt apart
met `--baseURL /`, anders wijzen CSS en JS naar het productiedomein en meet je
een pagina zonder stylesheet.

**Drie nieuwe bevindingen uit de eerste browserrun (29, 30, 31).** Alle drie
AA-blokkerend, alle drie onvindbaar zonder layout-engine. Het handmatige
rekenwerk van 6 augustus miste ze: de doelgrootte van de inhoudsopgavelinks
stond hier zelfs als "voldoet".

* **29 — inhoudsopgavelinks halen de doelgrootte niet (2.5.8, AA).** Het thema
  zet `.toc ul ul li { margin-bottom: 0 }` (`layout.css:203-205`), waardoor de
  subniveaus tegen elkaar aan staan: de links zijn geen 24 px hoog en hebben ook
  geen 24 px onderlinge ruimte, dus beide routes van 2.5.8 falen. Opgelost met
  `display: block` plus `padding-block: 0.25rem` op `.toc nav a` in `main.css`.
* **30 — de gesloten bron-tooltip rekt de pagina op (1.4.10, AA).**
  `.ref-tooltip` is `position: absolute` met `min-inline-size: 14rem` en
  `inset-inline-start: 0`; `visibility: hidden` haalt hem niet uit de layout. Op
  320 px levert dat **175 px horizontale overloop**, dus een horizontale
  scrollbalk voor de hele pagina terwijl er niets breed te zien is. Hier
  opgelost door de gesloten tooltip op ≤480 px uit de layout te halen
  (`display: none`); dat raakt `aria-describedby` niet, want de naamberekening
  leest verborgen doelen wel. De positionering van de *open* tooltip op smalle
  schermen hoort bij de ongebruikte thema-hook `--ref-offset-x` en staat als
  aanvulling op [thema-issue
  #10](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/10).
* **31 — de zoektermmarkering in een link haalt het contrast niet (1.4.3, AA).**
  Het thema stylet alleen `#main-content mark[data-search-highlight]`
  (`search.css:215-218`), maar `highlightTextNodes` maakt een kale `<mark>`
  zonder dat attribuut. Zonder styling geldt de UA-default (geel) met de geërfde
  linkkleur erop. Hier opgelost met een eigen regel op `main mark` met hetzelfde
  tokenpaar (11,4:1); de selector/JS-mismatch staat als aanvulling op [thema-issue
  #11](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/11).

Bevinding 18 blijft staan en is nu ook gemeten: de hero knipt op 320 px al 8 px
weg bij normale tekstgrootte en 108 px bij 200%. Omdat de fix in het thema zit
(#12), staat die ene regel in de `KNOWN`-lijst van
`scripts/a11y-browser.mjs` en degradeert hij tot waarschuwing — anders houdt hij
elke PR rood en wordt de scan genegeerd in plaats van gelezen. Haal het item weg
zodra #12 rond is.

**Eindstand van de browserrun: 13 pagina's, 0 fouten, 3 waarschuwingen** — en die
drie zijn alle drie bevinding 18 (dezelfde `div.hero`, gezien door de
reflow-, tekstzoom- en tekstafstandsmeting).

Twee waarschuwingen bleken fout-positieven van de test zelf:

* **Focusindicator op 8 pagina's.** De check las alleen `outline` en
  `box-shadow` op het element zelf, maar `.card-grid.clickable` zet bewust
  `outline: none` en plaatst de ring als `box-shadow` op `::after`. De check
  leest nu ook `::before` en `::after`.
* **"Focus afgedekt" op elke bol van het bollendiagram.** De check meldde
  afdekking zodra één hoek van de bounding box werd geraakt; bij een ronde link
  liggen die hoeken buiten de bol. Voor SVG-links telt nu alleen het midden.

Vier van de zeven aanvankelijke meldingen waren meetfout of dubbeling. Een
geautomatiseerde uitspraak is pas een bevinding nadat je hem hebt nagetrokken.

**htmltest-configuratie.** `IgnoreAltEmpty: true` in `.htmltest.yml`. htmltest
zag de `alt=""` van de decoratieve hero (de fix van bevinding 20) als fout,
terwijl dat juist de correcte waarde is voor een decoratieve afbeelding.
Ontbrekende `alt`-attributen blijven wél een fout.

### Codereview-ronde 10 augustus 2026

Codereview over `main...chore/wcag-2.2-audit`: tien bevestigde defecten, vijf
daarvan in de fixes hierboven. Die waren geschreven maar deden niet wat ze
beloofden. Alle vijf hersteld:

* **Focusring bollendiagram (bevinding 1e).** `.bd-focus-ring` (specificiteit
  0,1,0) verloor van `.bd-bubble circle` en `.bd-main circle` (beide 0,1,1). De
  ring erfde daardoor de bol-fill — een opake schijf van r+4 óver de bol — en
  de `stroke-width: 3` kwam nooit aan: bij focus stond er een lijn van 1 à
  1,5 px, dunner dan de 4 px die hij verving. Alle regels die fill of stroke op
  een bol zetten sluiten de ring nu uit met `:not(.bd-focus-ring)`, ook in
  `forced-colors`, waar de ring bovendien `Highlight` krijgt in plaats van een
  auteurskleur die daar toch wordt genegeerd.
* **Melding "opent in een nieuw venster" (bevinding 23).** De lus sloeg elke
  link met een `aria-label` over. Sinds bevinding 27 heeft élke "Bekijk
  bron"-link zo'n label: op `/normen/01-beheer/` 53 van de 61 externe links.
  De melding ontbrak dus juist waar hij het meest nodig was. Een `<span>`
  toevoegen helpt daar niet — een `aria-label` overschrijft onderliggende
  tekst — dus wordt de melding nu achter het label zelf gezet. Achteraan, zodat
  de zichtbare tekst het label blijft beginnen (WCAG 2.5.3 Label in Name).
* **Sneltoetshint (bevindingen 10 en 12).** Bevinding 10 is opgelost met de
  derde optie van WCAG 2.1.4: de `/` werkt alleen nog met focus op de zoekknop.
  In precies die toestand opent Enter het venster ook, dus de hint `<kbd>/</kbd>`
  beloofde een toets die nergens iets doet — en bevinding 12 maakte die belofte
  juist beter leesbaar. De hint is daarom weg in plaats van contrastrijker. Wil
  het team de sitebrede `/` terug, dan vraagt 2.1.4 een manier om hem uit te
  zetten of te wijzigen; dat is een keuze, geen patch.
* **Zoektermmarkering in een link (bevinding 31).** De oude regel
  `#main-content a mark { color: inherit }` is terecht verwijderd, maar de regel
  die ervoor in de plaats kwam was woordelijk gelijk aan `mark` in `base.css` van
  het thema en veranderde dus niets. Het thema dekt dit geval al; er staat nu
  alleen nog een toelichting waarom hier géén projectregel hoort.
* **Lege `alt` (bevinding 20).** `IgnoreAltEmpty: true` in `.htmltest.yml` is
  nodig voor de decoratieve hero, maar zette de enige geautomatiseerde controle
  op lege alt-teksten sitebreed uit — axe leest `alt=""` als "bewust
  decoratief". `scripts/a11y-scan.mjs` heeft nu een expliciete lijst
  `DECORATIEF`; elke andere afbeelding met een lege alt is een fout. Negatief
  getest met een ingevoegde `<img alt="">`: de scan meldt hem en geeft exit 1.

Daarnaast buiten het toegankelijkheidsdomein: de statische assets kregen in
`container/nginx.conf` geen CSP en HSTS mee (een `add_header` op
location-niveau laat de headers van serverniveau vervallen), het
draft-voorbehoud stond na het verdwijnen van de beta-banner alleen nog op de
homepage in plaats van op elke normpagina, de afkortingen-pass kon een
afkorting binnen een attribuutwaarde wrappen, en de voetnootvalidatie liet
markeringen achter inline-markup (`**vet**[^x]`) door terwijl geen van de twee
patronen in `normen/single.html` die kan matchen.

### Tweede reviewronde 10 augustus 2026

Tweede ronde, opnieuw tien defecten, de helft in de fixes van de eerste ronde.
Toegankelijkheidsfixes die niet worden nagemeten doen vaak net niet wat ze
beloven.

* **Referenties was landmark noch kop (bevinding 8).** De `<h2>` in de
  `<summary>` bleek niet te werken: HTML-AAM geeft `<summary>` de rol `button`,
  en de kinderen van een knop zijn presentational. De `<section>` had bovendien
  zijn `aria-label` verloren, en een section zonder naam is geen landmark. Wie
  op koppen of landmarks navigeerde, had dus géén sprong naar de bronnenlijst —
  precies het gat dat bevinding 8 dichtte. De `aria-label` staat er weer bij.
* **Elke bron werd twee keer voorgelezen (bevindingen 7 en 27).**
  `aria-describedby` wees naar de hele tooltip. Daar zit sinds bevinding 27 ook
  de "Bekijk bron"-link in, met een `aria-label` dat de brontekst woordelijk
  herhaalt — en sinds de nieuw-venster-melding kwam daar een derde zinsdeel bij.
  Het doel is nu alleen de brontekst.
* **Besloten links misten de nieuw-venster-melding (bevinding 23).** De guard
  sloeg elke link met een `.visually-hidden`-span over. Het thema zet die class
  op " (besloten omgeving)" bij private links, en die openen óók in een nieuw
  venster. De guard kijkt nu naar een eigen markerclass.
* **De focusring was dunner dan bedoeld (bevinding 1e).** `stroke-width: 3` is
  in SVG-gebruikerseenheden. Met een viewBox van 480 op maximaal 600px
  gerenderd is dat 3,75px op een breed scherm en circa 2px op 320px. Nu 3px
  overal, met `vector-effect: non-scaling-stroke`.
* **Het draft-voorbehoud hing aan `show_lastmod`.** Een nieuwe pagina zonder
  dat veld verliest het voorbehoud zonder dat iets dat opmerkt.
  `scripts/a11y-scan.mjs` controleert het nu per pagina.
  *Vervallen op 26 augustus 2026:* het voorbehoud zelf is op verzoek van de
  opdrachtgever weggehaald (`versie-zin.html`, #80); de controle die de zin
  op elke pagina eiste is daarmee verwijderd.

**De voetnootcontrole is verhuisd.** De controle die in de eerste ronde in
`scripts/validate-norms.py` werd geschreven, probeerde te voorspellen wat
Goldmark en `normen/single.html` van een markering zouden maken. Dat werkte
twee kanten op verkeerd: het weigerde geldige tekst (`veld_[^x]` is een liggend
streepje, geen cursief) en liet stukke tekst door (`~~doorhaling~~[^x]`, een
link met opgemaakte linktekst, een markering aan het begin van een regel). Die
controle is vervangen door een controle op de gerenderde HTML: elke
`a.footnote-ref` die na de transformatie nog in de pagina staat, is een
markering zonder ref-term en zonder tooltip. Dat is geen voorspelling maar een
waarneming, dekt ook de oorzaken die niemand heeft bedacht, en kan per definitie
geen geldige content weigeren.

### Verificatie

`hugo && npm run test:a11y` → **12 pagina's, 0 overtredingen** (was: 9
overtredingen op de homepage). `npm run test:a11y:browser` → **13 pagina's,
0 fouten, 3 waarschuwingen**, alle drie bevinding 18. Beide scans draaien in CI.
Wat ook de browser niet dekt — schermlezergedrag, hoogcontrastmodus,
begrijpelijkheid — is met de hand nagerekend
zoals in [Methode](#methode) beschreven, en blijft de
[beperking](#beperkingen-van-dit-onderzoek) die hij was: dit vervangt geen
handmatige doorloop en geen gebruikerstest.

---

## Methode

**Geautomatiseerd** — axe-core over alle 14 pagina's, regelsets `wcag2a`,
`wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` (`scripts/a11y-scan.mjs`, exit 1 bij
een overtreding). Resultaat bij de eerste run: 9 overtredingen, alle op de
homepage — 8× `link-name`, 1× `nested-interactive`, beide in het bollendiagram.

Die scan draait op jsdom, want er was geen Chromium voor arm64. Structuur-, naam-
en ARIA-regels draaien volwaardig; `color-contrast` staat uit, die vraagt een
layout-engine. Sinds 10 augustus dekt `a11y-browser.mjs` dat gat.

**Handmatig** — review van de gegenereerde HTML, de gebundelde CSS en JS (thema
én project) op semantiek, focusbeheer, toetsenbord, ARIA en de WCAG
2.2-criteria. Contrastverhoudingen berekend met de WCAG-formule voor relatieve
luminantie, uit de kleurwaarden in de gebundelde CSS, inclusief alfa-compositie.

**PDF** — export uit de smoke-test, bytes gecontroleerd op `/StructTreeRoot`,
`/MarkInfo`, `/Marked` en `/Lang`, streams gedecomprimeerd.

Geautomatiseerde tests dekken 20–30% van de succescriteria en vinden ongeveer de
helft van de echte problemen. Van de bevindingen hieronder komen er 2 uit de
scan.

---

## 1. Vijf focusindicatoren onder de norm

**WCAG 2.4.7 Focus Visible (A) en 1.4.11 Non-text Contrast (AA)**

Dit is de rode draad van het onderzoek. In de gebundelde CSS staan vijf
`outline: none`-declaraties; één daarvan is netjes vervangen, vier niet. Samen
met de footer levert dat vijf plekken op waar een toetsenbordgebruiker niet kan
zien waar de focus staat.

| Plek | Focusindicator | Contrast |
|---|---|---|
| a. Zoekresultaten | alleen achtergrondwissel `#ffffff` → `#d9ebf7` | **1,22:1** (donker 1,55:1) |
| b. Zoekinvoerveld | geen enkele | — |
| c. Footerlinks | ring `#01689b` op banner `#007bc7` | **1,35:1** (donker 2,98:1) |
| d. Knop "Download als PDF" | `filter: brightness(0.9)` | **1,19:1** |
| e. Centrale bol in het diagram | ring `#01689b` op bol `#007bc7` | **1,35:1** |

Vereist is 3:1 tegen de aangrenzende kleuren.

**a. Zoekresultaten** — `assets/css/components/search.css:181-186` (thema).
De resultatenlijst is juist het component met pijltjestoetsnavigatie
(`search.js:343-363`): wie met de pijltjes langs tien resultaten loopt, ziet het
verschil tussen de gefocuste en de overige rijen nauwelijks. `outline: none`
staat er expliciet.

**b. Zoekinvoerveld** — `search.css:123-132` (thema): `border: none; outline:
none`, en er is nergens een vervangende `:focus`-stijl. Bij openen valt dit weg
door `autofocus`, maar zodra de gebruiker met ArrowUp terugkeert uit de
resultatenlijst (`search.js:360`) is er geen enkele indicatie meer.

**c. Footerlinks** — de basisregel `a:focus-visible { outline: 2px solid
var(--color-link) }` (`base.css`) geldt ook in de footer. De navbar heeft
daarvoor een eigen override met een witte ring (4,51:1); de footer niet. Omdat
`--color-banner` in dit project op `#007bc7` staat (`assets/css/main.css:3`),
komt een donkerblauwe ring op een blauwe balk terecht. Zes links op elke pagina.

**d. Knop "Download als PDF"** — `assets/css/main.css:102-107` (project). Focus
en hover zijn identiek gestyled, en de geërfde thema-knopstijl zet
`outline: none`. Het verschil tussen `#007bc7` en `#006fb3` is 1,19:1. Dit is de
primaire actie op elke normpagina.

**e. Centrale bol in het diagram** — `assets/css/bollendiagram.css:100-103`.
Subtieler dan de rest, en anders dan het op het eerste gezicht lijkt: de
rustkleur van `.bd-main circle` is in lichte modus **al** `#01689b`
(`bollendiagram.css:40`), dus bij focus verandert alleen de dikte (1,5 → 4) en
niet de kleur. In donkere modus is het omgekeerd en erger: de rustkleur
`#4ba3d8` haalt 6,40:1 tegen de pagina, en focussen *verlaagt* dat naar 2,94:1 —
**de focusindicator maakt de bol minder zichtbaar dan hij in rust was.** Omdat
een SVG-stroke gecentreerd op het pad ligt, contrasteert de buitenste helft van
de ring in lichte modus wel goed (6,08:1 op wit); het probleem zit aan de
binnenkant en in donkere modus.

**Oplossing** — geef elk van de vijf een indicator die 3:1 haalt tegen álle
aangrenzende kleuren: een outline met `outline-offset` (a, b, d), een witte of
tweekleurige ring in de footer (c), en voor het diagram een ring die van de
rustkleur verschilt en in beide modi contrasteert (e). Punten a, b en c horen in
het thema; d en e in dit project.

**Over de criteria:** 2.4.7 (A) eist een zichtbare focusindicator en is hier het
primaire criterium. 1.4.11 (AA) wordt in de auditpraktijk gebruikt voor de
3:1-eis op focusindicatoren; dat is een gangbare interpretatie, geen letterlijke
tekst van het criterium. Het criterium dat expliciet 3:1 tussen gefocuste en
niet-gefocuste toestand voorschrijft, 2.4.13 Focus Appearance, is **AAA** en dus
niet in scope.

---

## 2. Bollendiagram: de acht normlinks hebben geen toegankelijke naam

**WCAG 1.3.1 (A), 2.4.4 (A), 4.1.2 (A)** — `layouts/shortcodes/bollendiagram.html:17-21`

De SVG bevat acht `<a>`-elementen naar de normpagina's, elk met een
SVG-`<title>` als enige naam, binnen een `<svg role="img" aria-labelledby=…>`.
Dat levert twee losse problemen op, die vaak door elkaar worden gehaald:

**Geen toegankelijke naam.** axe meldt 8× `link-name`. Een A/B-test op de
gebouwde homepage laat zien dat dit **niet** aan het `role`-attribuut ligt:

| Variant | axe-overtredingen |
|---|---|
| origineel (`role="img"`) | `link-name` 8, `nested-interactive` 1 |
| `role="group"` | `link-name` 8 |
| role weggelaten | `link-name` 8 |
| `role="group"` + `aria-label` per `<a>` | **geen** |

Een SVG-`<title>` als kind van een SVG-`<a>` wordt niet betrouwbaar als naam
gebruikt. **De dragende maatregel is dus een `aria-label` op elke `<a>`**, niet
het aanpassen van de role.

**Focusbare elementen binnen `role="img"`.** Dat is de tweede helft
(`nested-interactive`). `role="img"` markeert de inhoud als presentatie, terwijl
er acht focusbare links in staan. ARIA schrijft voor dat een presentational role
op focusbare elementen genegeerd moet worden, dus de uitkomst verschilt per
browser-engine — maar de constructie is hoe dan ook fout en moet weg.

**Oplossing** — `aria-label` op elke `<a>` (dezelfde tekst als de `<title>`),
`role="img"` vervangen door `role="group"` of weglaten, en onder het diagram een
gewone lijst met dezelfde acht links opnemen zodat het diagram niet de enige
route is. De `<figcaption>` bevat nu één link (naar norm 1) en de hoofdnavigatie
heeft een "Normen"-ingang; dat is te mager als alternatief voor acht normen.

**Terzijde:** het lokale werkbestand `CLAUDE.md` beschreef al dat de SVG
`role="group"` heeft "en **niet** `role="img"`, want dat verbergt de acht
normlinks voor hulpsoftware". De code deed het omgekeerde, op `main` én op de
branch `feat/herziening-over-index-procesplaat`: de documentatie beschreef een
gewenste situatie die nooit was geïmplementeerd — en herhaalde daarbij dezelfde
ongetoetste aanname, want de role was niet de oorzaak van de ontbrekende namen.
Op deze branch doet de code nu wat er staat. (`CLAUDE.md` staat in `.gitignore`
en is dus geen repo-artefact.)

---

## 3. Bollendiagram: vier onderwerpen bestaan alleen visueel

**WCAG 1.1.1 (A), 1.3.1 (A), 1.4.1 (A)** — `layouts/shortcodes/bollendiagram.html:76-103`

Onder de scheidingslijn staan vier vervaagde bollen met de onderwerpen die later
aan het toetsingskader worden toegevoegd: *leesbaar*, *migreren*, *converteren*,
*beschikbaar*. Zowel de bollen (`<g class="bd-future" aria-hidden="true">`) als
de labellaag (`<g class="bd-labels" aria-hidden="true">`) zijn volledig voor
hulpsoftware verborgen.

De woorden "migreren" en "converteren" komen in geen enkele contentpagina voor.
Voor een schermlezergebruiker bestaan deze vier onderwerpen dus niet, terwijl ze
inhoudelijk iets zeggen over de reikwijdte van het toetsingskader.

Bovendien identificeren de teksten die ernaar verwijzen ze **uitsluitend op hun
visuele verschijning**: de `<figcaption>` spreekt van "de vier vervaagde
onderwerpen onderaan" en `content/over.md:48` van "de vier wit gearceerde
onderwerpen". Dat is 1.4.1 (betekenis alleen via presentatie). De verwijzing op
`/over/` is bovendien voor iedereen betekenisloos, want op die pagina staat
helemaal geen diagram.

**Oplossing** — noem de vier onderwerpen in de lopende tekst, en haal de
`aria-hidden` van de labellaag af of geef het diagram een tekstueel alternatief
dat ze opsomt.

---

## 4. De inhoudsopgave-knop meldt permanent "ingeklapt"

**WCAG 4.1.2 (A), raakt 1.3.1 (A) en 3.2.4 (AA)** — `layouts/normen/single.html:87` en `:117`

Op de acht normpagina's start de "Op deze pagina"-aside met de class `is-open`
en is dus zichtbaar, terwijl de bijbehorende knop `aria-expanded="false"` heeft
en het verborgen label "Inhoudsopgave tonen" draagt. De thema-JS opent de aside
alleen als `localStorage` dat zegt en corrigeert de attributen niet.

Gevolg: de eerste klik ziet de aside als open, sluit hem, en zet `aria-expanded`
opnieuw op `false` — **de knop bereikt de state `true` nooit**. Een
schermlezergebruiker krijgt altijd het omgekeerde van de werkelijkheid te horen.
Op `/over/`, waar het thema-template rendert, klopt het gedrag wél: dezelfde knop
doet dus iets anders per paginatype.

**Oplossing** — laat `aria-expanded` en het label de begintoestand volgen: als de
aside met `is-open` rendert, hoort er `aria-expanded="true"` en "Inhoudsopgave
verbergen" bij.

---

## 5. Placeholderteksten als koppen en labels

**WCAG 2.4.6 Headings and Labels (AA)** — `content/normen/02` t/m `08`

Zeven van de acht normpagina's bevatten letterlijk `[PLACEHOLDER: vul thema in]`
als `<h3>` en `[PLACEHOLDER: vul voorschrift in]` als tekst — vier tot vijf
voorkomens per pagina. Die tekst lekt door naar de inhoudsopgave, naar
`<meta name="description">`, naar de Open Graph-kaarten en naar de zoekindex.
Wie op koppen navigeert, krijgt zeven identieke betekenisloze koppen.

**Status: al opgelost op de openstaande branch.** Commit `24f52e3` op
`feat/herziening-over-index-procesplaat` vult de normen 2 tot en met 8 met de
teksten uit de normbladen. Dit punt vervalt zodra die branch is gemerged; het
staat hier omdat het op `main` — de gepubliceerde toestand — nog aanwezig is.

---

## 6. De PDF-export levert een ongetagde PDF

**EN 301 549 §10 (niet-webdocumenten)** — `assets/js/pdf-export.js`

Gecontroleerd op de daadwerkelijke bytes van beide PDF's (norm 138 kB, kader
227 kB), inclusief het decomprimeren van alle streams:

| Marker | Betekenis | Aanwezig |
|---|---|---|
| `/StructTreeRoot` | tagstructuur (koppen, lijsten, alinea's) | nee |
| `/MarkInfo`, `/Marked` | document is getagd | nee |
| `/Lang` | taal van het document | nee |
| `/Title` (Info-dictionary) | documenttitel | ja |

Zonder tags leest een schermlezer de PDF als één lap tekst: geen koppen om op te
navigeren, geen lijststructuur bij criteria en indicatoren, geen gedefinieerde
logische leesvolgorde, en geen taalinstelling — waardoor Nederlandse tekst met
een Engelse stem kan worden voorgelezen.

**Waarom dit lastig is** — pdfMake 0.2.18 kent geen tagged-PDF-ondersteuning; het
is geen instelling die aan kan. Dit is geen bugfix maar een keuze uit drie routes:

1. **HTML is de toegankelijke vorm, de PDF is expliciet een bijlage.** Toegestaan
   zolang alle informatie in toegankelijke vorm beschikbaar is, en te vermelden
   in de toegankelijkheidsverklaring. Kleinste inspanning, blijft een afwijking
   om te verantwoorden.
2. **Serverside genereren met een engine die PDF/UA ondersteunt** (WeasyPrint,
   Prince) vanuit dezelfde HTML. Levert wél tags, koppen en taal. Grootste
   inspanning: de PDF wordt een build- of runtimestap in plaats van client-side,
   wat ook de CSP-vriendelijke opzet raakt.
3. **NLDoc** of een vergelijkbare overheidsstandaard, als die aansluit bij de
   publicatieketen van de Inspectie.

Deze keuze hoort bij het team en de opdrachtgever, niet bij de techniek.

**Wat in de tussentijd wél is gezet (10 augustus 2026).** pdfMake kent twee
document-opties die hier los van de routekeuze staan:

* `displayTitle: true` — zet `ViewerPreferences /DisplayDocTitle true`, zodat de
  viewer de documenttitel uit de Info-dictionary toont in plaats van de
  bestandsnaam. Dat is de PDF-tegenhanger van een paginatitel en een eis in
  PDF/UA. Gemeten op de gerenderde bytes: `/DisplayDocTitle` afwezig vóór,
  aanwezig ná (147 888 → 147 985 bytes). Vastgelegd in `tests/js/pdf-doc.test.mjs`.
* `tagged: true` — **bewust niet gezet.** Die vlag schrijft alleen
  `/MarkInfo <</Marked true>>`; pdfMake bouwt geen `/StructTreeRoot`. Een
  document als getagd markeren zonder structuurboom is een onwaarheid tegen
  hulpsoftware en maakt de situatie slechter dan een eerlijk ongetagde PDF.

Dit verandert niets aan de bevinding zelf: er is nog steeds geen tagstructuur en
geen `/Lang` — pdfMake 0.2.18 heeft daar geen optie voor (`language:` in de
bundel zijn cmap-subtabellen van de fonts, geen document-optie). De routekeuze
blijft open.

---

## 7. Bron-tooltip: niet te sluiten én niet gekoppeld aan de term

**WCAG 1.4.13 (AA) en 1.3.1 / 4.1.2 (A)**

Bronverwijzingen op de normpagina's zijn woorden met een stippellijn; bij hover
of focus verschijnt een tooltip met de brontekst. Twee gebreken:

**Niet dismissible (1.4.13).** Van de drie eisen zijn er twee gehaald —
*hoverable* (er is een `::before`-brug, de muis kan de tooltip in) en *persistent*
(hij blijft zolang hover of focus binnen de wrapper valt). *Dismissible* niet: er
is geen Escape-afhandeling. De enige Escape-handler in de thema-JS is die voor de
zoekterm-markering. Omdat de tooltip absoluut gepositioneerd óver de lopende
tekst valt, geldt de uitzondering van 1.4.13 ("does not obscure or replace other
content") hier niet — bij 200–400% zoom dekt hij een aanzienlijk deel van het
scherm af.

**Niet programmatisch gekoppeld (1.3.1 / 4.1.2).** Er is geen `aria-describedby`
van de term naar de tooltip, en omdat de tooltip `visibility: hidden` is, staat
hij niet in de toegankelijkheidsboom. Een schermlezergebruiker die op de term
landt, hoort alleen de linktekst en krijgt de brontekst nooit te horen — ook niet
wanneer hij visueel zichtbaar is.

**Mitigatie die wél werkt:** de `.ref-term` is zelf een `<a href="#fn:N">` naar de
voetnoot, en dezelfde brontekst staat in de referentie-accordeon onderaan. Er is
dus een echte toetsenbordroute naar de inhoud. Daarom blokkeren deze punten de
inhoud niet — maar conformiteit wel.

**Eigenaarschap:** de CSS is van het thema
(`assets/css/components/references.css`), maar de **markup komt uit dit project**:
`layouts/normen/single.html:49` en `:52` genereren `.ref-wrapper`/`.ref-tooltip`
rondom de Goldmark-voetnoten. De thema-partial `reftext.html` wordt niet gebruikt.
`aria-describedby` is dus een projectfix; de Escape-afhandeling hoort in het thema
en staat sinds 10 augustus 2026 als
[thema-issue #10](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/10).

---

## 8. Toelichting, Referenties en Kern zijn geen koppen

**WCAG 1.3.1 (A)** — `layouts/normen/single.html:62`, `:75`, `:96-97`

Drie secties op elke normpagina zien eruit als een `h2` maar zijn het niet:

* **Toelichting** — de `<h2>` wordt door het template vervangen door
  `<details><summary>`.
* **Referenties** — eveneens een `<summary>`.
* **Kern van de norm** — een `<span class="title">` in een `<blockquote>`.

Ze zijn visueel niet van een `h2` te onderscheiden (`font-size: 1.75rem;
font-weight: 700`, identiek aan de thema-`h2`), maar ontbreken in de
kopstructuur. Wie op koppen navigeert — een van de meest gebruikte
schermlezerfuncties — springt de toelichting en de bronnen volledig over,
terwijl de inhoudsopgave ze wel als gelijkwaardige secties presenteert.

**Oplossing** — zet een `<h2>` ín de `<summary>` (dat is toegestaan en gangbaar),
en maak van "Kern van de norm" een echte kop.

---

## 9. De zoekterm-markering wordt niet aangekondigd

**WCAG 1.3.1 (A) en 4.1.3 Status Messages (AA)** — thema `search.js:436-455` en `search.html:34-36`

Wie via een zoekresultaat op een pagina komt (`?q=…`), krijgt de zoekterm
gemarkeerd met `<mark>` en onderaan een melding "Zoekterm … is gemarkeerd. Klik
hier om de markering te verwijderen." Twee problemen:

* `<mark>` heeft in Chrome en Safari geen exposed rol en er is geen
  begeleidende verborgen tekst. De markering is dus **puur visueel** — betekenis
  die alleen via presentatie wordt overgebracht.
* De melding is een live region (`aria-live="polite"`) die bij paginalading
  `hidden` is (`display: none`) en daarna zichtbaar wordt gemaakt. Schermlezers
  kondigen wijzigingen in een live region die op dat moment niet gerenderd was
  doorgaans niet aan.

Netto hoort een schermlezergebruiker niet dat er iets gemarkeerd is, en ook niet
dat Escape de markering weghaalt.

De `<mark>`-helft is vanuit een consumer niet betrouwbaar te repareren — de
elementen worden door de thema-JS aangemaakt — en staat sinds 10 augustus 2026 als
[thema-issue #11](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/11).

---

## 10. De sneltoets `/` is niet uit te zetten

**WCAG 2.1.4 Character Key Shortcuts (A)** — thema `search.js:315-325`

Eén enkel teken opent sitebreed het zoekvenster. De uitzondering voor
invoervelden voorkomt het ergste, maar 2.1.4 vraagt één van drie dingen: de
sneltoets uit kunnen zetten, hem kunnen wijzigen, óf hem alleen actief laten zijn
wanneer de focus op het bijbehorende component staat. Geen van die drie is er.
Dit raakt vooral gebruikers van spraakinvoer: een uitgesproken woord kan als losse
toetsaanslag binnenkomen.

**Oplossing** — de sneltoets alleen laten werken wanneer de focus op de zoekknop
staat, of een modifier gebruiken (Ctrl+K is bovendien een bekend patroon).
Thema-wijziging.

---

## 11. Verbindingslijnen en scheidingslijn in het diagram: 1,23:1

**WCAG 1.4.11 (AA)** — `assets/css/bollendiagram.css:17-28` en `:47-52`

De spokes en de scheidingslijn gebruiken `--color-border` (`#e2e8f0`): **1,23:1**
op wit, 1,72:1 in donkere modus. De stippelrand van de toekomst-bollen (`#9ec9e8`)
haalt 1,75:1.

Die lijnen dragen de betekenis van het diagram — "deze zeven normen hangen aan
'informatie in beheer'" en "onder de lijn staat wat later komt". Het zijn dus
grafische objecten die nodig zijn om de inhoud te begrijpen, en die vragen 3:1.
Voor een slechtziende gebruiker valt de hub-and-spoke-structuur weg en blijven er
losse bollen over.

---

## 12. De sneltoetshint in de balk: 2,98:1

**WCAG 1.4.3 (AA)** — thema `search.css:18-27`

De `<kbd>/</kbd>` in de zoekknop is witte tekst op 70% dekking over de blauwe
balk: **2,98:1** bij 12 px, waar 4,5:1 vereist is. Dit is een combinatie met
`opacity`, en valt daarmee buiten de tokencontrole die verder wél overal AA haalt.

---

## 13. De statusmelding tijdens PDF-generatie is niet bepaalbaar

**WCAG 4.1.3 Status Messages (AA)** — `assets/js/pdf-export.js:186-196`

Tijdens het genereren wisselt het label van de knop naar "PDF wordt gemaakt…" en
wordt `aria-busy="true"` gezet. Er is geen `role="status"` of live region, en
`aria-busy` op een `<a>` wordt door de meeste schermlezers genegeerd. Het
genereren duurt meerdere seconden; in die tijd krijgt een AT-gebruiker geen enkele
terugkoppeling.

---

## 14. `lang`-fout en lege taxonomiepagina's

**WCAG 3.1.2 Language of Parts (AA), 2.4.6 (AA)** — `public/tags/`, `public/categories/`

Hugo genereert twee taxonomiepagina's die verder niets bevatten dan een `h1`:
"Tags" en "Categories". "Categories" is Engels binnen `<html lang="nl">` zonder
`lang="en"`, en beide koppen zijn niet beschrijvend. De pagina's staan wel in
`sitemap.xml` en zijn bereikbaar.

**Oplossing** — de taxonomieën uitzetten in `hugo.yaml` (het toetsingskader
gebruikt geen tags of categorieën) of ze vertalen en vullen.

---

## Overige bevindingen

### 15. Ontbrekende `}` in `assets/css/main.css`

Op `main` telt `assets/css/main.css` 18 openende en 17 sluitende accolades: na
`filter: brightness(0.9);` (regel 107) ontbreekt de sluitaccolade. Door
CSS-nesting worden de twee volgende regels daardoor kindselectoren van
`.pdf-download.button:hover/:focus-visible` en matchen ze nooit:

* `.norm a.ref-term[href^="/"] { color: var(--color-primary) }` — bedoeld om een
  bronterm die tegelijk een navigatielink is blauw te maken. Nu zijn navigerende
  en niet-navigerende termen visueel identiek.
* `.norm .references > details > summary { color: var(--color-text) }` —
  "Toelichting" en "Referenties" staan daardoor in de merkkleur.

**Status: al opgelost op de openstaande branch** (commit `baf7e81`, "sluit het
hover-blok van de PDF-downloadknop af"). Op de branch is de balans 18/18.

### 16. De skip-link verplaatst de focus niet betrouwbaar

**WCAG 2.4.1 (A)** — thema `layouts/baseof.html:8` en `:10`. De skip-link wijst
naar `<main id="main-content">` zonder `tabindex="-1"`. De scrollpositie springt,
maar de focus (en daarmee de leespositie van een schermlezer) niet in alle
browsers. Dit is gevestigde praktijkkennis (WebAIM, GOV.UK), in dit onderzoek niet
zelf getest. `tabindex="-1"` op `<main>` lost het op. Thema-wijziging.

### 17. De zwevende melding kan de focus afdekken

**WCAG 2.4.11 Focus Not Obscured (AA)** — thema `search.html:34`, `toast.css:2-6`.
De meldbalk verschijnt bij aankomst met een `?q=`-parameter en staat
`position: fixed` onderin (`z-index: 100`). Elementen die onderaan de pagina de
focus krijgen, kunnen daarachter verdwijnen. Of dat gebeurt hangt af van hoogte en
scrollpositie en is zonder browser niet vast te stellen — daarom "te bevestigen".
De balk is overigens zelf wél te sluiten, met klik én Escape.

### 18. Hero-tekst kan bij 200% tekstvergroting afknippen

**WCAG 1.4.4 (AA), raakt 1.4.10** — thema `hero.css:2-5` en `:22-40`. Een vaste
`height: 300px` met `overflow: hidden` en een absoluut gepositioneerd tekstblok.
Statisch gerekend past de tekst op 320 px breed nog net (~245 px); bij 200%
tekstgrootte verdubbelt dat naar circa 490 px en wordt de kop plus de paragraaf
weggeknipt, zonder scrollmogelijkheid. Sinds 10 augustus 2026 meet
`scripts/a11y-browser.mjs` dit in Chromium (categorie `tekstzoom-200`) en staat de
thema-fix als
[thema-issue #12](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/12).

### 19. De PDF-downloadlink werkt niet zonder JavaScript

De knop is een `<a href="…/index.pdf.json" download>` waarvan JavaScript het
klikgedrag overneemt. Zonder JavaScript downloadt de gebruiker een JSON-bestand
onder de naam "Download als PDF". Geen WCAG-fout — de link heeft naam en rol —
maar wel een gebroken belofte. Speelt op twee plekken:
`layouts/normen/single.html:119` én `layouts/shortcodes/pdf-kader.html:4`.
Oplossing: een `<button>` die alleen verschijnt wanneer JavaScript beschikbaar is.

### 20. De hero-`alt` dupliceert de `h1` eronder

**WCAG 1.1.1 (A)** — `public/index.html`: `alt="Toetsingskader Archiefwet"` direct
gevolgd door `<h1>Toetsingskader Archiefwet</h1>`. De hero is decoratief; `alt=""`
hoort hier. Nu hoort een schermlezergebruiker de titel twee keer. axe keurt dit
goed omdat er *een* alt is.

### 21. `aria-label="Zoeken"` dekt de zichtbare tekst niet

**WCAG 2.5.3 Label in Name (A)** — thema `header.html:55` en `:69`. De zichtbare
tekst is "Zoeken..." plus "/", de toegankelijke naam alleen "Zoeken". 2.5.3 eist
dat de zichtbare tekst ín de naam zit. Het `aria-label` is bovendien overbodig:
zonder dat attribuut zou de naam vanzelf kloppen.

### 22. Backlinks in de bronnenlijst heten "↩︎"

**WCAG 2.4.4 (A)** — door Goldmark gegenereerd. In een linkoverzicht verschijnen
deze als "↩", zonder enig woord. Een `aria-label` ("Terug naar de tekst") lost het
op; dat vraagt een Goldmark-render-hook of een aanpassing in
`layouts/normen/single.html`.

### 23. Externe links openen een nieuw venster zonder melding

**WCAG 1.3.1 (A)** — thema `render-link.html:22` en `base.css:122-133`. Alle
footerlinks en diverse contentlinks krijgen `target="_blank"`; de enige aanduiding
is een CSS-icoon zonder tekstalternatief. Het thema kent het patroon wél — bij
besloten links voegt het `<span class="visually-hidden"> (besloten omgeving)</span>`
toe — maar past het hier niet toe.

### 24. Genest navigatielandmark, geen Escape op het mobiele menu

**WCAG 1.3.1 (A)** — thema `header.html:87` plaatst `<div role="navigation">`
binnen `<nav id="main-nav">`. Verder wisselt de handler het `aria-label` van de
knop tussen "Menu openen"/"Menu sluiten" terwijl `aria-expanded` de state al
draagt, en er is geen Escape-afhandeling of focusbeheer bij openen en sluiten.

### 25. `role="status"` op een statische banner

**WCAG 4.1.2 (A)** — `layouts/_partials/page-banner.html:15` (project-shadow) en de
thema-versie. Een live region met inhoud die nooit verandert; sommige
schermlezers kondigen die bij elke paginalading aan. `role="region"` met een label,
of helemaal geen rol, is correcter.

### 26. Niet-tekstcontrast van de knopranden in de balk

**WCAG 1.4.11 (AA)** — thema `header.css:194` en `:220`. De rand van de zoek- en
themaknop is `rgba(255,255,255,0.3)` op `#007bc7`: **1,61:1** (hover 1,89:1).
Formeel is dit geen fail: 1.4.11 gaat over visuele informatie die nodig is om het
component te *herkennen*, en beide knoppen dragen een wit icoon van 4,51:1 dat die
rol vervult. De rand is decoratief. Het staat hier omdat de rand wél als
begrenzing oogt en bij een volgende huisstijlwijziging makkelijk de enige
begrenzing wordt.

### 27. Herhaalde linktekst "Bekijk bron"

**2.4.4 (A) voldoet; 2.4.9 (AAA) niet.** 46 keer op `/normen/01-beheer/`, 142 keer
site-breed — en elke bron staat twee keer in de DOM (in de tooltip én in de
bronnenlijst), dus in een linkoverzicht is het aantal ongeveer het dubbele van wat
de zichtbare pagina suggereert. Binnen de context van het lijstitem is het doel
duidelijk, dus AA is gehaald. Een `aria-label` per link ("Bekijk bron: Aw, artikel
4.2, eerste lid") lost het op zonder de zichtbare tekst te veranderen.

**Opgelost op 10 augustus 2026** — precies zo, op beide plekken waar de link
staat (tooltip en referentielijst). De brontekst wordt afgekapt op 90 tekens,
zodat een label van een lange voetnoot niet een halve alinea wordt.

### 28. Afkortingen nergens uitgeschreven

**WCAG 3.1.4 (AAA)** — `content/` bevat 8× "Aw", 12× "Ab", 8× "Ar", 4× "DUTO", 2×
"SIO", en er staat geen enkel `<abbr>`-element in het project. De bronteksten in de
tooltips bestaan grotendeels úít deze afkortingen. Voor de doelgroep "onder
toezicht staande organisaties" — niet uitsluitend archiefjuristen — is dat een
reële begripsbarrière. Buiten AA, maar goedkoop en inhoudelijk zinvol.

**Opgelost op 10 augustus 2026** — `_partials/afkortingen.html` +
`data/afkortingen.yaml`; zie [Aanvulling 10 augustus
2026](#aanvulling-10-augustus-2026) voor de twee valkuilen (Hugo lowercaset
configuratiesleutels; de abbr-pass moet vóór het `aria-label` van bevinding 27).

---

## Wat goed gaat

Expliciet gecontroleerd en in orde:

* **Semantiek en structuur** — elke pagina heeft precies één `<main>`, één `<h1>`
  en een `<header>`/`<footer>`/`<nav>`-structuur. Geen kopsprongen op alle 14
  pagina's, geen dubbele `id`-waarden, geen `tabindex` groter dan 0. (Zie wel
  bevinding 8: er *ontbreken* koppen, de aanwezige hiërarchie klopt.)
* **Taal en titels** — `lang="nl"` overal, unieke `<title>` per pagina (behalve de
  twee taxonomiepagina's, bevinding 14).
* **Tekstcontrast** — alle tekstcombinaties uit de design tokens halen AA, in
  licht én donker: gewone tekst 17,9:1, gedempte tekst 10,4:1, links 6,1:1,
  merkkleur `#007bc7` op wit 4,5:1 (precies op de grens — het opmerken waard bij
  een volgende huisstijlwijziging). Ook de callouts, de bètabanner (12,0:1) en de
  hero-tekst in het slechtst denkbare geval (11,2:1) voldoen.
* **Diagramteksten** — `.bd-label` 7,7:1, `.bd-label-main` 4,5:1 bij 20 px vet
  (grote tekst), `.bd-label-outlined` 4,6:1 licht en 9,5:1 donker. Alleen de
  *lijnen* falen (bevinding 11).
* **Zoekvenster** — een echte `<dialog>` met `showModal()`: focusinsluiting via
  inert, Escape via het `cancel`-event en focusherstel bij sluiten zijn daarmee
  native geregeld. Pijltjestoetsnavigatie door de resultaten werkt. *Kanttekening:*
  er is geen `close`- of `cancel`-listener, dus bij sluiten met Escape blijven
  zoekterm en resultaten staan. Geen WCAG-fout, wel een statusbug.
* **`prefers-reduced-motion`** wordt gerespecteerd, inclusief `scroll-behavior`.
* **Doelgroottes (2.5.8, AA)** voldoen: header-knoppen 32 px, mobiele knoppen
  `min-height: 55px`, inhoudsopgave-knop 40 px, sluitknop zoekvenster 28 px,
  zoekresultaten ≥46 px, diagrambollen r=42–80. Breadcrumblinks komen op ~22 px
  maar vallen onder de inline-uitzondering. **Correctie 10 augustus 2026:** de
  *links* in de inhoudsopgave voldeden niet — zie bevinding 29. Dit is met de
  hand nagerekend en fout gerekend; de browserrun vond het wel.
* **Zoom** — `width=device-width, initial-scale=1.0`, geen `maximum-scale` of
  `user-scalable=no`.
* **2.4.5 Multiple Ways (AA)** — hoofdnavigatie, zoekfunctie, breadcrumb,
  vorige/volgende, card-grids en `sitemap.xml`.
* **3.2.6 Consistent Help (AA)** — "Contact" staat op elke pagina op dezelfde
  plek in de footer.
* **1.4.1 Use of Color** in breadcrumb en footer voldoet: het verschil tussen link
  en huidig item is 3,3:1 én er is een onderstreping of chevron.
* **Vorige/volgende-navigatie** heeft wél een toegankelijke naam
  (`aria-label="Navigatie binnen deze reeks"`). Van de zes landmarks op een
  normpagina zijn er vijf benoemd; alleen de inhoudsopgave-`<nav>` in
  `layouts/normen/single.html:124` is naamloos, maar staat binnen een `<aside
  aria-label="Op deze pagina">` met een zichtbare `<h2>`. Klein, en al met één
  attribuut op te lossen.
* **`.card-grid.clickable`** vervangt zijn `outline: none` netjes door een
  `box-shadow`-ring van 4,5:1 — het enige `outline: none` in de codebase met een
  deugdelijke vervanging.
* **De referentie-accordeon klapt open bij een fragmentlink**, inclusief de
  TOC-link `#toelichting`, mits JavaScript aanstaat.

## Niet van toepassing op deze site

Voor de volledigheid, zodat duidelijk is dat ze zijn overwogen: 1.2.1–1.2.5 (geen
media), 1.4.2 (geen audio), 1.3.5 Identify Input Purpose (het zoekveld verzamelt
geen gebruikersgegevens), 2.5.7 Dragging Movements (geen sleepinteractie),
3.3.1–3.3.4 (geen formuliervalidatie), 3.3.7 Redundant Entry (geen meerstaps­
formulier), 3.3.8 Accessible Authentication (geen inlog).

De tweede navigatiebalk en de subnav-panelen in het thema worden op deze site niet
gerenderd (`second_nav` staat nergens aan); die code is hier dode code en is niet
beoordeeld.

---

## Beperkingen van dit onderzoek

| Onderwerp | Waarom niet vastgesteld |
|---|---|
| 1.4.10 Reflow (320 px / 400% zoom) | ~~vereist een browser met layout~~ — sinds 10 augustus 2026 gedekt door `scripts/a11y-browser.mjs` in CI |
| 1.4.12 Tekstafstand | idem |
| 1.4.4 Tekstvergroting 200% (bevinding 18) | idem |
| 2.4.11 Focus niet afgedekt (bevinding 17) | idem, inclusief de `?q=`-variant waarin de meldbalk verschijnt |
| Schermlezergedrag (NVDA, JAWS, VoiceOver) | vereist hulpsoftware; de uitspraken over AT in dit rapport zijn afgeleid uit spec en code, niet waargenomen |
| Windows hoogcontrastmodus | er is één `forced-colors`-blok in de hele codebase (`assets/css/bollendiagram.css:127`), dus alleen voor het diagram; de rest is niet gedekt en niet getest |
| Bediening met alleen toetsenbord in de praktijk | de geautomatiseerde doorloop dekt tab-orde, focusindicator en afdekking; een menselijke doorloop op begrijpelijkheid van de route staat nog open |
| Taalniveau (B1-Nederlands) en begrijpelijkheid | vraagt redactionele toetsing en gebruikersonderzoek |

De axe-scan van 6 augustus draaide op jsdom, niet in een echte browser.
Structuur-, naam- en ARIA-regels zijn daarmee volwaardig gecontroleerd;
layout-afhankelijke regels niet — die zijn toen met de hand nagerekend en worden
sinds 10 augustus 2026 in Chromium gemeten.

---

## Aanbevolen vervolg

1. **Keuze maken over de PDF (6)** — leg keuze én motivering vast; dit is de enige
   bevinding die niet met een patch is op te lossen.
2. **Thema-issues indienen** op `RijksICTGilde/hugo-theme-rijksoverheid`. De drie
   die vanuit dit project niet op te lossen waren, staan er:
   [#10](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/10)
   (7, Escape op de tooltip),
   [#11](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/11)
   (9, `<mark>` en de live region) en
   [#12](https://github.com/RijksICTGilde/hugo-theme-rijksoverheid/issues/12)
   (18, hero-hoogte). **Nog te doen:** 10, 16, 17, 21, 23, 24 en de thema-helft
   van 1. Alles wat hier in `assets/css/toegankelijkheid.css` en
   `assets/js/toegankelijkheid.js` staat is een tijdelijke reparatie op
   thema-code en hoort daar te verdwijnen; zolang die issues er niet staan,
   verdwijnt de override zonder dat het thema is bijgewerkt.
3. **De browsertests laten meewegen** — `npm run test:a11y:browser` draait in CI.
   Bevinding 18 verschijnt daar als categorie `tekstzoom-200`; zodra thema-issue
   #12 is opgelost, hoort die regel te verdwijnen. De categorie
   `focus-indicator` is bewust een waarschuwing en geen fout: een element zonder
   `outline` of `box-shadow` kan focus ook met een rand- of achtergrondwissel
   aangeven, en dat onderscheid vraagt een oog.
4. **Toegankelijkheidsverklaring** — de footer verwijst naar de verklaring van
   inspectie-oe.nl. Op grond van het Tijdelijk besluit digitale toegankelijkheid
   overheid heeft deze site een eigen verklaring nodig in het register van
   DigiToegankelijk, met de eigen URL en de actuele status. Dat de site nog in
   bèta is, ontslaat niet van die plicht. (Juridisch punt, niet uit de code te
   verifiëren.)
5. **Handmatige doorloop en gebruikerstest** — een toetsenbord-doorloop en een test
   met NVDA of VoiceOver dekken het deel dat geen enkele scanner vindt. Betrek
   daarbij mensen die hulpsoftware dagelijks gebruiken.

## Bronnen

* [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
* [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)
* [Tijdelijk besluit digitale toegankelijkheid overheid](https://wetten.overheid.nl/BWBR0040936/2018-07-01)
* [DigiToegankelijk — onderzoek en verklaring](https://www.digitoegankelijk.nl/toegankelijkheidsverklaring/onderzoek)
* [NL Design System — WCAG](https://nldesignsystem.nl/wcag/)
