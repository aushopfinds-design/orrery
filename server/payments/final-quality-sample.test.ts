import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { issueReport } from './report.ts'

describe('final six-product representative PDF review', () => {
  it('generates six readable PDFs and keeps relationship answers distinct', async () => {
    const profile = CATEGORY_SCENARIOS[0]
    const output = process.env.FATE_REPRESENTATIVE_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    for (const kind of ['complete', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'] as const) {
      const paired = kind === 'compatibility' || kind === 'bundle'
      const report = await issueReport({
        kind, first: profile.first, ...(paired ? { second: profile.second } : {}),
        ...(kind === 'year' || kind === 'bundle' ? { year: 2026, periodStart: '2026-11', periodEnd: '2027-10', periodTimezone: 'Australia/Sydney' } : {}),
      }, '12345678-1234-4234-8234-123456789012', 2026, 'test')
      const bytes = Buffer.from(report.pdf, 'base64')
      const pdf = await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThan(1)
      if (kind !== 'bundle') expect(report.text.match(/^Question: /gm)).toHaveLength(7)
      if (kind === 'compatibility') {
        const conflict = /Question: What tends to cause friction between us\?\n\nAnswer: ([^\n]+)/.exec(report.text)?.[1]
        const loveLanguage = /Question: How do we express love differently\?\n\nAnswer: ([^\n]+)/.exec(report.text)?.[1]
        expect(conflict).toBeTruthy()
        expect(loveLanguage).toBeTruthy()
        expect(loveLanguage).not.toBe(conflict)
        expect(loveLanguage).not.toMatch(/useful first response is to listen to the full concern/i)
        expect(report.text).toMatch(/Question: Which upcoming periods may affect our relationship themes\?\n\nAnswer: The relationship themes in your personal timelines shift across 2026–2030/)
      }
      if (kind === 'year') {
        expect(report.text).toMatch(/Question: What is the overall theme of my next 12 months\?\n\nAnswer: The clearest work theme for November 2026 through October 2027 is this:/)
        expect(report.text).toContain('June 2027 appears in both lists')
        expect(report.text).toContain('Extra-care note: Ask whether the authority and pay match the responsibility attached to a role.')
      }
      if (output) await writeFile(`${output}/sample-${kind}.pdf`, bytes)
    }
  }, 120_000)
})
