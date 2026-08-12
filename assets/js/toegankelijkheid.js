// ============================================================================
// Toegankelijkheidspatches op het thema (hugo-theme-rijksoverheid v0.2.0)
//
// TIJDELIJK. Elk blok repareert een themadefect; analyse en bevindingsnummers in
// docs/toegankelijkheidsonderzoek-2026-08.md. Blok weg zodra de fix upstream zit.
// Draait onderaan <body> (layouts/_partials/scripts.html), CSP-veilig.
// ============================================================================
(function () {
  'use strict'

  // --- Bevinding 16: skip-link verplaatst de focus niet (WCAG 2.4.1 A) -------
  // Zonder tabindex="-1" op <main> springt de scrollpositie wel mee, de focus
  // niet — en dus ook de leespositie van een schermlezer niet.
  var main = document.getElementById('main-content')
  if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')

  // --- Bevinding 21: aria-label dekt de zichtbare tekst niet (WCAG 2.5.3 A) --
  // De zoekknop toont "Zoeken..." maar heet "Zoeken"; zonder aria-label klopt de
  // naam vanzelf. De icoon-only knop op mobiel houdt zijn label.
  var triggers = document.querySelectorAll('.search-trigger[aria-label]')
  for (var t = 0; t < triggers.length; t++) {
    if (triggers[t].textContent.trim() !== '') triggers[t].removeAttribute('aria-label')
  }

  // --- Bevinding 24: genest navigatielandmark (WCAG 1.3.1 A) ----------------
  // <div role="navigation"> binnen <nav> maakt de landmarklijst onbetrouwbaar.
  // Het label kan weg: de knop ernaast draagt de state al.
  var mobileMenu = document.getElementById('mobile-menu')
  if (mobileMenu && mobileMenu.closest('nav')) {
    mobileMenu.removeAttribute('role')
    mobileMenu.removeAttribute('aria-label')
  }

  // --- Bevinding 24 (vervolg): Escape sluit het mobiele menu ----------------
  // De thema-handler wisselt alleen aria-expanded: geen Escape, geen focusherstel.
  var menuToggle = document.querySelector('.navbar .toggle')
  if (menuToggle) {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return
      menuToggle.click()
      menuToggle.focus()
    })
  }

  // --- Bevinding 10: sneltoets "/" is niet uit te zetten (WCAG 2.1.4 A) ------
  // search.js opent het zoekvenster sitebreed op één teken. Van de drie opties
  // die 2.1.4 biedt kiezen we "alleen actief bij focus op het component": deze
  // capture-listener vuurt vóór die van het thema en stopt de propagatie zodra de
  // focus elders staat. Typen in een invoerveld blijft ongemoeid.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/') return
    var el = document.activeElement
    if (!el) return
    var isTyping = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
    if (isTyping) return
    if (el.closest && el.closest('.search-trigger')) return
    e.stopPropagation()
  }, true)

  // --- Bevinding 23: externe links openen een nieuw venster (WCAG 1.3.1 A) ---
  // render-link.html zet target="_blank" met alleen een CSS-icoon als aanduiding.
  // Bij besloten links doet het thema dit wél goed, hier niet.
  var NIEUW_VENSTER = ' (opent in een nieuw venster)'
  var externals = document.querySelectorAll('a[target="_blank"]')
  for (var x = 0; x < externals.length; x++) {
    var link = externals[x]
    // Alleen onze eigen melding overslaan: het thema zet .visually-hidden ook op
    // " (besloten omgeving)", en die links hebben net zo goed target="_blank".
    if (link.querySelector('.nieuw-venster-melding')) continue
    var label = link.getAttribute('aria-label')
    if (label) {
      // Een aria-label overschrijft onderliggende tekst, dus een extra <span>
      // wordt niet voorgelezen; de melding moet in het label. Achteraan, zodat de
      // zichtbare tekst het label blijft beginnen (2.5.3).
      if (label.indexOf(NIEUW_VENSTER) === -1) {
        link.setAttribute('aria-label', label + NIEUW_VENSTER)
      }
      continue
    }
    var note = document.createElement('span')
    note.className = 'visually-hidden nieuw-venster-melding'
    note.textContent = NIEUW_VENSTER
    link.appendChild(note)
  }

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
