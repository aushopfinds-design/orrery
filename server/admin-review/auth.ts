import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose'
import type { JWTVerifyGetKey } from 'jose'
import type { ReviewConfig } from './config.ts'
import { ReviewError } from './config.ts'

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
export const SESSION_COOKIE = '__Host-fate-review'
export const NONCE_COOKIE = '__Host-fate-review-nonce'
const issuer = 'fate-key-admin-review'
export const cookie = (name: string, value: string, age: number) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`
export function readCookie(request: Request, name: string) {
  return request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='))?.slice(name.length + 1) ?? ''
}
export async function ticket(config: ReviewConfig, subject: string, purpose: string, data: Record<string, unknown>, seconds: number) {
  return new SignJWT({ ...data, purpose }).setProtectedHeader({ alg: 'HS256' }).setIssuer(issuer)
    .setAudience(config.origin).setSubject(subject).setIssuedAt().setExpirationTime(`${seconds}s`).sign(config.signingKey)
}
export async function verifyTicket(config: ReviewConfig, value: string, purpose: string) {
  try {
    const { payload } = await jwtVerify(value, config.signingKey, { algorithms: ['HS256'], issuer, audience: config.origin, requiredClaims: ['exp', 'iat', 'sub'] })
    if (payload.purpose !== purpose || !payload.sub) throw new Error()
    return payload
  } catch { throw new ReviewError('unauthorized', 401) }
}
export async function verifyGoogle(config: ReviewConfig, token: string, nonce: string, keys: JWTVerifyGetKey = googleKeys) {
  try {
    const { payload } = await jwtVerify(token, keys, { algorithms: ['RS256'],
      issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: config.clientId,
      requiredClaims: ['exp', 'iat', 'sub', 'email', 'email_verified', 'nonce'], maxTokenAge: '10m' })
    if (payload.email !== config.adminEmail || payload.email_verified !== true || payload.nonce !== nonce) throw new Error()
    return payload.sub!
  } catch { throw new ReviewError('unauthorized', 401) }
}
export async function requireAdmin(config: ReviewConfig, request: Request) {
  const session = await verifyTicket(config, readCookie(request, SESSION_COOKIE), 'session')
  if (session.email !== config.adminEmail) throw new ReviewError('unauthorized', 401)
  return session.sub!
}
