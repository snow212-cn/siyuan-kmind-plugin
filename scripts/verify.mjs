import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'plugin.json'), 'utf8'));
const report = JSON.parse(fs.readFileSync(path.join(root, 'build-report.json'), 'utf8'));
const source = fs.readFileSync(path.join(dist, 'index.js'), 'utf8');

assert.equal(manifest.name, 'kmind-plugin', 'Plugin identity must be preserved for data compatibility');
assert.equal(manifest.version, '2.14.2');
assert.equal(manifest.author, 'snow212-cn');
assert.equal(manifest.url, 'https://github.com/snow212-cn/siyuan-kmind-plugin');
assert.match(manifest.displayName['zh-CN'], /免费维护版/);
assert.equal(report.transformation.licenseState, 'free-active-on-startup');
assert.equal(report.transformation.licenseCheck, 'always-success-without-network-validation');
assert.equal(report.transformation.proMenuItem, 'removed');
assert.match(source, /const p=Object\(r\["ref"\]\)\(!0\),f=Object\(r\["ref"\]\)\(!1\),m=Object\(r\["ref"\]\)\(\{type:"FREE",planType:"FREE"\}\),g=Object\(r\["ref"\]\)\("FREE"\),v=Object\(r\["ref"\]\)\(!1\)/);
assert.match(source, /x=async\(\)=>\{p\.value=!0;f\.value=!1;g\.value="FREE";v\.value=!1;m\.value=\{type:"FREE",planType:"FREE"\};return!0\},w=\(e,t\)=>\{/);
assert.doesNotMatch(source, /t\.addSeparator\(\),t\.addItem\(\{icon:"iconKMindVip",label:Object\(v\["d"\]\)\("menu\.kmindPro"\)/);
execFileSync(process.execPath, ['--check', path.join(dist, 'index.js')], { stdio: 'inherit' });

for (const file of ['README.md', 'README.zh-CN.md', 'README.en.md', 'README_en_US.md', 'FREE_EDITION.md', 'LICENSE']) {
  assert.ok(fs.existsSync(path.join(dist, file)), `Missing packaged metadata file: ${file}`);
}
assert.ok(fs.statSync(path.join(dist, 'index.js')).size > 1_000_000);
console.log(JSON.stringify({ result: 'PASS', plugin: `${manifest.name}@${manifest.version}`, syntax: 'valid', freeAuthorization: 'enabled', proMenu: 'removed', upstreamSHA256: report.upstreamSHA256 }, null, 2));
