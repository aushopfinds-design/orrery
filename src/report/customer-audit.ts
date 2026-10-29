import type { BirthInput, SajuResult } from '@orrery/core/types'
import { calculateIndependentAudit } from './independent-personalization.ts'
import engineArchiveUrl from '../../server/vendor/oh-my-saju.js.gz?url'

/** Uses the locally bundled Oh My Saju engine; birth details are never sent to a third party. */
export function auditCustomerBirth(input: BirthInput, existing: SajuResult, calculateIndependent: (request: unknown) => unknown) {
  const clock = input.timezone === 'Asia/Seoul'
    ? { kind: 'civil' }
    : { kind: 'local-apparent-solar', ...(typeof input.longitude === 'number' ? { longitudeDegreesEast: input.longitude } : {}), equationOfTime: 'apply' as const }
  return calculateIndependentAudit(input, [3, 2, 1, 0].map(index => existing.pillars[index]?.pillar.ganzi ?? null), () => calculateIndependent({
    birth: {
      date: { calendar: 'gregorian', year: input.year, month: input.month, day: input.day },
      time: { hour: input.unknownTime ? 12 : input.hour, minute: input.unknownTime ? 0 : input.minute },
      timeZone: input.timezone ?? 'Asia/Seoul',
    },
    rules: { ziHourPolicy: 'ziStart', dayHourClock: clock },
  }), Boolean(input.unknownTime))
}

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
