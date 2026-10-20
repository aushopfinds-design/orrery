import { randomUUID } from 'node:crypto'
import { PaymentError } from './config.ts'
import { orderAccessToken, secretMatches } from './crypto.ts'
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
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      const action = new URL(request.url).searchParams.get('action')
      if (!['checkout', 'webhook', 'status', 'report', 'pdf', 'webhook-setup'].includes(action ?? '')) return json({ error: 'not_found' }, 404)
      const service = getService()
      if (action === 'webhook') return json(await service.receiveWebhook(await bodyText(request, 256_000), request.headers.get('stripe-signature')))
      // Private tester access. This secret is never bundled into the public website.
      if (['checkout', 'webhook-setup'].includes(action!) && !secretMatches(request.headers.get('x-fate-test-token') ?? '', service.config.testToken)) throw new PaymentError('unauthorized', 401)
      const origin = request.headers.get('origin')
      if (origin && origin !== service.config.origin) throw new PaymentError('origin_not_allowed', 403)
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new PaymentError('json_required', 415)
      let input: unknown
      try { input = JSON.parse(await bodyText(request, 8000)) } catch (error) {
        if (error instanceof PaymentError) throw error
        throw new PaymentError('invalid_json')
      }
      if (action === 'checkout') return json(await service.createCheckout(input, request.headers.get('idempotency-key')))
      if (action === 'webhook-setup') {
        const branchHost = process.env.VERCEL_BRANCH_URL
        const url = branchHost && /^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(branchHost)
          ? `https://${branchHost}/api/payments?action=webhook` : service.config.origin + '/api/payments?action=webhook'
        return json(await service.setupWebhook(url))
      }
      const id = (input as { orderId?: unknown } | null)?.orderId
      const token = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
      if (!uuid(id) || !secretMatches(token, orderAccessToken(service.config.accessKey, id))) throw new PaymentError('order_not_found', 404)
      if (action === 'report' || action === 'pdf') {
        const report = await service.report(id)
        if (action === 'pdf') return new Response(new Uint8Array(Buffer.from(report.pdf, 'base64')), { headers: {
          'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="the-fate-key-${report.kind}-${id.slice(0, 8)}.pdf"`,
          'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
        } })
        return json({ title: report.title, kind: report.kind, edition: report.edition, issuedAt: report.issuedAt,
          text: report.text, documents: report.documents, cards: report.cards, orderId: id, mode: 'test' })
      }
      const status = await service.reconcile(id)
      if (!status) throw new PaymentError('order_not_found', 404)
      return json({ ...status, mode: 'test' })
    } catch (error) {
      const status = error instanceof PaymentError ? error.status : 503
      const code = error instanceof PaymentError ? error.code : 'payment_service_unavailable'
      // Never log webhook bodies, URLs, birth details, emails, database URLs or provider errors.
      if (status >= 500 || code === 'payment_order_mismatch') console.error(JSON.stringify({ event: 'payment_request_failed', code, requestId }))
      return json({ error: code, requestId }, status)
    }
  }
}
