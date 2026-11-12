# Product 04–07 content review checkpoint

- Source branch: `work/final-report-repair-20261111`
- Source SHA: `c689e8a6621c9f24eea37c131fd833562e7b2b76`
- Generated through `prepareReportContent` (the paid report text path); the text exporter asserts that the PDF renderer is not called.
- Product 04–06: 5 profiles × 7 answers each. Product 07: 5 profiles × 10 answers. Total: 155 answer texts.
- Scores: all `null`; all statuses remain `VERIFY`. Automated diagnostic scores are not content-review scores.

## Initial content findings (not a pass/fail score)

- Product 04: all seven question blocks and answers are present. The annual overview and career answer share some work-theme language. The answer export now stops before the separate twelve-month appendix so that appendix text is not mistaken for Q7.
- Product 05: question-to-answer topic alignment needs repair. In the current generated set, Q4 is financial risk, Q5 is expansion timing, and Q6 is ten-year cycles. Those topics do not match the approved business-strength, business-challenge, and starting-versus-growing question roles in the saved product brief. Do not assign a content score until the roles are reconciled with the approved question set.
- Product 06: generated answer blocks exist, but the seven current titles/roles need a full comparison with the approved deep-self, three strengths, weakness, how others experience the buyer, pressure response, best environment, and relationship-needs questions before scoring.
- Product 07: Q7 uses a single annual focus and explicitly says it is not a separate forecast for each of the next three years; that does not fully answer the approved three-year-priority question. Q9 and Q10 also share the same work-and-relationship themes and should be differentiated by answer role, not by forced synonym changes.
- Product 07 follow-up: changed the Q10 paid-text rule to connect the buyer's personal style to work and relationship needs, distinct from Q9's fulfillment answer. Regenerated the Product 07 paid-path text for the same five profiles; all five Q10 assertions pass. This is a targeted content-rule improvement, not a 95+ independent review. The saved records remain `VERIFY` with no scores.
- Profiles with the same chart produce similar text. Similarity alone is not treated as an error; review should focus on whether the chart evidence and answer meaning match.

## Verification

- Text export tests for Products 03–07: 5 tests passed.
- Production build: passed after making Bun available to the unchanged build command (`npx --package=bun npm run build`).
- Full regression suite: 958 passed, 10 failed across 6 files: `career-customer-first.test.ts`, `master-report-pdfs.test.ts`, `product01-buyer-answers.test.ts`, `product01-root-cause.test.ts`, `product03-review-pdfs.test.ts`, and `buyer-outline.test.ts`. Failures include legacy wording assertions, Product 01 answer extraction/count assertions, and Product 03 text assertions. Deployment must wait until these failures are understood and resolved.
- The full regression command invokes existing PDF-generation tests. Those tests ran in the test environment; no PDF batch was intentionally generated as a content-review artifact.
- No deployment was performed from this checkpoint.
