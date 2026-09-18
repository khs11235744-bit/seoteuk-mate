
const DEFAULT_CFG=window.SEOTEUK_FIREBASE_CONFIG||{};
const CONFIG_KEY='seoteukMate.firebaseConfig.v3';
const ROLE_KEY='seoteukMate.role';
const byId=id=>document.getElementById(id);
const loadLocalConfig=()=>{try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')||{}}catch(_){return{}}};
const cfg=Object.assign({},DEFAULT_CFG,loadLocalConfig());
const configured=!!(cfg.apiKey&&cfg.authDomain&&cfg.projectId&&cfg.appId);

window.firebaseUI=window.firebaseUI||{};
window.SeoteukAuth=window.SeoteukAuth||{};
window.SeoteukCloud=window.SeoteukCloud||{};

function progressStart(label,detail){window.SeoteukProgress?.start?.(label,detail)}
function progressDone(label){window.SeoteukProgress?.done?.(label)}
function progressFail(label){window.SeoteukProgress?.fail?.(label)}

function status(label,on=false){
  const l=byId('cloud-status-label'); if(l)l.textContent=label;
  const d=byId('cloud-status-dot'); if(d)d.className=`w-2 h-2 rounded-full ${on?'bg-emerald-500':'bg-slate-400'}`;
  const dd=byId('cloud-detail-status'); if(dd)dd.textContent=label;
  const w=byId('cloud-config-warning'); if(w)w.classList.toggle('hidden',configured);
}
function roleLabel(role){
  return ({teacher:'교과교사',homeroom:'담임교사',student:'학생',admin:'개발·관리'})[role]||role||'';
}
function paintProfile(user){
  const name=byId('cloud-account-name'),email=byId('cloud-account-email'),avatar=byId('cloud-avatar'),badge=byId('cloud-role-badge');
  if(user){
    if(name)name.textContent=user.displayName||'Google 사용자';
    if(email)email.textContent=user.email||'';
    if(avatar)avatar.innerHTML=user.photoURL?`<img src="${String(user.photoURL).replace(/"/g,'&quot;')}" alt="" class="w-full h-full object-cover">`:'👤';
    const role=localStorage.getItem(ROLE_KEY)||'';
    if(badge){
      badge.textContent=roleLabel(role)||'역할 미선택';
      badge.classList.remove('hidden');
    }
  }else{
    if(name)name.textContent='로그인하지 않음';
    if(email)email.textContent=configured?'Google 계정으로 로그인할 수 있습니다.':'Firebase 연결 설정이 필요합니다.';
    if(avatar)avatar.textContent='👤';
    if(badge)badge.classList.add('hidden');
  }
}
function openRoleModal(){
  const m=byId('cloud-role-modal'); if(m){m.classList.remove('hidden');m.classList.add('flex');}
}
function closeRoleModal(){
  const m=byId('cloud-role-modal'); if(m){m.classList.add('hidden');m.classList.remove('flex');}
}
function injectSetupModal(){
  if(byId('firebase-setup-modal')) return;
  const m=document.createElement('div');
  m.id='firebase-setup-modal';
  m.className='hidden fixed inset-0 z-[230] bg-slate-950/55 backdrop-blur-sm p-4 items-center justify-center no-print';
  m.innerHTML=`<div class="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
    <div class="p-4 border-b flex justify-between gap-3"><div><h3 class="font-black">🔐 Google 로그인 · Firebase 연결</h3><p class="text-[11px] text-slate-500 mt-1">Firebase Console → 프로젝트 설정 → 내 앱 → 웹 앱의 firebaseConfig를 한 번 붙여넣으면 됩니다.</p></div><button onclick="window.firebaseUI.closeSetup?.()" class="w-9 h-9 rounded-xl bg-slate-100 font-black">✕</button></div>
    <div class="p-4 overflow-y-auto space-y-3 text-xs">
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-2xl leading-5">
        <b>1.</b> Firebase에서 웹 앱 등록 → <b>Authentication → Google</b> 사용<br>
        <b>2.</b> Firestore Database 생성<br>
        <b>3.</b> 아래 칸에 <code>const firebaseConfig = {...}</code> 전체 또는 중괄호 부분을 붙여넣기<br>
        <b>4.</b> 저장 후 앱이 새로고침되면 Google 로그인
      </div>
      <textarea id="firebase-config-paste" class="w-full h-44 p-3 border border-slate-200 rounded-2xl font-mono text-[11px]" placeholder='const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };'></textarea>
      <div id="firebase-setup-result" class="hidden p-2 rounded-xl"></div>
      <div class="flex flex-wrap gap-2">
        <button onclick="window.firebaseUI.savePastedConfig?.()" class="px-3 py-2 bg-blue-600 text-white rounded-xl font-black">설정 저장 & 새로고침</button>
        <button onclick="window.firebaseUI.copyRules?.()" class="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold">Firestore 규칙 복사</button>
        <button onclick="window.firebaseUI.clearConfig?.()" class="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold">저장 설정 삭제</button>
      </div>
      <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] leading-5 text-amber-900">
        <b>학생 개인정보 주의:</b> 로그인 후 학생 워크스페이스를 클라우드에 저장하면 이름·학번·기록 초안 등이 선생님 Firebase 프로젝트에 저장될 수 있습니다. 학교 개인정보 처리 지침에 맞게 사용하세요.
      </div>
      <pre id="firebase-rules-preview" class="p-3 bg-slate-950 text-slate-100 rounded-2xl text-[10px] overflow-x-auto">rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}</pre>
    </div>
  </div>`;
  document.body.appendChild(m);
}
function parseConfigText(text){
  let s=String(text||'').trim();
  s=s.replace(/^.*?firebaseConfig\s*=\s*/s,'').replace(/;\s*$/,'').trim();
  if(!s.startsWith('{')){
    const m=s.match(/\{[\s\S]*\}/); if(m)s=m[0];
  }
  // convert common JS object syntax to JSON safely enough for Firebase config fields
  const out={};
  for(const key of ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId','measurementId']){
    const rx=new RegExp(key+"\\s*:\\s*['\\\"]([^'\\\"]+)['\\\"]");
    const m=s.match(rx); if(m)out[key]=m[1];
  }
  return out;
}
window.firebaseUI.openSetup=()=>{injectSetupModal();const m=byId('firebase-setup-modal');m.classList.remove('hidden');m.classList.add('flex')};
window.firebaseUI.closeSetup=()=>{const m=byId('firebase-setup-modal');m?.classList.add('hidden');m?.classList.remove('flex')};
window.firebaseUI.savePastedConfig=()=>{
  const out=parseConfigText(byId('firebase-config-paste')?.value||'');
  const ok=!!(out.apiKey&&out.authDomain&&out.projectId&&out.appId);
  const r=byId('firebase-setup-result');
  if(!ok){
    if(r){r.className='p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800';r.textContent='필수 값을 읽지 못했습니다. Firebase 웹 앱의 firebaseConfig 전체를 붙여넣어 주세요.';r.classList.remove('hidden');}
    return;
  }
  localStorage.setItem(CONFIG_KEY,JSON.stringify(out));
  if(r){r.className='p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800';r.textContent='설정을 저장했습니다. 새로고침합니다.';r.classList.remove('hidden');}
  setTimeout(()=>location.reload(),500);
};
window.firebaseUI.clearConfig=()=>{localStorage.removeItem(CONFIG_KEY);location.reload()};
window.firebaseUI.copyRules=async()=>{
  const text=`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;
  try{await navigator.clipboard.writeText(text);window.showToast?.('Firestore 규칙을 복사했습니다.','success')}catch(_){}
};
injectSetupModal();

if(!configured){
  status('Firebase 설정 필요');
  paintProfile(null);
  window.firebaseUI.signInGoogle=()=>window.firebaseUI.openSetup();
  window.firebaseUI.signOut=()=>{};
  window.firebaseUI.saveNow=()=>window.firebaseUI.openSetup();
  window.firebaseUI.chooseRole=(role)=>{
    localStorage.setItem(ROLE_KEY,role);closeRoleModal();paintProfile(null);
  };
  window.SeoteukAuth={configured:false,getUser:()=>null,getRole:()=>localStorage.getItem(ROLE_KEY)||'',openSetup:window.firebaseUI.openSetup};
  const w=byId('cloud-config-warning');
  if(w){
    w.classList.remove('hidden');
    w.innerHTML='Google 로그인을 사용하려면 Firebase 웹 앱 설정이 필요합니다. <button type="button" onclick="window.firebaseUI.openSetup?.()" class="ml-1 underline font-black">지금 연결</button>';
  }
}else{
  try{
    progressStart('☁️ 클라우드 초기화','Firebase 인증·저장소를 준비하고 있습니다.');
    const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,onAuthStateChanged,signOut},{getFirestore,doc,getDoc,setDoc,deleteDoc,serverTimestamp}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js')
    ]);
    const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
    let user=null,timer=null;
    provider.setCustomParameters({prompt:'select_account'});

    async function saveProfile(){
      if(!user)return;
      const role=localStorage.getItem(ROLE_KEY)||'';
      await setDoc(doc(db,'users',user.uid,'profile','meta'),{
        displayName:user.displayName||'',email:user.email||'',photoURL:user.photoURL||'',role,updatedAt:serverTimestamp()
      },{merge:true});
    }
    async function loadProfile(){
      if(!user)return;
      const snap=await getDoc(doc(db,'users',user.uid,'profile','meta'));
      if(snap.exists()){
        const role=snap.data()?.role;
        if(role)localStorage.setItem(ROLE_KEY,role);
      }
    }
    async function saveNow(){
      if(!user)return;
      progressStart('☁️ 클라우드 저장 중','현재 작업 상태를 저장하고 있습니다.');
      const state=typeof window.__getCloudState==='function'?window.__getCloudState():{};
      await setDoc(doc(db,'users',user.uid,'app','state'),{...state,serverUpdatedAt:serverTimestamp()},{merge:true});
      status('클라우드 저장됨',true);progressDone('클라우드 저장 완료');
    }
    window.__scheduleCloudSave=()=>{
      if(!user)return;
      clearTimeout(timer);
      timer=setTimeout(()=>saveNow().catch(()=>{status('저장 재시도');progressFail('클라우드 저장 실패')}),1200);
    };
    async function loadAppState(){
      if(!user)return;
      const snap=await getDoc(doc(db,'users',user.uid,'app','state'));
      if(snap.exists()&&typeof window.__applyCloudState==='function')window.__applyCloudState(snap.data());
    }

    window.SeoteukCloud={
      configured:true,
      getUser:()=>user,
      getUser:()=>user,
      async saveWorkspaceIndex(index){
        if(!user)return false;
        await setDoc(doc(db,'users',user.uid,'workspace','index'),{...index,updatedAt:serverTimestamp()},{merge:false});
        return true;
      },
      async loadWorkspaceIndex(){
        if(!user)return null;
        const snap=await getDoc(doc(db,'users',user.uid,'workspace','index'));
        return snap.exists()?snap.data():null;
      },
      async saveStudentRecord(studentId,record){
        if(!user||!studentId)return false;
        await setDoc(doc(db,'users',user.uid,'students',studentId),{...record,updatedAt:serverTimestamp()},{merge:false});
        return true;
      },
      async loadStudentRecord(studentId){
        if(!user||!studentId)return null;
        const snap=await getDoc(doc(db,'users',user.uid,'students',studentId));
        return snap.exists()?snap.data():null;
      },
      async deleteStudentRecord(studentId){
        if(!user||!studentId)return false;
        await deleteDoc(doc(db,'users',user.uid,'students',studentId));return true;
      }
    };

    window.firebaseUI.signInGoogle=async()=>{
      progressStart('🔐 Google 로그인','계정 인증 창을 여는 중입니다.');
      try{
        if(/Mobi|Android/i.test(navigator.userAgent))await signInWithRedirect(auth,provider);
        else await signInWithPopup(auth,provider);
        progressDone('Google 로그인 완료');
      }catch(e){progressFail('Google 로그인 실패');alert('Google 로그인: '+e.message)}
    };
    window.firebaseUI.signOut=async()=>{await signOut(auth);status('로컬 모드');};
    window.firebaseUI.saveNow=saveNow;
    window.firebaseUI.chooseRole=async(role)=>{
      localStorage.setItem(ROLE_KEY,role);closeRoleModal();paintProfile(user);
      if(user)await saveProfile().catch(()=>{});
    };

    getRedirectResult(auth).catch(()=>{});
    onAuthStateChanged(auth,async u=>{
      user=u;
      window.SeoteukAuth={configured:true,getUser:()=>user,getRole:()=>localStorage.getItem(ROLE_KEY)||'',openSetup:window.firebaseUI.openSetup};
      if(u){
        status('클라우드 연결',true);paintProfile(u);
        byId('btn-google-login')?.classList.add('hidden');byId('btn-cloud-save-now')?.classList.remove('hidden');byId('btn-google-logout')?.classList.remove('hidden');
        progressStart('☁️ 계정 데이터 불러오는 중','프로필·작성 상태·학생 워크스페이스를 동기화합니다.');
        await loadProfile().catch(()=>{});
        paintProfile(u);
        if(!localStorage.getItem(ROLE_KEY))openRoleModal();
        await loadAppState().catch(()=>{});
        await window.SeoteukWorkspace?.syncFromCloud?.().catch(()=>{});
        progressDone('클라우드 동기화 완료');
      }else{
        status('로컬 모드');paintProfile(null);
        byId('btn-google-login')?.classList.remove('hidden');byId('btn-cloud-save-now')?.classList.add('hidden');byId('btn-google-logout')?.classList.add('hidden');
      }
    });
    progressDone('클라우드 준비 완료');
  }catch(e){
    status('Firebase 로드 실패');progressFail('Firebase 초기화 실패');console.warn(e);
  }
}
