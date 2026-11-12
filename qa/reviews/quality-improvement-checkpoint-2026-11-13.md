# THE FATE KEY — 품질 개선 체크포인트

- 작업 브랜치: `work/final-report-repair-20261111`
- 시작 SHA: `046f8975f867cbd787ae2f5b6c55996cadce85f3`
- 이번 범위: 유료 리포트 본문 생성 로직. PDF 렌더러, 디자인, 운명카드는 실행하거나 변경하지 않음.
- 기준: 같은 차트에서 자연스럽게 반복될 수 있는 표현은 억지로 고치지 않음. 질문 적합성, 직접 답변, 차트 근거와의 일치에 집중.

## 실제 생성 코드 수정

- `src/report/buyer-outline.ts`: Product 04의 `career-theme` 답변에서 올해의 추가 요구와 고객의 평소 업무 성향을 분리했다. 평소 패턴을 “usual work pattern”으로 명시하고, 올해의 긴급 요구를 영구적인 진로 적합성 변화처럼 읽지 않게 했다.
- `src/report/category-readings.ts`: Product 07의 가장 큰 기회 답변을 개인별 차트 업무 테마에 연결하고, 향후 3년 우선순위 답변을 자연스러운 문장으로 정리했다. 별도 연도별 산출이 없는 범위는 2027년 연간 비교만 있다고 투명하게 밝혔다.
- Product 04와 07 모두 실제 주문 경로인 `prepareReportContent`로 영어 답변 텍스트를 다시 생성했다. PDF는 생성하지 않았다.

## 실제 문장 비교

Product 04, Profile 1, Q4:

- 이전: `Your work side centres on finding new customers. Start with a role that makes use of this strength.`
- 수정: `Your usual work pattern centres on finding new customers. Start with a role that makes use of this strength. This differs from this period’s demanding-work theme, so treat extra urgency as a temporary demand rather than a change to your usual career fit.`

Product 07, Profile 1, Q2:

- 이전: `Your clearest opportunity is to make your contribution in finding new customers visible.`
- 수정: `Your strongest opportunity is a work path centred on finding new customers, where your contribution can be seen and trusted.`

Product 07, Profile 1, Q7:

- 이전: `For the next three years, prioritise crisis handling, competitive sales and demanding technical work at work. Check that your duties and authority match the demands you accept.`
- 수정: `For the next three years, let finding new customers guide your work choices and make room for being heard before someone offers a solution in close relationships.`

## 평가 상태 정정

- 기존 수동 검토 기록의 Product 05·06 점수는 제안된 다른 질문 맵을 기준으로 매긴 오류가 있어 무효화했다. 공식 유료 질문 기준으로 재검토하기 전까지 `VERIFY`다.
- Product 04·07의 기존 점수는 답변 생성 코드 변경 전 점수이므로 현재 결과의 점수로 재사용하지 않는다. 두 상품 모두 `VERIFY`다.
- 현재 기록에서 Product 01–03만 이전 텍스트 채점이 유효하다. 이는 PDF 전체 100점 평가가 아니며 95점 달성 완료를 뜻하지 않는다.
- Product 04·07의 새 텍스트는 생성했으나 전 문항 재채점은 아직 끝나지 않았다. 전체 35개 리포트가 각각 95점 이상이라고 판정하지 않았다.

## 검증

- `npx vitest run src/report/category-readings.test.ts server/payments/product04-07-review-text.test.ts --reporter=dot`: 17 tests passed.
- 이 검증은 질문 수, 유료 생성 경로 텍스트, Product 04 career-layer 문구, Product 07 Q2/Q7 관련 회귀 조건을 확인한다. 콘텐츠 독립 점수는 아님.
- `npx --yes --package=bun -- npm run build`: 통과. Vite의 기존 chunk-size 및 static/dynamic import 경고는 남음.
- GitHub 저장 및 Preview 재배포는 커밋 후 상태를 별도로 기록한다.
