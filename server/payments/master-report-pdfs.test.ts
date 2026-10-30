import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import type { PreviewKind } from '../../src/report/personal-products.ts'
import { issueReport } from './report.ts'
import { BUYER_QUESTIONS, type BuyerOutlineKind } from '../../src/report/buyer-outline.ts'

const samples = [
  CATEGORY_SCENARIOS[0].first,
  CATEGORY_SCENARIOS[1].first,
  CATEGORY_SCENARIOS[2].first,
]
const products: PreviewKind[] = ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle']
const outputNames: Record<PreviewKind, string> = {
  complete: '01-life.pdf', career: '02-career-money.pdf', compatibility: '03-compatibility.pdf',
  year: '04-next-12-months.pdf', business: '05-business.pdf', wellbeing: '06-strengths-weaknesses.pdf', bundle: '07-destiny-collection.pdf',
  love: 'legacy-love.pdf',
}

describe('seven purchased report PDF generation', () => {
  it('issues and opens all seven reports for three distinct birth profiles', async () => {
    const output = process.env.FATE_MASTER_PDF_OUTPUT
    if (output) await mkdir(output, { recursive: true })
    let generated = 0
    for (const [personIndex, first] of samples.entries()) {
      for (const kind of products) {
        const second = kind === 'compatibility' || kind === 'bundle' ? CATEGORY_SCENARIOS[1].second : undefined
        const report = await issueReport({ kind, first, ...(second ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: 2026, periodStart: '2026-11', periodEnd: '2027-10', periodTimezone: 'Australia/Sydney' } : {}) }, '12345678-1234-4234-8234-123456789012', 2026, 'test')
        const bytes = Buffer.from(report.pdf, 'base64')
        expect(bytes.subarray(0, 5).toString(), `${kind} for profile ${personIndex + 1}`).toBe('%PDF-')
        const pdf = await PDFDocument.load(bytes)
        expect(pdf.getPageCount(), `${kind} for profile ${personIndex + 1}`).toBeGreaterThan(1)
        expect(report.text).not.toMatch(/undefined|NaN|\[object Object\]/)
        const questionKinds: BuyerOutlineKind[] = kind === 'bundle'
          ? ['complete', 'year', 'compatibility', 'career', 'love']
          : [kind]
        const expectedQuestions = questionKinds.flatMap(questionKind => BUYER_QUESTIONS[questionKind])
        expect(report.text.match(/Question: /g)?.length, `${kind} question count`).toBe(expectedQuestions.length)
        expect(report.text.match(/Answer: /g)?.length, `${kind} answer count`).toBe(expectedQuestions.length)
        for (const question of expectedQuestions) expect(report.text).toContain(`Question: ${question.question}`)
        if (kind === 'year') {
          expect(report.title).toBe('Your Next 12 Months')
          expect(report.text).toContain('Analysis window: November 2026 through October 2027.')
          expect(report.text).toContain('Australia/Sydney timezone')
        }
        if (first.unknownTime) {
          expect(report.text).toContain('Hour: Unknown')
          expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
        }
        if (second) expect(report.text).toContain('Person B')
        if (output && personIndex === 0) await writeFile(`${output}/${outputNames[kind]}`, bytes)
        generated++
      }
    }
    expect(generated).toBe(21)
  }, 120_000)
})
