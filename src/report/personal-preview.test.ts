import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { PREVIEW_KINDS, previewProduct } from './personal-products.ts'
import { normalizePreviewBirth, parsePreviewDraft } from '../utils/preview-draft.ts'
import { resolveReportRoute } from '../utils/report-route.ts'

const sample = CATEGORY_SCENARIOS[0].first

describe('Short, chart-based free preview', () => {
  it('personalizes the glimpse across ten varied birth profiles', () => {
    const dates = [
      [1978, 1, 14, 2], [1980, 3, 25, 8], [1982, 5, 19, 15], [1984, 7, 8, 23], [1986, 9, 27, 4],
      [1988, 11, 3, 11], [1990, 2, 17, 19], [1992, 4, 22, 6], [1995, 8, 12, 13], [2000, 12, 5, 21],
    ] as const
    const previews = dates.map(([year, month, day, hour], index) => buildPersonalPreview('complete', {
      first: { ...sample, year, month, day, hour, minute: index * 5, unknownTime: index === 9 },
    }))
    expect(new Set(previews.map(preview => preview.personality)).size).toBeGreaterThanOrEqual(5)
    expect(new Set(previews.map(preview => preview.strength)).size).toBeGreaterThanOrEqual(5)
    expect(previews[9].timeUnknown).toBe(true)
    expect(previews[9].birthSummary).toContain('birth time unknown')
    expect(previews[9].personality).not.toMatch(/hour pillar|hour stem|hour branch/i)
  })

  it('returns only the four approved free fields, with no paid answer payload', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first: sample, second: CATEGORY_SCENARIOS[0].second })
      expect(Object.keys(preview).sort()).toEqual(['birthSummary', 'lockedQuestions', 'needsPartner', 'personality', 'strength', 'symbol', 'timeUnknown', 'title'].sort())
      expect(preview.lockedQuestions).toHaveLength(4)
      expect(preview.symbol.colors).toHaveLength(2)
      expect(preview.symbol.numbers).toHaveLength(2)
      expect(preview).not.toHaveProperty('fullText')
      expect(preview).not.toHaveProperty('monthly')
      expect(preview).not.toHaveProperty('chapters')
      expect(preview).not.toHaveProperty('applications')
      expect(preview).not.toHaveProperty('answer')
      expect(preview.title).toBe(previewProduct(kind).title)
    }
  })

  it('exports only glimpse copy and locked questions, never paid answers', () => {
    const preview = buildPersonalPreview('complete', { first: sample })
    const text = personalPreviewText(preview)
    for (const question of preview.lockedQuestions) expect(text).toContain(question)
    expect(text).toContain('Glimpse. Now Discover the Full Picture.')
    expect(text).not.toMatch(/Your Answer:|monthly forecast|hidden insight|career fit|money timing/i)
    expect(text.split(/\s+/).length).toBeLessThan(180)
  })

  it('keeps unknown birth time independent of any supplied hour value', () => {
    const unknown = { ...sample, unknownTime: true }
    const one = buildPersonalPreview('complete', { first: { ...unknown, hour: 1, minute: 0 } })
    const two = buildPersonalPreview('complete', { first: { ...unknown, hour: 22, minute: 59 } })
    expect(one).toEqual(two)
    expect(one.birthSummary).toContain('birth time unknown')
  })

  it('requires a second birth chart only for paired products', () => {
    expect(buildPersonalPreview('compatibility', { first: sample }).needsPartner).toBe(true)
    expect(buildPersonalPreview('bundle', { first: sample }).needsPartner).toBe(true)
    expect(buildPersonalPreview('complete', { first: sample }).needsPartner).toBe(false)
  })

  it('rejects invalid birth details and ignores forged purchase fields', () => {
    expect(normalizePreviewBirth({ ...sample, timezone: 'Not/A_Zone' })).toBeUndefined()
    const parsed = parsePreviewDraft(JSON.stringify({ first: { ...sample, paid: true }, fullText: 'secret paid text', paymentStatus: 'paid' }))
    expect(JSON.stringify(parsed)).not.toMatch(/paid|fullText|paymentStatus/)
  })

  it('keeps the seven report routes distinct from their sample pages', () => {
    for (const kind of PREVIEW_KINDS) {
      expect(resolveReportRoute(`#my-report-${kind}`)).toBe('personal-preview')
      expect(resolveReportRoute(previewProduct(kind).sample)).not.toBe('personal-preview')
    }
  })
})
