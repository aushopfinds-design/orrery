import { JOURNEY_EVENTS } from '../src/utils/journey-events.js'
import { isPreviewKind } from '../src/report/personal-products.js'

/** Anonymous event counts in Vercel runtime logs; these are not unique visitors or sales. */
export default {
  async fetch(request: Request): Promise<Response> {
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...headers, Allow: 'POST' } })
    const host = new URL(request.url).hostname
    if (!['thefatekey.com', 'www.thefatekey.com'].includes(host) && !/^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(host)) return new Response(null, { status: 403, headers })
    if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('dnt') === '1') return new Response(null, { status: 403, headers })
    if (!request.headers.get('content-type')?.startsWith('application/json')) return new Response(null, { status: 415, headers })
    try {
      // Stream with a strict byte cap; do not collect an unbounded request body.
      const reader = request.body?.getReader()
      if (!reader) return new Response(null, { status: 400, headers })
      let size = 0, text = ''
      const decoder = new TextDecoder()
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        size += chunk.value.byteLength
        if (size > 256) { await reader.cancel(); return new Response(null, { status: 413, headers }) }
        text += decoder.decode(chunk.value, { stream: true })
      }
      text += decoder.decode()
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object' || Object.keys(data).some(k => !['event', 'product'].includes(k)) ||
        !JOURNEY_EVENTS.includes(data.event) || (data.product !== undefined && (typeof data.product !== 'string' || !isPreviewKind(data.product)))) return new Response(null, { status: 400, headers })
      console.info(JSON.stringify({ type: 'fate_journey', event: data.event, ...(data.product ? { product: data.product } : {}), environment: host === 'thefatekey.com' || host === 'www.thefatekey.com' ? 'production' : 'test' }))
      return new Response(null, { status: 204, headers })
    } catch { return new Response(null, { status: 400, headers }) }
  },
}
