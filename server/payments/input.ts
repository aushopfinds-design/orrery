import { normalizePreviewBirth } from '../../src/utils/preview-draft.ts'
import { isPreviewKind } from '../../src/report/personal-products.ts'
import type { PreviewKind } from '../../src/report/personal-products.ts'
import type { BirthInput } from '../../packages/core/src/types.ts'
import { PaymentError } from './config.ts'

export const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
export interface OrderInput { kind: PreviewKind; first: BirthInput; second?: BirthInput; year?: number; recipientName?: string; marketingConsent?: boolean }
export function orderInput(value: unknown): OrderInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PaymentError('invalid_order')
  const v = value as Record<string, unknown>
  if (Object.keys(v).some(k => !['kind', 'first', 'second', 'year', 'recipientName', 'marketingConsent'].includes(k)) || typeof v.kind !== 'string' || !isPreviewKind(v.kind)) throw new PaymentError('invalid_order')
  if (v.marketingConsent !== undefined && typeof v.marketingConsent !== 'boolean') throw new PaymentError('invalid_order')
  const recipientName = typeof v.recipientName === 'string' ? v.recipientName.trim().normalize('NFC') : undefined
  if (v.recipientName !== undefined && (typeof v.recipientName !== 'string' || (recipientName && (recipientName.length > 40 || !/^[\p{L}\p{M} .’'-]+$/u.test(recipientName))))) throw new PaymentError('invalid_order')
  const first = normalizePreviewBirth(v.first), second = normalizePreviewBirth(v.second)
  const paired = v.kind === 'compatibility' || v.kind === 'bundle'
  if (!first || (paired && !second) || (!paired && v.second !== undefined)) throw new PaymentError('invalid_birth_details')
  // Reject future birth dates without rejecting today's date in a different time zone.
  for (const person of [first, ...(paired && second ? [second] : [])]) {
    if (Date.UTC(person.year, person.month - 1, person.day) > Date.now() + 86_400_000) throw new PaymentError('invalid_birth_details')
  }
  const annual = v.kind === 'year' || v.kind === 'bundle', currentYear = new Date().getUTCFullYear()
  if (annual && (!Number.isInteger(v.year) || (v.year as number) < currentYear || (v.year as number) > currentYear + 10)) throw new PaymentError('invalid_report_year')
  if (!annual && v.year !== undefined) throw new PaymentError('invalid_report_year')
  return { kind: v.kind, first, ...(v.marketingConsent !== undefined ? { marketingConsent: v.marketingConsent as boolean } : {}), ...(recipientName ? { recipientName } : {}), ...(paired ? { second: second! } : {}), ...(annual ? { year: v.year as number } : {}) }
}
