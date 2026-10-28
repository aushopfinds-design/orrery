import { describe,it,expect,vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { reportOverview } from './report-overview.ts'
import { customerEnglish } from './customer-language.ts'
import { buildInterpretationPlan } from './interpretation-plan.ts'
import { customerNarrative } from './purchase-narrative.ts'
import { sharedCareNeed } from './relationship-needs.ts'
import StaticReading from '../publishing/StaticReading.tsx'
const a=calculateSaju(CATEGORY_SCENARIOS[0].first),b=calculateSaju(CATEGORY_SCENARIOS[0].second)
vi.mock('../i18n/index.ts',()=>({useLocale:()=>({locale:'en',t:(key:string)=>key})}))
describe('r23 customer review regressions',()=>{
 it('answers the timing question first without hiding the full decade',()=>{
  const report=buildCategoryReading('career',a,{year:2026})
  const section=report.chapters.find(x=>x.id==='feedback-and-boundaries')!
  expect(section.lead).toMatch(/Changing duties|No direct change/)
  for(let year=2026;year<=2035;year++)expect(report.fullText).toContain(year+':')
 })
 it('does not turn plural signs into spelling errors or damage dates and amounts',()=>{
  expect(customerEnglish('day branches and day stems')).toBe('close-relationship signs and birth-day signs')
  expect(customerEnglish('both natal charts; 2031-12-22; US$100')).toBe('both birth charts; 2031-12-22; US$100')
 })
 it('retains each real cycle boundary and does not repeat the same short theme',()=>{
  const report=buildCompleteReading(a,2026)
  for(const p of report.periods){expect(p.period).toMatch(/[A-Z][a-z]+ \d{4} – [A-Z][a-z]+ \d{4}/);expect(p.headline).not.toMatch(/^(.*) with \1$/)}
  expect(report.periods[0].period).toContain('October 2031')
 })
 it('recognises overlapping needs even when the two branch signs differ',()=>{
  expect(sharedCareNeed('未','申')).toBe(true)
  expect(sharedCareNeed('卯','寅')).toBe(false)
  const sections=customerNarrative(buildInterpretationPlan('compatibility',a,2026,b))
  expect(sections['two-styles'].lines[0].en).toContain('similar need')
  expect(sections['two-styles'].lines[0].en).toContain('your partner values')
 })
 it('prints five concise answers and skips the repeated closing questions and empty situations',()=>{
  for(const kind of ['complete','career','business','year','compatibility','wellbeing'] as const){
   const report=kind==='complete'?buildCompleteReading(a,2026):buildCategoryReading(kind,a,{second:b,year:2027})
   expect(reportOverview(report.chapters)).toHaveLength(5)
   expect(report.fullText).not.toContain('Example birth details')
   expect(report.fullText).toContain('Your reading at a glance')
   const html=renderToStaticMarkup(createElement(StaticReading,{report}))
   expect(html).not.toContain('what is the direct answer?')
   expect(html).not.toContain('id="situations"')
   expect(html).toContain('Traditional colors and number pairs')
  }
 })
 it('selects at most three explained monthly highlights while retaining all twelve labels',()=>{
  const plan=buildInterpretationPlan('year',a,2027),sections=customerNarrative(plan)
  const highlights=sections['annual-cycle-context'].lines
  expect(highlights.length).toBeGreaterThan(1);expect(highlights.length).toBeLessThanOrEqual(4)
  expect(highlights[0].en).toContain('not a ranking of lucky months')
  expect(new Set(highlights.slice(1).map(x=>x.en.split(': ').slice(1).join(': '))).size).toBe(highlights.length-1)
  for(let i=1;i<=12;i++)expect(sections['month-'+i].lines[0].en).toMatch(/Opening|Adjustment|Focus/)
 })
})
