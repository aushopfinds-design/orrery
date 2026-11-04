# THE FATE KEY — Stage 2 Payment and Email Test

Date: 2026-11-04 (Australia/Sydney)

## Final verified status

All seven product flows were run in Stripe Test Mode on the Preview. No real-money charge was made. The deployed Preview is test-only; Production and Stripe Live Mode were not changed.

The webhook endpoint initially targeted an old branch. A minimal fix now updates the configured endpoint to the active Preview origin and updates the stored URL without replacing its signing secret. A fresh Product 01 payment after deployment confirmed real Stripe `checkout.session.completed` delivery to the active Preview.

## Results

| Check | Result | Evidence and limits |
|---|---|---|
| Stripe Test Mode payment | PASS | Seven products paid in Test Mode; all orders report `livemode=false`. |
| Webhook handling | PASS | Each of the seven successful orders has a Stripe `checkout.session.completed` event in the Preview database after endpoint refresh. |
| Order persistence | PASS | Seven successful paid orders persisted; payment state is `paid`. |
| Automatic PDF generation | PASS | Fulfillment completed and artifacts exist for all seven products; generated PDF endpoints returned valid PDFs. |
| Email provider submission | PASS | All seven records show Resend state `sent`, one attempt each. |
| Actual email arrival in a mailbox | UNVERIFIED | Test mode routes to Resend's fixed `delivered@resend.dev` sink. No real customer inbox was checked. |
| Download and re-download | PASS / PARTIAL | PDFs downloaded successfully for all seven. Two separate successful downloads were confirmed for Product 01; repeat-download was not separately exercised for Products 02–07. |
| Seven-product flow | PASS | Product mappings: 01 `complete`, 02 `career`, 03 `compatibility`, 04 `year`, 05 `business`, 06 `wellbeing`, 07 `bundle`. |
| Declined payment | PASS | Test decline remained unpaid; report access returned HTTP 402; no artifact or email attempt was created. |
| Expired checkout | PASS | Expiration event recorded; order expired; report access returned HTTP 402; no artifact or email attempt was created. |
| Hosted Stripe cancellation UI | UNVERIFIED | Cancellation return URL responded HTTP 200 and report access was denied with HTTP 402. Expected cancellation copy was not found; hosted Checkout cancel-button behavior was not exercised. |
| Duplicate webhook external replay | UNVERIFIED | Local idempotency coverage exists, but a duplicate Stripe delivery was not manually replayed against Preview. |
| Email failure/retry against provider | UNVERIFIED | Local failure/retry tests are not an external Resend failure injection. |
| Independent Saju calculation | UNVERIFIED | No independent calculation comparison was performed as part of this payment run. |
| Personal-data access protection | PASS for checked route | A report request without the order access token returned 404. This is a route-level check, not a full security audit. |
| GitHub save | PASS | Branch: `feature/final-simple-reports`; source fix commit: `15e125023c389fcec6aecef506ab40505ba7c05a`. This report update is committed separately. |
| Preview deployment | PASS | READY deployment: https://saju-english-report-preview-95jqs9dng-shopping-shorts-ai.vercel.app . Preview HTTP checks returned 200. |

## Code and test record

Reviewed the existing Stripe Checkout, signature-verified webhook, encrypted order store, PDF fulfillment, Resend delivery, download/recovery routes, and sandbox test route.

Source change in commit `15e1250`:
- `server/payments/handler.ts`: use the active service origin when refreshing the webhook endpoint.
- `server/payments/service.ts`: update an existing endpoint and persist its current URL while retaining the signing secret.
- `server/payments/store.ts`: add an update path for the existing setting.
- `server/payments/payments.test.ts`: regression test for endpoint URL refresh and secret retention.

Verification:
- Before the source fix: `npx vitest run server/payments --maxWorkers=2`: 15 files, 81 tests passed.
- After the fix: targeted webhook regression test passed (1 passed, 35 skipped); `npx tsc -b --pretty false` passed.
- No full test suite was rerun after the small source fix.
- The full web build was not rerun after the source fix.

Test orders used synthetic birth profiles only. Sandbox recipient details and provider secrets were not committed or printed. The private test token is Preview-only and was rotated. No Production environment or payment/email configuration was modified.

## One-off email receipt check (in progress)

The operator authorized a single Test Mode delivery check to the provided inbox. The recipient override is stored as a sensitive Vercel Preview variable scoped only to `feature/final-simple-reports`; the sender still defaults to Resend's test sink when no Preview recipient is explicitly configured. It is not stored in source control and is not available in Production. The code and Preview setting are in place. The private Preview test token was rotated and remains out of source control. A post-setting Preview deployment and one paid Test Mode order are still required before reporting delivery; actual receipt must be confirmed from the inbox.

## Remaining limitations

Actual mailbox receipt, independent calculation verification, external duplicate-webhook replay, provider-side email failure/retry, and hosted Checkout cancellation UI remain unverified. The cancellation return URL itself denied unpaid report access, but its expected message was not displayed. These limitations should be resolved before treating the entire customer purchase-to-inbox experience as fully proven.
