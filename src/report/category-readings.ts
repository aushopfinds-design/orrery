import { bundleInterpretationPlans } from './interpretation-plan.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
import type { SajuResult } from '@orrery/core/types'
import type { FocusCategory } from './category-catalog.ts'
import { buildCompatibilityReading } from './compatibility-reading.ts'
import { buildCareerReading, buildBusinessReading } from './work-focus-readings.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildBalanceReading } from './balance-reading.ts'
import { plainReadingText } from './reading-text.ts'

export { buildCompatibilityReading, buildCareerReading, buildBusinessReading, buildYearAheadReading, buildBalanceReading }
export function buildCategoryReading(kind: FocusCategory, first: SajuResult, options: { second?: SajuResult; year?: number } = {}) {
  const year = options.year ?? new Date().getFullYear()
  switch (kind) {
    case 'compatibility':
      if (!options.second) throw new Error('Two birth charts are needed for compatibility')
      return buildCompatibilityReading(first, options.second, year)
    case 'year': return buildYearAheadReading(first, options.year ?? new Date().getFullYear() + 1)
    case 'career': return buildCareerReading(first, year)
    case 'business': return buildBusinessReading(first, year)
    case 'wellbeing': return buildBalanceReading(first, year)
  }
}
export function buildBundleReading(first: SajuResult, second: SajuResult, annualYear = new Date().getFullYear() + 1, referenceYear = new Date().getFullYear()) {
  return buildBundleFromPlans(bundleInterpretationPlans(first, second, annualYear, referenceYear))
}
export function buildBundleFromPlans(plans: ReturnType<typeof bundleInterpretationPlans>) {
  const annualYear = plans.annual.referenceYear
  const complete = buildTraditionalCompleteFromPlan(plans.complete)
  const compatibility = buildTraditionalCategoryFromPlan(plans.compatibility)
  const annual = buildTraditionalCategoryFromPlan(plans.annual)
  // The life report owns the shared glossary, method and symbolic keepsake appendix.
  // The relationship and annual sections retain their own calculated evidence.
  for (const report of [compatibility, annual]) {
    report.sharedAppendixInLifeReport = true
    report.fullText = report.fullText.split('\n\nYour Everyday Compass')[0]
    report.wordCount = report.fullText.split(/\s+/).length
  }
  const overviewTitle = 'How Do Your Life, Love and Year Connect?'
  const overviewParagraphs = [
    'This reading connects Person A’s life pattern, the relationship between both people and Person A’s selected year. It separates what lasts from what changes, then brings the three readings together around the choices they share.',
    `**The lasting pattern:** ${complete.summary[0].text} ${complete.summary[1].text}`,
    `**The relationship:** ${compatibility.chapters[0].lead} ${compatibility.chapters[0].paragraphs[0]}`,
    `**The annual layer:** ${annual.chapters[0].lead} Read its twelve monthly comparisons as a temporary layer around Person A’s natal pattern.`,
    'These layers answer different questions: the life reading describes the natal pattern and longer cycles; compatibility describes how two charts meet; the annual reading describes a calculated reference year. Repeated themes reinforce a topic, not the probability of a promised event.',
  ]
  const synthesis = plainReadingText(overviewParagraphs.join('\n\n'))
  const overview = { title: overviewTitle, fullText: [overviewTitle, synthesis].join('\n\n'), paragraphs: overviewParagraphs }
  const fullText = ['THE FATE KEY · Your Destiny Collection', overview.fullText, complete.fullText, compatibility.fullText, annual.fullText].join('\n\n')
  const summary = [{ label: 'The life pattern', text: complete.summary[0].text }, { label: 'The connection', text: compatibility.summary[0].text }, { label: `${annualYear} adds`, text: annual.summary[0].text }]
  return { complete, compatibility, annual, overview, summary, synthesis, fullText, wordCount: fullText.split(/\s+/).length }
}
