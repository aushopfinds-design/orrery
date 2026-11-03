import { useLocale } from '../../i18n/index.ts'
import { previewProduct } from '../../report/personal-products.ts'
import type { PreviewKind } from '../../report/personal-products.ts'
import ReportIcon from './ReportIcon.tsx'
import { destinyCardCount } from '../../report/destiny-card.ts'

// eslint-disable-next-line react-refresh/only-export-components
export function reportScope(kind: PreviewKind, t: (key: string) => string) {
  const count = previewProduct(kind).chapters
  return t(kind === 'bundle' ? 'buyer.choice.reports' : kind === 'year' ? 'buyer.choice.annualChapters' : 'buyer.choice.chapters').replace('{count}', String(count))
}

export default function ReportChoiceDetails({ kind }: { kind: PreviewKind }) {
  const { t } = useLocale()
  const product = previewProduct(kind)
  return <section className="fate-choice-details" aria-label={t('buyer.choice.includes')}>
    <div className="fate-choice-question"><ReportIcon kind={product.icon} /><div><p className="fate-eyebrow">{t('buyer.choice.question')}</p><p className="fate-choice-prompt">{t(`buyer.choice.${kind}.question`)}</p></div></div>
    <ul>{[1, 2, 3].map(index => <li key={index}><span aria-hidden="true">✓</span>{t(`buyer.choice.${kind}.${index}`)}</li>)}</ul>
    <div className="fate-choice-scope"><span>{reportScope(kind, t)}</span><span>{t(kind === 'bundle' ? 'buyer.choice.bundlePeople' : kind === 'compatibility' ? 'site.guide.twoPeople' : 'site.guide.onePerson')}</span><a href={product.sample}>{t('buyer.choice.example')} <span aria-hidden="true">↗</span></a></div>
    <a className="fate-choice-card-included" href="#destiny-card">✦ {t(destinyCardCount(kind) === 2 ? 'destiny.catalog.two' : 'destiny.catalog.one')}</a>
  </section>
}
