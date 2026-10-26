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
 const opens=(r:Row)=>Boolean(r.route)
 const dates=(rows:Row[])=>rows.map(r=>r.date.slice(0,4)).join(', ')
 const put=(id:string,en:string,ko:string,rows:Row[]=[],detail:boolean|'highlight'=false)=>{
  const lines:TimingSentence[]=[{id:id+'.intro',en,ko}]
  const explained=new Set<string>()
  for(const row of rows){
   if(detail==='highlight'){
    const reasons=row.lines.filter(l=>/\.(change-|background-pressure|wider-pressure)/.test(l.id)).map(l=>({en:l.en.split(/(?<=[.!?])\s/)[0],ko:l.ko.split(/(?<=[.!?])\s/)[0]}))
    if(reasons.length)lines.push({id:id+'.'+row.date,en:`Why ${row.date.slice(0,4)} is highlighted here: ${reasons.map(r=>r.en).join(' ')}`,ko:`여기서 ${row.date.slice(0,4)}년을 꼽은 이유: ${reasons.map(r=>r.ko).join(' ')}`})
   }else if(detail){
    const selected=row.lines.filter(l=>/\.(verdict|opening|reason|area-context|change-day|change-month|background-pressure|wider-pressure|caution)$/.test(l.id)).filter(l=>{if(l.id.endsWith('.verdict'))return true;if(explained.has(l.en))return false;explained.add(l.en);return true})
    lines.push({id:id+'.'+row.date,en:selected.map(l=>l.en).join(' '),ko:selected.map(l=>l.ko).join(' ')})
   }
  }
  out[id]={lines,evidence:[...new Set(rows.flatMap(r=>r.evidence))]}
 }
 const opportunities=money.filter(opens),workOpenings=years.filter(opens)
 const moneyThemes=money.filter(row=>row.evidence.some(fact=>/reference stem.*(?:正財|偏財)|principal inner stem.*(?:正財|偏財)/.test(fact)))
 const themeYears=dates(moneyThemes)
 // Editorial priority is the count of observed conflicts, not an invented luck score.
 // All periods remain in the full timeline. Highlights never relabel omitted periods as safe.
 const priority=(rows:Row[])=>rows.map((r,i)=>({r,i,n:r.lines.filter(l=>/\.(change-|background-pressure|wider-pressure)/.test(l.id)).length})).sort((a,b)=>b.n-a.n||a.i-b.i).slice(0,3).map(x=>x.r).sort((a,b)=>a.date.localeCompare(b.date))
 const care=years.filter(r=>['extra-care','opening-with-caution'].includes(r.status))
 if(plan.kind==='complete'){
  const changed=years.filter(r=>r.lines.some(l=>/\.change-(day|month)$/.test(l.id))),highlights=priority(changed)
  put('patterns',highlights.length?`Give ${dates(highlights)} a closer look when planning a change. These stand out because the reading finds more changes to work or close relationships; the full timeline below keeps the other years in view.`:`No work or relationship clash stands out in this ten-year comparison. Your timeline still shows how the focus changes from year to year.`,highlights.length?`변화를 계획할 때는 ${dates(highlights)}년을 먼저 살펴봅니다. 일이나 가까운 관계에서 변화가 더 두드러지는 해이며, 다른 해의 흐름도 아래 전체 일정에 남겨 두었습니다.`:'이번 10년 비교에서는 일이나 관계에 부딪히는 변화가 두드러지지 않습니다. 매년 달라지는 중심 주제는 전체 흐름에서 설명합니다.',highlights,'highlight')
  put('next-moves',`Your ${plan.referenceYear}–${plan.referenceYear+years.length-1} timeline: each year below gives the main opportunity or pressure, the reason and what needs attention.`,` ${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 전체 흐름입니다. 각 해의 기회나 부담, 그 이유와 주의할 점을 함께 읽습니다.`,years,true)
 }
 if(plan.kind==='career'){
  const recognition=workOpenings.filter(r=>['expertise-to-role','support-for-role'].includes(r.route??''))
  put('proof-of-skill',recognition.length?`Your knowledge and work responsibilities connect more clearly in ${dates(recognition)}. These are the years to examine for a more demanding or better recognised role.`:`No promotion year is established. Use the yearly work themes below to decide when to present completed work, apply for a role or ask for clearer authority.`,recognition.length?`${dates(recognition)}년에는 지식과 업무 책임의 연결이 더 뚜렷합니다. 더 중요한 역할이나 인정을 살펴볼 해입니다.`:`승진할 해를 정할 근거는 부족합니다. 아래의 연도별 업무 주제를 보고 완성한 결과물을 보여 주거나 지원하거나 권한을 요청할 때를 검토합니다.`,recognition.slice(0,3))
  const changed=years.filter(r=>r.lines.some(l=>l.id.endsWith('change-month')))
  put('feedback-and-boundaries',changed.length?`Changing duties or working arrangements stand out in ${dates(changed)}. These years are more relevant to a job-change question than years with only a general money theme.`:`No direct change to work arrangements stands out in this window. A decision to move would need to rest more on the actual role than on a clear timing signal.`,changed.length?`${dates(changed)}년에는 업무나 일하는 방식의 변화가 두드러집니다. 단순히 재물 주제만 있는 해보다 이직 질문과 더 관련이 있는 시기입니다.`:'이 기간에는 업무 방식의 직접적인 변화가 두드러지지 않습니다. 이직 판단에서는 시기 신호보다 실제 자리를 더 중요하게 봐야 합니다.',priority(changed),'highlight')
  put('money-commitments',opportunities.length?`For paid projects or customer work, examine ${dates(opportunities)}. These periods connect earning activity with your existing skills; payment terms and workload remain part of the judgement.`:`${themeYears?`Money and customer themes appear in ${themeYears}. Use those years to review paid work and customer offers. `:``}These are earning themes, not a prediction of a pay rise. Agree the fee, hours and costs before accepting more work.`,opportunities.length?`유료 업무나 고객을 통한 돈벌이는 ${dates(opportunities)}년을 살펴볼 수 있습니다. 가진 기술과 수입 활동이 연결되며 대금 조건과 업무량도 함께 판단합니다.`:`${themeYears?`${themeYears}년에 재물과 고객의 주제가 나타납니다. 유료 업무와 고객 제안을 검토하는 계기로 삼습니다. `:``}급여 인상을 예측하는 표시는 아닙니다. 추가 업무를 받기 전에 대금과 시간, 비용을 정합니다.`)
  put('work-chapters',`Your ${plan.referenceYear}–${plan.referenceYear+years.length-1} career timeline follows how the work changes, not a list of lucky job titles.`,`${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 직업 흐름입니다. 행운의 직업명을 고르기보다 업무의 변화를 따라 읽습니다.`,years,true)
 }
 if(plan.kind==='business'){
  put('offer-test',opportunities.length?`A small launch or paid trial is worth examining in ${dates(opportunities)}. The opening is between what you can produce and what you can sell.`:`${themeYears?`Customer and money themes appear in ${themeYears}. Treat them as prompts to test a paid offer. `:``}Start with a small offer you can deliver repeatedly; the reading does not establish a safe date for a larger launch.`,opportunities.length?`${dates(opportunities)}년에는 작은 시작이나 유료 시험 판매를 살펴볼 수 있습니다. 만들 수 있는 것과 판매할 수 있는 것이 연결되는 기회입니다.`:`${themeYears?`${themeYears}년에 고객과 재물의 주제가 나타납니다. 작은 유료 상품을 시험하는 계기로 삼습니다. `:``}반복해서 제공할 수 있는 작은 상품부터 시작합니다. 큰 창업에 안전한 날짜를 정하는 풀이는 아닙니다.`)
  put('customer-communication',opportunities.length?`Growth opportunities appear in ${dates(opportunities)}. The question is whether the business can repeat a good result at a larger scale, not simply attract more orders.`:`${themeYears?`Review customer demand and pricing in ${themeYears}. `:``}Expand after repeat sales cover delivery costs and the work can be completed without relying entirely on you. A money theme alone is not an expansion signal.`,opportunities.length?`${dates(opportunities)}년에 성장의 기회를 살펴봅니다. 주문만 늘리는 것보다 좋은 결과를 더 큰 규모에서도 반복할 수 있는지가 핵심입니다.`:`${themeYears?`${themeYears}년에 고객 수요와 가격을 점검합니다. `:``}반복 판매가 납품 비용을 충당하고 자신에게 전적으로 기대지 않아도 업무를 마칠 수 있을 때 확장을 검토합니다. 재물 주제만으로 확장을 정하지 않습니다.`)
  const key=priority(care)
  put('business-plan',key.length?`Give commitments in ${dates(key)} the closest review. These are the most prominent competing demands in this comparison; other years still have their own cautions in the full timeline.`:`No period stands out under the specific extra-care checks used here. Review the business model and actual commitments on their own merits.`,key.length?`${dates(key)}년의 약속을 가장 먼저 살펴봅니다. 이번 비교에서 서로 겹치는 부담이 더 두드러진 해입니다. 다른 해의 주의점도 전체 흐름에 남아 있습니다.`:'사용한 주의 기준에서 특별히 두드러지는 시기가 없습니다. 사업 방식과 실제 약속의 조건을 따로 살펴봅니다.',key,'highlight')
  put('business-chapters',`Your ${plan.referenceYear}–${plan.referenceYear+years.length-1} business timeline separates finding customers, delivering the work and managing shared commitments.`,`${plan.referenceYear}–${plan.referenceYear+years.length-1}년의 사업 흐름입니다. 고객 확보와 납품, 공동 책임을 나누어 살펴봅니다.`,years,true)
 }
 if(plan.kind==='year'){
  const months=purchaseMonths(plan.first,plan.referenceYear),good=months.filter(opens),careful=months.filter(r=>['extra-care','opening-with-caution'].includes(r.status)),key=priority(careful)
  const labels=(rows:Row[])=>rows.map(r=>new Date(r.date+'T12:00:00Z').toLocaleDateString('en-GB',{month:'long',timeZone:'UTC'})).join(', ')
  const koLabels=(rows:Row[])=>rows.map(r=>Number(r.date.slice(5,7))+'월').join('·')
  const openingThemes=months.filter(row=>row.status==='conditional-opening')
  const selected=(good.length?good:openingThemes).slice(0,3)
  const why=(r:Row)=>r.lines[0]
  const picks=selected.map(r=>({en:`${labels([r])}: ${why(r).en.replace(/^.*? — /,'')}`,ko:`${koLabels([r])}월: ${why(r).ko}`}))
  put('annual-cycle-context',selected.length?`Start with ${labels(selected)} for the specific activities below. These are selected reading highlights, not a ranking of lucky months. ${good.length?'They connect your existing chart with an activity and its longer-period setting.':'No month passes the separate activity-opening check; these are quieter work-and-relationship comparisons only.'}`:`No clear activity opening or quieter comparison stands out. Use the full monthly reading to identify the specific commitments needing adjustment.`,selected.length?`${koLabels(selected)}월의 활동부터 살펴봅니다. 행운 순위가 아니라 선택한 핵심 주제입니다. ${good.length?'타고난 특징과 활동, 긴 흐름이 연결되는 부분입니다.':'별도의 활동 기회 기준을 통과한 달이 없어 일과 관계의 비교에서 상대적으로 조용한 달만 꼽았습니다.'}`:'뚜렷한 활동 기회나 상대적으로 조용한 달을 꼽기 어렵습니다. 전체 월별 풀이에서 조정할 약속을 확인합니다.')
  for(const [i,pick] of picks.entries())out['annual-cycle-context'].lines.push({id:'annual-cycle-context.pick-'+i,...pick})

  put('annual-plan',key.length?`Put ${labels(key)} first on your review list. They carry more overlapping demands in this reading. Start with these, then use the full monthly table to keep the remaining adjustments in view.`:`No month stands out under these extra-care checks. The twelve-month overview still shows the commitments and changing focus of each month.`,key.length?`${koLabels(key)}을 먼저 확인할 달로 꼽습니다. 이번 풀이에서 부담이 더 겹치는 달입니다. 이 달부터 살피고 전체 표에서 나머지 달의 조정할 부분도 함께 봅니다.`:'사용한 주의 기준에서 특별히 두드러지는 달이 없습니다. 매달의 약속과 달라지는 중심 주제는 12개월 흐름에서 설명합니다.')
  months.forEach((r,i)=>out['month-'+(i+1)]={lines:r.lines,evidence:r.evidence})
 }
 return out
}
