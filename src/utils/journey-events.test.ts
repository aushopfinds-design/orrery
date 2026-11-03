import { afterEach, describe, expect, it, vi } from 'vitest'
import journey from '../../api/journey.ts'
const origin = 'https://thefatekey.com'
function request(body: unknown, from = origin) { return new Request(origin + '/api/journey', { method: 'POST', headers: { Origin: from, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
afterEach(() => vi.restoreAllMocks())
describe('anonymous journey event boundary', () => {
  it('logs only allowlisted activity and category, without birth details or identifiers', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {})
    expect((await journey.fetch(request({ event: 'report_selected', product: 'career' }))).status).toBe(204)
    expect(JSON.parse(log.mock.calls[0][0])).toEqual({ type: 'fate_journey', event: 'report_selected', product: 'career', environment: 'production' })
  })
  it.each([{ event: 'visit', birthDate: 'private' }, { event: 'purchase_paid' }, { event: 'visit', product: 'unknown' }, { event: 'visit', orderId: 'private' }])('rejects unsupported or personal payload %j', async body => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {})
    expect((await journey.fetch(request(body))).status).toBe(400)
    expect(log).not.toHaveBeenCalled()
  })
  it('rejects foreign origins and excessive bodies before logging', async () => {
    expect((await journey.fetch(request({ event: 'visit' }, 'https://other.example'))).status).toBe(403)
    expect((await journey.fetch(request({ event: 'x'.repeat(300) }))).status).toBe(413)
  })
  it('respects Do Not Track', async () => {
    const r = request({ event: 'visit' }); r.headers.set('DNT', '1')
    expect((await journey.fetch(r)).status).toBe(403)
  })
})
