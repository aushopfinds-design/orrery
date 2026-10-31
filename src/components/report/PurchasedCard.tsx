import { useEffect, useId, useRef, useState } from 'react'
import type { DestinyCardData } from '../../report/destiny-card.ts'
import { useLocale } from '../../i18n/index.ts'
import { waitForPurchasedReport } from '../../utils/purchase-client.ts'
import { exportCard, saveCardBlob } from '../../utils/card-export.tsx'
import DestinyCardArtwork from './DestinyCardArtwork.tsx'

/** Only mounted with a verified report. Recheck the order before each local export. */
export default function PurchasedCard({ card, orderId, index, mode = 'test' }: { card: DestinyCardData; orderId: string; index: number; mode?: 'test' | 'live' }) {
  const { t } = useLocale(), id = useId().replace(/:/g, '')
  const [moving,setMoving] = useState(() => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  const [busy,setBusy] = useState(false), [percent,setPercent] = useState(0), [error,setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => { controller.current?.abort() }, [])
  async function download(format: 'png' | 'mp4') {
    if (controller.current) return
    const request = new AbortController(); controller.current = request
    const timeout = setTimeout(() => request.abort(), 90000)
    setBusy(true); setPercent(0); setError('')
    try {
      const verified = await waitForPurchasedReport(orderId, request.signal)
      const actual = verified.cards[index]
      if (!actual) throw new Error('card_missing')
      const blob = await exportCard(actual, format, request.signal, setPercent, false, verified.mode ?? mode)
      request.signal.throwIfAborted()
      saveCardBlob(blob, `the-fate-key-card-${index+1}.${format}`)
    } catch (e) {
      if (!request.signal.aborted) setError(e instanceof Error && e.message === 'card_video_unsupported' ? 'card.export.unsupported' : 'card.export.error')
    } finally { clearTimeout(timeout); if (controller.current === request) { controller.current = null; setBusy(false) } }
  }
  return <section className="fate-buyer-card">
    <h3>{card.displayName}</h3>
    <div className="fate-personal-card-motion"><DestinyCardArtwork card={card} id={id} preview={false} animated={moving} labels={{ personal:t('destiny.card.personal'), element:t('destiny.card.element'), numbers:t('destiny.card.numbers'), colour:t('destiny.card.color'), watermark:mode === 'test' ? 'SANDBOX EDITION' : 'PERSONAL EDITION' }} /><button type="button" className="fate-destiny-motion" aria-pressed={moving} onClick={() => setMoving(value => !value)}>{t(moving ? 'destiny.motion.pause' : 'destiny.motion.play')}</button></div>
    <div className="fate-card-export-actions"><button type="button" disabled={busy} onClick={() => void download('png')}>{t('card.export.png')}</button><button type="button" disabled={busy} onClick={() => void download('mp4')}>{t('card.export.mp4')}</button></div>
    <p className="fate-card-export-note">{t('card.export.note')}</p>
    {busy && <p role="status">{t('card.export.progress').replace('{percent}',String(percent))}</p>}
    {error && <p role="alert">{t(error)}</p>}
  </section>
}
