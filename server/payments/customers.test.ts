import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { OrderStore } from './store.ts'
import type { Database } from './store.ts'
import { CustomerRecords, customerConsentToken, customerEmail } from './customers.ts'
import { sealOrder } from './crypto.ts'
import { paymentHandler } from './handler.ts'
import { MARKETING_CONSENT_TEXT, MARKETING_CONSENT_VERSION } from '../../src/report/marketing-consent.ts'
import type { PaymentService } from './service.ts'
const config={mode:'test' as const,stripeKey:'sk_test_fixture',webhookSecret:'whsec_fixture',databaseUrl:'postgres://unused',origin:'https://test.example.com',dataKey:'11'.repeat(32),accessKey:'22'.repeat(32),testToken:'fixture'}
const first={year:1992,month:8,day:17,hour:0,minute:0,unknownTime:true,gender:'M' as const,latitude:-33.8688,longitude:151.2093,timezone:'Australia/Sydney'}
let db:PGlite,store:OrderStore,records:CustomerRecords
beforeAll(async()=>{db=await PGlite.create();for(const file of ['001_test_orders.sql','002_report_artifacts.sql','003_customer_records.sql'])await db.exec(readFileSync(new URL('./migrations/'+file,import.meta.url),'utf8'))},120000)
beforeEach(async()=>{await db.exec('TRUNCATE fate_customer_consent_events,fate_customer_purchases,fate_customer_contacts,fate_fulfillment_jobs,fate_payment_events,fate_order_artifacts,fate_payment_orders');store=new OrderStore(db as unknown as Database);records=new CustomerRecords(config,store)})
afterAll(async()=>{await db.close()})
async function purchase(consent=false,email='buyer@example.com',id=randomUUID()){
 const input={kind:'career' as const,first,marketingConsent:consent,recipientName:'Test Buyer'}
 await store.create({id,request_key_hash:id,input_hash:id,kind:'career',amount:1099,currency:'usd',input_encrypted:sealOrder(config.dataKey,id,input),expires_at:new Date(Date.now()+60000)})
 await records.record(id,email,input,new Date().toISOString());return id
}
describe('Encrypted customer records and separate marketing consent',()=>{
 it('stores purchase contacts without putting birth data or plain emails in the contacts table',async()=>{
  await purchase();const raw=(await db.query<{email_encrypted:string;marketing_status:string}>('SELECT * FROM fate_customer_contacts')).rows[0]
  expect(raw.email_encrypted).not.toContain('buyer@example.com');expect(raw.email_encrypted).not.toMatch(/1992|Sydney/)
  expect(raw.marketing_status).toBe('not_requested');expect(await records.list(true)).toEqual([])
  const customers=await records.list();expect(customers[0].email).toBe('buyer@example.com');expect(JSON.stringify(customers)).not.toMatch(/latitude|longitude|birth|1992|Sydney/)
 })
 it('keeps checked consent pending until the address is confirmed and records the exact notice',async()=>{
  await purchase(true);expect(await records.list(true)).toEqual([])
  const all=await records.list(),id=all[0].id
  expect((all[0].purchases as {consentText:string;consentVersion:string}[])[0]).toMatchObject({consentText:MARKETING_CONSENT_TEXT,consentVersion:MARKETING_CONSENT_VERSION})
  expect(await records.change(id,customerConsentToken(config,id,'confirm'),'confirm')).toBe(true)
  expect(await records.list(true)).toHaveLength(1)
 })
 it('withdraws consent immediately and a repeated payment notification cannot subscribe again',async()=>{
  const order=await purchase(true),id=(await records.list())[0].id
  await records.change(id,customerConsentToken(config,id,'confirm'),'confirm')
  expect(await records.change(id,customerConsentToken(config,id,'unsubscribe'),'unsubscribe')).toBe(true)
  await records.record(order,'buyer@example.com',{kind:'career',first,marketingConsent:true},new Date().toISOString())
  expect(await records.list(true)).toEqual([])
  expect(await records.change(id,customerConsentToken(config,id,'confirm'),'confirm')).toBe(false)
 })
 it('does not convert a second unchecked purchase into permission or duplicate a customer',async()=>{
  await purchase();await purchase(false,'BUYER@example.com');expect(await records.list()).toHaveLength(1);expect(await records.list(true)).toEqual([])
 })
 it('does not accept the unsubscribe proof as a confirmation proof',async()=>{
  await purchase(true);const id=(await records.list())[0].id
  expect(await records.change(id,customerConsentToken(config,id,'unsubscribe'),'confirm')).toBe(false)
  expect(await records.list(true)).toEqual([])
 })
 it('treats a mail scanner GET as read-only and requires an authentic token before changing preferences',async()=>{
  await purchase(true);const id=(await records.list())[0].id,token=customerConsentToken(config,id,'confirm')
  const handler=paymentHandler(()=>({config,store,mode:'test',customerRecordsReady:async()=>true} as unknown as PaymentService))
  const url=config.origin+`/api/payments?action=subscription&preference=confirm&contact=${id}&token=${token}`
  expect((await handler(new Request(url))).status).toBe(200);expect(await records.list(true)).toEqual([])
  expect((await handler(new Request(url,{method:'POST'}))).status).toBe(200);expect(await records.list(true)).toHaveLength(1)
  expect((await handler(new Request(url.replace(token,'0'.repeat(64)),{method:'POST'}))).status).toBe(400)
 })
 it('rejects header injection and malformed addresses',()=>{
  for(const email of ['a@example.com\nBcc:b@example.com','a@','x'.repeat(260)+'@example.com'])expect(customerEmail(email)).toBeNull()
 })
})
