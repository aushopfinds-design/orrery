import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildInterpretationPlan, bundleInterpretationPlans } from './interpretation-plan.ts'
import { customerNarrative, customerPeriod, bundleNarrative } from './purchase-narrative.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
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
    expect(sentences.some(s=>s.includes(normal(authored)))||paragraph===original.action.en).toBe(true)
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

describe('Buyer review r14: direct answers without repeated warnings or lost dates',()=>{
 it('keeps every year visible in the actual delivered timelines after deduplication',()=>{
  for(const kind of ['complete','career','business'] as const){
   const plan=buildInterpretationPlan(kind,a,2026)
   const report=kind==='complete'?buildTraditionalCompleteFromPlan(plan):buildTraditionalCategoryFromPlan(plan)
   const timeline='actionPlan'in report?report.actionPlan:report.chapters.find(c=>c.id===(kind==='career'?'work-chapters':'business-chapters'))!
   const text=[timeline.lead,...timeline.paragraphs].join(' ')
   for(let year=2026;year<2036;year++)expect(text).toContain(`${year}:`)
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
  expect(s['annual-cycle-context'].lines[0].en).toContain('Start with May 2027, June 2027, July 2027')
  expect(s['annual-cycle-context'].lines[0].en).toContain('not a ranking of lucky months')
  expect(s['month-7'].lines[0].en).toContain('Opening —')
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
 it('separates this chart’s paid-work periods from career-change periods and the 2035 cycle shift',()=>{
  const sections=customerNarrative(buildInterpretationPlan('career',customerSample,2026))
  const money=sections['money-commitments'].lines.map(line=>line.en).join(' ')
  const career=sections['career-plan'].lines.map(line=>line.en).join(' ')
  const work=sections['feedback-and-boundaries'].lines.map(line=>line.en).join(' ')
  expect(money).toContain('2026 (New customers, deals and changing fees stand out)')
  expect(money).toContain('2027 (Regular income and continuing commitments are the main money themes)')
  expect(money).toContain('2034 (Skilled, repeatable work takes priority)')
  expect(money).toContain('a paid-work focus, not a clear money opening')
  expect(money).toContain('2035 (Improving a method or putting an idea into words stands out)')
  expect(money).toContain('a route where caution takes priority')
  expect(money).toContain('work arrangements may also need adjustment')
  expect(work).toContain('Why 2035 is highlighted here:')
  expect(career).toContain('clearest chart-linked paid-work routes are 2026, 2027')
  expect(career).toContain('2034 is a paid-skill focus, not a clear money opening')
  expect(career).toContain('2035 has a possible paid-work route, but caution takes priority')
  expect(career).toContain('Work-duty or arrangement changes are separately marked in 2026, 2032, 2033, 2035')
  expect(career).toContain('2035-08-27')
  expect(career).toContain('壬寅')
  expect(career).toContain('辛丑')
  expect(career).toContain('training and dependable support')
  expect(career).toContain('recognised responsibility and clear standards shaping daily responsibilities')
  expect(career).toContain('does not predict a payment or income increase')
 })
 it('answers the life reading’s relationship and final-life questions from this chart',()=>{
  const samplePlan=buildInterpretationPlan('complete',customerSample,2026)
  const first=customerNarrative(samplePlan),other=customerNarrative(buildInterpretationPlan('complete',a,2026))
  const love=first.love.lines.map(line=>line.en).join(' ')
  expect(love).toContain(`to ${samplePlan.primary.dayBranch}, the day sign used to read close relationships`)
  expect(love).toMatch(/years that most clearly touch relationship priorities/)
  expect(love).toMatch(/marriage or separation|partner, marriage or separation/)
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
