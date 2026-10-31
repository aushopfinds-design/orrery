# FATE KEY — independent source research and release audit (2026-10-13)

## Evidence reviewed
- Current GitHub implementation: `packages/core/src/saju.ts`, `src/report/reading.ts`, `src/report/reading.test.ts`, `src/utils/timezones.international.test.ts`, `src/components/report/ReadingView.tsx`, root `LICENSE`.
- Automated CI run 38396268383: 240 tests, 11 suites, typecheck, build, lint passed. This proves specified tests passed, not that all Saju conventions are correct.

## Public authoritative references
1. Hong Kong Observatory, The 24 Solar Terms: https://www.hko.gov.hk/en/gts/time/24solarterms.htm — solar terms occur at 15-degree increments in solar longitude.
2. Hong Kong Observatory, Date and Time of 24 Solar Terms: https://www.hko.gov.hk/en/gts/astronomy/Solar_Term.htm — astronomical term instants, based on HM Nautical Almanac Office and US Naval Observatory data.
3. Hong Kong Observatory, 2026 Almanac: https://www.hko.gov.hk/en/gts/astron2026/files/HKO_almanac_2026.pdf — source for 2026 astronomical boundary cross-checks.
4. IANA timezone database: https://www.iana.org/time-zones/tz-link — historical time zone and DST rules; historical coverage may be incomplete.
5. GNU AGPL v3: https://www.gnu.org/licenses/agpl-3.0-body.html — network source availability obligations for modified AGPL software.

## Findings and release decision
**HOLD paid launch pending independent cross-checks.**
- Confirm year and month pillar boundary instants against observatory astronomical times, especially births within minutes of solar-term transitions.
- Explicit 1998-03-25 03:00 Seoul discrepancy in `reading.test.ts`: independent conventional clock-hour reference says 庚寅; engine reports 己丑. Passing regression test only preserves chosen convention, it does not establish that it is the correct choice for every customer.
- `calculateSaju` uses a Korean wall-clock path for Seoul and longitude/approximate solar-time adjustment elsewhere. This asymmetric convention must be justified, displayed, and compared on boundary cases.
- DST spring-forward gaps, fall-back overlaps, historical transitions, unknown hour and missing longitude are tested; user-facing fall-back overlap selection remains an assumption.
- Monthly reflections use a single 15th-of-month pillar, not a whole-month forecast. Product page must describe this accurately.
- `ReadingView.tsx` exports PDF via browser print; no dedicated server-generated paid PDF delivery, order record or payment entitlement was verified.
- Root `LICENSE` contains AGPL v3. Commercial charging is not inherently prohibited, but network source availability and attribution compliance must be evaluated before launch; obtain legal advice if proprietary code or mixed licensing is planned.
- The report is a traditional reflective interpretation, not a scientifically validated prediction. Avoid guarantees or fabricated reviews.

## Acceptance checks
1. 20+ independent, documented pillar comparison fixtures covering solar terms, midnight, Seoul 03:00, New York, London, Sydney and DST.
2. Explain and let users understand which clock/solar-time and day-boundary conventions are applied; flag ambiguous birth records.
3. Human English editorial review of at least 10 varied full-length reports, checking unique chart-specific content and repetitive language.
4. Print/PDF check on mobile and desktop including page breaks, fonts and caveats.
5. Payment, delivery, refunds, privacy and licensing requirements reviewed before collecting money.

## Korean report-market benchmark (reviewed 2026-10-28)

Public product pages reviewed for category coverage and presentation, not copied wording or artwork:

- Shinhan Life's public fortune guide separates traditional, everyday, and love/compatibility readings and describes an unknown-time path based on the available year, month, and day pillars: https://www.shinhangroup.com/kr/archive/insight/extend/detail/33324
- Sajuroad presents a premium comprehensive reading with the natal chart, elements, Ten Gods, major cycles, annual outlook, and monthly themes, alongside focused compatibility, money, and career readings: https://www.sajuroad.co.kr/
- Wolhwadang's public catalog separates full-chart, relationship, career, money, annual, and ten-year-cycle readings; it describes a downloadable keepsake report: https://wolhwadang.issking.co.kr/shop
- Smith Lab explains one explicit convention for element counts, Ten Gods, and cycle direction, and distinguishes a simple visible-element count from deeper seasonal/root analysis: https://smithlab.co.kr/tools/saju/saju-calculator/

Implementation choices informed by this review: retain a clear chart summary; offer distinct work, money, relationship, and timing chapters; show long cycles and year/month reference points as dated tables; explain the calculation evidence beside the interpretation; and disclose unknown-time limits. These are common functional patterns. No competitor prose, illustrations, or distinctive visual layout were reused. Market pages describe their own products and are not evidence that their interpretations or calculation conventions are independently correct.

This audit documents evidence and unresolved risks; it is not a claim of expert certification.
