import { readFile, writeFile } from 'node:fs/promises'

type Answer = { title: string; answer: string }
type Report = { profile: number; product: string; questions: Answer[] }
type Manifest = { standardVersion: string; reports: Report[] }

const [beforePath, afterPath, outputPath] = process.argv.slice(2)
if (!beforePath || !afterPath) {
  throw new Error('Usage: bun scripts/compare-report-answers.ts <before.json> <after.json> [diff.md]')
}

const before = JSON.parse(await readFile(beforePath, 'utf8')) as Manifest
const after = JSON.parse(await readFile(afterPath, 'utf8')) as Manifest
const index = (manifest: Manifest) => new Map(manifest.reports.flatMap(report =>
  report.questions.map(question => [`${report.profile}|${report.product}|${question.title}`, question.answer] as const)))
const oldAnswers = index(before)
const newAnswers = index(after)
const keys = [...new Set([...oldAnswers.keys(), ...newAnswers.keys()])].sort()
const changed = keys.filter(key => oldAnswers.get(key) !== newAnswers.get(key))
const added = keys.filter(key => !oldAnswers.has(key))
const removed = keys.filter(key => !newAnswers.has(key))
const lines = [
  '# 35-answer regression comparison',
  '',
  `- Shared standard: ${before.standardVersion} → ${after.standardVersion}`,
  `- Answers compared: ${keys.length}`,
  `- Changed: ${changed.length}; added: ${added.length}; removed: ${removed.length}`,
  '- Editorial review: use the shared checklist in each manifest; automated text comparison does not approve meaning.',
  '',
]
for (const key of changed) {
  lines.push(`## ${key}`, '', `Before: ${oldAnswers.get(key) ?? '(missing)'}`, '', `After: ${newAnswers.get(key) ?? '(missing)'}`, '')
}
for (const key of [...added, ...removed]) lines.push(`- ${added.includes(key) ? 'Added' : 'Removed'}: ${key}`)
const result = lines.join('\n')
if (outputPath) await writeFile(outputPath, result)
process.stdout.write(result)
