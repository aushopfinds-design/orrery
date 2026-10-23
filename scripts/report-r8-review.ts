/** Reproducible fictional samples. Run with bun; no network, orders or translation provider. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { calculateSaju } from '../packages/core/src/saju.ts'
import { buildCompleteReading } from '../src/report/complete-reading.ts'
import { buildCategoryReading, buildBundleReading } from '../src/report/category-readings.ts'
import { CATEGORY_SCENARIOS } from '../src/report/category-catalog.ts'
const target = process.argv[2] ?? 'docs/report-r8-review'
mkdirSync(target, { recursive: true })
const scenario = CATEGORY_SCENARIOS[0]
const a = calculateSaju(scenario.first), b = calculateSaju(scenario.second)
const reports = {
  complete: buildCompleteReading(a, 2026),
  compatibility: buildCategoryReading('compatibility', a, { second: b, year: 2026 }),
  year: buildCategoryReading('year', a, { year: 2027 }),
  career: buildCategoryReading('career', a, { year: 2026 }),
  business: buildCategoryReading('business', a, { year: 2026 }),
  wellbeing: buildCategoryReading('wellbeing', a, { year: 2026 }),
  bundle: buildBundleReading(a, b, 2027, 2026),
}
const titles = { complete: 'Complete', compatibility: 'Compatibility', year: 'Year', career: 'Career', business: 'Business', wellbeing: 'Wellbeing', bundle: 'Bundle' }
const manifest = { edition: '2026.10-r8', referenceYear: 2026, annualYear: 2027, inputs: scenario, reports: Object.entries(reports).map(([kind, report]) => ({ kind, words: report.wordCount })) }
writeFileSync(`${target}/sample-manifest.json`, JSON.stringify(manifest, null, 2) + '\n')
writeFileSync(`${target}/all-seven-en.md`, '# All seven paid reports — English review copy\n\nFictional sample. See sample-manifest.json for the exact birth inputs.\n\n' + Object.entries(reports).map(([kind, report]) => `# ${titles[kind as keyof typeof titles]}\n\n${report.fullText}`).join('\n\n---\n\n') + '\n')
// Machine-readable selected passages for the authored Korean review excerpts.
writeFileSync(`${target}/selected-passages.json`, JSON.stringify(Object.fromEntries(Object.entries(reports).map(([kind, report]) => {
  if (kind === 'bundle') { const bundle = reports.bundle; return [kind, { english: [bundle.overview.paragraphs[1], bundle.overview.paragraphs[2], bundle.overview.paragraphs[3]], evidence: 'Person A life + A/B compatibility + Person A 2027 annual; shared appendix once.' }] }
  const solo = report as typeof reports.complete | typeof reports.year
  const timing = 'actionPlan' in solo ? solo.actionPlan : solo.kind === 'year' ? solo.months[0] : solo.chapters.find(item => /chapters|support-each-other|balance-week/.test(item.id))!
  return [kind, { english: [solo.chapters[0].lead, ...(kind === 'complete' ? [solo.chapters.find(x => x.id === 'money')!.lead] : []), timing.lead], evidence: solo.chapters[0].evidence }]
})), null, 2) + '\n')
console.log(JSON.stringify(manifest.reports))
