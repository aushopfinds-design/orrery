import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildInterpretationPlan, bundleInterpretationPlans } from './interpretation-plan.ts'
import { customerNarrative, customerPeriod, bundleNarrative } from './purchase-narrative.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
import { RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { koreanReadingFromPlan } from '../../server/admin-review/korean-reading.ts'
import { buildBundleFromPlans } from './category-readings.ts'
const a=calculateSaju(CATEGORY_SCENARIOS[0].first),b=calculateSaju(CATEGORY_SCENARIOS[0].second)
const customerSample=calculateSaju({year:1992,month:6,day:15,hour:9,minute:30,gender:'F',latitude:-33.8688,longitude:151.2093,timezone:'Australia/Sydney'})
const normal=(s:string)=>s.replace(/\s+/g,' ').trim()
describe('Complete customer narrative language coverage, rather than only selected claims',()=>{
 it.each(['complete','career','business','compatibility','year','wellbeing'] as const)('%s has no unpaired chapter, month or practical point',kind=>{
  const plan=buildInterpretationPlan(kind,a,kind==='year'?2027:2026,kind==='compatibility'?b:undefined)
  const report=kind==='complete'?buildTraditionalCompleteFromPlan(plan):buildTraditionalCategoryFromPlan(plan)
  const paired=customerNarrative(plan),ko=normal(koreanReadingFromPlan(plan))
  const chapters=[...report.chapters,...('months'in report?report.months:[]),...('actionPlan'in report?[report.actionPlan]:[])]
  for(const c of chapters){
   const original=paired[c.id], sentences=original.lines.map(l=>normal(l.en))
   expect(original.lines.every(l=>l.ko.length>0)).toBe(true)
   for(const paragraph of [c.lead,...c.paragraphs]){
    const authored=paragraph.replace(/^(?:Direct answer|What this means for you|Important timing|Bottom line):\s*/,'')
    if(kind==='career'&&c.id==='working-style')continue // Product 02 replaces this generic caution with its chart-specific blocker answer.
    const paidQuestionUsesPersonalPressure=kind==='wellbeing'&&c.id==='workload-rhythm'&&paragraph.startsWith('You may ')
    const calculatedRelationshipTiming=kind==='compatibility'&&c.id==='support-each-other'&&paragraph.startsWith('The only period flagged in this five-year comparison is')
    if(calculatedRelationshipTiming) expect(paragraph).toMatch(/\b20\d\d: for (?:you|your partner),/)
    else expect(sentences.some(s=>s.includes(normal(authored)))||paragraph===original.action.en||paidQuestionUsesPersonalPressure, `unpaired ${kind}/${c.id}: ${paragraph}`).toBe(true)
   }
   expect(c.tryThis).toBe(original.action.en)
   expect(c.guidance.watchFor).toEqual([original.caution.en])
   for(const line of original.lines)expect(ko).toContain(normal(line.ko))
  }
  if('periods'in report)report.periods.forEach((p,index)=>{
   const native=customerPeriod(plan,index)
   for(const paragraph of p.paragraphs)expect(native.some(l=>normal(l.en).includes(normal(paragraph)))).toBe(true)
   for(const line of native)expect(ko).toContain(normal(line.ko))
  })
 })
 it('pairs the bundle overview while retaining all three purchased reports and their own years',()=>{
  const plans=bundleInterpretationPlans(a,b,2028,2026),report=buildBundleFromPlans(plans)
  expect(report.overview.paragraphs).toEqual(bundleNarrative(plans).map(l=>l.en))
  expect(report.annual.referenceYear).toBe(2028);expect(report.complete.referenceYear).toBe(2026)
  expect(report.compatibility.subjects[1].input).toEqual(b.input)
 })
})

describe('Targeted customer-answer revisions',()=>{
 it('keeps compatibility answers distinct and ties each conclusion to the two charts',()=>{
  const sections=customerNarrative(buildInterpretationPlan('compatibility',a,2026,b))
  const closeness=sections['chart-patterns'].lines[0].en
  const adjustment=sections['shared-week'].lines[0].en
  expect(closeness).toContain('These are two separate parts of your match.')
  expect(closeness).toContain('For emotional closeness,')
  expect(closeness).toContain('For everyday compatibility,')
  expect(closeness).not.toContain('You share a need for')
  expect(adjustment).toContain('This connection asks you to make room for')
  expect(adjustment).toContain('Choose one small action in your week')
  expect(adjustment).toContain('chart-based prompt')
 })
 it('explains the chart-linked income and support conflict without claiming a real setback',()=>{
  const answers=CATEGORY_SCENARIOS.map(profile=>customerNarrative(buildInterpretationPlan('career',calculateSaju(profile.first),2026))['working-style'].lines.map(line=>line.en))
  const answer=answers.flat().find(line=>/learning or support/i.test(line))!
  expect(answer).toBeDefined()
  expect(answer).toContain('the chart cannot confirm that it is limiting your finances')
  expect((answer.match(/learning or support/gi) ?? [])).toHaveLength(1)
  expect(answer).not.toContain('This is a possible overlap in demands')
 })
 it('keeps Product 01 income limits concise and separates its life-challenge answer from the relationship answer',()=>{
  const plan=buildInterpretationPlan('complete',a,2026)
  plan.primary.visibleMoney.length=0
  plan.primary.hiddenMoney.length=0
  plan.primary.resolution.risks.length=0
  plan.primary.resolution.circuits.length=0
  const sections=customerNarrative(plan)
  const income=sections.money.lines.map(line=>line.en).join(' ')
  expect(income).toContain('does not establish whether salaried or deal-based work is your natural income route')
  expect(income).not.toContain('No direct money sign appears')
  expect(income).not.toContain('There is no direct money sign in the checked')
  expect(income).toContain('These chart clues do not show an amount or guarantee')
  expect(income).not.toMatch(/incomes? amount/i)
  const challenge=sections['life-challenges'].lines.map(line=>line.en).join(' ')
    expect(challenge).toMatch(/Your main life challenge may be (?:keeping|balancing)/)
    expect(challenge).toContain('what your private life needs:')
    expect(challenge).toContain('space to be heard before anyone gives advice')
    expect(challenge).toContain('This is a pattern to manage, not a fixed outcome.')
    expect(sections['life-challenges'].action.en).toContain('Before taking on more work, decide which duty you can drop')
    expect(sections['life-challenges'].action.en).toContain('Keep room for that personal priority outside work')
  expect(challenge).not.toContain('In close relationships, the day sign')
  expect((challenge.match(/being heard before someone offers a solution/g) ?? [])).toHaveLength(0)
  expect(challenge).not.toMatch(/your private life\. The chart places these in separate areas.*When work or private commitments increase/)
 })
})

describe('Buyer review r14: direct answers without repeated warnings or lost dates',()=>{
 it('explains the chart-linked meaning of the life turning-point years in the first answer',()=>{
  const answer=customerNarrative(buildInterpretationPlan('complete',a,2026)).patterns.lines[0].en
  expect(answer).toContain('The strongest chart signal for reconsidering your direction appears in')
  expect(answer).toMatch(/20\d\d: .+ connects with work and close relationships/)
  expect(answer).toContain('not as a promise of a major event')
  expect(customerNarrative(buildInterpretationPlan('complete',a,2026)).patterns.action.en).toContain('List the work change and relationship choice separately')
 })
 it('tailors the Product 01 timing action when the calculated highlight concerns relationships only',()=>{
  const profile=calculateSaju(CATEGORY_SCENARIOS[1].first)
  const section=customerNarrative(buildInterpretationPlan('complete',profile,2026)).patterns
  expect(section.lines[0].en).toContain('connects with close relationships')
  expect(section.action.en).toContain('year-by-year relationship notes')
 })
 it('keeps every year visible in the actual delivered timelines after deduplication',()=>{
  for(const kind of ['complete','career','business'] as const){
   const plan=buildInterpretationPlan(kind,a,2026)
   const report=kind==='complete'?buildTraditionalCompleteFromPlan(plan):buildTraditionalCategoryFromPlan(plan)
   const timeline='actionPlan'in report?report.actionPlan:report.chapters.find(c=>c.id===(kind==='career'?'work-chapters':'business-chapters'))!
   const text=[timeline.lead,...timeline.paragraphs].join(' ')
   for(let year=2026;year<2036;year++)expect(text).toMatch(new RegExp(`${year}(?: yearly comparison|:| —)`))
  }
 })
 it('keeps the annual caution shortlist separate from all twelve actual monthly states',()=>{
  const plan=buildInterpretationPlan('year',a,2027),sections=customerNarrative(plan)
  const report=buildTraditionalCategoryFromPlan(plan)
  expect(report.months).toHaveLength(12)
  expect(new Set(report.months.map(m=>m.lead.replace(m.label+': ',''))).size).toBe(12)
  expect(sections['annual-plan'].lines).toHaveLength(1)
  for(const month of report.months){
   expect([month.lead,...month.paragraphs].join(' ')).toContain('Money:')
   expect([month.lead,...month.paragraphs].join(' ')).toContain('At home:')
   expect(month.evidence.join(' ')).toContain(month.referenceDate)
  }
 })
 it('removes the reviewed engine phrases and puts one common notice in each standalone report',()=>{
  for(const kind of ['complete','career','business','compatibility','year','wellbeing'] as const){
   const sections=customerNarrative(buildInterpretationPlan(kind,a,kind==='year'?2027:2026,kind==='compatibility'?b:undefined))
   const text=Object.values(sections).flatMap(s=>[...s.lines.map(x=>x.en),s.action.en,s.caution.en]).join('\n')
   expect(text).not.toMatch(/competing signals about support|comparison with work.*shows friction|does not establish a dismissal|whole period unlucky|You experiences|A’s .*daily style/)
   const notices=text.match(/About this reading:/g)??[]
   expect(notices).toHaveLength(kind==='complete'?0:1)
  }
 })
 it('answers starting, partnership and expansion with different chart-based content',()=>{
  const s=customerNarrative(buildInterpretationPlan('business',a,2026))
  const sections=['founder-style','offer-test','team-decisions','customer-communication'].map(id=>s[id].lines.map(x=>x.en).join(' '))
  expect(new Set(sections).size).toBe(4)
  expect(sections[1]).toContain('small offer')
  expect(sections[2]).toContain('wider social connections')
  expect(sections[3]).toContain('payment collection')
 })
 it('synthesises simultaneous work and private pressure from the actual monthly comparisons',()=>{
  const plans=bundleInterpretationPlans(a,b,2027,2026)
  const joint=plans.annual.months.filter(p=>['day','month'].every(position=>p.comparisons.some(c=>c.position===position&&c.patterns.some(t=>['沖','刑','害','破'].includes(t.type)))))
  const overview=bundleNarrative(plans).map(x=>x.en).join(' ')
  if(joint.length){
   expect(overview).toContain('clearest overlap')
   for(const p of joint)expect(overview).toContain(new Date(p.date+'T12:00:00Z').toLocaleDateString('en-GB',{month:'long',timeZone:'UTC'}))
  }else expect(overview).not.toContain('clearest overlap')
  expect(overview).not.toContain('The money pattern:')
 })
})

describe('r15 paid-content review fixes',()=>{
 it('removes duplicated timing scaffolding and uses readable monthly practical dates',()=>{
  const p=buildInterpretationPlan('year',a,2027),s=customerNarrative(p)
  const text=Object.values(s).flatMap(x=>[...x.lines.map(l=>l.en),x.action.en,x.caution.en]).join(' ')
  expect(text).not.toMatch(/personal context|The period brings|The focus is|day-of-birth temperament|In 2027-\d\d/)
  expect(s['month-1'].action.en).toContain('In January 2027')
  expect(s['annual-cycle-context'].lines[0].en).not.toContain('The clearest conditional activity openings are May 2027, June 2027, July 2027')
  expect(s['annual-cycle-context'].lines[0].en).toContain('extra-care list separately checks friction and competing demands')
  expect(s['annual-theme'].lines[0].en).toMatch(/^For January 2027 through December 2027, the chart points to .+ at work; in close relationships, .+/)
  expect(s['annual-cycle-context'].lines[0].en).toContain('not a ranking of lucky months')
  expect(s['month-7'].lines[0].en).toContain('Opening —')
  expect(text).not.toContain('manage..')
  for(const id of ['month-5','month-6'])expect(s[id].lines[0].en).toContain('Opening + pressure')
 })
 it('keeps bundle notices compact and includes only timing notes relevant to each category',()=>{
  const bundle=buildBundleFromPlans(bundleInterpretationPlans(a,b,2027,2026))
  expect(bundle.fullText.match(/About this reading:/g) ?? []).toHaveLength(0)
  for(const kind of ['wellbeing','compatibility'] as const){
   const p=buildInterpretationPlan(kind,a,2026,kind==='compatibility'?b:undefined)
   const delivered=buildTraditionalCategoryFromPlan(p).fullText
   if(kind==='wellbeing')expect(delivered).not.toMatch(/15 July|15th|mid-July/)
   else { expect(delivered).toContain('15 July'); expect(delivered).not.toContain('monthly references use the 15th') }
  }
 })
 it('does not silently relabel a cautious period as calm or guaranteed favourable',()=>{
  const s=customerNarrative(buildInterpretationPlan('year',a,2027))
  expect(s['month-4'].lines[0].en).toContain('Opening + pressure')
  const text=Object.values(s).flatMap(s=>s.lines.map(l=>l.en)).join(' ')
  expect(text).not.toMatch(/\bCalm\b|\bSteady\b|guaranteed income|Expect a bigger change/)
 })
})

describe('Customer conclusions before planning advice',()=>{
 it('keeps a readable business conclusion when the hour is unknown, with the limit afterwards',()=>{
  const chart=calculateSaju({...CATEGORY_SCENARIOS[0].first,unknownTime:true})
  const plan=buildInterpretationPlan('business',chart,2026)
  const opening=customerNarrative(plan)['founder-style'].lines[0].en
  expect(opening).not.toMatch(/^.*because the birth time is missing/)
  expect(opening.split('. ')[0]).not.toMatch(/birth time|unknown|missing/)
  expect(opening).toContain('without a birth time')
 })
 it('answers recognition and income questions before listing timing windows',()=>{
  const plan=buildInterpretationPlan('career',a,2026),sections=customerNarrative(plan)
  expect(sections['proof-of-skill'].lines[0].en).toMatch(/Structured employment|Independent work|staged hybrid|stronger answer about the kind of work/)
  expect(sections['money-commitments'].lines[0].en).not.toMatch(/^For paid projects|^Keep a steady income/)
  expect(sections['work-chapters'].lines.map(x=>x.en).join(' ')).toContain('2035')
 })
 it('keeps the integrated future insight distinct from the paid-work and change-year answers',()=>{
  const sections=customerNarrative(buildInterpretationPlan('career',customerSample,2026))
  const money=sections['money-commitments'].lines.map(line=>line.en).join(' ')
  const career=sections['career-plan'].lines.map(line=>line.en).join(' ')
  const work=sections['feedback-and-boundaries'].lines.map(line=>line.en).join(' ')
  expect(money).toContain('2026 (2026 yearly comparison: Opening + pressure — New customers, deals and changing fees stand out)')
  expect(money).toContain('2027 (2027 yearly comparison: Opening + pressure — Regular income and continuing commitments are the main money themes)')
  expect(money).toContain('2034 (2034 yearly comparison: Focus — Skilled, repeatable work takes priority)')
  expect(money).toContain('a paid-work focus, not a clear money opening')
  expect(money).toContain('2035 (2035 yearly comparison: Adjustment — Improving a method or putting an idea into words stands out)')
  expect(money).toContain('a route where caution takes priority')
  expect(money).toContain('work arrangements may also need adjustment')
  expect(career).toContain('customer growth and business development')
  expect(career).not.toContain('clearest chart-linked paid-work routes')
  expect(career).not.toContain('2035-08-27')
  expect(work).toContain('Why 2035 is highlighted here:')
  expect(career).not.toContain('does not predict a payment or income increase')
 })
 it('answers the life reading’s relationship and final-life questions from this chart',()=>{
  const samplePlan=buildInterpretationPlan('complete',customerSample,2026)
  const first=customerNarrative(samplePlan),other=customerNarrative(buildInterpretationPlan('complete',a,2026))
  const love=first.love.lines.map(line=>line.en).join(' ')
  expect(love).toContain(RELATIONSHIP_PROFILES[samplePlan.primary.dayBranch].friction)
  expect(love).not.toContain('the day sign used to read close relationships')
  const collection=buildBundleFromPlans(bundleInterpretationPlans(customerSample,a,2027,2026))
  expect(collection.love.fullText).toContain(`The form of care associated with this chart is ${RELATIONSHIP_PROFILES[samplePlan.primary.dayBranch].need}.`)
  expect(love).not.toMatch(/years that most clearly touch relationship priorities/)
  expect(love).not.toBe(other.love.lines.map(line=>line.en).join(' '))
  const ending=first['next-moves'].lines.at(-1)!.en
  expect(ending).toContain('Your chart keeps three questions separate')
  expect(ending).toMatch(/(Both steady-resource and opportunity-money signs|Steady-resource signs are clearer|Opportunity-money signs are clearer|checked positions do not show a direct money route)/)
  expect(ending).toContain('Your current longer cycle began around')
  expect(ending).toContain('Use the ten-year timeline to compare each year')
  expect(ending).not.toContain('Taken together, your chart centres on')
  expect(ending).not.toBe(other['next-moves'].lines.at(-1)!.en)
 })
 it('keeps all ten yearly themes while removing repeated annual explanations',()=>{
  const plan=buildInterpretationPlan('complete',customerSample,2026)
  const years=customerNarrative(plan)['next-moves'].lines.filter(line=>/^20\d\d:/.test(line.en))
  expect(years).toHaveLength(10)
  expect(new Set(years.map(line=>line.en)).size).toBe(10)
 })
})
