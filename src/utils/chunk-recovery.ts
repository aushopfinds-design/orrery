const RETRY_KEY = 'fate-chunk-recovery-at'
const RETRY_WINDOW = 60_000
/** Retry a missing deployment asset once; preserve every saved birth and purchase key. */
export function recoverMissingChunk(event: Event & { payload?: unknown }, storage: Pick<Storage, 'getItem' | 'setItem'>, reload: () => void, now = Date.now()) {
  const message = event.payload instanceof Error ? event.payload.message : String(event.payload ?? '')
  if (!/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed|Unable to preload CSS/i.test(message)) return false
  try {
    const previous = Number(storage.getItem(RETRY_KEY))
    if (previous > 0 && now - previous < RETRY_WINDOW) return false
    storage.setItem(RETRY_KEY, String(now))
  } catch { return false } // Without a durable guard, keep the manual retry screen.
  event.preventDefault()
  reload()
  return true
}
