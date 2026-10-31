# SAJU STORY — Customer Policies (DRAFT, NOT PUBLISHED)

These are drafting notes, not legal advice or approved live policies. Do not display as final terms or enable paid checkout until the operator confirms business identity, jurisdiction, payment processor, privacy practices and consumer-law compliance.

## Proposed checkout disclosure
You are purchasing a digital, personalised Saju reflection report generated from the birth details you provide. It is a traditional cultural interpretation, not a scientific prediction or professional financial, medical, legal or psychological advice. Confirm your birth date, local time and birthplace before payment. A free preview and sample should be available before checkout.

## Proposed delivery disclosure
After payment is confirmed by our payment provider, your report will be made available through a secure download page and, if you choose, sent to your email. The delivery timeframe must be accurately stated before payment. Never promise instant delivery until the full workflow is tested.

## Refund policy — points requiring legal review
- Explain how to request help with an incorrect input, missing report, duplicate charge, technical fault or report not as described.
- Do not claim a blanket 'no refunds' rule that overrides statutory consumer guarantees.
- State contact method, response timeframe and how statutory rights in the customer's country are respected.
- For Australia, check Australian Consumer Law digital service/product guarantees; check other target countries separately.

## Privacy policy — implementation-dependent checklist
- Collect only date/time/place of birth, optional email and order details needed for the service.
- State purposes, legal bases where applicable, hosting region, retention and deletion practices.
- List actual third-party processors and international transfers; do not invent providers.
- Use payment-provider hosted checkout; do not store full card numbers.
- Do not expose a birth-date-derived report ID or publicly accessible PDF URL.
- Provide a privacy contact and explain how users request access/correction/deletion.

## Payment acceptance tests (sandbox only)
1. Successful authorised payment: one verified order and one report delivery.
2. Declined payment: no report access.
3. Checkout cancelled: no order fulfilled.
4. Repeated webhook: no duplicate delivery or charges.
5. Network retry: idempotent fulfillment.
6. Refund: provider and local order status stay consistent.
7. Email bounce: secure account download still works.
8. Guessable URL/expired link: report remains private.
9. Two customers with same birthday: unique random order IDs.
10. Input corrections: clear process and policy.

No payment integration has been installed or tested by this document.
