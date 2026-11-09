// Integer USD cents are the single source for catalog, product and preview prices.
// These are launch plans while checkout remains closed, not past selling prices.
export const REPORT_PRICE_CENTS = {
  // Current six-product catalog. Legacy kinds remain priced for stored orders,
  // but are no longer offered for new checkout.
  complete: 1999,
  year: 899,
  compatibility: 1499,
  career: 1499,
  love: 999,
  bundle: 4827,
  business: 1199,
  wellbeing: 899,
} as const

export type PricedReportKind = keyof typeof REPORT_PRICE_CENTS
export const ACTIVE_PRODUCT_KINDS = ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'] as const
export type ActiveProductKind = typeof ACTIVE_PRODUCT_KINDS[number]
// My Love remains readable for previously paid orders, but is no longer sold separately.
export const LEGACY_PRODUCT_KINDS = ['love'] as const

export function formatUSD(cents: number) { return `$${(cents / 100).toFixed(2)}` }
export function reportPrice(kind: PricedReportKind) { return formatUSD(REPORT_PRICE_CENTS[kind]) }