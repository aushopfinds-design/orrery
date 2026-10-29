/** Independent-engine facts are advisory only and must never replace paid-report calculations. */
export type PillarKey = 'year' | 'month' | 'day' | 'hour'
export interface IndependentPillarAudit {
  current: readonly (string | null)[]
  independent: readonly (string | null)[]
}

export type IndependentPillarCalculator = (input: unknown) => Promise<unknown> | unknown
const PILLAR_AUDIT_TIMEOUT_MS = 500

/** Optional runtime integration. Any engine error or slow response leaves the existing reading untouched. */
export async function calculateIndependentAudit(
  input: unknown,
  current: readonly (string | null)[],
  calculator: IndependentPillarCalculator,
  unknownTime = false,
): Promise<IndependentPillarAudit | undefined> {
  const currentPillars = [...current]
  if (unknownTime) currentPillars[3] = null
  try {
    const timeout = new Promise<undefined>(resolve => setTimeout(() => resolve(undefined), PILLAR_AUDIT_TIMEOUT_MS))
    const outcome = await Promise.race([Promise.resolve().then(() => calculator(input)), timeout])
    if (!outcome || typeof outcome !== 'object') return undefined
    const record = outcome as Record<string, unknown>
    const pillars = record.pillars && typeof record.pillars === 'object' ? record.pillars as Record<string, unknown> : record
    const independent = (['year', 'month', 'day', 'hour'] as const).map(key => {
      const pillar = pillars[key]
      if (!pillar || typeof pillar !== 'object') return null
      const item = pillar as Record<string, unknown>
      return canonicalPillar(item.hanja ?? item.korean ?? item.ganzi)
    })
    if (unknownTime) independent[3] = null
    return { current: currentPillars, independent }
  } catch {
    return undefined
  }
}

/** Convert the independent engine's pillar response to the canonical Hanja used by Orrery. */
export function canonicalPillar(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (normalized.length !== 2) return null
  const stems: Record<string, string> = { 갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊', 기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸' }
  const branches: Record<string, string> = { 자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳', 오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥' }
  return (stems[normalized[0]] ?? normalized[0]) + (branches[normalized[1]] ?? normalized[1])
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
