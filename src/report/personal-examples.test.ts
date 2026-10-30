import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from './category-readings.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { PREVIEW_KINDS } from './personal-products.ts'
import { workExample, compatibilityExample, relationshipExample } from './personal-examples.ts'
import { plainReadingText } from './reading-text.ts'

const [a, b] = [calculateSaju(CATEGORY_SCENARIOS[0].first), calculateSaju(CATEGORY_SCENARIOS[0].second)]
const charts = Array.from({ length: 120 }, (_, index) => calculateSaju({
  ...CATEGORY_SCENARIOS[index % 2].first,
  year: 1960 + Math.floor(index / 12), month: index % 12 + 1, day: index % 21 + 5,
}))

function fullReports(kind: typeof PREVIEW_KINDS[number]) {
  if (kind === 'complete') return [buildCompleteReading(a, 2026)]
  if (kind === 'bundle') {
    const bundle = buildBundleReading(a, b, 2030, 2026, '2030-01', 'UTC')
    return [bundle.complete, bundle.annual, bundle.compatibility, bundle.career, bundle.love]
  }
  return [buildCategoryReading(kind, a, { second: b, year: kind === 'year' ? 2030 : 2026, ...(kind === 'year' ? { periodStart: '2030-01', periodTimezone: 'UTC' } : {}) })]
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

  it('keeps relationship examples about conversation and annual examples about personal plans', () => {
    for (const chart of charts.slice(0, 24)) {
      const relationship = relationshipExample(chart)
      expect(relationship.response + relationship.check).not.toMatch(/customer|delivery|portfolio|publish|share a useful version|job offer/i)
      const annual = buildCategoryReading('year', chart, { year: 2027 })
      expect(annual.chapters[0].example).toBeUndefined()
      expect(annual.chapters.find(x => x.id === 'annual-connections')!.lead).toContain('2027')
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

describe('Direct interpretations replace supplementary fictional scenes', () => {
  it('shows actual chapter excerpts in previews without the remaining paid prose', () => {
    for (const kind of PREVIEW_KINDS) {
      const full = fullReports(kind)
      const preview = buildPersonalPreview(kind, { first: a.input, second: b.input, year: 2030, periodStart: '2030-01', periodTimezone: 'UTC' })
      for (const excerpt of preview.excerpts) {
        const chapter = full.flatMap(report => report.chapters).find(item => item.id === excerpt.id)!
        expect(excerpt.example).toBeUndefined()
        expect(excerpt.lead).toBe(chapter.lead)
        expect(excerpt.paragraphs.length).toBeLessThan(chapter.paragraphs.length)
        expect(personalPreviewText(preview)).toContain(plainReadingText(excerpt.lead))
      }
    }
  })
  it('changes annual interpretation and evidence with the selected year', () => {
    const x = buildCategoryReading('year', a, { year: 2027 }), y = buildCategoryReading('year', a, { year: 2028 })
    expect(x.chapters[0].lead).not.toBe(y.chapters[0].lead)
    expect(x.chapters[0].evidence.join(' ')).toContain('2027-07-15')
    expect(y.chapters[0].evidence.join(' ')).toContain('2028-07-15')
  })
  it('does not invent situations or event forecasts for a monthly slot', () => {
    for (const chart of charts.slice(0, 24)) for (const year of [2027, 2028]) {
      const report = buildCategoryReading('year', chart, { year })
      expect(new Set(report.months.map(month => month.lead)).size).toBe(12)
      for (const month of report.months) {
        expect(month.lead).not.toMatch(/^Imagine /)
        expect(month.evidence.join(' ')).toContain(month.referenceDate)
        expect(report.chapters[0].paragraphs.join(' ')).toContain('a calendar month can cross a seasonal boundary')
      }
    }
  })
})
