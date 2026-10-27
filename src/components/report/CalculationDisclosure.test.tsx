import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CalculationNotice } from './CalculationDisclosure.tsx'

describe('unknown-time calculation notice', () => {
  it('shows the day-pillar limitation beside the report when time is unknown', () => {
    const html = renderToStaticMarkup(createElement(CalculationNotice, {
      input: { year: 1980, month: 3, day: 25, hour: 12, minute: 0, gender: 'M', timezone: 'Asia/Seoul', unknownTime: true },
    }))
    expect(html).toContain('displayed day pillar uses the midday reference')
    expect(html).toContain('day-based interpretation may therefore differ')
  })

  it('keeps the day-pillar warning scoped to unknown-time charts', () => {
    const html = renderToStaticMarkup(createElement(CalculationNotice, {
      input: { year: 1980, month: 3, day: 25, hour: 12, minute: 0, gender: 'M', timezone: 'Asia/Seoul' },
    }))
    expect(html).toBe('')
  })
})
