import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { getBranchRelation, getFourPillars } from '@orrery/core/pillars'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { explainCalculation } from './calculation-notes.ts'
import { pairFacts } from './category-shared.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildCompleteReading } from './complete-reading.ts'

const input = CATEGORY_SCENARIOS[0].first

describe('Customer PDF review regressions', () => {
  it('uses the selected punishment names and never labels Chou-Wei as Wuli', () => {
    expect(getBranchRelation('丑', '未')).toContainEqual(expect.objectContaining({ type: '刑', detail: '恃勢' }))
    expect(getBranchRelation('子', '卯')).toContainEqual(expect.objectContaining({ type: '刑', detail: '無禮' }))
    expect(getBranchRelation('丑', '未')).not.toContainEqual(expect.objectContaining({ detail: '無禮' }))
  })
  it('keeps the clash but does not imply a complete punishment group in a two-pillar comparison', () => {
    const facts = pairFacts('辛丑', '辛未', 'January / birth day').join(' ')
    expect(facts).toContain('沖')
    expect(facts).not.toContain('刑')
    expect(pairFacts('甲子', '乙卯', 'Pair').join(' ')).toContain('無禮')
  })
  it('discloses the actual male setting and forward cycle, and changes both when appropriate', () => {
    const male = explainCalculation(input)
    const female = explainCalculation({ ...input, gender: 'F' })
    expect([male.cycleSetting, male.cycleDirection]).toEqual(['Male', 'Forward'])
    expect([female.cycleSetting, female.cycleDirection]).toEqual(['Female', 'Reverse'])
    expect(calculateSaju(input).daewoon[0].ganzi).toBe('丙辰')
    expect(calculateSaju({ ...input, gender: 'F' }).daewoon[0].ganzi).toBe('甲寅')
  })
  it('explains New York solar time and the actual half-hour boundary instead of pretending it is 03:00', () => {
    const basis = explainCalculation(input)
    expect(basis.effectiveClock).toBe('1998-03-25 02:57')
    expect(basis.hourPillar).toBe('己丑')
    expect(basis.nearBoundary).toBe(true)
    expect(basis.boundaryNote).toContain('conventional hour boundary')
    expect(basis.adjacentHours).toEqual({ before: '己丑', after: '庚寅', boundary: '03:30' })
  })
  it('flags an actual engine boundary and shows its two sides', () => {
    const basis = explainCalculation({ year: 1998, month: 3, day: 25, hour: 3, minute: 30, gender: 'M', timezone: 'Asia/Seoul', longitude: 126.978 })
    expect(basis.nearBoundary).toBe(true)
    expect(basis.boundaryNote).toContain('0 minutes')
    expect(basis.adjacentHours).toEqual({ before: '己丑', after: '庚寅', boundary: '03:30' })
  })
  it('keeps Korean daylight-saving normalization visible', () => {
    const basis = explainCalculation({ year: 1987, month: 7, day: 1, hour: 9, minute: 15, gender: 'F', timezone: 'Asia/Seoul', longitude: 126.978 })
    expect(basis.effectiveClock).toBe('1987-07-01 08:15')
    expect(basis.correction).toContain('-60 minutes')
  })
  it('does not expose a made-up birth hour for unknown-time input', () => {
    const basis = explainCalculation({ ...input, unknownTime: true, hour: 1 })
    expect(basis).toEqual(explainCalculation({ ...input, unknownTime: true, hour: 22 }))
    expect(basis.hourPillar).toBe('Unknown; excluded')
    expect(basis.adjacentHours).toBeUndefined()
    expect(basis.nearBoundary).toBe(false)
  })
  it('retains all twelve month pillars, with distinct exercises and practical checks', () => {
    const expected = ['辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子']
    const report = buildYearAheadReading(calculateSaju(input), 2027)
    expect(report.months.map(month => month.pillar)).toEqual(expected)
    expect(report.months[0].yearPillar).toBe('丙午')
    expect(report.months[1].yearPillar).toBe('丁未')
    expect(report.months.every(month => month.guidance.keepClose[0].length > 10)).toBe(true)
    expect(new Set(report.months.map(month => month.lead)).size).toBe(12)
    expect(new Set(report.months.map(month => month.paragraphs[3])).size).toBe(12)
    expect(report.months[0].evidence.join(' ')).not.toContain('刑')
    expect(report.methodNotes.join(' ')).toContain('separate from the birthplace time zone')
  })
  it('keeps the preparation basis and chapter 08 in the complete export', () => {
    const report = buildCompleteReading(calculateSaju(input), 2026)
    expect(report.fullText).toContain('08 · Your Life Chapters')
    expect(report.methodNotes.join(' ')).toContain('Traditional cycle setting: Male')
    expect(report.calculation.hourPillar).toBe(getFourPillars(1998, 3, 25, 2, 57)[3])
  })
})
