/** A bounded, reproducible ordinary-chart policy. Never a universal or event verdict. */
import { analyzePillarRelations } from '@orrery/core/pillars'
import { STEM_ELEMENTS } from './reading.ts'
import type { structuralFacts } from './structural-assessment.ts'

export const RESOLUTION_POLICY = 'FATE-ordinary-structure-r1'
type Facts = ReturnType<typeof structuralFacts>
const MONEY = ['正財', '偏財'], RESOURCE = ['正印', '偏印'], OUTPUT = ['食神', '傷官']
const ORDER = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const
/** Used below for an element relationship, never a count or a lucky-element prescription. */
export function resolveStructure(f: Facts) {
  const nodes = [...f.exposed.map(n => ({ ...n, layer: 'stem' })), ...f.hidden.filter(n => n.principal).map(n => ({ ...n, layer: 'principal' }))]
  const has = (...gods: string[]) => nodes.some(n => gods.includes(n.god))
  const exposed = (...gods: string[]) => f.exposed.some(n => gods.includes(n.god))
  const rootedExposed = (...gods: string[]) => f.exposed.filter(n => gods.includes(n.god) && f.hidden.some(root => root.stem === n.stem))
  const observed = (...gods: string[]) => nodes.filter(n => gods.includes(n.god)).map(n => ({ position: n.position, stem: n.stem, god: n.god, layer: n.layer }))
  const circuits: { code: string; evidence: ReturnType<typeof observed> }[] = []
  const risks: typeof circuits = []
  if (has(...OUTPUT) && has(...MONEY)) circuits.push({ code: 'output-to-money', evidence: observed(...OUTPUT, ...MONEY) })
  if (has(...MONEY) && has('正官')) circuits.push({ code: 'money-to-authority', evidence: observed(...MONEY, '正官') })
  if (has('正官', '偏官') && has(...RESOURCE)) circuits.push({ code: 'authority-to-resource', evidence: observed('正官', '偏官', ...RESOURCE) })
  if (has('食神') && has('偏官')) circuits.push({ code: 'output-checks-pressure', evidence: observed('食神', '偏官') })
  if (exposed('傷官') && exposed('正官')) risks.push({ code: 'expression-versus-authority', evidence: observed('傷官', '正官') })
  if (exposed('偏印') && exposed('食神')) risks.push({ code: 'resource-versus-output', evidence: observed('偏印', '食神') })
  if (exposed(...MONEY) && exposed(...RESOURCE)) risks.push({ code: 'money-versus-resource', evidence: observed(...MONEY, ...RESOURCE) })
  if (exposed(...MONEY) && exposed('偏官')) risks.push({ code: 'money-adds-pressure', evidence: observed(...MONEY, '偏官') })
  if (exposed('正官') && exposed('偏官')) risks.push({ code: 'mixed-authority', evidence: observed('正官', '偏官') })
  const blockers: string[] = []
  const patternBlockers: string[] = []
  if (f.signals.unknownTime) blockers.push('unknown-hour')
  if (f.signals.exceptional) blockers.push('special-structure-or-combination')
  if (f.tendency === 'mixed' || f.tendency === 'deferred') blockers.push('unresolved-strength')
  if (['比肩', '劫財'].includes(f.seasonalGod)) patternBlockers.push('peer-led-month')
  if (!f.patternCandidate) patternBlockers.push('no-clear-exposed-month-anchor')
  const seasonalContext = ['巳', '午', '未'].includes(f.month.pillar.branch) ? 'summer' : ['亥', '子', '丑'].includes(f.month.pillar.branch) ? 'winter' : 'transitional'
  if (seasonalContext !== 'transitional') blockers.push('climate-priority-unresolved')
  // A stem combination involving the proposed anchor may change its use. Do not assume transformation.
  const anchor = f.patternCandidate
  if (anchor && f.exposed.some(other => other.stem !== anchor.stem && analyzePillarRelations(anchor.stem + f.month.pillar.branch, other.stem + f.month.pillar.branch).stem.some(p => p.type === '合'))) blockers.push('anchor-stem-combination')
  if (risks.length) blockers.push('competing-exposed-relationships')
  const monthFriction = f.hidden.filter(n => n.principal && n.position !== 'month').some(n => analyzePillarRelations(f.day + f.month.pillar.branch, f.day + n.branch).branch.some(p => ['沖', '刑', '害', '破'].includes(p.type) && !(p.type === '刑' && ['無恩', '恃勢'].includes(p.detail ?? ''))))
  if (monthFriction) blockers.push('month-branch-friction')
  const patternRoute = !anchor ? null
    : anchor.god === '正官' && has(...RESOURCE) && f.tendency === 'support-needed' ? 'authority-to-resource'
      : anchor.god === '正官' && has(...MONEY) && f.tendency === 'supported' ? 'money-to-authority'
        : [...MONEY, '食神', '傷官', ...RESOURCE].includes(anchor.god) && has(...OUTPUT) && has(...MONEY) && f.tendency === 'supported' ? 'output-to-money'
          : null
  if (!patternRoute) patternBlockers.push('pattern-route-unresolved')
  const dayIndex = ORDER.indexOf(STEM_ELEMENTS[f.day])
  let route: string | null = null, element: typeof ORDER[number] | null = null
  let witnesses: ReturnType<typeof rootedExposed> = []
  // A single working preference is returned only with visible, exactly rooted evidence.
  if (f.tendency === 'support-needed' && rootedExposed(...RESOURCE).length) {
    route = 'resource-before-demand'; element = ORDER[(dayIndex + 4) % 5]; witnesses = rootedExposed(...RESOURCE)
  } else if (f.tendency === 'supported' && rootedExposed(...OUTPUT).length && has(...MONEY) && !has('正官', '偏官')) {
    route = 'output-before-money'; element = ORDER[(dayIndex + 1) % 5]; witnesses = rootedExposed(...OUTPUT)
  } else if (f.tendency === 'supported' && rootedExposed('正官').length && has(...MONEY) && !has(...OUTPUT, '偏官')) {
    route = 'authority-with-money'; element = ORDER[(dayIndex + 3) % 5]; witnesses = rootedExposed('正官')
  }
  if (!route) blockers.push('no-supported-single-route')
  const reasons = [...new Set(blockers)]
  const patternReasons = [...new Set([...reasons, ...patternBlockers])]
  return {
    policy: RESOLUTION_POLICY,
    pattern: { status: f.signals.unknownTime || f.signals.exceptional ? 'withheld' : anchor ? 'month-anchored' : 'unresolved', god: anchor?.god ?? null, stem: anchor?.stem ?? null, exposedAt: anchor?.exposedAt ?? [], seasonalGod: f.seasonalGod },
    circuits, risks, seasonalContext,
    useful: { status: reasons.length ? 'withheld' : 'conditional', method: 'ordinary-chart-balancing', element: reasons.length ? null : element, route: reasons.length ? null : route, witnesses: reasons.length ? [] : witnesses, reasons },
    // Pattern-level yongshin and a balancing element are deliberately different fields.
    patternAssessment: { status: anchor && patternRoute && !patternReasons.length ? 'conditional-route' : 'unresolved', route: patternRoute, reasons: patternReasons },
    patternSuccess: 'not-certified', transformation: 'not-assumed', climatePrescription: null,
  }
}
export type StructureResolution = ReturnType<typeof resolveStructure>
