/** Editorial examples from observed roles; never new calculation or event rules. */
import type { InterpretationPlan } from './interpretation-plan.ts'
import { pair, WORKING_LANGUAGE as WORDS, type Passage } from './purchase-language.ts'
import { CARE_NEED } from './relationship-needs.ts'
type Subject=InterpretationPlan['primary']
const TASKS:Record<string,Passage>={
 比肩:pair('owning a specialist assignment from start to finish','전문 업무를 처음부터 끝까지 맡는 일'),
 劫財:pair('negotiating a shared project or bringing in work through contacts','공동 프로젝트를 협상하거나 인맥으로 업무를 연결하는 일'),
 食神:pair('making, teaching or delivering something to a dependable standard','만들거나 가르치거나 일정한 품질로 제공하는 일'),
 傷官:pair('diagnosing a problem and improving the method or explaining the solution','문제를 찾아 방법을 개선하거나 해결책을 설명하는 일'),
 正財:pair('managing repeat customers, stock, schedules or ongoing accounts','단골 고객과 재고, 일정, 지속 거래를 관리하는 일'),
 偏財:pair('finding buyers, developing accounts or opening a sales channel','구매자를 찾고 고객을 키우거나 판매 경로를 여는 일'),
 正官:pair('leading a defined team or maintaining professional standards','담당 팀을 이끌거나 전문 기준을 지키는 일'),
 偏官:pair('taking charge of a difficult deadline or resolving an urgent problem','어려운 기한을 책임지거나 긴급 문제를 해결하는 일'),
 正印:pair('training others, documenting a method or giving dependable guidance','교육과 방법의 문서화, 믿을 수 있는 안내를 제공하는 일'),
 偏印:pair('researching a narrow problem or developing a specialist solution','좁은 문제를 연구하거나 전문적인 해결책을 만드는 일'),
}
export function roleChoice(p:Subject):Passage{
 const visible=TASKS[p.monthStemGod],daily=TASKS[p.monthBranchGod]
 return p.monthStemGod===p.monthBranchGod
 ?pair(`Look for tasks such as ${visible.en}. Both sides of your birth-month pattern repeat this preference, so a clear remit is a better fit than a title that spreads you across unrelated duties. These are examples of work, not a fixed list of careers.`,`예를 들면 ${visible.ko}을 살펴봅니다. 태어난 달의 겉과 안이 같은 특징을 반복하므로 관련 없는 일을 넓게 맡는 직함보다 담당 범위가 분명한 쪽으로 읽습니다. 정해진 직업 목록이 아니라 업무의 예시입니다.`)
 :pair(`A useful job combines ${visible.en} with enough time for ${daily.en}. For example, being hired for the first while your whole week is consumed by the second would leave the role poorly matched. This comes from comparing the two different roles in your birth month, not from your job title.`,`맞는 자리는 ${visible.ko}과 ${daily.ko}을 위한 시간을 함께 담습니다. 앞의 역할로 채용됐는데 한 주를 뒤의 업무에만 쓰게 된다면 맞지 않는 부분이 생길 수 있습니다. 직업명보다 태어난 달의 서로 다른 두 역할을 비교한 풀이입니다.`)
}
export function businessDivision(p:Subject):Passage{
 const delivery=TASKS[p.monthBranchGod],front=TASKS[p.monthStemGod]
 const output=p.resolution.circuits.some(c=>c.code==='output-to-money')
 const hidden=p.visibleMoney.length===0&&p.hiddenMoney.length>0
 const opening=p.monthStemGod===p.monthBranchGod?pair(`Both work roles emphasise ${front.en}. That gives the business a clear centre, but the repeat does not establish a second strength in operations or finance.`,`업무의 두 역할이 ${front.ko}을 강조합니다. 사업의 중심은 분명하지만 같은 특징의 반복만으로 운영이나 재무에도 별도 강점이 있다고 정하지 않습니다.`):pair(`Your part of the business is clearest in ${front.en}; the work that must still get done includes ${delivery.en}.`,`사업에서 자신의 역할은 ${front.ko}에서 더 분명하고, 실제로 계속 해야 하는 일에는 ${delivery.ko}도 있습니다.`)
 return pair(`${opening.en} ${output?'The chart also connects output with money, making the handover from a finished result to a paying buyer especially relevant.':hidden?'The money signs are less visible than the working role, so being good at delivery does not by itself establish how customers will find or pay you.':'The work pattern alone does not establish demand; finding buyers and completing their orders remain separate responsibilities.'} A useful partner would take ownership of a gap in this chain, rather than duplicate your preferred task.`,`${opening.ko} ${output?'결과물과 재물이 연결되어 완성한 결과를 유료 고객에게 넘기는 과정이 특히 중요합니다.':hidden?'재물은 업무 역할보다 덜 드러나므로 납품을 잘하는 것만으로 고객이 찾아오고 대금을 내는 경로까지 정해지지는 않습니다.':'업무의 특징만으로 수요를 정하지 않습니다. 고객 확보와 주문 완료는 별도 책임입니다.'} 자신의 선호 업무를 반복하는 사람보다 이 과정에서 비어 있는 역할을 책임지는 동업자가 더 유용합니다.`)
}
const REPAIR:Record<string,Passage>={
 space:pair('offer time to think and agree when to return to the conversation','생각할 시간을 주고 다시 이야기할 때를 정하기'),
 autonomy:pair('offer a choice instead of deciding on the other person’s behalf','대신 결정하기보다 선택권을 주기'),
 reliability:pair('name the promise you can keep and follow through','지킬 약속을 구체적으로 말하고 실행하기'),
 attention:pair('give undivided attention before returning to other plans','다른 약속으로 돌아가기 전에 온전히 관심을 주기'),
 listening:pair('listen to the full concern before offering a solution','해결책을 말하기 전에 걱정을 끝까지 듣기'),
}
export function relationshipRepair(a:Subject,b:Subject):Passage{
 const ar=REPAIR[CARE_NEED[a.dayBranch]],br=REPAIR[CARE_NEED[b.dayBranch]]
 const shared=CARE_NEED[a.dayBranch]===CARE_NEED[b.dayBranch]
 const response=shared?pair(`For either of you, a useful first response is to ${ar.en}.`,`두 사람에게 공통으로 도움이 될 첫 대응은 ${ar.ko}입니다.`):pair(`To reach you, your partner could ${ar.en}; to reach your partner, you could ${br.en}.`,`본인에게는 상대가 ${ar.ko}, 상대방에게는 본인이 ${br.ko}로 시작할 수 있습니다.`)
 return pair(`For a concrete example, imagine a difficult conversation after a long day. ${response.en} ${shared?'The first response can be similar, but each person still needs a turn receiving it.':'Starting with the same response for both of you could miss one person’s need.'} This is an illustration of your compared private-life needs, not an event the chart predicts.`,`예를 들어 긴 하루 뒤 어려운 대화를 한다고 생각해 봅니다. ${response.ko} ${shared?'첫 대응이 비슷할 수 있지만 두 사람 모두 배려를 받을 차례가 필요합니다.':'두 사람에게 같은 방식으로만 대응하면 한 사람의 필요를 놓칠 수 있습니다.'} 사적인 필요를 비교한 예시이며 일어날 사건을 예측한 것이 아닙니다.`)
}
export function personalBoundary(p:Subject):Passage{
 const task=TASKS[p.monthStemGod],privateRole=WORDS[p.dayBranchGod]
 return pair(`A revealing moment is being asked to keep ${task.en} after your own day is already full. Your work role emphasises ${WORDS[p.monthStemGod].name.en}, while your private-life pattern adds ${privateRole.name.en}. ${p.monthStemGod===p.dayBranchGod?'The familiar role can follow you home: the thing others value may be the very thing you need a break from.':'Changing from the work role to the private one may take more than simply leaving the workplace.'} Use this scene to recognise the pattern, rather than assume it happens every day.`,`이미 하루가 꽉 찼는데도 ${task.ko}을 계속 부탁받는 순간을 떠올려 봅니다. 일에서는 ${WORDS[p.monthStemGod].name.ko}, 사적인 생활에서는 ${privateRole.name.ko}이 나타납니다. ${p.monthStemGod===p.dayBranchGod?'익숙한 역할이 집까지 이어질 수 있습니다. 남들이 좋아하는 그 역할에서 정작 자신은 쉬고 싶을 수 있습니다.':'일하는 역할에서 개인적인 역할로 바꾸는 데는 퇴근하는 것 이상의 전환이 필요할 수 있습니다.'} 매일 그렇다고 단정하지 않고 특징을 알아보는 예시로 사용합니다.`)
}
export function monthlyFit(p:Subject,month:InterpretationPlan['months'][number]):Passage{
 const g=WORDS[month.god],work=WORDS[p.monthStemGod]
 const tension=(position:string)=>month.comparisons.some(c=>c.position===position&&c.patterns.some(t=>['沖','刑','害','破'].includes(t.type)))
 const workPressure=tension('month'),homePressure=tension('day')
 const area=workPressure&&homePressure?pair('both your working arrangements and private commitments','업무 방식과 사적인 약속 모두'):workPressure?pair('your working arrangements','업무 방식'):homePressure?pair('your private commitments','사적인 약속'):pair('neither work nor private life through a direct friction pattern','직접적인 마찰 관계로는 업무와 사적인 생활 어느 쪽도')
 return pair(`Compared with your usual emphasis on ${work.name.en}, this month ${month.god===p.monthStemGod?`repeats ${g.name.en}; the familiar demand may take up more of your attention`:`adds ${g.name.en}, so the new demand needs a place alongside your normal work`}. ${workPressure||homePressure?`The direct adjustment concerns ${area.en}.`:'No direct friction is found against your work or private-life signs; that leaves more room to follow the stated theme without a specific adjustment from those comparisons.'}`,`평소 업무의 ${work.name.ko}과 비교하면 이번 달은 ${month.god===p.monthStemGod?`${g.name.ko}이 반복되어 익숙한 요구에 더 신경을 쓸 수 있습니다`:`${g.name.ko}이 더해져 기존 업무 안에서 새 요구를 담을 자리를 살핍니다`}. ${workPressure||homePressure?`직접 조정할 부분은 ${area.ko}입니다.`:'업무와 사적인 관계의 글자에 직접 마찰이 없어 이 비교에서 정한 조정보다 해당 달의 주제에 무게를 둡니다.'}`)
}
