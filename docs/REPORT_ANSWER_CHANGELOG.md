# Report answer rules and regression log

## 2026-11-14 — Shared rules and 35-report comparison

- **Problem:** Each product's answers did not have a single code-level rule reference, and the saved PDF regression test covered only three profiles and saved just one profile's PDFs.
- **Cause:** Shared editorial principles lived in the standard document, while automated review patterns and report-generation checks lived separately. The existing test generated 21 reports but did not keep a complete 35-report answer set.
- **Changed files/rules:** `src/report/report-answer-standard.ts` is the shared answer contract; `src/lib/report-quality-gate.ts` now reads its existing review patterns from there. `server/payments/master-report-pdfs.test.ts` now generates 5 profiles × 7 products, saves all 35 test PDFs, and exports 260 question-answer pairs with a common human-review checklist. `scripts/compare-report-answers.ts` compares each answer to a frozen baseline. GitHub Actions regenerates, compares, and retains the output for 14 days. `AGENTS.md` and `docs/REPORT_QUALITY_STANDARD.md` require this process for future report edits.
- **Customer answer changes:** None intended. Saju calculations, payment behavior, and PDF answer-generation rules were not changed.
- **Evidence:** 35 PDFs opened successfully; 260 of 260 answers present; focused report generation test passed; TypeScript project check passed; comparison to the new review baseline: 0 changed, 0 added, 0 removed answers.
- **Not checked:** Human judgment that a reader feels understood; live site deployment; sale-mode PDF. These remain separate checks.
