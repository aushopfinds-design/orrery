import { build } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const work = resolve('node_modules/.cache/fate-samples')
const content = resolve(work, 'sample-content.json')
const output = resolve(process.argv[2] ?? '../output/pdf')
await build({ logLevel: 'warn', build: { ssr: 'scripts/export-sample-content.ts', outDir: work, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'export-sample-content.mjs' } } } })
process.argv[2] = content
await import(pathToFileURL(resolve(work, 'export-sample-content.mjs')).href)
execFileSync('python3', ['scripts/build-sample-pdfs.py', '--content', content, '--output', output, '--work-dir', work], { stdio: 'inherit' })
execFileSync('python3', ['scripts/check-sample-pdfs.py', '--work-dir', work], { stdio: 'inherit' })
