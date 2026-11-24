# 0007: Feedback op de normbladen vindbaar, vernietigen en periodieke evaluatie en op de kaderpagina's verwerkt

Datum: 2026-08-25

## Status

Geaccepteerd. Vijf punten zijn op 31 augustus 2026 hersteld na een regressie.

## Besluit

De feedback van 25 augustus 2026 (tweede ronde) op norm 6, 7 en 8, de sectie Over en drie onderwerpenpagina's is overgenomen. De rangorde van synoniemen in de zoekfunctie valt buiten een contentronde en is als scriptwijziging apart opgepakt.

## Achtergrond

De ronde telde 31 punten: kaartteksten, titels, bronnen met een puntkomma tussen de vindplaatsen, hovers, voetnoten en enkele tekstcorrecties.

## Overwegingen

- Een review gaat voor de tekst van het normblad ([PDR 0004](0004-normtekst-woord-voor-woord-review-gaat-voor.md)).
- De zoekfunctie komt uit het thema en weegt alleen titel en inhoud. Een synoniem telde daardoor even zwaar als een willekeurig woord.

## Details

- Norm 6, 7 en 8: titels, kaartteksten, bronnen en hovers volgens de feedback.
- Over: kaartteksten van Wettelijk kader en Doelgroep, de voetnoot bij de Position Paper, het blauwe blok zonder titel en met een bron, en de hover bij "document".
- Onderwerpen: bronnen bij metadata hardware en programmatuur, metadata integriteitscheck en passende maatregelen.
- Zoeken: de synoniemen hebben een eigen sleutel met een hoger gewicht in een lokale `assets/js/search.js` ([PDR 0009](0009-openstaande-punten-uit-de-feedbackrondes.md)).
- Regressie: pull request 79 was eerder afgesplitst en zette bij het mergen de punten 20 tot en met 24 terug. Ze zijn op 31 augustus 2026 hersteld.

## Impact

### Gebruikers

Een zoekopdracht op een synoniem, zoals "vinden", zet de bijbehorende norm bovenaan.

### Ontwikkelteam

Een branch die vóór een feedbackronde is afgesplitst, kan verwerkte punten terugzetten. Controleer dat bij het mergen.

## Alternatieven

- De rangorde in het thema oplossen. Het brondocument noemt het thema en een lokale override als mogelijkheden; uitgevoerd is de lokale override.

## Bron

[Feedback op de normbladen vindbaar, vernietigen en periodieke evaluatie, en op de kaderpagina's](../feedback-normbladen-6-7-8-en-kader.md)
