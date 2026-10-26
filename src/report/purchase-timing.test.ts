import { describe, it, expect } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { SajuResult } from '@orrery/core/types'
import { getHiddenStems, getJeonggi, getRelation, getFourPillars } from '@orrery/core/pillars'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { pointForPillar } from './traditional-analysis.ts'
import { purchaseTiming, purchaseYears, purchaseMonths } from './purchase-timing.ts'
import { buildReview } from '../../server/admin-review/report.ts'
const base=calculateSaju(CATEGORY_SCENARIOS[0].first)
function symbolic(pillars:string[], cycle:string):SajuResult {
 const day=pillars[1][0]
 return {...base,input:{...base.input,unknownTime:false},pillars:pillars.map((ganzi,i)=>({...base.pillars[i],pillar:{ganzi,stem:ganzi[0],branch:ganzi[1]},stemSipsin:i===1?'本元':getRelation(day,ganzi[0])!.hanja,branchSipsin:getRelation(day,getJeonggi(ganzi[1]))!.hanja,jigang:getHiddenStems(ganzi[1])})) as SajuResult['pillars'],daewoon:[{...base.daewoon[0],ganzi:cycle,stemSipsin:getRelation(day,cycle[0])!.hanja,branchSipsin:getRelation(day,getJeonggi(cycle[1]))!.hanja,startDate:new Date('2020-02-01T12:00:00Z')}]}
}
describe('Activity timing: opportunity requires a personal route and retains contrary evidence',()=>{
 it('distinguishes a capacity-supported customer opening from extra demands for the same money period',()=>{
  const supported=symbolic(['丙午','甲寅','甲寅','壬子'],'丁巳'), limited=symbolic(['丁巳','甲午','庚申','癸酉'],'丁巳')
  const a=purchaseTiming(supported,pointForPillar(supported,'戊戌','2027-07-15'),'business'), b=purchaseTiming(limited,pointForPillar(limited,'戊戌','2027-07-15'),'business')
  expect(a.status).toBe('conditional-opening');expect(a.route).toBe('skill-to-customers')
  expect(b.status).toBe('conditional-opening');expect(b.route).toBeNull()
  expect(a.lines.map(l=>l.en).join(' ')).not.toMatch(/will (?:earn|succeed|get promoted)/)
  expect(a.lines.some(l=>l.id.endsWith('.reason'))).toBe(true)
  expect(b.lines.map(l=>l.en).join(' ')).toContain('Extra duties')
 })
 it('retains a useful activity and a conflicting obligation together without calling the period easy',()=>{
  const chart=symbolic(['丙辰','甲寅','甲寅','壬子'],'丁巳')
  const row=purchaseTiming(chart,pointForPillar(chart,'戊戌','2027-07-15'),'business')
  expect(row.status).toBe('conditional-opening');expect(row.route).toBe('skill-to-customers')
  expect(row.lines.map(l=>l.en).join(' ')).toContain('extra demands to manage')
  expect(row.lines.some(l=>l.id.endsWith('wider-pressure'))).toBe(true)
 })
 it('cannot promote a money symbol or an unavailable longer period into a launch recommendation',()=>{
  const chart=symbolic(['丙午','甲寅','甲寅','壬子'],'丁巳')
  const noCycle={...chart,daewoon:[]}
  expect(purchaseTiming(noCycle,pointForPillar(noCycle,'戊戌','2027-07-15'),'business').route).toBeNull()
  const pressure=symbolic(['丙午','甲寅','甲寅','壬子'],'庚申')
  expect(purchaseTiming(pressure,pointForPillar(pressure,'戊戌','2027-07-15'),'business').route).toBeNull()
 })
 it('retains work-specific clash evidence and never calls it a successful job move',()=>{
  const chart=symbolic(['丙午','甲寅','甲寅','壬子'],'丁巳')
  const row=purchaseTiming(chart,pointForPillar(chart,'庚申','2028-07-15'),'work')
  expect(row.status).toBe('opening-with-caution');expect(row.lines.some(l=>l.id.endsWith('change-month'))).toBe(true)
  expect(row.lines.map(l=>l.en).join(' ')).toContain('A direct clash links this period with your work side')
  expect(row.route).toBeNull()
 })
 it('excludes a guessed birth hour from both timing conclusions and evidence',()=>{
  const known=symbolic(['丙午','甲寅','甲寅','壬子'],'丁巳'), unknown={...known,input:{...known.input,unknownTime:true}}
  const changed={...unknown,pillars:[base.pillars[0],...unknown.pillars.slice(1)] as SajuResult['pillars']}
  expect(purchaseYears(unknown,2026,'business')).toEqual(purchaseYears(changed,2026,'business'))
  expect(purchaseYears(unknown,2026,'business').every(r=>r.route === null)).toBe(true)
 })
 it('keeps the visible theme labels available without inventing an hour or a capacity judgement',()=>{
  const known=symbolic(['壬寅','丁酉','己卯','庚申'],'甲申'), chart={...known,input:{...known.input,unknownTime:true}}
  const rows=['丙午','丁未','己酉'].map((pillar,i)=>purchaseTiming(chart,pointForPillar(chart,pillar,`${2026+i}-07-15`),'life'))
  expect(rows.map(row=>row.status)).toEqual(['extra-care','topic-only','opening-with-caution'])
  expect(rows.every(row=>row.route===null)).toBe(true)
  expect(rows.map(row=>row.lines[0].en)).not.toContain('Timing uncertain')
  expect(rows.map(row=>row.status)).toEqual(['丙午','丁未','己酉'].map((pillar,i)=>purchaseTiming(known,pointForPillar(known,pillar,`${2026+i}-07-15`),'life').status))
 })
 it('does not make a July month label look like an annual reading',()=>{
  expect(purchaseMonths(base,2027)[6].lines[0].en).toContain('July 2027')
  expect(purchaseYears(base,2027,'work')[0].lines[0].en).toMatch(/^2027:/)
 })
 it('caps the full ten-year window at the supported calendar end',()=>{
  expect(purchaseYears(base,2099,'work').map(r=>r.date.slice(0,4))).toEqual(['2099','2100'])
 })
})
describe('24 distinct international buyers: ten-year facts and twelve months reach both languages',()=>{
 it.each(Array.from({length:24},(_,i)=>i))('buyer %i retains source dates, uncertainty and paired added content',i=>{
  const input={...CATEGORY_SCENARIOS[i%2].first,year:1960+i,month:1+i%12,day:5+i%20,unknownTime:i%5===0}
  const chart=calculateSaju(input)
  for(const row of purchaseYears(chart,2026,'work')){
   const pillar=getFourPillars(Number(row.date.slice(0,4)),7,15,12,0)[0]
   expect(row.evidence.join(' ')).toContain(pillar)
   expect(row.lines.every(l=>l.en&&l.ko)).toBe(true)
   if(input.unknownTime)expect(row.route).toBeNull()
  }
  for(const kind of ['complete','career','business','year'] as const){
   const review=buildReview({kind,first:input,...(kind==='year'?{year:2027}:{})},2026)
   const doc=review.documents[0], claims=doc.reviewedClaims.filter(c=>c.id.startsWith('customer.'))
   expect(claims.length).toBeGreaterThan(10)
   const normal=(s:string)=>s.replace(/\s+/g,' ')
   for(const claim of claims){expect(normal(doc.english)).toContain(normal(claim.english));expect(normal(doc.koreanOriginal)).toContain(normal(claim.korean))}
   expect(doc.english).not.toMatch(/NaN|undefined|guaranteed profit|will get married/)
  }
 },15000)
})
