import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'
import type { BirthInput } from '@orrery/core/types'
import { buildBundleReading, buildCategoryReading, buildCompatibilityReading, buildCareerReading, buildBusinessReading, buildYearAheadReading, buildBalanceReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS, FOCUS_CATALOG } from './category-catalog.ts'
import { cycleFacts } from './category-shared.ts'
import { plainReadingText } from './reading-text.ts'
import { resolveFocusCategory, resolveReportRoute } from '../utils/report-route.ts'

const places = [
  { timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { timezone: 'Asia/Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { timezone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.6333 },
]
const inputs: BirthInput[] = Array.from({ length: 60 }, (_, index) => ({ year: 1940 + index, month: index % 12 + 1, day: 8 + index % 20, hour: 3 + index % 18, minute: 15, gender: index % 2 ? 'F' : 'M', unknownTime: index % 5 === 0, ...places[index % places.length] }))
const charts = inputs.map(calculateSaju)
const [baseA, baseB] = [calculateSaju(CATEGORY_SCENARIOS[0].first), calculateSaju(CATEGORY_SCENARIOS[0].second)]

const reports = charts.map((chart, index) => ({ chart, readings: [
  buildCareerReading(chart, 2026), buildBusinessReading(chart, 2026), buildYearAheadReading(chart, 2027), buildBalanceReading(chart, 2026), buildCompatibilityReading(chart, charts[(index + 7) % charts.length], 2026),
] }))

describe('Distinct complete category readings across 60 international charts', () => {
  it('contains complete chapters with useful steps, specific facts and safe text exports', () => {
    for (const { readings } of reports) for (const report of readings) {
      const minimum = report.kind === 'wellbeing' ? 1000 : 1400
      expect(report.wordCount, report.kind).toBeGreaterThan(minimum)
      expect(report.fullText).not.toMatch(/undefined|NaN|\[object Object\]|\*\*/)
      expect(new Set(report.chapters.map(chapter => chapter.id)).size).toBe(report.chapters.length)
      for (const chapter of [...report.chapters, ...report.months]) {
        expect(chapter.paragraphs.length).toBeGreaterThanOrEqual(4)
        expect(chapter.evidence.length, chapter.id).toBeGreaterThan(0)
        expect(chapter.tryThis.trim().length).toBeGreaterThan(10)
        for (const paragraph of [chapter.lead, ...chapter.paragraphs]) {
          expect(plainReadingText(paragraph).split(/\s+/).length, chapter.id).toBeLessThanOrEqual(80)
          expect(paragraph).not.toMatch(/[\u3400-\u9FFF]/)
          expect(report.fullText).toContain(plainReadingText(paragraph))
        }
        for (const group of [chapter.guidance.keepClose, chapter.guidance.watchFor]) {
          expect(group.length).toBeGreaterThan(0)
          for (const item of group) expect(report.fullText).toContain(plainReadingText(item))
        }
      }
    }
  })
  it('varies the actual body rather than only the birth labels', () => {
    for (let category = 0; category < 5; category++) {
      const versions = reports.map(item => item.readings[category].chapters.map(chapter => chapter.paragraphs.join(' ')).join('\n'))
      expect(new Set(versions).size).toBeGreaterThan(40)
    }
    const workByDay = new Map<string, Set<string>>()
    for (const { chart, readings } of reports) {
      const stem = chart.pillars[1].pillar.stem
      const group = workByDay.get(stem) ?? new Set<string>()
      group.add(readings[0].chapters[0].paragraphs.join(' '))
      workByDay.set(stem, group)
    }
    expect([...workByDay.values()].some(group => group.size >= 3)).toBe(true)
  })
  it('makes career and business substantively different reports', () => {
    for (const { readings } of reports) {
      const career = readings[0].chapters.flatMap(chapter => chapter.paragraphs)
      const business = readings[1].chapters.flatMap(chapter => chapter.paragraphs)
      expect(business.filter(paragraph => career.includes(paragraph)).length).toBeLessThan(3)
      expect(readings[0].chapters).toHaveLength(7)
      expect(readings[1].chapters).toHaveLength(7)
      expect(readings[4].chapters).toHaveLength(8)
      expect(readings[3].chapters).toHaveLength(5)
    }
  })
  it('keeps the actual location and excludes unknown hour symbols and counts', () => {
    for (const { chart, readings } of reports) for (const report of readings) {
      const person = report.subjects[0]
      expect(person.birthSummary).toContain(chart.input.timezone)
      expect(person.elements.reduce((sum, item) => sum + item.count, 0)).toBe(chart.input.unknownTime ? 6 : 8)
      if (chart.input.unknownTime) {
        expect(person.pillarSummary).toContain('Hour: Unknown')
        expect(report.chapters.flatMap(chapter => chapter.evidence).join(' ')).not.toMatch(/(?:A|birth) hour [^e]|hour pillar [甲乙丙丁戊己庚辛壬癸]/)
      }
    }
  })
})

describe('Two-person compatibility', () => {
  it('calculates both directions and changes when the second chart changes', () => {
    const reading = buildCompatibilityReading(baseA, baseB, 2026)
    const a = baseA.pillars[1].pillar.stem
    const b = baseB.pillars[1].pillar.stem
    const facts = reading.chapters.find(chapter => chapter.id === 'two-directions')!.evidence
    expect(facts).toContain(`A → B: ${a} comparing ${b} = ${getRelation(a, b)!.hanja}.`)
    expect(facts).toContain(`B → A: ${b} comparing ${a} = ${getRelation(b, a)!.hanja}.`)
    const swapped = buildCompatibilityReading(baseB, baseA, 2026)
    expect(swapped.subjects[0].input).toEqual(baseB.input)
    expect(swapped.chapters[1].paragraphs).not.toEqual(reading.chapters[1].paragraphs)
    expect(buildCompatibilityReading(baseA, charts[4], 2026).chapters[0].paragraphs).not.toEqual(reading.chapters[0].paragraphs)
    expect(() => buildCategoryReading('compatibility', baseA)).toThrow('Two birth charts')
  })
  it('checks all available cross-chart pairs and never substitutes a guessed hour', () => {
    for (const unknownA of [false, true]) for (const unknownB of [false, true]) {
      const a = calculateSaju({ ...baseA.input, unknownTime: unknownA })
      const b = calculateSaju({ ...baseB.input, unknownTime: unknownB })
      const reading = buildCompatibilityReading(a, b, 2026)
      const facts = reading.chapters.find(chapter => chapter.id === 'chart-patterns')!.evidence
      expect(facts).toHaveLength(1 + (unknownA ? 3 : 4) * (unknownB ? 3 : 4))
      if (unknownA) expect(facts.join(' ')).not.toContain('Person A hour /')
      if (unknownB) expect(facts.join(' ')).not.toContain('/ Person B hour:')
      const changed = buildCompatibilityReading(calculateSaju({ ...a.input, hour: unknownA ? 22 : a.input.hour }), calculateSaju({ ...b.input, hour: unknownB ? 1 : b.input.hour }), 2026)
      expect(changed.fullText).toBe(reading.fullText)
    }
  })
})

describe('Calculated annual and monthly references', () => {
  it('has six annual chapters and twelve correctly calculated monthly comparisons', () => {
    for (const { chart, readings } of reports) {
      const report = readings[2]
      expect(report.chapters).toHaveLength(6)
      expect(report.months).toHaveLength(12)
      expect(new Set(report.months.map(month => month.paragraphs.join(' '))).size).toBe(12)
      const dayStem = chart.pillars[1].pillar.stem
      report.months.forEach((month, index) => {
        const [yearPillar, monthPillar] = getFourPillars(2027, index + 1, 15, 12, 0)
        expect(month.referenceDate).toBe(`2027-${String(index + 1).padStart(2, '0')}-15`)
        expect(month.pillar).toBe(monthPillar)
        expect(month.yearPillar).toBe(yearPillar)
        expect(month.evidence.join(' ')).toContain('12:00 Asia/Seoul')
        expect(month.evidence.join(' ')).toContain(getRelation(dayStem, monthPillar[0])!.hanja)
        expect(month.evidence.join(' ')).toContain(getRelation(dayStem, getJeonggi(monthPillar[1]))!.hanja)
      })
      expect(report.months[0].yearPillar).not.toBe(report.months[6].yearPillar)
      expect(report.methodNotes.join(' ')).toContain('not the start or the full span')
    }
  })
  it('changes annual and monthly meanings with the selected year and birth chart', () => {
    const reading = buildYearAheadReading(baseA, 2027)
    const next = buildYearAheadReading(baseA, 2028)
    expect(next.title).toContain('2028')
    expect(next.chapters[0].paragraphs).not.toEqual(reading.chapters[0].paragraphs)
    expect(next.months.map(month => month.pillar)).not.toEqual(reading.months.map(month => month.pillar))
    expect(new Set(reports.map(({ readings }) => readings[2].months[0].lead)).size).toBeGreaterThanOrEqual(8)
    expect(() => buildYearAheadReading(baseA, 1899)).toThrow()
    expect(() => buildYearAheadReading(baseA, 1990)).toThrow()
    expect(() => buildYearAheadReading(baseA, 2027.5)).toThrow()
  })
})

describe('Work, money, cycles and daily balance', () => {
  it('grounds the work chapters and separate career/business cycle prompts in their calculated data', () => {
    for (const { chart, readings } of reports) {
      for (const index of [0, 1]) {
        const reading = readings[index]
        expect(reading.chapters[0].evidence.join(' ')).toContain(chart.pillars[1].pillar.ganzi)
        expect(reading.chapters[0].evidence.join(' ')).toContain(chart.pillars[2].stemSipsin)
        const cycle = reading.chapters.find(chapter => chapter.id === (index === 0 ? 'work-chapters' : 'business-chapters'))!
        expect(cycle.evidence).toEqual(cycleFacts(chart, 2026))
        for (const fact of cycle.evidence) expect(reading.fullText).toContain(fact)
      }
      expect(readings[0].chapters[5].paragraphs).not.toEqual(readings[1].chapters[5].paragraphs)
      expect(readings[3].methodNotes.join(' ')).toContain('no diagnosis, treatment')
    }
  })
  it('cannot change a report through the unknown entered hour', () => {
    const first = calculateSaju({ ...baseA.input, unknownTime: true, hour: 1 })
    const second = calculateSaju({ ...baseA.input, unknownTime: true, hour: 22 })
    for (const kind of ['career', 'business', 'year', 'wellbeing'] as const) {
      expect(buildCategoryReading(kind, first, { year: 2027 }).fullText).toBe(buildCategoryReading(kind, second, { year: 2027 }).fullText)
    }
  })
})

describe('Bundle and public report navigation', () => {
  it('contains the actual three full reports and keeps one- and two-person subjects distinct', () => {
    const bundle = buildBundleReading(baseA, baseB, 2027, 2026)
    expect(bundle.compatibility.subjects).toHaveLength(2)
    expect(bundle.annual.subjects).toHaveLength(1)
    expect(bundle.annual.subjects[0].input).toEqual(baseA.input)
    for (const report of [bundle.complete, bundle.compatibility, bundle.annual]) expect(bundle.fullText).toContain(report.fullText)
    expect(bundle.wordCount).toBeGreaterThan(7500)
  })
  it('routes every category, chapter and bundle without leaking into a personal free result', () => {
    for (const info of FOCUS_CATALOG) {
      expect(resolveReportRoute(`#${info.slug}`)).toBe('category-product')
      for (const hash of [`#${info.slug}-sample`, `#${info.slug}-sample-chapter`]) {
        expect(resolveReportRoute(hash)).toBe('category-sample')
        expect(resolveFocusCategory(hash)).toBe(info.kind)
      }
    }
    expect(resolveReportRoute('#complete-bundle')).toBe('bundle-product')
    for (const hash of ['#complete-bundle-sample', '#complete-bundle-sample-life-report-money', '#complete-bundle-sample-year-report-month-12']) expect(resolveReportRoute(hash)).toBe('bundle-sample')
    expect(resolveReportRoute('#free-reading')).toBe('free')
    expect(resolveReportRoute('#sample-report-love')).toBe('sample')
  })
})
