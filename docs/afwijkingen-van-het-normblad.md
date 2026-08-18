# Afwijkingen van het normblad

De normteksten op deze site worden **woord voor woord** overgenomen uit de
normbladen in `docs/normbladen …/`: spelfouten, congruentiefouten en afkortingen
blijven staan zoals de opdrachtgever ze schrijft, en er komen geen zinnen bij.

Op een paar punten wijkt de site daar bewust van af. Dit document legt vast
welke, en waarom.

## Review gaat vóór woord voor woord

Vraagt een review van de opdrachtgever iets anders dan het normblad, dan wint de
review.

Het normblad is een momentopname; de review is de latere uitspraak van dezelfde
opdrachtgever over diezelfde tekst. De woord-voor-woord-regel bestaat om te
voorkomen dat wij de tekst gaan redigeren — niet om een correctie van de auteur
tegen te houden.

Daar hoort een verplichting bij, want zonder uitleg draait de volgende
vergelijking met het normblad zo'n afwijking ongemerkt terug. Dat is één keer
gebeurd: de kern-kop hieronder was al conform de review verwerkt en is daarna
door een woord-voor-woord-ronde opnieuw op de normbladtekst gezet. Dus:

1. **Leg elke afwijking hieronder vast, met de reden.** Een normpagina die zonder
   uitleg van het normblad afwijkt, leest bij de volgende controle als een fout
   en wordt dan "hersteld".
2. **Kan de afwijking machinaal terugkomen, zet er dan een controle op.**

## Vastgelegde afwijkingen

### De kop boven de kern

De kop is "Kern van " + `norm_titel` in kleine letters — "Kern van ordenen" —
en niet de Kop2 van het normblad, die per norm een andere naam voert
("Kern van Ordeningsstructuur", "Kern van metadata", "Kern van vindbaarheid").

De review op normblad Ordenen vraagt expliciet om de normnaam, en merkt daarbij
op dat dit voor alle normbladen geldt. De kerntékst eronder komt wél uit het
normblad in kwestie; alleen de kop volgt de normnaam.

`layouts/_partials/kern-kop.html` leidt de kop af uit `norm_titel`, zodat de
normpagina, de inhoudsopgave en de PDF dezelfde tekst voeren. Het
front-matter-veld `kern_kop`, waarmee de normbladkop die afleiding kon
overrulen, is vervallen: `scripts/validate-norms.py` wijst het af zodra het
terugkomt.

Pas `norm_titel` niet aan om de kop te sturen — dat veld voert de normnamen uit
"0) Introductie" en stuurt ook het bollendiagram, de kaarten op `/normen/` en de
navigatie aan.

### Norm 3, Toelichting, derde alinea

"overdragen" is op verzoek vervangen door "overbrengen".

### Norm 3, voorschrift 3.3

De twee bronnen in de voetnoot staan in omgekeerde volgorde ten opzichte van het
normblad, op verzoek: eerst "Ar, artikel 2.5, tweede lid, sub k", dan
"Ar, Toelichting, Hoofdstuk 2, Algemene Eisen ordening, p.34".

## Wat géén afwijking is

- `<<…>>` in het normblad is een linkinstructie, geen tekst. Verwerk het als link
  naar `/onderwerpen/…`, of laat het weg. Hetzelfde geldt voor een voetnoot die
  een instructie is ("Hyperlink naar DUTO").
- Enkelvoud en meervoud in `#### Criteria`/`#### Criterium` en
  `#### Indicatoren`/`#### Indicator` wisselen in de normbladen zelf. De site
  volgt per voorschrift het normblad; de validator staat beide toe.
