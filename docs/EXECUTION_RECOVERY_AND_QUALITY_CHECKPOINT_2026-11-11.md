# Execution recovery and quality checkpoint — 2026-11-11

## Repository and revision

- Repository: `aushopfinds-design/orrery`
- Official branch at start: `fix/question-data-consolidation-20261107`
- Starting commit: `e57e1f8ab8609b0a08613eb31f79ca0f9f807072`
- `git ls-remote` confirmed this was the remote HEAD when work began.
- Preserved work branch: `work/final-report-repair-20261111`

## Changes carried forward

- `src/report/buyer-outline.ts`: standalone purchased reports remove unused source chapters so older synthesis chapters cannot appear as extra paid-report body sections. Collection behavior is retained.
- `src/report/buyer-outline.test.ts`: regression check that Product 01 has seven questions and no extra synthesis chapter in the customer-facing body.
- `server/payments/product01-buyer-answers.test.ts`: updates an obsolete expectation that the removed legacy synthesis prose remains in the customer-facing body.

## Build and automated test evidence

- Full build (`bun run build`): PASS, including source-integrity check, core package, TypeScript project build, Vite and public pages. Existing Vite chunk warnings remain.
- Full test suite: 83 files / 950 tests PASS.
- Paid PDF generation tests: 30 PDFs across products 01 and 03–07, plus 5 Product 02 PDFs; 35 PDFs regenerated from the current working tree in `/tmp/fate-key-35/final-six` and `/tmp/fate-key-35/final-career`.
- Focused suite: buyer outline, catalogue, Product 01 paid answers and root-cause: 33 tests PASS.
- Automated report diagnostic emitted some 70/100 warnings for unverified calculation/paragraph review. These are diagnostics, not independent product-quality scores.
- No independent 100-point editorial evaluation has been completed for these 35 PDFs. No PDF is marked PASS or 95+.

## Question configuration audit

The current paid catalogue contains 52 entries: seven for `complete`, `career`, `compatibility`, `year`, `business`, and `wellbeing`, plus ten for `bundle`. The `complete` builder's eight chapters and `wellbeing` builder's five chapters are source material, not the paid-question counts. Paid product IDs are wired through the report product catalogue and `productQuestions()`.

Retained user-approved records provide topic-level approval but not the exact original 52 English strings. Therefore this checkpoint does not certify exact-title parity and does not alter question titles. Topics below summarize the retained approved set and compare the current code catalogue (`src/report/product-questions.test.ts`).

| Product | Approved topic sequence (retained record) | Current code difference requiring reconciliation |
|---|---|---|
| 01 | Identity; strengths/weaknesses; fitting life; where to succeed; career fit; relationship pattern; turning points | Current catalogue combines thriving/blocks and includes income pattern and broad challenges; the separate fitting-life and success-area topics are absent. |
| 02 | Career fit; employment/business; money-making; financial strengths; blockers; career-change timing; standout money years | Current seven questions include a ten-year work/money outlook and a final general insight; financial strengths and standout-money-years wording are not represented. |
| 03 | Compatibility; attraction; relationship strength; likely clash; love expression; partner need I may miss; stable future | Current questions include closeness vs everyday compatibility and upcoming periods; the partner-needs and stable-future questions are absent. |
| 04 | Overall year; biggest opportunity; money; career change; love; promising months; months for care | Current questions cover overall theme, focus, money, career, love and month windows, but do not clearly distinguish biggest opportunity from general focus or career change from general career. |
| 05 | Business fit; type; alone/partner; strengths; struggle risks; starting vs growing; money/risk | Current catalogue includes financial risks, expansion timing, cycles and a caution question; explicit strengths and start-vs-grow comparison are absent. |
| 06 | Core self; three strengths; biggest weakness; how others experience me; pressure response; best environment; relationship needs | Current catalogue asks standout traits, pressure trigger, relationship needs, blind spots and everyday boundary; explicit three-strengths, others' experience and best environment topics are absent. |
| 07 | Ten life-centered collection topics | Current titles are the ten life-centered questions in `DESTINY_COLLECTION_QUESTIONS`; retained records do not include the approved verbatim source strings, so exact-title parity remains unverified. |

## Delivery and safety status

- Product 01 legacy extra chapter removed from paid standalone body and tested. Other products' extra-chapter behavior has not been comprehensively audited in the rendered PDFs.
- Requested personal-letter answer-body format is not yet implemented; PDFs still use the existing Question/Answer/Answer detail format.
- PDF links, typography, cover and Destiny Card have not undergone a complete 35-file visual review in this checkpoint.
- Preview and Production deployment: NOT performed.
- Stripe Live, sale status, prices, and calculation engine: NOT changed.

## Next actions

1. Recover the authoritative verbatim 52-title approval source from the user's records or project artifacts; compare exact text and order before changing catalogue data.
2. Align answer roles and generation rules to the approved topic meanings, including the specified Products 03, 05 and 06 gaps.
3. Implement the approved personal-letter body while preserving existing premium components and Destiny Card code.
4. Independently score every regenerated PDF using the fixed rubric, record sentence-level deductions and before/after edits in dashboard-importable JSON/CSV, and repeat fixes until all 35 individually reach 95+.
5. Only after these gates, run Preview and production-path checks. Do not promote to Production or enable sales before all user-approved gates pass.

## Follow-up review — 2026-11-11

- Rechecked the saved work branch and GitHub checkpoint. Remote work branch is `e3eaa50d7e3f8a98f5c5b5b16b6374dc07bf96c1`; official branch remains at `e57e1f8ab8609b0a08613eb31f79ca0f9f807072`.
- Located the prior 35-PDF test outputs. Across the current set (30 from products 01 and 03–07, plus 5 Product 02 reports), PDF extraction confirms 7/10 question blocks in each file. Product 06 was regenerated after its answer assembly change; the other products' content code was unchanged.
- Visual review of Product 06 profile 1 showed its final answer already gave a concrete boundary action and then repeated a similar generic `Practical point`. The extra generic action was removed for that multi-question source chapter. The revised Product 06 PDF contains the action once in the rendered body; its page count changed from 13 to 12. Text extraction can repeat line fragments for this design, so the visual rendering was used to confirm the change.
- `src/report/buyer-outline.test.ts` and the six-product PDF generation test passed after the fix (31 tests total). The six-product test emitted all 30 PDFs again; the unchanged five Product 02 PDFs remain from the earlier same-code generation. Full build and full suite have not yet been rerun after this follow-up fix.
- The quality-review records available in the persistent files contain older single-profile scores and different scoring weights. They are useful historical evidence, but they are not scores for these 35 current PDFs and were not reused as current ratings.
- Approval search did not locate the exact original 52 strings. It did locate a prior user instruction to retain the current paid-PDF order for Products 01–06 and use a life-centered 10-question set for Product 07. `docs/QUESTION_TITLE_RECONCILIATION_2026-11-11.md` records all current titles beside the newly supplied candidate titles, marked `REVIEW` where they differ. No question data has been edited. The candidate list still requires explicit confirmation against the older “keep current PDF order” instruction.
- Independent editorial scoring of all 35 PDFs remains pending. Every report still needs direct-answer/personalization/easy-English/repetition/evidence/layout review. No score, PASS, Preview, or Production approval is claimed.
