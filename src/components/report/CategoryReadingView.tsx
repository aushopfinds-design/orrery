import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CategoryReading } from '../../report/category-shared.ts'
import { categoryInfo } from '../../report/category-catalog.ts'
import { REPORT_EDITION } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'
import { FateEmblem } from '../HomeOverview.tsx'
import CopyButton from '../CopyButton.tsx'
import ReportChapterView, { ChartEvidence } from './ReportChapterView.tsx'
import ReadingText from './ReadingText.tsx'
import ReadingGuidance from './ReadingGuidance.tsx'
import ReportIcon from './ReportIcon.tsx'
import ChapterHeading from './ChapterHeading.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import ElementBalance from './ElementBalance.tsx'
import ReportRecord from './ReportRecord.tsx'
import ReportExtrasView from './ReportExtrasView.tsx'
import ReportBriefView, { BackToChapters } from './ReportBriefView.tsx'
import { buildReadingBrief } from '../../report/reading-brief.ts'
import ReportApplicationsView from './ReportApplicationsView.tsx'
import { CalculationNotice, ChartGlossary } from './CalculationDisclosure.tsx'

export default function CategoryReadingView({ report, embedded = false, controls, prefix: customPrefix }: { report: CategoryReading; embedded?: boolean; controls?: ReactNode; prefix?: string }) {
  const { t } = useLocale()
  const info = categoryInfo(report.kind)
  const prefix = customPrefix ?? `${info.slug}-sample`
  const [preparedOn] = useState(() => new Date().toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }))
  const [showPrintHelp, setShowPrintHelp] = useState(false)
  const [first, second] = report.subjects
  useEffect(() => { if (!embedded) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' }) }, [embedded])
  const contents = [...report.chapters.map(item => ({ id: item.id, title: item.title, icon: item.icon })), ...(report.months.length ? [{ id: 'calendar', title: `${String(report.chapters.length + 1).padStart(2, '0')} · ${t('category.months.title')}`, icon: 'timeline' }] : [])]
  const chartDetails = <>
    <div className="fate-category-subjects">{report.subjects.map(person => <section key={person.label}><h3>{person.label}</h3><p>{person.dayMaster}</p><div className="fate-report-pillars">{person.pillarSummary.map((pillar, index) => { const [position, value] = pillar.split(': '); return <div key={position} className={index === 2 ? 'fate-report-pillar-day' : ''}><span>{t(`reading.design.pillar.${position.toLowerCase()}`)}</span><strong lang={value === 'Unknown' ? 'en' : 'zh'}>{value}</strong>{index === 2 && <small>{t('reading.design.you')}</small>}</div> })}</div></section>)}</div>
      <section className="fate-reading-summary" aria-label={t('reading.design.summaryThemes')}>{report.summary.map(item => <div key={item.label}><ReportIcon kind={info.icon} /><h3>{item.label}</h3><p>{item.text}</p></div>)}</section>
  </>
  return <article id={prefix} className="fate-complete-reading fate-category-reading printable-reading" lang="en" aria-label={`${report.title} — Full Sample`}>
    {!embedded && <div className="fate-sample-toolbar print:hidden"><a href={`#${info.slug}`}>← {report.title}</a><span>{t('reading.complete.sampleBadge')}</span></div>}
    {!embedded && controls}
    <header className="fate-reading-cover fate-reading-cover-complete">
      <svg className="fate-report-cover-art" viewBox="815 112 700 680" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="/images/fate-key-approved-hero.webp" width="1606" height="979" /></svg>
      <div className="fate-report-cover-content"><div className="fate-report-cover-brand"><FateEmblem className="fate-reading-cover-emblem" /><span>THE FATE KEY<small>{t('reading.design.coverLabel')}</small></span></div><p className="fate-report-edition-label">{t('category.series')}<span>{t('reading.record.edition')} {REPORT_EDITION}</span></p><p className="fate-eyebrow">{t('reading.design.coverEyebrow')}</p><h1>{report.title}</h1><p className="fate-reading-cover-tagline">{report.headline}</p><div className="fate-report-cover-birth">{report.subjects.map(person => <div key={person.label}><span>{person.label}</span><p>{person.birthSummary}</p></div>)}</div><p className="fate-reading-small-note">{t('reading.complete.sampleNote')}</p></div>
      <div className="fate-report-cover-bottom"><span>{t('reading.design.chapterCount').replace('{n}', String(contents.length))}</span>{report.months.length > 0 && <span>{t('category.months.count')}</span>}<span>{t('reading.design.english')}</span><span>{t('reading.design.chartNotes')}</span></div>
    </header>
    {!embedded && <div className="fate-reading-controls print:hidden"><CopyButton label={t('reading.complete.copy')} getText={() => `${t('reading.complete.sampleNote')}\n${t('reading.record.preparedOn')}: ${preparedOn}\n\n${report.fullText}`} /><button type="button" className="fate-complete-primary" onClick={() => { setShowPrintHelp(true); window.print() }}>{t('reading.complete.print')}</button>{showPrintHelp && <p role="status">{t('reading.printHelp')}</p>}</div>}
    {report.subjects.some(person => person.input.unknownTime) && <p role="status" className="fate-reading-time-note">{t('category.unknown')}</p>}
    {report.subjects.map(person => <CalculationNotice key={person.label} input={person.input} label={report.subjects.length > 1 ? person.label : undefined} />)}
    <section id={`${prefix}-start`} className="fate-report-overview" aria-label={t('reading.complete.summary')}><div className="fate-report-overview-heading"><p className="fate-eyebrow">{t('reading.complete.summary')}</p><h2>{t('reading.design.overview')}</h2></div>
        <ReportBriefView brief={buildReadingBrief(report.chapters[0], undefined, report.focus)} href={`#${prefix}-${report.chapters[0].id}`} />
      <nav id={`${prefix}-contents`} className="fate-reading-toc print:hidden" aria-label={t('reading.complete.contents')}>{report.applications.length > 0 && <a href={`#${prefix}-situations`}><ReportIcon kind="next-moves" /><span>{t('reading.application.contents')}</span><span aria-hidden="true">↗</span></a>}{contents.map(item => <a key={item.id} href={`#${prefix}-${item.id}`}><ReportIcon kind={item.icon ?? info.icon} /><span>{item.title}</span><span aria-hidden="true">↗</span></a>)}{!report.sharedAppendixInLifeReport && <a href={`#${prefix}-everyday-compass`}><ReportIcon kind="balance" /><span>{t('reading.extras.title')}</span><span aria-hidden="true">↗</span></a>}</nav>
        <details className="fate-report-chart-details print:hidden"><summary>{t('reading.brief.chart')}</summary>{chartDetails}</details>
        <div className="hidden print:block">{chartDetails}</div>
    </section>
    <ReportApplicationsView items={report.applications} prefix={prefix} />
    {report.chapters.map(item => <ReportChapterView key={item.id} chapter={item} prefix={prefix}>{item.id === 'visible-elements' ? <ElementBalance elements={first.elements} visibleMarkers={first.visibleMarkers} /> : null}</ReportChapterView>)}
    {report.months.length > 0 && <section id={`${prefix}-calendar`} className="fate-reading-chapter fate-category-calendar"><ChapterHeading title={`${String(report.chapters.length + 1).padStart(2, '0')} · ${t('category.months.title')}`} kind="timeline" /><p>{t('category.months.intro')}</p><div className="fate-report-periods">{report.months.map((month, index) => <section id={`${prefix}-${month.id}`} className="fate-reading-period" key={month.id}><span className="fate-report-period-dot" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p className="fate-eyebrow">{month.label}</p><h3><ReadingText text={month.lead} /></h3><div className="fate-report-chapter-layout"><div className="fate-report-prose">{month.paragraphs.map(text => <p key={text}><ReadingText text={text} /></p>)}</div><ReadingGuidance guidance={month.guidance} headingLevel="h4" /></div><div className="fate-reading-practice"><FateKeyMark /><div><strong>{t('reading.tryThis')}</strong><p>{month.tryThis}</p></div></div><ChartEvidence facts={month.evidence} /><BackToChapters prefix={prefix} /></section>)}</div></section>}
    {!report.sharedAppendixInLifeReport && <>
    <ReportExtrasView extras={report.extras} prefix={prefix} />
    <section className="fate-reading-chapter fate-reading-method print:hidden"><h2>{t('reading.method.title')}</h2><p>{info.scope}</p><details><summary>{t('reading.method.details')}</summary><ul>{report.methodNotes.map(note => <li key={note}>{note}</li>)}</ul></details></section>
    <section className="fate-reading-chapter hidden print:block"><h2>{t('reading.method.title')}</h2><ul>{report.methodNotes.map(note => <li key={note}>{note}</li>)}</ul></section>
    <ChartGlossary evidence={[...report.chapters.flatMap(chapter => chapter.evidence), ...report.months.flatMap(month => month.evidence), ...report.focus.evidence]} />
    </>}
    <ReportRecord input={first.input} birthSummary={first.birthSummary} referenceYear={report.referenceYear} preparedOn={preparedOn} secondaryInput={second?.input} secondaryBirthSummary={second?.birthSummary} series={t('category.series')} />
    <footer className="fate-reading-small-note fate-report-footer"><p>{t('reading.footer.note')}</p><p>{t('reading.complete.sampleNote')}</p>{!embedded && <a href={`#${info.slug}`} className="fate-outline-button print:hidden">{t('reading.complete.back')}</a>}</footer>
  </article>
}
