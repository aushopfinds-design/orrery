import { describe, expect, it } from 'vitest'
import { PREVIEW_KINDS, previewHash, previewProduct } from '../report/personal-products.ts'
import { navigationTarget, resolveReportRoute } from './report-route.ts'

describe('report and help navigation', () => {
  it.each([['#help', 'help'], ['#help-faq', 'help'], ['#reading-guide', 'guide'], ['#reading-guide-reports', 'guide'], ['#reading-guide-save', 'guide'], ['#your-data', 'privacy']] as const)('opens %s as %s', (hash, route) => {
    expect(resolveReportRoute(hash)).toBe(route)
    expect(navigationTarget(hash)).toBe('#help')
  })
  it.each(PREVIEW_KINDS)('keeps %s personal previews and public examples reachable', kind => {
    expect(resolveReportRoute(previewHash(kind))).toBe('personal-preview')
    expect(navigationTarget(previewHash(kind))).toBe('#my-report')
    expect(resolveReportRoute(previewProduct(kind).sample)).toMatch(/sample$/)
    expect(navigationTarget(previewProduct(kind).sample)).toBe('#reports')
  })
  it('marks the actual section instead of always highlighting Home', () => {
    expect(navigationTarget('#birth-details')).toBe('#birth-details')
    expect(navigationTarget('#free-reading')).toBe('#birth-details')
    expect(navigationTarget('#reports')).toBe('#reports')
    expect(navigationTarget('#focused-reports')).toBe('#reports')
    expect(navigationTarget('#about')).toBe('#about')
    expect(navigationTarget('#home')).toBe('#home')
    expect(resolveReportRoute('#sample-report-method')).toBe('sample')
  })
})
