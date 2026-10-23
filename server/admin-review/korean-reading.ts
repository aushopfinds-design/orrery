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
const STEM: Record<string, string> = { 甲: '갑목은 방향을 세우고 성장시키는 이미지', 乙: '을목은 상황에 맞춰 방법을 바꾸는 이미지', 丙: '병화는 표현과 대외적인 활력의 이미지', 丁: '정화는 집중과 세심한 온기의 이미지', 戊: '무토는 책임을 지탱하는 이미지', 己: '기토는 돌보고 유용하게 가꾸는 이미지', 庚: '경금은 분명한 기준과 결단의 이미지', 辛: '신금은 품질과 세밀한 차이를 가려내는 이미지', 壬: '임수는 넓은 연결과 가능성을 살피는 이미지', 癸: '계수는 관찰과 깊이 있는 이해의 이미지' }
const NEED: Record<string, string> = { 子: '생각할 시간과 대화로 돌아오는 약속', 丑: '지켜지는 작은 약속', 寅: '두 사람이 함께 선택하는 기회', 卯: '부드럽고 존중하는 소통', 辰: '명확한 결정과 나누어 맡는 책임', 巳: '사적인 공간과 충분한 이해', 午: '따뜻한 관심과 각자의 관심사를 위한 시간', 未: '해결책을 제안받기 전에 이야기를 들어주는 것', 申: '실질적인 도움과 감정을 들어주는 태도', 酉: '분명한 말과 개인적 선호에 대한 존중', 戌: '신뢰할 수 있는 약속과 솔직한 대화', 亥: '조용한 공감과 서두르지 않는 대화' }
const TITLES: Record<string, string> = {
  personality: '내 인생과 운명은 무엇이 이끌까?', social: '무엇이 나를 돕고, 무엇이 발목을 잡을까?', money: '나는 어떤 방식으로 돈을 벌까?', career: '어떤 일에서 내 능력을 펼칠까?', love: '나는 사랑에서 무엇을 원할까?', balance: '어떻게 해야 내 일상이 편해질까?', patterns: '내 인생의 방향은 언제 바뀔 수 있을까?',
  'working-style': '내 강점은 어떤 직업에서 빛날까?', 'two-work-layers': '어떤 직장에서 잘 풀릴까?', 'feedback-and-boundaries': '이직을 생각해 볼 시기는 언제일까?', 'proof-of-skill': '내 일이 인정받는 흐름은 언제일까?', 'money-commitments': '나에게 맞는 돈 버는 방식은?', 'work-chapters': '직업과 재물의 흐름은 어떻게 바뀔까?', 'career-plan': '성공을 가로막는 나의 약점은?',
  'founder-style': '나는 사업에 맞는 사람일까?', 'offer-test': '내 사주는 창업을 어떻게 읽을까?', 'team-decisions': '동업은 도움이 될까, 부담이 될까?', 'delivery-capacity': '사업에서 어떻게 벌고 남길까?', 'customer-communication': '확장을 살펴볼 시기는 언제일까?', 'business-chapters': '10년 대운은 사업에 무엇을 더할까?', 'business-plan': '사업에서 언제 더 조심해야 할까?',
  'annual-theme': '올해 내 운의 중심 주제는?', 'annual-money': '올해 돈의 흐름에 무엇이 작용할까?', 'annual-work': '올해 직장과 일은 어떻게 흐를까?', 'annual-connections': '올해 사랑과 관계에는 무엇이 더해질까?', 'annual-cycle-context': '어떤 달에 도움이 더해질까?', 'annual-plan': '언제 더 주의해서 살펴야 할까?',
  'two-styles': '우리는 어떻게 맞는 사람들일까?', 'two-directions': '우리는 왜 서로에게 끌릴까?', 'close-conversation': '왜 같은 일을 다르게 느낄까?', 'shared-routine': '함께하는 일상도 잘 맞을까?', 'shared-money': '돈에 대한 생각도 맞을까?', 'chart-patterns': '무엇이 가까워지게 하고, 무엇이 부딪히게 할까?', 'support-each-other': '앞으로의 운은 두 사람에게 무엇을 더할까?', 'shared-week': '이 관계에서 서로에게 필요한 것은?',
  'everyday-pace': '겉모습 뒤의 진짜 나는?', 'visible-elements': '내 타고난 기운에서 무엇이 두드러질까?', 'workload-rhythm': '나는 언제 부담을 느낄까?', 'support-and-space': '사람들과의 관계에서 무엇이 필요할까?', 'balance-week': '내 강점은 언제 약점이 될까?',
}
const ELEMENT: Record<string, string> = { Wood: '목', Fire: '화', Earth: '토', Metal: '금', Water: '수' }
const POSITION_KO: Record<string, string> = { hour: '시주', day: '일주', month: '월주', year: '연주' }
const RELATION_KO: Record<string, string> = { 合: '합', 沖: '충', 刑: '형', 害: '해', 破: '파', 半合: '반합' }
const NAME = (god: string) => KO[god]?.name ?? god
function strength(p: InterpretationPlan['primary']) {
  return ({ supported: '계절의 도움, 중심 지장간의 뿌리, 드러난 생조가 같은 방향을 가리켜 일간이 지원받는 쪽으로 기웁니다. 이 보수적 규칙에서는 그 힘을 일과 재물 관리로 활용할 여지를 살피되 성과를 보장하지 않습니다.', 'support-needed': '월지의 중심 기운이 일간을 돕지 않고 같은 오행의 뿌리가 없으며, 드러난 도움과 부담이 함께 있어 지원이 필요한 쪽으로 기웁니다. 일이 많아지는 것과 그 일을 감당하기 편한 것은 구분합니다.', mixed: '계절·뿌리·드러난 기운의 근거가 엇갈립니다. 이 명식을 강하거나 약하다고 하나로 정하지 않고 기회와 부담을 나누어 읽습니다.', deferred: '시간 미상 또는 특수한 구조의 별도 검토가 필요해 강약 판단을 보류합니다. 모르는 시간을 채우거나 유리한 기운을 임의로 정하지 않습니다.' })[p.strength.tendency]
}
function money(p: InterpretationPlan['primary']) {
  const regular = p.visibleMoney.some(x => x.god === '正財'), wider = p.visibleMoney.some(x => x.god === '偏財')
  return regular && wider ? '정재와 편재가 모두 드러나 반복 수입을 관리하는 방식과 외부 거래 기회를 다루는 방식이 함께 나타납니다.' : regular ? '드러난 재성은 정재 쪽이므로 반복적인 수입과 유지해야 할 현실적인 의무가 재물 풀이의 중심입니다.' : wider ? '드러난 재성은 편재 쪽이므로 고객·거래·새로운 외부 기회를 통한 재물 활동이 두드러집니다.' : p.hiddenMoney.length ? '재성이 드러난 자리보다 지장간 안에 있어 재물은 덜 표면적인 층에서 읽습니다. 재물이 없다는 뜻은 아닙니다.' : '확인한 자리에는 직접적인 재성이 없습니다. 가난하거나 돈을 벌 수 없다는 판정이 아니라 직접 재성만으로 재물의 방향을 정할 수 없다는 뜻입니다.'
}
function timing(point: InterpretationPlan['annual'][number]) {
  const direction = { unresolved: '원국의 균형이나 진행 대운이 미확정이므로 유리·불리 판정을 보류합니다.', mixed: '대운과 해당 시기의 도움·부담이 한 방향으로 모이지 않아 기회와 부담을 구분해서 읽습니다.', 'potential-support': '지원이 필요한 원국에 진행 대운과 이 시기가 모두 도움을 더하는 것으로 계산됩니다. 조건부로 지원을 활용할 여지를 읽되 성공을 약속하지 않습니다.', 'potential-outlet': '지원받는 원국에 진행 대운과 이 시기가 모두 표현·관리·책임의 활동을 더합니다. 가진 힘을 사용할 여지와 그에 맞는 실제 역량을 함께 봅니다.', 'added-demand': '지원이 필요한 원국에 진행 대운과 해당 시기가 모두 부담을 더합니다. 재물 활동이 많아져도 실제로는 관리 의무가 더 무거워질 수 있습니다.', 'added-support': '이미 지원받는 원국에 두 시기 층이 도움을 더합니다. 준비·독립성·경쟁이 강화되는 것과 수입이 좋아지는 것은 같은 뜻이 아닙니다.' }[point.direction]
  return `${point.date} 대표 시점: ${NAME(point.god)}와 ${NAME(point.innerGod)}의 흐름입니다. ${point.activeCycle ? `진행 대운은 ${point.activeCycle.ganzi}, 계산 시작일은 ${point.activeCycle.start.slice(0, 10)}입니다.` : '계산 범위에 진행 대운이 없습니다.'} ${direction} ${point.friction ? '충·형·해·파의 마찰이 따로 확인되므로 긍정적인 균형 해석만으로 주의를 덮지 않습니다.' : '확인된 마찰 신호가 없더라도 편안한 시기가 보장되는 것은 아닙니다.'}`
}
function basis(p: InterpretationPlan['primary']) {
  return `일간 ${p.dayStem}, 월간 ${NAME(p.monthStemGod)}, 월지 중심 ${NAME(p.monthBranchGod)}, 일지 ${p.dayBranch}의 ${NAME(p.dayBranchGod)} 관계를 함께 봅니다. ${p.strength.roots.length ? `같은 오행의 뿌리는 ${p.strength.roots.map(r => `${POSITION_KO[r.position]} ${r.branch} 안의 ${r.stem}${r.principal ? '(중심)' : '(보조)'}`).join(', ')}에서 확인됩니다.` : '확인한 지장간에는 같은 오행의 뿌리가 없습니다.'}`
}
function years(plan: InterpretationPlan, gods?: string[]) {
  const found = gods ? plan.annual.filter(p => [p.god, p.innerGod].some(g => gods.includes(g))) : plan.annual
  return found.length ? found.map(timing) : ['선택한 관계가 나타나는 연간 대표 시점이 없어 해당 활동에 유리한 연도를 임의로 추가하지 않습니다.']
}
function content(plan: InterpretationPlan, id: string): string[] {
  const p = plan.primary, m = KO[p.monthStemGod], inner = KO[p.monthBranchGod], day = KO[p.dayBranchGod]
  const common = [basis(p), strength(p)]
  const role = `월간의 ${m.name}는 드러난 역할, 월지 중심의 ${inner.name}는 일상 업무의 바탕으로 나누어 읽습니다. ${m.work} ${p.monthStemGod === p.monthBranchGod ? '두 층에 같은 관계가 반복됩니다.' : inner.work}`
  const love = `${day.love} 일지 ${p.dayBranch}의 이미지에서는 ${NEED[p.dayBranch]} 같은 사적인 필요를 함께 살핍니다.`
  const workChanges = plan.annual.filter(x => x.clashes.includes('month'))
  switch (id) {
    case 'personality': case 'everyday-pace': return [`${STEM[p.dayStem]}로 출발합니다. 반복 관계는 ${p.repeated.map(x => NAME(x.god)).join('·')}이며, 개인의 기질과 직업 역할이 반드시 같지는 않습니다.`, role, ...common]
    case 'social': case 'balance-week': return [`${STEM[p.dayStem]}에서 출발해, 그 기질이 일상에서 어떤 강점으로 드러나는지 살핍니다.`, role, `강점이 과해질 때는 ${m.pressure}을 주의합니다.`, love, ...common]
    case 'career': case 'working-style': return [role, `직업에서 중요한 압력은 ${m.pressure}입니다. 적합한 분야와 실제로 일하기 좋은 근무 조건을 구분합니다.`, ...common]
    case 'two-work-layers': return [`직장에서는 남에게 보이는 ${m.name}의 역할과 매일 감당하는 ${inner.name}의 일이 어떻게 만나는지 봅니다.`, m.work, inner.work, `같은 직종이라도 권한·일정·도움을 받는 방식에 따라 ${inner.pressure}이 달라질 수 있습니다. 직업 적성과 실제 직장 환경을 구분합니다.`, ...common]
    case 'annual-work': return [`올해 직업 주제는 ${NAME(plan.annual[0].god)}이며 그 아래에 ${NAME(plan.annual[0].innerGod)}가 더해집니다. ${KO[plan.annual[0].god].work}`, KO[plan.annual[0].innerGod].work, role, timing(plan.annual[0]), ...common]
    case 'annual-money': return [`올해 재물 주제는 ${NAME(plan.annual[0].god)}와 ${NAME(plan.annual[0].innerGod)}의 관계에서 읽습니다.`, KO[plan.annual[0].god].money, KO[plan.annual[0].innerGod].money, money(p), timing(plan.annual[0]), ...common]
    case 'annual-connections': return [`올해 가까운 관계에는 ${NAME(plan.annual[0].god)}와 ${NAME(plan.annual[0].innerGod)}의 기운을 더해 읽습니다.`, KO[plan.annual[0].god].love, KO[plan.annual[0].innerGod].love, love, timing(plan.annual[0]), ...common]
    case 'feedback-and-boundaries': return [role, `이직은 현재 역할의 ${m.pressure}을 새 직장이 실제로 줄일 수 있는지 함께 읽습니다.`, workChanges.length ? `월주와 충이 확인되는 대표 연도는 ${workChanges.map(x => x.date.slice(0, 4)).join(', ')}입니다. 역할·일정·업무 방식의 변화로 나타날 수 있지만 퇴사나 해고를 확정하지 않습니다.` : '확인한 연간 대표 시점에는 월주와의 충이 없습니다. 그 신호가 없다고 실제 이직이 불가능한 것은 아닙니다.', ...years(plan, ['傷官', '偏財', '正官', '偏官'])]
    case 'proof-of-skill': return [role, '승진은 인정받는 역할과 늘어나는 책임을 함께 봅니다. 관성·인성의 시기는 책임·자격·인정과 연결되는 주제이지 회사의 승진 의사를 알려주는 계산은 아닙니다.', ...years(plan, ['正官', '偏官', '正印']), ...common]
    case 'money': case 'money-commitments': case 'delivery-capacity': return [money(p), m.money, inner.money, strength(p), id === 'delivery-capacity' ? '사업에서는 매출, 이익, 수금 시기와 실제로 감당할 납품을 구분합니다.' : '수입 기회가 많아지는 것과 재물을 남기기 편한 시기를 구분하며 수익액을 약속하지 않습니다.', basis(p)]
    case 'love': case 'support-and-space': return [love, `${day.love} 월지의 일상 역할과 일지의 사적인 필요가 다른 경우, 일을 처리하는 방식이 가까운 사람에게도 그대로 적용되는지 살핍니다. 상대방의 마음이나 결혼·이별은 이 한 사람의 명식으로 확정하지 않습니다.`, ...common]
    case 'patterns': case 'work-chapters': case 'business-chapters': return [id === 'business-chapters' ? `사업은 ${m.name}의 ${m.business}` : role, ...plan.selectedCycles.map(c => `${c.start.slice(0, 10)} 계산 시작${c.next ? ` ~ 다음 시작 ${c.next.slice(0, 10)}` : ''}: ${NAME(c.stemGod)}와 ${NAME(c.branchGod)} 대운입니다. ${id === 'business-chapters' ? KO[c.stemGod].business : KO[c.stemGod].work}`), ...years(plan), ...common]
    case 'founder-style': case 'offer-test': return [`사업 방식은 ${m.name}를 중심으로 읽습니다. ${m.business}`, inner.business, money(p), ...common, ...(id === 'offer-test' ? years(plan, ['食神', '傷官', '正財', '偏財']) : [])]
    case 'team-decisions': return [`동업에서는 ${NAME(p.yearStemGod)}의 외부 역할과 ${m.name}의 실제 업무 방식을 함께 봅니다. ${KO[p.yearStemGod].business}`, `협업의 주의점은 ${KO[p.yearStemGod].pressure}입니다. 이 보고서는 한 사람의 명식이므로 실제 동업자의 궁합이나 지분 비율을 계산하지 않습니다.`, ...common]
    case 'customer-communication': return [m.business, inner.business, `확장할 때에는 ${m.pressure}과 ${inner.pressure}이 함께 커지는지 살핍니다. 고객의 증가를 곧 이익 증가로 읽지 않습니다.`, ...years(plan, ['正財', '偏財']), ...common]
    case 'business-plan': return [`사업의 기본 주의점은 ${m.pressure}입니다.`, ...years(plan), '거래 활동과 마찰이 한 시기에 함께 있을 수 있으므로 수입의 가능성과 책임을 분리합니다.']
    case 'career-plan': return [role, money(p), `핵심 주의점은 ${m.pressure}입니다. 직함만 바뀌고 권한·업무·보상이 그대로라면 구조의 부담도 남을 수 있습니다.`, ...common]
    case 'visible-elements': case 'balance': return [`드러난 오행의 개수는 ${p.elements.map(x => `${ELEMENT[x.element]} ${x.count}`).join(', ')}입니다. 가중 강약 점수나 건강의 진단 수치가 아닙니다.`, basis(p), `오행의 분포, 중심 뿌리와 보조 뿌리, 월지의 계절적 문맥은 서로 다른 정보입니다. 드러난 개수만으로 신체·정신 건강이나 부족한 능력을 판단하지 않습니다.`, strength(p), m.pressure + '을 생활 습관의 압력으로 살펴볼 수 있지만 질병이나 치료를 예측하는 것은 아닙니다.']
    case 'workload-rhythm': return [m.work, `일상에서 ${m.pressure}을 반복할 때 부담이 쌓이는 것으로 읽습니다.`, inner.work, love, ...common]
    case 'annual-theme': return [timing(plan.annual[0]), KO[plan.annual[0].god].work, KO[plan.annual[0].god].money, KO[plan.annual[0].innerGod].love, ...common]
    case 'annual-cycle-context': { const found = plan.months.filter(x => ['potential-support', 'potential-outlet'].includes(x.direction) && !x.friction); return [found.length ? `조건부 지원 방향이 맞고 별도 마찰이 확인되지 않는 대표 달은 ${found.map(x => x.date.slice(0, 7)).join(', ')}입니다.` : '정해진 조건을 모두 만족하는 달이 없습니다. 강약 미확정·시기 층의 불일치·별도 마찰을 숨기고 좋은 달을 만들어 넣지 않습니다.', ...found.map(x => `${x.date} 대표 시점: ${NAME(x.god)}·${NAME(x.innerGod)}이며 원국과 진행 대운을 함께 비교한 지원 또는 활용 방향에 별도 마찰 신호가 없는 것으로 읽습니다.`), '해당 월의 모든 날짜가 유리하다는 뜻이 아니라 매월 15일의 대표 비교입니다.'] }
    case 'annual-plan': { const found = plan.months.filter(x => x.friction || x.direction === 'added-demand'); return [found.length ? `마찰이나 추가 부담이 확인되는 대표 달은 ${found.map(x => x.date.slice(0, 7)).join(', ')}입니다.` : '확인한 기준에 해당하는 주의 달이 없습니다. 위험이 없는 해라는 인증은 아닙니다.', ...found.map(x => `${x.date} 대표 시점: ${NAME(x.god)}·${NAME(x.innerGod)}이며 ${x.friction ? '별도 마찰이 확인됩니다.' : '지원이 필요한 원국에 부담이 더해지는 방향입니다.'}`), '주의 주제는 해당 월의 직업·재물·관계 풀이와 함께 읽으며 나쁜 사건을 예고하지 않습니다.'] }
    default: return pairContent(plan, id)
  }
}
function pairContent(plan: InterpretationPlan, id: string) {
  const p = plan.primary, b = plan.partner!, d = plan.directions!
  const direction = `A에게 B는 ${NAME(d.aToB)}, B에게 A는 ${NAME(d.bToA)}로 계산됩니다. ${KO[d.aToB].love} 반대쪽에서는 ${KO[d.bToA].love}`
  const meeting = (position: 'day' | 'month') => { const pair = plan.pairPatterns.find(x => x.left === position && x.right === position)!; return `${POSITION_KO[position]} 비교 ${pair.leftPillar} / ${pair.rightPillar}: ${pair.patterns.length ? pair.patterns.map(x => RELATION_KO[x.type] ?? x.type).join('·') + '이 확인됩니다. 붙잡는 필요와 부딪히는 필요를 구분해서 읽으며 관계의 결과를 확정하지 않습니다.' : '확인한 표에서 직접적인 쌍 관계가 없습니다. 그 신호의 부재가 좋은 궁합을 보장하지는 않습니다.'}` }
  const needs = `A의 사적인 필요는 ${NEED[p.dayBranch]}, B에게는 ${NEED[b.dayBranch]}이 관계 이미지의 중심입니다. 같은 행동도 다르게 받아들일 수 있습니다.`
  if (id === 'two-directions') return [`A가 관계에서 읽는 중심 주제는 ${NAME(d.aToB)}, B가 읽는 주제는 ${NAME(d.bToA)}입니다. 끌림이나 기대가 같은 역할에서 출발한다고 가정하지 않습니다.`, `A의 관점: ${KO[d.aToB].love}`, `B의 관점: ${KO[d.bToA].love}`, d.aToB === d.bToA ? '양쪽의 관계 이름은 같지만 감정이나 노력의 양이 같다는 판정은 아닙니다.' : '기준이 되는 사람이 달라 관계 이름도 달라집니다. 어느 쪽이 더 사랑하는지의 점수가 아닙니다.', needs]
  if (id === 'close-conversation') return [`감정의 차이는 두 사람의 사적인 필요에서 구분합니다. ${needs}`, `A의 일지 중심 관계: ${KO[p.dayBranchGod].love}`, `B의 일지 중심 관계: ${KO[b.dayBranchGod].love}`, meeting('day'), '자신이 받고 싶은 배려와 상대방이 필요로 하는 배려가 다를 수 있으며, 실제 대화와 동의로 확인해야 합니다.']
  if (id === 'shared-week') return [`두 사람의 결론은 개인적인 친밀감과 일상을 맞추는 일을 나누어서 읽는 것입니다. A는 ${NAME(d.aToB)}, B는 ${NAME(d.bToA)}라는 서로의 역할을 경험하는 구조입니다.`, meeting('day'), meeting('month'), needs, '같은 해도 두 사람에게 다른 책임과 요구를 더하므로 실제 관계의 시간·돈·역할을 함께 살핍니다.']
  if (id === 'shared-money') return [money(p), 'B의 재물 구조: ' + money(b), direction, '공동 비용·대여·선물·소유권은 실제 약속을 확인하며 명식으로 재정적 권리를 배분하지 않습니다.']
  if (id === 'shared-routine') return [`A의 일상은 ${NAME(p.monthStemGod)}와 ${NAME(p.monthBranchGod)}, B의 일상은 ${NAME(b.monthStemGod)}와 ${NAME(b.monthBranchGod)}를 함께 읽습니다.`, KO[p.monthBranchGod].work, KO[b.monthBranchGod].work, needs]
  if (id === 'support-each-other') return plan.annual.map((x, i) => `A: ${timing(x)}\n\nB: ${timing(plan.partnerAnnual[i])}`)
  if (id === 'chart-patterns') return [direction, meeting('day'), meeting('month'), needs, `A의 관계 주의점은 ${KO[d.aToB].pressure}, B는 ${KO[d.bToA].pressure}입니다. 개인적인 친밀감과 실제 일상을 운영하는 궁합은 구분해서 읽습니다.`, '확인된 합충형해파는 서로의 필요가 붙거나 부딪히는 전통적 신호이며, 상대방의 감정이나 관계의 성공을 증명하지 않습니다.']
  return [direction, meeting('day'), meeting('month'), needs, 'A의 원국 문맥: ' + strength(p), 'B의 원국 문맥: ' + strength(b), `관계의 주의점은 A의 ${KO[d.aToB].pressure}과 B의 ${KO[d.bToA].pressure}입니다. 실제 행동과 두 사람의 동의를 우선해서 판단합니다.`]
}
export function koreanReadingFromPlan(plan: InterpretationPlan) {
  const lines = ['THE FATE KEY · 한국어 원본 풀이', `분석 ${plan.schema} · 기준 ${plan.referenceYear}년 · 정책 ${plan.primary.strength.policy}`, '같은 분석 결과에서 영어 고객용 풀이와 각각 작성했습니다. 영어 문장을 다시 번역한 것이 아니며 문단 수와 문장 순서는 두 언어에서 다를 수 있습니다.', '']
  for (const [label, chart] of [['A', plan.first], ...(plan.second ? [['B', plan.second]] : [])] as [string, InterpretationPlan['first']][]) lines.push(`${label}: ${chart.input.year}-${String(chart.input.month).padStart(2, '0')}-${String(chart.input.day).padStart(2, '0')} · ${chart.input.unknownTime ? '출생시간 미상' : `${String(chart.input.hour).padStart(2, '0')}:${String(chart.input.minute).padStart(2, '0')}`} · ${chart.input.timezone ?? 'Asia/Seoul'}`)
  const written = new Set<string>()
  for (const [index, section] of plan.sections.entries()) { const prose = content(plan, section.id).filter(text => { if (written.has(text)) return false; written.add(text); return true }); lines.push(`${String(index + 1).padStart(2, '0')} · ${TITLES[section.id]}`, ...prose, '') }
  if (plan.kind === 'complete') lines.push('10년 대운은 인생의 방향을 어떻게 바꿀까?', ...content(plan, 'work-chapters'))
  if (plan.months.length) for (const month of plan.months) lines.push(`${month.date.slice(0, 7)} · 월별 운세`, timing(month), `직업: ${KO[month.god].work}`, `재물: ${KO[month.god].money}`, `관계: ${KO[month.innerGod].love}`, `주의: ${KO[month.god].pressure}`, `계산 근거: 연주 ${month.yearPillar}, 월주 ${month.pillar}, ${month.date} 12:00 Asia/Seoul 대표 시점.`)
  if (plan.pairPatterns.length) lines.push('두 사람의 전체 교차 근거', ...plan.pairPatterns.map(p => `A ${POSITION_KO[p.left]} ${p.leftPillar} / B ${POSITION_KO[p.right]} ${p.rightPillar}: ${p.patterns.map(x => RELATION_KO[x.type] ?? x.type).join('·') || '확인한 직접 관계 없음'}`))
  lines.push('검수용 계산 근거', ...plan.primary.positions.map(p => `${POSITION_KO[p.position]}: ${p.ganzi}, 천간 ${p.stemGod ? NAME(p.stemGod) : '일간'}, 지지 중심 ${NAME(p.principalGod)}`), '월지 투간: ' + plan.primary.strength.monthlyHidden.map(x => `${x.stem} ${NAME(x.god)} → ${x.exposedAt.map(position => POSITION_KO[position]).join(', ') || '확인된 투간 없음'}`).join(' / '), plan.primary.strength.patternCandidate ? `월령 격국 후보: ${plan.primary.strength.patternCandidate.stem} ${NAME(plan.primary.strength.patternCandidate.god)}. 격국의 성패나 단일 용신을 확정한 것이 아닙니다.` : '일반 격국 후보를 하나로 확정하지 않았습니다.', '억부의 균형 후보군, 월령 격국 후보, 조후·특수격·합화의 확정 판단은 구분합니다. 이번 모델은 보수적 검수 규칙이며 전체 학파의 공통 공식이나 검증된 미래 예측 모델이 아닙니다.', '시기와 대운 Date는 기존 계산 달력의 벽시계 필드이며 ISO의 Z를 사건의 실제 UTC 순간으로 해석하지 않습니다. 매월 15일은 월 전체의 사건 예측이 아닙니다.', '미래 수입·질병·결혼·이별을 보장하지 않습니다. 시간 미상은 시간주를 제외하고 강약과 유리·불리 판정을 보류합니다.')
  return lines.join('\n\n')
}
export function koreanBundleOverview(plans: { complete: InterpretationPlan; compatibility: InterpretationPlan; annual: InterpretationPlan }) {
  return ['인생·사랑·올해의 운은 어떻게 연결될까?', '종합운과 연간 운세의 대상은 A이며 궁합은 A와 B를 비교합니다.', money(plans.complete.primary), strength(plans.complete.primary), ...pairContent(plans.compatibility, 'two-styles'), timing(plans.annual.annual[0]), '원국의 기본 구조, 두 사람의 차이, 해당 연도의 변화를 구분해서 연결합니다. 반복된 주제는 사건 확률을 더하는 점수가 아닙니다.'].join('\n\n')
}
