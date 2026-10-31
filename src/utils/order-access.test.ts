// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { parseRecoveryCode, readOrderAccess, recoveryCode, rememberOrder, PURCHASES_KEY } from './order-access.ts'
const id = '3278c82d-e7f8-4dd1-b650-9a65fe5a29c0', token = 'a'.repeat(43)
beforeEach(() => { localStorage.clear(); sessionStorage.clear() })
describe('private purchase recovery', () => {
  it('restores an explicitly remembered purchase after the tab is gone', () => {
    rememberOrder(id, { accessToken: token, kind: 'career' }, true)
    sessionStorage.clear()
    expect(readOrderAccess(id)).toEqual({ accessToken: token, kind: 'career' })
    expect(localStorage.getItem(PURCHASES_KEY)).not.toMatch(/birth|year|latitude|email/)
  })
  it('does not persist purchase access on a shared device by default', () => {
    rememberOrder(id, { accessToken: token })
    expect(localStorage.getItem(PURCHASES_KEY)).toBeNull()
    sessionStorage.clear()
    expect(readOrderAccess(id)).toBeUndefined()
  })
  it('accepts the whole private code and rejects a URL, order number alone and extra content', () => {
    const code = recoveryCode(id, token)
    expect(parseRecoveryCode(' ' + code + '\n')).toEqual({ orderId: id, accessToken: token })
    for (const invalid of [id, code + '.extra', 'https://example.com/?key=' + code, recoveryCode(id, 'short'), recoveryCode('bad-order', token)]) {
      expect(parseRecoveryCode(invalid)).toBeNull()
    }
  })
  it('keeps existing Sandbox purchases readable without copying their key into a URL', () => {
    sessionStorage.setItem('fate-sandbox-orders-v1', JSON.stringify({ [id]: { accessToken: token } }))
    expect(readOrderAccess(id)?.accessToken).toBe(token)
    expect(window.location.href).not.toContain(token)
  })
})
