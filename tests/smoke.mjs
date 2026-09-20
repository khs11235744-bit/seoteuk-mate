import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const pkg=JSON.parse(read('package.json'));
const VERSION=pkg.version;
assert.equal(VERSION,'3.6.0','package version mismatch');
const required=[
  'index.html','evidence-fusion.js','student-workspace.js','analytics-dashboard.js',
  'local-tools-admissions.js','teacher-ux.js','teacher-demo-v35.js','editor-live-inspector.js',
  'student-record-suite-v36.js','record-writers-v36.js','firebase-cloud.js','official-2026.js',
  'sw.js','vercel.json','package.json','vendor/tailwind.js','vendor/xlsx.full.min.js',
  'vendor/pdf.min.js','vendor/pdf.worker.min.js'
];
for(const p of required)assert.ok(exists(p),`missing: ${p}`);
assert.match(read('VERSION.txt'),/v3\.6\.0/,'VERSION.txt mismatch');
const index=read('index.html');
assert.ok(index.includes('v3.6.0'),'index version missing');
for(const p of ['student-record-suite-v36','record-writers-v36','teacher-ux','editor-live-inspector'])
  assert.ok(index.includes(`./${p}.js?v=3.6.0`),`v3.6 cache-buster mismatch: ${p}`);
for(const p of ['evidence-fusion','student-workspace','analytics-dashboard','local-tools-admissions','teacher-demo-v35'])
  assert.ok(index.includes(`./${p}.js`),`index script missing: ${p}`);
for(const asset of ['./vendor/tailwind.js','./vendor/xlsx.full.min.js','./vendor/pdf.min.js','./vendor/pdf.worker.min.js'])
  assert.ok(index.includes(asset),`local vendor reference missing: ${asset}`);
const teacher=read('teacher-ux.js'),live=read('editor-live-inspector.js');
const suite=read('student-record-suite-v36.js'),writers=read('record-writers-v36.js');
const cloud=read('firebase-cloud.js'),workspace=read('student-workspace.js'),official=read('official-2026.js'),sw=read('sw.js');
assert.ok(teacher.includes("const VERSION='3.6.0'"),'teacher version mismatch');
assert.ok(live.includes("const VERSION='3.6.0'"),'live inspector version mismatch');
assert.ok(live.includes('scanOfficial2026')&&live.includes('SIM_STOP'),'live inspector safeguards missing');
assert.ok(cloud.includes('loadAllStudentRecords')&&cloud.includes('cloudBaseUpdatedAt'),'cloud sync safeguards missing');
assert.ok(workspace.includes('mergeAllCloudRecords'),'workspace cloud merge missing');
assert.ok(official.includes('window.scanOfficial2026=officialScan'),'official scan export missing');
for(const major of ['건축공학과','국어국문학과','의예과'])assert.ok(suite.includes(major),`demo major missing: ${major}`);
for(const area of ['교과세특','자율·자치활동','동아리활동','진로활동','행동특성·종합의견'])assert.ok(writers.includes(area),`writer area missing: ${area}`);
assert.ok(sw.includes('seoteukmate-v360-'),'service worker cache version mismatch');
assert.ok(sw.includes("'./student-record-suite-v36.js'")&&sw.includes("'./record-writers-v36.js'"),'v3.6 scripts missing from cache');
for(const bad of ['<<<<<<<','=======\n','>>>>>>>'])for(const p of required)assert.ok(!read(p).includes(bad),`merge marker found in ${p}`);
console.log('SMOKE PASS',VERSION);