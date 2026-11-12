import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { prepareReportContent } from './report.ts'
import { PRODUCT03_REVIEW_PROFILES } from './review-profiles.ts'

const answerLabels = /^(?:Your Answer|Answer detail|Answer|What This Means for You|Important Timing|Bottom Line|Practical point|Main caution):\s*/i

describe('Product 01 text-only review export', () => {
  it('exports five actual paid-report bodies with seven official answers and no PDF rendering', async () => {
    const definitions = productQuestions('complete')
    const reports = []
    for (const [profileIndex, profile] of PRODUCT03_REVIEW_PROFILES.entries()) {
      const report = await prepareReportContent(
        { kind: 'complete', first: profile.first },
        `12345678-1234-4234-8234-1234567891${String(profileIndex + 1).padStart(2, '0')}`,
        2026,
        'test',
      )
      expect(report.pdf).toBe('')
      const matches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
      expect(matches.map(match => match[1])).toEqual(definitions.map(question => question.title))
      const answers = definitions.map((definition, questionIndex) => {
        const start = matches[questionIndex].index! + matches[questionIndex][0].length
        const nextQuestion = matches[questionIndex + 1]?.index ?? report.text.length
        const appendixOffsets = ['Your Ten-Year', 'Your Everyday Compass', 'Calculation notes', 'Chart evidence for these answers', 'How this reading is prepared']
          .map(heading => report.text.indexOf(heading, start)).filter(index => index >= 0)
        const end = Math.min(nextQuestion, ...appendixOffsets)
        const blocks = report.text.slice(start, end).split(/\n\s*\n/).map(value => value.trim()).filter(Boolean)
        const actualAnswer = blocks
          .map(block => block.startsWith('Bottom Line: ')
            ? `Bottom Line: ${block.replace(/^Bottom Line:\s*/i, '').trim()}`
            : block.replace(answerLabels, '').trim()).join('\n\n')
        expect(actualAnswer, `profile ${profileIndex + 1} question ${questionIndex + 1}`).not.toBe('')
        expect(actualAnswer, `profile ${profileIndex + 1} question ${questionIndex + 1} Bottom Line`).toMatch(/Bottom Line: [\s\S]+/)
        expect(actualAnswer, `profile ${profileIndex + 1} question ${questionIndex + 1} legacy headings`).not.toMatch(/Your Answer:|What This Means for You:|Answer detail:/)
        if (definition.id === 'money') expect(actualAnswer, `profile ${profileIndex + 1} money evidence`).toMatch(/steady pay signs|signal for steady pay|no direct project or customer income signal/i)
        if (definition.id === 'q-turning-points') expect(actualAnswer).not.toMatch(/approximate start period|Ten-Year Cycles in Detail/i)
        return {
          question_id: definition.id,
          question_number: questionIndex + 1,
          official_title: definition.title,
          actual_answer: actualAnswer,
          raw_section: report.text.slice(start, end).trim(),
          chart_evidence: report.answerProvenance?.find(item => item.questionId === definition.id) ?? null,
          content_score_100: null,
          evaluation_status: 'VERIFY',
          deductions: [],
        }
      })
      reports.push({
        product_id: '01',
        product_name: 'Your Life, Your Destiny',
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
    const path = process.env.FATE_PRODUCT01_REVIEW_TEXT_PATH
    if (path) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, JSON.stringify({
        record_type: 'product01_actual_answer_text_review',
        product_id: '01',
        product_name: 'Your Life, Your Destiny',
        source_checkpoint_sha: process.env.REVIEW_SOURCE_SHA ?? '6a85e358f1611343a08dd84ae82138f4855e30dd',
        generator: 'prepareReportContent-v1; same paid-report content path; PDF renderer not called',
        evaluation_scale: 'manual content only / 100 points: direct answer 35, personalization 25, easy English 15, repetition 10, evidence consistency 15; PDF design excluded',
        reports,
      }, null, 2) + '\n', 'utf8')
    }
  }, 120_000)
})
