import { describe, expect, it } from 'vitest'
import { calculateIndependentAudit, independentPersonalizationEligibility } from './independent-personalization'

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
  it('normalizes the independent response, falls back on failure or delay, and suppresses unknown hours', async () => {
    const current = ['甲子', '乙丑', '丙寅', '丁卯']
    const match = await calculateIndependentAudit({}, current, () => ({ year: { korean: '갑자' }, month: { hanja: '乙丑' }, day: { ganzi: '병인' }, hour: { hanja: '戊辰' } }))
    expect(match?.independent).toEqual(['甲子', '乙丑', '丙寅', '戊辰'])
    expect(independentPersonalizationEligibility(match!).confirmed).toEqual({ year: '甲子', month: '乙丑', day: '丙寅' })
    expect(await calculateIndependentAudit({}, current, () => { throw new Error('engine unavailable') })).toBeUndefined()
    expect(await calculateIndependentAudit({}, current, () => new Promise(resolve => setTimeout(() => resolve({}), 550)))).toBeUndefined()
    const unknown = await calculateIndependentAudit({}, current, () => ({ year: { hanja: '甲子' }, month: { hanja: '乙丑' }, day: { hanja: '丙寅' }, hour: { hanja: '戊辰' } }), true)
    expect(unknown?.current[3]).toBeNull()
    expect(unknown?.independent[3]).toBeNull()
  })
})
