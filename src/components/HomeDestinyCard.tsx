import { useLocale } from '../i18n/index.ts'
import DestinyCardVideo from './DestinyCardVideo.tsx'

export default function HomeDestinyCard() {
  const { t } = useLocale()
  return <section id="destiny-card" className="fate-destiny-feature fate-section" aria-labelledby="destiny-feature-title">
    <div className="fate-destiny-feature-copy">
      <p className="fate-eyebrow">{t('destiny.home.eyebrow')}</p>
      <h2 id="destiny-feature-title">{t('destiny.home.title')}<br /><em>{t('destiny.home.highlight')}</em></h2>
      <p className="fate-destiny-intro">{t('destiny.home.text')}</p>
      <p className="fate-destiny-included"><span aria-hidden="true">✦</span>{t('destiny.included.launch')}</p>
      <ul className="fate-destiny-features">{['identity', 'symbols', 'sharing'].map(key => <li key={key}><span aria-hidden="true">✧</span><strong>{t(`destiny.feature.${key}.title`)}</strong></li>)}</ul>
      <div className="fate-destiny-actions"><a href="#card-studio" className="fate-complete-primary">{t('destiny.home.explore')} <span aria-hidden="true">↗</span></a><a href="#birth-details" className="fate-destiny-text-link">{t('destiny.home.start')} →</a></div>
      <p className="fate-destiny-small">{t('destiny.home.availability')}</p>
    </div>
    <figure className="fate-destiny-stage"><span className="fate-destiny-orbit" aria-hidden="true" /><div className="fate-destiny-stage-card"><DestinyCardVideo /></div><figcaption><strong>{t('destiny.home.caption')}</strong><span>{t('destiny.home.sample')}</span></figcaption></figure>
    <div className="fate-destiny-policy"><div><strong>{t('destiny.policy.single.title')}</strong><span>{t('destiny.policy.single.text')}</span></div><div><strong>{t('destiny.policy.pair.title')}</strong><span>{t('destiny.policy.pair.text')}</span></div><div><strong>{t('destiny.policy.free.title')}</strong><span>{t('destiny.policy.free.text')}</span></div></div>
  </section>
}
