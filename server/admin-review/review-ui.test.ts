import { describe, expect, it, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { reviewPage } from './ui.ts'
import { PREVIEW_KINDS } from '../../src/report/personal-products.ts'

describe('Private review interactions (local DOM, no provider or deployment)', () => {
  it.each(PREVIEW_KINDS)('%s opens paired passages and requires explicit consent before translation', async kind => {
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
      const select = form.querySelector<HTMLSelectElement>('select[name=kind]')!
      select.value = kind; select.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      expect(doc.getElementById('partner')!.hidden).toBe(!['compatibility', 'bundle'].includes(kind))
      form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
      await vi.waitFor(() => expect(doc.querySelector('.pair [lang=en] .passage')?.textContent).toBe(blocks[0].english))
      const button = doc.getElementById('translate') as HTMLButtonElement
      expect(button.disabled).toBe(true)
      expect(requests[0].body.kind).toBe(kind)
      expect(Boolean(requests[0].body.second)).toBe(['compatibility', 'bundle'].includes(kind))
      const consent = doc.getElementById('consent') as HTMLInputElement
      consent.checked = true; consent.dispatchEvent(new dom.window.Event('change'))
      expect(button.disabled).toBe(false)
      button.click()
      await vi.waitFor(() => expect(doc.querySelector('.pair [lang=ko] .passage')?.textContent).toBe('상대방에게 조금 더 분명하게 설명해 달라고 요청해 보세요.'))
      expect(requests[1].body).toEqual({ digest: 'test-digest', blocks, consent: true })
      expect(doc.querySelector('.pair [lang=en] .passage')!.textContent).toBe(blocks[0].english)
      ;(doc.getElementById('clear') as HTMLButtonElement).click()
      expect(doc.getElementById('workspace')!.hidden).toBe(true)
      expect(doc.getElementById('documents')!.textContent).toBe('')
    } finally { dom.window.close() }
  })
})
