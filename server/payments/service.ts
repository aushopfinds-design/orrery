import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { REPORT_PRICE_CENTS } from '../../src/report/pricing.ts'
import { previewHash, previewProduct } from '../../src/report/personal-products.ts'
import type { PaymentConfig } from './config.ts'
import { PaymentError } from './config.ts'
import { fingerprint, hash, orderAccessToken, sealOrder } from './crypto.ts'
import { orderInput, uuid } from './input.ts'
import { OrderStore } from './store.ts'

export interface StripeGateway {
  createSession(params: Stripe.Checkout.SessionCreateParams, key: string): Promise<Stripe.Checkout.Session>
  retrieveSession(id: string): Promise<Stripe.Checkout.Session>
  verifyEvent(body: string, signature: string): Stripe.Event
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
        client_reference_id: order.id, metadata: { fate_order_id: order.id, integration },
        payment_intent_data: { metadata: { fate_order_id: order.id, integration } },
        line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: order.amount,
          product_data: { name: previewProduct(order.kind).title } } }],
        // Phase two adds the buyer receipt/download page; a redirect is never proof of payment.
        success_url: this.config.origin + '/' + previewHash(order.kind),
        cancel_url: this.config.origin + '/' + previewHash(order.kind),
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
    try { event = this.stripe.verifyEvent(body, signature) } catch { throw new PaymentError('invalid_webhook_signature') }
    if (event.livemode) throw new PaymentError('live_events_not_allowed')
    if (!events.has(event.type)) return { received: true, ignored: true }
    const notification = event.data.object as Stripe.Checkout.Session
    if (notification.metadata?.integration !== integration) return { received: true, ignored: true }
    if (!event.id.startsWith('evt_') || !notification.id.startsWith('cs_test_') || !uuid(notification.metadata.fate_order_id)) throw new PaymentError('invalid_payment_event')
    // Fetch the current server-side object: event delivery can be late or out of order.
    const session = await this.stripe.retrieveSession(notification.id)
    const orderId = session.metadata?.fate_order_id
    if (session.livemode || session.mode !== 'payment' || session.id !== notification.id || !uuid(orderId) ||
        orderId !== notification.metadata.fate_order_id || session.client_reference_id !== orderId || session.metadata?.integration !== integration ||
        !Number.isInteger(session.amount_total) || session.currency !== 'usd') throw new PaymentError('payment_order_mismatch', 409)
    const paid = session.status === 'complete' && session.payment_status === 'paid'
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
    if (paid && !paymentIntent?.startsWith('pi_')) throw new PaymentError('invalid_payment_event')
    const state = paid ? 'paid' : session.status === 'expired' ? 'expired' : event.type === 'checkout.session.async_payment_failed' ? 'failed' : 'pending'
    const result = await this.store.recordPayment({ eventId: event.id, eventType: event.type, orderId, sessionId: session.id,
      paymentIntent, state, amount: session.amount_total!, currency: session.currency })
    return { received: true, duplicate: result === 'duplicate' }
  }
}
