// ============================================================================
// Toegankelijkheidspatches op het thema (hugo-theme-rijksoverheid v0.1.0)
//
// TIJDELIJK. Elk blok hieronder repareert een defect dat in het thema hoort te
// worden opgelost; zie docs/toegankelijkheidsonderzoek-2026-08.md voor de
// analyse en het bevindingsnummer. Zodra een fix upstream is gemerged en het
// thema is bijgewerkt (`just update-theme`), hoort het bijbehorende blok hier
// weg.
//
// Het script draait aan het eind van <body> (zie layouts/_partials/scripts.html)
// en is CSP-veilig ('self', geen inline code).
// ============================================================================
(function () {
  'use strict'

  // --- Bevinding 16: skip-link verplaatst de focus niet (WCAG 2.4.1 A) -------
  // De skip-link wijst naar <main id="main-content"> zonder tabindex="-1".
  // Zonder dat attribuut springt de scrollpositie wel, maar de focus — en
  // daarmee de leespositie van een schermlezer — niet in alle browsers.
  var main = document.getElementById('main-content')
  if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')

  // --- Bevinding 21: aria-label dekt de zichtbare tekst niet (WCAG 2.5.3 A) --
  // De zoekknop toont "Zoeken..." plus "/", maar heeft aria-label="Zoeken";
  // 2.5.3 eist dat de zichtbare tekst ín de toegankelijke naam zit. Zonder het
  // attribuut klopt de naam vanzelf. De icoon-only knop op mobiel heeft geen
  // zichtbare tekst en houdt zijn label dus.
  var triggers = document.querySelectorAll('.search-trigger[aria-label]')
  for (var t = 0; t < triggers.length; t++) {
    if (triggers[t].textContent.trim() !== '') triggers[t].removeAttribute('aria-label')
  }

  // --- Bevinding 24: genest navigatielandmark (WCAG 1.3.1 A) ----------------
  // Het mobiele menu is een <div role="navigation"> binnen <nav id="main-nav">.
  // Een navigatielandmark in een navigatielandmark maakt de landmarklijst
  // onbetrouwbaar; het label verhuist naar de <ul> is niet nodig — de knop
  // ernaast draagt de state al.
  var mobileMenu = document.getElementById('mobile-menu')
  if (mobileMenu && mobileMenu.closest('nav')) {
    mobileMenu.removeAttribute('role')
    mobileMenu.removeAttribute('aria-label')
  }

  // --- Bevinding 24 (vervolg): Escape sluit het mobiele menu ----------------
  // De thema-handler wisselt alleen aria-expanded; er is geen Escape-afhandeling
  // en geen focusherstel naar de knop die het menu opende.
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
  // search.js opent het zoekvenster op één enkel teken, sitebreed. 2.1.4 vraagt
  // één van drie dingen: de sneltoets uit kunnen zetten, hem kunnen wijzigen,
  // óf hem alleen actief laten zijn wanneer de focus op het bijbehorende
  // component staat. Deze listener implementeert de derde optie: in de
  // capture-fase op document vuurt hij vóór de thema-listener (die in de
  // bubble-fase op document zit) en stopt de propagatie zodra de focus ergens
  // anders staat dan op de zoekknop. Typen in een invoerveld blijft ongemoeid.
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
  // render-link.html zet target="_blank" op alle externe links; de enige
  // aanduiding is een CSS-icoon zonder tekstalternatief. Het thema kent het
  // patroon wél (bij besloten links voegt het een .visually-hidden-span toe),
  // maar past het hier niet toe.
  var externals = document.querySelectorAll('a[target="_blank"]')
  for (var x = 0; x < externals.length; x++) {
    var link = externals[x]
    if (link.querySelector('.visually-hidden')) continue
    if (link.getAttribute('aria-label')) continue
    var note = document.createElement('span')
    note.className = 'visually-hidden'
    note.textContent = ' (opent in een nieuw venster)'
    link.appendChild(note)
  }

  // --- Bevinding 9: zoekterm-markering wordt niet aangekondigd (4.1.3 AA) ----
  // De meldbalk van het thema is een live region die bij paginalading `hidden`
  // is (display: none) en daarna zichtbaar wordt gemaakt. Schermlezers kondigen
  // wijzigingen in een live region die op dat moment niet gerenderd was
  // doorgaans niet aan. Deze region staat er vanaf de lading wél, en neemt de
  // tekst van de meldbalk over zodra die verschijnt. (De <mark>-elementen zelf
  // blijven onaangekondigd; dat vraagt een thema-wijziging.)
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
