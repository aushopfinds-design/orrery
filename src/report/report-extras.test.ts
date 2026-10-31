import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { STEM_ELEMENTS } from './reading.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildPersonalPreview } from './personal-preview.ts'
import { PREVIEW_KINDS } from './personal-products.ts'
import { buildReportExtras, ELEMENT_SYMBOLS, reportExtrasText } from './report-extras.ts'
import { plainReadingText } from './reading-text.ts'

const { first, second } = CATEGORY_SCENARIOS[0]
const a = calculateSaju(first)
const b = calculateSaju(second)
const kinds = ['complete', 'compatibility', 'year', 'love'] as const
function reports(chart = a, partner = b, year = 2027) {
  return [buildCompleteReading(chart, 2026), ...kinds.slice(1).map(kind => buildCategoryReading(kind as Exclude<typeof kinds[number], 'complete'>, chart, { second: partner, year: kind === 'year' ? year : 2026 }))]
}

describe('A distinct everyday guide in every full report', () => {
  it('delivers all added content in the report and its plain-text export', () => {
    const questions = new Set<string>()
    for (const report of reports()) {
      const extras = report.extras
      const focusedCareer = 'kind' in report && report.kind === 'career'
      expect(extras.questions.length).toBeGreaterThanOrEqual(3)
      expect(extras.keepClose).toHaveLength(3)
      expect(extras.stepBack).toHaveLength(3)
      expect(extras.experiment.steps).toHaveLength(3)
      expect(new Set(extras.questions.map(item => item.question)).size).toBe(extras.questions.length)
      for (const item of extras.questions) {
        questions.add(item.question)
        expect(report.fullText).toContain(plainReadingText(item.answer))
        expect(item.basis.length).toBeGreaterThan(20)
        expect(plainReadingText(item.answer).split(/\s+/).length).toBeLessThanOrEqual(125)
        expect(item.answer).not.toMatch(/undefined|NaN|\.\./)
      }
      if (!focusedCareer) for (const item of [...extras.keepClose, ...extras.stepBack]) {
        const text = plainReadingText(item.text)
        if (report.title === 'My Life') {
          // My Life suppresses advice already answered in its chart-specific
          // chapters. Any retained extra should appear once, never be echoed.
          expect(report.fullText.split(text).length - 1, `${report.title}: ${text}`).toBeLessThanOrEqual(1)
        } else expect(report.fullText).toContain(text)
      }
      for (const item of focusedCareer ? [] : extras.symbols) {
        expect(report.fullText).toContain(item.colors[0].name)
        expect(report.fullText).toContain('Numbers: ' + item.numbers.join(' / '))
      }
      if (!focusedCareer) {
        expect(report.fullText).toContain(extras.reminder)
        expect(report.fullText).toContain('do not change the odds')
      }
      expect(reportExtrasText(extras)).not.toMatch(/undefined|NaN|\*\*/)
    }
    expect(questions.size).toBeGreaterThanOrEqual(12)
  })

  it('changes the new answers with real birth profiles, beyond the labels', () => {
    const cases = Array.from({ length: 30 }, (_, index) => calculateSaju({ ...CATEGORY_SCENARIOS[index % 2].first, year: 1960 + index, month: index % 12 + 1, day: index % 20 + 5 }))
    for (const kind of ['complete', 'career', 'love'] as const) {
      const answers = cases.map(chart => buildReportExtras(kind, chart).questions.map(item => item.answer).join('\n'))
      expect(new Set(answers).size, kind).toBeGreaterThan(20)
    }
  })

  it('keeps symbolic associations consistent across report categories', () => {
    const element = STEM_ELEMENTS[a.pillars[1].pillar.stem]
    const symbol = ELEMENT_SYMBOLS[element]
    for (const report of reports().filter(report => !('kind' in report) || report.kind !== 'career')) {
      expect(report.extras.symbols[0].element).toBe(element)
      expect(report.extras.symbols[0].colors).toEqual(symbol.colors)
      expect(report.extras.symbols[0].numbers).toEqual(symbol.numbers)
    }
    expect(Object.fromEntries(Object.entries(ELEMENT_SYMBOLS).map(([key, value]) => [key, value.numbers]))).toEqual({ Wood: [3, 8], Fire: [2, 7], Earth: [5, 10], Metal: [4, 9], Water: [1, 6] })
  })

  it('does not let a caller change another report’s symbol palette', () => {
    const expected = buildReportExtras('complete', a)
    const changed = buildReportExtras('complete', a)
    changed.symbols[0].colors[0].name = 'Changed'
    changed.symbols[0].numbers[0] = 99
    expect(buildReportExtras('complete', a)).toEqual(expected)
  })

  it('retains separate people and recalculates the comparison when a partner changes', () => {
    const firstPair = buildReportExtras('compatibility', a, { second: b })
    const other = calculateSaju(CATEGORY_SCENARIOS[1].second)
    const changedPair = buildReportExtras('compatibility', a, { second: other })
    expect(firstPair.symbols.map(item => item.person)).toEqual(['Person A', 'Person B'])
    expect(firstPair.symbols[0]).toEqual(changedPair.symbols[0])
    expect(firstPair.questions).not.toEqual(changedPair.questions)
    expect(firstPair.symbols[1].element).toBe(STEM_ELEMENTS[b.pillars[1].pillar.stem])
    expect(() => buildReportExtras('compatibility', a)).toThrow('Two charts')
  })

  it('uses the selected annual comparison rather than changing just the year label', () => {
    const current = buildCategoryReading('year', a, { year: 2027 })
    const later = buildCategoryReading('year', a, { year: 2028 })
    expect(current.extras.questions[0].answer).not.toBe(later.extras.questions[0].answer)
    expect(current.extras.evidence.join(' ')).toContain('2027-07-15')
    expect(later.extras.evidence.join(' ')).toContain('2028-07-15')
    expect(current.extras.questions[0].answer).toBe(current.chapters[0].lead)
    expect(current.extras.symbols).toEqual(later.extras.symbols)
  })

  it('ignores guessed hour symbols in the added guide', () => {
    const unknown = calculateSaju({ ...first, unknownTime: true, hour: 12 })
    const changed = { ...unknown, pillars: [...unknown.pillars] as typeof unknown.pillars }
    changed.pillars[0] = b.pillars[0]
    for (const kind of ['complete', 'career', 'business', 'wellbeing', 'compatibility'] as const) {
      expect(buildReportExtras(kind, changed, { second: b })).toEqual(buildReportExtras(kind, unknown, { second: b }))
    }
  })

  it('keeps one shared appendix and retains each report’s opening answer in a bundle', () => {
    const bundle = buildBundleReading(a, b, 2027, 2026)
    expect(bundle.fullText.match(/Your Everyday Compass/g)).toHaveLength(1)
    for (const report of [bundle.complete, bundle.compatibility, bundle.annual, bundle.career, bundle.love]) expect(bundle.fullText).toContain(plainReadingText(report.extras.questions[0].answer))
  })
})

describe('A limited extra in each personal preview', () => {
  it('shares one question and the correct symbol cards without the full added guide', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first, second, year: 2030 })
      expect(preview.extras?.question.question).toBeTruthy()
      expect(preview.extras?.symbols).toHaveLength(kind === 'compatibility' || kind === 'bundle' ? 2 : 1)
      expect(Object.keys(preview.extras!)).toEqual(['question', 'symbols'])
      expect(preview.extras).not.toHaveProperty('keepClose')
      expect(preview.extras).not.toHaveProperty('stepBack')
    }
    expect(buildPersonalPreview('compatibility', { first }).extras).toBeNull()
    expect(buildPersonalPreview('bundle', { first }).extras).toBeNull()
  })
})
