import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/index.ts'
import { PREVIEW_KINDS, previewHash, previewProduct } from '../report/personal-products.ts'
import type { PreviewKind } from '../report/personal-products.ts'
import ReportIcon from './report/ReportIcon.tsx'
import ReportArtwork from './report/ReportArtwork.tsx'
import ReportPrice from './report/ReportPrice.tsx'
import { bundleSavings, reportPrice } from '../report/pricing.ts'
import ReportFinder from './ReportFinder.tsx'
import { destinyCardCount } from '../report/destiny-card.ts'

// Lead with a focused question at a lower proposed price. Keep every other option visible.
const STARTING_REPORTS: PreviewKind[] = ['year', 'career', 'compatibility']
const CATALOG_KINDS = [...STARTING_REPORTS, ...PREVIEW_KINDS.filter(kind => !STARTING_REPORTS.includes(kind))]

export default function ProductCatalog() {
  const { t } = useLocale()
  const savings = bundleSavings()
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [manualMotion, setManualMotion] = useState<boolean | null>(null)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const motionEnabled = manualMotion ?? !reducedMotion

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    const updateVisibility = () => setPageVisible(!document.hidden)
    preference.addEventListener('change', updatePreference)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      preference.removeEventListener('change', updatePreference)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  return <section id="reports" className="fate-section fate-purpose-reports" aria-labelledby="reports-heading">
    <div id="focused-reports" className="fate-section-heading"><p className="fate-eyebrow">{t('buyer.focus.eyebrow')}</p><h2 id="reports-heading">{t('buyer.focus.title')}</h2><span className="fate-catalog-count">{t('buyer.catalog.count')}</span><p>{t('buyer.focus.text')}</p></div>
    <div className="fate-launch-offer"><div><p className="fate-eyebrow">{t('buyer.price.collection')}</p><strong>{t('buyer.price.from').replace('{price}', reportPrice('wellbeing'))}</strong><span>{t('buyer.price.note')}</span></div><a href={previewHash('bundle')}><strong>{t('buyer.price.bundleOffer').replace('{percent}', String(savings.percent))}</strong><span>{t('buyer.price.bundleCompare').replace('{bundle}', reportPrice('bundle')).replace('{separate}', savings.separatePrice)}</span><small>{t('buyer.bundle.cta')} →</small></a></div>
    <a className="fate-catalog-card-included" href="#destiny-card"><span aria-hidden="true">✦</span><strong>{t('destiny.included.launch')}</strong><span>{t('destiny.catalog.text')} ↗</span></a>
    <nav className="fate-catalog-shortcuts" aria-label={t('buyer.catalog.quick')}><p>{t('buyer.catalog.quick')}<small>{t('buyer.price.short')}</small></p><div>{CATALOG_KINDS.map(kind => {
      const product = previewProduct(kind)
      return <a href={previewHash(kind)} key={kind}><ReportIcon kind={product.icon} /><span>{product.title}</span><ReportPrice kind={kind} compact /></a>
    })}</div></nav>
    <div className="fate-catalog-art-controls"><button type="button" className="fate-catalog-motion" aria-controls="report-art-gallery" onClick={() => setManualMotion(!motionEnabled)}><svg viewBox="0 0 24 24" aria-hidden="true">{motionEnabled ? <path d="M7 5h4v14H7z M14 5h4v14h-4z" /> : <path d="m8 4 13 8-13 8z" />}</svg>{t(motionEnabled ? 'buyer.catalog.motion.pause' : 'buyer.catalog.motion.play')}</button></div>
    <ReportFinder />
    <div id="report-art-gallery">
    <div className="fate-focused-product-grid">{CATALOG_KINDS.filter(kind => kind !== 'bundle').map(kind => {
      const product = previewProduct(kind)
      return <article key={kind} className="fate-product-card fate-focus-product" aria-label={product.title}><ReportArtwork kind={kind} title={product.title} motionEnabled={motionEnabled && pageVisible} /><div className="fate-product-content">{kind === 'year' && <span className="fate-catalog-entry">{t('buyer.catalog.entry')}</span>}<p className="fate-eyebrow">{t(`buyer.focus.${kind}.question`)}</p><h3>{product.title}</h3><span className="fate-catalog-scope">{product.chapters} {t('site.guide.chaptersUnit')} · {t(kind === 'compatibility' ? 'site.guide.twoPeople' : 'site.guide.onePerson')}</span><p>{t(`buyer.focus.${kind}.text`)}</p><p className="fate-product-card-bonus">✦ {t(destinyCardCount(kind) === 2 ? 'destiny.catalog.two' : 'destiny.catalog.one')}</p><p className="fate-product-price"><ReportPrice kind={kind} /></p><a href={previewHash(kind)} className="fate-product-action">{t('buyer.preview.cta')} <span aria-hidden="true">→</span></a><a href={product.sample} className="fate-buyer-sample-link">{t('buyer.guide.sample')}</a></div></article>
    })}</div>
    <aside className="fate-bundle-offer"><ReportArtwork kind="bundle" title={t('category.bundle.title')} motionEnabled={motionEnabled && pageVisible} /><div className="fate-bundle-copy"><p className="fate-eyebrow">{t('buyer.bundle.eyebrow')}</p><h3>{t('category.bundle.title')}</h3><p>{t('buyer.bundle.text')}</p><p className="fate-product-card-bonus">✦ {t('destiny.catalog.two')}</p><span>{t('buyer.bundle.saving').replace('{amount}', savings.savedAmount)}</span></div><div className="fate-bundle-action"><ReportPrice kind="bundle" /><a href="#my-report-bundle" className="fate-complete-primary">{t('buyer.bundle.cta')}</a><a href="#complete-bundle-sample" className="fate-buyer-sample-link">{t('buyer.guide.sample')}</a></div></aside>
    </div>
    <p className="fate-product-note">{t('buyer.checkout.pending')} {t('buyer.price.note')}</p>
  </section>
}
