import fs from 'node:fs'
import zlib from 'node:zlib'
const buf = fs.readFileSync('/tmp/claude-1000/-home-claude-projects/10a51470-2736-4d10-8349-4665f8f7cb24/scratchpad/pub-fresh/normen/index.pdf')
const s = buf.toString('latin1')
// find the Form XObject object
const idx = s.indexOf('/Subtype /Form')
const objStart = s.lastIndexOf('obj', idx)
const streamStart = s.indexOf('stream', idx)
const dict = s.slice(objStart, streamStart)
console.log('=== Form XObject dict ===')
console.log(dict.replace(/\s+/g, ' ').slice(0, 500))
let st = streamStart + 'stream'.length
if (s[st] === '\r') st++
if (s[st] === '\n') st++
const end = s.indexOf('endstream', st)
let content
try { content = zlib.inflateSync(buf.subarray(st, end)).toString('latin1') } catch (e) { content = buf.subarray(st, end).toString('latin1') }
console.log('=== stream length:', content.length)
console.log('gs ops inside form:', (content.match(/\/G[sS]\d+ gs/g) || []).length)
console.log('other named refs inside form:', (content.match(/\/[A-Za-z]\w* (Do|gs|Tf|scn|SCN)/g) || []).slice(0,10))
console.log('first 200 chars:', JSON.stringify(content.slice(0, 200)))
