// Scroll-spy voor de "Op deze pagina"-TOC: highlight de sectie waar je bent.
//
// De scroll-spy van het thema (toc.js) kijkt naar álle h2/h3/h4[id], ook naar
// koppen zonder TOC-link; in zo'n blok verdwijnt de highlight. Deze versie volgt
// alleen de link-targets. Registratie op `load`, zodat hij van het thema wint.
(function () {
  function setup() {
    var toc = document.getElementById('toc');
    if (!toc) return;

    // TOC-links → doelkop, in documentvolgorde.
    var entries = [];
    toc.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var el = id && document.getElementById(id);
      if (el) entries.push({ link: link, el: el });
    });
    if (!entries.length) return;

    var ticking = false;
    function update() {
      ticking = false;
      var threshold = window.innerHeight * 0.25;
      var current = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].el.getBoundingClientRect().top <= threshold) current = entries[i];
        else break;
      }
      entries.forEach(function (e) { e.link.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  window.addEventListener('load', setup);
})();
