// "Terug naar boven"-knop tonen zodra er meer dan een schermhoogte is
// gescrold. De knop staat in de HTML met `hidden`; zonder JS blijft hij dus
// weg, mét JS verschijnt hij alleen waar hij nut heeft. Geen afhankelijkheden,
// geen ES-modules (plain 'self'-script, CSP-veilig).
(function () {
  var btn = document.querySelector('.to-top')
  if (!btn) return

  var ticking = false

  function update() {
    ticking = false
    var scrolled = window.scrollY || document.documentElement.scrollTop
    btn.hidden = scrolled < window.innerHeight
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(update)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
})();
