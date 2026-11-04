import { mkdir, writeFile } from 'node:fs/promises'
import { PDFArray, PDFDict, PDFDocument, PDFName } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { BUYER_QUESTIONS } from '../../src/report/buyer-outline.ts'
import type { BirthInput } from '@orrery/core/types'
import { issueReport } from './report.ts'
import { calculateSaju } from '../../packages/core/src/saju.ts'

const profiles: { id: string; first: BirthInput }[] = [
  { id: 'new-york-known', first: CATEGORY_SCENARIOS[0].first },
  { id: 'seoul-known', first: CATEGORY_SCENARIOS[1].first },
  { id: 'new-york-unknown', first: CATEGORY_SCENARIOS[2].first },
  { id: 'sydney-known', first: { year: 1990, month: 8, day: 14, hour: 8, minute: 30, gender: 'F', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 } },
  { id: 'los-angeles-known', first: { year: 1975, month: 12, day: 2, hour: 22, minute: 15, gender: 'M', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 } },
]

describe('Product 01 root-cause recovery', () => {
  it('generates five reviewed Product 01 PDFs with chart trace and focused answers', async () => {
    const output = process.env.FATE_PRODUCT01_ROOT_FIX_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    const reports = []
    const review = []
    expect(calculateSaju(profiles[3].first).pillars.map(item => item.pillar.ganzi)).toEqual(['壬辰', '辛亥', '甲申', '庚午'])
    expect(calculateSaju(profiles[4].first).pillars.map(item => item.pillar.ganzi)).toEqual(['辛亥', '壬午', '丁亥', '乙卯'])
    for (const [index, profile] of profiles.entries()) {
      const report = await issueReport({ kind: 'complete', first: profile.first }, `12345678-1234-4234-8234-12345678901${index}`, 2026, 'test')
      reports.push(report)
      const chart = calculateSaju(profile.first)
      const matches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
      review.push({ profile: index + 1, id: profile.id, input: profile.first,
        pillarsHourDayMonthYear: chart.pillars.map(item => item.pillar.ganzi),
        firstDaewoonStart: chart.daewoon[0]?.startDate.toISOString(),
        calculationVerification: report.calculationVerification, structuralGate: report.qualityAudit,
        answers: matches.map((match, questionIndex) => ({ question: match[1], answer: report.text.slice(match.index! + match[0].length, matches[questionIndex + 1]?.index ?? report.text.length).trim() })) })
      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      const pdf = await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThan(10)
      expect(pdf.getPages().flatMap(page => page.node.Annots()?.asArray() ?? []).length).toBeGreaterThanOrEqual(5)
      const pages = pdf.getPages()
      const pageByRef = new Map(pages.map((page, pageIndex) => [page.ref.toString(), pageIndex + 1]))
      const destinations = (pages[2].node.Annots()?.asArray() ?? []).map(ref => {
        const annotation = pdf.context.lookup(ref, PDFDict)
        const destination = annotation.lookup(PDFName.of('Dest'), PDFArray)
        return pageByRef.get(destination.get(0).toString())
      })
      expect(destinations.sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([4, 6, 7, 8, 10])
      expect(report.text.match(/Question: /g)).toHaveLength(7)
      expect(report.text.match(/Answer: /g)).toHaveLength(7)
      expect(report.answerProvenance).toHaveLength(7)
      expect(report.answerProvenance?.every(trace => trace.ruleIds.length === 2 && trace.evidence.length > 0)).toBe(true)
      expect(report.calculationVerification?.status).toMatch(/^(verified|partial|mismatch|unavailable)$/)
      for (const question of BUYER_QUESTIONS.complete) expect(report.text).toContain(`Question: ${question.question}`)
      const q7Start = report.text.indexOf('Question: When may my life change direction?')
      const q7End = report.text.indexOf('Your most important life insight is that', q7Start)
      const q7 = report.text.slice(q7Start, q7End > -1 ? q7End : undefined)
      expect(q7.match(/Why 20\d\d/g)?.length ?? 0).toBeLessThanOrEqual(1)
      if (profile.first.unknownTime) {
        expect(report.text).toContain('Hour: Unknown')
        expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
      }
      if (output) await writeFile(`${output}/${String(index + 1).padStart(2, '0')}-${profile.id}.pdf`, bytes)
    }
    const first = reports[0].text
    const q3Start = first.indexOf('Question: What kind of career suits me?')
    const q2Start = first.indexOf('Question: What helps me thrive, and what can hold me back?')
    const q2 = first.slice(q2Start, q3Start)
    const q4Start = first.indexOf('Question: How does money work in my life?')
    const q5Start = first.indexOf('Question: What is my pattern in love?')
    const q3 = first.slice(q3Start, q4Start)
    const q4 = first.slice(q4Start, q5Start)
    expect(q3).toMatch(/career fit includes work/i)
    expect(q3).not.toMatch(/remit/i)
    expect(q2).toMatch(/sharp eye for small details/i)
    expect(q2).not.toMatch(/Your standout strength is quality and attention to detail/i)
    expect(q4).toMatch(/chart supports|chart does not show a direct money/i)
    expect(q4).not.toMatch(/The work pattern is .*linking the variable route/i)
    expect(q4).not.toMatch(/The work position speaks to daily duties/i)
    expect(first.slice(first.indexOf('Question: When may my life change direction?'))).toMatch(/The clearest year to review a major change is/i)
    expect(reports).toHaveLength(5)
    await writeFile('/tmp/product01-root-fix-summary.json', JSON.stringify(review, null, 2))
  }, 180_000)
})
