# Feedback op de normbladen ordenen, metadateren en informatiebeveiliging

Ontvangen 21 augustus 2026. Twaalf punten op drie normbladen: norm 3 (ordenen),
norm 4 (metadateren) en norm 5 (informatiebeveiliging en betrouwbaar). Allemaal
verwerkt; zie "Verwerking" onderaan.

De feedback staat hieronder woord voor woord, zodat later na te lopen is wat er
precies gevraagd is. Wat er sitebreed geldt over afwijken van de normbladtekst
staat in `afwijkingen-van-het-normblad.md`.

## De feedback, onbewerkt

> **Normblad ordenen:**
>
> - Bovenin staat nu "Normanalyse Ordeningsstructuur", dit moet worden
>   "Normanalyse ordenen" (ordenen met kleine letters).
>
> **Normblad metadata:**
>
> - Bovenin staat nu "Normanalyse Metadata", dit moet worden "Normanalyse
>   metadateren" (dus metadateren met kleine letters).
> - Voetnoot 7 is NEN-ISO 23081-1 2017.PDF | Downloaden . Dit werkt inderdaad
>   niet omdat het een link naar ons DMS is. De verwijzing moet zijn naar deze
>   website: NEN-ISO 23081-1:2017 nl
> - "Alle documenten, ongeacht de bewaartermijn, zijn voorzien van de volgende
>   metadata die zijn vastgelegd in een metadataschema:" (voor voorschrift 4.2)
>   is een kopje. Nu lijkt het bij de tekst van voorschrift 1 te horen. Het moet
>   op hetzelfde niveau zijn als de tussenkopjes 'feitelijk beheer' bij het
>   normblad beheer).
>   Dit geldt ook voor de kopjes:
>   "Digitale documenten met een bewaartermijn langer dan tien jaar zijn
>   voorzien van de volgende metadata die zijn vastgelegd in een
>   metadataschema:[1]" en "Over te brengen documenten zijn, uiterlijk
>   voorafgaand aan overbrenging, voorzien van de volgende metadata die zijn
>   vastgelegd in een metadataschema:"
> - Voorschrift 4.2, hoover over woord structuur: Laatste zin is 'Maar ook kan
>   gedacht worden aan bericht dat bijlagen bevat.' Kan er het woord 'een'
>   worden toegevoegd voor het woord bericht. Dus dan wordt het: 'Maar ook kan
>   gedacht worden aan een bericht dat bijlagen bevat.'
> - Voorschrift 4.3, de voetnoot bij een permanent uniek identificatiekenmerk is
>   nu: 'Ar, artikel 2.7 reikwijdte, p.3 en Archiefregeling, toelichting §2.2
>   Aanvullende eisen voor langdurig te bewaren documenten in digitale vorm,
>   artikel 2.8 aanvullende metadata.' Dat moet worden: 'Ar, artikel 2.7; Ar,
>   artikel 2.8; Archiefregeling, Toelichting, 2.2 Aanvullende eisen voor
>   langdurig te bewaren documenten in digitale vorm, p.37.'
>
> **Normblad Informatiebeveiliging en betrouwbaar**
>
> - Titel van het normblad is nu 'Normanalyse informatiebeveiliging en
>   betrouwbaarheid van documenten' dat moet worden 'Normanalyse
>   informatiebeveiliging en betrouwbaar'
> - Toelichting eerste alinea, laatste zin. Ik mis over het woord
>   informatiebeveiliging de hoover: "Voorbeelden van onderwerpen waar de
>   Inspectie zich niet op richt zijn: firewalls, versleuteling (encryptie),
>   antivirussoftware, multifactorauthenticatie (MFA),of het patchen van
>   kwetsbaarheden."
> - Voorschrift 5.1 voetnoot: 'Ab, artikel 2.1, sub e en Ab, artikel 2.1, tweede
>   lid.' moet worden 'Ab, artikel 2.1, sub e; Ab, artikel 2.1, tweede lid.'
> - De laatste twee indicatoren onder voorschrift 5.1 zijn ingesprongen. Dat is
>   niet de bedoeling. Ze zijn op hetzelfde niveau als de andere indicatoren.
> - Voorschrift 5.4, laatste criterium, daar staat in de voetnoot "Ab, artikel
>   2.1, eerste lid, onderdeel e; Ab, nota van toelichting, p.18 van document.
>   Anders dan op grond van een verplichting uit andere wetgeving. Deze
>   verplichting moet niet in strijd zijn met de uitvoering van de Archiefwet'
>   (o.i.d.)" . Dit moet worden "Ab, artikel 2.1, eerste lid, onderdeel e; Ab,
>   nota van toelichting, p.18 van document. Met ongeoorloofd wordt bedoeld
>   anders dan op grond van een verplichting uit andere wetgeving. Deze
>   verplichting mag echter niet in strijd zijn met de uitvoering van de
>   Archiefwet."

## Verwerking

| # | Punt | Verwerkt in |
|---|---|---|
| 1 | Titel norm 3 → "Normanalyse ordenen" | `content/normen/03-ordenen.md`, `title` |
| 2 | Titel norm 4 → "Normanalyse metadateren" | `content/normen/04-metadateren.md`, `title` |
| 3 | Voetnoot 7 naar nen.nl in plaats van het DMS | `04-metadateren.md`, `[^nen-iso-23081-1-2017]` → <https://www.nen.nl/nen-iso-23081-1-2017-nl-269387> |
| 4 | Drie categorie-inleidingen als tussenkopje | `04-metadateren.md`, `###` — zelfde niveau als "Feitelijk beheer" in `01-beheer.md` |
| 5 | Hover "structuur": "een bericht" | `04-metadateren.md`, `[^structuur]` |
| 6 | Voetnoot permanent uniek identificatiekenmerk | `04-metadateren.md`, `[^ar-artikel-2-7-reikwijdte]` |
| 7 | Titel norm 5 → "Normanalyse informatiebeveiliging en betrouwbaar" | `content/normen/05-betrouwbaar.md`, `title` |
| 8 | Hover bij "informatiebeveiliging" met de voorbeelden | `05-betrouwbaar.md`, `[^ab-nota-van-toelichting-p11-12]` |
| 9 | Voetnoot 5.1: puntkomma tussen de vindplaatsen | `05-betrouwbaar.md`, `[^ab-artikel-2-1-sub-e-en-lid-2]` |
| 10 | Twee back-upindicatoren niet meer ingesprongen | `05-betrouwbaar.md`, indicatoren bij voorschrift 5.1 |
| 11 | Voetnoot laatste criterium 5.4 | `05-betrouwbaar.md`, `[^ab-artikel-2-1-lid-1-sub-e-gewist]` |

Punt 4 telt in de tabel als één regel, maar raakt drie koppen.

## Twee afwijkingen van de letterlijke tekst

**De hover bij punt 8 is samengevoegd met de bronvoetnoot die er al stond.** Op
het woord "informatiebeveiliging" hing al `[^ab-nota-van-toelichting-p11-12]`.
Twee voetnootmarkeringen achter elkaar leveren één zwevend nummer op: de
tooltip-transformatie in `layouts/normen/single.html` hangt de tooltip aan het
voorafgaande woord, en de tweede markering vindt daar alleen nog `</span>`. De
tooltip toont nu eerst de gevraagde voorbeelden en daarna de bron.

**In de aangeleverde tekst staat "(MFA),of het patchen"; op de site staat
"(MFA), of het patchen".** Alleen de ontbrekende spatie is toegevoegd, verder is
de zin ongewijzigd.

## Openstaand

*Opgelost 31 augustus 2026: `html-to-pdfmake.js` rendert koppen nu via
`inline()`, dus het voetnootnummer staat ook in de PDF als superscript met
sprong naar de bronnenlijst. De kop en de voetnoot zijn ongewijzigd.*

De kop "Digitale documenten met een bewaartermijn langer dan tien jaar …" draagt
voetnoot `[^ar-artikel-2-8]`. Op de site is dat een gewone hover, maar de
PDF-export zet koppen om met `textContent` (`assets/js/html-to-pdfmake.js`),
waar alinea's `inline()` gebruiken. In de PDF leest die kop daardoor
"… in een metadataschema:17": een kale 17, zonder superscript en zonder sprong
naar de bronnenlijst. Op te lossen door koppen ook via `inline()` te renderen,
of door de voetnoot uit de kop te halen. Nog geen besluit over genomen.
