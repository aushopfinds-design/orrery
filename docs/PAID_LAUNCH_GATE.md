# SAJU STORY — Paid Launch Gate (13 October 2026)

**Status: NOT APPROVED FOR PAID CHECKOUT.** Keep payment disabled until every gate is independently verified.

## 1. Calculation
- [ ] Run `npx vitest run src/utils/timezones.international.test.ts src/report/reading.quality.test.ts` in CI or local environment; record results.
- [ ] Cross-check four pillars and 10-year luck cycle against at least two independent trusted almanac implementations for Seoul, New York, London and Sydney.
- [ ] Check DST spring gaps, fall overlaps, historical offsets and births near local midnight.
- [ ] Compare solar-term boundaries within 10 minutes on either side of Ipchun and each monthly solar term, in local and UTC time.
- [ ] Document choice of Korean clock-time versus apparent solar-time convention; show it clearly to customers.
- [ ] Never silently default an overseas birth to Seoul.

## 2. Personalisation and plain English
- [ ] Run 20-profile tests and inspect all 20 actual reports for repeated generic sentences.
- [ ] Have at least one fluent English reviewer unfamiliar with Saju explain each chapter in their own words.
- [ ] Show the calculated birth-chart reason behind each interpretation in optional 'Why this reading?' text.
- [ ] Avoid guaranteed predictions, medical/financial advice and claims of scientific validation.

## 3. Premium report
- [ ] Add genuinely chart-dependent month-by-month themes for 12 months, using validated annual/monthly pillars and solar-term boundaries.
- [ ] Write distinct relationship, money, career and decade chapters with evidence from the actual pillars.
- [ ] Generate and inspect a full PDF for desktop and Android, including font embedding, page breaks, accessibility and image rights.
- [ ] Use a sample clearly marked SAMPLE; do not claim an unverified page count or expert review.

## 4. Payment, privacy and delivery
- [ ] Decide merchant of record, tax treatment, supported currencies and refunds with qualified legal/accounting advice.
- [ ] Publish accessible Terms, Privacy Policy, Refund Policy, contact details and delivery timeframe.
- [ ] Disclose exactly which birth details are collected, storage duration, deletion method and processor sharing.
- [ ] Use payment-provider hosted checkout; never collect raw card numbers in the app.
- [ ] Test provider sandbox: success, failure, cancellation, double webhook, retries, chargeback/refund.
- [ ] Generate a random unique order/report ID, not an ID derived from birth date or birthplace.
- [ ] Fulfil only after server-side verified payment; ensure idempotent delivery and secure expiring download links.
- [ ] Test email/PDF delivery and customer support with consented test addresses.
- [ ] Verify source dependency licensing, including AGPL-3.0-only obligations, before commercial launch.

**Release criterion:** all gates checked with recorded evidence; no actual customer charges during development.
