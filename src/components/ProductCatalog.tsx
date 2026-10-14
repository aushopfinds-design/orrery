import { useLocale } from '../i18n/index.ts'

// Prices are proposals. Paid reports do not expose a checkout.
const products = [
  { key: 'free', price: 'free', image: 'personality', href: '#birth-details' },
  { key: 'complete', price: 'US$14.99', image: 'timeline', href: '#complete-life-reading' },
  { key: 'compatibility', price: 'US$9.99', image: 'relationships', href: '#love-compatibility' },
  { key: 'year', price: 'US$7.99', image: 'year-ahead', href: '#year-ahead' },
  { key: 'career', price: 'US$8.99', image: 'career', href: '#career-money' },
  { key: 'business', price: 'tbd', image: 'business', href: '#business-reading' },
  { key: 'wellbeing', price: 'tbd', image: 'wellbeing', href: '#everyday-balance' },
  { key: 'bundle', price: 'US$24.99', image: 'compatibility', href: '#complete-bundle' },
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
        {products.map(({ key, price, image, href }) => (
          <article key={key} className="fate-product-card">
            <img src={`/images/${image}.jpg`} alt="" loading="lazy" width="800" height="420" />
            <div className="fate-product-content">
              <h3>{t(`home.products.${key}.title`)}</h3>
              <p className="fate-product-price">{price === 'free' ? t('home.products.free.price') : price === 'tbd' ? t('home.products.tbd.price') : price}</p>
              <p>{t(`home.products.${key}.text`)}</p>
              <a href={href} className="fate-product-action">{t(key === 'free' ? 'home.products.start' : 'home.products.complete.action')} <span aria-hidden="true">→</span></a>
            </div>
          </article>
        ))}
      </div>
      <p className="fate-product-note">{t('home.products.note')}</p>
    </section>
  )
}
