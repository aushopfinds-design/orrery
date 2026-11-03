import type { SajuResult } from '@orrery/core/types'
import { buildTraditionalCategory } from './traditional-reading.ts'

export function buildCompatibilityReading(first: SajuResult, second: SajuResult, referenceYear = new Date().getFullYear()) {
  return buildTraditionalCategory('compatibility', first, referenceYear, second)
}
