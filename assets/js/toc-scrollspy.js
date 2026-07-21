// Scroll-spy voor de "Op deze pagina"-TOC: highlight de sectie waar je bent.
//
// Het thema heeft een eigen scroll-spy (toc.js), maar die kijkt naar álle
// h2/h3/h4[id]-koppen — óók de voorschrift/criteria/indicatoren (h4) die niet in
// de TOC staan, en niet naar de Toelichting (die is een <summary>, geen <h2>).
// Zit je in een h4-blok, dan vindt het thema geen TOC-link en verdwijnt de
// highlight (sporadisch, springerig gedrag).
//
// Deze versie kijkt alléén naar koppen die écht een TOC-link hebben (de
// link-targets), zodat de actieve sectie vloeiend meeloopt. Registratie op
// `load` zodat hij ná de thema-scroll-spy draait en wint.
(function () {
  function setup() {
    var toc = document.getElementById('toc');
    if (!toc) return;

    // TOC-links → hun doelkop, in documentvolgorde.
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
