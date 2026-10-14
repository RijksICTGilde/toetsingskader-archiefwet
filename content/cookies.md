---
title: "Cookies"
description: "Deze website plaatst één technisch noodzakelijk cookie van het hostingplatform en houdt geen webstatistieken bij."
# Opbouw en zinnen volgen https://www.inspectie-oe.nl/service/cookies zo
# letterlijk mogelijk. Alleen wat hier onwaar is, is weggelaten of omgezet: de
# hoofdsite staat op het Platform Rijksoverheid Online met Piwik PRO; deze site
# draait op ZAD, zonder webstatistieken.
# Feiten (13 oktober 2026, gemeten op productie en PR-preview): de router van
# het ZAD-platform (OpenShift/HAProxy) zet op elke respons één sessiecookie
# voor sessie-affiniteit, naam is een hash, HttpOnly, Secure, SameSite=None,
# geen vervaldatum. Verder alleen localStorage `theme` en `toc-open`
# (assets/js/toc-open.js en de thema-scripts base.js, toc.js).
# Elk ZAD-component draait met één replica, dus de cookie heeft geen functie;
# ZAD is gevraagd `disable_cookies` aan te zetten. Gaat hij uit, dan vervalt de
# cookie-alinea's hieronder. Voorkeur: pas publiceren als de cookie uit is;
# lukt dat niet, dan steunt "geen toestemming nodig" op load balancing
# (art. 11.7a lid 3 onder b Tw), wat bij één replica zwak is.
# De inlogmuur (oauth2-proxy + Keycloak) gaat eraf bij go-live; de cookies
# daarvan staan daarom bewust niet in deze tekst. Komt er ooit analytics bij
# (ZAD overweegt Umami), dan moet deze pagina mee.
show_lastmod: true
toc: false
---

Deze website plaatst één technisch cookie van het hostingplatform, voor het verdelen van verkeer over servers (load balancing). Wij gebruiken geen cookies voor onderzoek naar gedrag van bezoekers op de website. Lees onder andere welk cookie we plaatsen, hoe lang we het bewaren en wat deze website verder in uw browser bewaart.

## Wat zijn cookies?

Een cookie is een klein tekstbestand met informatie. Bezoekt u een website? Dan plaatst de website vaak cookies op uw computer, tablet of telefoon.

## Waarom plaatst deze website een cookie?

Deze website draait op ZAD, een hostingplatform van de Rijksoverheid. Het platform plaatst één cookie om uw bezoek steeds door dezelfde server te laten afhandelen. Dat cookie bevat geen gegevens over u en wordt niet gebruikt voor webstatistieken. Deze website houdt geen webstatistieken bij.

### Geen trackingcookies

Deze website gebruikt geen trackingcookies. Trackingcookies zijn cookies die bezoekers tijdens het surfen over andere websites volgen. Als een website trackingcookies plaatst, moet de bezoeker hiervoor toestemming geven.

### Geen toestemming nodig

Voor dit cookie is geen toestemming van de bezoeker nodig. Het dient alleen voor het verdelen van verkeer, en zo'n cookie is op grond van artikel 11.7a, derde lid, van de Telecommunicatiewet vrijgesteld van toestemming.

## Om welke gegevens gaat het?

Het cookie zelf bevat geen gegevens over u. Het hostingplatform legt wel technische gegevens van uw bezoek vast in logbestanden, zoals het IP-adres van uw apparaat. Wat daarmee gebeurt, leest u op de pagina [Privacy]({{< relref "/privacy" >}}).

## Om welk cookie gaat het?

In onderstaande lijst ziet u welk cookie deze website gebruikt. Dit cookie wordt alleen geplaatst als uw browser dat toestaat.

### Cookie van het hostingplatform

Cookie met een technische naam (een reeks cijfers en letters) dat ervoor zorgt dat uw bezoek door dezelfde server wordt afgehandeld.

Het cookie wordt gewist zodra u de browser sluit.

## Wat bewaart deze website verder in uw browser?

Deze website bewaart twee voorkeuren in de lokale opslag van uw browser (localStorage). Dit zijn geen cookies: de gegevens worden niet naar de server gestuurd en zijn niet naar u te herleiden. Ook hiervoor is geen toestemming nodig, omdat ze alleen een functie leveren waar u zelf om vraagt. Deze voorkeuren worden alleen bewaard als uw browser dat toestaat.

### theme

Bewaart of u de lichte of de donkere weergave heeft gekozen.

Voorkeur blijft bewaard tot u uw browsergegevens wist.

### toc-open

Bewaart of u de inhoudsopgave heeft open- of dichtgeklapt.

Voorkeur blijft bewaard tot u uw browsergegevens wist.

Bron voor de opzet: [Cookies, Inspectie Overheidsinformatie en Erfgoed](https://www.inspectie-oe.nl/service/cookies).
