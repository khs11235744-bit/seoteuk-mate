/* Seoteuk Mate v3.2 — AI-free local tools + admissions center */
(function(){
'use strict';
if(window.__SEOTEUK_LOCAL_V32__) return;
window.__SEOTEUK_LOCAL_V32__=true;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=(m,t='info')=>window.showToast?.(m,t);
const getText=()=>window.getCurrentText?.()||$('seoteuk-textarea')?.value||'';
const setText=t=>{window.setCurrentText?.(String(t||''));if($('seoteuk-textarea'))$('seoteuk-textarea').value=String(t||'');window.updateNeisStats?.();};
const bytes=t=>window.calculateNeisBytes?.(String(t||''))??new TextEncoder().encode(String(t||'')).length;
const UNIV_HOME={
 '서울대학교':'https://www.snu.ac.kr','연세대학교':'https://www.yonsei.ac.kr','고려대학교':'https://www.korea.ac.kr',
 '성균관대학교':'https://www.skku.edu','한양대학교':'https://www.hanyang.ac.kr','서강대학교':'https://www.sogang.ac.kr',
 '중앙대학교':'https://www.cau.ac.kr','경희대학교':'https://www.khu.ac.kr','한국외국어대학교':'https://www.hufs.ac.kr',
 '서울시립대학교':'https://www.uos.ac.kr','이화여자대학교':'https://www.ewha.ac.kr','건국대학교':'https://www.konkuk.ac.kr',
 '동국대학교':'https://www.dongguk.edu','홍익대학교':'https://www.hongik.ac.kr','경북대학교':'https://www.knu.ac.kr',
 '부산대학교':'https://www.pusan.ac.kr','전남대학교':'https://www.jnu.ac.kr','전북대학교':'https://www.jbnu.ac.kr',
 '충남대학교':'https://www.cnu.ac.kr','충북대학교':'https://www.chungbuk.ac.kr','POSTECH':'https://www.postech.ac.kr',
 '포항공과대학교':'https://www.postech.ac.kr','KAIST':'https://www.kaist.ac.kr','UNIST':'https://www.unist.ac.kr',
 'GIST':'https://www.gist.ac.kr','DGIST':'https://www.dgist.ac.kr','영남대학교':'https://www.yu.ac.kr',
 '계명대학교':'https://www.kmu.ac.kr','대구대학교':'https://www.daegu.ac.kr','한동대학교':'https://www.handong.edu',
 '동아대학교':'https://www.donga.ac.kr'
};const PDF_KEYS={
 '전형 일정':['원서접수','합격자 발표','등록 기간','전형 일정'],
 '지원 자격':['지원자격','지원 자격','졸업예정','지원 가능'],
 '학생부 반영':['학생부 반영','학교생활기록부','교과 성적','반영 교과'],
 '수능 최저':['수능최저','수능 최저','최저학력기준','최저 학력 기준'],
 '면접':['면접','구술','면접평가'],
 '서류 평가':['서류평가','서류 평가','학생부종합','종합평가'],
 '지역인재':['지역인재','지역 인재'],
 '제출 서류':['제출서류','제출 서류','증빙서류','증빙 서류'],
 '전형 방법':['전형방법','전형 방법','단계별','일괄합산']
};
function modal(id,title,sub){
 let m=$(id);if(m)return m;
 m=document.createElement('div');m.id=id;m.className='hidden fixed inset-0 z-[245] bg-slate-950/55 backdrop-blur-sm p-3 sm:p-5 items-center justify-center no-print';
 m.innerHTML=`<div class="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
 <div class="px-5 py-4 border-b flex justify-between gap-3"><div><h3 class="font-black text-slate-900">${title}</h3><p class="text-[11px] text-slate-500 mt-1">${sub}</p></div><button type="button" data-close class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>
 <div data-body class="p-4 sm:p-5 overflow-y-auto custom-scrollbar"></div></div>`;
 m.querySelector('[data-close]').onclick=()=>{m.classList.add('hidden');m.classList.remove('flex')};document.body.appendChild(m);return m;
}
function showModal(id,title,sub,html){const m=modal(id,title,sub);m.querySelector('[data-body]').innerHTML=html;m.classList.remove('hidden');m.classList.add('flex');}
function normalizeLocal(t){
 return String(t||'').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/ {2,}/g,' ')
 .replace(/\s+([,.;:!?])/g,'$1').replace(/([.!?]){2,}/g,'$1').replace(/\n{3,}/g,'\n\n').trim();
}
function recordEnding(t){
 let s=normalizeLocal(t);
 const reps=[[/하였습니다\./g,'함.'],[/했습니다\./g,'함.'],[/하였음\./g,'함.'],[/하였으며/g,'하며'],[/되었습니다\./g,'됨.'],[/되었습니다/g,'됨'],[/보여주었습니다\./g,'보임.'],[/보여줌\./g,'보임.'],[/나타냈습니다\./g,'나타냄.']];
 for(const [a,b] of reps)s=s.replace(a,b);return s;
}
function tokens(s){return new Set((String(s).match(/[가-힣A-Za-z0-9]{2,}/g)||[]).map(x=>x.toLowerCase()))}
function similarity(a,b){const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let n=0;A.forEach(x=>B.has(x)&&n++);return n/Math.min(A.size,B.size)}
function dedupeSentences(t){
 const arr=normalizeLocal(t).split(/(?<=[.!?])\s+/).filter(Boolean),out=[];
 for(const s of arr)if(!out.some(x=>similarity(x,s)>.78))out.push(s);return out.join(' ');
}function localChecks(t){
 const s=String(t||''),items=[],b=bytes(s),sent=s.split(/(?<=[.!?])\s+/).filter(Boolean);
 if(b>1500)items.push({level:'bad',msg:`1,500B 초과: 현재 ${b.toLocaleString()}B`});
 else items.push({level:'ok',msg:`바이트 범위: ${b.toLocaleString()} / 1,500B`});
 const praise=(s.match(/탁월|우수|훌륭|완벽|매우 뛰어|뛰어난 역량/g)||[]).length;
 if(praise)items.push({level:'warn',msg:`근거 없이 보일 수 있는 평가어 ${praise}회 — 행동 근거 확인 권장`});
 const subject=(s.match(/학생은|학생이/g)||[]).length;if(subject>=2)items.push({level:'warn',msg:`'학생은/학생이' 표현 ${subject}회 — 생기부 문체에서 생략 가능`});
 const risk=(s.match(/수상|우승|1위|논문 게재|특허|공인어학|모의고사|장학금/g)||[]).length;
 if(risk)items.push({level:'warn',msg:`기재 전 사실·기재 가능 여부 확인이 필요한 표현 ${risk}개 감지`});
 let dup=0;for(let i=0;i<sent.length;i++)for(let j=i+1;j<sent.length;j++)if(similarity(sent[i],sent[j])>.78)dup++;
 if(dup)items.push({level:'warn',msg:`의미가 매우 비슷한 문장 조합 ${dup}개 감지`});
 const long=sent.filter(x=>x.length>180).length;if(long)items.push({level:'warn',msg:`180자 이상 긴 문장 ${long}개 — 가독성 점검 권장`});
 if(!/(작성|제작|발표|토론|비교|분석|조사|검토|설명|질문|기획|참여|구성|수정)/.test(s)&&s.trim())items.push({level:'warn',msg:'구체적인 학생 행동 동사가 적습니다.'});
 return items;
}
function localStats(){const ta=$('sm32-local-text');if(!ta)return;const t=ta.value,b=bytes(t);$('sm32-local-stats').textContent=`글자 ${t.length.toLocaleString()} · ${b.toLocaleString()}B · 문장 ${t.split(/(?<=[.!?])\s+/).filter(Boolean).length}개`;}
function renderChecks(){const ta=$('sm32-local-text'),box=$('sm32-local-checks');if(!ta||!box)return;const colors={ok:'bg-emerald-50 border-emerald-200 text-emerald-800',warn:'bg-amber-50 border-amber-200 text-amber-900',bad:'bg-rose-50 border-rose-200 text-rose-900'};box.innerHTML=localChecks(ta.value).map(x=>`<div class="p-2.5 border rounded-xl text-xs ${colors[x.level]}">${esc(x.msg)}</div>`).join('');localStats();}
window.openLocalTools=function(){
 const text=getText();
 showModal('sm32-local-modal','🛠️ AI 없이 사용하는 로컬 도구','인터넷이나 AI 연결이 없어도 브라우저에서 직접 실행됩니다.',`
 <div class="grid lg:grid-cols-[1fr_300px] gap-4"><div>
 <div class="flex flex-wrap gap-2 mb-2"><button onclick="sm32Normalize()" class="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-black">공백·문장부호 정리</button>
 <button onclick="sm32Ending()" class="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">생기부 종결형 정리</button>
 <button onclick="sm32Dedupe()" class="px-3 py-2 bg-violet-600 text-white rounded-xl text-xs font-black">반복 문장 제거</button>
 <button onclick="sm32Check()" class="px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-black">기재·문장 점검</button></div>
 <textarea id="sm32-local-text" spellcheck="true" class="w-full min-h-[360px] p-4 border rounded-2xl text-sm leading-7 outline-none focus:ring-2 focus:ring-blue-400" placeholder="점검할 문장을 입력하세요.">${esc(text)}</textarea>
 <div class="flex justify-between items-center mt-2"><span id="sm32-local-stats" class="text-[11px] text-slate-500"></span><button onclick="sm32Apply()" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black">현재 기록에 적용</button></div>
 </div><div><div class="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900">브라우저 맞춤법 검사도 켜져 있습니다. 빨간 밑줄은 브라우저 사전의 제안이며, 아래 검사는 세특 문장 구조를 로컬 규칙으로 점검합니다.</div><div id="sm32-local-checks" class="space-y-2 mt-3"></div></div></div>`);
 setTimeout(()=>{$('sm32-local-text')?.addEventListener('input',localStats);renderChecks()},20);
};window.sm32Normalize=()=>{const ta=$('sm32-local-text');if(ta){ta.value=normalizeLocal(ta.value);renderChecks()}};
window.sm32Ending=()=>{const ta=$('sm32-local-text');if(ta){ta.value=recordEnding(ta.value);renderChecks()}};
window.sm32Dedupe=()=>{const ta=$('sm32-local-text');if(ta){ta.value=dedupeSentences(ta.value);renderChecks()}};
window.sm32Check=renderChecks;
window.sm32Apply=()=>{const ta=$('sm32-local-text');if(!ta)return;setText(ta.value);toast('로컬 도구 결과를 현재 기록에 적용했습니다.','success')};

function targetYear(){return String($('sm32-adm-year')?.value||new Date().getFullYear()+1).trim()}
function univName(){return String($('sm32-adm-univ')?.value||'').trim()}
function qopen(q){window.open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank','noopener')}
window.sm32OpenHomepage=function(){const u=univName();if(!u)return toast('대학명을 입력하세요.','warning');const url=UNIV_HOME[u];if(url)window.open(url,'_blank','noopener');else qopen(`site:ac.kr "${u}" 공식 홈페이지`)};
window.sm32SearchAdmission=function(kind){
 const u=univName(),y=targetYear();if(!u)return toast('대학명을 입력하세요.','warning');
 const tail=kind==='susi'?'수시 모집요강 filetype:pdf':kind==='jungsi'?'정시 모집요강 filetype:pdf':kind==='result'?'입시결과 전형결과':'입학처';
 qopen(`"${u}" ${y}학년도 ${tail}`);
};
window.sm32OpenAdiga=()=>window.open('https://www.adiga.kr','_blank','noopener');
window.openAdmissionsCenter=function(){
 const y=new Date().getFullYear()+1;
 showModal('sm32-adm-modal','🎓 대학입시 정보센터','AI 없이 공식 홈페이지·검색·어디가 연결과 모집요강 PDF 로컬 분석을 제공합니다.',`
 <div class="grid lg:grid-cols-[1fr_1fr] gap-4">
 <div class="space-y-4"><div class="p-4 border rounded-2xl bg-slate-50">
 <div class="grid sm:grid-cols-[1fr_130px] gap-2"><input id="sm32-adm-univ" list="sm32-univ-list" class="p-2.5 border rounded-xl text-sm" placeholder="대학명 예: 경북대학교"><input id="sm32-adm-year" type="number" value="${y}" class="p-2.5 border rounded-xl text-sm" aria-label="학년도"></div>
 <datalist id="sm32-univ-list">${Object.keys(UNIV_HOME).map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
 <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3"><button onclick="sm32OpenHomepage()" class="p-2 bg-slate-800 text-white rounded-xl text-xs font-black">공식 홈페이지</button><button onclick="sm32SearchAdmission('office')" class="p-2 bg-blue-600 text-white rounded-xl text-xs font-black">입학처 찾기</button><button onclick="sm32OpenAdiga()" class="p-2 bg-emerald-600 text-white rounded-xl text-xs font-black">어디가</button><button onclick="sm32SearchAdmission('susi')" class="p-2 bg-indigo-50 text-indigo-800 border rounded-xl text-xs font-black">수시 요강 찾기</button><button onclick="sm32SearchAdmission('jungsi')" class="p-2 bg-purple-50 text-purple-800 border rounded-xl text-xs font-black">정시 요강 찾기</button><button onclick="sm32SearchAdmission('result')" class="p-2 bg-amber-50 text-amber-900 border rounded-xl text-xs font-black">전년도 결과 찾기</button></div>
 </div><div class="p-4 border rounded-2xl"><h4 class="font-black">공식 정보 사용 원칙</h4><p class="text-xs text-slate-600 leading-5 mt-2">모집요강·지원자격·수능최저·전형일정은 변동될 수 있으므로 최종 판단은 반드시 해당 대학 입학처의 최신 공고를 기준으로 확인하세요. 이 메뉴는 공식 페이지와 근거 페이지를 빨리 찾는 도구입니다.</p></div></div>
 <div class="space-y-3"><div class="p-4 border rounded-2xl"><h4 class="font-black">📄 모집요강 PDF 로컬 분석</h4><p class="text-[11px] text-slate-500 mt-1">PDF는 서버로 보내지 않고 이 브라우저에서 읽어 핵심 키워드가 있는 페이지를 찾습니다.</p>
 <div class="grid grid-cols-2 gap-2 mt-3"><label class="p-3 text-center bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-black cursor-pointer">요강 A<input type="file" accept=".pdf" class="hidden" onchange="sm32AnalyzePdf(event,'A')"></label><label class="p-3 text-center bg-violet-50 text-violet-800 border border-violet-200 rounded-xl text-xs font-black cursor-pointer">요강 B<input type="file" accept=".pdf" class="hidden" onchange="sm32AnalyzePdf(event,'B')"></label></div>
 <button onclick="sm32ComparePdfs()" class="w-full mt-2 p-2 bg-slate-900 text-white rounded-xl text-xs font-black">A·B 페이지 비교</button></div><div id="sm32-pdf-results" class="space-y-2"></div></div>
 </div>`);
 renderPdfResults();
};window.__sm32PdfReports=window.__sm32PdfReports||{};
async function scanPdf(file,slot){
 if(!window.pdfjsLib)throw new Error('PDF.js가 준비되지 않았습니다.');
 const data=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjsLib.getDocument({data}).promise;
 const report={file:file.name,pages:pdf.numPages,hits:{}};
 for(const k of Object.keys(PDF_KEYS))report.hits[k]=[];
 window.SeoteukProgress?.start?.('📄 모집요강 PDF 분석',`${file.name} · ${pdf.numPages}페이지`);
 for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i),tc=await page.getTextContent(),text=tc.items.map(x=>x.str||'').join(' ').replace(/\s+/g,' ');
  for(const [name,keys]of Object.entries(PDF_KEYS)){
   const key=keys.find(k=>text.includes(k));if(!key)continue;
   const pos=text.indexOf(key),snippet=text.slice(Math.max(0,pos-55),Math.min(text.length,pos+145));
   report.hits[name].push({page:i,snippet});
  }
  window.SeoteukProgress?.set?.(Math.round(i/pdf.numPages*96),'📄 모집요강 PDF 분석',`${i}/${pdf.numPages}페이지 확인 중`);
 }
 window.SeoteukProgress?.done?.('PDF 분석 완료');return report;
}
window.sm32AnalyzePdf=async function(ev,slot){const f=ev.target.files?.[0];if(!f)return;try{window.__sm32PdfReports[slot]=await scanPdf(f,slot);renderPdfResults();toast(`요강 ${slot} 분석 완료`,'success')}catch(e){window.SeoteukProgress?.fail?.('PDF 분석 실패');toast(e.message,'warning')}finally{ev.target.value=''}};
function reportCard(slot,r){
 if(!r)return `<div class="p-3 border border-dashed rounded-xl text-xs text-slate-400">요강 ${slot} 미등록</div>`;
 return `<div class="p-3 border rounded-2xl"><div class="flex justify-between"><b>요강 ${slot}</b><span class="text-[10px] text-slate-500">${esc(r.file)} · ${r.pages}p</span></div><div class="mt-2 space-y-1">${Object.entries(r.hits).map(([k,v])=>`<div class="text-[11px]"><b>${esc(k)}</b>: ${v.length?v.map(x=>'p.'+x.page).join(', '):'미탐지'}</div>`).join('')}</div></div>`;
}
function renderPdfResults(){const box=$('sm32-pdf-results');if(!box)return;box.innerHTML=reportCard('A',window.__sm32PdfReports.A)+reportCard('B',window.__sm32PdfReports.B)}
window.sm32ComparePdfs=function(){
 const A=window.__sm32PdfReports.A,B=window.__sm32PdfReports.B;if(!A||!B)return toast('요강 A와 B를 모두 넣어 주세요.','warning');
 const rows=Object.keys(PDF_KEYS).map(k=>`<tr><td class="border p-2 font-bold">${esc(k)}</td><td class="border p-2">${A.hits[k].map(x=>'p.'+x.page).join(', ')||'-'}</td><td class="border p-2">${B.hits[k].map(x=>'p.'+x.page).join(', ')||'-'}</td></tr>`).join('');
 showModal('sm32-adm-compare','⚖️ 모집요강 A·B 근거 페이지 비교','내용을 자동 판단하지 않고 키워드가 등장한 페이지를 비교합니다.',`<div class="overflow-x-auto"><table class="w-full text-xs border-collapse"><thead><tr><th class="border p-2">항목</th><th class="border p-2">${esc(A.file)}</th><th class="border p-2">${esc(B.file)}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
};
function addOfflineStrip(){
 if($('sm32-offline-strip'))return;const nav=$('sm-main-menu-wrap');if(!nav)return;
 const d=document.createElement('div');d.id='sm32-offline-strip';d.className='no-print flex-none px-3 sm:px-4 py-1 bg-emerald-50 border-b border-emerald-100 text-[10px] text-emerald-900 flex items-center justify-between gap-2';
 d.innerHTML='<span><b>AI 연결이 없어도 사용 가능:</b> 맞춤법·문장 점검 · 바이트 검사 · 학생관리 · 대입정보 · 모집요강 PDF 분석</span><button onclick="openLocalTools()" class="px-2 py-1 bg-white border border-emerald-200 rounded-lg font-black">로컬 도구 열기</button>';
 nav.insertAdjacentElement('afterend',d);
}
function init(){addOfflineStrip()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,400));else setTimeout(init,400);
})();