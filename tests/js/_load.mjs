// Laadt html-to-pdfmake.js in DEZE realm (new Function, geen vm), anders is
// deepStrictEqual niet cross-realm-veilig.
import { readFileSync } from 'node:fs'
const src = readFileSync(new URL('../../assets/js/html-to-pdfmake.js', import.meta.url), 'utf8')
globalThis.window = globalThis.window || globalThis
// eslint-disable-next-line no-new-func
new Function(src)()
export const elementToPdfContent = globalThis.window.TKPDF.elementToPdfContent
