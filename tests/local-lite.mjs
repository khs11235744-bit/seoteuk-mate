import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));

const required=['runtime-mode.js','flow-bridge.js','official-lite.js','evaluator-lite.js','local-core.js','lite-core.css','lite-app.js','lite.html','local.html','local-server.py','START_LOCAL_ONLY.bat','START_LITE.bat','START_FULL_LOCAL.bat','.khs/project.json','DEVCRAFT_GUARD.md'];
for(const p of required)assert.ok(exists(p),'missing '+p);

const local=read('local.html'),lite=read('lite.html'),runtime=read('runtime-mode.js'),flow=read('flow-bridge.js'),core=read('local-core.js'),ai=read('ai-providers.js'),index=read('index.html'),server=read('local-server.py');

for(const page of [local,lite]){
  assert.ok(page.includes('./runtime-mode.js'));
  assert.ok(page.includes('./official-lite.js'));
  assert.ok(page.includes('./evaluator-lite.js'));
  assert.ok(page.includes('./local-core.js'));
  assert.ok(page.includes('./lite-app.js'));
  assert.ok(!page.includes('knowledge-pack.js'),'lite/local must not eagerly load knowledge pack');
  assert.ok(!page.includes('firebase-cloud.js'),'lite/local must not load firebase');
  assert.ok(!page.includes('tesseract'),'lite/local must not load OCR');
  assert.ok(!page.includes('analytics-dashboard.js'),'lite/local must not load analytics');
}
assert.match(runtime,/khs-ax7b6k:latest/);
assert.match(runtime,/localOnly:true/);
assert.match(runtime,/location\.origin\+'\/ollama'/);
assert.match(flow,/metadata only/i);
assert.match(flow,/projectId:'seoteuk'/);
assert.ok(!flow.includes('studentText'));
assert.ok(!flow.includes('evidence:'));
assert.match(core,/INSUFFICIENT_EVIDENCE/);
assert.match(core,/6144/);
assert.match(core,/1500/);
assert.match(core,/KHSFlowBridge/);
assert.match(ai,/custom:'khs-ax7b6k:latest'/);
assert.match(ai,/num_ctx:6144/);
assert.ok(index.includes('./runtime-mode.js?v=3.9.0'));
assert.ok(index.includes('./flow-bridge.js?v=3.9.0'));

assert.match(server,/127\.0\.0\.1/);
assert.match(server,/OLLAMA = "http:\/\/127\.0\.0\.1:11434"/);
assert.match(server,/FLOW = "http:\/\/127\.0\.0\.1:13731"/);
assert.ok(!server.includes('0.0.0.0'));

const eagerLite=['lite.html','runtime-mode.js','flow-bridge.js','official-lite.js','evaluator-lite.js','local-core.js','lite-core.css','lite-app.js'].reduce((n,p)=>n+fs.statSync(path.join(root,p)).size,0);
const knowledgeSize=fs.statSync(path.join(root,'knowledge-pack.js')).size;
assert.ok(eagerLite<100_000,'lite eager bundle should stay under 100KB, got '+eagerLite);
assert.ok(knowledgeSize>10_000_000,'expected heavy knowledge pack baseline');

console.log('LOCAL/LITE PASS',{eagerLite,knowledgeSize,ratio:Number((eagerLite/knowledgeSize).toFixed(4))});
