import { afterEach, describe, expect, it, vi } from 'vitest'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { PREVIEW_KINDS } from './personal-products.ts'
import { parsePreviewDraft, readPreviewDraft, savePreviewDraft, updatePreviewDraft } from '../utils/preview-draft.ts'

const { first, second } = CATEGORY_SCENARIOS[0]
afterEach(() => vi.unstubAllGlobals())

function stubStorage() {
  const values = new Map<string, string>()
  vi.stubGlobal('sessionStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) })
}

describe('A continuous preview before checkout', () => {
  it('keeps the other person, chosen report and year when Person A is edited', () => {
    stubStorage()
    savePreviewDraft({ first, second, year: 2030, kind: 'bundle' })
    updatePreviewDraft({ first: { ...first, day: 26 } })
    const updated = readPreviewDraft()
    expect(updated.first?.day).toBe(26)
    expect(updated.second).toMatchObject(second)
    expect(updated.year).toBe(2030)
    expect(updated.kind).toBe('bundle')
    updatePreviewDraft({ kind: 'career' })
    expect(readPreviewDraft().second).toEqual(updated.second)
    expect(readPreviewDraft().kind).toBe('career')
  })

  it('remembers only a recognised report choice and still rejects forged paid flags', () => {
    for (const kind of PREVIEW_KINDS) expect(parsePreviewDraft(JSON.stringify({ first, kind })).kind).toBe(kind)
    const parsed = parsePreviewDraft(JSON.stringify({ first, kind: 'paid-full-unlocked', paid: true }))
    expect(parsed.kind).toBeUndefined()
    expect(parsed).not.toHaveProperty('paid')
  })

  it('exports only the concise glimpse and locked questions for every category', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first, second, year: 2030 })
      const text = personalPreviewText(preview)
      expect(text).toContain('FREE PERSONAL PREVIEW')
      expect(text).toContain(preview.title)
      expect(text).toContain(preview.birthSummary)
      for (const question of preview.lockedQuestions) expect(text).toContain(question)
      expect(preview.symbol.colors).toHaveLength(2)
      expect(preview.symbol.numbers).toHaveLength(2)
      expect(text).not.toMatch(/\*\*|undefined|NaN|\[object Object\]/)
    }
  })

  it('does not serialize paid chapters, summary themes, or actionable answers', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first, second, year: 2030 })
      const text = personalPreviewText(preview)
      expect(preview).not.toHaveProperty('excerpts')
      expect(preview).not.toHaveProperty('contents')
      expect(preview).not.toHaveProperty('applications')
      expect(text).not.toMatch(/Your Answer:|month-by-month|hidden insight/i)
    }
  })

  it('retains partner input gating without generating compatibility or annual paid content', () => {
    const pair = buildPersonalPreview('compatibility', { first, second })
    expect(pair.needsPartner).toBe(false)
    expect(buildPersonalPreview('compatibility', { first }).needsPartner).toBe(true)
    expect(buildPersonalPreview('year', { first, year: 2027 }).lockedQuestions).toEqual(pair.lockedQuestions)
  })

  it('keeps only the first customer’s brief free content on paired products', () => {
    const preview = buildPersonalPreview('compatibility', { first, second })
    const text = personalPreviewText(preview)
    expect(text).toContain(preview.birthSummary)
    expect(preview.symbol.colors).toHaveLength(2)
    expect(text).not.toContain(second.year.toString())
    expect(() => personalPreviewText(buildPersonalPreview('compatibility', { first }))).toThrow(/birth details/)
  })

  it('keeps unknown-time copy stable and excludes month-by-month forecasts', () => {
    const unknown = { ...first, unknownTime: true }
    const text = personalPreviewText(buildPersonalPreview('year', { first: unknown, year: 2030 }))
    const changedHour = personalPreviewText(buildPersonalPreview('year', { first: { ...unknown, hour: 22, minute: 59 }, year: 2030 }))
    expect(text).toBe(changedHour)
    expect(text).toContain('birth time unknown')
    expect(text).not.toMatch(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}/)
  })
})
