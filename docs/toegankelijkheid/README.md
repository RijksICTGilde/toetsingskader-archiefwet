# Toegankelijkheidsrapporten van derden

Hier staan rapporten die buiten deze repository zijn gemaakt, bewaard als
nulmeting. Ze zijn niet door de CI gegenereerd en worden niet automatisch
bijgewerkt.

| Bestand | Wat het is |
|---|---|
| `__toetsingskader-archiefwet-2026.pdf.accreport.html` | Toegankelijkheidsrapport van Adobe Acrobat XI over een van de site gedownloade `toetsingskader-archiefwet-2026.pdf` |

Acrobat zet in zo'n rapport het volledige bronpad van het gecontroleerde
bestand. Dat is hier vervangen door een toelichting: het ging om een intern
netwerkpad met een accountnaam erin, en deze repository is openbaar. Wie een
nieuw rapport toevoegt: haal die regel eruit, en controleer ook de velden
"Rapport gemaakt door" en "Bedrijf".

## Over het Acrobat-rapport

Uitslag: 22 goedgekeurd, 3 mislukt, 3 handmatig te controleren, 4 overgeslagen.

Lees het niet als "de PDF is grotendeels in orde". Acrobat meldt dat het
document codes (tags), een taal en bladwijzers heeft, terwijl de export die
alle drie niet schrijft — gemeten op de bytes, zie bevinding 6 in
[het toegankelijkheidsonderzoek](../toegankelijkheidsonderzoek-2026-08.md#6-de-pdf-export-levert-een-ongetagde-pdf).
De verklaring die daarbij past: Acrobat heeft het document bij het openen zelf
getagd en daarna zijn eigen gok gecontroleerd.

De drie mislukte punten — figuren zonder alternatieve tekst, `LI` niet onder
`L`, koppen fout genest — zijn wat een auto-tagger op een visueel opgemaakte
PDF fout doet. Dat is het argument onder
[het besluit](../besluit-toegankelijke-pdf.md): geraden tags kloppen niet,
tags uit HTML-semantiek wel.

Te bevestigen zodra het gecontroleerde bestand weer beschikbaar is:

```
node scripts/pdf-ua-check.mjs <bestand>.pdf
```

1/4 markers betekent dat de tags uit de Acrobat-sessie kwamen, niet uit de
export.
