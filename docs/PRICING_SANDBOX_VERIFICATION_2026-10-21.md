# 가격 인상과 실제 Sandbox 주문 금액 검증

검증 Preview: https://saju-english-report-preview-71d4otzco-shopping-shorts-ai.vercel.app/#reports
배포: dpl_5meirbNF2FjhAgWJPqHwLHQQFT11
코드: a9085aba6f996b7da4052d1947fabafe59c2e4d1
브랜치: feature/english-saju-report-20261013
프로젝트: saju-english-report-preview

| 상품 | USD |
|---|---:|
| complete | 16.99 |
| compatibility | 11.99 |
| year | 9.99 |
| career | 10.99 |
| business | 11.99 |
| wellbeing | 8.99 |
| bundle | 24.99 |

모든 가격은 이전보다 USD2 인상했다. 화면과 서버가 같은 정수 센트 가격표를 사용한다. 패키지의 개별 합계는 USD38.97, 절약액은 USD13.98이며 과장하지 않도록 할인율을 내림해35%로 표시한다.

## 원격 검증 결과

가상 출생 정보로 실제 Stripe Sandbox Checkout 세션을 상품별로7개 생성했다. 각 주문의 status API는 Stripe에서 세션과 line items를 다시 조회하고 상품 metadata, 수량, 통화, 금액을 확인했다. 반환된 모든 주문의 kind/amount/currency가 위 표와 일치했다. 모두 pending이며 결제 확인/청구는 하지 않았다. 운영 결제와 운영 도메인은 변경하지 않았다. 기존 주문이나 기존 암호화 리포트는 변경하지 않았다. 접근키나 Checkout URL은 이 문서에 저장하지 않는다.

## 발견해 수정한 배포 오류

1. 서버 report 모듈이 TSX 카드 컴포넌트의 컴파일된 JS를 찾지 못해 함수 초기화에 실패했다. 공통 카드 구현을 plain TypeScript createElement 모듈로 옮겼다. 기존 화면 import는 얇은 재노출 파일로 유지해 같은 레이아웃을 사용한다.
2. 커밋 SHA를 gitSource.ref로 사용하면 개발 브랜치 한정 Sandbox 환경변수가 적용되지 않았다. gitSource.ref에는 실제 개발 브랜치를 사용하고 배포의 실제 commit SHA를 확인했다. 환경변수의 대상 범위를 넓히거나 비밀값을 공개하지 않았다.

수정 후 접근키 없는 status 요청은 정상적으로404 order_not_found를 반환한다. 최초의500 FUNCTION_INVOCATION_FAILED와 이후503 payments_closed를 해소했다.

## 자동 검사

가격/결제 검사31개 통과. 서버 카드 모듈 수정 후 결제/카드 검사33개 통과. TypeScript와 변경 파일 ESLint 통과. 일반 Node에서 결제 모듈을 직접 import하는 검사 통과. Preview 배포 READY. 원격 테스트 주문7개 모두 새 가격 일치.

이번 검증은 Sandbox 주문 생성과 금액 확인이다. 결제 완료, 유료 리포트 재발급, 실제 돈 청구를 수행한 검증으로 해석하지 않는다.
