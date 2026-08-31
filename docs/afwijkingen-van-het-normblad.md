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
| Geen kop boven de kern (keuze 31 augustus 2026): de callout begint met de kerntekst | Kop2 van het normblad: "Kern van Ordeningsstructuur" | `validate-norms.py` weigert het veld `kern_kop`; `tests/js/pdf-doc.test.mjs` controleert dat de PDF geen "Kern van …" zet |
| Norm 3, toelichting 3e alinea: "overbrengen" | "overdragen" | — |
| Norm 3, voorschrift 3.3: bron "Ar, artikel 2.5, tweede lid, sub k" eerst | omgekeerde volgorde | — |
| "Gerelateerde onderwerpen": alleen items die naar een pagina of bron linken; bij norm 7 daardoor het hele kopje weg (feedback 25 augustus 2026) | de volledige lijst uit het normblad, ook losse woorden als "Dossier", "Zaak", "Migratie" | — (volgende stap volgens de feedback: kopje en lijst helemaal weg) |

De kern zonder kop geldt voor alle acht normen: op de normpagina, in de
inhoudsopgave (geen regel voor de kern) en in de PDF. Eerder stond er "Kern van
<norm_titel>" (sinds 25 augustus 2026 genummerd, "1. Kern van …"), afgeleid in
`_partials/kern-kop.html`; die partial is verwijderd.

## Geen afwijking

- `<<…>>` is een linkinstructie, geen tekst. Wordt een link naar `/onderwerpen/…`
  of vervalt. Idem voor een voetnoot die een instructie is ("Hyperlink naar
  DUTO").
- Een ballon die om een *hoover* vraagt wordt een hover, geen begrippenpagina.
  Zie `onderwerpen-en-hovers.md`.
- Enkelvoud/meervoud in `#### Criteria` / `#### Criterium` en `#### Indicatoren` /
  `#### Indicator` wisselt in de normbladen zelf. De site volgt per voorschrift
  het normblad. De validator staat beide toe.
