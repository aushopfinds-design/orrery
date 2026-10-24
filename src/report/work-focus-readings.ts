import type { SajuResult } from '@orrery/core/types'
import { buildTraditionalCategory } from './traditional-reading.ts'

export function buildCareerReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  return buildTraditionalCategory('career', result, referenceYear)
}
export function buildBusinessReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  return buildTraditionalCategory('business', result, referenceYear)
}
