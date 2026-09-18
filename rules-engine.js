/* Seoteuk Mate v2.3 — Rule Studio + PDF Knowledge Vault + Evidence Auditor */
(function(){
'use strict';
const RULE_KEY='seoteukMate.rulebook.v3';
const PREF_KEY='seoteukMate.knowledgePrefs.v3';
const DB_NAME='SeoteukMateKnowledgeV3';
const DB_VERSION=1;
const DB_DOCS='docs', DB_CHUNKS='chunks';

const BASE_RULES={
  common:{label:'공통 세특', rules:[
    ['evidence','관찰 근거 우선','사용자가 입력한 실제 수업 관찰·학생 행동·산출물만 학생의 사실로 서술한다. 참고자료·추천도서·PDF에 있는 사례를 학생이 실제 수행한 것처럼 바꾸지 않는다.','교과세특 바이블 공통 원칙'],
    ['process','과정·성장 중심','결과 나열보다 수업에서 드러난 동기→행동→사고 과정→피드백/성찰의 흐름을 우선한다.','교과세특 바이블 공통 원칙'],
    ['curriculum','교육과정에서 출발','탐구는 해당 교과에서 배운 개념과 학생의 질문·호기심에서 출발하도록 연결한다.','탐구주제 바이블 공통'],
    ['feasible','주제 적합성','탐구의 흥미·진로 연계·난이도·독창성·시간·자료 수집 가능성·모둠 역량을 함께 고려한다.','탐구주제 선정 유의점'],
    ['workflow','탐구 절차','주제 선정→계획 수립→자료/근거 수집 및 실행→결과물/발표→평가·성찰의 흐름을 활용하되 실제 관찰되지 않은 단계를 지어내지 않는다.','교과세특 탐구활동 수행 방법'],
    ['outputs','산출물 다양화','과목에 맞게 보고서·포스터·에세이·신문·뉴스·웹사이트·지도·발표·토론 등 다양한 산출물을 고려한다. 과학 실험을 모든 과목의 기본값으로 사용하지 않는다.','탐구활동 결과물 예시'],
    ['reading','독서·PDF 사용 규칙','도서·논문·PDF는 탐구 아이디어와 개념 근거로 사용한다. 실제 독서·활용이 관찰되지 않았다면 학생이 읽었다고 단정하지 않는다.','추천도서 300 활용 원칙'],
    ['style','기록 문체','교사가 관찰할 수 있는 행동 중심의 개조식 종결형(~함, ~보임 등)으로 쓰고 과장된 최상급·성과 단정·근거 없는 수치 삽입을 피한다.','앱 안전 규칙'],
    ['bytes','NEIS 분량','기본 목표는 1,500바이트 이내이며 의미 없는 완충 문장으로 분량을 채우지 않는다.','앱 작성 규칙']
  ]},
  history:{label:'역사', rules:[
    ['src','사료·자료 비판','사료·자료의 작성 주체, 시점, 목적, 맥락, 한계를 살피는 탐구 언어를 우선한다.','추천도서 인문사회계열·계열별 / 역사 파트'],
    ['context','시대 맥락·인과','사건을 배경→전개→영향과 당대 맥락 속에서 연결한다.'],
    ['perspective','관점 비교','서로 다른 관점과 서술을 비교하고 사실과 해석을 구분한다.'],
    ['media','역사 전달','역사신문·기사·전시·지도·연표 등은 근거를 정확히 재구성하고 독자에게 전달하는 과정에 초점을 둔다.'],
    ['banlab','과학식 표현 제한','입력에 실제 실험이 없다면 실험 변인, 측정 데이터, 센서, 정량적 오차, 반복 실험 같은 자연과학식 표현을 사용하지 않는다.']
  ]},
  korean:{label:'국어·문학·매체',rules:[
    ['text','텍스트 근거','작품·글·담화·매체의 구체적 표현과 맥락을 근거로 해석한다.'],
    ['discourse','읽기·쓰기·담화 과정','주장-근거, 독자/청자, 표현 전략, 매체 특성, 초고-수정 과정 등 실제 수업 행동을 중심으로 기록한다.'],
    ['compare','비교·비평','작품·매체·관점을 비교할 때 공통점과 차이의 근거가 드러나게 한다.']
  ]},
  english:{label:'영어',rules:[
    ['lang','언어 사용 맥락','영어 텍스트의 주장·근거·어휘·담화 구조와 실제 의사소통 수행을 중심으로 기록한다.'],
    ['revise','표현 개선','초고 수정, 피드백 반영, 발표·토론에서의 의사소통 변화가 관찰되면 구체적으로 반영한다.']
  ]},
  math:{label:'수학',rules:[
    ['concept','개념·정의 우선','정의, 조건, 식의 의미, 추론 과정을 명확히 하고 계산 결과만 나열하지 않는다.'],
    ['reason','증명·모델링','증명·반례·모델링·그래프·해석 등 실제 수행한 수학적 사고를 중심으로 서술한다.'],
    ['number','수치 안전','수치·오차·계산 결과는 실제 입력이나 근거 자료에 있는 경우에만 사용한다.']
  ]},
  science:{label:'과학·자연',rules:[
    ['hyp','과학 탐구','질문·가설·관찰/실험·자료 해석·한계 검토의 흐름을 실제 수행 범위에서만 사용한다.','교과세특 탐구주제 바이블(자연계열)'],
    ['var','변인·오차','변인 통제, 측정, 오차율 등은 실제 실험·측정 기록이 있을 때만 서술한다.'],
    ['evidence','과학적 근거','관찰값, 그래프, 선행 연구와 해석을 구분하고 인과와 상관을 혼동하지 않는다.']
  ]},
  social:{label:'사회·경제·정치',rules:[
    ['issue','쟁점·관점','사회 현상과 정책 쟁점은 이해관계자·관점·근거를 비교하여 다룬다.','교과세특 탐구주제 바이블(사회)·추천도서 인문사회계열'],
    ['data','자료 해석','통계·설문·사례는 실제 사용했을 때 출처와 한계를 함께 고려한다.'],
    ['policy','대안 평가','대안은 가치 판단과 사실 판단을 구분하고 기대 효과와 한계를 함께 검토한다.']
  ]},
  engineering:{label:'정보·공학',rules:[
    ['problem','문제 정의','문제 상황과 요구조건을 먼저 명확히 하고 해결책부터 과장하지 않는다.','교과세특 탐구주제 바이블(공학)·추천도서 공학계열'],
    ['design','설계 과정','설계→구현→테스트→개선은 실제 수행한 단계만 기록한다.'],
    ['tradeoff','한계·윤리','성능뿐 아니라 제약, 안전, 윤리, 사용자 영향 등 실제 탐구한 요소를 반영한다.']
  ]},
  medical:{label:'의약·생명 진로 오버레이',rules:[
    ['mech','기전 중심','질환·생명 현상은 원인과 기전을 근거 자료에 맞게 설명하며 치료 효과를 임의로 단정하지 않는다.','교과세특 탐구주제 바이블(의약)'],
    ['ethics','윤리·근거 수준','의학적 주장에는 근거 수준과 윤리 문제를 고려하고 학생이 임상 효과를 입증한 것처럼 쓰지 않는다.']
  ]},
  arts:{label:'예체능',rules:[
    ['intent','창작 의도','창작·연주·표현의 의도와 선택한 요소, 제작/연습 과정의 변화를 중심으로 기록한다.','교과세특 탐구주제 바이블(예체능)'],
    ['feedback','피드백·수정','동료·교사 피드백과 자기평가를 반영한 수정 과정이 있으면 구체적으로 드러낸다.'],
    ['analysis','작품 분석','감상은 막연한 느낌보다 형식·매체·구성·표현 요소의 근거를 들어 서술한다.']
  ]},
  education:{label:'교육',rules:[
    ['learner','학습자·수업','학습자 특성, 교수학습 방법, 평가, 교육 환경을 실제 사례와 연결해 탐구한다.','교과세특 탐구주제 바이블(교육)·추천도서 계열별'],
    ['ethic','교육적 가치','효율만이 아니라 공정성, 성장, 참여, 피드백 같은 교육적 가치를 함께 검토한다.']
  ]}
};

function cloneDefaultRules(){
 const out={version:3,updatedAt:Date.now(),presets:{},custom:[]};
 for(const [k,v] of Object.entries(BASE_RULES)) out.presets[k]={label:v.label,rules:v.rules.map(r=>({id:r[0],title:r[1],text:r[2],source:r[3]||'',enabled:true}))};
 return out;
}
function loadRules(){try{const x=JSON.parse(localStorage.getItem(RULE_KEY)||'null'); if(x&&x.presets)return x;}catch(e){} const d=cloneDefaultRules(); saveRules(d); return d;}
function saveRules(x){x.updatedAt=Date.now(); localStorage.setItem(RULE_KEY,JSON.stringify(x)); window.__ruleBookV3=x;}
window.__ruleBookV3=loadRules();

function subjectFamily(subject){
 const s=String(subject||'').replace(/\s+/g,'');
 if(/한국사|세계사|동아시아사|역사/.test(s))return'history';
 if(/국어|문학|독서|작문|화법|언어|매체/.test(s))return'korean';
 if(/영어/.test(s))return'english';
 if(/수학|미적분|대수|기하|확률|통계/.test(s))return'math';
 if(/물리|화학|생명|지구|과학/.test(s))return'science';
 if(/정보|컴퓨터|소프트웨어|공학|인공지능/.test(s))return'engineering';
 if(/사회|경제|정치|법|윤리|지리/.test(s))return'social';
 if(/미술|음악|체육|예술|연극|영화/.test(s))return'arts';
 if(/교육/.test(s))return'education';
 return'common';
}
function careerOverlays(career){
 const c=String(career||''); const arr=[];
 if(/의예|의학|약학|간호|의생명|생명과학|보건/.test(c))arr.push('medical');
 if(/교육|교사|사범|역사교육|국어교육|수학교육|과학교육/.test(c))arr.push('education');
 if(/공학|컴퓨터|소프트웨어|인공지능|전자|기계|로봇/.test(c))arr.push('engineering');
 if(/미술|음악|체육|예술|디자인|영화/.test(c))arr.push('arts');
 return [...new Set(arr)];
}
function activeRules(subject,career){
 const rb=window.__ruleBookV3||loadRules(); const fam=subjectFamily(subject); const keys=['common']; if(fam!=='common')keys.push(fam); keys.push(...careerOverlays(career));
 const out=[]; for(const k of [...new Set(keys)]) for(const r of (rb.presets?.[k]?.rules||[])) if(r.enabled)out.push({...r,group:k});
 for(const r of (rb.custom||[])) if(r.enabled && (r.scope==='all'||r.scope===fam||careerOverlays(career).includes(r.scope)))out.push({...r,group:'custom'});
 return out;
}
window.getActiveSeoteukRules=activeRules;

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(m,t='info'){if(typeof window.showToast==='function')window.showToast(m,t); else console.log(m);}

// ---------- Rule Studio UI ----------
function ruleModalHtml(){return `<div id="modal-rule-studio" class="hidden fixed inset-0 z-[140] bg-slate-950/55 backdrop-blur-sm p-3 sm:p-6 items-center justify-center no-print">
 <div class="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
  <div class="px-5 py-4 border-b flex items-center justify-between"><div><h3 class="font-black text-slate-900">📐 교과별 사전 규칙 센터</h3><p class="text-[11px] text-slate-500 mt-0.5">PDF 바이블의 공통 구조 + 교과별 탐구 문법을 생성 전에 자동 적용</p></div><button onclick="closeRuleStudio()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>
  <div class="grid lg:grid-cols-[220px_1fr] flex-1 min-h-0">
   <div id="rule-group-list" class="border-r bg-slate-50 p-3 overflow-y-auto"></div>
   <div class="p-4 overflow-y-auto custom-scrollbar"><div id="rule-current-title" class="font-black text-sm mb-2"></div><div id="rule-items" class="space-y-2"></div>
    <div class="mt-5 p-3 rounded-2xl bg-indigo-50 border border-indigo-200"><div class="font-black text-xs text-indigo-900 mb-2">+ 사용자 규칙 추가</div><div class="grid sm:grid-cols-[150px_1fr] gap-2"><select id="custom-rule-scope" class="p-2 rounded-lg border text-xs"><option value="all">모든 교과</option><option value="history">역사</option><option value="korean">국어</option><option value="english">영어</option><option value="math">수학</option><option value="science">과학</option><option value="social">사회</option><option value="engineering">공학/정보</option><option value="medical">의약</option><option value="arts">예체능</option><option value="education">교육</option></select><input id="custom-rule-title" class="p-2 rounded-lg border text-xs" placeholder="규칙 이름"></div><textarea id="custom-rule-text" class="mt-2 w-full h-20 p-2 rounded-lg border text-xs" placeholder="예: 역사신문은 기사 작성에 실제 사용한 사료와 학생의 편집 행동만 서술한다."></textarea><button onclick="addCustomRule()" class="mt-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black">규칙 저장</button></div>
   </div>
  </div>
  <div class="px-5 py-3 border-t flex items-center justify-between gap-2"><span id="active-rule-summary" class="text-[11px] text-slate-500"></span><div class="flex gap-2"><button onclick="runV23SelfTest()" class="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">🧪 자가진단</button><button onclick="resetRuleBook()" class="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold">기본값 복원</button><button onclick="closeRuleStudio()" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">완료</button></div></div>
 </div></div>`;}
let ruleGroup='common';
window.openRuleStudio=function(){const m=document.getElementById('modal-rule-studio');m?.classList.remove('hidden');m?.classList.add('flex');renderRuleStudio();};
window.closeRuleStudio=function(){const m=document.getElementById('modal-rule-studio');m?.classList.add('hidden');m?.classList.remove('flex');};
window.selectRuleGroup=function(k){ruleGroup=k;renderRuleStudio();};
window.toggleRule=function(group,id,on){const rb=window.__ruleBookV3;const r=rb.presets?.[group]?.rules?.find(x=>x.id===id);if(r){r.enabled=!!on;saveRules(rb);renderRuleStudio();}};
window.toggleCustomRule=function(id,on){const r=window.__ruleBookV3.custom.find(x=>x.id===id);if(r){r.enabled=!!on;saveRules(window.__ruleBookV3);renderRuleStudio();}};
window.deleteCustomRule=function(id){window.__ruleBookV3.custom=window.__ruleBookV3.custom.filter(x=>x.id!==id);saveRules(window.__ruleBookV3);renderRuleStudio();};
window.addCustomRule=function(){const title=document.getElementById('custom-rule-title')?.value.trim();const text=document.getElementById('custom-rule-text')?.value.trim();const scope=document.getElementById('custom-rule-scope')?.value||'all';if(!title||!text)return toast('규칙 이름과 내용을 입력하세요.','warning');window.__ruleBookV3.custom.push({id:'c'+Date.now(),title,text,scope,enabled:true,source:'사용자 규칙'});saveRules(window.__ruleBookV3);document.getElementById('custom-rule-title').value='';document.getElementById('custom-rule-text').value='';ruleGroup='custom';renderRuleStudio();toast('사용자 규칙을 저장했습니다.','success');};
window.resetRuleBook=function(){if(!confirm('교과별 규칙을 기본값으로 되돌릴까요? 사용자 규칙도 초기화됩니다.'))return;saveRules(cloneDefaultRules());ruleGroup='common';renderRuleStudio();toast('기본 규칙을 복원했습니다.','success');};
window.runV23SelfTest=async function(){const checks=[];const ck=(name,ok,detail='')=>checks.push({name,ok:!!ok,detail});ck('데스크탑 왼쪽 입력 패널',!!document.getElementById('panel-left'));ck('오른쪽 결과/에디터 패널',!!document.getElementById('panel-right'));ck('교과 규칙 엔진',typeof window.getActiveSeoteukRules==='function');ck('역사신문 입력기',!!document.getElementById('modal-history-newspaper'));ck('근거 3색 감별',typeof window.auditEvidenceLocal==='function');ck('PDF.js',!!window.pdfjsLib,window.pdfjsLib?'로드됨':'인터넷/CDN 확인');ck('스캔 OCR',!!window.Tesseract,window.Tesseract?'로드됨':'OCR 필요 시 CDN 확인');ck('생성 엔진 연결 함수',typeof window.__requestAI==='function');ck('Antigravity DEV 메타',window.__lastAgMeta?.engine==='antigravity-cli',window.__lastAgMeta?.engine||'아직 실제 생성 테스트 전');try{await openDB();ck('Knowledge IndexedDB',true);}catch(e){ck('Knowledge IndexedDB',false,e.message);}const pass=checks.filter(x=>x.ok).length;const lines=checks.map(x=>`${x.ok?'✅':'⚠️'} ${x.name}${x.detail?' — '+x.detail:''}`).join('\n');alert(`Seoteuk Mate v2.3 자가진단 ${pass}/${checks.length}\n\n${lines}\n\nAG 메타는 '문장 생성 테스트'를 실제 실행해야 ✅로 바뀝니다.`);};
function renderRuleStudio(){
 const rb=window.__ruleBookV3;const groups=Object.entries(rb.presets).map(([k,v])=>({k,label:v.label}));groups.push({k:'custom',label:'내 규칙'});
 const gl=document.getElementById('rule-group-list');if(gl)gl.innerHTML=groups.map(g=>`<button onclick="selectRuleGroup('${g.k}')" class="w-full text-left px-3 py-2 mb-1 rounded-xl text-xs font-bold ${g.k===ruleGroup?'bg-indigo-600 text-white':'hover:bg-white text-slate-700'}">${esc(g.label)}</button>`).join('');
 const title=document.getElementById('rule-current-title');if(title)title.textContent=ruleGroup==='custom'?'내 사용자 규칙':rb.presets[ruleGroup]?.label||'';
 const list=document.getElementById('rule-items');if(!list)return;
 if(ruleGroup==='custom') list.innerHTML=(rb.custom.length?rb.custom.map(r=>`<div class="p-3 border rounded-xl"><div class="flex items-start justify-between gap-2"><label class="flex gap-2"><input type="checkbox" ${r.enabled?'checked':''} onchange="toggleCustomRule('${r.id}',this.checked)"><span><b class="text-xs">${esc(r.title)}</b><span class="ml-1 text-[9px] px-1.5 py-0.5 bg-slate-100 rounded">${esc(r.scope)}</span><p class="text-[11px] text-slate-600 mt-1 leading-5">${esc(r.text)}</p></span></label><button onclick="deleteCustomRule('${r.id}')" class="text-rose-500 text-xs">삭제</button></div></div>`).join(''):'<div class="text-xs text-slate-400 p-4 text-center">아직 사용자 규칙이 없습니다.</div>');
 else list.innerHTML=(rb.presets[ruleGroup]?.rules||[]).map(r=>`<label class="block p-3 border rounded-xl hover:bg-slate-50"><div class="flex gap-2"><input type="checkbox" ${r.enabled?'checked':''} onchange="toggleRule('${ruleGroup}','${r.id}',this.checked)"><span><b class="text-xs text-slate-900">${esc(r.title)}</b><p class="text-[11px] text-slate-600 mt-1 leading-5">${esc(r.text)}</p>${r.source?`<span class="text-[9px] text-indigo-600">근거: ${esc(r.source)}</span>`:''}</span></div></label>`).join('');
 const ar=activeRules(window.activeSubject,document.getElementById('input-career')?.value||'');const sm=document.getElementById('active-rule-summary');if(sm)sm.textContent=`현재 ${window.activeSubject||'과목'}에 활성 규칙 ${ar.length}개 적용`;
}

// ---------- History Newspaper dedicated form ----------
function newspaperModalHtml(){return `<div id="modal-history-newspaper" class="hidden fixed inset-0 z-[145] bg-slate-950/55 backdrop-blur-sm p-3 items-center justify-center no-print"><div class="w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"><div class="p-4 border-b flex justify-between"><div><h3 class="font-black">📰 역사신문 제작 관찰 입력기</h3><p class="text-[11px] text-slate-500">입력한 사실만 조립하여 세특 생성 근거로 사용합니다.</p></div><button onclick="closeHistoryNewspaperForm()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div><div class="p-4 overflow-y-auto grid sm:grid-cols-2 gap-3 text-xs">
 ${[['hn-topic','신문 주제·시대','예: 일제강점기 물산장려운동'],['hn-article','기사 주제/제목','실제 제작한 기사 주제'],['hn-sources','실제로 사용한 사료·자료','교과서, 사료명, 사진, 통계 등 — 사용한 것만'],['hn-source-critique','자료 검토 행동','작성 주체·시점·목적·한계 중 실제 확인한 내용'],['hn-role','학생의 실제 역할','기자, 자료조사, 편집, 팩트체크 등'],['hn-factcheck','팩트체크·수정','오류를 발견하거나 근거를 다시 확인한 실제 사례'],['hn-perspective','관점 비교','서로 다른 관점·서술을 비교한 내용'],['hn-collab','협업·피드백','모둠원과 조율·피드백한 실제 행동'],['hn-observed','교사가 직접 관찰한 행동','질문, 발표, 토론, 수정 등'],['hn-followup','후속 질문·성찰','활동 뒤 새로 생긴 질문 또는 성찰']].map(([id,l,p])=>`<label class="block"><span class="font-bold text-slate-700">${l}</span><textarea id="${id}" class="mt-1 w-full h-20 p-2 rounded-xl border bg-slate-50" placeholder="${p}"></textarea></label>`).join('')}
 </div><div class="p-4 border-t flex flex-wrap gap-2 justify-end"><button onclick="clearHistoryNewspaperForm()" class="px-3 py-2 bg-slate-100 rounded-xl font-bold text-xs">비우기</button><button onclick="composeHistoryNewspaperObservation(false)" class="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-black text-xs">관찰기록 조립</button><button onclick="composeHistoryNewspaperObservation(true)" class="px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-xs">현재 엔진으로 세특 생성</button></div></div></div>`;}
const HN_IDS=['hn-topic','hn-article','hn-sources','hn-source-critique','hn-role','hn-factcheck','hn-perspective','hn-collab','hn-observed','hn-followup'];
window.openHistoryNewspaperForm=()=>{const m=document.getElementById('modal-history-newspaper');m?.classList.remove('hidden');m?.classList.add('flex');};
window.closeHistoryNewspaperForm=()=>{const m=document.getElementById('modal-history-newspaper');m?.classList.add('hidden');m?.classList.remove('flex');};
window.clearHistoryNewspaperForm=()=>HN_IDS.forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
window.composeHistoryNewspaperObservation=async function(generate){const labels=['주제/시대','기사 주제','사용 자료','자료 검토','학생 역할','팩트체크','관점 비교','협업/피드백','교사 관찰','후속 질문/성찰'];const vals=HN_IDS.map(id=>document.getElementById(id)?.value.trim()||'');const parts=vals.map((v,i)=>v?`${labels[i]}: ${v}`:'').filter(Boolean);if(!parts.length)return toast('실제로 관찰한 내용을 한 항목 이상 입력하세요.','warning');const obs='역사신문 제작 활동. '+parts.join(' / ');const input=document.getElementById('input-chat');if(input)input.value=obs;window.__lastObservationV3=obs;window.closeHistoryNewspaperForm();toast('역사신문 관찰기록을 생성 입력창에 넣었습니다.','success');if(generate)await window.sendChatMessage();};

// ---------- IndexedDB Knowledge Vault ----------
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(DB_DOCS))db.createObjectStore(DB_DOCS,{keyPath:'id'});if(!db.objectStoreNames.contains(DB_CHUNKS)){const s=db.createObjectStore(DB_CHUNKS,{keyPath:'id'});s.createIndex('docId','docId',{unique:false});}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function dbAll(store){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
async function dbPut(store,obj){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(obj);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}
async function dbDeleteDoc(id){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction([DB_DOCS,DB_CHUNKS],'readwrite');tx.objectStore(DB_DOCS).delete(id);const idx=tx.objectStore(DB_CHUNKS).index('docId');const req=idx.openCursor(IDBKeyRange.only(id));req.onsuccess=e=>{const c=e.target.result;if(c){c.delete();c.continue();}};tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}
function parseRange(s,max){s=String(s||'').trim().toLowerCase();if(!s||s==='all'||s==='전체')return[1,max];const m=s.match(/^(\d+)\s*-\s*(\d+)$/);if(m)return[Math.max(1,+m[1]),Math.min(max,+m[2])];const n=+s;if(n)return[Math.min(n,max),Math.min(n,max)];return[1,Math.min(max,40)];}
async function pageText(pdf,n,useOcr){const page=await pdf.getPage(n);const content=await page.getTextContent();let text=content.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();if(text.length>40||!useOcr)return text;if(!window.Tesseract)return text;const vp=page.getViewport({scale:1.35}),canvas=document.createElement('canvas');canvas.width=vp.width;canvas.height=vp.height;await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;const out=await Tesseract.recognize(canvas,'kor+eng',{logger:()=>{}});return String(out.data?.text||'').replace(/\s+/g,' ').trim();}
function splitText(text,max=2800){const out=[];let s=String(text||'').trim();while(s.length>max){let k=s.lastIndexOf(' ',max);if(k<max*.6)k=max;out.push(s.slice(0,k));s=s.slice(k).trim();}if(s)out.push(s);return out;}
window.ingestKnowledgePdfs=async function(ev){const files=[...(ev.target.files||[])];if(!files.length)return;const status=document.getElementById('knowledge-ingest-status');const rangeText=document.getElementById('knowledge-page-range')?.value||'1-40';const useOcr=!!document.getElementById('knowledge-use-ocr')?.checked;if(!window.pdfjsLib)return toast('PDF.js를 불러오지 못했습니다.','warning');for(const f of files){const id='d'+Date.now()+Math.random().toString(36).slice(2,7);try{if(status)status.textContent=`${f.name} 읽는 중…`;const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const [a,b]=parseRange(rangeText,pdf.numPages);await dbPut(DB_DOCS,{id,name:f.name,size:f.size,pages:pdf.numPages,indexedFrom:a,indexedTo:b,createdAt:Date.now(),ocr:useOcr});let chunkCount=0;for(let n=a;n<=b;n++){if(status)status.textContent=`${f.name} · ${n}/${b}쪽 색인 중`;const text=await pageText(pdf,n,useOcr);if(!text)continue;for(const [j,ch] of splitText(text).entries()){await dbPut(DB_CHUNKS,{id:`${id}:${n}:${j}`,docId:id,source:f.name,page:n,text:ch});chunkCount++;}}const d={id,name:f.name,size:f.size,pages:pdf.numPages,indexedFrom:a,indexedTo:b,createdAt:Date.now(),ocr:useOcr,chunkCount};await dbPut(DB_DOCS,d);toast(`${f.name}: ${a}~${b}쪽 지식 색인 완료 (${chunkCount}청크)`,'success');}catch(e){toast(`${f.name} 색인 실패: ${e.message}`,'warning');}}ev.target.value='';if(status)status.textContent='색인 완료';await renderKnowledgeDocs();};
window.deleteKnowledgeDoc=async id=>{await dbDeleteDoc(id);renderKnowledgeDocs();toast('PDF 지식을 삭제했습니다.','success');};
async function renderKnowledgeDocs(){const docs=await dbAll(DB_DOCS);const c=document.getElementById('knowledge-doc-list');const ct=document.getElementById('knowledge-doc-count');if(ct)ct.textContent=docs.length;if(!c)return;c.innerHTML=docs.length?docs.sort((a,b)=>b.createdAt-a.createdAt).map(d=>`<div class="p-2.5 border rounded-xl flex items-center justify-between gap-2"><div class="min-w-0"><b class="text-[11px] block truncate">📄 ${esc(d.name)}</b><span class="text-[9px] text-slate-500">${d.indexedFrom||1}~${d.indexedTo||d.pages}쪽 · ${d.chunkCount||0}청크${d.ocr?' · OCR':''}</span></div><button onclick="deleteKnowledgeDoc('${d.id}')" class="text-[10px] text-rose-500">삭제</button></div>`).join(''):'<div class="p-3 text-center text-[11px] text-slate-400">첨부한 PDF 지식이 없습니다.</div>';}
function tok(s){return [...new Set(String(s||'').toLowerCase().split(/[^가-힣a-z0-9]+/).filter(x=>x.length>=2))];}
async function searchKnowledge(query,limit=7){const chunks=await dbAll(DB_CHUNKS);const q=tok(query);if(!q.length)return[];return chunks.map(c=>{const t=c.text.toLowerCase();let score=0;for(const w of q){let pos=0,n=0;while((pos=t.indexOf(w,pos))>=0&&n<6){score+=w.length>=4?4:2;pos+=w.length;n++;}if(String(c.source).toLowerCase().includes(w))score+=3;}return{...c,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);}
window.__searchKnowledgeV3=searchKnowledge;
function contextsText(arr,max=9000){let total=0,out=[];for(const c of arr){const entry=`[출처: ${c.source} p.${c.page}]\n${c.text}`;if(total+entry.length>max)break;out.push(entry);total+=entry.length;}return out.join('\n\n');}
window.generateKnowledgeFromVault=async function(){const q=document.getElementById('knowledge-query')?.value.trim();if(!q)return toast('지식 생성 질문을 입력하세요.','warning');const result=document.getElementById('knowledge-result');if(result){result.classList.remove('hidden');result.textContent='PDF 지식 검색 및 생성 중…';}const hits=await searchKnowledge(`${window.activeSubject||''} ${document.getElementById('coord-major')?.value||''} ${q}`,8);if(!hits.length){if(result)result.textContent='관련 지식 청크를 찾지 못했습니다. PDF를 먼저 첨부하거나 검색어를 바꿔보세요.';return;}const context=contextsText(hits);const prompt=`다음 PDF 지식 조각만 근거로 고등학교 ${window.activeSubject||'교과'}의 탐구 아이디어를 생성한다. 질문: ${q}. 목표 전공: ${document.getElementById('coord-major')?.value||'미입력'}.\n\n규칙: 1) PDF에 없는 책·논문·수치·사실을 만들어내지 않는다. 2) 이것은 탐구 아이디어이므로 학생이 이미 수행했다고 쓰지 않는다. 3) 5개의 아이디어를 제시하고 각각 [탐구 질문 / 교과 연결 / 가능한 활동 / 산출물 / 세특에서 관찰할 포인트 / 출처] 순으로 짧게 쓴다. 4) 각 아이디어 끝에 제공된 출처 표기 그대로 파일명과 쪽을 붙인다.\n\nPDF 지식:\n${context}`;try{const txt=await window.__requestAI(prompt);if(result)result.textContent=txt;const src=document.getElementById('knowledge-result-sources');if(src)src.innerHTML=hits.map(h=>`<span class="inline-block text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 mr-1 mb-1">${esc(h.source)} p.${h.page}</span>`).join('');}catch(e){if(result)result.textContent=`지식 생성 실패: ${e.message}`;}};
window.copyKnowledgeResultToNotes=function(){const t=document.getElementById('knowledge-result')?.textContent||'';const e=document.getElementById('coord-book-notes');if(e)e.value=t;toast('생성 지식을 탐구 메모로 복사했습니다.','success');};

function knowledgePanelHtml(){return `<div id="knowledge-vault-panel" class="bg-white p-4 rounded-2xl border border-indigo-200 shadow-xs space-y-3"><div class="flex flex-wrap items-center justify-between gap-2"><div><h3 class="font-black text-sm text-indigo-950">🧠 PDF Knowledge Vault <span id="knowledge-doc-count" class="text-indigo-600">0</span></h3><p class="text-[10px] text-slate-500">PDF를 페이지별로 색인하고, 현재 질문과 관련된 조각만 찾아 생성에 사용합니다.</p></div><label class="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black cursor-pointer">+ PDF 첨부<input type="file" accept=".pdf" multiple class="hidden" onchange="ingestKnowledgePdfs(event)"></label></div><div class="grid md:grid-cols-[180px_1fr] gap-2 text-xs"><div><label class="font-bold">색인 쪽 범위</label><input id="knowledge-page-range" value="1-40" class="mt-1 w-full p-2 border rounded-lg" placeholder="예: 1-40 또는 all"><label class="mt-2 flex items-center gap-2 text-[10px]"><input id="knowledge-use-ocr" type="checkbox"> 스캔 PDF OCR 사용 (느림)</label><div id="knowledge-ingest-status" class="mt-1 text-[9px] text-slate-400">대용량 자료는 필요한 장부터 색인 권장</div></div><div id="knowledge-doc-list" class="max-h-28 overflow-y-auto space-y-1"></div></div><div class="border-t pt-3"><div class="flex gap-2"><input id="knowledge-query" class="flex-1 p-2 border rounded-xl text-xs" placeholder="예: 한국사 역사신문 제작에 활용할 탐구 질문과 자료 검토 포인트"><button onclick="generateKnowledgeFromVault()" class="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-black">지식에서 생성</button></div><label class="mt-2 flex gap-2 items-center text-[10px] text-slate-600"><input id="knowledge-use-in-seoteuk" type="checkbox" checked> 세특 생성 시 관련 PDF 지식을 참고문맥으로 사용 (학생의 실제 활동 사실로 간주하지 않음)</label><div id="knowledge-result" class="hidden mt-3 p-3 bg-slate-50 border rounded-xl text-xs whitespace-pre-wrap leading-5"></div><div id="knowledge-result-sources" class="mt-2"></div><button onclick="copyKnowledgeResultToNotes()" class="mt-2 text-[10px] font-bold text-purple-700">↳ 결과를 탐구 메모로 복사</button></div></div>`;}

// ---------- Evidence / inference / risk auditor ----------
const RISK_RX=/(완벽|증명함|매우\s*탁월|탁월함|최고|전문가\s*수준|압도적|전국|1위|정량적\s*오차|측정\s*데이터|센서|실험\s*변인)/;
function sentences(t){return String(t||'').split(/(?<=[.!?]|함\.|보임\.|됨\.|임\.)\s+|\n+/).map(x=>x.trim()).filter(Boolean);}
function localAudit(text,observation){const obs=String(observation||'');const obsTok=tok(obs);const numsObs=new Set(obs.match(/\d+(?:\.\d+)?%?/g)||[]);return sentences(text).map(s=>{const unsupportedNum=(s.match(/\d+(?:\.\d+)?%?/g)||[]).some(n=>!numsObs.has(n));if(RISK_RX.test(s)||unsupportedNum)return{text:s,type:'risk',reason:unsupportedNum?'관찰 입력에 없는 수치가 포함됨':'과장 또는 교과 불일치 위험 표현 감지'};const st=tok(s);const overlap=st.filter(w=>obsTok.includes(w)).length;if(overlap>=2)return{text:s,type:'evidence',reason:'입력한 관찰 키워드와 직접 겹침'};return{text:s,type:'inference',reason:'관찰 입력에서 직접 확인되지 않는 해석/확장 가능성'};});}
function renderAudit(seg){const c=document.getElementById('evidence-audit-body');if(!c)return;const cls={evidence:'bg-emerald-100 text-emerald-950 border-emerald-200',inference:'bg-amber-100 text-amber-950 border-amber-200',risk:'bg-rose-100 text-rose-950 border-rose-200'};const lab={evidence:'관찰근거',inference:'AI 추론',risk:'위험/과장'};c.innerHTML=seg.map(x=>`<span title="${esc(x.reason||'')}" class="inline-block p-1.5 m-0.5 rounded-lg border leading-6 ${cls[x.type]||cls.inference}"><b class="text-[9px] mr-1 opacity-70">${lab[x.type]||'AI 추론'}</b>${esc(x.text)}</span>`).join(' ');document.getElementById('evidence-audit-panel')?.classList.remove('hidden');}
window.auditEvidenceLocal=function(){const text=window.getCurrentText?.()||'';const obs=window.__lastObservationV3||document.getElementById('input-chat')?.value||'';renderAudit(localAudit(text,obs));};
window.auditEvidenceWithAI=async function(){const text=window.getCurrentText?.()||'';const obs=window.__lastObservationV3||'';if(!text)return toast('먼저 세특을 생성하세요.','warning');const prompt=`다음 세특 초안을 문장 단위로 분류한다. 실제 관찰 근거는 아래 입력뿐이다. PDF 참고지식은 관찰 사실이 아니다. 각 문장을 evidence(관찰 입력에서 직접 지지), inference(합리적이지만 직접 관찰 근거 없음), risk(없는 수치/책/성과/역할을 지어냈거나 과장·교과 불일치) 중 하나로 분류하고 짧은 이유를 쓴다. 반드시 JSON 배열만 출력한다. 형식 [{"text":"원문 문장","type":"evidence|inference|risk","reason":"이유"}]\n\n관찰 근거:\n${obs}\n\n초안:\n${text}`;try{let raw=await window.__requestAI(prompt);raw=raw.replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();const seg=JSON.parse(raw);if(!Array.isArray(seg))throw new Error('JSON 형식 아님');renderAudit(seg);toast('정밀 근거 감별을 완료했습니다.','success');}catch(e){renderAudit(localAudit(text,obs));toast('정밀 감별 실패 — 로컬 감별로 표시했습니다.','warning');}};
function auditPanelHtml(){return `<div id="evidence-audit-panel" class="hidden mt-2 bg-white border border-slate-200 rounded-2xl p-3 no-print"><div class="flex flex-wrap items-center justify-between gap-2"><div class="text-xs font-black">🧭 생성문 근거 감별 <span class="ml-2 text-[9px] font-normal"><span class="px-1 bg-emerald-100">관찰근거</span> <span class="px-1 bg-amber-100">AI 추론</span> <span class="px-1 bg-rose-100">위험/과장</span></span></div><div class="flex gap-1"><button onclick="auditEvidenceLocal()" class="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold">즉시 감별</button><button onclick="auditEvidenceWithAI()" class="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black">현재 엔진 정밀감별</button><button onclick="document.getElementById('evidence-audit-panel').classList.add('hidden')" class="px-2 py-1 text-slate-400">✕</button></div></div><div id="evidence-audit-body" class="mt-2 text-xs leading-6"></div></div>`;}

// ---------- prompt builder & overrides ----------
function rulesText(rules){return rules.map((r,i)=>`${i+1}) ${r.title}: ${r.text}`).join('\n');}
async function buildKnowledgeContext(msg,career){const use=document.getElementById('knowledge-use-in-seoteuk');if(use&&!use.checked)return'';const hits=await searchKnowledge(`${window.activeSubject||''} ${career||''} ${msg}`,5);if(!hits.length)return'';return `\n\n[PDF 참고 지식 — 학생의 실제 수행 사실이 아니라 개념/탐구 설계 참고자료임]\n${contextsText(hits,6500)}\n[중요] 위 참고지식에 있는 도서명·수치·사례를 학생이 실제 읽거나 수행했다고 쓰지 말 것. 관찰 입력과 명시적으로 연결된 내용만 학생 기록에 사용할 것.`;}
function badDomainRx(fam){if(['history','korean','social','arts','education'].includes(fam))return/(실험\s*변인|센서|측정\s*데이터|정량적\s*오차|테일러\s*급수|수치\s*시뮬레이션)/;return null;}
window.sendChatMessage=async function(){const input=document.getElementById('input-chat');const msg=input?.value.trim();if(!msg)return;const career=document.getElementById('input-career')?.value.trim()||'희망 전공';const subject=window.activeSubject||'교과';const fam=subjectFamily(subject);window.__lastObservationV3=msg;window.appendChatMessage?.('user',msg);input.value='';const rules=activeRules(subject,career);const kctx=await buildKnowledgeContext(msg,career);let prompt=`고등학교 교사가 학교생활기록부 세부능력 및 특기사항 초안을 작성한다.\n과목: ${subject}\n희망 진로: ${career}\n실제로 관찰된 활동: ${msg}\n\n[반드시 적용할 규칙]\n${rulesText(rules)}${kctx}\n\n출력 규칙: 실제 관찰 근거와 참고지식을 엄격히 구분하고, 관찰되지 않은 역할·성과·수치·독서·논문 활용을 창작하지 않는다. 학생의 행동-사고-변화 흐름이 보이도록 자연스러운 개조식 종결형으로 쓰고 1,500바이트를 넘기지 않는다. 결과 본문만 출력한다.`;try{let txt=await window.__requestAI(prompt);const bad=badDomainRx(fam);if(bad&&bad.test(txt)&&!bad.test(msg)){const revise=`다음 ${subject} 세특 초안에 실제 관찰에 없는 다른 교과의 실험·측정 표현이 섞였다. 해당 표현을 제거하고 아래 활성 규칙에 맞게 다시 작성한다. 새로운 사실은 추가하지 않는다.\n규칙:\n${rulesText(rules)}\n관찰:${msg}\n초안:${txt}`;txt=await window.__requestAI(revise);}window.appendChatMessage?.('assistant',txt);window.setCurrentText?.(txt);const ta=document.getElementById('seoteuk-textarea');if(ta)ta.value=txt;window.updateNeisStats?.();renderAudit(localAudit(txt,msg));}catch(e){if(window.currentProvider==='antigravity'){window.appendChatMessage?.('assistant',`⚠️ Antigravity DEV 생성 실패: ${e.message}\n실제 AG 연결 확인을 위해 로컬 더미 문장으로 대체하지 않습니다.`);toast('Antigravity 생성 실패 — AG 문장 테스트를 확인하세요.','warning');return;}window.appendChatMessage?.('assistant',`생성 연결 실패: ${e.message}`);toast('생성 연결을 확인하세요.','warning');}};

window.injectInquiryChainBuilder=function(){const fam=subjectFamily(window.activeSubject);const cur=window.getCurrentText?.()||'';const adds={history:'자료의 작성 주체와 시점, 목적을 확인한 뒤 서로 다른 서술의 관점을 비교하고, 사건을 당시의 맥락과 원인·전개·영향 속에서 해석하려는 질문으로 탐구를 확장함.',korean:'텍스트의 표현과 맥락에서 질문을 만들고 다른 작품·매체의 근거와 비교한 뒤 토론 피드백을 반영해 해석을 수정·확장함.',social:'사회 현상에 대한 질문을 구체화하고 서로 다른 관점과 자료의 근거·한계를 비교한 뒤 대안의 효과와 한계를 검토함.',math:'개념의 조건에서 질문을 만들고 예시·반례·식·그래프로 검토한 뒤 풀이 과정의 한계를 점검하며 일반화 가능성을 탐색함.',science:'관찰에서 질문을 만들고 가설과 근거를 설정한 뒤 실제 수행한 관찰·실험·자료 분석 결과를 검토하며 한계를 성찰함.',engineering:'문제를 정의하고 요구조건을 정리한 뒤 실제 설계·구현·테스트 과정의 피드백을 반영하여 개선점을 도출함.',arts:'표현 의도에서 질문을 만들고 작품 요소를 선택·구성한 뒤 피드백과 자기평가를 바탕으로 표현을 수정·확장함.',education:'학습자와 수업 상황에서 질문을 만들고 교수학습·평가 관점의 근거를 비교한 뒤 교육적 의미와 한계를 성찰함.'};const a=adds[fam]||'수업에서 생긴 질문을 구체화하고 관련 근거를 찾아 비교한 뒤 피드백과 한계를 검토하여 후속 탐구로 확장함.';const u=cur?`${cur.trim()} ${a}`:a;window.setCurrentText?.(u);const ta=document.getElementById('seoteuk-textarea');if(ta)ta.value=u;window.updateNeisStats?.();toast('현재 교과 규칙에 맞는 탐구 체인을 추가했습니다.','success');};
window.injectQuantitativeDataFix=function(){const fam=subjectFamily(window.activeSubject);const cur=window.getCurrentText?.()||'';const adds={history:'사료·자료의 작성 주체와 시점, 목적을 다시 확인하고 서로 다른 서술을 비교하여 사실과 해석을 구분하는 근거 검토를 보강함.',korean:'주장과 해석을 뒷받침하는 작품·텍스트의 구체적 표현을 다시 확인하여 근거를 보강함.',social:'통계·사례·정책 자료의 출처와 조사 조건을 확인하고 자료가 보여주는 범위와 한계를 구분하여 해석함.',math:'사용한 정의와 조건, 계산 또는 그래프의 근거를 다시 확인하여 추론의 빈틈을 보완함.',science:'실제 수행 기록에 있는 관찰값·측정 조건·오차 요인을 다시 확인하여 해석의 타당성을 점검함.',engineering:'요구조건과 테스트 결과 중 실제 기록된 근거를 다시 확인하여 설계 판단의 근거를 보완함.',arts:'표현 의도와 실제 작품 요소의 연결 근거를 다시 확인하여 감상·창작 설명을 구체화함.',education:'학습자 반응과 수업 맥락 등 실제 자료를 다시 확인하여 교육적 판단의 근거를 보강함.'};const a=adds[fam]||'실제 사용한 자료와 관찰 기록을 다시 확인하여 주장의 근거와 한계를 보강함.';const u=cur?`${cur.trim()} ${a}`:a;window.setCurrentText?.(u);const ta=document.getElementById('seoteuk-textarea');if(ta)ta.value=u;window.updateNeisStats?.();toast('교과 맞춤 근거 보강을 적용했습니다.','success');};
window.triggerAIMaxByteFill=function(){let t=window.getCurrentText?.()||'';if(!t.trim())return toast('본문을 먼저 입력하세요.','warning');const fam=subjectFamily(window.activeSubject);const bank={history:['자료의 출처와 서술 관점을 재확인하며 역사적 사실과 해석을 구분하려는 태도가 드러남.','사건을 당시의 맥락에서 이해하고 근거에 맞게 독자에게 전달하기 위해 표현을 수정·보완함.'],korean:['텍스트의 구체적 표현을 근거로 자신의 해석을 보완하고 다른 관점을 수용해 글의 논리를 다듬음.'],social:['자료가 보여주는 범위와 한계를 함께 검토하며 쟁점에 대한 판단 근거를 정교하게 다듬음.'],math:['풀이의 조건과 추론 과정을 다시 확인하며 다른 접근과 비교해 설명을 보완함.'],science:['실제 관찰·자료와 해석을 구분하고 결과의 한계를 점검하며 후속 질문을 구체화함.'],engineering:['요구조건과 실제 테스트 결과를 대조하며 설계의 한계와 개선 방향을 구체화함.'],arts:['표현 의도와 결과를 비교하고 피드백을 반영해 작품의 구성과 전달 방식을 보완함.'],education:['학습자와 수업 맥락을 고려해 교육적 판단의 근거와 한계를 성찰함.']};for(const s of (bank[fam]||['수업 활동의 근거와 피드백을 다시 확인하며 자신의 생각을 구체화하고 후속 질문을 확장함.'])){const nt=t+' '+s;if(window.calculateNeisBytes(nt)<=1500)t=nt;}window.setCurrentText?.(t);const ta=document.getElementById('seoteuk-textarea');if(ta)ta.value=t;window.updateNeisStats?.();renderAudit(localAudit(t,window.__lastObservationV3||''));toast('교과 맞춤형으로만 분량을 보강했습니다.','success');};

function renderBulkV3(){const c=document.getElementById('bulk-student-list'),count=document.getElementById('bulk-count');if(count)count.textContent=window.bulkStudents?.length||0;if(!c)return;if(!window.bulkStudents?.length){c.innerHTML='<div class="p-6 text-center text-slate-400 text-xs">엑셀을 업로드하거나 학생을 추가하세요.</div>';return;}c.innerHTML=window.bulkStudents.map((s,i)=>`<button type="button" data-i="${i}" class="w-full text-left p-2.5 text-xs hover:bg-blue-50 ${i===window.selectedBulkIndex?'bg-blue-50 text-blue-900':'text-slate-700'}"><div class="font-black">${esc(s.no)} · ${esc(s.name)}</div><div class="text-[10px] text-slate-500 mt-0.5 truncate">${esc(s.result||s.observation||'기록 없음')}</div></button>`).join('');c.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{window.selectedBulkIndex=Number(b.dataset.i);const s=window.bulkStudents[window.selectedBulkIndex];const h=document.getElementById('detail-student-header'),ta=document.getElementById('bulk-detail-textarea'),by=document.getElementById('detail-student-bytes');if(h)h.textContent=`${s.no} ${s.name}`;if(ta)ta.value=s.result||'';if(by)by.textContent=`${window.calculateNeisBytes?.(s.result||'')||0} Byte`;renderBulkV3();});}

// bulk process uses same rule packs; does not use PDF knowledge unless observation query retrieves it
window.startBulkBatchProcess=async function(){if(!window.bulkStudents?.length)return toast('먼저 엑셀을 업로드하세요.','warning');const btn=document.getElementById('btn-start-bulk');if(btn){btn.disabled=true;btn.textContent='규칙 적용 생성 중…';}const subject=document.getElementById('bulk-subject')?.value.trim()||window.activeSubject;const cat=document.getElementById('bulk-category')?.value||'교과세특';for(let i=0;i<window.bulkStudents.length;i++){const s=window.bulkStudents[i];if(!s.observation){s.result='';continue;}const rules=activeRules(subject,s.career||'');const kctx=await buildKnowledgeContext(s.observation,s.career||'');const prompt=`고등학교 ${cat} 초안을 작성한다. 과목: ${subject}. 실제 관찰 기록: ${s.observation}. 희망 진로: ${s.career||'미입력'}.\n활성 규칙:\n${rulesText(rules)}${kctx}\n관찰에 없는 사실·수치·독서·성과를 만들지 말고 교과에 맞는 탐구 문법으로 1,500바이트 이내 개조식 본문만 출력한다.`;try{s.result=await window.__requestAI(prompt);}catch(e){s.result=`[생성 실패] ${e.message}`;}window.selectedBulkIndex=i;renderBulkV3();}if(btn){btn.disabled=false;btn.textContent='🚀 일괄 생성';}toast('교과별 사전 규칙을 적용한 일괄 생성을 완료했습니다.','success');};

// cloud state hooks for rules (knowledge chunks stay local IndexedDB)
function hookCloud(){if(typeof window.__getCloudState==='function'&&!window.__getCloudState.__v3hook){const og=window.__getCloudState;const f=function(){return Object.assign({},og(),{ruleBookV3:window.__ruleBookV3});};f.__v3hook=true;window.__getCloudState=f;}if(typeof window.__applyCloudState==='function'&&!window.__applyCloudState.__v3hook){const oa=window.__applyCloudState;const f=function(s){if(s?.ruleBookV3){window.__ruleBookV3=s.ruleBookV3;saveRules(window.__ruleBookV3);}return oa(s);};f.__v3hook=true;window.__applyCloudState=f;}}

function installUI(){
 document.body.insertAdjacentHTML('beforeend',ruleModalHtml()+newspaperModalHtml());
 const quick=document.querySelector('header > div:last-child');if(quick){const b=document.createElement('button');b.type='button';b.onclick=window.openRuleStudio;b.className='text-xs px-2 sm:px-2.5 py-1.5 rounded-xl font-black border bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100';b.innerHTML='📐 <span class="hidden sm:inline">규칙</span>';quick.insertBefore(b,quick.firstChild);}
 const tabs=document.querySelector('#panel-left > .flex.border-b');if(tabs){const b=document.createElement('button');b.id='btn-history-newspaper';b.type='button';b.onclick=window.openHistoryNewspaperForm;b.className='hidden flex-1 py-1.5 rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 text-center transition-all';b.textContent='📰 역사신문';tabs.appendChild(b);}
 const coord=document.querySelector('#tab-content-coordinator > div');if(coord)coord.insertAdjacentHTML('afterbegin',knowledgePanelHtml());
 const editor=document.getElementById('tab-content-editor');if(editor){const main=editor.querySelector('.flex-1.bg-white.rounded-2xl');if(main)main.insertAdjacentHTML('afterend',auditPanelHtml());}
 const action=[...document.querySelectorAll('#tab-content-editor .no-print button')].find(x=>x.textContent.includes('1,500B'))?.parentElement;if(action){const b=document.createElement('button');b.type='button';b.onclick=window.auditEvidenceLocal;b.className='px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-black flex items-center gap-1';b.textContent='🧭 근거 감별';action.appendChild(b);}
 const qfix=[...document.querySelectorAll('#tab-content-editor button')].find(x=>x.textContent.includes('정량 오차'));if(qfix)qfix.innerHTML='<span>🧭</span> 교과 맞춤 근거 보강';
 const oldHS=window.handleSubjectChange;if(typeof oldHS==='function')window.handleSubjectChange=function(name){oldHS(name);updateHistoryButton();};
 updateHistoryButton();renderKnowledgeDocs();hookCloud();
}
function updateHistoryButton(){const b=document.getElementById('btn-history-newspaper');if(b)b.classList.toggle('hidden',subjectFamily(window.activeSubject)!=='history');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installUI);else installUI();
setTimeout(hookCloud,1200);
})();
