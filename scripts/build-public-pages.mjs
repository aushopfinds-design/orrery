import { build } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const outDir=resolve('node_modules/.cache/fate-public-pages')
await build({logLevel:'warn',build:{ssr:'src/publishing/build-pages.ts',outDir,emptyOutDir:true,rollupOptions:{output:{entryFileNames:'build-pages.mjs'}}}})
await import(pathToFileURL(resolve(outDir,'build-pages.mjs')).href)
