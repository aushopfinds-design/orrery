import { customerNarrative, customerPeriod } from '../../src/report/purchase-narrative.ts'
import { customerEnglish } from '../../src/report/customer-language.ts'
import { periodAssessment } from '../../src/report/structural-assessment.ts'
import { PERSONAL_PROFILES } from '../../src/report/reading-profiles.ts'
import { plainReadingText } from '../../src/report/reading-text.ts'
import { PERSONAL_KO } from './native-profile-review.ts'
import { timing } from './korean-reading.ts'
import type { InterpretationPlan } from '../../src/report/interpretation-plan.ts'
import { resolutionEnglish } from '../../src/report/resolution-language.ts'
import { resolutionKorean } from './resolution-korean.ts'
export interface ReviewedClaim { id: string; english: string; korean: string }
/** Authored sentence pairs share a decision ID; no back-translation or provider call. */
export function structureClaimReview(plan: InterpretationPlan): ReviewedClaim[] {
  const structural = [plan.primary, ...(plan.partner ? [plan.partner] : [])].flatMap((subject, index) => {
    const en = resolutionEnglish(subject.resolution), ko = resolutionKorean(subject.resolution)
    if (en.length !== ko.length || en.some((c, i) => c.id !== ko[i].id || !c.text || !ko[i].text)) throw new Error('Unpaired structural interpretation')
    return en.map((c, i) => ({ id: `${index ? 'B' : 'A'}.${c.id}`, english: c.text, korean: ko[i].text }))
  })
  const personal: ReviewedClaim[] = ['complete', 'wellbeing'].includes(plan.kind) ? (['strength', 'pressure'] as const).map(field => ({ id: 'A.personal.' + field, english: plainReadingText(PERSONAL_PROFILES[plan.primary.dayStem][field]), korean: PERSONAL_KO[plan.primary.dayStem][field] })) : []
  const years = plan.kind === 'wellbeing' ? [] : plan.kind === 'year' ? plan.annual.slice(0, 1) : plan.annual
  const periods: ReviewedClaim[] = [...years, ...plan.months].map((point, index) => ({ id: 'A.timing.' + (index < years.length ? 'annual.' : 'monthly.') + point.date, english: customerEnglish(periodAssessment(plan.first, point.pillar, point.date, point.yearPillar).text), korean: timing(point) }))
  if (plan.second && plan.kind === 'compatibility') periods.push(...plan.partnerAnnual.map(point => ({ id: 'B.timing.' + point.date, english: customerEnglish(periodAssessment(plan.second!, point.pillar, point.date, point.yearPillar).text), korean: timing(point) })))
  const activity = Object.entries(customerNarrative(plan)).flatMap(([id,section])=>[...section.lines.map((line,i)=>({id:'customer.'+id+'.'+i,english:line.en,korean:line.ko})),...(section.showGuidance?[{id:'customer.'+id+'.action',english:section.action.en,korean:section.action.ko},{id:'customer.'+id+'.caution',english:section.caution.en,korean:section.caution.ko}]:[])])
  if(plan.kind==='complete')plan.selectedCycles.forEach((_,index)=>activity.push(...customerPeriod(plan,index).map((line,i)=>({id:`customer.period.${index}.${i}`,english:line.en,korean:line.ko}))))
  return [...structural, ...personal, ...periods, ...activity]
}
const normal = (text: string) => text.replace(/\s+/g, ' ').trim()
export function verifyClaimCoverage(claims: ReviewedClaim[], english: string, korean: string) {
  const en = normal(english), ko = normal(korean)
  for (const claim of claims) if (!en.includes(normal(claim.english)) || !ko.includes(normal(claim.korean))) throw new Error(`Missing authored claim: ${claim.id}`)
}
/** An inventory is not an assertion that every sentence has a reviewed translation. */
export function sentenceInventory(text: string) {
  return text.split(/(?<=[.!?。])\s+|\n\n+/).map(s => s.trim()).filter(Boolean).map((text, i) => ({ id: `sentence-${i + 1}`, text }))
}
