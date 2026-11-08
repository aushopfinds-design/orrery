import type { SavedFormState } from './birth-form-state.ts'
import { normalizeBirthFormState } from './birth-form-state.ts'

export interface Profile {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  data: SavedFormState
}

export const PROFILES_STORAGE_KEY = 'orrery-profiles'

function normalizeProfile(item: unknown): Profile | null {
  if (!item || typeof item !== 'object') return null
  const value = item as Record<string, unknown>
  if (typeof value.id !== 'string' || !value.id || value.id.length > 200 || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 120) return null
  const data = normalizeBirthFormState(value.data)
  if (!data) return null
  return { id: value.id, name: value.name.trim(), createdAt: typeof value.createdAt === 'number' && Number.isFinite(value.createdAt) ? value.createdAt : Date.now(), updatedAt: typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt) ? value.updatedAt : Date.now(), data }
}

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY)
    if (!raw) return []
    const items: unknown = JSON.parse(raw)
    return Array.isArray(items) ? items.map(normalizeProfile).filter((item): item is Profile => item != null) : []
  } catch {
    return []
  }
}

function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
}

export function addProfile(name: string, data: SavedFormState): Profile {
  const validData = normalizeBirthFormState(data)
  if (!validData || !name.trim() || name.trim().length > 120) throw new Error('Invalid saved birth details')
  const profiles = loadProfiles()
  const profile: Profile = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: validData,
  }
  profiles.push(profile)
  saveProfiles(profiles)
  return profile
}

export function updateProfile(id: string, patch: { name?: string; data?: SavedFormState }): void {
  const profiles = loadProfiles()
  const idx = profiles.findIndex(p => p.id === id)
  if (idx === -1) return
  if (patch.name !== undefined) {
    if (!patch.name.trim() || patch.name.trim().length > 120) throw new Error('Invalid saved name')
    profiles[idx].name = patch.name.trim()
  }
  if (patch.data !== undefined) {
    const data = normalizeBirthFormState(patch.data)
    if (!data) throw new Error('Invalid saved birth details')
    profiles[idx].data = data
  }
  profiles[idx].updatedAt = Date.now()
  saveProfiles(profiles)
}

export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter(p => p.id !== id)
  saveProfiles(profiles)
}

export function exportProfiles(): string {
  return JSON.stringify(loadProfiles(), null, 2)
}

/** JSON 문자열에서 프로필을 파싱하여 기존 목록에 병합. 추가된 수를 반환. */
export function importProfiles(json: string): number {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) throw new Error('올바른 프로필 JSON이 아닙니다.')
  const existing = loadProfiles()
  const existingIds = new Set(existing.map(p => p.id))
  const now = Date.now()
  let added = 0
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const candidate = normalizeProfile({
      ...item,
      id: item.id ?? crypto.randomUUID(),
      createdAt: item.createdAt ?? now,
      updatedAt: item.updatedAt ?? now,
    })
    if (!candidate || existingIds.has(candidate.id)) continue
    existing.push(candidate)
    existingIds.add(candidate.id)
    added++
  }
  saveProfiles(existing)
  return added
}
