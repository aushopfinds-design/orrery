import Stripe from 'stripe'
import { paymentConfig } from './config.ts'
import { postgresDatabase } from './postgres.ts'
import { OrderStore } from './store.ts'
import { PaymentService } from './service.ts'

let service: PaymentService | undefined
export function paymentService() {
  if (service) return service
  const config = paymentConfig(process.env)
  const stripe = new Stripe(config.stripeKey, { maxNetworkRetries: 1, timeout: 12000 })
  service = new PaymentService(config, new OrderStore(postgresDatabase(config.databaseUrl)), {
    createSession: (params, key) => stripe.checkout.sessions.create(params, { idempotencyKey: key }),
    retrieveSession: id => stripe.checkout.sessions.retrieve(id, { expand: ['line_items.data.price.product'] }),
    verifyEvent: (body, signature, secret) => stripe.webhooks.constructEvent(body, signature, secret ?? config.webhookSecret),
    setupWebhook: (url, key) => stripe.webhookEndpoints.create({ url, enabled_events: [
      'checkout.session.completed', 'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed', 'checkout.session.expired',
    ], description: 'THE FATE KEY private Sandbox fulfillment' }, { idempotencyKey: key }),
  })
  return service
}
