import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'
import { buildCategoryReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { godText, monthlyPoint, pairObservation } from './traditional-analysis.ts'
const charts = Array.from({ length: 30 }, (_, i) => calculateSaju({ ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: i % 20 + 5 }))
describe('Direct subject-specific traditional interpretation', () => {
  it('identifies exactly the calculated money reference months for each chart', () => {
    for (const chart of charts) {
      const report = buildCategoryReading('year', chart, { year: 2027 })
      for (const month of report.months) {
        const gods = [month.pillar[0], getJeonggi(month.pillar[1])].map(stem => getRelation(chart.pillars[1].pillar.stem, stem)!.hanja)
        expect(report.summary[1].text.includes(month.label)).toBe(gods.some(god => ['正財', '偏財'].includes(god)))
      }
    }
  })
  it('explains the actual month-pillar comparison for both people', () => {
    for (let i = 0; i < 20; i++) {
      const a = charts[i], b = charts[i + 7]
      const report = buildCategoryReading('compatibility', a, { second: b, year: 2026 })
      expect(report.summary[2].text).toBe(pairObservation(a.pillars[2].pillar.ganzi, b.pillars[2].pillar.ganzi, 'Birth-month comparison').text)
      expect(report.chapters.find(x => x.id === 'shared-routine')!.evidence.join(' ')).toContain(b.pillars[2].pillar.ganzi)
    }
  })
  it('answers career and business in their own practical language', () => {
    for (const chart of charts) {
      const career = buildCategoryReading('career', chart, { year: 2026 })
      const business = buildCategoryReading('business', chart, { year: 2026 })
      expect(career.chapters[0].lead).toContain('career pattern')
      expect(business.chapters[0].lead).toContain('business pattern')
      const money = career.chapters.find(x => x.id === 'money-commitments')!
      expect(money.paragraphs.join(' ')).toContain('confirmed pay')
      expect(money.paragraphs.join(' ')).toContain('expected hours')
      expect(business.chapters.find(x => x.id === 'customer-communication')!.tryThis).toMatch(/customer.*deadline.*revision/)
      expect(career.fullText).toContain('2026-07-15')
      expect(business.fullText).toContain('2030-07-15')
    }
  })
  it('includes work, money, private life and cautions for all twelve months', () => {
    for (const chart of charts.slice(0, 20)) for (const year of [2027, 2028]) {
      const report = buildCategoryReading('year', chart, { year })
      for (let i = 0; i < 12; i++) {
        const month = report.months[i], point = monthlyPoint(chart, year, i + 1)
        const text = [month.lead, ...month.paragraphs].join(' ')
        expect(text).toContain('Work and activity:')
        expect(text).toContain('Money and commitments:')
        expect(text).toContain('Relationships and home:')
        expect(text).toContain(godText(point.god).pressure)
        expect(month.pillar).toBe(getFourPillars(year, i + 1, 15, 12, 0)[1])
      }
    }
  })
  it('retains different directional readings and the same-year flow for both people', () => {
    for (let i = 0; i < 20; i++) {
      const a = charts[i], b = charts[i + 7], report = buildCategoryReading('compatibility', a, { second: b, year: 2026 })
      const ab = getRelation(a.pillars[1].pillar.stem, b.pillars[1].pillar.stem)!.hanja
      const ba = getRelation(b.pillars[1].pillar.stem, a.pillars[1].pillar.stem)!.hanja
      expect(report.chapters[1].lead).toContain(godText(ab).name)
      expect(report.chapters[1].paragraphs[0]).toContain(godText(ba).name)
      const flow = report.chapters.find(x => x.id === 'support-each-other')!
      expect(flow.evidence.join(' ')).toContain('Person A: Reference 2026-07-15')
      expect(flow.evidence.join(' ')).toContain('Person B: Reference 2030-07-15')
    }
  })
})
