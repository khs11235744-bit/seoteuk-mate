/* Seoteuk Mate v2.8 — progress, clean outputs, alternatives, category topics */
(function(){
'use strict';
if(window.__SEOTEUK_V28_LOADED__) return;
window.__SEOTEUK_V28_LOADED__=true;

const VERSION='2.8.0';
const HISTORY_KEY='seoteukMate.v28.history';
const REDO_KEY='seoteukMate.v28.redo';
const ALT_KEY='seoteukMate.v28.alternatives';
const TOPIC_KEY='seoteukMate.v28.categoryTopics';
const CATEGORY_DRAFT_KEY='seoteukMate.v28.categoryDrafts';
const MAX_HISTORY=60;
let pendingObservation='';
let typingBaseline=null;
let typingTimer=null;
let progressTimer=null;
let progressValue=0;
let progressCap=0;

const $=id=>document.getElementById(id);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(_){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=(m,t='info')=>window.showToast?.(m,t);

const original={
  getText: window.getCurrentText,
  setText: window.setCurrentText,
  switchVersion: window.switchVersion,
  handleInput: window.handleSeoteukInput,
  cloneVersion: window.cloneCurrentVersionToOther,
  getCloud: window.__getCloudState,
  applyCloud: window.__applyCloudState,
  subjectWriter: window.generateFromSubjectWriter
};

const CATEGORY_PRESETS={
  '진로활동':['진로·전공 탐색','진로독서','직업세계 탐색','진로특강·멘토링','진로체험','학업·진로 설계','진로탐구 프로젝트'],
  '자율활동':['학급자치·학생회','학교행사·공동체','민주시민·인권','환경·생태','안전·생활교육','독서·인문 활동','학교 특색활동'],
  '동아리활동':['인문사회 탐구','역사·지역문화','신문·미디어','과학 탐구','수학 탐구','정보·AI·공학','경제·창업','예술·문화','체육 활동']
};

function isCourse(){ return window.activeCategory==='교과세특'; }
function historyContext(obs=''){
  const topic=getCategoryTopic();
  if(isCourse()) return /(한국사|세계사|동아시아사|역사)/.test(String(window.activeSubject||''));
  return /(역사|사료|역사신문|지역사|문화유산)/.test(`${topic} ${obs}`);
}
function versionKey(ver=window.activeVersion){
  return [window.activeCategory,window.activeSubject,window.activeSemester,ver].join('|');
}
function historyKey(){ return versionKey(); }

function ensureCategoryDraftShape(){
  const all=load(CATEGORY_DRAFT_KEY,{});
  for(const cat of ['진로활동','자율활동','동아리활동']){
    all[cat]=all[cat]||{};
    for(const sem of ['s1','s2','full']){
      all[cat][sem]=all[cat][sem]||{};
      for(const v of ['v1','v2','v3']){
        if(typeof all[cat][sem][v]!=='string') all[cat][sem][v]='';
      }
    }
  }
  save(CATEGORY_DRAFT_KEY,all);
  return all;
}
function getCategoryText(ver=window.activeVersion){
  const all=ensureCategoryDraftShape();
  return all[window.activeCategory]?.[window.activeSemester]?.[ver]||'';
}
function setCategoryText(text,ver=window.activeVersion){
  const all=ensureCategoryDraftShape();
  all[window.activeCategory][window.activeSemester][ver]=String(text||'');
  save(CATEGORY_DRAFT_KEY,all);
  window.__scheduleCloudSave?.(window.__getCloudState?.()||{});
}
window.getCurrentText=function(){
  if(isCourse()) return original.getText ? original.getText() : '';
  return getCategoryText();
};
window.setCurrentText=function(text){
  if(isCourse()) return original.setText?.(String(text||''));
  setCategoryText(text);
};

function getVersionText(ver){
  if(isCourse()){
    return window.subjectData?.[window.activeSubject]?.[window.activeSemester]?.[ver]||'';
  }
  return getCategoryText(ver);
}
function setVersionText(ver,text){
  if(isCourse()){
    window.subjectData=window.subjectData||{};
    window.subjectData[window.activeSubject]=window.subjectData[window.activeSubject]||{};
    window.subjectData[window.activeSubject][window.activeSemester]=window.subjectData[window.activeSubject][window.activeSemester]||{};
    window.subjectData[window.activeSubject][window.activeSemester][ver]=String(text||'');
  }else{
    setCategoryText(text,ver);
  }
}
function syncEditor(){
  const ta=$('seoteuk-textarea');
  if(ta) ta.value=window.getCurrentText();
  for(const v of ['v1','v2','v3']){
    const b=$('ver-badge-'+v);
    if(b) b.textContent=`${window.calculateNeisBytes?.(getVersionText(v))??0}B`;
  }
  window.updateNeisStats?.();
  updateAlternativeButton();
}
window.switchVersion=function(ver){
  original.switchVersion?.(ver);
  window.activeVersion=ver;
  if(!isCourse()) syncEditor();
  updateAlternativeButton();
};
window.handleSeoteukInput=function(){
  if(isCourse()) original.handleInput?.();
  else{
    const ta=$('seoteuk-textarea');
    window.setCurrentText(ta?.value||'');
    window.updateNeisStats?.();
  }
};
window.cloneCurrentVersionToOther=function(){
  if(isCourse()) return original.cloneVersion?.();
  const target=window.activeVersion==='v1'?'v2':window.activeVersion==='v2'?'v3':'v1';
  setVersionText(target,window.getCurrentText());
  syncEditor();
  toast(`${window.activeVersion.toUpperCase()} 내용을 ${target.toUpperCase()}로 복제했습니다.`,'success');
};

/* cloud persistence for creative-activity drafts and topic selections */
if(typeof original.getCloud==='function'){
  window.__getCloudState=function(){
    return Object.assign({},original.getCloud(),{
      categoryDraftsV28:load(CATEGORY_DRAFT_KEY,{}),
      categoryTopicsV28:load(TOPIC_KEY,{})
    });
  };
}
if(typeof original.applyCloud==='function'){
  window.__applyCloudState=function(state){
    if(state?.categoryDraftsV28) save(CATEGORY_DRAFT_KEY,state.categoryDraftsV28);
    if(state?.categoryTopicsV28) save(TOPIC_KEY,state.categoryTopicsV28);
    const r=original.applyCloud(state);
    setTimeout(()=>{syncCategoryContext();syncEditor();},50);
    return r;
  };
}

/* ---------- progress ---------- */
function ensureProgress(){
  let p=$('sm28-progress');
  if(p) return p;
  p=document.createElement('div');
  p.id='sm28-progress';
  p.className='hidden fixed left-1/2 -translate-x-1/2 top-14 z-[210] w-[min(92vw,640px)] no-print';
  p.innerHTML=`
    <div class="bg-white/95 backdrop-blur border border-blue-200 rounded-2xl shadow-xl p-3">
      <div class="flex items-center justify-between gap-3 mb-2">
        <div class="min-w-0"><div id="sm28-progress-label" class="text-xs font-black text-slate-900 truncate">AI 작업 준비</div><div id="sm28-progress-detail" class="text-[10px] text-slate-500 truncate">단계 기준 진행률입니다.</div></div>
        <div id="sm28-progress-pct" class="text-sm font-black text-blue-700">0%</div>
      </div>
      <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div id="sm28-progress-bar" class="h-full bg-blue-600 rounded-full transition-all duration-500" style="width:0%"></div></div>
    </div>`;
  document.body.appendChild(p);
  return p;
}
function progressSet(value,label,detail,cap=value){
  ensureProgress().classList.remove('hidden');
  progressValue=Math.max(0,Math.min(100,Math.round(value)));
  progressCap=Math.max(progressValue,Math.min(99,Math.round(cap)));
  $('sm28-progress-bar').style.width=progressValue+'%';
  $('sm28-progress-pct').textContent=progressValue+'%';
  if(label) $('sm28-progress-label').textContent=label;
  if(detail) $('sm28-progress-detail').textContent=detail;
}
function progressStart(label='AI 생성 준비'){
  clearInterval(progressTimer);
  progressSet(4,label,'단계 기준 진행률 · 실제 응답시간은 AI 엔진에 따라 달라집니다.',12);
  progressTimer=setInterval(()=>{
    if(progressValue<progressCap){
      progressValue=Math.min(progressCap,progressValue+1);
      $('sm28-progress-bar').style.width=progressValue+'%';
      $('sm28-progress-pct').textContent=progressValue+'%';
    }
  },800);
}
function progressDone(label='완료'){
  clearInterval(progressTimer);
  progressSet(100,label,'결과 저장 완료',100);
  setTimeout(()=>ensureProgress().classList.add('hidden'),900);
}
function progressFail(msg='생성 실패'){
  clearInterval(progressTimer);
  progressSet(100,'⚠️ '+msg,'오류 내용을 확인해 주세요.',100);
  const bar=$('sm28-progress-bar'); if(bar) bar.className='h-full bg-rose-500 rounded-full transition-all duration-500';
  setTimeout(()=>{
    ensureProgress().classList.add('hidden');
    if(bar) bar.className='h-full bg-blue-600 rounded-full transition-all duration-500';
  },1800);
}

/* ---------- history ---------- */
function pushSnapshot(label='변경 전',text=window.getCurrentText()){
  const all=load(HISTORY_KEY,{});
  const k=historyKey();
  const arr=Array.isArray(all[k])?all[k]:[];
  if(arr[0]?.text===String(text||'')) return;
  arr.unshift({at:Date.now(),label,text:String(text||'')});
  all[k]=arr.slice(0,MAX_HISTORY);
  save(HISTORY_KEY,all);
  save(REDO_KEY,{});
}
function pushAllVersionSnapshots(label='3안 생성 전'){
  const prev=window.activeVersion;
  for(const v of ['v1','v2','v3']){
    window.activeVersion=v;
    pushSnapshot(label,getVersionText(v));
  }
  window.activeVersion=prev;
}
window.undoSeoteuk=function(){
  const all=load(HISTORY_KEY,{}),k=historyKey(),arr=all[k]||[];
  if(!arr.length) return toast('되돌릴 변경이 없습니다.','warning');
  const target=arr.shift(),redo=load(REDO_KEY,{});
  (redo[k]??=[]).unshift({at:Date.now(),text:window.getCurrentText()});
  all[k]=arr;save(HISTORY_KEY,all);save(REDO_KEY,redo);
  window.setCurrentText(target.text||'');syncEditor();toast('↶ 이전 상태로 복원했습니다.','success');
};
window.redoSeoteuk=function(){
  const redo=load(REDO_KEY,{}),k=historyKey(),arr=redo[k]||[];
  if(!arr.length) return toast('다시 실행할 변경이 없습니다.','warning');
  const target=arr.shift();
  pushSnapshot('다시 실행 전');
  redo[k]=arr;save(REDO_KEY,redo);
  window.setCurrentText(target.text||'');syncEditor();toast('↷ 다시 실행했습니다.','success');
};
window.clearCurrentVersionSafely=function(){
  if(!window.getCurrentText().trim()) return;
  pushSnapshot('삭제 전');
  window.setCurrentText('');
  syncEditor();
  toast('현재 버전을 비웠습니다. ↶ 또는 이력에서 복원할 수 있습니다.','success');
};

/* ---------- modal ---------- */
function modal(){
  let m=$('sm28-modal');
  if(m) return m;
  m=document.createElement('div');
  m.id='sm28-modal';
  m.className='hidden fixed inset-0 z-[220] bg-slate-950/55 backdrop-blur-sm p-3 sm:p-5 items-center justify-center no-print';
  m.innerHTML=`<div class="w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
    <div class="px-5 py-4 border-b flex items-start justify-between gap-4"><div><h3 id="sm28-modal-title" class="font-black text-slate-900"></h3><p id="sm28-modal-sub" class="text-[11px] text-slate-500 mt-1"></p></div><button type="button" onclick="closeSM28Modal()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>
    <div id="sm28-modal-body" class="p-4 sm:p-5 overflow-y-auto custom-scrollbar"></div></div>`;
  document.body.appendChild(m);
  return m;
}
function showModal(title,sub,html){
  const m=modal();
  $('sm28-modal-title').textContent=title;
  $('sm28-modal-sub').textContent=sub||'';
  $('sm28-modal-body').innerHTML=html;
  m.classList.remove('hidden');m.classList.add('flex');
}
window.closeSM28Modal=function(){
  const m=$('sm28-modal');m?.classList.add('hidden');m?.classList.remove('flex');
};
window.openSeoteukHistory=function(){
  const arr=load(HISTORY_KEY,{})[historyKey()]||[];
  showModal('🕘 변경 이력','생성·수정·삭제 전 상태를 복원합니다.',
    arr.length?`<div class="space-y-2">${arr.map((h,i)=>`<div class="p-3 border border-slate-200 rounded-2xl bg-slate-50"><div class="flex justify-between gap-3"><div><b class="text-xs">${esc(h.label)}</b><div class="text-[10px] text-slate-500">${new Date(h.at).toLocaleString()}</div></div><button onclick="restoreSM28History(${i})" class="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">복원</button></div><div class="mt-2 text-[11px] leading-5 text-slate-700 whitespace-pre-wrap">${esc((h.text||'').slice(0,700))}</div></div>`).join('')}</div>`:'<div class="p-8 text-center text-slate-400">아직 변경 이력이 없습니다.</div>');
};
window.restoreSM28History=function(i){
  const arr=load(HISTORY_KEY,{})[historyKey()]||[];
  if(!arr[i]) return;
  pushSnapshot('이력 복원 전');
  window.setCurrentText(arr[i].text||'');
  syncEditor();window.closeSM28Modal();toast('선택한 이력으로 복원했습니다.','success');
};

/* ---------- category topics ---------- */
function ensureCategoryPanel(){
  let panel=$('sm28-category-panel');
  if(panel) return panel;
  const anchor=$('subject-selector-container');
  if(!anchor) return null;
  panel=document.createElement('div');
  panel.id='sm28-category-panel';
  panel.className='hidden p-2.5 rounded-2xl border border-violet-200 bg-violet-50/70';
  panel.innerHTML=`<div class="flex flex-wrap items-center gap-2">
    <span id="sm28-category-label" class="text-xs font-black text-violet-900">활동 주제</span>
    <select id="sm28-category-preset" class="text-xs p-1.5 bg-white border border-violet-200 rounded-lg"></select>
    <input id="sm28-category-topic" type="text" class="flex-1 min-w-[220px] text-xs p-1.5 bg-white border border-violet-200 rounded-lg outline-none" placeholder="활동 주제를 직접 입력">
    <span class="text-[10px] text-violet-700">※ 이 주제는 생성 문맥에 반영됩니다.</span>
  </div>`;
  anchor.insertAdjacentElement('afterend',panel);
  $('sm28-category-preset').addEventListener('change',e=>{
    const input=$('sm28-category-topic');
    if(e.target.value) input.value=e.target.value;
    saveCategoryTopic();
  });
  $('sm28-category-topic').addEventListener('input',saveCategoryTopic);
  return panel;
}
function topicState(){
  const all=load(TOPIC_KEY,{});
  return all[window.activeCategory]||{preset:'',text:''};
}
function saveCategoryTopic(){
  if(isCourse()) return;
  const all=load(TOPIC_KEY,{});
  all[window.activeCategory]={
    preset:$('sm28-category-preset')?.value||'',
    text:$('sm28-category-topic')?.value.trim()||''
  };
  save(TOPIC_KEY,all);
  window.__scheduleCloudSave?.(window.__getCloudState?.()||{});
}
function getCategoryTopic(){
  if(isCourse()) return '';
  const live=$('sm28-category-topic')?.value.trim();
  if(live) return live;
  return topicState().text||topicState().preset||'';
}
function syncCategoryContext(){
  const panel=ensureCategoryPanel();
  const selector=$('subject-selector-container');
  if(!panel||!selector) return;
  const left=selector.firstElementChild;
  if(isCourse()){
    panel.classList.add('hidden');
    if(left) left.style.display='';
    const input=$('input-chat');
    if(input) input.placeholder='수업 관찰 키워드 또는 탐구 활동 입력...';
    syncEditor();
    return;
  }
  if(left) left.style.display='none';
  panel.classList.remove('hidden');
  const labelMap={'진로활동':'🎯 진로활동 주제','자율활동':'🏫 자율활동 주제','동아리활동':'👥 동아리활동 주제'};
  $('sm28-category-label').textContent=labelMap[window.activeCategory]||'활동 주제';
  const sel=$('sm28-category-preset');
  const presets=CATEGORY_PRESETS[window.activeCategory]||[];
  const st=topicState();
  sel.innerHTML=`<option value="">직접 입력</option>${presets.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}`;
  sel.value=presets.includes(st.preset)?st.preset:'';
  $('sm28-category-topic').value=st.text||st.preset||'';
  $('sm28-category-topic').placeholder=window.activeCategory==='진로활동'?'예: 역사교육과 진로탐색, 진로독서 활동':window.activeCategory==='자율활동'?'예: 학급 자치활동, 인문학 기행 준비':'예: 역사신문 제작 동아리, 지역사 탐구';
  const input=$('input-chat');
  if(input) input.placeholder=`${window.activeCategory}에서 관찰한 행동·과정 입력...`;
  syncEditor();
}

/* ---------- evidence score / questions ---------- */
function evidenceScore(text){
  const t=String(text||'').trim();
  let score=t?1:0;
  if(t.length>=30) score+=1;
  if(/작성|제작|발표|토론|비교|분석|조사|수정|검토|설명|질문|기획|참여|운영/.test(t)) score+=2;
  if(/자료|사료|기사|도서|통계|실험|보고서|산출물|작품|기록/.test(t)) score+=2;
  if(/피드백|보완|성장|협력|조율|모둠|성찰|변화/.test(t)) score+=2;
  return score;
}
function evidenceQuestions(){
  if(historyContext(pendingObservation)) return [
    '활동의 구체적인 주제나 기사 내용은 무엇이었나요?',
    '실제로 사용하거나 확인한 사료·자료가 있었나요?',
    '학생이 실제로 한 작성·선정·편집·발표 행동은 무엇인가요?',
    '피드백이나 검토 뒤 실제로 고친 부분이 있었나요?',
    '교사가 직접 관찰한 질문·설명·협업 특징이 있었나요?'
  ];
  if(window.activeCategory==='진로활동') return [
    '어떤 진로·전공을 탐색했나요?','실제로 참여한 활동은 무엇인가요?','학생이 스스로 조사·질문·비교한 장면은?','활동 후 생각이나 계획이 달라진 부분은?','교사가 직접 관찰한 태도는?'
  ];
  if(window.activeCategory==='자율활동') return [
    '구체적으로 어떤 학교·학급 활동이었나요?','학생이 맡아 실제로 한 행동은?','다른 학생과 소통·협력한 장면은?','문제 상황을 해결하거나 개선한 부분은?','교사가 직접 본 태도 변화는?'
  ];
  if(window.activeCategory==='동아리활동') return [
    '동아리에서 진행한 구체 활동은?','학생이 실제 맡은 역할은?','산출물·발표·기록이 있었나요?','협업·피드백·수정 장면은?','관심이 심화되거나 다음 탐구로 이어진 부분은?'
  ];
  return ['실제 산출물·행동','활용 자료·사례','직접 관찰한 분석·설명','피드백 후 수정','진로 관심이 드러난 장면'];
}
window.openEvidenceGate=function(observation){
  pendingObservation=String(observation??$('input-chat')?.value??'').trim();
  const topic=getCategoryTopic();
  const merged=[topic?`활동 주제: ${topic}`:'',pendingObservation].filter(Boolean).join('\n');
  const n=evidenceScore(merged);
  showModal('🔎 Evidence Gate','답변은 선택사항입니다. 바로 문맥융합 3안 생성도 가능합니다.',
    `<div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl"><b>근거 충족도: ${n>=6?'충분':n>=3?'보통':'빈약'} (${n}/8)</b><br><span class="text-[11px] text-amber-800">정보가 적으면 활동명에서 직접 알 수 있는 범위와 교육적 의미를 중심으로 확장하고, 확인되지 않은 세부 행동은 만들지 않습니다.</span></div>
    <div class="mt-3 space-y-2">${evidenceQuestions().map((q,i)=>`<label class="block text-xs font-bold">${i+1}. ${esc(q)}<input id="sm28-q-${i}" class="w-full p-2 mt-1 border border-slate-200 rounded-xl font-normal" placeholder="선택 입력"></label>`).join('')}</div>
    <div class="grid sm:grid-cols-2 gap-2 mt-4"><button onclick="generateFromEvidence28()" class="p-2.5 bg-blue-600 text-white rounded-xl font-black">답변 반영 3안 생성</button><button onclick="generatePending28()" class="p-2.5 bg-violet-600 text-white rounded-xl font-black">질문 건너뛰고 문맥융합 3안</button></div>`);
};
window.generatePending28=function(){window.closeSM28Modal();window.generateThreeCandidates(pendingObservation,true);};
window.generateFromEvidence28=function(){
  const extra=[0,1,2,3,4].map(i=>$('sm28-q-'+i)?.value.trim()).filter(Boolean).join('\n');
  const obs=[pendingObservation,extra].filter(Boolean).join('\n');
  window.closeSM28Modal();window.generateThreeCandidates(obs,true);
};

/* ---------- output cleaning / alternatives ---------- */
function stripMeta(text){
  return String(text||'')
    .replace(/```[a-zA-Z]*\s*/g,'').replace(/```/g,'')
    .replace(/\*{1,2}/g,'')
    .replace(/\(\s*공백\s*포함[^)]*(?:바이트|byte)[^)]*\)/gi,'')
    .replace(/\(\s*\d+\s*자\s*\/\s*(?:약\s*)?\d+\s*(?:바이트|byte)[^)]*\)/gi,'')
    .replace(/공백\s*포함\s*\d+\s*자\s*\/\s*(?:약\s*)?\d+\s*(?:바이트|byte)/gi,'')
    .replace(/(?:약\s*)?\d+\s*(?:바이트|byte)\s*$/gi,'')
    .replace(/^\s*(?:최종본|완성본|세특|특기사항)\s*[:：]\s*/i,'')
    .replace(/\s+/g,' ').trim();
}
function splitCandidateBlocks(raw){
  const text=String(raw||'').replace(/\r/g,'\n');
  const marker=/\*{0,2}\s*(?:\[(?:후보|대안)\s*\d+\s*[:：][^\]]{0,100}\]|(?:후보|대안)\s*\d+\s*[:：][^\n*]{0,80})\s*\*{0,2}/gi;
  const matches=[...text.matchAll(marker)];
  if(matches.length){
    const blocks=[];
    for(let i=0;i<matches.length;i++){
      const start=(matches[i].index||0)+matches[i][0].length;
      const end=i+1<matches.length?(matches[i+1].index||text.length):text.length;
      const body=stripMeta(text.slice(start,end));
      if(body) blocks.push(body);
    }
    if(blocks.length) return blocks;
  }
  return [stripMeta(text)];
}
function tokenize(s){ return new Set((String(s||'').match(/[가-힣A-Za-z0-9]{2,}/g)||[]).map(x=>x.toLowerCase())); }
function similarity(a,b){
  const A=tokenize(a),B=tokenize(b);if(!A.size||!B.size)return 0;
  let n=0;A.forEach(x=>{if(B.has(x))n++});return n/Math.min(A.size,B.size);
}
function dedupe(text){
  const parts=String(text||'').split(/(?<=\.)\s+/).map(x=>x.trim()).filter(Boolean);
  const out=[];
  for(const p of parts) if(!out.some(x=>similarity(x,p)>.72)) out.push(p);
  return out.join(' ').trim();
}
function safeFilter(text,observation){
  const obs=String(observation||'');
  const sentences=dedupe(stripMeta(text)).split(/(?<=\.)\s+/).filter(Boolean);
  return sentences.filter(s=>{
    if(historyContext(obs)){
      if(/사료의 작성 주체|작성 주체와 시점|시점과 목적|서로 다른 (자료|사료).*비교|사료 비판/.test(s) && !/(사료|자료|출처|비교|작성 주체|시점|목적)/.test(obs)) return false;
      if(/피드백|수정|보완|재확인/.test(s) && !/(피드백|수정|보완|검토|고침)/.test(obs)) return false;
      if(/모둠|협업|조율|팀원|동료/.test(s) && !/(모둠|협업|조율|팀원|동료|함께)/.test(obs)) return false;
      if(/표제|제목을 선정|지면|기사 배치|편집 과정/.test(s) && !/(표제|제목|지면|배치|편집)/.test(obs)) return false;
    }else{
      if(/피드백|수정|보완/.test(s) && !/(피드백|수정|보완|검토|고침)/.test(obs)) return false;
      if(/모둠|협업|조율|팀원|동료/.test(s) && !/(모둠|협업|조율|팀원|동료|함께)/.test(obs)) return false;
    }
    return true;
  }).join(' ');
}
function parseAIOutput(raw,observation){
  const blocks=splitCandidateBlocks(raw).map(x=>safeFilter(x,observation)).map(dedupe).filter(Boolean);
  return {primary:blocks[0]||'',alternatives:blocks.slice(1,4)};
}
function alternativesAll(){ return load(ALT_KEY,{}); }
function saveAlternatives(ver,list){
  const all=alternativesAll();
  const k=versionKey(ver);
  all[k]=(list||[]).filter(Boolean).slice(0,3);
  save(ALT_KEY,all);
}
function currentAlternatives(){ return alternativesAll()[versionKey()]||[]; }
function ensureAlternativeButton(){
  let b=$('sm28-alt-btn');
  if(b) return b;
  const group=$('version-tabs-group');
  const actions=group?.parentElement?.lastElementChild;
  if(!actions) return null;
  b=document.createElement('button');
  b.id='sm28-alt-btn';b.type='button';b.onclick=window.openAlternatives28;
  b.className='hidden text-xs px-2 py-1 rounded-lg font-bold bg-cyan-50 text-cyan-800 border border-cyan-200';
  actions.appendChild(b);
  return b;
}
function updateAlternativeButton(){
  const b=ensureAlternativeButton();if(!b)return;
  const n=currentAlternatives().length;
  b.textContent=`🗂 대안 ${n}개`;
  b.classList.toggle('hidden',n===0);
}
window.openAlternatives28=function(){
  const arr=currentAlternatives();
  if(!arr.length) return toast('현재 버전에 별도 대안이 없습니다.','info');
  showModal(`🗂 ${window.activeVersion.toUpperCase()} 대안`,'대안은 에디터에 들어가지 않아 바이트 계산에 포함되지 않습니다.',
    `<div class="space-y-3">${arr.map((t,i)=>`<div class="p-4 border rounded-2xl"><div class="flex justify-between gap-3"><b>대안 ${i+1}</b><span class="text-[10px] text-slate-500">${window.calculateNeisBytes?.(t)||0}B</span></div><div class="text-sm leading-6 mt-2 whitespace-pre-wrap">${esc(t)}</div><button onclick="adoptAlternative28(${i})" class="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black">이 대안 사용</button></div>`).join('')}</div>`);
};
window.adoptAlternative28=function(i){
  const arr=currentAlternatives();if(!arr[i])return;
  pushSnapshot('대안 채택 전');
  window.setCurrentText(arr[i]);syncEditor();window.closeSM28Modal();
  toast('대안을 현재 버전에 적용했습니다.','success');
};

/* ---------- prompt ---------- */
async function knowledgeContext(observation){
  try{
    const q=[window.activeCategory,isCourse()?window.activeSubject:'',getCategoryTopic(),observation].filter(Boolean).join(' ');
    const hits=await window.__searchAllKnowledgeV25?.(q,3,'content');
    return (hits||[]).map(h=>`[참고 ${h.source} p.${h.page}] ${String(h.text||'').slice(0,450)}`).join('\n');
  }catch(_){return''}
}
function categoryRules(){
  if(window.activeCategory==='진로활동') return '진로 탐색의 계기→실제 참여·질문·비교→자기이해 또는 진로설계의 변화가 드러나게 한다. 단순 직업 찬양이나 억지 전공 연결 금지.';
  if(window.activeCategory==='자율활동') return '학교 교육활동 안에서 실제 참여·역할·태도·협력·변화를 중심으로 쓴다. 활동 목록 나열 금지. 입력에 없는 탐구 제목·참여자·시간·성과를 만들지 않는다.';
  if(window.activeCategory==='동아리활동') return '실제 동아리 활동의 지속적 참여, 역할, 협업, 산출물, 관심의 심화를 중심으로 쓴다. 확인되지 않은 직책·리더십·수상·성과를 만들지 않는다.';
  return '교과 성취기준과 연결되는 실제 행동·사고과정·성장 중심으로 쓴다. 활동 목록 나열이나 교과지식 단순 재진술을 피한다.';
}
function recordName(){
  return window.activeCategory==='교과세특'?'교과 세부능력 및 특기사항':`${window.activeCategory} 특기사항`;
}
function makePrompt(observation,style,knowledge){
  const topic=getCategoryTopic();
  const career=$('input-career')?.value.trim()||'';
  const major=$('input-major')?.value.trim()||'';
  const existing=window.getCurrentText()||'';
  const n=evidenceScore([topic,observation].filter(Boolean).join(' '));
  const target=n>=6?'850~1200':n>=3?'650~1000':'450~800';
  const hist=historyContext(observation);
  return `고등학교 교사가 ${recordName()}의 최종 문단 1개를 작성한다.
영역: ${window.activeCategory}
${isCourse()?`과목: ${window.activeSubject}`:`활동 주제: ${topic||'(미입력)'}`}
실제 관찰·입력: ${observation||'(짧은 활동명/주제만 있음)'}
현재 작성 문맥: ${existing||'(없음)'}
희망 진로/학과: ${career||'(미입력)'} / ${major||'(미입력)'}
이번 버전 관점: ${style}
참고지식(학생이 실제 수행한 사실이 아님):
${knowledge||'(없음)'}

[최우선 출력 규칙]
- 오직 완성된 본문 1개만 출력한다.
- "후보 1", "대안", 제목, 소제목, 해설, 글자 수, 바이트 수, 괄호 속 메타정보, 마크다운 기호를 절대 출력하지 않는다.
- 여러 후보를 한 응답에 만들지 않는다.

[작성 원칙]
- 입력이 짧아도 영역·과목/주제·현재 문맥·진로·참고지식을 종합해 밀도 있게 재구성한다.
- 활동명에서 직접 알 수 있는 교육적 의미와 사고 방향은 확장할 수 있으나, 입력에 없는 고유 사건명·사료명·책·논문·수치·수상·직책·구체 역할·구체 수정행동·성과를 학생이 실제 한 사실처럼 만들지 않는다.
- ${categoryRules()}
- 같은 뜻을 다른 표현으로 반복하지 않는다.
- 상투적 과장("매우 탁월함", "완벽함", "증명함")을 피한다.
- 행동→사고→교육적 의미→성장 흐름으로 쓴다.
- 1500바이트를 채우려 하지 말고 현재 정보량에 맞춰 약 ${target}바이트 범위로 쓴다.
${hist?'- 역사 맥락에서는 기사 형식의 재구성·역사적 맥락·인과·역사 지식의 전달 의미는 활용할 수 있으나, 사료비판·관점비교·편집·피드백·수정은 입력에 실제 근거가 있을 때만 단정한다. 과학 실험 문법은 쓰지 않는다.':''}
- 한국어 학교생활기록부 문체(~함, ~보임, ~드러남)로 작성한다.
결과 본문만 출력한다.`;
}
async function requestAI(prompt){
  if(typeof window.__requestAI==='function') return window.__requestAI(prompt);
  if(window.SeoteukAI?.request) return window.SeoteukAI.request(prompt);
  throw new Error('AI 요청 모듈이 준비되지 않았습니다.');
}
async function createOne(observation,style,knowledge){
  const raw=await requestAI(makePrompt(observation,style,knowledge));
  return parseAIOutput(raw,observation);
}

/* ---------- generation ---------- */
window.generateThreeCandidates=async function(observation,force=false){
  const topic=getCategoryTopic();
  observation=String(observation??$('input-chat')?.value??'').trim();
  const evidence=[topic?`활동 주제: ${topic}`:'',observation].filter(Boolean).join('\n');
  if(!evidence && !window.getCurrentText().trim()) return window.openEvidenceGate('');
  if(evidenceScore(evidence)<3 && !force) return window.openEvidenceGate(observation);

  pushAllVersionSnapshots('3안 생성 전');
  window.closeSM28Modal();
  progressStart('3안 생성 준비');
  try{
    progressSet(10,'근거·규칙 분석','현재 영역과 입력을 정리하는 중',18);
    const knowledge=await knowledgeContext(evidence);
    progressSet(20,'지식팩·규칙 연결','관련 참고 지식을 문맥으로 연결했습니다.',28);

    const styles={
      v1:'관찰·성취 중심 — 확인된 행동과 교육적 성취를 가장 선명하게',
      v2:'탐구·맥락 중심 — 사고의 흐름과 활동 맥락을 가장 선명하게',
      v3:'융합·진로 중심 — 실제 입력된 진로/관심 근거가 있을 때만 자연스럽게 연결'
    };
    const entries=Object.entries(styles);
    const results=[];
    let done=0;

    if(window.currentProvider==='antigravity'){
      for(const [ver,style] of entries){
        progressSet(28+done*22,`${ver.toUpperCase()} 생성 중`,`Antigravity DEV · ${done+1}/3`,45+done*22);
        const parsed=await createOne(evidence,style,knowledge);
        results.push([ver,parsed]);done++;
        progressSet(28+done*22,`${ver.toUpperCase()} 생성 완료`,`${done}/3 완료`,30+done*22);
      }
    }else{
      progressSet(30,'V1·V2·V3 생성 중','3개 관점을 동시에 생성합니다.',82);
      await Promise.all(entries.map(async([ver,style])=>{
        const parsed=await createOne(evidence,style,knowledge);
        results.push([ver,parsed]);
        done++;
        progressSet(30+done*20,`${done}/3 생성 완료`,`${ver.toUpperCase()} 결과 정리 완료`,82+done*4);
      }));
    }

    progressSet(92,'결과 정리','후보 표기·바이트 표기·중복 문장을 제거하는 중',97);
    for(const [ver,parsed] of results){
      setVersionText(ver,parsed.primary);
      saveAlternatives(ver,parsed.alternatives);
    }
    if(isCourse()) original.setText?.(getVersionText(window.activeVersion));
    window.switchVersion('v1');
    syncEditor();
    window.appendChatMessage?.('assistant','✨ V1·V2·V3을 각각 별도 버전에 생성했습니다. 모델이 한 응답 안에 추가 후보를 반환한 경우에는 ‘대안’으로 분리해 바이트 계산에서 제외했습니다.');
    progressDone('3안 생성 완료');
    toast('V1·V2·V3 생성 완료','success');
  }catch(e){
    progressFail('3안 생성 실패');
    toast('3안 생성 실패: '+e.message,'warning');
  }
};

window.smartContextFusion=async function(){
  const topic=getCategoryTopic();
  const obs=[topic?`활동 주제: ${topic}`:'',pendingObservation||$('input-chat')?.value.trim()||''].filter(Boolean).join('\n');
  if(!obs && !window.getCurrentText().trim()) return window.openEvidenceGate('');
  pushSnapshot('문맥 융합 전');
  progressStart('문맥 융합 준비');
  try{
    progressSet(15,'근거·문맥 분석','현재 작성문과 입력을 읽는 중',28);
    const knowledge=await knowledgeContext(obs);
    progressSet(35,'고품질 문단 생성 중','반복·상투어를 줄여 재구성하는 중',78);
    const parsed=await createOne(obs,'균형형 고품질 문맥융합 — 반복과 공허한 상투어 최소화',knowledge);
    progressSet(88,'결과 정리','메타표기와 중복 문장을 제거하는 중',96);
    window.setCurrentText(parsed.primary);
    saveAlternatives(window.activeVersion,parsed.alternatives);
    syncEditor();window.closeSM28Modal();
    progressDone('문맥 융합 완료');
    toast('🧠 문맥 융합 고도화 완료','success');
  }catch(e){
    progressFail('문맥 융합 실패');
    toast('문맥 융합 실패: '+e.message,'warning');
  }
};

async function rewriteCurrent(mode){
  if(!window.getCurrentText().trim()) return toast('본문을 먼저 입력하세요.','warning');
  pushSnapshot(mode+' 전');
  progressStart(mode+' 준비');
  const topic=getCategoryTopic();
  const obs=[topic?`활동 주제: ${topic}`:'',$('input-chat')?.value.trim()||window.getCurrentText()].filter(Boolean).join('\n');
  try{
    const knowledge=await knowledgeContext(obs);
    progressSet(35,mode+' 처리 중','현재 근거 안에서 문장을 개선하는 중',82);
    const extra=mode==='꼬리물기'?'현재 근거 안에서 질문·사고 흐름을 한 단계 깊게 만들되 새 활동은 만들지 않는다.':'현재 근거 안에서 자료·맥락·논리 연결을 선명하게 하되 없는 사실은 만들지 않는다.';
    const raw=await requestAI(makePrompt(obs,'기존 문단 개선',knowledge)+'\n추가 지시: '+extra+'\n현재 본문:'+window.getCurrentText());
    const parsed=parseAIOutput(raw,obs);
    window.setCurrentText(parsed.primary);saveAlternatives(window.activeVersion,parsed.alternatives);syncEditor();
    progressDone(mode+' 완료');
  }catch(e){progressFail(mode+' 실패');toast(mode+' 실패: '+e.message,'warning')}
}

/* ---------- comparisons ---------- */
window.openThreeVersionCompare=function(){
  const cards=['v1','v2','v3'].map((v,i)=>{
    const t=getVersionText(v);
    return `<div class="p-4 border rounded-2xl bg-white"><div class="flex justify-between gap-2"><b>V${i+1} ${['관찰·성취','탐구·맥락','융합·진로'][i]}</b><span class="text-[10px] text-slate-500">${window.calculateNeisBytes?.(t)||0}B</span></div><div class="text-xs leading-6 mt-2 whitespace-pre-wrap">${esc(t||'(비어 있음)')}</div><button onclick="switchVersion('${v}');closeSM28Modal()" class="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black">이 버전 보기</button></div>`;
  }).join('');
  showModal('⚖️ V1·V2·V3 비교','에디터 본문만 바이트 계산에 포함됩니다.',`<div class="grid md:grid-cols-3 gap-3">${cards}</div>`);
};

/* ---------- patch old actions ---------- */
function patchActions(){
  window.triggerAIMaxByteFill=window.smartContextFusion;
  window.injectInquiryChainBuilder=()=>rewriteCurrent('꼬리물기');
  window.injectQuantitativeDataFix=()=>rewriteCurrent('근거·맥락');
  window.compareVersionsModal=window.openThreeVersionCompare;

  const oldWriter=window.generateFromSubjectWriter;
  if(typeof oldWriter==='function' && !oldWriter.__sm28){
    const wrapped=async function(...args){
      progressStart('교과 작성기 생성');
      progressSet(18,'입력·근거 분석','작성기 입력을 정리하는 중',45);
      try{
        const r=await oldWriter.apply(this,args);
        progressDone('교과 작성기 완료');
        return r;
      }catch(e){
        progressFail('교과 작성기 실패');
        throw e;
      }
    };
    wrapped.__sm28=true;
    window.generateFromSubjectWriter=wrapped;
  }

  if(!window.sendChatMessage?.__sm28){
    const f=async function(){
      const input=$('input-chat');
      const msg=input?.value.trim()||'';
      const topic=getCategoryTopic();
      if(!msg && !topic) return toast(isCourse()?'관찰 키워드나 활동을 입력하세요.':'활동 주제를 선택하거나 관찰 내용을 입력하세요.','warning');
      if(msg) window.appendChatMessage?.('user',msg);
      if(input) input.value='';
      const evidence=[topic?`활동 주제: ${topic}`:'',msg].filter(Boolean).join('\n');
      if(evidenceScore(evidence)<3){
        pendingObservation=msg;
        window.appendChatMessage?.('assistant','입력 정보가 짧아 Evidence Gate를 열었습니다. 질문을 답하거나 바로 문맥융합 3안을 만들 수 있습니다.');
        return window.openEvidenceGate(msg);
      }
      return window.generateThreeCandidates(msg,true);
    };
    f.__sm28=true;
    window.sendChatMessage=f;
  }
}

/* ---------- UI ---------- */
function patchVersionTexts(){
  const labels={v1:'버전 1 (관찰·성취)',v2:'버전 2 (탐구·맥락)',v3:'버전 3 (융합·진로)'};
  for(const [v,label] of Object.entries(labels)){
    const span=$('btn-ver-'+v)?.querySelector('span');
    if(span) span.textContent=label;
  }
  const badge=[...document.querySelectorAll('header span')].find(x=>/P\.O\.H\.A\.N\.G 2026/.test(x.textContent||''));
  if(badge) badge.textContent=`P.O.H.A.N.G 2026 · v${VERSION} EVIDENCE FUSION`;
  document.title=`Seoteuk Mate P.O.H.A.N.G v${VERSION} - Evidence Fusion · 3안 경쟁생성 · Antigravity DEV`;

  let action=$('sm28-version-actions');
  const group=$('version-tabs-group');
  const box=group?.parentElement?.lastElementChild;
  if(box&&!action){
    action=document.createElement('span');
    action.id='sm28-version-actions';
    action.className='flex items-center gap-1 flex-wrap';
    action.innerHTML=`<button id="sm28-gen" onclick="generateThreeCandidates()" class="text-xs px-2 py-1 bg-violet-600 text-white rounded-lg font-black">✨ 3안 생성</button>
      <button onclick="undoSeoteuk()" class="text-xs px-2 py-1 border rounded-lg">↶</button>
      <button onclick="redoSeoteuk()" class="text-xs px-2 py-1 border rounded-lg">↷</button>
      <button onclick="openSeoteukHistory()" class="text-xs px-2 py-1 border rounded-lg">🕘 이력</button>
      <button onclick="clearCurrentVersionSafely()" class="text-xs px-2 py-1 border rounded-lg text-rose-700">🗑</button>`;
    box.appendChild(action);
  }

  const fill=[...document.querySelectorAll('button')].find(b=>/1,500B 정밀 완충|문맥 융합 고도화/.test(b.textContent||''));
  if(fill){
    fill.onclick=window.smartContextFusion;
    fill.innerHTML='<span>🧠</span> 문맥 융합 고도화';
    if(!$('sm28-evidence-btn')){
      const b=document.createElement('button');
      b.id='sm28-evidence-btn';b.type='button';b.onclick=()=>window.openEvidenceGate();
      b.className='px-2.5 py-1.5 bg-violet-50 text-violet-800 border border-violet-300 rounded-xl font-black';
      b.textContent='🔎 근거·질문';fill.after(b);
    }
  }
  updateAlternativeButton();
}
function bindCategoryEvents(){
  const group=$('category-button-group');
  if(group&&!group.dataset.sm28){
    group.dataset.sm28='1';
    group.addEventListener('click',()=>setTimeout(()=>{syncCategoryContext();patchVersionTexts();},0));
  }
  for(const id of ['btn-sem-s1','btn-sem-s2','btn-sem-full']){
    const b=$(id);
    if(b&&!b.dataset.sm28){
      b.dataset.sm28='1';
      b.addEventListener('click',()=>setTimeout(()=>{if(!isCourse())syncEditor();syncCategoryContext();},0));
    }
  }
}
function bindTypingHistory(){
  const ta=$('seoteuk-textarea');
  if(!ta||ta.dataset.sm28History) return;
  ta.dataset.sm28History='1';
  ta.addEventListener('beforeinput',()=>{
    if(typingBaseline===null) typingBaseline=ta.value;
    clearTimeout(typingTimer);
    typingTimer=setTimeout(()=>{
      if(typingBaseline!==ta.value) pushSnapshot('직접 수정 전',typingBaseline);
      typingBaseline=null;
    },900);
  });
}

function init(){
  ensureProgress();modal();ensureCategoryPanel();
  patchActions();patchVersionTexts();bindCategoryEvents();bindTypingHistory();syncCategoryContext();syncEditor();
  toast(`v${VERSION} 준비됨 · 진행바/3안 정리/창체 주제선택`,'success');
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));
else setTimeout(init,180);
setTimeout(()=>{patchActions();patchVersionTexts();bindCategoryEvents();syncCategoryContext();},1300);
})();
