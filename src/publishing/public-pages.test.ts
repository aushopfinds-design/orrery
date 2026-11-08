import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { buyerQuestionTitles } from '../report/personal-products.ts'
import { publicContent, renderDocument, sitemap } from './render-public.tsx'
import { publishingIdentity, publicPaths, PUBLIC_SAMPLES } from './site-config.ts'

const identity=publishingIdentity({})
const pages=publicContent(identity)
const text=(html:string)=>html.replace(/<\/?(?:p|h[1-6]|div|section|li|blockquote|dt|dd|ul|ol|summary|details|aside|nav|article)\b[^>]*>/g,' ').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/\s+/g,' ').trim()

describe('public reading publication and AdSense preflight',()=>{
  it('publishes a real, readable document at each canonical path without requiring JavaScript',()=>{
    expect(pages.map(p=>p.path).sort()).toEqual(publicPaths(identity.contactEmail).sort())
    for(const page of pages){
      const html=renderDocument(page,identity)
      expect(html).toContain(`rel="canonical" href="https://thefatekey.com${page.path}"`)
      expect(html).toContain('content="index,follow"')
      expect(html.match(/<h1[ >]/g)).toHaveLength(1)
      expect(html).not.toContain('<script')
      // The contact utility page is checked for its real address and guidance below.
      if(page.path!=='/contact/')expect(text(page.body).split(' ').length).toBeGreaterThan(100)
      expect(html).not.toMatch(/sky\.told\.me|ca-pub-|adsbygoogle|googlesyndication|under construction/i)
    }
  })
  it('publishes a complete fictional question-and-answer example for every product',()=>{
    for(const sample of PUBLIC_SAMPLES){
      const page=pages.find(p=>p.path===`/samples/${sample.slug}/`)!
      const rendered=text(page.body)
      const questions=buyerQuestionTitles(sample.kind)
      expect(rendered.split(' ').length).toBeGreaterThan(450)
      expect(rendered.split(' ').length).toBeLessThan(3000)
      for(const question of questions)expect(rendered).toContain(question)
      expect((page.body.match(/class="public-chapter public-sample-answer"/g) ?? [])).toHaveLength(questions.length)
      expect((rendered.match(/Example answer:/g) ?? [])).toHaveLength(questions.length)
      expect((rendered.match(/QUESTION [0-9]+ · FICTIONAL EXAMPLE/g) ?? [])).toHaveLength(questions.length)
      expect(rendered).toContain(`follows all ${questions.length} questions`)
      expect(rendered).toContain('Fictional reader: Avery')
      expect(rendered).toContain('SAMPLE ONLY')
      expect(rendered).toContain('CLOSING SUMMARY')
      expect(rendered).toContain('What the complete paid report adds')
      expect(rendered).toContain('not calculated from Saju')
      expect(page.body).not.toMatch(/Your Answer:|Chart note:|An everyday example|Hidden insight/i)
      expect(rendered).not.toContain('**')
    }
  })
  it('does not reveal partner birth details or calculated monthly references in public samples',()=>{
    const pair=text(pages.find(p=>p.path==='/samples/love-compatibility/')!.body)
    expect(pair).not.toContain('25 March 1998')
    expect(pair).not.toContain('18 August 2000')
    const year=text(pages.find(p=>p.path==='/samples/year-ahead/')!.body)
    expect(year).not.toContain('2027-07-15')
    expect(year).not.toContain('January 2027')
  })
  it('keeps ownership verification separate from serving advertising',()=>{
    const configured=publishingIdentity({FATE_ADSENSE_PUBLISHER_ID:'pub-1234567890123456'})
    expect(configured.accountId).toBe('ca-pub-1234567890123456')
    expect(publishingIdentity({FATE_ADSENSE_PUBLISHER_ID:'ca-pub-1234567890123456'})).toEqual(configured)
    const html=renderDocument(pages[0],configured)
    expect(html).toContain('<meta name="google-adsense-account" content="ca-pub-1234567890123456"/>')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('adsbygoogle')
  })
  it('uses the approved public contact without inventing a publisher identity',()=>{
    expect(identity).toMatchObject({contactEmail:'thefatekey@gmail.com',publisherId:null,accountId:null})
    expect(pages.some(p=>p.path==='/contact/')).toBe(true)
    for(const path of ['/contact/','/privacy/'])expect(renderDocument(pages.find(p=>p.path===path)!,identity)).toContain('mailto:thefatekey@gmail.com')
    for(const value of ['pub-123','ca-pub-000','pub-1234567890123456"><script>','pub-1234567890123456\n\nother'])expect(()=>publishingIdentity({FATE_ADSENSE_PUBLISHER_ID:value})).toThrow()
    for(const value of ['bad','x@example.com\r\nBcc:x@example.com','<x>@example.com','x@localhost'])expect(()=>publishingIdentity({FATE_PUBLIC_CONTACT_EMAIL:value})).toThrow()
  })
  it('adds an operator-supplied public contact consistently without a tracking or order form',()=>{
    const supplied=publishingIdentity({FATE_PUBLIC_CONTACT_EMAIL:'public@example.org'})
    const configuredPages=publicContent(supplied)
    expect(configuredPages.map(p=>p.path).sort()).toEqual(publicPaths(supplied.contactEmail).sort())
    const html=renderDocument(configuredPages.find(p=>p.path==='/contact/')!,supplied)
    expect(html).toContain('mailto:public@example.org')
    expect(html).not.toContain('<form')
    expect(text(html)).toContain('do not send card information')
    expect(sitemap(supplied)).toContain('https://thefatekey.com/contact/')
  })
  it('lists canonical public paths in the sitemap without hash routes, input data or the old hostname',()=>{
    const xml=sitemap(identity)
    expect(xml.match(/<loc>/g)).toHaveLength(publicPaths(identity.contactEmail).length)
    for(const match of xml.matchAll(/<loc>(.*?)<\/loc>/g))expect(match[1]).not.toMatch(/sky\.told\.me|#|my-report|birth-details|\?|New_York|1998/)
    for(const path of publicPaths(identity.contactEmail))expect(xml).toContain(`<loc>https://thefatekey.com${path}</loc>`)
  })
  it('states current data practices and consent prerequisites without claiming ads are active',()=>{
    const notice=text(pages.find(p=>p.path==='/privacy/')!.body)
    expect(notice).toContain('Google ads are not being served')
    expect(notice).toContain('does not itself request an advertisement')
    expect(notice).toContain('Google-certified consent management platform')
    expect(notice).toContain('Birth dates, birth times and saved names are not included')
    expect(notice).toContain('Clearing site data does not delete a downloaded backup')
    expect(pages.find(p=>p.path==='/privacy/')!.body).toContain('/#your-data')
  })
})


describe('public preview data protection',()=>{
 it('never serializes generated report text into static public sample pages',()=>{
  for(const sample of PUBLIC_SAMPLES){
   const page=pages.find(p=>p.path===`/samples/${sample.slug}/`)!
   expect(page.body).not.toMatch(/<button|<details|Your Answer:|Reading basis:|Chart evidence|Hidden insight/i)
  }
 })
  it('keeps all 7 sold preview question counts aligned with the current buyer question contract',()=>{
    const sold = [
      ['complete', 'complete-life-reading', 7], ['career', 'career-money', 7],
      ['compatibility', 'love-compatibility', 7], ['year', 'year-ahead', 7],
      ['business', 'business-reading', 7], ['wellbeing', 'everyday-balance', 7],
    ] as const
    for (const [kind, slug, expected] of sold) {
      expect(buyerQuestionTitles(kind)).toHaveLength(expected)
      const page = pages.find(item => item.path === `/samples/${slug}/`)!
      expect((page.body.match(/<li>/g) ?? []).length).toBe(expected)
    }
    expect(buyerQuestionTitles('bundle')).toHaveLength(10)
    expect(pages.find(item => item.path === '/samples/complete-destiny/')!.body.match(/<li>/g)).toHaveLength(10)
    expect(PUBLIC_SAMPLES).toHaveLength(7)
    expect(pages.find(item => item.path === '/samples/')!.body).not.toContain('Legacy: My Love')
    expect(buyerQuestionTitles('compatibility')[0]).toBe('What makes us compatible?')
    expect(buyerQuestionTitles('year')[1]).toBe('What should I focus on most this year?')
    expect(buyerQuestionTitles('business')[3]).toBe('What financial risks should I understand?')
    expect(buyerQuestionTitles('bundle')[0]).toBe('What are the three most important things about my destiny?')
 })
})

 it('publishes live seller and delivery terms without closed-sale notices',()=>{
 const live=publishingIdentity({FATE_PAYMENTS_MODE:'live',FATE_CHECKOUT_OPEN:'true',FATE_SALES_POLICIES_READY:'true',FATE_PUBLIC_OPERATOR_NAME:'FATE KEY'})
 const content=publicContent(live)
 for(const path of ['/','/purchases/','/privacy/','/contact/','/use-and-limitations/']){
  const page=content.find(p=>p.path===path)!
  expect(page.body).not.toMatch(/Paid purchasing is not open|paid purchasing is not open|Public paid purchases are not open|planned prices/i)
  expect(renderDocument(page,live)).toContain('Seller: FATE KEY')
 }
 expect(content.find(p=>p.path==='/purchases/')!.body).toContain('USD')
 expect(content.find(p=>p.path==='/privacy/')!.body).toContain('promotional email collection is not enabled')
 })
