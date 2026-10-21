import { describe, expect, it } from 'vitest'
import { orderInput } from '../../server/payments/input.ts'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { chartGlossaryFor } from './calculation-notes.ts'

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
      expect(money.paragraphs.join(' ')).toMatch(/regular income|agreed payment|spending decisions|wealth relationship/)
      expect(love.paragraphs.join(' ')).toContain('lower half of your birth-day pair')
      expect(love.paragraphs.join(' ')).not.toContain('Your birth-day reading also points to')
      expect(new Set(report.periods.map(x => x.paragraphs[1])).size).toBe(report.periods.length)
      const compass = report.extras
      for (const item of [...compass.keepClose, ...compass.stepBack]) {
        expect(compass.questions.some(q => q.answer.includes(item.text))).toBe(false)
      }
    }
  })
})
