import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { prepareReportContent } from './report.ts'
import { PRODUCT03_REVIEW_PROFILES } from './review-profiles.ts'

describe('Product 02 text-only review export', () => {
  it('exports five actual paid-report bodies with seven official answers without rendering PDFs', async () => {
    const definitions = productQuestions('career')
    const reports = []
    for (const [profileIndex, profile] of PRODUCT03_REVIEW_PROFILES.entries()) {
      const report = await prepareReportContent(
        { kind: 'career', first: profile.first },
        `12345678-1234-4234-8234-1234567892${String(profileIndex + 1).padStart(2, '0')}`,
        2026,
        'test',
      )
      expect(report.pdf).toBe('')
      const matches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
      expect(matches.map(match => match[1])).toEqual(definitions.map(question => question.title))
      const answers = definitions.map((definition, questionIndex) => {
        const start = matches[questionIndex].index! + matches[questionIndex][0].length
        const nextQuestion = matches[questionIndex + 1]?.index ?? report.text.length
        const appendixOffsets = ['Calculation notes', 'Chart evidence for these answers', 'How this reading is prepared']
          .map(heading => report.text.indexOf(heading, start)).filter(index => index >= 0)
        const end = Math.min(nextQuestion, ...appendixOffsets)
        const actualAnswer = report.text.slice(start, end).trim()
        expect(actualAnswer, `profile ${profileIndex + 1} question ${questionIndex + 1}`).not.toBe('')
        const bottomLines = [...actualAnswer.matchAll(/^Bottom Line: (.+)$/gmu)].map(match => match[1])
        expect(bottomLines, `profile ${profileIndex + 1} question ${questionIndex + 1} Bottom Line`).toHaveLength(1)
        expect(bottomLines[0].match(/[^.!?]+[.!?]+/gu) ?? [], `profile ${profileIndex + 1} question ${questionIndex + 1} Bottom Line sentences`).toHaveLength(2)
        return {
          question_id: definition.id,
          question_number: questionIndex + 1,
          official_title: definition.title,
          actual_answer: actualAnswer,
          chart_evidence: report.answerProvenance?.find(item => item.questionId === definition.id) ?? null,
          content_score_100: null,
          evaluation_status: 'VERIFY',
          deductions: [],
        }
      })
      reports.push({
        product_id: '02',
        product_name: 'Success, Money & Your Future',
        profile_number: profileIndex + 1,
        profile_id: profile.id,
        chart_data_used: {
          birthTimeKnown: !profile.first.unknownTime,
          pillars: calculateSaju(profile.first).pillars.map(item => ({ ganzi: item.pillar.ganzi, stemRole: item.stemSipsin, branchRole: item.branchSipsin })),
        },
        answers,
      })
    }
    expect(reports).toHaveLength(5)
    expect(reports.reduce((sum, report) => sum + report.answers.length, 0)).toBe(35)
    const path = process.env.FATE_PRODUCT02_REVIEW_TEXT_PATH
    if (path) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, JSON.stringify({
        record_type: 'product02_actual_answer_text_review',
        product_id: '02',
        product_name: 'Success, Money & Your Future',
        source_checkpoint_sha: process.env.REVIEW_SOURCE_SHA ?? 'b9f7ccae396a2dbf93ee25f2d23d1a2a20d0ba8a',
        generator: 'prepareReportContent-v1; Product 02 letter-bottom-line rules v2; PDF renderer not called',
        evaluation_scale: 'manual content only / 100 points: direct answer 35, personalization 25, easy English 15, repetition 10, evidence consistency 15; PDF design excluded',
        reports,
      }, null, 2) + '\n', 'utf8')
    }
  }, 120_000)
})
