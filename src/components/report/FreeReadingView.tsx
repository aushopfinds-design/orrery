import { useEffect, useMemo } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import { buildFreeReading } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'
import ElementBalance from './ElementBalance.tsx'

export default function FreeReadingView({ input }: { input: BirthInput }) {
  const { t } = useLocale()
  const report = useMemo(() => buildFreeReading(calculateSaju(input)), [input])
  useEffect(() => { document.getElementById('free-reading')?.scrollIntoView({ block: 'start' }) }, [])
  return (
    <article id="free-reading" lang="en" aria-label={t('reading.free.title')} className="fate-free-reading printable-reading">
      <header className="fate-reading-cover fate-reading-cover-free">
        <p className="fate-eyebrow">{t('reading.free.eyebrow')}</p>
        <h1>{report.title}</h1>
        <p>{report.birthSummary}</p>
      </header>
      {report.timeUnknown && <p role="status" className="fate-reading-time-note">{t('reading.timeUnknown')}</p>}
      <section className="fate-reading-chapter">
        <p className="fate-eyebrow">{t('reading.free.personality')}</p>
        <h2>{report.headline}</h2>
        {report.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <details className="fate-reading-evidence"><summary>{t('reading.chartSource')}</summary><ul>{report.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details>
      </section>
      <section className="fate-reading-chapter">
        <h2>{t('reading.free.work')}</h2><p>{report.workNote}</p>
        <div className="fate-reading-practice"><strong>{t('reading.tryThis')}</strong><p>{report.tryThis}</p></div>
      </section>
      <section className="fate-reading-chapter"><h2>{t('reading.free.elements')}</h2><ElementBalance elements={report.elements} visibleMarkers={report.visibleMarkers} /></section>
      <section className="fate-free-upgrade print:hidden" aria-labelledby="free-upgrade-heading">
        <p className="fate-eyebrow">{t('reading.upgrade.eyebrow')}</p><h2 id="free-upgrade-heading">{t('reading.upgrade.title')}</h2>
        <p>{t('reading.upgrade.text')}</p>
        <ul>{['work', 'love', 'money', 'timeline'].map(key => <li key={key}>{t(`reading.upgrade.${key}`)}</li>)}</ul>
        <a className="fate-product-action" href="#complete-life-reading">{t('reading.upgrade.action')} <span aria-hidden="true">→</span></a>
        <p className="fate-reading-small-note">{t('reading.upgrade.status')}</p>
      </section>
      <footer className="fate-reading-small-note"><p>{t('reading.footer.note')}</p><button type="button" className="fate-outline-button print:hidden" onClick={() => window.print()}>{t('reading.free.print')}</button></footer>
    </article>
  )
}
