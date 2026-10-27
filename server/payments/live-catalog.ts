import type Stripe from 'stripe'
import type { PricedReportKind } from '../../src/report/pricing.ts'
import { REPORT_PRICE_CENTS } from '../../src/report/pricing.ts'
import { PaymentError } from './config.ts'

// Public catalog identifiers, not credentials. Approved USD launch prices.
export const LIVE_CATALOG = {
  complete: { product: 'prod_VTU4tKm4OYGJZK', price: 'price_1UV7CyGyUNAMaZunO59VP3Co' },
  compatibility: { product: 'fate_compatibility', price: 'price_1UV7DfGyUNAMaZun9bpbidw8' },
  year: { product: 'fate_year', price: 'price_1UV7DoGyUNAMaZunqAusMIJ8' },
  career: { product: 'fate_career', price: 'price_1UV7DxGyUNAMaZunZg1xiaCA' },
  business: { product: 'fate_business', price: 'price_1UV7E6GyUNAMaZun9HquBo1o' },
  wellbeing: { product: 'fate_wellbeing', price: 'price_1UV7EFGyUNAMaZuncutcKC5R' },
  bundle: { product: 'fate_bundle', price: 'price_1UV7EOGyUNAMaZunY5kOA1kK' },
} as const satisfies Record<PricedReportKind, { product: string; price: string }>

export function livePriceMatches(kind: PricedReportKind, price: Stripe.Price): boolean {
  const product = price.product, expected = LIVE_CATALOG[kind]
  return price.id === expected.price && price.livemode && price.currency === 'usd' &&
    price.unit_amount === REPORT_PRICE_CENTS[kind] && price.type === 'one_time' &&
    typeof product === 'object' && !product.deleted && product.id === expected.product &&
    product.livemode && product.metadata.report_kind === kind
}

export function requireLivePrice(kind: PricedReportKind, price: Stripe.Price) {
  if (!livePriceMatches(kind, price) || !price.active || typeof price.product !== 'object' ||
      price.product.deleted || !price.product.active || price.product.default_price !== price.id) {
    throw new PaymentError('live_catalog_mismatch', 503)
  }
}
