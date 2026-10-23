import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { SajuResult } from '@orrery/core/types'
import { getHiddenStems, getJeonggi, getRelation } from '@orrery/core/pillars'
import { activeCycleAt, classifyStrength, structuralAssessment, periodAssessment } from './structural-assessment.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading, buildBundleReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
const base = calculateSaju(CATEGORY_SCENARIOS[0].first)
/** Synthetic symbol fixtures test the disclosed rule; they are not birth-date or event forecasts. */
function symbolic(pillars: string[]): SajuResult {
  const day = pillars[1][0]
  return { ...base, input: { ...base.input, unknownTime: false }, pillars: pillars.map((ganzi, i) => ({ ...base.pillars[i], pillar: { ganzi, stem: ganzi[0], branch: ganzi[1] }, stemSipsin: i === 1 ? '本元' : getRelation(day, ganzi[0])!.hanja, branchSipsin: getRelation(day, getJeonggi(ganzi[1]))!.hanja, jigang: getHiddenStems(ganzi[1]) })) as SajuResult['pillars'] }
}
const supported = symbolic(['丙午', '甲寅', '甲寅', '壬子'])
const needsSupport = symbolic(['丁巳', '甲午', '庚申', '癸酉'])
function withCycle(chart: SajuResult, ganzi: string) {
  return { ...chart, daewoon: [{ ...base.daewoon[0], ganzi, stemSipsin: getRelation(chart.pillars[1].pillar.stem, ganzi[0])!.hanja, branchSipsin: getRelation(chart.pillars[1].pillar.stem, getJeonggi(ganzi[1]))!.hanja, startDate: new Date('2020-09-20T15:00:00Z') }] }
}
describe('Conservative structural policy: no scores or unsupported definitive useful element', () => {
  it('distinguishes independent season, principal root, secondary root and exposure evidence', () => {
    const strong = structuralAssessment(supported), weak = structuralAssessment(needsSupport)
    expect(strong.tendency).toBe('supported')
    expect(strong.signals.seasonalSupport).toBe(true)
    expect(strong.roots.some(item => item.principal && item.position === 'day')).toBe(true)
    expect(weak.tendency).toBe('support-needed')
    expect(weak.signals.seasonalSupport).toBe(false)
    expect(weak.roots).toEqual([])
    expect(weak.exposed.some(item => item.god === '正印')).toBe(true)
    expect(weak.balanceText).toContain('No single useful element')
  })
  it('defers a following/dominant possibility and a complete combination', () => {
    const following = symbolic(['丁巳', '甲午', '辛酉', '戊戌'])
    expect(structuralAssessment(following).tendency).toBe('deferred')
    expect(structuralAssessment(following).evidence.join(' ')).toContain('following structure')
    const combined = symbolic(['庚子', '甲午', '丙寅', '戊戌'])
    expect(structuralAssessment(combined).tendency).toBe('deferred')
    expect(structuralAssessment(combined).evidence.join(' ')).toContain('transformation is not assumed')
  })
  it('does not equate the same element with an exposed identical hidden stem', () => {
    const notExposed = symbolic(['癸亥', '甲午', '丁申', '辛酉'])
    expect(structuralAssessment(notExposed).patternCandidate).toBeUndefined()
    const exposed = symbolic(['癸亥', '甲午', '丁申', '庚酉'])
    const candidate = structuralAssessment(exposed).patternCandidate!
    expect(candidate.stem).toBe('庚')
    expect(candidate.exposedAt).toEqual(['year'])
    expect(candidate.god).toBe('偏官')
    expect(structuralAssessment(exposed).paragraphs.join(' ')).toContain('not confirmation')
  })
  it('does not force contradictory signals into a binary label', () => {
    expect(classifyStrength({ unknownTime: false, seasonalSupport: true, principalRoot: false, anyRoot: true, exposedSupport: true, exposedDemand: true, exceptional: false })).toBe('mixed')
    expect(classifyStrength({ unknownTime: true, seasonalSupport: true, principalRoot: true, anyRoot: true, exposedSupport: true, exposedDemand: false, exceptional: false })).toBe('deferred')
  })
  it('selects the active cycle at the exact calculated start and excludes the end', () => {
    const chart = withCycle(needsSupport, '丁巳')
    expect(activeCycleAt(chart, new Date('2020-09-20T14:59:59Z'))).toBeUndefined()
    expect(activeCycleAt(chart, new Date('2020-09-20T15:00:00Z'))?.ganzi).toBe('丁巳')
    expect(activeCycleAt(chart, new Date('2030-09-20T15:00:00Z'))).toBeUndefined()
    expect(activeCycleAt(chart, new Date('2020-07-15T12:00:00Z'))).toBeUndefined()
  })
  it('reads the same money reference differently for supported and support-needed charts', () => {
    const a = periodAssessment(withCycle(supported, '丁巳'), '戊戌', '2027-07-15')
    const b = periodAssessment(withCycle(needsSupport, '丁巳'), '戊戌', '2027-07-15')
    expect(a.direction).toBe('potential-outlet')
    expect(b.direction).toBe('added-demand')
    expect(b.text).toContain('heavier responsibility')
    expect(a.text).not.toBe(b.text)
    expect(a.text).not.toMatch(/will earn|guaranteed|\d+%/)
  })
  it('retains friction and checks month/year/cycle separately from the balance direction', () => {
    const chart = withCycle(needsSupport, '壬子')
    const p = periodAssessment(chart, '壬子', '2027-01-15', '丙午')
    expect(p.direction).toBe('potential-support')
    expect(p.tension).toBe(true)
    expect(p.text).toContain('still has a caution')
    expect(p.evidence.join(' ')).toContain('Reference / active ten-year cycle')
    expect(p.evidence.join(' ')).toContain('Month / sampled year: 壬子 / 丙午')
  })
  it('never produces a balancing preference or favourable verdict from an unknown hour', () => {
    const one = { ...supported, input: { ...supported.input, unknownTime: true } }
    const two = { ...one, pillars: [needsSupport.pillars[0], ...one.pillars.slice(1)] as SajuResult['pillars'] }
    expect(structuralAssessment(one)).toEqual(structuralAssessment(two))
    expect(structuralAssessment(one).tendency).toBe('deferred')
    expect(periodAssessment(withCycle(one, '壬子'), '壬子', '2027-07-15').direction).toBe('unresolved')
  })
})
describe('24 international charts: structural evidence reaches all seven purchased outputs', () => {
  it('keeps calculated source features, scope and uncertainty in every product', () => {
    const states = new Set<string>()
    for (let i = 0; i < 24; i++) {
      const chart = calculateSaju({ ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: 5 + i % 20, unknownTime: i % 5 === 0 })
      const other = calculateSaju(CATEGORY_SCENARIOS[1].second)
      const assessment = structuralAssessment(chart); states.add(assessment.tendency)
      const complete = buildCompleteReading(chart, 2026)
      const focused = (['career', 'business', 'year', 'wellbeing', 'compatibility'] as const).map(kind => buildCategoryReading(kind, chart, { year: 2027, second: kind === 'compatibility' ? other : undefined }))
      for (const report of [complete, ...focused]) {
        expect(report.fullText).toContain('FATE-qualitative-r1')
        expect(report.fullText).toContain(assessment.verdict)
        for (const stem of assessment.monthlyHidden) expect(report.chapters[0].evidence.join(' ')).toContain(`Month hidden stem ${stem.stem}: ${stem.god}`)
        expect(report.fullText).not.toMatch(/undefined|NaN|\d+%/)
      }
      const bundle = buildBundleReading(chart, other, 2027, 2026)
      expect(bundle.fullText).toContain(assessment.verdict)
      expect(bundle.fullText.match(/Your Everyday Compass/g)).toHaveLength(1)
    }
    expect(states.size).toBeGreaterThanOrEqual(3)
  })
})
