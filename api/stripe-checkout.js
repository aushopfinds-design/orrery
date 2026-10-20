// Sandbox-only Stripe Checkout. Never accept a price or redirect URL from the browser.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const key = process.env.STRIPE_TEST_SECRET_KEY
  if (!key?.startsWith('sk_test_')) return res.status(503).json({ error: 'Sandbox checkout is not configured yet.' })
  // Use the current Vercel preview hostname so a redeployment never returns to a stale URL.
  const host = req.headers.host
  if (typeof host !== 'string' || !/^saju-english-report-preview(?:-[a-z0-9]+)?(?:-shopping-shorts-ai)?\\.vercel\\.app$/.test(host)) {
    return res.status(403).json({ error: 'Sandbox checkout is available on the preview site only.' })
  }
  const origin = 'https://' + host
  const { birthDraft, kind } = req.body || {}
  const products = {
    complete: ['Complete Life Reading', 1499],
    compatibility: ['Love & Compatibility Reading', 999],
    year: ['Year Ahead Reading', 799],
    career: ['Career Reading', 899],
    business: ['Business Reading', 999],
    wellbeing: ['Wellbeing Reading', 699],
    bundle: ['Complete Bundle', 2299],
  }
  if (typeof kind !== 'string' || !Object.hasOwn(products, kind)) return res.status(400).json({ error: 'Unknown report product.' })
  const [productName, amount] = products[kind]
  if (typeof birthDraft !== 'string' || birthDraft.length > 5000) return res.status(400).json({ error: 'Invalid report details.' })
  // Personal birth details stay in the customer's browser; do not send them to Stripe metadata.
  const form = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][price_data][product_data][name]': productName + ' | THE FATE KEY',
    'line_items[0][quantity]': '1',
    success_url: origin + '/?checkout=success&session_id={CHECKOUT_SESSION_ID}#my-report',
    cancel_url: origin + '/?checkout=cancelled#my-report',
    'metadata[product]': kind,
    'payment_method_types[0]': 'card',
  })
  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString(),
    })
    const data = await response.json()
    if (!response.ok || !data.url || data.livemode !== false) return res.status(502).json({ error: 'Stripe sandbox could not create the checkout.' })
    return res.status(200).json({ url: data.url })
  } catch { return res.status(502).json({ error: 'Stripe sandbox is temporarily unavailable.' }) }
}
