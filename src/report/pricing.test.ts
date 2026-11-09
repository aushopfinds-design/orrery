import { describe, expect, it } from 'vitest'
import { FOCUS_CATALOG } from './category-catalog.ts'
import { PREVIEW_KINDS, previewProduct } from './personal-products.ts'
import { ACTIVE_PRODUCT_KINDS, REPORT_PRICE_CENTS, formatUSD, reportPrice } from './pricing.ts'

describe('launch prices and integrated collection', () => {
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

  it('offers the approved seven-product set while retaining My Love for legacy orders', () => {
    expect([...ACTIVE_PRODUCT_KINDS]).toEqual(['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'])
    expect(previewProduct('love').title).toBe('My Love')
    expect(reportPrice('business')).toBe('$11.99')
    expect(reportPrice('wellbeing')).toBe('$8.99')
  })

  it('prices the ten-question collection as one integrated report without a false multi-report discount', () => {
    expect(reportPrice('bundle')).toBe('$48.27')
    expect(previewProduct('bundle').questions).toBe(10)
    expect(previewProduct('bundle').description).toContain('integrated 10-question reading')
  })

  it('formats cents as explicit USD amounts without a currency conversion', () => {
    expect(formatUSD(699)).toBe('$6.99')
    expect(formatUSD(1000)).toBe('$10.00')
  })
})