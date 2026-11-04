Warning: truncated output (original token count: 32885)
Total output lines: 599

import { roleChoice, businessDivision, relationshipRepair, personalBoundary, monthlyFit } from './personalised-choices.ts'
import { sharedCareNeed } from './relationship-needs.ts'
import { TEMPERAMENT_KO } from './temperament-ko.ts'
import { temperamentDetail } from './report-extras.ts'
import { capacityBasis, moneyDepth, personalContrast, publicRoleLabel } from './chart-depth.ts'
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
import { STEMS, TEN_GODS } from './reading.ts'
export interface CustomerSection { lines:Passage[]; action:Passage; caution:Passage; showGuidance:boolean }
const NEED:Record<string,string>={子:'어려운 대화 전에 생각할 시간',丑:'작더라도 지켜지는 약속',寅:'두 사람 모두 선택할 수 있는 기회',卯:'친절한 말과 솔직한 답',辰:'분명한 결정과 함께 나누는 책임',巳:'사생활과 신뢰, 서로를 이해할 만큼의 정보',午:'따뜻한 관심과 자신의 관심사를 위한 시간',未:'해결책을 듣기 전에 내 이야기를 들어 주는 것',申:'실질적인 도움과 함께 이야기를 들어 주는 것',酉:'각자의 취향에 대한 존중',戌:'꾸준한 일상 행동으로 쌓는 신뢰',亥:'재촉받지 않고 감정을 말할 시간'}
const ELEMENT:Record<string,string>={Wood:'나무',Fire:'불',Earth:'흙',Metal:'금속',Water:'물'}
const CAREER_THEME_LABEL:Record<string,string>={比肩:'independent specialist work',劫財:'negotiation and shared work',食神:'reliable products and repeatable service',傷官:'creative improvement and problem-solving',正財:'operations and resource management',偏財:'customer growth and business development',正官:'defined responsibility and standards',偏官:'technical problem-solving under pressure',正印:'training, research and knowledge-sharing',偏印:'specialist research and independent problem-solving'}
const CACHE=new WeakMap<InterpretationPlan,Record<string,CustomerSection>>()
const clone=(p:Passage)=>pair(plainReadingText(customerEnglish(p.en)),p.ko)
export function customerNarrative(plan:InterpretationPlan,targetedProduct01=true,rootCauseFix=true):Record<string,CustomerSection>{
 const found=targetedProduct01&&rootCauseFix?CACHE.get(plan):undefined;if(found)return found
 const p=plan.primary,detail=temperamentDetail(plan.primary.dayStem),dk=TEMPERAMENT_KO[plan.primary.dayStem],m=LANGUAGE[p.monthStemGod],inner=LANGUAGE[p.monthBranchGod],day=LANGUAGE[p.dayBranchGod],personal=PERSONAL_PROFILES[p.dayStem],pk=PERSONAL_KO[p.dayStem],dayStemName=STEMS[p.dayStem]?.name??p.dayStem
 const answer=BUYER_ANSWERS[p.monthStemGod], dailyAnswer=BUYER_ANSWERS[p.monthBranchGod]
 const timing=purchaseTimingSections(plan,targetedProduct01,rootCauseFix),out:Record<string,CustomerSection>={}
 const strength=pair(personal.strength,pk.strength),pressure=pair(personal.pressure,pk.pressure)
 const ownNeed=pair(`You tend to need ${personal.need}.`,`개인적으로 필요한 것은 ${pk.need}입니다.`)
 const publicRole=pair(`Your work side centres on ${m.name.en}. Start with a role that makes use of this strength.`,`일에서는 ${m.name.ko}이 중심입니다. 이 강점을 쓰는 역할부터 살핍니다.`)
 const underneath=p.monthStemGod===p.monthBranchGod?pair('The same work theme appears in both parts of your birth-month reading. That can make it a persistent way of handling work, rather than a temporary mood.','태어난 달의 두 부분에 같은 업무 주제가 반복됩니다. 일시적인 기분보다 일하는 방식에서 계속 나타날 수 있는 특징으로 읽습니다.'):pair(`Your everyday duties add ${inner.name.en}. Check that the job gives you time for both the visible result and the work behind it.`,`매일 맡는 일에는 ${inner.name.ko}이 더해집니다. 겉으로 보이는 결과와 그 뒤의 업무를 함께 해낼 시간이 있는지 확인합니다.`)
 const closeNeed=pair(`In close relationships, your chart points to a need for ${RELATIONSHIP_PROFILES[p.dayBranch].need}.`,`가까운 관계에서 원하는 것은 ${NEED[p.dayBranch]}입니다.`)
 const closeFriction=pair(`A recurring difficulty may be ${RELATIONSHIP_PROFILES[p.dayBranch].friction}.`,`가까운 관계에서 반복될 수 있는 어려움은 ${PRIVATE_FRICTION_KO[p.dayBranch]}입니다.`)
 const relationshipProfile=RELATIONSHIP_PROFILES[p.dayBranch]
 const closeRoutine=relationshipProfile.keepClose[0].replace(/[.!?]+$/,'').toLowerCase()
 const relationshipConclusion=pair(`You are most likely to feel secure with someone who makes room for ${relationshipProfile.need}. In everyday life, look for ${closeRoutine}. This describes what helps you; it does not predict another person's character.`,`가까운 관계에서 ${NEED[p.dayBranch]}을 존중받을 때 안정감을 느끼기 쉽습니다. 일상에서는 ${RELATIONSHIP_PROFILES[p.dayBranch].keepClose[0]}을 살펴보세요. 이는 자신에게 도움이 되는 조건이지 상대의 성격을 예측하는 말이 아닙니다.`)
 const relationshipReason=pair(`Conflict can develop when ${relationshipProfile.friction}. Your chart links this pattern to ${p.dayBranch}, the day sign used to read close relationships. It also points to a need for ${personal.need}; that is separate from what helps you feel secure with a partner.`,`마찰은 ${PRIVATE_FRICTION_KO[p.dayBranch]}할 때 생길 수 있습니다. 사주에서는 가까운 관계를 보는 일지 ${p.dayBranch}가 이 주제를 보여줍니다. 개인적으로 필요한 ${pk.need}은 가까운 관계에서 원하는 점과 다른 층위입니다.`)
 const relationshipExample=pair(`You might say: “${relationshipProfile.words}”`,`이렇게 말해 볼 수 있습니다: “${relationshipProfile.words}”`)
 const privateLinks=availablePillars(plan.first).filter(({index})=>index!==1).map(({pillar,index})=>({index,...pairObservation(plan.first.pillars[1].pillar.ganzi,pillar.pillar.ganzi,`Birth day / birth ${POSITION[index]}`)})).map(item=>({...item,branchPatterns:item.found.filter(pattern=>pattern.layer==='branch')})).filter(item=>item.branchPatterns.length)
 const branchMeaning:Record<string,string>={合:'shared plans and mutual obligations',暗合:'private expectations and less visible ties',沖:'different preferences or time needs',刑:'repeated friction around expectations',害:'expectations that may be left unspoken',破:'an arrangement that may need revisiting',半合:'a developing tie around shared plans',三合:'shared direction and group commitments',方合:'shared direction and group commitments',怨嗔:'crossed expectations that need a direct conversation',鬼門:'crossed expectations that need a direct conversation'}
 const privateLinksSummary=privateLinks.map(item=>({index:item.index,patterns:[...new Set(item.branchPatterns.map(pattern=>pattern.type))]}))
 const privateStructure=privateLinks.length
  ? pair(`Your chart links close relationships with ${privateLinksSummary.map(item=>item.index===0?'longer-term plans':item.index===2?'work and daily routines':'wider obligations').join(', ')}. It also points to ${[...new Set(privateLinksSummary.flatMap(item=>item.patterns.map(type=>branchMeaning[type]??'another relationship theme')))].join(' and ')}. These themes can bring different expectations into the same conversation; they are not proof of a specific event.`, `사적인 관계를 읽는 지지 ${plan.primary.dayBranch}와 태어난 ${privateLinksSummary.map(item=>`${POSITION[item.index]} 지지(${item.patterns.join('·')})`).join(', ')} 사이에 관계가 있습니다. 전통적으로는 ${[...new Set(privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>branchMeaning[pattern.type]??'해당 관계의 특징')))].join('·')}을 살핍니다. 특정 사건을 확정하지 않습니다.`)
  : pair(`No direct branch link or clash is recorded between your day branch and the other available birth branches. The relationship reading therefore rests on your day-branch needs and the actual way both people communicate, rather than an invented compatibility pattern.`,`태어난 날의 지지와 다른 출생 지지 사이에 직접적인 합이나 충은 확인되지 않습니다. 따라서 관계 풀이는 궁합 구조를 억지로 만들지 않고, 태어난 날의 지지에 담긴 필요와 두 사람이 실제로 소통하는 방식을 중심으로 봅니다.`)
 const relationshipRows=purchaseYears(plan.first,plan.referenceYear,'love',10).map(row=>({year:row.date.slice(0,4),lines:row.lines.filter(line=>/\.(change-day|connection)$/.test(line.id))})).filter(row=>row.lines.length)
 const relationshipYears=targetedProduct01?relationshipRows.map(row=>{
  // Only use a direct day-branch interaction or connection as relationship timing.
  // Work or general cycle pressure alone does not establish a relationship change.
  const key=row.lines.find(line=>line.id.endsWith('.change-day'))??row.lines.find(line=>line.id.endsWith('.connection'))
  return {...row,lines:key?[key]:[]}
 }).filter(row=>row.lines.length).filter((row,index,rows)=>rows.findIndex(candidate=>candidate.lines[0]?.en===row.lines[0]?.en)===index):relationshipRows
 const relationshipTiming=relationshipYears.length
  ? pair(`The years that most clearly touch relationship priorities are ${relationshipYears.slice(0,3).map(row=>`${row.year}: ${row.lines.map(line=>line.en).join(' ')}`).join(' ')} These themes come from annual comparisons with your day branch; they are prompts to review time, shared plans and personal choice, not predictions of a partner, marriage or separation.`,`관계의 우선순위가 달라질 수 있는 비교 시기는 ${relationshipYears.slice(0,3).map(row=>`${row.year}년: ${row.lines.map(line=>line.ko).join(' ')}`).join(' ')}입니다. 태어난 날의 지지와 연간 비교에서 나온 주제이므로 함께 쓰는 시간과 계획, 개인의 선택을 살피는 질문으로 봅니다. 상대나 결혼, 이별을 예측하지 않습니다.`)
  : pair(`No year in the next ten-year comparison has a distinct private-life link or friction under these day-branch checks. That does not guarantee an easy relationship; it means the checked timing does not single out a year.`,`앞으로 10년의 태어난 날 지지 비교에서는 뚜렷한 관계의 연결이나 마찰이 표시되는 해가 없습니다. 관계가 편하다는 보장은 아니며, 확인한 시기 기준에서 특정 연도를 꼽지 않는다는 뜻입니다.`)
 const capacity=capacityPassage(plan.primary)
 const money=moneyPassage(plan.primary)
 const noOutcome=pair('This is a traditional reading of your birth details, rather than a measured personality test or a prediction of events. The examples describe how the pattern may show up.','출생 정보를 바탕으로 한 전통 풀이이며 성격 검사 수치나 사건 예측은 아닙니다. 예시는 그 특징이 생활에서 나타날 수 있는 모습을 설명합니다.')
 const put=(id:string,lines:Passage[],action:Passage|undefined=undefined,caution=m.pressure)=>{
  action ??= QUESTION_ACTIONS[id] ?? pair('Compare the stated pattern with the actual situation before making a major commitment.','큰 약속을 하기 전에 설명한 특징을 실제 상황과 비교합니다.')
  const added=plan.kind==='complete'&&targetedProduct01&&id==='personality'?[]:id==='next-moves'&&plan.kind==='complete'?[]:timing[id]?.lines.filter(l=>!id.startsWith('month-')||!l.id.endsWith('.caution')&&!l.id.endsWith('.capacity')).map(l=>pair(l.en,l.ko))??[]
  const seen=new Set<string>();const all=(id.startsWith('month-')||['feedback-and-boundaries','customer-communication','business-plan'].includes(id)?[...added,...lines]:[...lines,...added]).map(clone).filter(l=>{if(seen.has(l.en))return false;seen.add(l.en);return true})
  out[id]={lines:all,action:clone(action),caution:clone(caution),showGuidance:true}
 }
  const regularRoute=p.visibleMoney.some(item=>item.god==='正財')||p.hiddenMoney.some(item=>item.god==='正財')
  const opportunityRoute=p.visibleMoney.some(item=>item.god==='偏財')||p.hiddenMoney.some(item=>item.god==='偏財')
  const earningMode=pair(regularRoute&&opportunityRoute
    ?`Your chart supports both steady pay and income from customers, projects or deals. The work pattern is ${m.name.en}, linking the variable route to your day-to-day work. This describes possible income routes, not a choice to quit a job or start a business.`
    :regularRoute?`The checked chart gives more direct support to regular income and continuing commitments than to changing customer or deal income. A stable role or repeat service is easier to ground in the visible money signs; independent work would need a clear, repeatable offer.`
    :opportunityRoute?`The checked chart gives more direct support to customer, project or deal-based income than to a regular-pay route. This can suit commercial or independent work, while making a dependable base and paid terms important to establish in real life.`
    :`The checked positions do not establish a direct regular-pay or opportunity-money route. Your work pattern still matters, but the report cannot choose salaried work or business from an absent money marker.`,
    regularRoute&&opportunityRoute?`명식에는 안정적인 급여와 고객·프로젝트·거래 수입의 근거가 모두 있습니다. ${m.name.ko} 업무와 연결되는 변동 수입 통로도 보입니다. 이는 가능한 수입 경로에 대한 풀이이지 직장을 그만두거나 사업을 시작하라는 뜻은 아닙니다.`
    :regularRoute?`확인한 명식에서는 변동성 있는 고객·거래 수입보다 안정적인 수입과 지속적인 책임에 더 직접적인 근거가 있습니다. 고정된 역할이나 반복 서비스가 겉에 드러난 재물 글자와 더 잘 맞으며, 독립 업무는 반복 가능한 상품을 먼저 분명히 해야 합니다.`
    :opportunityRoute?`확인한 명식에서는 고정 급여보다 고객·프로젝트·거래를 통한 수입에 더 직접적인 근거가 있습니다. 영업성 업무나 독립 업무와 연결될 수 있지만 현실에서는 안정적인 기반과 대금 조건을 먼저 갖춰야 합니다.`
    :`확인한 위치에는 고정 수입이나 기회성 재물의 통로가 뚜렷하지 않습니다. 업무 방식은 읽을 수 있어도 재물 글자가 없으므로 직장과 사업 중 하나를 정해 말할 수 없습니다.`)
  const positionName:Record<string,string>={month:'work',year:'wider contacts',day:'private life',hour:'longer-term plans'}
  const moneyGroups=new Map<string,Set<string>>()
  for(const item of [...p.visibleMoney,...p.hiddenMoney]){
    const kind=item.god==='正財'?'steady-income':'deal-based income'
    const key=`${kind} signs`
    const where=positionName[item.position]
    if(!moneyGroups.has(key))moneyGroups.set(key,new Set())
    moneyGroups.get(key)!.add(where)
  }
  const moneyEvidence=[...moneyGroups].map(([kind,places])=>`${kind} appear in ${[...places].join(' and ')}`)
  const visibleMoneyExplanation=moneyEvidence.length?`In your chart, ${moneyEvidence.join('; ')}. This shows where the income markers appear, not how much you will earn.`:'No direct money sign appears in the checked positions, so the reading does not assign you a fixed-pay or deal-based route.'
  const moneyAnswer=pair(regularRoute&&opportunityRoute
    ?`Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. ${visibleMoneyExplanation}`
    :regularRoute?`Regular work or repeat fees have the clearest chart support. Variable projects may add income, but the chart gives less direct support to depending on them as your only route. ${visibleMoneyExplanation}`
    :opportunityRoute?`Project, customer or deal-based income has the clearest chart support; a fixed-pay route is less directly marked. This can suit commercial work, but income is easier to keep steady when payment terms and delivery are settled first. ${visibleMoneyExplanation}`
    :`Your chart does not show a direct money sign in the checked placements. It therefore cannot choose a salary or business route for you; work skills and real contract terms carry more weight. ${visibleMoneyExplanation}`,
    regularRoute&&opportunityRoute?`명식에는 정기 수입과 고객·프로젝트·거래의 변동 수입이 함께 나타납니다. 안정적인 기반에 선택한 유료 업무를 더하는 방식과 맞지만, 어느 쪽이 더 커질지는 실제 일과 계약에 달려 있습니다. ${visibleMoneyExplanation}`
    :regularRoute?`정기 업무와 반복 수수료에 더 직접적인 근거가 있습니다. 프로젝트 수입을 더할 수는 있어도 그것만을 유일한 통로로 삼는 데는 근거가 약합니다. ${visibleMoneyExplanation}`
    :opportunityRoute?`프로젝트와 거래를 통한 수입에 더 직접적인 근거가 있으며 고정 급여는 덜 뚜렷합니다. 영업성 업무와 연결될 수 있지만 조건과 납품, 대금 지급을 먼저 정할수록 수입을 안정시키기 쉽습니다. ${visibleMoneyExplanation}`
    :`확인한 위치에 직접 재물 글자가 없어 급여와 사업 중 하나를 정해 말할 수 없습니다. 실제 업무 능력과 계약 조건을 더 중요하게 살펴야 합니다. ${visibleMoneyExplanation}`)
 const monthHidden=[...new Set(p.strength.hidden.filter(item=>item.position==='month').map(item=>LANGUAGE[item.god]?.name.en).filter(Boolean))]
 const monthHiddenKo=[...new Set(p.strength.hidden.filter(item=>item.position==='month').map(item=>LANGUAGE[item.god]?.name.ko).filter(Boolean))]
 const hiddenRoutine=monthHidden.filter(name=>name!==m.name.en).join(' and ')||inner.name.en
 const hiddenRoutineKo=monthHiddenKo.filter(name=>name!==m.name.ko).join('·')||inner.name.ko
 const capacityLine=p.strength.tendency==='support-needed'
  ? 'Your chart shows both support and demand around this quality, so the amount you can carry depends on the help and time available.'
  : p.strength.tendency==='deferred'
   ? 'The available chart does not support a firm overall strength judgement, so this reading keeps the conclusion cautious.'
   : 'The chart offers some support for this quality, while the work pattern still sets practical limits on how much you can carry.'
 void capacityLine
 const capacityLineKo=p.strength.tendency==='support-needed'
  ? '명식에는 이 성향을 돕는 기운과 요구하는 기운이 함께 있어, 감당할 수 있는 일의 양은 주변의 도움과 시간에 달려 있습니다.'
  : p.strength.tendency==='deferred'
   ? '확인 가능한 명식만으로 전체 강약을 단정하기 어려워 풀이를 신중하게 제시합니다.'
   : '명식에는 이 성향을 뒷받침하는 근거가 일부 있지만, 실제로 감당할 수 있는 양은 업무 조건에도 좌우됩니다.'
 const dayMasterAnswer=targetedProduct01?pair(
    `Your core style is ${personal.focus}. Your birth-day sign is ${p.dayStem} (${dayStemName}); it points to this tendency, not a complete definition of you.`,
    `개인의 출발점은 ${dayStemName} 일간의 특징인 ${pk.strength}입니다. 다만 성격을 한 가지 꼬리표로 단정하지 않습니다. 태어난 달의 겉 역할은 ${m.name.ko}이고, 지장간에는 ${hiddenRoutineKo}의 일상 요구가 더해집니다. ${capacityLineKo}`
  ):strength
 const moneyAreas:Record<string,string>={month:'work and daily responsibilities',day:'private commitments',year:'wider contacts',hour:'longer-term plans'}
 const visibleMoneyAreas=[...new Set(p.visibleMoney.map(item=>moneyAreas[item.position]).filter(Boolean))]
 const hiddenMoneyAreas=[...new Set(p.hiddenMoney.map(item=>moneyAreas[item.position]).filter((area):area is string=>Boolean(area)&&!visibleMoneyAreas.includes(area)))]
 // Product 01 Q4 must answer how money is earned. Do not recycle the Q3 work
 // theme: use the actual visible/hidden money markers and keep retention/capacity
 // as a separate follow-up insight.
 const moneyPlacement=targetedProduct01&&plan.kind==='complete'?pair(`The checked money signs appear in ${visibleMoneyAreas.length?visibleMoneyAreas.join(' and '):'less visible parts of the chart'}${hiddenMoneyAreas.length?`; additional signs are less visible in ${hiddenMoneyAreas.join(' and ')}`:''}. This chart placement supports the income pattern above; it does not show an amount.`,`${visibleMoneyAreas.length?`확인한 재물 표시는 ${visibleMoneyAreas.join('·')}에 나타납니다`:'확인한 재물 표시는 명식의 덜 드러난 부분에 있습니다'}${hiddenMoneyAreas.length?`; 추가 표시는 ${hiddenMoneyAreas.join('·')}에 덜 드러나 있습니다`:''}. 이 배치는 앞서 설명한 수입 방식을 뒷받침하지만 금액을 보여 주지는 않습니다.`):moneyBasis(plan.primary,true)
 const earning=targetedProduct01&&plan.kind==='complete'&&rootCauseFix?[moneyAnswer,moneyDepth(p,'life')]:targetedProduct01&&plan.kind==='complete'?[earningMode,moneyPlacement,moneyDepth(p,'life')]:[money,...(targetedProduct01?[earningMode]:[]),moneyDepth(p,'life'),moneyBasis(plan.primary),capacityBasis(p)]
 const business=[businessVerdict(p),pair(`This comes from ${m.name.en} in the work-related part of your chart${p.monthStemGod===p.monthBranchGod?', repeated in both layers of the birth month':''}.`,`사주에서 일과 연결해 읽는 부분의 ${m.name.ko}에서 나온 풀이입니다.${p.monthStemGod===p.monthBranchGod?' 태어난 달의 두 부분에 같은 주제가 반복됩니다.':''}`)]
 const keepWork=pair('Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.','이직 전에 매주 할 일과 직접 정할 수 있는 결정, 급여를 묻습니다. 부담을 만드는 업무 조건이 나아지는 자리를 고릅니다.')
 const moneyWatch=p.strength.tendency==='support-needed'?pair('More paid work can still leave you short of time or cash if you must carry the costs first.','유료 업무가 늘어도 비용을 먼저 감당하면 시간이나 현금이 부족해질 수 있습니다.'):pair('A new source of income can bring continuing costs and responsibilities with it.','새 수입 통로에는 계속 내야 할 비용과 책임도 따를 수 있습니다.')
 const relationshipWatch=pair('Being useful to each other can hide a difference in what each person wants emotionally.','서로에게 도움이 되어도 감정적으로 원하는 것이 다르다는 점은 가려질 수 있습니다.')
 const practicalMoney=pair('Write down the guaranteed pay, likely fees and costs you must cover. Judge the offer by what remains after those costs.','확정 급여와 예상 수수료, 직접 내야 할 비용을 적습니다. 그 비용을 빼고 남는 금액으로 제안을 판단합니다.')
 const noHealth=pair('A habit that helps on a quiet day can become tiring when every part of the day demands it.','조용한 날 도움이 되…20885 tokens truncated… 같은 역할에 머물 수 있습니다.'),
 }
 for(const [id,caution]of Object.entries(cautions))if(out[id])out[id].caution=clone(caution)
 if(targetedProduct01&&plan.kind==='complete'&&out.social)out.social.caution=clone(pressure)
 if(out.love)out.love.caution=clone(closeFriction)
 if(out['career-plan'])out['career-plan'].caution=clone(pressure)
 if(plan.first.input.unknownTime){
  const basis=clone(capacityPassage(plan.primary))
  const missingCapacity=clone(capacityBasis(p))
  for(const section of Object.values(out))section.lines=section.lines.filter(l=>l.en!==basis.en&&l.en!==missingCapacity.en)
  const first=out[plan.sections[0].id]
  if(plan.includeReadingNotice&&!(plan.kind==='complete'&&targetedProduct01))first.lines.splice(1,0,pair('Reading basis: '+basis.en,'풀이 기준: '+basis.ko))
 }
 const bodySeen=new Set<string>()
 for(const id of [...plan.sections.map(x=>x.id),...(plan.kind==='complete'?['next-moves']:[]),...plan.months.map((_,i)=>'month-'+(i+1))]){
  const section=out[id];if(!section)continue
  section.lines=section.lines.filter((line,index)=>{const key=line.en;if(index===0||id.startsWith('month-')&&/^(Money:|At home:)/.test(key)){bodySeen.add(key);return true}if(bodySeen.has(key))return false;bodySeen.add(key);return true})
  // A caution belongs below the explanation, not twice in the same section.
  if(section.showGuidance)section.lines=section.lines.filter((line,index)=>index===0||line.en!==section.caution.en&&line.en!==section.action.en)
 }
 for(const id of plan.sections.map(s=>s.id))if(!out[id]?.lines.length)throw new Error('Missing customer question '+plan.kind+'/'+id)
 if(targetedProduct01&&rootCauseFix)CACHE.set(plan,out);return out
}
function capacityPassage(p:InterpretationPlan['primary']):Passage{
 if(p.strength.tendency==='supported')return pair('Your chart shows support for putting effort into work and managing resources. This gives you something to use, rather than guaranteeing that every extra commitment is worthwhile.','일과 자원 관리에 힘을 쓸 기반이 있는 쪽으로 읽습니다. 활용할 바탕이 있다는 뜻이며 추가로 맡는 모든 일이 가치 있다는 보장은 아닙니다.')
 if(p.strength.tendency==='support-needed')return pair('Extra work or financial activity can weigh more heavily unless support is in place. An opportunity to earn and the capacity to keep the money are separate parts of this reading.','도움이 갖춰지지 않으면 추가 업무나 재정적인 활동이 더 부담될 수 있습니다. 돈을 벌 기회와 그 돈을 남길 여력은 나누어 읽습니다.')
 if(p.strength.signals.unknownTime)return pair('Your birth time is unknown, so this reading uses your year, month and day without guessing an hour. Opening marks a money, responsibility or learning theme; Adjustment marks competing work or home demands. Neither is a prediction of success or failure. Ten-year starting dates are approximate.','출생시간을 추측하지 않고 연·월·일을 사용합니다. 기회는 재물·책임·배움의 주제를, 조정은 일·사생활에서 겹치는 요구를 표시합니다. 성공과 실패의 예측이 아니며 대운 시작일은 근사치입니다.')
 return pair('Finding an opening and carrying the extra work are different strengths in your chart. More customers or responsibility can be useful, but they can also stretch the time and support available.','기회를 찾는 힘과 늘어난 일을 감당하는 힘은 나누어 읽습니다. 고객이나 책임이 늘면 도움이 될 수 있지만 시간과 지원의 부담도 커질 수 있습니다.')
}
function moneyPassage(p:InterpretationPlan['primary'],area:'life'|'career'|'business'='life'):Passage{
 const steady=p.visibleMoney.some(x=>x.god==='正財'),variable=p.visibleMoney.some(x=>x.god==='偏財')
 const hiddenSteady=p.hiddenMoney.some(x=>x.god==='正財'),hiddenVariable=p.hiddenMoney.some(x=>x.god==='偏財')
 const hiddenAreaNames:Record<string,[string,string]>={month:['day-to-day work','일상 업무'],day:['private commitments','개인적인 약속'],year:['wider contacts','주변 인맥'],hour:['long-term plans','장기 계획']}
 const hiddenAreas=[...new Set(p.hiddenMoney.filter(x=>x.god==='正財'||x.god==='偏財').map(x=>hiddenAreaNames[x.position]?.[0]).filter((x):x is string=>Boolean(x)))]
 const hiddenAreasKo=[...new Set(p.hiddenMoney.filter(x=>x.god==='正財'||x.god==='偏財').map(x=>hiddenAreaNames[x.position]?.[1]).filter((x):x is string=>Boolean(x)))]
 const joinHiddenAreas=(items:string[])=>items.length===2?`${items[0]} and ${items[1]}`:items.join(', ')
 if(area==='business')return steady&&variable?pair('Your business money pattern combines repeat customers with new deals. Recurring sales provide continuity, while new buyers bring a less predictable income stream.','사업 재물에서는 반복 고객과 새 거래가 함께 나타납니다. 반복 판매가 수입을 이어 주고 새 구매자는 수입의 변동을 더하는 방식입니다.')
 :steady?pair('Repeat sales and clearly priced ongoing work are the stronger business money theme. The pressure is how much continuing service each sale requires.','반복 판매와 가격이 분명한 지속 업무가 사업 재물의 더 강한 주제입니다. 판매 뒤 계속 제공해야 할 서비스가 부담이 될 수 있습니다.')
 :variable?pair('The business money theme favours finding buyers and making deals over simply maintaining a fixed book of work. Cash can arrive unevenly when the fees depend on new sales.','정해진 업무를 유지하기보다 구매자를 찾고 거래하는 일이 사업 재물의 중심입니다. 새 판매에 수입이 달리면 수금의 간격도 달라질 수 있습니다.')
 :p.hiddenMoney.length?pair('The business money signs sit behind the main role rather than at the front. Delivery skills and less visible work need attention before treating sales as your main strength.','사업의 재물 글자는 겉에 앞서기보다 역할 뒤에 있습니다. 영업을 주된 강점으로 정하기 전에 납품 기술과 드러나지 않는 업무를 함께 살핍니다.')
 :pair('The checked chart does not give a clear direct business money route. Business suitability and earning power should therefore stay separate in this reading.','확인한 사주에서 직접적인 사업 재물 통로가 분명하지 않습니다. 사업 방식의 적성과 돈 버는 힘은 나누어 풀이합니다.')
 if(area==='career')return steady&&variable?pair('Your income pattern has two routes: regular pay or repeat work, and additional income from projects or new customers. Both appear in your chart, rather than a single fixed earning style.','수입 통로는 정기 급여·반복 업무와 프로젝트·새 고객을 통한 추가 수입으로 나뉩니다. 한 가지 고정된 돈벌이보다 두 방식이 함께 나타납니다.')
 :steady?pair('Regular pay and dependable repeat work are your clearer income pattern. A role with defined hours and duties makes that pattern easier to evaluate.','정기 급여와 꾸준한 반복 업무가 더 분명한 수입 방식입니다. 시간과 담당이 정해진 자리에서 그 방식을 판단하기 쉽습니다.')
 :variable?pair('Customer-facing or project-based income stands out more than a purely fixed routine. Your income question is closely tied to access to buyers and control over the terms of the work.','고정된 일상만으로 버는 방식보다 고객이나 프로젝트를 통한 수입이 더 두드러집니다. 구매자를 만날 기회와 업무 조건을 정할 권한이 수입 질문에 중요합니다.')
 :hiddenSteady&&hiddenVariable?pair(`Your chart has limited signs for both regular pay and customer or project income${hiddenAreas.length?`, linked to ${joinHiddenAreas(hiddenAreas)}`:''}. They point to possible routes, not guaranteed income.`,`명식에는 정기 수입과 고객·프로젝트 수입의 근거가 제한적으로 함께 나타납니다${hiddenAreasKo.length?`. 확인된 위치는 ${joinHiddenAreas(hiddenAreasKo)}입니다`:''}. 가능한 수입 경로이지 보장된 수입은 아닙니다.`)
 :hiddenSteady?pair(`Your chart has a limited sign for regular pay${hiddenAreas.length?`, linked to ${joinHiddenAreas(hiddenAreas)}`:''}. This points to a possible earning route, not how much you would earn or whether a job pays more than a business.`,`명식에 정기 수입을 가리키는 제한적인 표시가 있습니다${hiddenAreasKo.length?`. 확인된 위치는 ${joinHiddenAreas(hiddenAreasKo)}입니다`:''}. 가능한 경로일 뿐이며 실제 수입이나 직장과 사업 중 어느 쪽이 더 많이 벌지는 알 수 없습니다.`)
 :hiddenVariable?pair(`Your chart has a limited sign for customer or project income${hiddenAreas.length?`, linked to ${joinHiddenAreas(hiddenAreas)}`:''}. It points to a possible route, not a promise of income or proof that business would pay more than a job.`,`명식에 고객·프로젝트 수입을 가리키는 제한적인 표시가 있습니다${hiddenAreasKo.length?`. 확인된 위치는 ${joinHiddenAreas(hiddenAreasKo)}입니다`:''}. 가능한 경로일 뿐이며 실제 수입이나 사업이 직장보다 더 벌 것이라는 보장은 아닙니다.`)
 :p.hiddenMoney.length?pair('The money-related signs are less visible, so the chart cannot favour a specific pay route. It does not establish whether salary or business income would be higher.','재물 표시가 덜 드러나 특정 수입 방식을 선택하기 어렵습니다. 급여와 사업 수입 중 어느 쪽이 더 클지 명식만으로 판단할 수 없습니다.')
 :pair('A direct earning pattern is not clear in the checked signs. This report therefore gives more weight to work fit and responsibility than to naming a money-making route.','확인한 글자에서 직접적인 수입 방식은 분명하지 않습니다. 특정 돈벌이 통로보다 맞는 업무와 책임에 더 무게를 둡니다.')
 return steady&&variable?pair('Your money pattern combines a steady base with income from new customers or deals. Relying on only one of those routes would leave out part of the reading.','꾸준한 기반 수입과 새 고객·거래의 수입이 함께 나타납니다. 한쪽 통로만 보면 재물 풀이의 일부가 빠집니다.')
 :steady?pair('Steady pay, repeat customers and manageable ongoing duties are the clearest money pattern in the visible chart.','겉으로 드러난 재물에서는 고정 수입과 단골 고객, 감당할 수 있는 반복 업무가 가장 분명한 방식입니다.')
 :variable?pair('New customers, deals and work with changing fees are the clearest money pattern in the visible chart. A promising deal still needs to turn into paid work.','겉으로 드러난 재물에서는 새 고객과 거래, 수입이 달라지는 일이 가장 분명한 방식입니다. 좋은 제안도 실제 대금을 받는 일로 연결되어야 합니다.')
 :p.hiddenMoney.length?pair('Money-related signs appear in the less visible parts of your chart. Income may be tied to the skills, support or duties behind the main role, rather than being your most obvious outward theme.','재물과 관련된 글자가 덜 드러난 부분에 있습니다. 겉으로 보이는 역할보다 그 뒤의 기술과 도움, 맡은 의무를 통해 수입을 읽습니다.')
 :pair('The available chart does not establish a direct money pattern. That is not a prediction of poverty or low income; the reading does not invent a money theme that is absent.','확인한 정보에서 직접적인 재물 방식을 정할 수 없습니다. 가난하거나 수입이 적다는 예측이 아니며 없는 재물 주제를 만들어 넣지 않습니다.')
}

function moneyBasis(p:InterpretationPlan['primary'],plain=false):Passage{
 const positions=[...new Set(p.visibleMoney.map(x=>x.position))]
 const name:Record<string,[string,string]>={month:['work and everyday responsibilities','일과 일상 책임'],day:['private commitments','개인적인 약속'],year:['wider contacts','주변 인맥'],hour:['future plans','앞으로의 계획']}
 if(!plain){
  if(positions.length)return pair(`Your money themes appear in these areas: ${positions.map(x=>name[x][0]).join('; ')}. Look at the people, promises and costs involved there when judging a new source of income.`,`재물 주제는 ${positions.map(x=>name[x][1]).join('·')}과 연결됩니다. 새 수입을 판단할 때 그 영역의 사람과 약속, 비용을 함께 봅니다.`)
  return p.hiddenMoney.length?pair('The money signs appear among the inner signs rather than the main outward ones, so the reading treats the earning route as less immediately visible.','재물 글자가 겉의 주된 글자보다 안쪽에 나타나 돈 버는 통로가 바로 드러나는 쪽으로 읽지 않습니다.'):pair('No direct money sign is present in the parts checked here; the work interpretation carries more of the answer.','확인한 부분에 직접적인 재물 글자가 없어 업무 방식의 풀이에서 답을 더 찾습니다.')
 }
 const hiddenPositions=[...new Set(p.hiddenMoney.map(x=>x.position))]
 if(positions.length||hiddenPositions.length)return pair(`${positions.length?`The chart shows money signs most clearly in ${positions.map(x=>name[x][0]).join(' and ')}`:'The chart does not show a direct money sign in the visible areas'}${hiddenPositions.length?`; additional money signs sit in less visible areas linked to ${hiddenPositions.map(x=>name[x][0]).join(' and ')}`:''}. Check the people, agreements and costs in those areas when weighing a new income source.`,`${positions.length?`겉으로 드러난 재물 표시는 ${positions.map(x=>name[x][1]).join('·')}에서 분명합니다`:'겉으로 드러난 영역에는 직접적인 재물 표시가 없습니다'}${hiddenPositions.length?`; 덜 드러난 재물 표시는 ${hiddenPositions.map(x=>name[x][1]).join('·')}과 연결됩니다`:''}. 새 수입을 검토할 때 해당 영역의 사람과 약속, 비용을 확인합니다.`)
 return p.hiddenMoney.length?pair('The money signs appear among the inner signs rather than the main outward ones, so the reading treats the earning route as less immediately visible.','재물 글자가 겉의 주된 글자보다 안쪽에 나타나 돈 버는 통로가 바로 드러나는 쪽으로 읽지 않습니다.'):pair('No direct money sign is present in the parts checked here; the work interpretation carries more of the answer.','확인한 부분에 직접적인 재물 글자가 없어 업무 방식의 풀이에서 답을 더 찾습니다.')
}

/** Long periods use their own calculated boundaries, not an annual reference or a fabricated event date. */
export function customerPeriod(plan:InterpretationPlan,index:number):Passage[]{
 const cycle=plan.selectedCycles[index], g=LANGUAGE[cycle.stemGod], inner=LANGUAGE[cycle.branchGod]
 const workTheme=publicRoleLabel(plan.primary.monthStemGod),previousCycle=plan.selectedCycles[index-1],cycleContrast=previousCycle
  ?`Compared with ${previousCycle.ganzi}, this cycle shifts the longer-period emphasis from ${LANGUAGE[previousCycle.stemGod].name.en} to ${g.name.en}; the public work role still carries ${workTheme.en}.`
  :`Your public work role carries ${workTheme.en}. This longer cycle adds ${g.name.en}${cycle.stemGod!==cycle.branchGod?` and ${inner.name.en} in daily life`:''}.`
 const start=new Date(cycle.start).toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}),end=cycle.next?new Date(cycle.next).toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}):null
 const lines=[pair(`Around ${start}${end?` to around ${end}`:''}: a chapter about ${g.name.en}${cycle.stemGod!==cycle.branchGod?`, with ${inner.name.en} shaping everyday life`:''}. Cycle start dates are estimates and can differ across calculation conventions.`,`약 ${cycle.start.slice(0,7)}${cycle.next?`부터 약 ${cycle.next.slice(0,7)}까지`:''}는 ${g.name.ko}의 시기입니다. 대운 시작 시점은 계산 기준에 따라 달라질 수 있는 근사치입니다.${cycle.stemGod!==cycle.branchGod?` 일상에는 ${inner.name.ko}도 함께 나타납니다.`:''}`),pair(`${cycleContrast} ${PERIOD_VOICE[cycle.stemGod].lead.en}`,`${previousCycle?`${previousCycle.ganzi} 대운과 비교하면 긴 흐름의 중심이 ${LANGUAGE[previousCycle.stemGod].name.ko}에서 ${g.name.ko}으로 옮겨갑니다.`:`겉으로 맡는 업무의 중심은 ${workTheme.ko}입니다. 이 긴 흐름에는 ${g.name.ko}${cycle.stemGod!==cycle.branchGod?`와 일상의 ${inner.name.ko}`:''}이 더해집니다.`} ${PERIOD_VOICE[cycle.stemGod].lead.ko}`),pair(`The money side of this chapter: ${g.money.en}`,`이 시기의 재물: ${g.money.ko}`),pair(`In close relationships during this chapter: ${inner.love.en}`,`이 시기의 가까운 관계: ${inner.love.ko}`)]

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
 const labels=(rows:typeof sharedPressure)=>rows.map(r=>new Date(r.date+'T12:00:00Z').toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'})).join(', ')
 const koLabels=(rows:typeof sharedPressure)=>rows.map(r=>Number(r.date.slice(5,7))+'월').join('·')
 const needsMatch=sharedCareNeed(p.dayBranch,b.dayBranch)
 return [
  pair(`Your chart links work and relationships through shared time: the public work pattern is ${m.name.en}, while your private-life need is ${RELATIONSHIP_PROFILES[p.dayBranch].need}. Taking on a larger role may affect both, but the chart does not say that it must.`,`이 명식에서 일과 관계는 함께 쓰는 시간으로 연결됩니다. 업무의 바깥 역할은 ${m.name.ko}, 사적인 관계에서 필요한 것은 ${NEED[p.dayBranch]}입니다. 더 큰 역할을 맡으면 둘 다 영향을 받을 수 있지만, 반드시 그렇다고 단정하지 않습니다.`),
  pair(`In ${plans.annual.referenceYear}, the annual theme ${year.name.en} ${y.god===p.monthStemGod?'repeats':'differs from'} your natal work theme. ${sharedPressure.length?`The clearest overlap is work and private-life friction in ${labels(sharedPressure)}.`:workChange.length?`Work changes stand out in ${labels(workChange)}, without a matching private-life friction signal.`:'The checked months show no shared work-and-private-life friction.'} These are separate timing comparisons, not predicted events.`,` ${plans.annual.referenceYear}년의 연간 주제 ${year.name.ko}은 타고난 업무 주제와 ${y.god===p.monthStemGod?'같습니다':'다릅니다'}. ${sharedPressure.length?`${koLabels(sharedPressure)}에는 업무와 사적인 관계의 마찰이 가장 뚜렷하게 겹칩니다.`:workChange.length?`${koLabels(workChange)}에는 업무 변화가 두드러지지만 사적인 관계의 마찰이 함께 계산되지는 않습니다.`:'확인한 달에서 업무와 사적인 관계의 마찰이 함께 나타나지 않습니다.'} 이는 시기 비교이며 사건 예측은 아닙니다.`),
  pair(`${needsMatch?'You and your partner share a private-life need':'You and your partner have different private-life needs'}: you value ${RELATIONSHIP_PROFILES[p.dayBranch].need}; your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. Even when one need matches, your charts describe two different people.`,` ${needsMatch?'본인과 상대방은 사적인 관계에서 비슷한 필요를':'본인과 상대방의 사적인 관계에서 필요한 점은 다릅니다'}. 본인은 ${NEED[p.dayBranch]}, 상대방은 ${NEED[b.dayBranch]}을 원합니다. 한 가지 필요가 같아도 두 사람의 사주 전체가 같은 것은 아닙니다.`),
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
