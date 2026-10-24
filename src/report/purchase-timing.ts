/** Activity-specific traditional interpretation. No profit, event or all-purpose lucky-year score. */
import { BUYER_ANSWERS } from './buyer-answers.ts'
import { WORKING_LANGUAGE } from './purchase-language.ts'
import { periodFocus, PERIOD_VOICE } from './period-voice.ts'
import type { SajuResult } from '@orrery/core/types'
import { monthlyPoint, timingPoint, pointForPillar, POSITION } from './traditional-analysis.ts'
import { periodAssessment, structuralFacts } from './structural-assessment.ts'
export type TimingArea = 'work' | 'money' | 'business' | 'love' | 'life'
export interface TimingSentence { id: string; en: string; ko: string }
const OUTPUT = ['食神', '傷官'], MONEY = ['正財', '偏財'], RESOURCE = ['正印', '偏印'], AUTHORITY = ['正官', '偏官']
const FRIC = ['沖', '刑', '害', '破']
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
 const focus=periodFocus(point.god,point.innerGod)
 const activity: Record<string,[string,string]> = {
  'skill-to-customers': area==='business' ? ['selling a product or service built on a skill you already use','이미 쓰는 기술을 상품이나 서비스로 판매하는 일'] : ['turning an established skill into paid work','익숙한 기술을 유료 업무로 연결하는 일'],
  'customers-to-offer': area==='business' ? ['improving what you sell to an existing customer base','기존 고객에게 제공하는 상품을 개선하는 일'] : ['using your skills on work with an agreed fee','대금이 정해진 일에 기술을 쓰는 일'],
  'expertise-to-role':['taking on a role that makes better use of your knowledge','지식을 더 잘 활용하는 역할을 맡는 일'],
  'support-for-role':['getting training or help for a demanding role','부담이 큰 업무에 필요한 교육이나 도움을 받는 일'],
  'shared-arrangement':['agreeing on a shared plan','함께할 계획을 정하는 일'],
 }
 const labels:Record<string,[string,string]>={'conditional-opening':['Opening','기회'],'opening-with-caution':['Opening + pressure','기회와 부담'],'conditional-support':['Support','도움'],'extra-care':['Adjustment','조정'],'topic-only':['Focus','중심 주제']}
 const badge=facts.tendency==='deferred'?['Timing uncertain','시기 판단 제한']:labels[status]
 add('verdict',`${labelEn}: ${badge[0]} — ${focus.en}`,`${label}: ${badge[1]} — ${focus.ko}`)
 if(opening)add('opening',`There is an opening for ${activity[opening][0]}${openingHasCaution?', with extra demands to manage':''}.`,`${activity[opening][1]}을 살펴볼 기회입니다.${openingHasCaution?' 함께 늘어나는 부담도 관리해야 합니다.':''}`)
 // Explain the observed relationship, without treating a symbol as a guaranteed event.
 if(opening){
  const reason:Record<string,[string,string]>={
   'skill-to-customers':['Your birth chart already emphasises producing useful work; this period adds customers and income, with a similar theme in your ten-year cycle.','타고난 사주에 결과물을 만드는 특징이 있고, 이번 시기에 고객과 재물의 주제가 더해지며 긴 흐름도 이를 잇습니다.'],
   'customers-to-offer':['Your birth chart emphasises customers and money; this period adds practical output, supported by a related ten-year theme.','타고난 사주에 고객과 재물의 특징이 있고, 이번 시기에 결과물을 만드는 주제가 더해지며 긴 흐름도 이를 잇습니다.'],
   'expertise-to-role':['Learning or specialist knowledge in your birth chart meets responsibility in this period and a related ten-year cycle.','타고난 사주의 배움·전문 지식이 이번 시기의 책임과 연결되고 긴 흐름에서도 관련 주제가 나타납니다.'],
   'support-for-role':['Responsibility in your birth chart meets learning and support in this period, with a related ten-year theme.','타고난 사주의 책임이 이번 시기의 배움·도움과 연결되고 긴 흐름에서도 관련 주제가 나타납니다.'],
   'shared-arrangement':['This period forms a linking relationship with the part of the birth chart used to read private life.','이번 시기는 타고난 사주에서 사적인 관계를 읽는 부분과 연결됩니다.'],
  };add('reason',reason[opening][0],reason[opening][1])
 }
 if(area==='work'||area==='business'){const context=area==='business'?BUYER_ANSWERS[point.god].grow:BUYER_ANSWERS[point.god].recognition;add('area-context',context.en,context.ko)}
 if(facts.tendency==='support-needed')add('capacity','Extra duties can use up time or money faster than the work pays back. Help with delivery matters more than taking every opportunity.','일이 늘면 보상을 받기 전에 시간이나 돈의 부담이 커질 수 있습니다. 모든 기회를 받기보다 업무를 함께 감당할 도움이 중요합니다.')
 if(facts.tendency==='deferred')add('capacity',result.input.unknownTime?'Your birth time is missing, so the timing stays descriptive; it is not ranked as favourable.':'The overall balance is unresolved, so this period is described without a favourable ranking.',result.input.unknownTime?'출생시간이 없어 시기의 특징만 설명하고 유리한 시기로 고르지 않습니다.':'전체 균형 판단이 미정이므로 시기의 특징만 설명하고 유리한 시기로 고르지 않습니다.')
 for(const c of tension){
  const clash=c.found.some(p=>p.type==='沖')
  const role=WORKING_LANGUAGE[point.god].name, natal=WORKING_LANGUAGE[result.pillars[c.index].branchSipsin].name
  add('change-'+POSITION[c.index],c.index===2?`${clash?'A direct clash':'A friction pattern'} links this period with the part of your chart read for work. The demand for ${role.en} meets your established daily pattern of ${natal.en}; ${clash?'a change in duties or schedule is a stronger theme here':'the way tasks are shared may need adjustment'}.`:`The ${clash?'clash':'friction pattern'} touches the part of your chart read for private life. ${role.en[0].toUpperCase()+role.en.slice(1)} may compete with time together or the freedom to make a personal choice.`,c.index===2?`이번 시기와 태어난 달의 지지가 ${clash?'충으로 직접 부딪힙니다':'마찰을 이룹니다'}. ${role.ko}의 요구가 평소 ${natal.ko}의 업무 방식과 만납니다. ${clash?'담당이나 일정의 변화를 더 강하게 읽습니다':'업무를 나누는 방식을 조정할 수 있습니다'}.`:`사적인 생활을 읽는 태어난 날의 지지에 ${clash?'충':'마찰'}이 닿습니다. ${role.ko}의 요구가 함께하는 시간이나 개인적으로 선택할 여유와 겹칠 수 있습니다.`)
 }
 if(!tension.length&&combination.length)add('connection','Making plans together is a clearer theme here. Agreeing on what each person will actually do can matter as much as the promise itself.','함께 계획을 정하는 주제가 두드러집니다. 약속뿐 아니라 각자 실제로 무엇을 맡을지 정하는 일도 중요합니다.')
 if(cycleTension||yearTension)add('background-pressure',`The ${cycleTension?'ten-year cycle':'year'} also forms a friction pattern with this reference. ${WORKING_LANGUAGE[point.god].name.en[0].toUpperCase()+WORKING_LANGUAGE[point.god].name.en.slice(1)} must fit around ${WORKING_LANGUAGE[cycleTension?assessment.cycle!.stemSipsin:pointForPillar(result,point.yearPillar,point.date).god].name.en}, rather than replacing the longer-running demand.`,`${cycleTension?'대운':'해당 연도'}도 이번 기준 시기와 마찰을 이룹니다. ${WORKING_LANGUAGE[point.god].name.ko}은 ${WORKING_LANGUAGE[cycleTension?assessment.cycle!.stemSipsin:pointForPillar(result,point.yearPillar,point.date).god].name.ko}의 기존 요구를 없애기보다 함께 감당할 주제입니다.`)
 if(widerTension.length)add('wider-pressure',`There is also pressure around ${widerTension.map(c=>location[POSITION[c.index]][0]).join(' and ')}. Leave room for those obligations when considering the opportunity.`,`${widerTension.map(c=>location[POSITION[c.index]][1]).join('·')}에도 부담이 나타납니다. 기회를 살필 때 그 책임을 감당할 여유도 함께 봅니다.`)
 add('caution',PERIOD_VOICE[point.god].action.en,PERIOD_VOICE[point.god].action.ko)
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
