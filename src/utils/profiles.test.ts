import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formStateFromBirth } from './birth-form-state.ts'
import { addProfile, deleteProfile, exportProfiles, importProfiles, loadProfiles, PROFILES_STORAGE_KEY, updateProfile } from './profiles.ts'

const data = formStateFromBirth({ year: 1995, month: 7, day: 12, hour: 9, minute: 15, gender: 'F', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 })!
let items: Map<string, string>
let setItem: ReturnType<typeof vi.fn>
beforeEach(() => {
  items = new Map()
  setItem = vi.fn((key: string, value: string) => items.set(key, value))
  vi.stubGlobal('localStorage', { getItem: (key: string) => items.get(key) ?? null, setItem })
})
afterEach(() => vi.unstubAllGlobals())

describe('saved profile persistence', () => {
  it('reloads, renames, exports and removes the same birth details', () => {
    const profile = addProfile('  London example  ', data)
    expect(loadProfiles()).toEqual([profile])
    updateProfile(profile.id, { name: 'Renamed' })
    expect(loadProfiles()[0]).toMatchObject({ id: profile.id, name: 'Renamed', data })
    expect(JSON.parse(exportProfiles())[0].data.longitude).toBe(-0.1278)
    deleteProfile(profile.id)
    expect(loadProfiles()).toEqual([])
  })
  it('merges a backup once, including duplicates within that file', () => {
    const existing = addProfile('Existing', data)
    const added = { id: 'new-person', name: 'New', data }
    expect(importProfiles(JSON.stringify([existing, added, added]))).toBe(1)
    expect(importProfiles(JSON.stringify([added]))).toBe(0)
    expect(loadProfiles()).toHaveLength(2)
  })
  it('ignores invalid backup entries while retaining valid overseas details', () => {
    const good = { name: 'Good', data: { ...data, paid: true } }
    expect(importProfiles(JSON.stringify([null, [], 7, {}, { name: 'Bad', data: { ...data, day: 40 } }, good]))).toBe(1)
    expect(loadProfiles()[0]).toMatchObject({ name: 'Good', data })
    expect(loadProfiles()[0].data).not.toHaveProperty('paid')
  })
  it('rejects an invalid backup format without overwriting saved details', () => {
    const profile = addProfile('Keep', data)
    expect(() => importProfiles('{broken')).toThrow()
    expect(() => importProfiles('{"profiles":[]}')).toThrow()
    expect(loadProfiles()).toEqual([profile])
  })
  it('validates edits before writing and leaves the prior profile intact', () => {
    const profile = addProfile('Keep', data)
    expect(() => updateProfile(profile.id, { name: '' })).toThrow()
    expect(() => updateProfile(profile.id, { data: { ...data, longitude: 181 } })).toThrow()
    expect(loadProfiles()).toEqual([profile])
  })
  it('reports storage failure instead of claiming a successful save', () => {
    setItem.mockImplementation(() => { throw new Error('quota exceeded') })
    expect(() => addProfile('Cannot save', data)).toThrow('quota exceeded')
    expect(loadProfiles()).toEqual([])
  })
  it('reads an empty list for damaged stored JSON', () => {
    items.set(PROFILES_STORAGE_KEY, 'null')
    expect(loadProfiles()).toEqual([])
    items.set(PROFILES_STORAGE_KEY, '{broken')
    expect(loadProfiles()).toEqual([])
  })
})
