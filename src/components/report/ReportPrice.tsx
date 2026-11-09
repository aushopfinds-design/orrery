import { useLocale } from '../../i18n/index.ts'
import { reportPrice } from '../../report/pricing.ts'
import type { PricedReportKind } from '../../report/pricing.ts'

export default function ReportPrice({ kind, compact = false }: { kind: PricedReportKind; compact?: boolean }) {
  const { t } = useLocale()
  return <span className={`fate-price-display${compact ? ' fate-price-compact' : ''}`}>
    {!compact && <span className="fate-price-caption">{t('buyer.price.launch')}</span>}
    <strong className="fate-price-amount">{reportPrice(kind)}</strong>
  </span>
}