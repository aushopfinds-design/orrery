import { useState } from 'react'
import { useLocale } from '../i18n/index.ts'
import { previewHash, previewProduct } from '../report/personal-products.ts'
import type { PreviewKind } from '../report/personal-products.ts'
import ReportChoiceDetails from './report/ReportChoiceDetails.tsx'
import ReportPrice from './report/ReportPrice.tsx'

const QUESTIONS: PreviewKind[] = ['year', 'career', 'compatibility', 'complete', 'business', 'wellbeing', 'bundle']

export default function ReportFinder() {
  const { t } = useLocale()
  const [kind, setKind] = useState<PreviewKind>('year')
  return <details className="fate-report-finder">
    <summary><span>{t('buyer.finder.title')}</span><small>{t('buyer.finder.open')}</small></summary>
    <div className="fate-finder-body">
      <fieldset><legend>{t('buyer.finder.question')}</legend><div className="fate-finder-questions">{QUESTIONS.map(value => <button key={value} type="button" aria-pressed={kind === value} aria-controls="finder-result" onClick={() => setKind(value)}>{t(`buyer.finder.${value}`)}</button>)}</div></fieldset>
      <div id="finder-result" className="fate-finder-result" aria-live="polite" aria-atomic="true"><div className="fate-finder-title"><h3>{previewProduct(kind).title}</h3><ReportPrice kind={kind} compact /></div><ReportChoiceDetails kind={kind} /><a href={previewHash(kind)} className="fate-complete-primary">{t('buyer.finder.preview')} <span aria-hidden="true">→</span></a><p>{t('preview.home.noPayment')}</p></div>
    </div>
  </details>
}
