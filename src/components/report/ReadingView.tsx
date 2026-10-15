import { useEffect, useMemo, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import CopyButton from '../CopyButton.tsx'
import { buildCompleteReading, REPORT_EDITION } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'
import ElementBalance from './ElementBalance.tsx'
import { FateEmblem } from '../HomeOverview.tsx'
import ReadingText from './ReadingText.tsx'
import ReadingGuidance from './ReadingGuidance.tsx'
import ChapterHeading from './ChapterHeading.tsx'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import ReportRecord from './ReportRecord.tsx'
import ReportChapterView, { ChartEvidence } from './ReportChapterView.tsx'
import ReportExtrasView from './ReportExtrasView.tsx'

/** A public sample, never an order confirmation or a client-side paid unlock. */
export default function ReadingView({ input, embedded = false, prefix = 'sample-report' }: { input: BirthInput; embedded?: boolean; prefix?: string }) {
  const { t } = useLocale()
  const report = useMemo(() => buildCompleteReading(calculateSaju(input)), [input])
  const contents = [...report.chapters.map(chapter => ({ id: chapter.id, title: chapter.title })), { id: 'timeline', title: t('reading.complete.timeline') }, { id: report.actionPlan.id, title: report.actionPlan.title }]
  const [showPrintHelp, setShowPrintHelp] = useState(false)
  const [preparedOn] = useState(() => new Date().toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }))
  useEffect(() => {
    const target = embedded ? null : document.getElementById(window.location.hash.slice(1))
    target?.scrollIntoView({ block: 'start' })
  }, [embedded])
  return (
    <article id={prefix} lang="en" aria-label={t('reading.complete.sampleTitle')} className={`fate-complete-reading printable-reading${embedded ? ' fate-bundle-child' : ''}`}>
      <div className="fate-sample-toolbar print:hidden"><a href="#complete-life-reading">← {t('complete.title')}</a><span>{t('reading.complete.sampleBadge')}</span></div>
      <header className="fate-reading-cover fate-reading-cover-complete">
        <svg className="fate-report-cover-art" viewBox="815 112 700 680" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="/images/fate-key-approved-hero.webp" width="1606" height="979" /></svg>
        <div className="fate-report-cover-content">
          <div className="fate-report-cover-brand"><FateEmblem className="fate-reading-cover-emblem" /><span>THE FATE KEY<small>{t('reading.design.coverLabel')}</small></span></div>
          <p className="fate-report-edition-label">{t('reading.record.series')}<span>{t('reading.record.edition')} {REPORT_EDITION}</span></p>
          <p className="fate-eyebrow">{t('reading.design.coverEyebrow')}</p><h1>{report.title}</h1>
          <p className="fate-reading-cover-tagline">{report.headline}</p>
          <div className="fate-report-cover-birth"><span>{t('reading.design.preparedFor')}</span><p>{report.birthSummary}</p></div>
          <p className="fate-reading-small-note">{t('reading.complete.sampleNote')}</p>
        </div>
        <div className="fate-report-cover-bottom"><span>{t('reading.design.chapterCount').replace('{n}', String(contents.length))}</span><span>{t('reading.design.english')}</span><span>{t('reading.design.chartNotes')}</span></div>
      </header>
      <div className="fate-reading-controls print:hidden"><CopyButton label={t('reading.complete.copy')} getText={() => `${t('reading.complete.sampleNote')}\n${t('reading.record.preparedOn')}: ${preparedOn}\n\n${report.fullText}`} /><button type="button" className="fate-complete-primary" onClick={() => { setShowPrintHelp(true); window.print() }}>{t('reading.complete.print')}</button>{showPrintHelp && <p role="status">{t('reading.printHelp')}</p>}</div>
      {input.unknownTime && <p role="status" className="fate-reading-time-note">{t('reading.timeUnknown')}</p>}
      <section className="fate-report-overview" aria-label={t('reading.complete.summary')}>
        <div className="fate-report-overview-heading"><p className="fate-eyebrow">{t('reading.complete.summary')}</p><h2>{t('reading.design.overview')}</h2></div>
        <div className="fate-report-chart-strip"><div className="fate-report-day-symbol"><ReportIcon kind="personality" /><span>{t('reading.design.startingSymbol')}</span><strong>{report.dayMaster}</strong></div><div className="fate-report-pillars">{report.pillarSummary.map((pillar, index) => { const [position, value] = pillar.split(': '); return <div key={position} className={index === 2 ? 'fate-report-pillar-day' : ''}><span>{t(`reading.design.pillar.${position.toLowerCase()}`)}</span><strong lang={value === 'Unknown' ? 'en' : 'zh'}>{value}</strong>{index === 2 && <small>{t('reading.design.you')}</small>}</div> })}</div></div>
        <section className="fate-reading-summary" aria-label={t('reading.design.summaryThemes')}>{report.summary.map((item, index) => <div key={item.label}><ReportIcon kind={['personality', 'career', 'love'][index]} /><h3>{item.label}</h3><p>{item.text}</p></div>)}</section>
        <nav className="fate-reading-toc print:hidden" aria-label={t('reading.complete.contents')}>
          {contents.map(item => <a key={item.id} href={`#${prefix}-${item.id}`}><ReportIcon kind={item.id} /><span>{item.title}</span><span aria-hidden="true">↗</span></a>)}
          <a href={`#${prefix}-everyday-compass`}><ReportIcon kind="balance" /><span>{t('reading.extras.title')}</span><span aria-hidden="true">↗</span></a>
        </nav>
      </section>
      <section className="fate-reading-chapter fate-report-connections" aria-label={t('reading.connections.title')}>
        <header className="fate-report-connections-heading"><FateKeyMark /><div><p className="fate-eyebrow">{t('reading.connections.eyebrow')}</p><h2>{t('reading.connections.title')}</h2><p>{t('reading.connections.intro')}</p></div></header>
        <div className="fate-report-connection-cards">{report.connections.map(connection => <section key={connection.id}>
          <div className="fate-report-connection-title"><ReportIcon kind={connection.chapterId} /><h3>{connection.title}</h3></div>
          <p className="fate-report-connection-basis">{connection.basis}</p><p><ReadingText text={connection.text} /></p>
          <blockquote><span>{t('reading.connections.ask')}</span><p>{connection.question}</p></blockquote>
          <ChartEvidence facts={connection.evidence} /><a className="fate-report-connection-link print:hidden" href={`#${prefix}-${connection.chapterId}`}>{t('reading.connections.readMore')} <span aria-hidden="true">→</span></a>
        </section>)}</div>
      </section>
      {report.chapters.map(chapter => <ReportChapterView key={chapter.id} chapter={chapter} prefix={prefix}>{chapter.id === 'balance' ? <ElementBalance elements={report.elements} visibleMarkers={report.visibleMarkers} /> : null}</ReportChapterView>)}
      <section id={`${prefix}-timeline`} className="fate-reading-chapter">
        <ChapterHeading title={t('reading.complete.timeline')} kind="timeline" /><p>{t('reading.complete.timelineNote')}</p>
        <div className="fate-report-periods">{report.periods.length ? report.periods.map((period, index) => <div key={period.period} className="fate-reading-period"><span className="fate-report-period-dot" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p className="fate-eyebrow">{period.period}</p><h3>{period.headline}</h3><div className="fate-report-chapter-layout"><div className="fate-report-prose">{period.paragraphs.map(paragraph => <p key={paragraph}><ReadingText text={paragraph} /></p>)}</div><ReadingGuidance guidance={period.guidance} headingLevel="h4" /></div><div className="fate-reading-practice"><FateKeyMark /><div><strong>{t('reading.tryThis')}</strong><p>{period.tryThis}</p></div></div><ChartEvidence facts={period.evidence} /></div>) : <p>{t('reading.complete.noPeriods')}</p>}</div>
      </section>
      <ReportChapterView chapter={report.actionPlan} prefix={prefix} />
      <ReportExtrasView extras={report.extras} prefix={prefix} />
      <section className="fate-reading-chapter fate-reading-method print:hidden"><h2>{t('reading.method.title')}</h2><p>{t('reading.method.intro')}</p><details><summary>{t('reading.method.details')}</summary><p>{report.pillarSummary.join(' · ')}</p><ul>{report.methodNotes.map(note => <li key={note}>{note}</li>)}</ul></details></section>
      <section className="fate-reading-chapter hidden print:block"><h2>{t('reading.method.title')}</h2><p>{report.pillarSummary.join(' · ')}</p><ul>{report.methodNotes.map(note => <li key={note}>{note}</li>)}</ul></section>
      <ReportRecord input={input} birthSummary={report.birthSummary} referenceYear={report.referenceYear} preparedOn={preparedOn} />
      <footer className="fate-reading-small-note fate-report-footer"><p>{t('reading.footer.note')}</p><p>{t('reading.complete.sampleNote')}</p><a href="#complete-life-reading" className="fate-outline-button print:hidden">{t('reading.complete.back')}</a></footer>
    </article>
  )
}
