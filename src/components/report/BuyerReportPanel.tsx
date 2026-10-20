import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/index.ts'
import { PURCHASES_KEY } from './SandboxCheckout.tsx'
import type { BuyerReport } from '../../../server/payments/report.ts'

export default function BuyerReportPanel() {
  const { t } = useLocale()
  const [report, setReport] = useState<Omit<BuyerReport, 'pdf'> | null>(null)
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const params = new URLSearchParams(window.location.search), orderId = params.get('order_id')
  const success = params.get('checkout') === 'success'
  const request = async (action: string) => {
    let saved
    try { saved = JSON.parse(sessionStorage.getItem(PURCHASES_KEY) ?? '{}')[orderId ?? ''] } catch { /* missing capability */ }
    if (!saved?.accessToken) throw new Error(t('sandbox.missingAccess'))
    return fetch('/api/payments?action=' + action, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + saved.accessToken }, body: JSON.stringify({ orderId }),
    })
  }
  // t is a per-render closure; use a controlled effect keyed to the return identity.
  async function loadReport() {
    setBusy(true); setError('')
    try {
      const response = await request('report'), data = await response.json()
      if (!response.ok) throw new Error(t('sandbox.verifyError') + ' (' + data.error + ')')
      setReport(data)
      sessionStorage.removeItem('fate-sandbox-attempt')
    } catch (e) { setError(e instanceof Error ? e.message : t('sandbox.verifyError')) }
    finally { setBusy(false) }
  }
  useEffect(() => {
    if (!success || !orderId) return
    void loadReport()
    // This effect starts once for this return URL; retries use the button below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, success])
  async function download() {
    setBusy(true); setError('')
    try {
      const response = await request('pdf')
      if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) throw new Error(t('sandbox.verifyError'))
      const url = URL.createObjectURL(await response.blob()), link = document.createElement('a')
      link.href = url; link.download = `the-fate-key-${report?.kind ?? 'report'}.pdf`; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch (e) { setError(e instanceof Error ? e.message : t('sandbox.verifyError')) }
    finally { setBusy(false) }
  }
  if (!orderId || !/^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(window.location.hostname)) return null
  if (!success) return <p role="status" className="fate-personal-delivery">{t('sandbox.cancelled')}</p>
  return <section className="fate-buyer-report" aria-labelledby="buyer-report-title" lang="en">
    <p className="fate-eyebrow">{t('sandbox.buyer')}</p>
    <h2 id="buyer-report-title">{report?.title ?? t('sandbox.verifying')}</h2>
    <p>{t('sandbox.note')}</p>
    {busy && <p role="status">{t('sandbox.verifying')}</p>}
    {error && <p role="alert">{error}</p>}
    <div className="fate-preview-tools"><button type="button" onClick={loadReport} disabled={busy}>{t('sandbox.retry')}</button>
      {report && <button type="button" onClick={download} disabled={busy}>{t('sandbox.download')}</button>}</div>
    {report && <><p>{t('sandbox.issued')} {report.issuedAt.slice(0, 10)} · {report.edition}</p>
      <p>{report.documents.join(' · ')}</p>
      <div className="fate-buyer-report-text">{report.text.split(/\n+/).filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}</div>
      <div className="fate-buyer-card-grid">{report.cards.map((card, index) => <section key={index} className="fate-buyer-card"><p>{report.cards.length === 2 ? `Person ${index === 0 ? 'A' : 'B'}` : card.displayName}</p><h3>{card.title}</h3><p>{card.daySymbol}</p><p>{card.sentence}</p></section>)}</div>
    </>}
  </section>
}
