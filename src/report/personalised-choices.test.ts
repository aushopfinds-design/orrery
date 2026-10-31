import { describe,it,expect } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildInterpretationPlan, bundleInterpretationPlans } from './interpretation-plan.ts'
import { customerNarrative, bundleNarrative } from './purchase-narrative.ts'
import { roleChoice, businessDivision, relationshipRepair, personalBoundary, monthlyFit } from './personalised-choices.ts'
const a=calculateSaju(CATEGORY_SCENARIOS[0].first),b=calculateSaju(CATEGORY_SCENARIOS[0].second)
const plan=buildInterpretationPlan('year',a,2026)
describe('r24 chart-specific customer choices',()=>{
 it('uses both observed work roles and changes the answer when only daily work changes',()=>{
  const p=plan.primary,same={...p,monthBranchGod:p.monthStemGod}
  const other={...same,monthBranchGod:p.monthStemGod==='食神'?'偏印':'食神'}
  expect(roleChoice(same).en).toContain('clear remit')
  expect(roleChoice(other).en).toContain('whole week')
  expect(roleChoice(same).en).not.toBe(roleChoice(other).en)
  expect(roleChoice(same).ko).not.toBe(roleChoice(other).ko)
  expect(customerNarrative(buildInterpretationPlan('career',a,2026))['working-style'].lines.some(l=>l.en===roleChoice(p).en)).toBe(true)
 })
 it('distinguishes an observed skill-to-sales link from absent outward money',()=>{
  const p=plan.primary
  const linked={...p,resolution:{...p.resolution,circuits:[{code:'output-to-money'}]}} as typeof p
  const hidden={...p,resolution:{...p.resolution,circuits:[]},visibleMoney:[],hiddenMoney:[p.hiddenMoney[0]??{}]} as typeof p
  expect(businessDivision(linked).en).toContain('handover')
  expect(businessDivision(hidden).en).toContain('less visible')
  expect(businessDivision(linked).ko).not.toBe(businessDivision(hidden).ko)
 })
 it('gives each partner the appropriate response without calling shared needs different',()=>{
  const p=plan.primary
  const repair=relationshipRepair({...p,dayBranch:'子'},{...p,dayBranch:'午'})
  expect(repair.en).toContain('time to think');expect(repair.en).toContain('undivided attention')
  expect(relationshipRepair({...p,dayBranch:'未'},{...p,dayBranch:'申'}).en).toContain('first response can be similar')
  expect(relationshipRepair({...p,dayBranch:'午'},{...p,dayBranch:'子'}).en).not.toBe(repair.en)
 })
 it('keeps monthly friction scoped to observed positions and separates repetition from a new theme',()=>{
  const p=plan.primary,m=plan.months[0]
  const neutral={...m,god:p.monthStemGod,comparisons:[]}
  expect(monthlyFit(p,neutral).en).toContain('repeats')
  expect(monthlyFit(p,neutral).en).toContain('No direct friction')
  const work={...neutral,comparisons:[{position:'month',patterns:[{type:'沖',detail:'',layer:'branch'}]}]} as typeof m
  expect(monthlyFit(p,work).en).toContain('adjustment concerns your working arrangements')
  expect(monthlyFit(p,work).en).not.toContain('adjustment concerns both')
  const sections=customerNarrative(plan)
  for(let i=1;i<=12;i++)expect(sections['month-'+i].lines.some(l=>l.en.startsWith('Compared with your usual emphasis'))).toBe(true)
 })
 it('makes the temperament boundary depend on private as well as work roles and gives the collection a joint question',()=>{
  const p=plan.primary
  expect(personalBoundary({...p,dayBranchGod:p.monthStemGod}).en).toContain('follow you home')
  expect(personalBoundary({...p,dayBranchGod:p.monthStemGod==='正財'?'食神':'正財'}).en).toContain('more than simply leaving')
  const collection=bundleNarrative(bundleInterpretationPlans(a,b,2026,2026))
  expect(collection[0].en).toContain('shared time')
  for(const passage of [...collection,roleChoice(p),businessDivision(p),personalBoundary(p)]){expect(passage.ko).toMatch(/[가-힣]/);expect(passage.en).not.toMatch(/undefined|NaN/)}
 })
 it('keeps the new passages usable across four different known and unknown-hour charts',()=>{
  const inputs=[...CATEGORY_SCENARIOS.map(x=>x.first),{year:1980,month:3,day:25,hour:0,minute:0,unknownTime:true,gender:'M' as const,timezone:'Asia/Seoul',latitude:37.5665,longitude:126.978}]
  const choices=new Set<string>()
  for(const input of inputs){
   const chart=calculateSaju(input),year=buildInterpretationPlan('year',chart,2026)
   choices.add(roleChoice(year.primary).en)
   for(const kind of ['complete','career','business','wellbeing','compatibility','year'] as const){
    const sections=customerNarrative(buildInterpretationPlan(kind,chart,2026,b))
    for(const section of Object.values(sections))for(const line of section.lines){
     expect(line.en).not.toMatch(/undefined|NaN|signes|must fit around (.*)must fit around/)
     expect(line.ko).toMatch(/[가-힣]/)
    }
   }
   if(input.unknownTime)expect(year.primary.positions.some(p=>p.position==='hour')).toBe(false)
  }
  expect(choices.size).toBeGreaterThan(2)
 })

})
