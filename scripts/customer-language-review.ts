import { mkdirSync, writeFileSync } from 'node:fs'
import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading } from '../src/report/complete-reading.ts'
import { buildCategoryReading } from '../src/report/category-readings.ts'
import { CATEGORY_SCENARIOS } from '../src/report/category-catalog.ts'
const folder = 'docs/report-r12-review'
mkdirSync(folder, { recursive: true })
const a = calculateSaju(CATEGORY_SCENARIOS[0].first), b = calculateSaju(CATEGORY_SCENARIOS[0].second)
const reports = [buildCompleteReading(a, 2026), ...(['compatibility', 'year', 'career', 'business', 'wellbeing'] as const).map(kind => buildCategoryReading(kind, a, { year: kind === 'year' ? 2027 : 2026, second: kind === 'compatibility' ? b : undefined }))]
const jargon = /\b(?:stem|branch|natal|exposed|principal|output relationship|money relationship|reference layers|ten-year cycle|structural|friction signal|conservative rule)\b/gi
const stats = reports.map(r => { const prose = r.chapters.flatMap(c => [c.lead, ...c.paragraphs]).join('\n\n'); return { title: r.title, words: prose.split(/\s+/).length, difficultTerms: prose.match(jargon)?.length ?? 0, paragraphs: r.chapters.reduce((n, c) => n + 1 + c.paragraphs.length, 0), prose } })
writeFileSync(`${folder}/${process.env.FATE_LANGUAGE_BEFORE === '1' ? 'before' : 'after'}-stats.json`, JSON.stringify(stats, null, 2) + '\n')
console.log(JSON.stringify(stats.map(s => ({ title: s.title, words: s.words, difficultTerms: s.difficultTerms, paragraphs: s.paragraphs }))))
