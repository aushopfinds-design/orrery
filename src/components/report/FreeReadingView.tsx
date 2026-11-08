import { useEffect, useMemo } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading, buildFreeReading } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'
import ElementBalance from './ElementBalance.tsx'
import ReadingText from './ReadingText.tsx'
import ReadingGuidance from './ReadingGuidance.tsx'
import ReadingJourney from './ReadingJourney.tsx'
import { recordJourney } from '../../utils/journey-events.ts'
import { previewHash } from '../../report/personal-products.ts'
import ReportPrice from './ReportPrice.tsx'

export default function FreeReadingView({ input }: { input: BirthInput }) {
  const { t } = useLocale()
  const { report, relationship } = useMemo(() => {
    const chart = calculateSaju(input)
    return { report: buildFreeReading(chart), relationship: buildCompleteReading(chart).chapters.find(chapter => chapter.id === 'love')! }
  }, [input])
  useEffect(() => { document.getElementById('free-reading')?.scrollIntoView({ block: 'start' }); recordJourney('free_reading_complete') }, [])
  return (
    <article id="free-reading" lang="en" aria-label={t('reading.free.title')} className="fate-free-reading printable-reading">
      <ReadingJourney step={2} />
      <header className="fate-reading-cover fate-reading-cover-free">
        <p className="fate-eyebrow">{t('reading.free.eyebrow')}</p>
        <h1>{report.title}</h1>
        <p>{report.birthSummary}</p>
      </header>
      {report.timeUnknown && <p role="status" className="fate-reading-time-note">{t('reading.timeUnknown')}</p>}
      <section className="fate-reading-chapter">
        <p className="fate-eyebrow">{t('reading.free.personality')}</p>
        <h2>{report.headline}</h2>
        {report.paragraphs.map(paragraph => <p key={paragraph}><ReadingText text={paragraph} /></p>)}
        <ReadingGuidance guidance={report.guidance} />
        <details className="fate-reading-evidence"><summary>{t('reading.chartSource')}</summary><ul>{report.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details>
      </section>
      <section className="fate-reading-chapter">
        <h2>{t('reading.free.work')}</h2><p><ReadingText text={report.workNote} /></p>
        <div className="fate-reading-practice"><strong>{t('reading.tryThis')}</strong><p>{report.tryThis}</p></div>
      </section>
      <section className="fate-reading-chapter fate-free-relationship" aria-labelledby="free-relationship-title">
        <p className="fate-eyebrow">{t('preview.free.eyebrow')}</p>
        <h2 id="free-relationship-title">{t('preview.subject.love')}</h2>
        <p className="fate-reading-lead"><ReadingText text={relationship.lead} /></p>
        <p><ReadingText text={relationship.paragraphs[0]} /></p>
        <p className="fate-reading-small-note">{t('preview.free.note')}</p>
        <details className="fate-reading-evidence"><summary>{t('reading.chartSource')}</summary><ul>{relationship.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details>
      </section>
      <section className="fate-free-upgrade print:hidden" aria-labelledby="free-upgrade-heading">
        <p className="fate-eyebrow">{t('reading.upgrade.eyebrow')}</p><h2 id="free-upgrade-heading">{t('reading.upgrade.title')}</h2>
        <p>{t('reading.upgrade.text')}</p>
        <ul>{['work', 'love', 'money', 'timeline'].map(key => <li key={key}>{t(`reading.upgrade.${key}`)}</li>)}</ul>
        <div className="fate-free-upgrade-actions"><a className="fate-product-action" href="#my-report">{t('buyer.preview.cta')} <span aria-hidden="true">→</span></a><a href="#sample-report" className="fate-outline-button">{t('buyer.guide.sample')}</a></div>
        <p className="fate-reading-small-note">{t('reading.upgrade.status')}</p>
      </section>
      <section className="fate-reading-chapter print:hidden" aria-labelledby="free-next-title">
        <h2 id="free-next-title">{t('buyer.next.question')}</h2><p>{t('buyer.next.intro')}</p>
        <div className="fate-free-question-grid">{(['career', 'compatibility', 'year'] as const).map(kind => <a key={kind} className="fate-outline-button" href={previewHash(kind)} onClick={() => recordJourney('report_selected', kind)}><strong>{t(`buyer.next.${kind}`)}</strong><span>{t(`buyer.choice.${kind}.question`)}</span><ReportPrice kind={kind} /></a>)}</div>
      </section>
      <details className="fate-free-elements"><summary>{t('reading.free.elements')}</summary><section className="fate-reading-chapter"><h2>{t('reading.free.elements')}</h2><ElementBalance elements={report.elements} visibleMarkers={report.visibleMarkers} /></section></details>
      <footer className="fate-reading-small-note"><p>{t('reading.footer.note')}</p><button type="button" className="fate-outline-button print:hidden" onClick={() => window.print()}>{t('reading.free.print')}</button></footer>
    </article>
  )
}
