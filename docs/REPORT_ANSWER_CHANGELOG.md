# Report answer rules and regression log

## 2026-11-14 — Shared rules and 35-report comparison

- **Problem:** Each product's answers did not have a single code-level rule reference, and the saved PDF regression test covered only three profiles and saved just one profile's PDFs.
- **Cause:** Shared editorial principles lived in the standard document, while automated review patterns and report-generation checks lived separately. The existing test generated 21 reports but did not keep a complete 35-report answer set.
- **Changed files/rules:** `src/report/report-answer-standard.ts` is the shared answer contract; `src/lib/report-quality-gate.ts` now reads its existing review patterns from there. `server/payments/master-report-pdfs.test.ts` now generates 5 profiles × 7 products, saves all 35 test PDFs, and exports 260 question-answer pairs with a common human-review checklist. `scripts/compare-report-answers.ts` compares each answer to a frozen baseline. GitHub Actions regenerates, compares, and retains the output for 14 days. `AGENTS.md` and `docs/REPORT_QUALITY_STANDARD.md` require this process for future report edits.
- **Customer answer changes:** None intended. Saju calculations, payment behavior, and PDF answer-generation rules were not changed.
- **Evidence:** 35 PDFs opened successfully; 260 of 260 answers present; focused report generation test passed; TypeScript project check passed; comparison to the new review baseline: 0 changed, 0 added, 0 removed answers.
- **Not checked:** Human judgment that a reader feels understood; live site deployment; sale-mode PDF. These remain separate checks.

## 2026-11-15 — Product 04 monthly wording

- **Issue and cause:** The monthly answer printed the internal phrase “conditional activity openings,” which is not natural customer English. A shared monthly template exposed its internal label directly.
- **Changed files/rule:** `src/report/purchase-timing-sections.ts` now explains possible openings and caution months in plain English. Related expectations in `src/report/purchase-narrative.test.ts` and `src/report/buyer-outline.test.ts` were updated.
- **Before/after:** 5 of 260 answers changed; all 5 were Product 04, question 6. The other 255 answers were unchanged.
- **Evidence:** 35 text reports generated; 260 answers present; the two focused wording checks passed. A broader run also had one unrelated existing career narrative test failure about “learning or support”; it was outside this edit and remains unresolved.
- **Not changed:** Monthly selection calculations, Saju logic, PDF layout, and live deployment.

## 2026-11-15 — Money wording in customer answers

- **Issue and cause:** Some income answers described chart placement with phrases such as “less visible areas,” “inner signs,” or “behind the main role.” The shared narrative templates passed internal chart language into customer-facing answers.
- **Changed files/rules:** `src/report/purchase-narrative.ts` now describes these as small or unclear income clues and ties them to work, contacts, plans, or responsibilities in plain language. `src/report/category-readings.ts` uses the same plain wording in the combined report. `src/report/personalised-choices.ts` explains that chart clues do not establish customer demand or payment. `src/report/buyer-outline.ts` uses the revised business-risk wording. Related text expectations were updated in `src/report/personalised-choices.test.ts` and `server/payments/career-customer-first.test.ts`.
- **Before/after:** 15 of 260 answers changed: 8 in Product 02, 2 in Product 05, and 5 in Product 07. The other 245 answers were unchanged. The checked customer text contained 0 occurrences of the target internal phrases after the edit.
- **Evidence:** 35 text reports generated; 260 answers present; no PDF files saved; 0 target-phrase hits in the generated English report text; the focused buyer-outline, personalised-choice, and career customer-first checks passed (36 tests).
- **Not changed:** Saju calculations, income-route selection, PDF layout, payment behavior, and live deployment.

## 2026-11-15 — Business long-range cycle answer

- **Issue and cause:** Product 05 showed “No ten-year cycle starts within this chart’s calculated range,” which was hard to understand and did not answer the timing question plainly. The shared fallback exposed a calculation-range note when no cycle start was selected.
- **Changed files/rules:** `src/report/buyer-outline.ts` now says that no clear new long-term business phase can be identified in the dates covered, and that yearly themes are review points rather than a launch date. `src/report/buyer-outline.test.ts` checks this wording.
- **Before/after:** 5 of 260 answers changed, all Product 05’s long-range-cycle answer. The other 255 answers were unchanged.
- **Evidence:** 35 text reports generated; 260 answers present; buyer-outline tests passed (29 tests); no PDF files saved.
- **Not changed:** Cycle calculations, Saju logic, PDF layout, payment behavior, and live deployment.

## 2026-11-15 — Destiny Collection final message

- **Issue and cause:** Product 07’s final answer repeated the opening summary by restating the work theme and relationship need. The shared final-message template rebuilt those same two themes instead of giving the reader a distinct closing step.
- **Changed files/rules:** `src/report/category-readings.ts` now closes with one practical check: compare a new work commitment’s time and duties with the reader’s relationship needs, then discuss a support or boundary if they conflict. `src/report/category-readings.test.ts` verifies the new answer.
- **Before/after:** 5 of 260 answers changed, all Product 07’s final answer across the five profiles. The other 255 answers were unchanged.
- **Evidence:** 35 text reports generated; 260 answers present; category-reading tests passed (13 tests); no PDF files saved.
- **Not changed:** Saju calculations, question set, PDF layout, payment behavior, and live deployment.

## 2026-11-15 — Regression checks aligned with current plain English

- **Issue and cause:** Four existing checks still expected customer copy that had been replaced by the current plain-English templates. The reports contained the new wording, but the checks searched for old sentences.
- **Changed files/rules:** Updated the expectations in `src/report/release-quality.test.tsx`, `server/payments/final-quality-sample.test.ts`, `server/payments/six-product-review-pdfs.test.ts`, and `src/components/report/FullReportSamplePage.test.tsx` to verify the current monthly, cycle, and financial answers.
- **Before/after:** No customer answers changed. All 16 tests in those four files passed after the expectation updates.
- **Not changed:** Report content, Saju calculations, PDF layout, payment behavior, and live deployment.

## 2026-11-15 — Compatibility wording in Product 03

- **Issue and cause:** Some Product 03 answers described the absence of chart links as “no clear link or clash.” The shared relationship helper and buyer-answer formatter exposed comparison terminology and appended it even when the attraction answer was already complete.
- **Changed files/rules:** `src/report/purchase-narrative.ts` now describes ordinary relationship needs and routines in plain language. `src/report/buyer-outline.ts` removes the redundant attraction note and rewrites the routine explanation as real-life pace, schedules, and task sharing. `src/report/buyer-outline.test.ts` checks the customer-facing wording.
- **Before/after:** 10 of 260 answers changed, all in Product 03; 250 were unchanged. The checked phrases appeared 0 times in the generated English report text.
- **Evidence:** 35 text reports generated; 260 answers present; buyer-outline checks passed (29 tests); no PDF files saved.
- **Not changed:** Compatibility calculations, Saju logic, PDF layout, payment behavior, and live deployment.

## 2026-11-15 — QA expectations for plain-English answers

- **Issue and cause:** Several older tests required wording that the current reports intentionally avoid, including Han characters and internal chart labels. Other checks expected different profiles to use different wording even when their chart themes matched.
- **Changed files/rules:** Updated the expectations in `src/report/complete-personalization.test.ts`, `src/report/complete-reading.test.ts`, `src/report/purchase-narrative.test.ts`, `src/report/revision-r6.test.ts`, and `server/payments/product03-review-pdfs.test.ts`. They now check direct customer language, matching chart themes, and supported uncertainty rather than exact legacy phrases.
- **Before/after:** No customer answers changed in this step. The complete tracked test suite passed: 83 test files and 950 tests. TypeScript project check passed; `git diff --check` passed. The temporary 35-report text review test was removed.
- **Not changed:** Report content, Saju calculations, payment behavior, and live deployment.

## 2026-11-15 — Product 03 relationship timing wording

- **Problem and cause:** When neither partner had a flagged relationship period, Product 03 said “checked day-branch change signal.” This was internal chart language passed through the shared timing fallback.
- **Changed files/rule:** `src/report/purchase-narrative.ts` now says directly that the reading cannot single out a year, and clarifies that this does not predict an easy or difficult period. `src/report/purchase-narrative.test.ts` now checks the customer-facing sentence.
- **Before/after:** 1 of 260 answers changed (Product 03, profile 4, question 6); the other 259 were unchanged. The internal phrase appeared 0 times after the edit.
- **Evidence:** Regenerated 35 reports and compared all 260 answers; no PDFs were saved. The related narrative checks passed (28 tests).
- **Not changed:** Relationship timing calculations, Saju logic, PDF layout, payment behavior, and live deployment.

## 2026-11-15 — Plain-English income explanation

- **Problem and cause:** The annual money answer used “Specialist insight” and “paying audience,” labels that make a simple money question harder to understand. A shared chart-language template exposed the internal category name directly.
- **Changed files/rule:** `src/report/purchase-language.ts` now explains the income idea as solving a clear problem customers will pay to fix. `src/report/traditional-analysis.ts` uses the same plain explanation in traditional analysis text. `src/report/purchase-narrative.test.ts` checks the customer wording.
- **Before/after:** 3 of 260 answers changed, all Product 04 question 3 for profiles 2, 4 and 5; 257 were unchanged. The target phrase appeared 0 times in the generated answers after the edit.
- **Evidence:** Regenerated 35 reports and compared all 260 answers; no PDFs were saved. Related tests passed (29 tests).
- **Not changed:** Saju calculations, money-theme selection, PDF layout, payment behavior, and live deployment.
