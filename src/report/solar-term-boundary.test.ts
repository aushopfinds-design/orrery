import { describe, expect, it } from 'vitest'
import { calcSolarTerms, getFourPillars } from '@orrery/core/pillars'

// Regression checks at the exact minute of a boundary returned by this engine.
// These verify transition consistency, NOT independent astronomical accuracy.
describe('solar-term minute-boundary regression', () => {
  it.each([
    [2026, 2, 6, 12, 0], // near Ipchun
    [2026, 3, 7, 12, 0], // near Gyeongchip
    [2026, 4, 7, 12, 0], // near Cheongmyeong
    [2026, 8, 9, 12, 0], // near Ipchu
  ])('month pillar changes at calculated ingress around %i-%i', (y,m,d,h,min) => {
    const t = calcSolarTerms(y,m,d,h,min)
    const instant = Date.UTC(t.ingiYear,t.ingiMonth-1,t.ingiDay,t.ingiHour,t.ingiMin)
    const read = (offsetMinutes: number) => {
      const dt = new Date(instant + offsetMinutes*60000)
      return getFourPillars(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate(),dt.getUTCHours(),dt.getUTCMinutes())
    }
    const before = read(-1), at = read(0), after = read(1)
    expect(before[1]).not.toBe(after[1])
    expect(at[1]).toBe(after[1])
    expect(before[2]).toBe(after[2]) // same day for typical daytime boundary; may differ at midnight
  })
})
