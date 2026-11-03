import { describe, expect, it } from 'vitest'
import { issueReport } from './report.ts'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { BUYER_QUESTIONS } from '../../src/report/buyer-outline.ts'

const first = CATEGORY_SCENARIOS[0].first
const second = CATEGORY_SCENARIOS[0].second
const orderId = '12345678-1234-4234-8234-123456789012'

describe('seven-product sandbox fulfillment smoke tests', () => {
  const cases = [
    { kind: 'complete' as const, first },
    { kind: 'career' as const, first },
    { kind: 'compatibility' as const, first, second },
    { kind: 'year' as const, first, year: 2027, periodStart: '2027-01-01', periodTimezone: 'America/New_York' },
    { kind: 'business' as const, first },
    { kind: 'wellbeing' as const, first },
    { kind: 'bundle' as const, first, second, year: 2027, periodStart: '2027-01-01', periodTimezone: 'America/New_York' },
  ]
  for (const input of cases) {
    it(`generates a PDF for ${input.kind} even when diagnostic QA cannot certify it`, async () => {
      const report = await issueReport(input, orderId, 2026, 'test')
      expect(Buffer.from(report.pdf, 'base64').subarray(0, 5).toString()).toBe('%PDF-')
      expect(report.text.length).toBeGreaterThan(100)
      expect(report.qualityAudit).toBeDefined()
      if (input.kind !== 'bundle') {
        expect(BUYER_QUESTIONS[input.kind]).toHaveLength(7)
      }
      // A diagnostic failure must never block report creation.
      expect(report.qualityAudit?.passed).toBe(false)
    }, 120000)
  }
})
