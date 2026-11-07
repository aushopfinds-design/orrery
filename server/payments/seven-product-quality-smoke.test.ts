import { describe, expect, it } from 'vitest'
import { issueReport } from './report.ts'
import { ReportQualityGateError } from './report.ts'
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
    { kind: 'year' as const, first, year: 2027, periodStart: '2027-01', periodTimezone: 'America/New_York' },
    { kind: 'business' as const, first },
    { kind: 'wellbeing' as const, first },
    { kind: 'bundle' as const, first, second, year: 2027, periodStart: '2027-01', periodTimezone: 'America/New_York' },
  ]
  for (const input of cases) {
    it(`generates a QA PDF for ${input.kind} in sandbox mode`, async () => {
      const report = await issueReport(input, orderId, 2026, 'test')
      expect(Buffer.from(report.pdf, 'base64').subarray(0, 5).toString()).toBe('%PDF-')
      expect(report.text.length).toBeGreaterThan(100)
      expect(report.qualityAudit).toBeDefined()
      if (input.kind !== 'bundle') {
        expect(BUYER_QUESTIONS[input.kind]).toHaveLength(7)
      }
      // Product 02 can pass structural QA after its calculation audit succeeds;
      // an unverified product still fails diagnostics without blocking issuance.
      if (input.kind === 'career') {
        expect(report.qualityAudit?.passed).toBe(true)
        expect(report.answerProvenance).toHaveLength(7)
      } else if (input.kind === 'complete') {
        expect(report.answerProvenance).toHaveLength(7)
        expect(report.calculationVerification?.status).toMatch(/^(verified|partial|mismatch|unavailable)$/)
      } else {
        expect(report.qualityAudit?.passed).toBe(false)
      }
    }, 120000)
  }

  it('does not create a live PDF when the product fails the quality gate', async () => {
    await expect(issueReport({ kind: 'compatibility', first, second }, orderId, 2026, 'live'))
      .rejects.toMatchObject({ name: 'ReportQualityGateError', code: 'report_quality_gate_failed' } satisfies Partial<ReportQualityGateError>)
  }, 120000)
})
