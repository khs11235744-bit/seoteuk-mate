/* Seoteuk Mate AI Providers v2.6
 * Restores: Antigravity DEV / Server AI / Gemini / OpenAI / Claude / DeepSeek / Ollama & OpenAI-compatible
 * Keys are stored only in this browser's localStorage when the user clicks Save.
 */
(function(){
  'use strict';
  const SETTINGS_KEY='seoteukMate.settings.v1';
  const PROVIDERS={
    antigravity:{label:'⚡ Antigravity DEV', keyLabel:'', keyPlaceholder:'', model:'', help:'로컬 브리지 → agy CLI → 현재 Antigravity 로그인 세션/할당량을 사용합니다.'},
    server:{label:'🔐 서버 AI', keyLabel:'', keyPlaceholder:'', model:'', help:'Vercel /api/ai의 서버 환경변수 키를 사용합니다.'},
    gemini:{label:'Gemini', keyLabel:'Google AI Studio API Key', keyPlaceholder:'AIzaSy...', model:'gemini-2.5-flash', help:'Gemini API. 배포 서버 프록시를 우선 사용하고 필요 시 직접 연결합니다.'},
    openai:{label:'OpenAI', keyLabel:'OpenAI API Key', keyPlaceholder:'sk-...', model:'gpt-5.6-luna', help:'OpenAI Responses API. 가능하면 배포 서버 프록시를 사용합니다.'},
    claude:{label:'Claude', keyLabel:'Anthropic API Key', keyPlaceholder:'sk-ant-...', model:'claude-sonnet-5', help:'Anthropic Messages API. 가능하면 배포 서버 프록시를 사용합니다.'},
    deepseek:{label:'DeepSeek', keyLabel:'DeepSeek API Key', keyPlaceholder:'sk-...', model:'deepseek-flash', help:'DeepSeek OpenAI-compatible Chat API를 사용합니다.'},
    custom:{label:'Ollama / Custom', keyLabel:'API Key (Ollama는 비워도 됨)', keyPlaceholder:'선택 사항', model:'qwen3:8b', help:'로컬 Ollama 또는 OpenAI-compatible endpoint에 직접 연결합니다.'}
  };
  const BASE_DEFAULTS={
    custom:'http://127.0.0.1:11434',
    openai:'https://api.openai.com/v1',
    claude:'https://api.anthropic.com/v1',
    deepseek:'https://api.deepseek.com',
    gemini:'https://generativelanguage.googleapis.com/v1beta'
  };

  function readStore(){
    let s={}; try{s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};}catch(_){s={};}
    s.keys=Object.assign({gemini:'',openai:'',claude:'',deepseek:'',custom:''},s.keys||{});
    s.models=Object.assign({gemini:'gemini-2.5-flash',openai:'gpt-5.6-luna',claude:'claude-sonnet-5',deepseek:'deepseek-flash',custom:'qwen3:8b'},s.models||{});
    s.baseUrls=Object.assign({},BASE_DEFAULTS,s.baseUrls||{});
    s.customApiType=s.customApiType||'ollama';
    s.preferProxy=s.preferProxy!==false;
    return s;
  }
  function writeStore(s){
    try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));}catch(_){ }
    window.savedApiKeys=Object.assign(window.savedApiKeys||{},s.keys||{});
    window.savedModels=Object.assign(window.savedModels||{},s.models||{});
  }
  let store=readStore();
  writeStore(store);
  if(store.provider && PROVIDERS[store.provider]) window.currentProvider=store.provider;

  function ensureExtraUI(){
    const modal=document.getElementById('modal-apikey'); if(!modal) return;
    const model=document.getElementById('input-llm-model');
    if(model && !document.getElementById('wrapper-api-base-url')){
      const host=model.parentElement;
      const wrap=document.createElement('div');
      wrap.id='wrapper-api-base-url'; wrap.className='hidden space-y-2 pt-1';
      wrap.innerHTML=`
        <div><label class="font-bold text-slate-700 block mb-1">Base URL</label><input id="input-llm-base-url" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-xs focus:border-blue-500 focus:bg-white" placeholder="http://127.0.0.1:11434"></div>
        <div id="wrapper-custom-api-type"><label class="font-bold text-slate-700 block mb-1">호환 방식</label><select id="input-custom-api-type" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"><option value="ollama">Ollama /api/chat</option><option value="openai">OpenAI-compatible /v1/chat/completions</option></select></div>`;
      host.insertAdjacentElement('afterend',wrap);
    }
    if(!document.getElementById('provider-btn-server')){
      const custom=document.getElementById('provider-btn-custom');
      if(custom){
        const b=document.createElement('button'); b.type='button'; b.id='provider-btn-server'; b.textContent='🔐 서버';
        b.className='p-2 rounded-xl border text-center transition-all bg-slate-50 border-slate-200 text-slate-600 text-[11px]';
        b.onclick=()=>window.selectLlmProvider('server'); custom.insertAdjacentElement('afterend',b);
        custom.parentElement.className='grid grid-cols-4 sm:grid-cols-7 gap-1 text-xs font-bold pt-1';
      }
    }
    if(!document.getElementById('api-security-note')){
      const box=document.getElementById('api-test-result-box');
      if(box){
        const note=document.createElement('div'); note.id='api-security-note'; note.className='p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] leading-4 text-slate-500';
        note.innerHTML='API 키는 <b>Firebase에 동기화하지 않습니다.</b> 저장 시 현재 브라우저 localStorage에만 남습니다. OpenAI 등은 보안상 서버 프록시 사용이 권장됩니다.<div class="mt-2"><button id="btn-reset-app-cache" type="button" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold">🧹 배포 캐시 초기화</button></div>';
        box.insertAdjacentElement('afterend',note);
        note.querySelector('#btn-reset-app-cache')?.addEventListener('click',()=>window.resetAppCache?.());
      }
    }
    const buttons=['antigravity','gemini','openai','claude','deepseek','custom','server'];
    buttons.forEach(p=>{const b=document.getElementById('provider-btn-'+p); if(b){b.style.display=''; b.onclick=()=>window.selectLlmProvider(p);}});
  }

  function readInputsToStore(){
    const p=window.currentProvider;
    if(!PROVIDERS[p]) return;
    const key=document.getElementById('input-llm-api-key')?.value.trim()||'';
    const model=document.getElementById('input-llm-model')?.value.trim()||'';
    if(!['antigravity','server'].includes(p)) store.keys[p]=key;
    if(!['antigravity','server'].includes(p) && model) store.models[p]=model;
    if(p==='custom'){
      store.baseUrls.custom=(document.getElementById('input-llm-base-url')?.value||BASE_DEFAULTS.custom).replace(/\/+$/,'');
      store.customApiType=document.getElementById('input-custom-api-type')?.value||'ollama';
    }
    store.provider=p;
    writeStore(store);
  }

  function syncUI(){
    ensureExtraUI(); store=readStore();
    const p=PROVIDERS[window.currentProvider]?window.currentProvider:'antigravity';
    window.currentProvider=p;
    const ids=['antigravity','gemini','openai','claude','deepseek','custom','server'];
    ids.forEach(id=>{
      const b=document.getElementById('provider-btn-'+id); if(!b) return;
      b.style.display='';
      b.textContent=id==='antigravity'?'⚡ AG DEV':id==='server'?'🔐 서버':id==='custom'?'Ollama':PROVIDERS[id].label;
      b.className=`p-2 rounded-xl border text-center transition-all text-[11px] ${id===p?'bg-blue-600 text-white border-blue-700 font-black shadow-xs':'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`;
    });
    const cfg=PROVIDERS[p];
    const keyWrap=document.getElementById('wrapper-api-key');
    const modelWrap=document.getElementById('input-llm-model')?.parentElement;
    const extra=document.getElementById('wrapper-api-base-url');
    const customType=document.getElementById('wrapper-custom-api-type');
    const hideKey=['antigravity','server'].includes(p);
    if(keyWrap) keyWrap.classList.toggle('hidden',hideKey);
    if(modelWrap) modelWrap.classList.toggle('hidden',hideKey);
    if(extra) extra.classList.toggle('hidden',p!=='custom');
    if(customType) customType.classList.toggle('hidden',p!=='custom');
    const label=document.getElementById('label-api-key'); if(label) label.textContent=cfg.keyLabel||'API Key';
    const key=document.getElementById('input-llm-api-key'); if(key){key.value=store.keys[p]||'';key.placeholder=cfg.keyPlaceholder||'';}
    const model=document.getElementById('input-llm-model'); if(model){model.value=store.models[p]||cfg.model||'';model.placeholder=cfg.model||'model';}
    const help=document.getElementById('api-key-help-text'); if(help) help.textContent=cfg.help;
    const ind=document.getElementById('key-registered-indicator'); if(ind) ind.textContent=hideKey?'키 불필요':(store.keys[p]?'등록된 키 있음':'등록된 키 없음');
    const base=document.getElementById('input-llm-base-url'); if(base) base.value=store.baseUrls.custom||BASE_DEFAULTS.custom;
    const typ=document.getElementById('input-custom-api-type'); if(typ) typ.value=store.customApiType||'ollama';
    const name=document.getElementById('header-ai-name'); if(name) name.textContent=cfg.label;
    const badge=document.getElementById('ai-status-badge'); if(badge){badge.textContent=cfg.label;badge.classList.remove('hidden');}
    const mn=document.getElementById('modal-status-engine-name'); if(mn) mn.textContent=cfg.label;
    const md=document.getElementById('modal-status-engine-desc'); if(md) md.textContent=cfg.help;
  }

  async function proxyRequest(provider,prompt,image){
    const payload={provider,prompt,image,model:store.models[provider]||'',apiKey:store.keys[provider]||'',mode:window.strictEvaluatorMode?'strict':'coach'};
    const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.error||`서버 AI ${r.status}`);
    return d.text||'';
  }
  async function directGemini(prompt,image){
    const key=store.keys.gemini; if(!key) throw new Error('Gemini API 키가 없습니다.');
    const parts=[{text:prompt}]; if(image?.data) parts.push({inline_data:{mime_type:image.mimeType||'image/jpeg',data:image.data}});
    const model=store.models.gemini||PROVIDERS.gemini.model;
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts}]})});
    const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||`Gemini ${r.status}`);
    return (d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('\n').trim();
  }
  async function directOpenAI(prompt,image){
    const key=store.keys.openai; if(!key) throw new Error('OpenAI API 키가 없습니다.');
    const content=[{type:'input_text',text:prompt}]; if(image?.data) content.push({type:'input_image',image_url:`data:${image.mimeType||'image/jpeg'};base64,${image.data}`});
    const body={model:store.models.openai||PROVIDERS.openai.model,input:[{role:'user',content}],store:false};
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify(body)});
    const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||`OpenAI ${r.status}`);
    if(d.output_text) return d.output_text.trim();
    return (d.output||[]).flatMap(o=>o.content||[]).map(c=>c.text||'').join('\n').trim();
  }
  async function directClaude(prompt,image){
    const key=store.keys.claude; if(!key) throw new Error('Anthropic API 키가 없습니다.');
    const content=[]; if(image?.data) content.push({type:'image',source:{type:'base64',media_type:image.mimeType||'image/jpeg',data:image.data}}); content.push({type:'text',text:prompt});
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:store.models.claude||PROVIDERS.claude.model,max_tokens:4096,messages:[{role:'user',content}]})});
    const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||`Claude ${r.status}`);
    return (d.content||[]).filter(x=>x.type==='text').map(x=>x.text||'').join('\n').trim();
  }
  async function directDeepSeek(prompt,image){
    const key=store.keys.deepseek; if(!key) throw new Error('DeepSeek API 키가 없습니다.');
    let content=prompt; if(image?.data) content=[{type:'text',text:prompt},{type:'image_url',image_url:{url:`data:${image.mimeType||'image/jpeg'};base64,${image.data}`}}];
    const r=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model:store.models.deepseek||PROVIDERS.deepseek.model,messages:[{role:'user',content}],stream:false})});
    const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||`DeepSeek ${r.status}`);
    return d.choices?.[0]?.message?.content?.trim()||'';
  }
  function openaiCompatEndpoint(base){
    const b=String(base||'').replace(/\/+$/,'');
    if(/\/v1$/i.test(b)) return b+'/chat/completions';
    if(/\/chat\/completions$/i.test(b)) return b;
    return b+'/v1/chat/completions';
  }
  async function directCustom(prompt,image){
    const base=(store.baseUrls.custom||BASE_DEFAULTS.custom).replace(/\/+$/,'');
    const model=store.models.custom||PROVIDERS.custom.model;
    if((store.customApiType||'ollama')==='ollama'){
      const msg={role:'user',content:prompt}; if(image?.data) msg.images=[image.data];
      const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages:[msg],stream:false})});
      const d=await r.json(); if(!r.ok) throw new Error(d?.error||`Ollama ${r.status}`); return d.message?.content?.trim()||d.response?.trim()||'';
    }
    const headers={'Content-Type':'application/json'}; if(store.keys.custom) headers.Authorization=`Bearer ${store.keys.custom}`;
    let content=prompt; if(image?.data) content=[{type:'text',text:prompt},{type:'image_url',image_url:{url:`data:${image.mimeType||'image/jpeg'};base64,${image.data}`}}];
    const r=await fetch(openaiCompatEndpoint(base),{method:'POST',headers,body:JSON.stringify({model,messages:[{role:'user',content}],stream:false})});
    const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||d?.error||`Custom ${r.status}`); return d.choices?.[0]?.message?.content?.trim()||'';
  }

  async function request(prompt,image){
    store=readStore(); const p=window.currentProvider||store.provider||'antigravity';
    if(p==='antigravity'){
      if(typeof window.__callAntigravityDev!=='function') throw new Error('Antigravity 브리지 모듈이 준비되지 않았습니다.');
      return window.__callAntigravityDev(prompt,image);
    }
    if(p==='server') return proxyRequest('server',prompt,image);
    if(p==='custom') return directCustom(prompt,image);
    // Known cloud providers: own Vercel proxy first. If it is unavailable, fall back to direct developer mode.
    if(store.preferProxy && location.protocol!=='file:'){
      try{return await proxyRequest(p,prompt,image);}catch(e){
        if(!(e instanceof TypeError) && !/404|405|서버 AI|Failed to fetch|Unexpected token/i.test(String(e.message||''))) throw e;
      }
    }
    if(p==='gemini') return directGemini(prompt,image);
    if(p==='openai') return directOpenAI(prompt,image);
    if(p==='claude') return directClaude(prompt,image);
    if(p==='deepseek') return directDeepSeek(prompt,image);
    throw new Error(`지원하지 않는 AI 엔진: ${p}`);
  }


  window.resetAppCache=async function(){
    try{
      if('serviceWorker' in navigator){for(const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();}
      if('caches' in window){for(const k of await caches.keys()) await caches.delete(k);}
      window.showToast?.('배포 캐시를 지웠습니다. 새 버전으로 다시 불러옵니다.','success');
      setTimeout(()=>location.reload(),500);
    }catch(e){location.reload();}
  };

  window.SeoteukAI={request, syncUI, readStore:()=>readStore()};
  window.selectLlmProvider=function(provider){
    if(!PROVIDERS[provider]) return;
    readInputsToStore(); window.currentProvider=provider; store.provider=provider; writeStore(store); syncUI();
    if(provider==='antigravity' && typeof window.syncAgDevInputs==='function') window.syncAgDevInputs();
  };
  window.openApiKeyModal=function(){const m=document.getElementById('modal-apikey'); if(m)m.classList.remove('hidden'); syncUI();};
  window.closeApiKeyModal=function(){document.getElementById('modal-apikey')?.classList.add('hidden');};
  window.handleApiKeyInputChange=function(){const v=document.getElementById('input-llm-api-key')?.value||''; const i=document.getElementById('key-registered-indicator'); if(i)i.textContent=v?'키 입력됨':'등록된 키 없음';};
  window.toggleApiKeyVisibility=function(){const i=document.getElementById('input-llm-api-key'); if(i)i.type=i.type==='password'?'text':'password';};
  window.saveLlmSettings=function(){readInputsToStore(); store.provider=window.currentProvider; writeStore(store); syncUI(); window.closeApiKeyModal(); window.showToast?.(`${PROVIDERS[window.currentProvider].label} 설정을 저장했습니다.`,'success');};
  window.testCurrentApiKeyConnection=async function(){
    readInputsToStore();
    const box=document.getElementById('api-test-result-box'); if(box){box.classList.remove('hidden');box.className='p-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200';box.textContent='실제 문장 생성으로 연결 확인 중…';}
    try{
      if(window.currentProvider==='antigravity'){
        if(typeof window.testAntigravityGeneration!=='function') throw new Error('Antigravity 테스트 기능이 없습니다.');
        window.closeApiKeyModal(); return await window.testAntigravityGeneration();
      }
      const t=await request('연결 확인용 테스트입니다. 정확히 "연결 정상"이라고만 답하세요.');
      if(box){box.className='p-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';box.textContent=`연결 성공 · 실제 생성 응답: ${String(t).slice(0,120)}`;}
    }catch(e){if(box){box.className='p-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200';box.textContent=`연결 실패: ${e.message}`;}}
  };
  window.resetToAntigravityMode=function(){window.currentProvider='antigravity';store.provider='antigravity';writeStore(store);syncUI();window.closeApiKeyModal();window.launchAndConnectAntiGravity?.();};

  document.addEventListener('DOMContentLoaded',()=>{ensureExtraUI(); syncUI();});
  setTimeout(()=>{ensureExtraUI(); syncUI();},0);
})();
