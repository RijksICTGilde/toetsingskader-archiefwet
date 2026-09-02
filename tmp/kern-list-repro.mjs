import { TaggedPdf, laadFonts, laadBriefhoofd } from '../scripts/pdf-tagged.mjs'
import { schrijfNorm } from '../scripts/pdf-html.mjs'
const fonts = laadFonts(), briefhoofdSvg = laadBriefhoofd()
const data = {
  kind: 'norm', titel: '9. Test', norm_id: '9',
  kern_html: '<ul><li>alleen een lijst als kern</li></ul>',
  kern_bron_html: '',
  body_html: '<h2 id="t">Toelichting</h2><p>Zie <a href="#kern">de kern</a>.</p>',
  url: 'https://example.org/normen/09-test/', site_url: 'https://example.org/',
  site_titel: 'T', versie: 'v0', taal: 'nl',
}
const pdf = new TaggedPdf({ titel: 'T', taal: 'nl', versie: 'v0', fonts, briefhoofdSvg })
pdf.nieuwePagina()
try {
  schrijfNorm(pdf, data, { siteUrl: data.site_url, paginaUrl: data.url, bladwijzer: pdf.doc.outline })
  await pdf.einde()
  console.log('OK: geen fout')
} catch (e) { console.log('FOUT:', e.message.slice(0, 140)) }
