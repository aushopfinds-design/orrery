import { bundleNarrative } from '../../src/report/purchase-narrative.ts'
import { structureClaimReview, verifyClaimCoverage, sentenceInventory } from './claim-review.ts'
import type { ReviewedClaim } from './claim-review.ts'
import { createHash } from 'node:crypto'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { REPORT_EDITION } from '../../src/report/complete-reading.ts'
import { buildBundleFromPlans } from '../../src/report/category-readings.ts'
import { buildInterpretationPlan, bundleInterpretationPlans } from '../../src/report/interpretation-plan.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategoryFromPlan } from '../../src/report/traditional-reading.ts'
import { koreanReadingFromPlan, koreanBundleOverview } from './korean-reading.ts'
import { plainReadingText } from '../../src/report/reading-text.ts'
import { previewProduct } from '../../src/report/personal-products.ts'
import { orderInput } from '../payments/input.ts'
import { ReviewError } from './config.ts'
import { periodAssessment } from '../../src/report/structural-assessment.ts'
import { resolutionEnglish } from '../../src/report/resolution-language.ts'
import { customerEnglish } from '../../src/report/customer-language.ts'

export interface ReviewBlock { id: string; english: string }
export interface ReviewDocument { id: string; title: string; english: string; koreanOriginal: string; analysisId: string; blocks: ReviewBlock[]; reviewedClaims: ReviewedClaim[]; sentenceReview: { status: string; englishSentences: number; koreanSentences: number; coverage: string } }
/** Both native writers receive the same computed plan. No English-to-Korean provider call. */
export function buildReview(value: unknown, referenceYear = new Date().getUTCFullYear()) {
  let input
  try { input = orderInput(value) } catch { throw new ReviewError('invalid_review_input') }
  const a = calculateSaju(input.first), b = input.second ? calculateSaju(input.second) : undefined
  let sources: { title: string; fullText: string; korean: string; analysisId: string; reviewedClaims: ReviewedClaim[] }[]
  const reviewEvidence: string[] = []
  const id = (plan: unknown) => createHash('sha256').update(JSON.stringify(plan)).digest('hex')
  if (input.kind === 'bundle') {
    const plans = bundleInterpretationPlans(a, b!, input.year!, referenceYear)
    const korean = { overview: koreanBundleOverview(plans), complete: koreanReadingFromPlan(plans.complete), compatibility: koreanReadingFromPlan(plans.compatibility), annual: koreanReadingFromPlan(plans.annual), career: koreanReadingFromPlan(plans.career), love: koreanReadingFromPlan(plans.love) }
    const bundle = buildBundleFromPlans(plans)
    sources = [{ ...bundle.overview, korean: korean.overview, analysisId: id(plans), reviewedClaims: bundleNarrative(plans).map((line,index)=>({id:'customer.bundle.'+index,english:line.en,korean:line.ko})) }, ...(['complete', 'annual', 'compatibility', 'career', 'love'] as const).map(key => ({ ...bundle[key], korean: korean[key], analysisId: id(plans[key]), reviewedClaims: structureClaimReview(plans[key]) }))]
  } else {
    const plan = buildInterpretationPlan(input.kind, a, input.year ?? referenceYear, input.kind === 'compatibility' ? b : undefined)
    const korean = koreanReadingFromPlan(plan)
    const english = input.kind === 'complete' ? buildTraditionalCompleteFromPlan(plan) : buildTraditionalCategoryFromPlan(plan)
    reviewEvidence.push('INTERNAL CALCULATION CROSS-CHECK — NOT CUSTOMER REPORT', ...[...plan.annual.map(point => ({ point, chart: plan.first })), ...plan.months.map(point => ({ point, chart: plan.first })), ...plan.partnerAnnual.map(point => ({ point, chart: plan.second! }))].map(({ point, chart }) => `${point.date}: ${point.pillar} / ${point.yearPillar}. ${customerEnglish(periodAssessment(chart, point.pillar, point.date, point.yearPillar).text)}`), ...resolutionEnglish(plan.primary.resolution).map(claim => claim.text), ...(plan.partner ? resolutionEnglish(plan.partner.resolution).map(claim => claim.text) : []))
    sources = [{ ...english, korean, analysisId: id(plan), reviewedClaims: structureClaimReview(plan) }]
  }
  const documents: ReviewDocument[] = sources.map((source, d) => {
    const english = plainReadingText(source.fullText)
    verifyClaimCoverage(source.reviewedClaims, english, source.korean)
    return { id: `document-${d + 1}`, title: source.title, english, koreanOriginal: source.korean, analysisId: source.analysisId, reviewedClaims: source.reviewedClaims, sentenceReview: { status: 'authored-core-pairs-checked', englishSentences: sentenceInventory(english).length, koreanSentences: sentenceInventory(source.korean).length, coverage: 'Customer chapter passages, monthly passages, longer-period passages and bundle overview are authored in matched English and Korean pairs and checked against both delivered texts. Technical evidence, headings, metadata and method notes are outside this coverage: the whole export is not a complete sentence-by-sentence translation.' },
      blocks: english.split('\n\n').map((text, i) => ({ id: `${d + 1}.${i + 1}`, english: text })) }
  })
  const digest = createHash('sha256').update(JSON.stringify({ edition: REPORT_EDITION, referenceYear, input, documents })).digest('hex')
  return { sourceMode: 'parallel-analysis' as const, kind: input.kind, title: previewProduct(input.kind).title, edition: REPORT_EDITION, referenceYear, digest,
    documents, charts: [a, ...(b ? [b] : [])], reviewEvidence }
}
