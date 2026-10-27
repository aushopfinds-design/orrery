# THE FATE KEY — 실결제 준비 검수

검수일: 2026-10-27 (Australia/Sydney). 판정: **CONDITIONAL — 실판매 시작 보류**.

## 실계정

- thefatekey 실계정: 결제/정산 활성, 사업자 정보 제출 완료. currently_due/past_due/pending_verification 모두 없음.
- AUD 기본 은행 계좌 등록. 계좌 상태 new. 주간 월요일 정산 설정, API의 delay_days=2. 실제 은행 입금 성공을 검증한 것은 아님.
- 고객 판매 가격은 모두 USD. 은행 정산 통화 AUD와 구분.
- 실계정 webhook endpoint는 현재 없음. 운영 Vercel에 실결제 키, 서명 비밀값, 별도 주문 DB 및 암호화 키가 없음.
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

## 남은 출시 조건

1. 사용자가 Stripe 실계정 제한 API 키를 Vercel 서버 Secret에 직접 등록. 채팅에 비밀키 전달 금지.
2. 운영용 별도 DB/암호화 키, 판매자 공개 정보와 판매 정책 확인.
3. 최종 승인 후 운영 배포 및 실계정 webhook 등록/서명 Secret 저장, 구매 공개 스위치 활성화.
4. 실제 휴대폰에서 구매/취소/복구/다운로드 확인. 실계정의 실제 청구와 은행 정산은 별도 명시 승인 없이는 테스트하지 않음.

승인 전까지 Production과 도메인은 변경하지 않는다. 상품 카탈로그와 Sandbox 통과만으로 실판매 PASS를 선언하지 않는다.
