import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { REPORT_PRICE_CENTS } from '../../src/report/pricing.ts'
import { previewHash, previewProduct } from '../../src/report/personal-products.ts'
import type { PaymentConfig } from './config.ts'
import { PaymentError } from './config.ts'
import { fingerprint, hash, openOrder, orderAccessToken, sealOrder } from './crypto.ts'
import { orderInput, uuid } from './input.ts'
import { OrderStore } from './store.ts'
import { issueReport } from './report.ts'
import type { BuyerReport } from './report.ts'

export interface StripeGateway {
  createSession(params: Stripe.Checkout.SessionCreateParams, key: string): Promise<Stripe.Checkout.Session>
  retrieveSession(id: string): Promise<Stripe.Checkout.Session>
  verifyEvent(body: string, signature: string, secret?: string): Stripe.Event
  setupWebhook?(url: string, key: string): Promise<{ id: string; secret?: string }>
  testPayment?(id: string, amount: number, scenario: 'success' | 'decline' | 'expire'): Promise<{ outcome: string }>
}
const integration = 'fate-key-test-v1'
const events = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'])

export class PaymentService {
  readonly config: PaymentConfig
  readonly store: OrderStore
  private readonly stripe: StripeGateway
  constructor(config: PaymentConfig, store: OrderStore, stripe: StripeGateway) { this.config = config; this.store = store; this.stripe = stripe }

  async createCheckout(value: unknown, requestKey: string | null) {
    if (!uuid(requestKey)) throw new PaymentError('valid_idempotency_key_required')
    const input = orderInput(value), id = randomUUID(), amount = REPORT_PRICE_CENTS[input.kind]
    const inputHash = fingerprint(this.config.dataKey, JSON.stringify({ input, amount, currency: 'usd', integration }))
    const order = await this.store.create({ id, request_key_hash: hash(requestKey.toLowerCase()), input_hash: inputHash,
      kind: input.kind, amount, currency: 'usd', input_encrypted: sealOrder(this.config.dataKey, id, input),
      expires_at: new Date(Math.floor(Date.now() / 1000) * 1000 + 60 * 60 * 1000) })
    if (order.payment_state !== 'pending' || new Date(order.expires_at).getTime() <= Date.now()) throw new PaymentError('order_not_open_for_checkout', 409)
    const session = order.checkout_session_id ? await this.stripe.retrieveSession(order.checkout_session_id) :
      await this.stripe.createSession({
        mode: 'payment', allowed_payment_method_types: ['card'],
        adaptive_pricing: { enabled: false }, automatic_tax: { enabled: false }, allow_promotion_codes: false,
        client_reference_id: order.id, metadata: { fate_order_id: order.id, fate_kind: order.kind, integration },
        payment_intent_data: { metadata: { fate_order_id: order.id, fate_kind: order.kind, integration } },
        line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: order.amount,
          product_data: { name: previewProduct(order.kind).title, metadata: { fate_kind: order.kind, integration } } } }],
        // Phase two adds the buyer receipt/download page; a redirect is never proof of payment.
        success_url: this.config.origin + '/?checkout=success&order_id=' + order.id + '&session_id={CHECKOUT_SESSION_ID}#purchase',
        cancel_url: this.config.origin + '/?checkout=cancelled&order_id=' + order.id + previewHash(order.kind),
        expires_at: Math.floor(new Date(order.expires_at).getTime() / 1000),
      }, `fate-checkout-v1:${order.id}`)
    if (session.livemode || !session.id.startsWith('cs_test_') || session.client_reference_id !== order.id ||
        session.metadata?.fate_order_id !== order.id || session.metadata?.integration !== integration) throw new PaymentError('unexpected_checkout_session', 502)
    if (session.status !== 'open' || !session.url) throw new PaymentError('order_not_open_for_checkout', 409)
    const checkoutUrl = new URL(session.url)
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.stripe.com') throw new PaymentError('unexpected_checkout_session', 502)
    await this.store.attachCheckout(order.id, session.id)
    return { orderId: order.id, checkoutUrl: session.url, accessToken: orderAccessToken(this.config.accessKey, order.id), mode: 'test' }
  }

  async receiveWebhook(body: string, signature: string | null) {
    if (!signature) throw new PaymentError('invalid_webhook_signature')
    let event: Stripe.Event
    try {
      const setting = await this.store.setting('stripe-webhook')
      const secret = setting ? (openOrder(this.config.dataKey, 'stripe-webhook', setting) as { secret: string }).secret : this.config.webhookSecret
      event = this.stripe.verifyEvent(body, signature, secret)
    } catch { throw new PaymentError('invalid_webhook_signature') }
    if (event.livemode) throw new PaymentError('live_events_not_allowed')
    if (!events.has(event.type)) return { received: true, ignored: true }
    const notification = event.data.object as Stripe.Checkout.Session
    if (notification.metadata?.integration !== integration) return { received: true, ignored: true }
    if (!event.id.startsWith('evt_') || !notification.id.startsWith('cs_test_') || !uuid(notification.metadata.fate_order_id)) throw new PaymentError('invalid_payment_event')
    // Fetch the current server-side object: event delivery can be late or out of order.
    const session = await this.stripe.retrieveSession(notification.id)
    const duplicate = await this.recordSession(session, event.id, event.type, notification.metadata.fate_order_id)
    if (session.payment_status === 'paid' && session.status === 'complete') await this.fulfill(notification.metadata.fate_order_id)
    return { received: true, duplicate }
  }

  private async recordSession(session: Stripe.Checkout.Session, eventId: string, eventType: string, expectedId: string) {
    const orderId = session.metadata?.fate_order_id
    const order = await this.store.get(expectedId)
    const lines = session.line_items
    const item = lines?.data[0], price = item?.price, product = price?.product
    if (!order || session.livemode || session.mode !== 'payment' || !session.id.startsWith('cs_test_') || !uuid(orderId) ||
        orderId !== expectedId || session.client_reference_id !== orderId || session.metadata?.integration !== integration ||
        session.metadata?.fate_kind !== order.kind || session.amount_total !== order.amount || session.currency !== order.currency ||
        (order.checkout_session_id && order.checkout_session_id !== session.id) ||
        !lines || lines.has_more || lines.data.length !== 1 || item?.quantity !== 1 || item.amount_total !== order.amount ||
        item.currency !== order.currency || price?.unit_amount !== order.amount || price.currency !== order.currency ||
        typeof product !== 'object' || !product || !('metadata' in product) || product.deleted || product.metadata?.fate_kind !== order.kind || product.metadata?.integration !== integration) {
      throw new PaymentError('payment_order_mismatch', 409)
    }
    const paid = session.status === 'complete' && session.payment_status === 'paid'
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
    if (paid && !paymentIntent?.startsWith('pi_')) throw new PaymentError('invalid_payment_event')
    const state = paid ? 'paid' : session.status === 'expired' ? 'expired' : eventType === 'checkout.session.async_payment_failed' ? 'failed' : 'pending'
    return await this.store.recordPayment({ eventId, eventType, orderId, sessionId: session.id,
      paymentIntent, state, amount: session.amount_total!, currency: session.currency! }) === 'duplicate'
  }

  async reconcile(id: string) {
    const order = await this.store.get(id)
    if (!order?.checkout_session_id) throw new PaymentError('order_not_found', 404)
    const session = await this.stripe.retrieveSession(order.checkout_session_id)
    const eventId = `reconcile_${session.id}_${session.status}_${session.payment_status}`
    await this.recordSession(session, eventId, 'server.reconciliation', id)
    if (session.status === 'complete' && session.payment_status === 'paid') await this.fulfill(id)
    return this.store.status(id)
  }

  /** Private QA only. Stripe itself authorizes/declines the official test-token payment. */
  async exerciseSandbox(id: string, scenario: unknown) {
    if (!['success', 'decline', 'expire'].includes(String(scenario)) || !this.stripe.testPayment) throw new PaymentError('invalid_test_scenario')
    const order = await this.store.get(id)
    if (!order?.checkout_session_id || order.payment_state !== 'pending') throw new PaymentError('order_not_open_for_checkout', 409)
    const session = await this.stripe.retrieveSession(order.checkout_session_id)
    await this.recordSession(session, `qa_before_${session.id}`, 'server.qa', id)
    const result = await this.stripe.testPayment(session.id, order.amount, scenario as 'success' | 'decline' | 'expire')
    return { ...result, status: await this.reconcile(id) }
  }

  private async fulfill(id: string) {
    if (await this.store.artifact(id)) return
    const lease = randomUUID()
    if (!await this.store.claimFulfillment(id, lease)) return
    try {
      const order = (await this.store.get(id))!
      const input = orderInput(openOrder(this.config.dataKey, id, order.input_encrypted))
      const year = new Date(String(order.created_at)).getUTCFullYear()
      const report = await issueReport(input, id, year)
      await this.store.saveArtifact(id, lease, sealOrder(this.config.dataKey, id + ':report', report), hash(JSON.stringify(report)))
    } catch (error) { await this.store.releaseFulfillment(id, lease); throw error }
  }

  async report(id: string): Promise<BuyerReport> {
    const status = await this.reconcile(id)
    if (status?.payment_state !== 'paid') throw new PaymentError('payment_not_complete', 402)
    const saved = await this.store.artifact(id)
    if (!saved) throw new PaymentError('report_being_prepared', 409)
    const report = openOrder(this.config.dataKey, id + ':report', saved.payload_encrypted) as BuyerReport
    if (hash(JSON.stringify(report)) !== saved.content_hash) throw new PaymentError('report_integrity_error', 503)
    return report
  }

  async setupWebhook(url: string) {
    const existing = await this.store.setting('stripe-webhook')
    if (existing) {
      const value = openOrder(this.config.dataKey, 'stripe-webhook', existing) as { id: string; url: string }
      return { id: value.id, url: value.url, configured: true }
    }
    if (!this.stripe.setupWebhook) throw new PaymentError('webhook_setup_unavailable', 503)
    const endpoint = await this.stripe.setupWebhook(url, 'fate-key-sandbox-webhook-v1')
    if (!endpoint.secret) throw new PaymentError('webhook_setup_unavailable', 503)
    await this.store.saveSetting('stripe-webhook', sealOrder(this.config.dataKey, 'stripe-webhook', { ...endpoint, url }))
    return { id: endpoint.id, url, configured: true }
  }
}
