# Solar-term boundary audit — 2026

Status: investigation note; not a production accuracy sign-off.

## Scope

This compares the current core engine's legacy calcSolarTerms ingress estimate with solar-term instants exposed by the installed lunar-javascript library. The library displays these values in China Standard Time (UTC+8); comparison below converts them to Korea Standard Time (UTC+9). The library is an independent software comparison, not the authority for this audit.

To make the core return the ingress already in force, the query was made after each ingress date. Earlier exploratory output compared some terms to the previous ingress because the query instant was still before the event; that output must not be read as the same-event comparison.

## Findings

| 2026 ingress | Core estimate (KST) | Library value (CST → KST) | Core minus comparison |
|---|---:|---:|---:|
| Li Chun, Feb 4 | 04:38 | 04:02:08 → 05:02:08 | −24m |
| Jing Zhe, Mar 5 | 22:41 | 21:59 → 22:59 | −18m |
| Qing Ming, Apr 5 | 03:33 | 02:40 → 03:40 | −7m |
| Li Xia, May 5 | 20:56 | 19:48:44 → 20:48:44 | +7m |
| Mang Zhong, Jun 6 | 01:09 | Jun 5 23:48:21 → Jun 6 00:48:21 | +21m |
| Xiao Shu, Jul 7 | 11:26 | 09:56:57 → 10:56:57 | +29m |
| Li Qiu, Aug 7 | 21:13 | 19:42:43 → 20:42:43 | +30m |
| Bai Lu, Sep 7 | Sep 8 00:05 | Sep 7 22:41:16 → 23:41:16 | +24m |
| Han Lu, Oct 8 | 15:41 | 14:29:17 → 15:29:17 | +12m |
| Li Dong, Nov 7 | 18:48 | 17:52:05 → 18:52:05 | −4m |
| Da Xue, Dec 7 | 11:38 | 10:52:32 → 11:52:32 | −15m |

The comparison suggests errors of several to about 30 minutes for these sampled ingress estimates. It does not establish errors for every year or every term. The core's special Li Chun correction is only in pillar-index calculation; calcSolarTerms still derives dates from a mean-term table. Therefore the correction does not make the returned ingress timestamp exact and can leave the pillar boundary and displayed term/Daewoon timing inconsistent near the event.

## Independent reference

The Hong Kong Observatory's 2026 Almanac lists 24 solar terms in Hong Kong time and states that its astronomical data are based on HM Nautical Almanac Office and US Naval Observatory data. Its 2026 Li Chun is 04:02 HKT (05:02 KST). The current core Li Chun estimate of 04:38 is 24 minutes early.

- https://www.hko.gov.hk/en/gts/astron2026/files/HKO_almanac_2026.pdf
- https://www.weather.gov.hk/en/gts/astronomy/Solar_Term.htm

## Required before changing the engine

1. Build a source-backed term-time fixture for a broad year range, preserving source time zones and precision.
2. Compare all 12 month-opening terms (and the mid-terms used by luck-cycle calculations) across representative years, including leap years.
3. Define supported year range and behavior outside it.
4. Resolve the existing KST, local civil time, and solar-time conversion boundaries; do not add a fixed one-hour offset to birthplace-local inputs.
5. Recalculate Daewoon start dates and rerun transition tests after adopting an ephemeris.
6. Until then, do not describe term timestamps or term-based Daewoon starts as independently verified.

## Verification status

- Independent primary reference checked: 2026 Li Chun, Hong Kong Observatory.
- Software comparison checked: 2026 month-opening terms, lunar-javascript, with CST-to-KST conversion.
- Full 100+ boundary matrix: NOT VERIFIED.
- Multi-year official term table: NOT VERIFIED.
- Engine correction: NOT IMPLEMENTED in this note.
- Production deployment: NOT performed.
