/* Seoteuk Mate Local Core v3.9 */
(function(){
'use strict';

var MODEL_DEFAULT='khs-ax7b6k:latest';
var STORE_KEY='seoteukMate.localDrafts.v390';
var BATCH_KEY='seoteukMate.localBatch.v390';

function runtime(){
  return window.SEOTEUK_RUNTIME||{id:'lite',localOnly:false,model:MODEL_DEFAULT,ollamaBase:'http://127.0.0.1:11434'};
}
function model(){return runtime().model||MODEL_DEFAULT;}
function base(){return String(runtime().ollamaBase||'http://127.0.0.1:11434').replace(/\/+$/,'');}
function neisBytes(text){
  var n=0;
  for(const ch of String(text||'')) n+=ch.charCodeAt(0)>127?3:1;
  return n;
}
function clipBytes(text,max){
  max=Math.min(1500,Math.max(300,Number(max)||1500));
  var original=String(text||'').trim();
  if(neisBytes(original)<=max)return original;
  var s=original;
  while(s&&neisBytes(s)>max)s=s.slice(0,-1);
  s=s.trim();
  var last=s.lastIndexOf('.');
  if(last>=Math.floor(s.length*0.55))s=s.slice(0,last+1);
  return s.trim();
}
function clean(raw){
  var s=String(raw||'').trim();
  s=s.replace(/^```(?:text|markdown)?\s*/i,'').replace(/```$/,'').trim();
  s=s.replace(/^(결과|세특|본문|초안)\s*[:：]\s*/,'').trim();
  return s;
}
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function val(v){return String(v||'').trim();}

async function fetchJson(url,options,timeout){
  options=options||{};timeout=timeout||120000;
  var ctl=new AbortController(),timer=setTimeout(function(){ctl.abort();},timeout);
  try{
    var r=await fetch(url,Object.assign({},options,{signal:ctl.signal,cache:'no-store'}));
    var txt=await r.text(),data={};
    try{data=JSON.parse(txt);}catch(_){data={raw:txt};}
    if(!r.ok)throw new Error((data.error&&data.error.message)||data.error||('HTTP '+r.status));
    return data;
  }finally{clearTimeout(timer);}
}
async function probe(){
  var started=performance.now();
  try{
    var data=await fetchJson(base()+'/api/tags',{},5000);
    var names=(data.models||[]).map(function(x){return x.name||x.model;});
    return {ok:names.indexOf(model())>=0,endpoint:base(),model:model(),models:names,ms:Math.round(performance.now()-started)};
  }catch(e){
    return {ok:false,endpoint:base(),model:model(),models:[],error:String(e.message||e),ms:Math.round(performance.now()-started)};
  }
}
async function chat(prompt,opts){
  opts=opts||{};
  var body={
    model:model(),
    messages:[{role:'user',content:String(prompt||'')}],
    stream:false,
    keep_alive:opts.keepAlive==null?(runtime().localOnly?'0s':'2m'):opts.keepAlive,
    options:{
      temperature:opts.temperature==null?0.12:opts.temperature,
      num_ctx:opts.context||6144,
      num_predict:opts.numPredict||720,
      top_p:0.9,
      repeat_penalty:1.05
    }
  };
  var started=performance.now();
  var data=await fetchJson(base()+'/api/chat',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
  },180000);
  return {
    text:clean((data.message&&data.message.content)||data.response||''),
    ms:Math.round(performance.now()-started),
    promptTokens:data.prompt_eval_count||0,
    evalTokens:data.eval_count||0,
    evalDuration:data.eval_duration||0
  };
}
function evidenceParts(d){
  d=d||{};
  var pairs=[
    ['성취기준',d.standard],
    ['실제 수업 활동',d.activity],
    ['교사 직접 관찰',d.observation],
    ['학생 산출물',d.output],
    ['학생 실제 역할',d.role],
    ['실제 사용 자료',d.sources],
    ['피드백·수정·성장',d.feedback],
    ['학생 후속 질문',d.followup],
    ['기타 관찰 메모',d.notes]
  ];
  return pairs.map(function(x){return [x[0],val(x[1])];}).filter(function(x){return !!x[1];});
}
function evidenceStrength(d){
  var p=evidenceParts(d),score=p.length;
  if(val(d&&d.observation))score+=2;
  if(val(d&&d.output))score+=1;
  if(val(d&&d.feedback))score+=1;
  return {score:score,count:p.length,ready:score>=4,parts:p};
}
function subjectRule(subject){
  var s=String(subject||'').replace(/\s+/g,'');
  if(/한국사|세계사|동아시아사|역사/.test(s))return '역사 교과: 사료·자료의 작성 주체·시점·목적·맥락을 구분하고, 사실과 해석을 혼동하지 않는다. 실제 수행 근거가 있을 때만 사료 비교·역사신문·발표 등을 적는다.';
  if(/국어|문학|독서|언어|매체/.test(s))return '국어 교과: 작품·글·담화의 구체적 표현과 학생의 읽기·쓰기·수정 과정을 근거로 서술한다.';
  if(/수학|미적분|대수|기하|확률|통계/.test(s))return '수학 교과: 정의·조건·추론·증명·모델링 등 실제 사고 과정을 우선하고 근거 없는 수치를 만들지 않는다.';
  if(/물리|화학|생명|지구|과학/.test(s))return '과학 교과: 관찰·실험·변인·오차는 실제 수행 기록이 있을 때만 사용하고 인과와 상관을 구분한다.';
  if(/사회|경제|정치|법|윤리|지리/.test(s))return '사회 교과: 쟁점·관점·자료·사례의 근거를 구분하고 가치 판단과 사실 판단을 섞지 않는다.';
  if(/정보|컴퓨터|소프트웨어|공학|인공지능/.test(s))return '정보·공학 교과: 문제 정의→설계→구현→테스트→개선 중 실제 수행한 단계만 기록한다.';
  return '교과 공통: 실제 관찰 근거와 산출물을 중심으로 과정·수정·성장을 서술한다.';
}
function targetRule(category){
  var c=String(category||'교과세특');
  if(c.indexOf('행동')>=0)return '행동특성·종합의견: 반복 관찰된 행동과 고 가치 영을 단정하지 않는다.';
  if(c.indexOf('진로')>=0)return '진로활동: 진로 탐색의 질문·자료 비교·수정 과정을 쓰고 합격가능성이나 직업 적합성을 단정하지 않는다.';
  if(c.indexOf('동아리')>=0)return '동아리활동: 실제 역할·협업·산출물·수정 과정을 중심으로 쓴다.';
  if(c.indexOf('자율')>=0)return '자율·자치활동: 실제 참여 행동과 공동체 속 역할, 피드백 반영을 중심으로 쓴다.';
  return '교과세특: 교과 개념과 학생의 구체적 수행·사고·피드백→성찰/결과의 흐름을 우선한다.';
}
function area(category){
  var c=String(category||'');
  if(c.indexOf('자율')>=0)return'auto';
  if(c.indexOf('동아리')>=0)return'club';
  if(c.indexOf('진로')>=0)return'career';
  if(c.indexOf('행동')>=0)return'behavior';
  return'course';
}
function buildPrompt(d,mode,current){
  d=d||{};mode=mode||'draft';
  var target=Math.min(1500,Math.max(300,Number(d.targetBytes)||1500));
  var ev=evidenceParts(d).map(function(x){return '- '+x[0]+': '+x[1];}).join('\n')||'(근거 없음)';
  var lines=[
    '고등학교 합객생기련보 교사 검토욨 초안을 작성하다.',
    '영역: '+(d.category||'교과세특')+' / 과목: '+(d.subject||'미입력')+' / 희망진로: '+(d.career||'미입력'),
    '',
    '[절대 규칙]',
    '1. 아래 [학생 실제 근거]에 직접 있는 내용만 학생이 수행한 사실로 서술한다.',
    '2. 근거에 없는 활동, 수치, 도서, 논문, 수상, 기관명, 실험, 감정, 성과, 역할을 만들지 않는다.',
    '3. 학생 이름·학번을 본문에 넣지 않는다.',
    '4. 교사가 관찰 가능한 행동 중심의 개조식 종결형(~함, ~보임, ~확인함 등)을 사용한다.',
    '5. 막연한 칭찬·최상급보다 행동→사고→수정/피드백→성찰/결과의 흐름을 우선한다.',
    '6. '+target+'바이트 이내로 작성하며 본문만 출력한다.',
    '7. '+targetRule(d.category),
    '8. '+subjectRule(d.subject),
    '9. 근거에 직접 없는 추상적 역량·성장·이해·태도 결론(예: 능력이 향상됨, 이해를 높임, 역량이 발전함)을 관성적으로 덧붙이지 않는다.',
    '10. 마지막 문장도 새로운 평가를 만들지 말고 실제 수정·관찰·산출물 근거 안에서 끝낸다.',
    '',
    '[학생 실제 근거]',
    ev
  ];
  if(mode==='improve'){
    lines.push('','[현재 초안]',String(current||''),'','[개선 지시]','현재 초안에 새로운 사실을 추가하지 말고, 중복·상투어를 줄이며 근거와 학생의 개별 과정이 더 잘 드러나도록 다시 쓴다.');
  }
  return lines.join('\n');
}
function basicOfficialChecks(text){
  var out=[],t=String(text||'');
  var rules=[
    ['학생 이름/학번 가능성',/\b\d{5,8}\b/g,'hard'],
    ['과도한 최상급',/(최고|최우수|완벽한|압도적|천재적)/g,'soft'],
    ['대학·합격 단정',/(합격 가능성|대학 합격|입시에 유리|합격할 것)/g,'hard'],
    ['근거 필요 수상',/(수상함|대회에서 우승|최우수상|대상 수상)/g,'hard']
  ];
  rules.forEach(function(r){
    var m=t.match(r[1]);
    if(m)out.push({title:r[0],match:m[0],severity:r[2]});
  });
  return out;
}
function validate(text,d){
  d=d||{};
  var t=String(text||'').trim(),target=Math.min(1500,Math.max(300,Number(d.targetBytes)||1500)),b=neisBytes(t);
  var official=[];
  try{
    if(typeof window.scanOfficial2026==='function')official=window.scanOfficial2026(t)||[];
    else official=basicOfficialChecks(t);
  }catch(_){official=basicOfficialChecks(t);}
  var evalResult=null;
  try{
    if(window.SeoteukEvaluator38&&typeof window.SeoteukEvaluator38.evaluate==='function'){
      evalResult=window.SeoteukEvaluator38.evaluate({
        area:area(d.category),subject:d.subject||'',text:t,
        evidence:evidenceParts(d).map(function(x){return x[0]+': '+x[1];}).join('\n')
      });
    }
  }catch(_){}
  var unsupported=(evalResult&&evalResult.unsupported)||[];
  var warnings=[];
  if(!t)warnings.push('본문이 비어 있음');
  if(b>target)warnings.push('분량 초과 '+b+'/'+target+'B');
  if(val(d.name)&&t.indexOf(val(d.name))>=0)warnings.push('본문에 학생 이름 포함');
  var abstractMatch=t.match(/(능력|역량|이해도|성장|잠재력).{0,10}(향상|발전|높|뛰어|우수|탁월)/),abstractIssue=!!abstractMatch;
  if(abstractMatch)warnings.push('근거 확인이 필요한 추상적 평가: '+abstractMatch[0]);
  official.forEach(function(x){warnings.push('2026 규정: '+(x.title||x.match||'확인 필요'));});
  if(unsupported.length)warnings.push('근거 미확인 표현 '+unsupported.length+'건');
  var hard=official.some(function(x){return x.severity==='hard';});
  return {ok:!!t&&b<=target&&!hard&&!unsupported.length&&!abstractIssue,bytes:b,target:target,official:official,evaluator:evalResult,unsupported:unsupported,warnings:warnings};
}
async function generate(d,mode,current){
  d=d||{};mode=mode||'draft';current=current||'';
  var strength=evidenceStrength(d);
  if(!strength.ready){
    var e=new Error('근거가 부족합니다. 실제 수업 활동과 교사 관찰을 포함해 최소한의 근거를 먼저 입력하세요.');
    e.code='INSUFFICIENT_EVIDENCE';e.strength=strength;throw e;
  }
  var route=null;
  try{if(window.KHSFlowBridge&&window.KHSFlowBridge.route)route=await window.KHSFlowBridge.route('review',false);}catch(_){}
  var res=await chat(buildPrompt(d,mode,current),{
    temperature:mode==='improve'?0.1:0.12,numPredict:720,context:6144,
    keepAlive:runtime().localOnly?'0s':'2m'
  });
  var text=clipBytes(res.text,Number(d.targetBytes)||1500);
  return Object.assign({},res,{text:text,validation:validate(text,d),strength:strength,flowRoute:route});
}
function improve(d,current){return generate(d,'improve',current);}
function loadStore(key,def){try{var x=JSON.parse(localStorage.getItem(key)||'null');return x==null?def:x;}catch(_){return def;}}
function saveStore(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}}
function saveDraft(id,data){
  var all=loadStore(STORE_KEY,{}),key=id||('draft-'+Date.now());
  all[key]=Object.assign({},data,{updatedAt:Date.now()});
  saveStore(STORE_KEY,all);
  return key;
}
function getDrafts(){return loadStore(STORE_KEY,{});}
function deleteDraft(id){var x=getDrafts();delete x[id];saveStore(STORE_KEY,x);}
async function generateBatch(rows,opts){
  opts=opts||{};var out=[];
  for(var i=0;i<rows.length;i++){
    var row=Object.assign({},rows[i]);
    try{
      var g=await generate(row,'draft','');
      row.result=g.text;row.validation=g.validation;row.status='done';row.ms=g.ms;
    }catch(e){row.result='';row.status='error';row.error=String(e.message||e);}
    out.push(row);saveStore(BATCH_KEY,out);
    if(typeof opts.onProgress==='function')await opts.onProgress({index:i,total:rows.length,row:row});
    if(opts.delayMs!==0)await new Promise(function(resolve){setTimeout(resolve,Number(opts.delayMs)||80);});
  }
  return out;
}
function csvEscape(v){var s=String(v==null?'':v);return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function toCsv(rows){
  var keys=['no','name','subject','category','career','standard','activity','observation','output','role','sources','feedback','followup','notes','result','status'];
  return '\uFEFF'+[keys.join(',')].concat(rows.map(function(r){return keys.map(function(k){return csvEscape(r[k]);}).join(',');})).join('\r\n');
}
function download(name,text,type){
  var blob=new Blob([text],{type:type||'text/plain;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},200);
}
window.calculateNeisBytes=window.calculateNeisBytes||neisBytes;
window.SeoteukLocalCore=Object.freeze({
  model:model,base:base,bytes:neisBytes,clipBytes:clipBytes,probe:probe,chat:chat,
  evidenceParts:evidenceParts,evidenceStrength:evidenceStrength,buildPrompt:buildPrompt,
  generate:generate,improve:improve,validate:validate,categoryArea:area,
  saveDraft:saveDraft,getDrafts:getDrafts,deleteDraft:deleteDraft,
  generateBatch:generateBatch,toCsv:toCsv,download:download,esc:esc,version:'3.9.0'
});
})();
