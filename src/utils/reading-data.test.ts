import { afterEach, describe, expect, it, vi } from 'vitest'
import { BIRTH_FORM_STORAGE_KEY, formStateFromBirth } from './birth-form-state.ts'
import { PROFILES_STORAGE_KEY } from './profiles.ts'
import { PREVIEW_STORAGE_KEY } from './preview-draft.ts'
import { clearReadingData, readingDataSummary } from './reading-data.ts'

afterEach(() => vi.unstubAllGlobals())
function store(values: Record<string, string>) {
  const data = new Map(Object.entries(values))
  return { data, getItem: (key: string) => data.get(key) ?? null, removeItem: (key: string) => data.delete(key) }
}
describe('reading data controls', () => {
  it('shows the current saved details count', () => {
    const data = formStateFromBirth({ year: 2000, month: 8, day: 18, hour: 14, minute: 30, gender: 'M', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 })!
    vi.stubGlobal('localStorage', store({ [BIRTH_FORM_STORAGE_KEY]: '{}', [PROFILES_STORAGE_KEY]: JSON.stringify([{ id: 'one', name: 'Example', data }]) }))
    vi.stubGlobal('sessionStorage', store({ [PREVIEW_STORAGE_KEY]: '{}' }))
    expect(readingDataSummary()).toEqual({ rememberedBirth: true, tabPreview: true, saved: 1 })
  })
  it('clears only reading data while retaining browser preferences and unrelated data', () => {
    const local = store({ [BIRTH_FORM_STORAGE_KEY]: '{}', [PROFILES_STORAGE_KEY]: '[]', 'orrery-locale': 'en', unrelated: 'keep' })
    const session = store({ [PREVIEW_STORAGE_KEY]: '{}', unrelated: 'keep' })
    vi.stubGlobal('localStorage', local)
    vi.stubGlobal('sessionStorage', session)
    expect(clearReadingData()).toBe(true)
    expect(local.data).toEqual(new Map([['orrery-locale', 'en'], ['unrelated', 'keep']]))
    expect(session.data).toEqual(new Map([['unrelated', 'keep']]))
    expect(readingDataSummary()).toEqual({ rememberedBirth: false, tabPreview: false, saved: 0 })
  })
  it('reports partial failure and still clears the other reading stores', () => {
    const session = store({ [PREVIEW_STORAGE_KEY]: '{}' })
    const removed: string[] = []
    vi.stubGlobal('localStorage', { getItem: () => null, removeItem: (key: string) => { removed.push(key); if (key === BIRTH_FORM_STORAGE_KEY) throw new Error('denied') } })
    vi.stubGlobal('sessionStorage', session)
    expect(clearReadingData()).toBe(false)
    expect(removed).toEqual([BIRTH_FORM_STORAGE_KEY, PROFILES_STORAGE_KEY])
    expect(session.data.has(PREVIEW_STORAGE_KEY)).toBe(false)
  })
})
