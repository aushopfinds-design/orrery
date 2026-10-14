import type { BirthInput, Gender, JasiMethod } from '@orrery/core/types'
import type { City } from '@orrery/core/cities'
import { getCityCountryCode, isCountryCode, isSelectedBirthplaceValid } from './countries.ts'
import { inferTimeZoneFromCoordinates } from './timezones.ts'

export const BIRTH_FORM_STORAGE_KEY = 'orrery-birth-input'
export interface SavedFormState {
  year: number; month: number; day: number; hour: number; minute: number
  gender: Gender; unknownTime: boolean; jasiMethod: JasiMethod
  city: City | null; countryCode?: string; manualCoords: boolean
  latitude: number; longitude: number
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const shortString = (value: unknown, length = 200) => typeof value === 'string' && value.length <= length ? value : undefined

/** Keep saved/imported details usable without trusting their JSON shape. */
export function normalizeBirthFormState(value: unknown): SavedFormState | null {
  if (!record(value)) return null
  const { year, month, day, hour, minute, latitude, longitude } = value
  if (![year, month, day, hour, minute].every(v => typeof v === 'number' && Number.isInteger(v))) return null
  const [y, m, d, h, min] = [year, month, day, hour, minute] as number[]
  if (y < 1900 || y > new Date().getFullYear() || m < 1 || m > 12 || d < 1 || d > new Date(y, m, 0).getDate() || h < 0 || h > 23 || min < 0 || min > 59) return null
  if (value.gender !== 'M' && value.gender !== 'F') return null
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90 || typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180) return null
  if (!inferTimeZoneFromCoordinates(latitude, longitude)) return null
  if (value.unknownTime !== undefined && typeof value.unknownTime !== 'boolean') return null
  if (value.manualCoords !== undefined && typeof value.manualCoords !== 'boolean') return null
  const manualCoords = Boolean(value.manualCoords)
  let city: City | null = null
  if (!manualCoords && record(value.city) && typeof value.city.name === 'string' && value.city.name.trim() && value.city.name.length <= 200 && value.city.lat === latitude && value.city.lon === longitude) {
    city = { name: value.city.name, lat: latitude, lon: longitude }
    for (const key of ['country', 'region', 'placeId'] as const) {
      const field = shortString(value.city[key]); if (field) city[key] = field
    }
    if (typeof value.city.countryCode === 'string' && isCountryCode(value.city.countryCode)) city.countryCode = value.city.countryCode
  }
  const countryCode = typeof value.countryCode === 'string' && isCountryCode(value.countryCode) ? value.countryCode : city ? getCityCountryCode(city) : undefined
  if (!manualCoords && (!city || !isSelectedBirthplaceValid(city, countryCode!))) return null
  return { year: y, month: m, day: d, hour: h, minute: min, gender: value.gender, unknownTime: Boolean(value.unknownTime), jasiMethod: value.jasiMethod === 'split' ? 'split' : 'unified', city, countryCode, manualCoords, latitude, longitude }
}
export function formStateFromBirth(input: BirthInput): SavedFormState | null {
  return normalizeBirthFormState({ ...input, manualCoords: true, city: null })
}
export function matchesBirth(state: SavedFormState, input: BirthInput): boolean {
  return state.year === input.year && state.month === input.month && state.day === input.day && state.gender === input.gender &&
    state.latitude === input.latitude && state.longitude === input.longitude && state.unknownTime === Boolean(input.unknownTime) &&
    (state.unknownTime || (state.hour === input.hour && state.minute === input.minute && state.jasiMethod === (input.jasiMethod ?? 'unified')))
}
export function readBirthFormState(): SavedFormState | null {
  try { return normalizeBirthFormState(JSON.parse(localStorage.getItem(BIRTH_FORM_STORAGE_KEY) ?? 'null')) } catch { return null }
}
