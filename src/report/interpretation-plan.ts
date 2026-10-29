import { selectedCycles } from './category-shared.ts'
import type { SajuResult } from '@orrery/core/types'
import { getRelation, analyzePillarRelations } from '@orrery/core/pillars'
import { STEM_ELEMENTS, BRANCH_ELEMENTS } from './reading.ts'
import { BUYER_OUTLINES } from './buyer-outline.ts'
import type { BuyerOutlineKind } from './buyer-outline.ts'
import { natalAnalysis, natalPatterns, fiveYearPoints, monthlyPoint, POSITION } from './traditional-analysis.ts'
import { resolveStructure } from './structure-resolution.ts'
import { structuralFacts, periodAssessment } from './structural-assessment.ts'

/** Shared facts/codes, not an English draft or a Korean draft. No provider calls. */
function subjectPlan(chart: SajuResult) {
  const n = natalAnalysis(chart), a = structuralFacts(chart)
  return { dayStem: n.day.pillar.stem, dayBranch: n.day.pillar.branch, monthStemGod: n.month.stemSipsin, monthBranchGod: n.month.branchSipsin,
    dayBranchGod: n.day.branchSipsin, yearStemGod: chart.pillars[3].stemSipsin,
    strength: a, resolution: resolveStructure(a),
    elements: (['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const).map(element => ({ element, count: n.available.flatMap(({ pillar }) => [STEM_ELEMENTS[pillar.pillar.stem], BRANCH_ELEMENTS[pillar.pillar.branch]]).filter(value => value === element).length })),
    positions: n.available.map(({ pillar, index }) => ({ position: POSITION[index], ganzi: pillar.pillar.ganzi, stemGod: index === 1 ? null : pillar.stemSipsin, principalGod: pillar.branchSipsin })),
    visibleMoney: n.available.flatMap(({ pillar, index }) => [...(index === 1 ? [] : [{ god: pillar.stemSipsin, position: POSITION[index], part: 'stem' }]), { god: pillar.branchSipsin, position: POSITION[index], part: 'principal' }]).filter(item => ['正財', '偏財'].includes(item.god)),
    hiddenMoney: a.hidden.filter(item => ['正財', '偏財'].includes(item.god)),
    repeated: n.repeated.map(item => ({ god: item.god, count: item.count })),
    relations: natalPatterns(chart).pairs.map(pair => ({ patterns: pair.found.map(item => ({ type: item.type, detail: item.detail, layer: item.layer })) })),
  }
}
function timingPlan(chart: SajuResult, p: ReturnType<typeof monthlyPoint>) {
  const a = periodAssessment(chart, p.pillar, p.date, p.yearPillar)
  return { date: p.date, pillar: p.pillar, yearPillar: p.yearPillar, god: p.god, innerGod: p.innerGod,
    direction: a.direction, friction: a.tension, balancingComparison: a.usefulComparison, activeCycle: a.cycle ? { ganzi: a.cycle.ganzi, start: a.cycle.startDate.toISOString(), stemGod: a.cycle.stemSipsin, branchGod: a.cycle.branchSipsin } : null,
    clashes: p.clash.map(item => POSITION[item.index]),
    comparisons: p.comparisons.map(item => ({ position: POSITION[item.index], patterns: item.found.map(pattern => ({ type: pattern.type, detail: pattern.detail, layer: pattern.layer })) })),
  }
}
export function buildInterpretationPlan(kind: BuyerOutlineKind, first: SajuResult, year: number, second?: SajuResult) {
  if (!Number.isInteger(year) || year < first.input.year || year < 1900 || year > 2100) throw new Error('Invalid interpretation year')
  if (kind === 'compatibility' && !second) throw new Error('Two birth charts are needed for compatibility')
  if (second && year < second.input.year) throw new Error('Invalid partner reference year')
  const primary = subjectPlan(first), partner = second ? subjectPlan(second) : null
  const annual = fiveYearPoints(first, year).map(p => timingPlan(first, p))
  return { schema: 'FATE-interpretation-plan-v1', kind, referenceYear: year, includeReadingNotice: true,
    // Original calculated charts are language-neutral source data; neither writer recalculates birth pillars.
    first, second,
    primary, partner,
    pairPatterns: partner ? primary.positions.flatMap(left => partner.positions.map(right => { const pair = analyzePillarRelations(left.ganzi, right.ganzi); return { left: left.position, right: right.position, leftPillar: left.ganzi, rightPillar: right.ganzi, patterns: [...pair.stem.map(p => ({ ...p, layer: 'stem' })), ...pair.branch.filter(p => !(p.type === '刑' && ['無恩', '恃勢'].includes(p.detail ?? ''))).map(p => ({ ...p, layer: 'branch' }))] } })) : [],
    sections: BUYER_OUTLINES[kind].map(([id]) => ({ id })), annual,
    partnerAnnual: second ? fiveYearPoints(second, year).map(p => timingPlan(second, p)) : [],
    months: kind === 'year' ? Array.from({ length: 12 }, (_, i) => timingPlan(first, monthlyPoint(first, year, i + 1))) : [],
    directions: second ? { aToB: getRelation(first.pillars[1].pillar.stem, second.pillars[1].pillar.stem)!.hanja, bToA: getRelation(second.pillars[1].pillar.stem, first.pillars[1].pillar.stem)!.hanja } : null,
    selectedCycles: selectedCycles(first, year).map(cycle => ({ ganzi: cycle.ganzi, start: cycle.startDate.toISOString(), next: first.daewoon[first.daewoon.indexOf(cycle) + 1]?.startDate.toISOString() ?? null, stemGod: cycle.stemSipsin, branchGod: cycle.branchSipsin })),
    cycles: first.daewoon.map((cycle, index) => ({ ganzi: cycle.ganzi, start: cycle.startDate.toISOString(), next: first.daewoon[index + 1]?.startDate.toISOString() ?? null, stemGod: cycle.stemSipsin, branchGod: cycle.branchSipsin })),
  }
}
export type InterpretationPlan = ReturnType<typeof buildInterpretationPlan>
export function bundleInterpretationPlans(first: SajuResult, second: SajuResult, annualYear: number, referenceYear: number) {
  return { complete: buildInterpretationPlan('complete', first, referenceYear), compatibility: { ...buildInterpretationPlan('compatibility', first, referenceYear, second), includeReadingNotice: false }, annual: { ...buildInterpretationPlan('year', first, annualYear), includeReadingNotice: false }, career: { ...buildInterpretationPlan('career', first, referenceYear), includeReadingNotice: false }, love: { ...buildInterpretationPlan('love', first, referenceYear), includeReadingNotice: false } }
}
