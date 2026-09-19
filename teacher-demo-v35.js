/* Seoteuk Mate v3.5.1 — full fictional student source viewer + demo validator */
(function(){
'use strict';
if(window.__SEOTEUK_FULL_DEMO_V351__)return;
window.__SEOTEUK_FULL_DEMO_V351__=true;
var DEMO_ID='demo-full-student-v351';
var DEMO={
 studentNo:'2101',
 studentName:'김도윤(가상)',
 subject:'한국사',
 career:'역사교육·기록콘텐츠',
 major:'역사교육·미디어콘텐츠 계열',
 title:'물산장려운동 역사신문: 자료의 주장과 실제 참여 범위를 구분해 기사 쓰기',
 standardCode:'10한사2-01-03',
 standardText:'국내외에서 전개된 민족운동의 흐름을 이해한다.',
 activity:'물산장려운동을 주제로 모둠 역사신문을 제작함. 수업에서 제공된 당대 신문 광고 발췌와 물산장려회 취지문 발췌를 비교한 뒤 기사 초고를 작성하고, 모둠 피드백과 교사 피드백을 반영해 수정본을 완성한 후 핵심 내용을 발표함.',
 teacherObservation:'자료 비교표를 작성하면서 두 자료가 독자에게 요구하는 행동과 강조점이 다르다고 표시함. 기사 초고의 ‘전 국민이 한뜻으로 참여했다’는 문장에 대해 근거가 충분한지 스스로 질문하고, 교사의 ‘자료에서 확인되는 범위만 쓰라’는 피드백 뒤 해당 표현을 ‘국산품 애용을 호소하는 움직임이 전개되었다’로 수정함. 모둠원이 제시한 문장을 검토할 때도 근거가 어느 자료에 있는지 확인한 뒤 반영 여부를 결정함. 발표에서 ‘취지문만으로 실제 참여 범위를 단정할 수 없다’고 설명하고, 활동 후 운동의 목표와 실제 참여 양상 사이의 차이가 생긴 이유를 질문함.',
 artifact:'사료 비교표, 역사신문 기사 초고, 피드백 반영 수정본, 발표용 기사 요약 카드.',
 sourceEvidence:'교과서의 물산장려운동 관련 내용, 수업에서 제공된 당대 신문 광고 발췌, 물산장려회 취지문 발췌, 모둠 기사 초고.',
 role:'사료 근거 확인 및 기사 본문 작성·수정 담당. 모둠원이 작성한 문장의 근거 위치를 함께 확인하고 최종 본문 반영 여부를 제안함.',
 feedbackGrowth:'초고에서 참여 범위를 과도하게 일반화한 표현을 사용했으나, 교사 피드백 후 근거가 직접 확인되는 범위로 문장을 좁혀 수정함. 이후 다른 문장도 자료 근거를 먼저 확인한 뒤 표현을 결정함.',
 studentQuestion:'물산장려운동의 목표와 실제 참여 양상 사이의 차이가 있었다면 그 차이는 어떤 사회·경제적 조건에서 생겼는가?',
 notes:'발표에서 취지문과 실제 참여 범위를 구분해야 한다는 점을 설명함. 동료 피드백 중 근거가 확인되는 제안만 기사에 반영함. 가상학생 테스트 데이터이며 실제 학생 정보가 아님.',
 idea:'추후 확장 아이디어: 운동의 목표·홍보 메시지·수용 양상을 구분해 추가 탐구 가능. 이 문장은 참고 아이디어이며 학생이 실제 수행한 사실이 아님.',
 quickObservation:'물산장려운동 역사신문 제작에서 당대 신문 광고 발췌와 물산장려회 취지문 발췌를 비교해 두 자료의 강조점 차이를 표시함. 기사 초고의 과도한 일반화 표현에 근거가 충분한지 스스로 질문하고 교사 피드백 후 자료에서 확인되는 범위로 문장을 좁혀 수정함. 모둠원이 작성한 문장도 근거 위치를 확인한 뒤 반영 여부를 제안함. 발표에서 취지문만으로 실제 참여 범위를 단정할 수 없다고 설명하고 활동 후 운동의 목표와 실제 참여 양상 사이의 차이가 생긴 이유를 질문함.',
 knowledgeQuery:'물산장려운동 역사신문 사료 비교 관점 분석과 사실·해석 구분',
 history:{
  topic:'일제강점기 물산장려운동',
  article:'물산장려운동의 목표와 실제 참여 범위를 어떻게 구분해 기사로 전달할 것인가',
  sources:'교과서 관련 내용, 당대 신문 광고 발췌, 물산장려회 취지문 발췌, 기사 초고',
  critique:'자료의 작성 목적과 독자에게 요구하는 행동을 비교하고, 취지문만으로 실제 참여 범위를 단정할 수 없다는 한계를 표시함.',
  role:'사료 근거 확인, 기사 본문 작성, 초고 수정',
  factcheck:'‘전 국민이 한뜻으로 참여했다’는 초고 표현의 근거가 충분하지 않다고 보고 자료에서 확인되는 범위로 문장을 좁혀 수정함.',
  perspective:'신문 광고의 호소 방식과 물산장려회 취지문의 주장 범위를 비교함.',
  collab:'모둠원이 제안한 문장의 근거 위치를 함께 확인하고, 근거가 확인되는 제안만 최종 기사에 반영함.',
  observed:'자료 비교표 작성, 근거 확인 질문, 과장 표현 수정, 발표에서 자료의 한계 설명을 교사가 직접 관찰함.',
  followup:'운동의 목표와 실제 참여 양상 사이의 차이가 어떤 사회·경제적 조건에서 생겼는지 질문함.'
 }
};
window.__FULL_DEMO_STUDENT_V351=DEMO;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
function setv(id,v){var e=document.getElementById(id);if(e){e.value=v||'';e.dispatchEvent(new Event('input',{bubbles:true}));}}
function sets(id,v){var e=document.getElementById(id);if(e){e.value=v||'';e.dispatchEvent(new Event('change',{bubbles:true}));}}
function toast(m,t){if(window.showToast)window.showToast(m,t||'info');}
function bytes(t){return window.calculateNeisBytes?window.calculateNeisBytes(t):new TextEncoder().encode(String(t||'')).length;}
function row(label,value){return '<div class="p-3 rounded-2xl border border-slate-200 bg-white"><div class="text-[10px] font-black text-slate-500">'+esc(label)+'</div><div class="mt-1 text-xs leading-6 whitespace-pre-wrap text-slate-800">'+esc(value)+'</div></div>';}

function ensureModal(){
 var m=document.getElementById('sm35-demo-modal');
 if(m)return m;
 m=document.createElement('div');
 m.id='sm35-demo-modal';
 m.className='hidden fixed inset-0 z-[280] bg-slate-950/60 backdrop-blur-sm p-3 sm:p-5 items-center justify-center no-print';
 m.innerHTML='<div class="w-full max-w-6xl max-h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">'+
 '<div class="px-5 py-4 border-b flex items-start justify-between gap-3"><div><div class="flex items-center gap-2"><span class="text-2xl">🧪</span><h3 class="font-black text-lg">가상학생 전체 예시 · 원자료</h3><span class="text-[9px] px-2 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-black">실제 학생 아님</span></div><p class="text-[11px] text-slate-500 mt-1">AI가 쓰기 전 교사가 가지고 있는 원자료를 그대로 확인할 수 있습니다.</p></div><button type="button" onclick="closeFullDemo35()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>'+
 '<div class="px-5 py-3 border-b flex flex-wrap gap-2"><button type="button" onclick="showFullDemoSource35()" class="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black">📋 원자료 전체</button><button type="button" onclick="loadFullDemo35()" class="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-black">✍️ 작성기에 넣기</button><button type="button" onclick="generateValidateFullDemo35()" class="px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-black">✨ 세특 생성+검증</button><button type="button" onclick="saveFullDemoProject35()" class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">📁 프로젝트 카드 저장</button></div>'+
 '<div id="sm35-demo-body" class="p-4 sm:p-5 overflow-y-auto custom-scrollbar"></div></div>';
 document.body.appendChild(m);
 return m;
}
window.openFullDemo35=function(){var m=ensureModal();m.classList.remove('hidden');m.classList.add('flex');showFullDemoSource35();};
window.closeFullDemo35=function(){var m=document.getElementById('sm35-demo-modal');if(m){m.classList.add('hidden');m.classList.remove('flex');}};
window.showFullDemoSource35=function(){
 var body=document.getElementById('sm35-demo-body');if(!body)return;
 var h=DEMO.history;
 body.innerHTML='<div class="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950"><b>이 화면이 가상학생의 원자료입니다.</b> 아래 항목은 AI가 만든 문장이 아니라 세특 작성 전에 교사가 확보했다고 가정한 관찰·산출물·자료·피드백입니다.</div>'+
 '<div class="grid md:grid-cols-2 gap-2">'+
 row('학번·이름',DEMO.studentNo+' · '+DEMO.studentName)+row('과목·희망 진로',DEMO.subject+' · '+DEMO.career)+
 row('성취기준',DEMO.standardCode+' · '+DEMO.standardText)+row('탐구 제목',DEMO.title)+
 row('실제 수업 활동',DEMO.activity)+row('교사 직접 관찰',DEMO.teacherObservation)+
 row('학생 산출물',DEMO.artifact)+row('실제 사용 자료',DEMO.sourceEvidence)+
 row('학생의 실제 역할',DEMO.role)+row('피드백·수정·성장',DEMO.feedbackGrowth)+
 row('학생 후속 질문',DEMO.studentQuestion)+row('기타 관찰 메모',DEMO.notes)+
 '</div><h4 class="mt-5 mb-2 font-black text-sm">📰 역사신문 전용 원자료 10개 항목</h4><div class="grid md:grid-cols-2 gap-2">'+
 row('1. 주제·시대',h.topic)+row('2. 기사 주제',h.article)+row('3. 사용 사료·자료',h.sources)+row('4. 자료 검토 행동',h.critique)+
 row('5. 실제 역할',h.role)+row('6. 팩트체크·수정',h.factcheck)+row('7. 관점 비교',h.perspective)+row('8. 협업·피드백',h.collab)+
 row('9. 교사 직접 관찰',h.observed)+row('10. 후속 질문·성찰',h.followup)+'</div>'+
 '<div class="mt-4 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs"><b>지식팩 참고 아이디어</b><div class="mt-1 leading-5">'+esc(DEMO.idea)+'</div><div class="mt-2 text-[10px] text-indigo-700">※ 참고 아이디어는 학생이 실제 수행한 사실과 분리합니다.</div></div>';
};

function writerSeed(){return {studentNo:DEMO.studentNo,studentName:DEMO.studentName,subject:DEMO.subject,career:DEMO.career,standardCode:DEMO.standardCode,standardText:DEMO.standardText,activity:DEMO.activity,teacherObservation:DEMO.teacherObservation,artifact:DEMO.artifact,sourceEvidence:DEMO.sourceEvidence,role:DEMO.role,feedbackGrowth:DEMO.feedbackGrowth,studentQuestion:DEMO.studentQuestion,notes:DEMO.notes};}
function fillHistory(){
 var h=DEMO.history, map={'hn-topic':h.topic,'hn-article':h.article,'hn-sources':h.sources,'hn-source-critique':h.critique,'hn-role':h.role,'hn-factcheck':h.factcheck,'hn-perspective':h.perspective,'hn-collab':h.collab,'hn-observed':h.observed,'hn-followup':h.followup};
 Object.keys(map).forEach(function(id){setv(id,map[id]);});
}
function upsertProject(){
 var arr=Array.isArray(window.__projectCardsV25)?window.__projectCardsV25:[];
 var p={id:DEMO_ID,studentNo:DEMO.studentNo,studentName:DEMO.studentName,subject:DEMO.subject,career:DEMO.career,title:DEMO.title,question:DEMO.studentQuestion,standardCode:DEMO.standardCode,standardText:DEMO.standardText,activity:DEMO.activity,teacherObservation:DEMO.teacherObservation,artifact:DEMO.artifact,sourceEvidence:DEMO.sourceEvidence,role:DEMO.role,feedbackGrowth:DEMO.feedbackGrowth,idea:DEMO.idea,knowledgeRefs:[],status:'진행',createdAt:Date.now(),updatedAt:Date.now()};
 window.__projectCardsV25=[p].concat(arr.filter(function(x){return x.id!==DEMO_ID;}));
 try{localStorage.setItem('seoteukMate.projects.v25',JSON.stringify(window.__projectCardsV25));}catch(_){}
 window.__scheduleCloudSave&&window.__scheduleCloudSave(window.__getCloudState?window.__getCloudState():{});
 return p;
}
window.saveFullDemoProject35=function(){upsertProject();toast('가상학생 프로젝트 카드를 저장했습니다.','success');if(window.openProjectCards)window.openProjectCards();};

window.loadFullDemo35=function(){
 window.activeCategory='교과세특';
 if(window.handleSubjectChange)window.handleSubjectChange(DEMO.subject);
 sets('subject-select',DEMO.subject);setv('input-career',DEMO.career);setv('input-major',DEMO.major);setv('input-chat',DEMO.quickObservation);setv('knowledge-query',DEMO.knowledgeQuery);setv('coord-major',DEMO.major);
 fillHistory();upsertProject();
 try{localStorage.setItem('seoteukMate.writerDraft.v25',JSON.stringify(writerSeed()));}catch(_){}
 window.__lastObservationV3=DEMO.quickObservation;
 if(window.openSubjectWriter)window.openSubjectWriter(writerSeed());
 setTimeout(function(){sets('v25-writer-standard-select',DEMO.standardCode);setv('v25-writer-standard-text',DEMO.standardText);if(window.runWriterEvidenceCheck)window.runWriterEvidenceCheck();},120);
 toast('가상 원자료를 교과 작성기에 넣었습니다.','success');
};

function validate(text){
 var findings=window.scanOfficial2026?window.scanOfficial2026(text):[];
 var hard=findings.filter(function(x){return x.severity==='hard';});
 var tests=[
  ['본문 생성',String(text||'').trim().length>=80],
  ['NEIS 1,500B 이내',bytes(text)<=1500],
  ['2026 기재금지 hard 0건',hard.length===0],
  ['가상 이름·학번 미출력',!/(2101|김도윤)/.test(text)],
  ['자료 비교 행동 반영',/(비교|대조)/.test(text)],
  ['피드백·수정 과정 반영',/(수정|피드백|정정|고쳐)/.test(text)],
  ['질문·자료 한계 반영',/(질문|단정|한계|어렵)/.test(text)],
  ['역사에 과학 실험 문법 없음',!/(실험\s*변인|측정\s*데이터|정량적\s*오차|센서|반복\s*실험)/.test(text)],
  ['진로 억지 연결 없음',!/(역사교육|기록콘텐츠|미디어콘텐츠|희망\s*진로)/.test(text)],
  ['강한 평가어 무단 확대 없음',!/(주도함|탁월함|우수함|학문적\s*태도|뛰어난|돋보임)/.test(text)],
  ['가정형 질문 사실화 없음',!/(사이에\s*차이가\s*(?:나타|발생|존재|확인)|나타난\s*차이|발생한\s*차이)/.test(text)]
 ];
 return {tests:tests,findings:findings,hard:hard,bytes:bytes(text),pass:tests.every(function(x){return x[1];})&&hard.length===0};
}
function report(v,text){
 var body=document.getElementById('sm35-demo-body');if(!body)return;
 body.innerHTML='<div class="p-4 rounded-2xl border '+(v.pass?'bg-emerald-50 border-emerald-200':'bg-rose-50 border-rose-200')+'"><div class="font-black text-base">'+(v.pass?'✅ 세특 자동검증 통과':'⚠️ 세특 보완 필요')+'</div><div class="text-[11px] mt-1">'+v.bytes+'/1,500 Byte · 공식검사 '+v.findings.length+'건 · '+v.tests.filter(function(x){return x[1];}).length+'/'+v.tests.length+' 통과</div><div class="grid md:grid-cols-2 gap-2 mt-3">'+v.tests.map(function(x){return '<div class="p-2 rounded-xl bg-white text-xs">'+(x[1]?'✅':'❌')+' '+esc(x[0])+'</div>';}).join('')+'</div></div><div class="mt-3 p-4 rounded-2xl border bg-white"><b class="text-sm">생성된 세특</b><div class="mt-2 text-sm leading-7 whitespace-pre-wrap">'+esc(text)+'</div></div><button type="button" onclick="showFullDemoSource35()" class="mt-3 px-3 py-2 rounded-xl border bg-white text-xs font-black">← 원자료 다시 보기</button>';
}
window.generateValidateFullDemo35=async function(){
 window.loadFullDemo35();
 window.closeFullDemo35();
 var before=document.getElementById('v25-writer-result')?document.getElementById('v25-writer-result').textContent:'';
 await new Promise(function(r){setTimeout(r,200);});
 if(!window.generateFromSubjectWriter){toast('교과 작성기 생성 함수가 없습니다.','warning');return;}
 try{
  await window.generateFromSubjectWriter();
  var text=(document.getElementById('v25-writer-result')?document.getElementById('v25-writer-result').textContent:'').trim();
  if(!text||text===before)text=(document.getElementById('seoteuk-textarea')?document.getElementById('seoteuk-textarea').value:'').trim();
  if(!text)throw new Error('세특 본문이 생성되지 않았습니다.');
  var v=validate(text);window.__FULL_DEMO_V351_LAST={validation:v,text:text};
  window.openFullDemo35();report(v,text);
  toast(v.pass?'가상학생 세특 검증을 통과했습니다.':'가상학생 세특에 보완 항목이 있습니다.',v.pass?'success':'warning');
 }catch(e){window.openFullDemo35();var body=document.getElementById('sm35-demo-body');if(body)body.innerHTML='<div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-900"><b>생성 실패</b><div class="mt-2">'+esc(e.message)+'</div></div>';toast('가상학생 생성 실패: '+e.message,'warning');}
};

function installMenu(){
 var menu=document.getElementById('sm-main-menu');if(!menu||document.getElementById('sm35-demo-menu'))return;
 var student=[].slice.call(menu.querySelectorAll('button')).find(function(b){return /학생 관리/.test(b.textContent||'');});
 var b=document.createElement('button');b.id='sm35-demo-menu';b.type='button';b.className='sm-menu-btn';b.onclick=window.openFullDemo35;b.title='가상학생의 세특 작성 전 원자료 전체를 확인';b.innerHTML='<span class="sm-menu-icon">🧪</span><span>가상학생 예시</span>';
 if(student)student.after(b);else menu.appendChild(b);
 ensureModal();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(installMenu,600);});else setTimeout(installMenu,600);
})();
