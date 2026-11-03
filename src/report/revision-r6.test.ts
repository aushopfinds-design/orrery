import { describe, expect, it } from 'vitest'
import { orderInput } from '../../server/payments/input.ts'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { chartGlossaryFor } from './calculation-notes.ts'
import { applyBuyerQuestions } from './buyer-outline.ts'

const first = CATEGORY_SCENARIOS[0].first

describe('Personal letter and subject-specific revision', () => {
  it('keeps optional names separate from chart input and rejects unsafe or oversized names', () => {
    const base = { kind: 'complete', first }
    const named = orderInput({ ...base, recipientName: '  Minji  ' })
    expect(named.recipientName).toBe('Minji')
    expect(named.first).toEqual(orderInput(base).first)
    expect(orderInput({ ...base, recipientName: '' })).not.toHaveProperty('recipientName')
    expect(orderInput({ ...base, recipientName: '민지' }).recipientName).toBe('민지')
    for (const value of [42, '<script>', 'a'.repeat(41), 'Minji\nOther', '\u0000']) {
      expect(() => orderInput({ ...base, recipientName: value })).toThrow()
    }
  })
  it('shows only glossary labels found in the supplied chart evidence', () => {
    const terms = chartGlossaryFor(['Month: 正財; period: 辛亥 大運'])
    expect(terms.map(x => x.term)).toEqual(['正財', 'Ten-year cycle / 大運'])
    expect(chartGlossaryFor([])).toEqual([])
    expect(chartGlossaryFor(['No direct stem or branch 合/沖 occurs in the supplied pillar pairs.'])).toEqual([])
    expect(terms.map(x => x.meaning).join(' ')).not.toMatch(/supernatural|mental-health/)
  })
  it('uses money evidence for spending choices and relationship evidence for closeness', () => {
    for (const sample of CATEGORY_SCENARIOS) {
      const report = buildCompleteReading(calculateSaju(sample.first), 2026)
      const money = report.chapters.find(x => x.id === 'money')!
      const love = report.chapters.find(x => x.id === 'love')!
      expect([money.lead, ...money.paragraphs].join(' ')).toMatch(/money|income|financial/i)
      expect([love.lead, ...love.paragraphs].join(' ')).toMatch(/most likely to feel secure/i)
      expect([love.lead, ...love.paragraphs].join(' ')).toMatch(/conflict can develop when/i)
      expect(love.paragraphs.join(' ')).not.toContain('Your birth-day reading also points to')
      expect(new Set(report.periods.map(x => x.paragraphs[1])).size).toBe(report.periods.length)
      const compass = report.extras
      for (const item of [...compass.keepClose, ...compass.stepBack]) {
        const plainItem = item.text.replace(/\*\*/g, '')
        // Extras can intentionally reuse a chapter's exact customer answer;
        // the full report must not print that same advice more than once.
        const delivered = applyBuyerQuestions(report.fullText, 'complete', report.chapters, report.periods)
        expect(delivered.split(plainItem).length - 1).toBeLessThanOrEqual(1)
      }
    }
  })
})
