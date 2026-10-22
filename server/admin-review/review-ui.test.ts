import { describe, expect, it, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { reviewPage } from './ui.ts'
import { PREVIEW_KINDS } from '../../src/report/personal-products.ts'

describe('Private review interactions (local DOM, no provider or deployment)', () => {
  it.each(PREVIEW_KINDS)('%s opens complete language views and requires explicit consent before translation', async kind => {
    const requests: { action: string; body: Record<string, unknown> }[] = []
    // Deliberately tiny fictional transport fixture: not a report/translation quality claim.
    const blocks = [{ id: '1.1', english: 'You can ask for a clearer answer.', proof: 'signed-test-proof' }]
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      const action = new URL(url, 'https://review.example').searchParams.get('action')!
      const body = JSON.parse(String(init.body))
      requests.push({ action, body })
      return Response.json(action === 'report' ? { title: 'Career & Money', digest: 'test-digest', edition: 'test',
        charts: [], referenceYear: 2026, translationReady: true, documents: [{ title: 'English source', blocks }] }
        : { blocks: [{ id: '1.1', korean: '상대방에게 조금 더 분명하게 설명해 달라고 요청해 보세요.' }] })
    })
    const dom = new JSDOM(reviewPage('nonce'), { url: 'https://review.example/api/admin-review', runScripts: 'dangerously',
      beforeParse(window) { window.fetch = fetcher as unknown as typeof fetch } })
    try {
      const doc = dom.window.document
      const form = doc.querySelector('form')!
      ;(doc.querySelector(`[data-review-kind="${kind}"]`) as HTMLButtonElement).click()
      expect(doc.getElementById('panel-reports')!.hidden).toBe(false)
      expect(doc.getElementById('panel-overview')!.hidden).toBe(true)
      expect(requests).toHaveLength(0)
      const select = form.querySelector<HTMLSelectElement>('select[name=kind]')!
      select.value = kind; select.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      expect(doc.getElementById('partner')!.hidden).toBe(!['compatibility', 'bundle'].includes(kind))
      form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
      await vi.waitFor(() => expect(doc.querySelector('#reading-en .passage')?.textContent).toBe(blocks[0].english))
      expect(doc.getElementById('reading-ko')!.hidden).toBe(false)
      expect(doc.getElementById('reading-en')!.hidden).toBe(true)
      ;(doc.querySelector('[data-reading=en]') as HTMLButtonElement).click()
      expect(doc.getElementById('reading-en')!.hidden).toBe(false)
      expect(doc.getElementById('reading-ko')!.hidden).toBe(true)
      const button = doc.getElementById('translate') as HTMLButtonElement
      expect(button.disabled).toBe(true)
      expect(requests[0].body.kind).toBe(kind)
      expect(Boolean(requests[0].body.second)).toBe(['compatibility', 'bundle'].includes(kind))
      const consent = doc.getElementById('consent') as HTMLInputElement
      consent.checked = true; consent.dispatchEvent(new dom.window.Event('change'))
      expect(button.disabled).toBe(false)
      button.click()
      await vi.waitFor(() => expect(doc.querySelector('#reading-ko .passage')?.textContent).toBe('상대방에게 조금 더 분명하게 설명해 달라고 요청해 보세요.'))
      expect(requests[1].body).toEqual({ digest: 'test-digest', blocks, consent: true })
      expect(doc.querySelector('#reading-en .passage')!.textContent).toBe(blocks[0].english)
      ;(doc.getElementById('clear') as HTMLButtonElement).click()
      expect(doc.getElementById('workspace')!.hidden).toBe(true)
      expect(doc.getElementById('documents')!.textContent).toBe('')
    } finally { dom.window.close() }
  })
  it('keeps whole bundle documents ordered across batches, interrupted translation and language switches', async () => {
    const blocks = Array.from({ length: 10 }, (_, index) => ({ id: String(index), english: index === 2 ? '' : `English paragraph ${index}`, proof: 'test-proof' }))
    let fail = true
    const translatedIds: string[][] = []
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      const action = new URL(url, 'https://review.example').searchParams.get('action')
      const body = JSON.parse(String(init.body))
      if (action === 'report') return Response.json({ title: 'Bundle', digest: 'test', charts: [], translationReady: true,
        documents: [{ title: 'Life', blocks: blocks.slice(0, 5) }, { title: 'Annual', blocks: blocks.slice(5) }] })
      translatedIds.push(body.blocks.map((b: { id: string }) => b.id))
      if (translatedIds.length === 2 && fail) { fail = false; return Response.json({ error: 'temporary' }, { status: 503 }) }
      return Response.json({ blocks: [...body.blocks].reverse().map((b: { id: string }) => ({ id: b.id, korean: `한국어 문단 ${b.id}` })) })
    })
    const dom = new JSDOM(reviewPage('nonce'), { url: 'https://review.example/api/admin-review', runScripts: 'dangerously',
      beforeParse(window) { window.fetch = fetcher as unknown as typeof fetch } })
    try {
      const doc = dom.window.document
      doc.querySelector('form')!.dispatchEvent(new dom.window.Event('submit', { cancelable: true }))
      await vi.waitFor(() => expect(doc.querySelectorAll('#reading-en .passage')).toHaveLength(2))
      const english = blocks.slice(0, 5).map(b => b.english).join('\n\n')
      expect(doc.querySelector('#reading-en .passage')!.textContent).toBe(english)
      expect(doc.querySelectorAll('#documents .pair')).toHaveLength(0)
      const consent = doc.getElementById('consent') as HTMLInputElement
      consent.checked = true; consent.dispatchEvent(new dom.window.Event('change'))
      const button = doc.getElementById('translate') as HTMLButtonElement
      button.click()
      await vi.waitFor(() => expect(doc.getElementById('message')!.textContent).toContain('temporary'))
      expect(button.disabled).toBe(false)
      button.click()
      await vi.waitFor(() => expect(doc.querySelectorAll('#reading-ko .passage')[1].textContent).toBe(blocks.slice(5).map(b => `한국어 문단 ${b.id}`).join('\n\n')))
      expect(translatedIds).toEqual([['0', '1', '3', '4', '5', '6', '7', '8'], ['9'], ['9']])
      expect(doc.querySelector('#reading-ko .passage')!.textContent).toBe(['한국어 문단 0', '한국어 문단 1', '', '한국어 문단 3', '한국어 문단 4'].join('\n\n'))
      const calls = fetcher.mock.calls.length
      ;(doc.querySelector('[data-reading=en]') as HTMLButtonElement).click()
      ;(doc.querySelector('[data-reading=ko]') as HTMLButtonElement).click()
      expect(fetcher).toHaveBeenCalledTimes(calls)
      expect(doc.querySelector('#reading-en .passage')!.textContent).toBe(english)
      ;(doc.getElementById('clear') as HTMLButtonElement).click()
      expect(doc.querySelectorAll('#documents .passage')).toHaveLength(0)
    } finally { dom.window.close() }
  })
  it('explains products and the website without AI or order requests', () => {
    const fetcher = vi.fn()
    const dom = new JSDOM(reviewPage('nonce'), { url: 'https://review.example/api/admin-review', runScripts: 'dangerously',
      beforeParse(window) { window.fetch = fetcher } })
    try {
      const doc = dom.window.document
      expect(doc.querySelectorAll('[data-product]')).toHaveLength(7)
      expect(doc.querySelector('[data-product=complete]')!.textContent).toContain('US$16.99')
      expect(doc.querySelector('[data-product=bundle]')!.textContent).toContain('US$24.99')
      expect(doc.getElementById('panel-overview')!.hidden).toBe(false)
      ;(doc.querySelector('[data-panel=site]') as HTMLButtonElement).click()
      expect(doc.getElementById('panel-site')!.hidden).toBe(false)
      expect(doc.querySelectorAll('[data-site-step]')).toHaveLength(8)
      expect(doc.querySelector('[data-panel=site]')!.getAttribute('aria-pressed')).toBe('true')
      expect(doc.querySelector('[data-site-step=preview] [lang=ko]')!.textContent).toContain('일부 문단')
      expect(fetcher).not.toHaveBeenCalled()
    } finally { dom.window.close() }
  })
})
