// Aanvulling op toc.js van het thema voor pagina's die de inhoudsopgave open
// renderen (`toc_open: true` via article.html, en normen/single.html): de server
// rendert de inhoudsopgave open, maar
// wie hem eerder heeft dichtgeklapt (localStorage "toc-open" = "false") krijgt
// hem ook hier dicht. Het thema herstelt alleen de "true"-voorkeur.
// Upstream-kandidaat: dit in toc.js zelf. Draait ná toc.js in de bundel.
(function () {
  var toc = document.getElementById('toc');
  var button = document.querySelector('.toc-toggle');
  if (!toc || !button || !toc.classList.contains('is-open')) return;
  var saved = null;
  try { saved = localStorage.getItem('toc-open'); } catch (e) { return; }
  if (saved !== 'false') return;
  toc.classList.remove('is-open');
  button.setAttribute('aria-expanded', 'false');
  var label = button.querySelector('.visually-hidden');
  if (label) label.textContent = 'Inhoudsopgave tonen';
})();
