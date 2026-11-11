import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const roots = ['src', 'server']
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const forbiddenFragments = [
  'Warning: truncated output',
  'tokens truncated',
  'Output exceeded available model context',
]
const requiredFragments = [
  'export const BUYER_OUTLINES',
  'export const BUYER_QUESTIONS',
  'export function applyBuyerQuestions',
  "question.role === 'closeness-vs-routine'",
  "question.role === 'mutual-adjustment'",
  'export function buyerOutline',
]

async function visit(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await visit(file))
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(file)
  }
  return files
}

const files = (await Promise.all(roots.map(visit))).flat()
const problems = []
for (const file of files) {
  const content = await readFile(file, 'utf8')
  for (const fragment of forbiddenFragments) {
    if (content.includes(fragment)) problems.push(`${file}: contains a truncated-tool-output marker`)
  }
}

const outlinePath = 'src/report/buyer-outline.ts'
const outline = await readFile(outlinePath, 'utf8')
for (const fragment of requiredFragments) {
  if (!outline.includes(fragment)) problems.push(`${outlinePath}: missing required section marker: ${fragment}`)
}

if (problems.length) {
  console.error('Source integrity check failed:')
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}
console.log(`Source integrity check passed (${files.length} source files scanned).`)
