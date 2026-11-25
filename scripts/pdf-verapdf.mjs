// PDF/UA-1-validatie met veraPDF, bovenop de eigen markers van
// pdf-ua-check.mjs: die meet wat deze pijplijn belooft, veraPDF de hele norm
// (ISO 14289-1) voor zover die machinaal te toetsen is.
//
// Gebruik:  node scripts/pdf-verapdf.mjs bestand.pdf [meer.pdf …]
//           (of: npm run test:pdf-verapdf)
//
// veraPDF komt uit $VERAPDF, standaard `verapdf` op het pad. In een container
// de repo op hetzelfde pad mounten, zodat de bestandsnamen binnen en buiten
// gelijk zijn (het image staat in .github/workflows/test.yml):
//   VERAPDF="podman run --rm -v $PWD:$PWD -w $PWD docker.io/verapdf/cli:v1.30.4" npm run test:pdf-verapdf
// Met SELinux (Fedora, de Podman-VM) komt er `:z` achter de mount, anders
// ziet veraPDF de map niet en vindt hij geen enkel bestand.
//
// Exit 1 bij elke mislukte controle in elk bestand, en ook als veraPDF een
// bestand niet heeft gevalideerd: een ontbrekend bestand slaat veraPDF
// zwijgend over.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Per bestand de uitkomst uit het JSON-rapport van veraPDF:
 * { bestand, fout, regels: [{ regel, aantal, beschrijving, plekken }] }.
 * `fout` is gezet als het bestand niet (volledig) gevalideerd is.
 */
export function beoordeel(rapport, bestanden) {
  const jobs = rapport?.report?.jobs || []
  return bestanden.map((bestand) => {
    const job = jobs.find((j) => path.resolve(j.itemDetails?.name || '') === path.resolve(bestand))
    if (!job) return { bestand, fout: 'niet in het rapport van veraPDF', regels: [] }
    const resultaat = (job.validationResult || []).find((v) => /PDF\/UA-1/.test(v.profileName || ''))
    if (!resultaat?.details) {
      return { bestand, fout: `niet gevalideerd tegen PDF/UA-1 (${job.taskException?.exceptionMessage || 'geen validatieresultaat'})`, regels: [] }
    }
    if (resultaat.jobEndStatus !== 'normal') return { bestand, fout: `validatie afgebroken (${resultaat.jobEndStatus})`, regels: [] }
    const regels = (resultaat.details.ruleSummaries || [])
      .filter((r) => r.status === 'failed' || r.failedChecks > 0)
      .map((r) => ({
        regel: `${r.clause}-${r.testNumber}`,
        aantal: r.failedChecks,
        beschrijving: r.description,
        plekken: (r.checks || []).filter((c) => c.status === 'failed').map((c) => c.context),
      }))
    if (!regels.length && resultaat.compliant !== true) return { bestand, fout: 'niet conform, maar zonder mislukte regel in het rapport', regels }
    return { bestand, regels }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bestanden = process.argv.slice(2)
  if (bestanden.length === 0) {
    console.error('Gebruik: node scripts/pdf-verapdf.mjs bestand.pdf [meer.pdf …]')
    process.exit(2)
  }
  const ontbrekend = bestanden.filter((b) => !fs.existsSync(b))
  if (ontbrekend.length) {
    for (const b of ontbrekend) console.error(`${b}: bestaat niet; is scripts/pdf-build.mjs gedraaid?`)
    process.exit(1)
  }

  const [cmd, ...voor] = (process.env.VERAPDF || 'verapdf').split(/\s+/).filter(Boolean)
  const uit = spawnSync(cmd, [...voor, '--flavour', 'ua1', '--format', 'json', ...bestanden], {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  })
  if (uit.error) {
    console.error(`veraPDF niet te starten (${cmd}): ${uit.error.message}`)
    console.error('Installeer veraPDF (https://verapdf.org) of zet VERAPDF, bijvoorbeeld op een container.')
    process.exit(2)
  }
  // 0: alles conform, 1: iets niet conform; al het andere is een fout van
  // veraPDF zelf.
  if (uit.status !== 0 && uit.status !== 1) {
    console.error(uit.stderr)
    console.error(`veraPDF stopte met exitcode ${uit.status}`)
    process.exit(2)
  }
  let rapport
  try {
    rapport = JSON.parse(uit.stdout)
  } catch (e) {
    console.error(uit.stderr)
    console.error(`geen JSON-rapport van veraPDF (${e.message})`)
    process.exit(2)
  }

  const versie = rapport.report?.buildInformation?.releaseDetails?.map((r) => `${r.id} ${r.version}`).join(', ')
  console.log(`veraPDF (${versie}), profiel PDF/UA-1\n`)
  let fouten = 0
  for (const { bestand, fout, regels } of beoordeel(rapport, bestanden)) {
    const aantal = regels.reduce((som, r) => som + r.aantal, 0)
    if (fout) {
      console.log(`${bestand}: ${fout}`)
      fouten++
      continue
    }
    console.log(`${bestand}: ${aantal} mislukte controle(s)`)
    for (const r of regels) {
      console.log(`    ${r.regel} (${r.aantal}x): ${r.beschrijving}`)
      for (const p of r.plekken.slice(0, 3)) console.log(`        ${p}`)
      if (r.aantal > 3) console.log(`        … en nog ${r.aantal - 3}`)
    }
    fouten += aantal
  }
  console.log(`\n${bestanden.length} PDF('s) gevalideerd, ${fouten} fout(en).`)
  process.exit(fouten > 0 ? 1 : 0)
}
