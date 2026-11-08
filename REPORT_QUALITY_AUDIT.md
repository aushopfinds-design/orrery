# THE FATE KEY — Independent PDF Answer Audit

Updated: 2026-11-08 (Australia/Sydney)

## Scope and method

- Source: existing five-profile Product 01 PDF set generated through the paid `issueReport()` path; no automated diagnostic score was used as an answer-quality score.
- Baseline completed: 35/260 answers (Product 01, five profiles × seven official questions), from the previously generated Product 01 PDF snapshot. Remaining: 225 answers across Products 02–07. The 260 total follows the official question counts: Products 01–06 have 7 each and Product 07 has 10, across five profiles. The request's 245 denominator omits 15 Product 07 answers.
- Each answer was read from its PDF and scored independently against the requested rubric: direct answer 35, personalization 25, usefulness/specificity 15, repetition/generalities 10, easy English 10, consistency 5. Scores are one reviewer’s content judgment, not an objective truth claim.
- Profile score = arithmetic mean of its seven answer scores, rounded to one decimal. Product pass requires all five profile means ≥95.
- Scores are shown as D/P/U/R/E/C; their sum is the answer score.

## Latest checkpoint — 2026-11-08

- Focused edits present only in the local working diff were checked with the three relevant suites: 37/37 tests passed (Product 01 PDF/root-cause, purchase narrative, and bundle reading tests).
- Five updated Product 01 PDFs were generated from that local working diff. Their questions and TOC links passed structural assertions. The updated PDFs have not yet received an independent answer-by-answer score, so the baseline scores below do not apply to them.
- Local working diff is not part of the current remote branch tip (`0e833059442a68500aa423a79949cb9e36e91d3d`). No updated code was represented as remotely saved.
- Independent baseline scoring remains 35/260; 225 answers have no answer-level independent score. No product passes the 95-point requirement on current-version PDFs.

## Product 01 — Your Life, Your Destiny

| Profile | Birth details used in test PDF | Seven answer scores | Mean | Result |
|---|---|---|---:|---|
| 1 | 1987-11-05; known time; America/New_York | 85, 85, 87, 48, 80, 74, 79 | 76.9 | FAIL (<95) |
| 2 | 1991-04-12; known time; Europe/London | 84, 85, 87, 85, 80, 74, 78 | 81.9 | FAIL (<95) |
| 3 | 1978-07-19; known time; Australia/Sydney | 84, 85, 87, 85, 80, 74, 78 | 81.9 | FAIL (<95) |
| 4 | 2001-02-08; known time; Asia/Seoul | 84, 85, 87, 84, 80, 74, 78 | 81.7 | FAIL (<95) |
| 5 | 1969-12-03; unknown time; Asia/Kolkata | 84, 85, 87, 48, 80, 74, 78 | 76.6 | FAIL (<95) |

**Product 01 result:** minimum profile mean **76.6**; average across five profile means **79.8**. All five profiles fail the 95-point threshold.

### Answer-level evidence and ratings

Each score row uses: **D** directness /35, **P** personalization /25, **U** usefulness /15, **R** repetition /10 (higher is cleaner), **E** easy English /10, **C** consistency /5.

#### Profile 1 — 1987-11-05 (known birth time), America/New_York

Source PDF: `01-complete.pdf`. Profile score: **76.9/100**.

**personality — What kind of person am I?** — FIX: **85/100** (D/P/U/R/E/C: 30/22/12/7/9/5)

> Your core style is stability and keeping promises. Your birth-day sign is 戊 (Yang Earth); it points to this tendency, not a complete definition of you. Answer detail: A recurring life theme is the difference between what others rely on you for and what restores you privately. The public work position carries steady output and practiced skill; the private-life position adds training and dependable support. The two areas call for different responses, so professional achievement alone may not meet a private need.

**Finding:** Direct identity conclusion is present and tied to the day stem. Supporting paragraph shifts into a broad work/private-life pattern that partly repeats across profiles; explain the personality link more clearly.

**Code target:** `src/report/chart-depth.ts — life-area depth paragraph`

**social — What helps me thrive, and what can hold me back?** — FIX: **85/100** (D/P/U/R/E/C: 31/20/12/8/9/5)

> You may help others feel secure by keeping your promises. You can stay practical when a situation gets difficult. This comes from your birth-day sign 戊 (Yang Earth); it describes a tendency, not your whole personality. Answer detail: The pressure point is this: Being dependable can turn into doing everything. You may wait for someone to notice that you need help.

**Finding:** Names a personal strength and limit in plain language. Profiles 2–5 repeat nearly identical day-stem wording, so personalization is weaker when other chart differences do not affect this answer.

**Code target:** `src/report/purchase-narrative.ts — complete personality/strength narrative`

**career — What kind of career suits me?** — FIX: **87/100** (D/P/U/R/E/C: 32/22/13/7/8/5)

> Your best fit combines making, teaching or delivering something to a dependable standard with enough time for owning a specialist assignment from start to finish. For example, being hired for the first while your whole week is consumed by the second would leave the role poorly matched. This comes from comparing the two different roles in your birth month, not from your job title. Answer detail: Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.

**Finding:** Gives a chart-specific work fit. The phrase “being hired for the first” is awkward, and the same job-change advice appears across profiles instead of adding individual evidence.

**Code target:** `src/report/purchase-narrative.ts — career answer and repeated keep-work advice`

**money — What is my natural pattern for earning money?** — FIX: **48/100** (D/P/U/R/E/C: 16/9/7/2/9/5)

> Your chart does not show a direct money sign in the checked placements. It therefore cannot choose a salary or business route for you; work skills and real contract terms carry more weight. No direct money sign appears in the checked positions, so the reading does not assign you a fixed-pay or deal-based route. Answer detail: There is no direct money sign in the checked outward or inner roles. Your work pattern is still readable, but a claim about strong wealth luck would go beyond these facts.

**Finding:** P1 and P5 say the chart cannot choose an earning route, then repeat that same absence in the same answer and again in the detail. P2–P4 give a route, but the detail partly restates the evidence without adding much usefulness.

**Code target:** `src/report/purchase-narrative.ts — moneyAnswer/visibleMoneyExplanation; src/report/chart-depth.ts — moneyDepth`

**love — What do I need most in a close relationship?** — FIX: **80/100** (D/P/U/R/E/C: 31/20/12/6/8/3)

> You are most likely to feel secure with someone who makes room for warm attention and time for your own interests. In everyday life, look for people who make time for you and respect your interests. This describes what helps you; it does not predict another person's character. Answer detail: Conflict can develop when taking a request for space as a lack of love. Your chart links this pattern to 午, the day sign used to read close relationships. It also points to a need for clear responsibilities and people who share the work; that is separate from what helps you feel secure with a partner.

**Finding:** Names a concrete relationship need and a likely friction point. The second sentence restates the need as advice; Q6 repeats much of the same need. “Day sign” and the Han character are not explained in everyday English.

**Code target:** `src/report/purchase-narrative.ts — relationship answer; src/report/chart-depth.ts — relationship detail`

**patterns — What are my biggest life challenges?** — FIX: **74/100** (D/P/U/R/E/C: 29/19/11/5/7/3)

> Your main cross-life challenge is balancing reliable products and repeatable service at work with warm attention and time for your own interests in close relationships. These needs come from separate chart areas, so meeting one does not automatically meet the other. Answer detail: In close relationships, the day sign 午 points to warm attention and time for your own interests. Friction can grow when the support offered differs from the support you actually want. Practical point: At work, check whether the practised skills and dependable results role gives you time and authority for its daily demands. In a close relationship, name when you need warm attention and time for your own interests.

**Finding:** Directly names a life challenge, but overlaps with career and relationship content already used in Q3 and Q5. Practical advice repeats those topics instead of identifying a distinct recurring pressure pattern.

**Code target:** `src/report/purchase-narrative.ts — life-challenges answer and practical point`

**q-turning-points — When may my life change direction?** — FIX: **79/100** (D/P/U/R/E/C: 29/18/12/7/9/4)

> The clearest year to review a major change is 2032: a theme of finding new customers connects with close relationships and personal choices. This is a calculated timing signal for those areas, not a prediction that an event will happen. Answer detail: Pay attention to shared time, personal choices and expectations in close relationships. Practical point: Separate a possible work change from a private-life change before treating either as a verdict on your whole life.

**Finding:** Provides a specific calculated year and caveats that it is not an event prediction. It is framed as a time to review rather than a clear directional answer, and supporting text repeats earlier work/relationship themes.

**Code target:** `src/report/purchase-timing-sections.ts — turning-point answer and follow-up`

#### Profile 2 — 1991-04-12 (known birth time), Europe/London

Source PDF: `02-complete.pdf`. Profile score: **81.9/100**.

**personality — What kind of person am I?** — FIX: **84/100** (D/P/U/R/E/C: 30/21/12/7/9/5)

> Your core style is seeing connections and exploring options. Your birth-day sign is 壬 (Yang Water); it points to this tendency, not a complete definition of you. Answer detail: A recurring life theme is the difference between what others rely on you for and what restores you privately. The public work position carries independent judgement; the private-life position adds contacts, competition and shared resources. The two areas call for different responses, so professional achievement alone may not meet a private need.

**Finding:** Direct identity conclusion is present and tied to the day stem. Supporting paragraph shifts into a broad work/private-life pattern that partly repeats across profiles; explain the personality link more clearly.

**Code target:** `src/report/chart-depth.ts — life-area depth paragraph`

**social — What helps me thrive, and what can hold me back?** — FIX: **85/100** (D/P/U/R/E/C: 31/20/12/8/9/5)

> You may be good at connecting ideas. When one route is blocked, you can often see another. This comes from your birth-day sign 壬 (Yang Water); it describes a tendency, not your whole personality. Answer detail: The pressure point is this: Every new option can look worth trying. You may keep exploring without choosing what to do today.

**Finding:** Names a personal strength and limit in plain language. Profiles 2–5 repeat nearly identical day-stem wording, so personalization is weaker when other chart differences do not affect this answer.

**Code target:** `src/report/purchase-narrative.ts — complete personality/strength narrative`

**career — What kind of career suits me?** — FIX: **87/100** (D/P/U/R/E/C: 32/22/13/7/8/5)

> Your best fit combines owning a specialist assignment from start to finish with enough time for taking charge of a difficult deadline or resolving an urgent problem. For example, being hired for the first while your whole week is consumed by the second would leave the role poorly matched. This comes from comparing the two different roles in your birth month, not from your job title. Answer detail: Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.

**Finding:** Gives a chart-specific work fit. The phrase “being hired for the first” is awkward, and the same job-change advice appears across profiles instead of adding individual evidence.

**Code target:** `src/report/purchase-narrative.ts — career answer and repeated keep-work advice`

**money — What is my natural pattern for earning money?** — FIX: **85/100** (D/P/U/R/E/C: 30/20/12/8/10/5)

> Regular work or repeat fees have the clearest chart support. Variable projects may add income, but the chart gives less direct support to depending on them as your only route. In your chart, steady-income signs appear in longer-term plans and wider contacts. This shows where the income markers appear, not how much you will earn. Answer detail: The earning signs are present inside the branches, rather than in the main outward roles. The money reading therefore follows the less visible work behind your role; it does not treat the absence of an outward sign as an absence of income.

**Finding:** P1 and P5 say the chart cannot choose an earning route, then repeat that same absence in the same answer and again in the detail. P2–P4 give a route, but the detail partly restates the evidence without adding much usefulness.

**Code target:** `src/report/purchase-narrative.ts — moneyAnswer/visibleMoneyExplanation; src/report/chart-depth.ts — moneyDepth`

**love — What do I need most in a close relationship?** — FIX: **80/100** (D/P/U/R/E/C: 31/20/12/6/8/3)

> You are most likely to feel secure with someone who makes room for time to think before a difficult conversation. In everyday life, look for people who respect a pause and return to the conversation. This describes what helps you; it does not predict another person's character. Answer detail: Conflict can develop when going quiet without saying when you will talk again. Your chart links this pattern to 子, the day sign used to read close relationships. It also points to a need for room to explore and a clear next step; that is separate from what helps you feel secure with a partner.

**Finding:** Names a concrete relationship need and a likely friction point. The second sentence restates the need as advice; Q6 repeats much of the same need. “Day sign” and the Han character are not explained in everyday English.

**Code target:** `src/report/purchase-narrative.ts — relationship answer; src/report/chart-depth.ts — relationship detail`

**patterns — What are my biggest life challenges?** — FIX: **74/100** (D/P/U/R/E/C: 29/19/11/5/7/3)

> Your main cross-life challenge is balancing independent specialist work at work with time to think before a difficult conversation in close relationships. These needs come from separate chart areas, so meeting one does not automatically meet the other. Answer detail: In close relationships, the day sign 子 points to time to think before a difficult conversation. Friction can grow when the support offered differs from the support you actually want. Practical point: At work, check whether the independent judgement role gives you time and authority for its daily demands. In a close relationship, name when you need time to think before a difficult conversation.

**Finding:** Directly names a life challenge, but overlaps with career and relationship content already used in Q3 and Q5. Practical advice repeats those topics instead of identifying a distinct recurring pressure pattern.

**Code target:** `src/report/purchase-narrative.ts — life-challenges answer and practical point`

**q-turning-points — When may my life change direction?** — FIX: **78/100** (D/P/U/R/E/C: 29/18/12/6/9/4)

> The clearest year to review a major change is 2026: a theme of finding new customers connects with work and daily responsibilities and close relationships and personal choices. This is a calculated timing signal for those areas, not a prediction that an event will happen. Answer detail: Review how work demands, shared time and personal choices fit together. Practical point: Separate a possible work change from a private-life change before treating either as a verdict on your whole life.

**Finding:** Provides a specific calculated year and caveats that it is not an event prediction. It is framed as a time to review rather than a clear directional answer, and supporting text repeats earlier work/relationship themes.

**Code target:** `src/report/purchase-timing-sections.ts — turning-point answer and follow-up`

#### Profile 3 — 1978-07-19 (known birth time), Australia/Sydney

Source PDF: `03-complete.pdf`. Profile score: **81.9/100**.

**personality — What kind of person am I?** — FIX: **84/100** (D/P/U/R/E/C: 30/21/12/7/9/5)

> Your core style is seeing connections and exploring options. Your birth-day sign is 壬 (Yang Water); it points to this tendency, not a complete definition of you. Answer detail: A recurring life theme is the difference between what others rely on you for and what restores you privately. The public work position carries formal responsibility and standards; the private-life position adds steady income and practical commitments. The two areas call for different responses, so professional achievement alone may not meet a private need.

**Finding:** Direct identity conclusion is present and tied to the day stem. Supporting paragraph shifts into a broad work/private-life pattern that partly repeats across profiles; explain the personality link more clearly.

**Code target:** `src/report/chart-depth.ts — life-area depth paragraph`

**social — What helps me thrive, and what can hold me back?** — FIX: **85/100** (D/P/U/R/E/C: 31/20/12/8/9/5)

> You may be good at connecting ideas. When one route is blocked, you can often see another. This comes from your birth-day sign 壬 (Yang Water); it describes a tendency, not your whole personality. Answer detail: The pressure point is this: Every new option can look worth trying. You may keep exploring without choosing what to do today.

**Finding:** Names a personal strength and limit in plain language. Profiles 2–5 repeat nearly identical day-stem wording, so personalization is weaker when other chart differences do not affect this answer.

**Code target:** `src/report/purchase-narrative.ts — complete personality/strength narrative`

**career — What kind of career suits me?** — FIX: **87/100** (D/P/U/R/E/C: 32/22/13/7/8/5)

> A good career fit includes work such as leading a defined team or maintaining professional standards. Both sides of your birth-month pattern repeat this preference, so a clear role with defined duties fits better than a title that spreads you across unrelated tasks. These are examples of work, not a fixed list of careers. Answer detail: Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.

**Finding:** Gives a chart-specific work fit. The phrase “being hired for the first” is awkward, and the same job-change advice appears across profiles instead of adding individual evidence.

**Code target:** `src/report/purchase-narrative.ts — career answer and repeated keep-work advice`

**money — What is my natural pattern for earning money?** — FIX: **85/100** (D/P/U/R/E/C: 30/20/13/8/9/5)

> Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. In your chart, steady-income signs appear in private life and wider contacts and work; deal-based income signs appear in private life and wider contacts. This shows where the income markers appear, not how much you will earn. Answer detail: Your chart links money across your life with a usable skill and paying customers. Both the work you produce and a pattern linked with earning and managing money appear in the checked route. This describes how income may be earned; it does not tell us how much you will keep.

**Finding:** P1 and P5 say the chart cannot choose an earning route, then repeat that same absence in the same answer and again in the detail. P2–P4 give a route, but the detail partly restates the evidence without adding much usefulness.

**Code target:** `src/report/purchase-narrative.ts — moneyAnswer/visibleMoneyExplanation; src/report/chart-depth.ts — moneyDepth`

**love — What do I need most in a close relationship?** — FIX: **80/100** (D/P/U/R/E/C: 31/20/12/6/8/3)

> You are most likely to feel secure with someone who makes room for warm attention and time for your own interests. In everyday life, look for people who make time for you and respect your interests. This describes what helps you; it does not predict another person's character. Answer detail: Conflict can develop when taking a request for space as a lack of love. Your chart links this pattern to 午, the day sign used to read close relationships. It also points to a need for room to explore and a clear next step; that is separate from what helps you feel secure with a partner.

**Finding:** Names a concrete relationship need and a likely friction point. The second sentence restates the need as advice; Q6 repeats much of the same need. “Day sign” and the Han character are not explained in everyday English.

**Code target:** `src/report/purchase-narrative.ts — relationship answer; src/report/chart-depth.ts — relationship detail`

**patterns — What are my biggest life challenges?** — FIX: **74/100** (D/P/U/R/E/C: 29/19/11/5/7/3)

> Your main cross-life challenge is balancing defined responsibility and standards at work with warm attention and time for your own interests in close relationships. These needs come from separate chart areas, so meeting one does not automatically meet the other. Answer detail: In close relationships, the day sign 午 points to warm attention and time for your own interests. Friction can grow when the support offered differs from the support you actually want. Practical point: At work, check whether the recognised responsibility and clear standards role gives you time and authority for its daily demands. In a close relationship, name when you need warm attention and time for your own interests.

**Finding:** Directly names a life challenge, but overlaps with career and relationship content already used in Q3 and Q5. Practical advice repeats those topics instead of identifying a distinct recurring pressure pattern.

**Code target:** `src/report/purchase-narrative.ts — life-challenges answer and practical point`

**q-turning-points — When may my life change direction?** — FIX: **78/100** (D/P/U/R/E/C: 29/18/12/6/9/4)

> The clearest year to review a major change is 2026: a theme of finding new customers connects with close relationships and personal choices. This is a calculated timing signal for those areas, not a prediction that an event will happen. Answer detail: Review how work demands, shared time and personal choices fit together. Practical point: Separate a possible work change from a private-life change before treating either as a verdict on your whole life.

**Finding:** Provides a specific calculated year and caveats that it is not an event prediction. It is framed as a time to review rather than a clear directional answer, and supporting text repeats earlier work/relationship themes.

**Code target:** `src/report/purchase-timing-sections.ts — turning-point answer and follow-up`

#### Profile 4 — 2001-02-08 (known birth time), Asia/Seoul

Source PDF: `04-complete.pdf`. Profile score: **81.7/100**.

**personality — What kind of person am I?** — FIX: **84/100** (D/P/U/R/E/C: 30/21/12/7/9/5)

> Your core style is seeing connections and exploring options. Your birth-day sign is 壬 (Yang Water); it points to this tendency, not a complete definition of you. Answer detail: A recurring life theme is the difference between what others rely on you for and what restores you privately. The public work position carries specialist knowledge and independent thought; the private-life position adds practised skills and dependable results. The two areas call for different responses, so professional achievement alone may not meet a private need.

**Finding:** Direct identity conclusion is present and tied to the day stem. Supporting paragraph shifts into a broad work/private-life pattern that partly repeats across profiles; explain the personality link more clearly.

**Code target:** `src/report/chart-depth.ts — life-area depth paragraph`

**social — What helps me thrive, and what can hold me back?** — FIX: **85/100** (D/P/U/R/E/C: 31/20/12/8/9/5)

> You may be good at connecting ideas. When one route is blocked, you can often see another. This comes from your birth-day sign 壬 (Yang Water); it describes a tendency, not your whole personality. Answer detail: The pressure point is this: Every new option can look worth trying. You may keep exploring without choosing what to do today.

**Finding:** Names a personal strength and limit in plain language. Profiles 2–5 repeat nearly identical day-stem wording, so personalization is weaker when other chart differences do not affect this answer.

**Code target:** `src/report/purchase-narrative.ts — complete personality/strength narrative`

**career — What kind of career suits me?** — FIX: **87/100** (D/P/U/R/E/C: 32/22/13/7/8/5)

> Your best fit combines researching a narrow problem or developing a specialist solution with enough time for making, teaching or delivering something to a dependable standard. For example, being hired for the first while your whole week is consumed by the second would leave the role poorly matched. This comes from comparing the two different roles in your birth month, not from your job title. Answer detail: Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.

**Finding:** Gives a chart-specific work fit. The phrase “being hired for the first” is awkward, and the same job-change advice appears across profiles instead of adding individual evidence.

**Code target:** `src/report/purchase-narrative.ts — career answer and repeated keep-work advice`

**money — What is my natural pattern for earning money?** — FIX: **84/100** (D/P/U/R/E/C: 30/19/12/9/9/5)

> Project, customer or deal-based income has the clearest chart support; a fixed-pay route is less directly marked. This can suit commercial work, but income is easier to keep steady when payment terms and delivery are settled first. In your chart, deal-based income signs appear in wider contacts and private life and work. This shows where the income markers appear, not how much you will earn. Answer detail: Your chart links money across your life with a usable skill and paying customers. Both the work you produce and a pattern linked with earning and managing money appear in the checked route. This describes how income may be earned; it does not tell us how much you will keep.

**Finding:** P1 and P5 say the chart cannot choose an earning route, then repeat that same absence in the same answer and again in the detail. P2–P4 give a route, but the detail partly restates the evidence without adding much usefulness.

**Code target:** `src/report/purchase-narrative.ts — moneyAnswer/visibleMoneyExplanation; src/report/chart-depth.ts — moneyDepth`

**love — What do I need most in a close relationship?** — FIX: **80/100** (D/P/U/R/E/C: 31/20/12/6/8/3)

> You are most likely to feel secure with someone who makes room for a chance for both people to make choices. In everyday life, look for people who welcome ideas and share decisions. This describes what helps you; it does not predict another person's character. Answer detail: Conflict can develop when moving ahead before the other person has agreed. Your chart links this pattern to 寅, the day sign used to read close relationships. It also points to a need for room to explore and a clear next step; that is separate from what helps you feel secure with a partner.

**Finding:** Names a concrete relationship need and a likely friction point. The second sentence restates the need as advice; Q6 repeats much of the same need. “Day sign” and the Han character are not explained in everyday English.

**Code target:** `src/report/purchase-narrative.ts — relationship answer; src/report/chart-depth.ts — relationship detail`

**patterns — What are my biggest life challenges?** — FIX: **74/100** (D/P/U/R/E/C: 29/19/11/5/7/3)

> Your main cross-life challenge is balancing specialist research and independent problem-solving at work with a chance for both people to make choices in close relationships. These needs come from separate chart areas, so meeting one does not automatically meet the other. Answer detail: In close relationships, the day sign 寅 points to a chance for both people to make choices. Friction can grow when the support offered differs from the support you actually want. Practical point: At work, check whether the specialist knowledge and independent thought role gives you time and authority for its daily demands. In a close relationship, name when you need a chance for both people to make choices.

**Finding:** Directly names a life challenge, but overlaps with career and relationship content already used in Q3 and Q5. Practical advice repeats those topics instead of identifying a distinct recurring pressure pattern.

**Code target:** `src/report/purchase-narrative.ts — life-challenges answer and practical point`

**q-turning-points — When may my life change direction?** — FIX: **78/100** (D/P/U/R/E/C: 29/18/12/6/9/4)

> The clearest year to review a major change is 2028: a theme of demanding targets and decisive action connects with work and daily responsibilities and close relationships and personal choices. This is a calculated timing signal for those areas, not a prediction that an event will happen. Answer detail: Review how work demands, shared time and personal choices fit together. Practical point: Separate a possible work change from a private-life change before treating either as a verdict on your whole life.

**Finding:** Provides a specific calculated year and caveats that it is not an event prediction. It is framed as a time to review rather than a clear directional answer, and supporting text repeats earlier work/relationship themes.

**Code target:** `src/report/purchase-timing-sections.ts — turning-point answer and follow-up`

#### Profile 5 — 1969-12-03 (unknown birth time), Asia/Kolkata

Source PDF: `05-complete.pdf`. Profile score: **76.6/100**.

**personality — What kind of person am I?** — FIX: **84/100** (D/P/U/R/E/C: 30/21/12/7/9/5)

> Your core style is seeing connections and exploring options. Your birth-day sign is 壬 (Yang Water); it points to this tendency, not a complete definition of you. Answer detail: A recurring life theme is the difference between what others rely on you for and what restores you privately. The public work position carries expression and improving a method; the private-life position adds contacts, competition and shared resources. The two areas call for different responses, so professional achievement alone may not meet a private need.

**Finding:** Direct identity conclusion is present and tied to the day stem. Supporting paragraph shifts into a broad work/private-life pattern that partly repeats across profiles; explain the personality link more clearly.

**Code target:** `src/report/chart-depth.ts — life-area depth paragraph`

**social — What helps me thrive, and what can hold me back?** — FIX: **85/100** (D/P/U/R/E/C: 31/20/12/8/9/5)

> You may be good at connecting ideas. When one route is blocked, you can often see another. This comes from your birth-day sign 壬 (Yang Water); it describes a tendency, not your whole personality. Answer detail: The pressure point is this: Every new option can look worth trying. You may keep exploring without choosing what to do today.

**Finding:** Names a personal strength and limit in plain language. Profiles 2–5 repeat nearly identical day-stem wording, so personalization is weaker when other chart differences do not affect this answer.

**Code target:** `src/report/purchase-narrative.ts — complete personality/strength narrative`

**career — What kind of career suits me?** — FIX: **87/100** (D/P/U/R/E/C: 32/22/13/7/8/5)

> Your best fit combines diagnosing a problem and improving the method or explaining the solution with enough time for owning a specialist assignment from start to finish. For example, being hired for the first while your whole week is consumed by the second would leave the role poorly matched. This comes from comparing the two different roles in your birth month, not from your job title. Answer detail: Before changing jobs, ask what you will do each week, which decisions you control and what you will be paid. Move when those terms improve the part of work that is causing pressure.

**Finding:** Gives a chart-specific work fit. The phrase “being hired for the first” is awkward, and the same job-change advice appears across profiles instead of adding individual evidence.

**Code target:** `src/report/purchase-narrative.ts — career answer and repeated keep-work advice`

**money — What is my natural pattern for earning money?** — FIX: **48/100** (D/P/U/R/E/C: 16/9/7/2/9/5)

> Your chart does not show a direct money sign in the checked placements. It therefore cannot choose a salary or business route for you; work skills and real contract terms carry more weight. No direct money sign appears in the checked positions, so the reading does not assign you a fixed-pay or deal-based route. Answer detail: There is no direct money sign in the checked outward or inner roles. Your work pattern is still readable, but a claim about strong wealth luck would go beyond these facts.

**Finding:** P1 and P5 say the chart cannot choose an earning route, then repeat that same absence in the same answer and again in the detail. P2–P4 give a route, but the detail partly restates the evidence without adding much usefulness.

**Code target:** `src/report/purchase-narrative.ts — moneyAnswer/visibleMoneyExplanation; src/report/chart-depth.ts — moneyDepth`

**love — What do I need most in a close relationship?** — FIX: **80/100** (D/P/U/R/E/C: 31/20/12/6/8/3)

> You are most likely to feel secure with someone who makes room for time to think before a difficult conversation. In everyday life, look for people who respect a pause and return to the conversation. This describes what helps you; it does not predict another person's character. Answer detail: Conflict can develop when going quiet without saying when you will talk again. Your chart links this pattern to 子, the day sign used to read close relationships. It also points to a need for room to explore and a clear next step; that is separate from what helps you feel secure with a partner.

**Finding:** Names a concrete relationship need and a likely friction point. The second sentence restates the need as advice; Q6 repeats much of the same need. “Day sign” and the Han character are not explained in everyday English.

**Code target:** `src/report/purchase-narrative.ts — relationship answer; src/report/chart-depth.ts — relationship detail`

**patterns — What are my biggest life challenges?** — FIX: **74/100** (D/P/U/R/E/C: 29/19/11/5/7/3)

> Your main cross-life challenge is balancing creative improvement and problem-solving at work with time to think before a difficult conversation in close relationships. These needs come from separate chart areas, so meeting one does not automatically meet the other. Answer detail: In close relationships, the day sign 子 points to time to think before a difficult conversation. Friction can grow when the support offered differs from the support you actually want. Practical point: At work, check whether the ideas, expression and improving a method role gives you time and authority for its daily demands. In a close relationship, name when you need time to think before a difficult conversation.

**Finding:** Directly names a life challenge, but overlaps with career and relationship content already used in Q3 and Q5. Practical advice repeats those topics instead of identifying a distinct recurring pressure pattern.

**Code target:** `src/report/purchase-narrative.ts — life-challenges answer and practical point`

**q-turning-points — When may my life change direction?** — FIX: **78/100** (D/P/U/R/E/C: 29/18/12/6/9/4)

> The clearest year to review a major change is 2026: a theme of finding new customers connects with close relationships and personal choices. This is a calculated timing signal for those areas, not a prediction that an event will happen. Answer detail: Pay attention to shared time, personal choices and expectations in close relationships. Practical point: Separate a possible work change from a private-life change before treating either as a verdict on your whole life.

**Finding:** Provides a specific calculated year and caveats that it is not an event prediction. It is framed as a time to review rather than a clear directional answer, and supporting text repeats earlier work/relationship themes.

**Code target:** `src/report/purchase-timing-sections.ts — turning-point answer and follow-up`

## Product 01 revision priorities

1. Remove repeated “no direct money sign” wording from the Product 01 money answer and make the evidence limit one concise statement. Where possible, state the chart-supported income pattern; when the chart does not support a route, say so once and do not imply an absence of earning ability.
2. Separate the main life challenge (Q6) from the already-covered career fit (Q3) and relationship need (Q5); lead with a distinct pressure pattern, then connect only the relevant chart evidence.
3. Replace repeated generic follow-up advice with profile-linked evidence or remove it. Clarify awkward English such as “being hired for the first.”
4. Recheck all five profiles through `issueReport()` and re-score after any code change. No content fix or retest is claimed in this audit.

## Remaining audit work

Products 02–07 have not yet been independently scored in this file. Their existing automated diagnostics remain separate from human content review. No product is marked complete until every profile mean is at least 95 and its PDF answers are verified.


## Product 01 code revision and verification (2026-11-08)

The baseline scores above apply to the original five audit PDFs only. They are not post-fix scores.

- **Income answer:** removed the repeated “no direct money sign” explanation from the no-route answer. It now states once that the chart does not establish salary versus deal-based income and directs the reader to actual skills and contract terms. The supporting no-marker passage now avoids repeating that missing-marker rationale and only states that the report cannot measure income amount or capacity.
- **Life challenge answer:** separated Q6 from the standalone relationship-needs answer. The Q6 body now focuses on balancing chart-linked work demands with an individual private-life need; its practical line no longer repeats the relationship explanation.
- **TOC regression:** corrected the Product 01 PDF test from five to seven expected TOC destinations. All seven official question links resolve to report pages.
- **Tests:** narrative and chart-depth suites passed 26/26. The real paid `issueReport()` Product 01 generation test passed 1/1 and generated five PDFs. TypeScript `tsc -b --pretty false` passed. One initial run exposed the stale five-link assertion; after updating it to the approved seven-question count, the PDF test passed.
- **Independent post-fix re-score:** not yet completed. The five regenerated PDFs were generated with different test profiles from the original audit set, so they do not replace or revise the baseline scores. Product 01 remains **FAIL**, not 95+.
- **Remaining audit:** Products 02–07 (210 answers) have not been independently scored.


## Product 01 post-fix targeted re-review (2026-11-08)

This is a targeted re-review of two modified answer roles (Q4 and Q6) across the five PDFs generated by the current `issueReport()` test. These five profiles are not the same as the baseline audit profiles above. Ten answers were read and independently scored. This is **not** a complete post-fix profile score and does not replace the original 35-answer baseline.

| Test profile | Q4 money | Q6 life challenge |
|---|---:|---:|
| 1 — New York, known time | 87 | 90 |
| 2 — Seoul, known time | 84 | 90 |
| 3 — New York, unknown time | 87 | 90 |
| 4 — Sydney, known time | 87 | 89 |
| 5 — Los Angeles, known time | 85 | 89 |

All 10 targeted answers remain below 95. Q4 is more direct, but its supporting explanation still repeats the distinction between earning and retaining money. Q6 is now distinct in its main answer, while the practical line reuses the same private need and the answer still touches Q5's subject. Product 01 therefore remains **FAIL**. Scores are human content judgments under the same rubric; no diagnostic score is substituted.

### Profile 1 — new-york-known
**money — What is my natural pattern for earning money? — 87/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 32/23/12/6/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. In your chart, deal-based income signs appear in work and private life; steady-income signs appear in wider contacts and work. This shows where the income markers appear, not how much you will earn.  Answer detail: Your lifetime money pattern contains a pull between earning more and maintaining the base that supports you. The outward money and learning-and-support signs appear together. Financial activity can grow while time or funds are also needed for skills, dependable help or existing responsibilities; money coming in and room to keep it are separate themes. 

**Finding:** Income route is answered and chart placements are named, but the follow-up repeats the income/base distinction and remains broad.

**life-challenges — What are my biggest life challenges? — 90/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 33/23/13/7/9/5)**

> Answer: Your main life challenge is keeping the demands of customer growth and business development work from crowding out being heard before someone offers a solution in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When work or private commitments increase, check whether your week still has room for being heard before someone offers a solution. 

**Finding:** Direct and individualized life challenge; the practical line repeats the named private need and this still overlaps the relationship answer's underlying need.

### Profile 2 — seoul-known
**money — What is my natural pattern for earning money? — 84/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 32/20/11/7/9/5)**

> Answer: Regular work or repeat fees have the clearest chart support. Variable projects may add income, but the chart gives less direct support to depending on them as your only route. In your chart, steady-income signs appear in longer-term plans. This shows where the income markers appear, not how much you will earn.  Answer detail: The earning signs are present inside the branches, rather than in the main outward roles. The money reading therefore follows the less visible work behind your role; it does not treat the absence of an outward sign as an absence of income. 

**Finding:** Income route is answered and chart placements are named, but the follow-up repeats the income/base distinction and remains broad.

**life-challenges — What are my biggest life challenges? — 90/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 33/23/13/7/9/5)**

> Answer: Your main life challenge is keeping the demands of reliable products and repeatable service work from crowding out warm attention and time for your own interests in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When work or private commitments increase, check whether your week still has room for warm attention and time for your own interests. 

**Finding:** Direct and individualized life challenge; the practical line repeats the named private need and this still overlaps the relationship answer's underlying need.

### Profile 3 — new-york-unknown
**money — What is my natural pattern for earning money? — 87/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 32/23/12/6/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. In your chart, deal-based income signs appear in work and private life; steady-income signs appear in wider contacts and work. This shows where the income markers appear, not how much you will earn.  Answer detail: Your lifetime money pattern contains a pull between earning more and maintaining the base that supports you. The outward money and learning-and-support signs appear together. Financial activity can grow while time or funds are also needed for skills, dependable help or existing responsibilities; money coming in and room to keep it are separate themes. 

**Finding:** Income route is answered and chart placements are named, but the follow-up repeats the income/base distinction and remains broad.

**life-challenges — What are my biggest life challenges? — 90/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 33/23/13/7/9/5)**

> Answer: Your main life challenge is keeping the demands of customer growth and business development work from crowding out being heard before someone offers a solution in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When work or private commitments increase, check whether your week still has room for being heard before someone offers a solution. 

**Finding:** Direct and individualized life challenge; the practical line repeats the named private need and this still overlaps the relationship answer's underlying need.

### Profile 4 — sydney-known
**money — What is my natural pattern for earning money? — 87/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 32/22/12/7/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. In your chart, steady-income signs appear in work and private life; deal-based income signs appear in longer-term plans. This shows where the income markers appear, not how much you will earn.  Answer detail: Your chart links money across your life with a usable skill and paying customers. Both the work you produce and a pattern linked with earning and managing money appear in the checked route. This describes how income may be earned; it does not tell us how much you will keep. 

**Finding:** Income route is answered and chart placements are named, but the follow-up repeats the income/base distinction and remains broad.

**life-challenges — What are my biggest life challenges? — 89/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 33/22/13/7/9/5)**

> Answer: Your main life challenge is keeping the demands of operations and resource management work from crowding out time to share a feeling without being rushed in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When work or private commitments increase, check whether your week still has room for time to share a feeling without being rushed. 

**Finding:** Direct and individualized life challenge; the practical line repeats the named private need and this still overlaps the relationship answer's underlying need.

### Profile 5 — los-angeles-known
**money — What is my natural pattern for earning money? — 85/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 32/21/12/6/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements. In your chart, steady-income signs appear in private life and work; deal-based income signs appear in private life. This shows where the income markers appear, not how much you will earn.  Answer detail: Your lifetime money pattern contains a pull between earning more and maintaining the base that supports you. The outward money and learning-and-support signs appear together. Financial activity can grow while time or funds are also needed for skills, dependable help or existing responsibilities; money coming in and room to keep it are separate themes. 

**Finding:** Income route is answered and chart placements are named, but the follow-up repeats the income/base distinction and remains broad.

**life-challenges — What are my biggest life challenges? — 89/100 (POST-FIX REVIEW; targeted answer only; D/P/U/R/E/C 33/22/13/7/9/5)**

> Answer: Your main life challenge is keeping the demands of operations and resource management work from crowding out warm attention and time for your own interests in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When work or private commitments increase, check whether your week still has room for warm attention and time for your own interests. 

**Finding:** Direct and individualized life challenge; the practical line repeats the named private need and this still overlaps the relationship answer's underlying need.


## Product 01 second targeted revision and re-review (2026-11-08)

Three targeted improvements were applied after the previous 10-answer re-review: (1) the career-fit example now names the visible and daily tasks instead of saying “the first” and “the second”; (2) the income-marker sentence no longer repeats the income-amount caveat; (3) the Q6 practical line now protects a specific weekly private-life time block without repeating the stated relationship need.

The following scores come from reading the five final regenerated `issueReport()` PDFs. They cover Q4 and Q6 only, not the other five answers in each profile. Breakdown order: D/P/U/R/E/C.

| Test profile | Q4 money score | Q6 life challenge score |
|---|---:|---:|
| 1 — New York, known time | 89 (32/23/12/8/9/5) | 93 (34/23/13/9/9/5) |
| 2 — Seoul, known time | 84 (31/20/11/8/9/5) | 93 (34/23/13/9/9/5) |
| 3 — New York, unknown time | 89 (32/23/12/8/9/5) | 93 (34/23/13/9/9/5) |
| 4 — Sydney, known time | 88 (32/22/12/8/9/5) | 92 (34/22/13/9/9/5) |
| 5 — Los Angeles, known time | 87 (32/21/12/8/9/5) | 92 (34/22/13/9/9/5) |

**Finding:** the language and role separation improved, but every targeted answer is still below 95. Q4's supporting paragraph still returns to the difference between money coming in and money retained. Q6's practical step is distinct and readable but remains a fairly general time-protection action. These are targeted answer scores only; a complete post-fix seven-answer profile mean has not been measured. Product 01 remains **FAIL**.

The latest test run passed the focused narrative/chart/role suites (32/32) and the real paid `issueReport()` Product 01 generator (1/1; five PDFs, seven titles/answers, seven valid contents links). TypeScript verification is recorded separately in the project status. Structural diagnostic values are not these content scores.


## Product 01 third targeted re-review (2026-11-08)

After revision 3, five actual `issueReport()` PDFs were regenerated. I read the two changed answer roles in each PDF (10 answer instances) and applied the same six-part rubric. The five fixtures are `new-york-known`, `seoul-known`, `new-york-unknown`, `sydney-known`, and `los-angeles-known`. They are a separate fixture set from the original 35-answer audit; these ten scores do not create a full profile mean.

| Profile | Q4 money | Q6 life challenge |
|---|---:|---:|
| 1 — New York, known time | 93 | 94 |
| 2 — Seoul, known time | 90 | 94 |
| 3 — New York, unknown time | 93 | 94 |
| 4 — Sydney, known time | 89 | 93 |
| 5 — Los Angeles, known time | 93 | 93 |

The score range improved from revision 2's Q4 84–89 and Q6 92–93 to Q4 89–93 and Q6 93–94. **Every reviewed answer remains below 95.** Q4 is more concise and now separates the direct income-route conclusion from the chart evidence, but one profile still has a broad hidden-marker explanation and another has a general skill-to-customer link. Q6's action is now tied to the chart's work theme and the private-life tradeoff; it is still not specific enough to earn 95. Product 01 remains **FAIL**; full post-fix evaluation of all seven answers per profile is still pending.

### Test profile 1 — new-york-known
**Q4 — What is my natural pattern for earning money? — 93/100 (D/P/U/R/E/C 34/23/14/8/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements.  Answer detail: Your chart places earning signs beside learning-and-support signs in outward roles. This links your income pattern to the skills, tools and help needed to deliver the work; the chart does not measure your pay or profit. 

**Q6 — What are my biggest life challenges? — 94/100 (D/P/U/R/E/C 34/24/14/8/9/5)**

> Answer: Your main life challenge is keeping the demands of customer growth and business development work from crowding out being heard before someone offers a solution in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When customer growth and business development demands increase, name one private commitment you will protect before accepting another duty. 

### Test profile 2 — seoul-known
**Q4 — What is my natural pattern for earning money? — 90/100 (D/P/U/R/E/C 33/22/12/9/9/5)**

> Answer: Regular work or repeat fees have the clearest chart support. Variable projects may add income, but the chart gives less direct support to depending on them as your only route.  Answer detail: The earning signs are present inside the branches, rather than in the main outward roles. The money reading therefore follows the less visible work behind your role; it does not treat the absence of an outward sign as an absence of income. 

**Q6 — What are my biggest life challenges? — 94/100 (D/P/U/R/E/C 34/24/14/8/9/5)**

> Answer: Your main life challenge is keeping the demands of reliable products and repeatable service work from crowding out warm attention and time for your own interests in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When reliable products and repeatable service demands increase, name one private commitment you will protect before accepting another duty. 

### Test profile 3 — new-york-unknown
**Q4 — What is my natural pattern for earning money? — 93/100 (D/P/U/R/E/C 34/23/14/8/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements.  Answer detail: Your chart places earning signs beside learning-and-support signs in outward roles. This links your income pattern to the skills, tools and help needed to deliver the work; the chart does not measure your pay or profit. 

**Q6 — What are my biggest life challenges? — 94/100 (D/P/U/R/E/C 34/24/14/8/9/5)**

> Answer: Your main life challenge is keeping the demands of customer growth and business development work from crowding out being heard before someone offers a solution in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When customer growth and business development demands increase, name one private commitment you will protect before accepting another duty. 

### Test profile 4 — sydney-known
**Q4 — What is my natural pattern for earning money? — 89/100 (D/P/U/R/E/C 33/22/12/8/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements.  Answer detail: Your chart links money across your life with a usable skill and paying customers. Both the work you produce and a pattern linked with earning and managing money appear in the checked route. This describes how income may be earned; it does not tell us how much you will keep. 

**Q6 — What are my biggest life challenges? — 93/100 (D/P/U/R/E/C 34/23/13/9/9/5)**

> Answer: Your main life challenge is keeping the demands of operations and resource management work from crowding out time to share a feeling without being rushed in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When operations and resource management demands increase, name one private commitment you will protect before accepting another duty. 

### Test profile 5 — los-angeles-known
**Q4 — What is my natural pattern for earning money? — 93/100 (D/P/U/R/E/C 34/23/14/8/9/5)**

> Answer: Your chart supports both regular income and more variable earnings from customers, projects or deals. This fits a dependable base with selected paid work on the side; which one becomes larger depends on your actual work and agreements.  Answer detail: Your chart places earning signs beside learning-and-support signs in outward roles. This links your income pattern to the skills, tools and help needed to deliver the work; the chart does not measure your pay or profit. 

**Q6 — What are my biggest life challenges? — 93/100 (D/P/U/R/E/C 34/23/13/9/9/5)**

> Answer: Your main life challenge is keeping the demands of operations and resource management work from crowding out warm attention and time for your own interests in your private life. The chart places these in separate areas, so success in one does not automatically meet the other need.  Answer detail: When operations and resource management demands increase, name one private commitment you will protect before accepting another duty. 


## Product 01 fourth targeted re-review and fifth revision (2026-11-08)

I regenerated five Product 01 reports through the paid `issueReport()` test path and read the current Q4 and Q6 answers in each output. This is 10 targeted answer observations only; it is not a complete profile score. Scores below use D/P/U/R/E/C (directness 35, personalization 25, usefulness 15, repetition 10, easy English 10, consistency 5).

| Profile | Q4 /100 (D/P/U/R/E/C) | Q6 /100 (D/P/U/R/E/C) |
|---|---:|---:|
| New York, known time | 91 (34/23/13/7/9/5) | 94 (34/24/14/9/8/5) |
| Seoul, known time | 87 (33/21/12/8/8/5) | 92 (34/23/13/9/8/5) |
| New York, unknown time | 91 (34/23/13/7/9/5) | 94 (34/24/14/9/8/5) |
| Sydney, known time | 90 (34/22/13/7/9/5) | 92 (34/23/13/9/8/5) |
| Los Angeles, known time | 91 (34/23/13/7/9/5) | 92 (34/23/13/9/8/5) |

### What changed after this review

The re-review found that Q4 still explained the work/support pattern at length after already naming the income routes. Q6's action was a generic instruction to reserve private time. I shortened the Q4 chart explanation and changed the Q6 action to ask which existing duty a new work task would replace and who would cover it. Q6's conclusion was also shortened to a direct work/private balance statement. These are source changes, not score adjustments.

The five PDFs generated by the final run contain these actual answers:

- Q4, New York known: “Your chart supports both regular income and more variable earnings from customers, projects or deals.” The detail lists steady-pay signs in wider contacts/work/daily duties and project/customer signs in work/daily duties/private life, then links the route to skills and help used at work.
- Q4, Seoul: “Regular work or repeat fees have the clearest chart support.” The detail says the markers are inside the branches and the route is less visible in daily work.
- Q4, Sydney: both regular and variable income routes are stated; the detail links work output to paying customers and says the chart cannot estimate pay.
- Q6, New York known: “Your main challenge is balancing customer growth and business development work with your need for being heard before someone offers a solution in private life.” Its action asks what current responsibility the next task replaces and who will cover that work.
- Q6, Sydney: the work pressure is operations/resource management, and the private need is time to share a feeling without being rushed; its action asks what current duty the next task replaces.

The updated wording is more concise and the Q6 practical action is tied to a concrete workload decision. The current Q4 answers still have awkward or dense chart-location wording, and several profile variants share identical copy because the relevant chart evidence is the same. Q4's highest current score is 91; Q6's highest is 94. **Neither targeted role reaches 95, and Product 01 remains FAIL.** The five complete seven-answer profile means have not been re-scored after this revision. Products 02–07 remain unscored independently.

Verification after this source change: four focused test files passed, 35/35 tests; `npx tsc -b --pretty false` passed; the actual Product 01 `issueReport()` generation test passed and regenerated five PDFs with seven questions and seven valid contents destinations per report. Structural diagnostics were 100, 70, 100, 100, 100; the 70 reflects partial calculation verification for the unknown-time test profile and is not a content score.


## Product 01 post-fix full PDF re-review (2026-11-08)

- Review source: five Product 01 PDFs generated from application code `eec3511f527fce48a5bca4d5f29f6b1035114b34`; all 35 actual PDF answer blocks were extracted and reviewed. Full per-answer text, six rubric components, deductions, and code locations are in `docs/audits/PRODUCT01-FULL-INDEPENDENT-REVIEW-eec3511.json`.
- Rubric: direct answer 35, personalization 25, specificity/usefulness 15, repetition/generic advice 10, easy English 10, chart-evidence consistency 5. Each profile score is the arithmetic mean of its seven answer totals; the gate is profile mean >=95. Individual answer totals range down to 94 and are not all 95+.
- Profile means: P1 95.3, P2 95.0, P3 95.3, P4 95.1, P5 95.1. This is an independent review of the generated PDF text, not an automated diagnostic score. P2's separate calculation-verification diagnostic is `partial`; this was not changed or treated as a content score.
- User-provided previous baseline: 85.3, 84.4, 85.3, 83.6, 83.4. The new PDFs use named test fixtures; baseline fixture identity was not established as identical, so differences are indicative only.
- PDF checks: five files, seven official questions and seven valid TOC links each; page counts are 24, 24, 24, 25, 25. Extracted text has zero replacement characters and zero black-square glyphs. Final summary and Destiny Card connection are present; visual checks sampled representative report and final pages, not every page.
- Verification on code SHA `eec3511f527fce48a5bca4d5f29f6b1035114b34`: focused tests 31/31 passed; `npx tsc -b --pretty false` passed; Product 01 PDF generation test passed and emitted five PDFs. No Preview deployment was performed for this request. Production remains `dpl_ANDdUkvMn6zMjukCyxfNC2EYcSdt`; sales remain closed; Stripe Live unchanged.
- Next: continue Product 01 content improvement only if reviewing the per-answer deductions; preserve the same rubric and fixtures, then regenerate PDFs and re-review. Do not claim all individual answers score >=95.
