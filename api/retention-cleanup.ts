import { paymentService } from '../server/payments/runtime.ts'
import { secretMatches } from '../server/payments/crypto.ts'

export default {
  async fetch(request: Request) {
    const secret = process.env.CRON_SECRET ?? ''
    const authorization = request.headers.get('authorization') ?? ''
    if (request.method !== 'GET') return Response.json({ error: 'method_not_allowed' }, { status: 405 })
    if (process.env.VERCEL_ENV !== 'production' || !secret || !secretMatches(authorization.replace(/^Bearer /, ''), secret)) {
      return Response.json({ error: 'not_found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }
    try {
      const service = paymentService()
      if (service.mode !== 'live') return Response.json({ error: 'not_found' }, { status: 404 })
      const erased = await service.store.eraseExpiredPersonalData()
      return Response.json({ ok: true, erasedOrders: erased }, { headers: { 'Cache-Control': 'no-store' } })
    } catch {
      console.error(JSON.stringify({ event: 'personal_data_retention_job_failed' }))
      return Response.json({ error: 'retention_job_failed' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
  },
}
