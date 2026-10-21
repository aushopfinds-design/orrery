export class ReviewError extends Error {
  readonly code: string
  readonly status: number
  constructor(code: string, status = 400) { super(code); this.code = code; this.status = status }
}
export interface ReviewConfig {
  origin: string; clientId: string; adminEmail: string; signingKey: Uint8Array
  gatewayKey?: string; model?: string
}
/** No payment secret, customer order database or public VITE_* setting is used here. */
export function reviewConfig(env: NodeJS.ProcessEnv): ReviewConfig {
  if (env.FATE_REVIEW_ENABLED !== 'true' || env.VERCEL_ENV !== 'preview'
    || env.VERCEL_GIT_COMMIT_REF !== 'feature/english-saju-report-20261013') throw new ReviewError('not_found', 404)
  const origin = env.FATE_REVIEW_ORIGIN ?? ''
  const url = new URL(origin || 'https://invalid.example')
  if (url.origin !== origin || url.protocol !== 'https:'
    || !/^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(url.hostname)
    || !/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(env.FATE_REVIEW_GOOGLE_CLIENT_ID ?? '')
    || !/^[a-z0-9._%+-]+@gmail\.com$/.test(env.FATE_REVIEW_ADMIN_EMAIL ?? '')
    || !/^[a-f0-9]{64}$/.test(env.FATE_REVIEW_SIGNING_KEY ?? '')) throw new ReviewError('review_not_configured', 503)
  return { origin, clientId: env.FATE_REVIEW_GOOGLE_CLIENT_ID!, adminEmail: env.FATE_REVIEW_ADMIN_EMAIL!,
    signingKey: Buffer.from(env.FATE_REVIEW_SIGNING_KEY!, 'hex'),
    gatewayKey: env.FATE_REVIEW_AI_GATEWAY_KEY, model: env.FATE_REVIEW_TRANSLATION_MODEL }
}
