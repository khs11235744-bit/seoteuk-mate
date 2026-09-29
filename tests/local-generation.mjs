import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
globalThis.window=globalThis;
globalThis.localStorage={
  _m:new Map(),
  getItem(k){return this._m.has(k)?this._m.get(k):null},
  setItem(k,v){this._m.set(k,String(v))},
  removeItem(k){this._m.delete(k)}
};
globalThis.SEOTEUK_RUNTIME={
  id:'local',localOnly:true,model:'khs-ax7b6k:latest',
  ollamaBase:'http://127.0.0.1:8767/ollama'
};
globalThis.KHSFlowBridge={
  async route(kind,requiresVision){
    const r=await fetch('http://127.0.0.1:8767/flow/api/route',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({projectId:'seoteuk',kind,operation:'inspect',risk:'low',requiresVision})
    });
    return r.json();
  }
};

await import(pathToFileURL(path.join(root,'official-lite.js')).href+'?t='+Date.now());
await import(pathToFileURL(path.join(root,'evaluator-lite.js')).href+'?t='+Date.now());
await import(pathToFileURL(path.join(root,'local-core.js')).href+'?t='+Date.now());
const C=globalThis.SeoteukLocalCore;
assert.ok(C);
const input={
  no:'9999',name:'가상학생A',subject:'한국사',category:'교과세특',targetBytes:600,
  activity:'물산장려운동 관련 포항 지역 자료를 읽고 주장과 근거를 표로 비교함.',
  observation:'자료 작성 시점과 작성 주체를 구분해야 한다고 스스로 기준을 제시함.',
  output:'지역 사례와 전국적 운동의 공통점·차이점을 정리한 비교표를 작성함.',
  feedback:'처음에는 모든 자료를 같은 성격으로 묶었으나 교사 피드백 뒤 관공서 자료와 신문 자료를 구분해 표를 수정함.'
};
const strength=C.evidenceStrength(input);
assert.equal(strength.ready,true);
const result=await C.generate(input);
assert.ok(result.text.length>30);
assert.ok(C.bytes(result.text)<=600,'must be <=600B');
assert.ok(!result.text.includes(input.name),'student name must not appear');
assert.equal(result.flowRoute?.executionAuthorized,false);
assert.equal(result.flowRoute?.selected,'localBrain');
assert.ok(result.validation.evaluator,'existing v3.8 evaluator core must run');
assert.equal(globalThis.__SEOTEUK_OFFICIAL_LITE__,true);
assert.equal(globalThis.__SEOTEUK_EVALUATOR_LITE__,true);
const forbidden=['수상','대회','논문을 작성','책을 읽'];
for(const word of forbidden)assert.ok(!result.text.includes(word),'invented unsupported phrase '+word);
console.log(JSON.stringify({
  status:'LOCAL_GENERATION_PASS',
  bytes:C.bytes(result.text),
  ms:result.ms,
  validation:result.validation,
  flow:{selected:result.flowRoute?.selected,executionAuthorized:result.flowRoute?.executionAuthorized},
  text:result.text
},null,2));
