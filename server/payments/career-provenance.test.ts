import { describe, expect, it } from 'vitest'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { BUYER_QUESTIONS } from '../../src/report/buyer-outline.ts'
import { buildAnswerProvenance } from '../../src/report/answer-provenance.ts'
import { buildCategoryReading } from '../../src/report/category-readings.ts'
import { issueReport } from './report.ts'

const profiles = Array.from({ length: 30 }, (_, index) => {
  const seed = CATEGORY_SCENARIOS[index % CATEGORY_SCENARIOS.length].first
  return calculateSaju({ ...seed, year: 1960 + index, month: index % 12 + 1, day: index % 27 + 1,
    gender: index % 2 ? 'F' : 'M', ...(index % 5 === 0 ? { unknownTime: true } : {}) })
})

describe('Product 02 deterministic, evidence-linked answers', () => {
  it('traces all seven current buyer questions to rules and chart evidence for 30 varied profiles', () => {
    expect(BUYER_QUESTIONS.career).toHaveLength(7)
    for (const profile of profiles) {
      const reading = buildCategoryReading('career', profile, { year: 2026 })
      const traces = buildAnswerProvenance('career', reading.chapters)
      expect(traces).toHaveLength(7)
      expect(traces.every(item => item.ruleIds.length > 0 && item.evidence.length > 0 && item.evidence.every(fact => fact.id && fact.value))).toBe(true)
      expect(traces.map(item => item.questionId)).toEqual(BUYER_QUESTIONS.career.map(item => item.id))
      for (const trace of traces) {
        expect(trace.evidence.map(fact => fact.value)).toEqual(reading.chapters.find(chapter => chapter.id === trace.sourceChapterId)?.evidence)
      }
    }
  })

  it('returns the same answer and provenance for the same calculated chart', () => {
    const chart = profiles[7]
    const first = buildCategoryReading('career', chart, { year: 2026 })
    const second = buildCategoryReading('career', chart, { year: 2026 })
    expect(first.chapters.map(chapter => chapter.lead)).toEqual(second.chapters.map(chapter => chapter.lead))
    expect(buildAnswerProvenance('career', first.chapters)).toEqual(buildAnswerProvenance('career', second.chapters))
  })

  it('stores internal traces without exposing them in the customer report text or PDF', async () => {
    const profile = CATEGORY_SCENARIOS[0].first
    const report = await issueReport({ kind: 'career', first: profile }, '12345678-1234-4234-8234-123456789012', 2026, 'live')
    expect(report.answerProvenance).toHaveLength(7)
    expect(report.text).not.toContain('answerProvenance')
    expect(report.text).not.toContain('career.employment_vs_independent.v1')
    expect(Buffer.from(report.pdf, 'base64').subarray(0, 5).toString()).toBe('%PDF-')
  }, 120000)
})
