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
