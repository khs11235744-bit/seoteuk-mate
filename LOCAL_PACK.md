# Seoteuk Mate Local Pack v3.9 Preview

Base: GitHub `khs11235744-bit/seoteuk-mate` v3.8.2
Working branch: `feature/flow-local-lite-v390`

## 세 실행 모드

### 1. Full Local
- 기존 v3.8.2 전체 기능을 그대로 사용합니다.
- 로컬에서 열면 Ollama 요청은 `127.0.0.1:8767/ollama` 프록시를 거칩니다.
- AI 연결센터의 Ollama 기본 모델은 `khs-ax7b6k:latest`입니다.
- 클라우드 AI도 필요하면 기존 방식으로 선택할 수 있습니다.
- 실행: `START_FULL_LOCAL.bat`

### 2. Lite
- 학생부 작성, 근거 입력, A.X 생성, 규칙검증, 일괄생성, 로컬 저장에 집중합니다.
- Firebase, 12 MB 지식팩, OCR, 분석 대시보드를 초기 로드하지 않습니다.
- CSV/XLSX 일괄생성을 지원합니다. XLSX 라이브러리는 파일을 고를 때만 지연 로드됩니다.
- 실행: `START_LITE.bat`

### 3. Local-only
- A.X 4.0 Light 7B 6K `khs-ax7b6k:latest`만 생성 엔진으로 사용합니다.
- 학생 입력, 근거, 생성 문장은 로컬 브라우저 ↔ 로컬 서버 ↔ Ollama 안에서 처리합니다.
- KHS Flow에는 학생 내용이 아니라 `projectId / kind / requiresVision / runtimeMode` 같은 라우팅 메타데이터만 전달합니다.
- 외부 AI provider와 Firebase 동기화를 사용하지 않습니다.
- 실행: `START_LOCAL_ONLY.bat`

## 로컬 주소

- Local-only: http://127.0.0.1:8767/local.html
- Lite: http://127.0.0.1:8767/lite.html
- Full Local: http://127.0.0.1:8767/index.html
- Health: http://127.0.0.1:8767/health

로컬 서버는 반드시 `127.0.0.1`에만 바인딩됩니다.

## 생성 파이프라인

1. 교사가 실제 근거를 입력
2. 근거 게이트 검사
3. KHS Flow에 메타데이터-only 라우팅 문의
4. 학생 내용은 KHS Flow에 보내지 않고 A.X로 직접 생성
5. 목표 NEIS 바이트로 문장 단위 안전 절단
6. v3.8.2의 2026 공식 규칙 스캐너 Lite 코어 실행
7. v3.8.2 기록평가 엔진 Lite 코어 실행
8. unsupported 주장 / 기재금지 / 분량 / 추상평가 검사
9. 교사가 수정·확정

## 근거 게이트

최소한의 실제 근거가 없는 학생은 생성 자체를 막습니다.

가중치:
- 근거 항목 1개당 +1
- 교사 직접 관찰 +2
- 산출물 +1
- 피드백·수정 +1

총점 4 미만은 자동 생성하지 않습니다.

## 현재 실측

Synthetic 한국사 학생 사례:
- 모델: A.X 7B 6K Q4_K_M
- 로컬 생성: 약 14초
- 결과: 546 Byte
- v3.8.2 근거 일치도: 83%
- unsupported 주장: 0
- Flow route: localBrain
- Flow executionAuthorized: false

## Lite 무게

Local/Lite 핵심 eager 파일:
- 약 58.5 KB

기존 `knowledge-pack.js`:
- 약 12.29 MB

따라서 Lite 핵심 초기 코드 크기는 대형 지식팩 하나의 약 0.48%입니다.
벤더 SheetJS는 XLSX 파일을 선택할 때만 로드합니다.

## KHS Flow

KHS Flow의 `seoteuk` 프로젝트는 이제 다음 최신 Git 복제본을 가리킵니다.

`C:\Users\권형석\Documents\ChatGPT\seoteuk-mate-v3.8.2`

Flow가 하는 일:
- 프로젝트 provenance 확인
- Local Brain / WebChat 상태 판단
- 작업 종류에 맞는 advisory route 추천

Flow가 하지 않는 일:
- 학생 이름·학번·관찰문·산출물·세특 초안 수신
- 학생 데이터를 포함한 모델 호출
- 파일 수정 실행 권한 부여

## 검증 명령

```powershell
node tests/local-lite.mjs
node tests/local-generation.mjs
node tests/smoke.mjs
node tests/teacher-sim-100.mjs
```

KHS Flow 핵심 테스트:
- 96 tests PASS

## 개발 원칙

- 기존 dirty 작업 보존
- git reset / clean / stash / rebase 금지
- Full v3.8.2 기능 회귀 금지
- 학생 사실 창작 금지
- AI 출력은 교사 검토용 초안
