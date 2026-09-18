
(function(){
'use strict';
if(window.__SEOTEUK_WORKSPACE_V3__)return;
window.__SEOTEUK_WORKSPACE_V3__=true;
const KEY='seoteukMate.workspace.v3';
const RECORD_KEY='seoteukMate.workspaceRecords.v3';
const APP_KEY='seoteukMate.webapp.v1';
const CAT_DRAFT_KEY='seoteukMate.v28.categoryDrafts';
const CAT_TOPIC_KEY='seoteukMate.v28.categoryTopics';
const PROJECT_KEY='seoteukMate.projects.v25';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(_){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const clone=o=>JSON.parse(JSON.stringify(o??{}));
const uid=()=>`s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
function emptyWorkspace(){return{schemaVersion:3,activeStudentId:'',classes:[],students:[],updatedAt:Date.now()}}
function ws(){const w=load(KEY,emptyWorkspace());w.classes=Array.isArray(w.classes)?w.classes:[];w.students=Array.isArray(w.students)?w.students:[];return w}
function putWs(w){w.updatedAt=Date.now();save(KEY,w);window.SeoteukCloud?.saveWorkspaceIndex?.({schemaVersion:3,activeStudentId:w.activeStudentId,classes:w.classes,students:w.students}).catch(()=>{});}
function records(){return load(RECORD_KEY,{})}
function putRecords(r){save(RECORD_KEY,r)}
function currentStudent(){const w=ws();return w.students.find(x=>x.id===w.activeStudentId)||null}

function captureRecord(){
  let core={};
  try{core=clone(JSON.parse(localStorage.getItem(APP_KEY)||'{}'))}catch(_){}
  core.activeCategory=window.activeCategory;core.activeSemester=window.activeSemester;core.activeVersion=window.activeVersion;core.activeSubject=window.activeSubject;
  core.subjectList=clone(window.subjectList||[]);core.subjectData=clone(window.subjectData||{});
  return{
    schemaVersion:3,
    appState:core,
    categoryDrafts:clone(load(CAT_DRAFT_KEY,{})),
    categoryTopics:clone(load(CAT_TOPIC_KEY,{})),
    projectCards:clone(window.__projectCardsV25||load(PROJECT_KEY,[])),
    interviewQuestions:clone(window.interviewQuestions||[]),
    career:$('input-career')?.value||'',
    major:$('input-major')?.value||'',
    savedAt:Date.now()
  };
}
function blankSubjectData(){
  const out={};
  for(const s of (window.subjectList||['한국사']))out[s]={s1:{v1:'',v2:'',v3:''},s2:{v1:'',v2:'',v3:''},full:{v1:'',v2:'',v3:''}};
  return out;
}
function blankRecord(student){
  return{
    schemaVersion:3,
    appState:{activeCategory:'교과세특',activeSemester:'s1',activeVersion:'v1',activeSubject:window.activeSubject||'한국사',subjectList:clone(window.subjectList||[]),subjectData:blankSubjectData(),bulkStudents:[],schemaVersion:2,clientUpdatedAt:Date.now()},
    categoryDrafts:{},categoryTopics:{},projectCards:[],interviewQuestions:[],
    career:student?.career||'',major:student?.major||'',savedAt:Date.now()
  }
}
async function saveActiveRecord(){
  const w=ws(),id=w.activeStudentId;if(!id)return;
  const student=w.students.find(x=>x.id===id);
  if(student){
    student.career=$('input-career')?.value||student.career||'';
    student.major=$('input-major')?.value||student.major||'';
  }
  const all=records(),previous=all[id]||null,rec=captureRecord();
  if(previous?.cloudBaseUpdatedAt)rec.cloudBaseUpdatedAt=previous.cloudBaseUpdatedAt;
  all[id]=rec;putRecords(all);putWs(w);
  const cloudResult=await window.SeoteukCloud?.saveStudentRecord?.(id,rec).catch(()=>null);
  if(cloudResult?.cloudBaseUpdatedAt){
    rec.cloudBaseUpdatedAt=cloudResult.cloudBaseUpdatedAt;
    const refreshed=records();refreshed[id]=rec;putRecords(refreshed);
  }
}
function applyRecord(rec){
  const r=rec||blankRecord(currentStudent());
  localStorage.setItem(CAT_DRAFT_KEY,JSON.stringify(r.categoryDrafts||{}));
  localStorage.setItem(CAT_TOPIC_KEY,JSON.stringify(r.categoryTopics||{}));
  localStorage.setItem(PROJECT_KEY,JSON.stringify(r.projectCards||[]));
  window.__projectCardsV25=clone(r.projectCards||[]);
  window.interviewQuestions=clone(r.interviewQuestions||[]);
  if(typeof window.__applyCloudState==='function')window.__applyCloudState(r.appState||{});
  else{
    window.subjectData=clone(r.appState?.subjectData||blankSubjectData());
    window.activeSubject=r.appState?.activeSubject||window.activeSubject;
    window.activeSemester=r.appState?.activeSemester||'s1';window.activeVersion=r.appState?.activeVersion||'v1';window.activeCategory=r.appState?.activeCategory||'교과세특';
  }
  if($('input-career'))$('input-career').value=r.career||currentStudent()?.career||'';
  if($('input-major'))$('input-major').value=r.major||currentStudent()?.major||'';
  setTimeout(()=>{window.switchSemester?.(window.activeSemester);window.switchVersion?.(window.activeVersion);const ta=$('seoteuk-textarea');if(ta)ta.value=window.getCurrentText?.()||'';window.updateNeisStats?.();},60);
}
async function selectStudent(id){
  const w=ws();if(id===w.activeStudentId)return;
  window.SeoteukProgress?.start?.('👤 학생 전환','현재 학생을 저장하고 선택한 학생 자료를 불러옵니다.');
  await saveActiveRecord().catch(()=>{});
  w.activeStudentId=id;putWs(w);
  let rec=records()[id]||null;
  if(window.SeoteukCloud?.getUser?.()){
    const cloud=await window.SeoteukCloud.loadStudentRecord?.(id).catch(()=>null);
    if(cloud)rec=cloud;
  }
  if(rec){const all=records();all[id]=rec;putRecords(all)}
  applyRecord(rec||blankRecord(w.students.find(x=>x.id===id)));
  paintActiveStudent();renderWorkspace();
  window.SeoteukProgress?.done?.('학생 전환 완료');
}
function paintActiveStudent(){
  const s=currentStudent();
  let chip=$('sm3-active-student');
  if(!chip){
    const head=$('btn-cloud-account')?.parentElement;
    if(head){chip=document.createElement('button');chip.id='sm3-active-student';chip.type='button';chip.onclick=window.openStudentWorkspace;chip.className='hidden lg:inline-flex text-[10px] px-2 py-1.5 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200 font-black max-w-[220px] truncate';head.insertBefore(chip,$('btn-cloud-account'))}
  }
  if(chip){
    if(s){const c=ws().classes.find(x=>x.id===s.classId);chip.textContent=`👤 ${c?.name||''} ${s.no||''} ${s.name}`.trim();chip.classList.remove('hidden')}
    else chip.classList.add('hidden');
  }
}
function ensureHeaderButton(){
  if($('btn-student-workspace'))return;
  const parent=$('btn-cloud-account')?.parentElement;if(!parent)return;
  const b=document.createElement('button');b.id='btn-student-workspace';b.type='button';b.onclick=window.openStudentWorkspace;
  b.className='text-xs px-2 sm:px-2.5 py-1.5 rounded-xl font-bold border bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100 shadow-2xs';
  b.innerHTML='👥 <span class="hidden sm:inline">학생</span>';
  parent.insertBefore(b,$('btn-cloud-account'));
}
function ensureModal(){
  let m=$('sm3-workspace-modal');if(m)return m;
  m=document.createElement('div');m.id='sm3-workspace-modal';m.className='hidden fixed inset-0 z-[215] bg-slate-950/55 backdrop-blur-sm p-3 items-center justify-center no-print';
  m.innerHTML=`<div class="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
    <div class="px-5 py-4 border-b flex justify-between"><div><h3 class="font-black">👥 학생·학급 워크스페이스</h3><p class="text-[11px] text-slate-500 mt-1">학생을 선택하면 교과·진로·자율·동아리 작성 상태가 학생별로 분리됩니다.</p></div><button onclick="closeStudentWorkspace()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>
    <div class="flex-1 min-h-0 grid md:grid-cols-[300px_1fr]">
      <div class="border-r p-3 overflow-y-auto"><div class="flex gap-2"><button onclick="addWorkspaceClass()" class="flex-1 p-2 bg-blue-600 text-white rounded-xl text-xs font-black">+ 학급</button><label class="flex-1 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black text-center cursor-pointer">Excel<input id="sm3-roster-file" type="file" accept=".xlsx,.xls,.csv" class="hidden" onchange="importWorkspaceRoster(event)"></label></div><div id="sm3-class-list" class="mt-3 space-y-2"></div></div>
      <div class="p-4 overflow-y-auto"><div class="flex flex-wrap gap-2 justify-between items-center"><div><b id="sm3-selected-class-title">학급을 선택하세요</b><div id="sm3-selected-class-sub" class="text-[10px] text-slate-500"></div></div><div class="flex gap-2"><button onclick="addWorkspaceStudent()" class="px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-black">+ 학생</button><button onclick="exportWorkspaceRoster()" class="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold">Excel 내보내기</button></div></div><div id="sm3-student-grid" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-4"></div></div>
    </div>
  </div>`;
  document.body.appendChild(m);return m;
}
function renderWorkspace(){
  const w=ws(),classes=$('sm3-class-list'),grid=$('sm3-student-grid');
  if(!classes||!grid)return;
  let selected=load('seoteukMate.workspaceSelectedClass','');
  if(!selected&&w.classes[0])selected=w.classes[0].id;
  classes.innerHTML=w.classes.length?w.classes.map(c=>`<button onclick="selectWorkspaceClass('${c.id}')" class="w-full text-left p-3 rounded-xl border ${selected===c.id?'border-blue-400 bg-blue-50':'border-slate-200'}"><b class="text-xs">${esc(c.name)}</b><div class="text-[10px] text-slate-500">${w.students.filter(s=>s.classId===c.id).length}명 · ${esc(c.year||'')} ${esc(c.grade||'')}</div></button>`).join(''):'<div class="p-4 text-xs text-slate-400">학급을 추가하세요.</div>';
  const cls=w.classes.find(c=>c.id===selected);
  $('sm3-selected-class-title').textContent=cls?cls.name:'학급을 선택하세요';
  $('sm3-selected-class-sub').textContent=cls?`${cls.year||''} ${cls.grade||''}`:'';
  const students=w.students.filter(s=>s.classId===selected).sort((a,b)=>String(a.no).localeCompare(String(b.no),undefined,{numeric:true}));
  grid.innerHTML=students.length?students.map(s=>{
    const active=w.activeStudentId===s.id;
    const rec=records()[s.id];
    const count=countRecord(rec);
    return `<div class="p-3 border rounded-2xl ${active?'border-cyan-400 bg-cyan-50':'border-slate-200'}"><div class="flex justify-between gap-2"><div><b>${esc(s.no||'')} ${esc(s.name)}</b><div class="text-[10px] text-slate-500">${esc(s.career||'진로 미입력')}</div></div><span class="text-[9px] px-2 py-1 rounded bg-white border">${count}개 기록</span></div><div class="grid grid-cols-2 gap-1 mt-3"><button onclick="activateWorkspaceStudent('${s.id}')" class="p-1.5 bg-blue-600 text-white rounded-lg text-xs font-black">${active?'선택됨':'작업 열기'}</button><button onclick="deleteWorkspaceStudent('${s.id}')" class="p-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs">삭제</button></div></div>`;
  }).join(''):'<div class="col-span-full p-8 text-center text-slate-400 text-xs">학생을 추가하거나 Excel을 가져오세요.</div>';
}
function countRecord(rec){
  if(!rec)return 0;let n=0;
  const d=rec.appState?.subjectData||{};
  for(const sub of Object.values(d))for(const sem of Object.values(sub||{}))for(const t of Object.values(sem||{}))if(String(t||'').trim())n++;
  const cd=rec.categoryDrafts||{};
  for(const cat of Object.values(cd))for(const sem of Object.values(cat||{}))for(const t of Object.values(sem||{}))if(String(t||'').trim())n++;
  return n;
}
window.openStudentWorkspace=()=>{ensureModal();renderWorkspace();const m=$('sm3-workspace-modal');m.classList.remove('hidden');m.classList.add('flex')};
window.closeStudentWorkspace=()=>{const m=$('sm3-workspace-modal');m?.classList.add('hidden');m?.classList.remove('flex')};
window.selectWorkspaceClass=id=>{save('seoteukMate.workspaceSelectedClass',id);renderWorkspace()};
window.addWorkspaceClass=()=>{
  const name=prompt('학급 이름을 입력하세요. 예: 2학년 3반');if(!name)return;
  const w=ws();const c={id:'c_'+Date.now().toString(36),name:name.trim(),year:String(new Date().getFullYear()),grade:''};w.classes.push(c);putWs(w);save('seoteukMate.workspaceSelectedClass',c.id);renderWorkspace();
};
window.addWorkspaceStudent=()=>{
  const classId=load('seoteukMate.workspaceSelectedClass','')||ws().classes[0]?.id;if(!classId)return alert('학급을 먼저 추가하세요.');
  const name=prompt('학생 이름');if(!name)return;const no=prompt('번호','')||'';const career=prompt('희망 진로(선택)','')||'';
  const w=ws();w.students.push({id:uid(),classId,no,name:name.trim(),career,major:'',createdAt:Date.now()});putWs(w);renderWorkspace();
};
window.activateWorkspaceStudent=async id=>{await selectStudent(id);window.closeStudentWorkspace()};
window.deleteWorkspaceStudent=async id=>{
  const w=ws(),s=w.students.find(x=>x.id===id);if(!s||!confirm(`${s.name} 학생을 삭제할까요? 로컬 기록도 휴지통 없이 삭제됩니다.`))return;
  if(w.activeStudentId===id)await saveActiveRecord();
  w.students=w.students.filter(x=>x.id!==id);if(w.activeStudentId===id)w.activeStudentId='';putWs(w);
  const r=records();delete r[id];putRecords(r);await window.SeoteukCloud?.deleteStudentRecord?.(id).catch(()=>{});paintActiveStudent();renderWorkspace();
};
window.importWorkspaceRoster=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  const classId=load('seoteukMate.workspaceSelectedClass','')||ws().classes[0]?.id;if(!classId){alert('학급을 먼저 추가하세요.');event.target.value='';return}
  window.SeoteukProgress?.start?.('📥 학생 명렬 가져오기','Excel/CSV를 읽고 있습니다.');
  try{
    const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array'});const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
    const w=ws();for(const row of rows){
      const name=String(row['이름']||row['성명']||row['name']||'').trim();if(!name)continue;
      const no=String(row['번호']||row['학번']||row['no']||'').trim();
      const career=String(row['진로']||row['희망진로']||'').trim();const major=String(row['학과']||row['목표학과']||'').trim();
      if(!w.students.some(s=>s.classId===classId&&String(s.no)===no&&s.name===name))w.students.push({id:uid(),classId,no,name,career,major,createdAt:Date.now()});
    }
    putWs(w);renderWorkspace();window.SeoteukProgress?.done?.('명렬 가져오기 완료');
  }catch(e){window.SeoteukProgress?.fail?.('명렬 가져오기 실패');alert(e.message)}
  finally{event.target.value=''}
};
window.exportWorkspaceRoster=()=>{
  const w=ws(),rows=w.students.map(s=>{const c=w.classes.find(x=>x.id===s.classId);return{학급:c?.name||'',번호:s.no||'',이름:s.name,진로:s.career||'',학과:s.major||'',기록수:countRecord(records()[s.id])}});
  const wsx=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,wsx,'학생목록');XLSX.writeFile(wb,'SeoteukMate_학생워크스페이스.xlsx');
};
async function mergeAllCloudRecords(){
  if(!window.SeoteukCloud?.getUser?.()||!window.SeoteukCloud?.loadAllStudentRecords)return 0;
  const cloud=await window.SeoteukCloud.loadAllStudentRecords().catch(()=>({}));
  const local=records();let merged=0;
  for(const [id,remote] of Object.entries(cloud||{})){
    const here=local[id];
    if(!here||Number(remote?.savedAt||0)>=Number(here?.savedAt||0)){
      local[id]=remote;merged++;
    }
  }
  putRecords(local);
  window.__SEOTEUK_CLASS_RECORDS_READY__=true;
  window.dispatchEvent(new CustomEvent('seoteuk:class-records-ready',{detail:{count:Object.keys(cloud||{}).length,merged}}));
  return Object.keys(cloud||{}).length;
}
window.SeoteukWorkspace={
  getWorkspace:()=>clone(ws()),getCurrentStudent:()=>clone(currentStudent()),saveActiveRecord,mergeAllCloudRecords,
  async syncFromCloud(){
    if(!window.SeoteukCloud?.getUser?.())return;
    const cloud=await window.SeoteukCloud.loadWorkspaceIndex?.();
    const local=ws();
    if(!cloud){
      await window.SeoteukCloud.saveWorkspaceIndex?.({schemaVersion:3,activeStudentId:local.activeStudentId,classes:local.classes,students:local.students});
      if(local.activeStudentId){
        const rec=records()[local.activeStudentId]||captureRecord();
        await window.SeoteukCloud.saveStudentRecord?.(local.activeStudentId,rec);
      }
      await mergeAllCloudRecords().catch(()=>0);
      return;
    }
    await mergeAllCloudRecords().catch(()=>0);
    const cloudTime=(cloud.updatedAt?.seconds||0)*1000;
    if(cloudTime>(local.updatedAt||0)){
      const next={schemaVersion:3,activeStudentId:cloud.activeStudentId||local.activeStudentId||'',classes:cloud.classes||[],students:cloud.students||[],updatedAt:Date.now()};
      save(KEY,next);
      if(next.activeStudentId){
        const rec=await window.SeoteukCloud.loadStudentRecord?.(next.activeStudentId).catch(()=>null);
        if(rec){
          const all=records();all[next.activeStudentId]=rec;putRecords(all);applyRecord(rec);
        }
      }
      paintActiveStudent();renderWorkspace();
    }else{
      await window.SeoteukCloud.saveWorkspaceIndex?.({schemaVersion:3,activeStudentId:local.activeStudentId,classes:local.classes,students:local.students});
    }
  }
};
function init(){
  ensureHeaderButton();ensureModal();paintActiveStudent();
  window.addEventListener('beforeunload',()=>{try{const w=ws();if(w.activeStudentId){const r=records();r[w.activeStudentId]=captureRecord();putRecords(r)}}catch(_){}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,280));else setTimeout(init,280);
})();
