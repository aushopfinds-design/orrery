import type { StructureResolution } from './structure-resolution.ts'
import { godText } from './traditional-analysis.ts'
export const RESOLUTION_CODES = {
  'output-to-money': 'Skill and expression sit alongside a money relationship. This supports reading how an offer reaches a paying customer, without proving a successful wealth-producing structure.',
  'money-to-authority': 'Money and formal responsibility are linked in the checked positions. A commercial opportunity can therefore also bring contracts, standards or duties.',
  'authority-to-resource': 'Responsibility and resource relationships are both present. Training, support or a method for handling the role matters alongside the demand itself.',
  'output-checks-pressure': 'Production and demanding authority are both present. Whether skill can contain that pressure depends on the wider support picture; presence alone does not prove the structure succeeds.',
  'expression-versus-authority': 'Critical expression and formal authority are both exposed. Disagreement about standards or who has the right to decide is a work-related tension to examine.',
  'resource-versus-output': 'Specialised preparation and steady production are both exposed. Continuing to analyse can compete with delivering usable work; this is not proof that output is destroyed.',
  'money-versus-resource': 'Money and resource relationships are both exposed. Commercial commitments and the time or support needed to prepare can pull in different directions; their positions still matter.',
  'money-adds-pressure': 'Commercial activity and demanding authority are both exposed. More customer work can bring tighter obligations rather than an automatically easier money period.',
  'mixed-authority': 'Two kinds of authority are exposed. Clear rules and urgent demands may compete; this does not describe the customer as dishonest or predict a personal event.',
} as const
export const RESOLUTION_REASONS: Record<string, string> = {
  'unknown-hour': 'the birth hour is unknown', 'special-structure-or-combination': 'a special structure or complete combination needs separate judgement',
  'unresolved-strength': 'support and demand do not resolve into one direction', 'peer-led-month': 'a peer-led month requires its own rules',
  'no-clear-exposed-month-anchor': 'there is no single exposed month-hidden anchor', 'climate-priority-unresolved': 'seasonal climate may change the priority',
  'anchor-stem-combination': 'the proposed anchor meets a stem combination', 'competing-exposed-relationships': 'competing exposed relationships remain',
  'month-branch-friction': 'a checked friction pattern touches the month branch', 'no-supported-single-route': 'no single rooted and exposed route meets this policy',
  'pattern-route-unresolved': 'the month-led structure does not have a supported ordinary route under these rules',
}
export function resolutionClaimIds(r: StructureResolution) {
  return ['structure.scope', 'structure.anchor', ...r.circuits.map(c => 'structure.' + c.code), ...r.risks.map(c => 'structure.' + c.code), 'structure.useful']
}
export function resolutionEnglish(r: StructureResolution) {
  const text = [
    'The month-led structure and a balancing element answer different questions. A working preference below applies only to the stated ordinary-chart rule; it is not a universal lucky element or an outcome guarantee.',
    r.pattern.status === 'month-anchored' ? `The month-hidden stem ${r.pattern.stem} is exposed at ${r.pattern.exposedAt.join(' and ')}: the structure is anchored to ${godText(r.pattern.god!).name}. The checks below describe supporting and competing relationships; they do not certify full structure success.` : 'A complete ordinary month-led structure is not assigned from the available evidence. The reading retains the seasonal relationship without forcing a structure label.',
    ...r.circuits.map(c => RESOLUTION_CODES[c.code as keyof typeof RESOLUTION_CODES]),
    ...r.risks.map(c => RESOLUTION_CODES[c.code as keyof typeof RESOLUTION_CODES]),
    r.useful.status === 'conditional' ? `Within this ordinary balancing policy, ${r.useful.element} is the conditional working preference through ${r.useful.route}. Its supporting stem is both exposed and rooted. This is a chart-interpretation priority, not a colour, purchase, health remedy or guaranteed favourable period.` : `No single balancing element is selected: ${r.useful.reasons.map(code => RESOLUTION_REASONS[code]).join('; ')}. An absent element is not automatically the answer.`,
  ]
  return resolutionClaimIds(r).map((id, i) => ({ id, text: text[i] }))
}
