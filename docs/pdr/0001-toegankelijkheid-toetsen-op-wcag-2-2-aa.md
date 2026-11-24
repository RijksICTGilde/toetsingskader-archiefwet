# 0001: Toegankelijkheid toetsen op WCAG 2.2 AA en bevindingen bij de bron oplossen

Datum: 2026-08-06

## Status

Geaccepteerd. Bijgewerkt op 10 augustus, 12 augustus en 6 oktober 2026, toen bevindingen in het thema zijn opgelost.

## Besluit

De site wordt getoetst op WCAG 2.2 niveau AA (EN 301 549, Tijdelijk besluit digitale toegankelijkheid overheid). Een bevinding wordt opgelost waar zij ontstaat: in dit project als de oorzaak hier ligt, in het thema `hugo-theme-rijksoverheid` als de oorzaak daar ligt. De geautomatiseerde controles draaien in CI op elke pull request.

## Achtergrond

In augustus 2026 is een vooronderzoek gedaan op alle 14 gegenereerde pagina's van `main`. Het onderzoek is geen toegankelijkheidsverklaring: een deel van WCAG is niet vast te stellen zonder browser, hulpsoftware en gebruikers. Het leverde 31 bevindingen op, waarvan 18 een verklaring op niveau AA in de weg stonden, de ongetagde PDF meegeteld.

## Overwegingen

- Het fundament was in orde: semantiek, koppenhiërarchie, tekstcontrast, `prefers-reduced-motion` en een echte `<dialog>` voor zoeken.
- Er was één systematisch probleem: de focus was op vijf plekken niet of nauwelijks zichtbaar.
- Geautomatiseerde tests dekken 20 tot 30 procent van de succescriteria. Van de 31 bevindingen kwamen er 2 uit de scan. Een handmatige beoordeling blijft dus nodig.
- Een gebrek in het thema raakt elke site die het thema gebruikt. Een lokale reparatie lost het alleen hier op.

## Details

- Geautomatiseerd: axe-core met de regelsets `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` en `wcag22aa` op de gebouwde HTML (`scripts/a11y-scan.mjs`, `npm run test:a11y`).
- Sinds 10 augustus 2026 ook in een browser (`scripts/a11y-browser.mjs`, `npm run test:a11y:browser`), voor contrast, reflow en doelgrootte.
- Handmatig: beoordeling van de gegenereerde HTML, CSS en JavaScript op semantiek, focusbeheer, toetsenbord en ARIA. Contrast is berekend met de WCAG-formule.
- Een gebrek in het thema krijgt hier een tijdelijke override met een kop die dat vermeldt, en een issue of pull request op het thema. De override vervalt zodra het thema is bijgewerkt.
- Thema v0.2.0 (12 augustus 2026) loste de bevindingen 1a, 1b, 1c, 12 en 17 op. Thema v0.2.3 (6 oktober 2026) loste 10, 16, 18, 21, 23 en 24 op.
- Nog open volgens het onderzoek: de Escape-afhandeling van de bron-tooltip (bevinding 7, thema-issue 10), de `<mark>`-helft van bevinding 9 (thema-issue 11) en de bevestiging van bevinding 17 in een browser.
- Bevinding 6, de ongetagde PDF, vroeg een keuze en is uitgewerkt in [PDR 0003](0003-pdf-bij-de-build-genereren-met-tags.md).

## Impact

### Gebruikers

Bezoekers die met toetsenbord of schermlezer werken, kunnen de site bedienen en lezen. Het bollendiagram heeft namen voor de normlinks en een tekstuele normenlijst.

### Ontwikkelteam

Een pull request die een overtreding invoert, faalt in CI. Bekende uitzonderingen staan met reden in `scripts/a11y-browser.mjs`.

### Thema

Reparaties gaan naar het thema en komen daar ook andere sites ten goede.

## Alternatieven

- Alleen geautomatiseerd toetsen. Niet gekozen, omdat de scan het grootste deel van de bevindingen niet vond.
- Alles lokaal repareren met overrides. Niet gekozen, omdat de overrides dan blijven staan en het thema hetzelfde gebrek houdt.

## Bron

[Toegankelijkheidsonderzoek, augustus 2026](../toegankelijkheidsonderzoek-2026-08.md)
