import { isPreviewKind } from '../report/personal-products.ts'
import type { PreviewKind } from '../report/personal-products.ts'

export const PURCHASES_KEY = 'fate-order-access-v2'
const LEGACY_KEY = 'fate-sandbox-orders-v1'
export interface OrderAccess { accessToken: string; kind?: PreviewKind }
const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
export function validOrderId(id: string) { return idPattern.test(id) }
export function readOrderAccess(id: string): OrderAccess | undefined {
  for (const storageName of ['sessionStorage', 'localStorage'] as const) for (const key of [PURCHASES_KEY, LEGACY_KEY]) {
    try {
      const value = JSON.parse(window[storageName].getItem(key) ?? '{}')?.[id]
      if (typeof value?.accessToken === 'string' && value.accessToken.length > 0 && value.accessToken.length <= 1000) {
        return { accessToken: value.accessToken, ...(isPreviewKind(value.kind) ? { kind: value.kind } : {}) }
      }
    } catch { /* A blocked storage area must not hide a key in another area. */ }
  }
}
export function rememberOrder(id: string, access: OrderAccess, persistent = false) {
  if (!validOrderId(id) || !access.accessToken) throw new Error('Invalid order access')
  const save = (storage: Storage) => {
    let previous: Record<string, OrderAccess> = {}
    try { previous = JSON.parse(storage.getItem(PURCHASES_KEY) ?? '{}') } catch { /* Replace corrupt storage. */ }
    if (!previous || typeof previous !== 'object' || Array.isArray(previous)) previous = {}
    storage.setItem(PURCHASES_KEY, JSON.stringify({ ...previous, [id]: access }))
  }
  save(sessionStorage)
  if (persistent) save(localStorage)
}
export function recoveryCode(id: string, accessToken: string) { return `FK1.${id}.${accessToken}` }
export function parseRecoveryCode(value: string) {
  const [version, orderId, accessToken, extra] = value.trim().split('.')
  if (version !== 'FK1' || extra !== undefined || !validOrderId(orderId ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(accessToken ?? '')) return null
  return { orderId, accessToken }
}
export function downloadRecovery(id: string, token: string) {
  const text = `THE FATE KEY — Private purchase recovery\n\n${recoveryCode(id, token)}\n\nOpen ${window.location.origin}/#purchase and paste the code above.\nAnyone with this code can open the purchased report. Keep this file private.\nThis code does not confirm payment; access is checked with the payment provider.\n`
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = `fate-key-recovery-${id.slice(0, 8)}.txt`
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
