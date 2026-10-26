/** A public support reference. It never grants access to a purchased report. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
export interface ReportCertificate { number: string; title: string }
export function reportReference(orderId: string, year: number, document = 1): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId) || !Number.isInteger(year) || year < 2000 || year > 2099 || !Number.isInteger(document) || document < 0 || document > 3) throw new Error('Invalid report reference')
  let value = BigInt('0x' + orderId.replace(/-/g, '')), code = ''
  for (let i = 0; i < 26; i++) { code = ALPHABET[Number(value & 31n)] + code; value >>= 5n }
  return `FK-${year}-${code}-${String(document).padStart(2,'0')}`
}
export function readReportReference(reference: string): { orderId: string; year: number; document: number } | null {
  const match = /^FK-(20\d{2})-([0-9A-HJKMNP-TV-Z]{26})-(0[0-3])$/.exec(reference.trim().toUpperCase())
  if (!match) return null
  let value = 0n
  for (const char of match[2]) value = value * 32n + BigInt(ALPHABET.indexOf(char))
  if (value >= 1n << 128n) return null
  const hex = value.toString(16).padStart(32, '0'), orderId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(orderId)) return null
  return { orderId, year: Number(match[1]), document: Number(match[3]) }
}
