// Laadt het non-module browserscript html-to-pdfmake.js in DEZE realm
// (via new Function, niet vm) zodat de gemaakte objecten dezelfde
// Object-prototype delen en deepStrictEqual cross-realm-vrij is.
import { readFileSync } from 'node:fs'
const src = readFileSync(new URL('../../assets/js/html-to-pdfmake.js', import.meta.url), 'utf8')
globalThis.window = globalThis.window || globalThis
// eslint-disable-next-line no-new-func
new Function(src)()
export const elementToPdfContent = globalThis.window.TKPDF.elementToPdfContent
