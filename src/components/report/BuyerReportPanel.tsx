import './buyer-reading.css'
import { splitDeliveredReading } from '../../report/report-delivery.ts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { recordJourney } from '../../utils/journey-events.ts'
import PurchaseRecovery from './PurchaseRecovery.tsx'
import { downloadRecovery, readOrderAccess } from '../../utils/order-access.ts'
import PurchasedCard from './PurchasedCard.tsx'
import { useLocale } from '../../i18n/index.ts'
import { isPurchaseHost, isSandboxHost, purchasedPdf, PurchaseRequestError, waitForPurchasedReport } from '../../utils/purchase-client.ts'
import type { PurchasedReport } from '../../utils/purchase-client.ts'

export default function BuyerReportPanel() {
  const { t } = useLocale()
  const [report, setReport] = useState<PurchasedReport | null>(null)
  const [error, setError] = useState(''), [busy, setBusy] = useState<'report' | 'pdf' | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const [recoveredId, setRecoveredId] = useState<string | null>(null)
  const params = new URLSearchParams(window.location.search), orderId = recoveredId ?? params.get('order_id')
  const success = Boolean(recoveredId) || params.get('checkout') === 'success', allowed = isPurchaseHost(window.location.hostname)
  const test = isSandboxHost(window.location.hostname)
  const emphasis = useMemo(() => report?.emphasis?.length ? new RegExp('(' + [...report.emphasis].sort((a,b) => b.length-a.length).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g') : null, [report])
  const delivered = useMemo(() => splitDeliveredReading(report?.text ?? ''), [report])
  const renderLines = (text: string) => text.split(/\n+/).filter(Boolean).map((line, i) => /^\d{2} · |^THE FATE KEY · |^Your Twelve Months/.test(line) ? <h3 key={i}>{line}</h3> : <p key={i}>{emphasis ? line.split(emphasis).map((part, j) => report?.emphasis?.includes(part) ? <strong key={j}>{part}</strong> : part) : line}</p>)
  const restored = (id: string, data: PurchasedReport) => { setError(''); setReport(data); setRecoveredId(id) }
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
      recordJourney('report_opened', data.kind)
      try { sessionStorage.removeItem('fate-sandbox-attempt') } catch { /* reading still works */ }
    } catch (e) {
      if (activeRequest.current === controller) setError(e instanceof PurchaseRequestError ? e.messageKey : 'sandbox.verifyError')
    } finally {
      clearTimeout(timeout)
      if (activeRequest.current === controller) { activeRequest.current = null; setBusy(null) }
    }
  }, [orderId, success, allowed])
  useEffect(() => {
    if (recoveredId) return
    setReport(null); setError('')
    void loadReport()
    return () => { activeRequest.current?.abort(); activeRequest.current = null }
  }, [loadReport, recoveredId])
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
  if (!allowed) return null
  if (!orderId || !success) return <>{orderId && <p role="status" className="fate-personal-delivery">{t('sandbox.cancelled')}</p>}<PurchaseRecovery onRestore={restored} /></>
  return <section className="fate-buyer-report" aria-labelledby="buyer-report-title" lang="en">
    <p className="fate-eyebrow">{t(test ? 'sandbox.buyer' : 'purchase.live.reading')}</p>
    <h2 id="buyer-report-title">{report?.title ?? t('sandbox.verifying')}</h2>
    <p>{t(test ? 'sandbox.note' : 'purchase.live.delivered')}</p><p className="fate-buyer-order-reference">{t('sandbox.orderReference')} <code>{orderId}</code></p>
    {busy && <p role="status" aria-live="polite">{t(busy === 'pdf' ? 'sandbox.downloading' : 'sandbox.verifying')}</p>}
    {error && <p role="alert">{t(error)}</p>}
    <div className="fate-preview-tools"><button type="button" onClick={loadReport} disabled={Boolean(busy)}>{t('sandbox.retry')}</button>
      {report && <button type="button" onClick={download} disabled={Boolean(busy)}>{t('sandbox.download')}</button>}
      {report && <button type="button" onClick={() => { const access = readOrderAccess(orderId); if (access) downloadRecovery(orderId, access.accessToken) }}>{t('purchase.key.save')}</button>}</div>
    {!report && error && <PurchaseRecovery onRestore={restored} />}
    {report && <>{report.reference && <p className="fate-buyer-order-reference">{t('purchase.reportId')} <code>{report.reference}</code></p>}<p>{t('sandbox.issued')} {report.issuedAt.slice(0, 10)} · {report.edition}</p>
      <p>{report.documents.join(' · ')}</p>
      {report.recipientName && <p>{`Dear ${report.recipientName},`}</p>}
      <div className="fate-buyer-report-text">{renderLines(delivered.body)}</div>
      {delivered.appendix && <details className="fate-buyer-calculation-notes"><summary>{t('purchase.calculationNotes')}</summary><div className="fate-buyer-report-text">{renderLines(delivered.appendix)}</div></details>}
      <div className="fate-buyer-card-grid">{report.cards.map((card, index) => <PurchasedCard key={index} card={card} orderId={orderId} index={index} mode={report.mode ?? (test ? 'test' : 'live')} />)}</div>
    </>}
  </section>
}
