import type { BuyerReport } from '../../server/payments/report.ts'
import { isPreviewKind } from '../report/personal-products.ts'

export const PURCHASES_KEY = 'fate-sandbox-orders-v1'
export type PurchasedReport = Omit<BuyerReport, 'pdf'>
export class PurchaseRequestError extends Error {
  readonly messageKey: string
  constructor(messageKey: string) { super(messageKey); this.messageKey = messageKey }
}
export function isSandboxHost(host: string) {
  return /^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(host)
}
async function request(action: 'report' | 'pdf', orderId: string, signal: AbortSignal) {
  let accessToken: unknown
  try { accessToken = JSON.parse(sessionStorage.getItem(PURCHASES_KEY) ?? '{}')?.[orderId]?.accessToken } catch { /* missing capability */ }
  if (typeof accessToken !== 'string' || !accessToken || accessToken.length > 1000) throw new PurchaseRequestError('sandbox.missingAccess')
  return fetch('/api/payments?action=' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
    body: JSON.stringify({ orderId }), signal,
  })
}
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
  })
}
function validReport(value: unknown): value is PurchasedReport {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (v.recipientName === undefined || (typeof v.recipientName === 'string' && v.recipientName.length <= 40)) &&
    typeof v.title === 'string' && typeof v.kind === 'string' && isPreviewKind(v.kind) &&
    typeof v.text === 'string' && typeof v.edition === 'string' && typeof v.issuedAt === 'string' &&
    Number.isFinite(Date.parse(v.issuedAt)) && Array.isArray(v.documents) && v.documents.every(x => typeof x === 'string') &&
    Array.isArray(v.cards) && v.cards.every(x => x && typeof x.title === 'string' && typeof x.sentence === 'string' && typeof x.daySymbol === 'string')
}
/** Poll only processing/unpaid/transient states. A return URL never grants access. */
export async function waitForPurchasedReport(orderId: string, signal: AbortSignal): Promise<PurchasedReport> {
  for (let attempt = 0; attempt < 6; attempt++) {
    signal.throwIfAborted()
    let response: Response
    try { response = await request('report', orderId, signal) }
    catch (error) {
      if (signal.aborted || error instanceof PurchaseRequestError || attempt === 5) throw error
      await wait(1000 * (attempt + 1), signal); continue
    }
    let data: unknown
    try { data = await response.json() } catch { throw new PurchaseRequestError('sandbox.verifyError') }
    if (response.ok) {
      if (!validReport(data)) throw new PurchaseRequestError('sandbox.verifyError')
      return data
    }
    const code = (data as { error?: unknown } | null)?.error
    const preparing = response.status === 409 && code === 'report_being_prepared'
    const unpaid = response.status === 402 && code === 'payment_not_complete'
    const temporary = response.status === 503 && code === 'payment_service_unavailable'
    if (attempt < 5 && (preparing || unpaid || temporary)) { await wait(1000 * (attempt + 1), signal); continue }
    throw new PurchaseRequestError(response.status === 404 ? 'sandbox.missingAccess' :
      unpaid ? 'sandbox.paymentPending' : preparing ? 'sandbox.stillPreparing' : 'sandbox.verifyError')
  }
  throw new PurchaseRequestError('sandbox.verifyError')
}
export async function purchasedPdf(orderId: string, signal: AbortSignal) {
  const response = await request('pdf', orderId, signal)
  if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) throw new PurchaseRequestError('sandbox.downloadError')
  const blob = await response.blob()
  if (await blob.slice(0, 5).text() !== '%PDF-') throw new PurchaseRequestError('sandbox.downloadError')
  return blob
}
