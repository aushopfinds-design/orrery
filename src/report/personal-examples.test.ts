import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from './category-readings.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { PREVIEW_KINDS } from './personal-products.ts'
import { workExample, compatibilityExample, everydayExampleText } from './personal-examples.ts'
import { plainReadingText } from './reading-text.ts'

const [a, b] = [calculateSaju(CATEGORY_SCENARIOS[0].first), calculateSaju(CATEGORY_SCENARIOS[0].second)]
const charts = Array.from({ length: 120 }, (_, index) => calculateSaju({
  ...CATEGORY_SCENARIOS[index % 2].first,
  year: 1960 + Math.floor(index / 12), month: index % 12 + 1, day: index % 21 + 5,
}))

function fullReports(kind: typeof PREVIEW_KINDS[number]) {
  if (kind === 'complete') return [buildCompleteReading(a, 2026)]
  if (kind === 'bundle') {
    const bundle = buildBundleReading(a, b, 2030, 2026)
    return [bundle.complete, bundle.compatibility, bundle.annual]
  }
  return [buildCategoryReading(kind, a, { second: b, year: kind === 'year' ? 2030 : 2026 })]
}

describe('Concrete examples use several chart features', () => {
  it('changes the follow-up when the second month theme changes, even with the same day style and main work theme', () => {
    let compared = false
    for (const first of charts) {
      const other = charts.find(second => second.pillars[1].pillar.stem === first.pillars[1].pillar.stem
        && second.pillars[2].stemSipsin === first.pillars[2].stemSipsin
        && second.pillars[2].branchSipsin !== first.pillars[2].branchSipsin)
      if (!other) continue
      expect(workExample(first, 'career').check).not.toBe(workExample(other, 'career').check)
      compared = true
    }
    expect(compared).toBe(true)
  })

  it('uses the same interpretation for the same calculated features rather than changing copy from the date alone', () => {
    const seen = new Map<string, ReturnType<typeof workExample>>()
    let matched = false
    for (const chart of charts) {
      const key = [chart.pillars[1].pillar.stem, chart.pillars[2].stemSipsin, chart.pillars[2].branchSipsin].join('|')
      const example = workExample(chart, 'career')
      const previous = seen.get(key)
      if (previous) {
        expect(example.scene).toBe(previous.scene)
        expect(example.response).toBe(previous.response)
        expect(example.check).toBe(previous.check)
        matched = true
      }
      seen.set(key, example)
    }
    expect(matched).toBe(true)
  })

  it('keeps career and business scenes distinct and includes an explicit customer question for business', () => {
    for (const chart of charts) {
      expect(workExample(chart, 'career').scene).not.toBe(workExample(chart, 'business').scene)
      expect(workExample(chart, 'business').check).toContain('customer brief')
      expect(workExample(chart, 'career').check).toContain('role and workload')
    }
  })

  it('uses both supplied people and preserves each point of view when they are swapped', () => {
    const forward = compatibilityExample(a, b)
    const reverse = compatibilityExample(b, a)
    expect(forward.response).not.toBe(reverse.response)
    expect(forward.facts.join(' ')).toContain(a.pillars[1].pillar.ganzi)
    expect(forward.facts.join(' ')).toContain(b.pillars[1].pillar.ganzi)
    const changed = calculateSaju({ ...b.input, day: b.input.day + 1 })
    expect(compatibilityExample(a, changed).response).not.toBe(forward.response)
  })
})

describe('Useful previews and honest complete copies', () => {
  it('shows the same worked examples in the preview and full report without exposing the rest of the chapter', () => {
    for (const kind of PREVIEW_KINDS) {
      const full = fullReports(kind)
      const preview = buildPersonalPreview(kind, { first: a.input, second: b.input, year: 2030 })
      expect(preview.excerpts.some(section => section.example)).toBe(true)
      for (const excerpt of preview.excerpts.filter(item => item.example)) {
        const chapter = full.flatMap(report => report.chapters).find(item => item.id === excerpt.id)!
        expect(excerpt.example).toEqual(chapter.example)
        expect(excerpt.paragraphs).toEqual([])
        expect(chapter.paragraphs.length).toBeGreaterThanOrEqual(4)
        const text = personalPreviewText(preview)
        for (const line of everydayExampleText(excerpt.example!)) {
          expect(text).toContain(plainReadingText(line))
          expect(full.some(report => report.fullText.includes(plainReadingText(line)))).toBe(true)
        }
      }
    }
  })

  it('keeps examples short, concrete and free of technical symbols outside their source notes', () => {
    for (const chart of charts.slice(0, 24)) {
      const reports = [buildCompleteReading(chart, 2026), ...['career', 'business', 'wellbeing', 'year', 'compatibility'].map(kind =>
        buildCategoryReading(kind as 'career' | 'business' | 'wellbeing' | 'year' | 'compatibility', chart, { second: b, year: 2027 }))]
      for (const report of reports) for (const example of report.chapters.flatMap(chapter => chapter.example ? [chapter.example] : [])) {
        expect(example.scene).toMatch(/^Imagine /)
        expect(example.facts.length).toBeGreaterThan(0)
        for (const text of [example.scene, example.response, example.check, example.basis]) {
          expect(text.split(/\s+/).length).toBeLessThanOrEqual(80)
          expect(text).not.toMatch(/[\u3400-\u9FFF]|undefined|NaN|guaranteed|destined/)
          for (const sentence of text.split(/(?<=[.!?])[”’"]?\s+/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(35)
        }
      }
    }
  })

  it('changes an annual situation with the chosen year and keeps its exact reference visible', () => {
    const first = buildCategoryReading('year', a, { year: 2027 }).chapters[0].example!
    const second = buildCategoryReading('year', a, { year: 2028 }).chapters[0].example!
    expect(first.scene + first.check).not.toBe(second.scene + second.check)
    expect(first.facts.join(' ')).toContain('2027-07-15')
    expect(second.facts.join(' ')).toContain('2028-07-15')
  })

  it('removes repeated monthly body paragraphs by using both calculated monthly themes', () => {
    for (const chart of charts.slice(0, 24)) for (const year of [2027, 2028]) {
      const report = buildCategoryReading('year', chart, { year })
      const paragraphs = report.months.flatMap(month => month.paragraphs)
      expect(new Set(paragraphs).size, `${chart.input.year}/${chart.input.month} · ${year}`).toBe(paragraphs.length)
      for (const month of report.months) expect(month.paragraphs[1]).toContain('Before agreeing, ask:')
    }
  })
})
