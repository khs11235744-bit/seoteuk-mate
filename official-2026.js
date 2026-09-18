/* Seoteuk Mate v2.4 — 2026 Official Student Record Compliance Pack
   - 2026 학교생활기록부 기재요령을 잠금 규칙으로 적용
   - AI 초안 직접입력 방지 + 교사 검토 게이트
   - 공식 금지/블라인드 점검
   - 창체/동아리/진로/교과세특 영역별 규칙
   - Knowledge Vault에서 규정문서와 교과지식을 분리
*/
(function(){
'use strict';

const V24_KEY='seoteukMate.official2026.v1';
const DB_NAME='SeoteukMateKnowledgeV3';
const DB_VERSION=1;
const DB_DOCS='docs', DB_CHUNKS='chunks';

const SOURCE_LABELS=[
  '001. 2026학년도 학교생활기록부 역량 강화 연수 자료',
  '002. 2026학년도 학교생활기록부 기재요령 전달연수 1차(개정 기준)',
  '003. 2026학년도 학교생활기록부 기재요령 전달연수 스캔본(2026. 5. 11.)'
];

const OFFICIAL_COMMON=[
  {id:'ai-draft',title:'AI 초안 직접 입력 금지',text:'생성형 AI가 만든 문장을 학교생활기록부에 그대로 직접 입력하지 않는다. AI는 초안·윤문 보조로만 사용하고 교사가 직접 관찰·평가한 근거에 맞춰 허위·과장 여부를 확인하고 최종 문장을 직접 검토한다.',source:'2026 주요 개정사항 p19'},
  {id:'teacher-observation',title:'교사 직접 관찰·평가 근거',text:'서술형 항목은 교사가 직접 관찰·평가한 내용을 근거로 작성한다. 학생이 제출한 자료는 관찰을 보조하는 참고자료일 뿐, 학생의 실제 행동을 대신하는 사실 근거로 자동 간주하지 않는다.',source:'처리요령 p27'},
  {id:'allowed-evidence',title:'활용 가능한 보조자료 제한',text:'학교교육계획에 따른 교육활동에서 교사의 지도하에 학생이 직접 작성한 동료평가서, 자기평가서, 수업산출물(수행평가 결과물 포함), 소감문, 독후감만 서술형 항목 작성의 보조자료로 활용한다.',source:'처리요령 p27'},
  {id:'no-overflow',title:'영역 간 내용 넘겨쓰기 금지',text:'입력 글자 수 초과를 이유로 한 영역의 내용을 다른 영역에 옮겨 적지 않는다.',source:'처리요령 p28'},
  {id:'language',title:'한글 중심 입력',text:'학교생활기록부 문자는 한글을 원칙으로 하고 숫자는 아라비아 숫자를 사용한다. 영문은 고유명사·일반화된 명사·단위 등 부득이한 경우에만 사용하며 불필요한 외국어·특수문자·문단구분 기호 사용을 피한다.',source:'처리요령 p28·p40'},
  {id:'no-fabrication',title:'관찰되지 않은 사실 생성 금지',text:'관찰 입력에 없는 역할, 수치, 성과, 독서, 논문 활용, 수상, 실험 결과, 기관 참여를 새로 만들어내지 않는다.',source:'2026 기재요령 + AI 활용 유의사항'},
  {id:'blind',title:'고교 블라인드 준수',text:'학교명, 재단명, 학교 축제명, 학교 별칭 등 재학 학교를 특정할 수 있는 내용을 서술형 항목에 넣지 않는다.',source:'학생부 블라인드 평가'},
  {id:'prohibited',title:'기재금지 항목 배제',text:'공인어학시험, 교내·외 대회 참여·성적·수상, 교외상, 인증시험, 모의고사 성적, 논문 등재·발표, 도서출간, 지식재산권 출원·등록, 해외 활동실적, 부모·친인척의 사회경제적 지위, 장학생·장학금, 구체적 대학명·기관명·상호명·강사명, 자격증 명칭·취득, K-MOOC·MOOC·KOCW, 방과후학교 활동 등 기재금지 사항을 생성하지 않는다.',source:'2026 세특 입력불가 항목 p118·p149'}
];

const CATEGORY_RULES={
  '교과세특':[
    {id:'achievement',title:'성취기준·성취수준 기반',text:'과목의 성취기준과 성취수준에 근거하여 학생 개인의 성취과정과 성취특성이 명료하게 드러나도록 쓴다.',source:'교과학습발달상황 p95·p126'},
    {id:'no-list',title:'활동 나열·지식 재진술 지양',text:'수업에서 한 활동을 단순 나열하거나 이미 성취수준에 제시된 지식을 그대로 설명하는 문장으로 채우지 않는다.',source:'교과학습발달상황 p95·p126'},
    {id:'observed-class',title:'학생참여형 수업 관찰 중심',text:'학생참여형 수업 및 수업과 연계된 수행평가에서 관찰한 학습활동 참여도, 자기주도적 학습에 따른 변화와 성장 정도를 중심으로 기록한다.',source:'교과학습발달상황 p117·p147'},
    {id:'research',title:'연구보고서 실적 과장 금지',text:'자율탐구 산출물의 제목·연구주제·참여인원·소요시간을 실적처럼 나열하지 않는다. 정규교육과정에서 허용되는 경우에도 학생의 자료수집·분석·문제 연결 등 관찰 가능한 특성을 중심으로 기록한다.',source:'교과학습발달상황 p118·p149'}
  ],
  '자율활동':[
    {id:'creative-common',title:'구체적 사실·태도·성장',text:'교사가 상시 관찰·평가한 구체적인 활동 사실, 활동 태도, 노력에 의한 행동 변화와 성장을 종합해 학생의 개별적 특성이 드러나게 쓴다.',source:'창의적 체험활동 p79·p82'},
    {id:'creative-no-list',title:'단순 실적 나열 지양',text:'개별적 특성이 드러나지 않는 활동실적의 단순 나열을 피한다.',source:'창의적 체험활동 p82'},
    {id:'autonomous-inquiry',title:'자율탐구 실적 표기 제한',text:'정규교육과정 안에서 학생주도로 수행한 자율탐구는 학생의 특기사항만 기록하고 제목·연구주제·참여인원·소요시간을 실적처럼 기재하지 않는다.',source:'창의적 체험활동 p82'}
  ],
  '동아리활동':[
    {id:'club-real',title:'실제 활동과 역할 위주',text:'자기평가·학생상호평가·교사관찰을 참고하되 실제적인 활동과 역할, 참여도, 협력도, 열성도, 특별한 활동실적 중 관찰된 내용을 중심으로 쓴다.',source:'동아리활동 p83'},
    {id:'club-no-invent',title:'동아리 역할 창작 금지',text:'입력에 없는 직책·담당 역할·성과를 만들어내지 않는다.',source:'동아리활동 p83'}
  ],
  '진로활동':[
    {id:'career-real',title:'실제 활동·역할 중심',text:'학생의 특기·진로와 관련된 자질, 실제 노력과 활동, 활동 결과, 참여도, 활동 의욕, 태도의 변화, 상담·관찰·평가 근거를 종합하여 실제적인 활동과 역할 위주로 쓴다.',source:'진로활동 p85'},
    {id:'career-no-invent',title:'진로성과 과장 금지',text:'희망 진로를 근거로 학생이 하지 않은 심화탐구·독서·대외활동·전공 성과를 생성하지 않는다.',source:'진로활동 p85 + AI 활용 유의사항'}
  ]
};

const CASE_STRUCTURE={
  title:'좋은 기재 사례 구조',
  text:'가능한 경우 ① 구체성이 드러나는 수업 사실 → ② 지적 호기심·동기 → ③ 실제 탐구 활동 → ④ 성장·평가의 흐름으로 서술하되, 관찰되지 않은 단계는 억지로 채우지 않는다.',
  source:'2026 전달연수 사례 분석 사진'
};

const OPERATION_NOTES=[
  '수행평가에서 AI 도구를 활용할 경우 평가의 공정성·신뢰성을 훼손하지 않도록 AI 금지 행위를 명시하고 학생·학부모에게 사전 안내한다.',
  '온라인 콘텐츠로 과목을 이수한 경우 비고란에 온라인 콘텐츠를 기재하고 세부능력 및 특기사항은 기재하지 않는다.',
  '과목별 세부능력 및 특기사항은 모든 교과(군)의 모든 학생을 대상으로 입력하는 것이 원칙이며, 관찰 내용이 없는 특수한 경우는 기재요령의 절차를 따른다.',
  '2026학년도 1·2학년의 1학기 교과학습발달상황은 당해 학년 8월 31일까지 입력한다.',
  '도서명·저자명 자체에 포함된 대학명·상호명·기관명은 2026 추가 규정에 따라 입력 가능한 예외가 있으므로 문맥을 확인한다.'
];

const LOCAL_POLICY={
  title:'포항고 2026 학교 운영 참고',
  items:[
    '1·2학년 창의적 체험활동 누가기록은 원칙적으로 기재하지 않고, 3학년은 기존 기록과의 통일성을 위해 이전과 같이 운영.',
    '1·2학년 봉사활동과 연계하여 봉사시간이 부여되는 활동은 누가기록 및 이수시간 입력 필요.',
    '행동특성 및 종합의견 누가기록은 나이스를 활용하되 변화와 성장을 관찰하여 교사가 자율적으로 기록하고, 부정적 행동특성은 구체적으로 드러나도록 누가기록 권장.'
  ]
};

window.__V24_OFFICIAL_2026={OFFICIAL_COMMON,CATEGORY_RULES,CASE_STRUCTURE,OPERATION_NOTES,LOCAL_POLICY,SOURCE_LABELS};

function toast(msg,type='info'){ if(typeof window.showToast==='function') window.showToast(msg,type); else console.log(msg); }
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function currentCategory(){return window.activeCategory||'교과세특';}
function subjectFamily(s){s=String(s||'').replace(/\s+/g,'');if(/한국사|세계사|동아시아사|역사/.test(s))return'history';if(/국어|문학|독서|작문|화법|언어|매체/.test(s))return'korean';if(/영어/.test(s))return'english';if(/수학|미적분|대수|기하|확률|통계/.test(s))return'math';if(/물리|화학|생명|지구|과학/.test(s))return'science';if(/정보|컴퓨터|소프트웨어|공학|인공지능/.test(s))return'engineering';if(/사회|경제|정치|법|윤리|지리/.test(s))return'social';if(/미술|음악|체육|예술|연극|영화/.test(s))return'arts';if(/교육/.test(s))return'education';return'common';}
function officialRules(category=currentCategory()){
  const arr=[...OFFICIAL_COMMON];
  if(CATEGORY_RULES[category])arr.push(...CATEGORY_RULES[category]);
  arr.push(CASE_STRUCTURE);
  return arr;
}
function officialRulesText(category){return officialRules(category).map((r,i)=>`${i+1}) ${r.title}: ${r.text}`).join('\n');}
window.getOfficial2026Rules=officialRules;

function loadReviewState(){try{return JSON.parse(localStorage.getItem(V24_KEY)||'{}')||{};}catch(e){return{};}}
function saveReviewState(s){try{localStorage.setItem(V24_KEY,JSON.stringify(s));}catch(e){} window.__officialReviewState=s;}
window.__officialReviewState=loadReviewState();
function markDraft(source='AI 생성'){
  const s={...(window.__officialReviewState||{}),needsReview:true,reviewed:false,source,updatedAt:Date.now(),reviewedText:''};
  saveReviewState(s);updateDraftBanner();
}
function markReviewed(){
  const text=window.getCurrentText?.()||'';
  const s={...(window.__officialReviewState||{}),needsReview:false,reviewed:true,reviewedAt:Date.now(),reviewedText:text};
  saveReviewState(s);updateDraftBanner();
}
function updateDraftBanner(){
  const b=document.getElementById('official-ai-draft-banner');if(!b)return;
  const s=window.__officialReviewState||{};
  if(s.needsReview){b.className='no-print mb-2.5 p-2.5 rounded-2xl border border-amber-300 bg-amber-50 flex flex-wrap items-center justify-between gap-2 text-xs';b.innerHTML=`<div><b class="text-amber-950">🛡️ AI/자동생성 초안 · 직접 입력 금지</b><span class="text-amber-800 ml-2">교사 관찰근거·허위/과장·기재금지 항목 확인 후 윤문하세요.</span></div><button type="button" onclick="openOfficial2026Check()" class="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-black">2026 점검</button>`;}
  else if(s.reviewed){b.className='no-print mb-2.5 p-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center justify-between gap-2 text-xs';b.innerHTML=`<div><b class="text-emerald-900">✅ 교사 검토 확인됨</b><span class="text-emerald-700 ml-2">검토 이후 문장이 바뀌면 다시 점검합니다.</span></div><button type="button" onclick="openOfficial2026Check()" class="px-2.5 py-1 border border-emerald-200 bg-white text-emerald-800 rounded-lg font-bold">재점검</button>`;}
  else {b.className='no-print mb-2.5 p-2.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs';b.innerHTML=`<div><b class="text-slate-700">🛡️ 2026 기재요령 보호</b><span class="text-slate-500 ml-2">AI 생성 후 교사 검토 게이트가 자동 활성화됩니다.</span></div><button type="button" onclick="openOfficial2026Check()" class="px-2.5 py-1 bg-white border rounded-lg font-bold">점검</button>`;}
}
window.__markOfficialDraft=markDraft;

const CHECKS=[
  {id:'lang',severity:'hard',title:'공인어학시험·성적·수상',rx:/(TOEIC|TOEFL|TEPS|IELTS|토익|토플|텝스|아이엘츠|공인어학시험)/i,why:'공인어학시험 참여사실·성적·수상은 기재금지'},
  {id:'contest',severity:'review',title:'대회·수상 관련 표현',rx:/(교내\s*대회|교외\s*대회|대회\s*(참가|참여|수상)|수상\s*(실적|경력)|최우수상|우수상|금상|은상|동상)/i,why:'교내·외 대회 참여사실과 성적·수상실적은 세특 등에 기재 불가'},
  {id:'external-award',severity:'hard',title:'교외상',rx:/(표창장|감사장|공로상|교외상)/,why:'교외 기관·단체의 수상은 기재금지'},
  {id:'cert-exam',severity:'hard',title:'인증·자격 시험',rx:/(인증시험|한국사능력검정시험|한능검|컴퓨터활용능력|정보처리기사|자격증\s*(취득|합격)|자격증명)/i,why:'인증시험 및 자격증 명칭·취득 사실은 제한됨'},
  {id:'mock',severity:'hard',title:'모의고사·전국연합 성적',rx:/(모의고사|전국연합학력평가|학력평가|모평|학평).{0,20}(점수|등급|백분위|석차|성적)?/i,why:'모의고사·전국연합학력평가 성적 관련 내용은 기재금지'},
  {id:'paper',severity:'hard',title:'논문 등재·발표 실적',rx:/(논문|학회지).{0,18}(투고|게재|등재|발표)|(학회).{0,15}(발표|논문)/i,why:'논문 투고·등재·학회 발표 사실은 기재금지'},
  {id:'bookpub',severity:'hard',title:'도서 출간 실적',rx:/(도서|책).{0,10}(출간|출판)|출간\s*사실/i,why:'도서출간 사실은 기재금지'},
  {id:'ip',severity:'hard',title:'지식재산권 실적',rx:/(특허|실용신안|상표|디자인).{0,12}(출원|등록)/i,why:'지식재산권 출원·등록 사실은 기재금지'},
  {id:'abroad',severity:'hard',title:'해외 활동실적',rx:/(해외|국외).{0,14}(봉사|어학연수|캠프|활동|대회)/i,why:'해외 활동실적 관련 내용은 기재금지'},
  {id:'parent',severity:'hard',title:'부모·친인척 사회경제적 지위',rx:/(아버지|어머니|부모|부친|모친|친인척).{0,25}(교수|의사|변호사|공무원|교사|대표|사장|직장|직위|직업)/i,why:'부모·친인척의 사회·경제적 지위 암시 내용은 기재금지'},
  {id:'scholarship',severity:'hard',title:'장학생·장학금',rx:/(장학생|장학금)/,why:'장학생·장학금 관련 내용은 기재금지'},
  {id:'univ',severity:'review',title:'구체적인 대학명',rx:/([가-힣A-Za-z]{2,20}(대학교|대학)|서울대|연세대|고려대|성균관대|한양대|포항공대|POSTECH|KAIST)/i,why:'구체적인 특정 대학명은 기재금지. 단, 도서명·저자명에 포함된 기관명 등은 2026 예외 규정을 확인'},
  {id:'institution',severity:'review',title:'기관명·상호명',rx:/(유네스코|OECD|UN|IMF|통계청|국회도서관|구글|네이버|삼성|카카오|유튜브|오픈AI|OpenAI|마이크로소프트|Microsoft)/i,why:'구체적인 기관명·상호명은 원칙적으로 기재금지. 교육관련기관 및 도서명·저자명 예외 등 맥락 확인 필요'},
  {id:'lecturer',severity:'hard',title:'강사명',rx:/강사\s*[가-힣]{2,4}(?:\s|님|의|가|이|은|는)/,why:'강사명은 기재금지'},
  {id:'mooc',severity:'hard',title:'온라인 공개강좌',rx:/(K-?MOOC|MOOC|KOCW)/i,why:'K-MOOC·MOOC·KOCW 관련 사항은 세특 입력불가'},
  {id:'after',severity:'hard',title:'방과후학교 활동',rx:/방과후\s*학교|방과후학교/,why:'방과후학교 활동은 세특 입력불가'},
  {id:'schoolblind',severity:'review',title:'학교 식별정보',rx:/(포항고등학교|포항고|[가-힣]{2,12}고등학교|학교\s*축제|재단명|학교\s*별칭)/,why:'학교명·재단명·학교 축제명·학교 별칭 등 고교를 특정할 수 있는 정보는 블라인드 규정 점검 필요'}
];

function officialScan(text){
  text=String(text||'');const out=[];
  for(const c of CHECKS){const m=text.match(c.rx);if(m)out.push({...c,match:m[0]});}
  const latin=(text.match(/[A-Za-z]{4,}/g)||[]).filter(x=>!/^(CEO|PAPS|SNS|PPT|POP|UCC)$/i.test(x));
  if(latin.length>=3)out.push({id:'foreign',severity:'review',title:'영문·외국어 사용 점검',match:[...new Set(latin)].slice(0,6).join(', '),why:'한글 입력 원칙에 따라 부득이한 고유명사·일반화된 명사·단위인지 확인'});
  if(/[①②③④⑤⑥⑦⑧⑨⑩★▶→◆■□●○]/.test(text))out.push({id:'symbols',severity:'review',title:'특수문자·문단기호',match:'특수문자',why:'서술형 항목의 특수문자·문단구분 기호 사용은 지양'});
  return out;
}
window.scanOfficial2026=officialScan;

function officialModalHtml(){
  return `<div id="modal-official-2026" class="hidden fixed inset-0 z-[170] bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6 items-center justify-center no-print"><div class="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"><div class="px-5 py-4 border-b flex items-center justify-between"><div><div class="flex items-center gap-2"><span class="text-xl">🛡️</span><h3 class="font-black text-slate-900">2026 학교생활기록부 공식 규칙팩</h3><span class="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-black">잠금 규칙</span></div><p class="text-[11px] text-slate-500 mt-0.5">교과별 사용자 규칙과 별도로 항상 적용됩니다.</p></div><button onclick="closeOfficial2026Modal()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div><div class="p-4 sm:p-5 overflow-y-auto custom-scrollbar space-y-4"><div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs leading-5"><b class="text-amber-950">핵심:</b> 생성형 AI 문장은 최종 기재문이 아니라 <b>교사 검토용 초안</b>입니다. 교사가 직접 관찰·평가한 근거에 맞춰 허위·과장과 기재금지 사항을 확인한 뒤 윤문해야 합니다.</div><div class="grid md:grid-cols-2 gap-3"><div><h4 class="font-black text-xs mb-2">공통 공식 규칙</h4><div class="space-y-2">${OFFICIAL_COMMON.map(r=>`<div class="p-2.5 border rounded-xl"><b class="text-[11px]">🔒 ${esc(r.title)}</b><p class="text-[10px] text-slate-600 mt-1 leading-4">${esc(r.text)}</p><span class="text-[9px] text-indigo-600">${esc(r.source)}</span></div>`).join('')}</div></div><div><h4 class="font-black text-xs mb-2">현재 영역: <span id="official-current-category">${esc(currentCategory())}</span></h4><div id="official-category-rules" class="space-y-2"></div><div class="mt-3 p-3 border border-cyan-200 bg-cyan-50 rounded-xl"><b class="text-xs text-cyan-950">📌 사례 분석 구조</b><p class="text-[10px] text-cyan-900 mt-1 leading-4">${esc(CASE_STRUCTURE.text)}</p></div><div class="mt-3 p-3 border border-violet-200 bg-violet-50 rounded-xl"><b class="text-xs text-violet-950">🗂️ 운영 참고</b><ul class="mt-1 text-[10px] text-violet-900 leading-4 list-disc pl-4">${OPERATION_NOTES.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="mt-3 p-3 border border-slate-200 rounded-xl"><b class="text-xs">🏫 ${esc(LOCAL_POLICY.title)}</b><ul class="mt-1 text-[10px] text-slate-600 leading-4 list-disc pl-4">${LOCAL_POLICY.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="text-[9px] text-slate-400 mt-1">학교 운영 참고사항이며 세특 생성문에 직접 삽입하지 않습니다.</p></div></div></div><div class="p-3 bg-slate-50 rounded-xl border"><b class="text-[10px] text-slate-700">반영 자료</b><div class="mt-1 text-[9px] text-slate-500 leading-4">${SOURCE_LABELS.map(x=>'• '+esc(x)).join('<br>')}</div></div></div><div class="px-5 py-3 border-t flex justify-end"><button onclick="openOfficial2026Check()" class="mr-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">현재 문장 점검</button><button onclick="closeOfficial2026Modal()" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">닫기</button></div></div></div>`;
}
function reviewModalHtml(){
 return `<div id="modal-official-check" class="hidden fixed inset-0 z-[180] bg-slate-950/65 backdrop-blur-sm p-3 items-center justify-center no-print"><div class="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"><div class="p-4 border-b flex justify-between items-center"><div><h3 class="font-black">🛡️ 2026 기재요령 최종 점검</h3><p class="text-[10px] text-slate-500">AI 초안 직접입력 방지 · 기재금지 · 관찰근거 확인</p></div><button onclick="closeOfficial2026Check()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div><div class="p-4 overflow-y-auto custom-scrollbar"><div id="official-check-findings"></div><div class="mt-4 p-3 rounded-2xl bg-slate-50 border space-y-2 text-xs"><label class="flex gap-2"><input type="checkbox" class="official-review-box"><span>교사가 직접 관찰·평가한 내용과 허용된 보조자료에 근거했는지 확인함.</span></label><label class="flex gap-2"><input type="checkbox" class="official-review-box"><span>학생이 실제 수행하지 않은 역할·수치·성과·독서·논문·기관 참여가 없는지 확인함.</span></label><label class="flex gap-2"><input type="checkbox" class="official-review-box"><span>기재금지 항목과 고교 블라인드 식별정보를 확인함.</span></label><label class="flex gap-2"><input type="checkbox" class="official-review-box"><span>AI 생성 문장을 그대로 쓰지 않고 교사가 문장과 의미를 직접 검토·윤문함.</span></label></div></div><div class="p-4 border-t flex items-center justify-between gap-2"><span class="text-[10px] text-slate-500">모든 확인란을 체크하면 ‘교사 검토 완료’로 표시됩니다.</span><div class="flex gap-2"><button onclick="runOfficial2026Audit()" class="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold">다시 검사</button><button onclick="confirmOfficialTeacherReview()" class="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black">교사 검토 완료</button></div></div></div></div>`;
}
window.openOfficial2026Modal=function(){const m=document.getElementById('modal-official-2026');m?.classList.remove('hidden');m?.classList.add('flex');renderOfficialCategoryRules();};
window.closeOfficial2026Modal=function(){const m=document.getElementById('modal-official-2026');m?.classList.add('hidden');m?.classList.remove('flex');};
window.openOfficial2026Check=function(){const m=document.getElementById('modal-official-check');m?.classList.remove('hidden');m?.classList.add('flex');document.querySelectorAll('.official-review-box').forEach(x=>x.checked=false);runOfficial2026Audit();};
window.closeOfficial2026Check=function(){const m=document.getElementById('modal-official-check');m?.classList.add('hidden');m?.classList.remove('flex');};
function renderOfficialCategoryRules(){const cat=currentCategory();const t=document.getElementById('official-current-category');if(t)t.textContent=cat;const c=document.getElementById('official-category-rules');if(c)c.innerHTML=(CATEGORY_RULES[cat]||[]).map(r=>`<div class="p-2.5 border rounded-xl"><b class="text-[11px]">🔒 ${esc(r.title)}</b><p class="text-[10px] text-slate-600 mt-1 leading-4">${esc(r.text)}</p><span class="text-[9px] text-indigo-600">${esc(r.source)}</span></div>`).join('')||'<div class="text-[10px] text-slate-400">공통 규칙이 적용됩니다.</div>';}
window.runOfficial2026Audit=function(){const text=window.getCurrentText?.()||'';let findings=officialScan(text);const bytes=window.calculateNeisBytes?.(text)||0;const limit=window.BYTE_LIMITS?.[currentCategory()]?.[window.activeSemester||'s1']||1500;if(bytes>limit)findings=[{id:'byte-limit',severity:'hard',title:'입력 가능 최대 분량 초과',match:`${bytes}/${limit} Byte`,why:'입력 가능한 최대 글자 수를 넘지 않는 범위에서 작성해야 합니다.'},...findings];const c=document.getElementById('official-check-findings');if(!c)return findings;const hard=findings.filter(x=>x.severity==='hard'),review=findings.filter(x=>x.severity!=='hard');c.innerHTML=`<div class="grid grid-cols-3 gap-2 text-center mb-3"><div class="p-2 rounded-xl ${bytes>limit?'bg-rose-50 border border-rose-200':'bg-slate-50 border'}"><b class="text-lg">${bytes}/${limit}</b><div class="text-[9px] text-slate-500">NEIS Byte</div></div><div class="p-2 rounded-xl ${hard.length?'bg-rose-50 border border-rose-200':'bg-emerald-50 border border-emerald-200'}"><b class="text-lg">${hard.length}</b><div class="text-[9px]">기재금지 위험</div></div><div class="p-2 rounded-xl ${review.length?'bg-amber-50 border border-amber-200':'bg-emerald-50 border border-emerald-200'}"><b class="text-lg">${review.length}</b><div class="text-[9px]">검토 필요</div></div></div>${findings.length?findings.map(x=>`<div class="mb-2 p-2.5 rounded-xl border ${x.severity==='hard'?'bg-rose-50 border-rose-200':'bg-amber-50 border-amber-200'}"><div class="flex justify-between gap-2"><b class="text-xs ${x.severity==='hard'?'text-rose-900':'text-amber-900'}">${x.severity==='hard'?'⛔':'⚠️'} ${esc(x.title)}</b><code class="text-[9px] bg-white/70 px-1.5 rounded">${esc(x.match||'')}</code></div><p class="text-[10px] mt-1 leading-4">${esc(x.why)}</p></div>`).join(''):'<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">✅ 로컬 규정 검사에서 즉시 확인되는 기재금지 표현은 발견되지 않았습니다. 최종 사실 확인은 교사가 수행해야 합니다.</div>'}`;return findings;};
window.confirmOfficialTeacherReview=function(){const all=[...document.querySelectorAll('.official-review-box')];if(!all.length||all.some(x=>!x.checked))return toast('4개 교사 검토 확인란을 모두 체크하세요.','warning');markReviewed();window.closeOfficial2026Check();toast('교사 검토 완료로 표시했습니다.','success');};

function evidenceTypeLabel(){return document.getElementById('official-evidence-type')?.value||'교사 직접 관찰';}
function evidenceUiHtml(){return `<div id="official-evidence-row" class="grid grid-cols-[auto_1fr] gap-2 items-center"><span class="text-[10px] font-black text-slate-500">근거 유형</span><select id="official-evidence-type" class="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[10px]"><option>교사 직접 관찰</option><option>수업산출물</option><option>수행평가 결과물</option><option>자기평가서</option><option>동료평가서</option><option>소감문</option><option>독후감</option></select></div>`;}

// --- Knowledge Vault v2.4: content vs official-guidance separation ---
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(DB_DOCS))db.createObjectStore(DB_DOCS,{keyPath:'id'});if(!db.objectStoreNames.contains(DB_CHUNKS)){const s=db.createObjectStore(DB_CHUNKS,{keyPath:'id'});s.createIndex('docId','docId',{unique:false});}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function dbAll(store){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
async function dbPut(store,obj){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(obj);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}
async function dbDeleteDoc(id){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction([DB_DOCS,DB_CHUNKS],'readwrite');tx.objectStore(DB_DOCS).delete(id);const idx=tx.objectStore(DB_CHUNKS).index('docId');const req=idx.openCursor(IDBKeyRange.only(id));req.onsuccess=e=>{const c=e.target.result;if(c){c.delete();c.continue();}};tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}
function parseRange(s,max){s=String(s||'').trim().toLowerCase();if(!s||s==='all'||s==='전체')return[1,max];const m=s.match(/^(\d+)\s*-\s*(\d+)$/);if(m)return[Math.max(1,+m[1]),Math.min(max,+m[2])];const n=+s;if(n)return[Math.min(n,max),Math.min(n,max)];return[1,Math.min(max,40)];}
function splitText(text,max=2800){const out=[];let s=String(text||'').trim();while(s.length>max){let k=s.lastIndexOf(' ',max);if(k<max*.6)k=max;out.push(s.slice(0,k));s=s.slice(k).trim();}if(s)out.push(s);return out;}
function tok(s){return [...new Set(String(s||'').toLowerCase().split(/[^가-힣a-z0-9]+/).filter(x=>x.length>=2))];}
function detectDocKind(name,selected){if(selected&&selected!=='auto')return selected;return /(학교생활기록부|기재요령|전달연수|학생부.*연수|생활기록부.*연수)/.test(String(name||''))?'official':'content';}
async function pageText(pdf,n,useOcr){const page=await pdf.getPage(n);const content=await page.getTextContent();let text=content.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();if(text.length>40||!useOcr)return text;if(!window.Tesseract)return text;const vp=page.getViewport({scale:1.4}),canvas=document.createElement('canvas');canvas.width=vp.width;canvas.height=vp.height;await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;const out=await Tesseract.recognize(canvas,'kor+eng',{logger:()=>{}});return String(out.data?.text||'').replace(/\s+/g,' ').trim();}
async function ocrImageBuffer(buf,mime='image/jpeg'){if(!window.Tesseract)throw new Error('스캔 이미지 OCR 모듈(Tesseract)을 불러오지 못했습니다.');const blob=new Blob([buf],{type:mime});const url=URL.createObjectURL(blob);try{const out=await Tesseract.recognize(url,'kor+eng',{logger:()=>{}});return String(out.data?.text||'').replace(/\s+/g,' ').trim();}finally{URL.revokeObjectURL(url);}}
function isJpeg(u){return u[0]===0xff&&u[1]===0xd8&&u[2]===0xff;}function isPng(u){return u[0]===0x89&&u[1]===0x50&&u[2]===0x4e&&u[3]===0x47;}
window.ingestKnowledgePdfs=async function(ev){const files=[...(ev.target.files||[])];if(!files.length)return;const status=document.getElementById('knowledge-ingest-status');const rangeText=document.getElementById('knowledge-page-range')?.value||'1-40';const useOcr=!!document.getElementById('knowledge-use-ocr')?.checked;const kindSel=document.getElementById('knowledge-doc-kind')?.value||'auto';for(const f of files){const id='d'+Date.now()+Math.random().toString(36).slice(2,7);const kind=detectDocKind(f.name,kindSel);try{if(status)status.textContent=`${f.name} 읽는 중…`;const ab=await f.arrayBuffer();const u=new Uint8Array(ab);let chunkCount=0,pages=1,a=1,b=1;if(isJpeg(u)||isPng(u)){if(status)status.textContent=`${f.name} · 이미지형 파일 OCR 중`;const text=await ocrImageBuffer(ab,isPng(u)?'image/png':'image/jpeg');for(const [j,ch] of splitText(text).entries()){await dbPut(DB_CHUNKS,{id:`${id}:1:${j}`,docId:id,source:f.name,page:1,text:ch,kind});chunkCount++;}}else{if(!window.pdfjsLib)throw new Error('PDF.js를 불러오지 못했습니다.');const pdf=await pdfjsLib.getDocument({data:u}).promise;pages=pdf.numPages;[a,b]=parseRange(rangeText,pdf.numPages);for(let n=a;n<=b;n++){if(status)status.textContent=`${f.name} · ${n}/${b}쪽 색인 중`;const text=await pageText(pdf,n,useOcr);if(!text)continue;for(const [j,ch] of splitText(text).entries()){await dbPut(DB_CHUNKS,{id:`${id}:${n}:${j}`,docId:id,source:f.name,page:n,text:ch,kind});chunkCount++;}}}await dbPut(DB_DOCS,{id,name:f.name,size:f.size,pages,indexedFrom:a,indexedTo:b,createdAt:Date.now(),ocr:useOcr||isJpeg(u)||isPng(u),chunkCount,kind});toast(`${f.name}: ${kind==='official'?'규정문서':'교과지식'}로 색인 완료 (${chunkCount}청크)`,'success');}catch(e){toast(`${f.name} 색인 실패: ${e.message}`,'warning');}}ev.target.value='';if(status)status.textContent='색인 완료';await renderKnowledgeDocsV24();};
window.deleteKnowledgeDoc=async function(id){await dbDeleteDoc(id);await renderKnowledgeDocsV24();toast('PDF 지식을 삭제했습니다.','success');};
async function renderKnowledgeDocsV24(){const docs=await dbAll(DB_DOCS);const c=document.getElementById('knowledge-doc-list');const ct=document.getElementById('knowledge-doc-count');if(ct)ct.textContent=docs.length;if(!c)return;c.innerHTML=docs.length?docs.sort((a,b)=>b.createdAt-a.createdAt).map(d=>{const kind=d.kind||detectDocKind(d.name,'auto');return `<div class="p-2.5 border rounded-xl flex items-center justify-between gap-2"><div class="min-w-0"><div class="flex items-center gap-1"><b class="text-[11px] block truncate">📄 ${esc(d.name)}</b><span class="text-[8px] px-1 rounded ${kind==='official'?'bg-rose-50 text-rose-700':'bg-indigo-50 text-indigo-700'}">${kind==='official'?'규정':'교과지식'}</span></div><span class="text-[9px] text-slate-500">${d.indexedFrom||1}~${d.indexedTo||d.pages}쪽 · ${d.chunkCount||0}청크${d.ocr?' · OCR':''}</span></div><button onclick="deleteKnowledgeDoc('${d.id}')" class="text-[10px] text-rose-500">삭제</button></div>`;}).join(''):'<div class="p-3 text-center text-[11px] text-slate-400">첨부한 PDF 지식이 없습니다.</div>';}
async function searchKnowledgeV24(query,limit=7,mode='content'){const [chunks,docs]=await Promise.all([dbAll(DB_CHUNKS),dbAll(DB_DOCS)]);const map=new Map(docs.map(d=>[d.id,d.kind||detectDocKind(d.name,'auto')]));const q=tok(query);if(!q.length)return[];return chunks.map(c=>{const kind=c.kind||map.get(c.docId)||detectDocKind(c.source,'auto');if(mode==='content'&&kind==='official')return null;if(mode==='official'&&kind!=='official')return null;const t=String(c.text||'').toLowerCase();let score=0;for(const w of q){let pos=0,n=0;while((pos=t.indexOf(w,pos))>=0&&n<6){score+=w.length>=4?4:2;pos+=w.length;n++;}if(String(c.source||'').toLowerCase().includes(w))score+=3;}return score>0?{...c,kind,score}:null;}).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,limit);}
function contextsText(arr,max=9000){let total=0,out=[];for(const c of arr){const entry=`[출처: ${c.source} p.${c.page}]\n${c.text}`;if(total+entry.length>max)break;out.push(entry);total+=entry.length;}return out.join('\n\n');}
async function buildKnowledgeContext(msg,career){const use=document.getElementById('knowledge-use-in-seoteuk');if(use&&!use.checked)return'';try{const hits=await searchKnowledgeV24(`${window.activeSubject||''} ${career||''} ${msg}`,5,'content');if(!hits.length)return'';return `\n\n[PDF 교과 참고지식 — 규정문서는 제외됨 / 학생의 실제 수행 사실이 아님]\n${contextsText(hits,6500)}\n[중요] 위 지식에 있는 도서명·수치·사례를 학생이 실제 읽거나 수행했다고 쓰지 말 것. 관찰 입력과 명시적으로 연결된 개념만 표현 보조에 사용할 것.`;}catch(e){return'';}}
window.generateKnowledgeFromVault=async function(){const q=document.getElementById('knowledge-query')?.value.trim();if(!q)return toast('지식 생성 질문을 입력하세요.','warning');const mode=document.getElementById('knowledge-query-mode')?.value||'content';const result=document.getElementById('knowledge-result');if(result){result.classList.remove('hidden');result.textContent='PDF 지식 검색 및 생성 중…';}const query=`${window.activeSubject||''} ${document.getElementById('coord-major')?.value||''} ${q}`;let hits=[];try{hits=await searchKnowledgeV24(query,mode==='all'?10:8,mode);}catch(e){if(result)result.textContent='브라우저의 로컬 지식 저장소를 사용할 수 없습니다.';return;}if(!hits.length){if(result)result.textContent='관련 지식 청크를 찾지 못했습니다. PDF를 먼저 첨부하거나 검색어/모드를 바꿔보세요.';return;}const context=contextsText(hits);let prompt;if(mode==='official'){prompt=`다음 2026 학교생활기록부 관련 PDF 조각만 근거로 질문에 답한다. 질문: ${q}.\n규칙: 제공된 자료에 없는 내용을 일반 지식으로 채우지 않는다. 적용 가능한 규칙, 금지/허용 여부, 예외, 교사가 확인할 사항을 구분하고 각 항목 끝에 제공된 파일명과 쪽을 적는다.\n\n자료:\n${context}`;}else{prompt=`다음 PDF 지식 조각만 근거로 고등학교 ${window.activeSubject||'교과'}의 탐구 아이디어를 생성한다. 질문: ${q}. 목표 전공: ${document.getElementById('coord-major')?.value||'미입력'}.\n규칙: 1) PDF에 없는 책·논문·수치·사실을 만들어내지 않는다. 2) 학생이 이미 수행했다고 쓰지 않는다. 3) 5개의 아이디어를 [탐구 질문 / 교과 연결 / 가능한 활동 / 산출물 / 세특에서 관찰할 포인트 / 출처] 순으로 제시한다. 4) 규정문서가 섞여 있으면 탐구 내용의 사실근거가 아니라 준수 규칙으로만 취급한다.\n\nPDF 지식:\n${context}`;}try{const txt=await window.__requestAI(prompt);if(result)result.textContent=txt;const src=document.getElementById('knowledge-result-sources');if(src)src.innerHTML=hits.map(h=>`<span class="inline-block text-[9px] px-1.5 py-0.5 rounded ${h.kind==='official'?'bg-rose-50 text-rose-700 border-rose-200':'bg-indigo-50 text-indigo-700 border-indigo-200'} border mr-1 mb-1">${esc(h.source)} p.${h.page}</span>`).join('');}catch(e){if(result)result.textContent=`지식 생성 실패: ${e.message}`;}};
window.__searchKnowledgeV24=searchKnowledgeV24;

function activeSoftRules(subject,career){try{return window.getActiveSeoteukRules?.(subject,career)||[];}catch(e){return[];}}
function rulesText(arr){return arr.map((r,i)=>`${i+1}) ${r.title}: ${r.text}`).join('\n');}
function badDomainRx(fam){if(['history','korean','social','arts','education'].includes(fam))return/(실험\s*변인|센서|측정\s*데이터|정량적\s*오차|테일러\s*급수|수치\s*시뮬레이션)/;return null;}

window.sendChatMessage=async function(){
  const input=document.getElementById('input-chat');const msg=input?.value.trim();if(!msg)return;
  const career=document.getElementById('input-career')?.value.trim()||'희망 전공';
  const subject=window.activeSubject||'교과';const fam=subjectFamily(subject);const cat=currentCategory();const evidence=evidenceTypeLabel();
  window.__lastObservationV3=msg;window.appendChatMessage?.('user',msg);input.value='';
  const soft=activeSoftRules(subject,career);const kctx=await buildKnowledgeContext(msg,career);
  const prompt=`고등학교 교사가 학교생활기록부 ${cat}의 교사 검토용 초안을 작성한다.\n과목/영역: ${subject}\n희망 진로: ${career}\n주 근거 유형: ${evidence}\n실제로 관찰·확인된 내용: ${msg}\n\n[2026 공식 잠금 규칙]\n${officialRulesText(cat)}\n\n[교과별 사전 규칙]\n${rulesText(soft)}${kctx}\n\n[작성 지시]\n- 이것은 AI 초안이며 최종 기재문이 아니다.\n- 교사가 직접 관찰·평가한 근거와 입력된 허용 보조자료 범위에서만 작성한다.\n- 관찰되지 않은 역할·성과·수치·독서·논문 활용·기관 참여를 창작하지 않는다.\n- 단순 활동 나열보다 개인의 성취과정·특성과 행동-사고-변화가 드러나게 한다.\n- 가능하면 구체적 사실→지적 호기심/동기→실제 탐구 행동→성장·평가 흐름을 사용하되 없는 단계는 만들지 않는다.\n- 1,500바이트 이내의 자연스러운 개조식 종결형으로 결과 본문만 출력한다.`;
  try{
    let txt=await window.__requestAI(prompt);const bad=badDomainRx(fam);
    if(bad&&bad.test(txt)&&!bad.test(msg)){txt=await window.__requestAI(`다음 ${subject} ${cat} 초안에 관찰 근거에 없는 다른 교과의 실험·측정 문법이 섞였다. 새로운 사실을 추가하지 말고 제거하여 다시 작성한다.\n2026 공식 규칙:\n${officialRulesText(cat)}\n실제 관찰:${msg}\n초안:${txt}`);}
    window.appendChatMessage?.('assistant',txt);window.setCurrentText?.(txt);const ta=document.getElementById('seoteuk-textarea');if(ta)ta.value=txt;window.updateNeisStats?.();markDraft(window.currentProvider==='antigravity'?'Antigravity DEV':'AI 생성');window.auditEvidenceLocal?.();
  }catch(e){if(window.currentProvider==='antigravity'){window.appendChatMessage?.('assistant',`⚠️ Antigravity DEV 생성 실패: ${e.message}\n실제 AG 연결 확인을 위해 로컬 더미 문장으로 대체하지 않습니다.`);toast('Antigravity 생성 실패 — AG 문장 테스트를 확인하세요.','warning');return;}window.appendChatMessage?.('assistant',`생성 연결 실패: ${e.message}`);toast('생성 연결을 확인하세요.','warning');}
};

window.startBulkBatchProcess=async function(){if(!window.bulkStudents?.length)return toast('먼저 엑셀을 업로드하세요.','warning');const btn=document.getElementById('btn-start-bulk');if(btn){btn.disabled=true;btn.textContent='2026 규칙 적용 생성 중…';}const subject=document.getElementById('bulk-subject')?.value.trim()||window.activeSubject;const cat=document.getElementById('bulk-category')?.value||'교과세특';for(let i=0;i<window.bulkStudents.length;i++){const s=window.bulkStudents[i];if(!s.observation){s.result='';continue;}const soft=activeSoftRules(subject,s.career||'');const kctx=await buildKnowledgeContext(s.observation,s.career||'');const prompt=`고등학교 ${cat} 교사 검토용 초안을 작성한다. 과목/영역: ${subject}. 실제 관찰 기록: ${s.observation}. 희망 진로: ${s.career||'미입력'}.\n\n[2026 공식 잠금 규칙]\n${officialRulesText(cat)}\n\n[교과별 규칙]\n${rulesText(soft)}${kctx}\n\n관찰에 없는 사실·수치·독서·성과·기관 참여를 만들지 말고, 단순 활동 나열을 피하며 개인의 성취과정과 특성이 드러나게 1,500바이트 이내 개조식 본문만 출력한다.`;try{s.result=await window.__requestAI(prompt);}catch(e){s.result=`[생성 실패] ${e.message}`;}window.selectedBulkIndex=i;const list=document.getElementById('bulk-student-list');if(list){/* v23 렌더 함수가 내부 스코프이므로 간단 재렌더 */list.innerHTML=window.bulkStudents.map((x,j)=>`<button type="button" onclick="window.selectedBulkIndex=${j};document.getElementById('bulk-detail-textarea').value=window.bulkStudents[${j}].result||'';document.getElementById('detail-student-header').textContent=window.bulkStudents[${j}].no+' '+window.bulkStudents[${j}].name;" class="w-full text-left p-2.5 text-xs hover:bg-blue-50 ${j===i?'bg-blue-50 text-blue-900':'text-slate-700'}"><div class="font-black">${esc(x.no)} · ${esc(x.name)}</div><div class="text-[10px] text-slate-500 mt-0.5 truncate">${esc(x.result||x.observation||'기록 없음')}</div></button>`).join('');}}
  if(btn){btn.disabled=false;btn.textContent='🚀 일괄 생성';}toast('2026 공식 규칙 + 교과별 규칙을 적용한 일괄 생성을 완료했습니다.','success');};

// 2026-compliant quality diagnosis: no arbitrary admission scores or forced quantitative data
window.runStrictOfficerDiagnosis=function(){
  const text=window.getCurrentText?.()||'';
  const body=document.getElementById('strict-diagnosis-body');
  if(!body)return;
  if(!text.trim()){toast('진단할 본문이 없습니다.','warning');return;}
  const issues=[];const obs=window.__lastObservationV3||'';const cat=currentCategory();
  const findings=officialScan(text);
  if(findings.length)issues.push({level:'risk',title:`기재요령 점검 ${findings.length}건`,desc:findings.map(x=>`${x.title}: ${x.match||''}`).join(' / ')});
  if(/(매우\s*탁월|탁월함|완벽|압도적|최고|전문가\s*수준|증명함)/.test(text))issues.push({level:'risk',title:'과장 가능 표현',desc:'최상급·단정 표현을 실제 관찰 가능한 행동과 근거 중심 문장으로 바꾸는 것이 안전합니다.'});
  const verbs=(text.match(/(질문|확인|비교|분석|검토|설명|토론|수정|구성|작성|발표|제안|참여|탐구|적용|해석|조율|피드백)/g)||[]).length;
  if(cat==='교과세특'&&verbs<2)issues.push({level:'review',title:'성취과정이 잘 드러나지 않음',desc:'수업에서 실제로 관찰한 학생의 질문, 자료 활용, 비교·분석, 설명, 수정 등 구체적 행동을 확인해 보세요.'});
  if(obs&&text.length>80){const ot=tok(obs),tt=tok(text);const overlap=tt.filter(x=>ot.includes(x)).length;if(overlap<2)issues.push({level:'review',title:'관찰 입력과의 연결 약함',desc:'생성문이 실제 관찰기록에서 멀어진 부분이 없는지 확인하세요.'});}
  if(/(?:첫째|둘째|셋째|1\.|2\.|3\.)/.test(text)||((text.match(/참여함/g)||[]).length>=3))issues.push({level:'review',title:'활동 나열 가능성',desc:'활동 이름을 나열하기보다 학생 개인의 성취과정과 성취특성이 드러나게 다듬으세요.'});
  if(!issues.length)body.innerHTML='<div class="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl font-bold">✅ 로컬 진단에서 즉시 확인되는 기재금지·과장·단순나열 위험은 발견되지 않았습니다. 최종 사실 확인과 문장 윤문은 교사가 수행합니다.</div>';
  else body.innerHTML=issues.map(x=>`<div class="p-3 ${x.level==='risk'?'bg-rose-50 border-rose-200':'bg-amber-50 border-amber-200'} border rounded-xl space-y-1"><b class="${x.level==='risk'?'text-rose-900':'text-amber-900'} block font-black">${x.level==='risk'?'⛔':'⚠️'} ${esc(x.title)}</b><p class="text-[11px] leading-relaxed">${esc(x.desc)}</p></div>`).join('');
  document.getElementById('modal-strict-diagnosis')?.classList.remove('hidden');
};

// Report percentages are internal keyword-distribution aids, not official admission weights.
const _oldOpenReport=window.openComprehensiveReportModal;
window.openComprehensiveReportModal=function(){
  _oldOpenReport?.();
  const getPct=id=>{const t=document.getElementById(id)?.textContent||'0%';return /^\d+%$/.test(t.trim())?t.trim():'0%';};
  const a=getPct('badge-eval'),b=getPct('badge-achv'),c=getPct('badge-comp');
  const vals=[['report-score-academic','bar-report-academic',a],['report-score-career','bar-report-career',b],['report-score-community','bar-report-community',c]];
  vals.forEach(([sid,bid,v])=>{const s=document.getElementById(sid),bar=document.getElementById(bid);if(s)s.textContent=v;if(bar)bar.style.width=v;});
  const paper=document.getElementById('printable-report-paper');if(paper&&!document.getElementById('report-heuristic-note')){const n=document.createElement('div');n.id='report-heuristic-note';n.className='no-print text-[9px] text-slate-500 bg-slate-50 border rounded-lg p-2';n.textContent='※ 학업·진로·공동체의 백분율은 문장 내 키워드 분포를 보여주는 앱 내부 참고지표이며, 교육부 또는 대학의 공식 평가비율이 아닙니다.';paper.prepend(n);}
};

// Official prohibition checker replaces old lightweight checker
window.runNeisProhibitionCheck=function(){window.openOfficial2026Check();};

const originalCopy=window.copyCurrentCleanText;
window.copyCurrentCleanText=function(){const s=window.__officialReviewState||{};if(s.needsReview){window.openOfficial2026Check();toast('AI/자동생성 초안은 교사 검토 확인 후 복사할 수 있습니다.','warning');return;}return originalCopy?.();};
const originalExport=window.exportCurrentToTxt;
window.exportCurrentToTxt=function(){const s=window.__officialReviewState||{};if(s.needsReview){window.openOfficial2026Check();toast('교사 검토 확인 후 TXT로 내보낼 수 있습니다.','warning');return;}return originalExport?.();};

// Mark auto-enhancement as draft requiring re-check
for(const fname of ['triggerAIMaxByteFill','injectInquiryChainBuilder','injectQuantitativeDataFix','runGrammarAndEndingFix','stripSubjectPronouns']){
  const fn=window[fname];if(typeof fn==='function'&&!fn.__officialWrapped){const wrapped=function(...args){const r=fn.apply(this,args);markDraft(fname==='runGrammarAndEndingFix'||fname==='stripSubjectPronouns'?'자동 윤문/보정':'자동 생성/보강');return r;};wrapped.__officialWrapped=true;window[fname]=wrapped;}
}

// If reviewed text changes, review becomes stale
const oldHandleInput=window.handleSeoteukInput;
if(typeof oldHandleInput==='function')window.handleSeoteukInput=function(){oldHandleInput();const s=window.__officialReviewState||{};const now=window.getCurrentText?.()||'';if(s.reviewed&&s.reviewedText!==now){s.reviewed=false;s.needsReview=true;s.source='검토 후 문장 수정';saveReviewState(s);updateDraftBanner();}};

function patchKnowledgeUi(){
  const range=document.getElementById('knowledge-page-range');if(range&&!document.getElementById('knowledge-doc-kind')){const wrap=range.parentElement;const sel=document.createElement('select');sel.id='knowledge-doc-kind';sel.className='mt-2 w-full p-2 border rounded-lg text-[10px]';sel.innerHTML='<option value="auto">문서 유형 자동 판별</option><option value="content">교과·탐구 지식</option><option value="official">기재요령·규정 문서</option>';wrap.insertBefore(sel,wrap.querySelector('#knowledge-use-ocr')?.parentElement||null);}
  const q=document.getElementById('knowledge-query');if(q&&!document.getElementById('knowledge-query-mode')){const p=q.parentElement;const sel=document.createElement('select');sel.id='knowledge-query-mode';sel.className='p-2 border rounded-xl text-[10px] bg-white';sel.innerHTML='<option value="content">탐구지식 생성</option><option value="official">기재요령 질문</option><option value="all">전체 지식</option>';p.insertBefore(sel,q);}
  const note=document.getElementById('knowledge-ingest-status');if(note)note.textContent='기재요령 파일명은 자동으로 규정문서로 분리됩니다. 이미지가 PDF 확장자로 저장된 파일도 OCR을 시도합니다.';
}

function patchRuleStudio(){const old=window.openRuleStudio;if(typeof old==='function'&&!old.__v24){const f=function(){old();setTimeout(()=>{const gl=document.getElementById('rule-group-list');if(gl&&!document.getElementById('rule-official-button')){const b=document.createElement('button');b.id='rule-official-button';b.type='button';b.onclick=window.openOfficial2026Modal;b.className='w-full text-left px-3 py-2 mb-2 rounded-xl text-xs font-black bg-rose-50 text-rose-800 border border-rose-200';b.textContent='🔒 2026 공식 기재요령';gl.prepend(b);}},0);};f.__v24=true;window.openRuleStudio=f;}}

function installUi(){
  document.body.insertAdjacentHTML('beforeend',officialModalHtml()+reviewModalHtml());
  const headerQuick=document.querySelector('header > div:last-child');if(headerQuick&&!document.getElementById('btn-official-2026')){const b=document.createElement('button');b.id='btn-official-2026';b.type='button';b.onclick=window.openOfficial2026Modal;b.className='text-xs px-2 sm:px-2.5 py-1.5 rounded-xl font-black border bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';b.innerHTML='🛡️ <span class="hidden sm:inline">2026 규정</span>';headerQuick.insertBefore(b,headerQuick.firstChild);}
  const editor=document.getElementById('tab-content-editor');if(editor&&!document.getElementById('official-ai-draft-banner')){const controls=document.getElementById('subject-selector-container')?.parentElement;const banner=document.createElement('div');banner.id='official-ai-draft-banner';(controls||editor.firstElementChild)?.insertAdjacentElement('afterend',banner);}
  const chatBox=document.getElementById('input-chat')?.parentElement?.parentElement;if(chatBox&&!document.getElementById('official-evidence-row')){chatBox.insertAdjacentHTML('afterbegin',evidenceUiHtml());}
  patchKnowledgeUi();patchRuleStudio();renderKnowledgeDocsV24().catch(()=>{});updateDraftBanner();
  const oldSubject=window.handleSubjectChange;if(typeof oldSubject==='function'&&!oldSubject.__v24){const f=function(name){const r=oldSubject(name);renderOfficialCategoryRules();return r;};f.__v24=true;window.handleSubjectChange=f;}
  const oldCatButtons=window.renderCategoryButtons; // lexical in v23; cannot wrap if not global
  const oldSwitch=window.switchMainTab;if(typeof oldSwitch==='function'&&!oldSwitch.__v24){const f=function(tab){const r=oldSwitch(tab);renderOfficialCategoryRules();return r;};f.__v24=true;window.switchMainTab=f;}
}

window.runV24SelfTest=async function(){const checks=[];const ck=(n,o,d='')=>checks.push({n,o:!!o,d});ck('2026 공식 잠금 규칙',officialRules().length>=8,officialRules().length+'개');ck('AI 검토 게이트',!!document.getElementById('official-ai-draft-banner'));ck('공식 기재금지 검사',typeof window.scanOfficial2026==='function');ck('규정/교과 지식 분리',typeof window.__searchKnowledgeV24==='function');ck('PDF.js',!!window.pdfjsLib);ck('스캔 OCR',!!window.Tesseract);ck('Antigravity DEV 요청 함수',typeof window.__requestAI==='function');try{await openDB();ck('Knowledge IndexedDB',true);}catch(e){ck('Knowledge IndexedDB',false,e.message);}const ok=checks.filter(x=>x.o).length;alert(`Seoteuk Mate v2.4 자가진단 ${ok}/${checks.length}\n\n`+checks.map(x=>`${x.o?'✅':'⚠️'} ${x.n}${x.d?' — '+x.d:''}`).join('\n'));};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installUi,0));else setTimeout(installUi,0);
})();
