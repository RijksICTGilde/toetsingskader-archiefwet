# Changelog

Alle noemenswaardige wijzigingen aan dit project worden in dit bestand
gedocumenteerd.

Het format is gebaseerd op [Keep a Changelog v1.1.0][kac], en dit
changelog volgt [Semantic Versioning][semver].

[kac]: https://keepachangelog.com/nl/1.1.0/
[semver]: https://semver.org/lang/nl/

Per versie staan eerst de wijzigingen die een bezoeker van de site of een lezer
van de PDF's merkt, in gewone taal. Wat alleen de bouw en het beheer van de site
raakt, staat onder **Techniek**.

## [Unreleased]

### Toegevoegd

- Onderaan de pagina Totstandkoming staat een uitklapbaar blok Versies van de
  website. Daarin staat per versie van de website wat er is veranderd, de
  nieuwste bovenaan. De datum in "Deze pagina is voor het laatst aangepast op
  …" onderaan elke pagina linkt daarheen en klapt het blok open.

### Gewijzigd

- Onderaan elke pagina, ook de homepage, staat geen versienummer meer. Het
  nummer hoort bij de website en loopt bij elke kleine wijziging op; "Versie …
  van het toetsingskader" suggereerde een nieuwe versie van het kader zelf. Er
  is daardoor ook geen link meer naar GitHub in een nieuw tabblad.
- De site heeft de vormgeving van het NLDD Designsysteem van de Rijksoverheid:
  kleuren, iconen en het lettertype RijksSans. De lopende tekst is iets kleiner
  en de tekstkolom smaller, zodat de regels rustiger lezen.
- De inhoudsopgave en de knop voor de PDF staan rechts naast de tekst. Op een
  smal scherm klap je ze uit.
- Er is geen keuze meer tussen licht en donker: de site volgt de instelling van
  je apparaat.
- Zoeken vindt ook synoniemen en kernbegrippen, en een resultaat brengt je naar
  de kop waar het woord staat.
- Links naar andere websites openen in hetzelfde venster.
- Op een smal scherm staat onder het bollendiagram dat je het opzij kunt
  schuiven om de hele plaat te zien.
- De PDF's staan in RijksSans, net als de site.
- De site bewaart niets meer in je browser; de pagina Cookies zegt dat ook.

### Opgelost

- Alle pagina's, links en opmaak komen van het publieke adres
  toetsingskader.inspectie-oe.nl/archiefwet/, zodat je als bezoeker binnen dat
  adres blijft. De PDF's noemen dat adres, en zoekmachines krijgen het als
  vaste vindplaats van elke pagina.
- Beter toegankelijk: Criteria en Indicatoren staan als kop onder het
  voorschrift waar ze bij horen, er is geen tweede kop "Zie ook" meer, de
  teruglinks bij voetnoten zijn groot genoeg om aan te tikken en een
  bronvermelding die openstaat blijft bij inzoomen in beeld.
- De PDF's voldoen aan PDF/UA-1: een schermlezer leest ook het briefhoofd, elke
  link en tekst die over een paginagrens loopt.

### Techniek

- De site wordt gebouwd met het publieke adres als `baseURL`
  (`https://toetsingskader.inspectie-oe.nl/archiefwet/`) in plaats van het
  ZAD-adres. Interne links, CSS, JS en lettertypen dragen daardoor het
  voorvoegsel `/archiefwet/`, zodat een bezoeker binnen dat pad blijft. De
  canonieke link, de "Bron: …"-regel op de omslag van de PDF's en het adres
  achter "Bekijk voor de actuele versie …" noemen het publieke adres.
- Shortcode `versies` op `/over/totstandkoming/` leest dit bestand en toont
  per release een kop met anker (`#v1-0-2`) in een `.references`-blok;
  `[Unreleased]` en `### Techniek` blijven weg. De datum in
  `_partials/versie-zin.html` linkt naar `#versies` (de kop van het blok);
  `referenties.js` van het thema klapt het blok open. `params.releases_url` en
  het versienummer in de paginavoet zijn vervallen.
- Theme naar hugo-theme-rijksoverheid v0.3.0. Hooks van het theme
  (`content-extra`, `toc-extra`, `version-text`, `lastmod-text`) vervangen de
  kopieën van `article.html`, `page-aside.html`, `lastmod.html` en
  `versie-zin.html`, en zoeken loopt via het theme (`synonyms`, was
  `synoniemen`). `params.versie` heet `version`, in CI en de Containerfile
  `HUGO_PARAMS_VERSION`.
- `tools.go` houdt het theme in `go.mod`; Dependabot houdt het bij en CI faalt
  als de build `go.mod` of `go.sum` verandert.
- CI valideert de PDF's met veraPDF tegen PDF/UA-1.

## [1.0.2] - 2026-11-24

### Opgelost

- De PDF's noemen op de omslag ("Bron: …") en achter "Bekijk voor de actuele
  versie …" het publieke adres toetsingskader.inspectie-oe.nl/archiefwet/ in
  plaats van het adres van het hostingplatform.

### Techniek

- De PDF's noemen het publieke adres
  (`https://toetsingskader.inspectie-oe.nl/archiefwet/`) in de "Bron: …"-regel
  op de omslag en achter "Bekijk voor de actuele versie …", in plaats van het
  ZAD-adres van de build (`params.pdf.site_url`).

## [1.0.1] - 2026-11-23

### Techniek

- nginx in het runtime-image mee in de `apk upgrade` (naar 1.30.7-r0): Trivy
  blokkeerde de deploy op zes nginx-CVE's, waarvan vier kritiek. Elke GitHub
  Action en de pre-commit-hooks gepind op een commit-SHA, de
  htmltest-download gecontroleerd met sha256, Dependabot ook voor npm en
  pre-commit.

## [1.0.0] - 2026-11-23

### Gewijzigd

- Versie 1.0: het toetsingskader staat op
  toetsingskader.inspectie-oe.nl/archiefwet.

## [0.3.1] - 2026-11-17

### Gewijzigd

- Verwijzingen naar het Archiefbesluit linken naar de publicatie in het
  Staatsblad (Stb. 2026, 321) in plaats van naar de internetconsultatie.
  Verwijzingen naar de Archiefregeling hebben geen link meer; daar staat
  "(Bron beschikbaar na publicatie van de Archiefregeling.)".

### Techniek

- Verwijzingen naar het Archiefbesluit linken naar de publicatie in het
  Staatsblad (Stb. 2026, 321) in plaats van naar de internetconsultatie.
  Verwijzingen naar de Archiefregeling hebben geen link meer, maar op die plek
  cursief "(Bron beschikbaar na publicatie van de Archiefregeling.)". De
  bronvermelding onder de kern rendert daarvoor nu markdown.

## [0.2.9] - 2026-10-19

### Gewijzigd

- De links Privacy en Cookies onderaan de pagina openen eigen pagina's op deze
  site in plaats van inspectie-oe.nl. De privacyverklaring noemt de Inspectie
  als verantwoordelijke en alleen contact per e-mail. De cookiepagina noemt
  één noodzakelijk sessiecookie van het hostingplatform, geen
  webstatistieken, en verder alleen de weergavevoorkeur en de stand van de
  inhoudsopgave die je browser zelf bewaart.

### Opgelost

- In norm 1 (Inbeheername en beheer), 5 (Informatiebeveiliging en
  betrouwbaar), 7 (Vernietigen) en 8 (Periodieke evaluatie) linken de
  verwijzingen naar de Memorie van Toelichting naar het juiste Kamerstuk
  (35968, nr. 3). In norm 1 hadden die verwijzingen nog geen link.

## [0.2.8] - 2026-10-11

### Gewijzigd

- Naast het Rijksoverheid-logo in de kop staat nu eerst, vet, "Inspectie
  Overheidsinformatie en Erfgoed", met "Ministerie van Onderwijs, Cultuur en
  Wetenschap" eronder, zoals op inspectie-oe.nl. Eerder stond er alleen het
  ministerie, waardoor de site van OCW leek.

### Techniek

- `params.logo.woordmerk` in `hugo.yaml` is een lijst: de Inspectie (vet) en
  het ministerie, elk op een eigen regel.
- Training contentbeheer voor redacteuren
  (`docs/training-contentbeheer.html`): deel 5 over samenwerken, en
  navigatie door het document.

## [0.2.7] - 2026-10-06

### Toegevoegd

- Anderstalige termen, zoals "by design", zijn op de site en in de PDF
  gemarkeerd als Engels, zodat een schermlezer ze in het Engels uitspreekt.
  De tekst van de normen verandert niet.

### Gewijzigd

- Naast het Rijksoverheid-logo, dat nu in het midden van de kop staat, staat
  een woordmerk zoals op het briefhoofd van de PDF's: "Ministerie van
  Onderwijs, Cultuur en Wetenschap". Het blijft ook op een smal scherm staan.
- Het logo linkt naar de website van de Inspectie (www.inspectie-oe.nl) in
  plaats van naar de homepage van deze site.
- De sneltoets om te zoeken is Ctrl+K (Cmd+K op een Mac); de hint daarvoor
  staat weer zichtbaar in de zoekbalk.

### Techniek

- Het logo linkt naar de hoofdsite van de Inspectie
  (https://www.inspectie-oe.nl/) in plaats van naar de homepage van deze site.
  Beide via `params.logo` in `hugo.yaml`, een optie van het thema sinds v0.2.1
  (hugo-theme-rijksoverheid#20); geen projectshadow of eigen CSS.
- Anderstalige termen krijgen een taalmarkering (WCAG 3.1.2, issue #62 punt 2):
  "by design" staat op de site in `<span lang="en">` en in de PDF als `Span`
  met `/Lang (en)`, zodat een schermlezer het in het Engels uitspreekt. De
  termen staan in `data/vreemde-termen.yaml` en worden bij het bouwen
  gemarkeerd; de normtekst zelf verandert niet. Een voetnoot direct achter zo'n
  term maakt de hele term tot tooltip-term.
- Thema naar v0.2.3. Vijf toegankelijkheidspatches uit
  `assets/js/toegankelijkheid.js` zijn weg, omdat het thema ze nu zelf
  oplost: skip-link (bevinding 16), naam van de zoekknop (21), genest
  landmark en Escape in het mobiele menu (24), de `/`-sneltoets (10) en de
  melding "opent in een nieuw venster" (23). De zoeksneltoets is nu
  Ctrl+K / Cmd+K, ook in onze `search.js`-override, en de hint in de balk
  is weer zichtbaar. De zoekindex neemt de verborgen nieuw-venster-melding
  niet op.

## [0.2.6] - 2026-10-06

### Gewijzigd

- De afkortingen Aw, Ab en Ar zijn voluit geschreven: Archiefwet,
  Archiefbesluit en Archiefregeling. DUTO en SIO blijven afkortingen.
- Het bollendiagram op de samenhangpagina is blauw in plaats van groen. Een
  label van meer dan één regel staat niet meer tegen zijn bol aan.
- De link "Ga naar …" staat alleen nog in de tooltip van een term, niet meer
  ook in de bronnenlijst onderaan de pagina: die lijst gaat over bronnen.

### Opgelost

- Een bron waar je naartoe springt in de bronnenlijst schuift niet meer naar
  links; ze krijgt alleen een achtergrondkleur.
- De inhoudsopgave "Op deze pagina" op de normpagina's markeert nu elke
  sectie waar je bent, ook "Referenties" en de laatste secties onderaan.

### Techniek

- Afkortingen Aw, Ab en Ar worden voluit geschreven: "Archiefwet",
  "Archiefbesluit" en "Archiefregeling" (169 plekken in de content, inclusief
  de kern_bron in de front matter). Ze staan niet meer in
  `data/afkortingen.yaml`, dus er komt ook geen `<abbr>` meer omheen; DUTO en
  SIO blijven afkortingen.
- Bollendiagram in blauw in plaats van groen: rijksblauw #154273 voor de hub,
  hemelblauw #007bc7 voor lijnen en bolranden, #80d5fc in donkere modus. Een
  label van meer dan één regel schuift verder naar buiten, zodat het evenveel
  ruimte tot zijn bol houdt als een label van één regel ("Informatiebeveiliging
  en betrouwbaar" stond tegen de bol aan).
- De "Ga naar …"-link staat alleen nog in de tooltip (keuze 22 september
  2026), niet meer ook in de bronnenlijst onderaan: die lijst gaat over
  bronnen, niet over navigatie. De controle `ga-naar-ontbreekt` in
  `scripts/a11y-checks.mjs`, die de kopie in de lijst afdwong, vervalt
  daarmee.
- De aangesprongen bron in de referentielijst verspringt niet meer: de
  thema-regel `.references li:target` schoof de regel (en dus het
  referentienummer) 0,5em naar links. De highlight is nu alleen een
  achtergrondkleur. Upstream-kandidaat op het thema.
- De project-eigen scroll-spy voor "Op deze pagina" op de normpagina's
  (`assets/js/toc-scrollspy.js`); thema naar v0.2.2. Het thema volgt nu zelf
  alleen koppen met een TOC-link en markeert ook de laatste secties onderaan
  een pagina (hugo-theme-rijksoverheid#8 en #22). Daardoor wordt elke sectie
  in de inhoudsopgave gemarkeerd, ook "Referenties"; voorheen bleef op elke
  normpagina minstens één sectie onderaan ongemarkeerd. Sluit #45.

## [0.2.5] - 2026-09-16

### Gewijzigd

- Een term met een tooltip is gestippeld onderstreept en opent alleen de
  tooltip. Verwijst de term ook naar een pagina, dan staat die link in de
  tooltip als "Ga naar …". Zo is de bron ook op een touchscreen bereikbaar.

### Techniek

- Hover en link gescheiden (keuze 15 september 2026): elke term met een
  tooltip is gestippeld en opent alleen de tooltip; was de term ook een link
  naar een pagina, dan staat die link nu in de tooltip als "Ga naar …". Eén
  betekenis per lijn, en de bron is ook op een touchscreen bereikbaar. Een
  leesteken direct achter zo'n term valt buiten de stippellijn en buiten de
  toegankelijke naam.

## [0.2.4] - 2026-09-15

### Toegevoegd

- De pagina Totstandkoming onder Over.

### Gewijzigd

- De tekst over duurzame toegankelijkheid is geen aparte tegel onder Over
  meer, maar staat als kop "Duurzame toegankelijkheid" op de samenhangpagina
  (in plaats van "Beschikbaar en leesbaar"). Het oude adres blijft werken, en
  de tegel "Voor wie?" op de homepage verwijst naar die kop.
- Teksten aangepast: de korte teksten op de tegels Wettelijk kader en
  Doelgroep en die van norm 1 in het normenoverzicht. De inleiding heeft weer
  een voetnoot naar het Position Paper, en het blok over DUTO heeft geen
  titel meer en een bronvermelding bij "noodzakelijk".
- Het bollendiagram op de samenhangpagina volgt de plaat van de Inspectie:
  "Inbeheername en beheer" in het midden met zeven normen eromheen, elk met
  een icoon, in Rijkshuisstijl-groen. De vervaagde toekomstbollen en de lijst
  met normlinks onder het diagram zijn weg.
- Het bollendiagram blijft klikbaar en met het toetsenbord te bedienen; op
  een smal scherm scrolt het horizontaal.
- De PDF's worden bij het bouwen van de site gemaakt in plaats van in je
  browser, en zijn toegankelijk: met een schermlezer navigeer je door koppen,
  lijsten en leesvolgorde, en elke PDF heeft bladwijzers, een taal en een
  documenttitel. Eerder was het één doorlopende lap tekst.
- In de PDF staat het briefhoofd op elke pagina, blijven geneste lijsten
  behouden, staat de kern zonder kop en is de datum Nederlands.
- De downloadknop is een gewone link naar het PDF-bestand en werkt ook
  zonder JavaScript.
- De pagina's onder Over en Onderwerpen gebruiken de volle breedte en hebben
  geen eigen menu "Op deze pagina" meer.
- Onderaan elke pagina staat dezelfde zin met het versienummer en de datum
  van de laatste wijziging; de homepage toont nu ook die datum.
- Op de normpagina's staat de kern direct onder de paginatitel, zonder eigen
  kop. Ook in de inhoudsopgave en de PDF staat die kop niet meer.
- Op alle pagina's toont een voetnoot de bron in een tooltip, niet alleen op
  de normpagina's.
- Termen met een tooltip hebben de kleur van een gewone link; de stippellijn
  is het verschil.

### Verwijderd

- Normpagina's laden geen script van ruim anderhalve megabyte meer om de PDF
  te maken, ook niet voor wie nooit iets downloadt.

### Opgelost

- De PDF-knop is in donkere modus weer leesbaar: de witte tekst op hemelblauw
  had te weinig contrast.
- Termen met een tooltip hebben genoeg contrast op het blauwe vlak van een
  definitieblok.
- In de PDF is een voetnoot in een kop (norm 4, "Digitale documenten met een
  bewaartermijn …") geen kaal nummer achter de kop meer, maar een
  superscript dat naar de bronnenlijst springt, zoals in de lopende tekst.

### Techniek

- `params.pdf.site_url` in `hugo.yaml`: het adres achter "Bekijk voor de
  actuele versie …" in de PDF's én de "Bron: …"-regel op de omslag. Leeg
  betekent de baseURL van de build.
- Shortcode `callout-md`: een callout waarvan de inhoud in de pagina-context
  rendert, zodat een voetnoot erin een hover wordt. Daarvoor staat
  `markup.goldmark.renderer.unsafe` aan.
- PDF-generatie omgebouwd van Chromium-print naar pdfkit met een handgebouwde
  structuurboom (`markStructureContent`), dezelfde oplossing als de
  AI-verordening-beslishulp (MinBZK/ai-verordening-beslishulp#1047). Nog
  steeds bij de build, maar zonder browser: `just pdf` draait nu ook lokaal en
  de containerbuild heeft geen Chromium meer nodig. `pdf-ua-check` eist naast
  de vier markers voortaan ook een gevulde boom (/H1, /LBody); kopvolgorde en
  dubbele ankers worden op de invoer gecontroleerd in `scripts/pdf-build.mjs`.
  Zie docs/besluit-toegankelijke-pdf.md §11. Na review: links als
  Link-structuurelementen met OBJR, geneste lijsten behouden, kern zonder kop
  en het colofon als versieregel (zoals eerder afgesproken), briefhoofd op
  elke pagina, Nederlandse datum ook in de containerbuild.
- De PDF-export wordt bij de build gemaakt in plaats van in de browser van de
  bezoeker, en levert een getagde PDF: structuurboom, bladwijzers, taal en
  documenttitel. Daarmee is de download navigeerbaar met een schermlezer —
  koppen, lijsten en leesvolgorde — waar het eerder één doorlopende lap tekst
  was (EN 301 549 §10, onderliggend WCAG 1.3.1 en 4.1.2, niveau A). De
  motivering en de afweging staan in `docs/besluit-toegankelijke-pdf.md`; de
  markers worden in CI gemeten met `scripts/pdf-ua-check.mjs`.
- Over- en onderwerpenpagina's op volle breedte (`wide: true` via `cascade`
  in de sectie-index): ze hebben geen inhoudsopgave meer, dus de smalle
  tekstkolom liet rechts een lege strook.
- Versiezin op elke pagina gelijk: "Versie … van het toetsingskader. Deze
  pagina is voor het laatst aangepast op …", in de gedempte opmaak van de
  homepage. De homepage toont nu ook de datum; de voet van de andere pagina's
  gebruikt dezelfde partial (`_partials/versie-zin.html`); de opmaak is die
  van het thema voor een paginavoet (gedempt, cursief), zonder eigen CSS.
  Lokale default van het versienummer is `v0.2.2`.
- De kern-callout op de normpagina's heeft geen kop meer: de kerntekst staat
  direct onder de paginatitel. De regel "Kern van …" is ook weg uit de
  inhoudsopgave en de PDF; `_partials/kern-kop.html` is verwijderd.
- Voetnoten worden op álle pagina's een hover met referentielijst, niet
  alleen op de normpagina's: de transformatie is een partial
  (`_partials/voetnoot-tooltips.html`) die ook in de `article.html`-shadow
  draait.
- De controle op de versiezin in de toegankelijkheidsscan is vervallen: de
  zin komt sitebreed uit één partial (`_partials/versie-zin.html`), en de
  controle kleurde elke build rood sinds het voorbehoud op verzoek is
  aangepast.
- Bollendiagram op de samenhangpagina naar de plaat van de Inspectie van
  15 september 2026 (`docs/bollendiagram-inspectie-2026-09-15.png`): hub
  "Inbeheername en beheer" met zeven normen eromheen, elk met een icoon en
  het label buiten de bol, en een ring tussen de buurbollen; de vervaagde
  toekomstbollen zijn weg. De plaat is data-gedreven: een norm toevoegen is
  één regel in `layouts/shortcodes/bollendiagram.html`, de posities worden
  berekend. De iconen komen uit het NLDD Design System; de kleuren zijn
  Rijkshuisstijl-groen (donkergroen, groen, mintgroen). Blijft klikbaar en
  toetsenbordbedienbaar; op een smal scherm scrollt hij horizontaal binnen de
  figure. De lijst normlinks onder het diagram is weg.
- De client-side PDF-generatie met pdfMake: de gevendorde bibliotheek (1,3 MB),
  de base64-lettertypen (228 kB), de HTML→pdfMake-converter, de doc-definitie,
  de `index.pdf.json`-endpoints en de bijbehorende tests. Dat scheelt een
  blokkerend script van ruim anderhalve megabyte op elke normpagina, ook voor
  wie nooit iets downloadt.
- PDF-knop in donkere modus: witte tekst op hemelblauw haalde 1,6:1 (WCAG
  1.4.3). Tekstkleur nu uit `--color-text-on-primary`.
- Hover-termen kleuren met `--color-link` in plaats van `--color-primary`:
  dezelfde kleur als gewone links, en op het blauwe callout-vlak voldoende
  contrast (was 3,7:1, axe-fout op de bron-hover in het DUTO-blok).

## [0.2.3] - 2026-08-27

### Toegevoegd

- Pagina "Duurzame toegankelijkheid" onder Over, met de definitie van duurzame
  toegankelijkheid en welke kenmerken daarvan als norm zijn uitgewerkt. Die
  tekst stond eerder dubbel in de inleiding en op de pagina Samenhang.
- Bronvermeldingen op de onderwerpenpagina's aangrijpingspunt, audittrail,
  classificatie en aggregatie, document en samenhang en interpreteerbaarheid.

### Gewijzigd

- De paginatitel van elke norm is nu de normnaam, bijvoorbeeld "Inbeheername
  en beheer", in plaats van "Normanalyse ...". Norm 7 heet op het overzicht en
  boven de kern "Vernietigen" in plaats van "Gecontroleerd vernietigen".
- Feedback op de normbladen verwerkt in normen 1, 2 en 4 tot en met 7: onder
  meer nieuwe en verbeterde bronvermeldingen, woorden met een uitleg of een
  link naar het betreffende onderwerp, vetgedrukte kernbegrippen bij norm 1,
  tussenkopjes voor de categorieën documenten bij norm 4, een rechtgezette
  inspringing van de back-upindicatoren bij norm 5 en kortere omschrijvingen
  van norm 6 en 8 op het normenoverzicht.
- De bron bij NEN-ISO 23081-1:2017 (norm 4) verwijst nu naar nen.nl in plaats
  van naar een bestand dat buiten de organisatie niet te openen was.
- Bij norm 5 noemt de uitleg bij "informatiebeveiliging" de onderwerpen waar
  de Inspectie zich niet op richt, zoals firewalls, encryptie en patchen.
- Over het toetsingskader: aangepaste kaartteksten, een bron bij de definitie
  van duurzame toegankelijkheid in de inleiding, een voetnoot bij "document"
  in Wettelijk kader en kleine tekstcorrecties. Het kopje "Invloed per
  onderwerp" op de pagina Samenhang heet nu "De risicobenadering per norm".
- Het onderwerp "Incidenten (voorkomen van)" heet nu "Incidenten"; extra
  bronnen bij drie onderwerpen.
- Woorden met een uitleg die ook een link zijn, zijn blauw en doorgetrokken
  onderstreept; woorden met alleen een uitleg blijven zwart met een
  stippellijn. Versie en datum onderaan elke pagina zijn kleiner en rustiger.

### Techniek

- Feedbackronde op de normbladen ordenen, metadateren en informatiebeveiliging
  verwerkt:
  - De paginatitels volgen het normblad: "Normanalyse ordenen", "Normanalyse
    metadateren" en "Normanalyse informatiebeveiliging en betrouwbaar" (was
    "Normanalyse Ordeningsstructuur", "Normanalyse Metadata" en "Normanalyse
    informatiebeveiliging en betrouwbaarheid van documenten").
  - Norm 4: de bron bij NEN-ISO 23081-1:2017 wees naar een DMS-bestand dat
    buiten de organisatie niet te openen is; hij wijst nu naar
    [NEN-ISO 23081-1:2017 nl](https://www.nen.nl/nen-iso-23081-1-2017-nl-269387)
    op nen.nl.
  - Norm 4: de drie zinnen die de categorieën documenten inleiden ("Alle
    documenten, ongeacht de bewaartermijn …", "Digitale documenten met een
    bewaartermijn langer dan tien jaar …", "Over te brengen documenten …") zijn
    tussenkopjes (`###`) op hetzelfde niveau als "Feitelijk beheer" bij norm 1.
    Ze liepen als losse alinea door in het voorschrift ervoor.
  - Norm 4: hover bij "structuur" leest "aan een bericht dat bijlagen bevat";
    de bron bij het permanent uniek identificatiekenmerk (voorschrift 4.3) is
    "Ar, artikel 2.7; Ar, artikel 2.8; Archiefregeling, Toelichting, 2.2
    Aanvullende eisen voor langdurig te bewaren documenten in digitale vorm,
    p.37."
  - Norm 5: de hover bij "informatiebeveiliging" in de toelichting noemt nu de
    onderwerpen waar de Inspectie zich niet op richt (firewalls, encryptie,
    antivirussoftware, MFA, patchen). Toegevoegd aan de bestaande bronvoetnoot
    op dat woord in plaats van als tweede voetnoot: twee voetnootmarkeringen
    achter elkaar geven één zwevend nummer, omdat de tooltip-transformatie in
    `layouts/normen/single.html` het voorafgaande woord pakt.
  - Norm 5: de twee back-upindicatoren bij voorschrift 5.1 stonden ingesprongen
    en staan nu op hetzelfde niveau als de andere indicatoren; de bron bij 5.1
    scheidt de twee vindplaatsen met een puntkomma; de bron bij het laatste
    criterium van 5.4 legt uit wat "ongeoorloofd" betekent en is niet langer
    een half afgemaakte notitie.
- De controle `draft-voorbehoud` in de toegankelijkheidsscan, die op elke
  pagina de zin "in ontwikkeling en kan wijzigen" eiste. Die zin is op verzoek
  weg (25 augustus), de controle maakte sindsdien elke build rood.
- Containerbuild: de runtime-stage staat buiten de GHA-layercache
  (`no-cache-filters: runtime`), zodat `apk upgrade` echt draait en de
  Trivy-scan niet rood wordt op een al gefixte Alpine-CVE (CVE-2026-14456).

## [0.2.2] - 2026-08-25

### Gewijzigd

- De kop boven de kern is genummerd, bijvoorbeeld "1. Kern van inbeheername en
  beheer", zodat "Voorschrift 1.1" eronder aansluit. Ook in de inhoudsopgave
  en de PDF.
- Bij "Gerelateerde onderwerpen" staan alleen nog onderwerpen met een eigen
  pagina; bij norm 7 vervalt het kopje daarmee helemaal.
- Het onderwerpenoverzicht toont alleen de titel per begrip. "Zie ook" bij
  Document noemt ook Overzicht, Ordenen en Metadateren.
- De pagina's onder Over en Onderwerpen hebben geen vorige/volgende-knoppen
  meer. Op de pagina Samenhang is het diagram kleiner en staat de
  inhoudsopgave standaard open.
- De PDF begint met één regel met het versienummer en een link naar de
  actuele versie, in plaats van het blok "Belangrijke informatie".
- De zin "De inhoud is nog in ontwikkeling en kan wijzigen." is weg, onderaan
  elke pagina, op de homepage en in de PDF.
- Zoeken op een synoniem zet de bijbehorende norm bovenaan.
- Nieuwe, brede afbeelding bovenaan de homepage.

### Techniek

- Openstaande punten uit de feedbackrondes (`docs/openstaande-punten.md`):
  - Kop boven de kern genummerd: "1. Kern van inbeheername en beheer", zodat
    "Voorschrift 1.1" eronder aansluit. Ook in de inhoudsopgave en de PDF.
  - "Gerelateerde onderwerpen": items zonder link weg; bij norm 7 daarmee het
    hele kopje.
  - Onderwerpenindex toont alleen de titel per begrip, geen regel tekst.
    "Zie ook" op Document noemt ook Overzicht, Ordenen en Metadateren.
  - Vorige/volgende-navigatie weg op de Over- en Onderwerpenpagina's.
  - Samenhang: bollendiagram kleiner (440 px) en inhoudsopgave standaard
    uitgeklapt (`toc_open`).
  - PDF: blok "Belangrijke informatie" vervangen door één regel met het
    versienummer en een link naar de actuele versie.
  - De zin "De inhoud is nog in ontwikkeling en kan wijzigen." is weg uit de
    versiezin (voet van elke pagina, homepage) en uit de PDF.
  - Zoeken: synoniemen wegen zwaarder dan titel en tekst (projectoverride van
    `search.js`), zodat een norm op zijn synoniem bovenaan komt.
- Nieuwe hero-afbeelding op de homepage: brede banner (4000×1056,
  `assets/images/hero.jpg`) in plaats van de 1000×600 png. Decoratief, alt
  blijft leeg.

## [0.2.1] - 2026-08-20

### Gewijzigd

- De tekst van alle acht normen staat nu woord voor woord zoals in de
  normbladen, inclusief spelling, afkortingen en bronvermeldingen. Eerdere
  redactionele correcties door de site zijn teruggedraaid.
- De kern van elke norm is de kerntekst uit het normblad, met bronvermelding.
  Op het normenoverzicht blijft de kortere omschrijving staan. Waar dezelfde
  tekst ook onder de toelichting stond, is die dubbeling weg.
- De voorschriften zijn als eis geformuleerd ("Het verantwoordelijke
  overheidsorgaan heeft ...") in plaats van als toetsvraag ("De Inspectie
  toetst of ...").
- De koppen op de normpagina's volgen het normblad: de paginatitel is de titel
  van het normblad en de kop boven de kern noemt de norm, ook in de
  inhoudsopgave en de PDF. "Normuitleg" heet nu "Voorschriften" en "Zie ook"
  heet "Gerelateerde onderwerpen". Norm 1 heeft weer een sectie "Reikwijdte
  inbeheername en beheer"; tussenkoppen die niet in het normblad staan zijn
  weg.
- Synoniemen en gerelateerde onderwerpen volgen de lijsten uit het normblad.
  Norm 5 heeft daardoor geen gerelateerde onderwerpen meer.
- Norm 3 (Ordenen): "overdragen" heet "overbrengen" in de toelichting en de
  bronnen bij voorschrift 3.3 staan in de volgorde van het normblad. De
  definitie van "werkproces" verschijnt bij het woord zelf, in plaats van als
  losse zin onder de norm.
- Het hoofdmenu bevat nu ook Onderwerpen en Samenhang: Home, Normen,
  Onderwerpen, Samenhang, Over.
- Een link naar een plek op dezelfde pagina springt er direct heen, zonder
  schuifbeweging.

### Verwijderd

- Vier zinnen met links naar de kennisbank van het Nationaal Archief, die niet
  in de normbladen staan.

### Opgelost

- Toegankelijkheid: duidelijker zichtbare focus in de zoekresultaten, het
  zoekveld en de links onderaan de pagina, beter contrast van de
  sneltoetshint, en de meldbalk dekt het element met focus niet meer af.

### Techniek

- Kop boven de kern noemt de norm: "Kern van ordenen" in plaats van "Kern van
  de norm", op de normpagina, in de inhoudsopgave en in de PDF. Uit
  `norm_titel`, dus voor alle acht normen tegelijk.
- Sectiekop `## Normuitleg` heet `## Voorschriften`, in alle acht normbladen
  en in de validator, de training voor contentbeheer en de accentlijn-CSS.
- De kaart op `/normen/` houdt de kortere omschrijving uit het
  introductiedocument (front matter `kern_kaart`), zodat de normpagina de
  normbladtekst kan tonen zonder dat de index verandert.
- De review op normblad Ordenen gold expliciet voor alle normbladen; die twee
  punten zijn nu ook op de normen 1, 2 en 4 tot en met 8 doorgevoerd:
  - De `kern` is de kerntekst uit het normblad zelf, met bronvermelding
    (`kern_bron`/`kern_bron_url`). De kortere zin uit "0) Introductie" die er
    stond staat nu in `kern_kaart` en blijft dus op de kaart in `/normen/`.
    Waar die normbladtekst ook als eerste alinea onder `## Toelichting` stond
    (normen 2, 4, 5, 6 en 7) is die dubbeling weg.
  - De voorschriften zijn letterlijk de normbladtekst en staan als eis
    geformuleerd ("Het verantwoordelijke overheidsorgaan heeft …") in plaats
    van als toetsvraag ("De Inspectie toetst of …"). De bronvoetnoten bleven
    gelijk. `CONTRIBUTING.md` en de training voor contentbeheer beschrijven
    die vorm nu ook; `CONTRIBUTING.md` noemde daar bovendien nog de oude kop
    `## Normuitleg`.
- De tekst van de normbladen staat nu woord voor woord op de site. De
  redactionele bewerkingen die er tot nu toe op zaten zijn teruggedraaid: de
  spellings- en congruentiecorrecties op het normblad ("emailapplicaties",
  "maateregelen", "plaats vond", "Metadata wordt", "de inhoud … zijn", het
  ontbrekende haakje in "(digitaal of papier."), de uitgeschreven afkortingen
  in de lopende tekst ("WOO", "etc.", "SIO", "functies/rollen"), en de
  normnamen uit normblad 8 in plaats van de sitenaamgeving. Ook de vier zinnen
  die de site had toegevoegd om naar de kennisbank van het Nationaal Archief
  te linken (architectuur/overwegingen bij implementatie, niveau van
  maatregelen, digitaal vernietigen, aangrijpingspunt) staan niet in de
  normbladen en zijn eruit; die vier externe links vervallen daarmee.
  Vervolgens is ook de rest gelijkgetrokken, zodat de normpagina's nu op elk
  punt het normblad volgen:
  - **Koppen.** De paginatitel is de normbladtitel ("Normanalyse Metadata"),
    de kop boven de kern komt uit het nieuwe front-matter-veld `kern_kop`
    ("Kern van Ordeningsstructuur" — die titels wijken af van de normnamen die
    de site verder voert, dus `norm_titel` blijft ongemoeid en daarmee ook het
    bollendiagram, de kaarten op `/normen/` en de navigatie). `## Zie ook`
    heet `## Gerelateerde onderwerpen`, norm 1 heeft weer
    `## Reikwijdte inbeheername en beheer`, en `#### Criteria`/`#### Indicatoren`
    staan in het enkelvoud waar het normblad dat schrijft. De dertien
    `### <thema>`-koppen die de site zelf had bedacht zijn weg; alleen
    "Besturing" en "Feitelijk beheer" blijven, want die staan in normblad 1.
  - **Voetnoten.** 57 bronvermeldingen zijn letterlijk de normbladtekst
    geworden ("Aw, Memorie van Toelichting", "AW1995", "p.34", "t.b.v.").
    Twee blijven afwijken: `hyperlink-duto` (het normblad geeft daar de
    instructie "Hyperlink naar DUTO", geen bron) en de bron bij voorschrift
    3.3, waarvan de reviewer expliciet de volgorde vroeg.
  - **Synoniemen en gerelateerde onderwerpen** volgen de lijsten uit het
    normblad. Norm 5 verliest daarmee zijn sectie, want normblad 7 heeft er
    geen; termen zonder eigen pagina staan als platte tekst.
  - De validator, de unittests, de PDF-export, de training en `CONTRIBUTING.md`
    zijn op het nieuwe formaat gezet. `### <thema>` is optioneel geworden en
    enkelvoudige subkoppen zijn niet langer een fout.
- Thema bijgewerkt naar `hugo-theme-rijksoverheid` v0.2.0. Daarin zitten vijf
  toegankelijkheidsfixes die hier als tijdelijke overrides stonden
  (focusindicatoren in de zoekresultaten, het zoekveld en de footerlinks; het
  contrast van de sneltoetshint; de meldbalk die de focus kon afdekken) plus
  de "naar boven"-knop als theme-component.
- De project-eigen "naar boven"-knop (`layouts/baseof.html`,
  `_partials/terug-naar-boven.html`, `js/back-to-top.js`,
  `css/terug-naar-boven.css`). De knop komt nu uit het thema, aangezet met
  `back_to_top: true`. Daarmee vervalt ook de baseof-shadow. Het thema zet
  geen `scroll-behavior: smooth` meer, dus anchors springen direct.

## [0.2.0] - 2026-08-10

### Toegevoegd

- De normen 2 tot en met 8 zijn volledig uitgewerkt: kern, synoniemen,
  toelichting, voorschriften met criteria en indicatoren, reikwijdte en "Zie
  ook". Tot nu toe stonden daar tijdelijke teksten.
- Nieuwe pagina "Samenhang van de normen", met de uitleg over richten en
  verrichten en de relatie met DUTO. Het diagram van de normen is opnieuw
  ontworpen en staat nu op deze pagina, met de norm Inbeheername en beheer in
  het midden.
- Nieuwe sectie "Onderwerpen en begrippen": een alfabetische index, gegroepeerd
  per beginletter, met een pagina per begrip. Ook passende maatregelen en
  risicobenadering staat hier als onderwerp.
- Begrippenpagina's voor "Applicatie en systeem", "Structuur",
  "Verschijningsvorm" en "Strategisch informatieoverleg (SIO)". Waar de
  normteksten een begrip gebruiken, linken ze naar de begrippenindex of, bij
  een externe bron, naar de kennisbank van het Nationaal Archief.
- PDF downloaden: per norm en voor het hele toetsingskader, in de
  Rijkshuisstijl, met titelpagina, versie en downloaddatum. Elke pagina heeft
  het logo van de Inspectie Overheidsinformatie en Erfgoed (Ministerie van
  Onderwijs, Cultuur en Wetenschap) als briefhoofd; voetnootnummers staan, net
  als op de site, klein en verhoogd.
- Een knop "Terug naar boven" op elke pagina, zichtbaar zodra je meer dan een
  schermhoogte naar beneden bent gescrold. Handig op de lange normpagina's.
- Het versienummer van het toetsingskader staat onderaan elke pagina, naast de
  datum van de laatste wijziging.

### Gewijzigd

- Norm 1 (Inbeheername en beheer) is herzien. De toelichting gaat nu ook in op
  archiveren by design, de koppeling van categorieën aan het selectiebesluit
  en de publicatie van de beheerregeling. De criteria voor passende maatregelen
  gelden voor alle opslagomgevingen en vragen dat de maatregelen actueel zijn
  en worden toegepast. Het strategisch informatieoverleg is een indicator bij
  het voorschrift over de omschrijving van passende maatregelen, en het
  informatiebeheerplan een indicator bij het voorschrift over periodieke
  evaluatie. Migratie, conversie, vervanging en vernietiging horen nu bij de
  beheertaken; opslaan en verwerken binnen de Europese Unie niet meer.
- De kern van de normen 1, 2, 3, 4 en 8 sluit aan op de geactualiseerde
  introductie van het toetsingskader; de oudere formuleringen zijn vervallen.
- Norm 5 heet nu "Informatiebeveiliging en betrouwbaar". De webadressen van de
  normen volgen de nummering en titels uit de introductie van het
  toetsingskader; oude adressen blijven werken.
- Voorschriften zijn per norm genummerd (1.1, 1.2 enzovoort), op de site en in
  de PDF.
- Bij een voorschrift zonder aanvullende criteria of indicatoren staat nu "Bij
  dit voorschrift zijn geen aanvullende criteria" (of indicatoren) in plaats van
  "Niet van toepassing". Dit is een voorlopige formulering.
- De toelichting bij een norm is inklapbaar en staat standaard dicht.
  Toelichting en Referenties zien er hetzelfde uit.
- De koppen in de uitleg van een norm zijn duidelijker: elk voorschrift heeft
  een opvallende kop en de overgang tussen thema's is beter zichtbaar.
- "Over" bestaat nu uit losse pagina's per onderwerp (inleiding, doel,
  wettelijk kader, opbouw en indeling, doelgroep) met de herziene teksten uit
  de introductie. Het overzicht toont ze als tegels, net als het overzicht van
  de normen.
- De homepage heeft een aangepaste tekst over beheer en links naar de
  samenhang van de normen, passende maatregelen en de index. Het diagram van
  de normen staat niet meer op de homepage maar op de pagina over de samenhang.
- De voettekst bevat alleen nog contact, privacy, cookies, toegankelijkheid,
  kwetsbaarheid melden en terug naar de hoofdsite.

### Verwijderd

- Het feedbackblok op de normpagina's.
- De blokken met links naar de secties op de homepage: die boden hetzelfde als
  het hoofdmenu. De tegels "Wat is het?", "Voor wie?", "Wanneer?" en "Waar
  beginnen?" blijven staan.
- De leeswijzer op het overzicht van de normen. Wat een voorschrift, criterium
  en indicator is, staat uitgelegd op de pagina "Opbouw en indeling".

### Opgelost

- Verwijzingen in de normteksten naar "(gecontroleerd) vernietigen" gingen naar
  de norm Betrouwbaar en gaan nu naar de norm Gecontroleerd vernietigen.
  Verwijzingen naar risicobenadering en risicoanalyse gaan naar de pagina
  daarover in plaats van naar het overzicht.
- Voetnoten werken nu ook na een spatie of leesteken en bij een link: de uitleg
  hangt aan het juiste woord, niet meer aan een leeg stukje tekst of een
  leesteken. Een woord dat zowel een link als een voetnoot heeft, is blauw met
  een stippellijn eronder.
- Bij het markeren van zoektermen in de paginatekst blijven links heel.
- "Op deze pagina" laat nu steeds zien in welk deel van de pagina je bent. Bij
  de voorschriften, criteria en indicatoren viel die markering eerder weg.

### Techniek

- Normen hernoemd zodat bestandsnaam, `norm_id` en `norm_titel` overeenkomen
  met de volgorde uit de introductie van het toetsingskader:
  `03-ordeningsstructuur` → `03-ordenen`, `04-metadatering` →
  `04-metadateren`, `06-vernietigen` → `05-betrouwbaar` (titel nu
  "Informatiebeveiliging en betrouwbaar"), `05-vindbaarheid` →
  `06-vindbaar`, `07-informatiebeveiliging` → `07-vernietigen`. Oude URL's
  blijven werken via aliases.
- Sectie "Onderwerpen en begrippen" (`/onderwerpen/`): alfabetische index met
  een pagina per begrip, op basis van het document "Onderwerpen en
  verwijzingen". Eigen A-Z-template, gegroepeerd per beginletter. Passende
  maatregelen en risicobenadering staat hier als een van de onderwerpen.
- PDF-export toegevoegd: downloadbare Rijkshuisstijl-PDF per normpagina en
  voor het hele toetsingskader, met titelpagina, release-tag en
  downloaddatum. Client-side gegenereerd met pdfMake; CSP-veilig. Als
  briefhoofd op elke pagina de volledige logo-lockup: Rijksoverheidslint met
  "Inspectie Overheidsinformatie en Erfgoed" en "Ministerie van Onderwijs,
  Cultuur en Wetenschap". Het lint staat horizontaal gecentreerd en loopt af
  aan de bovenrand van de pagina, zoals de huisstijl voorschrijft.
- Feedback-blok van de normpagina's (de `params.feedback`-config blijft).
- "Op deze pagina"-TOC volgt de actieve sectie nu vloeiend mee; voorheen
  verdween de highlight in de voorschrift-/criteria-/indicator-blokken
  (project-scroll-spy; thema-fix als upstream-PR ingediend).

## [0.1.0] - 2026-06-17

- Normcontent verplaatst van YAML front matter naar markdown-body met
  vaste koppen; bronnen zijn nu standaard markdown-voetnoten. Validator
  en redacteursdocumentatie vernieuwd; training toegevoegd
  (`docs/training-contentbeheer.html`).
- Eerste versie van het Toetsingskader Archiefwet als publieke Hugo-site.

[Unreleased]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v1.0.2
[1.0.1]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v1.0.1
[1.0.0]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v1.0.0
[0.3.1]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.3.1
[0.2.9]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.9
[0.2.8]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.8
[0.2.7]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.7
[0.2.6]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.6
[0.2.5]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.5
[0.2.4]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.4
[0.2.3]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.3
[0.2.2]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.2
[0.2.1]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.1
[0.2.0]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.2.0
[0.1.0]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.1.0
