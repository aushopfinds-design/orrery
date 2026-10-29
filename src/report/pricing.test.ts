import { describe, expect, it } from 'vitest'
import { FOCUS_CATALOG } from './category-catalog.ts'
import { PREVIEW_KINDS, previewProduct } from './personal-products.ts'
import { ACTIVE_PRODUCT_KINDS, BUNDLE_REPORTS, REPORT_PRICE_CENTS, bundleSavings, formatUSD, reportPrice } from './pricing.ts'

describe('launch prices and genuine bundle comparison', () => {
  it('provides a positive integer-cent price for every offered report', () => {
    expect(REPORT_PRICE_CENTS).toEqual({ complete:1999, year:899, compatibility:1499, career:1499, love:999, bundle:4827, business:1199, wellbeing:899 })
    expect([...ACTIVE_PRODUCT_KINDS].sort()).toEqual([...PREVIEW_KINDS].sort())
    for (const kind of PREVIEW_KINDS) {
      expect(Number.isInteger(REPORT_PRICE_CENTS[kind])).toBe(true)
      expect(REPORT_PRICE_CENTS[kind]).toBeGreaterThan(0)
      expect(previewProduct(kind).price).toBe(reportPrice(kind))
    }
    for (const category of FOCUS_CATALOG) expect(category.price).toBe(reportPrice(category.kind))
  })

  it('fills the two pending reports at the intended launch prices', () => {
    expect(previewProduct('business').price).toBe('$11.99')
    expect(previewProduct('wellbeing').price).toBe('$8.99')
  })

  it('compares the bundle with all five included reports', () => {
    expect(BUNDLE_REPORTS).toEqual(['complete', 'year', 'compatibility', 'career', 'love'])
    expect(bundleSavings()).toEqual({ separatePrice: '$68.95', savedAmount: '$20.68', percent: 30 })
    expect(reportPrice('bundle')).toBe('$48.27')
  })

  it('never rounds the advertised saving above the actual discount', () => {
    const total = BUNDLE_REPORTS.reduce((sum, kind) => sum + REPORT_PRICE_CENTS[kind], 0)
    const actual = (total - REPORT_PRICE_CENTS.bundle) * 100 / total
    expect(bundleSavings().percent).toBe(Math.round(actual))
    expect(Math.abs(actual - bundleSavings().percent)).toBeLessThan(1)
  })

  it('formats cents as explicit USD amounts without a currency conversion', () => {
    expect(formatUSD(699)).toBe('$6.99')
    expect(formatUSD(1000)).toBe('$10.00')
  })
})
