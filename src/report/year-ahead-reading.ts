import type { SajuResult } from '@orrery/core/types'
import { buildTraditionalCategory } from './traditional-reading.ts'

export function buildYearAheadReading(result: SajuResult, referenceYear = new Date().getFullYear() + 1) {
  return buildTraditionalCategory('year', result, referenceYear)
}
