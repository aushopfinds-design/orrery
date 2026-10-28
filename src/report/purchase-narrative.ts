Warning: truncated output (original token count: 21836)
Total output lines: 317

import { roleChoice, businessDivision, relationshipRepair, personalBoundary, monthlyFit } from './personalised-choices.ts'
import { sharedCareNeed } from './relationship-needs.ts'
import { TEMPERAMENT_KO } from './temperament-ko.ts'
import { temperamentDetail } from './report-extras.ts'
import { capacityBasis, moneyDepth, personalContrast } from './chart-depth.ts'
import { businessVerdict, lifeWork, partnerVerdict } from './chart-verdicts.ts'
import { PERIOD_VOICE, humanMonth } from './period-voice.ts'
import { BUYER_ANSWERS } from './buyer-answers.ts'
import type { InterpretationPlan } from './interpretation-plan.ts'
import { WORKING_LANGUAGE as LANGUAGE, pair } from './purchase-language.ts'
import type { Passage } from './purchase-language.ts'
import { purchaseTimingSections } from './purchase-timing-sections.ts'
import { purchaseYears } from './purchase-timing.ts'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { PERSONAL_KO, PERSONAL_SCENE_KO, PRIVATE_FRICTION_KO } from './native-profile-language.ts'
import { customerEnglish } from './customer-language.ts'
import { availablePillars, pairObservation, POSITION } from './traditional-analysis.ts'
import { plainReadingText } from './reading-text.ts'
export interface CustomerSection { lines:Passage[]; action:Passage; caution:Passage; showGuidance:boolean }
const NEED:Record<string,string>={子:'어려운 대화 전에 생각할 시간',丑:'작더라도 지켜지는 약속',寅:'두 사람 모두 선택할 수 있는 기회',卯:'친절한 말과 솔직한 답',辰:'분명한 결정과 함께 나누는 책임',巳:'사생활과 신뢰, 서로를 이해할 만큼의 정보',午:'따뜻한 관심과 자신의 관심사를 위한 시간',未:'해결책을 듣기 전에 내 이야기를 들어 주는 것',申:'실질적인 도움과 함께 이야기를 들어 주는 것',酉:'각자의 취향에 대한 존중',戌:'꾸준한 일상 행동으로 쌓는 신뢰',亥:'재촉받지 않고 감정을 말할 시간'}
const ELEMENT:Record<string,string>={Wood:'나무',Fire:'불',Earth:'흙',Metal:'금속',Water:'물'}
const CACHE=new WeakMap<InterpretationPlan,Record<string,CustomerSection>>()
const clone=(p:Passage)=>pair(plainReadingText(customerEnglish(p.en)),p.ko)
export function customerNarrative(plan:InterpretationPlan):Record<string,CustomerSection>{
 const found=CACHE.get(plan);if(found)return found
 const p=plan.primary,detail=temperamentDetail(plan.primary.dayStem),dk=TEMPERAMENT_KO[plan.primary.dayStem],m=LANGUAGE[p.monthStemGod],inner=LANGUAGE[p.monthBranchGod],day=LANGUAGE[p.dayBranchGod],personal=PERSONAL_PROFILES[p.dayStem],pk=PERSONAL_KO[p.dayStem]
 const answer=BUYER_ANSWERS[p.monthStemGod], dailyAnswer=BUYER_ANSWERS[p.monthBranchGod]
 const timing=purchaseTimingSections(plan),out:Record<string,CustomerSection>={}
 const strength=pair(personal.strength,pk.strength),pressure=pair(personal.pressure,pk.pressure)
 const ownNeed=pair(`You tend to need ${personal.need}.`,`개인적으로 필요한 것은 ${pk.need}입니다.`)
 const publicRole=pair(`Your work side centres on ${m.name.en}. Start with a role that makes use of this strength.`,`일에서는 ${m.name.ko}이 중심입니다. 이 강점을 쓰는 역할부터 살핍니다.`)
 const underneath=p.monthStemGod===p.monthBranchGod?pair('The same work theme appears in both parts of your birth-month reading. That can make it a persistent way of handling work, rather than a temporary mood.','태어난 달의 두 부분에 같은 업무 주제가 반복됩니다. 일시적인 기분보다 일하는 방식에서 계속 나타날 수 있는 특징으로 읽습니다.'):pair(`Your everyday duties add ${inner.name.en}. Check that the job gives you time for both the visible result and the work behind it.`,`매일 맡는 일에는 ${inner.name.ko}이 더해집니다. 겉으로 보이는 결과와 그 뒤의 업무를 함께 해낼 시간이 있는지 확인합니다.`)
 const closeNeed=pair(`In close relationships, your chart points to a need for ${RELATIONSHIP_PROFILES[p.dayBranch].need}.`,`가까운 관계에서 원하는 것은 ${NEED[p.dayBranch]}입니다.`)
 const closeFriction=pair(`A recurring difficulty may be ${RELATIONSHIP_PROFILES[p.dayBranch].friction}.`,`가까운 관계에서 반복될 수 있는 어려움은 ${PRIVATE_FRICTION_KO[p.dayBranch]}입니다.`)
 const privateLinks=availablePillars(plan.first).filter(({index})=>index!==1).map(({pillar,index})=>({index,...pairObservation(plan.first.pillars[1].pillar.ganzi,pillar.pillar.ganzi,`Birth day / birth ${POSITION[index]}`)})).map(item=>({...item,branchPatterns:item.found.filter(pattern=>pattern.layer==='branch')})).filter(item=>item.branchPatterns.length)
 const branchName:Record<string,string>={合:'combination',暗合:'quiet combination',沖:'clash',刑:'punishment pattern',害:'harm pattern',破:'break pattern',半合:'partial combination',三合:'three-branch combination',方合:'directional combination',怨嗔:'crossed-expectations pattern',鬼門:'crossed-expectations pattern'}
 const branchMeaning:Record<string,string>={合:'shared plans and mutual obligations',暗合:'private expectations and less visible ties',沖:'different preferences or time needs',刑:'repeated friction around expectations',害:'expectations that may be left unspoken',破:'an arrangement that may need revisiting',半合:'a developing tie around shared plans',三合:'shared direction and group commitments',方合:'shared direction and group commitments',怨嗔:'crossed expectations that need a direct conversation',鬼門:'crossed expectations that need a direct conversation'}
 const privateStructure=privateLinks.length
  ? pair(`Your private-life marker ${plan.primary.dayBranch} has ${privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>`a ${branchName[pattern.type]??`recorded ${pattern.type} relationship`} with the birth-${POSITION[item.index]} marker`)).join(' and ')}. Together, these draw attention to ${[...new Set(privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>branchMeaning[pattern.type]??'a relationship theme shown by that recorded pattern')))].join(' and ')}. These are traditional relationship themes, not proof of specific events.`, `사적인 관계를 읽는 지지 ${plan.primary.dayBranch}와 태어난 ${privateLinks.map(item=>`${POSITION[item.index]} 지지(${item.branchPatterns.map(pattern=>pattern.type).join('·')})`).join(', ')} 사이에 관계가 있습니다. 전통적으로는 ${[...new Set(privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>branchMeaning[pattern.type]??'해당 관계의 특징')))].join('·')}을 살핍니다. 특정 사건을 확정하지 않습니다.`)
  : pair(`No direct branch link or clash is recorded between your day branch and the other available birth branches. The relationship reading therefore rests on your day-branch needs and the actual way both people communicate, rather than an invented compatibility pattern.`,`태어난 날의 지지와 다른 출생 지지 사이에 직접적인 합이나 충은 확인되지 않습니다. 따라서 관계 풀이는 궁합 구조를 억지로 만들지 않고, 태어난 날의 지지에 담긴 필요와 두 사람이 실제로 소통하는 방식을 중심으로 봅니다.`)
 const relationshipYears=purchaseYears(plan.first,plan.referenceYear,'love',10).map(row=>({year:row.date.slice(0,4),lines:row.lines.filter(line=>/\.((change-day)|(connection)|(background-pressure))$/.test(line.id))})).filter(row=>row.lines.length)
 const relationshipTiming=relationshipYears.length
  ? pair(`In the next ten-year comparison, ${relationshipYears.slice(0,3).map(row=>`${row.year}: ${row.lines.map(line=>line.en).join(' ')}`).join(' ')} These dates mark relationship themes in the calculated day-branch comparisons; they do not predict a partner, marriage or separation.`,`앞으로 10년의 비교에서 ${relationshipYears.slice(0,3).map(row=>`${row.year}년: ${row.lines.map(line=>line.ko).join(' ')}`).join(' ')} 이 시기는 계산된 태어난 날의 지지 비교에서 관계 주제가 나타난 때이며 상대, 결혼, 이별을 예측하지 않습니다.`)
  : pair(`No year in the next ten-year comparison has a distinct private-life link or friction under these day-branch checks. That does not guarantee an easy relationship; it means the checked timing does not single out a year.`,`앞으로 10년의 태어난 날 지지 비교에서는 뚜렷한 관계의 연결이나 마찰이 표시되는 해가 없습니다. 관계가 편하다는 보장은 아니며, 확인한 시기 기준에서 특정 연도를 꼽지 않는다는 뜻입니다.`)
 const capacity=capacityPassage(plan.primary)
 const money=moneyPassage(plan.primary)
 const noOutcome=pair('This is a traditional reading of your birth details, rather than a measured personality test or a prediction of events. The examples describe how the pattern may show up.','출생 정보를 바탕으로 한 전통 풀이이며 성격 검사 수치나 사건 예측은 아닙니다. 예시는 그 특징이 생활에서 나타날 수 있는 모습을 설명합니다.')
 const put=(id:string,lines:Passage[],action:Passage|undefined=undefined,caution=m.pressure)=>{
  action ??= QUESTION_ACTIONS[id] ?? pair('Compare the stated pattern with the actual situation before making a major commitment.','큰 약속을 하기 전에 설명한 특징을 실제 상황과 비교합니다.')
  const added=timing[id]?.lines.filter(l=>!id.startsWith('month-')||!l.id.endsWith('.caution')&&!l.id.endsWith('.capacity')).map(l=>pair(l.en,l.ko))??[]
  const seen=new Set<string>();const all=(id.startsWith('month-')||['feedback-and-boundaries','customer-communication','business-plan'].includes(id)?[...added,...lines]:[...lines,...added]).map(clone).filter(l=>{if(seen.has(l.en))return false;seen.add(l.en);return true})
  out[id]={lines:all,action:clone(action),caution:clone(caution),showGuidance:true}
 }
 const work=[answer.career,publicRole,m.work,underneath]
 const earning=[money,moneyDepth(p,'life'),moneyBasis(plan.primary),capacityBasis(p)]
 const business=[businessVerdict(p),pair(`This comes from ${m.name.en} in the work-related part of your chart${p.monthStemGod===p.monthBranchGod?', repeated in both layers of the birth month':''}.`,`사주에서 일과 연결해 읽는 부분의 ${m.name.ko}에서 나온 풀이입니다.${p.monthStemGod===p.monthBranchGod?' 태어난 달의 두 부분에 같은 주제가 반복됩니다.':''}`)]
 const keepWork=pair('Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.','이직 전에 매주 할 일과 직접 정할 수 있는 결정, 급여를 묻습니다. 부담을 만드는 업무 조건이 나아지는 자리를 고릅니다.')
 const moneyWatch=p.strength.tendency==='support-needed'?pair('More paid work can still leave you short of time or cash if you must carry the costs first.','유료 업무가 늘어도 비용을 먼저 감당하면 시간이나 현금이 부족해질 수 있습니다.'):pair('A new source of income can bring continuing costs and responsibilities with it.','새 수입 통로에는 계속 내야 할 비용과 책임도 따를 수 있습니다.')
 const relationshipWatch=pair('Being useful to each other can hide a difference in what each person wants emotionally.','서로에게 도움이 되어도 감정적으로 원하는 것이 다르다는 점은 가려질 수 있습니다.')
 const practicalMoney=pair('Write down the guaranteed pay, likely fees and costs you must cover. Judge the offer by what remains after those costs.','확정 급여와 예상 수수료, 직접 내야 할 비용을 적습니다. 그 비용을 빼고 남는 금액으로 제안을 판단합니다.')
 const noHealth=pair('A habit that helps on a quiet day can become tiring when every part of the day demands it.','조용한 날 도움이 되는 습관도 하루 종일 요구받으면 부담이 될 수 있습니다.')
 if(plan.kind==='complete'||plan.kind==='wellbeing'){
  put(plan.kind==='complete'?'personality':'everyday-pace',plan.kind==='complete'?[strength,personalContrast(p,'life'),pair(`Your personal style meets a practical demand for ${m.name.en}. That contrast is an important thread in this life reading.`,`개인의 성향 위에 ${m.name.ko}이라는 현실적 요구가 더해집니다. 그 만남을 인생 풀이의 중요한 줄기로 읽습니다.`),ownNeed,capacity,noOutcome]:[strength,personalContrast(p),pair(personal.example,PERSONAL_SCENE_KO[p.dayStem].example),pair(personal.balance,PERSONAL_SCENE_KO[p.dayStem].balance),noOutcome],undefined,pressure)
 }
 if(plan.kind==='complete'){
  put('money',earning,practicalMoney,moneyWatch)
  put('career',[lifeWork(p),roleChoice(p),publicRole,underneath],keepWork,m.pressure)
  put('love',[closeNeed,day.love,closeFriction,privateStructure,relationshipTiming,pair('Your work habits and private needs are different parts of the reading. Being effective at work does not mean the same response will feel caring at home.','업무 습관과 사적인 필요는 다른 부분으로 읽습니다. 직장에서 효과적인 대응이 집에서도 배려로 느껴진다는 뜻은 아닙니다.')],pair('Say what form of care you want, and ask what the other person wants rather than assuming it is the same.','원하는 배려를 말하고 상대에게도 물어봅니다. 서로 같은 배려를 원한다고 가정하지 않습니다.'),relationshipWatch)
  put('social',[pair(`The strength that helps you can also become your pressure point: ${m.balance.en}`,`도움이 되는 강점이 부담의 출발점이 될 수도 있습니다. ${m.balance.ko}`),pair(`Your birth day describes your personal style; the birth month shows how that style meets everyday demands. ${p.monthStemGod===p.monthBranchGod?'The same demand appears in both parts of the month, making it a recurring theme.':'The two parts of the month show different demands, so one role may not meet all your needs.'}`,`태어난 날에서는 개인 성향을, 태어난 달에서는 그 성향이 일상의 요구와 만나는 방식을 읽습니다. ${p.monthStemGod===p.monthBranchGod?'달의 두 부분에 같은 요구가 있어 반복되는 주제로 봅니다.':'달의 두 부분에 다른 요구가 있어 역할 하나가 필요한 것을 모두 채우지 못할 수 있습니다.'}`)],undefined,pressure)
  put('patterns',[],pair('Separate a possible work change from a private-life change before treating either as a verdict on your whole life.','일에서의 변화와 사적인 관계의 변화를 나누어 본 뒤 인생 전체에 대한 판단과 구분합니다.'),pair('A change signal identifies an area to examine, rather than an event that must happen.','변화 신호는 살펴볼 영역을 가리키며 반드시 일어날 사건을 정하지 않습니다.'))
  put('next-moves',[],pair('Choose one change from the yearly timeline, then check its work, money and home demands against the longer period.','연간 흐름에서 변화 하나를 고르고 그때의 일·돈·가정의 요구를 긴 흐름과 함께 확인합니다.'),moneyWatch)
  const relationshipFocus=relationshipYears.length?`Distinct relationship themes appear in ${relationshipYears.slice(0,3).map(row=>row.year).join(', ')}; the chapter explains what connects each year to your chart.`:'The next-ten-year checks do not single out a relationship year; your birth-chart relationship pattern is the clearer guide.'
  const relationshipFocusKo=relationshipYears.length?`관계 주제가 두드러지는 해는 ${relationshipYears.slice(0,3).map(row=>row.year).join(', ')}년이며, 각 해가 명식과 어떻게 연결되는지 연애 장에 설명했습니다.`:'앞으로 10년 비교에서 특정 관계 시기는 두드러지지 않으며 타고난 관계 구조를 중심으로 봅니다.'
  const pressureSummary=personal.pressure.replace(/\*\*/g,'').replace(/^([A-Z])/,(letter:string)=>letter.toLowerCase()).replace(/[.!?]$/,'')
  const moneyGods=[...new Set([...p.visibleMoney.map(item=>item.god),...p.hiddenMoney.map(item=>item.god)])]
  const moneyMarkers=moneyGods.map(god=>{const visible=p.visibleMoney.some(item=>item.god===god),hidden=p.hiddenMoney.some(item=>item.god===god);return `${LANGUAGE[god].name.en} ${visible&&hidden?'in visible and hidden positions':visible?'in visible positions':'in hidden positions'}`})
  const moneyMarkersKo=moneyGods.map(god=>{const visible=p.visibleMoney.some(item=>item.god===god),hidden=p.hiddenMoney.some(item=>item.god===god);return `${LANGUAGE[god].name.ko}${visible&&hidden?'이 겉과 숨은 위치에':visible?'이 겉으로 드러난 위치에':'이 숨은 위치에'}`})
  const moneyConclusion=moneyMarkers.length?moneyMarkers.join(' and '):'no direct money marker in the checked positions'
  const workConclusion=p.monthStemGod===p.monthBranchGod?`${m.name.en} in both the public role and daily work`:`${m.name.en} in the public role, with ${inner.name.en} shaping daily work`
  const workConclusionKo=p.monthStemGod===p.monthBranchGod?`겉으로 드러난 역할과 일상 업무 모두 ${m.name.ko}이 중심입니다`:`겉으로 드러난 역할은 ${m.name.ko}, 일상 업무에는 ${inner.name.ko}이 더해집니다`
  const finalSynthesis=pair(`Taken together, your chart centres on ${personal.focus}. That is a strength to use; the pressure point is that ${pressureSummary}. At work, the chart emphasises ${workConclusion}. The checked money markers are ${moneyConclusion}, so judge opportunities by actual pay and costs. In close relationships, the chart's private-life branch is ${p.dayBranch}, with a need for ${RELATIONSHIP_PROFILES[p.dayBranch].need}. ${relationshipFocus} These are chart themes to compare with real choices, not fixed outcomes.`,`종합하면 ${pk.need}을 중요하게 여기는 성향입니다. 강점은 ${pk.strength} 부담은 ${pk.pressure}입니다. 일에서는 ${workConclusionKo}의 특징이 나타납니다. 확인된 재성은 ${moneyMarkersKo.length?moneyMarkersKo.join(' 및 '):'확인한 위치에서 직접 드러나지 않습니다'}; 실제 기회는 보수와 비용으로 판단해야 합니다. 관계에서는 사적인 관계를 읽는 지지 ${p.dayBranch}와 그에 담긴 필요가 중요하며, ${relationshipFocusKo} 이는 실제 선택과 비교할 사주 주제이지 정해진 결과가 아닙니다.`)
  out['next-moves'].lines.push(clone(finalSynthesis))
 }
 if(plan.kind==='career'){
  put('working-style',[answer.career,roleChoice(p),...work.slice(1),capacityBasis(p)],pair('Ask to see a normal week of tasks before accepting a role. Choose work that pays for the strength described above.','직장을 정하기 전에 평소 한 주의 업무를 확인합니다. 위에서 설명한 강점으로 보상받는 일을 고릅니다.'),m.pressure)
  put('two-work-layers',[answer.workplace,p.monthStemGod===p.monthBranchGod?pair('The outward role and the everyday work repeat the same theme. A title that promises one kind of work but delivers another is therefore an important mismatch to notice.','겉으로 보이는 역할과 매일 하는 일이 같은 주제를 반복합니다. 직함이 약속한 일과 실제 업무가 다르면 특히 맞지 않는 부분이 될 수 있습니다.'):pair(`Your public role points to ${m.name.en}, but daily tasks add ${inner.name.en}. A suitable job needs room for both.`,`겉으로 보이는 역할은 ${m.name.ko}이고 매일의 업무에는 ${inner.name.ko}이 더해집니다. 맞는 직장은 두 요구를 함께 담을 수 있어야 합니다.`),...(p.monthStemGod!==p.monthBranchGod?[dailyAnswer.workplace]:[])],pair('Compare the advertised role with the tasks you would actually do each week.','채용 공고의 역할과 매주 실제로 할 일을 비교합니다.'),inner.pressure)
  const chartGods=p.positions.flatMap(position=>[position.stemGod,position.principalGod]).filter((god):god is string=>!!god)
  const employeeGods=[...new Set(chartGods.filter(god=>['正官','偏官','正印','偏印'].includes(god)))]
  const employmentBasis=[...(chartGods.some(god=>['正官','偏官'].includes(god))?['formal responsibility']:[]),...(chartGods.some(god=>['正印','偏印'].includes(god))?['learning or specialist support']:[])]
  const independentBasis=[...(chartGods.some(god=>['食神','傷官'].includes(god))?['ideas and practical output']:[]),...(chartGods.some(god=>['正財','偏財'].includes(god))?['paid customer work']:[]),...(chartGods.some(god=>['比肩','劫財'].includes(god))?['self-direction and shared resources']:[])]
  const hasCommercialRoute=chartGods.includes('食神')||chartGods.includes('傷官')
  const hasMoneyRoute=chartGods.includes('正財')||chartGods.includes('偏財')
  const hasAuthoritySupport=employeeGods.length>0
  const workVerdict=hasCommercialRoute&&hasMoneyRoute&&hasAuthoritySupport
   ? pair('Your chart leans toward a staged hybrid: build income through a commercially focused role with clear pay and authority, then test independent work alongside it. The chart shows both a route from useful output to customers or money and formal responsibility or specialist support; it does not show that an all-at-once business jump is necessary.','명식은 단계적인 병행 쪽에 무게가 실립니다. 보수와 권한이 분명한 상업·고객 중심의 역할에서 수입 기반을 만들고, 독립 업무는 곁에서 시험하는 방식입니다. 쓸모 있는 결과물을 고객·재물과 잇는 흐름과 조직의 책임·전문 지원이 함께 보여 처음부터 사업에 전부 거는 선택이 필요하다고 읽히지는 않습니다.')
   : hasCommercialRoute&&hasMoneyRoute
    ? pair('Independent work has the clearer chart support because output and money both appear in the checked positions. Keep the first offer small and repeatable; the chart does not establish that you should leave secure income now.','확인한 명식에서는 결과물과 재물이 함께 나타나 독립 업무에 더 분명한 근거가 있습니다. 다만 첫 상품은 작고 반복 가능하게 시작해야 하며, 지금 안정적인 수입을 그만두라는 뜻은 아닙니다.')
    : hasAuthoritySupport
     ? pair('Structured employment has the clearer chart support: responsibility or specialist backing is more visible than a complete output-to-customer-to-money route. A defined remit and real decision authority matter more than title alone.','조직 생활에 더 분명한 근거가 있습니다. 책임이나 전문 지원이 결과물·고객·재물로 이어지는 완결된 흐름보다 두드러집니다. 직함보다 담당 범위와 실제 결정 권한이 중요합니다.')
     : pair('The chart gives a stronger answer about the kind of work than about employment versus business. Keep income commitments measured while you test which setting rewards the work pattern shown here.','명식은 직장과 사업 중 하나를 고르기보다 어떤 업무가 맞는지를 더 분명히 보여줍니다. 여기서 나타난 업무 방식에 실제로 보상이 따르는 환경을 시험하는 동안 수입 약속은 감당 가능한 수준으로 유지합니다.')
  put('proof-of-skill',[workVerdict,pair(`Your chart has both sides: ${employmentBasis.join(' and ')||'no clear employment signal'} for a structured role, and ${independentBasis.join(', ')||'no clear independent-work signal'} for independent work. In your birth month, the visible role is finding new customers; the everyday layer is repeat income and practical commitments. That supports the staged recommendation: help win the work, then keep a say in how it is delivered.`,`명식에는 두 방향이 함께 있습니다. 조직 생활에는 ${employmentBasis.length?employmentBasis.join('·'):'뚜렷한 신호가 없고'}, 독립 업무에는 ${independentBasis.length?…9836 tokens truncated…,
 'close-conversation':pair('A gesture can be caring in intention but miss the kind of care the other person asked for.','배려하려는 행동도 상대가 원한 도움과는 다를 수 있습니다.'),
 'shared-routine':pair('Agreeing in a conversation does not settle who handles the recurring work.','대화에서 동의한 것만으로 반복 업무의 담당까지 정해지지는 않습니다.'),
 'shared-money':pair('A shared payment can mean different things to each person if ownership is never discussed.','소유권을 말하지 않으면 함께 낸 돈의 의미를 서로 다르게 여길 수 있습니다.'),
 'chart-patterns':pair('A strong point in closeness does not automatically resolve differences in everyday responsibilities.','친밀함의 강점이 일상 책임의 차이까지 자동으로 해결하지는 않습니다.'),
 'support-each-other':pair('One person’s busy year can reduce the support the other person expected to receive.','한 사람이 바쁜 해에는 다른 사람이 기대한 도움을 주기 어려울 수 있습니다.'),
 'shared-week':pair('An agreement that works for only one person can turn a small difference into a repeated dispute.','한 사람에게만 맞는 약속은 작은 차이를 반복되는 다툼으로 만들 수 있습니다.'),
 'visible-elements':pair('A missing visible element is not a missing ability; the rest of the chart still matters.','겉에 보이는 기운 하나가 없다고 능력이 없는 것은 아닙니다. 사주 전체를 함께 봅니다.'),
 'workload-rhythm':pair('Being capable of handling a demand can make it harder for others to notice its cost to you.','요구를 감당하는 능력이 있으면 다른 사람은 그 부담을 알아보기 어려울 수 있습니다.'),
 'balance-week':pair('A familiar strength can keep you in the same role even when you want something different.','익숙한 강점 때문에 다른 것을 원해도 같은 역할에 머물 수 있습니다.'),
 }
 for(const [id,caution]of Object.entries(cautions))if(out[id])out[id].caution=clone(caution)
 if(out.love)out.love.caution=clone(closeFriction)
 if(out['career-plan'])out['career-plan'].caution=clone(pressure)
 if(plan.first.input.unknownTime){
  const basis=clone(capacityPassage(plan.primary))
  const missingCapacity=clone(capacityBasis(p))
  for(const section of Object.values(out))section.lines=section.lines.filter(l=>l.en!==basis.en&&l.en!==missingCapacity.en)
  const first=out[plan.sections[0].id]
  if(plan.includeReadingNotice)first.lines.splice(1,0,pair('Reading basis: '+basis.en,'풀이 기준: '+basis.ko))
 }
 const bodySeen=new Set<string>()
 for(const id of [...plan.sections.map(x=>x.id),...(plan.kind==='complete'?['next-moves']:[]),...plan.months.map((_,i)=>'month-'+(i+1))]){
  const section=out[id];if(!section)continue
  section.lines=section.lines.filter((line,index)=>{const key=line.en;if(index===0||id.startsWith('month-')&&/^(Money:|At home:)/.test(key)){bodySeen.add(key);return true}if(bodySeen.has(key))return false;bodySeen.add(key);return true})
  // A caution belongs below the explanation, not twice in the same section.
  if(section.showGuidance)section.lines=section.lines.filter((line,index)=>index===0||line.en!==section.caution.en&&line.en!==section.action.en)
 }
 for(const id of plan.sections.map(s=>s.id))if(!out[id]?.lines.length)throw new Error('Missing customer question '+plan.kind+'/'+id)
 CACHE.set(plan,out);return out
}
function capacityPassage(p:InterpretationPlan['primary']):Passage{
 if(p.strength.tendency==='supported')return pair('Your chart shows support for putting effort into work and managing resources. This gives you something to use, rather than guaranteeing that every extra commitment is worthwhile.','일과 자원 관리에 힘을 쓸 기반이 있는 쪽으로 읽습니다. 활용할 바탕이 있다는 뜻이며 추가로 맡는 모든 일이 가치 있다는 보장은 아닙니다.')
 if(p.strength.tendency==='support-needed')return pair('Extra work or financial activity can weigh more heavily unless support is in place. An opportunity to earn and the capacity to keep the money are separate parts of this reading.','도움이 갖춰지지 않으면 추가 업무나 재정적인 활동이 더 부담될 수 있습니다. 돈을 벌 기회와 그 돈을 남길 여력은 나누어 읽습니다.')
 if(p.strength.signals.unknownTime)return pair('Your birth time is unknown, so this reading uses your year, month and day without guessing an hour. Opening marks a money, responsibility or learning theme; Adjustment marks competing work or home demands. Neither is a prediction of success or failure. Ten-year starting dates are approximate.','출생시간을 추측하지 않고 연·월·일을 사용합니다. 기회는 재물·책임·배움의 주제를, 조정은 일·사생활에서 겹치는 요구를 표시합니다. 성공과 실패의 예측이 아니며 대운 시작일은 근사치입니다.')
 return pair('Finding an opening and carrying the extra work are different strengths in your chart. More customers or responsibility can be useful, but they can also stretch the time and support available.','기회를 찾는 힘과 늘어난 일을 감당하는 힘은 나누어 읽습니다. 고객이나 책임이 늘면 도움이 될 수 있지만 시간과 지원의 부담도 커질 수 있습니다.')
}
function moneyPassage(p:InterpretationPlan['primary'],area:'life'|'career'|'business'='life'):Passage{
 const steady=p.visibleMoney.some(x=>x.god==='正財'),variable=p.visibleMoney.some(x=>x.god==='偏財')
 if(area==='business')return steady&&variable?pair('Your business money pattern combines repeat customers with new deals. Recurring sales provide continuity, while new buyers bring a less predictable income stream.','사업 재물에서는 반복 고객과 새 거래가 함께 나타납니다. 반복 판매가 수입을 이어 주고 새 구매자는 수입의 변동을 더하는 방식입니다.')
 :steady?pair('Repeat sales and clearly priced ongoing work are the stronger business money theme. The pressure is how much continuing service each sale requires.','반복 판매와 가격이 분명한 지속 업무가 사업 재물의 더 강한 주제입니다. 판매 뒤 계속 제공해야 할 서비스가 부담이 될 수 있습니다.')
 :variable?pair('The business money theme favours finding buyers and making deals over simply maintaining a fixed book of work. Cash can arrive unevenly when the fees depend on new sales.','정해진 업무를 유지하기보다 구매자를 찾고 거래하는 일이 사업 재물의 중심입니다. 새 판매에 수입이 달리면 수금의 간격도 달라질 수 있습니다.')
 :p.hiddenMoney.length?pair('The business money signs sit behind the main role rather than at the front. Delivery skills and less visible work need attention before treating sales as your main strength.','사업의 재물 글자는 겉에 앞서기보다 역할 뒤에 있습니다. 영업을 주된 강점으로 정하기 전에 납품 기술과 드러나지 않는 업무를 함께 살핍니다.')
 :pair('The checked chart does not give a clear direct business money route. Business suitability and earning power should therefore stay separate in this reading.','확인한 사주에서 직접적인 사업 재물 통로가 분명하지 않습니다. 사업 방식의 적성과 돈 버는 힘은 나누어 풀이합니다.')
 if(area==='career')return steady&&variable?pair('Your income pattern has two routes: regular pay or repeat work, and additional income from projects or new customers. Both appear in your chart, rather than a single fixed earning style.','수입 통로는 정기 급여·반복 업무와 프로젝트·새 고객을 통한 추가 수입으로 나뉩니다. 한 가지 고정된 돈벌이보다 두 방식이 함께 나타납니다.')
 :steady?pair('Regular pay and dependable repeat work are your clearer income pattern. A role with defined hours and duties makes that pattern easier to evaluate.','정기 급여와 꾸준한 반복 업무가 더 분명한 수입 방식입니다. 시간과 담당이 정해진 자리에서 그 방식을 판단하기 쉽습니다.')
 :variable?pair('Customer-facing or project-based income stands out more than a purely fixed routine. Your income question is closely tied to access to buyers and control over the terms of the work.','고정된 일상만으로 버는 방식보다 고객이나 프로젝트를 통한 수입이 더 두드러집니다. 구매자를 만날 기회와 업무 조건을 정할 권한이 수입 질문에 중요합니다.')
 :p.hiddenMoney.length?pair('Your income pattern is less direct: the money signs are inside the chart rather than in its main outward roles. Specialist delivery or work behind the public role deserves a closer look.','수입 방식이 직접 드러나는 쪽은 아닙니다. 재물 글자가 겉의 주된 역할보다 안쪽에 있어 전문적인 수행과 겉 역할 뒤의 업무를 더 살핍니다.')
 :pair('A direct earning pattern is not clear in the checked signs. This report therefore gives more weight to work fit and responsibility than to naming a money-making route.','확인한 글자에서 직접적인 수입 방식은 분명하지 않습니다. 특정 돈벌이 통로보다 맞는 업무와 책임에 더 무게를 둡니다.')
 return steady&&variable?pair('Your money pattern combines a steady base with income from new customers or deals. Relying on only one of those routes would leave out part of the reading.','꾸준한 기반 수입과 새 고객·거래의 수입이 함께 나타납니다. 한쪽 통로만 보면 재물 풀이의 일부가 빠집니다.')
 :steady?pair('Steady pay, repeat customers and manageable ongoing duties are the clearest money pattern in the visible chart.','겉으로 드러난 재물에서는 고정 수입과 단골 고객, 감당할 수 있는 반복 업무가 가장 분명한 방식입니다.')
 :variable?pair('New customers, deals and work with changing fees are the clearest money pattern in the visible chart. A promising deal still needs to turn into paid work.','겉으로 드러난 재물에서는 새 고객과 거래, 수입이 달라지는 일이 가장 분명한 방식입니다. 좋은 제안도 실제 대금을 받는 일로 연결되어야 합니다.')
 :p.hiddenMoney.length?pair('Money-related signs appear in the less visible parts of your chart. Income may be tied to the skills, support or duties behind the main role, rather than being your most obvious outward theme.','재물과 관련된 글자가 덜 드러난 부분에 있습니다. 겉으로 보이는 역할보다 그 뒤의 기술과 도움, 맡은 의무를 통해 수입을 읽습니다.')
 :pair('The available chart does not establish a direct money pattern. That is not a prediction of poverty or low income; the reading does not invent a money theme that is absent.','확인한 정보에서 직접적인 재물 방식을 정할 수 없습니다. 가난하거나 수입이 적다는 예측이 아니며 없는 재물 주제를 만들어 넣지 않습니다.')
}

function moneyBasis(p:InterpretationPlan['primary']):Passage{
 const positions=[...new Set(p.visibleMoney.map(x=>x.position))]
 const name:Record<string,[string,string]>={month:['work and everyday responsibilities','일과 일상 책임'],day:['private commitments','개인적인 약속'],year:['wider contacts','주변 인맥'],hour:['future plans','앞으로의 계획']}
 if(positions.length)return pair(`Your money themes appear in these areas: ${positions.map(x=>name[x][0]).join('; ')}. Look at the people, promises and costs involved there when judging a new source of income.`,`재물 주제는 ${positions.map(x=>name[x][1]).join('·')}과 연결됩니다. 새 수입을 판단할 때 그 영역의 사람과 약속, 비용을 함께 봅니다.`)
 return p.hiddenMoney.length?pair('The money signs appear among the inner signs rather than the main outward ones, so the reading treats the earning route as less immediately visible.','재물 글자가 겉의 주된 글자보다 안쪽에 나타나 돈 버는 통로가 바로 드러나는 쪽으로 읽지 않습니다.'):pair('No direct money sign is present in the parts checked here; the work interpretation carries more of the answer.','확인한 부분에 직접적인 재물 글자가 없어 업무 방식의 풀이에서 답을 더 찾습니다.')
}

/** Long periods use their own calculated boundaries, not an annual reference or a fabricated event date. */
export function customerPeriod(plan:InterpretationPlan,index:number):Passage[]{
 const cycle=plan.selectedCycles[index], g=LANGUAGE[cycle.stemGod], inner=LANGUAGE[cycle.branchGod]
 const start=new Date(cycle.start).toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}),end=cycle.next?new Date(cycle.next).toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}):null
 const lines=[pair(`${plan.first.input.unknownTime?'Around ':''}${start}${end?` to ${plan.first.input.unknownTime?'around ':''}${end}`:''}: a chapter about ${g.name.en}${cycle.stemGod!==cycle.branchGod?`, with ${inner.name.en} shaping everyday life`:''}.`,`${cycle.start.slice(0,7)}${plan.first.input.unknownTime?' 전후':''}부터${cycle.next?` ${cycle.next.slice(0,7)}${plan.first.input.unknownTime?' 전후':''}까지`:''}는 ${g.name.ko}의 시기입니다.${cycle.stemGod!==cycle.branchGod?` 일상에는 ${inner.name.ko}도 함께 나타납니다.`:''}`),pair(`This ${cycle.stemGod===plan.primary.monthStemGod?'reinforces':'differs from'} your usual working pattern of ${LANGUAGE[plan.primary.monthStemGod].name.en}. ${PERIOD_VOICE[cycle.stemGod].lead.en}`,`타고난 ${LANGUAGE[plan.primary.monthStemGod].name.ko}의 업무 특징과 ${cycle.stemGod===plan.primary.monthStemGod?'같은 주제가 강조됩니다':'다른 요구가 더해집니다'}. ${PERIOD_VOICE[cycle.stemGod].lead.ko}`),pair(`The money side of this chapter: ${g.money.en}`,`이 시기의 재물: ${g.money.ko}`),pair(`In close relationships during this chapter: ${inner.love.en}`,`이 시기의 가까운 관계: ${inner.love.ko}`)]

 for(const {pillar,index:position} of availablePillars(plan.first).filter(c=>c.index===1||c.index===2)){
  const observed=pairObservation(cycle.ganzi,pillar.pillar.ganzi,'Cycle / birth '+POSITION[position])
  if(observed.found.some(p=>['沖','刑','害','破'].includes(p.type)))lines.push(pair(`This longer period puts ${g.name.en} into tension with your ${position===1?'home and relationship side':'work side'}. Review which existing ${position===1?'private promises':'duties'} can fit alongside this demand.`,`긴 흐름의 ${g.name.ko}이 ${position===1?'가정과 관계':'업무'}의 방식과 부딪힙니다. 기존 ${position===1?'사적인 약속':'업무'} 중 이 요구와 함께 감당할 수 있는 것을 확인합니다.`))
 }
 lines.push(g.pressure)
 return lines.map(clone)
}

export function bundleNarrative(plans:{complete:InterpretationPlan;compatibility:InterpretationPlan;annual:InterpretationPlan}):Passage[]{
 const p=plans.complete.primary,b=plans.compatibility.partner!,y=plans.annual.annual[0],m=LANGUAGE[p.monthStemGod],year=LANGUAGE[y.god]
 const sharedPressure=plans.annual.months.filter(point=>['day','month'].every(pos=>point.comparisons.some(c=>c.position===pos&&c.patterns.some(t=>['沖','刑','害','破'].includes(t.type)))))
 const workChange=plans.annual.months.filter(point=>point.comparisons.some(c=>c.position==='month'&&c.patterns.some(t=>['沖','刑','害','破'].includes(t.type))))
 const labels=(rows:typeof sharedPressure)=>rows.map(r=>new Date(r.date+'T12:00:00Z').toLocaleDateString('en-GB',{month:'long',timeZone:'UTC'})).join(', ')
 const koLabels=(rows:typeof sharedPressure)=>rows.map(r=>Number(r.date.slice(5,7))+'월').join('·')
 const needsMatch=sharedCareNeed(p.dayBranch,b.dayBranch)
 return [
  pair(`Read this collection around one choice: what happens to your shared time if you take on more work? Your work pattern centres on ${m.name.en}; your private needs centre on ${RELATIONSHIP_PROFILES[p.dayBranch].need}. The annual reading then shows when work and home comparisons overlap.`, `이 묶음은 일을 더 맡을 때 함께할 시간이 어떻게 달라지는가라는 선택으로 연결해 읽습니다. 업무에서는 ${m.name.ko}, 사적인 관계에서는 ${NEED[p.dayBranch]}이 중요합니다. 연간 풀이에서는 업무와 가정의 비교가 겹치는 때를 확인합니다.`),
  pair(`Your lasting work pattern centres on ${m.name.en}. In ${plans.annual.referenceYear}, the emphasis on ${year.name.en} ${y.god===p.monthStemGod?'reinforces that familiar demand':'adds a different demand'}. The priority is ${y.god===p.monthStemGod?'deciding how much of the same responsibility to keep':'fitting the new demand around the way you already work'}.`,`타고난 업무의 중심은 ${m.name.ko}입니다. ${plans.annual.referenceYear}년의 ${year.name.ko}은 ${y.god===p.monthStemGod?'익숙한 요구를 더합니다. 같은 책임을 얼마나 더 맡을지가 우선순위입니다.':'다른 요구를 더합니다. 기존 업무 방식 안에 새로운 요구를 어떻게 담을지가 우선순위입니다.'}`),
  pair(`The money and relationship readings meet at the use of your time: ${p.strength.tendency==='support-needed'?'additional earning activity can consume support you also need at home':p.strength.tendency==='deferred'?'the incomplete balance judgement means neither a bigger workload nor an easier period can be assumed':'more customers or responsibility still need to fit alongside private commitments'}.`,`재물과 관계의 풀이가 만나는 지점은 시간의 사용입니다. ${p.strength.tendency==='support-needed'?'추가 돈벌이 활동이 가정에서도 필요한 도움을 소모할 수 있습니다.':p.strength.tendency==='deferred'?'전체 균형 판단이 미정이므로 더 많은 업무나 편한 시기를 가정하지 않습니다.':'고객이나 책임이 늘 때 사적인 약속도 함께 감당해야 합니다.'}`),
  pair(needsMatch?`You share a similar private-life need, with distinct details: you value ${RELATIONSHIP_PROFILES[p.dayBranch].need}; your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. Work pressure can make both of you wait for the other to offer that care.`:`You value ${RELATIONSHIP_PROFILES[p.dayBranch].need}, while your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. Extra work this year may expose that difference more clearly.`,needsMatch?`비슷한 배려를 원하면서도 세부적인 필요가 다릅니다. 본인은 ${NEED[p.dayBranch]}, 상대방은 ${NEED[b.dayBranch]}을 원합니다. 일이 바빠지면 서로 먼저 챙겨 주기만 기다릴 수 있습니다.`:`본인은 ${NEED[p.dayBranch]}을 원하고 상대방은 ${NEED[b.dayBranch]}을 원합니다. 올해 일이 늘 때 그 차이가 더 드러날 수 있습니다.`),
  sharedPressure.length?pair(`The clearest overlap is ${labels(sharedPressure)}: both work routines and private-life arrangements meet friction in the same monthly comparison. These are shared work-and-home pressure points. The annual caution list also considers work-only changes, wider obligations and the longer cycle.`,`가장 분명히 겹치는 달은 ${koLabels(sharedPressure)}입니다. 같은 월별 비교에서 업무와 사적인 관계 모두에 마찰이 나타납니다. 업무와 가정이 함께 부담을 받는 달입니다. 연간 주의 목록은 업무만의 변화와 주변 의무, 긴 흐름의 충돌도 함께 살핍니다.`):pair(workChange.length?`Work changes stand out in ${labels(workChange)}, but the checks do not show simultaneous private-life friction in those months. Keep that distinction instead of reading a work change as a relationship problem.`:'No month in this comparison has simultaneous work and private-life friction. The individual monthly themes remain useful without inventing a shared crisis.',workChange.length?`${koLabels(workChange)}에는 업무 변화가 두드러지지만 같은 달에 사적인 관계까지 함께 부딪히는 것으로 계산되지는 않습니다. 일의 변화를 관계 문제로 확대하지 않고 구분합니다.`:'이번 비교에서 업무와 사적인 관계에 동시에 마찰이 나타나는 달은 없습니다. 공동 위기를 만들지 않고 각 달의 주제를 읽습니다.'),
  pair(`The practical order for this collection is: understand the role of ${m.name.en} in your working life, compare the actual commitment, then check whether the timing also puts pressure on shared time. A useful work opportunity and an easy relationship month are separate judgements.`,`이 묶음에서는 ${m.name.ko}이라는 업무 특징을 이해하고 실제 약속을 비교한 뒤, 같은 시기가 함께할 시간에도 부담을 주는지 확인합니다. 업무 기회와 관계가 편한 달은 나누어 판단합니다.`),
 ].map(clone)

}

const QUESTION_ACTIONS:Record<string,Passage>={
 personality:pair('Compare your personal needs with the role you are most often asked to play at work.','개인적으로 필요한 것과 직장에서 자주 요구받는 역할을 비교합니다.'),
 social:pair('Notice when a strength you choose to use turns into a duty others expect you to carry.','스스로 발휘하고 싶은 강점이 남들이 당연히 맡기는 의무로 바뀌는 지점을 살핍니다.'),
 'everyday-pace':pair('Use a familiar day to compare your preferred pace with the demands actually placed on you.','익숙한 하루를 떠올리며 원하는 속도와 실제로 요구받는 일을 비교합니다.'),
 'visible-elements':pair('Read the element picture as a description of themes, rather than a list of things to buy or avoid.','기운의 분포는 사거나 피해야 할 물건의 목록이 아니라 특징을 설명하는 그림으로 봅니다.'),
 'two-styles':pair('Let each person describe one situation that felt different to them before deciding what it meant.','같은 상황을 서로 어떻게 다르게 느꼈는지 각자 말한 뒤 의미를 판단합니다.'),
 'two-directions':pair('Ask each person separately what they receive from the connection and what feels demanding.','관계에서 무엇을 얻고 무엇을 부담으로 느끼는지 각자에게 따로 물어봅니다.'),
 'close-conversation':pair('Ask whether the other person wants an answer, practical help or time to be heard.','상대가 해결책과 실제 도움, 이야기를 들어줄 시간 중 무엇을 원하는지 물어봅니다.'),
 'chart-patterns':pair('Separate emotional closeness from the practical agreements needed to run a day together.','정서적인 친밀감과 함께 일상을 운영할 실제 약속을 나누어 봅니다.'),
 'support-each-other':pair('Discuss whose work or private responsibilities are changing in the same year.','같은 해에 누구의 업무나 개인적인 책임이 달라지는지 함께 이야기합니다.'),
 'shared-week':pair('Agree on one difference in time, money or responsibility that both people can describe clearly.','시간과 돈, 책임 중 서로 분명하게 설명할 수 있는 차이 하나를 함께 정리합니다.'),
 'annual-connections':pair('Compare temporary pressure this year with the kind of care you usually want in a relationship.','올해의 일시적인 부담과 평소 관계에서 원하는 배려를 비교합니다.'),
 'annual-cycle-context':pair('Read each listed opening with its stated conditions and the monthly explanation before making a commitment.','약속을 정하기 전에 표시된 기회의 조건과 월별 설명을 함께 읽습니다.'),
 'annual-plan':pair('Match the named caution to an actual task or agreement instead of avoiding an entire month.','달 전체를 피하기보다 설명한 주의점을 실제 업무나 약속과 연결해 봅니다.'),
}
