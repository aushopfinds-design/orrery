import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import type { BirthInput } from '@orrery/core/types'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { issueReport } from './report.ts'

const profiles: { first: BirthInput; second: BirthInput }[] = [
  CATEGORY_SCENARIOS[0], CATEGORY_SCENARIOS[1], CATEGORY_SCENARIOS[2],
  { first: { year: 1990, month: 8, day: 14, hour: 8, minute: 30, gender: 'F', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }, second: CATEGORY_SCENARIOS[1].second },
  { first: { year: 1975, month: 12, day: 2, hour: 22, minute: 15, gender: 'M', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 }, second: CATEGORY_SCENARIOS[0].first },
]

describe('Product 03 review PDF batch', () => {
  it('generates five two-person reports with the seven official answers and working navigation', async () => {
    const output = process.env.FATE_PRODUCT03_REVIEW_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    const q2Answers: string[] = []
    for (const [index, profile] of profiles.entries()) {
      const report = await issueReport({ kind: 'compatibility', first: profile.first, second: profile.second }, `12345678-1234-4234-8234-1234567890${String(index + 1).padStart(2, '0')}`, 2026, 'test')
      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      const pdf = await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThan(1)
      expect(pdf.getPages().flatMap(page => page.node.Annots()?.asArray() ?? []).length).toBeGreaterThanOrEqual(7)
      expect(report.text.match(/Question: /g)).toHaveLength(7)
      expect(report.text.match(/Answer: /g)).toHaveLength(7)
      for (const question of productQuestions('compatibility')) expect(report.text).toContain(`Question: ${question.title}`)
      const q4 = report.text.split('Question: How do we express love differently?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q4).toMatch(/You may show care|You and your partner may use a similar care style/)
      expect(q4).not.toMatch(/You may (?:Honest conversation|Clear commitment|Privacy and being understood)/)
      const q2 = report.text.split('Question: Why are we attracted to each other?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q2).toContain('The chart cannot confirm either person’s actual feelings.')
      q2Answers.push(q2)
      if (output) await writeFile(`${output}/${String(index + 1).padStart(2, '0')}-compatibility.pdf`, bytes)
    }
    expect(q2Answers.some(answer => answer.includes('neither a direct link nor a friction pattern'))).toBe(true)
    expect(q2Answers.some(answer => answer.includes('form a friction pattern'))).toBe(true)
    expect(q2Answers.some(answer => answer.includes('form a direct link'))).toBe(true)
  }, 120_000)
})
