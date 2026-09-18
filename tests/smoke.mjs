import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const VERSION='3.5.0';

const required=[
  'index.html','evidence-fusion.js','student-workspace.js','analytics-dashboard.js',
  'local-tools-admissions.js','teacher-ux.js','editor-live-inspector.js',
  'firebase-cloud.js','official-2026.js','sw.js','vercel.json','package.json',
  'vendor/tailwind.js','vendor/xlsx.full.min.js','vendor/pdf.min.js','vendor/pdf.worker.min.js'
];
for(const p of required)assert.ok(exists(p),`missing: ${p}`);

const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,VERSION,'package version mismatch');
assert.match(read('VERSION.txt'),new RegExp(`v${VERSION.replaceAll('.','\\.')}`));

const index=read('index.html');
for(const p of ['evidence-fusion','student-workspace','analytics-dashboard','local-tools-admissions','teacher-ux','editor-live-inspector']){
  assert.ok(index.includes(`./${p}.js?v=${VERSION}`),`index cache-buster mismatch: ${p}`);
}
assert.ok(index.includes('v3.5.0'),'index version missing');
for(const localAsset of ['./vendor/tailwind.js','./vendor/xlsx.full.min.js','./vendor/pdf.min.js','./vendor/pdf.worker.min.js']){
  assert.ok(index.includes(localAsset),`local vendor reference missing: ${localAsset}`);
}
const teacher=read('teacher-ux.js');
const live=read('editor-live-inspector.js');
const cloud=read('firebase-cloud.js');
const workspace=read('student-workspace.js');
const official=read('official-2026.js');
const sw=read('sw.js');

assert.ok(teacher.includes("const VERSION='3.5.0'"),'teacher version mismatch');
assert.ok(live.includes("const VERSION='3.5.0'"),'live inspector version mismatch');
assert.ok(live.includes('scanOfficial2026'),'official live scan disconnected');
assert.ok(live.includes('SIM_STOP'),'similarity stopword filter missing');
assert.ok(live.includes('seoteuk:class-records-ready'),'class-record refresh event missing');

assert.ok(cloud.includes('loadAllStudentRecords'),'cloud class preload missing');
assert.ok(cloud.includes('cloudBaseUpdatedAt'),'cloud revision marker missing');
assert.ok(cloud.includes('cloudConflicts.v35'),'cloud conflict backup missing');
assert.ok(workspace.includes('mergeAllCloudRecords'),'workspace cloud merge missing');
assert.ok(workspace.includes('cloudBaseUpdatedAt'),'workspace cloud revision persistence missing');
assert.ok(teacher.includes('openCloudConflicts35'),'conflict recovery UI missing');
assert.ok(official.includes('window.scanOfficial2026=officialScan'),'official scan export missing');

assert.ok(sw.includes('seoteukmate-v350-'),'service worker cache version mismatch');
assert.ok(sw.includes("'./teacher-ux.js'"),'teacher ux missing from cache');
assert.ok(sw.includes("'./editor-live-inspector.js'"),'live inspector missing from cache');

for(const bad of ['<<<<<<<','=======\n','>>>>>>>']) {
  for(const p of required)assert.ok(!read(p).includes(bad),`merge marker found in ${p}`);
}
console.log('SMOKE PASS',VERSION);
