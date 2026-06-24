// Genereert assets/js/pdf-assets.js: base64-vfs (RO Sans fonts + logo) en de
// pdfMake-fontmap, als globals op window.TKPDF (de bundel is geen ES-module).
// Re-run alleen als fonts/logo wijzigen:  node scripts/build-pdf-assets.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (p) => readFileSync(join(root, p)).toString('base64')

const vfs = {
  'ro-sans-regular.ttf': b64('assets/fonts/ro-sans-regular.ttf'),
  'ro-sans-bold.ttf': b64('assets/fonts/ro-sans-bold.ttf'),
  'ro-sans-italic.ttf': b64('assets/fonts/ro-sans-italic.ttf'),
  'ro-logo.png': b64('assets/images/ro-logo.png')
}

const fonts = {
  ROSans: {
    normal: 'ro-sans-regular.ttf',
    bold: 'ro-sans-bold.ttf',
    italics: 'ro-sans-italic.ttf',
    bolditalics: 'ro-sans-bold.ttf'
  }
}

const out = `// GEGENEREERD door scripts/build-pdf-assets.mjs - niet handmatig bewerken.
(function () {
  var vfs = ${JSON.stringify(vfs)};
  var fonts = ${JSON.stringify(fonts)};
  window.TKPDF = window.TKPDF || {};
  window.TKPDF.PDF_VFS = vfs;
  window.TKPDF.PDF_FONTS = fonts;
  window.TKPDF.PDF_LOGO = 'data:image/png;base64,' + vfs['ro-logo.png'];
})();
`
writeFileSync(join(root, 'assets/js/pdf-assets.js'), out)
console.log('pdf-assets.js geschreven (' + out.length + ' bytes)')
