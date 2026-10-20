# THE FATE KEY Sandbox 결제·리포트 검증

작업 브랜치: `feature/english-saju-report-20261013`
프로젝트: `saju-english-report-preview`

## 결과

7개 상품 모두 실제 Stripe Sandbox Checkout Session을 생성하고 Stripe 테스트 카드 토큰으로 승인했다. Stripe가 반환한 상태를 서버에서 다시 조회하여 금액·통화·상품·수량·주문 연결을 검증한 뒤 개인 리포트와 PDF를 발급했다. 성공 상태를 DB에 직접 주입하거나 URL의 성공 표시로 접근을 허용하지 않았다.

테스트 실행: 2026-10-20T12:56:51.499Z ~ 2026-10-20T13:01:49.886Z (UTC).
검증된 서버 배포: https://saju-english-report-preview-899av6538-shopping-shorts-ai.vercel.app
서버 코드 커밋: `e9dba3227f36343a4fc0c525d9a0a26f5960c022`.

| 상품 | USD | Stripe 승인 | 개인 리포트 | PDF 페이지 | PDF 바이트 |
|---|---:|---|---|---:|---:|
| complete | 14.99 | paid | complete | 17 | 53154 |
| compatibility | 9.99 | paid | complete | 17 | 52388 |
| year | 7.99 | paid | complete | 22 | 75447 |
| career | 8.99 | paid | complete | 15 | 49715 |
| business | 9.99 | paid | complete | 15 | 49192 |
| wellbeing | 6.99 | paid | complete | 13 | 40945 |
| bundle | 22.99 | paid | complete | 53 | 158059 |

번들은 종합 리포트·궁합·연간 리포트 3개를 포함하며, 종합·연간은 Person A, 궁합은 두 사람을 대상으로 한다. 개인 상품은 운명 카드 1개, 궁합·번들은 2개가 온라인 리포트와 PDF에 포함된다.

모든 상품에서 추가로 확인한 항목:
- 결제 전 리포트·PDF는 HTTP 402로 차단.
- 동일 입력·동일 요청키 재전송은 같은 주문과 같은 Checkout Session을 사용.
- 다른 주문 접근키 또는 위조 키는 HTTP 404.
- 결제 후 반복 다운로드한 PDF는 바이트 단위로 동일.
- 서명된 실제 `checkout.session.completed` 웹훅 7건 수신.
- 주문당 발급 작업·저장된 리포트는 각각 1개. 발급 시도도 각 1회.

## 배포된 서버 오류 검사

| 상황 | 확인 결과 |
|---|---|
| decline | declined / HTTP 402 |
| expire | expired / HTTP 402 |
| missing tester access | HTTP 401 |
| browser price tampering | HTTP 400 |
| unknown product | HTTP 400 |
| cross origin | HTTP 403 |
| oversized request | HTTP 413 |
| forged webhook | HTTP 400 |

## 자동 검사 및 PDF 검수

- 전체 자동 검사: 34개 파일, 455개 테스트 통과.
- 이후 비공개 테스트 실행 경로 보호를 추가한 뒤 결제·언어 검사 41개 재검증 통과(결제 26개, 언어 15개).
- 구매 완료 페이지 경로를 분리한 뒤 라우팅·언어 검사 30개 통과(라우팅 15개, 언어 15개).
- TypeScript 타입 검사, 변경된 결제 파일 ESLint 검사, Git 공백 검사 통과.
- Vercel 배포 빌드 성공. 서버 계산 엔진은 workspace 의존성과 별도 core build로 포함.
- 7개 PDF를 파싱하고 첫 페이지·본문·번들 마지막 카드 등을 PNG로 렌더링하여 확인. 한자 폰트 포함, 머리글·바닥글·페이지 번호 확인.
- 로컬 7개 PDF 전체 페이지의 글자 좌표를 검사하여 페이지 영역 밖으로 잘린 글자 없음.

## 구현

- `api/payments.ts`: checkout, status, report, pdf, 서명 검증 webhook, 비공개 Sandbox QA.
- `server/payments/`: 서버 소유 가격, 입력 정규화, AES-256-GCM 암호화 주문, Postgres 영속 저장, Stripe 세션 검증, 주문별 HMAC 접근키.
- 웹훅 이벤트 영수증·결제 상태·고유 발급 작업은 하나의 트랜잭션으로 저장. 임대 시간으로 동시 발급을 막고, 실패 시 안전하게 재시도.
- 리포트와 PDF는 발급 시점의 전체 내용으로 고정하고 암호화하여 DB에 저장. 공개 파일 URL을 만들지 않음.
- 리포트·PDF는 주문 접근키를 Authorization 헤더로 보낸 POST 요청에서만 제공. 접근키·생년월일을 URL에 넣지 않음.
- 개인 입력은 Stripe 메타데이터로 보내지 않음. Stripe에는 임의 주문 ID·상품 종류·금액만 전달.
- 다운로드 응답은 no-store/private, attachment PDF.
- 기존 간이 stripe-checkout/stripe-verify 경로는 HTTP 410으로 종료.

## 실제 Stripe 테스트 실행 방법

```sh
node scripts/qa-sandbox.mjs https://<현재-Preview>.vercel.app
```

로컬의 gitignored `.env.payments.local`에 있는 비공개 테스트 접근키를 사용한다. 로그·결과 JSON에는 비밀키와 주문 접근키를 쓰지 않는다. 가상의 생년월일과 Stripe 테스트 카드 토큰만 사용한다.

테스트 카드 승인은 Stripe 공식 CLI fixture와 같은 방식으로 실행했다:
https://github.com/stripe/stripe-cli/blob/master/pkg/fixtures/triggers/checkout.session.completed.json

이 테스트 경로에는 Sandbox 키·비공개 테스터 키·해당 주문 접근키가 모두 필요하다. 실제 승인 결과는 다른 주문과 동일한 서버 검증을 거쳐야 하며 임의 paid 설정 기능은 없다.

## 운영 경계 및 남은 확인

- Production 배포는 기존 `69f00d4cc4b018a7757930709a6db0df60acab2d` 유지.
- `thefatekey.com` 운영 도메인·DNS 변경 없음. Preview만 배포.
- 실제 결제 활성화·live 키 사용·실제 카드 청구 없음.
- 코드와 DB 모두 live 결제를 거부. `VERCEL_ENV=production`에서는 닫힘.
- 구매자 접근키는 구매를 시작한 브라우저의 sessionStorage에 보관. 이메일 로그인·구매 복구·메일 전달은 이번 Sandbox 범위에 포함하지 않음.
- 직접 브라우저 카드 입력 화면 검증은 실행 환경의 `credential_state_unavailable` 오류로 수행하지 못했다. 새 실행 환경 재시도도 같은 오류. 실제 휴대폰 화면과 모바일 다운로드 동작은 별도 확인 필요.
- 실제 Stripe 결제 승인·서버 웹훅·온라인 리포트 응답·PDF 다운로드는 위 표대로 별도 API 경로에서 검증 완료.
- 운영 출시 전에는 환불 시 접근 취소, 구매 복구, 고객 안내·개인정보 정책, 운영 사업자 정보와 실제 결제 활성화 검수가 별도로 필요하다.

## 2026-10-21 구매 완료 화면 보완

직접 브라우저 연결을 다시 시도했으나 `credential_state_unavailable`이 계속 발생했다. 브라우저 카드 입력 화면과 실제 휴대폰 검수는 여전히 미완료다. 이를 실제 브라우저 검사 통과로 기록하지 않는다.

대신 구매 완료 화면의 API 응답 처리와 사용자 동작을 DOM 모의 환경(jsdom + React act)에서 검증하고 다음을 보완했다.

- 결제 확인·리포트 준비가 지연될 때 최대 6회 자동 재확인. 대기 간격은 1~5초로 총 15초이며, 네트워크 요청 시간은 별도다. 새 주문이나 새 Checkout Session을 생성하지 않는다.
- 자동 재확인 후에도 준비되지 않으면 상태를 설명하고 수동 재확인을 제공.
- 상품·주문 불일치 같은 영구 오류는 자동 재시도하지 않음. 내부 서버 코드 대신 고객용 문구를 표시.
- 페이지를 떠나면 결제 생성 요청과 리포트 재확인을 취소. 이전 화면의 응답 때문에 잘못된 상품 Checkout으로 이동하는 것을 방지.
- PDF 응답의 MIME과 `%PDF-` 파일 서명을 확인한 뒤 다운로드. 깨진 응답은 파일로 저장하지 않고 온라인 리포트를 유지.
- 모바일 브라우저 호환성을 위해 다운로드 링크를 DOM에 붙여 실행하고 제거. 임시 파일 URL도 해제.
- 주문 번호를 구매 완료 화면에 표시. PDF 다운로드 중에는 결제 확인과 구별되는 진행 문구 표시.
- 새 고객 안내 문구 5개는 6개 언어에 모두 추가.

검증 결과: 구매·리포트 화면 로직 13개, 언어 키 15개, 경로 15개로 관련 테스트 **43개 통과**. 기존 서버 결제·금액·상품 검증과 7개 Stripe Sandbox 승인 결과는 유지된다. 구매 완료 처리와 개발 테스트 환경을 수정했다. 추가로 배포 함수 컴파일러의 strict 옵션 차이에서도 삭제된 Stripe 상품을 명확히 식별하도록 타입 가드를 보완했다. 결제 금액·상품 검증 동작은 유지한다.

서버 회귀 재실행 한계: 이 후속 작업에서 PGlite 테스트 DB 초기화가 30초와 60초 제한에 걸려 해당 회귀 테스트 본문은 실행되지 못했다. 이를 서버 전체 재검증 통과로 기록하지 않는다. 기존 실제 Stripe Sandbox 승인 7건과 서버 통과 기록은 위 날짜의 결과다.

이번에 수정한 삭제 상품 거부 경로는 테스트 DB 없이 `PaymentService.report()`를 직접 호출하는 독립 검사에서 확인했다. Stripe가 삭제된 상품 객체를 반환하면 HTTP 409 `payment_order_mismatch`로 거부하며, 결제 상태 저장 함수를 호출하지 않았다. 추가로 배포 함수와 같은 비엄격 TypeScript 설정에서 `api/payments.ts`의 컴파일 검사를 실행하여 오류 없이 통과했다.

## 2026-10-21 최신 Preview 구매자 접근 재검증

사용자가 기존 테스트 주문 접근키를 해당 Preview로 전송하는 데 명시적으로 동의한 뒤 검사했다. 키는 출력하거나 저장소에 추가하지 않았다.

- 대상: https://saju-english-report-preview-nmsq5v60b-shopping-shorts-ai.vercel.app
- 배포 코드: `f4de3be4a29e35634dd9c6a92d2e4fc03396a8d9`.
- 실제 클라이언트 함수 `waitForPurchasedReport`와 `purchasedPdf`를 Node에서 실행하여 기존 Stripe Sandbox 구매 주문으로 배포 API에 접근했다. sessionStorage는 모의 환경이며 실제 브라우저 조작 검사는 아니다.
- 종합 상품: 전체 리포트 1개, PDF 53,154바이트. 본문과 PDF 파일 서명 검증 통과.
- 번들 상품: 전체 리포트 3개, PDF 158,059바이트. 본문과 PDF 파일 서명 검증 통과.
- 새 결제 생성·실제 카드 청구·실제 결제 활성화·운영 도메인 변경 없음.

이 결과는 최신 배포에서 기존 구매자의 리포트와 PDF 접근을 확인한 것이다. 위에 기록한 실제 휴대폰·브라우저 검수와 최신 서버 전체 회귀 테스트의 미완료 상태는 그대로 남아 있다.

## 서버 결제 회귀 재검증 완료 (후속 실행)

서버 결제 테스트 파일 전체 **26개 통과**, 종료 코드 0. 앞서 기록한 서버 회귀 미완료 상태는 이 후속 결과로 해소되었다. 저장소 전체 테스트 통과를 뜻하지 않으며 실제 휴대폰 검수도 별개다.

```sh
node node_modules/vitest/vitest.mjs run server/payments/payments.test.ts --pool=threads --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000 --reporter=verbose
```

- 첫 분리 실행에서 24개 통과, 2개 실패. 하나는 임의 암호문의 base64 문자열에 짧은 숫자 `1992`가 우연히 포함되어 실패한 비결정적 검사였다. 다른 하나는 번들 PDF 생성의 20초 제한이었다.
- 암호문 부분 문자열 검사를 제거하고 정확한 복호화 내용·PDF 바이트 일치, 다른 키 거부, 다른 주문 식별자 거부를 검증한다. 검사 범위를 줄이지 않고 암호화 검증을 강화했다.
- WASM 테스트 DB 준비와 PDF 생성 테스트의 시간 제한을 120초로 설정했다. 결제 서버·고객 화면·배포 런타임 제한은 변경하지 않았다.
- 수정 후 전체 26개를 재실행하여 127.16초에 모두 통과. 7개 상품의 전체 리포트와 PDF, 미결제·잘못된 접근키 차단, 결제 금액·상품·수량 검증(삭제 상품 포함), 동시 중복 처리, 실패 복구와 암호화 저장 검사를 포함한다.
- 실제 카드 청구·실제 결제 활성화·운영 도메인 변경 없음. 이 후속 변경은 테스트 코드와 검증 문서만 수정했다.
- 실제 브라우저·휴대폰 검수는 브라우저 실행 환경의 `credential_state_unavailable` 문제로 여전히 미완료다.
