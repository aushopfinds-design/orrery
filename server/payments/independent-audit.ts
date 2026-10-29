import { gunzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'
import type { BirthInput, SajuResult } from '../../packages/core/src/types.ts'
import { auditCustomerBirth } from '../../src/report/customer-audit.ts'

/** Runs only in the server runtime. Failures and slow responses preserve the existing Orrery reading. */
let engineModule: Promise<{ calculateSaju: (request: unknown) => unknown }> | undefined
function independentEngine() {
  engineModule ??= readFile(new URL('../vendor/oh-my-saju.js.gz', import.meta.url)).then(gunzipSync).then(bytes =>
    import(`data:text/javascript;base64,${bytes.toString('base64')}`),
  )
  return engineModule
}

export async function auditBirthInput(input: BirthInput, existing: SajuResult) {
  try {
    const engine = await independentEngine()
    return await auditCustomerBirth(input, existing, engine.calculateSaju)
  } catch {
    return undefined
  }
}
