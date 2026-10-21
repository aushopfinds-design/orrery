import { useEffect, useRef, useState } from 'react'
import type { OrderInput } from '../../../server/payments/input.ts'
import { useLocale } from '../../i18n/index.ts'
import { reportPrice } from '../../report/pricing.ts'

import { isSandboxHost, PURCHASES_KEY } from '../../utils/purchase-client.ts'
export { PURCHASES_KEY } from '../../utils/purchase-client.ts'
export const TEST_ACCESS_KEY = 'fate-sandbox-access-v1'
export default function SandboxCheckout({ order }: { order: OrderInput }) {
  const { t } = useLocale()
  const [recipientName, setRecipientName] = useState('')
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const [access, setAccess] = useState(() => { try { return sessionStorage.getItem(TEST_ACCESS_KEY) ?? '' } catch { return '' } })
  const activeRequest = useRef<AbortController | null>(null)
  useEffect(() => () => { activeRequest.current?.abort(); activeRequest.current = null }, [])
  async function checkout() {
    if (activeRequest.current) return
    const controller = new AbortController(); activeRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 45000)
    setBusy(true); setMessage('')
    try {
      sessionStorage.setItem(TEST_ACCESS_KEY, access)
      // A retry of the same input reuses its order/session, including after a network error.
      const draft = JSON.stringify({ ...order, ...(recipientName.trim() ? { recipientName: recipientName.trim() } : {}) }), previous = JSON.parse(sessionStorage.getItem('fate-sandbox-attempt') ?? 'null')
      const key = previous?.draft === draft ? previous.key : crypto.randomUUID()
      sessionStorage.setItem('fate-sandbox-attempt', JSON.stringify({ draft, key }))
      const response = await fetch('/api/payments?action=checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Fate-Test-Token': access, 'Idempotency-Key': key },
        body: draft, signal: controller.signal,
      })
      const result = await response.json()
      if (controller.signal.aborted) return
      if (!response.ok || !/^https:\/\/checkout\.stripe\.com\//.test(result.checkoutUrl ?? '')) throw new Error('Checkout unavailable')
      const saved = JSON.parse(sessionStorage.getItem(PURCHASES_KEY) ?? '{}')
      saved[result.orderId] = { accessToken: result.accessToken, kind: order.kind }
      sessionStorage.setItem(PURCHASES_KEY, JSON.stringify(saved))
      window.location.assign(result.checkoutUrl)
    } catch {
      if (activeRequest.current === controller) { setMessage(t('sandbox.error')); setBusy(false) }
    } finally { clearTimeout(timeout); if (activeRequest.current === controller) activeRequest.current = null }
  }
  if (!isSandboxHost(window.location.hostname)) return null
  return <section className="fate-personal-delivery" aria-label={t('sandbox.title')}>
    <h3>{t('sandbox.title')} · {reportPrice(order.kind)}</h3>
    <p>{t('sandbox.note')}</p><p>{t('sandbox.data')}</p>
    <label>{t('letter.name.label')}<input type="text" autoComplete="given-name" maxLength={40} value={recipientName} disabled={busy} onChange={event => setRecipientName(event.target.value)} aria-describedby="letter-name-note" /></label>
    <p id="letter-name-note">{t('letter.name.note')}</p>
    <label>{t('sandbox.access')}<input type="password" autoComplete="off" value={access} onChange={event => setAccess(event.target.value)} /></label>
    <button type="button" className="fate-complete-primary" onClick={checkout} disabled={busy || access.length < 32}>{t(busy ? 'sandbox.opening' : 'sandbox.buy')}</button>
    {message && <p role="alert">{message}</p>}
  </section>
}
