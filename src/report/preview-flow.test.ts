import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
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

  it('exports the visible personal passages for every category with an explicit preview label', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first, second, year: 2030 })
      const text = personalPreviewText(preview)
      expect(text).toContain('FREE PERSONAL PREVIEW')
      expect(text).toContain('This is not an issued paid report')
      expect(text).toContain(preview.title)
      expect(text).toContain(preview.subjects[0].birthSummary)
      expect(text).toContain(preview.extras!.question.question)
      for (const section of preview.excerpts) expect(text).toContain(section.title)
      for (const item of preview.contents) expect(text).toContain(item.title)
      expect(text).not.toMatch(/\*\*|undefined|NaN|\[object Object\]/)
    }
  })

  it('does not add a paid chapter or action plan to the personal copy', () => {
    const full = buildCompleteReading(calculateSaju(first))
    const text = personalPreviewText(buildPersonalPreview('complete', { first }))
    expect(text).not.toContain(full.actionPlan.paragraphs[0])
    expect(text).not.toContain(full.chapters.find(chapter => chapter.id === 'career')!.paragraphs[1])
  })

  it('includes both real subjects and their own symbols for a two-person preview', () => {
    const preview = buildPersonalPreview('compatibility', { first, second })
    const text = personalPreviewText(preview)
    for (const subject of preview.subjects) expect(text).toContain(subject.birthSummary)
    for (const symbol of preview.extras!.symbols) {
      expect(text).toContain(symbol.person)
      expect(text).toContain(symbol.basis)
    }
    expect(text).toContain('They do not change the odds')
    expect(() => personalPreviewText(buildPersonalPreview('compatibility', { first }))).toThrow(/birth details/)
  })

  it('keeps unknown-time copy stable and includes all twelve selected-year monthly previews', () => {
    const unknown = { ...first, unknownTime: true }
    const text = personalPreviewText(buildPersonalPreview('year', { first: unknown, year: 2030 }))
    const changedHour = personalPreviewText(buildPersonalPreview('year', { first: { ...unknown, hour: 22, minute: 59 }, year: 2030 }))
    expect(text).toBe(changedHour)
    const preview = buildPersonalPreview('year', { first, year: 2030 })
    for (const month of preview.monthly) expect(personalPreviewText(preview)).toContain(month.label)
  })
})
