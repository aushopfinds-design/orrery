import { describe, expect, it } from 'vitest'
import { FOCUS_CATALOG } from './category-catalog.ts'
import { PREVIEW_KINDS, previewProduct } from './personal-products.ts'
import { BUNDLE_REPORTS, REPORT_PRICE_CENTS, bundleSavings, formatUSD, reportPrice } from './pricing.ts'

describe('launch prices and genuine bundle comparison', () => {
  it('provides a positive integer-cent price for every offered report', () => {
    expect(Object.keys(REPORT_PRICE_CENTS).sort()).toEqual([...PREVIEW_KINDS].sort())
    for (const kind of PREVIEW_KINDS) {
      expect(Number.isInteger(REPORT_PRICE_CENTS[kind])).toBe(true)
      expect(REPORT_PRICE_CENTS[kind]).toBeGreaterThan(0)
      expect(previewProduct(kind).price).toBe(reportPrice(kind))
    }
    for (const category of FOCUS_CATALOG) expect(category.price).toBe(reportPrice(category.kind))
  })

  it('fills the two pending reports at the intended launch prices', () => {
    expect(previewProduct('business').price).toBe('US$9.99')
    expect(previewProduct('wellbeing').price).toBe('US$6.99')
  })

  it('compares the bundle only with its three included reports', () => {
    expect(BUNDLE_REPORTS).toEqual(['complete', 'compatibility', 'year'])
    expect(bundleSavings()).toEqual({ separatePrice: 'US$32.97', savedAmount: 'US$9.98', percent: 30 })
    expect(reportPrice('bundle')).toBe('US$22.99')
  })

  it('never rounds the advertised saving above the actual discount', () => {
    const total = BUNDLE_REPORTS.reduce((sum, kind) => sum + REPORT_PRICE_CENTS[kind], 0)
    const actual = (total - REPORT_PRICE_CENTS.bundle) * 100 / total
    expect(bundleSavings().percent).toBeLessThanOrEqual(actual)
    expect(actual - bundleSavings().percent).toBeLessThan(1)
  })

  it('formats cents as explicit USD amounts without a currency conversion', () => {
    expect(formatUSD(699)).toBe('US$6.99')
    expect(formatUSD(1000)).toBe('US$10.00')
  })
})
