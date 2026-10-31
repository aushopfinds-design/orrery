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
  it('generates readable PDFs with seven direct answers for varied charts and unknown birth time', async () => {
    const output = process.env.FATE_PRODUCT01_PDF_OUTPUT
    if (output) await mkdir(output, { recursive: true })
    const texts: string[] = []
    const careerAnswers: string[] = []
    for (const [index, first] of profiles.entries()) {
      const report = await issueReport({ kind: 'complete', first }, `12345678-1234-4234-8234-12345678901${index}`, 2026, 'test')
      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(10)
      expect(report.text.match(/Question: /g)).toHaveLength(7)
      expect(report.text.match(/Answer: /g)).toHaveLength(7)
      expect(report.text).not.toMatch(/\[object Object\]|\bundefined\b|\bNaN\b/)
      for (const question of BUYER_QUESTIONS.complete) expect(report.text).toContain(`Question: ${question.question}`)
      expect(report.text).toContain('What Challenges Keep Returning in Your Life?')
      expect(report.text).toContain('Your most important life insight is that')
      const turningPoints = report.text.slice(report.text.indexOf('Question: When may my life change direction?'))
      expect(turningPoints.match(/Why 20\d\d/g)?.length).toBeGreaterThanOrEqual(3)
      const challengeStart = report.text.indexOf('Question: What are my biggest life challenges?')
      const turningStart = report.text.indexOf('Question: When may my life change direction?')
      const challenge = report.text.slice(challengeStart, turningStart)
      expect(challenge).toMatch(/biggest life challenge may be/i)
      expect(challenge).toMatch(/public role|role people see/i)
      const careerStart = report.text.indexOf('Question: What kind of career suits me?')
      const moneyStart = report.text.indexOf('Question: How does money work in my life?')
      const career = report.text.slice(careerStart, moneyStart)
      expect(career).not.toMatch(/count a promising deal as income|payment arrives/i)
      careerAnswers.push(career)
      const loveStart = report.text.indexOf('Question: What is my pattern in love?')
      const love = report.text.slice(loveStart, challengeStart)
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
  }, 120_000)
})
