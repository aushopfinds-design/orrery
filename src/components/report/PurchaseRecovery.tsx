import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n/index.ts'
import { parseRecoveryCode, rememberOrder } from '../../utils/order-access.ts'
import { PurchaseRequestError, waitForPurchasedReport } from '../../utils/purchase-client.ts'
import type { PurchasedReport } from '../../utils/purchase-client.ts'

export default function PurchaseRecovery({ onRestore }: { onRestore: (id: string, report: PurchasedReport) => void }) {
  const { t } = useLocale()
  const [code, setCode] = useState(''), [remember, setRemember] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  async function restore(event: React.FormEvent) {
    event.preventDefault()
    const parsed = parseRecoveryCode(code)
    if (!parsed) { setError('purchase.recovery.invalid'); return }
    if (request.current) return
    const controller = new AbortController(); request.current = controller; setBusy(true); setError('')
    const timeout = setTimeout(() => controller.abort(), 90000)
    try {
      const report = await waitForPurchasedReport(parsed.orderId, controller.signal, parsed.accessToken)
      if (controller.signal.aborted) return
      rememberOrder(parsed.orderId, { accessToken: parsed.accessToken, kind: report.kind }, remember)
      onRestore(parsed.orderId, report)
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof PurchaseRequestError ? e.messageKey : 'sandbox.verifyError') }
    finally { clearTimeout(timeout); if (request.current === controller) { request.current = null; setBusy(false) } }
  }
  return <section className="fate-personal-delivery fate-purchase-recovery" aria-labelledby="purchase-recovery-title">
    <h2 id="purchase-recovery-title">{t('purchase.recovery.title')}</h2><p>{t('purchase.recovery.intro')}</p>
    <form onSubmit={restore}>
      <label>{t('purchase.recovery.code')}<input type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} disabled={busy} /></label>
      <label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} disabled={busy} />{t('purchase.recovery.remember')}</label>
      <p>{t('purchase.recovery.private')}</p>
      <button className="fate-complete-primary" type="submit" disabled={busy || !code.trim()}>{t(busy ? 'sandbox.verifying' : 'purchase.recovery.open')}</button>
      {error && <p role="alert">{t(error)}</p>}
    </form>
    <p>{t('purchase.recovery.lost')} <a href="/contact/">{t('purchase.recovery.contact')}</a></p>
  </section>
}
