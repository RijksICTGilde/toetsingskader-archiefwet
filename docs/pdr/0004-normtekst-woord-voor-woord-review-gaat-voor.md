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

Bij elke afwijking hoort een regel met reden in `docs/afwijkingen-van-het-normblad.md`, en een controle als de afwijking machinaal kan terugkomen.

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

## Bron

[Afwijkingen van het normblad](../afwijkingen-van-het-normblad.md)
