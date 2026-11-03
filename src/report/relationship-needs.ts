/** Editorial groups describe overlap, not a compatibility score. */
export const CARE_NEED: Record<string,string> = {子:'space',巳:'space',寅:'autonomy',酉:'autonomy',丑:'reliability',辰:'reliability',戌:'reliability',午:'attention',卯:'listening',未:'listening',申:'listening',亥:'listening'}
export const sharedCareNeed = (a:string,b:string) => Boolean(CARE_NEED[a] && CARE_NEED[a]===CARE_NEED[b])
