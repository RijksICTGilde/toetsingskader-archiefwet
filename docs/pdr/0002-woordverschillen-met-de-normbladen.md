# 0002: Woordverschillen met de normbladen laten staan als de betekenis gelijk is

Datum: 2026-08-10

## Status

Vervangen door [PDR 0004](0004-normtekst-woord-voor-woord-review-gaat-voor.md) op 18 augustus 2026.

## Besluit

De tekst op de site mocht in woorden afwijken van de normbladen van de vierde iteratie, zolang de betekenis gelijk bleef. Dit besluit geldt niet meer.

## Achtergrond

In augustus 2026 is elke alinea uit de normbladen eenmalig vergeleken met de content van de site. De uitkomst was 55 woordverschillen en geen betekenisverschil. De verschillen waren correcties op spelfouten van het normblad, de vorm "De Inspectie toetst of …", uitgeschreven afkortingen en zinnen die de site had toegevoegd om een externe link te kunnen dragen.

## Overwegingen

- De vergelijking vond geen betekenisverschil.
- De opdrachtgever wil de normbladtekst woord voor woord. Dat woog zwaarder.

## Details

- Alle 55 verschillen zijn teruggedraaid naar de brontekst.
- Eén inhoudelijke vondst uit de vergelijking is gebleven: het derde criterium bij het eerste voorschrift van normblad 5 ontbrak op de site en is toegevoegd.
- Het volledige rapport met de 55 verschillen staat in de git-geschiedenis: `git show df202b6:docs/tekstcontrole-4e-iteratie.md`.

## Impact

### Redactie

De normbladen zijn de bron. Een verbetering van de tekst loopt via het normblad of via een review, niet via de site.

## Alternatieven

Geen. Het besluit is vervangen.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/tekstcontrole-4e-iteratie.md`, dat met deze PDR is vervallen.

Eenmalige vergelijking van elke alinea uit de normbladen met de sitecontent,
augustus 2026. Uitkomst destijds: 55 woordverschillen, geen betekenisverschil.

**Dat is niet meer het uitgangspunt.** De opdrachtgever wil de normbladtekst
woord voor woord. Alle 55 verschillen zijn teruggedraaid naar de brontekst, ook
de correcties op spelfouten van het normblad, de "De Inspectie toetst of …"-vorm,
de uitgeschreven afkortingen en de zinnen die de site had toegevoegd om een
externe link te kunnen dragen.

Wat er nu geldt staat in `0004-normtekst-woord-voor-woord-review-gaat-voor.md`.

Eén inhoudelijke vondst uit die ronde is blijven staan: het derde criterium bij
het eerste voorschrift van normblad 5 ontbrak op de site en is toegevoegd.

Het volledige rapport, met alle 55 verschillen per normblad, staat in de
git-geschiedenis van dit bestand (`git show df202b6:docs/tekstcontrole-4e-iteratie.md`).
