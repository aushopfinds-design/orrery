// Private developer QA. Uses fictional birth details and Stripe's test tokens only.
// Usage: node scripts/qa-sandbox.mjs https://<this-project-preview>.vercel.app
// Credentials stay in the ignored .env.payments.local; results omit capabilities/secrets.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
const site = process.argv[2]
if (!site || !/^https:\/\/saju-english-report-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(site)) throw new Error('A FATE KEY preview URL is required')
const env = Object.fromEntries((await readFile('.env.payments.local', 'utf8')).split('\n').filter(l => l && !l.startsWith('#')).map(l => { const at = l.indexOf('='); return [l.slice(0, at), l.slice(at + 1)] }))
if (env.FATE_PAYMENTS_MODE !== 'test' || !env.FATE_CHECKOUT_TEST_TOKEN) throw new Error('Private Sandbox configuration is required')
const access = env.FATE_CHECKOUT_TEST_TOKEN
const first = { year: 1992, month: 8, day: 17, hour: 0, minute: 0, unknownTime: true, gender: 'M', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }
const second = { ...first, year: 1988, gender: 'F', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 }
const cents = { complete: 1499, compatibility: 999, year: 799, career: 899, business: 999, wellbeing: 699, bundle: 2299 }
const results = { preview: site, startedAt: new Date().toISOString(), products: [], errors: [] }
const caps = {}
const assert = (ok, message) => { if (!ok) throw new Error(message) }
async function post(action, body, capability, extra = {}) {
  const response = await fetch(site + '/api/payments?action=' + action, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: site, 'X-Fate-Test-Token': access, ...(capability ? { Authorization: 'Bearer ' + capability } : {}), ...extra },
    body: typeof body === 'string' ? body : JSON.stringify(body), signal: AbortSignal.timeout(115000) })
  const type = response.headers.get('content-type') ?? ''
  return { response, data: type.includes('application/pdf') ? Buffer.from(await response.arrayBuffer()) : await response.json() }
}
function input(kind) { return { kind, first, ...(['compatibility', 'bundle'].includes(kind) ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: new Date().getUTCFullYear() + 1 } : {}) } }
async function create(kind, key = randomUUID()) {
  const result = await post('checkout', input(kind), null, { 'Idempotency-Key': key })
  assert(result.response.status === 200 && result.data.mode === 'test', `Checkout ${kind}: ${result.response.status} ${result.data.error ?? ''}`)
  assert(result.data.checkoutUrl.startsWith('https://checkout.stripe.com/'), 'Checkout host mismatch')
  caps[result.data.orderId] = result.data.accessToken
  return { ...result.data, key }
}
const setup = await post('webhook-setup', {})
assert(setup.response.status === 200 && setup.data.configured, 'Sandbox webhook setup failed: ' + JSON.stringify(setup.data))
console.log(JSON.stringify({ webhookConfigured: true, endpoint: setup.data.id }))
await mkdir('../qa-deployed-pdfs', { recursive: true })
for (const kind of Object.keys(cents)) {
  const order = await create(kind)
  const again = await create(kind, order.key)
  assert(order.orderId === again.orderId, 'Duplicate order created')
  const before = await post('report', { orderId: order.orderId }, order.accessToken)
  assert(before.response.status === 402, 'Unpaid report was exposed')
  const paid = await post('sandbox-test', { orderId: order.orderId, scenario: 'success' }, order.accessToken)
  assert(paid.response.status === 200 && paid.data.outcome === 'confirmed', `Stripe confirmation ${kind}: ${paid.response.status} ${JSON.stringify(paid.data)}`)
  let report
  for (let attempt = 0; attempt < 15; attempt++) {
    report = await post('report', { orderId: order.orderId }, order.accessToken)
    if (report.response.status === 200) break
    assert(report.response.status === 409, 'Report fetch failed: ' + JSON.stringify(report.data))
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  assert(report.response.status === 200 && report.data.kind === kind && report.data.text.length > 5000, 'Wrong/empty report')
  assert(report.data.documents.length === (kind === 'bundle' ? 3 : 1), 'Wrong report contents')
  const status = await post('status', { orderId: order.orderId }, order.accessToken)
  assert(status.data.amount === cents[kind] && status.data.payment_state === 'paid' && status.data.fulfillment_state === 'complete', 'Payment/order status mismatch')
  const pdf = await post('pdf', { orderId: order.orderId }, order.accessToken)
  assert(pdf.response.status === 200 && pdf.data.subarray(0, 5).toString() === '%PDF-', 'Invalid PDF')
  await writeFile(`../qa-deployed-pdfs/${kind}.pdf`, pdf.data, { mode: 0o600 })
  const repeated = await post('pdf', { orderId: order.orderId }, order.accessToken)
  assert(repeated.data.equals(pdf.data), 'Reissued different PDF')
  const denied = await post('report', { orderId: order.orderId }, 'wrong-order-capability')
  assert(denied.response.status === 404, 'Foreign order was exposed')
  const row = { kind, amount: cents[kind], payment: 'paid', report: 'complete', documents: report.data.documents.length,
    pdfBytes: pdf.data.length, duplicateOrderPrevented: true, unchangedPdfOnRetry: true, unpaidBlocked: true, foreignAccessBlocked: true }
  results.products.push(row); console.log(JSON.stringify(row))
  await writeFile('../sandbox-qa-capabilities.local', JSON.stringify(caps), { mode: 0o600 })
  await writeFile('../sandbox-qa-results.json', JSON.stringify(results, null, 2))
}
for (const scenario of ['decline', 'expire']) {
  const order = await create('complete')
  const exercise = await post('sandbox-test', { orderId: order.orderId, scenario }, order.accessToken)
  assert(exercise.response.status === 200 && exercise.data.outcome === (scenario === 'decline' ? 'declined' : 'expired'), 'Scenario failed: ' + JSON.stringify(exercise.data))
  const report = await post('report', { orderId: order.orderId }, order.accessToken)
  assert(report.response.status === 402, 'Failed/expired payment unlocked report')
  results.errors.push({ scenario, outcome: exercise.data.outcome, reportStatus: report.response.status })
  console.log(JSON.stringify(results.errors.at(-1)))
}
for (const [name, body, headers, expected] of [
  ['missing tester access', input('complete'), { 'X-Fate-Test-Token': '' }, 401],
  ['browser price tampering', { ...input('complete'), amount: 1 }, {}, 400],
  ['unknown product', { ...input('complete'), kind: 'fake-product' }, {}, 400],
  ['cross origin', input('complete'), { Origin: 'https://unrelated.example' }, 403],
  ['oversized request', 'x'.repeat(8001), {}, 413],
]) {
  const result = await post('checkout', body, null, { 'Idempotency-Key': randomUUID(), ...headers })
  assert(result.response.status === expected, name + ' failed')
  results.errors.push({ scenario: name, status: result.response.status })
}
const invalidWebhook = await post('webhook', '{}', null, { 'Stripe-Signature': 'forged' })
assert(invalidWebhook.response.status === 400, 'Forged webhook accepted')
results.errors.push({ scenario: 'forged webhook', status: invalidWebhook.response.status })
results.finishedAt = new Date().toISOString()
await writeFile('../sandbox-qa-results.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify({ complete: true, products: results.products.length, errorCases: results.errors.length }))
