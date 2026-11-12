import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { prepareReportContent } from './report.ts'
import { PRODUCT03_REVIEW_PROFILES } from './review-profiles.ts'

const answerLabels = /^(?:Your Answer|Answer|Answer detail|What This Means for You|Important Timing|Bottom Line|Practical point|Main caution):\s*/i

function chartSummary(input: (typeof PRODUCT03_REVIEW_PROFILES)[number]['first']) {
  const calculated = calculateSaju(input)
  return {
    birthTimeKnown: !input.unknownTime,
    pillars: calculated.pillars.map(item => ({
      ganzi: item.pillar.ganzi,
      stemRole: item.stemSipsin,
      branchRole: item.branchSipsin,
    })),
  }
}

describe('Product 03 text-only review export', () => {
  it('uses the paid report content path and exports 35 actual answers without rendering PDFs', async () => {
    const definitions = productQuestions('compatibility')
    const pdfs = []
    for (const [profileIndex, profile] of PRODUCT03_REVIEW_PROFILES.entries()) {
      const report = await prepareReportContent(
        { kind: 'compatibility', first: profile.first, second: profile.second },
        `12345678-1234-4234-8234-1234567890${String(profileIndex + 1).padStart(2, '0')}`,
        2026,
        'test',
      )
      expect(report.pdf).toBe('')
      const matches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
      expect(matches.map(match => match[1])).toEqual(definitions.map(question => question.title))
      const answers = definitions.map((definition, questionIndex) => {
        const start = matches[questionIndex].index! + matches[questionIndex][0].length
        const end = matches[questionIndex + 1]?.index ?? report.text.length
        const blocks = report.text.slice(start, end).split(/\n\s*\n/).map(value => value.trim()).filter(Boolean)
        const actualAnswer = blocks.filter(block => answerLabels.test(block))
          .map(block => block.replace(answerLabels, '').trim()).join('\n\n')
        const trace = report.answerProvenance?.find(item => item.questionId === definition.id)
        expect(actualAnswer, `profile ${profileIndex + 1} question ${questionIndex + 1}`).not.toBe('')
        return {
          question_id: definition.id,
          question_number: questionIndex + 1,
          official_title: definition.title,
          actual_answer: actualAnswer,
          chart_evidence: trace ?? null,
          content_score_95: null,
          evaluation_status: 'VERIFY',
          deductions: [],
        }
      })
      pdfs.push({
        product_id: '03',
        product_name: 'Are We Meant to Be?',
        profile_number: profileIndex + 1,
        profile_id: profile.id,
        chart_data_used: { you: chartSummary(profile.first), partner: chartSummary(profile.second) },
        answers,
      })
    }
    expect(pdfs).toHaveLength(5)
    expect(pdfs.reduce((sum, pdf) => sum + pdf.answers.length, 0)).toBe(35)
    const path = process.env.FATE_PRODUCT03_REVIEW_TEXT_PATH
    if (path) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, JSON.stringify({
        record_type: 'product03_actual_answer_text_review',
        product_id: '03',
        product_name: 'Are We Meant to Be?',
        source_checkpoint_sha: process.env.REVIEW_SOURCE_SHA ?? '18151004d05ee57e8a0f11eda71bab1057387337',
        generator: 'prepareReportContent-v1; same paid-report content path; PDF renderer not called',
        evaluation_scale: 'content-only / 95 points; score remains null until reviewed',
        pdfs,
      }, null, 2) + '\n', 'utf8')
    }
  }, 120_000)
})
