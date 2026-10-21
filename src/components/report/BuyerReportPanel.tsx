import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n/index.ts'
import { isSandboxHost, purchasedPdf, PurchaseRequestError, waitForPurchasedReport } from '../../utils/purchase-client.ts'
import type { PurchasedReport } from '../../utils/purchase-client.ts'

export default function BuyerReportPanel() {
  const { t } = useLocale()
  const [report, setReport] = useState<PurchasedReport | null>(null)
  const [error, setError] = useState(''), [busy, setBusy] = useState<'report' | 'pdf' | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const params = new URLSearchParams(window.location.search), orderId = params.get('order_id')
  const success = params.get('checkout') === 'success', allowed = isSandboxHost(window.location.hostname)
  useEffect(() => { if (report) document.title = report.title + ' | The Fate Key' }, [report])

  const loadReport = useCallback(async () => {
    if (!orderId || !success || !allowed) return
    activeRequest.current?.abort()
    const controller = new AbortController(); activeRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 90000)
    setBusy('report'); setError('')
    try {
      const data = await waitForPurchasedReport(orderId, controller.signal)
      if (controller.signal.aborted) return
      setReport(data)
      try { sessionStorage.removeItem('fate-sandbox-attempt') } catch { /* reading still works */ }
    } catch (e) {
      if (activeRequest.current === controller) setError(e instanceof PurchaseRequestError ? e.messageKey : 'sandbox.verifyError')
    } finally {
      clearTimeout(timeout)
      if (activeRequest.current === controller) { activeRequest.current = null; setBusy(null) }
    }
  }, [orderId, success, allowed])
  useEffect(() => {
    setReport(null); setError('')
    void loadReport()
    return () => { activeRequest.current?.abort(); activeRequest.current = null }
  }, [loadReport])
  async function download() {
    if (!orderId || !report) return
    const controller = new AbortController(); activeRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 45000)
    setBusy('pdf'); setError('')
    try {
      const blob = await purchasedPdf(orderId, controller.signal)
      if (controller.signal.aborted) return
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      link.href = url; link.download = `the-fate-key-${report.kind}.pdf`
      // Attached anchors also work in browsers that ignore clicks on detached links.
      document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch (e) {
      if (activeRequest.current === controller) setError(e instanceof PurchaseRequestError ? e.messageKey : 'sandbox.downloadError')
    } finally {
      clearTimeout(timeout)
      if (activeRequest.current === controller) { activeRequest.current = null; setBusy(null) }
    }
  }
  if (!orderId || !allowed) return null
  if (!success) return <p role="status" className="fate-personal-delivery">{t('sandbox.cancelled')}</p>
  return <section className="fate-buyer-report" aria-labelledby="buyer-report-title" lang="en">
    <p className="fate-eyebrow">{t('sandbox.buyer')}</p>
    <h2 id="buyer-report-title">{report?.title ?? t('sandbox.verifying')}</h2>
    <p>{t('sandbox.note')}</p><p className="fate-buyer-order-reference">{t('sandbox.orderReference')} <code>{orderId}</code></p>
    {busy && <p role="status" aria-live="polite">{t(busy === 'pdf' ? 'sandbox.downloading' : 'sandbox.verifying')}</p>}
    {error && <p role="alert">{t(error)}</p>}
    <div className="fate-preview-tools"><button type="button" onClick={loadReport} disabled={Boolean(busy)}>{t('sandbox.retry')}</button>
      {report && <button type="button" onClick={download} disabled={Boolean(busy)}>{t('sandbox.download')}</button>}</div>
    {report && <><p>{t('sandbox.issued')} {report.issuedAt.slice(0, 10)} · {report.edition}</p>
      <p>{report.documents.join(' · ')}</p>
      {report.recipientName && <p>{`Dear ${report.recipientName},`}</p>}
      <div className="fate-buyer-report-text">{report.text.split(/\n+/).filter(Boolean).map((line, i) => /^\d{2} · |^THE FATE KEY · /.test(line) ? <h3 key={i}>{line}</h3> : <p key={i}>{line}</p>)}</div>
      <div className="fate-buyer-card-grid">{report.cards.map((card, index) => <section key={index} className="fate-buyer-card"><p>{report.cards.length === 2 ? `Person ${index === 0 ? 'A' : 'B'}` : card.displayName}</p><h3>{card.title}</h3><p>{card.daySymbol}</p><p>{card.sentence}</p></section>)}</div>
    </>}
  </section>
}
