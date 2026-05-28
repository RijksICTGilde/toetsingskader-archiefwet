import { cp, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const NLDD = 'node_modules/@nldd/design-system/dist';

if (!existsSync(NLDD)) {
  console.error(`Missing ${NLDD}. Run "npm install" first.`);
  process.exit(1);
}

console.log('Cleaning previous NLDD vendor output…');
await rm('assets/css/nldd', { recursive: true, force: true });
await rm('static/fonts/nldd', { recursive: true, force: true });

console.log('Copying NLDD CSS…');
await cp(`${NLDD}/css`, 'assets/css/nldd', { recursive: true });

console.log('Copying NLDD fonts to static/ (served directly, no Pipes needed)…');
await cp(`${NLDD}/fonts`, 'static/fonts/nldd', { recursive: true });

// Post-process settings.css:
//   1. Strip `@import "./palettes.generated.css"` — bundled separately by head.html,
//      and the @import path would 404 at runtime.
//   2. Strip `@font-face` blocks — URLs use ../fonts/ which after Hugo bundling
//      resolves to /fonts/ (no basepath), missing our /fonts/nldd/ subdir. Theme's
//      head.html declares @font-face with Hugo-relURL'ed paths instead.
console.log('Post-processing settings.css (strip @import + @font-face for Hugo-compatible bundling)…');
const settingsPath = 'assets/css/nldd/settings.css';
let settings = await readFile(settingsPath, 'utf8');
settings = settings
  .replace(/^@import\s+["']\.\/palettes\.generated\.css["'];?\s*$/m, '')
  .replace(/@font-face\s*\{[^}]*\}\s*/g, '');
await writeFile(settingsPath, settings);

const pkg = JSON.parse(
  await readFile('node_modules/@nldd/design-system/package.json', 'utf8')
);
await writeFile('assets/css/nldd/VERSION.txt', `${pkg.version}\n`);

console.log(`✓ Vendored @nldd/design-system@${pkg.version}`);
