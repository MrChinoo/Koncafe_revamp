import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = fileURLToPath(new URL('../site/', import.meta.url));
const files = readdirSync(site, { recursive: true }).filter(file => file.endsWith('.js'));
let failures = 0;

for (const file of files) {
  const absolute = path.join(site, file);
  const syntax = spawnSync(process.execPath, ['--check', absolute], { encoding: 'utf8' });
  if (syntax.status !== 0) {
    console.error(`${file}: ${syntax.error?.message || syntax.stderr}`);
    failures++;
  }
  const source = readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    if (!existsSync(path.resolve(path.dirname(absolute), match[1]))) {
      console.error(`${file}: no existe el módulo ${match[1]}`);
      failures++;
    }
  }
}

if (files.length === 0) {
  console.error('No se encontraron módulos JavaScript; no se validó la aplicación.');
  failures++;
}
console.log(`${files.length} módulos comprobados; ${failures} fallos.`);
process.exitCode = failures ? 1 : 0;
