import { describe, expect, it } from 'vitest'
import { getFourPillars } from '@orrery/core/pillars'

// Hong Kong Observatory 2026 Almanac: 2026 Li Chun at 04:02 HKT = 05:02 KST.
// Independent of the engine's own calculated ingress time.
// The legacy approximation may fail; this is an intentional paid-release gate.
describe('astronomical accuracy: independent 2026 Li Chun', () => {
  it('does not switch the year and month 24 minutes too early', () => {
    expect(getFourPillars(2026, 2, 4, 4, 38).slice(0, 2)).toEqual(['乙巳', '己丑'])
  })
  it('switches at the official minute', () => {
    expect(getFourPillars(2026, 2, 4, 5, 2).slice(0, 2)).toEqual(['丙午', '庚寅'])
  })
})
