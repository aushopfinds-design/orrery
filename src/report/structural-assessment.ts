/**
 * FATE KEY qualitative review policy r1, not a consensus school or a validated forecast.
 * Month-root-exposure agreement is required; contradictions and special cases are deferred.
 * Counts remain evidence. No numeric weights, probability, transformation or lucky score.
 */
import type { SajuResult, DaewoonItem } from '@orrery/core/types'
import { getHiddenStems, getJeonggi, getRelation } from '@orrery/core/pillars'
import { STEM_ELEMENTS } from './reading.ts'
import { availablePillars, godText, natalPatterns, pairObservation, POSITION } from './traditional-analysis.ts'
import { resolveStructure } from './structure-resolution.ts'

export const STRUCTURE_POLICY = 'FATE-qualitative-r1'
const SUPPORT = new Set(['比肩', '劫財', '正印', '偏印'])
const PEERS = new Set(['比肩', '劫財'])
export type StrengthTendency = 'supported' | 'support-needed' | 'mixed' | 'deferred'
export interface StrengthSignals {
  unknownTime: boolean
  seasonalSupport: boolean
  principalRoot: boolean
  anyRoot: boolean
  exposedSupport: boolean
  exposedDemand: boolean
  exceptional: boolean
}
/** Explicit conjunctions, not a fabricated weighted total. Other schools may disagree. */
export function classifyStrength(s: StrengthSignals): StrengthTendency {
  if (s.unknownTime || s.exceptional) return 'deferred'
  if (s.seasonalSupport && s.principalRoot && s.exposedSupport) return 'supported'
  if (!s.seasonalSupport && !s.anyRoot && s.exposedDemand && s.exposedSupport) return 'support-needed'
  return 'mixed'
}
export function structuralFacts(result: SajuResult) {
  const day = result.pillars[1].pillar.stem, month = result.pillars[2]
  const positions = availablePillars(result)
  const exposed = positions.filter(item => item.index !== 1).map(({ pillar, index }) => ({ stem: pillar.pillar.stem, god: pillar.stemSipsin, position: POSITION[index] }))
  const hidden = positions.flatMap(({ pillar, index }) => [...getHiddenStems(pillar.pillar.branch).replace(/\s/g, '')].map(stem => ({ stem, god: getRelation(day, stem)!.hanja, position: POSITION[index], branch: pillar.pillar.branch, principal: stem === getJeonggi(pillar.pillar.branch) })))
  const roots = hidden.filter(item => STEM_ELEMENTS[item.stem] === STEM_ELEMENTS[day])
  const seasonalGod = getRelation(day, getJeonggi(month.pillar.branch))!.hanja
  const monthlyHidden = [...getHiddenStems(month.pillar.branch).replace(/\s/g, '')].map(stem => ({ stem, god: getRelation(day, stem)!.hanja, exposedAt: exposed.filter(item => item.stem === stem).map(item => item.position) }))
  const exposedMonthly = monthlyHidden.filter(item => item.exposedAt.length)
  const principal = exposedMonthly.find(item => item.stem === getJeonggi(month.pillar.branch))
  // A peer-led month and competing exposed stems need separate structure rules.
  const patternCandidate = !PEERS.has(seasonalGod) ? principal ?? (exposedMonthly.length === 1 && !PEERS.has(exposedMonthly[0].god) ? exposedMonthly[0] : undefined) : undefined
  const groups = natalPatterns(result).groups
  const noSupport = !hidden.some(item => SUPPORT.has(item.god)) && !exposed.some(item => SUPPORT.has(item.god))
  const noDemand = hidden.every(item => SUPPORT.has(item.god)) && exposed.every(item => SUPPORT.has(item.god))
  const exceptional = noSupport || noDemand || groups.some(item => item.type === '三合' || item.type === '方合')
  const signals: StrengthSignals = { unknownTime: !!result.input.unknownTime, seasonalSupport: SUPPORT.has(seasonalGod), principalRoot: roots.some(item => item.principal), anyRoot: !!roots.length, exposedSupport: exposed.some(item => SUPPORT.has(item.god)), exposedDemand: exposed.some(item => !SUPPORT.has(item.god)), exceptional }
  const tendency = classifyStrength(signals)
  return { policy: STRUCTURE_POLICY, day, month, seasonalGod, exposed, hidden, roots, monthlyHidden, patternCandidate, groups, noSupport, noDemand, signals, tendency }
}
export function structuralAssessment(result: SajuResult) {
  return englishStructuralAssessment(structuralFacts(result))
}
export function englishStructuralAssessment(facts: ReturnType<typeof structuralFacts>) {
  const { month, seasonalGod, exposed, hidden, roots, monthlyHidden, patternCandidate, groups, noSupport, noDemand, signals, tendency } = facts
  const cautiousReasons = [
    ...(signals.unknownTime ? ['The birth hour is unknown; the missing support or demand could change the assessment.'] : []),
    ...(noSupport ? ['No checked supporting relationship is present. A following structure must be examined before applying an ordinary weak-chart rule.'] : []),
    ...(noDemand ? ['Only supporting relationships are present in the checked layers. A dominant structure must be examined before applying an ordinary strong-chart rule.'] : []),
    ...(groups.some(item => item.type === '三合' || item.type === '方合') ? ['A complete branch combination is present. Element transformation is not assumed, so an ordinary balance verdict is deferred.'] : []),
  ]
  const evidence = [
    `Policy ${STRUCTURE_POLICY}. Month branch ${month.pillar.branch}; principal stem ${getJeonggi(month.pillar.branch)}; relationship ${seasonalGod}; seasonal support ${signals.seasonalSupport}.`,
    ...exposed.map(item => `Exposed ${item.position} stem ${item.stem}: ${item.god}; ${SUPPORT.has(item.god) ? 'support' : 'output, management or control'}.`),
    ...roots.map(item => `Root: ${item.stem} inside ${item.position} branch ${item.branch}; ${item.principal ? 'principal' : 'secondary'} hidden stem.`),
    ...(roots.length ? [] : ['No same-element root in the supplied branches.']),
    ...monthlyHidden.map(item => `Month hidden stem ${item.stem}: ${item.god}; exposed at ${item.exposedAt.join(', ') || 'no checked non-day stem'}.`),
    ...cautiousReasons,
  ]
  const verdict = tendency === 'supported'
    ? 'The day element leans well supported under this conservative rule: the month supports it, a principal root is present and support also appears in an exposed stem.'
    : tendency === 'support-needed'
      ? 'The day element leans towards needing support under this conservative rule: the month does not support it, no same-element root is present and exposed stems contain both support and demands.'
      : tendency === 'deferred'
        ? 'A strong-or-weak verdict is deferred because the available chart requires an exception check or has an unknown birth hour.'
        : 'The support signals are mixed. This rule does not reduce the chart to a strong-or-weak label when season, roots and exposed relationships do not agree.'
  const rootText = roots.length ? `Same-element roots occur in ${[...new Set(roots.map(item => `${item.position} branch ${item.branch}${item.principal ? ' (principal root)' : ' (secondary root)'}`))].join('; ')}. These locations are distinguished rather than counted as equally strong.` : 'No same-element root occurs in the supplied branches. A lack of roots alone does not establish a following structure or a weak chart.'
  const patternText = patternCandidate
    ? `A provisional month-led structure candidate is ${godText(patternCandidate.god).name}: hidden stem ${patternCandidate.stem} also appears in the ${patternCandidate.exposedAt.join(' and ')} stem. This is a candidate, not confirmation that the structure succeeds or that its element is beneficial.`
    : PEERS.has(seasonalGod)
      ? 'The month is peer-led. An ordinary money, authority, output or resource structure is not assigned; peer-month and special-structure rules need separate judgement.'
      : 'The month-hidden exposure check does not establish one clear ordinary structure candidate. The report keeps the competing or unexposed stems visible instead of choosing a label arbitrarily.'
  const balanceText = tendency === 'supported'
    ? 'Under a support-versus-demand balancing approach, output, money-management and responsibility relationships are candidates for using the available support. They are a candidate group, not three confirmed favourable elements or a unique useful element.'
    : tendency === 'support-needed'
      ? 'Under a support-versus-demand balancing approach, resource and peer relationships are candidates for adding support before taking on more money or responsibility. No single useful element has been selected from that group.'
      : 'No balancing-element preference is assigned while the support judgement is unresolved. A missing element is not automatically a useful element.'
  const paragraphs = [verdict, `The month’s principal hidden relationship is ${godText(seasonalGod).name}. This describes one seasonal support signal; it does not include the full seasonal climate or a weighted strength score.`, rootText, patternText, balanceText, ...cautiousReasons]
  return { policy: STRUCTURE_POLICY, tendency, signals, exposed, hidden, roots, monthlyHidden, patternCandidate, evidence, paragraphs, verdict, balanceText }
}
/** Compare exact calculated wall-clock starts, not just the start year. */
export function activeCycleAt(result: SajuResult, reference: Date): DaewoonItem | undefined {
  const ordered = [...result.daewoon].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  return ordered.find((cycle, index) => {
    const end = ordered[index + 1]?.startDate ?? new Date(Date.UTC(cycle.startDate.getUTCFullYear() + 10, cycle.startDate.getUTCMonth(), cycle.startDate.getUTCDate(), cycle.startDate.getUTCHours(), cycle.startDate.getUTCMinutes()))
    return reference >= cycle.startDate && reference < end
  })
}
export function periodAssessment(result: SajuResult, pillar: string, date: string, yearPillar = pillar) {
  const natal = structuralFacts(result), day = result.pillars[1].pillar.stem
  const reference = new Date(date + 'T12:00:00Z') // shared Asia/Seoul comparison wall-clock representation, as in core DaewoonItem
  const cycle = activeCycleAt(result, reference)
  const god = getRelation(day, pillar[0])!.hanja, inner = getRelation(day, getJeonggi(pillar[1]))!.hanja
  const referenceSupport = [god, inner].every(item => SUPPORT.has(item)), referenceDemand = [god, inner].every(item => !SUPPORT.has(item))
  const cycleSupport = cycle && [cycle.stemSipsin, cycle.branchSipsin].every(item => SUPPORT.has(item))
  const cycleDemand = cycle && [cycle.stemSipsin, cycle.branchSipsin].every(item => !SUPPORT.has(item))
  const cyclePair = cycle ? pairObservation(pillar, cycle.ganzi, 'Reference / active ten-year cycle') : undefined
  const annualPair = pillar !== yearPillar ? pairObservation(pillar, yearPillar, 'Month / sampled year') : undefined
  const natals = availablePillars(result).map(({ pillar: p, index }) => ({ index, ...pairObservation(pillar, p.pillar.ganzi, `Reference / birth ${POSITION[index]}`) }))
  const tension = [...natals, ...(cyclePair ? [cyclePair] : []), ...(annualPair ? [annualPair] : [])].some(item => item.found.some(p => ['沖', '刑', '害', '破'].includes(p.type)))
  // Never call an incomplete three-pillar chart favourable; one sampling point is not an entire month/year.
  const direction = natal.tendency === 'deferred' || natal.tendency === 'mixed' || !cycle || result.input.unknownTime
    ? 'unresolved'
    : natal.tendency === 'support-needed'
      ? referenceSupport && cycleSupport ? 'potential-support' : referenceDemand && cycleDemand ? 'added-demand' : 'mixed'
      : referenceDemand && cycleDemand ? 'potential-outlet' : referenceSupport && cycleSupport ? 'added-support' : 'mixed'
  const balance = { unresolved: 'No favourable-or-unfavourable verdict is assigned: the natal balance or an active longer cycle is unresolved.', 'potential-support': 'Both the active cycle and this reference add supporting relationships to a chart that leans towards needing support. This is a potentially supportive combination within the stated rule, not a forecast of success.', 'added-demand': 'Both the active cycle and this reference add demands to a chart that leans towards needing support. More money-related activity can therefore be read as a heavier responsibility rather than an automatically better outcome.', 'potential-outlet': 'Both the active cycle and this reference add output, management or responsibility to a chart that leans supported. This can provide an outlet for its support, provided real skills and capacity match the obligation.', 'added-support': 'Both timing layers add support to a chart that already leans supported. The caution is reinforcing preparation, independence or competition without a clear outlet; more support is not automatically a better financial period.', mixed: 'The active cycle and this reference do not give one consistent support-versus-demand direction. The reading keeps the opportunity and its burden separate.' }[direction]
  const resolved = resolveStructure(natal), preferred = resolved.useful.element
  const usefulComparison = { element: preferred, referenceElements: [STEM_ELEMENTS[pillar[0]], STEM_ELEMENTS[getJeonggi(pillar[1])]], cycleElements: cycle ? [STEM_ELEMENTS[cycle.ganzi[0]], STEM_ELEMENTS[getJeonggi(cycle.ganzi[1])]] : [] }
  const preferenceText = preferred ? ` The conditional balancing preference is ${preferred}. The reference contains ${usefulComparison.referenceElements.join(' / ')}; the active cycle contains ${usefulComparison.cycleElements.join(' / ') || 'no available element comparison'}. Sharing a preferred element does not cancel friction or guarantee a favourable result.` : ''
  const text = `${date}: ${balance} ${tension ? 'A checked clash, punishment, harm or break adds structural friction; a supportive balance reading therefore still has a caution.' : 'No checked clash, punishment, harm or break adds a separate friction signal at this reference; this is not a guarantee of an easy period.'}${preferenceText}`
  const evidence = [`Assessment ${STRUCTURE_POLICY}: natal ${natal.tendency}; reference ${pillar} (${god} / ${inner}); direction ${direction}; friction ${tension}.`, cycle ? `Active cycle at ${date} 12:00 shared comparison wall clock: ${cycle.ganzi}; ${result.input.unknownTime ? 'approximate calculated start (birth hour unknown)' : 'calculated start'} ${cycle.startDate.toISOString()}.` : `No active ten-year cycle at ${date} in the calculated range.`, ...(cyclePair ? [cyclePair.facts] : []), ...(annualPair ? [annualPair.facts] : [])]
  return { direction, text, evidence, cycle, tension, cyclePair, annualPair, usefulComparison }
}
