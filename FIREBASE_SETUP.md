# Seoteuk Mate v3.0 — Google 로그인 설정

앱에 Google 로그인/Firebase 설정 마법사가 들어 있습니다.

## 최초 1회
1. Firebase Console에서 프로젝트 생성
2. 웹 앱 등록
3. Authentication → Sign-in method → Google 활성화
4. Firestore Database 생성
5. Firebase Authentication의 Authorized domains에 실제 Vercel 도메인이 없으면 추가
7. 앱 우측 상단 ☁️ 버튼 → `Google 계정으로 로그인`
6. Firebase 설정창에서 웹 앱의 `const firebaseConfig = {...}` 전체를 붙여넣고 저장
7. 새로고침 후 Google 로그인

## Firestore 규칙
앱 설정창의 `Firestore 규칙 복사` 버튼을 사용하세요.

권장 규칙은 사용자 본인의 `/users/{uid}/...` 문서만 읽고 쓸 수 있도록 제한합니다.

## 클라우드 저장 구조
- `users/{uid}/app/state` : 현재 앱 작업 상태
- `users/{uid}/workspace/index` : 학급/학생 목록
- `users/{uid}/students/{studentId}` : 학생별 작성 기록
- `users/{uid}/profile/meta` : 사용자 이름/역할

학생 이름·학번·생활기록부 초안은 개인정보일 수 있으므로 학교의 개인정보 처리 지침에 맞게 사용하세요.
