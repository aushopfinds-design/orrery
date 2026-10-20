// Verify the session directly with Stripe before acknowledging a sandbox purchase.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const key = process.env.STRIPE_TEST_SECRET_KEY
  if (!key?.startsWith('sk_test_')) return res.status(503).json({ verified: false })
  const session = req.query?.session_id
  if (typeof session !== 'string' || !/^cs_test_[a-zA-Z0-9]+$/.test(session)) return res.status(400).json({ verified: false })
  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(session), {
      headers: { Authorization: 'Bearer ' + key },
    })
    if (!response.ok) return res.status(200).json({ verified: false })
    const data = await response.json()
    const verified = data.livemode === false && data.payment_status === 'paid' &&
      data.mode === 'payment' && data.amount_total === 1499 &&
      data.currency === 'usd' && data.metadata?.product === 'complete'
    return res.status(200).json({ verified })
  } catch { return res.status(502).json({ verified: false }) }
}
