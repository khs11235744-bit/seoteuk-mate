/* KHS Flow bridge for Seoteuk Mate v3.9
 * IMPORTANT: metadata only. Never send student content/evidence/generated text.
 */
(function(){
  'use strict';

  const runtime=()=>window.SEOTEUK_RUNTIME||{};
  const isBridge=()=>['127.0.0.1','localhost'].includes(location.hostname)&&location.port==='8767';
  const statusUrl=()=>isBridge()?location.origin+'/flow/api/status':'http://127.0.0.1:13731/api/status';
  const routeUrl=()=>isBridge()?location.origin+'/flow/api/route':'http://127.0.0.1:13731/api/route';

  async function fetchJson(url,options={},timeout=6000){
    const ctl=new AbortController();
    const t=setTimeout(()=>ctl.abort(),timeout);
    try{
      const r=await fetch(url,{...options,signal:ctl.signal,cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.json();
    }finally{clearTimeout(t);}
  }

  async function status(){
    try{
      const s=await fetchJson(statusUrl());
      const project=(s.projects||[]).find(p=>p.id==='seoteuk')||null;
      return {
        connected:true,
        version:s.version||'?',
        project,
        localBrain:s.workers?.localBrain||null,
        localVision:s.workers?.localVision||null,
        webchat:s.workers?.webchat||null,
        at:s.at||null
      };
    }catch(error){
      return {connected:false,error:String(error?.message||error)};
    }
  }

  async function route(kind='review',requiresVision=false){
    // Typed metadata only. No mission text, student id, evidence, record text, document excerpts, or prompt is sent.
    const payload={
      projectId:'seoteuk',
      kind:String(kind||'review'),
      operation:'inspect',
      risk:'low',
      requiresVision:requiresVision===true,
      source:'seoteuk-mate',
      runtimeMode:runtime().id||'unknown'
    };
    try{
      return await fetchJson(routeUrl(),{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      },3500);
    }catch(error){
      return {status:'UNAVAILABLE',selected:null,executionAuthorized:false,error:String(error?.message||error)};
    }
  }

  async function healthSummary(){
    const s=await status();
    if(!s.connected)return{ok:false,label:'FLOW offline',detail:s.error||'연결 안 됨'};
    const brain=s.localBrain?.available===true;
    const vision=s.localVision?.available===true;
    return{
      ok:brain,
      label:brain?'FLOW · A.X ready':'FLOW connected',
      detail:[
        'Flow '+s.version,
        brain?('A.X '+(s.localBrain?.model||'')):'A.X unavailable',
        vision?'Vision ready':'Vision unavailable'
      ].join(' · ')
    };
  }

  function installBadge(){
    if(document.getElementById('khs-flow-badge')||document.getElementById('flow-badge'))return;
    const header=document.querySelector('header > div:last-child')||document.querySelector('header');
    if(!header)return;
    const b=document.createElement('button');
    b.id='khs-flow-badge';
    b.type='button';
    b.className='text-[10px] px-2 py-1 rounded-lg border bg-slate-50 text-slate-500 border-slate-200';
    b.textContent='FLOW …';
    b.title='KHS Flow에는 학생 내용이 아니라 상태/라우팅 메타데이터만 전달됩니다.';
    b.onclick=async()=>{
      b.textContent='FLOW 확인…';
      const h=await healthSummary();
      b.textContent=h.label;
      b.title=h.detail+'\n학생 내용 전송 없음';
    };
    header.prepend(b);
    healthSummary().then(h=>{b.textContent=h.label;b.title=h.detail+'\n학생 내용 전송 없음';});
  }

  window.KHSFlowBridge=Object.freeze({status,route,healthSummary,dataPolicy:'metadata-only'});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installBadge,50));
  else setTimeout(installBadge,50);
})();