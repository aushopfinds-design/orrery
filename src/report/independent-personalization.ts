/** Independent-engine facts are advisory only and must never replace paid-report calculations. */
export type PillarKey = 'year' | 'month' | 'day' | 'hour'
export interface IndependentPillarAudit {
  current: readonly (string | null)[]
  independent: readonly (string | null)[]
}
/** Returns only facts confirmed by both engines. Never use unconfirmed pillars for personalization. */
export function verifiedPillars(audit: IndependentPillarAudit): Partial<Record<PillarKey, string>> {
  const keys: PillarKey[] = ['year', 'month', 'day', 'hour']
  const result: Partial<Record<PillarKey, string>> = {}
  keys.forEach((key, i) => {
    const a = audit.current[i]
    const b = audit.independent[i]
    if (typeof a === 'string' && a.length === 2 && a === b) result[key] = a
  })
  return result
}
/** Do not personalize from an independent hour pillar or decade-cycle claim without separate verification. */
export function independentPersonalizationEligibility(audit: IndependentPillarAudit) {
  const confirmed = verifiedPillars(audit)
  return {
    confirmed,
    canUseYearMonthDay: Boolean(confirmed.year && confirmed.month && confirmed.day),
    canUseHour: Boolean(confirmed.hour),
    canUseDaewoon: false as const,
  }
}
