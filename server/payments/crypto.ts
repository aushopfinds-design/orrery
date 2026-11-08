import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const hash = (value: string) => createHash('sha256').update(value).digest('hex')
export const fingerprint = (key: string, value: string) => createHmac('sha256', Buffer.from(key, 'hex')).update(value).digest('hex')
export const orderAccessToken = (key: string, id: string) => createHmac('sha256', Buffer.from(key, 'hex')).update(`order-access:v1:${id}`).digest('base64url')
export function secretMatches(actual: string, expected: string) {
  const a = Buffer.from(hash(actual)), b = Buffer.from(hash(expected))
  return timingSafeEqual(a, b)
}
export function sealOrder(key: string, id: string, payload: unknown) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv)
  cipher.setAAD(Buffer.from(`fate-order:v1:${id}`))
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}
export function openOrder(key: string, id: string, sealed: string): unknown {
  const [version, iv, tag, data, extra] = sealed.split('.')
  if (version !== 'v1' || !iv || !tag || !data || extra) throw new Error('Invalid encrypted order')
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'base64url'))
  decipher.setAAD(Buffer.from(`fate-order:v1:${id}`))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8'))
}
