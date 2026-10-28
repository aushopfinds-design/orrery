import { describe, expect, it } from 'vitest'
import { calcSolarTerms, getFourPillars } from '@orrery/core/pillars'

// Korea Astronomy and Space Science Institute (KASI), 2026 almanac.
// The table is published in KST to the minute.
const KASI_2026_TERMS = [
  [22, 1, 5, 17, 23], [23, 1, 20, 10, 45],
  [0, 2, 4, 5, 2], [1, 2, 19, 0, 52],
  [2, 3, 5, 22, 59], [3, 3, 20, 23, 46],
  [4, 4, 5, 3, 40], [5, 4, 20, 10, 39],
  [6, 5, 5, 20, 49], [7, 5, 21, 9, 37],
  [8, 6, 6, 0, 48], [9, 6, 21, 17, 25],
  [10, 7, 7, 10, 57], [11, 7, 23, 4, 13],
  [12, 8, 7, 20, 43], [13, 8, 23, 11, 19],
  [14, 9, 7, 23, 41], [15, 9, 23, 9, 5],
  [16, 10, 8, 15, 29], [17, 10, 23, 18, 38],
  [18, 11, 7, 18, 52], [19, 11, 22, 16, 23],
  [20, 12, 7, 11, 53], [21, 12, 22, 5, 50],
] as const

describe('solar-term times: independent KASI 2026 almanac', () => {
  it.each(KASI_2026_TERMS)('matches term %i on 2026-%i-%i %i:%i KST', (index, month, day, hour, minute) => {
    const result = calcSolarTerms(2026, month, day, hour, minute)
    const prefix = index % 2 === 0 ? 'ingi' : 'mid'
    const actual = [
      result[`${prefix}Year` as 'ingiYear' | 'midYear'],
      result[`${prefix}Month` as 'ingiMonth' | 'midMonth'],
      result[`${prefix}Day` as 'ingiDay' | 'midDay'],
      result[`${prefix}Hour` as 'ingiHour' | 'midHour'],
      result[`${prefix}Min` as 'ingiMin' | 'midMin'],
    ]
    expect(actual).toEqual([2026, month, day, hour, minute])
  })

  it('keeps the old year and month through 05:01 KST before Li Chun', () => {
    expect(getFourPillars(2026, 2, 4, 5, 1).slice(0, 2)).toEqual(['乙巳', '己丑'])
  })

  it('switches year and month at the published 05:02 KST Li Chun minute', () => {
    expect(getFourPillars(2026, 2, 4, 5, 2).slice(0, 2)).toEqual(['丙午', '庚寅'])
  })
})
