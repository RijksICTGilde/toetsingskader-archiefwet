# 0004: Normtekst woord voor woord uit het normblad; een review gaat voor

Datum: 2026-08-18

## Status

Geaccepteerd. De lijst met afwijkingen is voor het laatst bijgewerkt op 17 november 2026.

## Besluit

De normteksten op de site komen woord voor woord uit de normbladen. Spelfouten, congruentiefouten en afkortingen blijven staan en er komen geen zinnen bij. Vraagt een review iets anders dan het normblad, dan wint de review. Elke afwijking wordt met reden vastgelegd.

## Achtergrond

De opdrachtgever wil de tekst van de normbladen letterlijk. Een eerdere ronde liet 55 woordverschillen staan ([PDR 0002](0002-woordverschillen-met-de-normbladen.md)); die zijn teruggedraaid. Daarna kwamen reviews met verzoeken die van het normblad afwijken.

## Overwegingen

- Het normblad is een momentopname. De review is de latere uitspraak over dezelfde tekst.
- Zonder vastlegging draait de volgende vergelijking met het normblad een afwijking terug. Dat is één keer gebeurd, met de kop boven de kern.

## Details

Bij elke afwijking hoort een regel met reden in de lijst onder Uitwerking in deze PDR, en een controle als de afwijking machinaal kan terugkomen.

De afwijkingen op 17 november 2026:

- Geen kop boven de kern (keuze 31 augustus 2026). Geborgd in `validate-norms.py` en `tests/js/pdf-tagged.test.mjs`.
- Norm 3, toelichting, derde alinea: "overbrengen" in plaats van "overdragen".
- Norm 3, voorschrift 3.3: de bron "Ar, artikel 2.5, tweede lid, sub k" staat eerst.
- Paginatitels zijn genummerd, van "1. Inbeheername en beheer" tot "8. Periodieke evaluatie" (verzoek 1 september 2026).
- Onder "Gerelateerde onderwerpen" staan alleen items die naar een pagina of bron linken (feedback 25 augustus 2026).
- Verwijzingen naar het Archiefbesluit linken naar de publicatie in het Staatsblad. Verwijzingen naar de Archiefregeling hebben geen link maar de zin "(Bron beschikbaar na publicatie van de Archiefregeling.)" (review 16 november 2026).
- In normblad 1 staan twee stukken tekst vet die in het normblad niet vet zijn (feedback 25 augustus 2026).

Geen afwijking:

- `<<…>>` is een linkinstructie en geen tekst.
- Een ballon die om een hover vraagt, wordt een hover ([PDR 0005](0005-hoover-ballon-wordt-hover.md)).
- Enkelvoud en meervoud in de koppen Criteria en Indicatoren volgen per voorschrift het normblad.

## Impact

### Redactie

Wie een normtekst wijzigt, volgt het normblad of legt de afwijking vast met de review waar zij uit volgt.

### Ontwikkelteam

De validator en de tests bewaken de afwijkingen die machinaal kunnen terugkomen.

## Alternatieven

- De tekst redactioneel verbeteren op de site. Niet gekozen; zie [PDR 0002](0002-woordverschillen-met-de-normbladen.md).
- Het normblad strikt volgen, ook tegen een review in. Niet gekozen, omdat de review de latere uitspraak is.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/afwijkingen-van-het-normblad.md`, dat met deze PDR is vervallen.

Normteksten komen woord voor woord uit de normbladen in `docs/normbladen …/`.
Spelfouten, congruentiefouten en afkortingen blijven staan. Er komen geen zinnen
bij.

Hieronder de punten waar de site daar bewust van afwijkt.

### Regel: review gaat vóór woord voor woord

Vraagt een review iets anders dan het normblad, dan wint de review. Het normblad
is een momentopname, de review is de latere uitspraak over dezelfde tekst.

Bij elke afwijking hoort:

1. **Een regel hieronder, met reden.** Zonder uitleg draait de volgende
   vergelijking met het normblad de afwijking terug. Dat is één keer gebeurd, met
   de kern-kop.
2. **Een controle, als de afwijking machinaal kan terugkomen.**

### De afwijkingen

- Geen kop boven de kern (keuze 31 augustus 2026): de callout begint met de kerntekst
  - In plaats van: Kop2 van het normblad: "Kern van Ordeningsstructuur"
  - Geborgd door: `validate-norms.py` weigert het veld `kern_kop`; `tests/js/pdf-tagged.test.mjs` controleert dat de PDF geen "Kern van …" zet
- Norm 3, toelichting 3e alinea: "overbrengen"
  - In plaats van: "overdragen"
  - Geborgd door: geen
- Norm 3, voorschrift 3.3: bron "Ar, artikel 2.5, tweede lid, sub k" eerst
  - In plaats van: omgekeerde volgorde
  - Geborgd door: geen
- Paginatitels genummerd: "1. Inbeheername en beheer" … "8. Periodieke evaluatie" (verzoek 1 september 2026; de PDF-inhoudsopgave en de kaarten op /normen/ steunen erop dat de titel zijn eigen nummer draagt)
  - In plaats van: de normbladtitel zonder nummer
  - Geborgd door: `scripts/pdf-build.mjs` nummert de PDF-inhoudsopgave bewust niet zelf (`label: false`); haalt een woord-voor-woord-ronde de nummers weg, dan staan kaarten en inhoudsopgave zonder nummer
- "Gerelateerde onderwerpen": alleen items die naar een pagina of bron linken; bij norm 7 daardoor het hele kopje weg (feedback 25 augustus 2026)
  - In plaats van: de volledige lijst uit het normblad, ook losse woorden als "Dossier", "Zaak", "Migratie"
  - Geborgd door: - (volgende stap volgens de feedback: kopje en lijst helemaal weg)
- Bronlinks Archiefbesluit en Archiefregeling (review 16 november 2026): elke verwijzing naar het Archiefbesluit linkt naar de publicatie in het Staatsblad (`stb-2026-321`); elke verwijzing naar de Archiefregeling krijgt op de plek van "Bekijk bron" de cursieve zin "(Bron beschikbaar na publicatie van de Archiefregeling.)" en geen link. Het Archiefbesluit staat alleen als pdf/xml online, zonder ankers per artikel, dus één generieke link
  - In plaats van: links naar de internetconsultatieversies (`internetconsultatie.nl/archiefbesluit20xx/b1`, `internetconsultatie.nl/archiefregeling/b1`)
  - Geborgd door: - (zodra er per artikel gelinkt kan worden, of de Archiefregeling gepubliceerd is, vervangen)

De kern zonder kop geldt voor alle acht normen: op de normpagina, in de
inhoudsopgave (geen regel voor de kern) en in de PDF. Eerder stond er "Kern van
<norm_titel>" (sinds 25 augustus 2026 genummerd, "1. Kern van …"), afgeleid in
`_partials/kern-kop.html`; die partial is verwijderd.

### Geen afwijking

- `<<…>>` is een linkinstructie, geen tekst. Wordt een link naar `/onderwerpen/…`
  of vervalt. Idem voor een voetnoot die een instructie is ("Hyperlink naar
  DUTO").
- Een ballon die om een *hoover* vraagt wordt een hover, geen begrippenpagina.
  Zie `0005-hoover-ballon-wordt-hover.md`.
- Enkelvoud/meervoud in `#### Criteria` / `#### Criterium` en `#### Indicatoren` /
  `#### Indicator` wisselt in de normbladen zelf. De site volgt per voorschrift
  het normblad. De validator staat beide toe.

### Nadruk (vet) in normblad 1

Op verzoek (feedback 25 augustus 2026) staan in `content/normen/01-beheer.md`
twee stukken tekst vet die in het normblad niet vet zijn: "omschrijving" in
voorschrift 1.2 en "Alleen wanneer dergelijke categorieën bestaan" in
voorschrift 1.5. Verantwoording in `0008-feedback-algemeen-normblad-1-2-onderwerpen.md`.
