# Afwijkingen van het normblad

Normteksten komen woord voor woord uit de normbladen in `docs/normbladen …/`.
Spelfouten, congruentiefouten en afkortingen blijven staan. Er komen geen zinnen
bij.

Hieronder de punten waar de site daar bewust van afwijkt.

## Regel: review gaat vóór woord voor woord

Vraagt een review iets anders dan het normblad, dan wint de review. Het normblad
is een momentopname, de review is de latere uitspraak over dezelfde tekst.

Bij elke afwijking hoort:

1. **Een regel hieronder, met reden.** Zonder uitleg draait de volgende
   vergelijking met het normblad de afwijking terug. Dat is één keer gebeurd, met
   de kern-kop.
2. **Een controle, als de afwijking machinaal kan terugkomen.**

## De afwijkingen

| Wat | In plaats van | Geborgd door |
|---|---|---|
| Kop boven de kern volgt `norm_titel`: "Kern van ordenen" | Kop2 van het normblad: "Kern van Ordeningsstructuur" | `validate-norms.py` weigert het veld `kern_kop` |
| Norm 3, toelichting 3e alinea: "overbrengen" | "overdragen" | — |
| Norm 3, voorschrift 3.3: bron "Ar, artikel 2.5, tweede lid, sub k" eerst | omgekeerde volgorde | — |
| Kern-kop genummerd: "1. Kern van inbeheername en beheer" (feedback 25 augustus 2026: nummering van de voorschriften sluit erop aan) | "Kern van Inbeheername en beheer" zonder nummer | `_partials/kern-kop.html` zet het nummer; `tests/js/pdf-doc.test.mjs` verwacht het |
| "Gerelateerde onderwerpen": alleen items die naar een pagina of bron linken; bij norm 7 daardoor het hele kopje weg (feedback 25 augustus 2026) | de volledige lijst uit het normblad, ook losse woorden als "Dossier", "Zaak", "Migratie" | — (volgende stap volgens de feedback: kopje en lijst helemaal weg) |

De kern-kop geldt voor alle acht normen. `_partials/kern-kop.html` leidt hem af
uit `norm_titel`, zodat pagina, inhoudsopgave en PDF dezelfde tekst voeren. Pas
`norm_titel` niet aan om die kop te sturen: dat veld stuurt ook het
bollendiagram, de kaarten op `/normen/` en de navigatie.

## Geen afwijking

- `<<…>>` is een linkinstructie, geen tekst. Wordt een link naar `/onderwerpen/…`
  of vervalt. Idem voor een voetnoot die een instructie is ("Hyperlink naar
  DUTO").
- Een ballon die om een *hoover* vraagt wordt een hover, geen begrippenpagina.
  Zie `onderwerpen-en-hovers.md`.
- Enkelvoud/meervoud in `#### Criteria` / `#### Criterium` en `#### Indicatoren` /
  `#### Indicator` wisselt in de normbladen zelf. De site volgt per voorschrift
  het normblad. De validator staat beide toe.
