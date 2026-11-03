import { describe, expect, it } from 'vitest'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { buildPersonalPreview } from '../../src/report/personal-preview.ts'
import { plainReadingText } from '../../src/report/reading-text.ts'
import { auditBirthInput } from './independent-audit.ts'
import { issueReport } from './report.ts'

describe('My Life customer audit integration', () => {
  it('uses the same verified passage in personal preview, issued report, and its generated PDF', async () => {
    const first = CATEGORY_SCENARIOS[0].first
    const current = calculateSaju(first)
    const audit = await auditBirthInput(first, current)
    expect(audit).toBeDefined()
    const preview = buildPersonalPreview('complete', { first }, audit)
    const excerpt = preview.excerpts.find(section => section.id === 'career')!
    const issued = await issueReport({ kind: 'complete', first }, '12345678-1234-4234-8234-123456789012', 2026)
    const samePassage = plainReadingText(excerpt.paragraphs[0])
    expect(audit?.current.slice(0, 3)).toEqual(audit?.independent.slice(0, 3))
    expect(issued.text).toContain(samePassage)
    expect(Buffer.from(issued.pdf, 'base64').subarray(0, 5).toString()).toBe('%PDF-')
    expect(issued.text).toContain('Independent calculation cross-check:')
  })

  it('keeps the buyer report working if the independent input is unknown-time', async () => {
    const first = { ...CATEGORY_SCENARIOS[0].first, unknownTime: true, hour: 0, minute: 0 }
    const audit = await auditBirthInput(first, calculateSaju(first))
    const report = await issueReport({ kind: 'complete', first }, '12345678-1234-4234-8234-123456789012', 2026)
    expect(audit?.current[3]).toBeNull()
    expect(audit?.independent[3]).toBeNull()
    expect(report.text).toContain('Hour: Unknown')
    expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) (?:甲子|乙丑|丙寅|丁卯|戊辰|己巳|庚午|辛未|壬申|癸酉)/)
    expect(Buffer.from(report.pdf, 'base64').subarray(0, 5).toString()).toBe('%PDF-')
  })

  it('keeps an unmatched hour out of the chart-based prose while retaining the three verified pillars', async () => {
    const first = CATEGORY_SCENARIOS[1].first
    const audit = await auditBirthInput(first, calculateSaju(first))
    expect(audit).toBeDefined()
    expect(audit!.current.slice(0, 3)).toEqual(audit!.independent.slice(0, 3))
    expect(audit!.current[3]).not.toBe(audit!.independent[3])
    const report = await issueReport({ kind: 'complete', first }, '12345678-1234-4234-8234-123456789012', 2026)
    expect(report.text).toContain('The hour result is not independently confirmed.')
    expect(report.text).not.toContain(`Hour ${audit!.independent[3]} also agrees.`)
  })
})
