# THE FATE KEY — 실결제 준비 검수

검수일: 2026-10-27 (Australia/Sydney). 판정: **CONDITIONAL — 실판매 시작 보류**.

## 실계정

- thefatekey 실계정: 결제/정산 활성, 사업자 정보 제출 완료. currently_due/past_due/pending_verification 모두 없음.
- AUD 기본 은행 계좌 등록. 계좌 상태 new. 주간 월요일 정산 설정, API의 delay_days=2. 실제 은행 입금 성공을 검증한 것은 아님.
- 고객 판매 가격은 모두 USD. 은행 정산 통화 AUD와 구분.
- 출시 준비용 실계정 webhook과 별도 운영 DB/암호화 키를 준비함. webhook은 최종 승인 전까지 disabled. 운영 Secret 등록은 확인했으나 새 제한 API 키의 실제 호출 권한과 운영 결제 흐름은 아직 미검증.
- 운영 사이트 availability는 closed. 이번 작업에서 실결제 청구, 운영 배포, 도메인 변경 없음.

## 승인된 상품 매핑

모든 상품과 기본 가격 활성. 코드의 기존 확정 가격과 일치. 가격 변경 없음.

| 상품 | USD | Product ID | 기본 Price ID |
|---|---:|---|---|
| Your Life, Your Destiny | 16.99 | prod_VTU4tKm4OYGJZK | price_1UV7CyGyUNAMaZunO59VP3Co |
| Are We Meant to Be? | 11.99 | fate_compatibility | price_1UV7DfGyUNAMaZun9bpbidw8 |
| What Awaits You This Year? | 9.99 | fate_year | price_1UV7DoGyUNAMaZunqAusMIJ8 |
| Success, Money & Your Future | 10.99 | fate_career | price_1UV7DxGyUNAMaZunZg1xiaCA |
| Born to Build a Business? | 11.99 | fate_business | price_1UV7E6GyUNAMaZun9HquBo1o |
| The Real You: Strengths & Weaknesses | 8.99 | fate_wellbeing | price_1UV7EFGyUNAMaZuncutcKC5R |
| Your Destiny Collection | 24.99 | fate_bundle | price_1UV7EOGyUNAMaZunY5kOA1kK |

과거 complete $14.99 가격 price_1UV6b9GyUNAMaZunNQjgiFnU는 앞선 승인 작업에서 비활성화됨. 이번 조회에서는 목록에 없고 개별 조회도 not found. 현재 활성 기본 가격은 $16.99 하나.

## 수정

- 기존 inline price_data 방식은 Sandbox에 유지.
- live 모드에 승인된 고정 Price ID 연결. 새 Checkout 생성 전에 Stripe에서 가격/상품을 조회하고 ID, USD, 금액, live 모드, 단건 가격, 활성 여부, 기본 가격을 검증. 다르면 Checkout 생성 차단.
- 결제 후에도 정확한 Price ID/Product ID, 수량, 금액, 주문 정보를 검증. 같은 가격의 다른 상품으로 바꾸는 공격도 차단.
- 과거 구매는 가격을 나중에 비활성화했다는 이유만으로 차단하지 않음. 실제 환불 여부로 접근 제어.
- 실제 키는 코드에 없음. 공개 상품 식별자만 서버 코드에 저장.

## 새 Preview 실험

Runtime commit: 65ac4ca6fec9cd3628234d515a75d9f92e194176.
Preview: https://saju-english-report-preview-r2m3m5hy1-shopping-shorts-ai.vercel.app

가상 출생정보만 사용. 테스트 수신자 delivered@resend.dev. 실제 돈 청구 없음.

| 상품 | Stripe Sandbox 결제 | PDF 다운로드 | 페이지 | 이메일 |
|---|---|---|---:|---|
| complete | PASS | PASS | 25 | Delivered |
| compatibility | PASS | PASS | 25 | Delivered |
| year | PASS | PASS | 28 | Delivered |
| career | PASS | PASS | 22 | Delivered |
| business | PASS | PASS | 22 | Delivered |
| wellbeing | PASS | PASS | 15 | Delivered |
| bundle | PASS | PASS, 리포트 3개 | 63 | Delivered |

7개 모두 주문 중복 재요청 방지, 미결제 차단, 타 주문 접근 차단, 재다운로드 PDF 바이트 동일 확인. 최신 r26 표기와 리포트 번호 확인. 궁합 요약 페이지 표본 시각 검수. 모든 페이지의 영어 편집 품질을 외부 독자가 검수했다는 의미는 아님.

결제 거절/만료는 402로 리포트 차단. 접근 코드 누락 401, 가격 조작 400, 잘못된 상품 400, 다른 origin 403, 과대 요청 413, 위조 webhook 400 확인.

wellbeing 가상 주문 전액 테스트 환불 succeeded. webhook 환불 기록 확인, report와 pdf 요청 모두 403 purchase_refunded. 이미 저장한 고객 파일을 원격 삭제하는 기능은 아님.

7건 이메일 DB sent/attempts=1, Resend 목록 Delivered 확인. 테스트용 수신 서비스 결과이며 실제 고객 메일함/스팸함 도착 보장은 아님.

자동 검사: 64개 파일/842개 테스트 통과. 별도 추가 PDF 렌더러 실패/재시도 회귀 테스트 1개 통과. 타입 검사와 Vite/public page 빌드 통과. 중복 webhook, 발급 저장 실패, 이메일 실패/재시도, DST와 시간 미상 및 월/연 경계 관련 검사는 자동 테스트 범위.

브라우저: 7개 상품 구매 링크 목적지와 USD 가격 확인. 연도 상품에서 출생정보 입력→결제 준비 화면 전환 확인. 운영 사이트는 판매 미개방 문구 유지. 실제 iOS/Android 휴대폰에서 Checkout 왕복은 미검증.

## 최종 설정 확인 (2026-10-27 UTC 11:49)

- 사용자가 직접 등록한 STRIPE_LIVE_SECRET_KEY: Production 전용 sensitive 확인. 값을 읽거나 보고서에 기록하지 않음.
- STRIPE_LIVE_WEBHOOK_SECRET, FATE_PAYMENTS_LIVE_DATABASE_URL, FATE_LIVE_ORDER_DATA_KEY, FATE_LIVE_ORDER_ACCESS_KEY: Production 전용 sensitive 확인.
- FATE_PUBLIC_OPERATOR_NAME=FATE KEY 저장 및 재조회 확인. 사용자 제공 ASIC 등록증의 사업자명 기준. 고객 브랜드 THE FATE KEY는 유지.
- 별도 운영 DB: payments-live 브랜치 / fate_payments_live. 준비 시 스키마와 빈 주문 테이블, 앱 역할 읽기 권한 검증. 고객 데이터 사용 없음.
- 출시 준비용 webhook we_1UV7p4GyUNAMaZunST5K1X54는 준비 시 disabled 확인. 최종 승인 전 활성화하지 않음.
- FATE_CHECKOUT_OPEN=false, FATE_SALES_POLICIES_READY=false 확인. Production에 live 모드 미설정.
- 운영 availability 재조회: available=false, mode=closed.
- 최신 Preview availability 재조회: available=true, mode=test, emailDeliveryReady=true, customerRecordsReady=false. 홍보용 고객 정보 저장 준비 완료로 판정하지 않음.

## 남은 출시 조건

1. 새 제한 실계정 키의 API 호출 및 권한 검증. Secret 등록 여부만으로 작동 성공을 판정하지 않음. Secret 값을 복원하거나 Preview로 복사하지 않음.
2. 판매자 정보가 표시되는 최종 운영 빌드와 판매 정책 검수. FATE_SALES_POLICIES_READY는 검수 완료 전 false 유지.
3. 사용자의 명시적 최종 승인 후 운영 배포, live 모드 설정과 webhook 활성화 및 구매 공개. 이번 마무리 요청을 실제 판매 시작 승인으로 해석하지 않음.
4. 실제 휴대폰에서 구매/취소/복구/다운로드 확인. 실제 수신 메일함 도착 확인. 실계정의 실제 청구와 은행 정산은 별도 명시 승인 없이는 테스트하지 않음.

판정은 CONDITIONAL. Sandbox 7개 상품 발급/전달은 통과했지만 실계정 운영 검증은 미완료. 운영 배포와 실제 청구, 도메인 변경은 수행하지 않음.

## 사용자 출시 승인 후 운영 검증

사용자가 실제 판매와 운영 배포를 명시적으로 승인함. c336b70 운영 배포 READY 및 thefatekey.com 별칭 확인.
새 서버 진단에서 stripeKeyFormat=false, webhookSecretFormat/dataKeyFormat/accessKeyFormat/keysDistinct/operatorPresent=true 확인.
따라서 실제 키 값의 잘못된 복사 또는 종류/형식 오류를 사용자가 직접 수정해야 함. Secret 값을 읽거나 출력하지 않음.
구매 공개 스위치와 정책 게이트 false 유지, 실제 청구 없음. webhook은 잠시 활성화한 뒤 키 오류 확인 후 다시 비활성화.
정식 판매 미완료. 수정 코드의 타입 검사 및 관련 테스트 46개 통과.
