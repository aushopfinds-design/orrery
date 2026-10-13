import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { buildEnglishReading } from './reading'

const input = { year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'M' as const, timezone: 'Asia/Seoul', longitude: 127, latitude: 37.5 }

describe('paid report editorial quality', () => {
  const result = calculateSaju(input)
  const report = buildEnglishReading(result, 2026)

  it('explains the relationship-seat day branch', () => {
    expect(report.sections[3].paragraphs.join(' ')).toContain(result.pillars[1].pillar.branch)
  })

  it('does not repeat personality caution verbatim in career', () => {
    const caution = report.sections[0].paragraphs[3].split('Your personal reflection: ')[1]?.split(' Notice whether')[0]
    expect(caution).toBeTruthy()
    expect(report.sections[1].paragraphs.join(' ')).not.toContain(caution)
  })

  it('avoids doubled full stops in monthly readings', () => {
    expect(report.monthly).toHaveLength(12)
    for (const month of report.monthly) expect(month.text).not.toContain('..')
  })
})
