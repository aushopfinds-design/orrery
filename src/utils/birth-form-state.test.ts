import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BirthInput } from '@orrery/core/types'
import { BIRTH_FORM_STORAGE_KEY, formStateFromBirth, matchesBirth, normalizeBirthFormState, readBirthFormState } from './birth-form-state.ts'

const london: BirthInput = { year: 1995, month: 7, day: 12, hour: 9, minute: 15, gender: 'F', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278, jasiMethod: 'split' }
afterEach(() => vi.unstubAllGlobals())

describe('saved birth details', () => {
  it('keeps overseas coordinates and the chosen midnight convention', () => {
    const state = formStateFromBirth(london)!
    expect(state).toMatchObject({ latitude: 51.5074, longitude: -0.1278, jasiMethod: 'split', manualCoords: true, city: null })
    expect(matchesBirth(state, london)).toBe(true)
    expect(matchesBirth(state, { ...london, longitude: 126.978 })).toBe(false)
    expect(matchesBirth(state, { ...london, jasiMethod: 'unified' })).toBe(false)
  })
  it('does not confuse a partner or a different birthday with the current person', () => {
    const state = formStateFromBirth(london)!
    expect(matchesBirth(state, { ...london, year: 2000 })).toBe(false)
    expect(matchesBirth(state, { ...london, gender: 'M' })).toBe(false)
    expect(matchesBirth(state, { ...london, unknownTime: true })).toBe(false)
  })
  it('does not depend on a placeholder hour when birth time is unknown', () => {
    const state = formStateFromBirth({ ...london, unknownTime: true })!
    expect(matchesBirth(state, { ...london, unknownTime: true, hour: 0, minute: 0 })).toBe(true)
  })
  it('restores a legacy Korean city without needing new fields', () => {
    const state = normalizeBirthFormState({ ...london, city: { name: '서울', lat: 37.5665, lon: 126.978 }, latitude: 37.5665, longitude: 126.978, manualCoords: false })
    expect(state?.countryCode).toBe('KR')
    expect(state?.city?.name).toBe('서울')
  })
  it('rejects a mismatched country or city instead of using a default birthplace', () => {
    const state = { ...london, city: { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: london.latitude, lon: london.longitude }, manualCoords: false }
    expect(normalizeBirthFormState(state)?.countryCode).toBe('GB')
    expect(normalizeBirthFormState({ ...state, countryCode: 'US' })).toBeNull()
    expect(normalizeBirthFormState({ ...state, latitude: 40.7128 })).toBeNull()
    expect(normalizeBirthFormState({ ...state, city: null })).toBeNull()
  })
  it.each([
    null, [], {},
    { ...london, manualCoords: true, month: 2, day: 30 },
    { ...london, manualCoords: true, year: 1899 },
    { ...london, manualCoords: true, year: new Date().getFullYear() + 1 },
    { ...london, manualCoords: true, hour: 24 },
    { ...london, manualCoords: true, minute: '15' },
    { ...london, manualCoords: true, gender: 'invalid' },
    { ...london, manualCoords: true, latitude: 91 },
    { ...london, manualCoords: true, longitude: Infinity },
    { ...london, manualCoords: true, unknownTime: 'false' },
  ])('ignores malformed saved data %#', value => expect(normalizeBirthFormState(value)).toBeNull())
  it('discards unrelated imported fields', () => {
    const state = normalizeBirthFormState({ ...london, manualCoords: true, paid: true, receipt: 'fake' })
    expect(state).not.toHaveProperty('paid')
    expect(state).not.toHaveProperty('receipt')
  })
  it('reads saved details and survives invalid JSON or unavailable storage', () => {
    const getItem = vi.fn(() => JSON.stringify(formStateFromBirth(london)))
    vi.stubGlobal('localStorage', { getItem })
    expect(readBirthFormState()?.day).toBe(12)
    expect(getItem).toHaveBeenCalledWith(BIRTH_FORM_STORAGE_KEY)
    getItem.mockReturnValue('{broken')
    expect(readBirthFormState()).toBeNull()
    getItem.mockImplementation(() => { throw new Error('denied') })
    expect(readBirthFormState()).toBeNull()
  })
})
