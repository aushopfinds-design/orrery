# Your Life, Your Destiny — Life Reading v2

Status: CONTENT SPECIFICATION ONLY. No runtime changes, no deployment.

## Purpose
Answer a buyer's questions about their life patterns, work, money, relationships, turning points, and the next decade using traceable traditional Saju interpretation, written in accessible English.

## Data integrity gates
- Determine the four pillars from validated birth date, time, birthplace timezone, DST and solar-term boundaries.
- When birth time is unknown, omit hour pillar, hour-dependent claims and unsupported certainty.
- Interpret day master, seasonal strength, hidden stems, ten gods, relevant combinations/clashes, decade luck and annual luck contextually.
- Every customer-facing claim must carry an internal evidence record: input feature(s), interpretation rule ID, confidence/limitations.
- Do not invent numerically precise 'luck scores' or imply that future outcomes are guaranteed.

## Report sections (customer-facing English)
1. **Your Life at a Glance** — concise, specific opening answer and 3 key themes.
2. **Your Saju Chart Explained** — birth pillars (only known pillars), day master and readable element explanation.
3. **Your Natural Strengths and Challenges** — behavioral tendencies tied to the actual chart.
4. **Your Career and Money** — preferred working/income patterns, opportunity and risk, with supporting ten-god and luck-cycle rationale.
5. **Love and Relationships** — chart-specific relationship patterns without deterministic promises.
6. **The Turning Points in Your Life** — actual decade-luck transitions, dated using the calculation engine.
7. **Your Next Ten Years** — year-by-year distinct observations, no copy-paste filler; explain where evidence is weak.
8. **Your Personal Life Summary** — 3 decisive takeaways, key time windows, concise next steps.

## Visual requirements
- Four Pillars table (three pillars if time unknown), with clear plain-English labels.
- Five Elements breakdown: declare exact calculation method; avoid presenting counts as destiny scores.
- Ten Gods relationship diagram: show only meaningful derived relationships.
- Ten-year luck timeline: exact calculated start/end dates; chart is categorical/annotated, not an unsupported numeric prediction.
- Annual outlook table with key interactions and short evidence explanations.
- All graphics readable on mobile and in PDF, with text alternatives.

## Writing pattern for every major claim
**Direct answer** → **Why your chart suggests this** → **What it could mean in everyday life** → **When the pattern may be emphasized** → **In short**.

Use natural English, not jargon-heavy translated Korean. Define any essential technical term once. No generic financial advice masquerading as Saju analysis. No invented birth-time detail.

## Validation / acceptance
- Verify against 20 diverse birth charts and at least 5 unknown-time cases.
- Confirm distinct readings for different charts and distinct purposes across seven products.
- Independently test solar terms, leap dates, DST and cross-border time zones.
- Check HTML, mobile, PDF and sandbox purchase-to-delivery end-to-end.
- Keep this specification in preview branch; no live deployment or live Stripe activation without explicit authorization.
