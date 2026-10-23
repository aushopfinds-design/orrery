import type { SajuResult } from '@orrery/core/types'
import { buildTraditionalCategory } from './traditional-reading.ts'

export function buildBalanceReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  return buildTraditionalCategory('wellbeing', result, referenceYear)
}
