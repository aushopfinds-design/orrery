import { mkdir, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { issueReport } from './report.ts'

const cases = [
  CATEGORY_SCENARIOS[0].first,
  CATEGORY_SCENARIOS[1].first,
  { year: 2001, month: 12, day: 4, hour: 0, minute: 0, unknownTime: true, gender: 'F' as const, timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { year: 1990, month: 8, day: 14, hour: 8, minute: 30, gender: 'F' as const, timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { year: 1975, month: 12, day: 2, hour: 22, minute: 15, gender: 'M' as const, timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 },
]

describe('My Money & Career customer-first delivery', () => {
  it('answers the seven buyer questions in five distinct PDF reports, including unknown birth time', async () => {
    const reports = []
    for (const [index, first] of cases.entries()) {
      const report = await issueReport({ kind: 'career', first }, `12345678-1234-4234-8234-12345678901${index}`, 2026)
      const pdf = Buffer.from(report.pdf, 'base64')
      expect(report.text).toContain('Which Careers Suit Me Best?')
      expect(report.text).toContain('Am I Better Suited to Employment or Independent Work?')
      expect(report.text).toContain('How Do I Naturally Make Money?')
      expect(report.text).toContain('What Tends to Block My Financial Progress?')
      expect(report.text).toContain('When Might My Career or Money Situation Improve?')
      expect(report.text).toContain('What Do the Next Ten Years Suggest for My Work and Money?')
      expect(report.text).toContain('Question: What is my most important career and money insight?')
      expect(report.qualityAudit?.score).toBe(100)
      expect(report.qualityAudit?.passed).toBe(true)
      const buyerSection = report.text.slice(report.text.indexOf('Question: Which careers suit me best?'), report.text.indexOf('Calculation notes'))
      expect(buyerSection.match(/^Question:/gm)?.length).toBe(7)
      expect(buyerSection.match(/^Your Answer:/gm)?.length).toBe(7)
      expect(buyerSection.match(/^What This Means for You:/gm)?.length).toBeGreaterThanOrEqual(3)
      expect(buyerSection.match(/^Bottom Line:/gm)?.length).toBeGreaterThanOrEqual(1)
      expect(buyerSection).toMatch(/possible periods of career support|clear period of extra support/i)
      expect(buyerSection).toMatch(/Your 2026–2035 outlook is mixed: work themes change/i)
      expect(buyerSection).toMatch(/do not show a steady rise in income/i)
      expect(buyerSection).not.toMatch(/added work friction/i)
      const q1 = buyerSection.match(/Question: Which careers suit me best\?\n\nYour Answer: ([^\n]+)/)?.[1]
      const q7 = buyerSection.match(/Question: What is my most important career and money insight\?\n\nYour Answer: ([^\n]+)/)?.[1]
      expect(q1).toBeTruthy()
      expect(q7).toBeTruthy()
      expect(q7).not.toBe(q1)
      expect(q7).toMatch(/money|income|earning/i)
      if ([1, 2].includes(index)) {
        expect(buyerSection).toMatch(/Your Answer: Your chart has a limited sign for regular pay, linked to/i)
        expect(buyerSection).not.toMatch(/What This Means for You: Steady pay is linked/i)
        expect(buyerSection).not.toMatch(/Bottom Line: The chart does not settle an income route/i)
      }
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
      reports.push(report)
      if (process.env.CAREER_PDF_DIR) {
        await mkdir(process.env.CAREER_PDF_DIR, { recursive: true })
        await writeFile(`${process.env.CAREER_PDF_DIR}/profile-${index + 1}.pdf`, pdf)
      }
    }
    const careerAnswers = reports.map(report => report.text.match(/Your Answer: ([^\n]+)/)?.[1])
    const workChoices = reports.map(report => report.text.match(/Question: Am I better suited to employment or independent work\?\n\nYour Answer: ([^\n]+)/)?.[1])
    const workReasons = reports.map(report => report.text.match(/Question: Am I better suited to employment or independent work\?[\s\S]*?\n\nWhat This Means for You: ([^\n]+)/)?.[1])
    expect(new Set(careerAnswers).size).toBeGreaterThanOrEqual(4)
    expect(new Set(workChoices).size).toBeGreaterThanOrEqual(2)
    expect(new Set(workReasons).size).toBeGreaterThanOrEqual(3)
    expect(reports[2].text).toContain('Hour: Unknown')
    expect(reports[2].text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
  }, 120_000)
})
