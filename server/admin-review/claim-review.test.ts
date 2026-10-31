import { describe, expect, it } from 'vitest'
import { buildReview } from './report.ts'
import { verifyClaimCoverage } from './claim-review.ts'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { PREVIEW_KINDS } from '../../src/report/personal-products.ts'
describe('Core bilingual meaning and delivered-text coverage', () => {
  it('rejects a removed or changed caution instead of calling a shared analysis ID sufficient', () => {
    const claim = { id: 'caution', english: 'No income is guaranteed.', korean: '수입을 보장하지 않습니다.' }
    expect(() => verifyClaimCoverage([claim], 'Income is guaranteed.', claim.korean)).toThrow('Missing authored claim')
    expect(() => verifyClaimCoverage([claim], claim.english, '수입을 보장합니다.')).toThrow('Missing authored claim')
  })
  it('retains the previously dropped 2029 Person B no-friction caution in compatibility', () => {
    const { first, second } = CATEGORY_SCENARIOS[0]
    const doc = buildReview({ kind: 'compatibility', first, second }, 2026).documents[0]
    const claim = doc.reviewedClaims.find(c => c.id === 'B.timing.2029-07-15')!
    expect(claim.english).toContain('No checked clash')
    expect(claim.korean).toContain('확인된 마찰 신호가 없더라도')
    expect(() => verifyClaimCoverage([claim], doc.english, doc.koreanOriginal)).not.toThrow()
  })
  it.each(Array.from({ length: 24 }, (_, i) => i))('chart %i delivers the paired conclusions for all seven products', i => {
    const first = { ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: 5 + i % 20, unknownTime: i % 5 === 0 }
    const second = CATEGORY_SCENARIOS[1].second
    for (const kind of PREVIEW_KINDS) {
      const result = buildReview({ kind, first, ...(['compatibility', 'bundle'].includes(kind) ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: 2027 } : {}) }, 2026)
      for (const doc of result.documents.filter(d => d.reviewedClaims.length)) {
        expect(doc.reviewedClaims.length).toBeGreaterThan(2)
        expect(new Set(doc.reviewedClaims.map(c => c.id)).size).toBe(doc.reviewedClaims.length)
        expect(doc.reviewedClaims.every(c => !!c.english && !!c.korean)).toBe(true)
        expect(doc.english).not.toMatch(/undefined|NaN/)
        expect(doc.koreanOriginal).not.toMatch(/undefined|NaN/)
        expect(doc.sentenceReview.coverage).toContain('not a complete sentence-by-sentence translation')
      }
    }
  })
})
