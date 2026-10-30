import { splitDeliveredReading, CALCULATION_NOTES } from './report-delivery.ts'
import { bundleNarrative } from './purchase-narrative.ts'
import { bundleInterpretationPlans } from './interpretation-plan.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategory, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
import type { SajuResult } from '@orrery/core/types'
import type { FocusCategory } from './category-catalog.ts'
import { buildCompatibilityReading } from './compatibility-reading.ts'
import { buildCareerReading, buildBusinessReading } from './work-focus-readings.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildBalanceReading } from './balance-reading.ts'
import { plainReadingText } from './reading-text.ts'

export { buildCompatibilityReading, buildCareerReading, buildBusinessReading, buildYearAheadReading, buildBalanceReading }
export function buildCategoryReading(kind: FocusCategory, first: SajuResult, options: { second?: SajuResult; year?: number; periodStart?: string; periodTimezone?: string } = {}) {
  const year = options.year ?? new Date().getFullYear()
  switch (kind) {
    case 'compatibility':
      if (!options.second) throw new Error('Two birth charts are needed for compatibility')
      return buildCompatibilityReading(first, options.second, year)
    case 'year': return buildYearAheadReading(first, options.year ?? new Date().getFullYear() + 1, options.periodStart, options.periodTimezone)
    case 'career': return buildCareerReading(first, year)
    case 'love': return buildTraditionalCategory(kind, first, year)
    case 'business': return buildBusinessReading(first, year)
    case 'wellbeing': return buildBalanceReading(first, year)
  }
}
export function buildBundleReading(first: SajuResult, second: SajuResult, annualYear = new Date().getFullYear() + 1, referenceYear = new Date().getFullYear(), periodStart?: string, periodTimezone?: string) {
  return buildBundleFromPlans(bundleInterpretationPlans(first, second, annualYear, referenceYear, periodStart, periodTimezone))
}
export function buildBundleFromPlans(plans: ReturnType<typeof bundleInterpretationPlans>) {
  const complete = buildTraditionalCompleteFromPlan(plans.complete)
  const compatibility = buildTraditionalCategoryFromPlan(plans.compatibility)
  const annual = buildTraditionalCategoryFromPlan(plans.annual)
  const career = buildTraditionalCategoryFromPlan(plans.career)
  const love = buildTraditionalCategoryFromPlan(plans.love)
  // The life report owns the shared glossary, method and symbolic keepsake appendix.
  // The relationship and annual sections retain their own calculated evidence.
  for (const report of [compatibility, annual, career, love]) {
    report.sharedAppendixInLifeReport = true
    const parts = splitDeliveredReading(report.fullText)
    report.fullText = parts.body.split('\n\nYour Everyday Compass')[0] + '\n\n' + CALCULATION_NOTES + '\n\n' + parts.appendix.split('\n\nChart terms in plain English')[0]
    report.wordCount = report.fullText.split(/\s+/).length
  }
  const overviewTitle = 'How Do Your Life, Love, Work and Year Connect?'
  const overviewParagraphs = bundleNarrative(plans).map(line=>line.en)
  const synthesis = plainReadingText(overviewParagraphs.join('\n\n'))
  const overview = { title: overviewTitle, fullText: [overviewTitle, synthesis].join('\n\n'), paragraphs: overviewParagraphs }
  const reports = [complete, annual, compatibility, career, love].map(report => ({ title: report.title, ...splitDeliveredReading(report.fullText) }))
  const fullText = ['THE FATE KEY · Complete Package', overview.fullText, ...reports.map(report => report.body), CALCULATION_NOTES, ...reports.flatMap(report => [report.title, report.appendix])].join('\n\n')
  const summary = [{ label: 'Life', text: complete.summary[0].text }, { label: 'Year', text: annual.summary[0].text }, { label: 'Our Love', text: compatibility.summary[0].text }, { label: 'Career & Money', text: career.summary[0].text }, { label: 'My Love', text: love.summary[0].text }]
  return { complete, compatibility, annual, career, love, overview, summary, synthesis, fullText, wordCount: fullText.split(/\s+/).length }
}
