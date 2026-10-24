import type { SajuResult } from '@orrery/core/types'
import { getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'

/** July samples identify annual themes, never whole-year outcomes or event dates. */
export function moneyTiming(result: SajuResult, year: number) {
  const dayStem = result.pillars[1].pillar.stem
  return Array.from({ length: 5 }, (_, index) => year + index).filter(value => value <= 2100).map(value => {
    const pillar = getFourPillars(value, 7, 15, 12, 0)[0]
    const stem = getRelation(dayStem, pillar[0])!.hanja
    const inner = getRelation(dayStem, getJeonggi(pillar[1]))!.hanja
    return { year: value, pillar, stem, inner, money: [...new Set([stem, inner].filter(god => god === '正財' || god === '偏財'))] }
  })
}

export function moneyTimingFacts(result: SajuResult, year: number) {
  return moneyTiming(result, year).map(item => `Annual reference ${item.year}-07-15 12:00 Asia/Seoul: ${item.pillar}; relative to day stem ${result.pillars[1].pillar.stem}, year stem ${item.stem}; principal branch stem ${item.inner}.`)
}
