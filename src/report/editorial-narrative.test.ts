import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import ReportChapterView from '../components/report/ReportChapterView.tsx'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading, REPORT_EDITION } from './complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from './category-readings.ts'
import { plainReadingText } from './reading-text.ts'

// The app renders in the browser; freeze locale labels for this markup-order check.
vi.mock('../i18n/index.ts', () => ({ useLocale: () => ({ locale: 'en', t: (key: string) => key }) }))

const a = calculateSaju(CATEGORY_SCENARIOS[0].first)
const b = calculateSaju(CATEGORY_SCENARIOS[0].second)
const kinds = ['career', 'business', 'compatibility', 'wellbeing', 'year'] as const

describe('Everyday narrative before chart terminology', () => {
  it('opens every subject chapter with an ordinary situation, not a chart label', () => {
    for (const kind of kinds) {
      const report = buildCategoryReading(kind, a, { second: b, year: 2027 })
      expect(new Set(report.chapters.map(x => x.lead)).size).toBe(report.chapters.length)
      for (const chapter of report.chapters) {
        expect(chapter.lead).toMatch(/^Imagine /)
        expect(chapter.paragraphs[0]).not.toMatch(/^Your (chart|birth|starting|working)|^The (chart|annual|birth)/)
        expect(chapter.evidence.length).toBeGreaterThan(0)
        const start = report.fullText.indexOf(plainReadingText(chapter.lead))
        const response = report.fullText.indexOf(plainReadingText(chapter.paragraphs[0]), start)
        expect(start).toBeGreaterThanOrEqual(0)
        expect(response).toBeGreaterThan(start)
      }
    }
  })
  it('keeps the story together before the supplementary exercise in HTML and saved text', () => {
    const report = buildCompleteReading(a, 2026)
    const chapter = report.chapters[1]
    const html = renderToStaticMarkup(createElement(ReportChapterView, { chapter }))
    expect(html.indexOf('fate-report-prose')).toBeLessThan(html.indexOf('fate-everyday-example'))
    expect(html.indexOf(chapter.paragraphs[0])).toBeLessThan(html.indexOf('fate-everyday-example'))
    expect(html.split(chapter.lead).length - 1).toBe(1)
    const saved = report.fullText.indexOf(plainReadingText(chapter.lead))
    expect(report.fullText.indexOf(plainReadingText(chapter.paragraphs[0]), saved)).toBeLessThan(report.fullText.indexOf('An everyday example to try', saved))
  })
  it('retains calculated monthly differences while giving the twelve openings different situations', () => {
    const report = buildCategoryReading('year', a, { year: 2027 })
    expect(new Set(report.months.map(x => x.lead)).size).toBe(12)
    for (const month of report.months) {
      expect(month.lead).toMatch(/^Imagine /)
      expect(month.paragraphs[0]).toContain('compared with your birth-day stem')
      expect(month.evidence.join(' ')).toContain(month.referenceDate)
      expect(month.evidence.join(' ')).toContain(month.pillar)
    }
  })
  it('keeps rewritten sentences grammatical across shared copy fragments', () => {
    const reports = [buildCompleteReading(a, 2026), ...kinds.map(kind => buildCategoryReading(kind, a, { second: b, year: 2027 }))]
    for (const report of reports) {
      expect(report.fullText).not.toMatch(/Your the way|Which the way|three the way|keep agains| in focus in focus|to \*\*[^*]+\*\* in focus/)
      expect(report.fullText).not.toContain('decision rights')
      expect(report.fullText).not.toContain('acceptance standard')
    }
  })
  it('fixes reviewed grammar and explains the chart labels in complete outputs', () => {
    for (const sample of CATEGORY_SCENARIOS) {
      const result = calculateSaju(sample.first)
      const report = buildCompleteReading(result, 2026)
      expect(report.fullText).not.toMatch(/1 visible markers|Earth and Metal points|This compares your birth-month symbol|editorial theme families|Lucky colors|Notice adding/)
      expect(report.fullText).toContain('正財 / 偏財:')
      expect(report.fullText).toContain('Chart terms in plain English')
      expect(report.periods.every(period => period.paragraphs[1].includes('ten-year cycle'))).toBe(true)
      expect(report.periods.map(period => period.paragraphs[1]).join(' ')).not.toContain('It can be tempting to treat a new period')
    }
  })
  it('uses the new edition in all three bundle documents without inventing a seventh interpretation', () => {
    expect(REPORT_EDITION).toBe('2026.10-r5')
    const bundle = buildBundleReading(a, b, 2027, 2026)
    for (const report of [bundle.complete, bundle.compatibility, bundle.annual]) {
      expect(report.fullText).toContain('Report edition ' + REPORT_EDITION)
      expect(bundle.fullText).toContain(report.fullText)
      expect(report.fullText).not.toMatch(/\[Evidence instruction|\[selected year\]/)
    }
  })
  it('makes the first focus a situation and preserves unknown-time exclusions after the rewrite', () => {
    const one = calculateSaju({ ...a.input, unknownTime: true, hour: 1 })
    const two = calculateSaju({ ...a.input, unknownTime: true, hour: 22 })
    for (const kind of kinds.filter(x => x !== 'compatibility')) {
      const x = buildCategoryReading(kind, one, { year: 2027 })
      const y = buildCategoryReading(kind, two, { year: 2027 })
      expect(x.focus.synthesis).toMatch(/^Imagine /)
      expect(x.chapters).toEqual(y.chapters)
      expect(x.focus).toEqual(y.focus)
    }
    const full = buildCompleteReading(one, 2026)
    expect(full.focus.synthesis).toMatch(/^Imagine /)
    expect(full.chapters[0].lead).toBeTruthy()
  })
})
