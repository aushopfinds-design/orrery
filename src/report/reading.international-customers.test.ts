import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { buildEnglishReading } from './reading'

const cities = [
  { timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
] as const

describe('paid report: known-hour international customer profiles', () => {
  const samples = Array.from({ length: 24 }, (_, i) => {
    const input = {
      year: 1979 + i * 2,
      month: (i % 12) + 1,
      day: 10 + (i % 14),
      hour: 4 + (i % 16),
      minute: (i % 2) * 30,
      gender: (i % 2 ? 'F' : 'M') as 'M' | 'F',
      unknownTime: false,
      ...cities[i % 4],
    }
    return { input, result: calculateSaju(input) }
  })

  it('keeps all four calculated pillars visible', () => {
    for (const { result } of samples) {
      const reading = buildEnglishReading(result, 2026)
      expect(reading.pillarSummary).toHaveLength(4)
      expect(reading.pillarSummary[3]).toMatch(/^Hour: [甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
      expect(reading.birthSummary).not.toContain('birth time unknown')
      expect(reading.fullText).toContain(reading.pillarSummary[3])
    }
  })

  it('does not collapse different known-hour customer readings', () => {
    const readings = samples.map(({ result }) => buildEnglishReading(result, 2026))
    expect(new Set(readings.map(r => r.fullText)).size).toBe(samples.length)
  })

  it('shows the correct customer location and clock time', () => {
    for (const { input, result } of samples) {
      const reading = buildEnglishReading(result, 2026)
      expect(reading.birthSummary).toContain(input.timezone)
      expect(reading.birthSummary).toContain(String(input.hour).padStart(2, '0') + ':' + String(input.minute).padStart(2, '0'))
    }
  })

  it('does not claim twelve-month reflections are event forecasts', () => {
    for (const { result } of samples) {
      const reading = buildEnglishReading(result, 2026)
      expect(reading.monthly).toHaveLength(12)
      expect(reading.caveats.join(' ')).toContain('not a full-month event forecast')
      for (const month of reading.monthly) expect(month.text).toContain('not a prediction')
    }
  })
})
