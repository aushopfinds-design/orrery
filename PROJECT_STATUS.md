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
- Independent answer-by-answer content scoring for every question across five profiles per product. No product is approved at 95/100 on this basis.
- Full-page visual review for all 35 PDFs, and mobile PDF viewer testing.
- Vercel Preview `dpl_bPr2W2iEpyPwK1VVXzdieK2WKac4` is READY for documentation commit 1ebea064186ceccab3d2c65f076aca914a932d05; homepage and `/samples/` returned HTTP 200. This commit only updates project status, not application code. Production remains on `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt` because no application code changed.

## Release status and next steps
- Sales remain closed; no Stripe Live changes.
- Do not mark the seven products sales-ready until the three outstanding gates above are completed.
- Next: resolve independent pillar-audit wiring and review flags without reducing the rubric; complete independent question-by-question content review; perform 360/390/430 browser checks and isolated Stripe Test Mode end-to-end verification; then save code, deploy Preview, and validate before any later Production update.
