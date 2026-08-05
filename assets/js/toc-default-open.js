// TOC standaard open, op elke pagina.
//
// Het thema laat de "Op deze pagina"-aside dicht en opent 'm alleen als de
// gebruiker eerder op de toggle klikte (localStorage `toc-open`). Voor een
// naslagwerk is de inhoudsopgave het primaire navigatiemiddel, dus zonder
// opgeslagen voorkeur hoort die open te staan. Eerder loste de normpagina dat
// op met een hardgecodeerde `is-open`-class; dat botste met de toggle-status
// (aria-expanded bleef "false") en negeerde de voorkeur van de gebruiker.
//
// Draait als laatste in de thema-bundel (zie layouts/_partials/scripts.html),
// dus ná theme/js/toc.js. Heeft de gebruiker wél een voorkeur, dan heeft het
// thema die al toegepast en doen we niets.
//
// Upstream-kandidaat: het thema een `toc_default_open`-param geven.
(function () {
  var stored = null;
  try {
    stored = localStorage.getItem('toc-open');
  } catch (e) {
    // localStorage geblokkeerd (privacymodus): val terug op standaard open.
  }
  if (stored !== null) return;

  var toc = document.getElementById('toc');
  var toggle = document.querySelector('.toc-toggle');
  if (!toc || !toggle) return;

  toc.classList.add('is-open');
  toggle.setAttribute('aria-expanded', 'true');
  var label = toggle.querySelector('.visually-hidden');
  if (label) label.textContent = 'Inhoudsopgave verbergen';
})();
