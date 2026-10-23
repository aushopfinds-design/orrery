import { purchaseMonths } from '../../src/report/purchase-timing.ts'
import { describe, expect, it, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { buildInterpretationPlan } from '../../src/report/interpretation-plan.ts'
import { buildTraditionalCategoryFromPlan, buildTraditionalCompleteFromPlan } from '../../src/report/traditional-reading.ts'
import { koreanReadingFromPlan } from './korean-reading.ts'
import { buildReview } from './report.ts'
import { reviewPage } from './ui.ts'
import { PREVIEW_KINDS } from '../../src/report/personal-products.ts'
const first = CATEGORY_SCENARIOS[0].first, second = CATEGORY_SCENARIOS[0].second

describe('Native Korean and English from one neutral plan', () => {
  it('stores decisions and source data without storing either language draft in the plan', () => {
    const plan = buildInterpretationPlan('career', calculateSaju(first), 2026)
    expect(plan.primary.strength).not.toHaveProperty('paragraphs')
    expect(plan.primary.strength).not.toHaveProperty('verdict')
    expect(plan).not.toHaveProperty('english')
    expect(plan).not.toHaveProperty('korean')
    expect(plan.sections.map(x => x.id)).toContain('feedback-and-boundaries')
    const before = JSON.stringify(plan)
    const korean = koreanReadingFromPlan(plan)
    const english = buildTraditionalCategoryFromPlan(plan)
    expect(JSON.stringify(plan)).toBe(before)
    expect(korean).toContain('이직을 생각해 볼 시기')
    expect(english.chapters.find(x => x.id === 'feedback-and-boundaries')!.title).toContain('Career Change')
    expect(english).not.toHaveProperty('koreanOriginal')
    expect(english.fullText).not.toMatch(/[가-힣]/)
  })
  it.each(PREVIEW_KINDS)('%s provides full native Korean immediately, not a provider translation', kind => {
    const review = buildReview({ kind, first, ...(['bundle', 'compatibility'].includes(kind) ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: 2027 } : {}) }, 2026)
    expect(review.sourceMode).toBe('parallel-analysis')
    expect(review.documents).toHaveLength(kind === 'bundle' ? 4 : 1)
    for (const document of review.documents) {
      expect(document.analysisId).toMatch(/^[0-9a-f]{64}$/)
      expect(document.koreanOriginal.length).toBeGreaterThan(300)
      expect(document.koreanOriginal).not.toMatch(/undefined|NaN/)
      expect(document.english).not.toMatch(/[가-힣]/)
    }
    if (kind === 'year') for (let i = 1; i <= 12; i++) {
      const date = `2027-${String(i).padStart(2, '0')}-15`
      expect(review.documents[0].english).toContain(date)
      expect(review.documents[0].koreanOriginal).toContain(date)
    }
  })
  it('keeps unknown hours out of both native outputs and changes the shared identity for a real chart change', () => {
    const unknown = { ...first, unknownTime: true }
    const one = buildReview({ kind: 'complete', first: { ...unknown, hour: 1 } }, 2026)
    const two = buildReview({ kind: 'complete', first: { ...unknown, hour: 22 } }, 2026)
    expect(one.documents).toEqual(two.documents)
    expect(one.documents[0].koreanOriginal).toContain('출생시간 미상')
    const changed = buildReview({ kind: 'complete', first: { ...unknown, day: first.day + 1 } }, 2026)
    expect(changed.documents[0].analysisId).not.toBe(one.documents[0].analysisId)
    expect(changed.documents[0].koreanOriginal).not.toBe(one.documents[0].koreanOriginal)
    expect(changed.documents[0].english).not.toBe(one.documents[0].english)
  })
  it.each(Array.from({ length: 24 }, (_, i) => i))('chart %i uses the same year/month and cycle decisions in both writers', i => {
      const a = calculateSaju({ ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: 5 + i % 20, unknownTime: i % 5 === 0 })
      const plan = buildInterpretationPlan('year', a, 2027)
      const en = buildTraditionalCategoryFromPlan(plan), ko = koreanReadingFromPlan(plan)
      for (const point of plan.months) {
        expect(en.fullText).toContain(point.date)
        expect(ko).toContain(point.date)
        expect(en.fullText).toContain(point.pillar)
        expect(ko).toContain(point.pillar)
      }
      const support = purchaseMonths(a,2027).filter(p => ['conditional-opening','opening-with-caution','conditional-support'].includes(p.status))
      if (!support.length) {
        expect(en.chapters.find(c => c.id === 'annual-cycle-context')!.lead).toContain('None of the twelve monthly comparisons establishes a supported opening')
        expect(ko).toContain('12개 월별 비교에서 뒷받침되는 기회를 확정할 수 없습니다')
      }
      if (a.input.unknownTime) expect(plan.months.every(p => p.direction === 'unresolved')).toBe(true)
      const full = buildTraditionalCompleteFromPlan(buildInterpretationPlan('complete', a, 2026))
      expect(full.chapters.slice(0, 5).map(c => c.id)).toEqual(['personality', 'social', 'money', 'career', 'love'])
  })
})

describe('Private whole-document native-language review UI', () => {
  it.each(PREVIEW_KINDS)('%s displays both complete texts without consent, credits or a translation call', async kind => {
    const review = buildReview({ kind, first, ...(['bundle', 'compatibility'].includes(kind) ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: 2027 } : {}) }, 2026)
    const fetcher = vi.fn(async (url: string) => {
      expect(new URL(url, 'https://review.example').searchParams.get('action')).toBe('report')
      return Response.json({ ...review, translationReady: false })
    })
    const dom = new JSDOM(reviewPage('nonce'), { url: 'https://review.example/api/admin-review', runScripts: 'dangerously', beforeParse(window) { window.fetch = fetcher as unknown as typeof fetch } })
    try {
      const document = dom.window.document
      document.querySelector('form')!.dispatchEvent(new dom.window.Event('submit', { cancelable: true }))
      await vi.waitFor(() => expect(document.querySelector('#reading-ko .passage')?.textContent).toBe(review.documents[0].koreanOriginal))
      expect(document.querySelector('#reading-compare [lang=ko] .passage')!.textContent).toBe(review.documents[0].koreanOriginal)
      expect(document.querySelector('#reading-en .passage')!.textContent).toBe(review.documents[0].english)
      expect(document.getElementById('translation-tools')!.hidden).toBe(true)
      expect(document.getElementById('source-note')!.hidden).toBe(false)
      expect((document.getElementById('translate') as HTMLButtonElement).disabled).toBe(true)
      ;(document.querySelector('[data-reading=ko]') as HTMLButtonElement).click()
      expect(document.getElementById('reading-ko')!.hidden).toBe(false)
      expect(document.querySelectorAll('[data-claim-id]').length).toBe(review.documents.reduce((n, d) => n + d.reviewedClaims.length, 0))
      if (kind !== 'bundle') expect(document.querySelector('#reading-compare details summary')?.textContent).toContain('핵심 문장 대조')
      expect(fetcher).toHaveBeenCalledTimes(1)
    } finally { dom.window.close() }
  })
})
