import { describe, expect, it, vi } from 'vitest'
import { generateKeyPair, SignJWT } from 'jose'
import { createHash } from 'node:crypto'
import { Script } from 'node:vm'
import { reviewConfig, ReviewError } from './config.ts'
import { cookie, NONCE_COOKIE, SESSION_COOKIE, ticket, verifyGoogle } from './auth.ts'
import { reviewHandler } from './handler.ts'
import { buildReview } from './report.ts'
import { translateReview, validateTranslation } from './translate.ts'
import { buildCompleteReading } from '../../src/report/complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from '../../src/report/category-readings.ts'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { plainReadingText } from '../../src/report/reading-text.ts'
import { PREVIEW_KINDS } from '../../src/report/personal-products.ts'
import { loginPage, reviewPage } from './ui.ts'

const env = { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feature/english-saju-report-20261013', FATE_REVIEW_ENABLED: 'true',
  FATE_REVIEW_ORIGIN: 'https://saju-english-report-preview-review.vercel.app', FATE_REVIEW_GOOGLE_CLIENT_ID: '123-test.apps.googleusercontent.com',
  FATE_REVIEW_ADMIN_EMAIL: 'thefatekey@gmail.com', FATE_REVIEW_SIGNING_KEY: 'a'.repeat(64) }
const config = reviewConfig(env)
const first = { year: 1998, month: 3, day: 25, hour: 3, minute: 0, unknownTime: true, gender: 'M' as const,
  timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }
const second = { ...first, year: 1994, gender: 'F' as const }
const input = (kind: string) => ({ kind, first, ...(['compatibility', 'bundle'].includes(kind) ? { second } : {}),
  ...(['year', 'bundle'].includes(kind) ? { year: 2027 } : {}) })
const request = (action: string, value: unknown, session = '', origin = config.origin) => new Request(config.origin + '/api/admin-review?action=' + action,
  { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: `${SESSION_COOKIE}=${session}` }, body: JSON.stringify(value) })
async function session(sub = 'admin') { return ticket(config, sub, 'session', { email: config.adminEmail }, 300) }

describe('Private review deployment gate', () => {
  it.each([{ ...env, VERCEL_ENV: 'production' }, { ...env, VERCEL_ENV: 'development' }, { ...env, FATE_REVIEW_ENABLED: undefined },
    { ...env, VERCEL_GIT_COMMIT_REF: 'main' }])('refuses an unapproved environment or branch', value => {
    expect(() => reviewConfig(value)).toThrow(ReviewError)
  })
  it.each(['FATE_REVIEW_GOOGLE_CLIENT_ID', 'FATE_REVIEW_ADMIN_EMAIL', 'FATE_REVIEW_SIGNING_KEY', 'FATE_REVIEW_ORIGIN'])('fails closed without %s', key => {
    expect(() => reviewConfig({ ...env, [key]: undefined })).toThrow(ReviewError)
  })
  it('does not accept a payment test token as admin configuration', () => {
    expect(() => reviewConfig({ FATE_CHECKOUT_TEST_TOKEN: 'x'.repeat(64) })).toThrow(ReviewError)
  })
})

describe('Google identity and administrator authorization', () => {
  it('verifies signature, issuer, audience, expiry, nonce and verified allowlisted email', async () => {
    const keys = await generateKeyPair('RS256')
    const claims = { email: config.adminEmail, email_verified: true, nonce: 'challenge' }
    const token = async (extra = {}, aud = config.clientId, exp = '5m', iss = 'https://accounts.google.com') =>
      new SignJWT({ ...claims, ...extra }).setProtectedHeader({ alg: 'RS256' }).setSubject('google-admin')
        .setIssuer(iss).setAudience(aud).setIssuedAt().setExpirationTime(exp).sign(keys.privateKey)
    const resolver = async () => keys.publicKey
    expect(await verifyGoogle(config, await token(), 'challenge', resolver)).toBe('google-admin')
    for (const bad of [await token({ email: 'other@gmail.com' }), await token({ email_verified: false }),
      await token({ nonce: 'wrong' }), await token({}, 'another-client'), await token({}, undefined, '-1s'),
      await token({}, undefined, undefined, 'https://attacker.example')]) {
      await expect(verifyGoogle(config, bad, 'challenge', resolver)).rejects.toThrow('unauthorized')
    }
    const wrongKeys = await generateKeyPair('RS256')
    await expect(verifyGoogle(config, await token(), 'challenge', async () => wrongKeys.publicKey)).rejects.toThrow('unauthorized')
  })
})

describe('Shared English chart and complete product coverage', () => {
  it.each(PREVIEW_KINDS)('%s uses the unchanged customer English builders and identical source blocks', kind => {
    const result = buildReview(input(kind), 2026)
    // Customer order input normalises an unknown hour to zero before calculation.
    const a = calculateSaju({ ...first, hour: 0 }), b = calculateSaju({ ...second, hour: 0 })
    const expected = kind === 'complete' ? [buildCompleteReading(a, 2026)] : kind === 'bundle' ? (() => {
      const r = buildBundleReading(a, b, 2027, 2026); return [r.overview, r.complete, r.compatibility, r.annual]
    })() : [buildCategoryReading(kind, a, { second: ['compatibility'].includes(kind) ? b : undefined, year: kind === 'year' ? 2027 : 2026 })]
    expect(result.charts[0]).toEqual(a)
    expect(result.documents.map(d => d.english)).toEqual(expected.map(r => plainReadingText(r.fullText)))
    for (const doc of result.documents) {
      expect(doc.blocks.map(b => b.english).join('\n\n')).toBe(doc.english)
      expect(new Set(doc.blocks.map(b => b.id)).size).toBe(doc.blocks.length)
      expect(doc.blocks.every(b => b.english.length <= 7000)).toBe(true)
    }
  })
  it('requires both people for paired reports and preserves unknown hour', () => {
    expect(() => buildReview({ kind: 'compatibility', first })).toThrow('invalid_review_input')
    expect(buildReview(input('complete')).digest).toBe(buildReview({ kind: 'complete', first: { ...first, hour: 22, minute: 55 } }).digest)
  })
})

describe('Protected page and translation API', () => {
  const google = vi.fn(async () => 'admin')
  // Test double exercises access/alignment; it is not a real Korean translation quality test.
  const translate = vi.fn(async (_config, blocks) => blocks.map((b: { id: string }) => ({ id: b.id, korean: '검수용 한국어 문장입니다.' })))
  const handler = reviewHandler({ config: () => config, google, translate })
  it('serves only a login page before authentication, with no report form or English source', async () => {
    const r = await handler(new Request(config.origin + '/api/admin-review'))
    const text = await r.text()
    expect(text).toContain('google-login')
    expect(text).not.toContain('review-form')
    expect(r.headers.get('cache-control')).toContain('no-store')
    expect(r.headers.get('x-robots-tag')).toContain('noindex')
    expect(r.headers.get('set-cookie')).toContain('HttpOnly; Secure; SameSite=Strict')
  })
  it('returns 404 before any content when feature configuration is absent', async () => {
    const closed = reviewHandler({ config: () => reviewConfig({}), google, translate })
    expect((await closed(new Request(config.origin + '/api/admin-review'))).status).toBe(404)
  })
  it('requires a signed challenge for login and issues a short HttpOnly session', async () => {
    expect((await handler(request('login', { credential: 'test' }))).status).toBe(401)
    const nonce = await ticket(config, 'login', 'nonce', { nonce: 'nonce' }, 300)
    const req = request('login', { credential: 'test' }); req.headers.set('Cookie', cookie(NONCE_COOKIE, nonce, 300))
    const r = await handler(req)
    expect(r.status).toBe(200)
    expect(r.headers.get('set-cookie')).toContain(SESSION_COOKIE)
    expect(r.headers.get('set-cookie')).toContain('Max-Age=1800')
  })
  it('blocks absent/forged/expired/non-admin sessions and cross-origin POST', async () => {
    const denied = ['', 'forged', await ticket(config, 'admin', 'session', { email: config.adminEmail }, -1),
      await ticket(config, 'admin', 'session', { email: 'other@gmail.com' }, 300)]
    for (const token of denied) expect((await handler(request('report', input('complete'), token))).status).toBe(401)
    expect((await handler(request('report', input('complete'), await session(), 'https://other.example'))).status).toBe(403)
    const req = new Request(config.origin + '/api/admin-review', { headers: { Cookie: `${SESSION_COOKIE}=${await session()}` } })
    expect(await (await handler(req)).text()).toContain('review-form')
  })
  it('binds translation to the exact generated English, report and administrator', async () => {
    const auth = await session()
    const r = await handler(request('report', input('career'), auth))
    expect(r.status).toBe(200)
    const data = await r.json()
    expect(data.translationReady).toBe(false)
    const block = data.documents[0].blocks[0]
    const payload = { digest: data.digest, blocks: [block], consent: true }
    expect((await handler(request('translate', payload, auth))).status).toBe(200)
    expect((await handler(request('translate', { ...payload, blocks: [{ ...block, english: 'Changed English' }] }, auth))).status).toBe(403)
    expect((await handler(request('translate', { ...payload, digest: 'another report' }, auth))).status).toBe(403)
    expect((await handler(request('translate', { ...payload, consent: false }, auth))).status).toBe(400)
    expect((await handler(request('translate', payload, await session('another-admin-sub')))).status).toBe(403)
  })
  it('blocks oversized bodies and deletes the session cookie on logout', async () => {
    expect((await handler(request('report', { text: 'x'.repeat(48001) }, await session()))).status).toBe(413)
    const r = await handler(request('logout', {}, await session()))
    expect(r.headers.get('set-cookie')).toContain('Max-Age=0')
  })
})

describe('Korean translation boundary', () => {
  const blocks = [{ id: '1.1', english: 'Your 乙 chart has 1 Wood marker.' }]
  it('compares ten-year periods by value in Korean without accepting a different duration', () => {
    const period = [{ id: 'period', english: 'Birth time is unknown; ten-year starting dates are approximate.' }]
    for (const duration of ['10년', '십 년']) {
      expect(validateTranslation(period, { blocks: [{ id: 'period', korean: `태어난 시간을 몰라 ${duration} 대운의 시작 날짜는 대략적이에요.` }] })).toHaveLength(1)
    }
    expect(() => validateTranslation(period, { blocks: [{ id: 'period', korean: '20년 대운의 시작 날짜는 대략적이에요.' }] })).toThrow('translation_mismatch')
  })
  it('accepts numeric Korean months without accepting a changed birth date', () => {
    const dates = [{ id: 'date', english: '25 March 1998 · birth time unknown · Australia/Sydney' }]
    expect(validateTranslation(dates, { blocks: [{ id: 'date', korean: '1998년 3월 25일 · 출생 시간 미상 · Australia/Sydney' }] })).toHaveLength(1)
    expect(() => validateTranslation(dates, { blocks: [{ id: 'date', korean: '1998년 4월 25일 · 출생 시간 미상 · Australia/Sydney' }] })).toThrow('translation_mismatch')
  })
  it('accepts a complete natural Korean interpretation with the same markers', () => {
    expect(validateTranslation(blocks, { blocks: [{ id: '1.1', korean: '당신의 사주에서 일간은 乙이고, 겉으로 드러난 목 기운은 1개예요.' }] })).toHaveLength(1)
  })
  it.each([{ blocks: [] }, { blocks: [{ id: 'wrong', korean: '乙 1개예요.' }] },
    { blocks: [{ id: '1.1', korean: '乙 2개예요.' }] }, { blocks: [{ id: '1.1', korean: 'Your 乙 chart has 1 Wood marker.' }] },
    { blocks: [{ id: '1.1', korean: '' }] }])('rejects missing, reordered, unconverted or altered content', value => {
    expect(() => validateTranslation(blocks, value)).toThrow(ReviewError)
  })
  it('does not call a provider without explicit translation configuration', async () => {
    const fetcher = vi.fn()
    await expect(translateReview(config, blocks, fetcher)).rejects.toThrow('translation_not_configured')
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('resolves a fresh deployment OIDC credential for every translation request', async () => {
    let number = 0
    const token = vi.fn(async () => `test-oidc-${++number}`)
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      void url; void init
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ blocks: [{ id: '1.1', korean: '乙 일간이며 목 기운은 1개예요.' }] }) } }] })
    })
    const settings = { ...config, gatewayToken: token, model: 'test/model' }
    await translateReview(settings, blocks, fetcher)
    await translateReview(settings, blocks, fetcher)
    expect(token).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[0][1]?.headers).toHaveProperty('Authorization', 'Bearer test-oidc-1')
    expect(fetcher.mock.calls[1][1]?.headers).toHaveProperty('Authorization', 'Bearer test-oidc-2')
  })
  it('sends only the signed English blocks to the fixed Gateway endpoint and checks truncation', async () => {
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      void url; void init
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ blocks: [{ id: '1.1', korean: '乙 일간이며 목 기운은 1개예요.' }] }) } }] })
    })
    await translateReview({ ...config, gatewayKey: 'test-only', model: 'test/model' }, blocks, fetcher)
    expect(fetcher.mock.calls[0][0]).toBe('https://ai-gateway.vercel.sh/v1/chat/completions')
    const body = JSON.parse(String((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body))
    expect(JSON.parse(body.messages[1].content)).toEqual({ blocks })
    expect(createHash('sha256').update(JSON.stringify(blocks)).digest('hex')).toHaveLength(64)
    await expect(translateReview({ ...config, gatewayKey: 'test-only', model: 'test/model' }, blocks,
      async () => Response.json({ choices: [{ finish_reason: 'length' }] }))).rejects.toThrow('translation_unavailable')
  })
})

describe('Isolated administrator UI', () => {
  it('serves syntactically valid scripts without unsafe source HTML insertion', () => {
    for (const html of [loginPage(config.clientId, 'challenge', 'csp-nonce'), reviewPage('csp-nonce')]) {
      const scripts = [...html.matchAll(/<script nonce="[^"]+">([\s\S]*?)<\/script>/g)]
      expect(scripts).toHaveLength(1)
      expect(() => new Script(scripts[0][1])).not.toThrow()
      expect(html).not.toContain('innerHTML')
      expect(html).not.toContain('localStorage')
      expect(html).not.toContain('sessionStorage')
    }
  })
})


describe('Customer exports stay behind the existing administrator session',()=>{
 it('does not invoke customer export for an unauthenticated request',async()=>{
  const read=vi.fn(async()=>({mode:'test',records:[]})),handler=reviewHandler({config:()=>config,google:verifyGoogle,translate:async()=>[],customerRecords:read})
  expect((await handler(request('customers',{onlySubscribed:true}))).status).toBe(401);expect(read).not.toHaveBeenCalled()
 })
 it('exports confirmed subscribers only when explicitly requested by the authenticated administrator',async()=>{
  const read=vi.fn(async(only:boolean)=>({mode:'test',onlySubscribed:only,records:[]})),handler=reviewHandler({config:()=>config,google:verifyGoogle,translate:async()=>[],customerRecords:read})
  const response=await handler(request('customers',{onlySubscribed:true},await session()))
  expect(response.status).toBe(200);expect(read).toHaveBeenCalledWith(true);expect(response.headers.get('cache-control')).toContain('private')
  expect((await handler(request('customers',{onlySubscribed:true},await session(),'https://other.example.com'))).status).toBe(403)
 })
})
