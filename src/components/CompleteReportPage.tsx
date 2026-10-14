import { useLocale } from '../i18n/index.ts'
import { FateEmblem } from './HomeOverview.tsx'
import { useEffect } from 'react'

export default function CompleteReportPage({ onStartFree, onViewSample }: { onStartFree: () => void; onViewSample: () => void }) {
  const { t } = useLocale()
  useEffect(() => { document.getElementById('complete-life-reading')?.scrollIntoView({ block: 'start' }) }, [])
  return (
    <article id="complete-life-reading" className="fate-complete-product" aria-labelledby="complete-product-title">
      <a href="#reports" className="fate-product-back">← {t('complete.back')}</a>
      <header className="fate-complete-product-hero">
        <div><p className="fate-eyebrow">{t('complete.eyebrow')}</p><h1 id="complete-product-title">{t('complete.title')}</h1><p className="fate-complete-description">{t('complete.description')}</p><p className="fate-complete-price">US$14.99 <span>{t('complete.priceNote')}</span></p>
          <div className="fate-complete-actions"><button type="button" onClick={onViewSample} className="fate-complete-primary">{t('complete.sample')}</button><a href="#birth-details" onClick={onStartFree} className="fate-outline-button">{t('complete.tryFree')}</a></div>
          <p className="fate-reading-small-note">{t('complete.status')}</p>
        </div>
        <div className="fate-complete-book" aria-hidden="true"><FateEmblem className="fate-complete-book-emblem" /><span>THE FATE KEY</span><strong>Complete<br />Life Reading</strong><small>YOUR STORY HOLDS THE KEY</small></div>
      </header>
      <section className="fate-complete-section"><h2>{t('complete.inside')}</h2><p>{t('complete.insideText')}</p><ol className="fate-complete-chapter-list">{['personality', 'career', 'money', 'love', 'social', 'balance', 'patterns', 'timeline', 'action'].map((key, i) => <li key={key}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{t(`complete.chapter.${key}.title`)}</h3><p>{t(`complete.chapter.${key}.text`)}</p></div></li>)}</ol></section>
      <section className="fate-complete-section"><h2>{t('complete.compare')}</h2><div className="fate-complete-table-wrap"><table className="fate-complete-comparison"><thead><tr><th scope="col">{t('complete.compare.feature')}</th><th scope="col">{t('complete.compare.free')}</th><th scope="col">{t('complete.title')}</th></tr></thead><tbody>{['personality', 'evidence', 'work', 'love', 'money', 'timeline', 'action'].map(key => <tr key={key}><th scope="row">{t(`complete.compare.${key}.label`)}</th><td>{t(`complete.compare.${key}.free`)}</td><td>{t(`complete.compare.${key}.full`)}</td></tr>)}</tbody></table></div><p className="fate-reading-small-note">{t('complete.compare.note')}</p></section>
      <section className="fate-complete-section fate-complete-expectations"><h2>{t('complete.expectations.title')}</h2><p>{t('complete.expectations.text')}</p><details><summary>{t('complete.expectations.scopeTitle')}</summary><p>{t('complete.expectations.scope')}</p></details></section>
      <section className="fate-complete-section fate-complete-bottom"><h2>{t('complete.bottom.title')}</h2><p>{t('complete.bottom.text')}</p><button type="button" onClick={onViewSample} className="fate-complete-primary">{t('complete.sample')}</button><p className="fate-reading-small-note">{t('complete.status')}</p></section>
    </article>
  )
}
