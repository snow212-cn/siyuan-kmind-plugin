import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { patchFreeEdition } from './free-edition.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const upstream = JSON.parse(fs.readFileSync(path.join(root, 'upstream.json'), 'utf8'));
const cache = path.join(root, '.cache');
const archive = process.env.KMIND_UPSTREAM_ZIP
  ? path.resolve(process.env.KMIND_UPSTREAM_ZIP)
  : path.join(cache, `upstream-${upstream.version}.zip`);
fs.mkdirSync(cache, { recursive: true });

if (!fs.existsSync(archive)) {
  execFileSync('curl', ['--fail', '--location', '--silent', '--show-error', '--output', archive, upstream.url], { stdio: 'inherit' });
}
const actualHash = createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
if (actualHash !== upstream.sha256) {
  throw new Error(`Upstream SHA-256 mismatch: expected ${upstream.sha256}, got ${actualHash}`);
}

const entries = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
if (entries.some(name => name.startsWith('/') || name.startsWith('\\') || name.includes('\\') || name.split('/').includes('..'))) {
  throw new Error('Unsafe path found in upstream archive');
}
if (!entries.includes('index.js') || !entries.includes('plugin.json')) {
  throw new Error('Upstream archive does not match the expected SiYuan plugin layout');
}

const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
execFileSync('unzip', ['-q', archive, '-d', dist], { stdio: 'inherit' });

const indexPath = path.join(dist, 'index.js');
const transformed = patchFreeEdition(fs.readFileSync(indexPath, 'utf8'));
fs.writeFileSync(indexPath, transformed.source);
execFileSync(process.execPath, ['--check', indexPath], { stdio: 'inherit' });

for (const name of ['plugin.json', 'README.md', 'README.zh-CN.md', 'README.en.md', 'README_en_US.md', 'CHANGELOG.md', 'FREE_EDITION.md', 'LICENSE']) {
  fs.copyFileSync(path.join(root, name), path.join(dist, name));
}

const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'plugin.json'), 'utf8'));
if (manifest.version !== '2.14.2' || manifest.name !== 'kmind-plugin') {
  throw new Error(`Unexpected fork manifest: ${manifest.name}@${manifest.version}`);
}

const report = {
  edition: 'free',
  fork: 'snow212-cn/siyuan-kmind-plugin',
  upstreamRepository: upstream.repository,
  upstreamVersion: upstream.version,
  upstreamSHA256: actualHash,
  pluginVersion: manifest.version,
  sourceArchiveEntries: entries.length,
  transformation: transformed.report,
};
fs.writeFileSync(path.join(root, 'build-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
