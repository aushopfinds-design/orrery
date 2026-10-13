import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { buildEnglishReading } from './reading.ts'

const base: BirthInput = {
  year: 1998, month: 3, day: 25, hour: 3, minute: 0,
  gender: 'M', timezone: 'Asia/Seoul', longitude: 127.0, latitude: 37.5,
}

describe('English reading integration', () => {
  it('matches an externally documented 1998 chart and discloses the Korean hour rule', () => {
    const report = buildEnglishReading(calculateSaju(base), 2026)
    expect(report.pillarSummary).toContain('Year: 戊寅')
    expect(report.pillarSummary).toContain('Month: 乙卯')
    expect(report.pillarSummary).toContain('Day: 辛未')
    expect(report.pillarSummary).toContain('Hour: 己丑')
    expect(report.dayMaster).toBe('Yin Metal')
    expect(report.caveats.join(' ')).toContain('03:00')
  })

  it('uses a different calculation and description for a different birth date', () => {
    const first = buildEnglishReading(calculateSaju(base), 2026)
    const second = buildEnglishReading(calculateSaju({
      year: 1980, month: 3, day: 25, hour: 12, minute: 0,
      gender: 'M', timezone: 'Asia/Seoul',
    }), 2026)
    expect(second.pillarSummary).toContain('Year: 庚申')
    expect(second.pillarSummary).toContain('Month: 己卯')
    expect(second.pillarSummary).toContain('Day: 丁酉')
    expect(first.dayMaster).not.toEqual(second.dayMaster)
    expect(first.fullText).not.toEqual(second.fullText)
  })

  it('does not invent an hour pillar when time is unknown', () => {
    const report = buildEnglishReading(calculateSaju({ ...base, unknownTime: true }), 2026)
    expect(report.pillarSummary).toContain('Hour: Unknown')
    expect(report.fullText).toContain('three pillars')
    expect(report.birthSummary).toContain('birth time unknown')
  })

  it('explains all displayed ten-year periods using year and distinct cycle data', () => {
    const report = buildEnglishReading(calculateSaju(base), 2026)
    expect(report.periods.length).toBeGreaterThan(0)
    expect(report.periods.every(p => /^\d{4}–\d{4}$/.test(p.period))).toBe(true)
    expect(new Set(report.periods.map(p => p.pillar)).size).toBe(report.periods.length)
    expect(report.periods.every(p => p.text.includes(p.pillar))).toBe(true)
  })

  it('shows the calculated day and month symbols in the English personality explanation', () => {
    const result = calculateSaju(base)
    const report = buildEnglishReading(result, 2026)
    const personality = report.sections[0].paragraphs.join(' ')
    expect(personality).toContain(result.pillars[1].pillar.stem)
    expect(personality).toContain(report.dayMaster)
    expect(personality).toContain(result.pillars[2].pillar.stem)
  })

  it('connects each displayed decade to its own ten-god symbol', () => {
    const result = calculateSaju(base)
    const report = buildEnglishReading(result, 2026)
    for (const period of report.periods) {
      const cycle = result.daewoon.find(c => c.ganzi === period.pillar)
      expect(cycle).toBeDefined()
      expect(period.text).toContain(cycle!.stemSipsin)
    }
  })

  it('grounds twelve monthly reflections in calculated mid-month solar-term pillars', () => {
    const report = buildEnglishReading(calculateSaju(base), 2026)
    expect(report.monthly).toHaveLength(12)
    expect(report.monthly.every(m => /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(m.pillar))).toBe(true)
    expect(new Set(report.monthly.map(m => m.pillar)).size).toBeGreaterThanOrEqual(10)
    expect(report.monthly.every(m => m.text.includes(m.pillar))).toBe(true)
    expect(report.caveats.join(' ')).toContain('15th')
  })

  it('changes monthly headline themes when the day master changes', () => {
    const first = buildEnglishReading(calculateSaju(base), 2026)
    const second = buildEnglishReading(calculateSaju({
      ...base, year: 1980, month: 3, day: 25, hour: 12,
    }), 2026)
    expect(first.monthly.map(m => m.pillar)).toEqual(second.monthly.map(m => m.pillar))
    expect(first.monthly.some((m, i) => m.headline !== second.monthly[i].headline)).toBe(true)
  })

  it('labels a ten-year period before its start as upcoming, not current', () => {
    const result = calculateSaju(base)
    const firstStart = result.daewoon[0].startDate.getUTCFullYear()
    const report = buildEnglishReading(result, firstStart - 1)
    expect(report.periods[0].text).toContain('has not started yet')
    expect(report.periods[0].pillar).toBe(result.daewoon[0].ganzi)
  })

  it('warns if an overseas birth chart has no longitude', () => {
    const report = buildEnglishReading(calculateSaju({
      year: 1993, month: 3, day: 12, hour: 12, minute: 0,
      gender: 'F', timezone: 'Europe/London',
    }), 2026)
    expect(report.caveats.join(' ')).toContain('longitude was missing')
  })
})
