export class PaymentError extends Error {
  readonly code: string
  readonly status: number
  constructor(code: string, status = 400) { super(code); this.code = code; this.status = status }
}

export interface PaymentConfig {
  mode?: 'test' | 'live'
  checkoutOpen?: boolean
  stripeKey: string
  webhookSecret: string
  databaseUrl: string
  origin: string
  dataKey: string
  accessKey: string
  testToken: string
}

/** Live checkout needs a separate credential set and an explicit launch switch. */
export function paymentConfig(env: NodeJS.ProcessEnv): PaymentConfig {
  const live = env.FATE_PAYMENTS_MODE === 'live'
  if (live ? env.VERCEL_ENV !== 'production'
    : env.FATE_PAYMENTS_MODE !== 'test' || env.VERCEL_ENV === 'production') throw new PaymentError('payments_closed', 503)
  const stripeKey = live ? env.STRIPE_LIVE_SECRET_KEY ?? '' : env.STRIPE_TEST_SECRET_KEY ?? env.STRIPE_SECRET_KEY ?? ''
  const webhookSecret = (live ? env.STRIPE_LIVE_WEBHOOK_SECRET : env.STRIPE_WEBHOOK_SECRET) ?? ''
  const databaseUrl = (live ? env.FATE_PAYMENTS_LIVE_DATABASE_URL : env.FATE_PAYMENTS_DATABASE_URL) ?? ''
  const origin = live ? 'https://thefatekey.com' : env.VERCEL_ENV === 'preview' && env.VERCEL_URL
    ? `https://${env.VERCEL_URL}` : env.FATE_PAYMENTS_ORIGIN ?? ''
  const dataKey = (live ? env.FATE_LIVE_ORDER_DATA_KEY : env.FATE_ORDER_DATA_KEY) ?? ''
  const accessKey = (live ? env.FATE_LIVE_ORDER_ACCESS_KEY : env.FATE_ORDER_ACCESS_KEY) ?? ''
  const testToken = env.FATE_CHECKOUT_TEST_TOKEN ?? ''
  const keyPattern = live ? /^(sk|rk)_live_[A-Za-z0-9]+$/ : /^(sk|rk)_test_[A-Za-z0-9]+$/
  if (!keyPattern.test(stripeKey) || !/^whsec_[A-Za-z0-9]+$/.test(webhookSecret) ||
      !/^[a-f0-9]{64}$/i.test(dataKey) || !/^[a-f0-9]{64}$/i.test(accessKey) || dataKey === accessKey || (!live && testToken.length < 32) ||
      (live && (!env.FATE_PUBLIC_OPERATOR_NAME?.trim() || dataKey === env.FATE_ORDER_DATA_KEY || accessKey === env.FATE_ORDER_ACCESS_KEY || databaseUrl === env.FATE_PAYMENTS_DATABASE_URL))) {
    throw new PaymentError('payment_configuration_incomplete', 503)
  }
  try {
    const site = new URL(origin), database = new URL(databaseUrl)
    if (env.VERCEL_ENV === 'preview' && !/^saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(site.hostname)) throw new Error()
    if (site.origin !== origin || site.username || site.password || site.protocol !== 'https:' ||
        !['postgres:', 'postgresql:'].includes(database.protocol) || database.searchParams.get('sslmode') !== 'verify-full') throw new Error()
  } catch { throw new PaymentError('payment_configuration_incomplete', 503) }
  return { mode: live ? 'live' : 'test', checkoutOpen: !live || (env.FATE_CHECKOUT_OPEN === 'true' && env.FATE_SALES_POLICIES_READY === 'true'), stripeKey, webhookSecret, databaseUrl, origin, dataKey, accessKey, testToken: live ? '' : testToken }
}
