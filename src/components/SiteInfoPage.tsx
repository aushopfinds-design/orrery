import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/index.ts'
import { HomeFAQ } from './HomeOverview.tsx'
import FateKeyMark from './report/FateKeyMark.tsx'
import ReportIcon from './report/ReportIcon.tsx'
import { PREVIEW_KINDS, previewHash, previewProduct } from '../report/personal-products.ts'
import { clearReadingData, readingDataSummary } from '../utils/reading-data.ts'

type InfoPage = 'help' | 'guide' | 'privacy'
export default function SiteInfoPage({ page, hash, onDataCleared, onOpenSaved }: { page: InfoPage; hash: string; onDataCleared: () => void; onOpenSaved: () => void }) {
  const { t } = useLocale()
  const [clearStage, setClearStage] = useState<'idle' | 'confirm' | 'done' | 'error'>('idle')
  const summary = page === 'privacy' ? readingDataSummary() : { rememberedBirth: false, tabPreview: false, saved: 0 }
  const id = page === 'guide' ? 'reading-guide' : page === 'privacy' ? 'your-data' : 'help'
  useEffect(() => { (document.getElementById(hash.slice(1)) ?? document.getElementById(id))?.scrollIntoView({ block: 'start' }) }, [hash, id])
  function clearData() {
    const success = clearReadingData()
    onDataCleared()
    setClearStage(success ? 'done' : 'error')
  }
  return <article id={id} className="fate-info-page" lang="en" aria-labelledby="site-info-title">
    <a href="#home" className="fate-product-back">← {t('site.backHome')}</a>
    <header className="fate-info-heading"><FateKeyMark /><p className="fate-eyebrow">{t('site.' + page + '.eyebrow')}</p><h1 id="site-info-title">{t('site.' + page + '.title')}</h1><p>{t('site.' + page + '.intro')}</p></header>
    <nav className="fate-info-nav" aria-label={t('site.infoNav')}><a href="#help" aria-current={page === 'help' ? 'page' : undefined}>{t('site.help.title')}</a><a href="#reading-guide" aria-current={page === 'guide' ? 'page' : undefined}>{t('site.guide.title')}</a><a href="#your-data" aria-current={page === 'privacy' ? 'page' : undefined}>{t('site.privacy.title')}</a></nav>
    {page === 'help' && <>
      <section className="fate-help-options">{[
        ['start', 'personality', '#reading-guide-details'], ['choose', 'patterns', '#reading-guide-reports'],
        ['save', 'timeline', '#reading-guide-save'], ['data', 'support', '#your-data'],
      ].map(([key, icon, href]) => <a href={href} key={key}><ReportIcon kind={icon} /><h2>{t('site.help.' + key + '.title')}</h2><p>{t('site.help.' + key + '.text')}</p><span>{t('site.help.open')} →</span></a>)}</section>
      <section className="fate-info-status"><strong>{t('site.status.title')}</strong><p>{t('site.status.text')}</p><a href="#my-report" className="fate-outline-button">{t('buyer.preview.cta')}</a></section>
      <HomeFAQ id="help-faq" />
    </>}
    {page === 'guide' && <>
      <section id="reading-guide-details" className="fate-info-section"><p className="fate-eyebrow">01</p><h2>{t('site.guide.details.title')}</h2><ol className="fate-guide-steps">{['date', 'time', 'place', 'check'].map((key, index) => <li key={key}><span>{index + 1}</span><div><h3>{t('site.guide.' + key + '.title')}</h3><p>{t('site.guide.' + key + '.text')}</p></div></li>)}</ol><a href="#birth-details" className="fate-complete-primary">{t('home.form.title')}</a></section>
      <section id="reading-guide-reports" className="fate-info-section"><p className="fate-eyebrow">02</p><h2>{t('site.guide.reports.title')}</h2><p>{t('site.guide.reports.text')}</p><div className="fate-guide-reports">{PREVIEW_KINDS.map(kind => {
        const product = previewProduct(kind)
        return <section key={kind}><div className="fate-guide-report-mark"><ReportIcon kind={product.icon} /><span>{t(kind === 'compatibility' || kind === 'bundle' ? 'site.guide.twoPeople' : 'site.guide.onePerson')}</span></div><h3>{product.title}</h3><p>{t('site.report.' + kind)}</p><small>{product.chapters} {t(kind === 'bundle' ? 'site.guide.reportsUnit' : 'site.guide.chaptersUnit')}{kind === 'year' ? ' · ' + t('site.guide.monthsUnit') : ''}</small><div><a href={previewHash(kind)}>{t('buyer.preview.cta')} →</a><a href={product.sample}>{t('buyer.guide.sample')}</a></div></section>
      })}</div></section>
      <section className="fate-info-section"><p className="fate-eyebrow">03</p><h2>{t('site.guide.read.title')}</h2><div className="fate-guide-reading-tips">{['bold', 'habits', 'chart'].map(key => <div key={key}><h3>{t('site.guide.' + key + '.title')}</h3><p>{t('site.guide.' + key + '.text')}</p></div>)}</div></section>
      <section id="reading-guide-save" className="fate-info-section"><p className="fate-eyebrow">04</p><h2>{t('site.guide.save.title')}</h2><p>{t('site.guide.save.text')}</p><p>{t('site.guide.print.text')}</p><div className="fate-info-actions"><button type="button" onClick={onOpenSaved} className="fate-outline-button">{t('site.saved.title')}</button><a href="#sample-report" className="fate-outline-button">{t('buyer.guide.sample')}</a></div></section>
    </>}
    {page === 'privacy' && <>
      <section className="fate-info-section"><h2>{t('site.privacy.calc.title')}</h2><p>{t('site.privacy.calc.text')}</p><div className="fate-data-summary">{[
        ['birth', summary.rememberedBirth ? t('site.data.remembered') : t('site.data.none')],
        ['preview', summary.tabPreview ? t('site.data.remembered') : t('site.data.none')],
        ['saved', String(summary.saved)],
      ].map(([key, value]) => <div key={key}><span>{t('site.data.' + key)}</span><strong>{value}</strong></div>)}</div></section>
      <section className="fate-info-section"><h2>{t('site.privacy.storage.title')}</h2><p>{t('site.privacy.storage.text')}</p><p>{t('site.privacy.backup.text')}</p><button type="button" className="fate-outline-button" onClick={onOpenSaved}>{t('site.saved.title')}</button></section>
      <section className="fate-info-section"><h2>{t('site.privacy.search.title')}</h2><p>{t('site.privacy.search.text')}</p><p>{t('site.privacy.connections.text')}</p></section>
      <section className="fate-info-section"><h2>{t('site.privacy.purchase.title')}</h2><p>{t('site.privacy.purchase.text')}</p></section>
      <section className="fate-clear-data"><h2>{t('site.privacy.clear.title')}</h2><p>{t('site.privacy.clear.text')}</p><p className="fate-reading-small-note">{t('site.privacy.tabs.text')}</p>
        {clearStage === 'confirm' ? <div className="fate-clear-confirm"><strong>{t('site.privacy.confirm.title')}</strong><p>{t('site.privacy.confirm.text')}</p><div className="fate-info-actions"><button type="button" className="fate-clear-confirm-button" onClick={clearData}>{t('site.privacy.confirm.button')}</button><button type="button" className="fate-outline-button" onClick={() => setClearStage('idle')}>{t('profile.cancel')}</button></div></div>
          : <button type="button" className="fate-outline-button" onClick={() => setClearStage('confirm')}>{t('site.privacy.clear.button')}</button>}
        {clearStage === 'done' && <p role="status">{t('site.privacy.clear.done')}</p>}
        {clearStage === 'error' && <p role="alert">{t('site.privacy.clear.error')}</p>}
      </section>
    </>}
    <footer className="fate-info-footer"><FateKeyMark /><p>{t('reading.footer.note')}</p><a href="#birth-details">{t('home.form.title')} →</a></footer>
  </article>
}
