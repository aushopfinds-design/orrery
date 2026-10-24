// Integer USD cents are the single source for catalog, product and preview prices.
// These are launch plans while checkout remains closed, not past selling prices.
export const REPORT_PRICE_CENTS = {
  complete: 1699,
  compatibility: 1199,
  year: 999,
  career: 1099,
  business: 1199,
  wellbeing: 899,
  bundle: 2499,
} as const

export type PricedReportKind = keyof typeof REPORT_PRICE_CENTS
export const BUNDLE_REPORTS = ['complete', 'compatibility', 'year'] as const

export function formatUSD(cents: number) { return `US$${(cents / 100).toFixed(2)}` }
export function reportPrice(kind: PricedReportKind) { return formatUSD(REPORT_PRICE_CENTS[kind]) }

export function bundleSavings() {
  const separateCents = BUNDLE_REPORTS.reduce((total, kind) => total + REPORT_PRICE_CENTS[kind], 0)
  const savedCents = separateCents - REPORT_PRICE_CENTS.bundle
  return {
    separatePrice: formatUSD(separateCents),
    savedAmount: formatUSD(savedCents),
    // Round down so the advertised percentage never overstates the saving.
    percent: Math.floor(savedCents * 100 / separateCents),
  }
}
