/* Seoteuk Mate v3.9 runtime mode
 * One codebase, three runtime surfaces: full / lite / local-only.
 */
(function(){
  'use strict';

  const path=(location.pathname||'').toLowerCase();
  const params=new URLSearchParams(location.search||'');
  const requested=(params.get('mode')||'').toLowerCase();

  let mode='full';
  if(path.endsWith('/local.html')||path.endsWith('local.html')||requested==='local'||requested==='local-only') mode='local';
  else if(path.endsWith('/lite.html')||path.endsWith('lite.html')||requested==='lite') mode='lite';

  const config={
    full:{
      id:'full',
      label:'Full',
      lite:false,
      localOnly:false,
      cloudAllowed:true,
      firebase:true,
      knowledgePack:true,
      ocr:true,
      analytics:true,
      model:'khs-ax7b6k:latest',
      ollamaBase:'http://127.0.0.1:11434'
    },
    lite:{
      id:'lite',
      label:'Lite',
      lite:true,
      localOnly:false,
      cloudAllowed:true,
      firebase:false,
      knowledgePack:false,
      ocr:false,
      analytics:false,
      model:'khs-ax7b6k:latest',
      ollamaBase:'http://127.0.0.1:11434'
    },
    local:{
      id:'local',
      label:'Local-only',
      lite:true,
      localOnly:true,
      cloudAllowed:false,
      firebase:false,
      knowledgePack:false,
      ocr:false,
      analytics:false,
      model:'khs-ax7b6k:latest',
      // When opened through local-server.py, this same-origin proxy removes browser CORS/mixed-content issues.
      ollamaBase:(location.hostname==='127.0.0.1'||location.hostname==='localhost')&&location.port==='8767'
        ? location.origin+'/ollama'
        : 'http://127.0.0.1:11434'
    }
  }[mode];

  const SETTINGS_KEY='seoteukMate.settings.v1';
  function forceLocalStore(){
    if(!config.localOnly) return;
    let s={};
    try{s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};}catch(_){s={};}
    s.keys=Object.assign({gemini:'',openai:'',claude:'',deepseek:'',custom:''},s.keys||{});
    s.models=Object.assign({},s.models||{}, {custom:config.model});
    s.baseUrls=Object.assign({},s.baseUrls||{}, {custom:config.ollamaBase});
    s.customApiType='ollama';
    s.provider='custom';
    s.preferProxy=false;
    try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));}catch(_){}
    window.currentProvider='custom';
  }

  function feature(name){
    const map={
      cloud:config.cloudAllowed,
      firebase:config.firebase,
      knowledge:config.knowledgePack,
      ocr:config.ocr,
      analytics:config.analytics,
      localOnly:config.localOnly,
      lite:config.lite
    };
    return !!map[name];
  }

  window.SEOTEUK_RUNTIME=Object.freeze({
    ...config,
    feature,
    forceLocalStore,
    flowProjectId:'seoteuk',
    flowDataPolicy:'metadata-only',
    version:'3.9.0'
  });

  forceLocalStore();

  document.documentElement.dataset.seoteukMode=config.id;
  document.addEventListener('DOMContentLoaded',()=>{
    document.body?.setAttribute('data-seoteuk-mode',config.id);
  });
})();