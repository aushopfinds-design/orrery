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
  const fullText = ['THE FATE KEY · Your Destiny Collection', 'Person A is the subject of the Your Life, Your Destiny and What Awaits You This Year?. Are We Meant to Be? compares Person A and Person B.', complete.fullText, compatibility.fullText, annual.fullText].join('\n\n')
  return { complete, compatibility, annual, fullText, wordCount: fullText.split(/\s+/).length }
}
