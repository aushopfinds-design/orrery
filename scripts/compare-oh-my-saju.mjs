/** Independent, opt-in comparison; no production imports or side effects.
 * First build Oh My Saju locally. From the orrery root:
 * OH_MY_SAJU_DIST=/absolute/path/oh-my-saju/dist/index.js node scripts/compare-oh-my-saju.mjs
 * The script requires a locally built @orrery/core package as well.
 * Results are diagnostic only: different clock/solar-term/zi-hour policies can legitimately disagree.
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const dist = process.env.OH_MY_SAJU_DIST;
if (!dist) { console.error('OH_MY_SAJU_DIST must point to the built Oh My Saju dist/index.js'); process.exit(2); }
const { calculateSaju: external } = await import(pathToFileURL(resolve(dist)).href);
const { calculateSaju: existing } = await import('@orrery/core/saju');
const fixtures = [["ny-1998",1998,3,25,3,0,"America/New_York"],["seoul-1980",1980,3,25,12,0,"Asia/Seoul"],["sydney-2000",2000,1,1,12,0,"Australia/Sydney"],["seoul-1992",1992,10,24,5,30,"Asia/Seoul"],["ny-dst-spring",2024,3,10,3,30,"America/New_York"],["ny-dst-fall",2024,11,3,2,30,"America/New_York"],["sydney-dst",2024,10,6,3,30,"Australia/Sydney"],["london-dst",2024,3,31,2,30,"Europe/London"],["seoul-lichun",2024,2,4,17,30,"Asia/Seoul"],["seoul-midnight",2001,8,12,0,10,"Asia/Seoul"],["seoul-zi",2001,8,12,23,30,"Asia/Seoul"],["tokyo-1970",1970,6,1,11,0,"Asia/Tokyo"],["la-1988",1988,12,31,22,0,"America/Los_Angeles"],["auckland-2005",2005,7,20,8,0,"Pacific/Auckland"],["paris-1999",1999,9,9,9,9,"Europe/Paris"],["seoul-2000",2000,2,29,12,0,"Asia/Seoul"],["seoul-2020",2020,1,25,13,0,"Asia/Seoul"],["toronto-1990",1990,5,15,7,5,"America/Toronto"],["singapore-2010",2010,10,10,10,10,"Asia/Singapore"],["seoul-1987",1987,7,1,12,0,"Asia/Seoul"]];
const stems = Object.fromEntries([... '갑을병정무기경신임계'].map((k,i)=>[k,[...'甲乙丙丁戊己庚辛壬癸'][i]]));
const branches = Object.fromEntries([... '자축인묘진사오미신유술해'].map((k,i)=>[k,[...'子丑寅卯辰巳午未申酉戌亥'][i]]));
const toHanja = value => {
  if (typeof value !== 'string' || value.length !== 2) return null;
  return (stems[value[0]] ?? value[0]) + (branches[value[1]] ?? value[1]);
};
const normalized = p => toHanja(p?.hanja ?? p?.korean ?? p?.ganzi ?? p?.pillar?.ganzi ?? null);
const rows = [];
for (const [id,year,month,day,hour,minute,timeZone] of fixtures) {
  try {
    const a = existing({year,month,day,hour,minute,gender:'M',timezone:timeZone});
    const b = external({birth:{date:{calendar:'gregorian',year,month,day},time:{hour,minute},timeZone},rules:{ziHourPolicy:'civilMidnight',dayHourClock:{kind:'civil'}}});
    // Orrery stores hour/day/month/year; normalize to year/month/day/hour.
    const current = [3,2,1,0].map(i=>normalized(a.pillars?.[i]));
    const independent = ['year','month','day','hour'].map(k=>normalized(b.pillars?.[k]));
    // Existing API returns ordered pillars; verify order before interpreting comparisons.
    rows.push({id,timeZone,current,independent,manualReviewRequired:true,exactPillarMatch:current.every((v,i)=>v != null && independent[i] != null && v===independent[i])});
  } catch (e) { rows.push({id,timeZone,error:String(e)}); }
}
console.log(JSON.stringify({count:rows.length,note:'Do not treat differences as errors until pillar order, UTC normalization, DST and policy are aligned.',rows},null,2));
if (rows.some(r=>r.error)) process.exitCode=1;
