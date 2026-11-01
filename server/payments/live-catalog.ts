import type Stripe from 'stripe'
import type { PricedReportKind } from '../../src/report/pricing.ts'
import { REPORT_PRICE_CENTS } from '../../src/report/pricing.ts'
import { PaymentError } from './config.ts'

// Public catalog identifiers, not credentials. Approved USD launch prices.
export const LIVE_CATALOG: Partial<Record<PricedReportKind, { product: string; price: string }>> = {
  complete: { product: 'prod_VTU4tKm4OYGJZK', price: 'price_1UX7BYGyUNAMaZunuvl56ylp' },
  compatibility: { product: 'fate_compatibility', price: 'price_1UX7BrGyUNAMaZunLhV3SOjW' },
  year: { product: 'fate_year', price: 'price_1UX7BzGyUNAMaZunYWzpovUl' },
  career: { product: 'fate_career', price: 'price_1UX7BkGyUNAMaZunSThtfDoa' },
  business: { product: 'fate_business', price: 'price_1UV7E6GyUNAMaZun9HquBo1o' },
  wellbeing: { product: 'fate_wellbeing', price: 'price_1UV7EFGyUNAMaZuncutcKC5R' },
  bundle: { product: 'fate_bundle', price: 'price_1UX7C6GyUNAMaZuncKX3to8n' },
}

export function livePriceMatches(kind: PricedReportKind, price: Stripe.Price): boolean {
  const product = price.product, expected = LIVE_CATALOG[kind]
  return Boolean(expected) && price.id === expected!.price && price.livemode && price.currency === 'usd' &&
    price.unit_amount === REPORT_PRICE_CENTS[kind] && price.type === 'one_time' &&
    typeof product === 'object' && product !== null && !('deleted' in product) && product.id === expected!.product &&
    product.livemode && product.metadata.report_kind === kind
}

export function requireLivePrice(kind: PricedReportKind, price: Stripe.Price) {
  const product = price.product
  if (!livePriceMatches(kind, price) || !price.active || typeof product !== 'object' || product === null ||
      !('active' in product) || !product.active || product.default_price !== price.id) {
    throw new PaymentError('live_catalog_mismatch', 503)
  }
}
