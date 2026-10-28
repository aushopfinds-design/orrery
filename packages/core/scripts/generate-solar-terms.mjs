import { writeFile } from 'node:fs/promises'
import { Solar } from 'lunar-javascript'

// lunar-javascript exposes its solar-term table in China Standard Time (UTC+8).
// Store UTC instants so the caller can render each term in KST or local apparent
// solar time without baking one birth location into the data.
const FIRST_YEAR = 1899
const LAST_YEAR = 2101
const TERM_NAMES = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满',
  '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]
const NEXT_CYCLE_NAMES = { 21: 'DONG_ZHI' }

const rows = []
for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
  const table = Solar.fromYmdHms(year, 6, 1, 12, 0, 0).getLunar().getJieQiTable()
  const instants = TERM_NAMES.map((name, index) => {
    name = NEXT_CYCLE_NAMES[index] ?? name
    const solar = table[name]
    if (!solar) throw new Error(`Missing ${name} for ${year}`)
    const [date, time] = solar.toYmdHms().split(' ')
    const [y, m, d] = date.split('-').map(Number)
    const [hour, minute, second] = time.split(':').map(Number)
    return Math.floor((Date.UTC(y, m - 1, d, hour, minute, second) - 8 * 60 * 60 * 1000) / 1000)
  })
  rows.push(`  [${instants.join(', ')}], // ${year}`)
}

const source = `/** Generated with lunar-javascript; UTC Unix seconds, 24 terms per Gregorian year. */
export const SOLAR_TERM_FIRST_YEAR = ${FIRST_YEAR}
export const SOLAR_TERM_LAST_YEAR = ${LAST_YEAR}
export const SOLAR_TERM_NAMES = ${JSON.stringify(TERM_NAMES)} as const
export const SOLAR_TERM_UTC_SECONDS: readonly (readonly number[])[] = [\n${rows.join('\n')}\n]\n`

await writeFile(new URL('../src/solar-term-data.ts', import.meta.url), source)
