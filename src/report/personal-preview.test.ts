import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildPersonalPreview } from './personal-preview.ts'
import { PREVIEW_KINDS, previewHash, previewProduct, resolvePreviewKind } from './personal-products.ts'
import { normalizePreviewBirth, parsePreviewDraft, PREVIEW_STORAGE_KEY, readPreviewDraft, savePreviewDraft } from '../utils/preview-draft.ts'
import { resolveReportRoute } from '../utils/report-route.ts'

const [a, b] = [CATEGORY_SCENARIOS[0].first, CATEGORY_SCENARIOS[0].second]
const other = CATEGORY_SCENARIOS[1]
afterEach(() => vi.unstubAllGlobals())

describe('Personal preview input and draft integrity', () => {
  it('requires real coordinates and a valid explicit overseas time zone', () => {
    expect(normalizePreviewBirth(a)?.timezone).toBe('America/New_York')
    for (const invalid of [
      { ...a, timezone: undefined }, { ...a, timezone: 'Not/A_Zone' },
      { ...a, latitude: undefined }, { ...a, latitude: 91 },
      { ...a, longitude: Number.NaN }, { ...a, month: 2, day: 30 },
      { ...a, hour: 24 }, { ...a, minute: 60 }, { ...a, unknownTime: 'false' },
    ]) expect(normalizePreviewBirth(invalid)).toBeUndefined()
  })

  it('drops purchase flags and unrelated fields from untrusted browser storage', () => {
    const draft = parsePreviewDraft(JSON.stringify({
      first: { ...a, paid: true, role: 'admin' }, second: b, year: 2030,
      paymentStatus: 'paid', sessionId: 'made-up-checkout', fullText: 'forged report',
    }))
    expect(draft.first).toEqual(normalizePreviewBirth(a))
    expect(draft.second).toEqual(normalizePreviewBirth(b))
    expect(draft.year).toBe(2030)
    expect(JSON.stringify(draft)).not.toMatch(/paid|admin|paymentStatus|sessionId|fullText/)
  })

  it('discards corrupted drafts and years before either person was born', () => {
    for (const raw of [null, '{broken', 'null', '{}', 'x'.repeat(5001)]) expect(parsePreviewDraft(raw)).toEqual({})
    expect(parsePreviewDraft(JSON.stringify({ second: b }))).toEqual({})
    expect(parsePreviewDraft(JSON.stringify({ first: a, second: b, year: 1999 })).year).toBeUndefined()
  })

  it('stores only canonical birth data and tolerates disabled browser storage', () => {
    const values = new Map<string, string>()
    vi.stubGlobal('sessionStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) })
    savePreviewDraft({ first: a, second: b, year: 2030 })
    expect(values.size).toBe(1)
    expect(values.has(PREVIEW_STORAGE_KEY)).toBe(true)
    expect(readPreviewDraft()).toEqual(parsePreviewDraft(values.get(PREVIEW_STORAGE_KEY)!))
    savePreviewDraft({ first: other.first })
    expect(readPreviewDraft().second).toBeUndefined()
    vi.stubGlobal('sessionStorage', { getItem: () => { throw new Error('disabled') }, setItem: () => { throw new Error('disabled') } })
    expect(readPreviewDraft()).toEqual({})
    expect(() => savePreviewDraft({ first: a })).not.toThrow()
  })
})

describe('Personal previews use the supplied people, not fictional samples', () => {
  it('changes substantive passages across birth profiles in all seven categories', () => {
    for (const kind of PREVIEW_KINDS) {
      const first = buildPersonalPreview(kind, { first: a, second: b, year: 2030 })
      const second = buildPersonalPreview(kind, { first: other.first, second: other.second, year: 2030 })
      expect(first.needsPartner).toBe(false)
      expect(first.subjects[0].birthSummary).toContain('1998')
      expect(second.subjects[0].birthSummary).toContain('1987')
      expect(JSON.stringify(first.excerpts)).not.toBe(JSON.stringify(second.excerpts))
      expect(first.subjects.every(subject => !subject.label.includes('Example'))).toBe(true)
      expect(JSON.stringify(first)).not.toMatch(/undefined|NaN|\[object Object\]/)
    }
  })

  it('requires the second actual birth input for compatibility and bundles', () => {
    for (const kind of ['compatibility', 'bundle'] as const) {
      const preview = buildPersonalPreview(kind, { first: a })
      expect(preview.needsPartner).toBe(true)
      expect(preview.subjects).toHaveLength(1)
      expect(preview.excerpts).toEqual([])
      expect(preview.contents).toEqual([])
      const withPartner = buildPersonalPreview(kind, { first: a, second: b })
      expect(withPartner.subjects).toHaveLength(2)
      expect(withPartner.subjects[1].birthSummary).toContain('2000')
      const changedPartner = buildPersonalPreview(kind, { first: a, second: { ...b, day: b.day + 1 } })
      expect(JSON.stringify(withPartner.excerpts)).not.toBe(JSON.stringify(changedPartner.excerpts))
    }
  })

  it('does not let a guessed hour change an unknown-time interpretation', () => {
    for (const kind of PREVIEW_KINDS) {
      const draft = { first: { ...a, unknownTime: true }, second: { ...b, unknownTime: true }, year: 2030 }
      const changed = { ...draft, first: { ...draft.first, hour: 21, minute: 57 }, second: { ...draft.second, hour: 5, minute: 11 } }
      expect(buildPersonalPreview(kind, changed)).toEqual(buildPersonalPreview(kind, draft))
    }
  })

  it('exposes only limited passages and contents, without the full text or a paid entitlement', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first: a, second: b, year: 2030 })
      expect(preview.excerpts).toHaveLength(kind === 'bundle' ? 5 : 3)
      for (const section of preview.excerpts) {
        expect(section.paragraphs.length).toBeLessThanOrEqual(kind === 'compatibility' || kind === 'bundle' ? 2 : 1)
        expect(section.evidence.length).toBeLessThanOrEqual(2)
        expect(section).not.toHaveProperty('tryThis')
        expect(section).not.toHaveProperty('guidance')
      }
      for (const name of ['fullText', 'periods', 'actionPlan', 'methods', 'paid', 'receipt']) expect(preview).not.toHaveProperty(name)
      expect(preview.contents).toHaveLength(previewProduct(kind).chapters)
    }
    const full = buildCompleteReading(calculateSaju(a))
    const preview = buildPersonalPreview('complete', { first: a })
    expect(JSON.stringify(preview)).not.toContain(full.actionPlan.paragraphs[0])
    expect(JSON.stringify(preview)).not.toContain(full.chapters.find(chapter => chapter.id === 'career')!.paragraphs[1])
  })

  it('uses the selected year and twelve limited monthly headings', () => {
    const first = buildPersonalPreview('year', { first: a, year: 2030 })
    const second = buildPersonalPreview('year', { first: a, year: 2031 })
    expect(first.title).toContain('2030')
    expect(first.monthly).toHaveLength(12)
    expect(first.monthly[0].label).toContain('January')
    expect(first.monthly[11].label).toContain('December')
    expect(first.monthly.some(month => 'paragraphs' in month)).toBe(false)
    expect(first.monthly).not.toEqual(second.monthly)
    expect(() => buildPersonalPreview('complete', {})).toThrow(/birth details/)
  })
})

describe('Preview navigation', () => {
  it('keeps all seven personal routes separate from full public examples', () => {
    for (const kind of PREVIEW_KINDS) {
      const hash = previewHash(kind)
      expect(resolvePreviewKind(hash)).toBe(kind)
      expect(resolveReportRoute(hash)).toBe('personal-preview')
      expect(resolvePreviewKind(previewProduct(kind).sample)).toBeUndefined()
      expect(resolveReportRoute(previewProduct(kind).sample)).not.toBe('personal-preview')
    }
    for (const hash of ['#my-report-made-up', '#my-report-', '#my-report-career-extra', '#reports']) expect(resolvePreviewKind(hash)).toBeUndefined()
  })
})
