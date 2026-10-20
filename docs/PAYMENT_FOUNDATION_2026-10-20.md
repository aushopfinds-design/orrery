# THE FATE KEY — payment foundation

Stage 1 implements a private Stripe sandbox backend. This is not a paid launch. Public checkout remains disabled; production and live Stripe keys are refused in code.

## Implemented

- Persist an encrypted order before creating hosted Stripe Checkout. Product prices come from the shared server-side catalogue; browser-supplied amounts are rejected.
- Reuse one order and one Checkout Session for the same UUID idempotency key. A changed order cannot reuse that key.
- Verify the Stripe signature against the original request body, retrieve the current Checkout Session, and match its order, amount, currency and payment state before marking an order paid.
- Commit the payment event, paid order and fulfillment job in one database transaction. Unique event, session, payment intent and fulfillment order identifiers prevent duplicate records and duplicate queued issuance.
- Use a timed worker lease so only one exporter can complete a job. Stage 2 must use deterministic private artifact keys and a separate idempotent delivery record before sending files or email.
- Encrypt birth details with AES-256-GCM and bind the ciphertext to its random order ID. Send only the random order ID and integration marker in Stripe metadata. Logs and order-status responses omit birth details and credentials.

## Routes and configuration

`api/payments.ts` exposes three POST actions:

| Route | Required proof | Result |
| --- | --- | --- |
| `/api/payments?action=checkout` | Private test token + UUID `Idempotency-Key` | Hosted checkout URL, random order ID and private order access token |
| `/api/payments?action=webhook` | Valid `Stripe-Signature` | Verified payment recorded and one job queued |
| `/api/payments?action=status` | Private test token + order-specific bearer token | Minimal order and fulfillment status |

Checkout accepts `{kind, first, second?, year?}`. `first` and `second` follow the existing validated birth-input format, including an explicit IANA timezone. Compatibility and bundle require `second`; annual and bundle require `year`. Status accepts `{orderId}`. Checkout and status require JSON and the `X-Fate-Test-Token` header.

Configure the variables listed in `.env.payments.example` as server-only, branch-scoped preview secrets. Never prefix them with `VITE_`, put them in browser storage, or commit filled environment files. The origin must be the exact HTTPS preview origin. Database TLS must use `sslmode=verify-full`; encryption and order-access keys must be separate random 32-byte hex values. Generate a cryptographically random test token of at least 32 characters.

Subscribe the sandbox webhook endpoint to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`. A return-page redirect never grants access. All routes remain closed when configuration is missing.

The initial schema is `server/payments/migrations/001_test_orders.sql`. It has been applied to the separate Neon project `the-fate-key-payments-test`, branch `payments-test`, database `fate_payments_test`. It deliberately rejects live orders. Application transactions use one checked-out PostgreSQL client for BEGIN, queries, COMMIT or ROLLBACK.

## Verification recorded

- 446 tests passed in 34 files, including 16 new payment tests.
- TypeScript and production asset build passed; the build still publishes 21 content paths with ad serving off.
- Payment tests use PGlite PostgreSQL and Stripe's signature verifier. Stripe API requests are simulated in these tests, not live provider evidence.
- Tests cover concurrent repeated checkout, altered inputs, recovery after a session-attachment failure, unpaid sessions, stale/invalid signatures, incorrect amounts, duplicate notifications, out-of-order states, atomic rollback/retry, worker leases and private status access.
- The remote test database contains the three expected tables. Direct application-to-Neon connectivity has not yet been verified: the local runtime cannot resolve the database host. No customer data was used.

## Next steps

1. Connect the owner's Stripe account and add sandbox credentials to the preview environment. Verify the deployed API, a real Stripe sandbox checkout, the signed webhook and persistent database state. Do not enable live payments.
2. Build the complete buyer report, private PDF/card exports, receipt/download page and retry-safe delivery. Current redirects lead back to the product preview and no buyer files or emails are issued.
3. Update purchase, delivery, refund and privacy information to match the actual implementation. Add refund/reversal handling, data retention/deletion and operational recovery before launch.
4. Complete provider success/failure/cancellation/duplicate/refund checks and inspect exported PDFs on a real phone. Record this evidence before any production payment activation.
