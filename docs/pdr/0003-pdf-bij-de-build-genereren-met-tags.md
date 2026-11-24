# 0003: De PDF wordt bij de build gegenereerd, met tags

Datum: 2026-08-13

## Status

Geaccepteerd. Gewijzigd op 31 augustus 2026: de PDF wordt gemaakt met pdfkit in plaats van met Chromium.

## Besluit

De negen PDF's van het toetsingskader worden bij het bouwen van de site gegenereerd en als statische bestanden meegeleverd, met een structuurboom (tags), een taal en bladwijzers. De pijplijn met pdfMake in de browser van de bezoeker vervalt.

## Achtergrond

Bevinding 6 uit het toegankelijkheidsonderzoek ([PDR 0001](0001-toegankelijkheid-toetsen-op-wcag-2-2-aa.md)), uitgewerkt als issue 58: de export leverde een ongetagde PDF. Gemeten op de bytes ontbraken `/StructTreeRoot`, `/MarkInfo` en `/Lang`. Een schermlezer las tachtig pagina's als één doorlopende tekst, zonder koppen en lijsten, en zonder taal. De norm is EN 301 549 paragraaf 10, met WCAG 1.3.1 en 4.1.2 en PDF/UA-1 (ISO 14289-1).

pdfMake 0.2.18 bouwt geen structuurboom. De optie `tagged: true` in de onderliggende laag zet alleen de vlag zonder tags, en dat is slechter dan een ongetagde PDF.

## Overwegingen

- De PDF is hier geen bijlage. Inspecteurs en organisaties onder toezicht gebruiken het kader offline en op papier.
- De inhoud is statisch. Negen documenten die bij elke build gelijk zijn, werden bij elke bezoeker opnieuw opgebouwd.
- Het is per saldo minder code. De gevendorde pdfMake (1,3 MB), de fonts in base64 (228 kB) en de converter vervallen. De bundel van 2,1 MB stond als blokkerend script op elke normpagina.
- Tags die uit visuele opmaak worden geraden, kloppen niet. Het Acrobat-rapport liet dat zien ([PDR 0010](0010-toegankelijkheidsrapporten-van-derden-als-nulmeting.md)). Tags die uit de structuur van de HTML volgen, kloppen wel.

## Details

- De invoer is `index.pdfdata.json` per norm (outputformat `pdfdata`). `scripts/pdf-html.mjs` vertaalt de HTML van de norm naar structuurelementen: Document, H1 tot en met H5, P, L, LI en LBody.
- `scripts/pdf-tagged.mjs` bouwt de structuurboom met pdfkit en `markStructureContent()`. Dat is dezelfde oplossing als de AI-verordening-beslishulp (MinBZK/ai-verordening-beslishulp, pull request 1047), zodat beide projecten hetzelfde patroon delen.
- `scripts/pdf-build.mjs` schrijft `index.pdf` naast elke pagina en controleert de invoer. Een dubbel anker is fataal. Een overgeslagen kopniveau wordt alleen in de PDF-tag genormaliseerd en gemeld, omdat de normbladen dat niveau zelf overslaan.
- Acceptatiecriterium: `scripts/pdf-ua-check.mjs` slaagt op alle negen documenten. De controle eist de vier markers en een gevulde boom (`/H1` en `/LBody`).
- `tests/js/pdf-tagged.test.mjs` meet op de bytes wat de markers niet zien: de tags in de content-streams komen overeen met de boom, links zijn `Link`-elementen met OBJR, en geneste lijsten blijven genest.
- De downloadknop is een gewone link naar `index.pdf` en werkt zonder JavaScript.
- De markers en een gevulde boom zijn een ondergrens. Of de tags de inhoud juist beschrijven, vraagt een handmatige doorloop met PAC of Acrobat.
- Open vraag: bestaat er bij de Inspectie of bij OCW een publicatieketen, zoals NLDoc, waar dit kader in past? Dan kan de eigen pijplijn vervallen.

## Impact

### Gebruikers

Een schermlezer kan in de PDF op koppen navigeren en leest lijsten als lijsten, in het Nederlands. De normpagina's laden zonder de bundel van 2,1 MB.

### Ontwikkelteam

`just pdf` draait volledig lokaal, zonder browser. De containerbuild maakt de PDF's en controleert ze.

### Toegankelijkheidsverklaring

De passage over de ongetagde PDF vervalt. Er blijft hooguit een aantekening dat de tags machinaal uit de structuur volgen en steekproefsgewijs met de hand worden gecontroleerd.

## Alternatieven

- De PDF in de toegankelijkheidsverklaring als niet-conform benoemen (route 1). Niet gekozen als eindsituatie, omdat het kader een normdocument is.
- Een publicatieketen van de Inspectie of OCW, zoals NLDoc (route 3). Niet uitgesloten; de vraag staat open.
- WeasyPrint met `pdf_variant='pdf/ua-1'`. Niet gekozen, omdat het Pango en Cairo in de buildketen brengt en in de ontwikkelomgeving niet draaide.
- Chromium via Playwright met `page.pdf({ tagged: true, outline: true })` op print-HTML. Dit was de keuze van 13 augustus 2026. Op 31 augustus 2026 vervangen door pdfkit: geen browser in de keten en lokaal te controleren.

## Bron

[Besluit: de PDF wordt bij de build gegenereerd, met tags](../besluit-toegankelijke-pdf.md)
