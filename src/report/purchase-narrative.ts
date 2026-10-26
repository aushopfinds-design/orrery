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
 const p=plan.primary,m=LANGUAGE[p.monthStemGod],inner=LANGUAGE[p.monthBranchGod],day=LANGUAGE[p.dayBranchGod],personal=PERSONAL_PROFILES[p.dayStem],pk=PERSONAL_KO[p.dayStem]
 const answer=BUYER_ANSWERS[p.monthStemGod], dailyAnswer=BUYER_ANSWERS[p.monthBranchGod]
 const timing=purchaseTimingSections(plan),out:Record<string,CustomerSection>={}
 const strength=pair(personal.strength,pk.strength),pressure=pair(personal.pressure,pk.pressure)
 const ownNeed=pair(`You tend to need ${personal.need}.`,`개인적으로 필요한 것은 ${pk.need}입니다.`)
 const publicRole=pair(`Your work side centres on ${m.name.en}. Start with a role that makes use of this strength.`,`일에서는 ${m.name.ko}이 중심입니다. 이 강점을 쓰는 역할부터 살핍니다.`)
 const underneath=p.monthStemGod===p.monthBranchGod?pair('The same work theme appears in both parts of your birth-month reading. That can make it a persistent way of handling work, rather than a temporary mood.','태어난 달의 두 부분에 같은 업무 주제가 반복됩니다. 일시적인 기분보다 일하는 방식에서 계속 나타날 수 있는 특징으로 읽습니다.'):pair(`Your everyday duties add ${inner.name.en}. Check that the job gives you time for both the visible result and the work behind it.`,`매일 맡는 일에는 ${inner.name.ko}이 더해집니다. 겉으로 보이는 결과와 그 뒤의 업무를 함께 해낼 시간이 있는지 확인합니다.`)
 const closeNeed=pair(`In close relationships, your chart points to a need for ${RELATIONSHIP_PROFILES[p.dayBranch].need}.`,`가까운 관계에서 원하는 것은 ${NEED[p.dayBranch]}입니다.`)
 const closeFriction=pair(`A recurring difficulty may be ${RELATIONSHIP_PROFILES[p.dayBranch].friction}.`,`가까운 관계에서 반복될 수 있는 어려움은 ${PRIVATE_FRICTION_KO[p.dayBranch]}입니다.`)
 const capacity=capacityPassage(plan.primary)
 const money=moneyPassage(plan.primary)
 const noOutcome=pair('This is a traditional reading of your birth details, rather than a measured personality test or a prediction of events. The examples describe how the pattern may show up.','출생 정보를 바탕으로 한 전통 풀이이며 성격 검사 수치나 사건 예측은 아닙니다. 예시는 그 특징이 생활에서 나타날 수 있는 모습을 설명합니다.')
 const put=(id:string,lines:Passage[],action:Passage|undefined=undefined,caution=m.pressure)=>{
  action ??= QUESTION_ACTIONS[id] ?? pair('Compare the stated pattern with the actual situation before making a major commitment.','큰 약속을 하기 전에 설명한 특징을 실제 상황과 비교합니다.')
  const added=timing[id]?.lines.filter(l=>!id.startsWith('month-')||!l.id.endsWith('.caution')&&!l.id.endsWith('.capacity')).map(l=>pair(l.en,l.ko))??[]
  const seen=new Set<string>();const all=(['money-commitments','offer-test','proof-of-skill','customer-communication'].includes(id)?[...lines,...added]:[...added,...lines]).map(clone).filter(l=>{if(seen.has(l.en))return false;seen.add(l.en);return true})
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
  put('career',[lifeWork(p),publicRole,underneath],keepWork,m.pressure)
  put('love',[closeNeed,day.love,closeFriction,pair('Your work habits and private needs are different parts of the reading. Being effective at work does not mean the same response will feel caring at home.','업무 습관과 사적인 필요는 다른 부분으로 읽습니다. 직장에서 효과적인 대응이 집에서도 배려로 느껴진다는 뜻은 아닙니다.')],pair('Say what form of care you want, and ask what the other person wants rather than assuming it is the same.','원하는 배려를 말하고 상대에게도 물어봅니다. 서로 같은 배려를 원한다고 가정하지 않습니다.'),relationshipWatch)
  put('social',[pair(`The strength that helps you can also become your pressure point: ${m.balance.en}`,`도움이 되는 강점이 부담의 출발점이 될 수도 있습니다. ${m.balance.ko}`),pair(`Your birth day describes your personal style; the birth month shows how that style meets everyday demands. ${p.monthStemGod===p.monthBranchGod?'The same demand appears in both parts of the month, making it a recurring theme.':'The two parts of the month show different demands, so one role may not meet all your needs.'}`,`태어난 날에서는 개인 성향을, 태어난 달에서는 그 성향이 일상의 요구와 만나는 방식을 읽습니다. ${p.monthStemGod===p.monthBranchGod?'달의 두 부분에 같은 요구가 있어 반복되는 주제로 봅니다.':'달의 두 부분에 다른 요구가 있어 역할 하나가 필요한 것을 모두 채우지 못할 수 있습니다.'}`)],undefined,pressure)
  put('patterns',[],pair('Separate a possible work change from a private-life change before treating either as a verdict on your whole life.','일에서의 변화와 사적인 관계의 변화를 나누어 본 뒤 인생 전체에 대한 판단과 구분합니다.'),pair('A change signal identifies an area to examine, rather than an event that must happen.','변화 신호는 살펴볼 영역을 가리키며 반드시 일어날 사건을 정하지 않습니다.'))
  put('next-moves',[],pair('Choose one change from the yearly timeline, then check its work, money and home demands against the longer period.','연간 흐름에서 변화 하나를 고르고 그때의 일·돈·가정의 요구를 긴 흐름과 함께 확인합니다.'),moneyWatch)
 }
 if(plan.kind==='career'){
  put('working-style',[...work,capacityBasis(p)],pair('Ask to see a normal week of tasks before accepting a role. Choose work that pays for the strength described above.','직장을 정하기 전에 평소 한 주의 업무를 확인합니다. 위에서 설명한 강점으로 보상받는 일을 고릅니다.'),m.pressure)
  put('two-work-layers',[answer.workplace,p.monthStemGod===p.monthBranchGod?pair('The outward role and the everyday work repeat the same theme. A title that promises one kind of work but delivers another is therefore an important mismatch to notice.','겉으로 보이는 역할과 매일 하는 일이 같은 주제를 반복합니다. 직함이 약속한 일과 실제 업무가 다르면 특히 맞지 않는 부분이 될 수 있습니다.'):pair(`Your public role points to ${m.name.en}, but daily tasks add ${inner.name.en}. A suitable job needs room for both.`,`겉으로 보이는 역할은 ${m.name.ko}이고 매일의 업무에는 ${inner.name.ko}이 더해집니다. 맞는 직장은 두 요구를 함께 담을 수 있어야 합니다.`),...(p.monthStemGod!==p.monthBranchGod?[dailyAnswer.workplace]:[])],pair('Compare the advertised role with the tasks you would actually do each week.','채용 공고의 역할과 매주 실제로 할 일을 비교합니다.'),inner.pressure)
  put('feedback-and-boundaries',[pair(`The work pressure you may carry into a new role is ${m.name.en}.`, `새 직장에서도 반복될 수 있는 업무 주제는 ${m.name.ko}입니다.`),m.pressure],keepWork,m.pressure)
  put('proof-of-skill',[answer.recognition],pair('For a larger role, compare the real authority, workload and pay before accepting the title.','더 큰 역할에서는 직함을 받기 전에 실제 권한과 업무량, 보상을 비교합니다.'),m.pressure)
  put('money-commitments',[moneyPassage(p,'career'),moneyBasis(p),moneyDepth(p,'career'),capacityBasis(p),pair('For an actual role, compare confirmed pay and expected hours with variable fees, necessary costs and extra duties. A larger role is not necessarily better paid.','실제 자리에서는 확정 급여와 예상 근무 시간을 변동 수수료와 필요한 비용, 추가 업무와 함께 비교합니다. 역할이 커진다고 보상이 반드시 좋아지는 것은 아닙니다.')],practicalMoney,moneyWatch)
  put('work-chapters',[],pair('Compare a real opportunity with the specific year and the longer period it falls within.','실제 기회를 해당 연도와 그때의 긴 흐름에 함께 대조합니다.'),moneyWatch)
  put('career-plan',[pair(`Your career can become harder when the strength in your work style turns into a repeated obligation. ${m.balance.en}`,`업무 방식의 강점이 반복되는 의무로 바뀔 때 직업에서 어려움이 커질 수 있습니다. ${m.balance.ko}`),pressure,pair('A different employer may leave the same difficulty in place if the duties and authority stay the same.','고용주가 바뀌어도 업무와 권한이 같다면 같은 어려움이 남을 수 있습니다.'),capacity],pair('Check whether a new title would actually change the repeated source of pressure in your work.','새 직함이 업무에서 반복되는 부담의 원인을 실제로 바꾸는지 살핍니다.'),m.pressure)
 }
 if(plan.kind==='business'){
  put('founder-style',[...business,capacityBasis(p)],pair('Compare the business model with who will buy, what they receive and what you can reliably deliver.','누가 구매하고 무엇을 받는지, 꾸준히 제공할 수 있는 것이 무엇인지와 사업 방식을 비교합니다.'),m.pressure)
  put('offer-test',[answer.launch],pair('Define what the first paying customer receives and the time, cost and support needed to deliver it.','첫 유료 고객에게 무엇을 제공하며 이를 위해 필요한 시간과 비용, 도움은 무엇인지 정합니다.'),m.pressure)
  put('team-decisions',[partnerVerdict(p),LANGUAGE[p.yearStemGod].business,pair(`This compares the part of your chart used for wider contacts with the work style described above. It describes your side of a partnership; the other person needs a separate reading.`,`사주에서 주변 사람들과 연결해 읽는 부분을 자신의 ${m.name.ko} 사업 방식과 함께 본 풀이입니다. 자신이 동업에 가져가는 특징이며 상대방은 별도 풀이가 필요합니다.`)],pair('Separate ownership, decision rights, income and the work each partner actually carries.','소유권과 결정권, 수입, 각 동업자가 실제로 맡는 일을 나누어 정합니다.'),LANGUAGE[p.yearStemGod].pressure)
  put('delivery-capacity',[moneyPassage(p,'business'),moneyBasis(p),moneyDepth(p,'business'),capacityBasis(p)],practicalMoney,moneyWatch)
  put('customer-communication',[answer.grow,dailyAnswer.launch],pair('Before expanding, agree with the customer on the deadline, revision limits, payment terms and who handles follow-up.','확장하기 전에 고객과 기한과 수정 범위, 대금 조건, 후속 업무의 담당자를 정합니다.'),m.pressure)
  put('business-chapters',[],pair('Read each commercial opening alongside the actual capacity, costs and longer-period background named for that year.','거래 기회를 그해에 설명한 역량과 비용, 긴 흐름의 배경과 함께 읽습니다.'),moneyWatch)
  put('business-plan',[m.pressure,inner.pressure],pair('Before a larger commitment, identify which deadline, payment term or shared duty could make the named pressure harder to manage.','더 큰 약속을 하기 전에 어떤 기한과 대금 조건, 공동 의무가 설명한 부담을 키울 수 있는지 살핍니다.'),moneyWatch)
 }
 if(plan.kind==='complete'||plan.kind==='wellbeing'){
  const elements=pair(`The visible chart contains ${p.elements.map(x=>`${x.count} ${x.element}`).join(', ')}. These are counts of signs, not strength, ability or health scores.`,`겉으로 드러난 글자의 개수는 ${p.elements.map(x=>`${ELEMENT[x.element]} ${x.count}`).join(', ')}입니다. 기운의 세기나 능력, 건강의 점수가 아닙니다.`)
  const missing=p.elements.filter(x=>!x.count)
  const absence=missing.length?pair(`${missing.map(x=>x.element).join(' and ')} ${missing.length===1?'does':'do'} not appear in this visible count. That does not mean you lack an ability or need to buy, eat or wear something to correct it.`,`${missing.map(x=>ELEMENT[x.element]).join('·')}이 이 개수에 나타나지 않습니다. 어떤 능력이 없거나 물건·음식·옷으로 고쳐야 한다는 뜻은 아닙니다.`):pair('All five appear in the visible count. That does not establish an evenly balanced life or good health.','다섯 가지가 모두 개수에 나타납니다. 생활이 고르게 균형 잡혔거나 건강이 좋다는 판정은 아닙니다.')
  put(plan.kind==='complete'?'balance':'visible-elements',[elements,capacityBasis(p),absence,m.balance,...(p.monthStemGod!==p.monthBranchGod?[inner.balance]:[]),ownNeed],pair('Use the descriptions to name habits and demands you recognise in an ordinary day.','평범한 하루에서 알아볼 수 있는 습관과 요구를 설명과 비교합니다.'),noHealth)
 }
 if(plan.kind==='wellbeing'){
  put('workload-rhythm',[pair(`Your pressure is often the cost of doing something you are good at. ${m.balance.en}`,`잘하는 일을 계속해야 하는 데서 부담을 살핍니다. ${m.balance.ko}`),pair(`The birth-month pattern repeats ${m.name.en}${p.monthStemGod===p.monthBranchGod?' in both its outward and inner roles':`, while its inner role adds ${inner.name.en}`}. This is the setting in which the pressure is read, rather than a claim that you always behave this way.`,`태어난 달의 특징은 ${m.name.ko}${p.monthStemGod===p.monthBranchGod?'이 겉과 안에 반복됩니다':`이고 안쪽에는 ${inner.name.ko}이 더해집니다`}. 언제나 이렇게 행동한다는 뜻보다 부담이 드러나는 상황의 배경으로 읽습니다.`),...(p.monthStemGod!==p.monthBranchGod?[inner.balance]:[]),ownNeed],pair('Separate workload, interruptions and expectations when deciding what is making a day difficult.','하루가 힘든 이유를 볼 때 업무량과 방해, 기대를 나누어 봅니다.'),noHealth)
  put('support-and-space',[closeNeed,day.love,closeFriction],pair('Name the kind of support you want and the choices you want to keep for yourself.','어떤 도움을 원하는지, 어떤 선택은 스스로 하고 싶은지 말합니다.'),relationshipWatch)
  put('balance-week',[pair(`A strength becomes a blind spot when it crowds out your own needs. For you, that means leaving room for ${personal.need}.`,`강점 때문에 자신의 필요가 밀릴 때 약점으로 바뀝니다. 본인에게는 ${pk.need}을 지킬 여유가 중요합니다.`),pair(personal.balance,PERSONAL_SCENE_KO[p.dayStem].balance),pair('The same strength can become a burden when you have to use it in every situation. This is a way to read temperament, not a medical or psychological assessment.','같은 강점도 모든 상황에서 써야 한다면 부담이 될 수 있습니다. 기질을 읽는 방식이며 의학적·심리학적 평가는 아닙니다.')],pair('Keep one strength you want to use while setting a limit on where it becomes an unwanted duty.','발휘하고 싶은 강점은 살리되 원하지 않는 의무가 되는 지점에는 한계를 정합니다.'),noHealth)
 }
 if(plan.kind==='year'){
  const y=plan.annual[0],yg=LANGUAGE[y.god],yi=LANGUAGE[y.innerGod]
  const annualTheme=pair(`${plan.referenceYear} brings ${yg.name.en}, alongside ${yi.name.en}. Compared with your usual work, which emphasises ${m.name.en}, this ${y.god===p.monthStemGod?'repeats a familiar demand':'adds a different demand'}.`,`${plan.referenceYear}년에는 ${yg.name.ko}, 그리고 ${yi.name.ko}이 나타납니다. 타고난 업무 주제인 ${m.name.ko}과 비교하면 ${y.god===p.monthStemGod?'익숙한 요구가 반복되는':'다른 요구가 더해지는'} 흐름입니다.`)
  put('annual-theme',[annualTheme,yg.work,yi.money,capacity],pair('Compare the changing demands of the selected year with the work and relationship needs that repeat in your birth chart.','선택한 연도의 달라지는 요구와 타고난 일·관계에서 반복되는 필요를 비교합니다.'),yg.pressure)
  put('annual-work',[pair(`${plan.referenceYear}: ${BUYER_ANSWERS[y.god].career.en}`,`${plan.referenceYear}년: ${BUYER_ANSWERS[y.god].career.ko}`),yi.work,publicRole,answer.workplace,yg.pressure],keepWork,yi.pressure)
  const moneyMonths=plan.months.filter(x=>[x.god,x.innerGod].some(g=>['正財','偏財'].includes(g)))
  put('annual-money',[pair(`${plan.referenceYear}: ${yg.money.en}`,`${plan.referenceYear}년: ${yg.money.ko}`),yi.money,moneyBasis(p),pair(moneyMonths.length?`The monthly comparisons with a direct earning-and-money theme are ${moneyMonths.map(x=>humanMonth(x.date)).join(', ')}. They identify financial activity, rather than profitable months.`:'None of the twelve monthly comparisons has a direct money theme. That does not predict no income or financial difficulty.',moneyMonths.length?`직접적인 재물 주제가 나타나는 월별 비교는 ${moneyMonths.map(x=>humanMonth(x.date)).join(', ')}입니다. 재정적인 활동을 가리키며 이익이 나는 달이라는 뜻은 아닙니다.`:'12개 월별 비교에 직접적인 재물 주제가 없습니다. 수입이 없거나 경제적으로 어렵다는 예측은 아닙니다.')],practicalMoney,moneyWatch)
  put('annual-connections',[pair(`${plan.referenceYear}: ${yg.love.en}`,`${plan.referenceYear}년: ${yg.love.ko}`),yi.love,closeNeed,closeFriction],undefined,relationshipWatch)
  put('annual-cycle-context',[],undefined,moneyWatch);put('annual-plan',[],undefined,yg.pressure)
  plan.months.forEach((month,i)=>{const g=LANGUAGE[month.god],inr=LANGUAGE[month.innerGod],action=PERIOD_VOICE[month.god].action;put('month-'+(i+1),[pair('Money: '+g.money.en.split(/(?<=[.!?])\s/)[0]+(month.god!==month.innerGod?` The accompanying theme is ${inr.name.en}; include that demand in the same decision.`:''),'재물: '+g.money.ko+(month.god!==month.innerGod?` 함께 나타나는 ${inr.name.ko}의 요구도 같은 판단에 포함합니다.`:'')),pair('At home: '+inr.love.en.split(/(?<=[.!?])\s/)[0]+(month.god!==month.innerGod?` Make room for this while dealing with ${g.name.en}.`:''),'사적인 관계: '+inr.love.ko+(month.god!==month.innerGod?` ${g.name.ko}을 다루는 동안 이 필요도 지킵니다.`:''))],pair(`In ${humanMonth(month.date)}, ${action.en[0].toLowerCase()+action.en.slice(1)}`,`${Number(month.date.slice(5,7))}월에는 ${action.ko}`),g.pressure)})

 }
 if(plan.kind==='compatibility'){
  const b=plan.partner!, ag=LANGUAGE[plan.directions!.aToB],bg=LANGUAGE[plan.directions!.bToA]
  const needs=pair(`Your private-life need is ${RELATIONSHIP_PROFILES[p.dayBranch].need}. Your partner’s is ${RELATIONSHIP_PROFILES[b.dayBranch].need}. The same gesture may therefore feel different to each of you.`,`A가 원하는 것은 ${NEED[p.dayBranch]}입니다. B가 원하는 것은 ${NEED[b.dayBranch]}입니다. 같은 행동도 서로 다르게 받아들일 수 있습니다.`)
  const aFriction=pair('You: '+LANGUAGE[p.dayBranchGod].love.en,'A: '+LANGUAGE[p.dayBranchGod].love.ko),bFriction=pair('Your partner: '+LANGUAGE[b.dayBranchGod].love.en,'B: '+LANGUAGE[b.dayBranchGod].love.ko)
  const meeting=(position:'day'|'month')=>{const found=plan.pairPatterns.find(c=>c.left===position&&c.right===position)!,clash=found.patterns.some(c=>c.type==='沖'),friction=found.patterns.some(c=>['刑','害','破'].includes(c.type)),combine=found.patterns.some(c=>c.type==='合');return pair(position==='day'?(clash?'Your private-life patterns pull in different directions. Closeness may need more room for separate choices.':friction?'Small differences in private expectations can become recurring irritations. Saying what a gesture means matters here.':combine?'Your private-life patterns link together, giving shared plans a clearer place in this match.':`Neither a direct bond nor a direct conflict stands out in the private-life comparison. Here, the relationship depends more on matching each other’s needs than on one strong linking pattern.`):(clash?'Your everyday routines may clash over pace, schedules or who does what.':friction?'The daily-routine comparison points to repeated small disagreements about tasks or expectations.':combine?'Your everyday patterns link together, which can help with shared routines when duties are agreed.':'The routine comparison has no clear linking or clashing pattern. Compare your actual habits rather than assuming they will match.'),position==='day'?(clash?'사적인 관계의 방식이 서로 다른 방향으로 움직입니다. 가까워져도 각자 선택할 여지가 더 필요할 수 있습니다.':friction?'사적인 기대의 작은 차이가 반복되는 서운함이 될 수 있습니다. 행동에 담은 뜻을 말하는 일이 중요합니다.':combine?'사적인 관계의 방식이 연결되어 함께할 계획을 정하는 주제가 두드러집니다.':'사적인 관계 비교에서 강하게 묶이거나 부딪히는 관계가 두드러지지 않습니다. 한 가지 강한 연결보다 서로의 필요를 맞추는 방식에 무게를 둡니다.'):(clash?'생활의 속도와 일정, 업무 분담에서 일상이 부딪힐 수 있습니다.':friction?'일상 업무와 기대의 작은 차이가 반복되는 다툼이 될 수 있습니다.':combine?'일상의 방식이 연결되어 담당을 정하면 함께하는 생활을 맞추는 데 도움이 될 수 있습니다.':'일상 비교에서 분명히 묶이거나 부딪히는 관계가 없습니다. 실제 습관을 비교해 맞는 부분을 살펴봅니다.'))}
  const perspective:Record<string,Passage>={
   比肩:pair('The attraction may be feeling like equals, with room to make your own choices.','동등하게 대우받고 스스로 선택할 여지가 끌림의 한 부분일 수 있습니다.'),
   劫財:pair('The attraction may be a lively social world and the feeling of being on the same team.','활기 있는 사회생활과 같은 편이라는 느낌이 끌림의 한 부분일 수 있습니다.'),
   食神:pair('The attraction may be ordinary care: being fed, helped or made comfortable without having to ask every time.','매번 부탁하지 않아도 음식과 도움, 편안함을 챙겨 주는 일상 배려가 끌림의 한 부분일 수 있습니다.'),
   傷官:pair('The attraction may be fresh ideas and someone who says what they think. The same directness can feel critical during a disagreement.','새로운 생각과 솔직하게 말하는 모습이 끌림의 한 부분일 수 있습니다. 다툴 때는 같은 솔직함이 비판으로 느껴질 수 있습니다.'),
   正財:pair('The attraction may be reliability: someone who keeps promises and takes practical commitments seriously.','약속을 지키고 현실적인 책임을 중요하게 보는 믿음직함이 끌림의 한 부분일 수 있습니다.'),
   偏財:pair('The attraction may be generosity, shared experiences and being introduced to a wider world.','너그러움과 함께하는 경험, 더 넓은 세상을 만나는 일이 끌림의 한 부분일 수 있습니다.'),
   正官:pair('The attraction may be respect and a clear place in the other person’s life.','존중받고 상대의 삶에서 자기 자리가 분명한 느낌이 끌림의 한 부분일 수 있습니다.'),
   偏官:pair('The attraction may be intensity and decisiveness. The same force can feel pushy if there is too little room to disagree.','강한 몰입과 결단력이 끌림의 한 부분일 수 있습니다. 의견을 달리할 여지가 없으면 같은 힘이 압박으로 느껴질 수 있습니다.'),
   正印:pair('The attraction may be reassurance, guidance and feeling understood.','안심할 수 있는 말과 안내, 이해받는 느낌이 끌림의 한 부분일 수 있습니다.'),
   偏印:pair('The attraction may be feeling understood in a way that is hard to explain to everyone else.','다른 사람에게 설명하기 어려운 부분까지 이해받는 느낌이 끌림의 한 부분일 수 있습니다.'),
  }
  const dayPair=plan.pairPatterns.find(c=>c.left==='day'&&c.right==='day')!,routinePair=plan.pairPatterns.find(c=>c.left==='month'&&c.right==='month')!
  const isFriction=(row:typeof dayPair)=>row.patterns.some(c=>['沖','刑','害','破'].includes(c.type)),isLink=(row:typeof dayPair)=>row.patterns.some(c=>c.type==='合')
  const pairVerdict=isFriction(dayPair)?pair(isLink(routinePair)?'This is a match where sharing everyday tasks may come more easily than making private choices together. The day-branch friction and month-branch link point to different strengths, rather than one overall compatibility score.':'This relationship needs room for separate private choices. The day branches form a friction pattern, so closeness does not remove the difference in how you want to live.',isLink(routinePair)?'함께 일상을 운영하는 것보다 사적인 선택을 맞추는 데 더 조정이 필요한 궁합입니다. 일지의 마찰과 월지의 연결을 구분해 읽습니다.':'가까워져도 개인적으로 선택할 여지를 남겨야 하는 궁합입니다. 일지에 마찰이 있어 친밀함만으로 생활 방식의 차이가 없어지는 것은 아닙니다.'):isLink(dayPair)?pair(isFriction(routinePair)?'Private closeness is a clearer strength than sharing a daily routine. The day branches link, while the month branches show friction: feeling drawn together and agreeing who does what are separate questions.':'The private-life comparison gives a basis for shared plans: the day branches form a link. This describes a way the two charts connect, while each person’s needs still shape how it works.',isFriction(routinePair)?'사적인 친밀감이 일상 운영보다 더 분명한 강점인 궁합입니다. 일지는 연결되지만 월지에는 마찰이 있어 끌림과 업무 분담을 나누어 읽습니다.':'일지가 연결되어 함께할 계획을 살펴볼 근거가 있는 궁합입니다. 연결이 실제로 어떻게 이어질지는 서로 원하는 배려도 함께 봅니다.'):pair('Neither a strong private-life link nor a direct conflict appears between the day branches. The clearest answer is the difference in each person’s needs below; this comparison alone cannot call the match easy or difficult.','일지끼리 강한 연결이나 직접적인 마찰이 나타나지 않습니다. 이 비교만으로 편하거나 어려운 궁합이라 정하지 않고 아래에서 각자가 원하는 배려의 차이를 중심으로 읽습니다.')
  const directions=[pair('From your side: '+perspective[plan.directions!.aToB].en,'본인의 관점: '+perspective[plan.directions!.aToB].ko),pair('From your partner’s side: '+perspective[plan.directions!.bToA].en,'상대방의 관점: '+perspective[plan.directions!.bToA].ko),pair('The two day-of-birth signs are compared in both directions, which is why each person can experience this connection differently.','태어난 날의 두 글자를 양쪽 방향에서 비교하므로 같은 관계도 서로 다르게 경험하는 쪽으로 읽습니다.')]
  put('two-styles',[pair(p.dayBranch===b.dayBranch?`This match shares a need for ${RELATIONSHIP_PROFILES[p.dayBranch].need}. The common ground is useful, but both people can end up waiting for the same care.`:`This match asks for different kinds of care: you value ${RELATIONSHIP_PROFILES[p.dayBranch].need}, while your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. Both needs have to be heard for the connection to feel balanced.`,p.dayBranch===b.dayBranch?`비슷한 배려를 원하는 궁합입니다. 두 사람 모두에게 중요한 것은 ${NEED[p.dayBranch]}입니다. 공통점이 도움이 되지만 같은 배려를 서로 기다릴 수 있습니다.`:`서로 다른 배려를 원하는 궁합입니다. 본인에게 중요한 것은 ${NEED[p.dayBranch]}입니다. 상대방은 ${NEED[b.dayBranch]}입니다. 두 필요를 모두 들을 때 균형을 맞추기 쉽습니다.`),pairVerdict],undefined,relationshipWatch)
  put('two-directions',[...directions,plan.directions!.aToB===plan.directions!.bToA?pair('Both directions have the same theme, but that does not establish equal feelings or equal effort.','양쪽의 주제가 같아도 감정과 노력의 양이 같다는 뜻은 아닙니다.'):pair('One person may feel supported while the other feels challenged. Neither perspective on its own describes the whole relationship.','한 사람은 도움으로 느끼는 것을 다른 사람은 도전으로 느낄 수 있습니다. 한쪽 관점만으로 관계 전체를 설명하지 않습니다.')],undefined,relationshipWatch)
  put('close-conversation',[pair(p.dayBranch===b.dayBranch?'You can want the same care and still wait for the other person to offer it first.':'The difference is how each of you recognises care: the same helpful act can meet one person’s need while missing the other’s.',p.dayBranch===b.dayBranch?'같은 배려를 원하면서도 서로 상대가 먼저 해 주기를 기다릴 수 있습니다.':'차이는 배려를 받아들이는 방식에 있습니다. 같은 도움이 한 사람에게는 맞아도 다른 사람의 필요는 놓칠 수 있습니다.'),needs,aFriction,bFriction,meeting('day'),pair(`Your likely friction is ${RELATIONSHIP_PROFILES[p.dayBranch].friction}; your partner’s is ${RELATIONSHIP_PROFILES[b.dayBranch].friction}.`,`A가 살필 마찰은 ${PRIVATE_FRICTION_KO[p.dayBranch]}이며 B는 ${PRIVATE_FRICTION_KO[b.dayBranch]}입니다.`)],undefined,relationshipWatch)
  put('shared-routine',[meeting('month'),pair('Your everyday pattern: '+LANGUAGE[p.monthBranchGod].balance.en,'본인의 일상: '+LANGUAGE[p.monthBranchGod].balance.ko),pair('Your partner’s everyday pattern: '+LANGUAGE[b.monthBranchGod].balance.en,'상대방의 일상: '+LANGUAGE[b.monthBranchGod].balance.ko)],pair('Give recurring tasks a clear owner and compare private preferences separately from running a day together.','반복 업무의 담당자를 분명히 하고 개인적 취향과 함께 일상을 운영하는 일을 나누어 비교합니다.'),relationshipWatch)
  put('shared-money',[pair('Your earning style: '+moneyPassage(p).en,'A의 재물: '+moneyPassage(p).ko),pair('Your partner’s earning style: '+moneyPassage(b).en,'B의 재물: '+moneyPassage(b).ko),pair('From your side: '+ag.money.en,'A의 관점: '+ag.money.ko),pair('From your partner’s side: '+bg.money.en,'B의 관점: '+bg.money.ko)],pair('Decide whether money is a gift, a loan or a shared expense before committing it.','돈을 약속하기 전에 선물인지 대여인지 공동 비용인지 구분합니다.'),moneyWatch)
  put('chart-patterns',[pair(`The likely tension for you is ${ag.pressure.en.replace(/^The blind spot is /,'').replace(/\.$/,'')}. Your partner’s pressure point is ${bg.pressure.en.replace(/^The blind spot is /,'').replace(/\.$/,'')}.`,`본인이 살필 점: ${ag.pressure.ko} 상대방이 살필 점: ${bg.pressure.ko}`),meeting('day'),meeting('month'),pair('Private closeness and a workable daily routine can differ. Neither a combination nor a clash is a score for the relationship or a prediction of its outcome.','사적인 친밀감과 일상을 맞추는 정도는 다를 수 있습니다. 합이나 충은 관계 점수나 결과의 예측이 아닙니다.')],undefined,relationshipWatch)
  const aYears=purchaseYears(plan.first,plan.referenceYear,'love',5),bYears=purchaseYears(plan.second!,plan.referenceYear,'love',5)
  put('support-each-other',[pair('The next five years can ask different things of each of you. Compare each year as two personal timelines, not a shared event forecast.','앞으로 5년은 두 사람에게 서로 다른 것을 요구할 수 있습니다. 같은 사건의 예측이 아니라 각자의 흐름을 함께 비교합니다.'),...aYears.flatMap((a,i)=>[pair(`You — ${a.lines[0].en}`,`본인 — ${a.lines[0].ko}`),pair(`Your partner — ${bYears[i].lines[0].en}`,`상대방 — ${bYears[i].lines[0].ko}`),...a.lines.filter(l=>l.id.endsWith('change-day')).map(l=>pair(a.date.slice(0,4)+' — for you: '+l.en,a.date.slice(0,4)+'년 — 본인: '+l.ko)),...bYears[i].lines.filter(l=>l.id.endsWith('change-day')).map(l=>pair(a.date.slice(0,4)+' — for your partner: '+l.en,a.date.slice(0,4)+'년 — 상대방: '+l.ko))])],undefined,relationshipWatch)
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
 if(area==='business')return steady&&variable?pair('Build around repeat customers, then test new deals on a smaller scale. Your chart contains both money patterns, so keep new sales from disrupting dependable delivery.','반복 고객을 기반으로 만들고 새 거래는 작게 시험합니다. 두 재물 방식이 함께 있어 새 판매 때문에 꾸준한 납품이 흔들리지 않게 합니다.')
 :steady?pair('Repeat sales and clearly priced ongoing work are the stronger business money theme. The pressure is how much continuing service each sale requires.','반복 판매와 가격이 분명한 지속 업무가 사업 재물의 더 강한 주제입니다. 판매 뒤 계속 제공해야 할 서비스가 부담이 될 수 있습니다.')
 :variable?pair('The business money theme favours finding buyers and making deals over simply maintaining a fixed book of work. Cash can arrive unevenly when the fees depend on new sales.','정해진 업무를 유지하기보다 구매자를 찾고 거래하는 일이 사업 재물의 중심입니다. 새 판매에 수입이 달리면 수금의 간격도 달라질 수 있습니다.')
 :p.hiddenMoney.length?pair('The business money signs sit behind the main role rather than at the front. Delivery skills and less visible work need attention before treating sales as your main strength.','사업의 재물 글자는 겉에 앞서기보다 역할 뒤에 있습니다. 영업을 주된 강점으로 정하기 전에 납품 기술과 드러나지 않는 업무를 함께 살핍니다.')
 :pair('The checked chart does not give a clear direct business money route. Business suitability and earning power should therefore stay separate in this reading.','확인한 사주에서 직접적인 사업 재물 통로가 분명하지 않습니다. 사업 방식의 적성과 돈 버는 힘은 나누어 풀이합니다.')
 if(area==='career')return steady&&variable?pair('Keep a steady income base and develop selected project or customer work alongside it. Both routes appear in your chart; neither needs to carry all your income.','꾸준한 수입 기반을 두고 선택한 프로젝트나 고객 업무를 더하는 방식입니다. 두 통로가 함께 나타나 한쪽에 수입 전부를 걸 필요는 없습니다.')
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
 if(positions.length)return pair(`Your money themes connect with ${positions.map(x=>name[x][0]).join(' and ')}. Look at the people, promises and costs involved there when judging a new source of income.`,`재물 주제는 ${positions.map(x=>name[x][1]).join('·')}과 연결됩니다. 새 수입을 판단할 때 그 영역의 사람과 약속, 비용을 함께 봅니다.`)
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
 const needsMatch=p.dayBranch===b.dayBranch
 return [
  moneyDepth(p,'life'),
  pair(`Your lasting work pattern centres on ${m.name.en}. In ${plans.annual.referenceYear}, the emphasis on ${year.name.en} ${y.god===p.monthStemGod?'reinforces that familiar demand':'adds a different demand'}. The priority is ${y.god===p.monthStemGod?'deciding how much of the same responsibility to keep':'fitting the new demand around the way you already work'}.`,`타고난 업무의 중심은 ${m.name.ko}입니다. ${plans.annual.referenceYear}년의 ${year.name.ko}은 ${y.god===p.monthStemGod?'익숙한 요구를 더합니다. 같은 책임을 얼마나 더 맡을지가 우선순위입니다.':'다른 요구를 더합니다. 기존 업무 방식 안에 새로운 요구를 어떻게 담을지가 우선순위입니다.'}`),
  pair(`The money and relationship readings meet at the use of your time: ${p.strength.tendency==='support-needed'?'additional earning activity can consume support you also need at home':p.strength.tendency==='deferred'?'the incomplete balance judgement means neither a bigger workload nor an easier period can be assumed':'more customers or responsibility still need to fit alongside private commitments'}.`,`재물과 관계의 풀이가 만나는 지점은 시간의 사용입니다. ${p.strength.tendency==='support-needed'?'추가 돈벌이 활동이 가정에서도 필요한 도움을 소모할 수 있습니다.':p.strength.tendency==='deferred'?'전체 균형 판단이 미정이므로 더 많은 업무나 편한 시기를 가정하지 않습니다.':'고객이나 책임이 늘 때 사적인 약속도 함께 감당해야 합니다.'}`),
  pair(needsMatch?'You and your partner share a similar private-life need. Work pressure can still make it harder for either of you to offer the care you both want.':`You value ${RELATIONSHIP_PROFILES[p.dayBranch].need}, while your partner values ${RELATIONSHIP_PROFILES[b.dayBranch].need}. Extra work this year may expose that difference more clearly.`,needsMatch?'두 사람은 사적인 관계에서 비슷한 것을 원합니다. 그래도 업무 압박이 커지면 서로 원하는 배려를 제공하기 어려울 수 있습니다.':`본인은 ${NEED[p.dayBranch]}을 원하고 상대방은 ${NEED[b.dayBranch]}을 원합니다. 올해 일이 늘 때 그 차이가 더 드러날 수 있습니다.`),
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
