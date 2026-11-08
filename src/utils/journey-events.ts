/** First-party operational counts only. Never pass birth details, names, URLs or order IDs. */
export const JOURNEY_EVENTS = ['visit', 'free_reading_complete', 'report_selected', 'checkout_started', 'report_opened'] as const
export type JourneyEvent = typeof JOURNEY_EVENTS[number]
const sent = new Set<string>()
export function recordJourney(event: JourneyEvent, product?: string) {
  try {
    if (navigator.doNotTrack === '1') return
    const key = event + ':' + (product ?? '')
    if (sent.has(key)) return
    sent.add(key)
    void fetch('/api/journey', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...(product ? { product } : {}) }), keepalive: true,
    }).catch(() => { /* Measurement must never interrupt a reading or checkout. */ })
  } catch { /* Measurement is optional. */ }
}
