import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../i18n/index.ts'
import ReportIcon from './report/ReportIcon.tsx'

const SUBJECTS = ['personality', 'career', 'love'] as const

/** Public report preview shows layout and titles only; no calculated paid chapter. */
export default function HomeReportPreview({}: { input: BirthInput }) {
  const { t } = useLocale()
  return <section id="report-preview" className="fate-section fate-look-inside" aria-labelledby="report-preview-title">
    <div className="fate-section-heading">
      <p className="fate-eyebrow">{t('preview.home.eyebrow')}</p>
      <h2 id="report-preview-title">{t('preview.home.title')}</h2>
      <p>{t('preview.home.text')}</p>
    </div>
    <div className="fate-look-layout">
      <div className="fate-look-sample fate-preview-shell">
        <header className="fate-look-sample-heading"><span className="fate-look-badge">{t('preview.home.sample')}</span><p>Ivory letter paper · fine gold border · wax seal design</p></header>
        <div className="fate-look-subjects" role="group" aria-label={t('preview.home.subjects')}>
          {SUBJECTS.map(value => <span key={value}><ReportIcon kind={value} />{t(`preview.subject.${value}`)}</span>)}
        </div>
        <article id="home-report-excerpt" className="fate-look-page" lang="en">
          <p className="fate-eyebrow">THE FATE KEY · DESIGN SAMPLE</p>
          <h3>Questions with clear, direct answers</h3>
          <p className="fate-look-lead">Illustrative wording: “Your report connects a personal theme with the questions that matter in daily life.”</p>
          <p>This sample shows the writing style and page design. It is not a personal conclusion or a paid answer.</p>
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
}
