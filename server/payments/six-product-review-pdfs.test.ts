import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { issueReport } from './report.ts'
import { BUYER_QUESTIONS, type BuyerOutlineKind } from '../../src/report/buyer-outline.ts'
import type { BirthInput } from '@orrery/core/types'

const profiles: { id: string; first: BirthInput; second: BirthInput }[] = [
  CATEGORY_SCENARIOS[0], CATEGORY_SCENARIOS[1], CATEGORY_SCENARIOS[2],
  { id: 'sydney-1990', first: { year: 1990, month: 8, day: 14, hour: 8, minute: 30, gender: 'F' as const, timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }, second: CATEGORY_SCENARIOS[1].second },
  { id: 'la-1975', first: { year: 1975, month: 12, day: 2, hour: 22, minute: 15, gender: 'M' as const, timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 }, second: CATEGORY_SCENARIOS[0].first },
]
const products = ['complete', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'] as const
const questions: Record<(typeof products)[number], number> = { complete: 7, compatibility: 7, year: 7, business: 7, wellbeing: 7, bundle: 10 }

describe('six final English product reports', () => {
  it('generates and opens all 30 reviewed customer PDFs', async () => {
    const output = process.env.FATE_SIX_PRODUCT_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    let count = 0
    const businessRiskOpenings: string[] = []
    for (const [profileIndex, profile] of profiles.entries()) {
      for (const kind of products) {
        const paired = kind === 'compatibility' || kind === 'bundle'
        const report = await issueReport({
          kind, first: profile.first, ...(paired ? { second: profile.second } : {}),
          ...(['year', 'bundle'].includes(kind) ? { year: 2026, periodStart: '2026-11', periodEnd: '2027-10', periodTimezone: 'Australia/Sydney' } : {}),
        }, '12345678-1234-4234-8234-123456789012', 2026, 'test')
        const bytes = Buffer.from(report.pdf, 'base64')
        expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
        const pdf = await PDFDocument.load(bytes)
        expect(pdf.getPageCount()).toBeGreaterThan(1)
        const internalLinks = pdf.getPages().flatMap(page => page.node.Annots()?.asArray() ?? [])
        expect(internalLinks.length, `${kind}/${profileIndex + 1} linked overview entries`).toBeGreaterThanOrEqual(5)
        expect(report.text).not.toMatch(/undefined|NaN|\[object Object\]/)
        expect(report.text.match(/Question: /g)?.length).toBe(questions[kind])
        if (kind === 'bundle') expect(report.text.match(/Your Answer: /g)?.length).toBe(10)
        else for (const item of BUYER_QUESTIONS[kind as BuyerOutlineKind]) expect(report.text).toContain(`Question: ${item.question}`)
        if (kind === 'business') {
          const risk = /Question: What financial risks should I understand\?\s+Answer: ([^.]+\.)/.exec(report.text)
          expect(risk, `profile ${profileIndex + 1} business risk answer`).not.toBeNull()
          businessRiskOpenings.push(risk![1])
        }
        if (kind === 'year') expect(report.text).toContain('Analysis window: November 2026 through October 2027.')
        if (profile.first.unknownTime) {
          expect(report.text).toContain('Hour: Unknown')
          expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
        }
        if (output) await writeFile(`${output}/${String(profileIndex + 1).padStart(2, '0')}-${kind}.pdf`, bytes)
        count++
      }
    }
    expect(count).toBe(30)
    expect(new Set(businessRiskOpenings).size).toBeGreaterThan(1)
  }, 180_000)
})
