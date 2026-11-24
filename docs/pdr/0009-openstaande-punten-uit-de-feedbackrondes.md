# 0009: Punten buiten de content-pull-requests op één lijst bijhouden

Datum: 2026-08-25

## Status

Geaccepteerd. De lijst is voor het laatst bijgewerkt op 16 september 2026 en telt nog drie open punten.

## Besluit

Punten uit de feedbackrondes die niet in de content-pull-requests (76, 78 en 79) pasten, staan op één lijst: layout, script, PDF en nog te schrijven tekst. Per punt staat waar het zit. Een verwerkt punt wordt afgevinkt met de datum en de plek van de wijziging.

## Achtergrond

De drie feedbackrondes van augustus 2026 ([PDR 0006](0006-feedback-normbladen-3-4-5.md), [PDR 0007](0007-feedback-normbladen-6-7-8-en-kaderpaginas.md), [PDR 0008](0008-feedback-algemeen-normblad-1-2-onderwerpen.md)) bevatten punten die geen tekstwijziging zijn.

## Overwegingen

- De punten zijn geen tekstwijziging en pasten daarom niet in de content-pull-requests.
- Per punt moet te zien zijn in welk bestand of onderdeel het zit.

## Details

Besloten en uitgevoerd:

- De kern heeft geen kop meer (31 augustus 2026).
- Onder "Gerelateerde onderwerpen" staan alleen gelinkte items.
- De zin "De inhoud is nog in ontwikkeling en kan wijzigen." is weg, op de site en in de PDF. De versiezin komt uit één partial.
- Op de onderwerpenindex staat geen regel tekst per onderwerp. De navigatie vorige en volgende is weg bij Onderwerpen en Over.
- Elke onderwerpenpagina heeft een "Zie ook" met de normbladen waar het begrip speelt.
- Het bollendiagram is kleiner en de inhoudsopgave staat standaard uitgeklapt.
- In de PDF is "Belangrijke informatie" vervangen door de versieregel met een link naar de site.
- Synoniemen wegen zwaarder in de zoekfunctie.

Nog open:

- De pagina Totstandkoming. Volgens de lijst van 16 september 2026 wacht de tekst op de Inspectie.
- Lange woorden in koppen op 320 px (WCAG 1.4.10). Dit is een gebrek in het thema en staat als uitzondering in `scripts/a11y-browser.mjs`.
- De contrasten in de figuren, waaronder de labels van het bollendiagram.

## Impact

### Ontwikkelteam

Er is één plek waar staat wat nog moet gebeuren buiten de content.

### Thema

Het punt over lange woorden hoort als issue bij `hugo-theme-rijksoverheid`.

## Alternatieven

Het brondocument noemt geen alternatieven.

## Bron

[Openstaande punten uit de feedbackrondes](../openstaande-punten.md)
