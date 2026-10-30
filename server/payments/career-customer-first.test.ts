import { mkdir, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { issueReport } from './report.ts'

const cases = [
  CATEGORY_SCENARIOS[0].first,
  CATEGORY_SCENARIOS[1].first,
  { year: 2001, month: 12, day: 4, hour: 0, minute: 0, unknownTime: true, gender: 'F' as const, timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
]

describe('My Money & Career customer-first delivery', () => {
  it('answers the buyer questions in three distinct PDF reports, including unknown birth time', async () => {
    const reports = []
    for (const [index, first] of cases.entries()) {
      const report = await issueReport({ kind: 'career', first }, `12345678-1234-4234-8234-12345678901${index}`, 2026)
      const pdf = Buffer.from(report.pdf, 'base64')
      expect(report.text).toContain('What Kind of Career Suits You Best?')
      expect(report.text).toContain('Am I Better Suited to Employment or Running a Business?')
      expect(report.text).toContain('How Am I Most Likely to Make Money?')
      expect(report.text).toContain('What Could Hold Back My Financial Success?')
      expect(report.text).toContain('When Might My Career or Financial Direction Change?')
      expect(report.text).toContain('What Should I Focus on to Build a Better Future?')
      expect(report.text.match(/Direct answer:/g)?.length).toBeGreaterThanOrEqual(7)
      expect(report.text).toContain('What this means for you:')
      expect(report.text).toContain('Bottom line:')
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
      reports.push(report)
      if (process.env.CAREER_PDF_OUT && index === 0) {
        await mkdir(new URL('../../deliverable/', import.meta.url), { recursive: true })
        await writeFile(process.env.CAREER_PDF_OUT, pdf)
      }
    }
    const careerAnswers = reports.map(report => report.text.match(/Direct answer: ([^\n]+)/)?.[1])
    expect(new Set(careerAnswers).size).toBe(3)
    expect(reports[2].text).toContain('Hour: Unknown')
    expect(reports[2].text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
  })
})
