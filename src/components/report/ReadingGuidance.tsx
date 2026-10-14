import type { ReadingGuidance as Guidance } from '../../report/reading-profiles.ts'
import { useLocale } from '../../i18n/index.ts'
import ReadingText from './ReadingText.tsx'

export default function ReadingGuidance({ guidance, headingLevel = 'h3' }: { guidance: Guidance; headingLevel?: 'h3' | 'h4' }) {
  const { t } = useLocale()
  const Heading = headingLevel
  return (
    <div className="fate-reading-guidance" role="group" aria-label={t('reading.guidance.label')}>
      <section className="fate-reading-guidance-helpful" aria-label={t('reading.guidance.keepClose')}>
        <Heading>{t('reading.guidance.keepClose')}</Heading>
        <ul>{guidance.keepClose.map(item => <li key={item}><ReadingText text={item} /></li>)}</ul>
      </section>
      <section className="fate-reading-guidance-caution" aria-label={t('reading.guidance.watchFor')}>
        <Heading>{t('reading.guidance.watchFor')}</Heading>
        <ul>{guidance.watchFor.map(item => <li key={item}><ReadingText text={item} /></li>)}</ul>
      </section>
    </div>
  )
}
