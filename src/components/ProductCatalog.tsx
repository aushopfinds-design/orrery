import { useLocale } from '../i18n/index.ts'

// Prices are proposals. Paid reports do not expose a checkout.
const products = [
  { key: 'free', price: 'free', image: 'personality', ready: true },
  { key: 'complete', price: 'US$14.99', image: 'timeline', ready: false },
  { key: 'compatibility', price: 'US$9.99', image: 'relationships', ready: false },
  { key: 'year', price: 'US$7.99', image: 'year-ahead', ready: false },
  { key: 'career', price: 'US$8.99', image: 'career', ready: false },
  { key: 'business', price: 'tbd', image: 'business', ready: false },
  { key: 'bundle', price: 'US$24.99', image: 'wellbeing', ready: false },
] as const

export default function ProductCatalog() {
  const { t } = useLocale()
  return (
    <section id="reports" className="fate-section" aria-labelledby="reports-heading">
      <div className="fate-section-heading">
        <p className="fate-eyebrow">{t('home.products.eyebrow')}</p>
        <h2 id="reports-heading">{t('home.products.title')}</h2>
        <p>{t('home.products.text')}</p>
      </div>
      <div className="fate-product-grid">
        {products.map(({ key, price, image, ready }) => (
          <article key={key} className="fate-product-card">
            <img src={`/images/${image}.jpg`} alt="" loading="lazy" width="800" height="420" />
            <div className="fate-product-content">
              <h3>{t(`home.products.${key}.title`)}</h3>
              <p className="fate-product-price">{price === 'free' ? t('home.products.free.price') : price === 'tbd' ? t('home.products.tbd.price') : price}</p>
              <p>{t(`home.products.${key}.text`)}</p>
              {key === 'complete' ? <a href="#complete-life-reading" className="fate-product-action">{t('home.products.complete.action')} <span aria-hidden="true">→</span></a> : ready ? <a href="#birth-details" className="fate-product-action">{t('home.products.start')} <span aria-hidden="true">→</span></a> : <span className="fate-product-action fate-product-action-soon">{t('home.products.soon')}</span>}
            </div>
          </article>
        ))}
      </div>
      <p className="fate-product-note">{t('home.products.note')}</p>
    </section>
  )
}
