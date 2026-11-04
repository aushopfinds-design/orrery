# Product 01 Engine Root Cause Diagnosis

**Repository:** `aushopfinds-design/orrery`  
**Base branch/commit:** `product01-final-quality-20261104` / `eb8dd5001dc0f26b1ab91df0a2b5dd1c77fce412`  
**Scope:** Read-only diagnosis of Product 01 calculation → interpretation → buyer answers → PDF. No report copy, engine, PDF, rule, or deployment changes were made.  
**Quality result:** This document assigns no new report scores and does not approve Product 01.

## Executive findings

The available evidence does **not** establish a general defect in the core pillar calculation algorithm. It does establish an input-validation gap in the five-profile review fixture: the Sydney and Los Angeles births omit latitude/longitude, even though the non-Seoul solar-time path uses longitude. Under the current code those fixture charts fall back to Seoul longitude; supplying the named cities’ coordinates changes chart output, including profile 5’s day pillar. The production preview input normalizer rejects missing coordinates, so this fixture defect does not by itself prove live purchases have the same issue.

The strongest confirmed causes of the Product 01 quality ceiling are further downstream:

1. Product 01’s quality diagnostic runs an independent audit but always passes `calculationVerified: false` to the quality gate; a `UNVERIFIED_CALCULATION` finding is therefore a wiring artifact for `complete`, not proof that calculation failed.
2. A rich chart is narrowed to a compact interpretation plan and then mapped through deterministic, limited language branches. Several calculated indicators never reach the buyer-answer feature plan.
3. Q3 and Q4 both use month-layer work/money features. That shared evidence is legitimate, but the answer rules do not enforce a strong career-task vs. income-route contrast in every case.
4. Q7 is assembled from selected annual change highlights plus a separate next-cycle paragraph; its sibling timeline and full report also carry timing detail. A simple conflict-line count chooses highlights rather than a semantic turning-point priority model.
5. Product 01 has no per-question provenance passed to the quality gate. Its heuristic gate checks text shape and repeated openings, not semantic answer fit or evidence sufficiency.

These findings explain why repeated copy edits can improve individual sentences while leaving the main scoring drivers intact. The recommended first action is a small repair to fixture input validity and QA wiring, followed by explicit per-question evidence/role contracts and Q7’s timing selection/composition. Keep the current calculator; the evidence does not justify replacing it or adding a new external engine.

## 1. Repository rules checked

At the stated base commit, the following files were present and read:

- `AGENTS.md`
- `docs/REPORT_QUALITY_STANDARD.md`
- `FINAL_225_ANSWER_CONTENT_AUDIT.md`
- `FINAL_REPORT_QUALITY_SIGNOFF.md`
- `docs/PRODUCT01_FINAL_QUALITY_SIGNOFF.md`

The rules documents preserve the 12 master rules (answer first, grounded personalization, meaningful repetition, simple English, no filler, honest timing, distinct question purpose, Collection value, unknown-time safety, no guaranteed outcomes, readable PDF, evidence-based review). This diagnosis does not edit or reinterpret those rules.

## 2. Actual generation path

| Stage | Verified code | Input → output / handoff | Information narrowed or risk |
|---|---|---|---|
| Birth entry | `src/components/BirthForm.tsx::buildBirthInput`; `src/utils/preview-draft.ts::normalizePreviewBirth`; `server/payments/input.ts::orderInput` | Date, time/unknown-time flag, gender, IANA timezone, latitude, longitude → normalized `BirthInput` | The preview normalizer requires finite coordinates. The review fixture discussed below bypasses this validation. |
| Pillar calculation | `packages/core/src/saju.ts::calculateSaju`; `packages/core/src/timezone.ts::adjustBirthInputToSolarTime` / `adjustBirthInputToKstWallClock`; `packages/core/src/pillars.ts` | `BirthInput` → pillars, ten-god relationships, hidden stems, relations and timing structures in `SajuResult` | Non-Seoul solar-time path defaults missing longitude to Seoul’s `127.0992°E`. Unknown time uses noon internally, hides the hour pillar, but still computes daewoon. |
| Interpretation features | `src/report/traditional-analysis.ts::natalAnalysis`, `natalPatterns`, `fiveYearPoints`; `src/report/structural-assessment.ts::structuralFacts`, `periodAssessment`; `src/report/structure-resolution.ts::resolveStructure`; `src/report/interpretation-plan.ts::subjectPlan`, `timingPlan`, `buildInterpretationPlan` | `SajuResult` → `InterpretationPlan` with selected chart roles, element counts, structural facts, money markers, repeated roles, pair relations, annual comparison, and selected cycles | The plan contains substantially fewer feature types than the calculator. Calculated unseong, sinsal, special stars, gongmang, jwabeop and injongbeop are not used as Product 01 answer features in `subjectPlan`. This is a product-scope choice, but it limits available differentiators. |
| Product 01 reading | `src/report/complete-reading.ts::buildCompleteReading`; `src/report/traditional-reading.ts::buildTraditionalCompleteFromPlan`; `src/report/purchase-narrative.ts` | Plan → chapter narratives; narrative is buyer-facing and mapped onto Product 01 questions | Fixed language maps and a small set of feature branches convert the plan to English. Same evidence can feed multiple chapters; no semantic check guarantees each question adds a distinct conclusion. |
| Buyer question mapping | `src/report/buyer-outline.ts::BUYER_QUESTIONS.complete`, `applyBuyerQuestions` | Chapters/periods → seven ordered question/answer blocks | Q3=`career`, Q4=`money`, Q7=`patterns` with `turning-points`. Q7 also appends timing paragraphs from `periods[1]`. |
| Delivery and PDF | `server/payments/report.ts::issueReport`, `customerDeliveryText`, `reportPdf` | Plain report text → PDF-lib layout, fonts, links, and PDF bytes | PDF renders delivered text; it cannot improve weak interpretation. Current signoff reports links worked, while mobile text was small. This was not independently re-scored here. |

## 3. Calculation diagnosis and five-profile comparison

`calculateSaju` obtains four pillars from `getFourPillars`, then derives detailed pillar attributes, relations and daewoon. For an unknown birth time it sets a noon working time, then replaces the hour pillar with `??`/`?` before returning. Thus the hour pillar is not exposed as a customer fact; however, downstream cycle calculation is still performed from the normalized noon input. `traditional-reading.ts` explicitly says ten-year start dates remain approximate for unknown time, and the Product 01 cycle prose likewise labels dates approximate. This does not make all cycle-derived themes independently verified.

The non-Seoul solar-time conversion uses timezone-aware local-time-to-UTC plus equation-of-time and longitude correction. `src/utils/preview-draft.ts` rejects missing coordinates for validated drafts, while `packages/core/src/timezone.ts` itself falls back to Seoul longitude when an international `BirthInput` lacks it.

The five review profiles are defined in `server/payments/six-product-review-pdfs.test.ts`. Profiles 4 and 5 supply Sydney/Los Angeles timezones but omit latitude/longitude. Running the target-matching local core source on those fixture values and comparing with the city coordinates gives:

| Profile | Fixture input | Fixture result (H/D/M/Y order) | With named-city coordinates | Effect |
|---|---|---|---|---|
| 1 | New York, 1998-03-25 03:00, known | `己丑 / 辛未 / 乙卯 / 戊寅` | Same | No discrepancy in the local core comparison. |
| 2 | Seoul, 1987-11-05 09:15, known | `丙辰 / 戊午 / 庚戌 / 丁卯` | Same | Independent audit later disagreed on hour only (`丁巳`); see below. |
| 3 | New York, 1998-03-25, unknown | `?? / 辛未 / 乙卯 / 戊寅` | Same | Hour is suppressed as intended. |
| 4 | Sydney, 1990-08-14 08:30, known; no coordinates in fixture | `辛卯 / 辛亥 / 甲申 / 庚午` | `壬辰 / 辛亥 / 甲申 / 庚午` | Hour pillar and calculated cycle start timestamp differ. |
| 5 | Los Angeles, 1975-12-02 22:15, known; no coordinates in fixture | `己未 / 癸未 / 丁亥 / 乙卯` | `辛亥 / 壬午 / 丁亥 / 乙卯` | Day and hour pillars and month-layer roles differ; cycle start timestamp differs. |

This is a **confirmed test-fixture/input issue**. The actual purchaser path requiring coordinates is a mitigating distinction, not a reason to accept the fixture PDFs as valid. The existing Product 01 targeted buyer-answer test uses three other scenarios and does not cover these coordinate-omission cases. Any interpretation or score comparison for the old P4/P5 PDFs should therefore be treated as invalid until the profiles are corrected and re-run.

### Calculation coverage and independent check

The source calculates year/month/day/hour pillars (with unknown hour suppressed), ten gods, hidden stems, twelve-stage and twelve-spirit markers, all pillar relations, special stars, daewoon, gongmang, jwabeop and injongbeop. Product 01’s interpretation plan uses selected roles and structural facts, not all calculated outputs. It is therefore inaccurate to infer a calculation defect merely because a feature does not appear in the narrative.

An existing independent cross-check is available: `server/payments/independent-audit.ts::auditBirthInput` loads the bundled `server/vendor/oh-my-saju.js.gz`; `src/report/independent-personalization.ts::calculateIndependentAudit` canonicalizes pillars and imposes a 500ms timeout. It is advisory and never replaces the paid-report calculation. In the observed run, profiles 1 and 3 matched on available year/month/day; profile 2 matched year/month/day but differed on hour (`丙辰` vs `丁巳`); the unknown-time profile’s hour is nulled in both. The independent audit for profiles 4 and 5 did not return within the existing 500ms guard in repeated calls, so no independent conclusion is claimed for those profiles. An hour-only disagreement is a genuine convention/result discrepancy to investigate, but not evidence that all pillars or the Product 01 reading are wrong.

### `UNVERIFIED_CALCULATION`: exact cause

In `server/payments/report.ts::issueReport`, `complete` calls `auditBirthInput` and passes the result into `buildCompleteReading`. However, `careerCalculationVerified` starts `false` and is assigned only inside the `input.kind === 'career'` branch. At the quality-gate call, `calculationVerified` is set to `input.kind === 'career' ? careerCalculationVerified : false`. Consequently Product 01 (`complete`) always supplies `false`, regardless of its audit outcome. `src/lib/report-quality-gate.ts::inspectReport` then emits blocking `UNVERIFIED_CALCULATION` with a 30-point penalty. This flag means the adapter did not supply verification for Product 01; by itself it does **not** mean the core calculation failed.

There are two related coverage gaps: `usesHourPillar` is hard-coded `false` with a comment that no semantic hour-pillar audit exists, and only Career receives `answerProvenance`. Product 01 therefore has no question-level chart→rule→answer trace in this gate.

## 4. Interpretation and answer mapping

`subjectPlan` retains day stem/branch, month stem/branch ten gods, day-branch and year-stem roles, structural strength/resolution, five-element counts, available pillar positions, visible/hidden money markers, repeated roles and relation labels. `timingPlan` adds annual pillar, role, direction/tension, active cycle and chart-contact comparisons. These data vary by person and can support personalization.

The loss occurs after calculation: `traditional-reading.ts` and `purchase-narrative.ts` turn those features into fixed phrase maps and conditional prose. The mapping is deterministic and relatively shallow; it does not reason over every chart feature or require each answer to cite its own evidence. Most calculated indicators are not presented as buyer-answer evidence. The five-profile differences are real where chart roles differ, but identical core profiles can legitimately share the same conclusion; the current templates often reuse the same broad theme without explaining a distinct answer role.

### Product 01 question role and observed structural pressure

| Q | Buyer question | Intended source/role | Diagnostic concern |
|---|---|---|---|
| Q1 | What kind of person am I? | `personality` / identity | Day-style profile language can recur elsewhere; needs identity-level conclusion. |
| Q2 | What helps me thrive, and what can hold me back? | `social` / strengths and limits | Should translate structural signals into useful conditions rather than repeat identity. |
| Q3 | What kind of career suits me? | `career` / career fit | Uses month work/routine roles and daily personal style. It should answer tasks/environment. |
| Q4 | How does money work in my life? | `money` / earning pattern | Uses visible/hidden money markers and income-route language, but also refers to the birth-month work placement. It should answer earning/retaining route. |
| Q5 | What is my pattern in love? | `love` / relationship need | Day-branch relationship profile. Keep distinct from work roles. |
| Q6 | What are my biggest life challenges? | `life-challenges` / recurring challenge | Relation/structure pressure should name the repeated challenge and its domain. |
| Q7 | When may my life change direction? | `patterns` / turning-point timing | Annual chart contacts, selected highlights, plus a next-cycle paragraph. Needs a clear answer before evidence detail. |

The `BUYER_QUESTIONS` map does distinguish Q3 and Q4 by separate source and role IDs. The problem is not that both are mapped to the same chapter. It is that the chapter language uses overlapping month-role evidence and does not impose a consistent output contract that forces “what work fits” vs. “how income is generated/kept” to be separate customer insights. For profiles 1 and 3, month stem and principal branch both resolve to `偏財`; therefore the public work and daily-duty signal can collapse into the same commercial-opportunity theme. That shared feature is valid; repeating its meaning without a new career or money conclusion is not.

**Confirmed:** shared month-role evidence and narrow fixed phrase mapping. **Not established here:** that every one of the 35 current answer texts has semantic duplication; that would require a targeted answer comparison against the current generated artifacts, which are not available in this runtime. This diagnosis does not re-audit the 35 answers.

## 5. Q7 information density and timing limits

The Q7 route has multiple independently assembled timing layers:

- `purchase-timing-sections.ts` creates a ten-year annual series and highlights up to three changed years.
- The selection score is the count of lines whose IDs match change/background/wider-pressure patterns, not a calibrated measure of a major turning point.
- The Product 01 highlight lead lists years/themes/affected areas and cautions that these are planning prompts.
- `buyer-outline.ts::applyBuyerQuestions` then appends all year-bearing paragraphs from the patterns chapter and separately appends `periods[1]`, the next ten-year cycle with another explanation.
- The full report also has its annual timeline and cycle sections.

That combination can make Q7 dense and repetitive even when each individual sentence is cautious. The question asks “when”; the answer’s initial “Review these chart-linked periods…” is directionally responsive but does not state a prioritized conclusion about which period matters most. With unknown birth time, the noon placeholder suppresses the hour pillar but does not suppress daewoon; the report says start dates are approximate, while Q7 can still include cycle-linked timing. That warrants explicit uncertainty and careful use of the cycle, not an invented exact date.

No Q7 copy was changed in this task.

## 6. Root-cause register

| Code / finding | Evidence and affected scope | Code location | Confidence | Expected change / regression risk | Recommended resolution |
|---|---|---|---|---|---|
| CALC — review fixtures missing geographic coordinates | P4 Sydney and P5 Los Angeles fixture objects omit lat/lon; calculator falls back to Seoul longitude; corrected coordinates change P4 hour and P5 day/hour pillars. Affects the two sample profiles and their downstream answers. | `server/payments/six-product-review-pdfs.test.ts:11–12`; `packages/core/src/timezone.ts:227–228`; `src/utils/preview-draft.ts:20` | Confirmed fixture issue; not evidence of a general live-path defect | Add correct test coordinates / require validation in direct report fixtures. Regression risk: existing snapshots/PDFs change because they were calculated from bad inputs. | Repair fixtures and mark legacy P4/P5 artifacts stale before using them for content evaluation. Do not change the core engine as part of that fix. |
| CALC — independent hour convention mismatch | P2 Y/M/D agree, hour differs `丙辰` vs `丁巳`; independent tool has its own `ziStart` and local clock conventions. | `src/report/independent-personalization.ts:42–53`; `server/payments/independent-audit.ts:15–20` | Confirmed disagreement; cause attributable to convention/input or implementation not yet isolated | Investigate expected hour convention with controlled cases; avoid using disagreement as a blanket failure. Risk: broad pillar changes affect many products. | Document convention; compare normalized time inputs and boundary policy; keep advisory audit from silently changing paid output. |
| DATA — unverified cycle timing for unknown birth time | Unknown time uses noon working input; hour pillar suppressed, daewoon remains computed and selected; cycle start dates called approximate. | `packages/core/src/saju.ts:25–30,54–72`; `src/report/traditional-reading.ts:41`; `src/report/purchase-narrative.ts:518–538` | Confirmed behavior | Restrict precision / ensure unknown-time uncertainty flows to every cycle-derived statement. Risk: year timing sections may become less specific. | Carry an explicit timing confidence/unknown-hour flag into selected-cycle evidence and prose policy. |
| MAP — interpretation plan narrows calculation features | Many calculated indicators do not appear in `subjectPlan`; selected structural/money/relation features do. | `src/report/interpretation-plan.ts:13–24`; `packages/core/src/saju.ts` | Confirmed | Add only validated, question-relevant feature mappings. Risk: introducing low-confidence indicators may add noise or contradiction. | Keep a small approved evidence map per question; do not expose every computed field. |
| ROLE — career and money output boundaries weak | Q3 and Q4 have distinct `source` and `role`, but both can use month role/routine evidence; P1/P3 month stem/branch roles both `偏財`. | `src/report/buyer-outline.ts:19–25`; `src/report/purchase-narrative.ts` career and money sections around lines 90–110 and 190–198 | Structural cause confirmed; universal duplication not claimed | Clarify role contract, not necessarily calculation features. Risk: over-separating shared valid evidence or making one answer generic. | Q3 must conclude fit of tasks/setting/role; Q4 must conclude income route and limits of money evidence. Require a different customer takeaway, while allowing shared chart evidence. |
| TEMPLATE — deterministic phrase maps and repeated broad themes | Plan features flow into fixed labels and conditional sentence branches; no semantic personalization evaluator. | `src/report/traditional-reading.ts`; `src/report/purchase-narrative.ts`; `src/report/purchase-language.ts` | Confirmed design property | Narrow question-specific templates and evidence-conditioned clauses. Risk: losing current safe caveats or creating brittle wording. | Refactor only affected answer rules after tests capture current PASS answers. |
| TIMING — Q7 selection/composition too dense | Up to 3 highlights selected via conflict-line count; Q7 adds timing paragraphs and next cycle separately. | `src/report/purchase-timing-sections.ts:79–99`; `src/report/buyer-outline.ts:254–260` | Confirmed | Use a prioritized summary policy and avoid repeating the full timeline in the answer block. Risk: omitting useful context / treating unselected years as safe. | Separate “best-supported period(s)” from “other annual themes”; retain full timing detail in its own section; no guaranteed events. Unknown-time cases should use qualified cycle timing. |
| REVIEW — gate does not measure content semantics | Repeated opening/length/generic phrase heuristics; Product 01 always sends `calculationVerified:false`, no provenance; hour usage hard-coded false. | `server/payments/report.ts:67–85,112–120`; `src/lib/report-quality-gate.ts:20–59` | Confirmed | Fix data wiring and add Product 01 evidence trace/semantic review record. Risk: gate may pass false positives if verification is treated as approval. | Keep heuristic gate separate from human/content signoff; name calculation status distinctly: match, mismatch, unavailable. |
| PDF — mobile type is small at reduced scale | Prior Product 01 signoff records mobile fit-to-screen small; PDF layout itself was not rendered during this diagnosis. | `docs/PRODUCT01_FINAL_QUALITY_SIGNOFF.md`; `server/payments/report.ts::reportPdf` | Prior report only; not reverified in this task | Visual design adjustment only if later repro confirms it. Risk: pagination and emphasis layout shifts. | Treat as secondary output concern; render A4 and representative mobile scale after content fixes. |

## 7. Why scores stayed at 81–85 (without rescoring)

The earlier signoff records those scores; this diagnosis does not reassess them. The score plateau is consistent with a layer mismatch: sentence edits operate on the final English surface, while personalization depth, role overlap and Q7 density are shaped earlier by the feature plan and composition rules. In addition, the automatic diagnostic’s Product 01 calculation field is unconditionally false and its checks are not semantic, so its score cannot be read as an accurate measure of either calculation validity or prose quality. Finally, the P4/P5 review fixtures omit required geographic facts, which can invalidate their content baseline.

The mobile text-size concern can reduce the PDF-readability portion of a total score, but cannot account for the content-level issues by itself.

## 8. Improvement paths

| Option | Advantages | Limits / risks | Assessment |
|---|---|---|---|
| A. Edit existing answer templates only | Smallest code scope; fast to clarify openings, remove duplicate clauses, and simplify Q7 prose. Preserves calculator. | Cannot recover evidence that is not passed into the template; repeated edits can mask feature/role problems rather than solve them. | Useful as a final expression layer after the evidence and role contracts are explicit; insufficient as the sole first fix. |
| B. Add interpretation rules to the current engine | Reuses existing calculated chart and timing evidence; can establish Q3/Q4 distinction, evidence trace, unknown-time limits and a prioritized Q7. Limited, reviewable change. | Requires careful evidence selection; adding unused indicators indiscriminately risks unsupported or confusing interpretations. | **Recommended.** Pair a small quality-gate adapter/fixture fix with explicit question-specific evidence and conclusion contracts. No engine replacement required. |
| C. Add a new interpretation engine | Could offer a larger reasoning layer or alternative wording. | Duplicates source of truth, creates disagreement and maintenance risks, and is unsupported by current evidence; new external engine is explicitly out of scope. | Not recommended. Existing data and code show the immediate failure is mapping/role/gate composition, not proof that the calculator must be replaced. |

## 9. Smallest high-value implementation sequence for a later task

1. Correct the review fixture coordinates for Sydney and Los Angeles; add a regression assertion that international test profiles include coordinates. Preserve old artifacts as historical, not valid baselines.
2. Repair `issueReport`’s calculation-verification handoff so Product 01 records the actual independent-audit result, while representing unavailable and mismatch separately. Do not make a successful cross-check equal to semantic quality approval.
3. Add Product 01 per-question provenance using the existing `answer-provenance.ts` pattern, with evidence IDs tied to calculated fields and rule IDs tied to answer roles.
4. Define a question role/evidence contract: Q3 career fit = tasks/setting/work structure; Q4 money = supported income route/visible vs hidden money evidence and limits. Shared chart features may support both, but each must state a distinct conclusion.
5. Reduce Q7 to a direct, ranked, evidence-backed timing answer; keep the comprehensive annual timeline outside the concise Q7 answer. Pass unknown-time uncertainty through cycle selection and avoid false precision.
6. Test same-profile invariance, corrected cross-profile differences, unknown-time behavior and unchanged Product 02 output before making content signoff claims.
7. Re-render only the needed Product 01 PDFs for actual reading; inspect A4 and reduced/mobile views after content composition is corrected.

This sequence changes neither the core calculator nor other products unless shared code changes are unavoidable; any shared change should have a Product 02 regression comparison.

## 10. Required answers

**Q1. Is the existing saju calculation engine itself defective?**  
No general defect is proven by this investigation. A concrete input/fixture defect is proven: P4/P5 review inputs omit coordinates and therefore use Seoul longitude. An independent hour disagreement is confirmed for P2, but its exact convention cause is unresolved. The calculator computes the listed chart features; these findings call for correcting test inputs and investigating the hour convention, not replacing the engine.

**Q2. Does the interpretation engine provide enough personalized information?**  
Not consistently for the Product 01 answer roles. It has person-specific chart features, but `subjectPlan` is selective and the later deterministic narrative maps a small feature set to fixed phrase families. Product 01 does not provide per-question provenance to the QA gate. That is an interpretation/mapping limitation, not evidence that the calculation has no usable data.

**Q3. Why do repeated sentence edits leave scores at 81–85?**  
Because the main issues are upstream of wording: shared Q3/Q4 evidence with weak role separation, Q7’s mechanical highlight selection and multiple timing layers, missing per-question evidence trace, and a quality-gate wiring bug. P4/P5 sample inputs also undermine the comparison baseline. Sentence edits alone cannot reliably change those structural causes.

**Q4. Can the current engine reach 95-level quality without replacement?**  
Yes, that is plausible: the calculator already produces relevant pillar, role, structure, relation and timing data, and the strongest confirmed defects are fixture validation, feature-to-question mapping, answer composition and quality-gate wiring. This is a reasoned feasibility judgment, not a promised score; only revised PDFs read against the rubric can establish the result.

**Q5. What should be fixed first?**  
First correct the P4/P5 profile fixtures, then fix Product 01’s `issueReport` → `inspectReport` verification status handoff. Next add question-level provenance/role contracts and simplify the Q7 timing selection/composition, with explicit unknown-time limits. These are the smallest changes that address confirmed causes before further copy editing.

## 11. Limits of this diagnosis

- No PDFs were regenerated or visually reviewed during this task; 11/3 review PDFs were available but are not the latest 11/4 artifacts and were not treated as current content evidence.
- No new report scores were assigned and the prior 81–85 scores were not independently re-evaluated.
- The five profile calculation comparison used the local core files whose relevant blob hashes matched the stated target commit. This establishes deterministic current-core behavior for those inputs, not independent validation of the astrology conventions.
- The independent audit timed out for profiles 4 and 5 under its existing 500ms policy; their independent pillars remain unverified here.
- No code, content, permanent rules, Product 02, Preview, Production, or sales settings were changed.
