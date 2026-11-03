import { useLocale } from '../i18n/index.ts'
import { LEARNING_GUIDES, learningPath } from '../publishing/guide-catalog.ts'

export default function HomeLearning() {
  const { t } = useLocale()
  return <section className="fate-section fate-learning" lang="en" aria-labelledby="learn-heading">
    <div className="fate-section-heading">
      <p className="fate-eyebrow">{t('site.learn.eyebrow')}</p>
      <h2 id="learn-heading">{t('site.learn.title')}</h2>
      <p>{t('site.learn.text')}</p>
    </div>
    <div className="fate-learning-cards">{LEARNING_GUIDES.slice(0,3).map((guide,i)=><article key={guide.slug}>
      <span className="fate-eyebrow">{String(i+1).padStart(2,'0')} · {guide.category}</span>
      <h3><a href={learningPath(guide.slug)}>{guide.shortTitle}</a></h3>
      <p>{guide.description}</p>
    </article>)}</div>
    <a href="/learn/" className="fate-outline-button">{t('site.learn.all')} →</a>
  </section>
}
