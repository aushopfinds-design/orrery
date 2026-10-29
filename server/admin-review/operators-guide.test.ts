import { describe, expect, it } from 'vitest'
import { operatorProducts, operatorSiteGuide } from './operators-guide.ts'
import { PREVIEW_KINDS, previewProduct } from '../../src/report/personal-products.ts'
import en from '../../src/i18n/locales/en.ts'
import privateEn from './locales/en.ts'
import privateKo from './locales/ko.ts'
import privateZh from './locales/zh.ts'
import privateJa from './locales/ja.ts'
import privateDe from './locales/de.ts'
import privateEs from './locales/es.ts'

describe('Korean operator guide follows the actual product and site sources', () => {
  it('keeps private UI copy in six server-only dictionaries, outside customer locales', () => {
    for (const dictionary of [privateKo, privateZh, privateJa, privateDe, privateEs]) {
      expect(Object.keys(dictionary).sort()).toEqual(Object.keys(privateEn).sort())
    }
    expect(Object.keys(en).some(key => key.startsWith('admin.'))).toBe(false)
  })
  it('uses current prices, scope and chapter counts for all six products', () => {
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
    expect(products.find(p => p.kind === 'bundle')!.count).toBe(5)
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
