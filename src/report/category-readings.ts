import type { SajuResult } from '@orrery/core/types'
import type { FocusCategory } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCompatibilityReading } from './compatibility-reading.ts'
import { buildCareerReading, buildBusinessReading } from './work-focus-readings.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildBalanceReading } from './balance-reading.ts'

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
  const complete = buildCompleteReading(first, referenceYear)
  const compatibility = buildCompatibilityReading(first, second, referenceYear)
  const annual = buildYearAheadReading(first, annualYear)
  const synthesis = `Three views of the same story: ${complete.summary[0].text} Between Person A and Person B, ${compatibility.summary[0].text} For ${annualYear}, ${annual.summary[0].text} Read the timing alongside both people's real choices; a yearly symbol cannot tell either person what the other will do.`
  const fullText = ['THE FATE KEY · Complete Bundle', 'Person A is the subject of the Complete Life Reading and Year Ahead. Love Compatibility compares Person A and Person B.', 'Where the three readings meet', synthesis, complete.fullText, compatibility.fullText, annual.fullText].join('\n\n')
  return { complete, compatibility, annual, synthesis, fullText, wordCount: fullText.split(/\s+/).length }
}
