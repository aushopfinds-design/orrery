import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from '../report/category-catalog.ts'
import { buildCategoryReading } from '../report/category-readings.ts'
import { buildCompleteReading } from '../report/complete-reading.ts'
import { plainReadingText } from '../report/reading-text.ts'
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
      if(page.path!=='/contact/')expect(text(page.body).split(' ').length).toBeGreaterThan(200)
      expect(html).not.toMatch(/sky\.told\.me|ca-pub-|adsbygoogle|googlesyndication|under construction/i)
    }
  })
  it('includes all situations, chapters, examples and source notes from the actual six sample models',()=>{
    const first=calculateSaju(CATEGORY_SCENARIOS[0].first)
    const second=calculateSaju(CATEGORY_SCENARIOS[0].second)
    for(const sample of PUBLIC_SAMPLES){
      const report=sample.kind==='complete'?buildCompleteReading(first,2026):buildCategoryReading(sample.kind,first,{second:sample.kind==='compatibility'?second:undefined,year:sample.kind==='year'?2027:2026})
      const page=pages.find(p=>p.path===`/samples/${sample.slug}/`)!
      const rendered=text(page.body)
      expect(rendered.split(' ').length).toBeGreaterThan(3000)
      for(const ch of report.chapters){
        expect(rendered).toContain(ch.title)
        for(const paragraph of ch.paragraphs)expect(rendered).toContain(plainReadingText(paragraph).replace(/\s+/g,' '))
        for(const fact of ch.evidence)expect(rendered).toContain(fact)
      }
      for(const item of report.applications){
        expect(page.body).toContain(`id="${item.id}"`)
        expect(rendered).toContain(item.title)
        expect(rendered).toContain(item.doesNotFit)
        for(const step of item.steps)expect(rendered).toContain(plainReadingText(step))
      }
      expect(rendered).toContain(report.extras.reminder)
      for(const note of report.methodNotes)expect(rendered).toContain(note)
      expect(rendered).toContain('No order or payment has been made')
      expect(rendered).not.toContain('**')
    }
  })
  it('keeps both people and all twelve calculated monthly references in their appropriate examples',()=>{
    const pair=text(pages.find(p=>p.path==='/samples/love-compatibility/')!.body)
    expect(pair).toContain('25 March 1998 · 03:00 · America/New_York')
    expect(pair).toContain('18 August 2000 · 14:30 · Europe/London')
    const year=text(pages.find(p=>p.path==='/samples/year-ahead/')!.body)
    for(const month of ['January','February','March','April','May','June','July','August','September','October','November','December'])expect(year).toContain(month+' 2027')
    expect(year).toContain('2027-07-15')
    expect(year.toLowerCase()).toContain('solar-term boundaries')
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


describe('r14 actual public reading layout',()=>{
 it('shows all twelve months in the overview and links each to its full reading',()=>{
  const dom=new JSDOM(pages.find(p=>p.path==='/samples/year-ahead/')!.body)
  const table=dom.window.document.querySelector('.public-month-overview')!
  expect(table.querySelectorAll('tbody tr')).toHaveLength(12)
  for(let month=1;month<=12;month++){
   expect(table.querySelector(`a[href="#month-${month}"]`)).not.toBeNull()
   expect(dom.window.document.getElementById('month-'+month)).not.toBeNull()
  }
  dom.window.close()
 })
 it('prints a chapter practical point once, including short summary chapters',()=>{
  const report=buildCategoryReading('year',calculateSaju(CATEGORY_SCENARIOS[0].first),{year:2027})
  const dom=new JSDOM(pages.find(p=>p.path==='/samples/year-ahead/')!.body)
  for(const chapter of [...report.chapters,...report.months]){
   const node=dom.window.document.getElementById(chapter.id)!
   const copies=[...node.querySelectorAll('p,li')].filter(p=>p.textContent===plainReadingText(chapter.tryThis))
   expect(copies,chapter.id).toHaveLength(chapter.showGuidance===false?0:1)
  }
  dom.window.close()
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
