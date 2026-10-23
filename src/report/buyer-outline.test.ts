import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { BUYER_OUTLINES } from './buyer-outline.ts'
import { buildInterpretationPlan } from './interpretation-plan.ts'
const a = calculateSaju(CATEGORY_SCENARIOS[0].first), b = calculateSaju(CATEGORY_SCENARIOS[0].second)
describe('Buyer questions, not a repeated six-part technical template', () => {
  it.each(Object.keys(BUYER_OUTLINES) as (keyof typeof BUYER_OUTLINES)[])('%s uses its own titles and reading order without breaking chapter anchors', kind => {
    const report = kind === 'complete' ? buildCompleteReading(a, 2026) : buildCategoryReading(kind, a, { year: kind === 'year' ? 2027 : 2026, second: kind === 'compatibility' ? b : undefined })
    expect(report.chapters.map(c => c.id)).toEqual(BUYER_OUTLINES[kind].map(([id]) => id))
    expect(report.chapters.map(c => c.title.replace(/^\d+ · /, ''))).toEqual(BUYER_OUTLINES[kind].map(([, title]) => title))
    expect(report.chapters[0].paragraphs.join(' ')).not.toContain('A provisional month-led structure candidate')
    expect(report.chapters[0].evidence.join(' ')).toContain('Month hidden stem')
  })
  it('does not label a money-topic month a good month without the shared balance and friction checks', () => {
    const plan = buildInterpretationPlan('year', a, 2027)
    const report = buildCategoryReading('year', a, { year: 2027 })
    const supportive = report.chapters.find(c => c.id === 'annual-cycle-context')!
    const selected = plan.months.filter(p => ['potential-support', 'potential-outlet'].includes(p.direction) && !p.friction)
    if (!selected.length) expect(supportive.lead).toContain('No month meets')
    for (const point of selected) expect([supportive.lead, ...supportive.paragraphs].join(' ')).toContain(point.date)
    expect(report.months).toHaveLength(12)
  })
  it('actually answers job-change, promotion, launch and expansion topics with calculated years', () => {
    const career = buildCategoryReading('career', a, { year: 2026 }), business = buildCategoryReading('business', a, { year: 2026 })
    for (const [report, id] of [[career, 'feedback-and-boundaries'], [career, 'proof-of-skill'], [business, 'offer-test'], [business, 'customer-communication']] as const) {
      const chapter = report.chapters.find(c => c.id === id)!
      expect(chapter.evidence.join(' ')).toContain('2026-07-15')
      expect(chapter.evidence.join(' ')).toContain('2030-07-15')
      expect(chapter.paragraphs.join(' ')).not.toMatch(/guaranteed promotion|guaranteed launch date/)
    }
  })
})
