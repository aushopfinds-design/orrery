import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FullReportSamplePage from './FullReportSamplePage.tsx'

describe('full product sample pages', () => {
  it.each([
    ['career', 'career-money-sample', 7],
    ['compatibility', 'love-compatibility-sample', 7],
    ['year', 'year-ahead-sample', 7],
    ['business', 'business-reading-sample', 7],
    ['wellbeing', 'everyday-balance-sample', 7],
    ['bundle', 'complete-bundle-sample', 10],
  ] as const)('shows the complete %s example and its included questions', (kind, id, questionCount) => {
    const html = renderToStaticMarkup(createElement(FullReportSamplePage, { kind }))
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('FICTIONAL EXAMPLE · NOT A CUSTOMER REPORT')
    expect(html).toContain('FULL REPORT TEXT')
    expect(html.length).toBeGreaterThan(10_000)
    expect((html.match(/<li>/g) ?? []).length).toBeGreaterThanOrEqual(questionCount * 2)
  })
  it('uses the buyer-facing answer text for the public career example', () => {
    const html = renderToStaticMarkup(createElement(FullReportSamplePage, { kind: 'career' }))
    expect(html).toContain('What Tends to Block My Financial Progress?')
    expect(html).toContain('The chart points to a possible squeeze between paid work and the preparation or help needed to do it well')
    expect(html).not.toContain('Practical point: This is a possible chart pressure')
  })
})
