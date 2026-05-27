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

const pkg = JSON.parse(
  await readFile('node_modules/@nldd/design-system/package.json', 'utf8')
);
await writeFile('assets/css/nldd/VERSION.txt', `${pkg.version}\n`);

console.log(`✓ Vendored @nldd/design-system@${pkg.version}`);
