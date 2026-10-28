import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading } from '../report/complete-reading.ts'
import StaticReading from './StaticReading.tsx'

describe('complete sample reading guidance', () => {
  it('shows repeated advice once when Keep close and the small step say the same thing', () => {
    const input = { year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'M' as const, latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' }
    const report = buildCompleteReading(calculateSaju(input), 2026)
    const html = renderToStaticMarkup(createElement(StaticReading, { report }))
    for (const chapter of report.chapters) {
      if (!chapter.guidance.keepClose.includes(chapter.tryThis) && !chapter.guidance.watchFor.includes(chapter.tryThis)) continue
      const start = html.indexOf(`class="public-chapter" id="${chapter.id}"`)
      const next = html.indexOf('class="public-chapter" id="', start + 1)
      const fragment = html.slice(start, next < 0 ? undefined : next)
      expect(fragment).toContain('<h3>Keep close</h3>')
      expect(fragment).not.toContain('<h3>A small step to try</h3>')
    }
  })
})
