import { JSDOM } from 'jsdom'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import ReportChapterView from '../components/report/ReportChapterView.tsx'
import BundleSamplePage from '../components/report/BundleSamplePage.tsx'
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

describe('Calculated interpretation before optional advice', () => {
  it('opens every subject chapter with a distinct chart-based answer', () => {
    for (const kind of kinds) {
      const report = buildCategoryReading(kind, a, { second: b, year: 2027 })
      expect(new Set(report.chapters.map(x => x.lead)).size).toBe(report.chapters.length)
      expect(report.chapters.filter(x => x.lead.startsWith('Imagine ')).length).toBeLessThan(report.chapters.length / 2)
      for (const chapter of report.chapters) {
        expect(chapter.lead.length).toBeGreaterThan(35)
        expect(chapter.lead).not.toMatch(/^Imagine /)
        expect(chapter.evidence.length).toBeGreaterThan(0)
        const start = report.fullText.indexOf(plainReadingText(chapter.lead))
        const response = report.fullText.indexOf(plainReadingText(chapter.paragraphs[0]), start)
        expect(start).toBeGreaterThanOrEqual(0)
        expect(response).toBeGreaterThan(start)
      }
    }
  })
  it('keeps interpretation prose in markup and copy without a fictional exercise', () => {
    const report = buildCompleteReading(a, 2026)
    const chapter = report.chapters[1]
    const html = renderToStaticMarkup(createElement(ReportChapterView, { chapter }))
    expect(html).toContain('fate-report-prose')
    expect(html).not.toContain('fate-everyday-example')
    expect(html).toContain(chapter.paragraphs[0])
    const dom = new JSDOM(html)
    expect(dom.window.document.querySelectorAll('.fate-reading-lead')).toHaveLength(1)
    expect(dom.window.document.querySelector('.fate-reading-lead')!.textContent).toBe(plainReadingText(chapter.lead))
    dom.window.close()
    const saved = report.fullText.indexOf(plainReadingText(chapter.lead))
    expect(report.fullText.indexOf(plainReadingText(chapter.paragraphs[0]), saved)).toBeGreaterThan(saved)
  })
  it('retains calculated monthly differences and dated openings', () => {
    const report = buildCategoryReading('year', a, { year: 2027 })
    expect(new Set(report.months.map(x => x.lead)).size).toBe(12)
    for (const month of report.months) {
      expect(month.lead).toContain(month.label)
      expect(month.paragraphs.join(' ')).toContain('Money:')
      expect(month.paragraphs.join(' ')).toContain('At home:')
      expect(month.evidence.join(' ')).toContain(month.referenceDate)
      expect(month.evidence.join(' ')).toContain(month.pillar)
    }
  })
  it('keeps rewritten sentences grammatical across shared copy fragments', () => {
    const reports = [buildCompleteReading(a, 2026), ...kinds.map(kind => buildCategoryReading(kind, a, { second: b, year: 2027 }))]
    for (const report of reports) {
      expect(report.fullText).not.toMatch(/Your the way|Which the way|three the way|keep agains| in focus in focus|to \*\*[^*]+\*\* in focus/)
      expect(report.fullText).not.toContain('guaranteed income')
      expect(report.fullText).not.toContain('acceptance standard')
    }
  })
  it('fixes reviewed grammar and explains the chart labels in complete outputs', () => {
    for (const sample of CATEGORY_SCENARIOS) {
      const result = calculateSaju(sample.first)
      const report = buildCompleteReading(result, 2026)
      expect(report.fullText).not.toMatch(/1 visible markers|Earth and Metal points|This compares your birth-month symbol|editorial theme families|Lucky colors|Notice adding/)
      expect(report.fullText).toContain('Chart terms in plain English')
      expect(report.fullText).toContain('Chart terms in plain English')
      expect(new Set(report.periods.map(period => period.evidence[0])).size).toBe(report.periods.length)
      expect(report.periods.map(period => period.paragraphs[1]).join(' ')).not.toContain('It can be tempting to treat a new period')
    }
  })
  it('keeps an integrated bundle overview visible in the sample and complete export', () => {
    expect(REPORT_EDITION).toBe('2026.10-r16')
    const bundle = buildBundleReading(a, b, 2027, 2026)
    expect(bundle.fullText.indexOf(bundle.overview.fullText)).toBeLessThan(bundle.fullText.indexOf(bundle.complete.fullText))
    expect(bundle.synthesis).not.toBe(buildBundleReading(a, b, 2028, 2026).synthesis)
    expect(bundle.synthesis).not.toBe(buildBundleReading(a, a, 2027, 2026).synthesis)
    expect(bundle.fullText).not.toContain('**')
    const html = renderToStaticMarkup(createElement(BundleSamplePage))
    expect(html).toContain(bundle.overview.title)
    expect(html.indexOf(bundle.overview.title)).toBeLessThan(html.indexOf('fate-bundle-tabs'))
    for (const report of [bundle.complete, bundle.compatibility, bundle.annual]) {
      expect(report.fullText).toContain('Report edition ' + REPORT_EDITION)
      expect(bundle.fullText).toContain(report.fullText)
      expect(report.fullText).not.toMatch(/\[Evidence instruction|\[selected year\]/)
    }
  })
  it('makes the first focus a direct interpretation and preserves unknown-time exclusions', () => {
    const one = calculateSaju({ ...a.input, unknownTime: true, hour: 1 })
    const two = calculateSaju({ ...a.input, unknownTime: true, hour: 22 })
    for (const kind of kinds.filter(x => x !== 'compatibility')) {
      const x = buildCategoryReading(kind, one, { year: 2027 })
      const y = buildCategoryReading(kind, two, { year: 2027 })
      expect(x.focus.synthesis.length).toBeGreaterThan(20)
      expect(x.chapters).toEqual(y.chapters)
      expect(x.focus).toEqual(y.focus)
    }
    const full = buildCompleteReading(one, 2026)
    expect(full.focus.synthesis).toContain('strength')
    expect(full.chapters[0].lead).toBeTruthy()
  })
})
