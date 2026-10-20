import { useState } from 'react'
import type { OrderInput } from '../../../server/payments/input.ts'
import { useLocale } from '../../i18n/index.ts'
import { reportPrice } from '../../report/pricing.ts'

export const PURCHASES_KEY = 'fate-sandbox-orders-v1'
export const TEST_ACCESS_KEY = 'fate-sandbox-access-v1'
export default function SandboxCheckout({ order }: { order: OrderInput }) {
  const { t } = useLocale()
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const [access, setAccess] = useState(() => { try { return sessionStorage.getItem(TEST_ACCESS_KEY) ?? '' } catch { return '' } })
  async function checkout() {
    setBusy(true); setMessage('')
    try {
      sessionStorage.setItem(TEST_ACCESS_KEY, access)
      // A retry of the same input reuses its order/session, including after a network error.
      const draft = JSON.stringify(order), previous = JSON.parse(sessionStorage.getItem('fate-sandbox-attempt') ?? 'null')
      const key = previous?.draft === draft ? previous.key : crypto.randomUUID()
      sessionStorage.setItem('fate-sandbox-attempt', JSON.stringify({ draft, key }))
      const response = await fetch('/api/payments?action=checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Fate-Test-Token': access, 'Idempotency-Key': key },
        body: draft,
      })
      const result = await response.json()
      if (!response.ok || !/^https:\/\/checkout\.stripe\.com\//.test(result.checkoutUrl ?? '')) throw new Error(t('sandbox.error') + ' (' + (result.error ?? response.status) + ')')
      const saved = JSON.parse(sessionStorage.getItem(PURCHASES_KEY) ?? '{}')
      saved[result.orderId] = { accessToken: result.accessToken, kind: order.kind }
      sessionStorage.setItem(PURCHASES_KEY, JSON.stringify(saved))
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('sandbox.error')); setBusy(false)
    }
  }
  if (!/^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(window.location.hostname)) return null
  return <section className="fate-personal-delivery" aria-label={t('sandbox.title')}>
    <h3>{t('sandbox.title')} · {reportPrice(order.kind)}</h3>
    <p>{t('sandbox.note')}</p>
    <label>{t('sandbox.access')}<input type="password" autoComplete="off" value={access} onChange={event => setAccess(event.target.value)} /></label>
    <button type="button" className="fate-complete-primary" onClick={checkout} disabled={busy || access.length < 32}>{t(busy ? 'sandbox.opening' : 'sandbox.buy')}</button>
    {message && <p role="alert">{message}</p>}
  </section>
}
