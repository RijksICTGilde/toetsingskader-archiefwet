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

## Bron

[Toegankelijkheidsrapporten van derden](../toegankelijkheid/README.md)
