/**
 * Optional independent calculation comparison.
 * Run after building Oh My Saju locally:
 * OH_MY_SAJU_DIST=/absolute/path/to/oh-my-saju/dist/index.js node scripts/compare-oh-my-saju.mjs
 * Never runs in production and never changes checkout or report output.
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const dist = process.env.OH_MY_SAJU_DIST;
if (!dist) {
  console.error('Set OH_MY_SAJU_DIST to the locally built Oh My Saju dist/index.js');
  process.exitCode = 2;
} else {
  const { calculateSaju } = await import(pathToFileURL(resolve(dist)).href);
  const fixtures = [
    { id: 'ny-1998', birth: { date: { calendar: 'gregorian', year: 1998, month: 3, day: 25 }, time: { hour: 3, minute: 0 }, timeZone: 'America/New_York' } },
    { id: 'seoul-1980-unknown', birth: { date: { calendar: 'gregorian', year: 1980, month: 3, day: 25 }, timeZone: 'Asia/Seoul' } },
    { id: 'sydney-2000', birth: { date: { calendar: 'gregorian', year: 2000, month: 1, day: 1 }, time: { hour: 12, minute: 0 }, timeZone: 'Australia/Sydney' } },
  ];
  const results = [];
  for (const fixture of fixtures) {
    try {
      const result = calculateSaju({ birth: fixture.birth, rules: { ziHourPolicy: 'civilMidnight', dayHourClock: { kind: 'civil' } } });
      results.push({ id: fixture.id, status: 'ok', pillars: result.pillars, calculationBasis: result.rules ?? null });
    } catch (error) {
      results.push({ id: fixture.id, status: 'error', error: String(error) });
    }
  }
  console.log(JSON.stringify({ source: 'Oh My Saju', fixtureCount: results.length, results }, null, 2));
  if (results.some(x => x.status === 'error')) process.exitCode = 1;
}
