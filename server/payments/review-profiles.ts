import type { BirthInput } from '@orrery/core/types'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'

/** Synthetic review charts shared by text-only and PDF review tests. */
export const PRODUCT03_REVIEW_PROFILES: { id: string; first: BirthInput; second: BirthInput }[] = [
  { id: CATEGORY_SCENARIOS[0].id, first: CATEGORY_SCENARIOS[0].first, second: CATEGORY_SCENARIOS[0].second },
  { id: CATEGORY_SCENARIOS[1].id, first: CATEGORY_SCENARIOS[1].first, second: CATEGORY_SCENARIOS[1].second },
  { id: CATEGORY_SCENARIOS[2].id, first: CATEGORY_SCENARIOS[2].first, second: CATEGORY_SCENARIOS[2].second },
  { id: 'sydney-1990', first: { year: 1990, month: 8, day: 14, hour: 8, minute: 30, gender: 'F', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }, second: CATEGORY_SCENARIOS[1].second },
  { id: 'la-1975', first: { year: 1975, month: 12, day: 2, hour: 22, minute: 15, gender: 'M', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 }, second: CATEGORY_SCENARIOS[0].first },
]
