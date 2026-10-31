import { customerEmail, customerConsentToken } from './customers.ts'
import { fingerprint, openOrder, orderAccessToken, sealOrder } from './crypto.ts'
import type { PaymentConfig } from './config.ts'
import type { BuyerReport } from './report.ts'
import type { OrderInput } from './input.ts'
import type { OrderStore } from './store.ts'

export interface ReportMail { to:string[]; from:string; reply_to:string[]; subject:string; text:string; html:string; attachments:{filename:string;content:string}[] }
export interface MailTransport { send(mail:ReportMail,key:string):Promise<string> }
export class MailError extends Error { readonly retryable:boolean; constructor(retryable:boolean){super('report_email_failed');this.retryable=retryable} }
const escape = (s:string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))

/** Real Resend HTTP API. Secrets and provider response bodies never enter logs. */
export function resendTransport(env:NodeJS.ProcessEnv, fetcher:typeof fetch=fetch):MailTransport|undefined {
  const key=env.RESEND_API_KEY, domain=env.RESEND_EMAIL_DOMAIN
  if(!key?.startsWith('re_') || domain!=='thefatekey.com') return
  return {async send(mail,idempotencyKey){
    let response:Response
    try { response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(mail),signal:AbortSignal.timeout(12000)}) }
    catch { throw new MailError(true) }
    if(!response.ok)throw new MailError(response.status===429||response.status>=500)
    const result=await response.json() as {id?:unknown}
    if(typeof result.id!=='string'||!result.id)throw new MailError(true)
    return result.id
  }}
}

/** The immutable PDF and recovery code go only to the paid checkout email. */
export function purchaseMail(config:PaymentConfig,id:string,email:string,report:BuyerReport,consent=false):ReportMail {
  const test=(config.mode??'test')==='test'
  // Sandbox can never email an arbitrary checkout address.
  const to=test?'delivered@resend.dev':email
  const title=report.title
  const recovery=`FK1.${id}.${orderAccessToken(config.accessKey,id)}`
  const url=config.origin+'/#purchase'
  const lines=[test?'SANDBOX TEST — no real payment charged.':'Thank you for your purchase.',
    title+' is attached as a PDF.', 'Report ID: '+(report.reference??id),
    'To open your report and included cards again, visit '+url+' and enter this private recovery code:',recovery,
    'Keep this email private. Anyone with the recovery code can open the report. Online access is checked against payment and refund status.',
    'You can download the PDF, card image and animated card directly from your purchased-report page. Email is a backup; you do not have to wait for it to save your files.']
  if(consent){
    const contact=fingerprint(config.dataKey,'customer-email:v1:'+email)
    const link=(purpose:'confirm'|'unsubscribe')=>config.origin+'/api/payments?action=subscription&preference='+purpose+'&contact='+contact+'&token='+customerConsentToken(config,contact,purpose)
    lines.push('You requested optional product updates. Confirm your email to subscribe: '+link('confirm'),
      'Stop product updates at any time: '+link('unsubscribe'), 'Your purchase does not depend on subscribing.')
  }
  lines.push('Questions? Reply to this email. Please include your Report ID and never send card details.','THE FATE KEY · Traditional chart interpretation for personal reflection.')
  const text=lines.join('\n\n')
  return {from:'THE FATE KEY <reports@thefatekey.com>',reply_to:['thefatekey@gmail.com'],to:[to],subject:(test?'[Sandbox] ':'')+title+' | THE FATE KEY',text,
    html:'<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;line-height:1.6;color:#182332"><h1>THE FATE KEY</h1>'+lines.map(s=>'<p style="overflow-wrap:anywhere">'+escape(s)+'</p>').join('')+'</body></html>',
    attachments:[{filename:'the-fate-key-'+report.kind+'.pdf',content:report.pdf}]}
}

export class ReportEmailDelivery {
  private config:PaymentConfig
  private store:OrderStore
  private transport:MailTransport
  constructor(config:PaymentConfig,store:OrderStore,transport:MailTransport){this.config=config;this.store=store;this.transport=transport}
  async deliver(id:string,emailValue:unknown,report:BuyerReport,input:OrderInput,consentReady:boolean){
    const email=customerEmail(emailValue)
    if(!email)return 'missing_email'
    if(await this.store.setting('full-refund:'+id))return 'refunded'
    // Persist the exact recipient/body once: a retry always has an identical payload.
    const payloadKey='report-email-payload:'+id
    await this.store.saveSetting(payloadKey,sealOrder(this.config.dataKey,payloadKey,purchaseMail(this.config,id,email,report,consentReady&&input.marketingConsent===true)))
    const claim=await this.store.claimReportEmail(id)
    if(!claim.lease)return claim.state
    try {
      const saved=await this.store.setting(payloadKey)
      if(!saved)throw new MailError(false)
      const mail=openOrder(this.config.dataKey,payloadKey,saved) as ReportMail
      const providerId=await this.transport.send(mail,'fate-report-v1/'+id)
      await this.store.finishReportEmail(id,claim.lease,{state:'sent',providerId})
      return 'sent'
    }catch(error){
      await this.store.finishReportEmail(id,claim.lease,{state:error instanceof MailError&&!error.retryable?'failed':'pending'})
      return error instanceof MailError&&!error.retryable?'failed':'pending'
    }
  }
}
