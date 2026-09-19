# Seoteuk Mate v2.6 — GitHub Ready

이 폴더는 **압축을 푼 뒤 내부 파일/폴더를 그대로 GitHub 저장소 루트에 업로드**하는 최종 배포용입니다.

## 1. GitHub 저장소 루트 모습

```text
index.html
ai-providers.js
knowledge-pack.js
rules-engine.js
official-2026.js
project-writer.js
firebase-config.js
firebase-cloud.js
manifest.webmanifest
sw.js
package.json
vercel.json
antigravity-bridge.py
start-antigravity-bridge.bat
api/
  ai.js
icons/
  icon-192.png
  icon-512.png
```

`index.html`만 올리면 기능이 완성되지 않습니다. 위 파일/폴더 전체를 같은 구조로 올리세요.

## 2. 이번 v2.6에서 복구된 AI 엔진

- ⚡ Antigravity DEV: 로컬 브리지 → `agy` CLI → Antigravity 로그인 세션
- 🔐 서버 AI: Vercel 환경변수에 등록된 API 키
- Gemini API Key
- OpenAI API Key
- Claude / Anthropic API Key
- DeepSeek API Key
- Ollama 로컬
- OpenAI-compatible Custom Endpoint

AI 연결센터에서 각 엔진을 선택한 뒤 **연결 테스트**를 누르면 실제 짧은 생성 요청으로 확인합니다.

### 서버 AI용 선택 환경변수

Vercel에서 직접 키를 관리하고 싶다면 아래 중 필요한 것만 등록합니다.

```text
AI_PROVIDER=gemini        # gemini / openai / claude / deepseek
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-luna

ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-5

DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-flash
```

웹앱 화면에 직접 입력한 API 키는 Firebase로 동기화하지 않습니다. 저장 시 해당 브라우저 localStorage에만 남으며, Vercel이 있는 경우 `/api/ai` 프록시를 우선 사용합니다.

## 3. Antigravity DEV 연결

### 설치

Windows PowerShell:

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
```

설치 기본 위치는 `%LOCALAPPDATA%\agy\bin\agy.exe`입니다.

설치 후 **새 PowerShell 창**을 열고:

```powershell
agy
```

를 실행하여 Google 계정 로그인과 첫 설정을 1회 완료합니다.

### 브리지

1. `start-antigravity-bridge.bat` 실행
2. 검은 창을 닫지 않음
3. 토큰은 Windows에서 자동으로 클립보드 복사를 시도함
4. 웹앱 → `⚡ Antigravity DEV`
5. 브리지 토큰 붙여넣기
6. `연결 테스트`
7. `문장 생성 테스트`
8. `engine=antigravity-cli`와 실제 문장이 표시되면 완료

브리지는 `127.0.0.1:8765`와 `localhost:8765`를 자동 탐색합니다. HTTPS 웹앱에서 Chrome/Edge가 **로컬 네트워크 접근** 권한을 묻는 경우 허용해야 합니다.

### v2.5에서 연결이 계속 실패했던 핵심 버그

v2.5 웹앱은 `/health`에서 `token_valid=true`를 요구했지만 브리지는 해당 값을 반환하지 않았습니다. v2.6은 `/health`로 브리지/agy 존재를 확인한 뒤 `/v1/ping`으로 토큰을 별도 검증하도록 수정했습니다.

## 4. 배포 후 예전 화면이 남는 경우

v2.6은 Service Worker를 네트워크 우선 방식으로 변경하고 이전 캐시를 삭제합니다.

그래도 예전 화면이면:

`AI 연결센터 → 🧹 배포 캐시 초기화`

을 누르세요. Service Worker와 Cache Storage를 지운 뒤 자동 새로고침합니다.

## 5. Firebase

Google 로그인 / Firestore를 쓰려면 `firebase-config.js`에 Firebase 웹앱 설정값을 넣습니다. 설정하지 않아도 로컬 저장과 AI 기능은 사용할 수 있습니다.

## v3.5.1 가상학생 전체 예시

상단 작업 메뉴의 **🧪 가상학생 예시**에서 AI 생성 전 원자료를 그대로 확인할 수 있습니다. 원자료에는 성취기준, 실제 수업활동, 교사 직접 관찰, 산출물, 실제 사용 자료, 실제 역할, 피드백·수정·성장, 후속 질문, 역사신문 전용 10개 근거 항목이 모두 포함됩니다.

- `📋 원자료 전체`: AI가 쓰기 전 가상 원자료 확인
- `✍️ 작성기에 넣기`: 가상 원자료를 교과 작성기에 자동 입력
- `✨ 세특 생성+검증`: 현재 AI 엔진으로 실제 생성 후 1,500B·2026 기재금지·근거·역사 교과 문법·가정형 질문 사실화 여부 검증
- `📁 프로젝트 카드 저장`: 동일 가상학생을 프로젝트 카드에 저장

이 예시는 실제 학생이 아니며, 앱 사용법과 세특 생성 품질을 검증하기 위한 테스트 데이터입니다.
