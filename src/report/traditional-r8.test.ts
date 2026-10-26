import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { resolveLocalDateTimeToUtc } from '@orrery/core/timezone'
import { getHiddenStems, getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading, buildBundleReading } from './category-readings.ts'
import { natalAnalysis, natalPatterns, monthlyPoint, GODS, availablePillars } from './traditional-analysis.ts'
import { explainCalculation } from './calculation-notes.ts'
import { STEM_ELEMENTS } from './reading.ts'

const places = [
  { timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { timezone: 'Asia/Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { timezone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.6333 },
]
export const R8_INPUTS: BirthInput[] = Array.from({ length: 24 }, (_, i) => ({ year: 1962 + i, month: i % 12 + 1, day: 5 + i % 21, hour: 4 + i % 16, minute: 17, gender: i % 2 ? 'F' : 'M', unknownTime: i % 4 === 0, ...places[i % places.length] }))
const charts = R8_INPUTS.map(calculateSaju)
const products = ['career', 'business', 'year', 'compatibility', 'wellbeing'] as const

describe('r8: all seven products over 24 distinct international charts', () => {
  it('uses the actual visible relationships and hidden stems without inventing weights', () => {
    const seen = new Set<string>()
    for (const chart of charts) {
      const a = natalAnalysis(chart), day = chart.pillars[1].pillar.stem
      const hidden = availablePillars(chart).flatMap(({ pillar }) => [...getHiddenStems(pillar.pillar.branch).replace(/\s/g, '')].map(stem => getRelation(day, stem)!.hanja))
      expect(a.hidden.map(item => item.god)).toEqual(hidden)
      expect(a.visible).toHaveLength(chart.input.unknownTime ? 5 : 7)
      for (const { god, count } of a.counts) expect(count).toBe(a.visible.filter(item => item.god === god).length)
      const rootSources = a.hidden.filter(item => STEM_ELEMENTS[item.stem] === STEM_ELEMENTS[day])
      expect(a.rootText.startsWith('No same-element')).toBe(rootSources.length === 0)
      expect(a.facts.join(' ')).not.toMatch(/NaN|undefined/)
      seen.add(chart.pillars.map(item => item.pillar.ganzi).join('|'))
    }
    expect(seen.size).toBe(24)
  })
  it('delivers each purchased subject with direct answers, timing and traceable evidence', () => {
    const bodies = new Map<string, Set<string>>()
    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i], partner = charts[(i + 7) % charts.length]
      const full = buildCompleteReading(chart, 2026)
      const bundle = buildBundleReading(chart, partner, 2027, 2026)
      const readings = [full, ...products.map(kind => buildCategoryReading(kind, chart, { second: kind === 'compatibility' ? partner : undefined, year: kind === 'year' ? 2027 : 2026 }))]
      for (const report of readings) {
        expect(report.fullText).not.toMatch(/undefined|NaN|\[object Object\]|\*\*/)
        expect(report.applications).toEqual([])
        expect(report.chapters.every(chapter => chapter.evidence.length && chapter.lead.length > 30 && !chapter.lead.startsWith('Imagine '))).toBe(true)
        expect(report.fullText).toContain('2026.10-r18')
        expect(report.fullText).toContain(report.referenceYear === 2027 ? '2027-07-15' : '2026-07-15')
        expect(report.methodNotes.join(' ')).toContain('not a factual assessment')
        const key = report.title, body = report.chapters.map(chapter => [chapter.lead, ...chapter.paragraphs].join(' ')).join('\n')
        const variants = bodies.get(key) ?? new Set<string>(); variants.add(body); bodies.set(key, variants)
        for (const chapter of report.chapters) for (const line of [chapter.lead, ...chapter.paragraphs]) expect(report.fullText).toContain(line.replace(/\*\*/g, ''))
      }
      expect(bundle.fullText.match(/Your Everyday Compass/g)).toHaveLength(1)
      expect(bundle.fullText.match(/How this reading is prepared/g)).toHaveLength(1)
      expect(bundle.annual.sharedAppendixInLifeReport).toBe(true)
      expect(bundle.compatibility.subjects[1].input).toEqual(partner.input)
      expect(bundle.annual.subjects[0].input).toEqual(chart.input)
    }
    for (const versions of bodies.values()) expect(versions.size).toBe(24)
  }, 15000)
  it('recalculates every year/month across three selected years and both solar-year sides', () => {
    for (const chart of charts) for (const year of [2026, 2027, 2028]) {
      for (let month = 1; month <= 12; month++) {
        const point = monthlyPoint(chart, year, month), expected = getFourPillars(year, month, 15, 12, 0)
        expect(point.pillar).toBe(expected[1]); expect(point.yearPillar).toBe(expected[0])
        expect(point.god).toBe(getRelation(chart.pillars[1].pillar.stem, expected[1][0])!.hanja)
        expect(point.innerGod).toBe(getRelation(chart.pillars[1].pillar.stem, getJeonggi(expected[1][1]))!.hanja)
        expect(point.facts[0]).toContain(point.date)
      }
      expect(monthlyPoint(chart, year, 1).yearPillar).not.toBe(monthlyPoint(chart, year, 7).yearPillar)
    }
  })
  it('does not turn an incomplete three-branch punishment into a complete pattern', () => {
    const chart = charts[0]
    const synthetic = { ...chart, input: { ...chart.input, unknownTime: true }, pillars: chart.pillars.map(p => ({ ...p, pillar: { ...p.pillar } })) as typeof chart.pillars }
    synthetic.pillars[1].pillar.branch = '寅'; synthetic.pillars[2].pillar.branch = '巳'; synthetic.pillars[3].pillar.branch = '子'
    expect(natalPatterns(synthetic).groups.some(item => item.type === '刑' && item.detail === '無恩')).toBe(false)
    synthetic.pillars[3].pillar.branch = '申'
    expect(natalPatterns(synthetic).groups.some(item => item.type === '刑' && item.detail === '無恩')).toBe(true)
  })
  it('ignores every unknown-hour fact even if the placeholder pillar is replaced', () => {
    for (const chart of charts.filter(item => item.input.unknownTime)) {
      const changed = { ...chart, pillars: [...chart.pillars] as typeof chart.pillars }
      changed.pillars[0] = charts[7].pillars[0]
      expect(buildCompleteReading(changed, 2026).fullText).toBe(buildCompleteReading(chart, 2026).fullText)
      for (const kind of products) expect(buildCategoryReading(kind, changed, { second: charts[7], year: 2027 }).fullText).toBe(buildCategoryReading(kind, chart, { second: charts[7], year: 2027 }).fullText)
    }
  })
  it('normalises known DST periods at each birthplace and retains the calculation disclosure', () => {
    // Independent expected civil offsets: New York/London July, Sydney January, Seoul DST 1987.
    const fixtures = [
      { ...places[0], year: 1998, month: 7, day: 1, effective: '1998-07-01 11:00', utc: '1998-07-01T16:00:00.000Z' },
      { ...places[1], year: 1998, month: 7, day: 1, effective: '1998-07-01 10:55', utc: '1998-07-01T11:00:00.000Z' },
      { ...places[2], year: 1998, month: 1, day: 1, effective: '1998-01-01 11:01', utc: '1998-01-01T01:00:00.000Z' },
      { ...places[3], year: 1987, month: 7, day: 1, effective: '1987-07-01 11:00', utc: '1987-07-01T02:00:00.000Z' },
    ]
    for (const fixture of fixtures) {
      const input: BirthInput = { ...fixture, hour: 12, minute: 0, gender: 'M' }
      expect(resolveLocalDateTimeToUtc(input.year, input.month, input.day, 12, 0, input.timezone!).toISOString()).toBe(fixture.utc)
      // Solar-clock expectations are regression fixtures for the existing longitude/EOT convention.
      const calculation = explainCalculation(input)
      expect(calculation.effectiveClock).toBe(fixture.effective)
      const report = buildCompleteReading(calculateSaju(input), 2026)
      expect(report.birthSummary).toContain(fixture.timezone)
      expect(report.calculation).toEqual(calculation)
    }
  })
  it('uses ordinary explained relationship names, with no fabricated probability score', () => {
    expect(Object.keys(GODS)).toHaveLength(10)
    for (const value of Object.values(GODS)) expect([value.work, value.money, value.love, value.business, value.balance].every(text => text.length > 60)).toBe(true)
    for (const chart of charts) {
      const report = buildCompleteReading(chart, 2026)
      expect(report.fullText).not.toMatch(/\b\d{1,3}%|luck score|will (?:marry|divorce|become rich|develop a disease)|guaranteed (?:profit|income)/i)
    }
  })
})
