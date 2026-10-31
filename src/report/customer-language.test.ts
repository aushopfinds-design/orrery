import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { customerEnglish } from './customer-language.ts'
describe('Everyday customer English keeps the calculation and uncertainty intact', () => {
  it('preserves dates, signs, amounts and negation when explaining a timing sentence', () => {
    const original = '2027-07-15: The natal balance is unresolved. A money relationship in 丁未 does not guarantee US$100 or a favourable outcome.'
    const changed = customerEnglish(original)
    for (const fact of ['2027-07-15', '丁未', 'US$100', 'does not guarantee', 'unresolved']) expect(changed).toContain(fact)
    expect(changed).not.toContain('money relationship')
    expect(customerEnglish('both natal charts')).toBe('both birth charts')
  })
  it.each(Array.from({ length: 24 }, (_, i) => i))('chart %i answers the buyer before giving the technical explanation', i => {
    const chart = calculateSaju({ ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: i % 20 + 5, unknownTime: i % 5 === 0 })
    const partner = calculateSaju(CATEGORY_SCENARIOS[1].second)
    const reports = [buildCompleteReading(chart, 2026), ...(['compatibility', 'year', 'career', 'business', 'wellbeing'] as const).map(kind => buildCategoryReading(kind, chart, { second: kind === 'compatibility' ? partner : undefined, year: kind === 'year' ? 2027 : 2026 }))]
    for (const report of reports) for (const chapter of report.chapters) {
      const body = [chapter.lead, ...chapter.paragraphs].join(' ')
      expect(body).not.toMatch(/\b(?:natal|exposed stem|principal branch stem|output relationship|money relationship|birth-month stem|birth-month branch|structural friction signal)\b/)
      expect(chapter.evidence.length).toBeGreaterThan(0)
      expect(report.fullText).toContain(chapter.lead.replace(/\*\*/g, ''))
    }
    const money = reports[0].chapters.find(c => c.id === 'money')!
    expect([money.lead, ...money.paragraphs].join(' ')).not.toContain('The checked positions are')
    expect(money.evidence.some(line => line.startsWith('The checked positions are'))).toBe(true)
  })
})
