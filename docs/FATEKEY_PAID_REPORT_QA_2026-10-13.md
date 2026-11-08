# FATE KEY — paid report quality review (2026-10-13)

## Verified source
- Report generator: `src/report/reading.ts`
- Display: `src/components/report/ReadingView.tsx`
- Existing tests: `src/report/reading.test.ts`, `src/report/reading.quality.test.ts`
- Preview production deploy uses branch `feature/english-saju-report-20261013` at commit `f2092c555e7a4f603898bc9372ea7b9e92bca710`.

## Critical release gates
1. Independently validate birth pillars, DST overlaps, solar time, and hour-pillar boundary conventions. Existing test explicitly acknowledges a 03:00 discrepancy versus an independent reference.
2. Avoid presenting 15th-of-month symbolic reflections as full-month event forecasts.
3. Rewrite career, money, love, and personality with distinct chart-derived evidence and non-overlapping advice. The generator currently reuses the day-master `practice` and `caution` across sections.
4. Replace mechanical repeated phrasing in 10-year and 12-month chapters. Include a plain-language chart explanation in each.
5. Proofread double periods, awkward grammar, and repeated first-person advice in exported PDF.
6. Test 20+ varied birth profiles including known/unknown hour, male/female, multiple day masters, Seoul, New York, London, Sydney, DST transitions and solar-term boundaries.
7. Human review of English readability and traditional Saju interpretation before paid launch. Automated uniqueness tests are not evidence of expert accuracy.
8. Verify AGPL-3.0-only obligations and upstream attribution before commercial distribution or code reuse.

## Quality criteria
- Each key section states which pillar/branch/ten-god combination motivated the theme.
- Never claim scientifically established personality facts or guaranteed future events.
- Every month has distinctive meaningful guidance, not only changed pillar labels.
- No fabricated testimonials, sales numbers, or unsupported accuracy claims.
- Preview and paid PDF must be generated from the same verified logic.

## Current status
Audit documented. This commit does **not** alter production generator, payment, or deployment. Automated test suite not executed in this review.
