import { describe, expect, it } from 'vitest'
import { summarizeCalculationVerification, type IndependentPillarAudit } from './independent-personalization.ts'

const chart: IndependentPillarAudit = {
  current: ['甲子', '乙丑', '丙寅', '丁卯'],
  independent: ['甲子', '乙丑', '丙寅', '丁卯'],
}

describe('independent calculation verification summary', () => {
  it('requires every available pillar to agree', () => {
    expect(summarizeCalculationVerification(chart).status).toBe('verified')
  })
  it('does not require an unknown birth hour', () => {
    expect(summarizeCalculationVerification({ ...chart, independent: ['甲子', '乙丑', '丙寅', '戊辰'] }, true))
      .toMatchObject({ status: 'verified', excludedPillars: ['hour'] })
  })
  it('distinguishes an hour-only mismatch from a core-pillar mismatch', () => {
    expect(summarizeCalculationVerification({ ...chart, independent: ['甲子', '乙丑', '丙寅', '戊辰'] }).status).toBe('partial')
    expect(summarizeCalculationVerification({ ...chart, independent: ['甲子', '戊辰', '丙寅', '丁卯'] }).status).toBe('mismatch')
  })
  it('does not report an absent audit as verified', () => {
    expect(summarizeCalculationVerification(undefined).status).toBe('unavailable')
  })
})
