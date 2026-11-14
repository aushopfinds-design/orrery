import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import type { PreviewKind } from '../../src/report/personal-products.ts'
import { issueReport } from './report.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { REPORT_ANSWER_STANDARD } from '../../src/report/report-answer-standard.ts'

const samples = [
  CATEGORY_SCENARIOS[0].first,
  CATEGORY_SCENARIOS[1].first,
  CATEGORY_SCENARIOS[2].first,
  CATEGORY_SCENARIOS[0].second,
  CATEGORY_SCENARIOS[1].second,
]
const products: PreviewKind[] = ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle']
const outputNames: Record<PreviewKind, string> = {
  complete: '01-life.pdf', career: '02-career-money.pdf', compatibility: '03-compatibility.pdf',
  year: '04-next-12-months.pdf', business: '05-business.pdf', wellbeing: '06-strengths-weaknesses.pdf', bundle: '07-destiny-collection.pdf',
  love: 'legacy-love.pdf',
}

describe('seven purchased report PDF generation', () => {
  it('issues and opens all seven reports for five distinct birth profiles', async () => {
    const output = process.env.FATE_MASTER_PDF_OUTPUT
    if (output) await mkdir(output, { recursive: true })
    let generated = 0
    const answerSet: Array<{ profile: number; product: PreviewKind; questions: Array<{ title: string; answer: string }>; answerChecklist: Array<{ question: string; checks: Array<{ item: string; status: 'review' }> }> }> = []
    for (const [personIndex, first] of samples.entries()) {
      for (const kind of products) {
        const second = kind === 'compatibility' || kind === 'bundle' ? CATEGORY_SCENARIOS[personIndex % CATEGORY_SCENARIOS.length].second : undefined
        const report = await issueReport({ kind, first, ...(second ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: 2026, periodStart: '2026-11', periodEnd: '2027-10', periodTimezone: 'Australia/Sydney' } : {}) }, '12345678-1234-4234-8234-123456789012', 2026, 'test')
        const bytes = Buffer.from(report.pdf, 'base64')
        expect(bytes.subarray(0, 5).toString(), `${kind} for profile ${personIndex + 1}`).toBe('%PDF-')
        const pdf = await PDFDocument.load(bytes)
        expect(pdf.getPageCount(), `${kind} for profile ${personIndex + 1}`).toBeGreaterThan(1)
        expect(report.text).not.toMatch(/undefined|NaN|\[object Object\]/)
        if (kind === 'bundle') {
          expect(report.documents).toHaveLength(1)
          expect(report.text.match(/Question: /g)?.length, `${kind} question count`).toBe(10)
          expect(report.text.match(/Answer: /g)?.length, `${kind} answer count`).toBe(10)
          expect(report.text).toContain(`Question: ${productQuestions('bundle')[0].title}`)
          expect(report.text).not.toContain('Question: How do you and your partner fit together?')
        } else {
        const expectedQuestions = productQuestions(kind)
        expect(report.text.match(/Question: /g)?.length, `${kind} question count`).toBe(expectedQuestions.length)
        expect(report.text.match(/Answer: /g)?.length, `${kind} answer count`).toBe(expectedQuestions.length)
        for (const question of expectedQuestions) expect(report.text).toContain(`Question: ${question.title}`)
        }
        if (kind === 'year') {
          expect(report.title).toBe('Your Next 12 Months')
          expect(report.text).toContain('Analysis window: November 2026 through October 2027.')
          expect(report.text).toContain('Australia/Sydney timezone')
        }
        if (first.unknownTime && kind !== 'bundle') {
          expect(report.text).toContain('Hour: Unknown')
          expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
        }
        if (second) expect(report.text).toContain('Your partner')
        const questionTitles = kind === 'bundle'
          ? productQuestions('bundle').map(question => question.title)
          : productQuestions(kind).map(question => question.title)
        const questionBlocks = report.text.split(/\n\s*\n/)
        const questions = questionTitles.map(title => {
          const titleIndex = questionBlocks.findIndex(block => block.trim() === `Question: ${title}`)
          expect(titleIndex, `${kind} question title: ${title}`).toBeGreaterThanOrEqual(0)
          const nextQuestionIndex = questionBlocks.findIndex((block, index) => index > titleIndex && /^Question:/i.test(block.trim()))
          const section = questionBlocks.slice(titleIndex + 1, nextQuestionIndex < 0 ? undefined : nextQuestionIndex)
          const answerBlock = section.find(block => /^(?:Your Answer|Answer|Answer detail|What This Means for You|Important Timing|Bottom Line|Practical point|Main caution):/i.test(block.trim()))
          const answer = answerBlock?.trim().replace(/^(?:Your Answer|Answer|Answer detail|What This Means for You|Important Timing|Bottom Line|Practical point|Main caution):\s*/i, '') ?? ''
          return { title, answer }
        })
        expect(questions.every(question => question.answer.length > 0), `${kind} answers present`).toBe(true)
        answerSet.push({
          profile: personIndex + 1,
          product: kind,
          questions,
          answerChecklist: questions.map(question => ({ question: question.title, checks: REPORT_ANSWER_STANDARD.reviewChecklist.map(item => ({ item, status: 'review' as const })) })),
        })
        if (output) {
          const profileDir = `${output}/profile-${String(personIndex + 1).padStart(2, '0')}`
          await mkdir(profileDir, { recursive: true })
          await writeFile(`${profileDir}/${outputNames[kind]}`, bytes)
        }
        generated++
      }
    }
    if (output) await writeFile(`${output}/answers.json`, JSON.stringify({ standardVersion: REPORT_ANSWER_STANDARD.version, generatedReports: generated, profiles: samples.length, products: products.length, reports: answerSet }, null, 2))
    expect(generated).toBe(35)
  }, 300_000)
})
