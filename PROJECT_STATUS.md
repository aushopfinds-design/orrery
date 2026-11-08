# THE FATE KEY Project Status

Updated: 2026-11-08 (Australia/Sydney)

## Production state
- Website: https://thefatekey.com
- Current deployment: dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt (READY)
- Current production source commit: 80b5b019efa966fc76f589c97a7aeffdcd400223
- Vercel reports thefatekey.com as an alias of that deployment.
- Previous READY rollback candidate: dpl_2NrTxBw6DUQoRKwuF55wxgWf4bBN, commit e54f2c64b8989d7ea37241691a6e3c760fe36c9a.
- The production homepage still says paid purchasing is not open. Stripe Live settings were not changed.

## Environment recovery and verified work (2026-11-08)
- Found the requested repository checkout in the existing `orrery-preview-qa` directory and preserved the separate `orrery` worktree, which has unrelated uncommitted edits.
- Fetched remote branch `fix/question-data-consolidation-20261107` at commit 85a372d3d8a418dd60a24b635e9d75ed713fec0e and merged it into the existing local branch without discarding prior commits. A direct local Git push was unavailable because this runtime has no GitHub credentials; the updated status file was saved through GitHub at commit 1ebea064186ceccab3d2c65f076aca914a932d05.
- TypeScript project check `tsc -b --pretty false`: PASS.
- Targeted PDF and payment suites: 37/37 tests PASS.
- Full build (`bun run build`) on the fetched source: PASS after installing dependencies in an isolated worktree from the frozen Bun lockfile. Existing dependency files in the other worktree were not changed.
- Generated 35 PDFs through the real `issueReport()` path: seven products × five distinct synthetic birth profiles, including one unknown-time profile. PDF signature and question counts passed: products 01–06 have 7; product 07 has 10.
- Rendered and visually inspected the cover, contents page, and personalized summary for one profile per product. The tested PDFs retained the approved celestial stationery; no obvious clipping, overlap, or broken glyphs was seen in those pages. This is not visual review of every page or every profile.
- Production homepage inspected at desktop browser viewport. Korean language toggle worked; catalog showed six 7-question products and one 10-question bundle, USD planned prices, and closed checkout. This was not mobile-width verification.

## Automated diagnostics (not independent content scores)
For each product below, values are the five `issueReport()` sandbox diagnostic scores, not human/independent 100-point content reviews:

| Product | Scores across 5 profiles | Min | Mean | Diagnostic result |
| --- | --- | ---: | ---: | --- |
| 01 | 100, 100, 100, 100, 100 | 100 | 100 | Structural pass |
| 02 | 100, 100, 100, 100, 100 | 100 | 100 | Structural pass |
| 03 | 70, 70, 70, 70, 70 | 70 | 70 | Fail |
| 04 | 70, 70, 70, 70, 70 | 70 | 70 | Fail |
| 05 | 70, 70, 70, 70, 70 | 70 | 70 | Fail |
| 06 | 70, 70, 70, 70, 70 | 70 | 70 | Fail |
| 07 | 70, 70, 70, 70, 70 | 70 | 70 | Fail |

Products 03–07 lose 30 points because `server/payments/report.ts` supplies `calculationVerified: false` for those kinds. Some also produce `PARAGRAPH_REVIEW` or `REPEATED_SENTENCE`; those flags require review. Do not remove the penalty, loosen the gate, or treat these diagnostic numbers as content scores. Independent 95/100 content review has not been completed.

## Not completed
- Mobile visual verification at 360px, 390px, and 430px. The page was only observed at a 1363px browser viewport. Local Chromium could not launch because the environment denied socket creation; the cloud browser API does not expose viewport resizing.
- Real Stripe Test Mode checkout, webhook delivery, persisted order, customer email receipt, PDF download, payment failure and duplicate-webhook end-to-end checks. The public production checkout is closed, and no isolated authenticated test checkout flow was available in this run. Mocked/unit coverage is not a substitute.
- Independent baseline PDF answer scoring completed for Product 01 only: 35/260 answers. Product 01 profile means are 76.9, 81.9, 81.9, 81.7, 76.6 (minimum 76.6, mean 79.8); those baseline PDFs fail the 95 threshold. Products 02–07 remain unscored. The official total is 260 answers (six products × 7 questions × 5 profiles, plus Product 07 × 10 × 5); 245 omits Product 07's additional 15 answers. Five newer local Product 01 PDFs were generated after edits, but are not independently scored.
- Full-page visual review for all 35 PDFs, and mobile PDF viewer testing.
- Vercel Preview `dpl_EG2YrcnNXhjdTtWF9jQBGr3TQZQZ` is READY for application commit `687875f3015665b0b5a6d7cf1bc87d812652092d`; homepage and `/samples/` returned HTTP 200. Status-document commit `24fdafec7cd6bfd1117b55180af6986e6ce36c85` also has Preview `dpl_4DRQ4uMaTCAJjUQGMARxxBH2HT1r` READY. Production remains on `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; no Production deployment was made.

## Latest local QA checkpoint (2026-11-08)
- Targeted tests for Product 01 PDF generation, purchase narratives, and bundle reading passed: 37/37.
- Five Product 01 PDFs were regenerated through the test path. Their question counts, PDF signatures, and TOC links passed the assertions. These output files and the uncommitted working diff are not saved on the remote branch.
- The audit and status updates were committed through the connected GitHub service. The 95+ independent audit is incomplete; application code and Production remain unchanged.

## Release status and next steps
- Sales remain closed; no Stripe Live changes.
- Do not mark the seven products sales-ready until the three outstanding gates above are completed.
- Next: resolve independent pillar-audit wiring and review flags without reducing the rubric; complete independent question-by-question content review; perform 360/390/430 browser checks and isolated Stripe Test Mode end-to-end verification; then save code, deploy Preview, and validate before any later Production update.

## PDF content audit follow-up (2026-11-08)
- Reopened the preserved 35-PDF test batch and diagnostics. The PDFs are present locally at `qa-artifacts/final-five-profile-pdfs/` (35 PDFs plus `diagnostics.json`); this is a local QA artifact set, not a GitHub-saved deliverable.
- Product 01's seven-question contents page is followed by an additional life-insight synthesis section without a `Question:` record; it is a summary, not an eighth official question. Direct content inspection found repeated phrasing in its money answer, so it does not qualify for 95+ sign-off.
- Product 07's opening section contains the approved ten question titles and ten answers. The current product also includes component reports and partner-specific material because its order flow explicitly requires a second chart. This is a scope item for the product contract, not an extra official question; do not label it a proven mismatch without reviewing the purchase scope.
- Follow-up code change: Product 07 answers 6 and 7 now state the absence of verified timing once, separately for lifetime standout years and the next three years. The wording does not invent dates or change question content.
- Verification after the change: `src/report/category-readings.test.ts` plus `server/payments/final-simple-reports.test.ts`: 14/14 tests passed; the real `issueReport()` test generated 14 fresh PDFs (two test profiles × seven products), and the Product 07 PDF text was inspected for the updated Q6/Q7 answers. `bun run build` passed; existing Vite chunk/import warnings remain.
- Product 01 now has independent question-by-question scores for all 35 of its answers in `REPORT_QUALITY_AUDIT.md`; the PDF text, rubric breakdown, issue notes and code targets are recorded there. Products 02–07 (210 answers) remain unscored. Prior 70/100 diagnostics are structural checks only. Mobile and real Stripe Test Mode E2E remain unverified. Sales stay closed and Production is unchanged.

## Final 245-answer audit progress (2026-11-08)
- Audit artifact saved remotely: `REPORT_QUALITY_AUDIT.md` (GitHub commit 3df45e4d4c8ad3f6b9f31ea15cca02668bf32579). It contains the full extracted answer text, itemized rubric points, score, findings and code targets for all five Product 01 PDFs (35/245 answers).
- Product 01 profile means: 76.9, 81.9, 81.9, 81.7, 76.6; minimum 76.6, average 79.8. Result: FAIL. The main repeated failure is Product 01 Q4 for profiles 1 and 5, where the same missing-money-signal limitation is stated several times; Q6 also overlaps Q3 and Q5.
- Product 01 source fixes are now present in a later work unit; see the revision record below. The independent post-fix 35-answer re-score is still pending, so earlier scores remain baseline scores and Product 01 remains FAIL.
- Overall independent audit progress: 35/245 answers. Remaining: 210. No overall product reaches PASS until all five profile means for that product are at least 95.


## Product 01 targeted revision (2026-11-08)
- Updated `src/report/purchase-narrative.ts`: the no-money-marker case now states once that the chart cannot establish salaried vs deal-based income; it no longer repeats the missing-sign rationale in the same answer. Product 01 Q6 now separates the work-demand/private-need tension from the standalone relationship answer and removes repeated relationship advice from its body.
- Updated `src/report/chart-depth.ts`: when neither visible nor hidden money markers are present, the follow-up now limits the claim to income amount/capacity instead of repeating the missing-marker statement.
- Updated `server/payments/product01-root-cause.test.ts`: fixed a stale assertion expecting five TOC links; Product 01 has seven official questions and the test now verifies all seven links resolve to report pages. This is an assertion correction to the approved structure, not a reduced criterion.
- Added a focused regression in `src/report/purchase-narrative.test.ts` for the no-money-marker answer and Q6 role separation.
- Verification on the clean remote-branch worktree at `1b3995c`: targeted narrative/chart-depth tests passed 26/26; actual paid `issueReport()` Product 01 test generated five PDFs and passed 1/1, including seven question titles/answers and seven valid TOC links; TypeScript `tsc -b --pretty false` passed. Structural diagnostic output was 4×100 and 1×70; these are not content scores.
- The newly generated five PDFs use the test fixture profiles `new-york-known`, `seoul-known`, `new-york-unknown`, `sydney-known`, and `los-angeles-known`, which differ from the five original audit profiles. The original 35/245 answer scores have not been recomputed from post-fix PDFs; do not treat them as a post-fix score. Re-score all five original audit profiles with complete birth inputs before changing the Product 01 score.
- Product 01 remains FAIL; products 02–07 remain unscored. Preview `dpl_GFQhAFH3um7EdE54rwKsw8HtafAg` is READY for code commit `6780a3270457362d4584598b9f2b88e276408653`; homepage returned HTTP 200. This was not full mobile/payment release QA. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`. Sales remain closed; Stripe Live remains unchanged.


### Product 01 targeted post-fix re-review
- Independently read and scored Q4 and Q6 in five actual `issueReport()` PDFs: 10 targeted answer observations. Results: Q4 87/84/87/87/85; Q6 90/90/90/89/89. Each remains below 95. This is not a complete seven-question re-score or a post-fix product profile score; the five test profiles differ from the baseline audit profiles.
- The Q4 income answer is more direct but still repeats the income/retention distinction in its supporting paragraph. Q6 has a clearer life-challenge conclusion but its practical line repeats the private need and partly overlaps Q5. Product 01 remains FAIL.
- Audit file now records the actual text, six-part score breakdown, and findings for these 10 targeted answers. Baseline Product 01 remains 35/245 fully audited; products 02–07 remain unscored.


### Product 01 second targeted revision
- Changed `src/report/personalised-choices.ts` to replace the unnatural “being hired for the first … the second” career example with clear task wording.
- Changed `src/report/purchase-narrative.ts` to avoid repeating the income-amount caveat in the money-marker line and to make Q6's practical step distinct from its private-life conclusion.
- Added regressions in `src/report/personalised-choices.test.ts` and `src/report/purchase-narrative.test.ts`. Focused suites passed 32/32; actual `issueReport()` Product 01 PDF generation passed 1/1 with five PDFs and all seven TOC links valid.
- Read and re-scored Q4 and Q6 in all five regenerated PDFs: Q4 89/84/89/88/87; Q6 93/93/93/92/92. These ten targeted answer scores are below 95 and do not constitute a complete profile mean. Product 01 remains FAIL. Full post-fix review of all seven answers in these profiles is still outstanding; products 02–07 remain unscored.


### Latest Product 01 code save (2026-11-08)
- Latest code and audit commit: `c76b4163e351b7b1dd0a727493b22e420e76b91c` (branch `fix/question-data-consolidation-20261107`).
- TypeScript `tsc -b --pretty false` passed after the latest code edits. Focused narrative/chart/role tests passed 32/32; the actual Product 01 `issueReport()` PDF test passed 1/1 and emitted five test PDFs with seven valid TOC links.
- Preview for this commit: `dpl_J5W3K43yzFi3xbWQm2LX5PL9qvK3` reached READY; its homepage returned HTTP 200. The current Preview verification was a homepage HTTP 200 smoke check only; product screens, visual rendering and refreshed PDF text were not browser-checked on Preview.
- Product 01 has targeted Q4/Q6 scores only (Q4 84–89, Q6 92–93); no complete post-fix profile score is available. Products 02–07 are unscored. Production remains unchanged and sales remain closed.


### Product 01 third revision and re-review
- Removed duplicated money-marker placement language from the Q4 lead and moved the evidence explanation to the support paragraph. For the life reading's money/support overlap, the detail now explains the practical link to skills, tools and help. Q6's practical point now refers to the customer's chart-linked work theme and a protected private commitment.
- Focused suites passed 33/33; the actual Product 01 `issueReport()` test passed 1/1 and generated five PDFs with seven valid TOC links. `tsc -b --pretty false` passed. Structural diagnostic scores (4×100, 1×70) are not content-quality scores.
- Re-read Q4 and Q6 in the five regenerated PDFs: Q4 93/90/93/89/93; Q6 94/94/94/93/93. These ten targeted answer scores improved from the prior pass but are all below 95 and are not complete product profile means. Product 01 remains FAIL; products 02–07 remain unscored.

## Product 01 fifth revision checkpoint (2026-11-08)
- Continued from remote `c96e7f83c41d3a230acf6da452dc3b033958785d`; no unrelated worktree was reset or overwritten.
- Read Q4 and Q6 in five newly generated actual `issueReport()` PDFs. The 10 targeted scores are recorded with breakdowns and answer evidence in `REPORT_QUALITY_AUDIT.md`: Q4 87–91/100; Q6 92–94/100. These are not complete profile means. Product 01 still fails the 95 gate; Products 02–07 remain unscored independently.
- Source update: shortened Product 01 Q4's earning/support explanation; made Q6's conclusion more direct and changed its action to a concrete workload substitution/coverage decision. Official questions and calculation engine were not changed.
- Verification on this source revision: focused suites 35/35 passed; `npx tsc -b --pretty false` passed; actual `issueReport()` test regenerated five Product 01 PDFs, all with seven question entries and seven valid TOC destinations. Structural diagnostic values included one 70 for partial calculation verification; they are not independent content scores.
- Source and audit changes were saved and verified on the remote branch at commit `0e9fff62480b7a97e2e96f5d858455eb8fe85b0b`. Production is unchanged at `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; sales remain closed and Stripe Live unchanged. The earlier Preview does not include this revision.
- Next: independently score all 35 answers from these five current PDFs, then proceed with Products 02–07. Do not treat the 10 targeted scores as complete Product 01 profile scores or 95+ sign-off.

## Preview build recovery (2026-11-08)
- The Preview for `219c68c016a0f3680a8476d4bdbcf33364fe0d86` failed because the large `src/report/purchase-narrative.ts` blob upload was truncated, producing TypeScript parse errors. The broken preview is `dpl_9LY4xGkLoKxJdepfdYSsDgyoGfML`; Production was not affected.
- Restored the complete file from the preserved local source and verified its GitHub blob SHA matches the uploaded full file: `09e00d7abf6c7b64f7d88abd21a218abcda9d9af`. Recovery code commit: `0e833059442a68500aa423a79949cb9e36e91d3d`.
- Local focused tests and TypeScript passed before this recovery commit. Preview build for `0e833059442a68500aa423a79949cb9e36e91d3d` is being checked; do not treat Preview as verified until it reaches READY and returns HTTP 200.
- Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`, sales closed, Stripe Live unchanged.


## Permanent recovery consolidation checkpoint (2026-11-08)

- Official continuing work branch: `fix/question-data-consolidation-20261107`. Before this checkpoint its remote HEAD was `2540b698aed2f1faf0d65b63742cebcc0e0e7e2d`; this is the current application-code SHA reviewed and deployed to Preview.
- Compared archived patch `recovery/local-worktree-diff-2026-11-08.patch` with the official branch. The patch is stale and unsafe to apply as a whole or by its current hunks: it reduces the Product 01 contents-link test from seven to five, restores the previously flagged awkward “being hired for the first … the second” wording, removes chart-depth regression coverage, reintroduces repeated Product 07 timing caveats, and replaces the newer Product 01 challenge answer/action with overlapping generic content. No source hunk was applied. Keep the patch as a recovery artifact; if any individual idea is revisited, rewrite it against the official HEAD and rerun the relevant checks.
- Official application source was checked with `npx tsc -b --pretty false`, `npm --workspace packages/core run build`, and `npx vite build`. All passed; Vite reported existing dynamic-import/chunk-size warnings. The Product 01 PDF generation test passed 1/1 on SHA `2540b698aed2f1faf0d65b63742cebcc0e0e7e2d`, producing five PDFs with seven official questions and seven valid TOC destinations each.
- Existing Preview `dpl_APDe8pqAPnVny7Ytz1E63juiwpCR` is READY and its Git SHA exactly matches application SHA `2540b698aed2f1faf0d65b63742cebcc0e0e7e2d`. Preview homepage and `/samples/` returned 200. Product 01 PDF generation was verified through the test generation path on this source; no public Preview API was used to create a paid customer order.
- Product 01 latest independently scored fixture means are preserved as 85.3, 84.4, 85.3, 83.6, 83.4. The fixture profiles differ from the historical baseline, and the two sets are not combined. The latest review record is `docs/PRODUCT01_POSTFIX_REVIEW_2026-11-08.md` on the recovery backup branch.
- Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; no Production deployment or Stripe Live change. Sales remain closed.
- Consolidation status: official branch identified, backup branches retained, patch reviewed, exact-SHA Preview confirmed. Source-code integration is still OPEN because the archived patch contains regressions and no safe uncommitted source delta was identified. Next code change must be made directly on this official branch from its then-current remote HEAD. Re-evaluate Product 01 with the same five profiles after any content change.


## Product 01 post-fix full PDF re-review (2026-11-08)

- Review source: five Product 01 PDFs generated from application code `eec3511f527fce48a5bca4d5f29f6b1035114b34`; all 35 actual PDF answer blocks were extracted and reviewed. Full per-answer text, six rubric components, deductions, and code locations are in `docs/audits/PRODUCT01-FULL-INDEPENDENT-REVIEW-eec3511.json`.
- Rubric: direct answer 35, personalization 25, specificity/usefulness 15, repetition/generic advice 10, easy English 10, chart-evidence consistency 5. Each profile score is the arithmetic mean of its seven answer totals; the gate is profile mean >=95. Individual answer totals range down to 94 and are not all 95+.
- Profile means: P1 95.3, P2 95.0, P3 95.3, P4 95.1, P5 95.1. This is an independent review of the generated PDF text, not an automated diagnostic score. P2's separate calculation-verification diagnostic is `partial`; this was not changed or treated as a content score.
- User-provided previous baseline: 85.3, 84.4, 85.3, 83.6, 83.4. The new PDFs use named test fixtures; baseline fixture identity was not established as identical, so differences are indicative only.
- PDF checks: five files, seven official questions and seven valid TOC links each; page counts are 24, 24, 24, 25, 25. Extracted text has zero replacement characters and zero black-square glyphs. Final summary and Destiny Card connection are present; visual checks sampled representative report and final pages, not every page.
- Verification on code SHA `eec3511f527fce48a5bca4d5f29f6b1035114b34`: focused tests 31/31 passed; `npx tsc -b --pretty false` passed; Product 01 PDF generation test passed and emitted five PDFs. No Preview deployment was performed for this request. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; sales remain closed; Stripe Live unchanged.
- Next: continue Product 01 content improvement only if reviewing the per-answer deductions; preserve the same rubric and fixtures, then regenerate PDFs and re-review. Do not claim all individual answers score >=95.

## Product 01 Preview confirmation (2026-11-08)
- Product 01 application-code Preview `dpl_FveA6uP699R9jtbFPqDoryGEpdkF` is `READY`; Vercel reports Git SHA `eec3511f527fce48a5bca4d5f29f6b1035114b34`, matching the code used to generate and review the five PDFs. Preview URL: `https://saju-english-report-preview-dhgjdukcj-shopping-shorts-ai.vercel.app`.
- Preview homepage and `/samples/` both returned HTTP 200. This confirms the shared Preview routes; Product 01 PDFs were verified through the actual `issueReport()` test-generation path, not a public purchase.
- The audit/status commit `1a5db0bdbed53afa47f7ed6a39e145d42541c6bb` also has an automatic `READY` Preview `dpl_546W4rGB7JTp7fDX6ozVbrDuHKTG`; that commit contains the same application code plus audit documents. Production is unchanged.

## Product 01 final 94-point answer fix — 2026-11-09
- The final two pre-fix answers at 94 were Product 01 Q3 (`career`) and Q6 (`life-challenges`) across the five reviewed fixtures. The 94-point deductions were chiefly vague job-family examples for Q3, and an answer that described work pressure without clearly connecting it to the customer's distinct private-life need for Q6.
- Actual runtime edits are in `src/report/personalised-choices.ts` (clearer split examples for two-role career fit) and `src/report/purchase-narrative.ts` (private-life priority keyed to the calculated day branch, paired with the chart's main/daily work demands). Regression tests were updated in the corresponding `.test.ts` files. Product questions, calculation engine, and Destiny Card were not changed.
- Runtime commit is `b45554af77b89d3f8d5219b788fabbe86d16ac96` on official branch `fix/question-data-consolidation-20261107`. GitHub branch lookup confirmed this is the remote HEAD. Remote code content was checked against all four locally modified files.
- Verification: focused Product 01 suites passed 31/31; `npx tsc -b --pretty false` passed; `git diff --check` passed. The PDF-generation test passed 1/1 and generated five PDFs, each with seven official questions. Page counts: 24, 25, 24, 25, 25; extracted text had no replacement or black-square glyphs; final summary/Destiny Card and seven TOC destinations were present. Representative pages were sampled; this was not a visual inspection of every page.
- Independent content review of the five current PDFs records all 35 answer blocks in `docs/audits/PRODUCT01-FULL-INDEPENDENT-REVIEW-eec3511.json`. Means by profile: 95.4, 95.4, 95.4, 95.6, 95.6; lowest individual answer: 95. These are actual rubric totals, not automated diagnostics. Relative to the supplied immediate baseline (95.3, 95.0, 95.3, 95.1, 95.1), all profiles improved by 0.1–0.5. Profile 2's separate calculation diagnostic remains `partial` and was not altered.
- Preview `dpl_GzegadMMgSFTZ138ty9vMH8afKaf` is READY and Vercel reports exact code SHA `b45554af77b89d3f8d5219b788fabbe86d16ac96`. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; no Production or Stripe Live change; sales remain closed.
- This Product 01 code is saved remotely. The updated audit/status records are being saved in the next documentation-only commit; that commit does not represent additional runtime-code changes. Product 02–07 remain untouched and independently unscored. Next start: inspect and score Product 02's actual five PDFs, then make targeted runtime edits only after identifying answer-level deductions.

## Product 02 pre-fix review checkpoint — 2026-11-09
- Generated five real Product 02 (`career`) PDFs from code SHA `b45554af77b89d3f8d5219b788fabbe86d16ac96` using the `issueReport()` path and read all 35 answer blocks. Seven official questions were present in each PDF. Detailed PDF text, six-part rubric scores, deduction reasons and code targets are stored in `docs/audits/PRODUCT02-PREFIX-INDEPENDENT-REVIEW-b45554a.json`.
- Profile means P1–P5: **92.4, 92.3, 91.9, 93.1, 92.0**. Individual answer minima: **82, 83, 83, 89, 82**. All five profiles fail the 95 average gate. Main corrections identified: Q3 (`money-commitments`) gives only a weak possible route for hidden-money profiles; Q4 (`working-style`) mixes a possible chart pressure with a conclusion that no specific blocker is identified; Q5 (`feedback-and-boundaries`) repeats a generic no-clear-period statement across profiles.
- Product 02 is not modified yet at this checkpoint. Next: make only the targeted Q3/Q4 answer-generation edits, run its regression tests and TypeScript, save code to the same official branch, verify remote contents, regenerate five PDFs and independently rescore all 35 answers.

## Product 02 revision 1 — post-fix result (2026-11-09)
- Code commit `f54d94b11e1a8489f8d46872378aa1167d2e691c` is on the official branch and was confirmed as remote HEAD at verification time; all five changed runtime/test files were read back from GitHub and matched local content.
- Runtime edits: `src/report/purchase-narrative.ts` clarifies hidden-money clues and the possible work/support-cost pressure; `src/report/buyer-outline.ts` makes the corresponding answer summary coherent. Tests: `src/report/purchase-narrative.test.ts`, `src/report/buyer-outline.test.ts`, `server/payments/career-customer-first.test.ts`.
- Tests: 54/54 focused tests passed; TypeScript project check passed before this code commit. Five post-fix PDFs were generated by the paid report `issueReport()` path, each with seven official answers.
- Re-read and rescored all 35 answer blocks from those PDFs. Profile means P1–P5: **93.7, 93.6, 93.1, 93.1, 93.3**; individual minima: **89, 91, 89, 89, 89**. Product 02 remains **FAIL**. Full actual PDF answer text and deductions are in `docs/audits/PRODUCT02-POSTFIX-INDEPENDENT-REVIEW-f54d94b.json`; pre-fix review is separately retained.
- Current latest-version independent review count is **70/260** (Product 01 35 + Product 02 35); Product 02's pre-fix 35-answer review is a baseline and is not added to that count. Products 03–07 have not been independently evaluated.
- Next Product 02 iteration: remove repeated Q4 explanation/conclusion by making its direct answer carry the chart evidence and uncertainty; improve the no-clear-year Q5 answer with profile-specific checked themes and a clean distinction from Q6. Do not proceed to Product 03 until Product 02's five profile means are all >=95.

## Product 02 revision 2 — post-fix result (2026-11-09)
- Runtime commit `1888b3bd3bf9b2aec7b5e9d5ca2db890f136227f` follows the Q4/Q5 code commit on the same official branch. GitHub read-back confirmed the changed `src/report/buyer-outline.ts` and `server/payments/career-customer-first.test.ts` contents.
- Q4 now presents the chart-linked pressure and limitation in one concise answer; its repeated explanation and bottom line are removed. Q5 now names profile-specific checked annual themes when no improvement period is supported and does not invent timing. Test suites passed 54/54; TypeScript passed; PDF-generation test passed and created five 7-question PDFs.
- Revision 2 PDFs were reviewed: changed Q4/Q5 blocks in all five, with the other 25 answer texts compared to the prior scored batch and unchanged. New profile means: **94.9, 94.3, 94.0, 94.6, 94.4**; minima: **93, 92, 92, 93, 93**. Product 02 remains **FAIL**; full answer text and score deductions are in `docs/audits/PRODUCT02-REV2-INDEPENDENT-REVIEW-1888b3b.json`.
- Latest-version independent answer review count stays **70/260** (Product 01 35, Product 02 35); previous versions are baselines, not additional completed answers. Products 03–07 are not started. Next Product 02 targets: improve Q3 in profiles 2–3 and the Q2/Q7 distinction/repetition without adding unsupported career or income claims. Do not start Product 03 until all five Product 02 profile means are >=95.

## Product 02 independent PDF review and quality iteration (2026-11-09)

- Product 02 runtime code is saved on official branch `fix/question-data-consolidation-20261107`. Quality revision commits: `1ebd5a8ab60d13ef9ba3cf53783377e6ebd5968c` (Q5 timing answer names the checked year range and gives a direct answer) and `3aa9cf05676cbf07a6833ee801a46f6f122700a9` (Q3 limited-income answers add a chart-safe comparison of real pay, hours, costs, or customer demand). Regression-test commit: `3261d1204eb403c770d362df28aaef3597349a7d`; current remote HEAD is `3aa9cf05676cbf07a6833ee801a46f6f122700a9`.
- Runtime files changed: `src/report/buyer-outline.ts`, `src/report/purchase-narrative.ts`. Tests: `server/payments/career-customer-first.test.ts`. The two runtime files and test file were fetched from the remote branch and their local Git blob IDs matched the remote blobs before PDF generation.
- Verification: Product 02 customer-first, buyer-outline and purchase-narrative tests passed 51/51; `npx tsc -b --pretty false` passed; `git diff --check` passed. The test generated five new Product 02 PDFs after remote code verification. All five contain seven official question blocks; page counts 17, 17, 16, 17, 16; extracted text contains no replacement or black-square glyphs. This was text/structure verification, not a visual inspection of every page or link target.
- All 35 answer blocks were read from the five generated PDFs. Twenty-eight answer blocks matched the previously reviewed text exactly and retain those scores after comparison; seven changed answers were re-scored independently. Detailed answer text, per-criterion points, deductions, code locations and verdicts are stored in `docs/audits/PRODUCT02-INDEPENDENT-REVIEW-3aa9cf0.json`.
- Profile means: P1 95.0, P2 94.9, P3 94.6, P4 94.7, P5 94.6. Individual minima: 94, 94, 94, 93, 93. Product 02 remains FAIL because four profile averages are below 95 and not all individual answers reach 95.
- Current cumulative independent review count is 70/260: Product 01 latest 35 plus Product 02 latest 35. Product 01 remains at its saved latest means 95.4, 95.4, 95.4, 95.6, 95.6 with minimum answer 95. Products 03–07 have not been independently reviewed in this work sequence.
- Next step: improve Product 02 answers with remaining deductions (especially work-setting comparison and the future-insight synthesis), then repeat test → remote save/read-back → five-PDF generation → independent review. Do not start Product 03 until Product 02's five profile averages reach 95.
- Preview/Production: no Preview deployment was made for the latest Product 02 revision. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; Stripe Live is unchanged and sales remain closed.

## Product 02 profile-average pass (2026-11-09)

- Further Product 02 revisions on the official branch: runtime code `c67239d958285c99439b79c1706a3f4308889f77`; regression-test correction `9fc5d32b22a8c67b6b3a06f5ead95135fae481cd`. Runtime files: `src/report/purchase-narrative.ts` and `src/report/buyer-outline.ts`; regression test: `server/payments/career-customer-first.test.ts`.
- The changes make the employment-versus-independent answer compare real pay, hours, support, customer access, costs and payment terms; connect less-visible money signs to the actual chart area; and replace the future-insight caveat with a pay-and-hours check.
- Verification on remote-matching files: 51/51 focused tests passed; `npx tsc -b --pretty false` passed; `git diff --check` passed. Five new PDFs generated after remote code confirmation, each with seven official question blocks. Pages: 17, 17, 16, 17, 16. Extracted text has no replacement characters or black-square glyphs. Visual inspection of every page was not performed.
- The new independent review read all 35 actual answers. Twenty-three unchanged answers were checked against the previous PDF and retained; twelve changed answers were rescored. Complete text, component scores, deductions, code locations and verdicts: `docs/audits/PRODUCT02-INDEPENDENT-REVIEW-9fc5d32.json`.
- Product 02 profile averages: 95.4, 95.4, 95.1, 95.0, 95.0. All five meet the required mean threshold. Individual minima: 94, 95, 94, 94, 94; the individual-answer 95-point goal remains incomplete in four profiles. This distinction is retained in the audit.
- Cumulative independently reviewed answers: 70/260 (Product 01 latest 35 plus Product 02 latest 35). Product 01 latest means remain 95.4, 95.4, 95.4, 95.6, 95.6 with minimum answer 95. Product 02 now meets the profile-average gate. Products 03–07 have not been independently reviewed.
- Next: begin Product 03 on the current official branch. Keep Product 02's four 94-point answers visible as remaining individual-answer improvements; do not alter the scoring threshold.
- Preview and Production: this revision has not yet been checked for its own Preview deployment. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; Stripe Live unchanged and sales closed.

## Product 03 independent PDF review and code iteration (2026-11-08)

- Worked only on the official branch `fix/question-data-consolidation-20261107`, starting from the verified remote code sequence. Product 03 runtime revisions were saved as commits `e7aca7e65b2f762dc4a2055d90badf09cf0da911`, `03917a13c2312df66b47442a2554f5b4e9a583d2`, `b4aa14cbbe138f0f94acb7d13d6ebce836e86360`, and `36548075458d300aae4af1b2e1eb018c2e937e1c`. The current remote code SHA for this review is `36548075458d300aae4af1b2e1eb018c2e937e1c`; ref and runtime file contents were read back from GitHub.
- Runtime changes: `src/report/buyer-outline.ts` and `src/report/purchase-narrative.ts`; tests: `src/report/buyer-outline.test.ts` and `src/report/purchase-narrative.test.ts`. Product questions and chart-calculation engine were not changed. Edits separate compatibility, attraction, friction, care-style, closeness/routine, timing and mutual-adjustment roles; remove repeated answer detail; tailor practical prompts to the relationship chart and correct same-year timing wording.
- Verification on code matching the remote branch: focused tests 52/52 passed; TypeScript build check passed; `git diff --check` passed. PDF-generation test passed 1/1 and generated the test set. The five Product 03 PDFs were generated locally from the exact source files in remote commit `36548075458d300aae4af1b2e1eb018c2e937e1c`.
- All five Product 03 PDFs contain seven official question blocks; page counts are 18, 18, 18, 19, 19. Extracted text has no replacement characters or black squares. PDF link inspection found 12 internal links per file. This turn checked text, page counts, and link annotations; it did not visually inspect every page.
- Independent review read all 35 Product 03 answer blocks from the newly generated PDFs. Scores by profile (Q1–Q7): P1 `88,78,89,88,85,88,80` (mean 85.1; minimum 78); P2 `89,83,81,84,87,85,83` (mean 84.6; minimum 81); P3 `88,78,89,88,85,88,80` (mean 85.1; minimum 78); P4 `90,78,88,88,85,88,80` (mean 85.3; minimum 78); P5 `90,78,88,88,91,89,80` (mean 86.3; minimum 78). Product 03 remains FAIL; no score was inferred from automated diagnostics.
- Complete answer text, six-part score breakdowns, deductions, code locations and per-answer FIX verdicts are in `docs/audits/PRODUCT03-INDEPENDENT-REVIEW-3654807.json` and `REPORT_QUALITY_AUDIT.md`.
- Unique current independent reviews: 105/260 (Product 01 latest 35 + Product 02 latest 35 + Product 03 current 35); 155 remain. Products 04–07 are not yet reviewed. Product 01 and Product 02 saved means remain respectively `95.4, 95.4, 95.4, 95.6, 95.6` and `95.4, 95.4, 95.1, 95.0, 95.0`. Product 02's four sub-95 individual answers remain visible; its profile-average gate is passed.
- No Preview deployment was made for Product 03. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; sales remain closed; Stripe Live was not changed. Next work must continue Product 03 from SHA `36548075458d300aae4af1b2e1eb018c2e937e1c`, starting with repeated Q2 attraction text, Q3 identical friction in Profile 2, and generic/abstract Q7 wording. Do not begin Product 04 until Product 03 is improved and re-evaluated.
