/* Seoteuk Mate Vercel AI proxy v2.6
 * provider: server | gemini | openai | claude | deepseek
 * apiKey from request is used ephemerally and is never stored by this function.
 */

function envProvider(){
  if(process.env.AI_PROVIDER) return process.env.AI_PROVIDER.toLowerCase();
  if(process.env.GEMINI_API_KEY) return 'gemini';
  if(process.env.OPENAI_API_KEY) return 'openai';
  if(process.env.ANTHROPIC_API_KEY) return 'claude';
  if(process.env.DEEPSEEK_API_KEY) return 'deepseek';
  return 'gemini';
}
function envKey(p){
  return p==='gemini'?process.env.GEMINI_API_KEY:
    p==='openai'?process.env.OPENAI_API_KEY:
    p==='claude'?process.env.ANTHROPIC_API_KEY:
    p==='deepseek'?process.env.DEEPSEEK_API_KEY:'';
}
function defaultModel(p){
  return p==='gemini'?(process.env.GEMINI_MODEL||'gemini-2.5-flash'):
    p==='openai'?(process.env.OPENAI_MODEL||'gpt-5.6-luna'):
    p==='claude'?(process.env.ANTHROPIC_MODEL||'claude-sonnet-5'):
    p==='deepseek'?(process.env.DEEPSEEK_MODEL||'deepseek-flash'):'';
}
function dataUrl(image){
  return `data:${image?.mimeType||'image/jpeg'};base64,${image?.data||''}`;
}
async function readJson(r){
  const text=await r.text();
  try{return JSON.parse(text||'{}');}catch(_){return {raw:text};}
}

async function gemini(key,model,prompt,image){
  const parts=[{text:String(prompt)}];
  if(image?.data) parts.push({inline_data:{mime_type:image.mimeType||'image/jpeg',data:image.data}});
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{parts}]})
  });
  const d=await readJson(r); if(!r.ok) throw Object.assign(new Error(d?.error?.message||`Gemini ${r.status}`),{status:r.status});
  return (d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('\n').trim();
}
async function openai(key,model,prompt,image){
  const content=[{type:'input_text',text:String(prompt)}];
  if(image?.data) content.push({type:'input_image',image_url:dataUrl(image)});
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
    body:JSON.stringify({model,input:[{role:'user',content}],store:false})
  });
  const d=await readJson(r); if(!r.ok) throw Object.assign(new Error(d?.error?.message||`OpenAI ${r.status}`),{status:r.status});
  if(d.output_text) return String(d.output_text).trim();
  return (d.output||[]).flatMap(o=>o.content||[]).map(c=>c.text||'').join('\n').trim();
}
async function claude(key,model,prompt,image){
  const content=[];
  if(image?.data) content.push({type:'image',source:{type:'base64',media_type:image.mimeType||'image/jpeg',data:image.data}});
  content.push({type:'text',text:String(prompt)});
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model,max_tokens:4096,messages:[{role:'user',content}]})
  });
  const d=await readJson(r); if(!r.ok) throw Object.assign(new Error(d?.error?.message||`Claude ${r.status}`),{status:r.status});
  return (d.content||[]).filter(x=>x.type==='text').map(x=>x.text||'').join('\n').trim();
}
async function deepseek(key,model,prompt,image){
  let content=String(prompt);
  if(image?.data) content=[{type:'text',text:String(prompt)},{type:'image_url',image_url:{url:dataUrl(image)}}];
  const r=await fetch('https://api.deepseek.com/chat/completions',{
    method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
    body:JSON.stringify({model,messages:[{role:'user',content}],stream:false})
  });
  const d=await readJson(r); if(!r.ok) throw Object.assign(new Error(d?.error?.message||`DeepSeek ${r.status}`),{status:r.status});
  return d.choices?.[0]?.message?.content?.trim()||'';
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  const body=req.body||{};
  const prompt=body.prompt;
  if(!prompt) return res.status(400).json({error:'prompt required'});

  let provider=String(body.provider||'server').toLowerCase();
  if(provider==='server') provider=envProvider();
  if(!['gemini','openai','claude','deepseek'].includes(provider)){
    return res.status(400).json({error:`unsupported provider on server proxy: ${provider}`});
  }
  const key=String(body.apiKey||envKey(provider)||'').trim();
  if(!key) return res.status(500).json({error:`${provider} API key not configured`});
  const model=String(body.model||defaultModel(provider)).trim();
  try{
    let text='';
    if(provider==='gemini') text=await gemini(key,model,prompt,body.image);
    else if(provider==='openai') text=await openai(key,model,prompt,body.image);
    else if(provider==='claude') text=await claude(key,model,prompt,body.image);
    else if(provider==='deepseek') text=await deepseek(key,model,prompt,body.image);
    return res.status(200).json({text,provider,model});
  }catch(e){
    const status=Number(e.status)||500;
    return res.status(status>=400&&status<600?status:500).json({error:e.message||String(e),provider,model});
  }
}
