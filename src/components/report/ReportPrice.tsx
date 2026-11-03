import { useLocale } from '../../i18n/index.ts'
import { bundleSavings, reportPrice } from '../../report/pricing.ts'
import type { PricedReportKind } from '../../report/pricing.ts'

export default function ReportPrice({ kind, compact = false }: { kind: PricedReportKind; compact?: boolean }) {
  const { t } = useLocale()
  const savings = kind === 'bundle' ? bundleSavings() : null
  return <span className={`fate-price-display${compact ? ' fate-price-compact' : ''}`}>
    {!compact && <span className="fate-price-caption">{t('buyer.price.launch')}</span>}
    {savings && !compact && <span className="fate-price-comparison"><span>{t('buyer.price.separately')}</span> <s>{savings.separatePrice}</s></span>}
    <strong className="fate-price-amount">{reportPrice(kind)}</strong>
    {savings && <span className="fate-price-badge">{t('buyer.price.save').replace('{percent}', String(savings.percent))}{compact && <span className="sr-only"> {t('buyer.price.bundleBasis')}</span>}</span>}
    {savings && !compact && <span className="fate-price-basis">{t('buyer.price.bundleBasis')}</span>}
  </span>
}
