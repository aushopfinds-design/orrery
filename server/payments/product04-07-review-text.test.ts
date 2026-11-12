import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { prepareReportContent } from './report.ts'
import { PRODUCT03_REVIEW_PROFILES } from './review-profiles.ts'

const products = [
  { id: '04', kind: 'year' as const, name: 'Your Next 12 Months' },
  { id: '05', kind: 'business' as const, name: 'Born to Build a Business?' },
  { id: '06', kind: 'wellbeing' as const, name: 'The Real You' },
  { id: '07', kind: 'bundle' as const, name: 'Your Destiny Collection' },
]

describe('Products 04–07 text-only review export', () => {
  for (const product of products) {
    it(`exports five paid-path texts and the official answers for Product ${product.id}`, async () => {
      const definitions = productQuestions(product.kind)
      const reports = []
      for (const [profileIndex, profile] of PRODUCT03_REVIEW_PROFILES.entries()) {
        const input = product.kind === 'year'
          ? { kind: 'year' as const, first: profile.first, year: 2027, periodStart: '2027-01', periodTimezone: 'America/New_York' }
          : product.kind === 'bundle'
            ? { kind: 'bundle' as const, first: profile.first, second: profile.second, year: 2027, periodStart: '2027-01', periodTimezone: 'America/New_York' }
            : { kind: product.kind, first: profile.first }
        const report = await prepareReportContent(input, `12345678-1234-4234-8234-12345678${product.id}${String(profileIndex + 1).padStart(2, '0')}`, 2026, 'test')
        expect(report.pdf).toBe('')
        const matches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
        expect(matches.map(match => match[1])).toEqual(definitions.map(question => question.title))
        const answers = definitions.map((definition, questionIndex) => {
          const start = matches[questionIndex].index! + matches[questionIndex][0].length
          const nextQuestion = matches[questionIndex + 1]?.index ?? report.text.length
          const appendixOffsets = [
            'Your Twelve Months', 'Your Ten-Year Business Cycles', 'Your Ten-Year Work and Money',
            'Your Everyday Compass', 'Your Included Reports', 'Calculation notes',
            'Chart evidence for these answers', 'How this reading is prepared',
          ].map(heading => report.text.indexOf(`\n\n${heading}`, start)).filter(index => index >= 0)
          const end = Math.min(nextQuestion, ...appendixOffsets)
          const actualAnswer = report.text.slice(start, end).trim()
          expect(actualAnswer, `Product ${product.id}, profile ${profileIndex + 1}, Q${questionIndex + 1}`).not.toBe('')
          return {
            question_id: definition.id,
            question_number: questionIndex + 1,
            official_title: definition.title,
            actual_answer: actualAnswer,
            chart_evidence: report.answerProvenance?.find(item => item.questionId === definition.id) ?? null,
            evaluation_status: 'VERIFY',
            score_100: null,
            deductions: [],
          }
        })
        if (product.kind === 'bundle') {
          const threeYearPriority = answers[6].actual_answer
          const fulfillment = answers[8].actual_answer
          const finalMessage = answers[9].actual_answer
          expect(threeYearPriority).toMatch(/For the next three years, let .+ guide your work choices and make room for/u)
          expect(threeYearPriority).toContain('The chart gives a separate annual comparison for 2027 only')
          expect(threeYearPriority).not.toContain('prioritise crisis handling')
          expect(finalMessage).toMatch(/^Your Answer: Your personal style centres on .+; use it to shape how you approach .+ at work\./u)
          expect(finalMessage).not.toContain(fulfillment.split('\n\n')[0].replace(/^Your Answer: /u, ''))
          expect(finalMessage).toMatch(/Bottom Line: Let .+ guide how you use .+ at work\. Make room to ask clearly for .+ in close relationships\./u)
        }
        if (product.kind === 'year') {
          expect(answers[3].actual_answer).toContain('Your usual work pattern centres on')
          expect(answers[3].actual_answer).toContain('treat extra urgency as a temporary demand')
        }
        reports.push({
          product_id: product.id,
          product_name: product.name,
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
      expect(reports.reduce((sum, report) => sum + report.answers.length, 0)).toBe(5 * definitions.length)
      const path = process.env[`FATE_PRODUCT${product.id}_REVIEW_TEXT_PATH`]
      if (path) {
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, JSON.stringify({
          record_type: `product${product.id}_actual_answer_text_review`,
          product_id: product.id,
          product_name: product.name,
          source_checkpoint_sha: process.env.REVIEW_SOURCE_SHA ?? 'c689e8a6621c9f24eea37c131fd833562e7b2b76',
          generator: 'prepareReportContent-v1; same paid-report content path; PDF renderer not called',
          evaluation_scale: 'Manual content review / 100 points: direct answer 35, personalization 25, easy English 15, repetition 10, evidence consistency 15; PDF design excluded',
          reports,
        }, null, 2) + '\n', 'utf8')
      }
    }, 120_000)
  }
})
