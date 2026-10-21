import { createHash, randomBytes } from 'node:crypto'
import { ReviewError, reviewConfig } from './config.ts'
import type { ReviewConfig } from './config.ts'
import { cookie, NONCE_COOKIE, readCookie, requireAdmin, SESSION_COOKIE, ticket, verifyGoogle, verifyTicket } from './auth.ts'
import { buildReview } from './report.ts'
import type { ReviewBlock } from './report.ts'
import { translateReview } from './translate.ts'
import { loginPage, reviewPage } from './ui.ts'

const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const privateHeaders = { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' }
function json(value: unknown, status = 200) { return Response.json(value, { status, headers: privateHeaders }) }
function html(content: string, nonce: string) {
  return new Response(content, { headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}' https://accounts.google.com/gsi/client; style-src 'unsafe-inline' https://accounts.google.com; connect-src 'self' https://accounts.google.com; frame-src https://accounts.google.com; img-src 'self' data: https://lh3.googleusercontent.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' } })
}
async function body(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) throw new ReviewError('invalid_json')
  const chunks: Uint8Array[] = []; let size = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.length
      if (size > 48000) { await reader.cancel(); throw new ReviewError('request_too_large', 413) }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown> }
  catch { throw new ReviewError('invalid_json') }
}
interface Dependencies {
  config: () => ReviewConfig
  google: typeof verifyGoogle
  translate: typeof translateReview
}
export function reviewHandler(deps: Dependencies = { config: () => reviewConfig(process.env), google: verifyGoogle, translate: translateReview }) {
  return async (request: Request): Promise<Response> => {
    try {
      const config = deps.config(), url = new URL(request.url)
      if (url.origin !== config.origin) throw new ReviewError('not_found', 404)
      if (request.method === 'GET') {
        const nonce = randomBytes(24).toString('base64url')
        try {
          await requireAdmin(config, request)
          return html(reviewPage(nonce), nonce)
        } catch (error) {
          if (!(error instanceof ReviewError) || error.status !== 401) throw error
          const challenge = randomBytes(24).toString('base64url')
          const response = html(loginPage(config.clientId, challenge, nonce), nonce)
          response.headers.append('Set-Cookie', cookie(NONCE_COOKIE, await ticket(config, 'login', 'nonce', { nonce: challenge }, 600), 600))
          return response
        }
      }
      if (request.method !== 'POST') throw new ReviewError('method_not_allowed', 405)
      if (request.headers.get('origin') !== config.origin) throw new ReviewError('origin_not_allowed', 403)
      if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ReviewError('json_required', 415)
      const action = url.searchParams.get('action')
      if (action === 'login') {
        const challenge = await verifyTicket(config, readCookie(request, NONCE_COOKIE), 'nonce')
        const data = await body(request)
        if (typeof data.credential !== 'string' || data.credential.length > 12000) throw new ReviewError('unauthorized', 401)
        const sub = await deps.google(config, data.credential, String(challenge.nonce))
        const response = json({ authenticated: true })
        response.headers.append('Set-Cookie', cookie(SESSION_COOKIE, await ticket(config, sub, 'session', { email: config.adminEmail }, 1800), 1800))
        response.headers.append('Set-Cookie', cookie(NONCE_COOKIE, '', 0))
        return response
      }
      const sub = await requireAdmin(config, request)
      if (action === 'logout') {
        const response = json({ authenticated: false })
        response.headers.append('Set-Cookie', cookie(SESSION_COOKIE, '', 0))
        return response
      }
      if (action === 'report') {
        const result = buildReview(await body(request))
        // Bind every translation to the actual, unchanged English source and admin session.
        const documents = await Promise.all(result.documents.map(async doc => ({ ...doc,
          blocks: await Promise.all(doc.blocks.map(async block => ({ ...block, proof: await ticket(config, sub, 'source',
            { report: result.digest, blockId: block.id, hash: hash(block.english) }, 3600) }))) })))
        return json({ ...result, documents, translationReady: Boolean(config.gatewayKey && config.model), koreanStatus: 'draft' })
      }
      if (action === 'translate') {
        const data = await body(request)
        if (data.consent !== true || typeof data.digest !== 'string' || !Array.isArray(data.blocks)
          || data.blocks.length < 1 || data.blocks.length > 8) throw new ReviewError('invalid_translation_request')
        const blocks: ReviewBlock[] = []
        for (const value of data.blocks) {
          const row = value as { id?: unknown; english?: unknown; proof?: unknown }
          if (!row || typeof row.id !== 'string' || typeof row.english !== 'string' || typeof row.proof !== 'string'
            || row.english.length > 7000 || blocks.some(b => b.id === row.id)) throw new ReviewError('invalid_translation_request')
          const source = await verifyTicket(config, row.proof, 'source')
          if (source.sub !== sub || source.report !== data.digest || source.blockId !== row.id || source.hash !== hash(row.english)) throw new ReviewError('source_mismatch', 403)
          blocks.push({ id: row.id, english: row.english })
        }
        if (blocks.reduce((n, b) => n + b.english.length, 0) > 14000) throw new ReviewError('translation_batch_too_large', 413)
        return json({ blocks: await deps.translate(config, blocks), koreanStatus: 'draft' })
      }
      throw new ReviewError('not_found', 404)
    } catch (error) {
      // Do not return/log report content, provider errors, JWTs, emails or birth details.
      return json({ error: error instanceof ReviewError ? error.code : 'review_unavailable' }, error instanceof ReviewError ? error.status : 503)
    }
  }
}
