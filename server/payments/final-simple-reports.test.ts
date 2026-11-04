import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { BUYER_QUESTIONS, type BuyerOutlineKind } from '../../src/report/buyer-outline.ts'
import { DESTINY_COLLECTION_QUESTIONS } from '../../src/report/category-readings.ts'
import { issueReport } from './report.ts'

const products = ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'] as const
const questionCount = { complete: 7, career: 7, compatibility: 7, year: 7, business: 7, wellbeing: 7, bundle: 10 }

describe('seven simplified report products use the paid PDF path', () => {
  it('generates one representative PDF per product with its questions and navigation intact', async () => {
    const output = process.env.FATE_SIMPLE_REPORT_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    const profile = CATEGORY_SCENARIOS[2] // unknown-time international profile
    for (const kind of products) {
      const paired = kind === 'compatibility' || kind === 'bundle'
      const report = await issueReport({
        kind,
        first: profile.first,
        ...(paired ? { second: profile.second } : {}),
        ...(kind === 'year' || kind === 'bundle' ? { year: 2026, periodStart: '2026-11', periodEnd: '2027-10', periodTimezone: 'America/New_York' } : {}),
      }, '12345678-1234-4234-8234-123456789099', 2026, 'test')

      const questions = kind === 'bundle' ? DESTINY_COLLECTION_QUESTIONS : BUYER_QUESTIONS[kind as BuyerOutlineKind].map(item => item.question)
      expect(report.text.match(/Question: /g)?.length, `${kind} question count`).toBe(questionCount[kind])
      for (const question of questions) expect(report.text, `${kind}/${question}`).toContain(`Question: ${question}`)
      expect(report.text).not.toMatch(/undefined|NaN|\[object Object\]/)
      if (kind === 'year') expect(report.text).toContain('Analysis window: November 2026 through October 2027.')
      expect(report.answerProvenance).toHaveLength(questionCount[kind])
      if (profile.first.unknownTime) {
        expect(report.text).toContain('Hour: Unknown')
        expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
      }

      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      const pdf = await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThan(1)
      const links = pdf.getPages().flatMap(page => page.node.Annots()?.asArray() ?? [])
      expect(links.length, `${kind} internal navigation`).toBeGreaterThan(0)
      if (output) await writeFile(`${output}/${kind}.pdf`, bytes)
    }
  }, 180_000)
})
