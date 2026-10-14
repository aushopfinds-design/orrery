import { useLocale } from '../i18n/index.ts'
import { previewHash, previewProduct } from '../report/personal-products.ts'
import ReportIcon from './report/ReportIcon.tsx'
import FateKeyMark from './report/FateKeyMark.tsx'

export default function ProductCatalog() {
  const { t } = useLocale()
  return <section id="reports" className="fate-section fate-purpose-reports" aria-labelledby="reports-heading">
    <div className="fate-section-heading"><p className="fate-eyebrow">{t('buyer.focus.eyebrow')}</p><h2 id="reports-heading">{t('buyer.focus.title')}</h2><p>{t('buyer.focus.text')}</p></div>
    <div className="fate-focused-product-grid">{(['compatibility', 'career', 'year'] as const).map(kind => {
      const product = previewProduct(kind)
      return <article key={kind} className="fate-product-card fate-focus-product" aria-label={product.title}><div className="fate-focus-product-art"><FateKeyMark /><span>THE FATE KEY</span><ReportIcon kind={product.icon} /><strong>{product.title}</strong></div><div className="fate-product-content"><p className="fate-eyebrow">{t(`buyer.focus.${kind}.question`)}</p><h3>{product.title}</h3><p>{t(`buyer.focus.${kind}.text`)}</p><p className="fate-product-price">{product.price}<small>{t('buyer.price.short')}</small></p><a href={previewHash(kind)} className="fate-product-action">{t('buyer.preview.cta')} <span aria-hidden="true">→</span></a><a href={product.sample} className="fate-buyer-sample-link">{t('buyer.guide.sample')}</a></div></article>
    })}</div>
    <aside className="fate-bundle-offer"><FateKeyMark /><div><p className="fate-eyebrow">{t('buyer.bundle.eyebrow')}</p><h3>{t('category.bundle.title')}</h3><p>{t('buyer.bundle.text')}</p><span>{t('buyer.bundle.saving')}</span></div><div><strong>US$24.99</strong><span>{t('buyer.price.short')}</span><a href="#my-report-bundle" className="fate-complete-primary">{t('buyer.bundle.cta')}</a><a href="#complete-bundle-sample" className="fate-buyer-sample-link">{t('buyer.guide.sample')}</a></div></aside>
    <details className="fate-more-reports"><summary>{t('buyer.more.title')}</summary><div className="fate-more-report-grid">{(['business', 'wellbeing'] as const).map(kind => <article key={kind}><ReportIcon kind={previewProduct(kind).icon} /><h3>{previewProduct(kind).title}</h3><p>{t(`home.products.${kind}.text`)}</p><p>{t('home.products.tbd.price')}</p><a href={previewHash(kind)} className="fate-outline-button">{t('buyer.preview.cta')}</a><a href={previewProduct(kind).sample} className="fate-buyer-sample-link">{t('buyer.guide.sample')}</a></article>)}</div></details>
    <p className="fate-product-note">{t('buyer.checkout.pending')} {t('buyer.price.note')}</p>
  </section>
}
