import { describe, expect, it } from 'vitest'
import { operatorProducts, operatorSiteGuide } from './operators-guide.ts'
import { PREVIEW_KINDS, previewProduct } from '../../src/report/personal-products.ts'
import en from '../../src/i18n/locales/en.ts'

describe('Korean operator guide follows the actual product and site sources', () => {
  it('uses current prices, scope and chapter counts for all seven products', () => {
    const products = operatorProducts()
    expect(products.map(p => p.kind)).toEqual(PREVIEW_KINDS)
    for (const p of products) {
      const source = previewProduct(p.kind)
      expect(p.price).toBe(source.price)
      expect(p.count).toBe(source.chapters)
      expect(p.english).toBe(source.title)
      expect(p.korean).toMatch(/[가-힣]/)
      expect(p.explanation).toMatch(/[가-힣]/)
    }
    expect(products.find(p => p.kind === 'bundle')!.count).toBe(3)
    expect(products.find(p => p.kind === 'bundle')!.people).toBe('2명')
    expect(products.find(p => p.kind === 'complete')!.people).toBe('1명')
  })
  it('uses the actual customer English and authored Korean for each website stage', () => {
    const rows = operatorSiteGuide()
    expect(rows).toHaveLength(8)
    for (const row of rows) {
      expect(row.english).toBe(en[row.sourceKey])
      expect(row.english.length).toBeGreaterThan(10)
      expect(row.korean).toMatch(/[가-힣]/)
    }
  })
})
