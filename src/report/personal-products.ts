import { categoryInfo } from './category-catalog.ts'
import type { FocusCategory } from './category-catalog.ts'
import { reportPrice } from './pricing.ts'

export type PreviewKind = 'complete' | FocusCategory | 'bundle'
export const PREVIEW_KINDS: PreviewKind[] = ['complete', 'compatibility', 'year', 'career', 'business', 'wellbeing', 'bundle']
export function isPreviewKind(value: string): value is PreviewKind { return PREVIEW_KINDS.includes(value as PreviewKind) }
export function previewHash(kind: PreviewKind = 'complete') { return kind === 'complete' ? '#my-report' : `#my-report-${kind}` }
export function checkoutHash(kind: PreviewKind = 'complete') { return previewHash(kind) + '-checkout' }
export function resolvePreviewKind(hash: string): PreviewKind | undefined {
  if (hash.endsWith('-checkout')) hash = hash.slice(0, -9)
  if (hash === '#my-report') return 'complete'
  const kind = hash.replace(/^#my-report-/, '')
  return hash.startsWith('#my-report-') && isPreviewKind(kind) ? kind : undefined
}
export const PRODUCT_SUBTITLES = { complete: 'Complete Life Reading', compatibility: 'Love Compatibility Reading', year: 'Annual Fortune Reading', career: 'Career & Wealth Reading', business: 'Business & Entrepreneurship Reading', wellbeing: 'Personality & Five-Element Reading', bundle: 'Life, Love & Annual Reading Collection' } as const
export function previewProduct(kind: PreviewKind) {
  if (kind === 'complete') return { subtitle: PRODUCT_SUBTITLES[kind], title: 'Your Life, Your Destiny', price: reportPrice(kind), sample: '#sample-report', chapters: 9, icon: 'personality' }
  if (kind === 'bundle') return { subtitle: PRODUCT_SUBTITLES[kind], title: 'Your Destiny Collection', price: reportPrice(kind), sample: '#complete-bundle-sample', chapters: 3, icon: 'patterns' }
  const info = categoryInfo(kind)
  return { subtitle: PRODUCT_SUBTITLES[kind], title: kind === 'year' ? 'What Awaits You This Year?' : info.title, price: reportPrice(kind), sample: `#${info.slug}-sample`, chapters: { compatibility: 8, year: 6, career: 7, business: 7, wellbeing: 5 }[kind], icon: info.icon }
}

