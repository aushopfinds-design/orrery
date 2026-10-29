import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { PREVIEW_KINDS } from './personal-products.ts'
import { plainReadingText } from './reading-text.ts'
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

  it('opens a visible passage from every short guide and includes the same guide in the saved preview', () => {
    for (const kind of PREVIEW_KINDS) {
      const preview = buildPersonalPreview(kind, { first, second, year: 2030 })
      const brief = preview.brief!
      expect(preview.excerpts.find(section => section.id === brief.chapterId)?.title).toBe(brief.chapterTitle)
      const text = personalPreviewText(preview)
      const visible = brief.focus ? [brief.focus.headline, brief.focus.synthesis, brief.focus.firstStep, brief.focus.pauseIf, brief.focus.review] : [...brief.support, ...brief.watchFor, brief.action]
      for (const line of visible) expect(text).toContain(plainReadingText(line))
      expect((brief.focus?.firstStep ?? brief.action).split(/\s+/).length).toBeLessThanOrEqual(40)
    }
    expect(buildPersonalPreview('bundle', { first, second, year: 2030 }).brief?.scope).toBe('Person A · My Life')
    expect(buildPersonalPreview('compatibility', { first }).brief).toBeNull()
  })

  it('keeps both people in the relationship guide and updates the annual guide with its real chapter', () => {
    const pair = buildPersonalPreview('compatibility', { first, second })
    expect(pair.headline).toContain('match')
    expect(pair.headline).toMatch(/care|needs/)
    const changed = buildPersonalPreview('compatibility', { first, second: { ...second, day: second.day + 1 } })
    expect(changed.headline).not.toBe(pair.headline)
    for (const year of [2027, 2028]) {
      const preview = buildPersonalPreview('year', { first, year })
      const full = buildCategoryReading('year', calculateSaju(first), { year })
      expect(preview.brief!.support).toEqual(full.chapters[0].guidance.keepClose)
      expect(preview.brief!.watchFor).toEqual(full.chapters[0].guidance.watchFor)
      expect(preview.brief!.focus).toEqual(full.focus)
      expect(full.fullText).toContain(plainReadingText(preview.brief!.focus!.firstStep))
    }
    expect(buildPersonalPreview('year', { first, year: 2027 }).brief?.focus).not.toEqual(buildPersonalPreview('year', { first, year: 2028 }).brief?.focus)
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
