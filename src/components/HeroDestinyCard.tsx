import { useLocale } from '../i18n/index.ts'
import DestinyCardPreview from './report/DestinyCardPreview.tsx'
import { buildDestinyCard } from '../report/destiny-card.ts'

const heroSampleCard = buildDestinyCard({ year:1992, month:8, day:17, hour:0, minute:0, unknownTime:true, gender:'M', timezone:'Australia/Sydney', latitude:-33.8688, longitude:151.2093 }, 'Design Sample')

export default function HeroDestinyCard() {
  const { t } = useLocale()
  return <aside id="destiny-card" className="fate-hero-destiny" aria-labelledby="hero-destiny-heading">
    <div className="fate-hero-destiny-art"><DestinyCardPreview card={heroSampleCard} /></div>
    <div className="fate-hero-destiny-copy"><p className="fate-eyebrow">{t('entry.card.eyebrow')}</p><h2 id="hero-destiny-heading">{t('entry.card.title')}</h2><p>{t('entry.card.personal')}</p><p>{t('entry.card.text')}</p><a href="#card-studio">{t('entry.card.explore')} <span aria-hidden="true">↗</span></a><small>{t('entry.card.sample')}</small></div>
    <details className="fate-hero-destiny-details"><summary>{t('entry.card.includes')}</summary><div>{['single', 'pair', 'free'].map(key => <p key={key}><strong>{t(`destiny.policy.${key}.title`)}</strong><span>{t(`destiny.policy.${key}.text`)}</span></p>)}<p>{t('destiny.home.availability')}</p></div></details>
  </aside>
}
