import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import type { SajuResult } from '@orrery/core/types'
import { getHiddenStems, getJeonggi, getRelation } from '@orrery/core/pillars'
import { structuralFacts } from './structural-assessment.ts'
import { resolveStructure } from './structure-resolution.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
const base = calculateSaju(CATEGORY_SCENARIOS[0].first)
function symbols(pillars: string[]) {
  const day = pillars[1][0]
  return { ...base, input: { ...base.input, unknownTime: false }, pillars: pillars.map((ganzi, i) => ({ ...base.pillars[i], pillar: { ganzi, stem: ganzi[0], branch: ganzi[1] }, stemSipsin: i === 1 ? '本元' : getRelation(day, ganzi[0])!.hanja, branchSipsin: getRelation(day, getJeonggi(ganzi[1]))!.hanja, jigang: getHiddenStems(ganzi[1]) })) as SajuResult['pillars'] }
}
const resolution = (chart: SajuResult) => resolveStructure(structuralFacts(chart))
describe('Bounded ordinary-chart resolution, not a forced lucky element', () => {
  it('distinguishes a month structure from its balancing preference with exact rooted evidence', () => {
    const chart = symbols(['壬申', '辛酉', '戊辰', '戊寅']), r = resolution(chart)
    expect(r.pattern.god).toBe('正印')
    expect(r.useful).toMatchObject({ status: 'conditional', element: 'Water', route: 'output-before-money', reasons: [] })
    expect(r.useful.witnesses.map(w => w.stem)).toEqual(['壬'])
    expect(r.patternAssessment.status).toBe('conditional-route')
    expect(r.patternSuccess).toBe('not-certified')
  })
  it('places rooted support before authority demand for an ordinary support-needed fixture', () => {
    const r = resolution(symbols(['癸丑', '甲午', '辛酉', '辛丑']))
    expect(r.useful).toMatchObject({ status: 'conditional', element: 'Water', route: 'resource-before-demand' })
    expect(r.patternAssessment.route).toBe('authority-to-resource')
  })
  it('does not convert resource/money coexistence, mixed authority or expression friction into success', () => {
    const r = resolution(symbols(['癸丑', '甲午', '辛酉', '己丑']))
    expect(r.risks.map(x => x.code)).toContain('money-versus-resource')
    expect(r.useful.element).toBeNull()
    expect(r.useful.reasons).toContain('competing-exposed-relationships')
  })
  it('keeps a combined month anchor and seasonal-climate uncertainty out of single-element preferences', () => {
    const combined = resolution(symbols(['癸亥', '庚申', '戊辰', '戊寅']))
    expect(combined.useful.reasons).toContain('anchor-stem-combination')
    const winter = resolution(symbols(['癸丑', '甲午', '壬子', '辛丑']))
    expect(winter.useful.reasons).toContain('climate-priority-unresolved')
    expect(winter.climatePrescription).toBeNull()
  })
  it('never uses the supplied placeholder hour to resolve an unknown-hour case', () => {
    const chart = symbols(['壬申', '庚申', '戊辰', '戊寅'])
    chart.input.unknownTime = true
    const other = { ...chart, pillars: [symbols(['丁巳', '庚申', '戊辰', '戊寅']).pillars[0], ...chart.pillars.slice(1)] as SajuResult['pillars'] }
    expect(resolution(chart)).toEqual(resolution(other))
    expect(resolution(chart).useful).toMatchObject({ status: 'withheld', element: null })
  })
  it.each(Array.from({ length: 24 }, (_, i) => i))('international chart %i retains a complete, explicit disposition', i => {
    const chart = calculateSaju({ ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: 5 + i % 20, unknownTime: i % 5 === 0 })
    const r = resolution(chart)
    expect(r.useful.status === 'conditional' ? !!r.useful.element && !r.useful.reasons.length : !r.useful.element && r.useful.reasons.length > 0).toBe(true)
    expect(JSON.stringify(r)).not.toMatch(/undefined|NaN|\d+%/)
    for (const route of [...r.circuits, ...r.risks]) expect(route.evidence.length).toBeGreaterThanOrEqual(2)
  })
})
