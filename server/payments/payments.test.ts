import { readReportReference } from '../../src/report/report-reference.ts'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import Stripe from 'stripe'
import { paymentConfig, PaymentError } from './config.ts'
import type { PaymentConfig } from './config.ts'
import { openOrder, orderAccessToken, sealOrder } from './crypto.ts'
import { orderInput } from './input.ts'
import { OrderStore } from './store.ts'
import type { Database } from './store.ts'
import { PaymentService } from './service.ts'
import { paymentHandler } from './handler.ts'
import { LIVE_CATALOG } from './live-catalog.ts'
import { REPORT_PRICE_CENTS } from '../../src/report/pricing.ts'

const birth = { year: 1992, month: 8, day: 17, hour: 0, minute: 0, unknownTime: true, gender: 'M', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' }
const config: PaymentConfig = {
  stripeKey: 'sk_test_fixture', webhookSecret: 'whsec_fixture', databaseUrl: 'postgres://fixture:fixture@localhost/fate_payments_test?sslmode=verify-full',
  origin: 'https://test.example.com', dataKey: '11'.repeat(32), accessKey: '22'.repeat(32), testToken: 'test-only-fixture-token-'.repeat(3),
}
const verifier = new Stripe(config.stripeKey)
const migration = readFileSync(new URL('./migrations/001_test_orders.sql', import.meta.url), 'utf8') + readFileSync(new URL('./migrations/002_report_artifacts.sql', import.meta.url), 'utf8') + readFileSync(new URL('./migrations/003_customer_records.sql', import.meta.url), 'utf8')
let db: PGlite
let store: OrderStore

function gateway() {
  const sessions = new Map<string, Stripe.Checkout.Session>()
  const keys = new Map<string, Stripe.Checkout.Session>()
  return {
    sessions,
    createSession: vi.fn(async (params: Stripe.Checkout.SessionCreateParams, key: string) => {
      if (keys.has(key)) return keys.get(key)!
      const session = { id: 'cs_test_' + randomUUID(), livemode: false, mode: 'payment', status: 'open', payment_status: 'unpaid',
        client_reference_id: params.client_reference_id, metadata: params.metadata, amount_total: params.line_items![0].price_data!.unit_amount,
        line_items: { has_more: false, data: [{ quantity: 1, amount_total: params.line_items![0].price_data!.unit_amount, currency: 'usd', price: { unit_amount: params.line_items![0].price_data!.unit_amount, currency: 'usd', product: { metadata: params.line_items![0].price_data!.product_data!.metadata } } }] }, currency: 'usd', payment_intent: null, url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' } as Stripe.Checkout.Session
      sessions.set(session.id, session); keys.set(key, session); return session
    }),
    retrieveSession: vi.fn(async (id: string) => { const session = sessions.get(id); if (!session) throw new Error('Simulated provider outage'); return session }),
    verifyEvent: (body: string, signature: string) => verifier.webhooks.constructEvent(body, signature, config.webhookSecret),
  }
}
function signed(session: Stripe.Checkout.Session, type = 'checkout.session.completed', id = 'evt_' + randomUUID(), timestamp?: number) {
  const body = JSON.stringify({ id, object: 'event', type, livemode: session.livemode, data: { object: session } })
  const signature = verifier.webhooks.generateTestHeaderString({ payload: body, secret: config.webhookSecret, ...(timestamp ? { timestamp } : {}) })
  return { body, signature }
}
async function prepare() {
  const provider = gateway(), service = new PaymentService(config, store, provider)
  const key = randomUUID(), checkout = await service.createCheckout({ kind: 'complete', first: birth }, key)
  const order = (await store.get(checkout.orderId))!, session = provider.sessions.get(order.checkout_session_id!)!
  return { provider, service, checkout, order, session, key }
}
async function count(table: string) { return Number((await db.query<{ count: string }>(`SELECT count(*) FROM ${table}`)).rows[0].count) }
// WASM database startup and multi-document PDF generation can be slow in CI.
beforeAll(async () => { db = await PGlite.create(); await db.exec(migration) }, 120000)
beforeEach(async () => {
  // This is a fresh, ephemeral local test database; never a customer database.
  await db.exec('TRUNCATE fate_customer_consent_events, fate_customer_purchases, fate_customer_contacts, fate_order_artifacts, fate_payment_settings, fate_fulfillment_jobs, fate_payment_events, fate_payment_orders')
  store = new OrderStore(db as unknown as Database)
})
afterAll(async () => { await db.close() })

describe('sandbox configuration and private input', () => {
  const env = () => ({ FATE_PAYMENTS_MODE: 'test', STRIPE_SECRET_KEY: config.stripeKey, STRIPE_WEBHOOK_SECRET: config.webhookSecret,
    FATE_PAYMENTS_DATABASE_URL: config.databaseUrl, FATE_PAYMENTS_ORIGIN: config.origin, FATE_ORDER_DATA_KEY: config.dataKey,
    FATE_ORDER_ACCESS_KEY: config.accessKey, FATE_CHECKOUT_TEST_TOKEN: config.testToken })
  it('refuses live keys, production, disabled payments and incomplete secrets', () => {
    expect(paymentConfig(env()).origin).toBe(config.origin)
    for (const patch of [{ STRIPE_SECRET_KEY: 'sk_live_fixture' }, { VERCEL_ENV: 'production' }, { FATE_PAYMENTS_MODE: '' },
      { STRIPE_WEBHOOK_SECRET: '' }, { FATE_ORDER_DATA_KEY: '' }, { FATE_PAYMENTS_DATABASE_URL: config.databaseUrl.replace('verify-full', 'disable') }]) {
      expect(() => paymentConfig({ ...env(), ...patch })).toThrow(PaymentError)
    }
  })
  it('refuses a browser-provided price, bad dates, missing time zones and missing partner/year', () => {
    for (const value of [{ kind: 'complete', first: birth, amount: 1 }, { kind: 'complete', first: { ...birth, day: 32 } },
      { kind: 'complete', first: { ...birth, timezone: undefined } }, { kind: 'compatibility', first: birth }, { kind: 'year', first: birth }]) {
      expect(() => orderInput(value)).toThrow(PaymentError)
    }
    expect(orderInput({ kind: 'bundle', first: birth, second: birth, year: new Date().getUTCFullYear() + 1 }).second?.timezone).toBe('Australia/Sydney')
  })
  it('encrypts birth details and binds the ciphertext to one random order', () => {
    const id = randomUUID(), encrypted = sealOrder(config.dataKey, id, birth)
    expect(encrypted).not.toContain('Sydney')
    expect(openOrder(config.dataKey, id, encrypted)).toEqual(birth)
    expect(() => openOrder(config.dataKey, randomUUID(), encrypted)).toThrow()
    expect(() => openOrder(config.accessKey, id, encrypted)).toThrow()
  })
})

describe('Verified payment owns customer-record creation',()=>{
  it('records email and optional consent only after a matching paid session, without changing delivery access',async()=>{
    await store.saveSetting('customer-records-schema-version','1')
    const provider=gateway(),service=new PaymentService({...config,customerRecordsEnabled:true},store,provider)
    const checkout=await service.createCheckout({kind:'career',first:birth,marketingConsent:true},randomUUID())
    const order=(await store.get(checkout.orderId))!,session=provider.sessions.get(order.checkout_session_id!)!
    session.customer_details={email:'buyer@example.com'} as Stripe.Checkout.Session.CustomerDetails
    expect(await count('fate_customer_contacts')).toBe(0)
    await service.reconcile(order.id);expect(await count('fate_customer_contacts')).toBe(0)
    session.status='complete';session.payment_status='paid';session.payment_intent='pi_customer_fixture'
    const event=signed(session);await service.receiveWebhook(event.body,event.signature)
    expect(await count('fate_customer_contacts')).toBe(1)
    await service.receiveWebhook(event.body,event.signature);expect(await count('fate_customer_purchases')).toBe(1)
    expect((await db.query<{marketing_status:string}>('SELECT marketing_status FROM fate_customer_contacts')).rows[0].marketing_status).toBe('pending')
    expect((await service.report(order.id)).reference).toMatch(/^FK-/)
  },120000)
  it('keeps collection off unless both the deployment switch and migration marker are ready',async()=>{
    expect(await new PaymentService(config,store,gateway()).customerRecordsReady()).toBe(false)
    expect(await new PaymentService({...config,customerRecordsEnabled:true},store,gateway()).customerRecordsReady()).toBe(false)
  })
})

describe('checkout retry and price ownership', () => {
  it('keeps one order and one Stripe session for concurrent duplicate submissions', async () => {
    const provider = gateway(), service = new PaymentService(config, store, provider), key = randomUUID()
    const responses = await Promise.all(Array.from({ length: 8 }, () => service.createCheckout({ kind: 'complete', first: birth }, key)))
    expect(new Set(responses.map(r => r.orderId)).size).toBe(1)
    expect(new Set(responses.map(r => r.accessToken)).size).toBe(1)
    expect(provider.sessions.size).toBe(1)
    expect(await count('fate_payment_orders')).toBe(1)
    const params = provider.createSession.mock.calls[0][0]
    expect(params.line_items![0].price_data!.unit_amount).toBe(1699)
    expect(JSON.stringify(params)).not.toMatch(/Sydney|1992|latitude/)
    expect(params.client_reference_id).not.toContain('1992')
  })
  it('rejects changed inputs using the same request key', async () => {
    const { service, key } = await prepare()
    await expect(service.createCheckout({ kind: 'wellbeing', first: birth }, key)).rejects.toMatchObject({ status: 409 })
    expect(await count('fate_payment_orders')).toBe(1)
  })
  it('recovers after Stripe created a session but the attachment write failed', async () => {
    const provider = gateway(), service = new PaymentService(config, store, provider), key = randomUUID()
    const spy = vi.spyOn(store, 'attachCheckout').mockRejectedValueOnce(new Error('Simulated database outage'))
    await expect(service.createCheckout({ kind: 'complete', first: birth }, key)).rejects.toThrow()
    const response = await service.createCheckout({ kind: 'complete', first: birth }, key)
    expect(provider.sessions.size).toBe(1)
    expect((await store.get(response.orderId))?.checkout_session_id).toBe([...provider.sessions.keys()][0])
    spy.mockRestore()
  })
  it('does not create a new session for an expired request', async () => {
    const { service, order, key, provider } = await prepare()
    await db.query("UPDATE fate_payment_orders SET expires_at = now() - interval '1 minute' WHERE id=$1", [order.id])
    await expect(service.createCheckout({ kind: 'complete', first: birth }, key)).rejects.toMatchObject({ status: 409 })
    expect(provider.sessions.size).toBe(1)
  })
})

describe('verified payment and atomic issuance queue', () => {
  it('does not fulfill an unpaid completed session or invalid/stale signatures', async () => {
    const { service, session } = await prepare()
    session.status = 'complete'
    const valid = signed(session)
    await expect(service.receiveWebhook(valid.body, 'invalid')).rejects.toMatchObject({ code: 'invalid_webhook_signature' })
    const old = signed(session, undefined, undefined, Math.floor(Date.now() / 1000) - 600)
    await expect(service.receiveWebhook(old.body, old.signature)).rejects.toMatchObject({ code: 'invalid_webhook_signature' })
    await service.receiveWebhook(valid.body, valid.signature)
    expect(await count('fate_fulfillment_jobs')).toBe(0)
  })
  it('makes one job across simultaneous duplicate and distinct notifications for the same payment', async () => {
    const { service, session, order } = await prepare()
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_test_fixture'
    const one = signed(session), two = signed(session, 'checkout.session.async_payment_succeeded')
    await Promise.all([one, one, two, one, two].map(e => service.receiveWebhook(e.body, e.signature)))
    expect(await count('fate_payment_events')).toBe(2)
    expect(await count('fate_fulfillment_jobs')).toBe(1)
    expect((await store.get(order.id))?.payment_state).toBe('paid')
    expect((await store.status(order.id))?.fulfillment_state).toBe('complete')
  })
  it('ignores unrelated events and rejects live events and wrong amounts', async () => {
    const { service, session } = await prepare()
    const unrelated = signed(session, 'customer.created')
    expect(await service.receiveWebhook(unrelated.body, unrelated.signature)).toMatchObject({ ignored: true })
    session.livemode = true
    const live = signed(session)
    await expect(service.receiveWebhook(live.body, live.signature)).rejects.toMatchObject({ code: 'payment_mode_mismatch' })
    session.livemode = false; session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_test_fixture'; session.amount_total = 1
    const wrong = signed(session)
    await expect(service.receiveWebhook(wrong.body, wrong.signature)).rejects.toMatchObject({ code: 'payment_order_mismatch' })
    expect(await count('fate_payment_events')).toBe(0)
    expect(await count('fate_fulfillment_jobs')).toBe(0)
  })
  it('refuses a different checkout session for an existing order', async () => {
    const { service, session, provider } = await prepare()
    session.id = 'cs_test_different'; provider.sessions.set(session.id, session)
    const event = signed(session)
    await expect(service.receiveWebhook(event.body, event.signature)).rejects.toMatchObject({ code: 'payment_order_mismatch' })
  })
  it('handles failure and expiry without granting access; late notifications do not undo payment', async () => {
    const { service, session, order } = await prepare()
    let event = signed(session, 'checkout.session.async_payment_failed')
    await service.receiveWebhook(event.body, event.signature)
    expect((await store.get(order.id))?.payment_state).toBe('failed')
    session.status = 'expired'; event = signed(session, 'checkout.session.expired')
    await service.receiveWebhook(event.body, event.signature)
    expect((await store.get(order.id))?.payment_state).toBe('expired')
    expect(await count('fate_fulfillment_jobs')).toBe(0)
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_test_fixture'
    event = signed(session, 'checkout.session.async_payment_succeeded')
    await service.receiveWebhook(event.body, event.signature)
    const late = signed(session, 'checkout.session.expired')
    await service.receiveWebhook(late.body, late.signature)
    expect((await store.get(order.id))?.payment_state).toBe('paid')
    expect(await count('fate_fulfillment_jobs')).toBe(1)
  })
  it('rolls back the receipt and payment when queue insertion fails, then safely retries', async () => {
    const { service, session, order } = await prepare()
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_test_fixture'
    // Inject a database constraint failure into the real SQL transaction, not a fake store.
    await db.exec('ALTER TABLE fate_fulfillment_jobs ADD CONSTRAINT simulated_outage CHECK (false)')
    const event = signed(session)
    await expect(service.receiveWebhook(event.body, event.signature)).rejects.toThrow()
    expect(await count('fate_payment_events')).toBe(0)
    expect((await store.get(order.id))?.payment_state).toBe('pending')
    await db.exec('ALTER TABLE fate_fulfillment_jobs DROP CONSTRAINT simulated_outage')
    await service.receiveWebhook(event.body, event.signature)
    expect(await count('fate_fulfillment_jobs')).toBe(1)
  })
  it('allows only one active exporter and refuses completion with an old lease', async () => {
    const { service, session, order } = await prepare()
    expect(await store.claimFulfillment(order.id, randomUUID())).toBe(false)
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_test_fixture'
    const event = signed(session); await service.receiveWebhook(event.body, event.signature)
    await db.query("UPDATE fate_fulfillment_jobs SET state='queued',completed_at=NULL WHERE order_id=$1", [order.id])
    const leases = [randomUUID(), randomUUID()]
    const claimed = await Promise.all(leases.map(lease => store.claimFulfillment(order.id, lease)))
    expect(claimed.filter(Boolean)).toHaveLength(1)
    const oldLease = leases[claimed.indexOf(true)], nextLease = randomUUID()
    await db.query("UPDATE fate_fulfillment_jobs SET lease_until=now()-interval '1 second' WHERE order_id=$1", [order.id])
    expect(await store.claimFulfillment(order.id, nextLease)).toBe(true)
    expect(await store.completeFulfillment(order.id, oldLease, { report: 'private/test-report.pdf' })).toBe(false)
    expect(await store.completeFulfillment(order.id, nextLease, { report: 'private/test-report.pdf' })).toBe(true)
    expect(await store.claimFulfillment(order.id, randomUUID())).toBe(false)
  })
})

describe('HTTP boundary', () => {
  it('keeps automated Stripe test-token execution behind BOTH tester access and the order capability', async () => {
    const { service, checkout } = await prepare(), handler = paymentHandler(() => service)
    const request = (tester: string, token: string) => new Request(config.origin + '/api/payments?action=sandbox-test', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-fate-test-token': tester, authorization: 'Bearer ' + token },
      body: JSON.stringify({ orderId: checkout.orderId, scenario: 'success' }),
    })
    expect((await handler(request('', checkout.accessToken))).status).toBe(401)
    expect((await handler(request(config.testToken, 'forged'))).status).toBe(404)
    expect((await handler(request(config.testToken, checkout.accessToken))).status).toBe(400)
    expect(await count('fate_order_artifacts')).toBe(0)
  })
  it('requires test access and an order token, never returning birth details', async () => {
    const { service, checkout } = await prepare(), handler = paymentHandler(() => service)
    const req = (headers: Record<string,string>, body = { orderId: checkout.orderId }) => new Request(config.origin + '/api/payments?action=status', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })
    expect((await handler(req({}))).status).toBe(404)
    const headers = { 'x-fate-test-token': config.testToken }
    expect((await handler(req(headers))).status).toBe(404)
    expect((await handler(req({ ...headers, authorization: 'Bearer ' + orderAccessToken(config.accessKey, randomUUID()) }))).status).toBe(404)
    const response = await handler(req({ ...headers, authorization: 'Bearer ' + checkout.accessToken }))
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.text()
    expect(body).toContain('pending'); expect(body).not.toMatch(/Sydney|1992|input_encrypted|request_key_hash/)
  })
  it('rejects cross-origin checkout, invalid JSON, oversized data and unsupported methods', async () => {
    const { service } = await prepare(), handler = paymentHandler(() => service)
    const headers = { 'x-fate-test-token': config.testToken, 'content-type': 'application/json', 'idempotency-key': randomUUID() }
    const url = config.origin + '/api/payments?action=checkout'
    expect((await handler(new Request(url))).status).toBe(405)
    expect((await handler(new Request(url, { method: 'POST', headers: { ...headers, origin: 'https://other.example' }, body: '{}' }))).status).toBe(403)
    expect((await handler(new Request(url, { method: 'POST', headers, body: '{' }))).status).toBe(400)
    expect((await handler(new Request(url, { method: 'POST', headers, body: 'x'.repeat(8001) }))).status).toBe(413)
  })
})

describe('seven products: paid reports, PDFs and access isolation', () => {
  const kinds = ['complete', 'compatibility', 'year', 'career', 'business', 'wellbeing', 'bundle'] as const
  for (const kind of kinds) it(`issues only the purchased ${kind} report and an immutable downloadable PDF`, async () => {
    const provider = gateway(), service = new PaymentService(config, store, provider)
    const input = { kind, first: birth, ...(kind === 'complete' ? { recipientName: 'Minji' } : {}), ...(['compatibility', 'bundle'].includes(kind) ? { second: { ...birth, year: 1988, gender: 'F' } } : {}),
      ...(['year', 'bundle'].includes(kind) ? { year: 2027 } : {}) }
    const checkout = await service.createCheckout(input, randomUUID()), order = (await store.get(checkout.orderId))!
    const expected = { complete:1699, compatibility:1199, year:999, career:1099, business:1199, wellbeing:899, bundle:2499 }[kind]
    const line = provider.createSession.mock.calls[0][0].line_items![0].price_data!
    expect(line.unit_amount).toBe(expected)
    expect(line.currency).toBe('usd')
    expect(line.product_data!.metadata!.fate_kind).toBe(kind)
    expect(order.amount).toBe(expected)
    const session = provider.sessions.get(order.checkout_session_id!)!
    const handler = paymentHandler(() => service)
    const request = (action: string, token = checkout.accessToken) => new Request(config.origin + '/api/payments?action=' + action, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ orderId: order.id }),
    })
    expect((await handler(request('report'))).status).toBe(402)
    expect((await handler(request('pdf'))).status).toBe(402)
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_' + randomUUID()
    const event = signed(session)
    await service.receiveWebhook(event.body, event.signature)
    const response = await handler(request('report')), report = await response.json()
    expect(response.status).toBe(200)
    expect(report.kind).toBe(kind)
    expect(report.recipientName).toBe(kind === 'complete' ? 'Minji' : undefined)
    expect(report.text.length).toBeGreaterThan(5000)
    expect(report).not.toHaveProperty('pdf')
    expect(report.documents).toHaveLength(kind === 'bundle' ? 3 : 1)
    expect(readReportReference(report.reference)?.orderId).toBe(order.id)
    expect(report.certificates).toHaveLength(kind === 'bundle' ? 3 : 1)
    for(const certificate of report.certificates){ expect(report.text).toContain(certificate.number); expect(readReportReference(certificate.number)?.orderId).toBe(order.id) }
    expect(report.cards).toHaveLength(['compatibility', 'bundle'].includes(kind) ? 2 : 1)
    expect(report.text).toContain('17 August 1992')
    if (['compatibility', 'bundle'].includes(kind)) expect(report.text).toContain('17 August 1988')
    const pdf = await handler(request('pdf'))
    expect(pdf.status).toBe(200); expect(pdf.headers.get('content-type')).toBe('application/pdf')
    expect(pdf.headers.get('cache-control')).toContain('no-store')
    const bytes = Buffer.from(await pdf.arrayBuffer())
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    // Leave headroom below the platform's buffered response limit, including two-card bundles.
    expect(bytes.length).toBeLessThan(4_000_000)
    const { PDFDocument } = await import('pdf-lib')
    const rendered = await PDFDocument.load(bytes)
    expect(rendered.getPageCount()).toBeGreaterThan(3)
    expect(rendered.getAuthor()).toBe('THE FATE KEY')
    expect(rendered.getSubject()).toContain(report.edition)
    expect(rendered.getSubject()).toContain(report.reference)
    expect(rendered.getTitle()).toContain(report.title)
    const { mkdir, writeFile } = await import('node:fs/promises')
    const dir = '/workspace/scratch/0102d8f465a1/qa-pdfs'
    await mkdir(dir, { recursive: true }); await writeFile(`${dir}/${kind}.pdf`, bytes)
    const saved = await store.artifact(order.id)
    // Random base64 ciphertext can coincidentally contain short plaintext fragments.
    // Verify authenticated encryption and order binding instead of substring luck.
    const encrypted = saved!.payload_encrypted
    const restored = openOrder(config.dataKey, order.id + ':report', encrypted) as { text: string; pdf: string }
    expect(restored.text).toBe(report.text)
    expect(Buffer.from(restored.pdf, 'base64')).toEqual(bytes)
    expect(() => openOrder(config.accessKey, order.id + ':report', encrypted)).toThrow()
    expect(() => openOrder(config.dataKey, randomUUID() + ':report', encrypted)).toThrow()
    await service.receiveWebhook(event.body, event.signature)
    const again = await service.report(order.id)
    expect(Buffer.from(again.pdf, 'base64')).toEqual(bytes)
    expect(await count('fate_order_artifacts')).toBe(1)
    expect((await handler(request('report', 'forged-token'))).status).toBe(404)
  }, 120000)

  it('rejects same-priced product substitution, quantity changes and wrong product metadata', async () => {
    const { service, provider } = await prepare()
    const checkout = await service.createCheckout({ kind: 'business', first: birth }, randomUUID())
    const order = (await store.get(checkout.orderId))!, session = provider.sessions.get(order.checkout_session_id!)!
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_' + randomUUID()
    const product = session.line_items!.data[0].price!.product as Stripe.Product
    product.metadata.fate_kind = 'compatibility'
    await expect(service.report(order.id)).rejects.toMatchObject({ code: 'payment_order_mismatch' })
    product.metadata.fate_kind = 'business'; session.line_items!.data[0].quantity = 2
    await expect(service.report(order.id)).rejects.toMatchObject({ code: 'payment_order_mismatch' })
    session.line_items!.data[0].quantity = 1
    session.line_items!.data[0].price!.product = { id: 'prod_deleted_fixture', object: 'product', deleted: true }
    await expect(service.report(order.id)).rejects.toMatchObject({ code: 'payment_order_mismatch' })
    expect(await count('fate_order_artifacts')).toBe(0)
  })

  it('recovers issuance after artifact storage failure without duplicating an order', async () => {
    const { service, session, order } = await prepare()
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent = 'pi_' + randomUUID()
    const spy = vi.spyOn(store, 'saveArtifact').mockRejectedValueOnce(new Error('Storage unavailable'))
    await expect(service.report(order.id)).rejects.toThrow('Storage unavailable')
    expect((await store.status(order.id))?.fulfillment_state).toBe('queued')
    spy.mockRestore()
    expect((await service.report(order.id)).kind).toBe('complete')
    expect(await count('fate_order_artifacts')).toBe(1)
    expect(await count('fate_payment_orders')).toBe(1)
  }, 120000)
})

describe('launch gates and verified full refunds', () => {
  it('keeps public checkout closed independently of existing live purchase access', () => {
    const env = { FATE_PAYMENTS_MODE: 'live', VERCEL_ENV: 'production', STRIPE_LIVE_SECRET_KEY: 'sk_live_fixture',
      STRIPE_LIVE_WEBHOOK_SECRET: 'whsec_fixture', FATE_PAYMENTS_LIVE_DATABASE_URL: 'postgres://live:live@localhost/fate_live?sslmode=verify-full',
      FATE_LIVE_ORDER_DATA_KEY: '33'.repeat(32), FATE_LIVE_ORDER_ACCESS_KEY: '44'.repeat(32), FATE_PUBLIC_OPERATOR_NAME: 'Example Operator' }
    expect(paymentConfig(env)).toMatchObject({ mode: 'live', checkoutOpen: false, origin: 'https://thefatekey.com', testToken: '' })
    expect(paymentConfig({ ...env, FATE_CHECKOUT_OPEN: 'true', FATE_SALES_POLICIES_READY: 'true' }).checkoutOpen).toBe(true)
    for (const patch of [{ VERCEL_ENV: 'preview' }, { STRIPE_LIVE_SECRET_KEY: 'sk_test_fixture' }, { FATE_PUBLIC_OPERATOR_NAME: '' },
      { FATE_PAYMENTS_DATABASE_URL: env.FATE_PAYMENTS_LIVE_DATABASE_URL }]) expect(() => paymentConfig({ ...env, ...patch })).toThrow(PaymentError)
  })
  it('reports unavailable checkout without revealing missing secrets', async () => {
    const handler = paymentHandler(() => { throw new Error('private-secret-value') })
    const response = await handler(new Request(config.origin + '/api/payments?action=availability'))
    expect(await response.json()).toEqual({ available: false, mode: 'closed' })
  })
  it('blocks refunded content even when an old paid notification arrives afterward', async () => {
    const provider = gateway()
    const charge = { id: 'ch_fixture', livemode: false, amount: 1699, currency: 'usd', amount_refunded: 1699, payment_intent: 'pi_fixture' } as Stripe.Charge
    const intent = { id: 'pi_fixture', livemode: false, amount: 1699, currency: 'usd', latest_charge: charge.id, metadata: {} } as Stripe.PaymentIntent
    const service = new PaymentService(config, store, { ...provider, retrieveCharge: async () => charge, retrievePaymentIntent: async () => intent })
    const checkout = await service.createCheckout({ kind: 'complete', first: birth }, randomUUID())
    intent.metadata = { fate_order_id: checkout.orderId, fate_kind: 'complete', integration: 'fate-key-test-v1' }
    const session = provider.sessions.get((await store.get(checkout.orderId))!.checkout_session_id!)!
    session.payment_status = 'paid'; session.status = 'complete'; session.payment_intent = intent.id
    const body = JSON.stringify({ id: 'evt_refund_fixture', type: 'charge.refunded', livemode: false, data: { object: charge } })
    const signature = verifier.webhooks.generateTestHeaderString({ payload: body, secret: config.webhookSecret })
    await expect(service.receiveWebhook(body, signature)).resolves.toMatchObject({ received: true, refunded: true })
    const late = signed(session)
    await service.receiveWebhook(late.body, late.signature)
    await expect(service.report(checkout.orderId)).rejects.toMatchObject({ code: 'purchase_refunded', status: 403 })
    expect(await store.artifact(checkout.orderId)).toBeUndefined()
    charge.amount_refunded = 1
    await service.receiveWebhook(body, signature)
    await expect(service.report(checkout.orderId)).rejects.toMatchObject({ code: 'purchase_refunded' })
  })
  it('uses an isolated live schema and refuses Sandbox controls on live checkout', async () => {
    const liveDb = await PGlite.create()
    try {
      await liveDb.exec(readFileSync(new URL('./live-schema.sql', import.meta.url), 'utf8'))
      const provider = gateway(), create = provider.createSession
      const kind = 'career', catalog = LIVE_CATALOG[kind]
      const livePrice = { id: catalog.price, livemode: true, active: true, type: 'one_time', currency: 'usd', unit_amount: REPORT_PRICE_CENTS[kind],
        product: { id: catalog.product, livemode: true, active: true, default_price: catalog.price, metadata: { report_kind: kind } } } as unknown as Stripe.Price
      provider.createSession = vi.fn(async (params, key) => {
        expect(params.line_items![0]).toEqual({ quantity: 1, price: catalog.price })
        const session = await create({ ...params, line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: REPORT_PRICE_CENTS[kind], product_data: { name: kind } } }] }, key)
        session.line_items!.data[0].price = livePrice
        provider.sessions.delete(session.id); session.id = session.id.replace('cs_test_', 'cs_live_'); session.livemode = true
        provider.sessions.set(session.id, session); return session
      })
      const liveConfig = { ...config, mode: 'live' as const, checkoutOpen: true }
      const retrievePrice = vi.fn(async () => livePrice)
      const liveService = new PaymentService(liveConfig, new OrderStore(liveDb as unknown as Database), { ...provider, retrievePrice, accountReady: async () => true })
      const handler = paymentHandler(() => liveService)
      const request = (action: string, origin = config.origin) => new Request(config.origin + '/api/payments?action=' + action, {
        method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(), 'x-vercel-forwarded-for': '203.0.113.2' },
        body: JSON.stringify({ kind: 'career', first: birth }),
      })
      expect((await handler(request('checkout', 'https://wrong.example'))).status).toBe(403)
      expect((await handler(request('sandbox-test'))).status).toBe(404)
      const response = await handler(request('checkout'))
      expect(response.status).toBe(200)
      const checkout = await response.json()
      expect(checkout.mode).toBe('live')
      expect((await liveService.store.get(checkout.orderId))?.livemode).toBe(true)
      await expect(liveService.exerciseSandbox(checkout.orderId, 'success')).rejects.toMatchObject({ code: 'not_found' })
      for (let i = 0; i < 11; i++) expect((await handler(request('checkout'))).status).toBe(200)
      expect((await handler(request('checkout'))).status).toBe(429)
      expect(provider.createSession).toHaveBeenCalledTimes(12)
      livePrice.active = false
      await expect(liveService.createCheckout({ kind, first: birth }, randomUUID())).rejects.toMatchObject({ code: 'live_catalog_mismatch' })
      expect(provider.createSession).toHaveBeenCalledTimes(12)
      livePrice.active = true
      const closed = new PaymentService({ ...liveConfig, checkoutOpen: false }, liveService.store, provider)
      await expect(closed.createCheckout({ kind: 'career', first: birth }, randomUUID())).rejects.toMatchObject({ code: 'merchant_not_ready' })
      const closedHandler = paymentHandler(() => closed)
      const status = await closedHandler(new Request(config.origin + '/api/payments?action=status', {
        method: 'POST', headers: { Origin: config.origin, 'Content-Type': 'application/json', Authorization: 'Bearer ' + checkout.accessToken },
        body: JSON.stringify({ orderId: checkout.orderId }),
      }))
      expect(status.status).toBe(200)
      expect(await status.json()).toMatchObject({ mode: 'live', payment_state: 'pending' })

    } finally { await liveDb.close() }
  }, 30000)
})


describe('paid report email integration',()=>{
  it('emails only after verified payment and does not resend on report recovery',async()=>{
    const provider=gateway(), send=vi.fn(async()=> 'resend-test-id')
    const service=new PaymentService(config,store,provider,{send})
    const checkout=await service.createCheckout({kind:'career',first:birth},randomUUID())
    const order=(await store.get(checkout.orderId))!, session=provider.sessions.get(order.checkout_session_id!)!
    session.customer_email='delivered@resend.dev'
    let event=signed(session)
    await service.receiveWebhook(event.body,event.signature)
    expect(send).not.toHaveBeenCalled()
    session.status='complete';session.payment_status='paid';session.payment_intent='pi_mail_fixture'
    event=signed(session)
    await service.receiveWebhook(event.body,event.signature)
    await service.receiveWebhook(event.body,event.signature)
    await service.reconcile(order.id)
    expect(send).toHaveBeenCalledTimes(1)
    const mail=(send.mock.calls as unknown as [[{attachments:{content:string}[];text:string}]])[0][0]
    expect(Buffer.from(mail.attachments[0].content,'base64').subarray(0,4).toString()).toBe('%PDF')
    expect(mail.text).toContain('Report ID: FK-')
    expect((await store.status(order.id))?.fulfillment_state).toBe('complete')
  })
})

it('refreshes required events on an existing Sandbox endpoint without replacing its signing secret',async()=>{
  const saved=sealOrder(config.dataKey,'stripe-webhook',{id:'we_existing',url:config.origin+'/api/payments?action=webhook',secret:'whsec_existing'})
  await store.saveSetting('stripe-webhook',saved)
  const updateWebhook=vi.fn(async()=>{}),setupWebhook=vi.fn(async()=>({id:'we_new',secret:'whsec_new'}))
  const service=new PaymentService(config,store,{...gateway(),updateWebhook,setupWebhook})
  await expect(service.setupWebhook(config.origin+'/api/payments?action=webhook')).resolves.toMatchObject({id:'we_existing',configured:true})
  expect(updateWebhook).toHaveBeenCalledWith('we_existing',config.origin+'/api/payments?action=webhook')
  expect(setupWebhook).not.toHaveBeenCalled()
  expect(await store.setting('stripe-webhook')).toBe(saved)
})
