import { CustomerRecords } from './customers.ts'
import { ReportEmailDelivery } from './email.ts'
import type { MailTransport } from './email.ts'
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
  accountReady?(): Promise<boolean>
  retrieveCharge?(id: string): Promise<Stripe.Charge>
  retrievePaymentIntent?(id: string): Promise<Stripe.PaymentIntent>
  verifyEvent(body: string, signature: string, secret?: string): Stripe.Event
  setupWebhook?(url: string, key: string): Promise<{ id: string; secret?: string }>
  testPayment?(id: string, amount: number, scenario: 'success' | 'decline' | 'expire'): Promise<{ outcome: string }>
}
const events = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'])

export class PaymentService {
  readonly config: PaymentConfig
  readonly store: OrderStore
  private readonly stripe: StripeGateway
  private mail?:MailTransport
  constructor(config: PaymentConfig, store: OrderStore, stripe: StripeGateway, mail?:MailTransport) { this.config = config; this.store = store; this.stripe = stripe; this.mail=mail }
  get emailDeliveryReady(){return Boolean(this.mail)}
  private async deliverEmail(id:string,session:Stripe.Checkout.Session){
    if(!this.mail)return 'disabled'
    try{
      const saved=await this.store.artifact(id),order=await this.store.get(id)
      if(!saved||!order||order.payment_state!=='paid'||await this.store.setting('full-refund:'+id))return 'not_ready'
      const report=openOrder(this.config.dataKey,id+':report',saved.payload_encrypted) as BuyerReport
      if(hash(JSON.stringify(report))!==saved.content_hash)throw new Error('report_integrity_error')
      return await new ReportEmailDelivery(this.config,this.store,this.mail).deliver(id,session.customer_details?.email??session.customer_email,report,orderInput(openOrder(this.config.dataKey,id,order.input_encrypted)),await this.customerRecordsReady())
    }catch{console.warn('Report email will require retry');return 'pending'}
  }

  get mode() { return this.config.mode ?? 'test' }
  private get integration() { return this.mode === 'live' ? 'fate-key-live-v1' : 'fate-key-test-v1' }
  private matchesMode(live: boolean) { return live === (this.mode === 'live') }
  private sessionId(id: string) { return id.startsWith(this.mode === 'live' ? 'cs_live_' : 'cs_test_') }
  async available() { return this.mode === 'test' || (this.config.checkoutOpen === true && await this.store.setting('live-schema-version') === '1' && Boolean(await this.stripe.accountReady?.())) }

  async customerRecordsReady() { return this.config.customerRecordsEnabled === true && await this.store.setting('customer-records-schema-version') === '1' }

  async createCheckout(value: unknown, requestKey: string | null) {
    if (!uuid(requestKey)) throw new PaymentError('valid_idempotency_key_required')
    if (!await this.available()) throw new PaymentError('merchant_not_ready', 503)
    const integration = this.integration
    const input = orderInput(value), id = randomUUID(), amount = REPORT_PRICE_CENTS[input.kind]
    const inputHash = fingerprint(this.config.dataKey, JSON.stringify({ input, amount, currency: 'usd', integration }))
    const order = await this.store.create({ id, request_key_hash: hash(requestKey.toLowerCase()), input_hash: inputHash,
      kind: input.kind, amount, currency: 'usd', input_encrypted: sealOrder(this.config.dataKey, id, input),
      expires_at: new Date(Math.floor(Date.now() / 1000) * 1000 + 60 * 60 * 1000) })
    if (Boolean(order.livemode) !== (this.mode === 'live')) throw new PaymentError('payment_database_mode_mismatch', 503)
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
    if (!this.matchesMode(session.livemode) || !this.sessionId(session.id) || session.client_reference_id !== order.id ||
        session.metadata?.fate_order_id !== order.id || session.metadata?.integration !== this.integration) throw new PaymentError('unexpected_checkout_session', 502)
    if (session.status !== 'open' || !session.url) throw new PaymentError('order_not_open_for_checkout', 409)
    const checkoutUrl = new URL(session.url)
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.stripe.com') throw new PaymentError('unexpected_checkout_session', 502)
    await this.store.attachCheckout(order.id, session.id)
    return { orderId: order.id, checkoutUrl: session.url, accessToken: orderAccessToken(this.config.accessKey, order.id), mode: this.mode }
  }

  async receiveWebhook(body: string, signature: string | null) {
    if (!signature) throw new PaymentError('invalid_webhook_signature')
    let event: Stripe.Event
    try {
      const setting = await this.store.setting('stripe-webhook')
      const secret = setting ? (openOrder(this.config.dataKey, 'stripe-webhook', setting) as { secret: string }).secret : this.config.webhookSecret
      event = this.stripe.verifyEvent(body, signature, secret)
    } catch { throw new PaymentError('invalid_webhook_signature') }
    if (!this.matchesMode(event.livemode)) throw new PaymentError('payment_mode_mismatch')
    if (event.type === 'charge.refunded') {
      if (!this.stripe.retrieveCharge || !this.stripe.retrievePaymentIntent) throw new PaymentError('refund_verification_unavailable', 503)
      const notification = event.data.object as Stripe.Charge
      const charge = await this.stripe.retrieveCharge(notification.id)
      const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (!pi) return { received: true, ignored: true }
      return this.recordRefund(charge, await this.stripe.retrievePaymentIntent(pi))
    }
    if (!events.has(event.type)) return { received: true, ignored: true }
    const notification = event.data.object as Stripe.Checkout.Session
    if (notification.metadata?.integration !== this.integration) return { received: true, ignored: true }
    if (!event.id.startsWith('evt_') || !this.sessionId(notification.id) || !uuid(notification.metadata.fate_order_id)) throw new PaymentError('invalid_payment_event')
    // Fetch the current server-side object: event delivery can be late or out of order.
    const session = await this.stripe.retrieveSession(notification.id)
    const duplicate = await this.recordSession(session, event.id, event.type, notification.metadata.fate_order_id)
    if (session.payment_status === 'paid' && session.status === 'complete') {
      await this.fulfill(notification.metadata.fate_order_id)
      if(await this.deliverEmail(notification.metadata.fate_order_id,session)==='pending')throw new PaymentError('email_delivery_pending',503)
    }
    return { received: true, duplicate }
  }

  private async recordSession(session: Stripe.Checkout.Session, eventId: string, eventType: string, expectedId: string) {
    const orderId = session.metadata?.fate_order_id
    const order = await this.store.get(expectedId)
    const lines = session.line_items
    const item = lines?.data[0], price = item?.price, product = price?.product
    if (!order || !this.matchesMode(session.livemode) || session.mode !== 'payment' || !this.sessionId(session.id) || !uuid(orderId) ||
        orderId !== expectedId || session.client_reference_id !== orderId || session.metadata?.integration !== this.integration ||
        session.metadata?.fate_kind !== order.kind || session.amount_total !== order.amount || session.currency !== order.currency ||
        (order.checkout_session_id && order.checkout_session_id !== session.id) ||
        !lines || lines.has_more || lines.data.length !== 1 || item?.quantity !== 1 || item.amount_total !== order.amount ||
        item.currency !== order.currency || price?.unit_amount !== order.amount || price.currency !== order.currency ||
        typeof product !== 'object' || !product || !('metadata' in product) || product.deleted || product.metadata?.fate_kind !== order.kind || product.metadata?.integration !== this.integration) {
      throw new PaymentError('payment_order_mismatch', 409)
    }
    const paid = session.status === 'complete' && session.payment_status === 'paid'
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
    if (paid && !paymentIntent?.startsWith('pi_')) throw new PaymentError('invalid_payment_event')
    const state = paid ? 'paid' : session.status === 'expired' ? 'expired' : eventType === 'checkout.session.async_payment_failed' ? 'failed' : 'pending'
    const duplicate = await this.store.recordPayment({ eventId, eventType, orderId, sessionId: session.id,
      paymentIntent, state, amount: session.amount_total!, currency: session.currency! }) === 'duplicate'
    if (paid && await this.customerRecordsReady()) await new CustomerRecords(this.config,this.store).record(orderId, session.customer_details?.email ?? session.customer_email,
      orderInput(openOrder(this.config.dataKey,orderId,order.input_encrypted)),new Date(String(order.created_at)).toISOString())
    return duplicate
  }

  async reconcile(id: string): Promise<Record<string, unknown>> {
    const order = await this.store.get(id)
    if (!order?.checkout_session_id) throw new PaymentError('order_not_found', 404)
    const session = await this.stripe.retrieveSession(order.checkout_session_id)
    const eventId = `reconcile_${session.id}_${session.status}_${session.payment_status}`
    await this.recordSession(session, eventId, 'server.reconciliation', id)
    let refunded = Boolean(await this.store.setting('full-refund:' + id))
    const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
    if (!refunded && this.stripe.retrievePaymentIntent && this.stripe.retrieveCharge && intentId) {
      const intent = await this.stripe.retrievePaymentIntent(intentId)
      const chargeId = typeof intent.latest_charge === 'string' ? intent.latest_charge : intent.latest_charge?.id
      if (chargeId) await this.recordRefund(await this.stripe.retrieveCharge(chargeId), intent)
      refunded = Boolean(await this.store.setting('full-refund:' + id))
    }
    if (session.status === 'complete' && session.payment_status === 'paid' && !refunded) { await this.fulfill(id); await this.deliverEmail(id,session) }
    return { ...await this.store.status(id), refund_state: refunded ? 'full' : 'none' }
  }

  /** Private QA only. Stripe itself authorizes/declines the official test-token payment. */
  async exerciseSandbox(id: string, scenario: unknown) {
    if (this.mode !== 'test') throw new PaymentError('not_found', 404)
    if (!['success', 'decline', 'expire'].includes(String(scenario)) || !this.stripe.testPayment) throw new PaymentError('invalid_test_scenario')
    const order = await this.store.get(id)
    if (!order?.checkout_session_id || order.payment_state !== 'pending') throw new PaymentError('order_not_open_for_checkout', 409)
    const session = await this.stripe.retrieveSession(order.checkout_session_id)
    await this.recordSession(session, `qa_before_${session.id}`, 'server.qa', id)
    const result = await this.stripe.testPayment(session.id, order.amount, scenario as 'success' | 'decline' | 'expire')
    return { ...result, status: await this.reconcile(id) }
  }

  private async fulfill(id: string) {
    if (await this.store.setting('full-refund:' + id) || await this.store.artifact(id)) return
    const lease = randomUUID()
    if (!await this.store.claimFulfillment(id, lease)) return
    try {
      const order = (await this.store.get(id))!
      const input = orderInput(openOrder(this.config.dataKey, id, order.input_encrypted))
      const year = new Date(String(order.created_at)).getUTCFullYear()
      const report = await issueReport(input, id, year, this.mode)
      await this.store.saveArtifact(id, lease, sealOrder(this.config.dataKey, id + ':report', report), hash(JSON.stringify(report)))
    } catch (error) { await this.store.releaseFulfillment(id, lease); throw error }
  }

  async report(id: string): Promise<BuyerReport> {
    const status = await this.reconcile(id)
    if (status?.refund_state === 'full') throw new PaymentError('purchase_refunded', 403)
    if (status?.payment_state !== 'paid') throw new PaymentError('payment_not_complete', 402)
    const saved = await this.store.artifact(id)
    if (!saved) throw new PaymentError('report_being_prepared', 409)
    const report = openOrder(this.config.dataKey, id + ':report', saved.payload_encrypted) as BuyerReport
    if (hash(JSON.stringify(report)) !== saved.content_hash) throw new PaymentError('report_integrity_error', 503)
    return report
  }

  private async recordRefund(charge: Stripe.Charge, intent: Stripe.PaymentIntent) {
    if (intent.metadata?.integration !== this.integration) return { received: true, ignored: true }
    const id = intent.metadata.fate_order_id
    if (!uuid(id)) throw new PaymentError('invalid_payment_event')
    const order = await this.store.get(id)
    const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
    if (!order || !this.matchesMode(charge.livemode) || !this.matchesMode(intent.livemode) ||
        paymentIntent !== intent.id || (order.payment_intent_id && order.payment_intent_id !== intent.id) ||
        intent.amount !== order.amount || charge.amount !== order.amount || intent.currency !== order.currency || charge.currency !== order.currency ||
        intent.metadata.fate_kind !== order.kind || !Number.isInteger(charge.amount_refunded) || charge.amount_refunded < 0 || charge.amount_refunded > order.amount) {
      throw new PaymentError('payment_order_mismatch', 409)
    }
    if (charge.amount_refunded === order.amount) {
      await this.store.saveSetting('full-refund:' + id, sealOrder(this.config.dataKey, 'full-refund:' + id, { charge: charge.id, amount: charge.amount_refunded }))
    }
    return { received: true, refunded: charge.amount_refunded === order.amount }
  }

  async setupWebhook(url: string) {
    if (this.mode !== 'test') throw new PaymentError('not_found', 404)
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
