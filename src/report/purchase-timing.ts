import { WORKING_LANGUAGE } from './purchase-language.ts'
/** Activity-specific traditional interpretation. No profit, event or all-purpose lucky-year score. */
import type { SajuResult } from '@orrery/core/types'
import { monthlyPoint, timingPoint, pointForPillar, POSITION } from './traditional-analysis.ts'
import { periodAssessment, structuralFacts } from './structural-assessment.ts'
export type TimingArea = 'work' | 'money' | 'business' | 'love' | 'life'
export interface TimingSentence { id: string; en: string; ko: string }
const OUTPUT = ['食神', '傷官'], MONEY = ['正財', '偏財'], RESOURCE = ['正印', '偏印'], AUTHORITY = ['正官', '偏官']
const FRIC = ['沖', '刑', '害', '破']
const role: Record<string, { en: string; ko: string; cautionEn: string; cautionKo: string }> = {
 比肩: { en: 'taking ownership of your work', ko: '자기 판단으로 맡은 일을 이끄는 것', cautionEn: 'doing everything alone or competing over the final say', cautionKo: '모든 일을 혼자 하거나 결정권을 놓고 경쟁하는 것' },
 劫財: { en: 'working through contacts and shared projects', ko: '인맥과 공동 작업을 활용하는 것', cautionEn: 'sharing costs or fees without agreeing who owns what', cautionKo: '누구의 돈인지 정하지 않고 비용이나 수익을 나누는 것' },
 食神: { en: 'turning a practised skill into something people can use', ko: '익숙한 기술을 사람들이 쓸 수 있는 결과로 만드는 것', cautionEn: 'taking on more orders than you can reliably deliver', cautionKo: '안정적으로 마칠 수 있는 양보다 많은 일을 받는 것' },
 傷官: { en: 'showing your ideas or improving an existing way of working', ko: '자기 생각을 보여 주거나 기존 일하는 방식을 개선하는 것', cautionEn: 'letting a good suggestion sound like criticism of the person in charge', cautionKo: '좋은 제안을 책임자에 대한 비판처럼 전달하는 것' },
 正財: { en: 'steady pay, repeat customers and ongoing commitments', ko: '고정 수입과 단골 고객, 계속 맡아야 하는 일', cautionEn: 'accepting extra costs or duties without enough pay or time', cautionKo: '보상이나 시간 없이 비용과 일을 더 떠맡는 것' },
 偏財: { en: 'new customers, deals and work with changing fees', ko: '새 고객과 거래, 수입이 달라지는 일', cautionEn: 'counting an offer as income before the work is paid for', cautionKo: '대금을 받기 전에 제안을 수입으로 여기는 것' },
 正官: { en: 'a recognised role with clear responsibilities', ko: '책임이 분명하고 인정받는 역할', cautionEn: 'accepting a title without the authority or pay to match it', cautionKo: '권한이나 보상이 따르지 않는 직함을 받아들이는 것' },
 偏官: { en: 'demanding targets and decisions that need a firm response', ko: '높은 목표와 단호한 대응이 필요한 결정', cautionEn: 'letting urgency replace enough staff, time or authority', cautionKo: '인력과 시간, 권한이 부족한데 급하게 밀어붙이는 것' },
 正印: { en: 'training, qualifications and dependable support', ko: '배움과 자격, 믿을 수 있는 도움', cautionEn: 'spending more time or money preparing when you could already use the skill', cautionKo: '이미 쓸 수 있는 기술이 있는데 준비에 시간과 돈을 더 쓰는 것' },
 偏印: { en: 'specialist knowledge and time to work something out', ko: '전문 지식과 깊이 생각할 시간', cautionEn: 'making the offer too complicated for a customer or employer to understand', cautionKo: '고객이나 고용주가 이해하기 어렵게 일을 복잡하게 만드는 것' },
}
const has = (gods: string[], set: string[]) => gods.some(g => set.includes(g))
const location: Record<string, [string, string]> = { hour: ['plans and longer-term commitments', '앞으로의 계획과 오래 맡을 일'], day: ['private choices and close relationships', '개인적인 선택과 가까운 관계'], month: ['work and daily responsibilities', '직장과 매일 맡는 일'], year: ['wider contacts and shared obligations', '주변 사람들과 공동 책임'] }
export function purchaseTiming(result: SajuResult, point: ReturnType<typeof monthlyPoint>, area: TimingArea, label = point.date.slice(0, 7)) {
 const assessment = periodAssessment(result, point.pillar, point.date, point.yearPillar), facts = structuralFacts(result)
 const present = [...facts.exposed.map(n => n.god), ...facts.hidden.filter(n => n.principal).map(n => n.god)]
 const now = [point.god, point.innerGod], longer = assessment.cycle ? [assessment.cycle.stemSipsin, assessment.cycle.branchSipsin] : []
 const targets = area === 'love' ? [1] : area === 'life' ? [1, 2] : [2]
 const relevant = point.comparisons.filter(c => targets.includes(c.index))
 const tension = relevant.filter(c => c.found.some(p => FRIC.includes(p.type)))
 const widerTension = point.comparisons.filter(c => !targets.includes(c.index) && c.found.some(p => FRIC.includes(p.type)))
 const combination = relevant.filter(c => c.found.some(p => p.type === '合'))
 const cycleTension = !!assessment.cyclePair?.found.some(p => FRIC.includes(p.type))
 const yearTension = !!assessment.annualPair?.found.some(p => FRIC.includes(p.type))
 const capacityOpen = facts.tendency === 'mixed'
 const capacityLimited = facts.tendency === 'support-needed' || facts.tendency === 'deferred'
 const route = has(present, OUTPUT) && has(now, MONEY) && has(longer, [...OUTPUT, ...MONEY]) ? 'skill-to-customers'
   : has(present, MONEY) && has(now, OUTPUT) && has(longer, [...OUTPUT, ...MONEY]) ? 'customers-to-offer'
   : has(present, RESOURCE) && has(now, AUTHORITY) && has(longer, [...RESOURCE, ...AUTHORITY]) ? 'expertise-to-role'
   : has(present, AUTHORITY) && has(now, RESOURCE) && has(longer, [...RESOURCE, ...AUTHORITY]) ? 'support-for-role'
   : null
 const relevantRoute = area === 'money' || area === 'business' ? route?.includes('customers') || route === 'customers-to-offer' ? route : null : area === 'love' ? combination.length && !cycleTension ? 'shared-arrangement' : null : route
 // A matched activity is never promoted to an overall favourable period when capacity is unresolved.
 const opening = relevantRoute && !capacityLimited ? relevantRoute : null
 const openingHasCaution = !!tension.length || cycleTension || yearTension || !!widerTension.length
 const activityFits = area === 'money' || area === 'business' ? !!relevantRoute : area === 'love' ? combination.length > 0 : true
 const support = activityFits && facts.tendency !== 'deferred' && !assessment.tension && ['potential-support', 'potential-outlet'].includes(assessment.direction)
 const status = opening ? openingHasCaution ? 'opening-with-caution' : 'conditional-opening' : support ? 'conditional-support' : tension.length || cycleTension || yearTension || assessment.direction === 'added-demand' ? 'extra-care' : 'topic-only'
 const lines: TimingSentence[] = []
 const add = (id: string, en: string, ko: string) => lines.push({id: `${area}.${point.date}.${id}`, en, ko})
 const labelEn = /^\d{4}-\d{2}$/.test(label) ? new Date(label+'-15T12:00:00Z').toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}) : label
 const themes = now[0] === now[1] ? role[now[0]].en : `${role[now[0]].en}, alongside ${role[now[1]].en}`
 const koThemes = now[0] === now[1] ? role[now[0]].ko : `${role[now[0]].ko}, 그리고 ${role[now[1]].ko}`
 const activityScope = area==='business' ? ['a launch, customer order or expansion','창업·고객 주문·확장'] : area==='work' ? ['a job move, promotion or change of duties','이직·승진·업무 변화'] : ['a major move','중요한 변화']
 const openings: Record<string, [string, string]> = {
  'skill-to-customers': area==='business' ? ['testing a repeatable product or service with paying customers','반복해서 제공할 상품이나 서비스를 유료 고객에게 시험하는 일'] : ['connecting a skill you can demonstrate with paid projects','실제로 보여 줄 수 있는 기술을 유료 업무로 연결하는 일'],
  'customers-to-offer': area==='business' ? ['improving an offer or delivery method where real demand is established','실제 수요가 확인된 곳에서 상품이나 제공 방식을 개선하는 일'] : ['using practical skills in work with a clear fee or rate','분명한 대금이나 단가가 있는 일에 실용적인 기술을 쓰는 일'],
  'expertise-to-role': ['applying your knowledge to a recognised role or greater responsibility', '쌓은 지식을 인정받는 역할이나 더 큰 책임으로 연결하는 일'],
  'support-for-role': ['gaining training or support for responsibilities you already carry', '이미 맡은 일을 위해 교육이나 도움을 받는 일'],
  'shared-arrangement': ['making a shared plan or agreement', '함께할 계획이나 약속을 구체화하는 일'],
 }
 if (opening) add('verdict', `${labelEn}: this is ${openingHasCaution ? 'an opening with competing demands' : 'a conditional opening'} for ${openings[opening][0]}. Your birth chart and both periods link around this activity.${openingHasCaution ? ' The pressures below still apply; this is not an easy-period recommendation.' : ''} It is not a prediction of an offer, promotion, profit or commitment.`, `${label}: ${openings[opening][1]}을 살펴볼 ${openingHasCaution ? '기회와 부담이 함께 있는 시기' : '조건부 기회'}로 읽습니다. 타고난 특징과 두 시기가 이 활동으로 연결됩니다.${openingHasCaution ? ' 아래의 부담도 남으므로 편한 시기로 추천하지 않습니다.' : ''} 제안·승진·수익·관계의 약속에 대한 예측은 아닙니다.`)
 else if (support) add('verdict', `${labelEn}: the shorter and longer periods give a consistent direction for handling extra work or responsibility. In this reading, that can support a practical step, provided the actual work and resources fit.`, `${label}: 짧은 시기와 긴 시기가 일을 감당하는 방향에서 일치합니다. 실제 업무와 자원이 맞는다면 구체적인 다음 행동을 뒷받침하는 흐름으로 읽습니다.`)
 else if (status === 'extra-care') add('verdict', `${labelEn}: ${activityScope[0]} needs closer attention to changing arrangements and extra demands. The themes are ${themes}. The comparisons below identify the pressure; they do not label the whole period unlucky.`, `${label}: ${activityScope[1]}에서는 달라지는 약속과 추가 요구를 더 살핍니다. ${koThemes}이 주제로 나타납니다. 아래의 비교에서 부담을 읽으며 시기 전체가 나쁘다고 정하지 않습니다.`)
 else add('verdict', `${labelEn}: the clearest themes are ${themes}. The checks do not establish a better or worse period for ${area === 'love' ? 'the relationship' : activityScope[0]}, so this is an activity reading rather than a lucky-date recommendation.`, `${label}: ${koThemes}이 중심 주제입니다. ${area === 'love' ? '관계' : activityScope[1]}에 더 좋거나 나쁜 시기라고 정할 근거는 부족하므로 행운의 날짜가 아닌 활동의 흐름으로 읽습니다.`)
 const context = area === 'business' ? WORKING_LANGUAGE[point.god].business : area === 'money' ? WORKING_LANGUAGE[point.god].money : area === 'love' ? WORKING_LANGUAGE[point.innerGod].love : WORKING_LANGUAGE[point.god].work
 add('area-context',context.en,context.ko)
 if (opening || support) add('themes', `What this may look like: ${themes}. The detail matters: an opening to earn is different from money you can keep, and a larger role is different from a better-paid one.`, `생활에서는 ${koThemes}으로 나타날 수 있습니다. 돈을 벌 기회와 남길 수 있는 돈, 큰 역할과 보상이 좋은 역할은 구분합니다.`)
 if (capacityOpen && area==='business') add('capacity','Your chart does not give a clear answer about spare capacity for more orders. A customer opportunity may still require extra staff, delivery time or money tied up before payment arrives.','주문을 더 감당할 여유는 한 방향으로 판단되지 않습니다. 고객 기회가 있어도 추가 인력과 납품 시간, 대금을 받기 전에 묶이는 돈이 필요할 수 있습니다.')
 else if (capacityOpen) add('capacity', 'Your birth chart gives a mixed picture of spare capacity. Even where an activity fits, the reading cannot call this a generally easy or profitable period. Time, costs and support remain conditions of the opening.', '추가 일을 감당할 여유는 한 방향으로 판단되지 않습니다. 활동의 연결이 맞아도 전반적으로 편하거나 수익이 좋은 시기라고 정하지 않습니다. 시간·비용·도움이 갖춰져야 한다는 조건이 남습니다.')
 if (facts.tendency === 'support-needed') add('capacity', 'Your chart leans towards needing support before taking on extra demands. A busy money period may therefore mean more customers to manage or more bills to cover, rather than more money left over.', '추가 요구를 맡기 전에 도움이 필요한 쪽으로 읽습니다. 돈과 관련해 바빠져도 남는 돈보다 관리할 고객이나 내야 할 비용이 늘어나는 모습일 수 있습니다.')
 if (facts.tendency === 'deferred') add('capacity', result.input.unknownTime ? 'Your birth time is unknown. The missing part could change the balance and the timing, so no favourable-period recommendation is made from it.' : 'The available signs do not support a clear overall balance judgement in this reading. No favourable-period recommendation is made from an unresolved judgement.', result.input.unknownTime ? '출생시간을 몰라 빠진 부분에 따라 균형과 시기가 달라질 수 있습니다. 이를 근거로 유리한 시기를 추천하지 않습니다.' : '현재 풀이 기준으로 전체 균형을 분명히 판단할 수 없습니다. 미정인 판단으로 유리한 시기를 추천하지 않습니다.')
 if (assessment.cycle) add('longer', `The longer background runs from ${result.input.unknownTime?'around ':''}${assessment.cycle.startDate.toISOString().slice(0,10)}${result.input.unknownTime?' (approximate because the birth time is unknown)':''}: ${area==='business'?WORKING_LANGUAGE[assessment.cycle.stemSipsin].business.en.replace(/\.$/,''):area==='work'?WORKING_LANGUAGE[assessment.cycle.stemSipsin].work.en.replace(/\.$/,''):role[assessment.cycle.stemSipsin].en}. ${area==='business'?'The longer business demands stay relevant when a shorter customer opening appears.':area==='work'?'This longer work pattern remains relevant when a new role or duty appears.':'It helps explain why the same year can affect two people differently.'}`, `긴 흐름은 ${assessment.cycle.startDate.toISOString().slice(0,10)}${result.input.unknownTime?' 전후(출생시간 미상으로 대략적인 시작일)':''}부터 시작하며 ${area==='business'?WORKING_LANGUAGE[assessment.cycle.stemSipsin].business.ko:area==='work'?WORKING_LANGUAGE[assessment.cycle.stemSipsin].work.ko:role[assessment.cycle.stemSipsin].ko} ${area==='business'?'짧은 고객 기회가 나타나도 긴 사업의 요구는 함께 남습니다.':area==='work'?'새 역할이나 업무가 생겨도 긴 업무의 특징은 함께 남습니다.':'같은 해가 사람마다 다르게 읽히는 배경입니다.'}`)
 else add('longer', 'The calculated range contains no active longer period at this date. The short-term themes remain visible, but a recommendation requiring that longer comparison is withheld.', '이 날짜에 해당하는 긴 흐름이 계산 범위에 없습니다. 짧은 시기의 주제는 설명하되 긴 흐름과의 비교가 필요한 추천은 하지 않습니다.')
 if(assessment.cycle && assessment.cycle.stemSipsin!==assessment.cycle.branchSipsin){
  const innerContext = area==='business'?WORKING_LANGUAGE[assessment.cycle.branchSipsin].business:area==='work'?WORKING_LANGUAGE[assessment.cycle.branchSipsin].work:null
  add('longer-inner',innerContext?`The longer reading also adds another theme. ${innerContext.en}`:`Another longer-term theme is ${role[assessment.cycle.branchSipsin].en}.`,`긴 시기의 또 다른 주제는 다음과 같습니다. ${innerContext?innerContext.ko:role[assessment.cycle.branchSipsin].ko+'입니다.'}`)
 }
 for (const c of tension) {
  const where = location[POSITION[c.index]], clash = c.found.some(p=>p.type==='沖')
  add('change-'+POSITION[c.index], `The comparison with ${where[0]} shows ${clash ? 'a direct clash' : 'friction'}. A possible expression is ${c.index===2 ? 'a changed job remit, schedule or division of work' : c.index===1 ? 'different expectations about shared time, closeness or a private decision' : 'a commitment that needs renegotiating'}. It does not establish a dismissal, loss or separation.`, `${where[1]}과의 비교에서 ${clash ? '직접 부딪히는 관계' : '마찰'}가 확인됩니다. ${c.index===2 ? '업무 범위·일정·분담의 변경' : c.index===1 ? '함께할 시간이나 친밀감, 개인적 선택에 대한 기대 차이' : '약속의 재조정'}로 나타날 수 있으며 해고·손실·이별을 확정하지 않습니다.`)
 }
 if (!tension.length && combination.length) add('connection', `The comparison draws ${combination.map(c=>location[POSITION[c.index]][0]).join(' and ')} together. This may favour discussing how to cooperate, but an agreement can also add duties; it does not prove affection or a successful deal.`, `${combination.map(c=>location[POSITION[c.index]][1]).join('·')}을 묶는 관계가 확인됩니다. 협력 방식을 의논하는 주제로 읽지만 약속에 일이 더 따를 수 있으며 애정이나 거래 성공을 증명하지 않습니다.`)
 if (cycleTension || yearTension) add('background-pressure', `The shorter period also conflicts with ${cycleTension && yearTension ? 'both the longer period and the year' : cycleTension ? 'the longer period' : 'the year'}. This is a reason to avoid calling a matching money or work theme an uncomplicated opportunity.`, `짧은 시기는 ${cycleTension && yearTension ? '긴 흐름 및 해당 연도 모두' : cycleTension ? '긴 흐름' : '해당 연도'}와도 부딪힙니다. 돈이나 직업의 주제가 맞아도 수월한 기회라고 정하지 않는 이유입니다.`)
 if (widerTension.length) add('wider-pressure', `A separate comparison concerns ${widerTension.map(c=>location[POSITION[c.index]][0]).join(' and ')}. Keep that wider obligation alongside this ${area === 'love' ? 'relationship' : 'work or money'} reading; a helpful activity can still compete with time needed elsewhere.`, `${widerTension.map(c=>location[POSITION[c.index]][1]).join('·')}에서도 별도 마찰이 확인됩니다. 다른 곳에 필요한 시간과 책임이 이번 ${area==='love'?'관계':'일·돈'}의 활동과 겹칠 수 있으므로 함께 읽습니다.`)
 add('caution', `The practical caution is ${role[point.god].cautionEn}${point.god!==point.innerGod ? `; also watch for ${role[point.innerGod].cautionEn}` : ''}.`, `생활에서 살필 점은 ${role[point.god].cautionKo}${point.god!==point.innerGod ? `, 그리고 ${role[point.innerGod].cautionKo}` : ''}입니다.`)
 const evidence = [...point.facts, ...assessment.evidence, `Activity policy FATE-activity-r1: area ${area}; route ${relevantRoute ?? 'none'}; status ${status}; capacity ${facts.tendency}; natal roles ${present.join('/')}; reference roles ${now.join('/')}; longer roles ${longer.join('/')}; no overall luck judgement from a matched activity.`]
 return { date: point.date, area, status, route: opening, capacity: facts.tendency, lines, evidence, assessment }
}
export function purchaseYears(result: SajuResult, year: number, area: TimingArea, count=10) {
 return Array.from({length:Math.min(count,2101-year)},(_,i)=>purchaseTiming(result,timingPoint(result,year+i),area,String(year+i)))
}
export function purchaseMonths(result: SajuResult, year: number, area: TimingArea='life') {
 return Array.from({length:12},(_,i)=>purchaseTiming(result,monthlyPoint(result,year,i+1),area))
}
export function purchaseCycle(result: SajuResult, cycle: SajuResult['daewoon'][number], area: TimingArea) {
 const check = new Date(cycle.startDate.getTime() + 86400000).toISOString().slice(0,10)
 return purchaseTiming(result,pointForPillar(result,cycle.ganzi,check),area,`From ${cycle.startDate.toISOString().slice(0,10)}`)
}
