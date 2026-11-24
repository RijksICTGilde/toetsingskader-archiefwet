# 0010: Toegankelijkheidsrapporten van derden bewaren als nulmeting

Datum: 2026-09-15

## Status

Geaccepteerd.

## Besluit

Rapporten die buiten deze repository zijn gemaakt, staan in `docs/toegankelijkheid/` als nulmeting. Ze worden niet door CI gegenereerd en niet bijgewerkt. Vóór plaatsing gaat het bronpad eruit en worden de regeleindes omgezet naar LF.

## Achtergrond

In de repository is een toegankelijkheidsrapport van Adobe Acrobat XI opgenomen over een van de site gedownloade PDF van het toetsingskader. De uitslag was 22 goedgekeurd, 3 mislukt, 3 handmatig te controleren en 4 overgeslagen.

## Overwegingen

- Het rapport is geen bewijs dat de PDF in orde was. Acrobat meldde tags, een taal en bladwijzers, terwijl de export die niet schreef. De verklaring die daarbij past: Acrobat heeft het document bij het openen zelf getagd en daarna zijn eigen uitkomst gecontroleerd.
- De drie mislukte punten (figuren zonder alternatieve tekst, `LI` niet onder `L`, koppen fout genest) zijn wat een automatische tagger fout doet. Dat ondersteunt [PDR 0003](0003-pdf-bij-de-build-genereren-met-tags.md).
- De repository is openbaar. Acrobat zet het volledige pad van het gecontroleerde bestand in het rapport; bij dit rapport was dat een intern netwerkpad met een accountnaam.

## Details

- Controleer in een nieuw rapport het bronpad en de velden "Rapport gemaakt door" en "Bedrijf".
- Zet de regeleindes om naar LF. Acrobat schrijft CRLF en de hook `mixed-line-ending` laat CI anders falen.
- Te bevestigen zodra het gecontroleerde bestand beschikbaar is: `node scripts/pdf-ua-check.mjs <bestand>.pdf`. Eén van de vier markers betekent dat de tags uit de sessie van Acrobat kwamen.

## Impact

### Ontwikkelteam

Er is een vast punt om latere metingen mee te vergelijken.

### Privacy

Een rapport van buiten kan een accountnaam of een intern pad bevatten. Dat wordt verwijderd vóór de commit.

## Alternatieven

Het brondocument noemt geen alternatieven.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/toegankelijkheid/README.md`, dat met deze PDR is vervallen.

Hier staan rapporten die buiten deze repository zijn gemaakt, bewaard als
nulmeting. Ze zijn niet door de CI gegenereerd en worden niet automatisch
bijgewerkt.

- `__toetsingskader-archiefwet-2026.pdf.accreport.html`
  - Wat het is: Toegankelijkheidsrapport van Adobe Acrobat XI over een van de site gedownloade `toetsingskader-archiefwet-2026.pdf`

Wie hier een nieuw rapport neerzet, let op twee dingen:

- **Het bronpad eruit.** Acrobat zet het volledige pad van het gecontroleerde
  bestand bovenin. Bij dit rapport was dat een intern netwerkpad met een
  accountnaam erin, en deze repository is openbaar. Controleer ook de velden
  "Rapport gemaakt door" en "Bedrijf".
- **Regeleindes naar LF.** Acrobat schrijft CRLF; de `mixed-line-ending`-hook
  zet dat lokaal om, maar in CI kan die de wijziging niet committen en faalt de
  run.

### Over het Acrobat-rapport

Uitslag: 22 goedgekeurd, 3 mislukt, 3 handmatig te controleren, 4 overgeslagen.

Lees het niet als "de PDF is grotendeels in orde". Acrobat meldt dat het
document codes (tags), een taal en bladwijzers heeft, terwijl de export die
alle drie niet schrijft, gemeten op de bytes, zie bevinding 6 in
[het toegankelijkheidsonderzoek](0001-toegankelijkheid-toetsen-op-wcag-2-2-aa.md#6-de-pdf-export-levert-een-ongetagde-pdf).
De verklaring die daarbij past: Acrobat heeft het document bij het openen zelf
getagd en daarna zijn eigen gok gecontroleerd.

De drie mislukte punten, figuren zonder alternatieve tekst, `LI` niet onder
`L`, koppen fout genest, zijn wat een auto-tagger op een visueel opgemaakte
PDF fout doet. Dat is het argument onder
[het besluit](0003-pdf-bij-de-build-genereren-met-tags.md): geraden tags kloppen niet,
tags uit HTML-semantiek wel.

Te bevestigen zodra het gecontroleerde bestand weer beschikbaar is:

```
node scripts/pdf-ua-check.mjs <bestand>.pdf
```

1/4 markers betekent dat de tags uit de Acrobat-sessie kwamen, niet uit de
export.
