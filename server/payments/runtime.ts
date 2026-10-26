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
    accountReady: async () => { const account = await stripe.accounts.retrieve(null); return account.charges_enabled && account.payouts_enabled && account.details_submitted },
    retrieveCharge: id => stripe.charges.retrieve(id),
    retrievePaymentIntent: id => stripe.paymentIntents.retrieve(id),
    createSession: (params, key) => stripe.checkout.sessions.create(params, { idempotencyKey: key }),
    retrieveSession: id => stripe.checkout.sessions.retrieve(id, { expand: ['line_items.data.price.product'] }),
    verifyEvent: (body, signature, secret) => stripe.webhooks.constructEvent(body, signature, secret ?? config.webhookSecret),
    setupWebhook: (url, key) => stripe.webhookEndpoints.create({ url, enabled_events: [
      'checkout.session.completed', 'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed', 'checkout.session.expired', 'charge.refunded',
    ], description: 'THE FATE KEY private Sandbox fulfillment' }, { idempotencyKey: key }),
    // Same test-token flow used by Stripe's official CLI checkout.session.completed fixture:
    // https://github.com/stripe/stripe-cli/blob/master/pkg/fixtures/triggers/checkout.session.completed.json
    // This adapter is reachable only in non-production mode with a test secret key and private QA token.
    testPayment: async (id, amount, scenario) => {
      if (scenario === 'expire') { await stripe.checkout.sessions.expire(id); return { outcome: 'expired' } }
      const method = await stripe.paymentMethods.create({ type: 'card', card: { token: scenario === 'success' ? 'tok_visa' : 'tok_chargeDeclined' },
        billing_details: { name: 'Sandbox Test Buyer', email: 'fate-sandbox-qa@example.com', address: { country: 'AU', postal_code: '2000' } } })
      await stripe.rawRequest('GET', `/v1/payment_pages/${id}`)
      try {
        await stripe.rawRequest('POST', `/v1/payment_pages/${id}/confirm`, { payment_method: method.id, expected_amount: amount })
        return { outcome: 'confirmed' }
      } catch (error) {
        if (scenario === 'decline' && error instanceof Stripe.errors.StripeCardError && error.code === 'card_declined') return { outcome: 'declined' }
        throw error
      }
    },
  })
  return service
}
