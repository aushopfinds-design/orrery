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
  expect(sections[2]).toContain('wider-social part')
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
