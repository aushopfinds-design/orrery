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
