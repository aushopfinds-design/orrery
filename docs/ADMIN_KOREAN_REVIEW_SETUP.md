# 관리자 전용 한국어 검수 — 배포 전 설정

대상: `aushopfinds-design/orrery`, `feature/english-saju-report-20261013`.
기준일: 2026-10-22 (Australia/Sydney).

## 이 화면의 목적

사용자가 영어 사이트와 리포트를 한국어로 이해하고 직접 운영하기 위한 관리자 공간이다.
단순히 번역 문장을 검사하는 도구로 한정하지 않는다.

- **상품 한눈에 보기**: 7종의 한국어 설명, 실제 공통 가격표의 USD 가격, 장 수·리포트 수, 필요한 사람 수, 상품 간 차이를 보여준다.
- **사이트 한국어 안내**: 메인·무료 풀이·카드·상품 목록·개인 미리보기·전체 예시·구매 안내·전달 형식의 영어 원문을 코드에서 읽고, 직접 작성한 한국어 설명을 나란히 보여준다.
- **리포트 한국어로 읽기**: 기존의 개인 사주 입력과 영어 원문·한국어 해석 비교 기능이다.

상품·사이트 안내는 AI 호출이나 별도 비용 없이 읽을 수 있다. 로그인 보호는 세 화면 모두에 동일하게 적용한다.
관리자 안내는 코드 기준 설명이며 실제 주문·매출·배포 현황을 실시간으로 조회하지 않는다.

운영 안내 추가 후 로컬 검사 58개(기존 관리자/번역 33, 화면 조작 8, 상품·사이트 원문 연결 2, 다국어 15)와 TypeScript/변경 소스 ESLint가 통과했다.
이 추가 작업에서는 실제 번역 모델 호출이나 배포를 실행하지 않았다.

## 현재 상태

- 기존 관리자 인증 없음. Vercel Preview의 SSO/비밀번호 보호도 꺼져 있음을 확인했다.
- 로그인·서버 권한 검사·7종 원문 생성·문단별 한영 비교·한국어 생성 어댑터를 구현했다.
- 실제 Google 관리자 로그인과 실제 모델의 한국어 품질 검증은 아직 하지 않았다.
- 인증 준비 전 검수 화면을 공개 배포하지 말라는 요청에 따라 배포하지 않았다.
- 브랜치 자동 배포 가능성을 피하려고 원격 브랜치 갱신도 보류한다. 운영 도메인, 결제 환경 변수, 주문 DB는 변경하지 않는다.

## 외부에서 준비할 것

### 1. Google 로그인

Google Cloud / Google Auth Platform에서 Web application OAuth client를 준비한다.
Google Identity Services의 ID token 방식을 사용하므로 이 구현에는 client secret이 필요하지 않다.
승인된 JavaScript origin에는 **이 브랜치의 고정 Preview origin만** 넣는다.
운영 도메인과 와일드카드는 추가하지 않는다. OAuth 앱이 testing 상태이면 관리자 계정을 test user로 등록한다.

- 관리자 이메일 예정값: `thefatekey@gmail.com` (서버 allowlist, 고객 계정 등록 기능 없음).
- `FATE_REVIEW_GOOGLE_CLIENT_ID`: Web OAuth client ID.
- `FATE_REVIEW_ADMIN_EMAIL`: 위 Gmail 계정. Google이 검증한 Gmail 주소만 허용한다.
- 최초 실제 로그인 검증에서 관리자 계정은 성공하고 다른 Google 계정은 401인지 확인해야 한다.
- Google 계정의 비밀번호·인증 코드를 채팅이나 환경 변수에 저장하지 않는다.

공식 문서: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

### 2. 한국어 해석 생성

현재 프로젝트에는 번역용 AI 설정이 없다. 자동 생성은 별도 AI Gateway 자격 증명과 모델을 준비한 뒤에만 작동한다.
한국어는 승인된 번역본이 아니라 **검수 전 초안**으로 명확히 표시한다.

- `FATE_REVIEW_AI_GATEWAY_KEY`: Vercel AI Gateway 전용 API key (서버 전용).
- `FATE_REVIEW_TRANSLATION_MODEL`: 한국어 및 JSON 응답을 지원하는 검수용 모델 ID.
- Gateway/provider 사용 비용·예산을 먼저 정한다. 이 변경에서는 유료 호출을 실행하지 않았다.
- 관리자 화면에서 영어 본문 전송 동의 체크 후 생성 버튼을 눌러야 호출한다.
- raw chart object는 전송하지 않지만, 영어 본문에 포함된 출생 정보·개인적 해석은 함께 전송될 수 있다.
- 운영 고객 주문을 조회하지 않는다. 초기 검증은 가상 입력만 사용한다.

## Preview 브랜치 전용 환경 변수

| 이름 | 설정 |
| --- | --- |
| `FATE_REVIEW_ENABLED` | 인증 연결 검증 준비가 끝나기 전까지 미설정; 준비 후 `true` |
| `FATE_REVIEW_ORIGIN` | Google에 등록한 고정 Preview origin, 경로·끝 슬래시 없음 |
| `FATE_REVIEW_GOOGLE_CLIENT_ID` | Google Web client ID |
| `FATE_REVIEW_ADMIN_EMAIL` | `thefatekey@gmail.com` |
| `FATE_REVIEW_SIGNING_KEY` | 암호학적으로 생성한 32바이트 랜덤값의 hex 64자리 |
| `FATE_REVIEW_AI_GATEWAY_KEY` | 전용 Gateway key |
| `FATE_REVIEW_TRANSLATION_MODEL` | 검증할 모델 ID |

모든 변수는 `Preview` + **지정 브랜치에만** 설정한다. `VITE_` 접두사를 사용하지 않는다.
서명 키는 설정자가 로컬에서 생성해 Vercel 비밀 변수에 바로 저장하고 출력·커밋하지 않는다.
기존 Stripe test token, 주문 접근키·암호화키를 재사용하지 않는다.

## 접근과 데이터 흐름

`GET /api/admin-review`는 기능이 비활성/production/다른 브랜치이면 404이다.
필수 설정 누락은 503, 미로그인에는 로그인 페이지만 제공한다. 검수 HTML은 인증 후에만 서버에서 보낸다.
Google 서명·issuer·audience·expiry·nonce·email_verified·관리자 Gmail을 확인한다.
세션은 30분 HttpOnly/Secure/SameSite=Strict cookie이다. 로그인 토큰은 브라우저 저장소에 저장하지 않는다.
세션 만료는 다시 로그인해야 하며 로그아웃은 현재 cookie를 삭제한다. 즉시 전체 세션 폐기는 서명 키 교체로 수행한다.
POST는 고정 origin과 JSON 형식을 요구한다. 보고서·응답·토큰·제공업체 오류 내용을 로그로 기록하지 않는다.

원문 생성은 기존 영어 builder를 그대로 호출한다. 번들은 종합·궁합·연간 3개 문서를 포함한다.
영어 문단은 원문 그대로 유지하고, 각 문단에 관리자·원문 hash·문서 fingerprint에 묶인 1시간 서명 증명을 붙인다.
한국어 생성은 이 증명을 검증하며 사주를 다시 계산하지 않는다. 원문 변조, 다른 관리자, 다른 리포트의 문단은 거절한다.
한 번에 최대 8문단/14,000자, 문단별 최대 7,000자이다. 완료한 문단은 유지하며 중단 후 나머지만 이어서 생성할 수 있다.
미완성·ID 누락·숫자/사주 한자 변경·한국어가 없는 응답은 거절한다. 이 검사는 의미의 정확성이나 문체를 보장하지 않으며 최종 검수가 필요하다.
한국어 초안은 고객 API/PDF/공개 React 진입점에 연결하지 않는다. 번역을 저장하는 DB나 고객 전송 기능도 추가하지 않는다.

## 배포 후 남은 실제 검증

1. 인증 설정 완료 후에만 브랜치를 갱신하고 **Preview**로 배포한다. production 승격 금지.
2. 비활성 상태 404, 로그인 전 검수 내용 없음, 다른 계정 거절, 관리자 로그인 성공, 만료/로그아웃 차단을 실제 브라우저로 확인한다.
3. 7종에서 영어 원문 전체가 기존 리포트와 같은지, 번들이 3문서인지 확인한다.
4. 가상 입력으로 실제 한국어 생성·중단·재개·오류 재시도를 확인한다.
5. 원문과 한국어를 읽어 사주 근거, 구체적 사례, 조언, 단정/불확실성, 누락 여부와 문체를 검수한다.
6. 기존 Sandbox 테스트·운영 가격·운영 도메인이 바뀌지 않았는지 읽기 전용으로 확인한다.

한국어 모델 설정 전 테스트 더블로 통과한 결과를 실제 번역 품질 검증으로 보고하지 않는다.

## 이번 로컬 검증 결과

- 관리자 서버·Google JWT·권한·원문 동일성·번역 입력/응답 검증: 33개 통과.
- 7개 상품의 로컬 DOM 조작(원문 표시, 전송 동의, 한영 비교, 지우기): 7개 통과.
- 다국어 키 일치: 15개 통과.
- 기존 결제·주문·리포트·PDF 회귀 테스트: 26개 통과.
- TypeScript, 변경 소스 ESLint, Vite build 통과. 기존의 큰 청크/동적 import 경고는 남아 있다.
- 설정이 없는 실제 API 모듈을 Node에서 실행해 404와 `not_found` 응답 확인.
- 외부 Google 로그인, 외부 번역 모델 호출, 실제 Preview 브라우저 테스트, 한국어 전편 품질 검수: 미실행.
