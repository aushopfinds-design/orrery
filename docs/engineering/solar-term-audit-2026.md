# Solar-term calculation update

Status: implemented on the preview branch; not a production release.

## What changed

- Replaced the repeating mean-term minute table with generated astronomical instants for 24 solar terms per year.
- Supported birth years are 1900–2100. The generated table also includes adjacent years needed for the first/last supported year's neighboring terms.
- Year pillar changes at Li Chun. Month pillar changes at the twelve month-opening terms.
- Korea uses KST wall-clock time. For non-Seoul births, the term instant is translated to local apparent solar time using the same longitude and equation-of-time model as the birth-time conversion.
- Daewoon start calculations now use the same term source and clock basis as the chart.
- Term timestamps are rounded to the nearest minute because birth input and the Korean almanac reference are minute precision.
- Rebuild the committed data with `bun run --cwd packages/core generate:solar-terms`.

The table is generated from the pinned `lunar-javascript` dependency. The generator converts its China Standard Time values to UTC; the runtime then converts each instant into the chart's clock basis. The engine no longer has a single-year Li Chun exception.

## Verification

- KASI's official 2026 almanac lists all 24 terms to the minute in KST. The generated engine values match all 24.
- The 1900–2100 regression test checks all 2,412 month-opening boundaries: the month pillar changes at the boundary minute, and the year pillar also changes at Li Chun.
- A separate overseas-longitude test checks month rollover in apparent solar time.
- Existing timezone, DST, unknown-time, and Daewoon tests were rerun after changing the term source.
- Final verification: 871 tests passed across 65 files; `bun run build` succeeded.

## Limits

- Independent official term-time tables were checked for 2026. The 1900–2100 transition sweep validates engine consistency against the generated table, not 2,412 independent government almanac entries.
- Historical ephemeris accuracy outside the independently checked year remains dependent on `lunar-javascript`'s astronomy implementation.
- International apparent-solar-time handling uses the repository's existing equation-of-time approximation. The rollover mechanics are tested, but per-city results have not been exhaustively compared with official local almanacs.
- Birth years outside 1900–2100 now fail explicitly instead of silently using an extrapolated mean-term estimate.

## Sources

- KASI, 2026 Almanac / 24 solar terms: https://astro.kasi.re.kr/kor/life/post/calendarData?year=2026
- KASI, announcement of the 2026 almanac: https://www.kasi.re.kr/kor/post/newsMaterial/32031
- Hong Kong Observatory, 2026 Almanac: https://www.hko.gov.hk/en/gts/astron2026/files/HKO_almanac_2026.pdf
- Hong Kong Observatory, solar-term data basis and Hong Kong time: https://www.weather.gov.hk/en/gts/astronomy/Solar_Term.htm

Production deployment: not performed.
