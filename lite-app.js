/* Seoteuk Mate Lite / Local-only UI v3.9 */
(function(){
'use strict';
var C=window.SeoteukLocalCore;
if(!C){document.body.innerHTML='<p style="padding:20px">local-core.js load failed</p>';return;}
var batchRows=[];

function $(id){return document.getElementById(id);}
function value(id){return String($(id)?.value||'').trim();}
function formData(){
  return {
    no:value('f-no'),name:value('f-name'),subject:value('f-subject'),category:value('f-category'),
    career:value('f-career'),standard:value('f-standard'),activity:value('f-activity'),
    observation:value('f-observation'),output:value('f-output'),role:value('f-role'),
    sources:value('f-sources'),feedback:value('f-feedback'),followup:value('f-followup'),
    notes:value('f-notes'),targetBytes:Number(value('f-target'))||1500
  };
}
function busy(on,label){
  ['btn-generate','btn-improve','btn-batch-run'].forEach(function(id){if($(id))$(id).disabled=!!on;});
  if(label&&$('speed-badge'))$('speed-badge').textContent=label;
}
function updateEvidence(){
  var s=C.evidenceStrength(formData()),b=$('evidence-badge');
  if(!b)return;
  b.textContent='근거 '+s.count+' · 점수 '+s.score;
  b.className='badge '+(s.ready?'ok':'warn');
}
function updateBytes(){
  var t=$('result-text')?.value||'',n=C.bytes(t),target=Number(value('f-target'))||1500;
  if($('byte-count'))$('byte-count').textContent=n+'B';
  if($('target-label'))$('target-label').textContent='/ '+target+'B';
}
function showValidation(v){
  var box=$('validation-box');if(!box)return;
  if(!v){box.className='checks';box.textContent='검증 결과 없음';return;}
  var parts=[];
  parts.push(v.ok?'PASS · 근거/분량 기본검증 통과':'REVIEW · 확인 필요');
  parts.push('분량 '+v.bytes+'/'+v.target+'B');
  if(v.evaluator&&v.evaluator.score!=null)parts.push('기존 평가엔진 '+v.evaluator.score+'점');
  if(v.warnings&&v.warnings.length)parts.push(v.warnings.join(' · '));
  box.className='checks '+(v.ok?'ok':'bad');
  box.textContent=parts.join(' | ');
}
async function generate(improve){
  var d=formData(),current=$('result-text')?.value||'';
  busy(true,improve?'다듬는 중':'A.X 생성 중');
  try{
    var r=improve?await C.improve(d,current):await C.generate(d);
    $('result-text').value=r.text;updateBytes();showValidation(r.validation);
    var sec=(r.ms/1000).toFixed(1),tok=r.evalTokens||0,tps=r.evalDuration?((tok*1e9)/r.evalDuration).toFixed(1):'';
    $('speed-badge').textContent=sec+'초'+(tps?' · '+tps+' tok/s':'');
  }catch(e){
    $('speed-badge').textContent='생성 실패';
    showValidation({ok:false,bytes:C.bytes(current),target:d.targetBytes,warnings:[String(e.message||e)]});
  }finally{busy(false);}
}
function validateCurrent(){showValidation(C.validate($('result-text')?.value||'',formData()));updateBytes();}
function saveCurrent(){
  var d=formData(),text=$('result-text')?.value||'',id=(d.no||'student')+'-'+(d.subject||'record')+'-'+Date.now();
  C.saveDraft(id,{input:d,text:text,validation:C.validate(text,d)});
  renderSaved();$('speed-badge').textContent='로컬 저장됨';
}
function clearForm(){
  ['f-no','f-name','f-career','f-standard','f-activity','f-observation','f-output','f-role','f-sources','f-feedback','f-followup','f-notes'].forEach(function(id){if($(id))$(id).value='';});
  $('result-text').value='';updateEvidence();updateBytes();showValidation(null);
}

function setTab(name){
  document.querySelectorAll('.sm-tabs button[data-tab]').forEach(function(b){b.classList.toggle('on',b.dataset.tab===name);});
  document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
  $('tab-'+name)?.classList.add('on');
  if(name==='saved')renderSaved();
}

function renderSaved(){
  var list=$('saved-list'),all=C.getDrafts(),keys=Object.keys(all).sort(function(a,b){return (all[b].updatedAt||0)-(all[a].updatedAt||0);});
  if(!list)return;
  if(!keys.length){list.innerHTML='<div class="saved-item">아직 저장된 초안이 없습니다.</div>';return;}
  list.innerHTML=keys.map(function(k){
    var x=all[k]||{},d=x.input||{},text=x.text||'';
    return '<div class="saved-item" data-id="'+C.esc(k)+'"><div><b>'+C.esc(d.no||'')+' '+C.esc(d.name||'')+'</b> · '+C.esc(d.subject||'')+' · '+C.esc(d.category||'')+'</div><div class="meta">'+new Date(x.updatedAt||0).toLocaleString()+' · '+C.bytes(text)+'B</div><p>'+C.esc(text)+'</p><div class="actions"><button class="btn soft saved-load">불러오기</button><button class="btn soft saved-delete">삭제</button></div></div>';
  }).join('');
  list.querySelectorAll('.saved-load').forEach(function(btn){btn.onclick=function(){loadSaved(btn.closest('.saved-item').dataset.id);};});
  list.querySelectorAll('.saved-delete').forEach(function(btn){btn.onclick=function(){C.deleteDraft(btn.closest('.saved-item').dataset.id);renderSaved();};});
}
function loadSaved(id){
  var x=C.getDrafts()[id];if(!x)return;var d=x.input||{};
  var map={no:'f-no',name:'f-name',subject:'f-subject',category:'f-category',career:'f-career',standard:'f-standard',activity:'f-activity',observation:'f-observation',output:'f-output',role:'f-role',sources:'f-sources',feedback:'f-feedback',followup:'f-followup',notes:'f-notes',targetBytes:'f-target'};
  Object.keys(map).forEach(function(k){if($(map[k])&&d[k]!=null)$(map[k]).value=d[k];});
  $('result-text').value=x.text||'';updateEvidence();updateBytes();validateCurrent();setTab('single');
}

function splitCsvLine(line){
  var out=[],cur='',quote=false;
  for(var i=0;i<line.length;i++){
    var c=line[i];
    if(c==='"'){
      if(quote&&line[i+1]==='"'){cur+='"';i++;}else quote=!quote;
    }else if(c===','&&!quote){out.push(cur);cur='';}else cur+=c;
  }
  out.push(cur);return out;
}
function parseCsv(text){
  var lines=String(text||'').replaceAll(String.fromCharCode(13),'').split(String.fromCharCode(10)).filter(function(x){return x.trim();});
  if(!lines.length)return[];
  var head=splitCsvLine(lines[0]).map(function(x){return x.trim();});
  return lines.slice(1).map(function(line){var vals=splitCsvLine(line),o={};head.forEach(function(h,i){o[h]=vals[i]||'';});return o;});
}
function find(obj,names){
  var keys=Object.keys(obj||{}),normalized=function(s){return String(s||'').replaceAll(' ','').toLowerCase();};
  for(var i=0;i<names.length;i++){
    var n=normalized(names[i]);
    var k=keys.find(function(x){return normalized(x)===n;});
    if(k!=null)return obj[k];
  }
  return '';
}
function mapRow(r){
  return {
    no:find(r,['학번','번호','학생번호','no']),
    name:find(r,['이름','학생','학생명','성명','name']),
    subject:find(r,['과목','교과','교과명','subject'])||'한국사',
    category:find(r,['영역','기록영역','구분','category'])||'교과세특',
    career:find(r,['희망진로','진로','희망계열','career']),
    standard:find(r,['성취기준','수업목표','standard']),
    activity:find(r,['실제수업활동','수업활동','활동명','프로젝트','activity']),
    observation:find(r,['교사관찰','관찰기록','실행메모','오늘한일','observation']),
    output:find(r,['산출물','결과자료','직접만든수정한것','output']),
    role:find(r,['역할','개인역할','담당역할','role']),
    sources:find(r,['사용자료','근거자료','사료','sources']),
    feedback:find(r,['피드백','수정사항','해결수정과정','성장','feedback']),
    followup:find(r,['후속질문','다음할일','followup']),
    notes:find(r,['기타','메모','학생성찰','notes']),
    targetBytes:Number(find(r,['목표Byte','목표바이트','targetBytes']))||1500
  };
}
function loadXlsx(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  return new Promise(function(resolve,reject){
    var s=document.createElement('script');s.src='./vendor/xlsx.full.min.js';s.onload=function(){resolve(window.XLSX);};s.onerror=function(){reject(new Error('SheetJS 로드 실패'));};document.head.appendChild(s);
  });
}
async function readBatchFile(file){
  if(!file)return[];
  var ext=(file.name.split('.').pop()||'').toLowerCase(),raw=[];
  if(ext==='csv'){raw=parseCsv(await file.text());}
  else{
    var XLSX=await loadXlsx(),buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];
    raw=XLSX.utils.sheet_to_json(ws,{defval:''});
  }
  return raw.map(mapRow);
}
function renderBatch(){
  var body=$('batch-body');if(!body)return;
  $('batch-summary').textContent=batchRows.length+'명';
  body.innerHTML=batchRows.map(function(r,i){
    var st=C.evidenceStrength(r),result=r.result||r.error||'',bytes=r.result?C.bytes(r.result):0;
    return '<tr><td>'+(i+1)+'</td><td>'+C.esc(r.no)+' '+C.esc(r.name)+'</td><td>'+C.esc(r.subject)+'</td><td>'+st.count+' / '+st.score+'</td><td>'+C.esc(r.status||'대기')+'</td><td>'+bytes+'</td><td>'+C.esc(result).slice(0,230)+'</td></tr>';
  }).join('');
}
async function runBatch(){
  if(!batchRows.length)return;
  busy(true,'일괄 생성');
  $('batch-progress').style.width='0%';
  try{
    batchRows=await C.generateBatch(batchRows,{onProgress:function(p){
      $('batch-progress').style.width=Math.round(((p.index+1)/p.total)*100)+'%';renderBatch();
    }});
  }finally{busy(false);renderBatch();}
}

async function refreshStatus(){
  var rt=window.SEOTEUK_RUNTIME||{},mode=rt.id||'lite';
  $('mode-title').textContent=mode==='local'?'Local-only':'Lite';
  $('mode-desc').textContent=mode==='local'?'A.X 7B 6K만 사용 · 외부 AI 전송 없음':'가벼운 세특 작성기 · 로컬 A.X 우선';
  $('local-privacy-note').style.display=mode==='local'?'block':'none';
  var p=await C.probe(),b=$('local-badge');
  b.textContent=p.ok?'A.X 연결 · '+p.ms+'ms':'A.X 연결 실패';b.className='badge '+(p.ok?'ok':'bad');
  try{
    var h=await window.KHSFlowBridge?.healthSummary?.(),f=$('flow-badge');
    if(h){f.textContent=h.label;f.className='badge '+(h.ok?'ok':'warn');}
  }catch(_){}
}

document.querySelectorAll('.sm-tabs button[data-tab]').forEach(function(b){b.onclick=function(){setTab(b.dataset.tab);};});
document.querySelectorAll('#tab-single input,#tab-single textarea,#tab-single select').forEach(function(el){el.addEventListener('input',updateEvidence);});
$('result-text').addEventListener('input',updateBytes);
$('f-target').addEventListener('input',updateBytes);
$('btn-generate').onclick=function(){generate(false);};
$('btn-improve').onclick=function(){generate(true);};
$('btn-validate').onclick=validateCurrent;
$('btn-save').onclick=saveCurrent;
$('btn-clear').onclick=clearForm;
$('btn-copy').onclick=async function(){try{await navigator.clipboard.writeText($('result-text').value||'');$('speed-badge').textContent='복사됨';}catch(_){}};
$('btn-refresh-saved').onclick=renderSaved;
$('batch-file').onchange=async function(e){
  try{batchRows=await readBatchFile(e.target.files?.[0]);renderBatch();}catch(err){$('batch-summary').textContent='파일 오류: '+err.message;}
};
$('btn-batch-run').onclick=runBatch;
$('btn-batch-export').onclick=function(){if(batchRows.length)C.download('seoteuk-local-results.csv',C.toCsv(batchRows),'text/csv;charset=utf-8');};

updateEvidence();updateBytes();renderSaved();refreshStatus();
})();