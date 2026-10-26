import { useEffect, useRef, useState } from 'react'
import type { OrderInput } from '../../../server/payments/input.ts'
import { useLocale } from '../../i18n/index.ts'
import { recordJourney } from '../../utils/journey-events.ts'
import { reportPrice } from '../../report/pricing.ts'

import { isSandboxHost, isPurchaseHost } from '../../utils/purchase-client.ts'
import { downloadRecovery, recoveryCode, rememberOrder, validOrderId } from '../../utils/order-access.ts'
export { PURCHASES_KEY } from '../../utils/purchase-client.ts'
export const TEST_ACCESS_KEY = 'fate-sandbox-access-v1'
export default function SandboxCheckout({ order }: { order: OrderInput }) {
  const { t } = useLocale()
  const [recipientName, setRecipientName] = useState('')
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const [access, setAccess] = useState(() => { try { return sessionStorage.getItem(TEST_ACCESS_KEY) ?? '' } catch { return '' } })
  const [mode, setMode] = useState<'test' | 'live' | 'closed'>(() => isSandboxHost(window.location.hostname) ? 'test' : 'closed')
  const [contactRecordsReady, setContactRecordsReady] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [remember, setRemember] = useState(false), [saved, setSaved] = useState(false)
  const [prepared, setPrepared] = useState<{ orderId: string; accessToken: string; checkoutUrl: string } | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  useEffect(() => {
    if (!isPurchaseHost(window.location.hostname)) return
    const controller = new AbortController()
    void fetch('/api/payments?action=availability', { signal: controller.signal, cache: 'no-store' }).then(r => r.json()).then(value => {
      if (!controller.signal.aborted) {
        if (value.available === true && value.mode === 'live') setMode('live')
        setContactRecordsReady(value.customerRecordsReady === true)
      }
    }).catch(() => { /* Closed until the server confirms live readiness. */ })
    return () => controller.abort()
  }, [])
  useEffect(() => () => { activeRequest.current?.abort(); activeRequest.current = null }, [])
  async function checkout() {
    if (activeRequest.current) return
    const controller = new AbortController(); activeRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 45000)
    setBusy(true); setMessage('')
    try {
      if (mode === 'test') sessionStorage.setItem(TEST_ACCESS_KEY, access)
      // A retry of the same input reuses its order/session, including after a network error.
      const draft = JSON.stringify({ ...order, ...(contactRecordsReady ? { marketingConsent } : {}), ...(recipientName.trim() ? { recipientName: recipientName.trim() } : {}) }), previous = JSON.parse(sessionStorage.getItem('fate-sandbox-attempt') ?? 'null')
      const key = previous?.draft === draft ? previous.key : crypto.randomUUID()
      sessionStorage.setItem('fate-sandbox-attempt', JSON.stringify({ draft, key }))
      const response = await fetch('/api/payments?action=checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(mode === 'test' ? { 'X-Fate-Test-Token': access } : {}), 'Idempotency-Key': key },
        body: draft, signal: controller.signal,
      })
      const result = await response.json()
      if (controller.signal.aborted) return
      if (!response.ok || result.mode !== mode || !validOrderId(result.orderId ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(result.accessToken ?? '') || !/^https:\/\/checkout\.stripe\.com\//.test(result.checkoutUrl ?? '')) throw new Error('Checkout unavailable')
      rememberOrder(result.orderId, { accessToken: result.accessToken, kind: order.kind }, remember)
      setPrepared({ orderId: result.orderId, accessToken: result.accessToken, checkoutUrl: result.checkoutUrl })

    } catch {
      if (activeRequest.current === controller) { setMessage(t('sandbox.error')); setBusy(false) }
    } finally { clearTimeout(timeout); if (activeRequest.current === controller) { activeRequest.current = null; setBusy(false) } }
  }
  if (mode === 'closed') return <p role="status">{t('buyer.checkout.pending')}</p>
  return <section className="fate-personal-delivery fate-checkout-form" aria-label={t(mode === 'test' ? 'sandbox.title' : 'purchase.live.title')}>
    <h3>{t(mode === 'test' ? 'sandbox.title' : 'purchase.live.title')} · {reportPrice(order.kind)}</h3>
    <p>{t(mode === 'test' ? 'sandbox.note' : 'purchase.live.note')}</p><p>{t(mode === 'test' ? 'sandbox.data' : 'purchase.live.data')}</p>
    <label>{t('letter.name.label')}<input type="text" autoComplete="given-name" maxLength={40} value={recipientName} disabled={busy || Boolean(prepared)} onChange={event => setRecipientName(event.target.value)} aria-describedby="letter-name-note" /></label>
    <p id="letter-name-note">{t('letter.name.note')}</p>
    {!prepared ? <>
      {mode === 'test' && <><p id="checkout-access-help" className="fate-checkout-access-note">{t('purchase.testNote')}</p>
        <label>{t('sandbox.access')}<input type="password" autoComplete="off" value={access} onChange={event => setAccess(event.target.value)} /></label></>}
      {contactRecordsReady && <label lang="en"><input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} disabled={busy} />{t('purchase.marketingConsent')}</label>}
      <label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} disabled={busy} />{t('purchase.recovery.remember')}</label>
      <p>{t('purchase.recovery.private')}</p>{contactRecordsReady && <p>{t('purchase.contactData')}</p>}<p><a href="/purchases/">{t('purchase.live.terms')}</a></p>
      <button type="button" className="fate-complete-primary" onClick={checkout} disabled={busy || (mode === 'test' && access.length < 32)} aria-describedby={mode === 'test' ? 'checkout-access-help' : undefined}>{t(busy ? 'sandbox.opening' : mode === 'test' ? 'sandbox.buy' : 'purchase.live.prepare')}</button>
    </> : <div className="fate-recovery-backup">
      <h4>{t('purchase.key.title')}</h4><p>{t('purchase.key.before')}</p>
      <label>{t('purchase.recovery.code')}<input type="password" readOnly autoComplete="off" value={recoveryCode(prepared.orderId, prepared.accessToken)} /></label>
      <button type="button" className="fate-outline-button" onClick={() => downloadRecovery(prepared.orderId, prepared.accessToken)}>{t('purchase.key.save')}</button>
      <label><input type="checkbox" checked={saved} onChange={e => setSaved(e.target.checked)} />{t('purchase.key.saved')}</label>
      <button type="button" className="fate-complete-primary" disabled={!saved} onClick={() => { recordJourney('checkout_started', order.kind); window.location.assign(prepared.checkoutUrl) }}>{t('purchase.live.continue')}</button>
      <p>{t('purchase.key.private')}</p>
    </div>}
    {message && <p role="alert">{message}</p>}
  </section>
}
