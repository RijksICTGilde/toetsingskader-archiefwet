# Tekstcontrole normbladen 4e iteratie

Vergelijkt elke inhoudelijke alinea uit de normbladen met de sitecontent en
classificeert het verschil. Eenmalig gegenereerd met een script dat daarna is
verwijderd; de normalisatie raakte alleen opmaak (typografische
aanhalingstekens en streepjes, harde spaties, witruimte), nooit de woorden
zelf. Dit rapport is dus een momentopname bij de 4e iteratie, geen check die
meeloopt.

Vier uitkomsten:

- **Letterlijk** — de alinea staat woord voor woord in de content.
- **Alleen `<<…>>`** — identiek, op de verwijzingsmarkering van het normblad na.
  Die markering is bedoeld als aanwijzing voor een link en hoort niet in de
  lopende tekst; dit is dus geen tekstverschil.
- **Voorschrift-vorm** — de site zet "De Inspectie toetst of …" voor de zin uit
  het normblad. Dat is een bewuste, sitebrede formulering van de voorschriften.
- **Woordverschil** / **Niet gevonden** — hier wijkt de tekst echt af, of staat
  hij nergens. Dit zijn de regels om na te lopen.

De conclusie hieronder is met de hand getrokken uit die laatste twee categorieën.


## Conclusie

**Nee, niet alles staat er woord voor woord — maar er is geen tekst
weggevallen en geen betekenis veranderd.**

Van de oorspronkelijke veertien meldingen "Niet gevonden" was er één echt: het
derde criterium bij het eerste voorschrift van normblad 5 stond niet op de site.
Dat is toegevoegd. De overige dertien zijn vals alarm. Vijf ervan zijn
plaatsingsinstructies uit het Word-bestand ("NB: dit document bevat stukken
tekst die …", "Inleiding -> andere naam voor het kopje") en horen niet op de
site. De andere acht staan er wel, alleen niet in het bestand waar het script
zocht of niet in dezelfde bewoording:

| Normblad-alinea | Staat op |
|---|---|
| "Een document is in beheer … gehouden kan worden" | `content/normen/_index.md` |
| "… in ieder geval per categorie documenten, een omschrijving …" | `content/normen/01-beheer.md` |
| "Het overzicht bevat, in het geval … meerdere ordeningsstructuren …" | `content/normen/02-overzicht.md` |
| "Het archiefbeheer wordt … periodiek geëvalueerd …" | `kern` van `content/normen/08-periodieke-evaluatie.md` |
| "Het toetsingskader omvat momenteel de onderwerpen … wit gearceerde …" | `content/samenhang.md` (herschreven naar het bollendiagram) |
| "Dat documenten in beheer moeten zijn, is het fundament …" | `content/samenhang.md` |
| "Het overzicht is te vinden op de website van de Inspectie …" | `content/over/doelgroep.md` |
| "Algemene introductie - Toetsingskader overheidsinformatie …" | is een kop, geen lopende tekst |

De 55 resterende woordverschillen vallen uiteen in vier groepen:

1. **Correcties op het normblad (28)** — de site schrijft het goed waar het
   normblad een fout heeft: "emailapplicaties" → "e-mailapplicaties",
   "maateregelen" → "maatregelen", "informatie overleg" → "informatieoverleg",
   "plaats vond" → "plaatsvond", "Tenminste" → "Ten minste", "gebruik gemaakt"
   → "gebruikgemaakt", "Archiefwet-en" → "Archiefwet- en", "artikel 1.1." →
   "1.1", en het ontbrekende haakje in "(digitaal of papier.". Ook
   congruentiefouten: "metadata wordt" → "metadata worden", "de inhoud …
   zijn" → "is". Letterlijk overnemen zou hier de fout overnemen.
2. **Voorschrift-vorm (13)** — de site zet "De Inspectie toetst of …" voor de
   normbladzin en verplaatst daarvoor het werkwoord. Sitebrede afspraak; het
   script vangt de meeste hiervan al apart af (kolom "Voorschrift-vorm"), deze
   dertien vallen alleen op doordat de woordvolgorde te ver verschuift.
3. **Afkortingen en verwijzingen voluit (13)** — "Ar" → "Archiefregeling",
   "SIO" → "strategisch informatieoverleg (SIO)", "WOO" → "Woo", "etc." →
   "enzovoorts", en `<<…>>`-markeringen die een link of een volzin zijn
   geworden ("technisch vernietigen (buiten scope, volgt op een later moment)"
   → "Technisch vernietigen valt op dit moment buiten de reikwijdte …").
4. **Redactionele keuze (1)** — `08-periodieke-evaluatie.md` somt de normen op
   in de sitenaamgeving ("informatiebeveiliging en betrouwbaarheid",
   "gecontroleerd vernietigen") in plaats van die van het normblad
   ("Informatiebeveiliging", "Vernietiging"). Bewust zo gelaten: de site voert
   die namen overal.

De andere redactionele keuzes zijn wél teruggedraaid naar de brontekst: de
toegevoegde DUTO-zin in `01-beheer.md` is verwijderd, "zwaarder beheer" in
`02-overzicht.md` is weer "zwaarder (archief)beheer", `06-vindbaar.md` schrijft
weer "functie/rol" en heeft het ontbrekende derde criterium terug, en
`over/opbouw-en-indeling.md` heeft de zin "In dit toetsingskader wordt
onderscheid gemaakt tussen voorschriften, criteria en indicatoren" weer
letterlijk.

Eén valkuil in het rapport zelf: bij normblad 4 lijken drie voorschriften tot
één te zijn samengevat, doordat het script per alinea de best gelijkende
passage toont. Dat is niet zo — `04-metadateren.md` heeft ze alle drie, mét het
onderscheid tussen "is minimaal het volgende … vastgelegd", "is … vastgelegd"
en "kan … worden vastgelegd".


## Normbladen 1 t/m 8

| Normblad | Letterlijk | Alleen `<<…>>` | Voorschrift-vorm | Woordverschil | Niet gevonden |
|---|---:|---:|---:|---:|---:|
| 1) Normanalyse beheer | 16 | 10 | 4 | 7 | 2 |
| 2) Normanalyse overzicht | 15 | 5 | 0 | 9 | 1 |
| 3) Normanalyse ordeningsstructuur | 9 | 2 | 1 | 3 | 0 |
| 4) Normanalyse metadatering | 23 | 2 | 1 | 12 | 0 |
| 5) Normanalyse vindbaarheid | 12 | 3 | 3 | 1 | 0 |
| 6) Normanalyse vernietigen | 17 | 5 | 4 | 8 | 0 |
| 7) Normanalyse Informatiebeveiliging | 12 | 4 | 0 | 4 | 0 |
| 8) Normanalyse periodieke evaluatie | 10 | 1 | 2 | 5 | 1 |

### 1) Normanalyse beheer → `content/normen/01-beheer.md`

- **Woordverschil** (100%): normblad **emailapplicaties.**; site **e-mailapplicaties.**
  - normblad: "De passende maatregelen zijn van toepassing op alle omgevingen waarin overheidsinformatie wordt opgeslagen. Denk hierbij aan bijvoorbeeld documentmanagementsystemen, maar ook back-ups, cloudomgevingen, samenwerkingsruimtes en emailapplicaties."
  - site: "De passende maatregelen zijn van toepassing op alle omgevingen waarin overheidsinformatie wordt opgeslagen. Denk hierbij aan bijvoorbeeld documentmanagementsystemen, maar ook back-ups, cloudomgevingen, samenwerkingsruimtes en e-mailapplicaties."
- **Woordverschil** (100%): normblad **informatie overleg**; site **informatieoverleg**
  - normblad: "In een strategisch informatie overleg (SIO), of een soortgelijk overleg, worden keuzes gemaakt over het ontwerp en de inrichting van de informatiehuishouding die van invloed zijn op de duurzame toegankelijkheid van documenten."
  - site: "In een strategisch informatieoverleg (SIO), of een soortgelijk overleg, worden keuzes gemaakt over het ontwerp en de inrichting van de informatiehuishouding die van invloed zijn op de duurzame toegankelijkheid van documenten."
- **Woordverschil** (98%): normblad **functies/rollen**; site **functies of rollen**; normblad **beheertaken**; site **beheertaken,**
  - normblad: "In de beheerregels staan de dienstonderdelen en de verantwoordelijke functies/rollen die belast zijn met de beheertaken op zowel sturingsniveau als uitvoeringsniveau."
  - site: "In de beheerregels staan de dienstonderdelen en de verantwoordelijke functies of rollen die belast zijn met de beheertaken, op zowel sturingsniveau als uitvoeringsniveau."
- **Woordverschil** (88%): normblad **Het**; site **De Inspectie toetst of het**; site **inzichtelijk**; normblad **inzichtelijk**; normblad **heeft**; site **toetst**; normblad **organisatie**; site **Inspectie of**; site **is**
  - normblad: "Het verantwoordelijke overheidsorgaan heeft inzichtelijk welke categorieën documenten gemigreerd, geconverteerd of vervangen moeten worden. Alleen wanneer dergelijke categorieën bestaan, heeft de organisatie in de beheerregels een omschrijving opgenomen van de passende maatregelen voor migratie, conversie en vervanging."
  - site: "De Inspectie toetst of het verantwoordelijke overheidsorgaan inzichtelijk heeft welke categorieën documenten gemigreerd, geconverteerd of vervangen moeten worden. Alleen wanneer dergelijke categorieën bestaan, toetst de Inspectie of in de beheerregels een omschrijving is opgenomen van de passende maatregelen voor migratie, conversie en vervanging."
- **Woordverschil** (78%): normblad **Het**; site **De Inspectie toetst of het**; normblad **heeft**; site **heeft**
  - normblad: "Het verantwoordelijke overheidsorgaan heeft alle opgemaakte en ontvangen documenten opgenomen in een beheerde omgeving, waar zij duurzaam toegankelijk worden gemaakt en gehouden tot het moment van overbrenging of vernietiging."
  - site: "De Inspectie toetst of het verantwoordelijke overheidsorgaan alle opgemaakte en ontvangen documenten heeft opgenomen in een beheerde omgeving, waar zij duurzaam toegankelijk worden gemaakt en gehouden tot het moment van overbrenging of vernietiging."
- **Woordverschil** (70%): normblad **Het verantwoordelijk**; site **De Inspectie toetst of het verantwoordelijke**; normblad **heeft**; site **een**; site **heeft**
  - normblad: "Het verantwoordelijk overheidsorgaan heeft in de beheerregels nadere omschrijving opgenomen over de wijze waarop het archiefbeheer van documenten <<periodiek>> wordt geëvalueerd, onderzocht en indien nodig bijgesteld."
  - site: "De Inspectie toetst of het verantwoordelijke overheidsorgaan in de beheerregels een nadere omschrijving heeft opgenomen over de wijze waarop het archiefbeheer van documenten periodiek wordt geëvalueerd, onderzocht en indien nodig bijgesteld."
- **Woordverschil** (65%): normblad **worden, en hiervoor**; site **worden; daarvoor**; normblad **beschreven zijn**; normblad **'document'.**; site **document beschreven zijn.**
  - normblad: "De beheerregeling moet samen met de omschrijving van de passende maatregelen worden gepubliceerd. Vervolgens moeten de passende maatregelen getroffen worden, en hiervoor moeten deze passende maatregelen in ieder geval beschreven zijn in een 'document'."
  - site: "De beheerregeling moet samen met de omschrijving van de passende maatregelen worden gepubliceerd. Vervolgens moeten de passende maatregelen getroffen worden; daarvoor moeten deze passende maatregelen in ieder geval in een document beschreven zijn."
- **Niet gevonden**: "Een document is in beheer van het verantwoordelijke overheidsorgaan zodat het duurzaam toegankelijk gemaakt en gehouden kan worden."
- **Niet gevonden**: "Het verantwoordelijk overheidsorgaan heeft in de beheerregels, in ieder geval per categorie documenten, een omschrijving opgenomen van de passende maatregelen die het verantwoordelijke overheidsorgaan neemt om de documenten:"

### 2) Normanalyse overzicht → `content/normen/02-overzicht.md`

- **Woordverschil** (100%): normblad **WOO,**; site **de Woo,**; normblad **WOO**; site **Woo**
  - normblad: "Ook voor andere wetgeving, zoals de AVG en WOO, is een overzicht essentieel. Het overzicht draagt bij aan de vindbaarheid van documenten, waardoor de termijnen van de WOO (beter) kunnen worden gehaald. Een overzicht van de informatiehuishouding volgens de Archiefregeling is niet hetzelfde als een verwerkingsregister, zoals is vereist op grond van de AVG. Dit instrument dient een ander doel, al draagt het AVG-verwerkingsregister wel bij aan het overzicht."
  - site: "Ook voor andere wetgeving, zoals de AVG en de Woo, is een overzicht essentieel. Het overzicht draagt bij aan de vindbaarheid van documenten, waardoor de termijnen van de Woo (beter) kunnen worden gehaald. Een overzicht van de informatiehuishouding volgens de Archiefregeling is niet hetzelfde als een verwerkingsregister, zoals is vereist op grond van de AVG. Dit instrument dient een ander doel, al draagt het AVG-verwerkingsregister wel bij aan het overzicht."
- **Woordverschil** (100%): normblad **de**
  - normblad: "Er is een procedure vastgelegd om het overzicht bij te werken bij wijzigingen in de informatiehuishouding. Voorbeelden van dit soort wijzigingen zijn de veranderingen van de organisatie, reorganisatie van taken, nieuwe of vervallen taken, overdracht, uitlening van archieven, nieuwe of uitgefaseerde cloudomgevingen, netwerkschijven, samenwerkingsruimtes of applicaties."
  - site: "Er is een procedure vastgelegd om het overzicht bij te werken bij wijzigingen in de informatiehuishouding. Voorbeelden van dit soort wijzigingen zijn veranderingen van de organisatie, reorganisatie van taken, nieuwe of vervallen taken, overdracht, uitlening van archieven, nieuwe of uitgefaseerde cloudomgevingen, netwerkschijven, samenwerkingsruimtes of applicaties."
- **Woordverschil** (100%): normblad **1.1.**; site **1.1**
  - normblad: "De juiste definitie van overheidsinformatie (conform artikel 1.1. van de Archiefwet) wordt gebruikt voor het overzicht."
  - site: "De juiste definitie van overheidsinformatie (conform artikel 1.1 van de Archiefwet) wordt gebruikt voor het overzicht."
- **Woordverschil** (97%): normblad **etc.**; site **enzovoorts.**
  - normblad: "Het overzicht bevat alle overheidsinformatie, dus databestanden, gegevensverzamelingen, websites, sociale media, applicaties, netwerklocaties, etc."
  - site: "Het overzicht bevat alle overheidsinformatie, dus databestanden, gegevensverzamelingen, websites, sociale media, applicaties, netwerklocaties, enzovoorts."
- **Woordverschil** (97%): normblad **Dit**; site **Het**
  - normblad: "Dit overzicht bevat, indien van toepassing, de vindplaats van:"
  - site: "Het overzicht bevat, indien van toepassing, de vindplaats van:"
- **Woordverschil** (79%): normblad **Het**; site **De Inspectie toetst of het**; normblad **geeft**; normblad **weer.**; site **weergeeft.**
  - normblad: "Het overzicht geeft de samenhang tussen (categorieën) documenten weer."
  - site: "De Inspectie toetst of het overzicht de samenhang tussen (categorieën) documenten weergeeft."
- **Woordverschil** (77%): normblad **Het verantwoordelijke overheidsorgaan heeft**; site **De Inspectie toetst of het overzicht**; site **bevat**; normblad **documenten bevat.**; site **documenten.**
  - normblad: "Het verantwoordelijke overheidsorgaan heeft een omschrijving van de <<taken>> van het verantwoordelijke overheidsorgaan en van de daarbij behorende documenten bevat."
  - site: "De Inspectie toetst of het overzicht een omschrijving bevat van de taken van het verantwoordelijke overheidsorgaan en van de daarbij behorende documenten."
- **Woordverschil** (77%): normblad **Het**; site **De Inspectie toetst of het**; normblad **heeft**; site **heeft.**
  - normblad: "Het verantwoordelijke overheidsorgaan heeft een actueel overzicht"
  - site: "De Inspectie toetst of het verantwoordelijke overheidsorgaan een actueel overzicht heeft."
- **Woordverschil** (77%): normblad **Het**; site **De Inspectie toetst of het**; normblad **bevat**; normblad **documenten.**; site **documenten bevat.**
  - normblad: "Het overzicht bevat de vindplaats van (categorieën) documenten."
  - site: "De Inspectie toetst of het overzicht de vindplaats van (categorieën) documenten bevat."
- **Niet gevonden**: "Het overzicht bevat, in het geval een verantwoordelijke overheidsorgaan beschikt over meerdere ordeningsstructuren, een beschrijving van deze ordeningsstructuren, de wijze waarop zij worden toegepast en een beschrijving van de onderlinge relaties tussen de toegepaste ordeningsstructuren."

### 3) Normanalyse ordeningsstructuur → `content/normen/03-ordenen.md`

- **Woordverschil** (99%): normblad **Tenminste**; site **Ten minste**
  - normblad: "Tenminste één ordeningsstructuur komt overeen met de structuur in het selectiebesluit."
  - site: "Ten minste één ordeningsstructuur komt overeen met de structuur in het selectiebesluit."
- **Woordverschil** (93%): normblad **(werkproces:**; site **Een werkproces is een**; normblad **taak)**; site **taak.**
  - normblad: "(werkproces: samenhangend geheel van stappen en procedures in het kader van de uitvoering van een taak)"
  - site: "Een werkproces is een samenhangend geheel van stappen en procedures in het kader van de uitvoering van een taak."
- **Woordverschil** (92%): site **te**; normblad **tenminste**; site **ten minste**; normblad **(bijvoorbeeld**; site **vastgestelde ordeningsstructuur, bijvoorbeeld**; normblad **SIO) vastgestelde ordeningsstructuur,**; site **strategisch informatieoverleg (SIO),**
  - normblad: "Om documenten duurzaam toegankelijk te maken en houden is het van belang dat deze zijn gekoppeld aan een ordening. Een geordend archief is onder andere belangrijk voor het uitvoeren van beheertaken als het selecteren, <<vernietigen>> en overdragen van documenten. Het verantwoordelijke overheidsorgaan beschikt over tenminste één door de organisatie (bijvoorbeeld in een SIO) vastgestelde ordeningsstructuur, die aansluit bij de taken en werkprocessen van het verantwoordelijke overheidsorgaan. Daarnaast mogen aanvullende ordeningen bestaan, die niet hoeven aan te sluiten bij de taken en werkprocessen. Dit mogen bijvoorbeeld cliëntgerichte, locatiegerichte of objectgerichte ordeningsstructuren zijn. Voor specifieke verschijningsvormen van documenten, denk aan e-mail of websites, zijn aanvullende ordeningen mogelijk."
  - site: "Om documenten duurzaam toegankelijk te maken en te houden is het van belang dat deze zijn gekoppeld aan een ordening. Een geordend archief is onder andere belangrijk voor het uitvoeren van beheertaken als het selecteren, vernietigen en overdragen van documenten. Het verantwoordelijke overheidsorgaan beschikt over ten minste één door de organisatie vastgestelde ordeningsstructuur, bijvoorbeeld in een strategisch informatieoverleg (SIO), die aansluit bij de taken en werkprocessen van het verantwoordelijke overheidsorgaan. Daarnaast mogen aanvullende ordeningen bestaan, die niet hoeven aan te sluiten bij de taken en werkprocessen. Dit mogen bijvoorbeeld cliëntgerichte, locatiegerichte of objectgerichte ordeningsstructuren zijn. Voor specifieke verschijningsvormen van documenten, denk aan e-mail of websites, zijn aanvullende ordeningen mogelijk."

### 4) Normanalyse metadatering → `content/normen/04-metadateren.md`

- **Woordverschil** (100%): normblad **moet**; site **moeten**
  - normblad: "De vereiste metadata worden zo snel mogelijk na creatie of ontvangst vastgelegd bij documenten. Bij wijzigingen of creatie van nieuwe metadata moet deze ook zo snel mogelijk worden toegevoegd aan de documenten."
  - site: "De vereiste metadata worden zo snel mogelijk na creatie of ontvangst vastgelegd bij documenten. Bij wijzigingen of creatie van nieuwe metadata moeten deze ook zo snel mogelijk worden toegevoegd aan de documenten."
- **Woordverschil** (100%): normblad **moet**; site **moeten**
  - normblad: "De vereiste metadata worden zo snel mogelijk na creatie of ontvangst vastgelegd bij documenten. Bij wijzigingen of creatie van nieuwe metadata moet deze ook zo snel mogelijk worden toegevoegd aan de documenten."
  - site: "De vereiste metadata worden zo snel mogelijk na creatie of ontvangst vastgelegd bij documenten. Bij wijzigingen of creatie van nieuwe metadata moeten deze ook zo snel mogelijk worden toegevoegd aan de documenten."
- **Woordverschil** (99%): normblad **metadataschema:**; site **metadataschema.**
  - normblad: "Over te brengen documenten zijn, uiterlijk voorafgaand aan overbrenging, voorzien van de volgende metadata die zijn vastgelegd in een metadataschema:"
  - site: "Over te brengen documenten zijn, uiterlijk voorafgaand aan overbrenging, voorzien van de volgende metadata die zijn vastgelegd in een metadataschema."
- **Woordverschil** (99%): normblad **metadataschema:**; site **metadataschema.**
  - normblad: "Digitale documenten met een bewaartermijn langer dan tien jaar zijn voorzien van de volgende metadata die zijn vastgelegd in een metadataschema:"
  - site: "Digitale documenten met een bewaartermijn langer dan tien jaar zijn voorzien van de volgende metadata die zijn vastgelegd in een metadataschema."
- **Woordverschil** (99%): normblad **metadataschema:**; site **metadataschema.**
  - normblad: "Alle documenten, ongeacht de bewaartermijn, zijn voorzien van de volgende metadata die zijn vastgelegd in een metadataschema:"
  - site: "Alle documenten, ongeacht de bewaartermijn, zijn voorzien van de volgende metadata die zijn vastgelegd in een metadataschema."
- **Woordverschil** (99%): normblad **wordt**; site **worden**
  - normblad: "De vereiste metadata wordt toegevoegd aan documenten, voordat die worden overgebracht naar een archiefbewaarplaats."
  - site: "De vereiste metadata worden toegevoegd aan documenten, voordat die worden overgebracht naar een archiefbewaarplaats."
- **Woordverschil** (98%): normblad **wordt**; site **worden**
  - normblad: "Metadata wordt zoveel mogelijk automatisch toegekend aan documenten."
  - site: "Metadata worden zoveel mogelijk automatisch toegekend aan documenten."
- **Woordverschil** (95%): normblad **wordt**; site **worden**; normblad **als**
  - normblad: "Metadata wordt zoveel als mogelijk automatisch toegekend aan documenten."
  - site: "Metadata worden zoveel mogelijk automatisch toegekend aan documenten."
- **Woordverschil** (95%): normblad **wordt**; site **worden**; normblad **als**
  - normblad: "Metadata wordt zoveel als mogelijk automatisch toegekend aan documenten."
  - site: "Metadata worden zoveel mogelijk automatisch toegekend aan documenten."
- **Woordverschil** (86%): normblad **Van**; site **De Inspectie toetst of van**; normblad **is**; site **is vastgelegd**; normblad **behoort) vastgelegd:**; site **behoort):**
  - normblad: "Van ieder document is in de metadata (bij het document, of op het niveau van zaak, proces, bestand, dossier, database of dataset waartoe het document behoort) vastgelegd:"
  - site: "De Inspectie toetst of van ieder document in de metadata is vastgelegd (bij het document, of op het niveau van zaak, proces, bestand, dossier, database of dataset waartoe het document behoort):"
- **Woordverschil** (84%): normblad **Van**; site **De Inspectie toetst of van**; normblad **kan**; site **is vastgelegd**; normblad **behoort) worden vastgelegd:**; site **behoort):**
  - normblad: "Van ieder document kan in de metadata (bij het document, of op het niveau van zaak, proces, bestand, dossier, database of dataset waartoe het document behoort) worden vastgelegd:"
  - site: "De Inspectie toetst of van ieder document in de metadata is vastgelegd (bij het document, of op het niveau van zaak, proces, bestand, dossier, database of dataset waartoe het document behoort):"
- **Woordverschil** (81%): normblad **Van**; site **De Inspectie toetst of van**; normblad **is minimaal het volgende**; site **is vastgelegd**; normblad **behoort) vastgelegd:**; site **behoort):**
  - normblad: "Van ieder document is minimaal het volgende in de metadata (bij het document, of op het niveau van zaak, proces, bestand, dossier, database of dataset waartoe het document behoort) vastgelegd:"
  - site: "De Inspectie toetst of van ieder document in de metadata is vastgelegd (bij het document, of op het niveau van zaak, proces, bestand, dossier, database of dataset waartoe het document behoort):"

### 5) Normanalyse vindbaarheid → `content/normen/06-vindbaar.md`

- **Woordverschil** (76%): normblad **Indicatoren:Gebruikers met een vastgestelde bevoegdheid kunnen documenten (terug)vinden.**
  - normblad: "De organisatie hanteert interne normen of afspraken over de (maximale) tijd waarbinnen bevoegde gebruikers documenten moeten kunnen terugvinden. Indicatoren:Gebruikers met een vastgestelde bevoegdheid kunnen documenten (terug)vinden."
  - site: "De organisatie hanteert interne normen of afspraken over de (maximale) tijd waarbinnen bevoegde gebruikers documenten moeten kunnen terugvinden."

### 6) Normanalyse vernietigen → `content/normen/07-vernietigen.md`

- **Woordverschil** (100%): normblad **emailapplicaties.**; site **e-mailapplicaties.**
  - normblad: "De passende maatregelen zijn van toepassing op alle omgevingen waarin te vernietigen documenten worden opgeslagen. Denk hierbij aan bijvoorbeeld documentmanagementsystemen, maar ook back-ups, cloudomgevingen, samenwerkingsruimtes en emailapplicaties."
  - site: "De passende maatregelen zijn van toepassing op alle omgevingen waarin te vernietigen documenten worden opgeslagen. Denk hierbij aan bijvoorbeeld documentmanagementsystemen, maar ook back-ups, cloudomgevingen, samenwerkingsruimtes en e-mailapplicaties."
- **Woordverschil** (100%): normblad **papier.**; site **papier).**
  - normblad: "De eisen voor vernietiging gelden voor alle tijdelijk te bewaren documenten van alle organisatieonderdelen van het verantwoordelijke overheidsorgaan, ongeacht de vorm (digitaal of papier."
  - site: "De eisen voor vernietiging gelden voor alle tijdelijk te bewaren documenten van alle organisatieonderdelen van het verantwoordelijke overheidsorgaan, ongeacht de vorm (digitaal of papier)."
- **Woordverschil** (100%): normblad **verantwoordelijk**; site **verantwoordelijke**
  - normblad: "deze alleen vernietigd mogen worden als hiervoor een grondslag bestaat in een selectiebesluit van het verantwoordelijk overheidsorgaan;"
  - site: "deze alleen vernietigd mogen worden als hiervoor een grondslag bestaat in een selectiebesluit van het verantwoordelijke overheidsorgaan;"
- **Woordverschil** (99%): normblad **plaats vond;**; site **plaatsvond;**
  - normblad: "een opsomming van de systemen waarin de vernietiging van digitale documenten plaats vond;"
  - site: "een opsomming van de systemen waarin de vernietiging van digitale documenten plaatsvond;"
- **Woordverschil** (99%): normblad **overheidsorgaan;**; site **overheidsorgaan.**
  - normblad: "Documenten worden alleen vernietigd als hiervoor een grondslag bestaat in een selectiebesluit van het verantwoordelijke overheidsorgaan;"
  - site: "Documenten worden alleen vernietigd als hiervoor een grondslag bestaat in een selectiebesluit van het verantwoordelijke overheidsorgaan."
- **Woordverschil** (96%): site **hoeven**; normblad **hoeven**
  - normblad: "deze niet meegenomen te hoeven worden in de procesbeschrijving voor vernietiging;"
  - site: "deze niet meegenomen hoeven te worden in de procesbeschrijving voor vernietiging;"
- **Woordverschil** (83%): normblad **Het**; site **De Inspectie toetst of het**; normblad **beschrijft**; normblad **zaken:**; site **zaken beschrijft:**
  - normblad: "Het verantwoordelijke overheidsorgaan beschrijft in de procesbeschrijving van vernietiging in ieder geval de volgende zaken:"
  - site: "De Inspectie toetst of het verantwoordelijke overheidsorgaan in de procesbeschrijving van vernietiging in ieder geval de volgende zaken beschrijft:"
- **Woordverschil** (64%): normblad **technisch**; site **Technisch**; normblad **(buiten scope,**; site **valt op dit moment buiten de reikwijdte van het toetsingskader en**; normblad **moment)**; site **moment.**
  - normblad: "<<technisch vernietigen>> (buiten scope, volgt op een later moment)"
  - site: "Technisch vernietigen valt op dit moment buiten de reikwijdte van het toetsingskader en volgt op een later moment."

### 7) Normanalyse Informatiebeveiliging → `content/normen/05-betrouwbaar.md`

- **Woordverschil** (100%): normblad **maateregelen**; site **maatregelen**
  - normblad: "Om documenten duurzaam toegankelijk te maken en te houden moeten deze betrouwbaar zijn. De Inspectie beoordeelt <<informatiebeveiliging>> in het kader van duurzame toegankelijkheid primair vanuit de verantwoordelijkheid en inspanningsverplichting van het overheidsorgaan. Daarbij kijkt de Inspectie of verantwoordelijke overheidsorganen passende maateregelen nemen op het gebied van informatiebeveiliging die zijn afgestemd op de risico's, het gebruik en de levensduur van de documenten en of zij erop zijn gericht om de authenticiteit, volledigheid en beschikbaarheid van documenten te borgen. De Inspectie richt zich niet op de technische kant van informatiebeveiliging."
  - site: "Om documenten duurzaam toegankelijk te maken en te houden moeten deze betrouwbaar zijn. De Inspectie beoordeelt informatiebeveiliging in het kader van duurzame toegankelijkheid primair vanuit de verantwoordelijkheid en inspanningsverplichting van het overheidsorgaan. Daarbij kijkt de Inspectie of verantwoordelijke overheidsorganen passende maatregelen nemen op het gebied van informatiebeveiliging die zijn afgestemd op de risico's, het gebruik en de levensduur van de documenten en of zij erop zijn gericht om de authenticiteit, volledigheid en beschikbaarheid van documenten te borgen. De Inspectie richt zich niet op de technische kant van informatiebeveiliging."
- **Woordverschil** (100%): normblad **gebruik gemaakt**; site **gebruikgemaakt**
  - normblad: "Er wordt gebruik gemaakt van een hashfunctie voor de controleerbaarheid van de integriteit van digitale documenten."
  - site: "Er wordt gebruikgemaakt van een hashfunctie voor de controleerbaarheid van de integriteit van digitale documenten."
- **Woordverschil** (99%): normblad **zijn**; site **is**
  - normblad: "Het verantwoordelijke overheidsorgaan beheert de door hem opgemaakte of ontvangen documenten op zodanige wijze dat de inhoud van documenten betrouwbaar, volledig en beveiligd zijn en documenten geen 'aanmerkelijke' digitale achteruitgang of informatieverlies ondervinden gedurende hun bewaartermijn, óók wanneer incidenten zich voordoen. Daarnaast mogen documenten niet ongecontroleerd gewijzigd worden en moeten deze volledig zijn."
  - site: "Het verantwoordelijke overheidsorgaan beheert de door hem opgemaakte of ontvangen documenten op zodanige wijze dat de inhoud van documenten betrouwbaar, volledig en beveiligd is en documenten geen 'aanmerkelijke' digitale achteruitgang of informatieverlies ondervinden gedurende hun bewaartermijn, óók wanneer incidenten zich voordoen. Daarnaast mogen documenten niet ongecontroleerd gewijzigd worden en moeten deze volledig zijn."
- **Woordverschil** (77%): normblad **Beveiligingsmaatregelen**; site **De Inspectie toetst of de beveiligingsmaatregelen**; site **zijn**; site **zijn**
  - normblad: "Beveiligingsmaatregelen passend en afgestemd op de risico's."
  - site: "De Inspectie toetst of de beveiligingsmaatregelen passend zijn en zijn afgestemd op de risico's."

### 8) Normanalyse periodieke evaluatie → `content/normen/08-periodieke-evaluatie.md`

- **Woordverschil** (99%): site **te**; normblad **er**
  - normblad: "Om documenten duurzaam toegankelijk te maken en houden wordt er met een periodieke evaluatie getoetst in hoeverre het archiefbeheer voldoet aan de kwaliteitseisen voor <<duurzame toegankelijkheid>>. De beheerregels moeten ten minste omschrijven welke overheidsorganen of dienstonderdelen zijn belast met het feitelijk beheer van documenten en op welke wijze de periodieke evaluatie van het archiefbeheer plaatsvindt."
  - site: "Om documenten duurzaam toegankelijk te maken en te houden wordt met een periodieke evaluatie getoetst in hoeverre het archiefbeheer voldoet aan de kwaliteitseisen voor duurzame toegankelijkheid. De beheerregels moeten ten minste omschrijven welke overheidsorganen of dienstonderdelen zijn belast met het feitelijk beheer van documenten en op welke wijze de periodieke evaluatie van het archiefbeheer plaatsvindt."
- **Woordverschil** (99%): normblad **verbeterplannen en**; site **verbeterplannen,**
  - normblad: "De organisatie monitort de voortgang van de verbeterplannen en rapporteert hierover op het juiste managementniveau en stuurt waar nodig proactief bij."
  - site: "De organisatie monitort de voortgang van de verbeterplannen, rapporteert hierover op het juiste managementniveau en stuurt waar nodig proactief bij."
- **Woordverschil** (90%): normblad **SIO**; site **strategisch informatieoverleg (SIO)**
  - normblad: "De verbeterplannen worden op het juiste managementniveau in de organisatie vastgesteld, bijvoorbeeld in het SIO of een soortgelijk overleg."
  - site: "De verbeterplannen worden op het juiste managementniveau in de organisatie vastgesteld, bijvoorbeeld in het strategisch informatieoverleg (SIO) of een soortgelijk overleg."
- **Woordverschil** (84%): normblad **Het verantwoordelijk**; site **De Inspectie toetst of het verantwoordelijke**; normblad **evalueert**; site **evalueert**; normblad **planning**; site **planning-**; normblad **control cyclus.**; site **controlcyclus.**
  - normblad: "Het verantwoordelijk overheidsorgaan evalueert het archiefbeheer periodiek (minimaal tweejaarlijks) met een <<planning en control cyclus>>."
  - site: "De Inspectie toetst of het verantwoordelijke overheidsorgaan het archiefbeheer periodiek (minimaal tweejaarlijks) evalueert met een planning- en controlcyclus."
- **Woordverschil** (76%): site **de**; normblad **Beheer, Overzicht, Ordening, Metadata, Vindbaarheid, Vernietiging, Informatiebeveiliging.**; site **beheer, overzicht, ordenen, metadateren, informatiebeveiliging en betrouwbaarheid, vindbaarheid en gecontroleerd vernietigen.**
  - normblad: "Het verantwoordelijke overheidsorgaan heeft toetsbare doelstellingen vastgelegd bij voorschriften over <<Beheer>>, <<Overzicht>>, <<Ordening>>, <<Metadata>>, <<Vindbaarheid>>, <<Vernietiging>>, <<Informatiebeveiliging>>."
  - site: "Het verantwoordelijke overheidsorgaan heeft toetsbare doelstellingen vastgelegd bij de voorschriften over beheer, overzicht, ordenen, metadateren, informatiebeveiliging en betrouwbaarheid, vindbaarheid en gecontroleerd vernietigen."
- **Niet gevonden**: "Het archiefbeheer wordt door het verantwoordelijke overheidsorgaan periodiek geëvalueerd op basis van de kwaliteitseisen voor <<duurzame toegankelijkheid>>. Tijdens een periodieke evaluatie wordt gekeken naar de passende maatregelen en alle beheertaken die bijdragen aan de duurzame toegankelijkheid. De periodieke evaluatie vindt plaats door middel van een <<planning en control cyclus>>."

## Introductie en Onderwerpen (gezocht in alle contentbestanden)

| Normblad | Letterlijk | Alleen `<<…>>` | Voorschrift-vorm | Woordverschil | Niet gevonden |
|---|---:|---:|---:|---:|---:|
| 0) Introductie toetsingskader | 33 | 9 | 0 | 4 | 9 |
| 9) Onderwerpen en Verwijzingen | 15 | 0 | 0 | 2 | 0 |

### 0) Introductie toetsingskader → `de hele contentboom`

- **Woordverschil** (100%): normblad **planning**; site **planning-**; normblad **control cyclus.**; site **controlcyclus.**
  - normblad: "Het archiefbeheer wordt periodiek geëvalueerd op basis van de kwaliteitseisen voor <<duurzame toegankelijkheid>>. Tijdens een periodieke evaluatie wordt gekeken naar de passende maatregelen en alle beheertaken die bijdragen aan de duurzame toegankelijkheid. De periodieke evaluatie vindt plaats door middel van een <<planning en control cyclus>>."
  - site: "Het archiefbeheer wordt periodiek geëvalueerd op basis van de kwaliteitseisen voor duurzame toegankelijkheid. Tijdens een periodieke evaluatie wordt gekeken naar de passende maatregelen en alle beheertaken die bijdragen aan de duurzame toegankelijkheid. De periodieke evaluatie vindt plaats door middel van een planning- en controlcyclus."
- **Woordverschil** (100%): normblad **Archiefwet-en**; site **Archiefwet- en**
  - normblad: "Het toetsingskader wordt in de toekomst verder uitgebreid met andere onderdelen uit de Archiefwet-en regelgeving."
  - site: "Het toetsingskader wordt in de toekomst verder uitgebreid met andere onderdelen uit de Archiefwet- en regelgeving."
- **Woordverschil** (98%): site **Inbeheername en**
  - normblad: "Passende maatregelen, zoals bedoeld in de Archiefwet, artikel 4.1, eerste lid, zijn concrete beschrijvingen die de duurzame toegankelijkheid per norm per categorie documenten borgen. Er moeten passende maatregelen zijn die concreet beschrijven hoe de categorieën documenten in beheer worden genomen, zichtbaar zijn in een overzicht, vindbaar zijn, enzovoorts. Zie <<beheer>> voor welke onderwerpen een verantwoordelijk overheidsorgaan in ieder geval passende maatregelen moet nemen."
  - site: "Passende maatregelen, zoals bedoeld in de Archiefwet, artikel 4.1, eerste lid, zijn concrete beschrijvingen die de duurzame toegankelijkheid per norm per categorie documenten borgen. Er moeten passende maatregelen zijn die concreet beschrijven hoe de categorieën documenten in beheer worden genomen, zichtbaar zijn in een overzicht, vindbaar zijn, enzovoorts. Zie Inbeheername en beheer voor welke onderwerpen een verantwoordelijk overheidsorgaan in ieder geval passende maatregelen moet nemen."
- **Woordverschil** (93%): normblad **Een**; site **Informatiebeveiliging en betrouwbaar: een**; normblad **categorieën**; site **categorie**
  - normblad: "Een risicobenadering voor de beveiliging is verplicht. De risicobenadering moet leiden tot passende maatregelen in de vorm van beheerregels voor de beveiliging van documenten. Hierbij is het mogelijk dat per categorieën verschillende beveiligingsregimes gelden."
  - site: "Informatiebeveiliging en betrouwbaar: een risicobenadering voor de beveiliging is verplicht. De risicobenadering moet leiden tot passende maatregelen in de vorm van beheerregels voor de beveiliging van documenten. Hierbij is het mogelijk dat per categorie verschillende beveiligingsregimes gelden."
- **Niet gevonden**: "NB: dit document bevat stukken tekst die op een plek op de website worden gepubliceerd. De hieronder aangehouden volgorde is niet de volgorde op de website. Ieder "brok" tekst staat op zichzelf. De commentaarballonnen dienen als reminders bij het verwerken op de website."
- **Niet gevonden**: "Op de website onder het kopje "Over" komen drie blokken tekst:"
- **Niet gevonden**: "Inleiding -> andere naam voor het kopje"
- **Niet gevonden**: "Of, dit heeft onze voorkeur: webpagina indelen naar voorbeeld van webpagina "normen" zodat er meer onderwerpen in terecht kunnen komen."
- **Niet gevonden**: "De andere tekstblokken in dit WORD document worden elders geplaats. Of als hoover, of bij de "onderwerpen" of als uitleg bij de bollenplaat op de homepage."
- **Niet gevonden**: "Algemene introductie - Toetsingskader overheidsinformatie van de centrale overheid"
- **Niet gevonden**: "Het toetsingskader omvat momenteel de onderwerpen die de Inspectie als fundamenteel beschouwt voor de duurzame toegankelijkheid van overheidsinformatie. De vier wit gearceerde onderwerpen horen hier ook bij, maar worden op een later moment toegevoegd aan het toetsingskader."
- **Niet gevonden**: "Dat documenten in beheer moeten zijn, is het fundament van het toetsingskader. Van overheidsinformatie die in beheer is, wordt zowel de inrichting als de uitvoering van het beheer geborgd."
- **Niet gevonden**: "Het overzicht is te vinden op de website van de Inspectie Overheidsinformatie en Erfgoed"

### 9) Onderwerpen en Verwijzingen → `de hele contentboom`

- **Woordverschil** (98%): normblad **Ar,**; site **Archiefregeling,**
  - normblad: "Welke metadata dienen te worden vastgelegd hangt af van de techniek die wordt gebruikt. De Ar, artikel 2.8 lid b, regelt dat nadrukkelijk rekening wordt gehouden met de mogelijkheid dat er meerdere technieken naast elkaar gebruikt worden om integriteitschecks uit te voeren, afhankelijk van het soort documenten."
  - site: "Welke metadata dienen te worden vastgelegd hangt af van de techniek die wordt gebruikt. De Archiefregeling, artikel 2.8 lid b, regelt dat nadrukkelijk rekening wordt gehouden met de mogelijkheid dat er meerdere technieken naast elkaar gebruikt worden om integriteitschecks uit te voeren, afhankelijk van het soort documenten."
- **Woordverschil** (77%): normblad **metadata -**; site **een omschrijving van de gebruikte**; normblad **toepassingsprogrammatuur**; site **toepassingsprogrammatuur;**
  - normblad: "<< metadata - hardware, besturingsprogrammatuur en toepassingsprogrammatuur>>"
  - site: "een omschrijving van de gebruikte hardware, besturingsprogrammatuur en toepassingsprogrammatuur;"
