import type { InterpretationPlan } from './interpretation-plan.ts'
import { purchaseYears, purchaseMonths } from './purchase-timing.ts'
import type { TimingSentence } from './purchase-timing.ts'
export interface PurchaseTimingSection { lines: TimingSentence[]; evidence: string[] }
const cache = new WeakMap<InterpretationPlan, Record<string, PurchaseTimingSection>>()
export function purchaseTimingSections(plan: InterpretationPlan): Record<string, PurchaseTimingSection> {
 const existing=cache.get(plan);if(existing)return existing
 const made=buildSections(plan);cache.set(plan,made);return made
}
function buildSections(plan:InterpretationPlan):Record<string,PurchaseTimingSection>{
 const out:Record<string,PurchaseTimingSection>={}
 if(plan.kind==='wellbeing'||plan.kind==='compatibility')return out
 const area=plan.kind==='business'?'business':plan.kind==='career'?'work':'life'
 const years=purchaseYears(plan.first,plan.referenceYear,area),money=purchaseYears(plan.first,plan.referenceYear,plan.kind==='business'?'business':'money')
 type Row=typeof years[number]
 const opens=(r:Row)=>['conditional-opening','opening-with-caution','conditional-support'].includes(r.status)
 const dates=(rows:Row[])=>rows.map(r=>r.date.slice(0,4)).join(', ')
 const put=(id:string,en:string,ko:string,rows:Row[]=[],detail=false)=>{
  const lines:TimingSentence[]=[{id:id+'.intro',en,ko}]
  const explained=new Set<string>()
  for(const row of rows){
   if(detail){
    const selected=row.lines.filter(l=>/\.(verdict|opening|reason|area-context|change-day|change-month|background-pressure|caution)$/.test(l.id)).filter(l=>{if(l.id.endsWith('.verdict'))return true;if(explained.has(l.en))return false;explained.add(l.en);return true})
    lines.push({id:id+'.'+row.date,en:selected.map(l=>l.en).join(' '),ko:selected.map(l=>l.ko).join(' ')})
   }
  }
  out[id]={lines,evidence:[...new Set(rows.flatMap(r=>r.evidence))]}
 }
 const opportunities=money.filter(opens),workOpenings=years.filter(opens)
 // Editorial priority is the count of observed conflicts, not an invented luck score.
 // All periods remain in the full timeline. Highlights never relabel omitted periods as safe.
 const priority=(rows:Row[])=>rows.map((r,i)=>({r,i,n:r.lines.filter(l=>/\.(change-|background-pressure|wider-pressure)/.test(l.id)).length})).sort((a,b)=>b.n-a.n||a.i-b.i).slice(0,3).map(x=>x.r).sort((a,b)=>a.date.localeCompare(b.date))
 const care=years.filter(r=>['extra-care','opening-with-caution'].includes(r.status))
 if(plan.kind==='complete'){
  const changed=years.filter(r=>r.lines.some(l=>/\.change-(day|month)$/.test(l.id))),highlights=priority(changed)
  put('patterns',highlights.length?`Give ${dates(highlights)} a closer look when planning a change. These stand out because the reading finds more changes to work or close relationships; the full timeline below keeps the other years in view.`:`No work or relationship clash stands out in this ten-year comparison. Your timeline still shows how the focus changes from year to year.`,highlights.length?`변화를 계획할 때는 ${dates(highlights)}년을 먼저 살펴봅니다. 일이나 가까운 관계에서 변화가 더 두드러지는 해이며, 다른 해의 흐름도 아래 전체 일정에 남겨 두었습니다.`:'이번 10년 비교에서는 일이나 관계에 부딪히는 변화가 두드러지지 않습니다. 매년 달라지는 중심 주제는 전체 흐름에서 설명합니다.',highlights)
  put('next-moves',`Your ${plan.referenceYear}–${plan.referenceYear+years.length-1} timeline: each year below gives the main opportunity or pressure, the reason and what needs attention.`,` ${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 전체 흐름입니다. 각 해의 기회나 부담, 그 이유와 주의할 점을 함께 읽습니다.`,years,true)
 }
 if(plan.kind==='career'){
  const recognition=workOpenings.filter(r=>['expertise-to-role','support-for-role'].includes(r.route??''))
  put('proof-of-skill',recognition.length?`Your knowledge and work responsibilities connect more clearly in ${dates(recognition)}. These are the years to examine for a more demanding or better recognised role.`:`The next ${years.length} years do not give a clear promotion window. Your reading can describe how you earn recognition, but it cannot choose a promotion year from these results.`,recognition.length?`${dates(recognition)}년에는 지식과 업무 책임의 연결이 더 뚜렷합니다. 더 중요한 역할이나 인정을 살펴볼 해입니다.`:`앞으로 ${years.length}년에서 승진 시기를 분명히 고를 근거는 부족합니다. 인정받는 방식은 설명하되 승진할 해를 정하지 않습니다.`,recognition.slice(0,3))
  const changed=years.filter(r=>r.lines.some(l=>l.id.endsWith('change-month')))
  put('feedback-and-boundaries',changed.length?`Changing duties or working arrangements stand out in ${dates(changed)}. These years are more relevant to a job-change question than years with only a general money theme.`:`No direct change to work arrangements stands out in this window. A decision to move would need to rest more on the actual role than on a clear timing signal.`,changed.length?`${dates(changed)}년에는 업무나 일하는 방식의 변화가 두드러집니다. 단순히 재물 주제만 있는 해보다 이직 질문과 더 관련이 있는 시기입니다.`:'이 기간에는 업무 방식의 직접적인 변화가 두드러지지 않습니다. 이직 판단에서는 시기 신호보다 실제 자리를 더 중요하게 봐야 합니다.',priority(changed))
  put('money-commitments',opportunities.length?`For paid projects or customer work, examine ${dates(opportunities)}. These periods connect earning activity with your existing skills; payment terms and workload remain part of the judgement.`:`No clearly supported earning window stands out in this ten-year comparison. The useful answer here is how your income pattern works, rather than a promised year of higher pay.`,opportunities.length?`유료 업무나 고객을 통한 돈벌이는 ${dates(opportunities)}년을 살펴볼 수 있습니다. 가진 기술과 수입 활동이 연결되며 대금 조건과 업무량도 함께 판단합니다.`:'이번 10년 비교에서 돈벌이에 유리한 시기를 분명히 고를 근거는 부족합니다. 급여가 오를 해보다 수입이 생기는 방식에 초점을 둡니다.')
  put('work-chapters',`Your ${plan.referenceYear}–${plan.referenceYear+years.length-1} career timeline follows how the work changes, not a list of lucky job titles.`,`${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 직업 흐름입니다. 행운의 직업명을 고르기보다 업무의 변화를 따라 읽습니다.`,years,true)
 }
 if(plan.kind==='business'){
  put('offer-test',opportunities.length?`A small launch or paid trial is worth examining in ${dates(opportunities)}. The opening is between what you can produce and what you can sell.`:`There is no clearly supported launch window in the next ${years.length} years. The business-style reading below is still useful for deciding what to test, without choosing a launch date.`,opportunities.length?`${dates(opportunities)}년에는 작은 시작이나 유료 시험 판매를 살펴볼 수 있습니다. 만들 수 있는 것과 판매할 수 있는 것이 연결되는 기회입니다.`:`앞으로 ${years.length}년에서 유리한 창업 시기를 분명히 고를 근거는 부족합니다. 날짜를 정하기보다 아래 사업 방식에 맞는 시험 대상을 살펴봅니다.`)
  put('customer-communication',opportunities.length?`Growth opportunities appear in ${dates(opportunities)}. The question is whether the business can repeat a good result at a larger scale, not simply attract more orders.`:`The timing does not give a clear expansion opening. Strengthening repeat sales and delivery is a more grounded use of this reading than choosing a year to grow.`,opportunities.length?`${dates(opportunities)}년에 성장의 기회를 살펴봅니다. 주문만 늘리는 것보다 좋은 결과를 더 큰 규모에서도 반복할 수 있는지가 핵심입니다.`:'시기 비교에서 확장에 유리한 기회가 분명하지 않습니다. 확장할 해를 고르기보다 반복 판매와 납품 기반에 초점을 둡니다.')
  const key=priority(care)
  put('business-plan',key.length?`Give commitments in ${dates(key)} the closest review. These are the most prominent competing demands in this comparison; other years still have their own cautions in the full timeline.`:`No period stands out under the specific extra-care checks used here. Review the business model and actual commitments on their own merits.`,key.length?`${dates(key)}년의 약속을 가장 먼저 살펴봅니다. 이번 비교에서 서로 겹치는 부담이 더 두드러진 해입니다. 다른 해의 주의점도 전체 흐름에 남아 있습니다.`:'사용한 주의 기준에서 특별히 두드러지는 시기가 없습니다. 사업 방식과 실제 약속의 조건을 따로 살펴봅니다.',key)
  put('business-chapters',`Your ${plan.referenceYear}–${plan.referenceYear+years.length-1} business timeline separates finding customers, delivering the work and managing shared commitments.`,`${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 사업 흐름입니다. 고객 확보와 납품, 공동 책임을 나누어 살펴봅니다.`,years,true)
 }
 if(plan.kind==='year'){
  const months=purchaseMonths(plan.first,plan.referenceYear),good=months.filter(opens),careful=months.filter(r=>['extra-care','opening-with-caution'].includes(r.status)),key=priority(careful)
  const labels=(rows:Row[])=>rows.map(r=>new Date(r.date+'T12:00:00Z').toLocaleDateString('en-GB',{month:'long',timeZone:'UTC'})).join(', ')
  const koLabels=(rows:Row[])=>rows.map(r=>Number(r.date.slice(5,7))+'월').join('·')
  const mixed=good.filter(r=>r.status==='opening-with-caution'),supportOnly=good.filter(r=>r.status!=='opening-with-caution')
  put('annual-cycle-context',good.length?`${supportOnly.length?`Openings with no flagged timing conflict: ${labels(supportOnly)}. `:''}${mixed.length?`Opportunity with pressure: ${labels(mixed)}. These months offer a useful activity while other demands still need managing. `:''}The monthly chapters explain the difference.`:`The monthly comparison does not identify a clearly supported opening. Use the changing monthly themes below without treating any month as a promised breakthrough.`,good.length?`${supportOnly.length?`시기 비교의 충돌 없이 기회를 읽는 달: ${koLabels(supportOnly)}. `:''}${mixed.length?`기회와 부담이 함께 있는 달: ${koLabels(mixed)}. 도움이 될 활동과 함께 감당해야 할 요구가 남습니다. `:''}차이는 월별 풀이에서 설명합니다.`:'월별 비교에서 유리한 기회를 분명히 고를 근거는 부족합니다. 특정 달의 성과를 약속하지 않고 매달 달라지는 주제를 읽습니다.')
  put('annual-plan',key.length?`Put ${labels(key)} first on your review list. They carry more overlapping demands in this reading. Start with these, then use the full monthly table to keep the remaining adjustments in view.`:`No month stands out under these extra-care checks. The twelve-month overview still shows the commitments and changing focus of each month.`,key.length?`${koLabels(key)}을 먼저 확인할 달로 꼽습니다. 이번 풀이에서 부담이 더 겹치는 달입니다. 이 달부터 살피고 전체 표에서 나머지 달의 조정할 부분도 함께 봅니다.`:'사용한 주의 기준에서 특별히 두드러지는 달이 없습니다. 매달의 약속과 달라지는 중심 주제는 12개월 흐름에서 설명합니다.')
  months.forEach((r,i)=>out['month-'+(i+1)]={lines:r.lines,evidence:r.evidence})
 }
 return out
}
