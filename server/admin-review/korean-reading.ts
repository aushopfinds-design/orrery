import { customerNarrative, customerPeriod, bundleNarrative } from '../../src/report/purchase-narrative.ts'
import { resolutionKorean } from './resolution-korean.ts'
/** Administrator-only Korean authoring from the shared plan; never back-translates English. */
import type { InterpretationPlan } from '../../src/report/interpretation-plan.ts'
const KO: Record<string, { name: string; work: string; money: string; love: string; business: string; pressure: string }> = {
  比肩: { name: '비견', work: '자기 판단과 담당 영역이 분명한 일에서 독립성을 발휘하는 쪽으로 읽습니다.', money: '직접 일하고 협상해서 얻는 수입과 공동 수익의 분배를 함께 살핍니다.', love: '관계에서도 동등한 선택권을 중요하게 보는 성향입니다.', business: '전문성을 직접 제공하는 사업이나 책임 영역이 분명한 운영 방식에 연결해 읽습니다.', pressure: '고집과 주도권 경쟁으로 협력이 어려워지는 부분' },
  劫財: { name: '겁재', work: '협업·경쟁·협상처럼 여러 사람의 이해관계를 다루는 활동에 연결됩니다.', money: '공동 비용, 수수료, 대여와 분배가 중요한 주제이며 손실을 확정하는 뜻은 아닙니다.', love: '개인의 자유와 외부 인간관계가 두 사람의 시간과 부딪힐 수 있습니다.', business: '소개와 협업의 기회를 활용하되 고객·수익·소유권의 분배를 분명히 해야 하는 구조로 읽습니다.', pressure: '비용과 공로를 나누기 전에 공동 약속부터 늘리는 부분' },
  食神: { name: '식신', work: '숙련된 기술을 반복해서 쓸 수 있는 결과물로 만드는 일에 연결됩니다.', money: '기술과 생산물이 수입의 바탕이 되는 경로로 읽되 실제 수요와 가격은 따로 확인해야 합니다.', love: '일상의 편안함과 꾸준한 행동으로 마음을 표현하는 모습으로 읽습니다.', business: '반복해서 납품할 수 있는 제품·서비스와 일정한 품질을 유지하는 방식에 연결됩니다.', pressure: '익숙한 방식에 머물러 필요한 변화를 미루는 부분' },
  傷官: { name: '상관', work: '표현·창작·설명·기존 방식의 개선에서 능력을 드러내는 쪽입니다.', money: '차별화된 결과물과 설득력이 수입의 통로가 될 수 있지만 관심이 곧 매출은 아닙니다.', love: '솔직한 대화를 원하면서도 말이 상대방에 대한 평가처럼 들릴 수 있습니다.', business: '차별화된 제안과 강한 전달력이 관련되며 홍보 약속과 실제 납품의 차이를 살핍니다.', pressure: '문제보다 사람을 먼저 비판하는 부분' },
  正財: { name: '정재', work: '실무·운영·기록·책임 있는 고객 업무처럼 역할과 보상이 드러나는 일에 연결됩니다.', money: '급여, 반복 수수료, 예산과 유지해야 할 자산·의무가 중심이며 부의 크기를 뜻하지는 않습니다.', love: '약속을 지키고 현실적인 책임을 나누는 것이 관계의 중요한 표현입니다.', business: '반복 계약과 가격이 분명한 서비스에 연결되며 매출 증가와 함께 의무도 늘어나는지 살핍니다.', pressure: '정리할 수 있다는 이유로 비용과 의무를 지나치게 떠맡는 부분' },
  偏財: { name: '편재', work: '영업·고객 개발·소싱·중개처럼 사람과 기회를 연결하는 상업적 활동에 가깝습니다.', money: '고정 수입 외의 고객·거래·변동 수수료를 다루는 흐름이며 횡재나 투자 수익을 보장하지 않습니다.', love: '경험을 함께하고 관심을 넓히는 모습과 시작 뒤의 꾸준함을 함께 살핍니다.', business: '고객 확보와 여러 거래 경로가 관련되며 납품·수금이 정리되기 전에 확장하는 것을 주의합니다.', pressure: '아직 가능성인 거래를 확보된 돈처럼 다루는 부분' },
  正官: { name: '정관', work: '규정·관리·공적 책임·인정받는 직무처럼 기준과 권한이 분명한 조직 활동에 연결됩니다.', money: '정해진 책임과 계약을 통해 수입이 연결되는 간접 경로이며 책임 증가가 보상 증가를 보장하지 않습니다.', love: '명확한 약속과 존중을 중요하게 보되 형식만 남지 않는지도 살핍니다.', business: '신뢰·규정 준수·일정한 서비스가 중심이며 역할을 맡는 사람과 권한을 분명히 해야 합니다.', pressure: '적절해 보인다는 이유로 자기 범위를 넘는 책임을 수락하는 부분' },
  偏官: { name: '편관', work: '높은 목표·경쟁·위기 대응처럼 요구가 큰 환경에서 권한과 자원의 균형을 살핍니다.', money: '목표·불이익 조건·큰 약속이 재정적 부담으로 연결되는지를 읽으며 수입이나 손실액을 예측하지 않습니다.', love: '결단력과 강한 추진력이 관계의 속도를 일방적으로 정하지 않는지 살핍니다.', business: '어려운 납품과 경쟁적 환경에 연결되며 계속되는 긴급 상황에 의존한 확장을 주의합니다.', pressure: '권한과 자원을 확인하기 전에 긴급성과 압박부터 키우는 부분' },
  正印: { name: '정인', work: '교육·연구·문서화·전문 훈련처럼 지식과 기반을 갖춰 인정받는 일에 연결됩니다.', money: '자격·지원·준비가 유료 업무를 가능하게 하는 간접 경로이며 준비 비용과 실행 지연을 함께 살핍니다.', love: '이해받는 느낌과 안정적인 돌봄을 중시하며 한 사람이 늘 보호자 역할만 맡지 않는지 봅니다.', business: '전문 서비스·교육·문서화된 방법에 연결되며 준비를 계속 더해 고객에게 내놓지 못하는 것을 주의합니다.', pressure: '이미 쓸 수 있는 기반이 있는데도 확신과 준비를 더 기다리는 부분' },
  偏印: { name: '편인', work: '특수 지식·분석·전략·독립 연구처럼 깊이 생각할 여유가 필요한 일에 연결됩니다.', money: '특수한 지식이 실제 사용 가치와 유료 고객을 만날 때 수입과 연결되는 경로입니다.', love: '혼자 생각할 공간과 이해받는 느낌을 원하지만 거리 두기로 받아들여질 수 있습니다.', business: '틈새 전문 방법과 자문에 연결되며 복잡한 설명을 고객이 사용할 결과로 바꾸는 것이 과제입니다.', pressure: '제한된 결정을 내리기보다 설명과 가능성을 계속 다시 여는 부분' },
}
const TITLES: Record<string, string> = {
  personality: '내 인생과 운명은 무엇이 이끌까?', social: '무엇이 나를 돕고, 무엇이 발목을 잡을까?', money: '나는 어떤 방식으로 돈을 벌까?', career: '어떤 일에서 내 능력을 펼칠까?', love: '나는 사랑에서 무엇을 원할까?', balance: '어떻게 해야 내 일상이 편해질까?', patterns: '내 인생의 방향은 언제 바뀔 수 있을까?',
  'working-style': '내 강점은 어떤 직업에서 빛날까?', 'two-work-layers': '어떤 직장에서 잘 풀릴까?', 'feedback-and-boundaries': '이직을 생각해 볼 시기는 언제일까?', 'proof-of-skill': '내 일이 인정받는 흐름은 언제일까?', 'money-commitments': '나에게 맞는 돈 버는 방식은?', 'work-chapters': '직업과 재물의 흐름은 어떻게 바뀔까?', 'career-plan': '성공을 가로막는 나의 약점은?',
  'founder-style': '나는 사업에 맞는 사람일까?', 'offer-test': '내 사주는 창업을 어떻게 읽을까?', 'team-decisions': '동업은 도움이 될까, 부담이 될까?', 'delivery-capacity': '사업에서 어떻게 벌고 남길까?', 'customer-communication': '확장을 살펴볼 시기는 언제일까?', 'business-chapters': '10년 대운은 사업에 무엇을 더할까?', 'business-plan': '사업에서 언제 더 조심해야 할까?',
  'annual-theme': '올해 내 운의 중심 주제는?', 'annual-money': '올해 돈의 흐름에 무엇이 작용할까?', 'annual-work': '올해 직장과 일은 어떻게 흐를까?', 'annual-connections': '올해 사랑과 관계에는 무엇이 더해질까?', 'annual-cycle-context': '매달 무엇에 집중하면 좋을까?', 'annual-plan': '언제 더 주의해서 살펴야 할까?',
  'two-styles': '우리는 어떻게 맞는 사람들일까?', 'two-directions': '우리는 왜 서로에게 끌릴까?', 'close-conversation': '왜 같은 일을 다르게 느낄까?', 'shared-routine': '함께하는 일상도 잘 맞을까?', 'shared-money': '돈에 대한 생각도 맞을까?', 'chart-patterns': '무엇이 가까워지게 하고, 무엇이 부딪히게 할까?', 'support-each-other': '앞으로의 운은 두 사람에게 무엇을 더할까?', 'shared-week': '이 관계에서 서로에게 필요한 것은?',
  'everyday-pace': '겉모습 뒤의 진짜 나는?', 'visible-elements': '내 타고난 기운에서 무엇이 두드러질까?', 'workload-rhythm': '나는 언제 부담을 느낄까?', 'support-and-space': '사람들과의 관계에서 무엇이 필요할까?', 'balance-week': '내 강점은 언제 약점이 될까?',
}
const ELEMENT: Record<string, string> = { Wood: '목', Fire: '화', Earth: '토', Metal: '금', Water: '수' }
const POSITION_KO: Record<string, string> = { hour: '시주', day: '일주', month: '월주', year: '연주' }
const RELATION_KO: Record<string, string> = { 合: '합', 沖: '충', 刑: '형', 害: '해', 破: '파', 半合: '반합' }
const NAME = (god: string) => KO[god]?.name ?? god
export function timing(point: InterpretationPlan['annual'][number]) {
  const direction = { unresolved: '원국의 균형이나 진행 대운이 미확정이므로 유리·불리 판정을 보류합니다.', mixed: '대운과 해당 시기의 도움·부담이 한 방향으로 모이지 않아 기회와 부담을 구분해서 읽습니다.', 'potential-support': '지원이 필요한 원국에 진행 대운과 이 시기가 모두 도움을 더하는 것으로 계산됩니다. 조건부로 지원을 활용할 여지를 읽되 성공을 약속하지 않습니다.', 'potential-outlet': '지원받는 원국에 진행 대운과 이 시기가 모두 표현·관리·책임의 활동을 더합니다. 가진 힘을 사용할 여지와 그에 맞는 실제 역량을 함께 봅니다.', 'added-demand': '지원이 필요한 원국에 진행 대운과 해당 시기가 모두 부담을 더합니다. 재물 활동이 많아져도 실제로는 관리 의무가 더 무거워질 수 있습니다.', 'added-support': '이미 지원받는 원국에 두 시기 층이 도움을 더합니다. 준비·독립성·경쟁이 강화되는 것과 수입이 좋아지는 것은 같은 뜻이 아닙니다.' }[point.direction]
  return `${point.date} 대표 시점: ${NAME(point.god)}·${NAME(point.innerGod)}의 흐름입니다. ${point.activeCycle ? `진행 대운은 ${point.activeCycle.ganzi}, 계산 시작일은 ${point.activeCycle.start.slice(0, 10)}입니다.` : '계산 범위에 진행 대운이 없습니다.'} ${direction} ${point.friction ? '충·형·해·파의 마찰이 따로 확인되므로 긍정적인 균형 해석만으로 주의를 덮지 않습니다.' : '확인된 마찰 신호가 없더라도 편안한 시기가 보장되는 것은 아닙니다.'}${point.balancingComparison.element ? ` 조건부 균형 기운은 ${ELEMENT[point.balancingComparison.element]}입니다. 해당 시점은 ${point.balancingComparison.referenceElements.map(e => ELEMENT[e]).join('·')}, 진행 대운은 ${point.balancingComparison.cycleElements.map(e => ELEMENT[e]).join('·') || '비교할 기운 없음'}입니다. 우선 기운이 같아도 별도 마찰을 없애거나 길운을 보장하지 않습니다.` : ''}`
}
export function koreanReadingFromPlan(plan: InterpretationPlan) {
  const lines = ['THE FATE KEY · 한국어 원본 풀이', `분석 ${plan.schema} · 기준 ${plan.referenceYear}년 · 정책 ${plan.primary.strength.policy}`, '고객이 읽는 각 장의 본문과 시기 설명은 같은 판단에서 작성한 영어·한국어 문장으로 대조합니다. 별도 계산 근거와 작성 방법의 설명은 전체 일대일 번역 범위에 포함하지 않습니다.', '']
  for (const [label, chart] of [['A', plan.first], ...(plan.second ? [['B', plan.second]] : [])] as [string, InterpretationPlan['first']][]) lines.push(`${label}: ${chart.input.year}-${String(chart.input.month).padStart(2, '0')}-${String(chart.input.day).padStart(2, '0')} · ${chart.input.unknownTime ? '출생시간 미상' : `${String(chart.input.hour).padStart(2, '0')}:${String(chart.input.minute).padStart(2, '0')}`} · ${chart.input.timezone ?? 'Asia/Seoul'}`)
  const native = customerNarrative(plan)
  for (const [index, section] of plan.sections.entries()) {
    const c=native[section.id]
    lines.push(`${String(index + 1).padStart(2,'0')} · ${TITLES[section.id]}`, ...c.lines.map(l=>l.ko), ...(c.showGuidance?['실제로 살필 점: '+c.action.ko, '주의할 점: '+c.caution.ko]:[]))
  }
  if(plan.kind==='complete') {
    lines.push('앞으로 10년의 흐름', ...native['next-moves'].lines.map(l=>l.ko),'실제로 살필 점: '+native['next-moves'].action.ko,'주의할 점: '+native['next-moves'].caution.ko)
    plan.selectedCycles.forEach((_,index)=>lines.push('긴 시기의 흐름',...customerPeriod(plan,index).map(l=>l.ko)))
  }
  plan.months.forEach((month,index)=>{const c=native['month-'+(index+1)];lines.push(month.date.slice(0,7)+' · 월별 운세',...c.lines.map(l=>l.ko),'실제로 살필 점: '+c.action.ko,'주의할 점: '+c.caution.ko)})
  lines.push('별도 계산 판단 확인 자료', ...[...plan.annual,...plan.months,...plan.partnerAnnual].map(point=>`${point.date}: ${point.pillar} / 해당 연도 ${point.yearPillar}`), ...plan.annual.map(timing),...plan.months.map(timing),...plan.partnerAnnual.map(timing))
  if (plan.pairPatterns.length) lines.push('두 사람의 전체 교차 근거', ...plan.pairPatterns.map(p => `A ${POSITION_KO[p.left]} ${p.leftPillar} / B ${POSITION_KO[p.right]} ${p.rightPillar}: ${p.patterns.map(x => RELATION_KO[x.type] ?? x.type).join('·') || '확인한 직접 관계 없음'}`))
  lines.push('격국과 균형용신의 판단', ...resolutionKorean(plan.primary.resolution).map(c => 'A: ' + c.text), ...(plan.partner ? resolutionKorean(plan.partner.resolution).map(c => 'B: ' + c.text) : []))
  lines.push('검수용 계산 근거', ...plan.primary.positions.map(p => `${POSITION_KO[p.position]}: ${p.ganzi}, 천간 ${p.stemGod ? NAME(p.stemGod) : '일간'}, 지지 중심 ${NAME(p.principalGod)}`), '월지 투간: ' + plan.primary.strength.monthlyHidden.map(x => `${x.stem} ${NAME(x.god)} → ${x.exposedAt.map(position => POSITION_KO[position]).join(', ') || '확인된 투간 없음'}`).join(' / '), plan.primary.strength.patternCandidate ? `월령 격국 후보: ${plan.primary.strength.patternCandidate.stem} ${NAME(plan.primary.strength.patternCandidate.god)}. 격국의 성패나 단일 용신을 확정한 것이 아닙니다.` : '일반 격국 후보를 하나로 확정하지 않았습니다.', '억부의 균형 후보군, 월령 격국 후보, 조후·특수격·합화의 확정 판단은 구분합니다. 이번 모델은 보수적 검수 규칙이며 전체 학파의 공통 공식이나 검증된 미래 예측 모델이 아닙니다.', '시기와 대운 Date는 기존 계산 달력의 벽시계 필드이며 ISO의 Z를 사건의 실제 UTC 순간으로 해석하지 않습니다. 매월 15일은 월 전체의 사건 예측이 아닙니다.', '미래 수입·질병·결혼·이별을 보장하지 않습니다. 시간 미상은 시간주를 제외하고 강약과 유리·불리 판정을 보류합니다.')
  return lines.join('\n\n')
}
export function koreanBundleOverview(plans: { complete: InterpretationPlan; compatibility: InterpretationPlan; annual: InterpretationPlan }) {
 return bundleNarrative(plans).map(line=>line.ko).join('\n\n')
}
