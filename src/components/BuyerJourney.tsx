import { useLocale } from '../i18n/index.ts'
import { FateEmblem } from './HomeOverview.tsx'
import FateKeyMark from './report/FateKeyMark.tsx'
import ReportIcon from './report/ReportIcon.tsx'

export default function BuyerJourney() {
  const { t } = useLocale()
  return <section id="reports" className="fate-buyer-guide fate-section" aria-labelledby="buyer-guide-title">
    <div className="fate-buyer-intro"><p className="fate-eyebrow">{t('buyer.guide.eyebrow')}</p><h2 id="buyer-guide-title">{t('buyer.guide.title')}</h2><p>{t('buyer.guide.text')}</p></div>
    <div className="fate-buyer-feature">
      <div className="fate-buyer-book" aria-hidden="true"><FateEmblem /><span>THE FATE KEY</span><FateKeyMark /><strong>{t('complete.title')}</strong><small>{t('buyer.book.note')}</small></div>
      <div className="fate-buyer-value"><p className="fate-eyebrow">{t('buyer.guide.start')}</p><h3>{t('buyer.guide.benefit')}</h3><p>{t('buyer.guide.benefitText')}</p><ul>{['personality', 'love', 'work', 'timeline'].map(key => <li key={key}><ReportIcon kind={key} /><span>{t(`buyer.value.${key}`)}</span></li>)}</ul><div className="fate-buyer-price"><strong>US$14.99</strong><span>{t('buyer.price.note')}</span></div><div className="fate-complete-actions"><a className="fate-complete-primary" href="#my-report">{t('buyer.preview.cta')}</a><a className="fate-buyer-sample-link" href="#sample-report">{t('buyer.guide.sample')}</a></div><p className="fate-reading-small-note">{t('buyer.checkout.pending')}</p></div>
    </div>
    <ol className="fate-buyer-steps">{['free', 'preview', 'full'].map((key, index) => <li key={key}><span>{String(index + 1).padStart(2, '0')}</span><h3>{t(`buyer.step.${key}.title`)}</h3><p>{t(`buyer.step.${key}.text`)}</p></li>)}</ol>
    <section className="fate-buyer-comparison" aria-labelledby="buyer-comparison-title"><h3 id="buyer-comparison-title">{t('buyer.compare.title')}</h3><div className="fate-complete-table-wrap"><table className="fate-complete-comparison"><thead><tr><th scope="col">{t('buyer.compare.feature')}</th><th scope="col">{t('buyer.compare.free')}</th><th scope="col">{t('complete.title')}</th></tr></thead><tbody>{['personality', 'relationships', 'work', 'timeline', 'steps'].map(key => <tr key={key}><th scope="row">{t(`buyer.compare.${key}.label`)}</th><td>{t(`buyer.compare.${key}.free`)}</td><td>{t(`buyer.compare.${key}.full`)}</td></tr>)}</tbody></table></div></section>
  </section>
}
