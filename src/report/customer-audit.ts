import type { BirthInput, SajuResult } from '@orrery/core/types'
import { auditCustomerBirth } from './independent-personalization.ts'
import engineArchiveUrl from '../../server/vendor/oh-my-saju.js.gz?url'

export { auditCustomerBirth } from './independent-personalization.ts'

/** Load the same local engine lazily for the buyer preview; it stays out of the initial app bundle. */
export async function auditCustomerBirthLocally(input: BirthInput, existing: SajuResult) {
  const response = await fetch(engineArchiveUrl)
  if (!response.ok) throw new Error('Independent chart check is unavailable')
  const compressed = await response.arrayBuffer()
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))
  const blobUrl = URL.createObjectURL(await new Response(stream).blob())
  try {
    const engine = await import(/* @vite-ignore */ blobUrl) as { calculateSaju: (request: unknown) => unknown }
    return await auditCustomerBirth(input, existing, engine.calculateSaju)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}
