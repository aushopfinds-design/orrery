import { categoryInfo } from './category-catalog.ts'
import type { FocusCategory } from './category-catalog.ts'
import { reportPrice } from './pricing.ts'
import { ACTIVE_PRODUCT_KINDS } from './pricing.ts'
import type { ActiveProductKind } from './pricing.ts'

export type PreviewKind = 'complete' | FocusCategory | 'bundle'
export const PREVIEW_KINDS: ActiveProductKind[] = [...ACTIVE_PRODUCT_KINDS]
export const LEGACY_PREVIEW_KINDS: PreviewKind[] = ['love']
export const ALL_REPORT_KINDS: PreviewKind[] = [...PREVIEW_KINDS, ...LEGACY_PREVIEW_KINDS]
export function isPreviewKind(value: string): value is PreviewKind { return ALL_REPORT_KINDS.includes(value as PreviewKind) }
export function isActiveProductKind(value: string): value is ActiveProductKind { return PREVIEW_KINDS.includes(value as ActiveProductKind) }
export function previewHash(kind: PreviewKind = 'complete') { return kind === 'complete' ? '#my-report' : `#my-report-${kind}` }
export function checkoutHash(kind: PreviewKind = 'complete') { return previewHash(kind) + '-checkout' }
export function resolvePreviewKind(hash: string): PreviewKind | undefined {
  if (hash.endsWith('-checkout')) hash = hash.slice(0, -9)
  if (hash === '#my-report') return 'complete'
  const kind = hash.replace(/^#my-report-/, '')
  return hash.startsWith('#my-report-') && isPreviewKind(kind) ? kind : undefined
}
export const PRODUCT_SUBTITLES: Record<PreviewKind, string> = {
  complete: 'Complete Life Reading', year: 'Next 12 Months Reading', compatibility: 'Relationship Reading',
  career: 'Career & Money Reading', love: 'Personal Love Reading', bundle: 'Complete Reading Package',
  business: 'Business & Entrepreneurship Reading', wellbeing: 'Personality & Five-Element Reading',
}
const DESCRIPTIONS: Record<PreviewKind, string> = {
  complete: 'Discover your personality, strengths, and life path.',
  year: 'Explore the next twelve calendar months, month by month.',
  compatibility: 'Discover your relationship strengths and challenges.',
  career: 'Explore your career strengths and money patterns.',
  love: 'Explore your love life and future relationship patterns.',
  bundle: 'Get all five readings in one complete package.',
  business: 'Explore your approach to starting something, choosing an offer, sharing decisions and keeping promises to customers.',
  wellbeing: 'Notice everyday patterns in effort, boundaries and support.',
}
export function previewProduct(kind: PreviewKind) {
  if (kind === 'complete') return { subtitle: PRODUCT_SUBTITLES[kind], title: 'My Life', description: DESCRIPTIONS[kind], price: reportPrice(kind), sample: '#sample-report', chapters: 10, icon: 'personality' }
  if (kind === 'bundle') return { subtitle: PRODUCT_SUBTITLES[kind], title: 'Complete Package', description: DESCRIPTIONS[kind], price: reportPrice(kind), sample: '#complete-bundle-sample', chapters: 5, icon: 'patterns' }
  const info = categoryInfo(kind)
  return { subtitle: PRODUCT_SUBTITLES[kind], title: kind === 'year' ? 'Your Next 12 Months' : info.title, description: DESCRIPTIONS[kind], price: reportPrice(kind), sample: `#${info.slug}-sample`, chapters: { compatibility: 8, year: 6, career: 7, love: 7, business: 7, wellbeing: 5 }[kind], icon: info.icon }
}

