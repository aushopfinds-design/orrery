/// <reference types="node" />
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { CHART_GLOSSARY } from '../src/report/calculation-notes.ts'
import { writeFileSync } from 'node:fs'
import { calculateSaju } from '../packages/core/src/saju.ts'
import { CATEGORY_SCENARIOS, FOCUS_CATALOG } from '../src/report/category-catalog.ts'
import { buildCategoryReading, buildBundleReading } from '../src/report/category-readings.ts'
import { buildCompleteReading, buildFreeReading, REPORT_EDITION } from '../src/report/complete-reading.ts'
import { buildReadingBrief } from '../src/report/reading-brief.ts'
import { subject } from '../src/report/category-shared.ts'
import { SYMBOL_NOTE, SYMBOL_SOURCES } from '../src/report/report-extras.ts'
import { homepageCopy } from '../src/i18n/homepage.ts'

const outputPath = resolve(process.argv[2] ?? 'node_modules/.cache/fate-samples/sample-content.json')
mkdirSync(dirname(outputPath), { recursive: true })
const referenceYear = 2026
const annualYear = 2027
const samples = CATEGORY_SCENARIOS.map((scenario, index) => {
  const first = calculateSaju(scenario.first)
  const second = calculateSaju(scenario.second)
  const complete = buildCompleteReading(first, referenceYear)
  const completeReport = { ...complete, kind: 'complete', subjects: [subject(first, 'Example birth details')], brief: buildReadingBrief(complete.chapters[0], undefined, complete.focus) }
  const free = buildFreeReading(first)
  const love = complete.chapters.find(chapter => chapter.id === 'love')!
  const freeReport = { ...free, kind: 'free', referenceYear, subjects: [subject(first, 'Example birth details')], relationship: { title: 'Love & Relationships', lead: love.lead, paragraphs: [love.paragraphs[0]], evidence: love.evidence } }
  const focused = FOCUS_CATALOG.map(info => {
    const report = buildCategoryReading(info.kind, first, { second: info.kind === 'compatibility' ? second : undefined, year: info.kind === 'year' ? annualYear : referenceYear })
    return { ...report, scope: info.scope, brief: buildReadingBrief(report.chapters[0], undefined, report.focus) }
  })
  const bundle = buildBundleReading(first, second, annualYear, referenceYear)
  return { id: scenario.id, label: scenario.label, index, inputs: { first: scenario.first, second: scenario.second }, reports: [freeReport, ...focused, completeReport], bundle: { title: 'Complete Bundle', kind: 'bundle', fullText: bundle.fullText, wordCount: bundle.wordCount } }
})
const payload = { edition: REPORT_EDITION, exportedOn: '16 October 2026', referenceYear, annualYear, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceDirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()), glossary: CHART_GLOSSARY, symbolNote: SYMBOL_NOTE, symbolSources: SYMBOL_SOURCES, copy: homepageCopy, samples }
writeFileSync(outputPath, JSON.stringify(payload, null, 2))
console.log(JSON.stringify(samples.map(item => ({ id: item.id, reports: item.reports.map(r => ({ kind: r.kind, words: 'wordCount' in r ? r.wordCount : null, chapters: 'chapters' in r ? r.chapters.length : 0, months: 'months' in r ? r.months.length : 0 })), bundleWords: item.bundle.wordCount }))))
