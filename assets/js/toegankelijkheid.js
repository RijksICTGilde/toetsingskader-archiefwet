// ============================================================================
// Toegankelijkheidspatches op het thema (hugo-theme-rijksoverheid v0.2.3)
//
// TIJDELIJK. Elk blok repareert een themadefect; analyse en bevindingsnummers in
// docs/toegankelijkheidsonderzoek-2026-08.md. Blok weg zodra de fix upstream zit.
// Bevindingen 10, 16, 21, 23 en 24 zijn opgelost in v0.2.3.
// Draait onderaan <body> (layouts/_partials/scripts.html), CSP-veilig.
// ============================================================================
(function () {
  'use strict'

  // --- Bevinding 9: zoekterm-markering wordt niet aangekondigd (4.1.3 AA) ----
  // De meldbalk is een live region die bij lading `hidden` is; wijzigingen daarin
  // worden dan meestal niet aangekondigd. Deze region staat er vanaf het begin en
  // neemt de tekst over. (De <mark>-elementen zelf vragen een thema-wijziging.)
  var bar = document.getElementById('highlight-bar')
  if (bar && 'MutationObserver' in window) {
    var region = document.createElement('p')
    region.className = 'visually-hidden'
    region.setAttribute('role', 'status')
    document.body.appendChild(region)

    new MutationObserver(function () {
      region.textContent = bar.hidden ? 'De markering van de zoekterm is verwijderd.' : bar.textContent.trim()
    }).observe(bar, { attributes: true, attributeFilter: ['hidden'] })
  }
})()
