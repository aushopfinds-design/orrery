import { randomUUID } from 'node:crypto'
import { PaymentError } from './config.ts'
import { fingerprint, orderAccessToken, secretMatches } from './crypto.ts'
import { uuid } from './input.ts'
import type { PaymentService } from './service.ts'

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } })
}
async function bodyText(request: Request, limit: number) {
  if (Number(request.headers.get('content-length') ?? 0) > limit) throw new PaymentError('request_too_large', 413)
  const reader = request.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []; let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) { await reader.cancel(); throw new PaymentError('request_too_large', 413) }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  return Buffer.concat(chunks).toString('utf8')
}
export function paymentHandler(getService: () => PaymentService) {
  return async (request: Request): Promise<Response> => {
    const requestId = randomUUID()
    try {
      const action = new URL(request.url).searchParams.get('action')
      if (request.method === 'GET' && action === 'availability') {
        try { const service = getService(); const available = await service.available(); return json({ available, mode: available ? service.mode : 'closed' }) }
        catch { return json({ available: false, mode: 'closed' }) }
      }
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      if (!['checkout', 'webhook', 'status', 'report', 'pdf', 'webhook-setup', 'sandbox-test'].includes(action ?? '')) return json({ error: 'not_found' }, 404)
      const service = getService()
      if (action === 'webhook') return json(await service.receiveWebhook(await bodyText(request, 256_000), request.headers.get('stripe-signature')))
      if (service.mode === 'live' && ['webhook-setup', 'sandbox-test'].includes(action!)) throw new PaymentError('not_found', 404)
      // Sandbox controls cannot authorize a live payment.
      if (service.mode === 'test' && ['checkout', 'webhook-setup', 'sandbox-test'].includes(action!) && !secretMatches(request.headers.get('x-fate-test-token') ?? '', service.config.testToken)) throw new PaymentError('unauthorized', 401)
      const origin = request.headers.get('origin')
      if ((service.mode === 'live' || origin) && origin !== service.config.origin) throw new PaymentError('origin_not_allowed', 403)
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new PaymentError('json_required', 415)
      let input: unknown
      try { input = JSON.parse(await bodyText(request, 8000)) } catch (error) {
        if (error instanceof PaymentError) throw error
        throw new PaymentError('invalid_json')
      }
      if (action === 'checkout') {
        if (service.mode === 'live') {
          const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
          if (!ip) throw new PaymentError('payment_service_unavailable', 503)
          const bucket = fingerprint(service.config.accessKey, ip + ':' + Math.floor(Date.now() / 3600000))
          if (!await service.store.checkoutQuota(bucket)) throw new PaymentError('checkout_rate_limited', 429)
        }
        return json(await service.createCheckout(input, request.headers.get('idempotency-key')))
      }
      if (action === 'webhook-setup') {
        const branchHost = process.env.VERCEL_BRANCH_URL
        const url = branchHost && /^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(branchHost)
          ? `https://${branchHost}/api/payments?action=webhook` : service.config.origin + '/api/payments?action=webhook'
        return json(await service.setupWebhook(url))
      }
      const id = (input as { orderId?: unknown } | null)?.orderId
      const token = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
      if (!uuid(id) || !secretMatches(token, orderAccessToken(service.config.accessKey, id))) throw new PaymentError('order_not_found', 404)
      if (action === 'sandbox-test') return json(await service.exerciseSandbox(id, (input as { scenario?: unknown }).scenario))
      if (action === 'report' || action === 'pdf') {
        const report = await service.report(id)
        if (action === 'pdf') return new Response(new Uint8Array(Buffer.from(report.pdf, 'base64')), { headers: {
          'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="the-fate-key-${report.kind}-${id.slice(0, 8)}.pdf"`,
          'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
        } })
        return json({ title: report.title, kind: report.kind, edition: report.edition, issuedAt: report.issuedAt,
          ...(report.recipientName ? { recipientName: report.recipientName } : {}),
          text: report.text, emphasis: report.emphasis, documents: report.documents, cards: report.cards, orderId: id, mode: service.mode })
      }
      const status = await service.reconcile(id)
      if (!status) throw new PaymentError('order_not_found', 404)
      return json({ ...status, mode: service.mode })
    } catch (error) {
      const status = error instanceof PaymentError ? error.status : 503
      const code = error instanceof PaymentError ? error.code : 'payment_service_unavailable'
      // Never log webhook bodies, URLs, birth details, emails, database URLs or provider errors.
      if (status >= 500 || code === 'payment_order_mismatch') {
        const providerCode = (error as { code?: unknown } | null)?.code
        console.error(JSON.stringify({ event: 'payment_request_failed', code, requestId,
          ...(typeof providerCode === 'string' && /^[a-zA-Z0-9_]{1,80}$/.test(providerCode) ? { providerCode } : {}) }))
      }
      return json({ error: code, requestId }, status)
    }
  }
}
