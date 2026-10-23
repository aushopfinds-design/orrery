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
 const themes = now[0] === now[1] ? role[now[0]].en : `${role[now[0]].en} and ${role[now[1]].en}`
 const koThemes = now[0] === now[1] ? role[now[0]].ko : `${role[now[0]].ko}·${role[now[1]].ko}`
 const activity: Record<string,[string,string]> = {
  'skill-to-customers': area==='business' ? ['selling a product or service built on a skill you already use','이미 쓰는 기술을 상품이나 서비스로 판매하는 일'] : ['turning an established skill into paid work','익숙한 기술을 유료 업무로 연결하는 일'],
  'customers-to-offer': area==='business' ? ['improving what you sell to an existing customer base','기존 고객에게 제공하는 상품을 개선하는 일'] : ['using your skills on work with an agreed fee','대금이 정해진 일에 기술을 쓰는 일'],
  'expertise-to-role':['taking on a role that makes better use of your knowledge','지식을 더 잘 활용하는 역할을 맡는 일'],
  'support-for-role':['getting training or help for a demanding role','부담이 큰 업무에 필요한 교육이나 도움을 받는 일'],
  'shared-arrangement':['agreeing on a shared plan','함께할 계획을 정하는 일'],
 }
 const care: Record<TimingArea,[string,string]>={work:['Work changes need more attention to duties and workload.','업무 변화에서 담당 범위와 업무량을 더 살필 시기입니다.'],money:['Money commitments need closer attention to costs and who pays.','돈을 약속할 때 비용과 부담 주체를 더 살필 시기입니다.'],business:['Business commitments can stretch delivery time or shared resources.','사업의 약속이 납품 시간이나 공동 자원의 부담을 키울 수 있습니다.'],love:['Different expectations about time and commitment need more attention.','함께할 시간과 약속에 대한 기대 차이를 더 살필 시기입니다.'],life:['Changing responsibilities may pull work and private plans in different directions.','달라지는 책임 때문에 일과 개인 계획을 함께 맞춰야 할 수 있습니다.']}
 if(opening) add('verdict',`${labelEn}: a useful period to explore ${activity[opening][0]}${openingHasCaution?', with extra demands to manage':''}.`,`${label}: ${activity[opening][1]}을 살펴볼 만한 시기입니다.${openingHasCaution?' 다만 함께 늘어나는 부담도 관리해야 합니다.':''}`)
 else if(support) add('verdict',`${labelEn}: there is support for ${area==='love'?'working out a shared arrangement':area==='business'?'strengthening the business you can already deliver':'handling a role or task you have been preparing for'}.`,`${label}: ${area==='love'?'함께할 방식을 정하는 일':area==='business'?'이미 제공할 수 있는 사업의 기반을 다지는 일':'준비해 온 역할이나 업무를 감당하는 일'}에 도움이 되는 흐름입니다.`)
 else if(status==='extra-care') add('verdict',`${labelEn}: ${care[area][0]} The focus is ${themes}.`,`${label}: ${care[area][1]} 중심 주제는 ${koThemes}입니다.`)
 else add('verdict',`${labelEn}: focus on ${themes}.`,`${label}: ${koThemes}에 초점을 두는 시기입니다.`)
 // Explain the observed relationship, without treating a symbol as a guaranteed event.
 if(opening){
  const reason:Record<string,[string,string]>={
   'skill-to-customers':['Your birth chart already emphasises producing useful work; this period adds customers and income, with a similar theme in your ten-year cycle.','타고난 사주에 결과물을 만드는 특징이 있고, 이번 시기에 고객과 재물의 주제가 더해지며 긴 흐름도 이를 잇습니다.'],
   'customers-to-offer':['Your birth chart emphasises customers and money; this period adds practical output, supported by a related ten-year theme.','타고난 사주에 고객과 재물의 특징이 있고, 이번 시기에 결과물을 만드는 주제가 더해지며 긴 흐름도 이를 잇습니다.'],
   'expertise-to-role':['Learning or specialist knowledge in your birth chart meets responsibility in this period and a related ten-year cycle.','타고난 사주의 배움·전문 지식이 이번 시기의 책임과 연결되고 긴 흐름에서도 관련 주제가 나타납니다.'],
   'support-for-role':['Responsibility in your birth chart meets learning and support in this period, with a related ten-year theme.','타고난 사주의 책임이 이번 시기의 배움·도움과 연결되고 긴 흐름에서도 관련 주제가 나타납니다.'],
   'shared-arrangement':['This period forms a linking relationship with the part of the birth chart used to read private life.','이번 시기는 타고난 사주에서 사적인 관계를 읽는 부분과 연결됩니다.'],
  };add('reason',reason[opening][0],reason[opening][1])
 }else add('area-context',`The period brings ${themes}; your birth chart gives these themes their personal context.`,`이번 시기에는 ${koThemes}이 더해집니다. 이 주제를 타고난 사주와 함께 읽습니다.`)
 if(facts.tendency==='support-needed')add('capacity','Extra duties can use up time or money faster than the work pays back. Help with delivery matters more than taking every opportunity.','일이 늘면 보상을 받기 전에 시간이나 돈의 부담이 커질 수 있습니다. 모든 기회를 받기보다 업무를 함께 감당할 도움이 중요합니다.')
 if(facts.tendency==='deferred')add('capacity',result.input.unknownTime?'Your birth time is missing, so the timing stays descriptive; it is not ranked as favourable.':'The overall balance is unresolved, so this period is described without a favourable ranking.',result.input.unknownTime?'출생시간이 없어 시기의 특징만 설명하고 유리한 시기로 고르지 않습니다.':'전체 균형 판단이 미정이므로 시기의 특징만 설명하고 유리한 시기로 고르지 않습니다.')
 for(const c of tension){
  const clash=c.found.some(p=>p.type==='沖')
  add('change-'+POSITION[c.index],c.index===2?`Work routines may need ${clash?'a bigger adjustment':'some adjustment'}, such as a new schedule, a changed role or a different division of tasks.`:'You may need to revisit how much time you spend together, how close you want to be or who makes a private decision.',c.index===2?`근무 일정과 역할, 업무 분담을 ${clash?'크게 조정할':'조정할'} 주제로 읽습니다.`:'함께하는 시간과 친밀감, 개인적인 결정의 담당을 다시 맞출 주제로 읽습니다.')
 }
 if(!tension.length&&combination.length)add('connection','Making plans together is a clearer theme here. Agreeing on what each person will actually do can matter as much as the promise itself.','함께 계획을 정하는 주제가 두드러집니다. 약속뿐 아니라 각자 실제로 무엇을 맡을지 정하는 일도 중요합니다.')
 if(cycleTension||yearTension)add('background-pressure',`The ${cycleTension?'ten-year background':'annual background'} pulls against this shorter period. A new commitment may have to compete with work or plans already in progress.`,`${cycleTension?'긴 흐름':'해당 연도의 흐름'}과 이번 짧은 시기가 부딪힙니다. 새로운 약속이 이미 진행 중인 일이나 계획과 겹칠 수 있습니다.`)
 if(widerTension.length)add('wider-pressure',`There is also pressure around ${widerTension.map(c=>location[POSITION[c.index]][0]).join(' and ')}. Leave room for those obligations when considering the opportunity.`,`${widerTension.map(c=>location[POSITION[c.index]][1]).join('·')}에도 부담이 나타납니다. 기회를 살필 때 그 책임을 감당할 여유도 함께 봅니다.`)
 add('caution',`Watch for ${role[point.god].cautionEn}${point.god!==point.innerGod?`; and ${role[point.innerGod].cautionEn}`:''}.`,`주의할 점은 ${role[point.god].cautionKo}${point.god!==point.innerGod?`·${role[point.innerGod].cautionKo}`:''}입니다.`)
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
