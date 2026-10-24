import { useLocale } from '../../i18n/index.ts'
import { checkoutHash } from '../../report/personal-products.ts'
import type { PreviewKind } from '../../report/personal-products.ts'
import { isSandboxHost } from '../../utils/purchase-client.ts'

export default function BuyReportLink({ kind }: { kind: PreviewKind }) {
  const { t } = useLocale()
  const sandbox = typeof window !== 'undefined' && isSandboxHost(window.location.hostname)
  return <a href={checkoutHash(kind)} className="fate-complete-primary fate-buy-report" data-buy-kind={kind}>{t(sandbox ? 'purchase.testBuy' : 'purchase.buy')} <span aria-hidden="true">→</span></a>
}
