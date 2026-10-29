Warning: truncated output (original token count: 29309)
Total output lines: 462

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
import { STEM_ELEMENTS } from './reading.ts'
import { explainCalculation } from './calculation-notes.ts'
export interface CustomerSection { lines:Passage[]; action:Passage; caution:Passage; showGuidance:boolean }
const NEED:Record<string,string>={子:'어려운 대화 전에 생각할 시간',丑:'작더라도 지켜지는 약속',寅:'두 사람 모두 선택할 수 있는 기회',卯:'친절한 말과 솔직한 답',辰:'분명한 결정과 함께 나누는 책임',巳:'사생활과 신뢰, 서로를 이해할 만큼의 정보',午:'따뜻한 관심과 자신의 관심사를 위한 시간',未:'해결책을 듣기 전에 내 이야기를 들어 주는 것',申:'실질적인 도움과 함께 이야기를 들어 주는 것',酉:'각자의 취향에 대한 존중',戌:'꾸준한 일상 행동으로 쌓는 신뢰',亥:'재촉받지 않고 감정을 말할 시간'}
const ELEMENT:Record<string,string>={Wood:'나무',Fire:'불',Earth:'흙',Metal:'금속',Water:'물'}
const ELEMENT_NAME:Record<string,string>={Wood:'Wood',Fire:'Fire',Earth:'Earth',Metal:'Metal',Water:'Water'}
const CACHE=new WeakMap<InterpretationPlan,Record<string,CustomerSection>>()
const clone=(p:Passage)=>pair(plainReadingText(customerEnglish(p.en)),p.ko)
export function customerNarrative(plan:InterpretationPlan,targetedProduct01=true):Record<string,CustomerSection>{
 const found=targetedProduct01?CACHE.get(plan):undefined;if(found)return found
 const p=plan.primary,detail=temperamentDetail(plan.primary.dayStem),dk=TEMPERAMENT_KO[plan.primary.dayStem],m=LANGUAGE[p.monthStemGod],inner=LANGUAGE[p.monthBranchGod],day=LANGUAGE[p.dayBranchGod],personal=PERSONAL_PROFILES[p.dayStem],pk=PERSONAL_KO[p.dayStem]
 const answer=BUYER_ANSWERS[p.monthStemGod], dailyAnswer=BUYER_ANSWERS[p.monthBranchGod]
 const timing=purchaseTimingSections(plan,targetedProduct01),out:Record<string,CustomerSection>={}
 const strength=pair(personal.strength,pk.strength),pressure=pair(personal.pressure,pk.pressure)
 const calculation=targetedProduct01&&plan.kind==='complete'?explainCalculation(plan.first.input):undefined
 const birthTimeNote=plan.first.input.unknownTime
  ? pair('Birth time was not supplied, so this reading leaves out the hour pillar. Some personal and relationship details may therefore be incomplete.','출생시간이 없어 시주는 풀이에서 제외했습니다. 일부 성향과 관계 해석은 완전하지 않을 수 있습니다.')
  : calculation?.nearBoundary&&calculation.boundaryNote
   ? pair(calculation.boundaryNote,`출생시간이 시주 경계에 가까워 계산 기준에 따라 시주가 달라질 수 있습니다. ${calculation.adjacentHours?`${calculation.adjacentHours.before} / ${calculation.adjacentHours.after} 경계입니다.`:''}`)
   : undefined
 const ownNeed=pair(`You tend to need ${personal.need}.`,`개인적으로 필요한 것은 ${pk.need}입니다.`)
 const publicRole=pair(`Your work side centres on ${m.name.en}. Start with a role that makes use of this strength.`,`일에서는 ${m.name.ko}이 중심입니다. 이 강점을 쓰는 역할부터 살핍니다.`)
 const underneath=p.monthStemGod===p.monthBranchGod?pair('The same work theme appears in both parts of your birth-month reading. That can make it a persistent way of handling work, rather than a temporary mood.','태어난 달의 두 부분에 같은 업무 주제가 반복됩니다. 일시적인 기분보다 일하는 방식에서 계속 나타날 수 있는 특징으로 읽습니다.'):pair(`Your everyday duties add ${inner.name.en}. Check that the job gives you time for both the visible result and the work behind it.`,`매일 맡는 일에는 ${inner.name.ko}이 더해집니다. 겉으로 보이는 결과와 그 뒤의 업무를 함께 해낼 시간이 있는지 확인합니다.`)
 const closeNeed=pair(`In close relationships, your chart points to a need for ${RELATIONSHIP_PROFILES[p.dayBranch].need}.`,`가까운 관계에서 원하는 것은 ${NEED[p.dayBranch]}입니다.`)
 const closeFriction=pair(`A recurring difficulty may be ${RELATIONSHIP_PROFILES[p.dayBranch].friction}.`,`가까운 관계에서 반복될 수 있는 어려움은 ${PRIVATE_FRICTION_KO[p.dayBranch]}입니다.`)
 const relationshipProfile=RELATIONSHIP_PROFILES[p.dayBranch]
 const relationshipConclusion=pair(`A steadier fit is a partner whose everyday behaviour makes room for ${relationshipProfile.need}. Tension can arise when someone responds to this need by ${relationshipProfile.friction}.`,`더 편안한 관계는 ${NEED[p.dayBranch]}을 일상에서 존중하는 사람과 이어가기 쉽습니다. 반대로 누군가 ${PRIVATE_FRICTION_KO[p.dayBranch]}하면 마찰이 생길 수 있습니다.`)
 const relationshipReason=pair(`Why this appears in your chart: the close-relationship marker is ${p.dayBranch}. It points to ${relationshipProfile.need}; its pressure point is ${relationshipProfile.friction}.`,`이 내용의 사주 근거는 가까운 관계를 읽는 일지 ${p.dayBranch}입니다. 일지의 필요는 ${NEED[p.dayBranch]}이며 부담은 ${PRIVATE_FRICTION_KO[p.dayBranch]}입니다.`)
 const relationshipExample=pair(`In an everyday conversation, you could say: ${relationshipProfile.words}`,`일상 대화에서 다음처럼 말해 볼 수 있습니다: ${relationshipProfile.words}`)
 const privateLinks=availablePillars(plan.first).filter(({index})=>index!==1).map(({pillar,index})=>({index,...pairObservation(plan.first.pillars[1].pillar.ganzi,pillar.pillar.ganzi,`Birth day / birth ${POSITION[index]}`)})).map(item=>({...item,branchPatterns:item.found.filter(pattern=>pattern.layer==='branch')})).filter(item=>item.branchPatterns.length)
 const branchName:Record<string,string>={合:'combination',暗合:'quiet combination',沖:'clash',刑:'punishment pattern',害:'harm pattern',破:'break pattern',半合:'partial combination',三合:'three-branch combination',方合:'directional combination',怨嗔:'crossed-expectations pattern',鬼門:'crossed-expectations pattern'}
 const branchMeaning:Record<string,string>={合:'shared plans and mutual obligations',暗合:'private expectations and less visible ties',沖:'different preferences or time needs',刑:'repeated friction around expectations',害:'expectations that may be left unspoken',破:'an arrangement that may need revisiting',半合:'a developing tie around shared plans',三合:'shared direction and group commitments',方合:'shared direction and group commitments',怨嗔:'crossed expectations that need a direct conversation',鬼門:'crossed expectations that need a direct conversation'}
 const privateStructure=privateLinks.length
  ? pair(`Your private-life marker ${plan.primary.dayBranch} has ${privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>`a ${branchName[pattern.type]??`recorded ${pattern.type} relationship`} with the birth-${POSITION[item.index]} marker`)).join(' and ')}. Together, these draw attention to ${[...new Set(privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>branchMeaning[pattern.type]??'a relationship theme shown by that recorded pattern')))].join(' and ')}. These are traditional relationship themes, not proof of specific events.`, `사적인 관계를 읽는 지지 ${plan.primary.dayBranch}와 태어난 ${privateLinks.map(item=>`${POSITION[item.index]} 지지(${item.branchPatterns.map(pattern=>pattern.type).join('·')})`).join(', ')} 사이에 관계가 있습니다. 전통적으로는 ${[...new Set(privateLinks.flatMap(item=>item.branchPatterns.map(pattern=>branchMeaning[pattern.type]??'해당 관계의 특징')))].join('·')}을 살핍니다. 특정 사건을 확정하지 않습니다.`)
  : pair(`No direct branch link or clash is recorded between your day branch and the other available birth branches. The relationship reading therefore rests on your day-branch needs and the actual way both people communicate, rather than an invented compatibility pattern.`,`태어난 날의 지지와 다른 출생 지지 사이에 직접적인 합이나 충은 확인되지 않습니다. 따라서 관계 풀이는 궁합 구조를 억지로 만들지 않고, 태어난 날의 지지에 담긴 필요와 두 사람이 실제로 소통하는 방식을 중심으로 봅니다.`)
 const relationshipRows=purchaseYears(plan.first,plan.referenceYear,'love',10).map(row=>({year:row.date.slice(0,4),lines:row.lines.filter(line=>/\.(change-day|connection)$/.test(line.id))})).filter(row=>row.lines.length)
 const relationshipYears=targetedProduct01?relationshipRows.map(row=>{
  // Only use a direct day-branch interaction or connection as relationship timing.
  // Work or general cycle pressure alone does not establish a relationship change.
  const key=row.lines.find(line=>line.id.endsWith('.change-day'))??row.lines.find(line=>line.id.endsWith('.connection'))
  return {...row,lines:key?[key]:[]}
 }):relationshipRows
 const relationshipTiming=relationshipYears.length
  ? pair(`In the next ten-year comparison, ${relationshipYears.slice(0,3).map(row=>`${row.year}: ${row.lines.map(line=>line.en).join(' ')}`).join(' ')} These dates mark relationship themes in the calculated day-branch comparisons; they do not predict a partner, marriage or separation.`,`앞으로 10년의 비교에서 ${relationshipYears.slice(0,3).map(row=>`${row.year}년: ${row.lines.map(line=>line.ko).join(' ')}`).join(' ')} 이 시기는 계산된 태어난 날의 지지 비교에서 관계 주제가 나타난 때이며 상대, 결혼, 이별을 예측하지 않습니다.`)
  : pair(`No year in the next ten-year comparison has a distinct private-life link or friction under these day-branch checks. That does not guarantee an easy relationship; it means the checked timing does not single out a year.`,`앞으로 10년의 태어난 날 지지 비교에서는 뚜렷한 관계의 연결이나 마찰이 표시되는 해가 없습니다. 관계가 편하다는 보장은 아니며, 확인한 시기 기준에서 특정 연도를 꼽지 않는다는 뜻입니다.`)
 const capacity=capacityPassage(plan.primary)
 const money=moneyPassage(plan.primary)
 const noOutcome=pair('This is a traditional reading of your birth details, rather than a measured personality test or a prediction of events. The examples describe how the pattern may show up.','출생 정보를 바탕으로 한 전통 풀이이며 성격 검사 수치나 사건 예측은 아닙니다. 예시는 그 특징이 생활에서 나타날 수 있는 모습을 설명합니다.')
 const put=(id:string,lines:Passage[],action:Passage|undefined=undefined,caution=m.pressure)=>{
  action ??= QUESTION_ACTIONS[id] ?? pair('Compare the stated pattern with the actual situation before making a major commitment.','큰 약속을 하기 전에 설명한 특징을 실제 상황과 비교합니다.')
  const added=id==='next-moves'&&plan.kind==='complete'?[]:timing[id]?.lines.filter(l=>!id.startsWith('month-')||!l.id.endsWith('.caution')&&!l.id.endsWith('.capacity')).map(l=>pair(l.en,l.ko))??[]
  const seen=new Set<string>();const all=(id.startsWith('month-')||['feedback-and-boundaries','customer-communication','business-plan'].includes(id)?[...added,...lines]:[...lines,...added]).map(clone).filter(l=>{if(seen.has(l.en))return false;seen.add(l.en);return true})
  out[id]={lines:all,action:clone(action),caution:clone(caution),showGuidance:true}
 }
 const work=[answer.career,publicRole,m.work,underneath]
  const regularRoute=p.visibleMoney.some(item=>item.god==='正財')||p.hiddenMoney.some(item=>item.god==='正財')
  const opportunityRoute=p.visibleMoney.some(item=>item.god==='偏財')||p.hiddenMoney.some(item=>item.god==='偏財')
  const earningMode=pair(regularRoute&&opportunityRoute
    ?`Your chart has both regular-resource signs and opportunity-money signs. That supports a mixed income pattern: a dependable base can sit alongside customer, project or deal-based earnings. The birth-month work marker is ${m.name.en}, so the variable route is connected to your work setting. This describes the chart's earning structure, not a choice to quit a job or start a business.`
    :regularRoute?`The checked chart gives more direct support to regular income and continuing commitments than to changing customer or deal income. A stable role or repeat service is easier to ground in the visible money signs; independent work would need a clear, repeatable offer.`
    :opportunityRoute?`The checked chart gives more direct support to customer, project or deal-based income than to a regular-pay route. This can suit commercial or independent work, while making a dependable base and paid terms important to establish in real life.`
    :`The checked positions do not establish a direct regular-pay or opportunity-money route. Your work pattern still matters, but the report cannot choose salaried work or business from an absent money marker.`,
    regularRoute&&opportunityRoute?`명식에는 안정적인 재물과 기회성 재물이 모두 나타납니다. 꾸준한 수입 기반에 고객·프로젝트·거래 수입을 더하는 혼합형 흐름으로 읽습니다. 태어난 달의 직업 표시는 ${m.name.ko}이므로 변동 수입 통로도 업무 환경과 연결됩니다. 이는 재물 구조 풀이이지 직장을 그만두거나 사업을 시작하라는 뜻은 아닙니다.`
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
  const visibleMoneyExplanation=moneyEvidence.length?`In your chart, ${moneyEvidence.join('; ')}. The work position speaks to daily duties; signs in private life or wider contacts point to how income connects with close commitments or other people.`:'No direct money sign appears in the checked positions, so the reading does not assign you a fixed-pay or deal-based route.'
  const moneyAnswer=pair(regularRoute&&opportunityRoute
    ?`Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. ${visibleMoneyExplanation}`
    :regularRoute?`Regular work or repeat fees have the clearest chart support. Variable projects may add income, but the chart gives less direct support to depending on them as your only route. ${visibleMoneyExplanation}`
    :opportunityRoute?`Project, customer or deal-based income has the clearest chart support; a fixed-pay route is less directly marked. This can suit commercial work, but income is easier to keep steady when payment terms and delivery are settled first. ${visibleMoneyExplanation}`
    :`Your chart does not show a direct money sign in the checked placements. It therefore cannot choose a salary or business route for you; work skills and real contract terms carry more weight. ${visibleMoneyExplanation}`,
    regularRoute&&opportunityRoute?`명식에는 정기 수입과 고객·프로젝트·거래의 변동 수입이 함께 나타납니다. 안정적인 기반에 선택한 유료 업무를 더하는 방식과 맞지만, 어느 쪽이 더 커질지는 실제 일과 계약에 달려 있습니다. ${visibleMoneyExplanation}`
    :regularRoute?`정기 업무와 반복 수수료에 더 직접적인 근거가 있습니다. 프로젝트 수입을 더할 수는 있어도 그것만을 유일한 통로로 삼는 데는 근거가 약합니다. ${visibleMoneyExplanation}`
    :opportunityRoute?`프로젝트와 거래를 통한 수입에 더 직접적인 근거가 있으며 고정 급여는 덜 뚜렷합니다. 영업성 업무와 연결될 수 있지만 조건과 납품, 대금 지급을 먼저 정할수록 수입을 안정시키기 쉽습니다. ${visibleMoneyExplanation}`
    :`확인한 위치에 직접 재물 글자가 없어 급여와 사업 중 하나를 정해 말할 수 없습니다. 실제 업무 능력과 계약 조건을 더 중요하게 살펴야 합니다. ${visibleMoneyExplanation}`)
  const moneyYearRows=targetedProduct01&&plan.kind==='complete'?purchaseYears(plan.first,plan.referenceYear,'money',10,true):[]
  const moneyHighlights=moneyYearRows.filter(row=>{
    const reference=row.evidence.find(fact=>fact.startsWith('Reference '))??''
    const directMoney=/= (?:正財|偏財)(?:;|\.)/.test(reference)
    return Boolean(row.route)||directMoney
  }).filter((row,index,rows)=>{
    const marker=(row.evidence.find(fact=>fact.startsWith('Reference '))??'').match(/(?:reference stem [^;]+ = (正財|偏財)|principal inner stem [^;]+ = (正財|偏財))/)
    const kind=marker?.[1]??marker?.[2]??row.route??row.status
    const clash=row.lines.find(line=>line.id.endsWith('.change-month'))?.en.match(/through ([^.]+)\./)?.[1]??'none'
    return rows.findIndex(candidate=>{
      const candidateMarker=(candidate.evidence.find(fact=>fact.startsWith('Reference '))??'').match(/(?:reference stem [^;]+ = (正財|偏財)|principal inner stem [^;]+ = (正財|偏財))/)
      const candidateKind=candidateMarker?.[1]??candidateMarker?.[2]??candidate.route??candidate.status
      const candidateClash=candidate.lines.find(line=>line.id.endsWith('.change-month'))?.en.match(/through ([^.]+)\./)?.[1]??'none'
      return candidateKind===kind&&candidateClash===clash
    })===index
  }).slice(0,4)
  const moneyTiming=moneyHighlights.length?pair(`Money themes are not equally strong each year. ${moneyHighlights.map(row=>{
    const year=row.date.slice(0,4),pillar=row.lines.find(line=>line.id.endsWith('.annual-pillar'))?.en??'',theme=row.lines.find(line=>line.id.endsWith('.annual-theme'))?.en??'this annual theme',kind=row.status==='opening-with-caution'?'a paid-work route with added demands':row.status==='conditional-opening'?'a conditional route into paid work':row.status==='extra-care'?'money activity that needs extra care':row.status==='topic-only'?'a money topic without a clear paid-work opening':'a conditional work theme'
    const marker=(row.evidence.find(fact=>fact.startsWith('Reference '))??'').match(/(?:reference stem [^;]+ = (正財|偏財)|principal inner stem [^;]+ = (正財|偏財))/)
    const moneyType=marker?(marker[1]??marker[2])==='正財'?'regular-income':'deal-based':'paid-work'
    const change=row.lines.find(line=>line.id.endsWith('.change-month'))
    return `${year}${pillar?` (${pillar})`:''}: ${theme} brings ${moneyType} signs into ${kind}${change?`; review ${change.en.includes('visible work terms')?'role terms':'daily duties'}`:''}`
  }).join('; ')}. These dates show where the chart puts earning activity and pressure together; they do not promise a profit or pay rise.`,`앞으로 10년의 재물 주제가 매년 같지는 않습니다. ${moneyHighlights.map(row=>{
    const year=row.date.slice(0,4),pillar=row.lines.find(line=>line.id.endsWith('.annual-pillar'))?.en??'',theme=row.lines.find(line=>line.id.endsWith('.annual-theme'))?.ko??'그해의 주제',kind=row.status==='opening-with-caution'?'추가 부담이 붙는 유료 업무 통로':row.status==='conditional-opening'?'조건이 따르는 유료 업무 통로':row.status==='extra-care'?'주의가 필요한 재물 활동':row.status==='topic-only'?'분명한 유료 업무 기회와 구분되는 재물 주제':'조건부 업무 주제'
    const marker=(row.evidence.find(fact=>fact.startsWith('Reference '))??'').match(/(?:reference stem [^;]+ = (正財|偏財)|principal inner stem [^;]+ = (正財|偏財))/)
    const moneyType=marker?(marker[1]??marker[2])==='正財'?'정기 수입':'거래성 수입':'유료 업무'
    const change=row.lines.find(line=>line.id.endsWith('.change-month'))
    return `${year}년(${pillar}): ${theme} 흐름에서 ${moneyType} 주제가 ${kind}${change?`, 업무에서는 ${change.en.includes('visible work terms')?'직무 조건':'일상 업무'}을 살펴야 합니다`:''}`
  }).join('; ')}. 재물 활동과 부담이 함께 나타나는 시기이지 이익이나 급여 인상을 약속하지 않습니다.`):pair('No distinct money-related work route stands out in the next ten annual comparisons. The report does not label a year as a wealth peak without that evidence.','앞으로 10년 비교에서 뚜렷한 재물 관련 유료 업무 통로가 나타나지 않습니다. 근거 없이 어느 해를 재물운이 가장 좋은 시기로 표시하지 않습니다.')
 const dayMasterAnswer=targetedProduct01?pair(
    `Your clearest personal quality is careful judgement and a high standard for quality. It comes from your ${p.dayStem} Day Master, the day stem at the centre of the chart. In your chart, the spring ${p.positions.find(item=>item.position==='month')?.ganzi} month does not directly support ${ELEMENT_NAME[STEM_ELEMENTS[p.dayStem]]}, while a same-element hidden stem in your long-term-plans branch gives it a foothold. This mixed picture describes a real strength whose workload still depends on support around you.`,
    `가장 뚜렷한 성향은 신중한 판단과 높은 완성도 기준입니다. 사주의 중심인 ${p.dayStem} 일간에서 나온 특징입니다. 명식에서 봄의 ${p.positions.find(item=>item.position==='month')?.ganzi}월은 ${ELEMENT[p.dayStem==='庚'||p.dayStem==='辛'?'Metal':p.dayStem==='甲'||p.dayStem==='乙'?'Wood':p.dayStem==='丙'||p.dayStem==='丁'?'Fire':p.dayStem==='戊'||p.dayStem==='己'?'Earth':'Water']}을 직접 돕지 않지만 장기 계획을 보는 지지에 같은 기운의 지장간이 뿌리를 둡니다. 강점은 분명하지만 감당할 업무량은 주변의 지원에 따라 달라지는 혼합 구조입니다.`
  ):strength
 const earning=targetedProduct01&&plan.kind==='complete'?[moneyAnswer,moneyDepth(p,'life'),moneyTiming,capacityBasis(p)]:[money,...(targetedProduct01?[earningMode]:[]),moneyDepth(p,'life'),moneyBasis(plan.primary),capacityBasis(p)]
 const business=[businessVerdict(p),pair(`This comes from ${m.name.en} in the work-related part of your chart${p.monthStemGod===p.monthBranchGod?', repeated in both layers of the birth month':''}.`,`사주에서 일과 연결해 읽는 부분의 ${m.name.ko}에서 나온 풀이입니다.${p.monthStemGod===p.monthBranchGod?' 태어난 달의 두 부분에 같은 주제가 반복됩니다.':''}`)]
 const keepWork=pair('Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.','이직 전에 매주 할 일과 직접 정할 수 있는 결정, 급여를 묻습니다. 부담을 만드는 업무 조건이 나아지는 자리를 고릅니다.')
 const moneyWatch=p.strength.tendency==='support-needed'?pair('More paid work can still leave you short of time or cash if you must carry the costs first.','유료 업무가 늘어도 비용을 먼저 감당하면 시간이나 현금이 부족해질 수 있습니다.'):pair('A new source of income can bring continuing costs and responsibilities with it.','새 수입 통로에는 계속 내야 할 비용과 책임도 따를 수 있습니다.')
 const relationshipWatch=pair('Being useful to each other can hide a difference in what each person wants emotionally.','서로에게 도움이 되어도 감정적으로 원하는 것이 다르다는 점은 가려질 수 있습니다.')
 const practicalMoney=pair('Write down the guaranteed pay, likely fees and costs you must cover. Judge the offer by what remains after those costs.','확정 급여와 예상 수수료, 직접 내야 할 비용을 적습니다. 그 비용을 빼고 남는 금액으로 제안을 판단합니다.')
 const noHealth=pair('A habit that helps on a quiet day can become tiring when every part of the day demands it.','조용한 날 도움이 되는 습관도 하루 종일 요구받으면 부담이 될 수 있습니다.')
 if(plan.kind==='complete'||plan.kind==='wellbeing'){
  put(plan.kind==='complete'?'personality':'everyday-pace',plan.kind==='complete'?targetedProduct01?[dayMasterAnswer,...(birthTimeNote?[birthTimeNote]:[]),personalContrast(p,'life'),noOutcome]:[strength,personalContrast(p,'life'),pair(`Your personal style meets a practical demand for ${m.name.en}. That contrast is an important thread in this life reading.`,`개인의 성향 위에 ${m.name.ko}이라는 현실적 요구가 더해집니다. 그 만남을 인생 풀이의 중요한 줄기로 읽습니다.`),ownNeed,capacity,noOutcome]:[strength,personalContrast(p),pair(personal.example,PERSONAL_SCENE_KO[p.dayStem].example),pair(personal.balance,PERSONAL_SCENE_KO[p.dayStem].balance),noOutcome],undefined,pressure)
  if(targetedProduct01&&plan.kind==='complete'){out.personality.showGuidance=false;out.personality.lines=out.personality.lines.filter(line=>line.en!==noOutcome.en&&line.ko!==noOutcome.ko)}
 }
 if(plan.kind==='complete'){
  put('money',earning,practicalMoney,moneyWatch)
  const careerFit=pair(
    `A structured role with clear authority is a better fit than relying on commissions alone. Both positions in the birth-month pillar carry a commercial theme; the birth-year pillar adds learning and dependable support. Together, they favour an organisation that gives you access to customers, backing and responsibility for the result. Independent work remains possible, but the chart gives more weight to a reliable base.`,
    `수수료 수입에만 기대기보다 권한이 분명한 조직 내 역할에 더 근거가 있습니다. 태어난 달의 겉과 안에 상업적 주제가 있고, 태어난 해에는 배움과 믿을 수 있는 지원이 더해집니다. 고객과 연결될 기회, 지원, 결과에 대한 책임을 함께 주는 조직이 더 맞는 쪽입니다. 독립 업무도 가능하지만 안정적인 기반에 더 무게를 둡니다.`
  )
  put('career',targetedProduct01?[careerFit,roleChoice(p),pair(`Your main career risk is being held responsible for revenue without enough control over the delivery work or the terms. The repeated birth-month pattern is easier to use when the remit covers both the commercial result and what happens after a deal is agreed.`,`직업에서의 주된 부담은 납품 방식이나 조건을 충분히 정하지 못하면서 매출 책임만 맡는 것입니다. 태어난 달에 같은 상업적 특징이 반복되므로 거래 뒤의 실제 제공까지 담당 범위에 포함될 때 강점을 활용하기 쉽습니다.`)]:[lifeWork(p),roleChoice(p),publicRole,underneath],keepWork,m.pressure)
  put('love',[relationshipConclusion,relationshipReason,privateStructure,relationshipTiming,relationshipExample],pair('Say what form of care you want, and ask what the other person wants rather than assuming it is the same.','원하는 배려를 말하고 상대에게도 물어봅니다. 서로 같은 배려를 원한다고 가정하지 않습니다.'),relationshipWatch)
  put('social',targetedProduct01?[pair(`Your ${p.dayStem} Day Master is linked with ${personal.focus}. ${personal.strength}`,`일간 ${p.dayStem}은 ${personal.focus}의 특징과 연결됩니다. ${pk.strength}`),pair(personal.example,PERSONAL_SCENE_KO[p.dayStem].example),pair(personal.pressure,pk.pressure),pair(`Your chart’s growth edge is not to lower your standard, but to know when the useful version is ready to share.`,`기준을 낮추기보다 쓸 수 있는 결과물을 언제 공유할지 정하는 점이 성장의 과제입니다.`)]:[pair(`The strength that helps you can also become your pressure point: ${m.balance.en}`,`도움이 되는 강점이 부담의 출발점이 될 수도 있습니다. ${m.balance.ko}`),pair(`Your birth day describes your personal style; the birth month shows how that style meets everyday demands. ${p.monthStemGod===p.monthBranchGod?'The same demand appears in both parts of the month, making it a recurring theme.':'The two parts of the month show different demands, so one role may not meet all your needs.'}`,`태어난 날에서는 개인 성향을, 태어난 달에서는 그 성향이 일상의 요구와 만나는 방식을 읽습니다. ${p.monthStemGod===p.monthBranchGod?'달의 두 부분에 같은 요구가 있어 반복되는 주제로 봅니다.':'달의 두 부분에 다른 요구가 있어 역할 하나가 필요한 것을 모두 채우지 못할 수 있습니다.'}`)],targetedProduct01?pair(`Share a usable version once it meets the main goal, then use feedback to decide whether any further change matters.`,`주요 목표를 충족한 결과물을 먼저 공유하고, 추가 수정이 필요한지는 피드백을 보고 정합니다.`):undefined,pressure)
  if(targetedProduct01&&plan.kind==='complete')out.social.lines=out.social.lines.filter(line=>!line.en.includes(plainReadingText(personal.strength))&&!line.ko.includes(pk.strength))
  put('patterns',[],pair('Separate a possible work change from a private-life change before treating either as a verdict on your whole life.','일에서의 변화와 사적인 관계의 변화를 나누어 본 뒤 인생 전체에 대한 판단과 구분합니다.'),pair('A change signal identifies an area to examine, rather than an event that must happen.','변화 신호는 살펴볼 영역을 가리키며 반드시 일어날 사건을 정하지 않습니다.'))
  const lifeYearRows=purchaseYears(plan.first,plan.referenceYear,'life',10,true)
  const lifeYearReadings=lifeYearRows.map(row=>{
   const year=row.date.slice(0,4),pillar=row.yearPillar,theme=LANGUAGE[row.god]
   const line=(suffix:string)=>row.lines.find(item=>item.id.endsWith('.'+suffix))?.en
   const dayChange=line('change-day'),monthChange=line('change-month'),opening=line('opening'),connection=line('connection'),background=line('background-pressure')
   const natalLinks=row.comparisons.filter(item=>[1,2].includes(item.index)).flatMap(item=>item.found.map(pattern=>`${POSITION[item.index]} ${pattern.type}`))
   const why=`The ${pillar} reference brings ${theme.name.en} through its stem and ${LANGUAGE[row.innerGod].name.en} underneath; ${natalLinks.length?`its checked links to your birth chart are ${[...new Set(natalLinks)].join(' and ')}.`:'no direct friction is recorded against your day or month pillar at this comparison.'}`
   const main= `${year}: Main theme — ${theme.name.en}.`
   const careerMoney=`Career & money — ${theme.work.en} ${theme.money.en}`
   const love=`Love & relationships — ${theme.love.en}${dayChange?` ${dayChange}`:' No direct day-pillar friction is recorded at this annual comparison.'}`
   const opportunity=`Opportunity — ${opening??connection??`No distinct paid-work opening is established here. A practical step that fits this theme is to ${PERIOD_VOICE[row.god].action.en[0].toLowerCase()+PERIOD_VOICE[row.god].action.en.slice(1)}`}`
   const watch=`Caution — ${monthChange??background??theme.pressure.en}`
   return pair(`${main} ${careerMoney} ${love} ${opportunity} ${watch} Why — ${why}`,`${year}년: 중심 주제 — ${theme.name.ko}. 직업·재물 — ${theme.work.ko} ${theme.money.ko} 연애·관계 — ${theme.love.ko}${dayChange?` ${row.lines.find(item=>item.en===dayChange)?.ko??''}`:' 이 연간 비교에서 일지와 직접적인 마찰은 확인되지 않습니다.'} 기회 — ${row.lines.find(item=>item.en===opening)?.ko??row.lines.find(item=>item.en===connection)?.ko??`분명한 유료 업무 통로가 확인되지 않아, 이 주제에 맞는 실천은 ${PERIOD_VOICE[row.god].action.ko}`} 주의 — ${row.lines.find(item=>item.en===monthChange)?.ko??row.lines.find(item=>item.en===background)?.ko??theme.pressure.ko} 근거 — ${pillar}의 천간은 ${theme.name.ko}, 지지 안쪽의 중심 기운은 ${LANGUAGE[row.innerGod].name.ko}이며 ${natalLinks.length?`출생 차트와 ${[...new Set(natalLinks)].join('·')} 관계가 확인됩니다.`:'일지·월지와 직접적인 마찰은 확인되지 않습니다.'}`)
  })
  put('next-moves',lifeYearReadings,pair('Choose one change from the yearly timeline, then check its work, money and home demands against the longer period.','연간 흐름에서 변화 하나를 고르고 그때의 일·돈·가정의 요구를 긴 흐름과 함께 확인합니다.'),moneyWatch)
  const currentCycle=plan.selectedCycles[0]
  const nextCycle=plan.selectedCycles[1]
  const cycleDate=(cycle:typeof nextCycle)=>cycle?humanMonth(cycle.start):''
  const currentCycleSummary=currentCycle?`Your current longer cycle began around ${cycleDate(currentCycle)} and emphasises ${LANGUAGE[currentCycle.stemGod].name.en}${currentCycle.stemGod!==currentCycle.branchGod?` with ${LANGUAGE[currentCycle.branchGod].name.en} in daily life`:''}.`:''
  const nextCycleSummary=nextCycle?`Around ${cycleDate(nextCycle)}, the next cycle shifts that emphasis towards ${LANGUAGE[nextCycle.stemGod].name.en}${nextCycle.stemGod!==nextCycle.branchGod?` and ${LANGUAGE[nextCycle.branchGod].name.en} in daily life`:''}.`:'No next cycle start falls within the selected comparison range.'
  const relationshipFocus=relationshipYears.length?`Distinct relationship themes appear in ${relationshipYears.slice(0,3).map(row=>row.year).join(', ')}; the chapter explains what connects each year to your chart.`:'The next-ten-year checks do not single out a relationship year; your birth-chart relationship pattern is the clearer guide.'
  const relationshipFocusKo=relationshipYears.length?`관계 주제가 두드러지는 해는 ${relationshipYears.slice(0,3).map(row=>row.year).join(', ')}년이며, 각 해가 명식과 어떻게 연결되는지 연애 장에 설명했습니다.`:'앞으로 10년 비교에서 특정 관계 시기는 두드러지지 않으며 타고난 관계 구조를 중심으로 봅니다.'
  const pressureSummary=personal.pressure.replace(/\*\*/g,'').replace(/^([A-Z])/,(letter:string)=>letter.toLowerCase()).replace(/[.!?]$/,'')
  const moneyGods=[...new Set([...p.visibleMoney.map(item=>item.god),...p.hiddenMoney.map(item=>item.god)])]
  const moneyMarkers=moneyGods.map(god=>{const visible=p.visibleMoney.some(item=>item.god===god),hidden=p.hiddenMoney.some(item=>item.god===god);return `${LANGUAGE[god].name.en} ${visible&&hidden?'in visible and hidden positions':visible?'in visible positions':'in hidden positions'}`})
  const moneyMarkersKo=moneyGods.map(god=>{const visible=p.visibleMoney.some(item=>item.god===god),hidden=p.hiddenMoney.some(item=>item.god===god);return `${LANGUAGE[god].name.ko}${visible&&hidden?'이 겉과 숨은 위치에':visible?'이 겉으로 드러난 위치에':'이 숨은 위치에'}`})
  const moneyConclusion=moneyMarkers.length?moneyMarkers.join(' and '):'no direct money marker in the checked positions'
  const workConclusion=p.monthStemGod===p.monthBranchGod?`${m.name.en} in both the public role and daily work`:`${m.name.en} in the public role, with ${inner.name.en} shaping daily work`
  const workConclusionKo=p.monthStemGod===p.monthBranchGod?`겉으로 드러난 역할과 일상 업무 모두 ${m.name.ko}이 중심입니다`:`겉으로 드러난 역할은 ${m.name.ko}, 일상 업무에는 ${inner.name.ko}이 더해집니다`
  const moneyRouteSummary=regularRoute&&opportunityRoute
   ? `Both steady-resource and opportunity-money signs are present, supporting a mixed route: a dependable base alongside customer, project or deal income.`
   : regularRoute
    ? `Steady-resource signs are clearer than opportunity-money signs, so repeat work or regular pay has the more direct chart support.`
    : opportunityRoute
     ? `Opportunity-money signs are clearer than steady-resource signs, so customer, project or deal income has the more direct chart support.`
     : `The checked positions do not show a direct money route clearly enough to favour salary or business; the actual work and terms matter more than an invented chart verdict.`
  const moneyRouteSummaryKo=regularRoute&&opportunityRoute
   ? '안정적인 재물과 기회성 재물이 함께 있어 고정 기반에 고객·프로젝트·거래 수입을 더하는 방식으로 읽힙니다.'
   : regularRoute
    ? '기회성 재물보다 안정적인 재물의 근거가 분명해 반복 업무나 고정 수입 쪽에 더 직접적인 근거가 있습니다.'
    : opportunityRoute
     ? '안정적인 재물보다 기회성 재물의 근거가 분명해 고객·프로젝트·거래 수입 쪽에 더 직접적인 근거가 있습니다.'
     : '확인한 위치에는 직접적인 재물 통로가 뚜렷하지 않아 급여와 사업 중 하나를 명식만으로 고르지 않습니다. 실제 업무와 계약 조건을 봐야 합니다.'
  const currentCycleSummaryKo=currentCycle?`현재 대운은 ${cycleDate(currentCycle)} 무렵 시작했고 ${LANGUAGE[currentCycle.stemGod].name.ko}${currentCycle.stemGod!==currentCycle.branchGod?`과 일상의 ${LANGUAGE[currentCycle.branchGod].name.ko}`:''}을 강조합니다.`:''
  const nextCycleSummaryKo=nextCycle?`${cycleDate(nextCycle)} 무렵에는 다음 대운으로 바뀌며 ${LANGUAGE[nextCycle.stemGod].name.ko}${nextCycle.stemGod!==nextCycle.branchGod?`과 일상의 ${LANGUAGE[nextCycle.branchGod].name.ko}`:''} 쪽으로 중심이 옮겨갑니다.`:'선택한 비교 범위 안에 다음 대운 시작은 없습니다.'
  const finalSynthesis=targetedProduct01?pair(`Your chart keeps three questions separate: ${personal.focus} describes your personal starting point; ${p.monthStemGod===p.monthBranchGod?'the month repeats one theme in the public role and daily duties':`the public role centres on ${m.name.en}, while daily duti…9309 tokens truncated… 말과 안내, 이해받는 느낌이 끌림의 한 부분일 수 있습니다.'),
   偏印:pair('The attraction may be feeling understood in a way that is hard to explain to everyone else.','다른 사람에게 설명하기 어려운 부분까지 이해받는 느낌이 끌림의 한 부분일 수 있습니다.'),
  }
  const dayPair=plan.pairPatterns.find(c=>c.left==='day'&&c.right==='day')!,routinePair=plan.pairPatterns.find(c=>c.left==='month'&&c.right==='month')!
  const isFriction=(row:typeof dayPair)=>row.patterns.some(c=>['沖','刑','害','破'].includes(c.type)),isLink=(row:typeof dayPair)=>row.patterns.some(c=>c.type==='合')
  const pairVerdict=isFriction(dayPair)?pair(isLink(routinePair)?'This is a match where sharing everyday tasks may come more easily than making private choices together. The day-branch friction and month-branch link point to different strengths, rather than one overall compatibility score.':'This relationship needs room for separate private choices. The day branches form a friction pattern, so closeness does not remove the difference in how you want to live.',isLink(routinePair)?'함께 일상을 운영하는 것보다 사적인 선택을 맞추는 데 더 조정이 필요한 궁합입니다. 일지의 마찰과 월지의 연결을 구분해 읽습니다.':'가까워져도 개인적으로 선택할 여지를 남겨야 하는 궁합입니다. 일지에 마찰이 있어 친밀함만으로 생활 방식의 차이가 없어지는 것은 아닙니다.'):isLink(dayPair)?pair(isFriction(routinePair)?'Private closeness is a clearer strength than sharing a daily routine. The day branches link, while the month branches show friction: feeling drawn together and agreeing who does what are separate questions.':'The private-life comparison gives a basis for shared plans: the day branches form a link. This describes a way the two charts connect, while each person’s needs still shape how it works.',isFriction(routinePair)?'사적인 친밀감이 일상 운영보다 더 분명한 강점인 궁합입니다. 일지는 연결되지만 월지에는 마찰이 있어 끌림과 업무 분담을 나누어 읽습니다.':'일지가 연결되어 함께할 계획을 살펴볼 근거가 있는 궁합입니다. 연결이 실제로 어떻게 이어질지는 서로 원하는 배려도 함께 봅니다.'):pair('Neither a strong private-life link nor a direct conflict appears between the day branches. The clearest answer comes from comparing each person’s needs below; this comparison alone cannot call the match easy or difficult.','일지끼리 강한 연결이나 직접적인 마찰이 나타나지 않습니다. 이 비교만으로 편하거나 어려운 궁합이라 정하지 않고 아래에서 각자가 원하는 배려의 차이를 중심으로 읽습니다.')
  const directions=[pair('From your side: '+perspective[plan.directions!.aToB].en,'본인의 관점: '+perspective[plan.directions!.aToB].ko),pair('From your partner’s side: '+perspective[plan.directions!.bToA].en,'상대방의 관점: '+perspective[plan.directions!.bToA].ko),pair('The two day-of-birth signs are compared in both directions, which is why each person can experience this connection differently.','태어난 날의 두 글자를 양쪽 방향에서 비교하므로 같은 관계도 서로 다르게 경험하는 쪽으로 읽습니다.')]
  put('two-styles',[pair(sharedCareNeed(p.dayBranch,b.dayBranch)?`This match shares a similar need for care, expressed in different ways: you value ${RELATIONSHIP_PROFILES[p.dayBranch].need}; your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. This is common ground, but both of you can end up waiting for the other to provide it.`:`This match asks for different kinds of care: you value ${RELATIONSHIP_PROFILES[p.dayBranch].need}, while your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. Both needs have to be heard for the connection to feel balanced.`,sharedCareNeed(p.dayBranch,b.dayBranch)?`비슷한 배려를 원하는 궁합입니다. 본인은 ${NEED[p.dayBranch]}, 상대방은 ${NEED[b.dayBranch]}을 원합니다. 공통점이 있지만 서로 먼저 챙겨 주기만을 기다릴 수 있습니다.`:`서로 다른 배려를 원하는 궁합입니다. 본인에게 중요한 것은 ${NEED[p.dayBranch]}입니다. 상대방은 ${NEED[b.dayBranch]}입니다. 두 필요를 모두 들을 때 균형을 맞추기 쉽습니다.`),pairVerdict],undefined,relationshipWatch)
  put('two-directions',[...directions,plan.directions!.aToB===plan.directions!.bToA?pair('Both directions have the same theme, but that does not establish equal feelings or equal effort.','양쪽의 주제가 같아도 감정과 노력의 양이 같다는 뜻은 아닙니다.'):pair('One person may feel supported while the other feels challenged. Neither perspective on its own describes the whole relationship.','한 사람은 도움으로 느끼는 것을 다른 사람은 도전으로 느낄 수 있습니다. 한쪽 관점만으로 관계 전체를 설명하지 않습니다.')],undefined,relationshipWatch)
  put('close-conversation',[pair(sharedCareNeed(p.dayBranch,b.dayBranch)?'You can want the same care and still wait for the other person to offer it first.':'The difference is how each of you recognises care: the same helpful act can meet one person’s need while missing the other’s.',sharedCareNeed(p.dayBranch,b.dayBranch)?'같은 배려를 원하면서도 서로 상대가 먼저 해 주기를 기다릴 수 있습니다.':'차이는 배려를 받아들이는 방식에 있습니다. 같은 도움이 한 사람에게는 맞아도 다른 사람의 필요는 놓칠 수 있습니다.'),relationshipRepair(p,b),needs,aFriction,bFriction,meeting('day'),pair(`Your likely friction is ${RELATIONSHIP_PROFILES[p.dayBranch].friction}; your partner’s is ${RELATIONSHIP_PROFILES[b.dayBranch].friction}.`,`A가 살필 마찰은 ${PRIVATE_FRICTION_KO[p.dayBranch]}이며 B는 ${PRIVATE_FRICTION_KO[b.dayBranch]}입니다.`)],undefined,relationshipWatch)
  put('shared-routine',[meeting('month'),pair('Your everyday pattern: '+LANGUAGE[p.monthBranchGod].balance.en,'본인의 일상: '+LANGUAGE[p.monthBranchGod].balance.ko),pair('Your partner’s everyday pattern: '+LANGUAGE[b.monthBranchGod].balance.en,'상대방의 일상: '+LANGUAGE[b.monthBranchGod].balance.ko)],pair('Give recurring tasks a clear owner and compare private preferences separately from running a day together.','반복 업무의 담당자를 분명히 하고 개인적 취향과 함께 일상을 운영하는 일을 나누어 비교합니다.'),relationshipWatch)
  put('shared-money',[pair('Your earning style: '+moneyPassage(p).en,'A의 재물: '+moneyPassage(p).ko),pair('Your partner’s earning style: '+moneyPassage(b).en,'B의 재물: '+moneyPassage(b).ko),pair('From your side: '+ag.money.en,'A의 관점: '+ag.money.ko),pair('From your partner’s side: '+bg.money.en,'B의 관점: '+bg.money.ko)],pair('Decide whether money is a gift, a loan or a shared expense before committing it.','돈을 약속하기 전에 선물인지 대여인지 공동 비용인지 구분합니다.'),moneyWatch)
  put('chart-patterns',[pair(`The likely tension for you is ${ag.pressure.en.replace(/^The blind spot is /,'').replace(/\.$/,'')}. Your partner’s pressure point is ${bg.pressure.en.replace(/^The blind spot is /,'').replace(/\.$/,'')}.`,`본인이 살필 점: ${ag.pressure.ko} 상대방이 살필 점: ${bg.pressure.ko}`),meeting('day'),meeting('month'),pair('Private closeness and a workable daily routine can differ. Neither a combination nor a clash is a score for the relationship or a prediction of its outcome.','사적인 친밀감과 일상을 맞추는 정도는 다를 수 있습니다. 합이나 충은 관계 점수나 결과의 예측이 아닙니다.')],undefined,relationshipWatch)
  const aYears=purchaseYears(plan.first,plan.referenceYear,'love',5),bYears=purchaseYears(plan.second!,plan.referenceYear,'love',5)
  put('support-each-other',[pair('The next five years can ask different things of each of you. Compare each year as two personal timelines, not a shared event forecast.','앞으로 5년은 두 사람에게 서로 다른 것을 요구할 수 있습니다. 같은 사건의 예측이 아니라 각자의 흐름을 함께 비교합니다.'),...aYears.flatMap((a,i)=>[pair(`You — ${a.lines[0].en.split(' — ')[0]} — ${LANGUAGE[plan.annual[i].god].love.en}`,`본인 — ${a.date.slice(0,4)}년 — ${LANGUAGE[plan.annual[i].god].love.ko}`),pair(`Your partner — ${bYears[i].lines[0].en.split(' — ')[0]} — ${LANGUAGE[plan.partnerAnnual[i].god].love.en}`,`상대방 — ${a.date.slice(0,4)}년 — ${LANGUAGE[plan.partnerAnnual[i].god].love.ko}`),...a.lines.filter(l=>l.id.endsWith('change-day')).map(l=>pair(a.date.slice(0,4)+' — for you: '+l.en,a.date.slice(0,4)+'년 — 본인: '+l.ko)),...bYears[i].lines.filter(l=>l.id.endsWith('change-day')).map(l=>pair(a.date.slice(0,4)+' — for your partner: '+l.en,a.date.slice(0,4)+'년 — 상대방: '+l.ko))])],undefined,relationshipWatch)
  put('shared-week',[pair(`This match asks you to make room for ${bg.name.en}, and your partner to make room for ${ag.name.en}. Understanding the difference is more useful than a compatibility percentage.`,`이 관계에서는 A가 ${bg.name.ko}, B가 ${ag.name.ko}을 받아들일 여지를 살핍니다. 궁합 점수보다 그 차이를 이해하는 데 의미가 있습니다.`),needs,ag.pressure,bg.pressure,meeting('day'),meeting('month')],undefined,relationshipWatch)
 }
 if(!plan.selectedCycles.length && ['career','business','complete'].includes(plan.kind)){const id=plan.kind==='career'?'work-chapters':plan.kind==='business'?'business-chapters':'next-moves';out[id].lines.unshift(pair(`No current or upcoming ten-year period is available for ${plan.referenceYear} in the calculated range. The yearly comparisons below do not invent a longer period.`,`${plan.referenceYear}년에 해당하거나 앞으로 시작할 긴 흐름이 계산 범위에 없습니다. 아래의 연간 비교로 없는 긴 시기를 만들어 넣지 않습니다.`))}
 const scope=plan.kind==='wellbeing'?pair('This reading describes temperament, not a medical assessment.','기질을 설명하는 풀이이며 의학적 평가가 아닙니다.'):plan.kind==='compatibility'?pair('The relationship timeline compares each person’s own year; it does not identify a shared event date.','관계의 시기 풀이는 각자의 연간 흐름을 비교하며 두 사람의 사건 날짜를 정하지 않습니다.'):plan.kind==='year'?pair('The annual reading uses 15 July and monthly readings use the 15th; a calendar month can cross a seasonal boundary.','연간 풀이는 7월 15일, 월별 풀이는 매달 15일을 기준으로 하며 한 달 안에 계절 경계를 지날 수 있습니다.'):pair('The yearly timeline uses a mid-July comparison; ten-year chapters have their own calculated start dates.','연간 흐름은 7월 중순을 비교하며 긴 시기의 시작일은 별도로 계산합니다.')
 const notice=pair(`About this reading: traditional birth-chart interpretation, not guaranteed outcomes. ${scope.en} Reference dates and source details are in your calculation sheet.`,`풀이 안내: 전통적인 출생 사주를 해석하며 결과를 보장하지 않습니다. ${scope.ko} 기준일과 상세 근거는 계산 자료에서 확인할 수 있습니다.`)
 const firstSection=out[plan.sections[0].id]
 if(['complete','wellbeing'].includes(plan.kind))firstSection.lines.push(pressure)
 firstSection.lines=firstSection.lines.filter(l=>l.en!==noOutcome.en)
 if(plan.includeReadingNotice)firstSection.lines.push(notice)
 const cautions:Record<string,Passage>={
 social:pair('The pressure point is not having the strength; it is feeling required to use it in every situation.','강점이 있다는 것보다 모든 상황에서 그 강점을 써야 한다고 느끼는 점이 부담입니다.'),
 'offer-test':pair('A wide first offer can tie up delivery time before you know which part customers value.','첫 상품의 범위가 넓으면 고객이 무엇을 원하는지 알기 전에 납품 시간이 묶일 수 있습니다.'),
 'team-decisions':pair('A partner can add a useful skill while leaving decision-making or ownership unclear.','동업자가 필요한 기술을 더해도 결정권과 소유권은 불분명하게 남을 수 있습니다.'),
 'customer-communication':pair('More sales channels can multiply delivery promises before the business can repeat the same result.','같은 결과를 반복할 역량이 갖춰지기 전에 판매 경로만 늘면 납품 약속이 커질 수 있습니다.'),
 'two-work-layers':pair('A promising title can hide a daily routine that gives you too little control over the result.','좋아 보이는 직함 뒤에 결과를 조정할 권한이 부족한 일상이 있을 수 있습니다.'),
 'proof-of-skill':pair('A more respected title can add responsibility without changing pay or decision-making power.','인정받는 직함이 늘어도 급여와 결정권은 달라지지 않을 수 있습니다.'),
 'feedback-and-boundaries':pair('Moving employer may leave the same pressure in place if the duties and authority do not change.','직장이 바뀌어도 업무와 권한이 같다면 같은 부담이 남을 수 있습니다.'),
 'work-chapters':pair('Read each year for the named activity; a useful work opening can still be demanding in private life.','각 해의 설명은 해당 활동에 맞춰 읽습니다. 업무 기회가 있어도 사적인 생활에는 부담이 될 수 있습니다.'),
 'business-chapters':pair('An increase in orders can come before the cash or staffing needed to complete them.','주문이 늘어도 마칠 때 필요한 현금이나 인력은 나중에 마련될 수 있습니다.'),
 'business-plan':pair('Several commitments can fall due together even when each looks manageable on its own.','하나씩 감당할 수 있어 보여도 여러 약속의 기한이 겹칠 수 있습니다.'),
 'next-moves':pair('A turning point is a change of focus, not a promise that every part of life changes at once.','전환점은 중심 주제의 변화이며 인생의 모든 부분이 동시에 바뀐다는 약속이 아닙니다.'),
 'two-directions':pair('Feeling drawn to someone and wanting the same kind of relationship are different questions.','서로 끌리는 것과 같은 관계를 원하는 것은 다른 질문입니다.'),
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
 if(targetedProduct01)CACHE.set(plan,out);return out
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
  pair(`The career report adds a separate money check: ${p.visibleMoney.length ? p.visibleMoney.map(item=>LANGUAGE[item.god].name.en).join(' and ') : p.hiddenMoney.length ? 'money signs appear in less visible chart positions' : 'the checked positions do not show a direct money sign'}. The personal love report adds your private relationship need of ${RELATIONSHIP_PROFILES[p.dayBranch].need}; neither question is answered by the other report.`,`직업·재물 리포트에서는 ${p.visibleMoney.length ? p.visibleMoney.map(item=>LANGUAGE[item.god].name.ko).join('·') : p.hiddenMoney.length ? '덜 드러나는 명식 자리에 재물 글자' : '확인한 자리에는 직접 재물 글자가 뚜렷하지 않음'}을 별도로 살핍니다. 개인 연애 리포트에서는 ${NEED[p.dayBranch]}이라는 사적인 관계의 필요를 봅니다. 한 리포트가 다른 질문의 답을 대신하지 않습니다.`),
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
