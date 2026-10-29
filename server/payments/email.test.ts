import { beforeAll,afterAll,beforeEach,it,expect,vi } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { randomUUID } from 'node:crypto'
import { OrderStore } from './store.ts'
import type { Database } from './store.ts'
import { purchaseMail,resendTransport,ReportEmailDelivery,MailError } from './email.ts'
import type { PaymentConfig } from './config.ts'
import type { BuyerReport } from './report.ts'
const config:PaymentConfig={mode:'live',stripeKey:'',webhookSecret:'',databaseUrl:'',origin:'https://thefatekey.com',dataKey:'11'.repeat(32),accessKey:'22'.repeat(32),testToken:''}
const report={kind:'career',title:'Work & Career',reference:'FK-2026-TEST-01',pdf:Buffer.from('%PDF-fixture').toString('base64')} as BuyerReport
let db:PGlite,store:OrderStore
beforeAll(async()=>{db=await PGlite.create();await db.exec('CREATE TABLE fate_payment_settings(key text PRIMARY KEY,value_encrypted text NOT NULL)')},120000)
beforeEach(async()=>{await db.exec('TRUNCATE fate_payment_settings');store=new OrderStore(db as unknown as Database)})
afterAll(async()=>{await db.close()})
it('attaches the purchased PDF, support reference and private recovery, without raw birth details',()=>{
 const mail=purchaseMail(config,randomUUID(),'buyer@example.org',report)
 expect(mail.to).toEqual(['buyer@example.org']);expect(mail.attachments[0].content).toBe(report.pdf)
 expect(mail.text).toContain(report.reference);expect(mail.text).toContain('FK1.')
 expect(mail.text).not.toContain('1992');expect(mail.html).not.toContain('<script>')
 expect(mail.reply_to).toEqual(['thefatekey@gmail.com'])
})
it('routes every Sandbox receipt to the official test inbox, never an arbitrary buyer',()=>{
 const mail=purchaseMail({...config,mode:'test'},randomUUID(),'someone@gmail.com',report)
 expect(mail.to).toEqual(['delivered@resend.dev']);expect(mail.subject).toContain('[Sandbox]')
})
it('only includes product-update confirmation when a separate consent was requested',()=>{
 const id=randomUUID()
 expect(purchaseMail(config,id,'buyer@example.org',report).text).not.toContain('preference=confirm')
 expect(purchaseMail(config,id,'buyer@example.org',report,true).text).toContain('preference=confirm')
 expect(purchaseMail(config,id,'buyer@example.org',report,true).text).toContain('preference=unsubscribe')
})
it('uses the real Resend endpoint, secret header, attachment and stable idempotency key',async()=>{
 const send=vi.fn(async(..._args:[string|URL|Request,RequestInit?])=>Response.json({id:'provider-id'})), transport=resendTransport({RESEND_API_KEY:'re_fixture',RESEND_EMAIL_DOMAIN:'thefatekey.com'},send)
 expect(resendTransport({})).toBeUndefined()
 await transport!.send(purchaseMail(config,randomUUID(),'buyer@example.org',report),'fate-report-v1/order')
 expect(send.mock.calls[0][0]).toBe('https://api.resend.com/emails')
 expect((send.mock.calls[0] as unknown as [string,RequestInit])[1].headers).toMatchObject({'Idempotency-Key':'fate-report-v1/order'})
})
it('marks validation failures as permanent and rate limits as retryable',async()=>{
 for(const status of [403,422,429,500]){
  const transport=resendTransport({RESEND_API_KEY:'re_fixture',RESEND_EMAIL_DOMAIN:'thefatekey.com'},async()=>new Response('{}',{status}))!
  await expect(transport.send(purchaseMail(config,randomUUID(),'buyer@example.org',report),'key')).rejects.toMatchObject({retryable:status>=429})
 }
})
it('sends once across concurrent deliveries and preserves encrypted email payload',async()=>{
 const transport={send:vi.fn(async()=> 'provider-id')},sender=new ReportEmailDelivery(config,store,transport),id=randomUUID(),input={kind:'career'} as never
 await Promise.all([sender.deliver(id,'buyer@example.org',report,input,false),sender.deliver(id,'buyer@example.org',report,input,false)])
 await sender.deliver(id,'changed@example.org',report,input,false)
 expect(transport.send).toHaveBeenCalledTimes(1)
 const rows=await db.query<{value_encrypted:string}>("SELECT value_encrypted FROM fate_payment_settings WHERE key LIKE 'report-email-payload:%'")
 expect(rows.rows[0].value_encrypted).not.toContain('buyer@example.org')
})
it('retries the exact saved payload after a network error and blocks sends after refund',async()=>{
 const transport={send:vi.fn().mockRejectedValueOnce(new MailError(true)).mockResolvedValue('provider-id')},sender=new ReportEmailDelivery(config,store,transport),id=randomUUID(),input={kind:'career'} as never
 expect(await sender.deliver(id,'buyer@example.org',report,input,false)).toBe('pending')
 await db.query("UPDATE fate_payment_settings SET value_encrypted=jsonb_set(value_encrypted::jsonb,'{retryAt}','0')::text WHERE key=$1",['report-email-state:'+id])
 await sender.deliver(id,'changed@example.org',report,input,false)
 expect(transport.send.mock.calls[1]).toEqual(transport.send.mock.calls[0])
 await store.saveSetting('full-refund:'+id,'refunded')
 expect(await sender.deliver(id,'buyer@example.org',report,input,false)).toBe('refunded')
 expect(transport.send).toHaveBeenCalledTimes(2)
})
it('does not automatically resend an uncertain email outside the provider deduplication window',async()=>{
 const id=randomUUID()
 await store.saveSetting('report-email-state:'+id,JSON.stringify({state:'sending',attempts:1,firstAttempt:Date.now()-24*3600000,leaseUntil:0}))
 expect(await store.claimReportEmail(id)).toEqual({state:'needs_review'})
})

it('does not repeat Your in collection titles and explains direct downloads',()=>{
 const mail=purchaseMail(config,randomUUID(),'buyer@example.org',{...report,title:'Your Destiny Collection'})
 expect(mail.subject).toBe('Your Destiny Collection | THE FATE KEY')
 expect(mail.text).not.toContain('Your Your')
 expect(mail.text).toContain('card image and animated card directly')
})

it('preserves each product title without adding a possessive before a question',()=>{
 for(const title of ['Your Life, Your Destiny','Are We Meant to Be?','What Awaits You This Year?','Success, Money & Your Future','Born to Build a Business?','The Real You: Strengths & Weaknesses','Your Destiny Collection']){
  const mail=purchaseMail(config,randomUUID(),'buyer@example.org',{...report,title})
  expect(mail.subject).toBe(title+' | THE FATE KEY')
  expect(mail.text).toContain(title+' is attached as a PDF.')
 }
})
