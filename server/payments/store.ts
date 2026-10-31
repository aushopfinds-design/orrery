import { PaymentError } from './config.ts'
import { randomUUID } from 'node:crypto'
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
  async claimReportEmail(id:string):Promise<{state:string;lease?:string}> {
    return this.db.transaction(async client=>{
      const key='report-email-state:'+id
      await client.query('INSERT INTO fate_payment_settings(key,value_encrypted) VALUES($1,$2) ON CONFLICT DO NOTHING',[key,JSON.stringify({state:'pending',attempts:0})])
      const row=(await client.query<{value_encrypted:string}>('SELECT value_encrypted FROM fate_payment_settings WHERE key=$1 FOR UPDATE',[key])).rows[0]
      const state=JSON.parse(row.value_encrypted) as {state:string;attempts:number;firstAttempt?:number;retryAt?:number;leaseUntil?:number;lease?:string}
      const now=Date.now()
      if(['sent','failed','needs_review'].includes(state.state))return {state:state.state}
      if((state.leaseUntil??0)>now||(state.retryAt??0)>now)return {state:'pending'}
      // Resend retains idempotency keys for 24 hours. Never automatically resend
      // an uncertain request after that window, even after a process crash.
      if(state.attempts>=5||(state.firstAttempt&&now-state.firstAttempt>=23*3600000)){
        await client.query('UPDATE fate_payment_settings SET value_encrypted=$2 WHERE key=$1',[key,JSON.stringify({...state,state:'needs_review'})])
        return {state:'needs_review'}
      }
      const lease=randomUUID()
      await client.query('UPDATE fate_payment_settings SET value_encrypted=$2 WHERE key=$1',[key,JSON.stringify({state:'sending',attempts:state.attempts+1,firstAttempt:state.firstAttempt??now,lease,leaseUntil:now+60000})])
      return {state:'sending',lease}
    })
  }
  async finishReportEmail(id:string,lease:string,result:{state:'sent'|'pending'|'failed';providerId?:string}) {
    return this.db.transaction(async client=>{
      const key='report-email-state:'+id
      const row=(await client.query<{value_encrypted:string}>('SELECT value_encrypted FROM fate_payment_settings WHERE key=$1 FOR UPDATE',[key])).rows[0]
      if(!row)return
      const state=JSON.parse(row.value_encrypted) as {lease?:string;attempts:number}
      if(state.lease!==lease)return
      await client.query('UPDATE fate_payment_settings SET value_encrypted=$2 WHERE key=$1',[key,JSON.stringify({...state,...result,lease:null,leaseUntil:0,retryAt:Date.now()+60000*2**state.attempts})])
    })
  }
  async saveCustomer(data: { id:string; orderId:string; encrypted:string; consent:boolean; version:string; text:string; capturedAt:string }) {
    await this.db.transaction(async client => {
      await client.query(`INSERT INTO fate_customer_contacts(id,email_encrypted) VALUES ($1,$2) ON CONFLICT(id) DO NOTHING`,[data.id,data.encrypted])
      const saved = await client.query(`INSERT INTO fate_customer_purchases(order_id,contact_id,consent_requested,consent_version,consent_text,consent_captured_at)
        VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(order_id) DO NOTHING RETURNING order_id`,[data.orderId,data.id,data.consent,data.version,data.text,data.capturedAt])
      if (saved.rows.length && data.consent) await client.query(`UPDATE fate_customer_contacts SET marketing_status=CASE WHEN marketing_status='subscribed' THEN 'subscribed' ELSE 'pending' END,updated_at=now() WHERE id=$1`,[data.id])
    })
  }
  async changeCustomerConsent(id:string,purpose:'confirm'|'unsubscribe') {
    return this.db.transaction(async client => {
      const changed=await client.query(`UPDATE fate_customer_contacts SET marketing_status=$2,verified_at=CASE WHEN $2='subscribed' THEN now() ELSE verified_at END,updated_at=now()
        WHERE id=$1 AND ${purpose==='confirm'?"marketing_status='pending'":"marketing_status<>'unsubscribed'"} RETURNING id`,[id,purpose==='confirm'?'subscribed':'unsubscribed'])
      if(changed.rows.length)await client.query(`INSERT INTO fate_customer_consent_events(contact_id,event) VALUES($1,$2)`,[id,purpose==='confirm'?'confirmed':'unsubscribed'])
      return changed.rows.length>0
    })
  }
  async customers(onlySubscribed=false) {
    return (await this.db.query<{id:string;email_encrypted:string;marketing_status:string;verified_at:string|null;created_at:string;purchases:unknown}>(`SELECT c.id,c.email_encrypted,c.marketing_status,c.verified_at,c.created_at,
      COALESCE(jsonb_agg(jsonb_build_object('orderId',p.order_id,'kind',o.kind,'createdAt',o.created_at,'consentRequested',p.consent_requested,'consentVersion',p.consent_version,'consentText',p.consent_text,'consentCapturedAt',p.consent_captured_at)) FILTER (WHERE p.order_id IS NOT NULL),'[]'::jsonb) AS purchases
      FROM fate_customer_contacts c LEFT JOIN fate_customer_purchases p ON p.contact_id=c.id LEFT JOIN fate_payment_orders o ON o.id=p.order_id
      ${onlySubscribed?"WHERE c.marketing_status='subscribed' AND c.verified_at IS NOT NULL":''}
      GROUP BY c.id ORDER BY c.created_at DESC LIMIT 1000`)).rows
  }
  async checkoutQuota(key: string) {
    const r = await this.db.query(`INSERT INTO fate_checkout_quota (key, attempts) VALUES ($1,1)
      ON CONFLICT (key) DO UPDATE SET attempts=fate_checkout_quota.attempts+1
      WHERE fate_checkout_quota.attempts<12 RETURNING key`, [key])
    return r.rows.length === 1
  }
  async setting(key: string) {
    return (await this.db.query<{ value_encrypted: string }>('SELECT value_encrypted FROM fate_payment_settings WHERE key=$1', [key])).rows[0]?.value_encrypted
  }
  async saveSetting(key: string, value: string) {
    await this.db.query('INSERT INTO fate_payment_settings (key,value_encrypted) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [key, value])
  }
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
  async artifact(id: string) {
    return (await this.db.query<{ payload_encrypted: string; content_hash: string }>(
      'SELECT payload_encrypted, content_hash FROM fate_order_artifacts WHERE order_id = $1', [id])).rows[0]
  }
  async saveArtifact(id: string, lease: string, encrypted: string, digest: string) {
    return this.db.transaction(async client => {
      const job = await client.query(`SELECT order_id FROM fate_fulfillment_jobs
        WHERE order_id=$1 AND lease_id=$2 AND state='processing' AND lease_until>now() FOR UPDATE`, [id, lease])
      if (!job.rows.length) throw new PaymentError('report_being_prepared', 409)
      await client.query(`INSERT INTO fate_order_artifacts (order_id,payload_encrypted,content_hash)
        VALUES ($1,$2,$3) ON CONFLICT (order_id) DO NOTHING`, [id, encrypted, digest])
      await client.query(`UPDATE fate_fulfillment_jobs SET state='complete', completed_at=now(), lease_until=NULL,
        artifact_manifest=$3::jsonb WHERE order_id=$1 AND lease_id=$2`, [id, lease, JSON.stringify({ report: digest, pdf: 'included' })])
    })
  }
  async releaseFulfillment(id: string, lease: string) {
    await this.db.query(`UPDATE fate_fulfillment_jobs SET state='queued', lease_until=NULL, lease_id=NULL
      WHERE order_id=$1 AND lease_id=$2 AND state='processing'`, [id, lease])
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
