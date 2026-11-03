import { BIRTH_FORM_STORAGE_KEY } from './birth-form-state.ts'
import { PROFILES_STORAGE_KEY, loadProfiles } from './profiles.ts'
import { PREVIEW_STORAGE_KEY } from './preview-draft.ts'

/** Only personal reading keys are removed; never clear the whole browser store. */
export function clearReadingData(): boolean {
  let success = true
  for (const key of [BIRTH_FORM_STORAGE_KEY, PROFILES_STORAGE_KEY]) {
    try { localStorage.removeItem(key) } catch { success = false }
  }
  try { sessionStorage.removeItem(PREVIEW_STORAGE_KEY) } catch { success = false }
  return success
}
export function readingDataSummary() {
  let rememberedBirth = false, tabPreview = false
  try { rememberedBirth = localStorage.getItem(BIRTH_FORM_STORAGE_KEY) != null } catch { /* unavailable */ }
  try { tabPreview = sessionStorage.getItem(PREVIEW_STORAGE_KEY) != null } catch { /* unavailable */ }
  return { rememberedBirth, tabPreview, saved: loadProfiles().length }
}
