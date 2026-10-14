import type { BirthInput } from '@orrery/core/types'

export interface PreviewDraft { first?: BirthInput; second?: BirthInput; year?: number }
export const PREVIEW_STORAGE_KEY = 'fate-key-preview-v1'

/** Browser storage is untrusted. Only recognised birth fields are retained. */
export function normalizePreviewBirth(value: unknown): BirthInput | undefined {
  if (!value || typeof value !== 'object') return undefined
  const v = value as Record<string, unknown>
  const values = ['year', 'month', 'day', 'hour', 'minute'].map(key => v[key])
  if (values.some(item => typeof item !== 'number' || !Number.isInteger(item))) return undefined
  const [year, month, day, hour, minute] = values as number[]
  const date = new Date(Date.UTC(year, month - 1, day))
  if (year < 1900 || year > new Date().getFullYear() || month < 1 || month > 12 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined
  if (v.gender !== 'M' && v.gender !== 'F') return undefined
  if (typeof v.timezone !== 'string' || v.timezone.length > 80) return undefined
  try { new Intl.DateTimeFormat('en', { timeZone: v.timezone }).format(date) } catch { return undefined }
  if (typeof v.latitude !== 'number' || !Number.isFinite(v.latitude) || Math.abs(v.latitude) > 90 || typeof v.longitude !== 'number' || !Number.isFinite(v.longitude) || Math.abs(v.longitude) > 180) return undefined
  if (v.unknownTime !== undefined && typeof v.unknownTime !== 'boolean') return undefined
  return { year, month, day, hour: v.unknownTime ? 0 : hour, minute: v.unknownTime ? 0 : minute, gender: v.gender, timezone: v.timezone, latitude: v.latitude, longitude: v.longitude, unknownTime: Boolean(v.unknownTime), ...(v.jasiMethod === 'split' || v.jasiMethod === 'unified' ? { jasiMethod: v.jasiMethod } : {}) }
}
export function parsePreviewDraft(raw: string | null): PreviewDraft {
  if (!raw || raw.length > 5000) return {}
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object') return {}
    const first = normalizePreviewBirth(value.first)
    if (!first) return {}
    const second = normalizePreviewBirth(value.second)
    const year = Number.isInteger(value.year) && value.year >= Math.max(1900, first.year, second?.year ?? 1900) && value.year <= 2100 ? value.year : undefined
    return { first, second, year }
  } catch { return {} }
}
export function readPreviewDraft(): PreviewDraft {
  try { return parsePreviewDraft(sessionStorage.getItem(PREVIEW_STORAGE_KEY)) } catch { return {} }
}
export function savePreviewDraft(draft: PreviewDraft) {
  try { sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(parsePreviewDraft(JSON.stringify(draft)))) } catch { /* Private browsing may disable storage. The current preview still works. */ }
}

