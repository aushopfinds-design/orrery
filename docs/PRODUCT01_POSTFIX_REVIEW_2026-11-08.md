# Product 01 Post-Fix PDF Re-Review — 2026-11-08

## Scope and method

Five new PDFs were generated from remote source commit `2540b698aed2f1faf0d65b63742cebcc0e0e7e2d` through the paid `issueReport()` test path. The answer text was read from the PDFs, not inferred from automated diagnostics. All seven official answers in each PDF were reviewed.

Rubric per answer: direct answer 35, personalization 25, usefulness/specificity 15, repetition/generalities 10, easy English 10, consistency 5. D/P/U/R/E/C scores below add to the answer total. Profile result is the arithmetic mean of its seven answer scores, rounded to one decimal. Product PASS requires all five profile means to reach 95.

These fixture profiles are not the same birth profiles used for the historical baseline audit; the old and new means must not be treated as a controlled before/after comparison.

## Profile results

| Profile fixture | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Mean | Result |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 — new-york-known | 83 | 87 | 85 | 89 | 82 | 90 | 81 | 85.3 | FAIL |
| 2 — seoul-known | 83 | 87 | 78 | 90 | 82 | 90 | 81 | 84.4 | FAIL |
| 3 — new-york-unknown | 83 | 87 | 85 | 89 | 82 | 90 | 81 | 85.3 | FAIL |
| 4 — sydney-known | 82 | 87 | 78 | 86 | 82 | 89 | 81 | 83.6 | FAIL |
| 5 — los-angeles-known | 83 | 87 | 78 | 86 | 82 | 89 | 79 | 83.4 | FAIL |

### Answer-level ratings and findings

Each row identifies the answer by the official PDF question order. “Evidence” is a short exact phrase from the answer; it is not a substitute for the full answer, which remains in the corresponding generated PDF.

| Profile | Q | Total (D/P/U/R/E/C) | PDF answer evidence | Deduction basis |
|---|---:|---|---|---|
| 1 | 1 | 83 (29/21/12/7/9/5) | “Your core style is quality and attention to detail.” | Direct conclusion; support then shifts to a broad work/private-life pattern and chart jargon. |
| 1 | 2 | 87 (31/21/13/8/9/5) | “You may have a sharp eye for small details.” | Relevant strength and matching pressure point; day-stem explanation is formulaic and not deeply individualized. |
| 1 | 3 | 85 (32/22/12/6/8/5) | “finding buyers, developing accounts or opening a sales channel” | Useful work examples; generic job-change advice repeats, while account/sales language may not suit every reader. |
| 1 | 4 | 89 (33/22/13/7/9/5) | “both regular income and more variable earnings” | Clear route answer and evidence; technical placement list is dense and cannot tell which route is stronger in practice. |
| 1 | 5 | 82 (31/20/12/6/8/5) | “being heard before someone offers a solution” | Direct personal need; repeats it as advice, then adds unexplained branch notation and a second need. |
| 1 | 6 | 90 (33/22/13/8/9/5) | “balancing customer growth … with your need for being heard” | Direct and individualized; still substantially overlaps Q5's relationship need. |
| 1 | 7 | 81 (30/19/12/7/9/4) | “The clearest year to review a major change is 2032” | Gives a year with a caveat; “review a major change” is vague and the follow-up does not explain a concrete direction. |
| 2 | 1 | 83 (29/21/12/7/9/5) | “Your core style is stability and keeping promises.” | Clear but broad identity claim; supporting work/private distinction is weakly connected to the question. |
| 2 | 2 | 87 (31/21/13/8/9/5) | “help others feel secure by keeping your promises” | Strength and downside are both answered; general pattern and modest chart-specific evidence limit personalization. |
| 2 | 3 | 78 (29/20/11/5/8/5) | “making, teaching or delivering something to a dependable standard” | Role comparison is useful but repeats the same two clauses; “owning a specialist assignment” is awkward English. |
| 2 | 4 | 90 (33/22/13/8/9/5) | “Regular work or repeat fees have the clearest chart support.” | Direct answer with a meaningful comparison; evidence explanation is abstract and does not show a practical distinction. |
| 2 | 5 | 82 (31/20/12/6/8/5) | “warm attention and time for your own interests” | Direct need; repeats as advice and adds chart notation plus a second relationship need. |
| 2 | 6 | 90 (33/22/13/8/9/5) | “balancing reliable products and repeatable service work” | Concrete work/private tension; overlaps Q5 and repeats a generic chart-separation explanation. |
| 2 | 7 | 81 (30/19/12/7/9/4) | “a theme of finding new customers connects with close relationships” | Gives a specific year and caveat; unclear what “change direction” means for the customer. |
| 3 | 1 | 83 (29/21/12/7/9/5) | “Your core style is quality and attention to detail.” | Same core wording as profile 1 despite a different input fixture; support is broad and technical. |
| 3 | 2 | 87 (31/21/13/8/9/5) | “You may have a sharp eye for small details.” | Useful strength and limitation; largely identical to profile 1 because the underlying day marker matches. |
| 3 | 3 | 85 (32/22/12/6/8/5) | “finding buyers, developing accounts or opening a sales channel” | Specific work examples; repeated advice and thin role-to-evidence explanation. |
| 3 | 4 | 89 (33/22/13/7/9/5) | “both regular income and more variable earnings” | Clear route conclusion; lengthy marker locations and caveat reduce ease and practical usefulness. |
| 3 | 5 | 82 (31/20/12/6/8/5) | “being heard before someone offers a solution” | Personal need is clear; repeats it and introduces unexplained day-branch notation. |
| 3 | 6 | 90 (33/22/13/8/9/5) | “balancing customer growth and business development work” | Direct work/private challenge; repeats Q5's need, lowering role uniqueness. |
| 3 | 7 | 81 (30/19/12/7/9/4) | “The clearest year to review a major change is 2032” | Timing is caveated but broad; the answer does not identify the kind or likely direction of change. |
| 4 | 1 | 82 (29/20/12/7/9/5) | “Your core style is quality and attention to detail.” | Generic identity conclusion; following cross-life summary is not a direct explanation of personality. |
| 4 | 2 | 87 (31/21/13/8/9/5) | “You may have a sharp eye for small details.” | Clear strength and weakness; personalization mostly rests on one repeated marker. |
| 4 | 3 | 78 (29/20/11/5/8/5) | “managing repeat customers, stock, schedules or ongoing accounts” | Some practical examples, but the same long comparison is repeated and phrasing is cumbersome. |
| 4 | 4 | 86 (32/21/12/7/9/5) | “both regular income and more variable earnings” | Answers route directly; chart evidence is dense and the customer link is not clearly distinguished from the conclusion. |
| 4 | 5 | 82 (31/20/12/6/8/5) | “time to share a feeling without being rushed” | Clear need; repeats the idea, adds technical notation, and includes a generic communication need. |
| 4 | 6 | 89 (33/21/13/8/9/5) | “balancing operations and resource management work” | Direct and tailored to work pattern; overlaps Q5 and uses a repeated chart-separation sentence. |
| 4 | 7 | 81 (30/19/12/7/9/4) | “a theme of steady income and practical commitments” | Specific year and caution; “review a major change” remains too broad to answer likely direction. |
| 5 | 1 | 83 (29/21/11/8/9/5) | “seeing connections and exploring options” | Direct core style; work/private evidence repeats the same theme rather than deepening the identity answer. |
| 5 | 2 | 87 (31/21/13/8/9/5) | “good at connecting ideas” | Names a strength and risk; the stem-led copy is formulaic and offers little chart differentiation. |
| 5 | 3 | 78 (29/20/11/5/8/5) | “managing repeat customers, stock, schedules” | Gives examples but repeats a long role contrast and adds generic job-switch advice. |
| 5 | 4 | 86 (32/21/12/7/9/5) | “both regular income and more variable earnings” | Direct conclusion; marker locations and support language are dense and not sufficiently discriminating. |
| 5 | 5 | 82 (31/20/12/6/8/5) | “warm attention and time for your own interests” | Direct need; repeats as advice and mixes in chart jargon and a second need. |
| 5 | 6 | 89 (33/21/13/8/9/5) | “balancing operations and resource management work” | Direct and individualized; overlaps the relationship answer and uses a repeated explanation. |
| 5 | 7 | 79 (30/18/11/7/9/4) | “The clearest year to review a major change is 2026” | Gives a specific year with a caveat; the year is not explained as a direction and follow-up is broad. |

## Product 01 result

All five newly generated profiles fail the 95-point threshold. Minimum new profile mean: 83.4. This is a full seven-answer review of these five newly generated Product 01 PDFs, not a score for the five historical baseline PDFs and not a controlled before/after comparison.

Historical Product 01 baseline means were 76.9, 81.9, 81.9, 81.7, 76.6. The historical PDFs used different profiles, so direct numerical improvement claims are not valid. The new fixture means are 85.3, 84.4, 85.3, 83.6, 83.4.

## Generation and verification

- Source commit: `2540b698aed2f1faf0d65b63742cebcc0e0e7e2d`.
- Files: `qa-artifacts/product01-postfix/01-new-york-known.pdf` through `05-los-angeles-known.pdf`.
- Test: `npx vitest run server/payments/product01-root-cause.test.ts` — 1 test passed; generated five PDFs and checked seven questions, seven TOC destinations, and PDF signatures.
- Automated structural values were excluded from content scoring. One fixture had partial calculation verification; this remains a separate diagnostic limitation.
- No code edits were made in this review, so none are being reported as saved fixes. The actual PDF files are local QA artifacts and were not uploaded as repository binaries.
