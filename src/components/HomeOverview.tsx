import { useLocale } from '../i18n/index.ts'

interface Props {
  onViewSample: () => void
}

const discoveries = [
  { key: 'personality', symbol: '✦', image: 'complete', href: '#sample-report-personality' },
  { key: 'relationships', symbol: '♡', image: 'compatibility', href: '#sample-report-love' },
  { key: 'compatibility', symbol: '♥', image: 'compatibility', href: '#love-compatibility-sample' },
  { key: 'money', symbol: '◈', image: 'career', href: '#career-money-sample-money-commitments' },
  { key: 'career', symbol: '◇', image: 'career', href: '#career-money-sample' },
  { key: 'business', symbol: '♧', image: 'business', href: '#business-reading-sample' },
  { key: 'wellbeing', symbol: '☼', image: 'wellbeing', href: '#everyday-balance-sample' },
  { key: 'timeline', symbol: '↗', image: 'complete', href: '#sample-report-timeline' },
  { key: 'yearAhead', symbol: '◷', image: 'year', href: '#year-ahead-sample' },
] as const

export function FateEmblem({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="62 6 105 108" aria-hidden="true">
      <image href="/images/fate-key-approved-hero.webp" width="1606" height="979" />
    </svg>
  )
}

export function HomeBenefits() {
  const { t } = useLocale()
  return (
    <section className="fate-benefits" aria-label={t('home.benefits.label')}>
      {[
        ['✦', 'wisdom'], ['◇', 'personal'], ['◎', 'english'], ['⌑', 'private'],
      ].map(([symbol, key]) => (
        <div key={key}>
          <span className="fate-benefit-icon" aria-hidden="true">{symbol}</span>
          <h2>{t(`home.benefits.${key}.title`)}</h2>
          <p>{t(`home.benefits.${key}.text`)}</p>
        </div>
      ))}
    </section>
  )
}

export default function HomeOverview({ onViewSample }: Props) {
  const { t } = useLocale()
  return (
    <>
      <section id="discover" className="fate-section" aria-labelledby="discover-heading">
        <div className="fate-section-heading">
          <p className="fate-eyebrow">{t('home.discover.eyebrow')}</p>
          <h2 id="discover-heading">{t('home.discover.title')}</h2>
          <p>{t('home.discover.text')}</p>
        </div>
        <details className="fate-discovery-details"><summary>{t('buyer.discovery.open')}</summary><div className="fate-discovery-grid">
          {discoveries.map(({ key, symbol, image, href }) => (
            <a key={key} href={href} className="fate-discovery-card">
              <div className="fate-discovery-image">
                <img src={`/images/reports/${image}-v1-640.webp`} alt="" loading="lazy" width="640" height="427" />
                <span aria-hidden="true">{symbol}</span>
              </div>
              <div className="fate-discovery-content">
                <h3>{t(`home.discovery.${key}.title`)}</h3>
                <p>{t(`home.discovery.${key}.text`)}</p>
                <span className="fate-card-link">{t('home.discovery.action')} <span aria-hidden="true">→</span></span>
              </div>
            </a>
          ))}
        </div></details>
      </section>

      <section className="fate-sample-section" aria-label={t('home.sample.title')}>
        <div className="fate-sample-card">
          <div className="fate-sample-copy">
            <p className="fate-eyebrow">{t('home.sample.eyebrow')}</p>
            <h2>{t('home.sample.title')}</h2>
            <p>{t('home.sample.text')}</p>
            <button type="button" onClick={onViewSample} className="fate-outline-button">{t('home.sample.action')} <span aria-hidden="true">→</span></button>
          </div>
          <div className="fate-report-preview" aria-hidden="true">
            <div className="fate-preview-page fate-preview-page-back"><span>YOUR LIFE CHAPTERS</span><div className="fate-preview-timeline"><i /><i /><i /><i /></div><div className="fate-preview-lines"><i /><i /><i /></div></div>
            <div className="fate-preview-page fate-preview-page-front"><FateEmblem className="fate-preview-emblem" /><span>THE FATE KEY</span><strong>Your Personal<br />Life Reading</strong><div className="fate-preview-lines"><i /><i /><i /></div><small>YOUR STORY HOLDS THE KEY</small></div>
          </div>
        </div>
        <div className="fate-about-card" id="about">
          <p className="fate-eyebrow">{t('home.about.eyebrow')}</p>
          <h2>{t('home.about.title')}</h2>
          <p>{t('home.about.text')}</p>
          <a href="/about/" className="fate-outline-button">{t('site.public.about')} →</a>
          <ol className="fate-how-steps">
            {['details', 'chart', 'reading'].map((key, i) => <li key={key}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{t(`home.how.${key}.title`)}</h3><p>{t(`home.how.${key}.text`)}</p></div></li>)}
          </ol>
        </div>
      </section>
    </>
  )
}

export function HomeFAQ({ id = 'faq' }: { id?: string }) {
  const { t } = useLocale()
  return (
    <section id={id} className="fate-section fate-faq" aria-labelledby={id + '-heading'}>
      <div className="fate-section-heading"><p className="fate-eyebrow">{t('home.faq.eyebrow')}</p><h2 id={id + '-heading'}>{t('home.faq.title')}</h2></div>
      {['saju', 'time', 'location', 'free', 'payment', 'delivery', 'privacy'].map(key => <details key={key}><summary>{t(`home.faq.${key}.question`)}</summary><p>{t(`home.faq.${key}.answer`)}</p></details>)}
      <a href="#help" className="fate-outline-button fate-help-link">{t('site.help.cta')}</a>
    </section>
  )
}
