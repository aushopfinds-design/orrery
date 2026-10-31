import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { issueReport } from './report.ts'
import { BUYER_QUESTIONS } from '../../src/report/buyer-outline.ts'
import type { BirthInput } from '@orrery/core/types'

const profiles: BirthInput[] = [
  { year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'F' as const, timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { year: 1980, month: 3, day: 25, hour: 12, minute: 0, gender: 'M' as const, unknownTime: true, timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 },
  { year: 1987, month: 10, day: 4, hour: 9, minute: 15, gender: 'F' as const, timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
]

describe('Product 01 paid customer question answers', () => {
  it('generates readable PDFs whose ten answers fit each chart, including unknown birth time', async () => {
    const output = process.env.FATE_PRODUCT01_PDF_OUTPUT
    if (output) await mkdir(output, { recursive: true })
    const texts: string[] = []
    const careerAnswers: string[] = []
    const weaknessAnswers: string[] = []
    for (const [index, first] of profiles.entries()) {
      const report = await issueReport({ kind: 'complete', first }, `12345678-1234-4234-8234-12345678901${index}`, 2026, 'test')
      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(10)
      expect(report.text.match(/Question: /g)).toHaveLength(10)
      expect(report.text.match(/Answer: /g)).toHaveLength(10)
      expect(report.text).not.toMatch(/\[object Object\]|\bundefined\b|\bNaN\b/)
      for (const question of BUYER_QUESTIONS.complete) expect(report.text).toContain(`Question: ${question.question}`)
      expect(report.text).toContain('What Challenges Keep Returning in Your Life?')
      expect(report.text).toContain('Your most important life insight is that')
      const turningPoints = report.text.slice(report.text.indexOf('Question: When are my major turning points?'), report.text.indexOf('Question: What does my next ten-year cycle suggest?'))
      expect(turningPoints.match(/Why 20\d\d/g)?.length).toBeGreaterThanOrEqual(3)
      expect(turningPoints).not.toMatch(/branch-revision|repeated-friction pattern|partial combination/i)
      const opening = report.text.slice(report.text.indexOf('Question: What kind of person am I?'), report.text.indexOf('Question: What are my greatest strengths?'))
      expect(opening).not.toMatch(/Near (?:a conventional )?hour boundary|About this reading:|Reading basis:/i)
      expect(opening).not.toMatch(/already good enough|harder to finish/i)
      const challenge = report.text.slice(report.text.indexOf('Question: What are my biggest life challenges?'), report.text.indexOf('Question: When are my major turning points?'))
      const weakness = report.text.slice(report.text.indexOf('Question: What are my hidden weaknesses?'), report.text.indexOf('Question: What kind of career suits me?'))
      weaknessAnswers.push(weakness)
      expect(challenge).toMatch(/biggest life challenge may be/i)
      expect(challenge).toMatch(/public role|role people see/i)
      expect(challenge).not.toContain(weakness.slice(weakness.indexOf('Answer: ') + 8, weakness.indexOf('Answer detail:')).trim().split(/[.!?]/)[0])
      const career = report.text.slice(report.text.indexOf('Question: What kind of career suits me?'), report.text.indexOf('Question: How does money work in my life?'))
      expect(career).not.toMatch(/count a promising deal as income|payment arrives/i)
      careerAnswers.push(career)
      const love = report.text.slice(report.text.indexOf('Question: What is my pattern in love?'), report.text.indexOf('Question: What are my biggest life challenges?'))
      expect((love.match(/birth-hour marker/g) ?? []).length).toBeLessThanOrEqual(1)
      if (first.unknownTime) {
        expect(report.text).toContain('Hour: Unknown')
        expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
      }
      texts.push(report.text)
      if (output) await writeFile(`${output}/product-01-profile-${index + 1}.pdf`, bytes)
    }
    expect(new Set(texts).size).toBe(3)
    expect(new Set(careerAnswers).size).toBe(3)
    expect(new Set(weaknessAnswers).size).toBe(3)
    expect(new Set(texts.map(text => text.slice(text.indexOf('Question: What are my greatest strengths?'), text.indexOf('Question: What are my hidden weaknesses?')))).size).toBe(3)
  }, 120_000)
})
