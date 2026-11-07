# THE FATE KEY — 7개 상품 질문별 품질 채점

- 검수일: 2026-11-07 (Australia/Sydney)
- 기준: `docs/REPORT_QUALITY_STANDARD.md`의 100점 기준 — 질문 직접 답변 50, 개인화 20, 쉬운 영어 15, 중복·불필요한 조언 10, 일관성·정확성 5.
- 검수 자료: `tmp/upgrade-pdfs-final-reviewed/`에서 이번 수정 후 다시 생성한 PDF 7개. 입력은 출생시간 미상인 New York 출생 1998-03-25 프로필 1건이며, 커플 상품의 상대 프로필은 London 출생 2000년 프로필임.
- 채점은 실제 PDF의 질문별 답변을 읽은 편집자 판단이다. 사주 근거가 여러 질문에 반복되더라도 각 질문에서 다른 의미를 설명하면 감점하지 않는다. 한 답변 안에서 같은 설명을 되풀이해 답을 흐릴 때만 감점한다. 이 점수는 자동 규칙 점수나 고객 만족도 점수가 아니며, 독립 출생 프로필 재현성 검수도 아니다.
- 실제 PDF 질문 블록: 01–06 각 7개, 07 10개 = **총 52개**. ‘49개’와는 불일치하므로 실제 확정 제품 구성(7×6+10)에 따라 52개를 채점했다.
- PDF는 Poppler로 7개 파일의 4쪽을 렌더링했고, 수정된 연간 PDF 5쪽과 궁합 PDF 7쪽도 화면으로 확인했다. 텍스트를 추출해 전체 질문과 답변을 대조했다. 모든 페이지의 모바일/A4 시각 검수와 Destiny Card 별도 검수는 하지 않았다. 텍스트 추출에서 겹쳐 보인 문장은 PDF 화면에 실제로 중복 출력되지 않은 것을 확인해 중복 감점에서 제외했다.

## 상품별 결과

| 상품 | PDF | 질문 수 | 질문 점수 평균 | 95점 판정 |
|---|---|---:|---:|---|
| 01 — Your Life, Your Destiny | `complete.pdf` | 7 | **93.4/100** | 미달 |
| 02 — Success, Money & Your Future | `career.pdf` | 7 | **92.0/100** | 미달 |
| 03 — Are We Meant to Be? | `compatibility.pdf` | 7 | **93.1/100** | 미달 |
| 04 — Your Next 12 Months | `year.pdf` | 7 | **91.7/100** | 미달 |
| 05 — Born to Build a Business? | `business.pdf` | 7 | **91.6/100** | 미달 |
| 06 — The Real You: Strengths & Weaknesses | `wellbeing.pdf` | 7 | **93.0/100** | 미달 |
| 07 — Your Destiny Collection | `bundle.pdf` | 10 | **92.4/100** | 미달 |

각 질문 점수는 5개 항목(50/20/15/10/5)의 우선순위를 적용한 편집자 종합 점수다. 항목별 하위 점수를 임의로 만들어 합산하지 않았다. 평균은 표시용이고 질문별 미달을 상쇄하지 않는다. 점수는 목표에 맞춰 보정하지 않았다.

## 01 — Your Life, Your Destiny

PDF: `complete.pdf` · 평균 **93.4/100** · 질문 7개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | What kind of person am I? | 93 | 핵심 성향을 첫 문장에 답하고 차트 특징과 연결한다. 뒤 설명은 여러 생활 주제로 넓어져 초점이 조금 흐려진다. |
| 2 | What helps me thrive, and what can hold me back? | 92 | 강점과 주의점을 모두 답한다. 같은 차트 성향을 두 질문에 쓰는 것은 허용하되, 각 질문의 의미가 달라야 한다. |
| 3 | What kind of career suits me? | 94 | 맞는 업무 유형을 구체적으로 답하고 반복된 월주 근거를 직업 적합성으로 해석한다. 이직 점검 조언은 다소 일반적이다. |
| 4 | How does money work in my life? | 93 | 정기 수입과 거래형 수입의 두 경로를 명확히 답한다. 설명은 조금 길지만 질문별 의미를 보탠다. |
| 5 | What is my pattern in love? | 94 | 관계에서 필요한 배려를 직접 말하고 예측처럼 단정하지 않는다. 한자 용어는 쉬운 영어 설명에 추가 가치를 거의 주지 않는다. |
| 6 | What are my biggest life challenges? | 94 | 일과 관계의 필요를 연결해 별도 삶의 과제를 설명한다. Q5와 같은 사주 근거의 재사용은 새로운 교차 해석을 제공하므로 반복 감점하지 않았다. |
| 7 | When may my life change direction? | 94 | 2032를 점검 시기로 직접 제시하고, 반복되던 두 번째 설명을 제거해 후속 의미만 남겼다. 실제 사건 예측이 아니라 검토 시기라는 점을 명확히 한다. |

## 02 — Success, Money & Your Future

PDF: `career.pdf` · 평균 **92.0/100** · 질문 7개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | Which careers suit me best? | 93 | 영업·고객 개발 등 구체적인 직무를 직접 답하고 차트의 고객 확장 성향과 연결한다. |
| 2 | Am I better suited to employment or independent work? | 92 | 고용 형태를 직접 선택하고 독립 업무보다 고용이 더 뒷받침되는 이유를 비교한다. 일부 표현은 추상적이다. |
| 3 | How do I naturally make money? | 93 | 정기 수입과 프로젝트 수입을 나눠 답하며 실제 소득을 약속하지 않는다. 다소 압축할 수 있다. |
| 4 | What tends to block my financial progress? | 93 | 수입 활동과 훈련·지원이 같은 시간이나 돈을 요구할 때 남는 수입이 줄 수 있다고 직접 답한다. 실제 재정 문제의 원인이라는 단정은 피하고, 답변과 한계 설명의 중복도 줄였다. |
| 5 | When might my career or money situation improve? | 91 | 계산에서 뚜렷한 개선 연도가 없다고 직접 답한다. 확인된 업무 부담의 의미를 더 개인적으로 풀 수 있다. |
| 6 | What do the next ten years suggest for my work and money? | 90 | 10년 흐름과 소득 상승을 단정할 수 없다는 점을 답한다. 선택한 해의 차이를 설명하는 비교가 부족하다. |
| 7 | What is the most important insight for my future? | 92 | 업무와 수입의 연결을 설명하고 실제 보수는 차트가 정하지 않는다고 구분한다. |

## 03 — Are We Meant to Be?

PDF: `compatibility.pdf` · 평균 **93.1/100** · 질문 7개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | What makes us compatible? | 92 | 두 사람이 공유하는 배려 욕구와 기다림이 생길 수 있는 점을 말한다. 전체 궁합을 한 문장으로 정리하면 더 직접적이다. |
| 2 | Why are we attracted to each other? | 93 | 각자의 끌림을 구분해 개인화하고, 실제 감정을 단정하지 않는다. |
| 3 | What tends to cause friction between us? | 94 | 갈등이 생기는 구체적인 대화 패턴을 두 사람별로 직접 설명한다. |
| 4 | How do we express love differently? | 95 | 두 사람의 사랑 표현과 맞는 대화를 구분해 설명한다. 화면 검수에서 실물 PDF에 문장 중복이 없어 감점하지 않았다. |
| 5 | How do emotional closeness and everyday compatibility differ? | 93 | 정서적 친밀감과 일상 적합성을 각각 비교하고 두 사람의 필요를 개인화한다. 두 영역에서 유사한 비결합 판정이 나온 것은 차트 결과로 보고 감점하지 않는다. |
| 6 | Which upcoming periods may affect our relationship themes? | 92 | 2030이 사용자 차트에서만 표시된 기간이라고 첫 문장에서 분명히 제한한다. 상대방이나 두 사람의 공동 사건 날짜로 오해하지 않도록 한다. |
| 7 | What does this connection ask of each of us? | 93 | 두 사람에게 서로 다른 관계 과제를 제시한다. ‘맹점’ 표현과 마무리 합의 제안은 구체성이 더 필요하다. |

## 04 — Your Next 12 Months

PDF: `year.pdf` · 평균 **91.7/100** · 질문 7개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | What is the overall theme of my next 12 months? | 91 | 업무와 관계의 연간 주제를 한 문장으로 직접 종합하도록 고쳤다. 쉬운 말이지만 업무 유형 목록은 길고, 중요도 순위가 더 분명하면 좋다. |
| 2 | What should I focus on most this year? | 93 | Q1의 테마를 반복하지 않고, 역할·기준·권한이 분명한 일을 우선하라고 별도 행동 초점을 준다. |
| 3 | What does it suggest for money? | 90 | 연간 기간, 책임에 따른 재정 압박, 직접적인 재물 주제의 달을 구분한다. 핵심 재정 포인트를 더 앞세울 수 있다. |
| 4 | What does this period suggest for my career? | 92 | 올해의 직무 성향과 권한·자원 조건을 설명한다. 장기 직업 답변과 일부 해석을 공유하지만 연간 맥락이 별도 가치를 준다. |
| 5 | What does it suggest for love? | 91 | 올해 관계에서 중요한 약속과 속도 조절을 답한다. 특정 사건 예측이 아니라 연간 관계 주제라는 점을 더 선명하게 할 수 있다. |
| 6 | Which months have more supportive chart relationships? | 93 | 계산 조건을 모두 만족한 달이 없다는 답과 그것이 기회가 없다는 예측은 아니라는 점을 쉬운 말로 함께 설명한다. 뒤의 달별 해석은 여전히 다소 빽빽하다. |
| 7 | Which months require closer attention? | 92 | 주의할 달과 실제 업무 약속의 유형을 연결하고 나쁜 사건을 예언하지 않는다. 목록이 다소 빽빽하다. |

## 05 — Born to Build a Business?

PDF: `business.pdf` · 평균 **91.6/100** · 질문 7개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | Does my chart support business-oriented traits? | 91 | 고객 확보 강점과 거래 후 관리 부담을 직접 답한다. 출생 시간 미상에 따른 한계를 정확히 알린다. |
| 2 | What kind of business work suits me? | 92 | 고객군과 작은 판매 제안을 구체적으로 답한다. 2034–35는 시험해 볼 시기로만 제시하고 확장 약속과 구분한다. |
| 3 | Am I better suited to working alone or with partners? | 94 | 파트너가 유리한 경우와 혼자 일하는 편이 단순한 경우를 첫 답변에 직접 비교하도록 고쳤다. |
| 4 | What financial risks should I understand? | 92 | 새 거래 대금을 기존 고객의 납품 비용으로 미리 쓰는 위험을 차트 맥락으로 구체화한다. |
| 5 | When might expansion deserve a closer look? | 88 | 2034–35 검토 시기와 확장 조건을 함께 답한다. 계산 결과는 별도 독립 검증을 하지 않아 정확성 승인은 보류다. |
| 6 | What do my upcoming cycles suggest about business activity? | 93 | Directly says no cycle/date is available, but leaves the customer without a useful description of what is covered by ‘calculated range’. |
| 7 | What should I be careful about in business? | 91 | 부담이 커질 수 있는 해를 실패 예측과 구분해 제시한다. 각 해의 계산 근거는 독립 검증이 필요하다. |

## 06 — The Real You: Strengths & Weaknesses

PDF: `wellbeing.pdf` · 평균 **93.0/100** · 질문 7개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | What is my core personality? | 92 | 핵심 성향을 직접 말하고 차트 특징으로 한정한다. 뒤의 생활 주제는 조금 넓다. |
| 2 | Which parts of my nature stand out? | 93 | 업무 역할과 가까운 관계의 필요를 구분해 개인화한다. 오행 개수만으로 능력을 판정하지 않도록 정확히 제한한다. |
| 3 | What tends to put me under pressure? | 93 | 퇴근 후에도 고객 확보를 요구받는 장면처럼 개인 차트와 연결되는 구체적인 압박 상황이다. |
| 4 | What should I watch for when pressure builds? | 92 | 압박을 촉발하는 상황과 실제 반응을 별도 질문으로 답한다. 열린 업무가 많아질 때의 영향은 한 문장 더 구체화할 수 있다. |
| 5 | What do I need most in relationships? | 95 | 경청과 해결책 제시 전에 들어주는 지원을 답하고 관계와 무관한 업무 환경 설명을 제거했다. 고객 질문에 맞는 근거와 실제 PDF 출력을 확인했다. |
| 6 | How can my strengths become blind spots? | 92 | 차트 성향이 강점에서 오해로 바뀌는 상황을 간결하게 답한다. 실제 결과를 조금 더 설명할 수 있다. |
| 7 | What boundary could help protect my everyday balance? | 94 | 업무 요청을 수락하기 전에 이미 맡은 일과 무엇을 미룰지 말하는 문장으로 고쳤다. 관계 요구를 섞지 않아 질문에 더 맞는다. |

## 07 — Your Destiny Collection

PDF: `bundle.pdf` · 평균 **92.4/100** · 질문 10개

| # | 고객 질문 | 점수 | 감점 근거 / 다음 수정 방향 |
|---:|---|---:|---|
| 1 | What kind of person are you at your core? | 93 | 핵심 성향을 직접 말하고 차트 근거와 연결한다. 한자 사주 용어는 줄일 수 있다. |
| 2 | Which strengths help you most, and what can get in your way? | 92 | 강점과 방해 요소를 각각 답하고 생활 장면을 든다. 완벽을 기다린다는 해석의 차트 연결을 보강할 수 있다. |
| 3 | What kind of work is the best fit for you? | 94 | 맞는 직업 역할을 직접 제시하고 차트에서 고객 확장 신호가 반복된다는 근거를 붙인다. |
| 4 | How are you most likely to earn and manage money? | 93 | 정기 수입과 거래 수입의 차이를 답하고 실제 금액은 차트가 정하지 않는다고 알린다. 현금 관리 조언은 답의 일부로 유지한다. |
| 5 | What do you need from a close relationship? | 91 | 관계에서 필요한 배려를 직접 답한다. 짧은 대신 차트 근거 설명은 포함 리포트에서 이어진다. |
| 6 | How do you and your partner fit together? | 92 | 두 사람의 필요 차이와 차트의 결합·마찰 신호를 설명한다. 전체 관계의 결론 문장이 더 단순하면 좋다. |
| 7 | What recurring challenge deserves your attention? | 92 | 업무의 완성도 추구가 관계에서 듣고 싶은 필요와 충돌할 수 있다는 교차 해석이다. 차트 성향의 재사용 자체는 감점하지 않는다. |
| 8 | What should you know about the next 12 months? | 92 | 업무·돈·관계의 연간 흐름을 요약하고 과한 예측을 피한다. 각각의 주제가 나열되어 종합 우선순위는 보강할 수 있다. |
| 9 | When could a longer-term life or work shift deserve attention? | 91 | 계산된 긴 주기와 대략적 날짜를 불확실성과 함께 제시한다. 수정 후 날짜 표현이 자연스러워졌지만 특정 사건 예측은 아니다. |
| 10 | How do these parts of your life connect? | 94 | 일·수입·납품·관계 필요를 하나의 연결로 요약하고 기간의 공동 압박 신호를 덧붙인다. 정보가 많아 중심 문장을 더 짧게 할 수 있다. |

## 재검수 2차 — 수정 및 채점 기준 반영

- 반복 규칙 수정: 사주상 같은 근거가 성격·관계·업무 등 서로 다른 질문을 뒷받침하면 의미상 필요한 반복으로 인정한다. 질문별 점수에서 자동 감점하지 않는다. 같은 질문 안에서 근거 설명을 그대로 되풀이해 답의 가치를 더하지 않을 때만 감점한다.
- 실제 PDF 화면 검수 결과, 일부 PDF 텍스트 추출에서 같은 줄이 두 번 보였지만 렌더링 화면에는 한 번만 보였다. 해당 부분은 중복 감점에서 제외했다.
- 코드 수정: 연간 질문의 첫 답을 업무와 관계의 두 핵심 주제로 직접 정리; 연간 우선순위 질문을 독립 행동 답변으로 분리; 동업 질문에서 파트너가 유리한 조건과 독립 업무 조건을 직접 비교; 장기 사업 주기 부재 설명을 쉬운 문장으로 개선; Product 01 turning-point 답변에서 같은 해석의 두 번째 반복을 제거; Product 06 경계 질문에서 업무와 무관한 관계 조언을 제거; Product 07 통합 질문을 일·수입·관계·기간 신호로 간결하게 정리.
- 수정 파일: `src/report/buyer-outline.ts`, `src/report/category-readings.ts`, `src/report/chart-verdicts.ts`, `src/report/purchase-narrative.ts` 및 해당 리포트 테스트 파일 3개.
- 실제 검증: 리포트 단위 테스트 **60/60 통과**, 유료 PDF 생성 통합 테스트 **1/1 통과**(7개 PDF 생성 및 질문/내비게이션 확인), 마스터 PDF 생성 통합 테스트 **1/1 통과**(3개 출생 프로필 × 7개 상품 = 21개 PDF 생성/열기/문항 구조 확인), `npx tsc -b --pretty false` 통과, `git diff --check` 통과. 자동 진단은 Product 01/02 외 5개에서 95점 게이트를 통과하지 못했고, 계산 검증/문단 검토 등의 사람이 볼 항목을 남겼다. 이 자동 점수는 아래 편집자 점수와 별개다.
- 새 PDF 폴더: `tmp/upgrade-pdfs-final-reviewed/`. 이번 편집자 점수는 한 출생 프로필을 기준으로 유지했다. 별도로 3개 프로필에서 7개 상품 PDF 21개를 생성하고 열기/질문 구조를 확인했으며, 이는 다중 프로필 의미 검수가 아니다.
- 편집자 점수는 1차보다 높아진 항목이 있지만 **7개 상품 평균은 아직 모두 95 미만**이다. 95점 완료로 표시하지 않는다.

## 다음 수정 후보 — 아직 남은 감점

아래는 최신 PDF에서 아직 남은 내용 문제다. 다음 반복에서 우선 검수할 항목이다.

1. **상품 03, Q6 — 다른 출생 프로필에서도 관계 시기 표현 확인**
   실제 시작: “The only period flagged in this five-year comparison is 2030 for you.”
   남은 점: 해당 프로필에서는 범위를 정확히 밝혔지만, 상대방만 신호가 있거나 양쪽 모두 있는 경우에도 문장이 자연스럽고 정확한지 추가 프로필 검증이 없다.
   다음 수정: 상대방만/양쪽 모두/아무도 없음 경우를 각기 생성해 문구와 연도를 확인한다.
2. **상품 05, Q5/Q7 — 시기 신호와 독립 계산 확인**
   실제: 2034–35 확장 검토, 2026·2031·2032 추가 부담.
   남은 점: 각 시기는 위험·성공의 예측으로 한정하지 않았지만, 별도의 독립 계산 대조를 아직 하지 않았다.
   다음 수정: 검증된 연도만 남기고, 각각 어떤 비교 신호인지 쉬운 영어로 설명한다. 계산 불일치는 고객 문구에서 확정하지 않는다.
3. **상품 07, Q8/Q10 — 번들 종합 문장의 우선순위**
   남은 점: 각 질문은 연간 테마와 일·수입·관계 연결을 답하지만 여러 영역이 한 블록에 있어 요지가 늦게 드러날 수 있다.
   다음 수정: 첫 문장에 한 줄 결론을 두고, 차트 근거·시기 한 가지를 짧게 덧붙인다. 포함 리포트의 반복 자체는 감점하지 않는다.

## 자동 검사와 내용 채점 구분

- 이전 PDF 생성 테스트는 7개 파일 생성과 질문 수를 확인했다. 해당 테스트의 구조 QA는 01·02가 100, 03–07은 70으로 기록됐다(플래그: 03 문단/계산근거, 04 계산근거, 05 문단/계산근거, 06 계산근거, 07 길이/계산근거). 이는 자동 QA 점수이며 위 편집자 점수와 다른 값이다.
- 이번 채점에서 위 자동 QA 숫자를 내용 점수로 사용하지 않았다.
- 보고서에서 계산 근거의 독립 검증은 수행하지 않았다. 따라서 타이밍/계산 정확성은 완전 승인으로 볼 수 없다.

## 재검수 기록 — 유료 PDF 경로, 미상 출생시간 프로필

- 재검수일: 2026-11-07. `server/payments/final-simple-reports.test.ts`를 다시 실행해 실제 유료 PDF 생성 경로로 상품별 PDF 7개를 만들고 질문 수, PDF 열기, 내비게이션 링크, 미상 출생시간 처리 여부를 확인했다. 테스트는 **1/1 통과**했다.
- 이번 테스트 프로필은 미상 출생시간 국제 프로필이다. 질문별 편집자 점수(위 표)는 앞서 실제 PDF를 읽고 채점한 1998-03-25 New York 프로필 기준이므로, 테스트 프로필의 점수로 바꾸어 쓰지 않았다. 이번 실행은 자동 품질 진단과 PDF 구조 검증이지, 새로운 독립 편집 채점이 아니다.
- 자동 품질 진단 결과: 01 **100, 통과**; 02 **100, 통과**; 03 **70, 실패**(문단 검토·계산 미검증); 04 **70, 실패**(계산 미검증); 05 **70, 실패**(문단 검토·계산 미검증); 06 **70, 실패**(계산 미검증); 07 **70, 실패**(길이 검토·계산 미검증). 이 진단 점수는 내용 점수와 다른 자동 게이트다. 자동 진단이 100인 상품도 위 편집자 점수 기준으로는 95점 미달이다.
- 이 프로필의 미상 출생시간과 질문 수/PDF 생성은 자동 검증했으나, 이번에 생성한 7개 PDF를 각각 전 페이지 육안 검수하거나 질문별로 새 편집 점수를 부여하지 않았다. 상품별 현재 표시 점수는 위의 마지막 실제 편집 검수 결과로 유지한다.
- PDF 원본과 로그는 재현 가능하도록 `tmp/rescore-2026-11-07/`에 생성했으나 `tmp/`는 임시 작업 폴더이며 저장소 커밋 대상이 아니다. 영구 점수 이력은 이 문서에 기록한다.

## 결론 / 미완료 항목

- 95점 이상 상품 평균: **0/7**. 개별로는 Product 03 Q4와 Product 06 Q5가 95점이다. 나머지 문항과 모든 상품 평균이 기준 미달이므로 전체 목표는 미달이다.
- 수정 후 연간 종합 답변, 동업 선택, 장기 주기 한계, 관계 시기 범위, 일상 경계 답변을 개선했다. 남은 점수 제한은 연간 요지의 우선순위, 타이밍 근거의 독립 검증, 일부 조건부 답변의 구체성이다. 사주 근거 재사용은 새 의미를 주는 경우 감점 사유로 삼지 않았다.
- 이번 회차에는 코드와 답변을 실제로 수정하고 테스트 PDF를 재생성했다. 3개 프로필로 PDF 파일 생성/열기/구조 검사를 수행했지만 내용 점수는 채점하지 않았다. 전체 페이지 시각 검수, Destiny Card 별도 검수, Preview/Production 배포는 수행하지 않았다.
- 점수 신뢰 범위: 한 프로필의 편집자 검수. 고객 만족도, 서로 다른 출생정보에서의 안정성, 실제 주문 배포 품질은 미검증.
