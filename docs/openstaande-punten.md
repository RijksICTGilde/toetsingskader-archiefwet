# Openstaande punten uit de feedbackrondes

Stand 25 augustus 2026. Punten uit de feedback die niet in de content-PR's
(#76, #78, #79) zijn verwerkt: layout, script, PDF of nog te schrijven tekst.
Per punt staat waar het zit. Verwerkt = weghalen uit deze lijst.

## Normpagina's

- [x] **Nummer op "Kern van …"**, zodat de nummering van de voorschriften erop
      aansluit. `layouts/_partials/kern-kop.html`; werkt door in TOC en PDF.
- [x] **Gerelateerde onderwerpen** (ongelinkte items weg; kopje blijft waar nog links staan): de niet-gelinkte items onder dat kopje
      kunnen weg. Volgende stap: kopje en hele lijst weg, want de gelinkte
      woorden staan al in de tekst. Content (alle acht normbladen) én
      `scripts/validate-norms.py` (sectie is daar optioneel toegestaan).
- [x] **Hovers en links**: keuze 25 augustus 2026 "alles blauw" — hover en link
      allebei in linkkleur; hover gestippeld, link doorgetrokken. `main.css`.
- [x] "Normanalyse" uit de paginatitel; titel gelijk aan de naam in het kader
      (ordeningsstructuur → ordenen). Gedaan in #76, #78 en #79.

## Versiezin

- [x] **"De inhoud is nog in ontwikkeling en kan wijzigen." weg**, op de site
      en in de PDF.
- [ ] **Versiezin in de voet** ("Versie v0.2.0 … laatst aangepast op …") in de
      kleine opmaak van de homepage, overal. Nu al kleiner en gedempt in #79
      (`.page-meta` in `main.css`); nog gelijktrekken met de homepage
      (`versielabel`-shortcode) zodat het één opmaak is.

## Onderwerpen

- [x] **Regel tekst per onderwerp op de indexpagina weg**: niet iedereen ziet
      dat je op het onderwerp moet klikken. `layouts/onderwerpen/list.html`
      (de `description` op de kaart).
- [x] **"Zie ook" per onderwerp (criterium: normbladen waar het begrip inhoudelijk speelt; Passende maatregelen heeft die lijst al onder "De risicobenadering per norm"): de normbladen waar het onderwerp in voorkomt.**
      Content per onderwerpenpagina, of automatisch uit de backlinks.
- [x] **Onderwerpen niet in een carousel.** Bedoeld was de vorige/volgende-
      navigatie; die is weg (zie hierboven).
- [x] **Menu'tje (vorige/volgende) weg.** `prev_next` in
      `content/onderwerpen/_index.md` en de page-nav in de layout.
- [x] **Hover op "document" (Wettelijk kader)**: de tooltip-transformatie is
      een partial (`_partials/voetnoot-tooltips.html`) en draait via de
      `article.html`-shadow op alle gewone pagina's. De voetnoot zelf zit in #78.

## Samenhang

- [x] **Bollendiagram kleiner.** `assets/css/bollendiagram.css`.
- [x] **Menu'tje standaard uitgeklapt.** `toc_open: true` + shadow `article.html` + `assets/js/toc-open.js` (respecteert een eerder dichtgeklapte voorkeur).

## Over

- [ ] **Pagina "Totstandkoming"**: stub staat er (`content/over/totstandkoming.md`,
      tegel 7). Tekst volgt van de Inspectie.
- [x] **Menu'tjes per pagina weg.** `prev_next` in `content/over/_index.md`.
- [x] **Bron in het blauwe definitieblok als voetnoot op "noodzakelijk"**:
      shortcode `callout-md` (inner rendert in de pagina-context; vereist
      `goldmark.renderer.unsafe: true`). De inleiding schakelt om in #78.

## PDF

- [x] **"Belangrijke informatie" kan weg.** `assets/js/pdf-export.js`.
- [x] **Toevoegen: "Dit is versie 1.0.0, bekijk voor de actuele versie …"** met
      link naar de site. `assets/js/pdf-export.js`; versienummer uit
      `site.Params.versie`.

## Zoeken

- [x] **Synoniemen wegen niet mee** (norm 6 op "vinden" pas tweede): het
      thema-script weegt alleen `title` en `content`. Lokale override
      `assets/js/search.js` met een `synoniemen`-key en hoger gewicht.

## Toegankelijkheid

- [ ] **Contrasten in de figuren** (bollendiagram, afbeeldingen) nalopen.
      Nog geen aandacht aan besteed. Sinds het diagram 440 px is, ook de
      lettergrootte van de labels (`.bd-label-sm` ≈ 11 px) meenemen.
