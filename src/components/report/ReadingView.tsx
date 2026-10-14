import { useEffect, useMemo, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import CopyButton from '../CopyButton.tsx'
import { buildCompleteReading } from '../../report/complete-reading.ts'
import type { ReportChapter } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'
import ElementBalance from './ElementBalance.tsx'
import { FateEmblem } from '../HomeOverview.tsx'

function Chapter({ chapter }: { chapter: ReportChapter }) {
  const { t } = useLocale()
  return (
    <section id={`sample-report-${chapter.id}`} className="fate-reading-chapter">
      <h2>{chapter.title}</h2><p className="fate-reading-lead">{chapter.lead}</p>
      {chapter.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <details className="fate-reading-evidence"><summary>{t('reading.chartSource')}</summary><ul>{chapter.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details>
      <p className="hidden print:block fate-reading-print-evidence"><strong>{t('reading.chartSource')}</strong> {chapter.evidence.join(' ')}</p>
      <div className="fate-reading-practice"><strong>{t('reading.tryThis')}</strong><p>{chapter.tryThis}</p></div>
    </section>
  )
}

/** A public sample, never an order confirmation or a client-side paid unlock. */
export default function ReadingView({ input }: { input: BirthInput }) {
  const { t } = useLocale()
  const report = useMemo(() => buildCompleteReading(calculateSaju(input)), [input])
  const [showPrintHelp, setShowPrintHelp] = useState(false)
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1))
    target?.scrollIntoView({ block: 'start' })
  }, [])
  return (
    <article id="sample-report" lang="en" aria-label={t('reading.complete.sampleTitle')} className="fate-complete-reading printable-reading">
      <div className="fate-sample-toolbar print:hidden"><a href="#complete-life-reading">← {t('complete.title')}</a><span>{t('reading.complete.sampleBadge')}</span></div>
      <header className="fate-reading-cover fate-reading-cover-complete">
        <FateEmblem className="fate-reading-cover-emblem" />
        <p className="fate-eyebrow">THE FATE KEY</p><h1>{report.title}</h1>
        <p className="fate-reading-cover-tagline">{report.headline}</p><p>{report.birthSummary}</p>
        <p className="fate-reading-small-note">{t('reading.complete.sampleNote')}</p>
      </header>
      <div className="fate-reading-controls print:hidden"><CopyButton label={t('reading.complete.copy')} getText={() => `${t('reading.complete.sampleNote')}\n\n${report.fullText}`} /><button type="button" className="fate-complete-primary" onClick={() => { setShowPrintHelp(true); window.print() }}>{t('reading.complete.print')}</button>{showPrintHelp && <p role="status">{t('reading.printHelp')}</p>}</div>
      {input.unknownTime && <p role="status" className="fate-reading-time-note">{t('reading.timeUnknown')}</p>}
      <section className="fate-reading-summary" aria-label={t('reading.complete.summary')}>
        {report.summary.map(item => <div key={item.label}><h2>{item.label}</h2><p>{item.text}</p></div>)}
      </section>
      <nav className="fate-reading-toc print:hidden" aria-label={t('reading.complete.contents')}>
        {[...report.chapters.map(chapter => ({ id: chapter.id, title: chapter.title })), { id: 'timeline', title: t('reading.complete.timeline') }, { id: report.actionPlan.id, title: report.actionPlan.title }].map(item => <a key={item.id} href={`#sample-report-${item.id}`}>{item.title}</a>)}
      </nav>
      {report.chapters.map(chapter => <div key={chapter.id}><Chapter chapter={chapter} />{chapter.id === 'balance' && <section className="fate-reading-chapter fate-reading-element-detail"><ElementBalance elements={report.elements} visibleMarkers={report.visibleMarkers} /></section>}</div>)}
      <section id="sample-report-timeline" className="fate-reading-chapter">
        <h2>{t('reading.complete.timeline')}</h2><p>{t('reading.complete.timelineNote')}</p>
        {report.periods.length ? report.periods.map(period => <div key={period.period} className="fate-reading-period"><p className="fate-eyebrow">{period.period} · {period.pillar}</p><h3>{period.headline}</h3><p>{period.text}</p></div>) : <p>{t('reading.complete.noPeriods')}</p>}
      </section>
      <Chapter chapter={report.actionPlan} />
      <section className="fate-reading-chapter fate-reading-method print:hidden"><h2>{t('reading.method.title')}</h2><p>{t('reading.method.intro')}</p><details><summary>{t('reading.method.details')}</summary><p>{report.pillarSummary.join(' · ')}</p><ul>{report.methodNotes.map(note => <li key={note}>{note}</li>)}</ul></details></section>
      <section className="fate-reading-chapter hidden print:block"><h2>{t('reading.method.title')}</h2><p>{report.pillarSummary.join(' · ')}</p><ul>{report.methodNotes.map(note => <li key={note}>{note}</li>)}</ul></section>
      <footer className="fate-reading-small-note"><p>{t('reading.footer.note')}</p><p>{t('reading.complete.sampleNote')}</p><a href="#complete-life-reading" className="fate-outline-button print:hidden">{t('reading.complete.back')}</a></footer>
    </article>
  )
}
