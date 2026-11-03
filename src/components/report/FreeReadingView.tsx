import { useEffect, useMemo, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { buildFreeGlimpse } from '../../report/free-glimpse.ts'
import { useLocale } from '../../i18n/index.ts'
import { recordJourney } from '../../utils/journey-events.ts'
import { checkoutHash } from '../../report/personal-products.ts'
import ReportPrice from './ReportPrice.tsx'
import { isPurchaseHost } from '../../utils/purchase-client.ts'

const questions = ['glimpse.money', 'glimpse.love', 'glimpse.timing', 'glimpse.challenge'] as const

export default function FreeReadingView({ input }: { input: BirthInput }) {
  const { t, locale } = useLocale()
  const [purchaseAvailable, setPurchaseAvailable] = useState(false)
  const preview = useMemo(() => {
    return buildFreeGlimpse(input, locale)
  }, [input, locale])
  useEffect(() => {
    let cancelled = false
    if (!isPurchaseHost(window.location.hostname)) return () => { cancelled = true }
    void fetch('/api/payments?action=availability', { cache: 'no-store' }).then(response => response.json()).then(value => {
      if (!cancelled) setPurchaseAvailable(value.available === true && value.mode === 'live')
    }).catch(() => { if (!cancelled) setPurchaseAvailable(false) })
    return () => { cancelled = true }
  }, [])
  useEffect(() => { document.getElementById('free-reading')?.scrollIntoView({ block: 'start' }); recordJourney('free_reading_complete') }, [])
  return <article id="free-reading" lang={locale} aria-label={t('reading.free.title')} className="fate-free-reading fate-glimpse printable-reading">
    <header className="fate-reading-cover fate-reading-cover-free"><p className="fate-eyebrow">{t('reading.free.eyebrow')}</p><h1>{t('reading.free.title')}</h1><p>{preview.birthSummary}</p></header>
    {preview.timeUnknown && <p role="status" className="fate-reading-time-note">{t('reading.timeUnknown')}</p>}
    <section className="fate-glimpse-card">
      <h2>{t('glimpse.personality')}</h2><p>{preview.personality}</p>
      <h2>{t('glimpse.strength')}</h2><p>{preview.strength}</p>
      <h2>{t('glimpse.symbols')}</h2><div className="fate-glimpse-symbols"><span>{preview.symbol.colors.map(color => <i key={color.name} title={color.name} style={{ backgroundColor: color.hex }} />)} {preview.symbol.colors.map(color => color.name).join(' · ')}</span><strong>{preview.symbol.elementLabel} · {preview.symbol.numbers.slice(0, 2).join(' · ')}</strong></div>
    </section>
    <section className="fate-glimpse-locked"><h2>{t('glimpse.locked')}</h2><ul>{questions.map(key => <li key={key}><span aria-hidden="true">🔒</span>{t(key)}</li>)}</ul></section>
    <section className="fate-glimpse-cta"><h2>{t('glimpse.ctaTitle')}</h2><p>{t('glimpse.ctaText')}</p>{purchaseAvailable ? <div className="fate-glimpse-purchase"><ReportPrice kind="complete" /><a className="fate-complete-primary" href={checkoutHash('complete')}>{t('glimpse.buy')}</a></div> : <p role="status">{t('glimpse.purchaseClosed')}</p>}</section>
    <footer className="fate-reading-small-note"><p>{t('reading.footer.note')}</p><button type="button" className="fate-outline-button print:hidden" onClick={() => window.print()}>{t('reading.free.print')}</button></footer>
  </article>
}
