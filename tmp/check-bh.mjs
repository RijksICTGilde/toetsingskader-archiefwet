import fs from 'node:fs'
import { metUitgepakteStreams } from '../scripts/pdf-ua-check.mjs'
const buf = fs.readFileSync('/tmp/claude-1000/-home-claude-projects/10a51470-2736-4d10-8349-4665f8f7cb24/scratchpad/pub-fresh/normen/index.pdf')
const inhoud = metUitgepakteStreams(buf)
console.log('BH1 Do count:', (inhoud.match(/\/BH1 Do/g) || []).length)
console.log('XObject Form count:', (inhoud.match(/\/Subtype \/Form/g) || []).length)
// does the form xobject reference any named resources (gs, fonts)?
const gs = inhoud.match(/\/G[sS]\d+ gs/g); console.log('gs refs:', gs && gs.length)
// check footers
console.log('footer count:', (inhoud.match(/Pagina \d+ van \d+/g) || []).length)
