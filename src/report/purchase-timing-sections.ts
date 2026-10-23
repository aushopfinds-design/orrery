import type { InterpretationPlan } from './interpretation-plan.ts'
import { purchaseYears, purchaseMonths } from './purchase-timing.ts'
import type { TimingSentence } from './purchase-timing.ts'
export interface PurchaseTimingSection { lines: TimingSentence[]; evidence: string[] }
/** Exact paired sentences are reused by both writers and checked against the delivered text. */
const cache = new WeakMap<InterpretationPlan, Record<string, PurchaseTimingSection>>()
export function purchaseTimingSections(plan: InterpretationPlan): Record<string, PurchaseTimingSection> {
 const existing = cache.get(plan); if(existing) return existing
 const made = buildSections(plan); cache.set(plan,made); return made
}
function buildSections(plan: InterpretationPlan): Record<string, PurchaseTimingSection> {
 const out: Record<string, PurchaseTimingSection> = {}
 const area = plan.kind === 'business' ? 'business' : plan.kind === 'career' ? 'work' : 'life'
 if (plan.kind === 'wellbeing' || plan.kind === 'compatibility') return out
 const years = purchaseYears(plan.first,plan.referenceYear,area)
 const money = purchaseYears(plan.first,plan.referenceYear,plan.kind==='business'?'business':'money')
 const months = plan.kind==='year' ? purchaseMonths(plan.first,plan.referenceYear) : []
 type Row = typeof years[number]
 const put = (id:string, en:string, ko:string, rows:Row[], full=false) => {
  const seen = new Set<string>()
  const lines:TimingSentence[] = [{id:id+'.intro',en,ko},...rows.flatMap(row=>row.lines.filter(l=>full || /\.(verdict|area-context|capacity|longer|longer-inner|change-month|change-day|connection|background-pressure|wider-pressure|caution)$/.test(l.id))).map(l=>({...l,id:id+'.'+l.id}))]
  out[id]={lines:lines.filter(l=>{if(seen.has(l.en))return false;seen.add(l.en);return true}),evidence:[...new Set(rows.flatMap(r=>r.evidence))]}
 }
 const dates = (rows:Row[]) => rows.map(r=>r.date.slice(0,plan.kind==='year'?7:4)).join(', ')
 const openings = money.filter(r=>['conditional-opening','opening-with-caution','conditional-support'].includes(r.status))
 const workOpenings = years.filter(r=>['conditional-opening','opening-with-caution','conditional-support'].includes(r.status))
 const care = years.filter(r=>['extra-care','opening-with-caution'].includes(r.status))
 if(plan.kind==='career') {
  const recognitions=workOpenings.filter(r=>['expertise-to-role','support-for-role'].includes(r.route??''))
  put('proof-of-skill',recognitions.length ? `Recognition deserves a closer look in ${dates(recognitions)}. These are conditional links between your existing knowledge, a recognised role and the longer period; they do not establish a promotion.` : `The ${plan.referenceYear}–${plan.referenceYear+years.length-1} comparison does not establish a clearly supported promotion window. The periods below explain responsibility and preparation without inventing an employer's decision.`,recognitions.length ? `${dates(recognitions)}년에는 쌓은 지식과 인정받는 역할, 긴 흐름이 조건부로 연결됩니다. 승진을 확정하는 뜻은 아닙니다.`:`${plan.referenceYear}–${plan.referenceYear+years.length-1}년 비교에서는 승진에 유리한 시기를 분명히 고를 수 없습니다. 아래에서는 책임과 준비의 흐름을 설명하며 고용주의 결정을 만들어 넣지 않습니다.`,recognitions.length?recognitions.slice(0,3):years.filter(r=>r.lines[0].en.includes('role')||r.lines[0].en.includes('training')).slice(0,2))
  const changed=years.filter(r=>r.lines.some(l=>l.id.endsWith('change-month')))
  put('feedback-and-boundaries',changed.length?`${dates(changed)} bring specific signs of changing work arrangements. A move can be worth examining, but the comparison does not decide whether leaving is better than staying.`:`No direct work-arrangement friction appears in the ${plan.referenceYear}–${plan.referenceYear+years.length-1} comparison. The chart does not manufacture a job-change year; actual offers and working conditions still matter.`,changed.length?`${dates(changed)}년에는 일하는 방식의 변화를 살필 구체적인 신호가 있습니다. 이직을 검토할 주제이지 떠나는 쪽이 더 좋다는 판정은 아닙니다.`:`${plan.referenceYear}–${plan.referenceYear+years.length-1}년 비교에서는 업무 방식과 직접 부딪히는 신호가 없습니다. 이직할 해를 만들어 넣지 않으며 실제 제안과 근무 조건은 여전히 중요합니다.`,changed.slice(0,3))
  put('work-chapters',`Your work comparison for ${plan.referenceYear}–${plan.referenceYear+years.length-1} separates opportunities from extra demands. A year that suits a particular activity is not automatically better for income or every part of life.`,`앞으로 ${years.length}년을 일의 기회와 추가 부담으로 나누어 읽습니다. 특정 활동에 맞는 해가 수입이나 인생 전체에 더 좋은 해라는 뜻은 아닙니다.`,years)
  put('money-commitments',openings.length?`${dates(openings)} deserve a closer look for earning-related activity, with the conditions below. This is different from predicting higher pay or money left over.`:`The next ${money.length} years do not establish an easier money window under these checks. Your earning pattern remains useful, but a profitable year is not invented to fill the gap.`,openings.length?`${dates(openings)}년에는 아래 조건을 갖춘 돈벌이 활동을 살펴볼 수 있습니다. 급여나 남는 돈이 늘어난다는 예측과는 다릅니다.`:`앞으로 ${money.length}년 비교에서 돈을 다루기 더 수월한 시기를 확정하지 않습니다. 돈 버는 방식은 설명하되 이익이 나는 해를 만들어 넣지 않습니다.`,openings.slice(0,3))
 }
 if(plan.kind==='business') {
  const chosen=openings.length?openings.slice(0,3):money.filter(r=>['extra-care','opening-with-caution'].includes(r.status)).slice(0,2)
  put('offer-test',openings.length?`For a first offer or small launch, examine ${dates(openings)} alongside the conditions below. The chart links an existing skill or customer pattern with the longer period; it does not show actual demand or guarantee a successful opening.`:`The next ${money.length} years do not establish a supported launch window. The reading still identifies your business model and the pressures to resolve before committing money.`,openings.length?`첫 상품이나 작은 시작은 ${dates(openings)}년의 조건을 함께 살펴볼 수 있습니다. 가진 기술 또는 고객 활동과 긴 흐름을 연결한 풀이이며 실제 수요나 창업 성공을 보장하지 않습니다.`:`앞으로 ${money.length}년 비교에서 유리한 창업 시기를 확정하지 않습니다. 사업 방식과 돈을 쓰기 전에 해결할 부담은 설명합니다.`,chosen)
  put('customer-communication',openings.length?`Expansion deserves a closer look in ${dates(openings)}, provided delivery capacity and the stated timing conditions hold. The same customer opportunity can add orders, costs and collection delays together.`:`No year in the checked ${money.length}-year window meets the conditions for an expansion opening. More money-related activity alone is not used as permission to grow.`,openings.length?`${dates(openings)}년의 확장 가능성은 납품 역량과 아래의 시기 조건이 갖춰지는지 함께 살핍니다. 고객 기회가 주문·비용·수금 지연을 함께 늘릴 수 있습니다.`:`확인한 ${money.length}년에는 확장 기회로 고를 조건을 갖춘 해가 없습니다. 돈과 관련해 바빠지는 것만으로 확장을 권하지 않습니다.`,chosen)
  put('business-chapters',`The next ${years.length} years show when the business topic changes and where extra demands can outweigh a commercial opening. Read these alongside the longer periods below, which start on their calculated dates.`,`앞으로 ${years.length}년에서 사업의 주제가 달라지는 시기와 거래 기회보다 부담을 더 살필 시기를 구분합니다. 아래의 긴 흐름은 각각 계산된 날짜에 시작합니다.`,years)
  put('business-plan',care.length?`Extra care is called for in ${dates(care)} because the comparisons show competing demands. This is a reason to examine the size and terms of a commitment, not a forecast of failure.`:`No year meets the stated extra-care conditions in this window. That is not a risk-free verdict, and normal business checks still apply.`,care.length?`${dates(care)}년에는 서로 부딪히는 요구가 확인되어 약속의 크기와 조건을 더 살핍니다. 실패를 예고하는 것은 아닙니다.`:'확인 범위에 정해진 주의 조건에 해당하는 해가 없습니다. 위험이 없다는 판정은 아닙니다.',care)
 }
 if(plan.kind==='complete') {
  const changes=years.filter(r=>r.lines.some(l=>/\.change-(day|month)$/.test(l.id)))
  put('patterns',changes.length?`The clearest changes to examine are ${dates(changes)}. Work and private-life comparisons are kept separate below, so one change signal is not treated as a verdict on your whole life.`:`The next ${years.length} years do not show a direct clash in the work or close-relationship comparison. That does not rule out change; the reading explains the activities it can support instead.`,changes.length?`${dates(changes)}년의 변화를 먼저 살펴봅니다. 일과 가까운 관계를 나누어 비교하므로 한 곳의 변화로 인생 전체를 판단하지 않습니다.`:`앞으로 ${years.length}년 비교에서 일이나 가까운 관계와 직접 부딪히는 신호가 확인되지 않습니다. 변화가 없다는 뜻은 아니며 근거가 있는 활동의 흐름을 설명합니다.`,changes.length?changes.slice(0,4):years.slice(0,2))
  put('next-moves',`Here is the year-by-year picture for ${plan.referenceYear}–${plan.referenceYear+years.length-1}. Each year names the activity, the conditions and the part of life that needs attention.`,`다음은 ${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 흐름입니다. 매년의 활동과 조건, 더 살펴볼 생활 영역을 함께 설명합니다.`,years)
 }
 if(plan.kind==='year') {
  const good=months.filter(r=>['conditional-opening','opening-with-caution','conditional-support'].includes(r.status)), careful=months.filter(r=>['extra-care','opening-with-caution'].includes(r.status))
  put('annual-cycle-context',good.length?`The monthly comparisons point to conditional openings in ${dates(good)}. Some also need extra care, as shown below. Read what each is suitable for; these are not blanket good months, and a mixed capacity reading remains a condition.`:`None of the twelve monthly comparisons establishes a supported opening. The reading does not fill that gap with invented lucky months. The monthly chapters still explain the actual work, money and relationship themes.`,good.length?`${dates(good)}의 월별 비교에서 조건부 기회를 읽습니다. 일부는 주의 목록에도 함께 나타납니다. 아래의 활동과 조건을 함께 봐야 하며 달 전체가 좋다는 뜻은 아닙니다. 일을 감당할 여유가 불분명하다면 그 조건도 남습니다.`:'12개 월별 비교에서 뒷받침되는 기회를 확정할 수 없습니다. 행운의 달을 만들어 넣지 않으며 매달 실제로 계산된 일·돈·관계의 주제는 설명합니다.',good)
  put('annual-plan',careful.length?`The comparisons needing extra care are ${dates(careful)}. Each explanation below identifies the area and the reason, rather than marking a whole month as bad.`:`No monthly comparison meets the extra-care conditions. That does not establish a trouble-free year.`,careful.length?`${dates(careful)}의 비교에서는 더 주의해서 살핍니다. 달 전체가 나쁘다고 표시하지 않고 생활 영역과 이유를 함께 설명합니다.`:'정해진 추가 주의 조건에 해당하는 월별 비교가 없습니다. 문제가 없는 해라는 판정은 아닙니다.',careful)
  months.forEach((r,i)=>out['month-'+(i+1)]={lines:r.lines,evidence:r.evidence})
 }
 return out
}
