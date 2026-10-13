import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { buildEnglishReading } from './reading'

const cities = [
  { latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul' },
  { latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
] as const

const cases = [
  {
    "year": 1980,
    "month": 1,
    "day": 3,
    "city": 0
  },
  {
    "year": 1982,
    "month": 2,
    "day": 4,
    "city": 1
  },
  {
    "year": 1984,
    "month": 3,
    "day": 5,
    "city": 2
  },
  {
    "year": 1986,
    "month": 4,
    "day": 6,
    "city": 3
  },
  {
    "year": 1988,
    "month": 5,
    "day": 7,
    "city": 0
  },
  {
    "year": 1990,
    "month": 6,
    "day": 8,
    "city": 1
  },
  {
    "year": 1992,
    "month": 7,
    "day": 9,
    "city": 2
  },
  {
    "year": 1994,
    "month": 8,
    "day": 10,
    "city": 3
  },
  {
    "year": 1996,
    "month": 9,
    "day": 11,
    "city": 0
  },
  {
    "year": 1998,
    "month": 10,
    "day": 12,
    "city": 1
  },
  {
    "year": 2000,
    "month": 11,
    "day": 13,
    "city": 2
  },
  {
    "year": 2002,
    "month": 12,
    "day": 14,
    "city": 3
  },
  {
    "year": 2004,
    "month": 1,
    "day": 15,
    "city": 0
  },
  {
    "year": 2006,
    "month": 2,
    "day": 16,
    "city": 1
  },
  {
    "year": 2008,
    "month": 3,
    "day": 17,
    "city": 2
  },
  {
    "year": 2010,
    "month": 4,
    "day": 18,
    "city": 3
  },
  {
    "year": 2012,
    "month": 5,
    "day": 19,
    "city": 0
  },
  {
    "year": 2014,
    "month": 6,
    "day": 20,
    "city": 1
  },
  {
    "year": 2016,
    "month": 7,
    "day": 21,
    "city": 2
  },
  {
    "year": 2018,
    "month": 8,
    "day": 22,
    "city": 3
  }
]

describe('English reading quality smoke tests: 20 distinct birth profiles', () => {
  const readings = cases.map(({ year, month, day, city }) => {
    const input = {
      year, month, day, hour: 12, minute: 0,
      gender: 'M' as const, unknownTime: true,
      ...cities[city],
    }
    const result = calculateSaju(input)
    return buildEnglishReading(result, 2026)
  })

  it('generates an actual report for every profile', () => {
    expect(readings).toHaveLength(20)
    for (const reading of readings) {
      expect(reading.sections.length).toBeGreaterThanOrEqual(6)
      expect(reading.fullText.length).toBeGreaterThan(1000)
      expect(reading.birthSummary).toBeTruthy()
    }
  })

  it('does not produce identical full reports for different birth profiles', () => {
    expect(new Set(readings.map(r => r.fullText)).size).toBe(20)
  })

  it('varies substantive personality analysis, not merely birth-date labels', () => {
    const personality = readings.map(r => r.sections[0].paragraphs.join(' '))
    expect(new Set(personality).size).toBeGreaterThanOrEqual(10)
  })

  it('never invents an hour pillar when birth time is unknown', () => {
    for (const reading of readings) {
      expect(reading.pillarSummary[3]).toContain('Unknown')
    }
  })
})
