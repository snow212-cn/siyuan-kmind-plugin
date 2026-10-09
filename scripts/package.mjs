import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const outDir = path.join(root, 'dist-package');
const archive = path.join(outDir, 'package.zip');
if (!fs.existsSync(path.join(dist, 'index.js')) || !fs.existsSync(path.join(dist, 'plugin.json'))) {
  throw new Error('Run npm run build and npm run verify before packaging');
}
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
execFileSync('zip', ['-q', '-r', archive, '.'], { cwd: dist, stdio: 'inherit' });
execFileSync('unzip', ['-t', archive], { stdio: 'inherit' });
const names = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
if (!names.includes('index.js') || !names.includes('plugin.json')) throw new Error('Install archive layout is invalid');
const sha256 = createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
fs.writeFileSync(path.join(outDir, 'SHA256SUMS.txt'), `${sha256}  package.zip\n`);
console.log(JSON.stringify({ archive, entries: names.length, bytes: fs.statSync(archive).size, sha256 }, null, 2));
