import type { SajuResult } from '@orrery/core/types'
import { getHiddenStems, getRelation } from '@orrery/core/pillars'
import { buildFreeReading } from './complete-reading.ts'
import { GODS, availablePillars, natalAnalysis, pairObservation, timingPoint } from './traditional-analysis.ts'
import { periodAssessment, structuralFacts } from './structural-assessment.ts'
import { resolveStructure } from './structure-resolution.ts'

const POSITION_NAMES = ['Hour', 'Day', 'Month', 'Year'] as const
const MONEY = new Set(['正財', '偏財'])
const OUTPUT = new Set(['食神', '傷官'])
const AUTHORITY = new Set(['正官', '偏官'])
const RESOURCES = new Set(['正印', '偏印'])
const PEERS = new Set(['比肩', '劫財'])
const GOD_NAMES: Record<string, string> = {
  比肩: 'Independence', 劫財: 'Shared resources', 食神: 'Steady output', 傷官: 'Expression',
  正財: 'Regular income', 偏財: 'Commercial openings', 正官: 'Formal responsibility', 偏官: 'Decisive pressure',
  正印: 'Learning and support', 偏印: 'Specialist insight',
}

export function careerMoneyChartData(result: SajuResult, referenceYear: number) {
  const natal = natalAnalysis(result), strength = structuralFacts(result), structure = resolveStructure(strength)
  const visibleCounts = Object.keys(GODS).map(god => ({ god, label: GOD_NAMES[god] ?? god, count: natal.visible.filter(item => item.god === god).length }))
  const hiddenCounts = Object.keys(GODS).map(god => ({ god, label: GOD_NAMES[god] ?? god, count: natal.hidden.filter(item => item.god === god).length }))
  const pillars = availablePillars(result).map(({ pillar, index }) => ({
    position: POSITION_NAMES[index], ganzi: pillar.pillar.ganzi, stem: pillar.pillar.stem,
    stemGod: index === 1 ? 'Day Master' : GOD_NAMES[pillar.stemSipsin] ?? pillar.stemSipsin,
    branch: pillar.pillar.branch, branchGod: GOD_NAMES[pillar.branchSipsin] ?? pillar.branchSipsin,
    hidden: [...getHiddenStems(pillar.pillar.branch).replace(/\s/g, '')].map(stem => ({ stem, god: GOD_NAMES[getRelation(result.pillars[1].pillar.stem, stem)!.hanja] ?? getRelation(result.pillars[1].pillar.stem, stem)!.hanja })),
  }))
  const moneyEvidence = natal.visible.filter(item => MONEY.has(item.god)).map(item => ({ label: GOD_NAMES[item.god], source: item.source }))
  const hiddenMoneyEvidence = natal.hidden.filter(item => MONEY.has(item.god)).map(item => ({ label: GOD_NAMES[item.god], source: item.source }))
  const circuit = (code: string) => structure.circuits.find(item => item.code === code)
  const monthGods = [result.pillars[2].stemSipsin, result.pillars[2].branchSipsin]
  const chartSkills = availablePillars(result).flatMap(({ pillar }) => [pillar.stemSipsin, pillar.branchSipsin])
  const has = (set: Set<string>) => chartSkills.some(god => set.has(god))
  const cycles = result.daewoon.map((cycle, index) => {
    const next = result.daewoon[index + 1]
    const startYear = cycle.startDate.getUTCFullYear(), endYear = next ? next.startDate.getUTCFullYear() : startYear + 10
    const relation = pairObservation(cycle.ganzi, result.pillars[2].pillar.ganzi, 'Ten-year cycle / birth-month comparison')
    return { ganzi: cycle.ganzi, start: cycle.startDate.toISOString().slice(0, 10), end: next?.startDate.toISOString().slice(0, 10) ?? null,
      span: `${startYear}–${endYear}`, stemGod: GOD_NAMES[cycle.stemSipsin] ?? cycle.stemSipsin, branchGod: GOD_NAMES[cycle.branchSipsin] ?? cycle.branchSipsin,
      workTheme: GODS[cycle.stemSipsin]?.work ?? '', moneyTheme: GODS[cycle.stemSipsin]?.money ?? '', relation: relation.text, evidence: relation.facts }
  })
  const years = Array.from({ length: Math.min(10, 2101 - referenceYear) }, (_, index) => {
    const year = referenceYear + index, point = timingPoint(result, year), assessment = periodAssessment(result, point.pillar, point.date, point.yearPillar)
    const activeCycle = assessment.cycle
    const natalWork = GODS[monthGods[0]]?.work ?? ''
    const activeCycleLabel = activeCycle ? `${activeCycle.ganzi} (${GOD_NAMES[activeCycle.stemSipsin] ?? activeCycle.stemSipsin} / ${GOD_NAMES[activeCycle.branchSipsin] ?? activeCycle.branchSipsin})` : 'No calculated cycle in range'
    const moneyThemes = [point.god, point.innerGod].filter(god => MONEY.has(god)).map(god => GOD_NAMES[god])
    const caution = assessment.tension ? 'A checked clash, punishment, harm or break calls for closer review.' : 'No checked clash, punishment, harm or break at this reference point.'
    const direction = assessment.direction === 'potential-support' || assessment.direction === 'potential-outlet' ? 'Potential support / outlet under the stated rule'
      : assessment.direction === 'added-demand' ? 'Added demand under the stated rule'
        : assessment.direction === 'added-support' ? 'More support; not automatically favourable' : 'Mixed or unresolved'
    return { year, pillar: point.pillar, stemGod: GOD_NAMES[point.god] ?? point.god, branchGod: GOD_NAMES[point.innerGod] ?? point.innerGod,
      work: `${GODS[point.god]?.work ?? ''} ${natalWork}`.trim(), money: moneyThemes.length ? `${moneyThemes.join(' and ')} appears at this annual reference. This is a theme, not an income forecast.` : `${GODS[point.god]?.money ?? ''} No direct regular- or opportunity-money symbol appears at this annual reference.`,
      cycle: activeCycleLabel, direction, caution, evidence: assessment.evidence, tension: assessment.tension }
  })
  const elementSnapshot = buildFreeReading(result)
  const employmentSignals = [
    { label: 'Structured roles', present: has(AUTHORITY), note: has(AUTHORITY) ? 'Formal responsibility or demanding targets appear in the checked Ten Gods.' : 'No authority relationship appears in the checked principal positions.' },
    { label: 'Training and expertise', present: has(RESOURCES), note: has(RESOURCES) ? 'Learning, documentation or specialist support appears in the checked Ten Gods.' : 'No resource relationship appears in the checked principal positions.' },
  ]
  const independentSignals = [
    { label: 'Making and selling work', present: has(OUTPUT) && has(MONEY), note: has(OUTPUT) && has(MONEY) ? 'Output and a money relationship both appear in the checked principal positions.' : 'The complete output-to-money route is not both visible in the checked principal positions.' },
    { label: 'Autonomy and shared resources', present: has(PEERS), note: has(PEERS) ? 'Peer relationships are present; ownership, credit and shared costs deserve clear terms.' : 'No peer relationship appears in the checked principal positions.' },
  ]
  return {
    unknownTime: !!result.input.unknownTime,
    pillars,
    elements: elementSnapshot.elements,
    elementTotal: elementSnapshot.visibleMarkers,
    dayMaster: natal.day.pillar.stem,
    strength: strength.tendency,
    strengthEvidence: [strength.signals.seasonalSupport ? 'The month’s principal hidden stem supports the Day Master element.' : 'The month’s principal hidden stem does not support the Day Master element.', strength.roots.length ? `Same-element roots are present in ${[...new Set(strength.roots.map(root => `${root.position} branch ${root.branch}`))].join(', ')}.` : 'No same-element roots are present in the available branches.', strength.signals.exposedSupport ? 'Support also appears among exposed stems.' : 'Support does not appear among exposed stems.', ...(result.input.unknownTime ? ['Birth time is unknown; strength is deferred and the hour is excluded.'] : [])],
    visibleCounts, hiddenCounts, moneyEvidence, hiddenMoneyEvidence,
    incomeRoutes: [
      { from: 'Skills and output', to: 'Money and customers', present: !!circuit('output-to-money'), gods: circuit('output-to-money')?.evidence.map(item => GOD_NAMES[item.god] ?? item.god) ?? [] },
      { from: 'Money and resources', to: 'Formal responsibility', present: !!circuit('money-to-authority'), gods: circuit('money-to-authority')?.evidence.map(item => GOD_NAMES[item.god] ?? item.god) ?? [] },
      { from: 'Responsibility', to: 'Learning and support', present: !!circuit('authority-to-resource'), gods: circuit('authority-to-resource')?.evidence.map(item => GOD_NAMES[item.god] ?? item.god) ?? [] },
    ],
    structureStatus: structure.useful.status === 'conditional' ? `Conditional route: ${structure.useful.route}` : `No single balancing route assigned (${structure.useful.reasons.join(', ') || 'evidence incomplete'})`,
    employmentSignals, independentSignals,
    monthStemGod: GOD_NAMES[monthGods[0]] ?? monthGods[0], monthBranchGod: GOD_NAMES[monthGods[1]] ?? monthGods[1],
    cycles, years,
    caveat: result.input.unknownTime ? 'The hour pillar is excluded. Starting dates for ten-year cycles are approximate without a birth time.' : 'Ten-year cycle dates follow the supplied birth details and the engine’s stated time convention.',
  }
}
