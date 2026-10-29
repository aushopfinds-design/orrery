import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { buildCompleteReading } from './complete-reading.ts'
import { purchaseYears } from './purchase-timing.ts'
import { timingPoint } from './traditional-analysis.ts'

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

describe('My Life direct buyer answers and annual distinctions', () => {
  const joy = calculateSaju({
    year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'F',
    timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006,
  })

  it('grounds the five central answers and names the distinct 2029/2031 pillars', () => {
    const report = buildCompleteReading(joy, 2026)
    const text = (id: string) => {
      const section = report.chapters.find(chapter => chapter.id === id)!
      return [section.lead, ...section.paragraphs].join(' ')
    }
    expect(text('personality')).toContain(joy.pillars[1].pillar.stem)
    expect(text('personality')).toContain('Day Master')
    expect(text('money')).toMatch(/regular income|repeat fees/i)
    expect(text('money')).toMatch(/projects|deals|variable/i)
    expect(text('career')).toMatch(/structured role|organisation|organization/i)
    expect(text('career')).toContain('authority')
    expect(text('love')).toContain(joy.pillars[1].pillar.branch)
    expect(text('patterns')).toContain('己酉')
    expect(text('patterns')).toContain('辛亥')
    expect(report.chapters.every(chapter => chapter.evidence.length > 0)).toBe(true)
  })

  it('does not call the 2026 revision pattern a clash; distinguishes daily and visible work layers', () => {
    const rows = purchaseYears(joy, 2026, 'life', 10, true)
    const year2026 = rows[0].lines.find(line => line.id.endsWith('change-month'))!.en
    const year2029 = rows[3].lines.find(line => line.id.endsWith('change-month'))!.en
    const year2031 = rows[5].lines.find(line => line.id.endsWith('change-month'))!.en
    expect(year2026).toContain('branch-revision pattern')
    expect(year2026).not.toContain('clash')
    expect(year2029).toContain('daily work pattern')
    expect(year2031).toContain('visible work terms')
    expect(year2031).toContain('partial combination')
    expect(year2029).not.toBe(year2031)
  })

  it('derives cycle direction from gender while keeping natal pillars unchanged', () => {
    const male = calculateSaju({
      year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'M',
      timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006,
    })
    expect(joy.pillars.map(item => item.pillar.ganzi)).toEqual(male.pillars.map(item => item.pillar.ganzi))
    expect(joy.daewoon[2].ganzi).toBe('壬子')
    expect(joy.daewoon[2].startDate.toISOString().slice(0, 10)).toBe('2024-07-19')
    expect(male.daewoon[2].ganzi).toBe('戊午')
    expect(male.daewoon[2].startDate.toISOString().slice(0, 10)).toBe('2021-12-22')
    expect(timingPoint(joy, 2026).pillar).toBe('丙午')
  })
})
