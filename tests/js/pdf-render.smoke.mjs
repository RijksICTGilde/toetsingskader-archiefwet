import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'
import { DOMParser, parseHTML } from 'linkedom'
const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8')

// Build doc-definition with our browser code (separate realm helper)
const { document } = parseHTML('<!DOCTYPE html><html><body></body></html>')
globalThis.window = globalThis; globalThis.document = document; globalThis.DOMParser = DOMParser
let captured = null
globalThis.addVirtualFileSystem = () => {}; globalThis.addFonts = () => {}
globalThis.createPdf = (dd) => { captured = dd; return { download() {} } }
new Function(read('assets/js/pdf-assets.js'))()
new Function(read('assets/js/html-to-pdfmake.js'))()
new Function(read('assets/js/pdf-export.js'))()
function build(json){ captured=null; globalThis.fetch=async()=>({ok:true,json:async()=>json}); const a=document.createElement('a'); a.setAttribute('data-pdf-url','/x'); document.body.appendChild(a); a.click(); return new Promise(r=>setTimeout(r,50)).then(()=>captured) }

// Load vendored pdfMake in a vm sandbox with node Buffer/timers
const sandbox = { navigator:{userAgent:'node'}, document:{createElement:()=>({style:{},setAttribute(){},appendChild(){}}),documentElement:{}}, setTimeout, clearTimeout, setInterval, clearInterval, console, Buffer, process, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Math, Date }
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox
vm.createContext(sandbox)
vm.runInContext(read('assets/lib/pdfmake/pdfmake.min.js'), sandbox)
// load our assets into sandbox too (vfs/fonts)
vm.runInContext(read('assets/js/pdf-assets.js'), sandbox)

async function renderVendored(json, out){
  const dd = await build(json)
  // De echte header-functie (uit pdf-export.js) gebruiken — die test de
  // werkelijke logo-opmaak. Hij refereert outer window.TKPDF.PDF_LOGO_SVG
  // (een string), wat prima door de sandbox-pdfMake gerenderd wordt.
  return await new Promise((resolve,reject)=>{
    try {
      sandbox.addVirtualFileSystem(sandbox.window.TKPDF.PDF_VFS)
      sandbox.addFonts(sandbox.window.TKPDF.PDF_FONTS)
      sandbox.createPdf(dd).getBuffer((buf)=>{ const b=Buffer.from(buf); writeFileSync(out,b); resolve(b) })
    } catch(e){ reject(e) }
  })
}
for (const [name,file,out] of [['norm','public/normen/01-beheer/index.pdf.json','/tmp/norm.pdf'],['kader','public/normen/index.pdf.json','/tmp/kader.pdf']]) {
  try { const b = await renderVendored(JSON.parse(read(file)), out); console.log(name, b.length, 'bytes', b.slice(0,5).toString()==='%PDF-'?'PDF OK':'NOT PDF') }
  catch(e){ console.log(name,'render error:', e.message) }
}
