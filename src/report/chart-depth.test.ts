import { describe,it,expect } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildInterpretationPlan } from './interpretation-plan.ts'
import { capacityBasis,moneyDepth } from './chart-depth.ts'
import { customerNarrative } from './purchase-narrative.ts'
import { buildReview } from '../../server/admin-review/report.ts'
const base=CATEGORY_SCENARIOS[0].first
const subjects=Array.from({length:24},(_,i)=>buildInterpretationPlan('business',calculateSaju({...base,year:1960+i,month:i%12+1,day:5+i%20,unknownTime:i%5===0}),2026).primary)
describe('r16 interpretation depth without new fortune claims',()=>{
 it('explains the actually observed money-support conflict only when it exists',()=>{
  for(const p of subjects){
   const text=moneyDepth(p,'business')
   expect(text.en).toBeTruthy();expect(text.ko).toBeTruthy()
   if(p.resolution.risks.some(r=>r.code==='money-versus-resource')){
    expect(text.en).toContain('Outward money signs sit beside learning-and-support signs')
    expect(moneyDepth(p,'career').en).not.toBe(text.en)
    expect(moneyDepth(p,'life').en).not.toBe(text.en)
   }else expect(text.en).not.toContain('Outward money signs sit beside learning-and-support signs')
   expect(text.en).not.toMatch(/will (earn|lose)|guaranteed|wealth score/)
  }
 })
 it('keeps unknown-hour and exceptional structures out of an invented capacity verdict',()=>{
  for(const p of subjects){
   const text=capacityBasis(p)
   if(p.strength.signals.unknownTime)expect(text.en).toContain('missing birth hour')
   else if(p.strength.signals.exceptional)expect(text.en).toContain('withholding a strong-or-weak verdict')
   else expect(text.en).toContain(p.strength.signals.seasonalSupport?'season supports it':'season does not directly support it')
  }
 })
 it('publishes consistent advice at every decision point and pairs every delivered claim',()=>{
  const input={...base,unknownTime:false},chart=calculateSaju(input),plan=buildInterpretationPlan('business',chart,2026),sections=customerNarrative(plan)
  expect(sections['founder-style'].showGuidance).toBe(true)
  expect(sections['team-decisions'].showGuidance).toBe(true)
  const doc=buildReview({kind:'business',first:input},2026).documents[0]
  const ids=doc.reviewedClaims.map(c=>c.id)
  expect(ids).toContain('customer.founder-style.action')
  expect(ids).toContain('customer.team-decisions.action')
  expect(doc.english).not.toContain('Turnover, profit and money available to pay bills are different')
  for(const c of doc.reviewedClaims){expect(doc.english.replace(/\s+/g,' ')).toContain(c.english.replace(/\s+/g,' '));expect(doc.koreanOriginal.replace(/\s+/g,' ')).toContain(c.korean.replace(/\s+/g,' '))}
 })
})
