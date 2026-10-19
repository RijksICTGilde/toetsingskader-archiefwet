---
title: "Cookies"
description: "Deze website plaatst één technische cookie van het hostingplatform en houdt geen webstatistieken bij."
# Opbouw en zinnen volgen https://www.inspectie-oe.nl/service/cookies zo
# letterlijk mogelijk. Alleen wat hier onwaar is, is weggelaten of omgezet: de
# hoofdsite staat op het Platform Rijksoverheid Online met Piwik PRO; deze site
# draait op ZAD, zonder webstatistieken.
# Feiten (13 oktober 2026, gemeten op productie en PR-preview): de router van
# het ZAD-platform (OpenShift/HAProxy) zet op elke respons één sessiecookie
# voor sessie-affiniteit, naam is een hash, HttpOnly, Secure, SameSite=None,
# geen vervaldatum. Verder alleen localStorage `theme` en `toc-open`
# (assets/js/toc-open.js en de thema-scripts base.js, toc.js).
# Elke ZAD-component draait met één replica, dus de cookie heeft geen functie.
# TODO vóór publicatie (vraag 1, zie ~/projects/zad-privacy-compliance-vragen-v13.md):
# niet publiceren zolang de cookie aan staat zonder besluit van de Inspectie.
# De vrijstelling van art. 11.7a lid 3 onder a Tw vraagt dat de cookie nodig
# is voor de communicatie; bij één replica is dat niet te onderbouwen.
# ZAD (19 oktober 2026): de cookie kan nu niet via ZAD uit; een feature
# request is mogelijk. Gaat de cookie uit, dan vervallen de alinea's over de
# cookie hier, de description en de inleidende zin, en de cookiezin op de
# privacypagina. Blijft hij aan, dan beslist de privacycontactpersoon.
# De inlogmuur (oauth2-proxy + Keycloak) gaat eraf bij go-live; de cookies
# daarvan staan daarom bewust niet in deze tekst. ZAD draait geen analytics
# (bevestigd 19 oktober 2026); komt dat er ooit bij (Umami staat als idee in
# RIG-Cluster), dan moet deze pagina mee.
show_lastmod: true
toc: false
---

Deze website plaatst geen cookies voor onderzoek naar het gedrag van bezoekers. Het hostingplatform plaatst één technische cookie. Hieronder leest u welke cookie dat is, hoe lang die geldig blijft en wat deze website verder in uw browser bewaart.

## Wat zijn cookies?

Een cookie is een klein tekstbestand met informatie. Bezoekt u een website? Dan plaatst de website vaak cookies op uw computer, tablet of telefoon.

## Waarom plaatst deze website een cookie?

Deze website draait op [ZAD](https://zad.rijksapp.nl/introductie), een hostingplatform van de Rijksoverheid. Het platform plaatst één cookie die uw bezoek naar de juiste server leidt. Die cookie bevat geen gegevens over u en wordt niet gebruikt voor webstatistieken. Deze website houdt geen webstatistieken bij.

### Geen trackingcookies

Deze website gebruikt geen trackingcookies. Trackingcookies zijn cookies die bezoekers tijdens het surfen over andere websites volgen. Als een website trackingcookies plaatst, moet de bezoeker hiervoor toestemming geven.

### Geen toestemming nodig

Voor deze cookie is geen toestemming nodig, omdat die alleen dient om uw bezoek aan de website door te geven (artikel 11.7a, derde lid, onder a, van de Telecommunicatiewet).

## Om welke cookie gaat het?

Hieronder staat de cookie die deze website gebruikt. De cookie wordt alleen geplaatst als uw browser dat toestaat.

### Cookie van het hostingplatform

Deze cookie heeft een technische naam (een reeks cijfers en letters) en zorgt ervoor dat uw bezoek door dezelfde server wordt afgehandeld.

De cookie wordt gewist zodra u de browser sluit.

## Om welke gegevens gaat het?

De cookie zelf bevat geen gegevens over u. Het hostingplatform legt wel technische gegevens van uw bezoek vast in logbestanden, zoals het IP-adres van uw apparaat. Wat daarmee gebeurt, leest u op de pagina [Privacy]({{< relref "/privacy" >}}).

## Wat bewaart deze website verder in uw browser?

Deze website bewaart twee voorkeuren in de lokale opslag van uw browser (localStorage). Dit zijn geen cookies: de gegevens worden niet naar de server gestuurd en zijn niet naar u te herleiden. Ook hiervoor is geen toestemming nodig, omdat ze alleen een functie leveren waar u zelf om vraagt. Deze voorkeuren worden alleen bewaard als uw browser dat toestaat.

### theme

Bewaart of u de lichte of de donkere weergave heeft gekozen.

De voorkeur blijft bewaard tot u uw browsergegevens wist.

### toc-open

Bewaart of u de inhoudsopgave heeft open- of dichtgeklapt.

De voorkeur blijft bewaard tot u uw browsergegevens wist.

Bron voor de opzet: [Cookies, Inspectie Overheidsinformatie en Erfgoed](https://www.inspectie-oe.nl/service/cookies).
