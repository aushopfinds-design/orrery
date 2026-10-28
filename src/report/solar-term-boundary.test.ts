import { describe, expect, it } from 'vitest'
import { getFourPillars } from '@orrery/core/pillars'
import { getSolarTermEvent } from '../../packages/core/src/solar-terms.ts'

function pillarsAt(clockMs: number, offsetMinutes = 0, longitude?: number) {
  const date = new Date(clockMs + offsetMinutes * 60_000)
  const solarTermClock = longitude == null ? undefined : { longitude }
  return getFourPillars(
    date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), undefined, solarTermClock,
  )
}

describe('ephemeris minute-boundary regression', () => {
  it('switches month pillars at every ingress from 1900 through 2100', () => {
    let checked = 0
    for (let year = 1900; year <= 2100; year++) {
      for (let index = 0; index < 24; index += 2) {
        const term = getSolarTermEvent(year, index)
        const before = pillarsAt(term.localClockMs, -1)
        const at = pillarsAt(term.localClockMs)
        expect(at[1], `month pillar at ${year} term ${index}`).not.toBe(before[1])
        if (index === 0) expect(at[0], `year pillar at Li Chun ${year}`).not.toBe(before[0])
        checked++
      }
    }
    expect(checked).toBe(201 * 12)
  })

  it('places foreign birth term boundaries in that location’s apparent solar clock', () => {
    const longitude = -74.006
    const term = getSolarTermEvent(2026, 2, { longitude })
    const before = pillarsAt(term.localClockMs, -1, longitude)
    const at = pillarsAt(term.localClockMs, 0, longitude)
    expect(at[1]).not.toBe(before[1])
  })
})
