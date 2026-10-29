// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://saju-english-report-preview-qa.vercel.app"}
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { PREVIEW_KINDS, checkoutHash } from '../../report/personal-products.ts'
import BuyReportLink from './BuyReportLink.tsx'
import PersonalPreviewPage from './PersonalPreviewPage.tsx'
vi.mock('../../i18n/index.ts', async importOriginal => {
  const actual = await importOriginal<typeof import('../../i18n/index.ts')>()
  return { ...actual, useLocale: () => ({locale:'en',t:(key:string)=>actual.t('en',key)}) }
})
describe('visible purchase entry points', () => {
  it.each(PREVIEW_KINDS)('opens the checkout flow for %s without granting payment access', kind => {
    const html=renderToStaticMarkup(<BuyReportLink kind={kind} />)
    expect(html).toContain(`href="${checkoutHash(kind)}"`)
    expect(html).toContain('Test purchase')
    expect(html).not.toContain('accessToken')
  })
  it('shows the selected report and required birth details before checkout', () => {
    window.history.replaceState(null,'',checkoutHash('compatibility'))
    const html=renderToStaticMarkup(<PersonalPreviewPage kind="compatibility" input={null} onFirstBirth={()=>{}} />)
    expect(html).toContain('id="personal-checkout"')
    expect(html).toContain('Our Love')
    expect(html).toContain('$14.99')
    expect(html).toContain('Two-person reports also need')
    expect(html).not.toContain('Buy test report')
  })
  it('shows the locked test checkout above the report once birth details are ready', () => {
    window.history.replaceState(null,'',checkoutHash('complete'))
    const birth={year:1992,month:8,day:17,hour:0,minute:0,unknownTime:true,gender:'M' as const,timezone:'Australia/Sydney',latitude:-33.8688,longitude:151.2093}
    const html=renderToStaticMarkup(<PersonalPreviewPage kind="complete" input={birth} onFirstBirth={()=>{}} />)
    expect(html).toContain('Buy test report')
    expect(html).toContain('Private test checkout')
    expect(html).toContain('aria-describedby="checkout-access-help"')
    expect(html.indexOf('Buy test report')).toBeLessThan(html.indexOf('id="personal-preview-excerpts"'))
    expect(html).toMatch(/disabled=""[^>]*aria-describedby="checkout-access-help"/)
  })
})
