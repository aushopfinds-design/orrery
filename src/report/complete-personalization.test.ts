import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { buildCompleteReading } from './complete-reading.ts'

const locations = [
  { timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { timezone: 'Asia/Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { timezone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.6333 },
]

const births: BirthInput[] = Array.from({ length: 24 }, (_, index) => ({
  year: 1970 + index,
  month: index % 12 + 1,
  day: 2 + (index * 5) % 25,
  hour: index % 24,
  minute: index * 7 % 60,
  unknownTime: index % 6 === 0,
  gender: index % 2 ? 'F' : 'M',
  ...locations[index % locations.length],
}))

describe('My Life personalization across 24 international birth charts', () => {
  it('changes the actual money, work, relationship and timeline answers with the calculated chart', () => {
    const readings = births.map(birth => buildCompleteReading(calculateSaju(birth), 2026))
    const chapterText = (id: string) => readings.map(report => {
      const chapter = report.chapters.find(item => item.id === id)!
      return [chapter.lead, ...chapter.paragraphs].join(' ')
    })
    for (const id of ['personality', 'money', 'career', 'love', 'patterns']) {
      expect(new Set(chapterText(id)).size, id).toBeGreaterThan(18)
    }
    expect(new Set(readings.map(report => report.actionPlan.paragraphs.join(' '))).size).toBeGreaterThan(18)
    for (const [index, report] of readings.entries()) {
      expect(report.chapters).toHaveLength(7)
      expect(report.periods.length).toBeGreaterThan(0)
      expect(report.chapters.find(chapter => chapter.id === 'money')!.evidence.length).toBeGreaterThan(0)
      expect(report.chapters.find(chapter => chapter.id === 'career')!.evidence.length).toBeGreaterThan(0)
      expect(report.chapters.find(chapter => chapter.id === 'love')!.evidence.length).toBeGreaterThan(0)
      if (births[index].unknownTime) {
        expect(report.pillarSummary).toContain('Hour: Unknown')
        expect(report.calculation.notes.join(' ')).toMatch(/unknown|hour/i)
      }
    }
  })
})
