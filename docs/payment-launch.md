# 운영 결제 연결 및 구매 복구

현재 배포는 일반 고객의 실제 결제를 열지 않는다. 테스트 결제와 운영 결제는
별도 Stripe 키, 주문 암호화키, 접근키, 데이터베이스를 사용한다.

## 운영 연결

1. 운영자가 Stripe 본인 확인, 정산 계좌, 업종·세금 설정을 확인한다.
2. 새 운영 전용 Postgres 데이터베이스를 만들고 `server/payments/live-schema.sql`로 초기화한다.
   Preview 데이터베이스에는 이 파일을 실행하지 않는다.
3. `.env.payments-live.example`의 비밀값을 Vercel Production에만 설정한다.
   `FATE_CHECKOUT_OPEN=false`, `FATE_SALES_POLICIES_READY=false`를 유지한다.
4. Stripe 운영 대시보드에서 예제 파일에 적힌 웹훅 주소와 5개 이벤트를 등록한다.
   운영 웹훅 서명키를 Production에 저장한다. Sandbox 자동등록 API는 운영에서 사용할 수 없다.
5. 실제 운영자 표시, 개인정보 보관·삭제 기간, 판매 지역의 세금 및 소비자 안내를 확정하고
   현재 무료 서비스 기준의 홈페이지·FAQ·공개 페이지 문구를 판매 상태에 맞게 검수한다.
   운영자 정보가 확정되지 않은 상태에서 판매 준비 완료로 표시하지 않는다.
6. 위 사항과 운영자 판매 시작 승인이 완료된 배포에서만 두 판매 스위치를 `true`로 바꾼다.
   실제 주문 생성 전 서버는 Stripe의 결제·정산 활성화 여부도 확인한다.

운영 구매는 지정된 운영 도메인과 올바른 Origin에서만 생성할 수 있다. 플랫폼 IP를
원문 저장하지 않고 시간 단위 해시로 처리해 시간당 12개 checkout 요청으로 제한한다.
`fate_checkout_quota`의 2일 이상 된 행은 정기 정리한다. 같은 요청키로 재시도하면 기존
주문을 재사용한다. 전체 결제 모드가 아닌 `FATE_CHECKOUT_OPEN`만 꺼야 기존 구매 접근이 유지된다.

## 구매 복구

결제 준비 → 복구 코드 파일 저장 → 저장 확인 → Stripe 결제 → 검증된 리포트/PDF 순서다.
복구 코드는 `FK1.주문번호.주문접근키`이며 생년월일이나 카드정보를 넣지 않는다.
접근키는 URL·활동 집계·메일에 넣지 않는다. 서버가 주문별 서명과 실제 결제를 검증한다.

기본적으로 해당 탭에만 키를 보관한다. 고객이 개인 기기에서 기억하기를 선택하면
localStorage에도 보관한다. 다른 기기에서는 `/#purchase`에 저장한 코드를 직접 입력한다.
자동 이메일 발송이나 이메일 기반 자동 복구는 구현하지 않았으며 제공한다고 표시하지 않는다.
코드 분실 문의는 운영자가 결제를 확인한 후 처리해야 한다. 코드나 카드번호를 요청하지 않는다.

## 환불

환불 실행은 Stripe 대시보드에서 운영자가 처리한다. 사이트에 공개 환불 실행 API는 없다.
서명된 `charge.refunded` 알림과 Stripe 서버 재조회로 주문·금액·통화·모드를 대조한다.
전액 환불은 이후 온라인 리포트와 PDF 접근을 중지한다. 부분 환불은 자동 중지하지 않는다.
이미 내려받은 파일을 삭제할 수 있다고 주장하지 않는다. 소비자 권리를 일괄 배제하지 않는다.

참고: https://docs.stripe.com/api/events/types
https://docs.stripe.com/api/accounts/object
https://www.accc.gov.au/consumers/problem-with-a-product-or-service-you-bought/repair-replace-refund-cancel
