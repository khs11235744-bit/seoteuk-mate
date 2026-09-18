const cfg=window.SEOTEUK_FIREBASE_CONFIG||{};
const configured=!!(cfg.apiKey&&cfg.authDomain&&cfg.projectId&&cfg.appId);
const byId=id=>document.getElementById(id);
function status(label,on=false){const l=byId('cloud-status-label'); if(l)l.textContent=label; const d=byId('cloud-status-dot'); if(d)d.className=`w-2 h-2 rounded-full ${on?'bg-emerald-500':'bg-slate-400'}`; const dd=byId('cloud-detail-status'); if(dd)dd.textContent=label; const w=byId('cloud-config-warning'); if(w)w.classList.toggle('hidden',configured);}
if(!configured){status('로컬 모드');window.firebaseUI=window.firebaseUI||{};window.firebaseUI.signInGoogle=()=>{status('Firebase 설정 필요');byId('cloud-config-warning')?.classList.remove('hidden');};}
else {
  try{
    const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,onAuthStateChanged,signOut},{getFirestore,doc,getDoc,setDoc,serverTimestamp}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js')
    ]);
    const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
    let user=null,timer=null;
    async function saveNow(){if(!user)return;const state=typeof window.__getCloudState==='function'?window.__getCloudState():{};await setDoc(doc(db,'users',user.uid,'app','state'),{...state,serverUpdatedAt:serverTimestamp()},{merge:true});status('클라우드 저장됨',true);}
    window.__scheduleCloudSave=(state)=>{if(!user)return;clearTimeout(timer);timer=setTimeout(()=>saveNow().catch(()=>status('저장 재시도')),1200);};
    async function load(){if(!user)return;const snap=await getDoc(doc(db,'users',user.uid,'app','state'));if(snap.exists()&&typeof window.__applyCloudState==='function')window.__applyCloudState(snap.data());}
    window.firebaseUI=window.firebaseUI||{};
    window.firebaseUI.signInGoogle=async()=>{try{if(/Mobi|Android/i.test(navigator.userAgent))await signInWithRedirect(auth,provider);else await signInWithPopup(auth,provider);}catch(e){alert('Google 로그인: '+e.message);}};
    window.firebaseUI.signOut=()=>signOut(auth);
    window.firebaseUI.saveNow=saveNow;
    window.firebaseUI.chooseRole=(role)=>{try{localStorage.setItem('seoteukMate.role',role);}catch(_){} byId('cloud-role-modal')?.classList.add('hidden');};
    getRedirectResult(auth).catch(()=>{});
    onAuthStateChanged(auth,async u=>{user=u;if(u){status('클라우드 연결',true);byId('cloud-account-name').textContent=u.displayName||'Google 사용자';byId('cloud-account-email').textContent=u.email||'';byId('btn-google-login')?.classList.add('hidden');byId('btn-cloud-save-now')?.classList.remove('hidden');byId('btn-google-logout')?.classList.remove('hidden');await load().catch(()=>{});}else{status('로컬 모드');byId('btn-google-login')?.classList.remove('hidden');byId('btn-cloud-save-now')?.classList.add('hidden');byId('btn-google-logout')?.classList.add('hidden');}});
  }catch(e){status('Firebase 로드 실패');console.warn(e);}
}
