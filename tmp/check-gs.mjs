import fs from 'node:fs'
import { PDFDocument, PDFName } from 'pdf-lib'
const buf = fs.readFileSync('/tmp/claude-1000/-home-claude-projects/10a51470-2736-4d10-8349-4665f8f7cb24/scratchpad/pub-fresh/normen/index.pdf')
const doc = await PDFDocument.load(buf)
const ctx = doc.context
doc.getPages().forEach((p, i) => {
  const res = ctx.lookup(p.node.get(PDFName.of('Resources')))
  const eg = res && ctx.lookup(res.get(PDFName.of('ExtGState')))
  const keys = eg ? [...eg.dict.keys()].map(String) : []
  if (i < 3 || keys.length) console.log('page', i + 1, 'ExtGState:', keys.join(','))
})
// Pages root resources?
const root = ctx.lookup(doc.catalog.get(PDFName.of('Pages')))
console.log('Pages-root Resources:', String(root.get(PDFName.of('Resources')) || 'none'))
