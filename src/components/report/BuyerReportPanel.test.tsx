// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://saju-english-report-preview-qa.vercel.app"}
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildDestinyCard } from '../../report/destiny-card.ts'
import BuyerReportPanel from './BuyerReportPanel.tsx'
import { PURCHASES_KEY } from '../../utils/purchase-client.ts'

vi.mock('../../utils/card-export.tsx', () => ({ exportCard: vi.fn(), saveCardBlob: vi.fn() }))
import { exportCard, saveCardBlob } from '../../utils/card-export.tsx'

const orderId = '11111111-1111-4111-8111-111111111111'
const report = { title: 'Complete Life Reading', kind: 'complete', edition: '2026.10-r2', issuedAt: '2026-10-20T12:00:00.000Z',
  text: '01 · Your Work\nA private full report paragraph.', documents: ['Complete Life Reading'],
  cards: [buildDestinyCard({ year:1998, month:3, day:25, hour:3, minute:0, gender:'M', timezone:'America/New_York', latitude:40.7128, longitude:-74.006 })] }
let root: Root | null, container: HTMLDivElement
let fetchMock: ReturnType<typeof vi.fn>
const ok = () => Response.json(report)
const failure = (status: number, error: string) => Response.json({ error }, { status })
async function mount() {
  await act(async () => { root!.render(<BuyerReportPanel />) })
}
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.includes(text))!
beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  window.history.replaceState(null, '', '/?checkout=success&order_id=' + orderId + '#purchase')
  localStorage.clear(); sessionStorage.clear()
  sessionStorage.setItem(PURCHASES_KEY, JSON.stringify({ [orderId]: { accessToken: 'private-test-order-capability' } }))
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container)
  fetchMock = vi.fn(); vi.stubGlobal('fetch', (url: string, init?: RequestInit) => url === '/api/payments?action=availability' ? Promise.resolve(Response.json({available:true,mode:'test',customerRecordsReady:false})) : (fetchMock as unknown as (url:string,init?:RequestInit)=>Promise<Response>)(url,init))
  Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:test-pdf'), configurable: true })
  Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
})
afterEach(async () => {
  await act(async () => { root?.unmount() }); root = null
  container.remove(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe('Buyer report screen: API response to customer actions', () => {
  it('renders only a verified response and sends the capability in a header', async () => {
    fetchMock.mockResolvedValueOnce(ok())
    await mount()
    expect(container.querySelector('h2')?.textContent).toBe('Complete Life Reading')
    expect(container.querySelector('h3')?.textContent).toBe('01 · Your Work')
    expect(container.textContent).toContain(orderId)
    expect(button('Download full PDF').disabled).toBe(false)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/payments?action=report')
    expect(init.headers.Authorization).toBe('Bearer private-test-order-capability')
    expect(JSON.parse(init.body)).toEqual({ orderId })
    expect(url).not.toContain('capability')
  })
  it('rechecks purchase access before exporting the server-issued card', async () => {
    fetchMock.mockResolvedValueOnce(ok()).mockResolvedValueOnce(ok())
    vi.mocked(exportCard).mockResolvedValueOnce(new Blob(['PNG'], { type:'image/png' }))
    await mount()
    await act(async () => { button('Save card image').click() })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(exportCard).toHaveBeenCalledWith(report.cards[0], 'png', expect.any(AbortSignal), expect.any(Function), false, 'test')
    expect(saveCardBlob).toHaveBeenCalledWith(expect.any(Blob), 'the-fate-key-card-1.png')
  })
  it('keeps calculation notes collapsed and exports a live card without a test label', async () => {
    const live = { ...report, mode: 'live', text: report.text + '\n\nCalculation notes\n\nFrom the chart: private evidence.' }
    fetchMock.mockResolvedValueOnce(Response.json(live)).mockResolvedValueOnce(Response.json(live))
    vi.mocked(exportCard).mockResolvedValueOnce(new Blob(['PNG'], { type:'image/png' }))
    await mount()
    const notes = container.querySelector('.fate-buyer-calculation-notes') as HTMLDetailsElement
    expect(notes.open).toBe(false)
    expect(notes.textContent).toContain('private evidence')
    expect(container.querySelector('.fate-buyer-report-text')?.textContent).not.toContain('private evidence')
    expect(container.querySelector('.fate-personal-card-motion')?.textContent).toContain('PERSONAL EDITION')
    expect(container.querySelector('.fate-personal-card-motion')?.textContent).not.toContain('SANDBOX EDITION')
    await act(async () => { button('Save card image').click() })
    expect(exportCard).toHaveBeenCalledWith(report.cards[0], 'png', expect.any(AbortSignal), expect.any(Function), false, 'live')
  })
  it('does not export if the server rejects access after the report was loaded', async () => {
    fetchMock.mockResolvedValueOnce(ok()).mockResolvedValueOnce(failure(404, 'order_not_found'))
    await mount()
    await act(async () => { button('Save animated card').click() })
    expect(exportCard).not.toHaveBeenCalled()
    expect(saveCardBlob).not.toHaveBeenCalled()
    expect(container.querySelector('[role=alert]')).not.toBeNull()
  })
  it('waits automatically across preparing and unpaid responses, without a second purchase', async () => {
    fetchMock.mockResolvedValueOnce(failure(409, 'report_being_prepared')).mockResolvedValueOnce(failure(402, 'payment_not_complete')).mockResolvedValueOnce(ok())
    await mount()
    expect(container.textContent).not.toContain('A private full report paragraph.')
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(container.textContent).not.toContain('A private full report paragraph.')
    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
    expect(container.textContent).toContain('A private full report paragraph.')
    expect(fetchMock.mock.calls.every(([url]) => url === '/api/payments?action=report')).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
  it('stops bounded polling and allows a manual retry without starting Checkout again', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(failure(402, 'payment_not_complete')))
    await mount()
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect(container.querySelector('[role=alert]')?.textContent).toContain('without starting another purchase')
    expect(button('Check payment again').disabled).toBe(false)
    fetchMock.mockResolvedValueOnce(ok())
    await act(async () => { button('Check payment again').click() })
    expect(container.textContent).toContain('A private full report paragraph.')
    expect(fetchMock.mock.calls.every(([url]) => url === '/api/payments?action=report')).toBe(true)
  })
  it('does not retry a product/order mismatch or display internal server error codes', async () => {
    fetchMock.mockResolvedValueOnce(failure(409, 'payment_order_mismatch'))
    await mount()
    await act(async () => { await vi.advanceTimersByTimeAsync(20000) })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role=alert]')).not.toBeNull()
    expect(container.textContent).not.toContain('payment_order_mismatch')
    expect(container.textContent).not.toContain('A private full report paragraph.')
  })
  it('shows recovery guidance when this browser has no order key', async () => {
    localStorage.clear(); sessionStorage.clear(); await mount()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(container.querySelector('[role=alert]')?.textContent).toContain('browser where you started')
    expect(button('Download full PDF')).toBeUndefined()
  })
  it('recovers a transient network failure automatically', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(ok())
    await mount()
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(container.textContent).toContain('A private full report paragraph.')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
  it('downloads a checked PDF using an attached link and releases its object URL', async () => {
    fetchMock.mockResolvedValueOnce(ok()).mockResolvedValueOnce(new Response('%PDF-1.7\nfixture', { headers: { 'Content-Type': 'application/pdf' } }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.isConnected).toBe(true)
      expect(this.download).toBe('the-fate-key-complete.pdf')
      expect(this.href).toBe('blob:test-pdf')
    })
    await mount()
    await act(async () => { button('Download full PDF').click() })
    expect(click).toHaveBeenCalledTimes(1)
    expect(document.querySelector('a[download]')).toBeNull()
    await act(async () => { await vi.advanceTimersByTimeAsync(30000) })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-pdf')
  })
  it('rejects a broken PDF response while keeping the online report available', async () => {
    fetchMock.mockResolvedValueOnce(ok()).mockResolvedValueOnce(new Response('<html>error</html>', { headers: { 'Content-Type': 'application/pdf' } }))
    await mount()
    await act(async () => { button('Download full PDF').click() })
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(container.querySelector('[role=alert]')?.textContent).toContain('PDF could not be downloaded')
    expect(container.textContent).toContain('A private full report paragraph.')
    expect(button('Download full PDF').disabled).toBe(false)
  })
  it('cancels polling when the buyer leaves the page', async () => {
    fetchMock.mockResolvedValueOnce(failure(409, 'report_being_prepared'))
    await mount()
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal
    await act(async () => { root!.unmount(); root = null })
    expect(signal.aborted).toBe(true)
    await act(async () => { await vi.advanceTimersByTimeAsync(30000) })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('keeps a cancelled checkout locked without calling the report API', async () => {
    window.history.replaceState(null, '', '/?checkout=cancelled&order_id=' + orderId + '#my-report')
    await mount()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Checkout was cancelled')
  })
})

import SandboxCheckout, { TEST_ACCESS_KEY } from './SandboxCheckout.tsx'
const birth = { year: 1992, month: 8, day: 17, hour: 0, minute: 0, unknownTime: true, gender: 'M' as const, timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }
async function mountCheckout() {
  sessionStorage.setItem(TEST_ACCESS_KEY, 'private-sandbox-test-access-'.repeat(2))
  await act(async () => { root!.render(<SandboxCheckout order={{ kind: 'complete', first: birth }} />) })
}
describe('Sandbox checkout screen', () => {
  it('reuses the same request key after a network failure and hides provider internals', async () => {
    fetchMock.mockRejectedValue(new TypeError('Internal provider detail'))
    await mountCheckout()
    await act(async () => { button('Buy test report').click() })
    expect(container.querySelector('[role=alert]')?.textContent).toContain('Please try again')
    expect(container.textContent).not.toContain('Internal provider detail')
    await act(async () => { button('Buy test report').click() })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe(fetchMock.mock.calls[1][1].headers['Idempotency-Key'])
    expect(fetchMock.mock.calls[0][0]).toBe('/api/payments?action=checkout')
  })
  it('refuses a checkout response that redirects to another host', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ checkoutUrl: 'https://unrelated.example/pay', orderId, accessToken: 'should-not-be-stored' }))
    await mountCheckout()
    await act(async () => { button('Buy test report').click() })
    expect(container.querySelector('[role=alert]')).not.toBeNull()
    expect(sessionStorage.getItem(PURCHASES_KEY)).not.toContain('should-not-be-stored')
    expect(window.location.hostname).toBe('saju-english-report-preview-qa.vercel.app')
  })
  it('shows an unchecked marketing option only when the server confirms that contact storage is ready',async()=>{
    vi.stubGlobal('fetch',(url:string,init?:RequestInit)=>url==='/api/payments?action=availability'?Promise.resolve(Response.json({available:true,mode:'test',customerRecordsReady:true})):(fetchMock as unknown as (url:string,init?:RequestInit)=>Promise<Response>)(url,init))
    fetchMock.mockResolvedValueOnce(Response.json({orderId,accessToken:'z'.repeat(43),mode:'test',checkoutUrl:'https://checkout.stripe.com/c/pay/cs_test_fixture'}))
    await mountCheckout()
    const checkbox=[...container.querySelectorAll('label')].find(label=>label.textContent?.includes('occasional new reports'))?.querySelector('input') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    await act(async()=>checkbox.click())
    await act(async()=>button('Buy test report').click())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).marketingConsent).toBe(true)
  })
  it('cancels an outstanding checkout request when the buyer leaves', async () => {
    fetchMock.mockImplementation((_url, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }))
    await mountCheckout()
    await act(async () => { button('Buy test report').click() })
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal
    await act(async () => { root!.unmount(); root = null })
    expect(signal.aborted).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('purchase key backup and cross-device recovery', () => {
  it('shows the recovery entry without requiring the original tab or return URL', async () => {
    window.history.replaceState(null, '', '/#purchase')
    sessionStorage.clear()
    await mount()
    expect(container.textContent).toContain('Open a purchased report')
    expect(fetchMock).not.toHaveBeenCalled()
    const input = container.querySelector('input[type=password]')!
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(input, `FK1.${orderId}.${'x'.repeat(43)}`); input.dispatchEvent(new Event('input', { bubbles:true })) })
    fetchMock.mockResolvedValueOnce(ok())
    await act(async () => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true })) })
    expect(container.textContent).toContain('A private full report paragraph.')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer ' + 'x'.repeat(43))
    expect(localStorage.getItem(PURCHASES_KEY)).toBeNull()
    expect(sessionStorage.getItem(PURCHASES_KEY)).toContain('x'.repeat(43))
    expect(window.location.href).not.toContain('x'.repeat(43))
  })
  it('does not remember an unverified recovery key', async () => {
    window.history.replaceState(null, '', '/#purchase'); sessionStorage.clear()
    await mount()
    const input = container.querySelector('input[type=password]')!
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(input, `FK1.${orderId}.${'y'.repeat(43)}`); input.dispatchEvent(new Event('input', { bubbles:true })) })
    fetchMock.mockResolvedValueOnce(failure(404, 'order_not_found'))
    await act(async () => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true })) })
    expect(sessionStorage.getItem(PURCHASES_KEY)).toBeNull()
    expect(container.textContent).not.toContain('A private full report paragraph.')
  })
  it('makes the buyer keep a recovery code before leaving for Stripe', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ orderId, accessToken:'z'.repeat(43), mode:'test', checkoutUrl:'https://checkout.stripe.com/c/pay/cs_test_fixture' }))
    await mountCheckout()
    await act(async () => { button('Buy test report').click() })
    expect(container.textContent).toContain('Keep your report access safe')
    expect(button('Continue to Stripe').disabled).toBe(true)
    expect(sessionStorage.getItem(PURCHASES_KEY)).toContain('z'.repeat(43))
    expect(localStorage.getItem(PURCHASES_KEY)).toBeNull()
    expect(window.location.hostname).toBe('saju-english-report-preview-qa.vercel.app')
  })
})
