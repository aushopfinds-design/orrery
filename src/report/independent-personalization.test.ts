import { describe, expect, it } from 'vitest'
import { independentPersonalizationEligibility } from './independent-personalization'

describe('independent personalization safety gate', () => {
  it('allows only matching pillars and never independently inferred decade cycles', () => {
    const result = independentPersonalizationEligibility({
      current: ['甲子','乙丑','丙寅','丁卯'],
      independent: ['甲子','乙丑','丙寅','戊辰'],
    })
    expect(result.confirmed).toEqual({ year:'甲子',month:'乙丑',day:'丙寅' })
    expect(result.canUseYearMonthDay).toBe(true)
    expect(result.canUseHour).toBe(false)
    expect(result.canUseDaewoon).toBe(false)
  })
  it('rejects unknown or mismatched core pillars', () => {
    const result = independentPersonalizationEligibility({
      current: ['甲子',null,'丙寅','丁卯'],
      independent: ['甲子','乙丑','丙寅','丁卯'],
    })
    expect(result.canUseYearMonthDay).toBe(false)
    expect(result.canUseHour).toBe(true)
  })
})
