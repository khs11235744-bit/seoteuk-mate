/* Seoteuk Mate v3.3 — Teacher UX */
(function(){
'use strict';
if(window.__SEOTEUK_TEACHER_UX_V33__) return;
window.__SEOTEUK_TEACHER_UX_V33__=true;
const VERSION='3.3.0';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(_){return d}};
const bytes=t=>window.calculateNeisBytes?.(String(t||''))??new TextEncoder().encode(String(t||'')).length;
const getText=()=>window.getCurrentText?.()||$('seoteuk-textarea')?.value||'';
const setText=t=>{window.setCurrentText?.(String(t||''));if($('seoteuk-textarea'))$('seoteuk-textarea').value=String(t||'');window.updateNeisStats?.();};
const toast=(m,t='info')=>window.showToast?.(m,t);
const WORKSPACE_KEY='seoteukMate.workspace.v3';
const RECORD_KEY='seoteukMate.workspaceRecords.v3';

function injectStyle(){
 if($('sm33-style'))return;
 const s=document.createElement('style');s.id='sm33-style';
 s.textContent=`
 body.sm33-clean-header header label[title*="PDF"],
 body.sm33-clean-header header #btn-launch-antigravity,
 body.sm33-clean-header header #btn-header-ai-indicator,
 body.sm33-clean-header header #btn-cloud-account,
 body.sm33-clean-header header #btn-toggle-eval-mode,
 body.sm33-clean-header header button[onclick*="openUnivTipsModal"],
 body.sm33-clean-header header button[onclick*="openComprehensiveReportModal"]{display:none!important}
 .sm33-chip{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:6px 10px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;font-size:11px;font-weight:800;white-space:nowrap}
 .sm33-dot{width:8px;height:8px;border-radius:999px;background:#94a3b8}.sm33-menu{position:absolute;right:0;top:calc(100% + 8px);width:270px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 18px 50px rgba(15,23,42,.18);padding:10px;z-index:260}
 .sm33-action{width:100%;text-align:left;padding:9px 10px;border-radius:10px;font-size:11px;font-weight:800}.sm33-action:hover{background:#f1f5f9}
 .sm33-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
 .sm33-card{padding:14px;border:1px solid #e2e8f0;border-radius:18px;background:#fff}.sm33-card b{font-size:13px}
 .sm33-badge{display:inline-flex;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:900;border:1px solid #e2e8f0}
 .sm33-diff-old{background:#fff1f2;text-decoration:line-through;color:#9f1239;padding:1px 3px;border-radius:4px}.sm33-diff-new{background:#ecfdf5;color:#047857;padding:1px 3px;border-radius:4px}
 @media(max-width:767px){.sm33-chip span.sm33-hide-mobile{display:none}.sm33-chip{padding:6px 8px}}
 `;
 document.head.appendChild(s);
}

function modalRoot(){
 let m=$('sm33-modal');if(m)return m;
 m=document.createElement('div');m.id='sm33-modal';m.className='hidden fixed inset-0 z-[255] bg-slate-950/55 backdrop-blur-sm p-3 sm:p-5 items-center justify-center no-print';
 m.innerHTML=`<div class="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
 <div class="px-5 py-4 border-b flex justify-between gap-3"><div><h3 id="sm33-modal-title" class="font-black text-slate-900"></h3><p id="sm33-modal-sub" class="text-[11px] text-slate-500 mt-1"></p></div><button type="button" onclick="closeSM33Modal()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>
 <div id="sm33-modal-body" class="p-4 sm:p-5 overflow-y-auto custom-scrollbar"></div></div>`;
 document.body.appendChild(m);return m;
}
function showModal(title,sub,html){
 const m=modalRoot();$('sm33-modal-title').textContent=title;$('sm33-modal-sub').textContent=sub||'';$('sm33-modal-body').innerHTML=html;m.classList.remove('hidden');m.classList.add('flex');
}
window.closeSM33Modal=()=>{const m=$('sm33-modal');m?.classList.add('hidden');m?.classList.remove('flex')};

function quickParent(){const header=document.querySelector('body > header');return header?.lastElementChild||null}
function ensureHeaderStatus(){
 document.body.classList.add('sm33-clean-header');
 const p=quickParent();if(!p||$('sm33-account-wrap'))return;
 const ai=document.createElement('button');ai.id='sm33-ai-chip';ai.type='button';ai.className='sm33-chip';ai.onclick=()=>window.openApiKeyModal?.();ai.innerHTML='<span class="sm33-dot" id="sm33-ai-dot"></span><span id="sm33-ai-text">AI 상태 확인</span>';p.appendChild(ai);
 const wrap=document.createElement('div');wrap.id='sm33-account-wrap';wrap.className='relative';wrap.innerHTML=`<button id="sm33-account-chip" type="button" class="sm33-chip"><span id="sm33-account-avatar">👤</span><span id="sm33-account-text">Google 로그인</span><span>▾</span></button>
 <div id="sm33-account-menu" class="sm33-menu hidden"><div id="sm33-account-info" class="p-2 mb-1 border-b text-[11px] text-slate-600"></div>
 <button class="sm33-action" onclick="window.firebaseUI?.saveNow?.()">☁️ 지금 클라우드 저장</button>
 <button class="sm33-action" onclick="window.openCloudAccountModal?.()">⚙️ 계정·클라우드 설정</button>
 <button class="sm33-action text-rose-700" onclick="window.firebaseUI?.signOut?.()">🚪 로그아웃</button></div>`;
 p.appendChild(wrap);
 $('sm33-account-chip').onclick=e=>{e.stopPropagation();$('sm33-account-menu').classList.toggle('hidden')};
 document.addEventListener('click',()=> $('sm33-account-menu')?.classList.add('hidden'));
 setInterval(syncHeaderStatus,1200);syncHeaderStatus();
}
function syncHeaderStatus(){
 const user=window.SeoteukCloud?.getUser?.(),acct=$('sm33-account-text'),info=$('sm33-account-info'),avatar=$('sm33-account-avatar');
 if(acct)acct.textContent=user?(user.displayName||user.email||'로그인됨'):'Google 로그인';
 if(info)info.innerHTML=user?`<b>${esc(user.displayName||'Google 사용자')}</b><div class="mt-1">${esc(user.email||'')}</div><div class="mt-1 text-emerald-700">${esc($('cloud-status-label')?.textContent||'클라우드 연결')}</div>`:'로그인하면 학생별 기록을 클라우드에 저장할 수 있습니다.';
 if(avatar)avatar.innerHTML=user?.photoURL?`<img src="${esc(user.photoURL)}" class="w-6 h-6 rounded-full">`:'👤';
 const provider=window.currentProvider||'미선택',dot=$('sm33-ai-dot'),text=$('sm33-ai-text');
 let connected=true,label=provider==='antigravity'?'Antigravity':provider==='gemini'?'Gemini':provider==='server'?'서버 AI':provider;
 if(provider==='antigravity'){const s=$('ag-dev-inline-status')?.textContent||'';connected=/연결|패킷 사용 중|확인 완료/.test(s);if(!connected)label='Antigravity 연결 확인'}
 if(text)text.textContent='AI · '+label;if(dot)dot.style.background=connected?'#10b981':'#f59e0b';
}

const SPELL_RULES=[
 {id:'multiSpace',label:'연속 공백',rx:/[ \t]{2,}/g,to:' '},
 {id:'punct',label:'문장부호 앞 공백',rx:/\s+([,.;:!?])/g,to:'$1'},
 {id:'canDo',label:'‘수 있다/없다’ 띄어쓰기',rx:/수(있|없)(다|음|는|도록|게)?/g,to:'수 $1$2'},
 {id:'through',label:'‘을/를 통해’ 띄어쓰기',rx:/([을를])통해/g,to:'$1 통해'},
 {id:'about1',label:'‘에 대해’ 띄어쓰기',rx:/에대해/g,to:'에 대해'},
 {id:'about2',label:'‘에 대한’ 띄어쓰기',rx:/에대한/g,to:'에 대한'},
 {id:'notOnly',label:'‘뿐만 아니라’ 띄어쓰기',rx:/뿐만아니라/g,to:'뿐만 아니라'},
 {id:'classTime',label:'‘수업 시간’ 띄어쓰기',rx:/수업시간/g,to:'수업 시간'},
 {id:'textbookIn',label:'‘교과서 속’ 띄어쓰기',rx:/교과서속/g,to:'교과서 속'},
 {id:'activityProcess',label:'‘활동 과정’ 띄어쓰기',rx:/활동과정/g,to:'활동 과정'},
 {id:'researchProcess',label:'‘탐구 과정’ 띄어쓰기',rx:/탐구과정/g,to:'탐구 과정'},
 {id:'learningProcess',label:'‘학습 과정’ 띄어쓰기',rx:/학습과정/g,to:'학습 과정'},
 {id:'problemSolve',label:'‘문제 해결’ 띄어쓰기',rx:/문제해결/g,to:'문제 해결'},
 {id:'interestField',label:'‘관심 분야’ 띄어쓰기',rx:/관심분야/g,to:'관심 분야'},
 {id:'careerField',label:'‘진로 분야’ 띄어쓰기',rx:/진로분야/g,to:'진로 분야'},
 {id:'thisProcess',label:'‘이/그 과정에서’ 띄어쓰기',rx:/(이|그)과정에서/g,to:'$1 과정에서'},
 {id:'throughThis',label:'‘이를 통해’ 띄어쓰기',rx:/이를통해/g,to:'이를 통해'}
];
function spellSuggestions(text){
 const arr=[];for(const r of SPELL_RULES){const after=String(text).replace(r.rx,r.to);if(after!==text)arr.push({id:r.id,label:r.label,before:text,after})}
 const end=String(text).replace(/하였습니다\./g,'함.').replace(/했습니다\./g,'함.').replace(/되었습니다\./g,'됨.').replace(/보여주었습니다\./g,'보임.');
 if(end!==text)arr.push({id:'recordEnding',label:'생기부 종결형(~함/~됨/~보임)',before:text,after:end});
 return arr;
}
function miniDiff(a,b){
 let s=0;while(s<a.length&&s<b.length&&a[s]===b[s])s++;
 let ea=a.length-1,eb=b.length-1;while(ea>=s&&eb>=s&&a[ea]===b[eb]){ea--;eb--}
 const left=esc(a.slice(Math.max(0,s-22),s)),right=esc(a.slice(ea+1,Math.min(a.length,ea+23)));
 return `${left}<span class="sm33-diff-old">${esc(a.slice(s,ea+1))}</span><span class="sm33-diff-new">${esc(b.slice(s,eb+1))}</span>${right}`;
}
window.openSpellCheck33=function(){
 const original=getText(),sugs=spellSuggestions(original);
 showModal('가✓ 맞춤법·띄어쓰기','보수적인 로컬 규칙만 제안합니다. 원문을 바로 덮어쓰지 않고 선택한 수정만 적용합니다.',`
 <div class="grid lg:grid-cols-[1fr_320px] gap-4"><div><textarea id="sm33-spell-source" spellcheck="true" class="w-full min-h-[300px] p-4 border rounded-2xl text-sm leading-7">${esc(original)}</textarea>
 <div class="mt-2 text-[11px] text-slate-500">브라우저 기본 맞춤법 밑줄 + 세특용 띄어쓰기 규칙을 함께 사용합니다.</div></div>
 <div><div id="sm33-spell-list" class="space-y-2">${sugs.length?sugs.map((x,i)=>`<label class="block p-3 border rounded-2xl cursor-pointer"><div class="flex gap-2"><input type="checkbox" class="sm33-spell-check" value="${i}" checked><b class="text-xs">${esc(x.label)}</b></div><div class="mt-2 text-[11px] leading-5">${miniDiff(x.before,x.after)}</div></label>`).join(''):'<div class="p-5 text-center text-emerald-700 bg-emerald-50 rounded-2xl">로컬 규칙에서 즉시 발견된 항목이 없습니다.</div>'}</div>
 <div class="grid grid-cols-2 gap-2 mt-3"><button onclick="sm33PreviewSpell()" class="p-2 bg-slate-800 text-white rounded-xl text-xs font-black">수정안 미리보기</button><button onclick="sm33ApplySpell()" class="p-2 bg-blue-600 text-white rounded-xl text-xs font-black">선택 적용</button></div></div></div>`);
 window.__sm33Spell={original,sugs};
};
function selectedSpellText(){
 const state=window.__sm33Spell;if(!state)return'';
 let t=state.original;
 const selected=[...document.querySelectorAll('.sm33-spell-check:checked')].map(x=>Number(x.value)).sort((a,b)=>a-b);
 for(const i of selected){const r=state.sugs[i];if(!r)continue;const rule=SPELL_RULES.find(x=>x.id===r.id);if(rule)t=t.replace(rule.rx,rule.to);else if(r.id==='recordEnding')t=t.replace(/하였습니다\./g,'함.').replace(/했습니다\./g,'함.').replace(/되었습니다\./g,'됨.').replace(/보여주었습니다\./g,'보임.')}
 return t;
}
window.sm33PreviewSpell=function(){
 const state=window.__sm33Spell,t=selectedSpellText();if(!state)return;
 showModal('수정 전·후 비교','적용하기 전에 바뀐 전체 문장을 확인합니다.',`<div class="grid md:grid-cols-2 gap-3"><div><b class="text-xs text-rose-700">수정 전</b><div class="mt-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm leading-7 whitespace-pre-wrap">${esc(state.original)}</div></div><div><b class="text-xs text-emerald-700">수정 후</b><div class="mt-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm leading-7 whitespace-pre-wrap">${esc(t)}</div><button onclick="sm33ApplySpell(true)" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">이 수정안 적용</button></div></div>`);
};
window.sm33ApplySpell=function(){const t=selectedSpellText();setText(t);window.closeSM33Modal();toast('맞춤법·띄어쓰기 수정안을 적용했습니다.','success')};

function currentStudent(){return window.SeoteukWorkspace?.getCurrentStudent?.()||null}
function countRecord(rec){
 let subjects=0,versions=0,areas={교과세특:0,진로활동:0,자율활동:0,동아리활동:0},over=0;
 const d=rec?.appState?.subjectData||{};for(const [sub,sems] of Object.entries(d)){let has=false;for(const vers of Object.values(sems||{}))for(const t of Object.values(vers||{}))if(String(t||'').trim()){versions++;has=true;if(bytes(t)>1500)over++}if(has)subjects++}
 const cd=rec?.categoryDrafts||{};for(const [area,sems]of Object.entries(cd))for(const vers of Object.values(sems||{}))for(const t of Object.values(vers||{}))if(String(t||'').trim()){areas[area]=(areas[area]||0)+1;if(bytes(t)>1500)over++}
 return{subjects,versions,areas,over};
}
window.openStudentHome33=function(){
 const s=currentStudent();if(!s)return toast('학생 관리에서 먼저 학생을 선택하세요.','warning');
 const rec=load(RECORD_KEY,{})[s.id]||null,st=countRecord(rec);
 showModal('👤 학생 홈',`${s.no||''} ${s.name} · ${s.career||'진로 미입력'}`,`
 <div class="grid lg:grid-cols-[1fr_300px] gap-4"><div><div class="sm33-grid">
 <button class="sm33-card text-left" onclick="closeSM33Modal();switchMainTab('editor')"><b>✍️ 세특 작성</b><div class="text-[11px] text-slate-500 mt-1">${st.subjects}과목 · ${st.versions}개 작성본</div></button>
 <button class="sm33-card text-left" onclick="closeSM33Modal();openAnalyticsDashboard()"><b>📊 종합 분석</b><div class="text-[11px] text-slate-500 mt-1">근거·반복·성장 흐름 확인</div></button>
 <button class="sm33-card text-left" onclick="closeSM33Modal();switchMainTab('interview')"><b>🎙️ 면접 연습</b><div class="text-[11px] text-slate-500 mt-1">${rec?.interviewQuestions?.length||0}개 질문 저장</div></button>
 <button class="sm33-card text-left" onclick="closeSM33Modal();openAdmissionsCenter()"><b>🎓 대입정보</b><div class="text-[11px] text-slate-500 mt-1">입학처·요강·PDF 분석</div></button>
 </div><div class="mt-4"><h4 class="font-black mb-2">창의적 체험활동 작성 현황</h4><div class="sm33-grid">${['진로활동','자율활동','동아리활동'].map(a=>`<div class="sm33-card"><b>${a}</b><div class="text-2xl font-black mt-2">${st.areas[a]||0}</div><div class="text-[10px] text-slate-500">작성 버전</div></div>`).join('')}</div></div></div>
 <div class="space-y-3"><div class="sm33-card"><b>검토 상태</b><div class="mt-3">${st.over?`<span class="sm33-badge bg-rose-50 text-rose-700">${st.over}개 1500B 초과</span>`:'<span class="sm33-badge bg-emerald-50 text-emerald-700">바이트 초과 없음</span>'}</div></div>
 <button onclick="closeSM33Modal();openSpellCheck33()" class="w-full p-3 bg-blue-600 text-white rounded-2xl text-xs font-black">가✓ 현재 문장 맞춤법·띄어쓰기</button>
 <button onclick="closeSM33Modal();openClassClosing33()" class="w-full p-3 bg-slate-900 text-white rounded-2xl text-xs font-black">✅ 학급 마감판 보기</button></div></div>`);
};
function auditText(t){
 const issues=[];if(bytes(t)>1500)issues.push('1500B 초과');if((t.match(/탁월|우수|완벽|매우 뛰어/g)||[]).length)issues.push('추상 평가어');
 if((t.match(/학생은|학생이/g)||[]).length>=2)issues.push('주어 반복');if(!/(작성|제작|발표|토론|비교|분석|조사|검토|설명|질문|기획|참여|구성|수정)/.test(t))issues.push('행동 근거 약함');
 return issues;
}
window.openClassClosing33=function(){
 const ws=window.SeoteukWorkspace?.getWorkspace?.()||load(WORKSPACE_KEY,{classes:[],students:[]});if(!ws.students?.length)return toast('학생 명렬이 없습니다.','warning');
 const selected=load('seoteukMate.workspaceSelectedClass','')||ws.classes?.[0]?.id,students=ws.students.filter(s=>!selected||s.classId===selected),records=load(RECORD_KEY,{});
 const rows=students.map(s=>{const rec=records[s.id],st=countRecord(rec),all=[];const d=rec?.appState?.subjectData||{};for(const sems of Object.values(d))for(const vers of Object.values(sems||{}))for(const t of Object.values(vers||{}))if(String(t||'').trim())all.push(String(t));const cd=rec?.categoryDrafts||{};for(const sems of Object.values(cd))for(const vers of Object.values(sems||{}))for(const t of Object.values(vers||{}))if(String(t||'').trim())all.push(String(t));const issues=[...new Set(all.flatMap(auditText))];return{s,st,issues}});
 const incomplete=rows.filter(x=>x.st.subjects===0).length,warn=rows.filter(x=>x.issues.length).length;
 showModal('✅ 학급 마감 대시보드','미작성·바이트 초과·문장 검토 필요 학생을 한 화면에서 확인합니다.',`
 <div class="grid grid-cols-3 gap-2 mb-4"><div class="sm33-card"><b>학생</b><div class="text-2xl font-black">${rows.length}</div></div><div class="sm33-card"><b>교과 미작성</b><div class="text-2xl font-black text-rose-600">${incomplete}</div></div><div class="sm33-card"><b>검토 필요</b><div class="text-2xl font-black text-amber-600">${warn}</div></div></div>
 <div class="overflow-x-auto"><table class="w-full text-[11px] border-collapse"><thead><tr><th class="border p-2">번호</th><th class="border p-2">이름</th><th class="border p-2">작성 교과</th><th class="border p-2">1500B 초과</th><th class="border p-2">검토 알림</th></tr></thead><tbody>
 ${rows.map(x=>`<tr><td class="border p-2">${esc(x.s.no||'')}</td><td class="border p-2 font-bold">${esc(x.s.name)}</td><td class="border p-2 text-center">${x.st.subjects}</td><td class="border p-2 text-center">${x.st.over||'-'}</td><td class="border p-2">${x.issues.length?x.issues.map(i=>`<span class="sm33-badge bg-amber-50 text-amber-800 mr-1">${esc(i)}</span>`).join(''):'<span class="text-emerald-700">즉시 경고 없음</span>'}</td></tr>`).join('')}</tbody></table></div>`);
};

function enhanceMenu(){
 const menu=$('sm-main-menu');if(!menu)return;
 if(!$('sm33-spell-menu')){const local=[...menu.querySelectorAll('button')].find(b=>/로컬 도구/.test(b.textContent||''));const b=document.createElement('button');b.id='sm33-spell-menu';b.className='sm-menu-btn';b.type='button';b.onclick=window.openSpellCheck33;b.title='현재 문장의 맞춤법·띄어쓰기 수정 제안';b.innerHTML='<span class="sm-menu-icon">가✓</span><span>맞춤법·띄어쓰기</span>';local?.after(b)}
 if(!$('sm33-student-home-menu')){const students=[...menu.querySelectorAll('button')].find(b=>/학생 관리/.test(b.textContent||''));const b=document.createElement('button');b.id='sm33-student-home-menu';b.className='sm-menu-btn';b.type='button';b.onclick=window.openStudentHome33;b.title='현재 선택 학생의 기록·분석·면접·대입정보 홈';b.innerHTML='<span class="sm-menu-icon">🏠</span><span>학생 홈</span>';students?.after(b)}
 if(!$('sm33-closing-menu')){const bulk=[...menu.querySelectorAll('button')].find(b=>/일괄 처리/.test(b.textContent||''));const b=document.createElement('button');b.id='sm33-closing-menu';b.className='sm-menu-btn';b.type='button';b.onclick=window.openClassClosing33;b.title='학급 전체 미작성·바이트·검토 현황';b.innerHTML='<span class="sm-menu-icon">✅</span><span>학급 마감</span>';bulk?.after(b)}
}
function patchAnalytics(){
 const old=window.openAnalyticsDashboard;if(typeof old!=='function'||old.__sm33)return;
 const wrapped=function(){old();setTimeout(()=>{const body=$('sm3-analytics-body');if(body&&!$('sm33-audit-tip')){const d=document.createElement('div');d.id='sm33-audit-tip';d.className='mb-3 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900';d.innerHTML='<b>분석표 2.0:</b> 위 지표는 합격 가능성이나 학생 순위가 아니라 기록의 근거·과정·반복을 점검하는 교사용 참고 정보입니다. 현재 문장은 <button onclick="closeAnalyticsDashboard();openSpellCheck33()" class="underline font-black">맞춤법·띄어쓰기</button>에서 교정할 수 있습니다.';body.prepend(d)}},30)};wrapped.__sm33=true;window.openAnalyticsDashboard=wrapped;
}
function version(){
 const badge=[...document.querySelectorAll('header span')].find(x=>/P\.O\.H\.A\.N\.G 2026/.test(x.textContent||''));if(badge)badge.textContent='P.O.H.A.N.G 2026 · v3.3.0 TEACHER UX';
 document.title='Seoteuk Mate P.O.H.A.N.G v3.3.0 - Teacher UX · Offline · Admissions · Cloud';
}
function init(){injectStyle();modalRoot();ensureHeaderStatus();enhanceMenu();patchAnalytics();version();setTimeout(()=>{enhanceMenu();syncHeaderStatus()},1400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300));else setTimeout(init,300);
})();
/* admissions 2.0 enhancement */
(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const showModal=(title,sub,html)=>{
   const m=document.getElementById('sm33-modal');if(!m)return;
   document.getElementById('sm33-modal-title').textContent=title;document.getElementById('sm33-modal-sub').textContent=sub||'';document.getElementById('sm33-modal-body').innerHTML=html;m.classList.remove('hidden');m.classList.add('flex');
 };
 const KEY='seoteukMate.admissionFavorites.v33';
 const loadFav=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){return[]}};
 const saveFav=v=>localStorage.setItem(KEY,JSON.stringify(v));
 window.sm33SaveFavoriteUniversity=function(){
   const name=String(document.getElementById('sm32-adm-univ')?.value||'').trim();if(!name)return window.showToast?.('대학명을 입력하세요.','warning');
   const arr=loadFav();if(!arr.includes(name))arr.unshift(name);saveFav(arr.slice(0,12));window.sm33PaintAdmissionFavorites?.();window.showToast?.('즐겨찾기에 저장했습니다.','success');
 };
 window.sm33ChooseFavorite=function(name){const i=document.getElementById('sm32-adm-univ');if(i)i.value=name};
 window.sm33PaintAdmissionFavorites=function(){
   const box=document.getElementById('sm33-adm-favs');if(!box)return;const arr=loadFav();
   box.innerHTML=arr.length?arr.map(x=>'<button class="px-2 py-1 rounded-lg bg-white border text-[10px] font-bold" onclick="sm33ChooseFavorite('+JSON.stringify(x)+')">'+esc(x)+'</button>').join(' '):'<span class="text-[10px] text-slate-400">즐겨찾기 대학 없음</span>';
 };
 window.sm33OpenPdfEvidence=function(slot){
   const r=window.__sm32PdfReports?.[slot];if(!r)return window.showToast?.('먼저 요강 '+slot+' PDF를 분석하세요.','warning');
   const rows=Object.entries(r.hits||{}).filter(([,v])=>v?.length).map(([k,v])=>'<div class="p-3 border rounded-2xl"><b>'+esc(k)+'</b>'+v.slice(0,8).map(h=>'<div class="mt-2 text-[11px] leading-5"><span class="font-black text-blue-700">p.'+h.page+'</span> '+esc(h.snippet||'')+'</div>').join('')+'</div>').join('');
   showModal('📌 요강 '+slot+' 근거 문장',r.file||'',rows||'<div class="p-6 text-center text-slate-400">탐지된 항목이 없습니다.</div>');
 };
 const old=window.openAdmissionsCenter;
 if(typeof old==='function'&&!old.__sm33){
   const wrapped=function(){old();setTimeout(()=>{
     const body=document.querySelector('#sm32-adm-modal [data-body]');if(!body||document.getElementById('sm33-adm-extra'))return;
     const d=document.createElement('div');d.id='sm33-adm-extra';d.className='mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl';
     d.innerHTML='<div class="flex flex-wrap items-center justify-between gap-2"><div><b class="text-xs">⭐ 관심 대학</b><div id="sm33-adm-favs" class="mt-2 flex flex-wrap gap-1"></div></div><button onclick="sm33SaveFavoriteUniversity()" class="px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-black">현재 대학 저장</button></div><div class="grid grid-cols-2 gap-2 mt-3"><button onclick="sm33OpenPdfEvidence(\'A\')" class="p-2 bg-white border rounded-xl text-xs font-black">요강 A 근거 문장</button><button onclick="sm33OpenPdfEvidence(\'B\')" class="p-2 bg-white border rounded-xl text-xs font-black">요강 B 근거 문장</button></div>';
     body.prepend(d);window.sm33PaintAdmissionFavorites();
   },30)};wrapped.__sm33=true;window.openAdmissionsCenter=wrapped;
 }
})();
