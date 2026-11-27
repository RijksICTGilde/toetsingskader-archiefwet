# 0009: Punten buiten de content-pull-requests op één lijst bijhouden

Datum: 2026-08-25

## Status

Geaccepteerd. De lijst is voor het laatst bijgewerkt op 16 september 2026 en telt nog drie open punten.

## Besluit

Punten uit de feedbackrondes die niet in de content-pull-requests (76, 78 en 79) pasten, staan op één lijst: layout, script, PDF en nog te schrijven tekst. Per punt staat waar het zit. Een verwerkt punt wordt afgevinkt met de datum en de plek van de wijziging.

## Achtergrond

De drie feedbackrondes van augustus 2026 ([PDR 0006](0006-feedback-normbladen-3-4-5.md), [PDR 0007](0007-feedback-normbladen-6-7-8-en-kaderpaginas.md), [PDR 0008](0008-feedback-algemeen-normblad-1-2-onderwerpen.md)) bevatten punten die geen tekstwijziging zijn.

## Overwegingen

- De punten zijn geen tekstwijziging en pasten daarom niet in de content-pull-requests.
- Per punt moet te zien zijn in welk bestand of onderdeel het zit.

## Details

Besloten en uitgevoerd:

- De kern heeft geen kop meer (31 augustus 2026).
- Onder "Gerelateerde onderwerpen" staan alleen gelinkte items.
- De zin "De inhoud is nog in ontwikkeling en kan wijzigen." is weg, op de site en in de PDF. De versiezin komt uit één partial.
- Op de onderwerpenindex staat geen regel tekst per onderwerp. De navigatie vorige en volgende ging weg bij Onderwerpen en Over (#80) en kwam daarna terug: bij Over op 26 augustus (#79) en bij Onderwerpen op 1 september (#82).
- Elke onderwerpenpagina heeft een "Zie ook" met de normbladen waar het begrip speelt.
- Het bollendiagram is kleiner en de inhoudsopgave staat standaard uitgeklapt.
- In de PDF is "Belangrijke informatie" vervangen door de versieregel met een link naar de site.
- Synoniemen wegen zwaarder in de zoekfunctie.

Nog open:

- De pagina Totstandkoming. Volgens de lijst van 16 september 2026 wacht de tekst op de Inspectie.
- Lange woorden in koppen op 320 px (WCAG 1.4.10). Dit is een gebrek in het thema en staat als uitzondering in `scripts/a11y-browser.mjs`.
- De contrasten in de figuren, waaronder de labels van het bollendiagram.

## Impact

### Ontwikkelteam

Er is één plek waar staat wat nog moet gebeuren buiten de content.

### Thema

Het punt over lange woorden hoort als issue bij `hugo-theme-rijksoverheid`.

## Alternatieven

Het brondocument noemt geen alternatieven.

## Uitwerking

De volledige tekst van het oorspronkelijke bestand `docs/openstaande-punten.md`, dat met deze PDR is vervallen.

Stand 25 augustus 2026. Punten uit de feedback die niet in de content-PR's
(#76, #78, #79) zijn verwerkt: layout, script, PDF of nog te schrijven tekst.
Per punt staat waar het zit. Verwerkt = weghalen uit deze lijst.

### Normpagina's

- [x] **Nummer op "Kern van …"**, zodat de nummering van de voorschriften erop
      aansluit. Achterhaald: sinds 31 augustus 2026 heeft de kern-callout geen
      kop meer (pagina, TOC en PDF); `_partials/kern-kop.html` is weg.
- [x] **Gerelateerde onderwerpen** (ongelinkte items weg; kopje blijft waar nog links staan): de niet-gelinkte items onder dat kopje
      kunnen weg. Volgende stap: kopje en hele lijst weg, want de gelinkte
      woorden staan al in de tekst. Content (alle acht normbladen) én
      `scripts/validate-norms.py` (sectie is daar optioneel toegestaan).
- [x] **Hovers en links**: keuze 25 augustus 2026 "alles blauw", hover en link
      allebei in linkkleur; hover gestippeld, link doorgetrokken. `main.css`.
      Achterhaald sinds 15 september 2026: een term met hover én link is nu
      gestippeld en heeft de paginalink in de tooltip en in de bronnenlijst
      ("Ga naar …"); zie `_partials/voetnoot-tooltips.html`.
- [x] "Normanalyse" uit de paginatitel; titel gelijk aan de naam in het kader
      (ordeningsstructuur → ordenen). Gedaan in #76, #78 en #79.

### Versiezin

- [x] **"De inhoud is nog in ontwikkeling en kan wijzigen." weg**, op de site
      en in de PDF.
- [x] **Versiezin in de voet** ("Versie v0.2.2 … laatst aangepast op …") in de
      kleine opmaak van de homepage, overal. Sinds 31 augustus 2026 één partial
      (`_partials/versie-zin.html`) voor voet en homepage, in de thema-opmaak
      voor `footer p` (gedempt, cursief); de homepage toont nu ook de datum.

### Onderwerpen

- [x] **Regel tekst per onderwerp op de indexpagina weg**: niet iedereen ziet
      dat je op het onderwerp moet klikken. `layouts/onderwerpen/list.html`
      (de `description` op de kaart).
- [x] **"Zie ook" per onderwerp (criterium: normbladen waar het begrip inhoudelijk speelt; Passende maatregelen heeft die lijst al onder "De risicobenadering per norm"): de normbladen waar het onderwerp in voorkomt.**
      Content per onderwerpenpagina, of automatisch uit de backlinks.
- [x] **Onderwerpen niet in een carousel.** Bedoeld was de vorige/volgende-
      navigatie; die is weg (zie hierboven).
- [x] **Menu'tje (vorige/volgende) weg.** `prev_next` in
      `content/onderwerpen/_index.md` en de page-nav in de layout. Op
      1 september teruggezet (#82), net als bij Over op 26 augustus (#79).
- [x] **Hover op "document" (Wettelijk kader)**: de tooltip-transformatie is
      een partial (`_partials/voetnoot-tooltips.html`) en draait via de
      `article.html`-shadow op alle gewone pagina's. De voetnoot zelf zit in #78.

### Samenhang

- [x] **Bollendiagram kleiner.** `assets/css/bollendiagram.css`.
- [x] **Menu'tje standaard uitgeklapt.** `toc_open: true` + shadow `article.html` + `assets/js/toc-open.js` (respecteert een eerder dichtgeklapte voorkeur).

### Over

- [ ] **Pagina "Totstandkoming"**: stub staat er (`content/over/totstandkoming.md`,
      tegel 7). Tekst volgt van de Inspectie.
- [x] **Menu'tjes per pagina weg.** `prev_next` in `content/over/_index.md`.
- [x] **Bron in het blauwe definitieblok als voetnoot op "noodzakelijk"**:
      shortcode `callout-md` (inner rendert in de pagina-context; vereist
      `goldmark.renderer.unsafe: true`). De inleiding schakelt om in #78.

### PDF

- [x] **"Belangrijke informatie" kan weg.** `assets/js/pdf-export.js`.
- [x] **Toevoegen: "Dit is versie 1.0.0, bekijk voor de actuele versie …"** met
      link naar de site. `assets/js/pdf-export.js`; versienummer uit
      `site.Params.versie`.

### Zoeken

- [x] **Synoniemen wegen niet mee** (norm 6 op "vinden" pas tweede): het
      thema-script weegt alleen `title` en `content`. Lokale override
      `assets/js/search.js` met een `synoniemen`-key en hoger gewicht.

### Toegankelijkheid

- [ ] **Lange woorden in koppen op 320 px** (`/onderwerpen/metadata-hardware-en-programmatuur/`,
      "toepassingsprogrammatuur"): het thema zet geen `overflow-wrap`/`hyphens`
      op koppen, dus de h1 loopt 77 px over (WCAG 1.4.10). Themadefect →
      upstream-issue op hugo-theme-rijksoverheid; tot dan als URL-gebonden
      `KNOWN`-uitzondering in `scripts/a11y-browser.mjs` (CI was hierdoor rood
      sinds #79, ook op `main`).

- [ ] **Contrasten in de figuren** (bollendiagram, afbeeldingen) nalopen.
      Nog geen aandacht aan besteed. Sinds het diagram 440 px is, ook de
      lettergrootte van de labels (`.bd-label-sm` ≈ 11 px) meenemen.
