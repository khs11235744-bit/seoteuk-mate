
(function(){
'use strict';
if(window.__SEOTEUK_ANALYTICS_V3__)return;
window.__SEOTEUK_ANALYTICS_V3__=true;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(_){return d}};
const stop=new Set('학생 활동 수업 통해 관련 대한 과정 있음 하는 함 보임 드러남 내용 자료 탐구 역사 교과 제작 참여'.split(' '));
function bytes(t){return window.calculateNeisBytes?.(t)||0}
function currentStudent(){return window.SeoteukWorkspace?.getCurrentStudent?.()||null}
function collect(){
  const out=[];
  const d=window.subjectData||{};
  for(const [subject,sub] of Object.entries(d)){
    for(const [sem,vers] of Object.entries(sub||{})){
      for(const [ver,text] of Object.entries(vers||{})){
        if(String(text||'').trim())out.push({area:'교과세특',subject,sem,ver,text:String(text).trim()});
      }
    }
  }
  const cd=load('seoteukMate.v28.categoryDrafts',{});
  for(const [area,sems] of Object.entries(cd)){
    for(const [sem,vers] of Object.entries(sems||{})){
      for(const [ver,text] of Object.entries(vers||{})){
        if(String(text||'').trim())out.push({area,subject:'',sem,ver,text:String(text).trim()});
      }
    }
  }
  return out;
}
function metric(texts,rx){
  const all=texts.join(' ');return (all.match(rx)||[]).length;
}
function pct(n,den){return Math.min(100,Math.round((n/Math.max(1,den))*100))}
function keywords(texts){
  const m=texts.join(' ').match(/[가-힣A-Za-z0-9]{2,}/g)||[],c={};
  for(const w of m){if(stop.has(w)||w.length<2)continue;c[w]=(c[w]||0)+1}
  return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,12);
}
function genericWarnings(texts){
  const warnings=[];
  const all=texts.join(' ');
  const praise=(all.match(/탁월|우수|훌륭|완벽|매우 뛰어|뛰어난/g)||[]).length;
  if(praise>=3)warnings.push(`추상적 칭찬 표현이 ${praise}회 확인됨`);
  const repeat=(all.match(/자료의 작성 주체|사실과 해석을 구분|시대적 맥락/g)||[]).length;
  if(repeat>=4)warnings.push('역사 세특에서 유사한 사료·맥락 표현이 반복되는 경향');
  const over=collect().filter(r=>bytes(r.text)>1500);
  if(over.length)warnings.push(`1,500B를 넘는 작성본 ${over.length}개`);
  if(!warnings.length)warnings.push('즉시 확인되는 큰 반복·과장 경고 없음');
  return warnings;
}
function buildStats(){
  const rows=collect(),texts=rows.map(x=>x.text),sent=Math.max(1,(texts.join(' ').match(/\./g)||[]).length);
  const evidence=metric(texts,/자료|사료|출처|산출물|기사|보고서|관찰|근거/g);
  const process=metric(texts,/비교|분석|검토|질문|수정|보완|구성|재구성|설명/g);
  const growth=metric(texts,/성장|변화|확장|심화|성찰|깨달|관심을 넓|후속/g);
  const collab=metric(texts,/협력|협업|조율|소통|경청|모둠|공유/g);
  const career=metric(texts,/진로|전공|학과|직업|교육적|전문/g);
  return{rows,texts,sent,metrics:{
    '근거 표현':pct(evidence,sent*0.8),'과정 표현':pct(process,sent),'성장·성찰':pct(growth,sent*0.6),'협업·소통':pct(collab,sent*0.5),'진로 연결':pct(career,sent*0.6)
  },keywords:keywords(texts),warnings:genericWarnings(texts)};
}
function ensureModal(){
  let m=$('sm3-analytics-modal');if(m)return m;
  m=document.createElement('div');m.id='sm3-analytics-modal';m.className='hidden fixed inset-0 z-[218] bg-slate-950/55 p-3 items-center justify-center no-print';
  m.innerHTML=`<div class="w-full max-w-7xl h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"><div class="px-5 py-4 border-b flex justify-between"><div><h3 class="font-black">📊 학생 기록 종합 분석</h3><p class="text-[11px] text-slate-500 mt-1">입학 결과를 예측하거나 평가하지 않고, 기록의 구성·근거·반복·성장 흐름을 점검하는 교사용 참고 대시보드입니다.</p></div><button onclick="closeAnalyticsDashboard()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div><div id="sm3-analytics-body" class="flex-1 overflow-y-auto p-4 sm:p-5"></div></div>`;
  document.body.appendChild(m);return m;
}
function render(){
  const s=buildStats(),stu=currentStudent(),byArea={};
  for(const r of s.rows)(byArea[r.area]??=[]).push(r);
  const areaCards=Object.entries(byArea).map(([area,rows])=>{
    const uniqueSubjects=[...new Set(rows.map(r=>r.subject).filter(Boolean))];
    return `<div class="p-3 rounded-2xl border bg-slate-50"><div class="flex justify-between"><b>${esc(area)}</b><span class="text-xs font-black">${rows.length}개 작성본</span></div><div class="text-[10px] text-slate-500 mt-1">${uniqueSubjects.slice(0,8).map(esc).join(' · ')||'창의적 체험활동'}</div></div>`;
  }).join('');
  const metricCards=Object.entries(s.metrics).map(([k,v])=>`<div class="p-3 border rounded-2xl"><div class="flex justify-between text-xs"><b>${esc(k)}</b><span class="font-black">${v}%</span></div><div class="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden"><div class="h-full bg-blue-600 rounded-full" style="width:${v}%"></div></div></div>`).join('');
  const rowTable=s.rows.slice(0,80).map(r=>`<tr><td class="border p-2">${esc(r.area)}</td><td class="border p-2">${esc(r.subject||'-')}</td><td class="border p-2">${esc(r.sem)}</td><td class="border p-2">${esc(r.ver.toUpperCase())}</td><td class="border p-2 text-right">${bytes(r.text)}</td><td class="border p-2 max-w-[480px] truncate">${esc(r.text)}</td></tr>`).join('');
  const body=`<div class="grid lg:grid-cols-[1fr_320px] gap-4">
    <div class="space-y-4">
      <div class="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-900 text-white"><div class="text-[11px] text-indigo-200">현재 분석 대상</div><div class="text-xl font-black mt-1">${stu?`${esc(stu.no||'')} ${esc(stu.name)}`:'현재 작업공간'}</div><div class="text-xs text-slate-300 mt-1">${stu?esc(stu.career||'진로 미입력'):'학생 워크스페이스를 선택하면 학생별로 분석할 수 있습니다.'}</div><div class="grid grid-cols-3 gap-2 mt-4"><div><div class="text-2xl font-black">${s.rows.length}</div><div class="text-[10px]">작성본</div></div><div><div class="text-2xl font-black">${[...new Set(s.rows.map(x=>x.subject).filter(Boolean))].length}</div><div class="text-[10px]">교과</div></div><div><div class="text-2xl font-black">${s.texts.reduce((a,t)=>a+bytes(t),0).toLocaleString()}</div><div class="text-[10px]">총 Byte</div></div></div></div>
      <div><h4 class="font-black mb-2">영역별 작성 현황</h4><div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">${areaCards||'<div class="text-sm text-slate-400">작성된 기록이 없습니다.</div>'}</div></div>
      <div><h4 class="font-black mb-2">문장 구성 참고지표</h4><div class="grid sm:grid-cols-2 xl:grid-cols-5 gap-2">${metricCards}</div><p class="text-[10px] text-slate-400 mt-2">※ 입학사정 점수·합격 가능성·학생 역량 등급이 아니라 현재 문장에 해당 표현이 얼마나 드러나는지 보는 참고지표입니다.</p></div>
      <div><div class="flex justify-between items-center mb-2"><h4 class="font-black">작성본 상세</h4><button onclick="aiAnalyzeStudentRecord()" class="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-black">✨ AI 종합 코멘트</button></div><div class="overflow-x-auto"><table class="w-full text-[11px] border-collapse"><thead><tr><th class="border p-2">영역</th><th class="border p-2">과목</th><th class="border p-2">학기</th><th class="border p-2">버전</th><th class="border p-2">B</th><th class="border p-2">본문</th></tr></thead><tbody>${rowTable||'<tr><td colspan="6" class="p-6 text-center">작성본 없음</td></tr>'}</tbody></table></div></div>
      <div id="sm3-ai-analysis" class="hidden p-4 border border-purple-200 bg-purple-50 rounded-2xl text-sm leading-6 whitespace-pre-wrap"></div>
    </div>
    <div class="space-y-4">
      <div class="p-4 border rounded-2xl"><h4 class="font-black">반복 관심 키워드</h4><div class="flex flex-wrap gap-1.5 mt-3">${s.keywords.map(([k,n])=>`<span class="px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">${esc(k)} ${n}</span>`).join('')||'<span class="text-xs text-slate-400">키워드 없음</span>'}</div></div>
      <div class="p-4 border rounded-2xl"><h4 class="font-black">검토 알림</h4><ul class="mt-2 space-y-2 text-xs">${s.warnings.map(w=>`<li class="p-2 bg-amber-50 border border-amber-200 rounded-xl">• ${esc(w)}</li>`).join('')}</ul></div>
      <div class="p-4 border rounded-2xl"><h4 class="font-black">V1·V2·V3 현재 비교</h4>${['v1','v2','v3'].map((v,i)=>{const cd=load('seoteukMate.v28.categoryDrafts',{});const t=window.activeCategory==='교과세특'?window.subjectData?.[window.activeSubject]?.[window.activeSemester]?.[v]||'':cd?.[window.activeCategory]?.[window.activeSemester]?.[v]||'';return`<div class="mt-2 p-2 bg-slate-50 rounded-xl text-xs"><b>V${i+1} ${['관찰·성취','탐구·맥락','융합·진로'][i]}</b><div class="text-[10px] text-slate-500">${bytes(t)}B</div></div>`}).join('')}</div>
      <button onclick="window.print()" class="w-full p-2.5 bg-slate-900 text-white rounded-xl font-black text-xs">🖨️ 화면 인쇄</button>
    </div></div>`;
  $('sm3-analytics-body').innerHTML=body;
}
window.openAnalyticsDashboard=()=>{ensureModal();render();const m=$('sm3-analytics-modal');m.classList.remove('hidden');m.classList.add('flex')};
window.closeAnalyticsDashboard=()=>{const m=$('sm3-analytics-modal');m?.classList.add('hidden');m?.classList.remove('flex')};
window.aiAnalyzeStudentRecord=async()=>{
  const s=buildStats(),box=$('sm3-ai-analysis');
  if(!s.rows.length)return window.showToast?.('분석할 기록이 없습니다.','warning');
  const stu=currentStudent();
  const sample=s.rows.slice(0,30).map(r=>`[${r.area}/${r.subject||'-'}/${r.sem}/${r.ver}] ${r.text}`).join('\n');
  window.SeoteukProgress?.start?.('📊 학생 기록 AI 분석','교과·창체 기록의 반복, 구체성, 성장 흐름을 분석합니다.');
  try{
    const prompt=`다음은 한 학생의 학교생활기록부 작성 초안 묶음이다.
${stu?`학생 메타: ${stu.no||''} ${stu.name||''}, 진로 ${stu.career||'미입력'}`:''}
${sample}
입학 합격 가능성, 대학별 유불리, 학생 등급, 점수, 순위를 판단하지 않는다.
교사용 검토 코멘트로만 작성한다.
1. 반복적으로 드러나는 관심·탐구 흐름
2. 구체적 행동 근거가 잘 드러나는 부분
3. 누구에게나 붙일 수 있는 상투적 표현 또는 반복 위험
4. 교과 간 연결이 자연스러운 부분과 억지 연결 가능성이 있는 부분
5. 다음 기록에서 교사가 추가로 관찰하면 좋은 장면
각 항목을 짧고 구체적으로 작성한다.`;
    const txt=await (window.__requestAI?window.__requestAI(prompt):window.SeoteukAI.request(prompt));
    box.textContent=txt;box.classList.remove('hidden');
    window.SeoteukProgress?.done?.('학생 기록 분석 완료');
  }catch(e){window.SeoteukProgress?.fail?.('학생 기록 분석 실패');window.showToast?.(e.message,'warning')}
};
function patchExistingReportButtons(){
  window.openComprehensiveReportModal=window.openAnalyticsDashboard;
  const buttons=[...document.querySelectorAll('button')].filter(b=>/분석표/.test(b.textContent||''));
  buttons.forEach(b=>b.onclick=window.openAnalyticsDashboard);
}
function init(){ensureModal();patchExistingReportButtons();setTimeout(patchExistingReportButtons,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,350));else setTimeout(init,350);
})();
