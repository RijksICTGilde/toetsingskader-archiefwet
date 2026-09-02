import fs from 'node:fs'
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } from 'pdf-lib'
const buf = fs.readFileSync('/tmp/claude-1000/-home-claude-projects/10a51470-2736-4d10-8349-4665f8f7cb24/scratchpad/pub-fresh/normen/index.pdf')
const doc = await PDFDocument.load(buf)
const ctx = doc.context
const cat = doc.catalog
const names = ctx.lookup(cat.get(PDFName.of('Names')))
const dests = ctx.lookup(names?.get(PDFName.of('Dests')))
// walk name tree
const out = {}
function walk(node) {
  node = ctx.lookup(node)
  const kids = node.get(PDFName.of('Kids'))
  if (kids) { for (const k of ctx.lookup(kids).asArray()) walk(k) ; return }
  const arr = ctx.lookup(node.get(PDFName.of('Names')))
  if (!arr) return
  const a = arr.asArray()
  for (let i = 0; i < a.length; i += 2) {
    const nm = a[i].decodeText ? a[i].decodeText() : String(a[i])
    const d = ctx.lookup(a[i+1])
    const target = d instanceof PDFArray ? d : ctx.lookup(d.get(PDFName.of('D')))
    const pageRef = target.get(0)
    out[nm] = pageRef
  }
}
walk(dests)
const pages = doc.getPages().map(p => p.ref)
const pageIndex = (ref) => pages.findIndex(r => r === ref || (r.objectNumber === ref.objectNumber && r.generationNumber === ref.generationNumber))
const normDests = Object.entries(out).filter(([n]) => /^norm-\d+$/.test(n))
for (const [n, ref] of normDests.sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true}))) {
  console.log(n, '-> page', pageIndex(ref) + 1)
}
console.log('total dests:', Object.keys(out).length, 'pages:', pages.length)
// sample some footnote dests
for (const [n, ref] of Object.entries(out).filter(([n]) => /fn:1$/.test(n)).slice(0,8)) console.log(n, '-> page', pageIndex(ref)+1)
