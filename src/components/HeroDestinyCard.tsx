import { useLocale } from '../i18n/index.ts'
import DestinyCardVideo from './DestinyCardVideo.tsx'

export default function HeroDestinyCard() {
  const { t } = useLocale()
  return <aside className="fate-hero-destiny" aria-labelledby="hero-destiny-heading">
    <div className="fate-hero-destiny-art"><DestinyCardVideo /></div>
    <div className="fate-hero-destiny-copy"><p className="fate-eyebrow">{t('entry.card.eyebrow')}</p><h2 id="hero-destiny-heading">{t('entry.card.title')}</h2><p>{t('entry.card.text')}</p><a href="#card-studio">{t('entry.card.explore')} <span aria-hidden="true">↗</span></a><small>{t('entry.card.sample')}</small></div>
  </aside>
}
