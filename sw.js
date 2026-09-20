const CACHE='seoteukmate-v370-20260920';
const CORE=['./','./index.html','./ai-providers.js','./rules-engine.js','./official-2026.js','./project-writer.js','./knowledge-pack.js','./evidence-fusion.js','./student-workspace.js','./analytics-dashboard.js','./local-tools-admissions.js','./teacher-ux.js','./teacher-demo-v35.js','./student-record-suite-v36.js','./record-writers-v36.js','./student-portfolio-v37.js','./demo-students-v37.js','./ui-mode-v37.js','./editor-live-inspector.js','./firebase-cloud.js','./vendor/tailwind.js','./vendor/xlsx.full.min.js','./vendor/pdf.min.js','./vendor/pdf.worker.min.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 const fresh=u.pathname.endsWith('/index.html')||u.pathname==='/'||u.pathname.endsWith('/sw.js')||u.pathname.endsWith('/evidence-fusion.js')||u.pathname.endsWith('/student-workspace.js')||u.pathname.endsWith('/analytics-dashboard.js')||u.pathname.endsWith('/local-tools-admissions.js')||u.pathname.endsWith('/teacher-ux.js')||u.pathname.endsWith('/teacher-demo-v35.js')||u.pathname.endsWith('/student-record-suite-v36.js')||u.pathname.endsWith('/record-writers-v36.js')||u.pathname.endsWith('/student-portfolio-v37.js')||u.pathname.endsWith('/demo-students-v37.js')||u.pathname.endsWith('/ui-mode-v37.js')||u.pathname.endsWith('/editor-live-inspector.js')||u.pathname.endsWith('/firebase-cloud.js');
 if(fresh){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request)));return;
 }
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})));
});
