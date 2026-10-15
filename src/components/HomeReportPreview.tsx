import { useMemo, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import { useLocale } from '../i18n/index.ts'
import { buildCompleteReading } from '../report/complete-reading.ts'
import ReadingText from './report/ReadingText.tsx'
import ReportIcon from './report/ReportIcon.tsx'

const SUBJECTS = ['personality', 'career', 'love'] as const

/** Public excerpts use the same birth input and chapters as the linked full example. */
export default function HomeReportPreview({ input }: { input: BirthInput }) {
  const { t } = useLocale()
  const [subject, setSubject] = useState<typeof SUBJECTS[number]>('personality')
  const report = useMemo(() => buildCompleteReading(calculateSaju(input)), [input])
  const chapter = report.chapters.find(item => item.id === subject)!
  return (
    <section id="report-preview" className="fate-section fate-look-inside" aria-labelledby="report-preview-title">
      <div className="fate-section-heading">
        <p className="fate-eyebrow">{t('preview.home.eyebrow')}</p>
        <h2 id="report-preview-title">{t('preview.home.title')}</h2>
        <p>{t('preview.home.text')}</p>
      </div>
      <div className="fate-look-layout">
        <div className="fate-look-sample">
          <header className="fate-look-sample-heading">
            <span className="fate-look-badge">{t('preview.home.sample')}</span>
            <p>{report.birthSummary}</p>
          </header>
          <div className="fate-look-subjects" role="group" aria-label={t('preview.home.subjects')}>
            {SUBJECTS.map(value => <button key={value} type="button" aria-pressed={subject === value} aria-controls="home-report-excerpt" onClick={() => setSubject(value)}><ReportIcon kind={value} />{t(`preview.subject.${value}`)}</button>)}
          </div>
          <article id="home-report-excerpt" className="fate-look-page" lang="en" aria-labelledby="home-report-chapter">
            <p className="fate-eyebrow">{t('preview.home.fromReport')}</p>
            <h3 id="home-report-chapter">{chapter.title}</h3>
            <p className="fate-look-lead"><ReadingText text={chapter.lead} /></p>
            <div className="fate-look-basis"><strong>{t('preview.home.why')}</strong><p><ReadingText text={chapter.paragraphs[0]} /></p></div>
            <details key={subject} className="fate-look-more">
              <summary>{t('preview.home.more')}</summary>
              {chapter.paragraphs.slice(1, 3).map(paragraph => <p key={paragraph}><ReadingText text={paragraph} /></p>)}
            </details>
            <a className="fate-look-chapter-link" href={`#sample-report-${subject}`}>{t('preview.home.fullChapter')} <span aria-hidden="true">→</span></a>
          </article>
          <p className="fate-look-caption">{t('preview.home.sampleNote')}</p>
        </div>
        <aside className="fate-look-own" aria-labelledby="report-preview-own-title">
          <ReportIcon kind="personality" />
          <p className="fate-eyebrow">{t('preview.home.ownEyebrow')}</p>
          <h3 id="report-preview-own-title">{t('preview.home.ownTitle')}</h3>
          <ol>{['details', 'free', 'preview'].map((key, index) => <li key={key}><span aria-hidden="true">{index + 1}</span><div><strong>{t(`preview.step.${key}.title`)}</strong><p>{t(`preview.step.${key}.text`)}</p></div></li>)}</ol>
          <a className="fate-complete-primary" href="#birth-details">{t('preview.home.start')} <span aria-hidden="true">→</span></a>
          <p className="fate-look-no-payment">{t('preview.home.noPayment')}</p>
          <a className="fate-buyer-sample-link" href="#sample-report">{t('buyer.guide.sample')}</a>
        </aside>
      </div>
    </section>
  )
}
