import { PaymentError } from './config.ts'
import type { PreviewKind } from '../../src/report/personal-products.ts'

export interface SqlClient { query<T extends Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[] }> }
export interface Database extends SqlClient { transaction<T>(work: (client: SqlClient) => Promise<T>): Promise<T> }
export interface Order extends Record<string, unknown> {
  id: string; request_key_hash: string; input_hash: string; kind: PreviewKind; amount: number; currency: string
  input_encrypted: string; checkout_session_id: string | null; payment_intent_id: string | null
  payment_state: 'pending' | 'paid' | 'failed' | 'expired'; expires_at: Date | string
}
export interface PaymentUpdate {
  eventId: string; eventType: string; orderId: string; sessionId: string; paymentIntent: string | null
  state: Order['payment_state']; amount: number; currency: string
}

export class OrderStore {
  private readonly db: Database
  constructor(db: Database) { this.db = db }
  async create(order: Pick<Order, 'id' | 'request_key_hash' | 'input_hash' | 'kind' | 'amount' | 'currency' | 'input_encrypted' | 'expires_at'>): Promise<Order> {
    const result = await this.db.query<Order>(`INSERT INTO fate_payment_orders
      (id, request_key_hash, input_hash, kind, amount, currency, input_encrypted, expires_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (request_key_hash) DO UPDATE SET request_key_hash = EXCLUDED.request_key_hash
      WHERE fate_payment_orders.input_hash = EXCLUDED.input_hash RETURNING *`,
    [order.id, order.request_key_hash, order.input_hash, order.kind, order.amount, order.currency, order.input_encrypted, order.expires_at])
    if (!result.rows[0]) throw new PaymentError('idempotency_key_reused_with_different_order', 409)
    return result.rows[0]
  }
  async get(id: string): Promise<Order | undefined> {
    return (await this.db.query<Order>('SELECT * FROM fate_payment_orders WHERE id = $1', [id])).rows[0]
  }
  async attachCheckout(id: string, sessionId: string) {
    const result = await this.db.query(`UPDATE fate_payment_orders SET checkout_session_id = $2
      WHERE id = $1 AND (checkout_session_id IS NULL OR checkout_session_id = $2) RETURNING id`, [id, sessionId])
    if (!result.rows.length) throw new PaymentError('checkout_session_conflict', 409)
  }
  /** The order lock, event receipt and unique job commit together, or all roll back. */
  async recordPayment(update: PaymentUpdate): Promise<'recorded' | 'duplicate'> {
    return this.db.transaction(async client => {
      const order = (await client.query<Order>('SELECT * FROM fate_payment_orders WHERE id = $1 FOR UPDATE', [update.orderId])).rows[0]
      if (!order) throw new PaymentError('order_not_found_for_payment', 503)
      if (order.amount !== update.amount || order.currency !== update.currency ||
          (order.checkout_session_id && order.checkout_session_id !== update.sessionId) ||
          (order.payment_intent_id && order.payment_intent_id !== update.paymentIntent)) throw new PaymentError('payment_order_mismatch', 409)
      const inserted = await client.query(`INSERT INTO fate_payment_events (event_id,order_id,session_id,event_type,outcome)
        VALUES ($1,$2,$3,$4,$5) ON CONFLICT (event_id) DO NOTHING RETURNING event_id`,
      [update.eventId, update.orderId, update.sessionId, update.eventType, update.state])
      if (!inserted.rows.length) return 'duplicate'
      // Old failure/expiry notifications must never undo a verified paid order.
      const state = order.payment_state === 'paid' ? 'paid' : update.state === 'paid' ? 'paid' :
        order.payment_state === 'expired' ? 'expired' : order.payment_state === 'failed' && update.state === 'pending' ? 'failed' : update.state
      await client.query(`UPDATE fate_payment_orders SET checkout_session_id = $2, payment_intent_id = COALESCE(payment_intent_id,$3),
        payment_state = $4, paid_at = CASE WHEN $4 = 'paid' THEN COALESCE(paid_at,now()) ELSE paid_at END WHERE id = $1`,
      [order.id, update.sessionId, update.paymentIntent, state])
      if (state === 'paid') await client.query(`INSERT INTO fate_fulfillment_jobs (order_id) VALUES ($1)
        ON CONFLICT (order_id) DO NOTHING`, [order.id])
      return 'recorded'
    })
  }
  async status(id: string) {
    return (await this.db.query(`SELECT o.id, o.kind, o.amount, o.currency, o.payment_state,
      COALESCE(j.state, 'not_ready') AS fulfillment_state FROM fate_payment_orders o
      LEFT JOIN fate_fulfillment_jobs j ON j.order_id = o.id WHERE o.id = $1`, [id])).rows[0]
  }
  /** The stage-two exporter uses a bounded lease, deterministic object keys and this order ID. */
  async claimFulfillment(id: string, lease: string) {
    return (await this.db.query(`UPDATE fate_fulfillment_jobs j SET state = 'processing', lease_id = $2,
      lease_until = now() + interval '5 minutes', attempts = attempts + 1
      FROM fate_payment_orders o WHERE j.order_id = $1 AND o.id = j.order_id AND o.payment_state = 'paid'
      AND (j.state = 'queued' OR (j.state = 'processing' AND j.lease_until < now())) RETURNING j.order_id`, [id, lease])).rows.length === 1
  }
  async completeFulfillment(id: string, lease: string, manifest: Record<string, string>) {
    if (!Object.keys(manifest).length) throw new PaymentError('empty_artifact_manifest')
    return (await this.db.query(`UPDATE fate_fulfillment_jobs SET state = 'complete', artifact_manifest = $3::jsonb,
      completed_at = now(), lease_until = NULL WHERE order_id = $1 AND lease_id = $2 AND state = 'processing'
      AND lease_until > now() RETURNING order_id`, [id, lease, JSON.stringify(manifest)])).rows.length === 1
  }
}
