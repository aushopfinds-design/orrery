import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { buildCompleteReading } from './complete-reading.ts'
import { purchaseYears } from './purchase-timing.ts'
import { timingPoint } from './traditional-analysis.ts'
import { buildInterpretationPlan } from './interpretation-plan.ts'
import { customerNarrative } from './purchase-narrative.ts'

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

  it('gives twenty different charts a direct relationship conclusion and ten complete yearly answers', () => {
    const reports = births.slice(0, 20).map(birth => {
      const chart = calculateSaju(birth)
      const plan = buildInterpretationPlan('complete', chart, 2026)
      const reading = buildCompleteReading(chart, 2026)
      const love = customerNarrative(plan).love.lines.map(line => line.en).join(' ')
      const social = customerNarrative(plan).social.lines.map(line => line.en).join(' ')
      const balance = customerNarrative(plan).balance.lines.map(line => line.en).join(' ')
      const years = customerNarrative(plan)['next-moves'].lines.filter(line => /^20\d\d: Main theme/.test(line.en))
      expect(love).toMatch(/most likely to feel secure/i)
      expect(love).toMatch(/conflict can develop when/i)
      expect(love).toMatch(/personal chart also points to a need for/i)
      expect(love).toContain(`${chart.pillars[1].pillar.branch} in the day pillar`)
      expect(love).not.toContain('In close relationships, your chart points to a need for')
      expect(love).not.toContain('alongside the ten-year theme')
      expect(love).toMatch(/years that most clearly touch relationship priorities|No year in the next ten-year comparison/i)
      expect(social).toContain(chart.pillars[1].pillar.stem)
      expect(social).toMatch(/natural strength|weakness to watch/i)
      expect(social).toMatch(/hidden layer/i)
      expect(social).toMatch(/others may notice this side first/i)
      expect(balance).toMatch(/feel balanced when/i)
      expect(balance).toContain(chart.pillars[1].pillar.branch)
      expect(years).toHaveLength(10)
      expect(new Set(years.map(line => line.en)).size).toBe(10)
      for (const line of years) {
        expect(line.en).toContain('Career & money —')
        expect(line.en).toContain('Love & relationships —')
        expect(line.en).toContain('Opportunity —')
        expect(line.en).toContain('Caution —')
        expect(line.en).toContain('Why —')
      }
      if (birth.unknownTime) {
        expect(love).not.toMatch(/birth-hour marker|hour pillar|hour branch/i)
        expect(reading.pillarSummary).toContain('Hour: Unknown')
      }
      const socialChapter = reading.chapters.find(chapter => chapter.id === 'social')!
      const balanceChapter = reading.chapters.find(chapter => chapter.id === 'balance')!
      expect([socialChapter.lead, ...socialChapter.paragraphs].join(' ')).toMatch(/main weakness|weakness to watch/i)
      expect([socialChapter.lead, ...socialChapter.paragraphs].join(' ')).toMatch(/others may notice this side first/i)
      expect([balanceChapter.lead, ...balanceChapter.paragraphs].join(' ')).toMatch(/feel balanced when/i)
      return { love, social, balance, years: years.map(line => line.en).join(' ') }
    })
    expect(new Set(reports.map(report => report.love)).size).toBeGreaterThan(15)
    expect(new Set(reports.map(report => report.social)).size).toBeGreaterThan(15)
    expect(new Set(reports.map(report => report.balance)).size).toBeGreaterThan(15)
    expect(new Set(reports.map(report => report.years)).size).toBeGreaterThan(15)
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

  it('describes ten-year cycle boundaries as approximate when calculation conventions differ', () => {
    const report = buildCompleteReading(joy, 2026)
    expect(report.periods[0].period).toMatch(/^Around /)
    expect(report.periods[0].text).toMatch(/Cycle start dates are estimates and can differ across calculation conventions/)
    expect(report.periods[0].evidence.join(' ')).toMatch(/Approximate FATE KEY cycle boundary reference/)
    expect(report.fullText).not.toMatch(/From the calculated start \d{4}-\d{2}-\d{2}/)
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
