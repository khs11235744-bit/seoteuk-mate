/* Seoteuk Mate v3.4 — live editor quality inspector */
(function(){
'use strict';
if(window.__SEOTEUK_LIVE_INSPECTOR_V34__) return;
window.__SEOTEUK_LIVE_INSPECTOR_V34__=true;
const VERSION='3.4.0';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(_){return d}};
const bytes=t=>window.calculateNeisBytes?.(String(t||''))??new TextEncoder().encode(String(t||'')).length;
const RECORD_KEY='seoteukMate.workspaceRecords.v3';
const WORKSPACE_KEY='seoteukMate.workspace.v3';
let lastText=null,timer=null;

const FIX_RULES=[
 {id:'space2',label:'연속 공백',rx:/[ \t]{2,}/g,to:' '},
 {id:'punct',label:'문장부호 앞 공백',rx:/\s+([,.;:!?])/g,to:'$1'},
 {id:'can',label:'수 있다/없다',rx:/수(있|없)(다|음|는|도록|게)?/g,to:'수 $1$2'},
 {id:'about1',label:'에 대해',rx:/에대해/g,to:'에 대해'},
 {id:'about2',label:'에 대한',rx:/에대한/g,to:'에 대한'},
 {id:'through',label:'을/를 통해',rx:/([을를])통해/g,to:'$1 통해'},
 {id:'notOnly',label:'뿐만 아니라',rx:/뿐만아니라/g,to:'뿐만 아니라'},
 {id:'classTime',label:'수업 시간',rx:/수업시간/g,to:'수업 시간'},
 {id:'activity',label:'활동 과정',rx:/활동과정/g,to:'활동 과정'},
 {id:'research',label:'탐구 과정',rx:/탐구과정/g,to:'탐구 과정'},
 {id:'learning',label:'학습 과정',rx:/학습과정/g,to:'학습 과정'},
 {id:'solve',label:'문제 해결',rx:/문제해결/g,to:'문제 해결'},
 {id:'interest',label:'관심 분야',rx:/관심분야/g,to:'관심 분야'},
 {id:'career',label:'진로 분야',rx:/진로분야/g,to:'진로 분야'},
 {id:'thisProcess',label:'이/그 과정에서',rx:/(이|그)과정에서/g,to:'$1 과정에서'},
 {id:'throughThis',label:'이를 통해',rx:/이를통해/g,to:'이를 통해'},
 {id:'roleTypo',label:'역할',rx:/역활/g,to:'역할'},
 {id:'doTypo',label:'됐/되어',rx:/됬/g,to:'됐'},
 {id:'purpose',label:'하려고',rx:/할려고/g,to:'하려고'},
 {id:'means',label:'함으로써',rx:/하므로써/g,to:'함으로써'}
];

function tokens(s){return new Set((String(s||'').match(/[가-힣A-Za-z0-9]{2,}/g)||[]).map(x=>x.toLowerCase()))}
function sim(a,b){
 const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let n=0;A.forEach(x=>B.has(x)&&n++);
 return n/Math.min(A.size,B.size);
}
function sentences(t){return String(t||'').split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean)}
function spacingIssues(t){
 const out=[];
 for(const r of FIX_RULES){
  const rx=new RegExp(r.rx.source,r.rx.flags);
  const m=[...String(t||'').matchAll(rx)].slice(0,8);
  if(m.length)out.push({rule:r,count:m.length,samples:m.map(x=>x[0])});
 }
 return out;
}
function duplicateSentences(t){
 const ss=sentences(t),out=[];
 for(let i=0;i<ss.length;i++)for(let j=i+1;j<ss.length;j++){
  const score=sim(ss[i],ss[j]);if(score>=.72)out.push({a:ss[i],b:ss[j],score});
 }
 return out.sort((a,b)=>b.score-a.score).slice(0,5);
}
function getStudent(){return window.SeoteukWorkspace?.getCurrentStudent?.()||null}
function workspace(){return window.SeoteukWorkspace?.getWorkspace?.()||load(WORKSPACE_KEY,{students:[],classes:[],activeStudentId:''})}
function recordTexts(rec){
 const out=[],d=rec?.appState?.subjectData||{};
 for(const [sub,sems]of Object.entries(d))for(const [sem,vers]of Object.entries(sems||{}))for(const [ver,text]of Object.entries(vers||{})){
  if(String(text||'').trim())out.push({area:'교과세특',subject:sub,sem,ver,text:String(text).trim()});
 }
 const cd=rec?.categoryDrafts||{};
 for(const [area,sems]of Object.entries(cd))for(const [sem,vers]of Object.entries(sems||{}))for(const [ver,text]of Object.entries(vers||{})){
  if(String(text||'').trim())out.push({area,subject:'',sem,ver,text:String(text).trim()});
 }
 return out;
}
function liveTexts(){
 const out=[],d=window.subjectData||{};
 for(const [sub,sems]of Object.entries(d))for(const [sem,vers]of Object.entries(sems||{}))for(const [ver,text]of Object.entries(vers||{})){
  if(String(text||'').trim())out.push({area:'교과세특',subject:sub,sem,ver,text:String(text).trim()});
 }
 const cd=load('seoteukMate.v28.categoryDrafts',{});
 for(const [area,sems]of Object.entries(cd))for(const [sem,vers]of Object.entries(sems||{}))for(const [ver,text]of Object.entries(vers||{})){
  if(String(text||'').trim())out.push({area,subject:'',sem,ver,text:String(text).trim()});
 }
 return out;
}
function crossSimilarity(t){
 if(String(t||'').trim().length<50)return{same:[],classMatches:[]};
 const stu=getStudent(),allRecords=load(RECORD_KEY,{}),same=[],classMatches=[];
 for(const r of liveTexts()){
  if(r.text===t)continue;const score=sim(t,r.text);if(score>=.38)same.push({...r,score});
 }
 if(stu){
  const ws=workspace(),others=(ws.students||[]).filter(s=>s.id!==stu.id&&(!stu.classId||s.classId===stu.classId));
  for(const other of others){
   const rec=allRecords[other.id];
   for(const r of recordTexts(rec)){
    const score=sim(t,r.text);if(score>=.48)classMatches.push({...r,score,student:other});
   }
  }
 }
 same.sort((a,b)=>b.score-a.score);classMatches.sort((a,b)=>b.score-a.score);
 return{same:same.slice(0,5),classMatches:classMatches.slice(0,5)};
}
function behaviorScore(t){
 return (String(t||'').match(/작성|제작|발표|토론|비교|분석|조사|검토|설명|질문|기획|참여|구성|수정|해석|조율|제안|선정|탐색|확인/g)||[]).length;
}
function analysis(t){
 const b=bytes(t),spacing=spacingIssues(t),official=window.scanOfficial2026?.(t)||[],dups=duplicateSentences(t),cross=crossSimilarity(t),verbs=behaviorScore(t);
 const praise=(String(t).match(/매우\s*탁월|탁월함|완벽|압도적|최고|전문가\s*수준|매우 뛰어/g)||[]).length;
 return{b,spacing,official,dups,cross,verbs,praise};
}
function ensureUI(){
 const box=$('editor-raw-container'),ta=$('seoteuk-textarea');if(!box||!ta||$('sm34-live-wrap'))return;
 ta.setAttribute('spellcheck','true');ta.classList.add('min-h-0');
 const wrap=document.createElement('div');wrap.id='sm34-live-wrap';wrap.className='no-print flex-none mt-2 border border-slate-200 rounded-2xl bg-white overflow-hidden';
 wrap.innerHTML=`<div id="sm34-livebar" class="px-2.5 py-2 flex flex-wrap items-center gap-1.5 text-[10px]">
 <span class="font-black text-slate-700 mr-1">실시간 점검</span>
 <button id="sm34-byte" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-space" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-official" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-repeat" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-evidence" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-same" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-class" class="px-2 py-1 rounded-lg border font-black"></button>
 <button id="sm34-toggle" class="ml-auto px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-black">자세히 ▾</button></div>
 <div id="sm34-details" class="hidden border-t border-slate-100 p-3 max-h-52 overflow-y-auto custom-scrollbar text-[11px]"></div>`;
 box.appendChild(wrap);
 $('sm34-toggle').onclick=()=>{$('sm34-details').classList.toggle('hidden');$('sm34-toggle').textContent=$('sm34-details').classList.contains('hidden')?'자세히 ▾':'접기 ▴'};
 for(const id of ['sm34-space','sm34-official','sm34-repeat','sm34-evidence','sm34-same','sm34-class'])$(id).onclick=()=>{$('sm34-details').classList.remove('hidden');$('sm34-toggle').textContent='접기 ▴'};
 ta.addEventListener('input',schedule);
}
function chip(id,text,bad,level='warn'){
 const el=$(id);if(!el)return;el.textContent=text;
 const cls=bad?(level==='bad'?'bg-rose-50 text-rose-800 border-rose-200':'bg-amber-50 text-amber-800 border-amber-200'):'bg-emerald-50 text-emerald-700 border-emerald-200';
 el.className='px-2 py-1 rounded-lg border font-black '+cls;
}
function render(){
 ensureUI();const ta=$('seoteuk-textarea');if(!ta)return;const t=ta.value||'';lastText=t;const a=analysis(t);
 chip('sm34-byte',`${a.b.toLocaleString()} / 1,500B`,a.b>1500,a.b>1500?'bad':'warn');
 chip('sm34-space',`띄어쓰기 ${a.spacing.reduce((n,x)=>n+x.count,0)}`,a.spacing.length);
 chip('sm34-official',`기재주의 ${a.official.length}`,a.official.length,a.official.some(x=>x.severity==='hard')?'bad':'warn');
 chip('sm34-repeat',`반복 ${a.dups.length}`,a.dups.length);
 chip('sm34-evidence',`행동근거 ${a.verbs}`,t.trim()&&a.verbs<2);
 const same=a.cross.same[0]?.score||0,cls=a.cross.classMatches[0]?.score||0;
 chip('sm34-same',`내 기록 중복 ${Math.round(same*100)}%`,same>=.55);
 chip('sm34-class',`학급 유사 ${Math.round(cls*100)}%`,cls>=.65,cls>=.78?'bad':'warn');

 const details=[];
 if(a.spacing.length){
  details.push(`<div><b>가✓ 맞춤법·띄어쓰기 제안</b><div class="mt-1 flex flex-wrap gap-1">${a.spacing.map(x=>`<button onclick="sm34Fix('${x.rule.id}')" class="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">${esc(x.rule.label)} ×${x.count}</button>`).join('')}<button onclick="sm34FixAll()" class="px-2 py-1 bg-blue-600 text-white rounded-lg font-black">띄어쓰기 전체 적용</button></div></div>`);
 }
 if(a.official.length){
  details.push(`<div><b>🛡️ 2026 기재요령 점검</b><div class="mt-1 space-y-1">${a.official.map(x=>`<div class="p-2 rounded-lg ${x.severity==='hard'?'bg-rose-50 text-rose-900':'bg-amber-50 text-amber-900'}"><b>${esc(x.title)}</b> · <mark>${esc(x.match||'')}</mark><br><span class="text-[10px]">${esc(x.why||'맥락 확인 필요')}</span></div>`).join('')}</div></div>`);
 }
 if(a.praise)details.push(`<div class="p-2 bg-amber-50 rounded-lg"><b>추상 평가어 ${a.praise}회</b> — 실제 행동 근거가 바로 앞뒤에 있는지 확인하세요.</div>`);
 if(t.trim()&&a.verbs<2)details.push(`<div class="p-2 bg-amber-50 rounded-lg"><b>구체적인 행동 근거가 적음</b> — 작성·비교·분석·질문·발표·검토처럼 실제 관찰한 행동이 드러나는지 확인하세요.</div>`);
 if(a.dups.length)details.push(`<div><b>♻️ 현재 문장 내부 반복</b>${a.dups.map(x=>`<div class="p-2 mt-1 bg-slate-50 rounded-lg">${Math.round(x.score*100)}% 유사<br>① ${esc(x.a)}<br>② ${esc(x.b)}</div>`).join('')}</div>`);
 if(a.cross.same.length)details.push(`<div><b>🔁 같은 학생 다른 기록과 유사</b>${a.cross.same.slice(0,3).map(x=>`<div class="p-2 mt-1 bg-indigo-50 rounded-lg"><b>${Math.round(x.score*100)}%</b> · ${esc(x.area)} ${esc(x.subject||'')} ${esc(x.sem)}/${esc(x.ver)}<br>${esc(x.text.slice(0,180))}</div>`).join('')}</div>`);
 if(a.cross.classMatches.length)details.push(`<div><b>👥 같은 학급 다른 학생과 유사</b>${a.cross.classMatches.slice(0,3).map(x=>`<div class="p-2 mt-1 bg-violet-50 rounded-lg"><b>${Math.round(x.score*100)}%</b> · ${esc(x.student?.no||'')} ${esc(x.student?.name||'')} · ${esc(x.subject||x.area)}<br>${esc(x.text.slice(0,180))}</div>`).join('')}</div>`);
 if(!details.length&&t.trim())details.push('<div class="p-3 bg-emerald-50 text-emerald-800 rounded-xl">현재 로컬 점검에서 즉시 확인되는 큰 경고가 없습니다.</div>');
 $('sm34-details').innerHTML=details.join('<div class="my-3 border-t"></div>');
}
window.sm34Fix=function(id){
 const r=FIX_RULES.find(x=>x.id===id),ta=$('seoteuk-textarea');if(!r||!ta)return;
 const next=ta.value.replace(r.rx,r.to);if(next===ta.value)return;
 ta.value=next;window.handleSeoteukInput?.();render();window.showToast?.(`${r.label} 수정 적용`,'success');
};
window.sm34FixAll=function(){
 const ta=$('seoteuk-textarea');if(!ta)return;let t=ta.value;for(const r of FIX_RULES)t=t.replace(r.rx,r.to);
 ta.value=t;window.handleSeoteukInput?.();render();window.showToast?.('띄어쓰기·기본 오타 수정 적용','success');
};
function schedule(){clearTimeout(timer);timer=setTimeout(render,450)}
function patchProgrammaticChanges(){
 const oldSet=window.setCurrentText;
 if(typeof oldSet==='function'&&!oldSet.__sm34){
  const w=function(...args){const r=oldSet.apply(this,args);setTimeout(render,30);return r};w.__sm34=true;window.setCurrentText=w;
 }
 setInterval(()=>{const ta=$('seoteuk-textarea');if(ta&&ta.value!==lastText)render()},900);
}
function hideRedundantAuditButtons(){
 for(const b of document.querySelectorAll('#tab-content-editor button')){
  if(/금지어 감사|종결형\(~함\) 통일/.test(b.textContent||''))b.classList.add('hidden');
 }
}
function version(){
 const badge=[...document.querySelectorAll('header span')].find(x=>/P\.O\.H\.A\.N\.G 2026/.test(x.textContent||''));
 if(badge)badge.textContent='P.O.H.A.N.G 2026 · v3.4.0 LIVE CHECK';
 document.title='Seoteuk Mate P.O.H.A.N.G v3.4.0 - Live Check · Teacher UX · Cloud';
}
function init(){ensureUI();patchProgrammaticChanges();hideRedundantAuditButtons();version();render();setTimeout(()=>{ensureUI();hideRedundantAuditButtons();render()},1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,420));else setTimeout(init,420);
})();