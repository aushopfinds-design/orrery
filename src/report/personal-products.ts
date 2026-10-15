import { categoryInfo } from './category-catalog.ts'
import type { FocusCategory } from './category-catalog.ts'
import { reportPrice } from './pricing.ts'

export type PreviewKind = 'complete' | FocusCategory | 'bundle'
export const PREVIEW_KINDS: PreviewKind[] = ['complete', 'compatibility', 'year', 'career', 'business', 'wellbeing', 'bundle']
export function isPreviewKind(value: string): value is PreviewKind { return PREVIEW_KINDS.includes(value as PreviewKind) }
export function previewHash(kind: PreviewKind = 'complete') { return kind === 'complete' ? '#my-report' : `#my-report-${kind}` }
export function resolvePreviewKind(hash: string): PreviewKind | undefined {
  if (hash === '#my-report') return 'complete'
  const kind = hash.replace(/^#my-report-/, '')
  return hash.startsWith('#my-report-') && isPreviewKind(kind) ? kind : undefined
}
export function previewProduct(kind: PreviewKind) {
  if (kind === 'complete') return { title: 'Complete Life Reading', price: reportPrice(kind), sample: '#sample-report', chapters: 9, icon: 'personality' }
  if (kind === 'bundle') return { title: 'Complete Bundle', price: reportPrice(kind), sample: '#complete-bundle-sample', chapters: 3, icon: 'patterns' }
  const info = categoryInfo(kind)
  return { title: kind === 'year' ? 'Year Ahead' : info.title, price: reportPrice(kind), sample: `#${info.slug}-sample`, chapters: { compatibility: 8, year: 6, career: 7, business: 7, wellbeing: 5 }[kind], icon: info.icon }
}

