import { createHash } from 'node:crypto'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { buildCompleteReading, REPORT_EDITION } from '../../src/report/complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from '../../src/report/category-readings.ts'
import { plainReadingText } from '../../src/report/reading-text.ts'
import { previewProduct } from '../../src/report/personal-products.ts'
import { orderInput } from '../payments/input.ts'
import { ReviewError } from './config.ts'

export interface ReviewBlock { id: string; english: string }
export interface ReviewDocument { id: string; title: string; english: string; blocks: ReviewBlock[] }
/** The existing English builders are the sole source. Korean never recalculates a chart. */
export function buildReview(value: unknown, referenceYear = new Date().getUTCFullYear()) {
  let input
  try { input = orderInput(value) } catch { throw new ReviewError('invalid_review_input') }
  const a = calculateSaju(input.first), b = input.second ? calculateSaju(input.second) : undefined
  let sources: { title: string; fullText: string }[]
  if (input.kind === 'complete') sources = [buildCompleteReading(a, referenceYear)]
  else if (input.kind === 'bundle') {
    const bundle = buildBundleReading(a, b!, input.year!, referenceYear)
    sources = [bundle.complete, bundle.compatibility, bundle.annual]
  } else sources = [buildCategoryReading(input.kind, a, { second: b, year: input.year ?? referenceYear })]
  const documents: ReviewDocument[] = sources.map((source, d) => {
    const english = plainReadingText(source.fullText)
    return { id: `document-${d + 1}`, title: source.title, english,
      blocks: english.split('\n\n').map((text, i) => ({ id: `${d + 1}.${i + 1}`, english: text })) }
  })
  const digest = createHash('sha256').update(JSON.stringify({ edition: REPORT_EDITION, referenceYear, input, documents })).digest('hex')
  return { kind: input.kind, title: previewProduct(input.kind).title, edition: REPORT_EDITION, referenceYear, digest,
    documents, charts: [a, ...(b ? [b] : [])] }
}
