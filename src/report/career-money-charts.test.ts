import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { getFourPillars } from '@orrery/core/pillars'
import type { BirthInput } from '@orrery/core/types'
import { careerMoneyChartData } from './career-money-charts.ts'

const locations = [
  { timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
]
const inputs: BirthInput[] = Array.from({ length: 24 }, (_, index) => ({
  year: 1970 + index, month: index % 12 + 1, day: 5 + index % 24,
  hour: index % 24, minute: index % 2 ? 30 : 0, gender: index % 2 ? 'F' : 'M',
  unknownTime: index % 6 === 0, ...locations[index % locations.length],
}))

describe('career and money report visual data', () => {
  it('personalises every chart from 24 international charts and shows ten calculated annual references', () => {
    const readings = inputs.map(input => {
      const chart = calculateSaju(input), data = careerMoneyChartData(chart, 2026)
      expect(data.years).toHaveLength(10)
      expect(data.pillars.some(item => item.position === 'Hour')).toBe(!input.unknownTime)
      expect(data.elements.reduce((total, item) => total + item.count, 0)).toBe(input.unknownTime ? 6 : 8)
      expect(data.years[0].pillar).toBe(getFourPillars(2026, 7, 15, 12, 0)[0])
      expect(data.years[9].year).toBe(2035)
      expect(data.years[0].evidence.join(' ')).toContain('2026-07-15')
      expect(data.years[0].cycle).not.toBe('undefined')
      return data
    })
    expect(new Set(readings.map(data => data.dayMaster)).size).toBeGreaterThanOrEqual(5)
    expect(new Set(readings.map(data => data.visibleCounts.map(item => item.count).join(','))).size).toBeGreaterThan(10)
    expect(new Set(readings.map(data => data.strength)).size).toBeGreaterThan(1)
    expect(new Set(readings.map(data => data.cycles.map(item => item.ganzi).join(','))).size).toBeGreaterThan(1)
    expect(new Set(readings.map(data => data.years.map(item => `${item.pillar}/${item.direction}`).join(','))).size).toBeGreaterThan(3)
  })

  it('keeps unknown time and the supported year boundary explicit', () => {
    const original = inputs[0], chart = calculateSaju(original), unknown = careerMoneyChartData(chart, 2026)
    expect(unknown.unknownTime).toBe(true)
    expect(unknown.pillars.map(item => item.position)).not.toContain('Hour')
    expect(unknown.strength).toBe('deferred')
    expect(unknown.caveat).toContain('approximate')
    const last = careerMoneyChartData(calculateSaju({ ...original, unknownTime: false }), 2097)
    expect(last.years.map(item => item.year)).toEqual([2097, 2098, 2099, 2100])
  })
})
