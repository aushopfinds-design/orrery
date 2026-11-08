# Product 01 Root Cause Fix Results

Date: 2026-11-04  
Base: `product01-final-quality-20261104` at `eb8dd5001dc0f26b1ab91df0a2b5dd1c77fce412`  
Work branch: `fix/product01-root-causes-20261104`

## Outcome

Product 01's four identified structural causes were addressed in the existing calculation and report path. The core Four Pillars calculator was retained; no external engine was installed. Product 02 and the other product narratives were not intentionally changed. Five Product 01 PDFs were regenerated and inspected. This report records an internal quality assessment, not evidence that a future outcome is guaranteed.

The review found a real location-input defect in two review fixtures, not in the live order validator: international calculations without longitude could silently use Seoul longitude. Those fixtures now carry their actual coordinates, and the calculation path now fails closed when a non-Korean solar-time calculation has no valid longitude. The live customer-order path already requires coordinates and timezone before calculation.

## Changes by root cause

| Cause | Change | Evidence / limit |
|---|---|---|
| International location fallback | Removed the Seoul-longitude fallback for non-`Asia/Seoul` local-solar-time calculations in `adjustBirthInputToSolarTime`; missing, non-finite, or out-of-range longitude now throws. Added an explicit regression. Sydney and Los Angeles profile fixtures now have their real coordinates. | `normalizePreviewBirth` / order normalization and `BirthForm::buildBirthInput` already require/pass location and timezone for international orders. This closes the reviewed fixture and unsafe fallback paths; it does not independently certify every city geocoder result. |
| Verification status lost at QA boundary | `issueReport` now summarizes the bundled independent pillar audit and passes `verified`, `partial`, `mismatch`, or `unavailable` into `inspectReport`. Only a full match of all applicable pillars yields `calculationVerified: true`. Unknown-time profiles exclude the hour pillar. Complete-report questions now carry evidence provenance into the gate. | Independent comparison checks pillar equality; it does not establish interpretive correctness or independently certify decade-cycle dates. A mismatch is recorded distinctly from an audit that could not run. |
| Narrow / overlapping interpretation | Product 01 Q3 now leads with a concrete work environment/role. Q4 now leads with the income route indicated by visible and hidden money markers and separates income route from the ability to retain money. Product 01 Q2 uses its own day-master strength and pressure signal; Q6 now connects work demands to a distinct private relationship need. | The changes use calculated chart fields already present in the plan; no new chart facts are invented. The QA provenance maps the seven buyer questions to their source chapters, rule IDs, and evidence. |
| Q7 overload | Product 01's annual selection now ranks actual day/month interactions, breaks ties by earliest year, and selects one strongest year. The answer gives the year and area first and calls it a review signal, not an event prediction. The buyer outline no longer appends the next decade-cycle paragraph to this answer; the dedicated cycle/timeline material remains in the report. | The selector is a prioritization of existing annual comparisons, not proof that the selected year will bring a life event. Cycle start dates remain explicitly approximate/not independently confirmed. |

## Calculation comparison

Pillar arrays below use the calculator's order: hour, day, month, year. Profile 3 has no known birth time, so hour is intentionally absent from the independent verification requirement.

| Profile | Location and time | Before coordinate correction | Corrected calculation | Independent audit |
|---|---|---|---|---|
| 1 | New York, 1998-03-25 03:00 EDT | `[己丑, 辛未, 乙卯, 戊寅]` | `[己丑, 辛未, 乙卯, 戊寅]` | Verified: year/month/day/hour |
| 2 | Seoul, 1980-03-25, unknown time | `[丙辰, 戊午, 庚戌, 丁卯]` | `[丙辰, 戊午, 庚戌, 丁卯]` | Partial: year/month/day agree; independent hour convention differs. Hour-boundary note retained. |
| 3 | New York, 1987-10-04, unknown time | `[??, 辛未, 乙卯, 戊寅]` | `[??, 辛未, 乙卯, 戊寅]` | Verified for year/month/day; hour excluded because time is unknown. |
| 4 | Sydney, 1990-08-14 08:30 AEST | Old fixture had no coordinates and silently used Seoul longitude: `[辛卯, 辛亥, 甲申, 庚午]` | `[壬辰, 辛亥, 甲申, 庚午]` | Verified: year/month/day/hour |
| 5 | Los Angeles, 1975-12-02 22:15 PST | Old fixture had no coordinates and silently used Seoul longitude: `[己未, 癸未, 丁亥, 乙卯]` | `[辛亥, 壬午, 丁亥, 乙卯]` | Verified: year/month/day/hour |

Sydney's corrected longitude changes the hour pillar; the date remains on the same day pillar. Los Angeles's old Seoul-longitude solar-time adjustment moved the effective solar date across a day boundary, changing both day and hour pillars. The corrected result follows the local IANA timezone (including the applicable DST offset) and the actual longitude/equation-of-time adjustment. It is not a change to the day-boundary or Zi-hour rule. The first calculated decade-cycle start also moves when the input location changes: Sydney old `1992-08-29T09:54:47Z`, corrected `1992-09-06T14:18:32Z`; Los Angeles old `1984-04-27T05:32:51Z`, corrected `1984-02-03T14:37:40Z`. These cycle boundaries are approximate and were not independently verified by the bundled pillar audit.

Profile 2's partial status is a known independent hour-pillar convention mismatch, not evidence that its year/month/day calculation failed. The PDF states the limitation instead of claiming a full match. The code change connects evidence status correctly; it does not claim to prove the engine's absolute correctness.

## Question-level answer design and before/after

| Q | Question purpose | Calculated evidence used | Result / distinction |
|---|---|---|---|
| 1 | Core personality | Day stem and the chart's public/private contrast | Leads with the day-stem style; describes it as a tendency, not a full personality diagnosis. |
| 2 | Strength and pressure | Day-stem profile strength and pressure | Uses a concrete strength/pressure pair, rather than repeating the career answer. |
| 3 | Suitable work | Month stem/branch work-role signal | Names the kind of work environment or role first; does not answer with a money route. |
| 4 | How money works | Visible/hidden regular-income and deal-income markers by chart position; money-depth reading | Names an income route first and explains where its markers occur; separates earning from retaining money. |
| 5 | Love pattern | Day branch for close relationships plus day-stem response style | Separates the relationship need from the person's own communication/response style. |
| 6 | Recurring life challenge | Month work role plus day-branch relationship need | Connects two different life areas; no longer repeats the old generic pressure framing. |
| 7 | Direction-change timing | Annual comparisons to day/month pillars and their named interactions | Selects one strongest supported year, explains the area to review, and avoids presenting it as a forecast. |

Representative same-input changes (profile 1):

| Area | Before | After |
|---|---|---|
| Q3 career | Work position and income language could make this read like a financial answer. | “A good career fit includes work such as finding buyers, developing accounts or opening a sales channel.” The next sentence ties role clarity to the repeated birth-month work signal. |
| Q4 money | Reused the work-pattern description and did not use the calculated money-depth distinction. | “Your chart supports both regular income and more variable earnings from customers, projects or deals.” It then cites money markers in work/private life versus wider contacts/work and says this shows placement, not an amount. |
| Q6 challenge | “Recurring challenge is this pressure pattern…” reused a broad pressure idea. | “Your main cross-life challenge is balancing customer growth and business development at work with being heard before someone offers a solution in close relationships.” The sentence ties month-work evidence to a separate day-branch need. |
| Q7 timing | Could list up to three years and append a 10-year-cycle interpretation. | “The clearest year to review a major change is 2032…” followed by the chart-linked work/relationship areas and a clear statement that this is not an event prediction. |

The five regenerated answer sets were read question by question (35 answers). Similar personality/pressure language among profiles with the same day stem is expected where the calculated evidence is the same; it is not treated as a failure of personalization. The full answer text is contained in the generated PDFs; the question-level purposes and principal evidence are listed above.

## PDF review and internal scores

The score below is a manual internal rubric assessment, separate from the automated report gate. Each PDF has seven questions. Scores do not certify chart conventions beyond the evidence shown above.

| Profile | Direct /30 | Personal /25 | Calculation /15 | Repetition /10 | English /10 | Structure /5 | Readability /5 | Total /100 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 New York, known time | 30 | 25 | 14 | 10 | 9 | 5 | 4 | **97** |
| 2 Seoul, unknown time | 30 | 25 | 12 | 10 | 9 | 5 | 4 | **95** |
| 3 New York, unknown time | 30 | 25 | 14 | 10 | 9 | 5 | 4 | **97** |
| 4 Sydney, known time | 30 | 25 | 14 | 10 | 9 | 5 | 4 | **97** |
| 5 Los Angeles, known time | 30 | 25 | 14 | 10 | 9 | 5 | 4 | **97** |

Calculation points reflect that the independent tool compares pillars, not interpretation or decade-cycle boundaries; profile 2 receives a larger deduction for the hour mismatch. English loses one point for unavoidable chart vocabulary that is explained in the report glossary. PDF readability loses one point because fit-to-width mobile rendering makes full-page text small; zooming is needed for sustained reading. A4 output was rendered and checked for clipping, right-edge overflow, chart cut-off, and title/body tracking. No abnormal letter spacing or clipping was seen. Each PDF has five TOC link annotations, and link destinations resolve to the intended answer pages 4, 6, 7, 8, and 10. Fit-width phone-size previews were inspected, but no physical mobile device was used.

Files generated: 5 PDFs; pages: profile 1 33, profile 2 34, profile 3 32, profile 4 34, profile 5 34. All loaded as PDFs and retained seven questions. The 100-point automated structural gate is not used as the manual PDF/content score.

## Regression and test results

- Product 02: baseline and current career report were compared question by question; all seven answer sections were identical. Product 02 narrative/content was not targeted. The global PDF TOC destination fix changes navigation target selection only.
- Unknown birth time: Profile 3's hour is excluded from independent verification and no hour pillar is asserted in the customer text.
- Product 01 root-cause integration test: passed; generated all five PDFs, verified seven Q/A pairs, provenance, current Sydney/Los Angeles pillars, unknown-time handling, and TOC destinations.
- TypeScript `npx tsc -b`: passed.
- Focused narrative tests exposed assertions for the previous Product 01 wording and multi-year Q7. Those assertions were updated to test the direct cross-life answer and one-year Q7 design.
- Full `bun run build` / `bun test` could not be run because Bun is not installed in this environment. A full Vitest attempt was interrupted after several legacy expectations failed against the targeted wording/timing changes; it was not a clean full-suite pass. `npx` focused testing should be rerun on the final commit.
- Product 02 text comparison is a content regression check; no claim is made that all downstream PDF rendering behavior was byte-identical.

## Remaining limits and release status

1. Independent calculation comparison covers pillars; decade-cycle start dates remain approximate and not independently verified.
2. Profile 2 retains the documented hour-pillar convention difference, so its audit is partial.
3. Mobile was checked through a fit-to-width rendered preview, not a physical device; small text at full-page scale requires zoom.
4. No Production deployment, payment activation, Stripe setting, or sales switch was changed. Preview deployment status is to be recorded after GitHub push and Vercel verification.

Product 01 is an internal quality-approval candidate on the five generated PDFs under the stated rubric (all at least 95), with the above calculation and mobile-readability qualifications. This is not a claim that timing predictions are certain or that future customer outcomes are guaranteed.
