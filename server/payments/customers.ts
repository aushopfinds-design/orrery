import { reportReference } from '../../src/report/report-reference.ts'
import { fingerprint, openOrder, sealOrder, secretMatches } from './crypto.ts'
import type { PaymentConfig } from './config.ts'
import type { OrderStore } from './store.ts'
import { MARKETING_CONSENT_TEXT, MARKETING_CONSENT_VERSION } from '../../src/report/marketing-consent.ts'
import type { OrderInput } from './input.ts'
export function customerEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email) ? email : null
}
export function customerConsentToken(config: PaymentConfig, id: string, purpose: 'confirm' | 'unsubscribe') {
  return fingerprint(config.accessKey, `customer-consent:v1:${purpose}:${id}`)
}
interface CustomerPurchase { orderId:string; kind:string; createdAt:string; consentRequested:boolean; consentVersion:string; consentText:string; consentCapturedAt:string }
export class CustomerRecords {
  private readonly config: PaymentConfig
  private readonly store: OrderStore
  constructor(config: PaymentConfig, store: OrderStore) { this.config=config; this.store=store }
  async record(orderId: string, emailValue: unknown, input: OrderInput, capturedAt: string) {
    const email = customerEmail(emailValue)
    if (!email) return
    const id = fingerprint(this.config.dataKey, 'customer-email:v1:' + email)
    await this.store.saveCustomer({ id, orderId, encrypted: sealOrder(this.config.dataKey, 'customer:' + id, { email, ...(input.recipientName ? { name: input.recipientName } : {}) }), consent: input.marketingConsent === true, version: MARKETING_CONSENT_VERSION, text: MARKETING_CONSENT_TEXT, capturedAt })
  }
  async change(id: string, token: string, purpose: 'confirm' | 'unsubscribe') {
    if (!/^[a-f0-9]{64}$/.test(id) || !/^[a-f0-9]{64}$/.test(token) || !secretMatches(token, customerConsentToken(this.config,id,purpose))) return false
    return this.store.changeCustomerConsent(id,purpose)
  }
  async list(onlySubscribed = false) {
    const rows = await this.store.customers(onlySubscribed)
    return rows.map(row => {
      const contact = openOrder(this.config.dataKey,'customer:'+row.id,row.email_encrypted) as {email:string;name?:string}
      return { id:row.id, email:contact.email, name:contact.name??'', marketingStatus:row.marketing_status, verifiedAt:row.verified_at, createdAt:row.created_at, purchases:Array.isArray(row.purchases)?row.purchases.map((purchase: CustomerPurchase)=>({...purchase,reportId:reportReference(purchase.orderId,new Date(purchase.createdAt).getUTCFullYear(),purchase.kind==='bundle'?0:1)})):[] }
    })
  }
}
