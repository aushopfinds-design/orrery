export class PaymentError extends Error {
  readonly code: string
  readonly status: number
  constructor(code: string, status = 400) { super(code); this.code = code; this.status = status }
}

export interface PaymentConfig {
  stripeKey: string
  webhookSecret: string
  databaseUrl: string
  origin: string
  dataKey: string
  accessKey: string
  testToken: string
}

/** Stage one is private sandbox infrastructure. Live keys and production are refused. */
export function paymentConfig(env: NodeJS.ProcessEnv): PaymentConfig {
  if (env.FATE_PAYMENTS_MODE !== 'test' || env.VERCEL_ENV === 'production') throw new PaymentError('payments_closed', 503)
  const stripeKey = env.STRIPE_TEST_SECRET_KEY ?? env.STRIPE_SECRET_KEY ?? ''
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET ?? ''
  const databaseUrl = env.FATE_PAYMENTS_DATABASE_URL ?? ''
  const origin = env.VERCEL_ENV === 'preview' && env.VERCEL_URL
    ? `https://${env.VERCEL_URL}` : env.FATE_PAYMENTS_ORIGIN ?? ''
  const dataKey = env.FATE_ORDER_DATA_KEY ?? ''
  const accessKey = env.FATE_ORDER_ACCESS_KEY ?? ''
  const testToken = env.FATE_CHECKOUT_TEST_TOKEN ?? ''
  if (!/^(sk|rk)_test_[A-Za-z0-9]+$/.test(stripeKey) || !/^whsec_[A-Za-z0-9]+$/.test(webhookSecret) ||
      !/^[a-f0-9]{64}$/i.test(dataKey) || !/^[a-f0-9]{64}$/i.test(accessKey) || dataKey === accessKey || testToken.length < 32) {
    throw new PaymentError('payment_configuration_incomplete', 503)
  }
  try {
    const site = new URL(origin), database = new URL(databaseUrl)
    if (env.VERCEL_ENV === 'preview' && !/^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(site.hostname)) throw new Error()
    if (site.origin !== origin || site.username || site.password || site.protocol !== 'https:' ||
        !['postgres:', 'postgresql:'].includes(database.protocol) || database.searchParams.get('sslmode') !== 'verify-full') throw new Error()
  } catch { throw new PaymentError('payment_configuration_incomplete', 503) }
  return { stripeKey, webhookSecret, databaseUrl, origin, dataKey, accessKey, testToken }
}
