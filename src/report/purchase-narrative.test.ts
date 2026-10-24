import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildInterpretationPlan, bundleInterpretationPlans } from './interpretation-plan.ts'
import { customerNarrative, customerPeriod, bundleNarrative } from './purchase-narrative.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
import { koreanReadingFromPlan } from '../../server/admin-review/korean-reading.ts'
import { buildBundleFromPlans } from './category-readings.ts'
const a=calculateSaju(CATEGORY_SCENARIOS[0].first),b=calculateSaju(CATEGORY_SCENARIOS[0].second)
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
   for(const paragraph of [c.lead,...c.paragraphs])expect(sentences.some(s=>s.includes(normal(paragraph)))||paragraph===original.action.en).toBe(true)
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
   expect(text.match(/About this reading:/g)).toHaveLength(1)
  }
 })
 it('answers starting, partnership and expansion with different chart-based content',()=>{
  const s=customerNarrative(buildInterpretationPlan('business',a,2026))
  const sections=['founder-style','offer-test','team-decisions','customer-communication'].map(id=>s[id].lines.map(x=>x.en).join(' '))
  expect(new Set(sections).size).toBe(4)
  expect(sections[1]).toContain('small offer')
  expect(sections[2]).toContain('wider contacts')
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
  expect(s['annual-cycle-context'].lines[0].en).toContain('Opportunity with pressure: May, June, July')
  for(const id of ['month-5','month-6','month-7'])expect(s[id].lines[0].en).toContain('Opening + pressure')
 })
 it('keeps the common note once in the actual bundle, with no month-method note in personality or compatibility',()=>{
  const bundle=buildBundleFromPlans(bundleInterpretationPlans(a,b,2027,2026))
  expect(bundle.fullText.match(/About this reading:/g)).toHaveLength(1)
  for(const kind of ['wellbeing','compatibility'] as const){
   const p=buildInterpretationPlan(kind,a,2026,kind==='compatibility'?b:undefined)
   const note=customerNarrative(p)[p.sections[0].id].lines.find(l=>l.en.startsWith('About this reading:'))!
   expect(note.en).not.toMatch(/15 July|15th|mid-July/)
  }
 })
 it('does not silently relabel a cautious period as calm or guaranteed favourable',()=>{
  const s=customerNarrative(buildInterpretationPlan('year',a,2027))
  expect(s['month-4'].lines[0].en).toContain('Adjustment')
  const text=Object.values(s).flatMap(s=>s.lines.map(l=>l.en)).join(' ')
  expect(text).not.toMatch(/\bCalm\b|\bSteady\b|guaranteed income|Expect a bigger change/)
 })
})
