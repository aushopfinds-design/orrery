# THE FATE KEY — Stage 2 Payment and Email Test

Date: 2026-11-04 (Australia/Sydney)

## Current result

No real-money charge was made. The Preview now reports `available:true, mode:test` and `emailDeliveryReady:true`. A Product 01 Test Mode payment completed and its order, PDF, and repeat download were verified. The other six product flows remain pending.

## Checks completed

- Reviewed the existing Stripe Checkout, signature-verified webhook, encrypted order store, PDF issuance, Resend delivery, recovery/download routes, and sandbox test route.
- Ran `npx vitest run server/payments --maxWorkers=2`: **15 files, 81 tests passed**. These use local provider/database fixtures; they are not evidence of a real Stripe or Resend transaction.
- Product 01 (`complete`) was checked through the deployed Preview: Stripe returned a successful Test Mode payment; the order was stored with `livemode=false` and `payment_state=paid`; PDF fulfillment reached `complete`; the report endpoint returned HTTP 200; two separate PDF downloads returned HTTP 200, `application/pdf`, and valid `%PDF-` files.
- Read-only Neon verification for that test order found a saved PDF artifact and Resend delivery state `sent`, attempt 1. The provider uses the fixed Sandbox recipient `delivered@resend.dev`; this does not prove arrival in a real mailbox.
- The configured Stripe Webhook endpoint still pointed to an older branch URL. The order database contained only `server.qa` and `server.reconciliation` events, not a Stripe event. A targeted source fix now makes the existing Test Mode endpoint update to the current Preview origin and persists that URL while retaining its signing secret.
- The webhook source regression test passed (1 targeted test); `npx tsc -b --pretty false` passed. The source fix is not yet deployed at the time of this checkpoint.
- Confirmed the GitHub branch was clean at baseline `7bca5a6015a5c3470f8327cdc0cbffbd0271d5ba`.
- Test configuration variables had been scoped to the previous branch `feature/english-saju-report-20261013`. Their Preview branch scope was moved to `feature/final-simple-reports`; the Preview mode is explicitly `test`, and the private checkout token was rotated to a random Preview-only value. No Production setting was changed. No secret was printed or added to GitHub.
- The latest deployed Preview at this checkpoint reached READY and returned HTTP 200. The webhook fix still needs a Preview redeploy and a fresh paid order to verify actual Stripe webhook delivery.

## Verification matrix

| Item | Result | Evidence |
|---|---|---|
| Stripe test payment | PASS for Product 01 | Stripe Test Mode returned confirmed; order shows `livemode=false` |
| Webhook handling | FAIL, fix pending deployment | Current DB did not receive a Stripe event; old endpoint URL pointed to prior branch |
| Order persistence | PASS for Product 01 | Preview database shows paid order |
| Automatic PDF issuance | PASS for Product 01 | Fulfillment complete and artifact present |
| Actual email receipt | UNVERIFIED | Resend state is `sent`; Sandbox routes to `delivered@resend.dev`, not a user mailbox |
| Download and re-download | PASS for Product 01 | Two PDF downloads returned HTTP 200 and valid PDFs |
| Seven-product provider flow | UNVERIFIED | Product 01 checked; Products 02–07 still pending |
| Independent calculation verification | UNVERIFIED | No independent pillar-engine comparison was performed |
| Personal-data access protection | UNVERIFIED for deployed flow | Local authorization/privacy tests pass; no Preview purchase credentials were issued |
| GitHub save | UNVERIFIED | The source fix and updated report are pending commit/push |
| Preview deployment | PASS, test mode open | Last deployed Preview was READY; webhook fix needs deployment |

## Required next step

Commit and deploy the webhook URL refresh fix. Confirm the stored endpoint points at the current Preview, then run a new Test Mode order and verify Stripe's event reaches the Preview database. Test Products 02–07, decline/expiry, duplicate webhook, and unauthorized access. Actual mailbox receipt remains unverified because the Sandbox forces delivery to `delivered@resend.dev`; do not report it as received.

No checkout order, card details, birth data, email address, or provider secret was sent or stored by this test attempt.
