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
    retrieveSession: id => stripe.checkout.sessions.retrieve(id),
    verifyEvent: (body, signature) => stripe.webhooks.constructEvent(body, signature, config.webhookSecret),
  })
  return service
}
