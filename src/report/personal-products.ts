import { categoryInfo } from './category-catalog.ts'
import type { FocusCategory } from './category-catalog.ts'
import { reportPrice } from './pricing.ts'
import { ACTIVE_PRODUCT_KINDS } from './pricing.ts'
import type { ActiveProductKind } from './pricing.ts'
import { BUYER_QUESTIONS, COLLECTION_BUYER_QUESTIONS } from './buyer-outline.ts'

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
  complete: 'Your Life, Your Destiny', year: 'Your Next 12 Months', compatibility: 'Are We Meant to Be?',
  career: 'Your Career, Money & Success', love: 'Personal Love Reading', bundle: 'Your Complete Destiny',
  business: 'Born to Build a Business?', wellbeing: 'The Real You: Strengths & Weaknesses',
}
const DESCRIPTIONS: Record<PreviewKind, string> = {
  complete: 'Discover your personality, strengths, and life path.',
  year: 'Explore the next twelve calendar months, month by month.',
  compatibility: 'Discover your relationship strengths and challenges.',
  career: 'Explore your career strengths and money patterns.',
  love: 'Explore your love life and future relationship patterns.',
  bundle: 'Get an integrated 10-question reading across life, relationships, work and timing.',
  business: 'Explore your approach to starting something, choosing an offer, sharing decisions and keeping promises to customers.',
  wellbeing: 'Notice everyday patterns in effort, boundaries and support.',
}
export function previewProduct(kind: PreviewKind) {
  if (kind === 'complete') return { subtitle: PRODUCT_SUBTITLES[kind], title: 'Your Life, Your Destiny', description: DESCRIPTIONS[kind], price: reportPrice(kind), sample: '#sample-report', chapters: 10, questions: BUYER_QUESTIONS.complete.length, icon: 'personality' }
  if (kind === 'bundle') return { subtitle: PRODUCT_SUBTITLES[kind], title: 'Your Complete Destiny', description: DESCRIPTIONS[kind], price: reportPrice(kind), sample: '#complete-bundle-sample', chapters: 10, questions: COLLECTION_BUYER_QUESTIONS.complete!.length, icon: 'patterns' }
  const info = categoryInfo(kind)
  return { subtitle: PRODUCT_SUBTITLES[kind], title: kind === 'year' ? 'Your Next 12 Months' : info.title, description: DESCRIPTIONS[kind], price: reportPrice(kind), sample: `#${info.slug}-sample`, chapters: { compatibility: 8, year: 6, career: 7, love: 7, business: 7, wellbeing: 5 }[kind], questions: BUYER_QUESTIONS[kind].length, icon: info.icon }
}

export function buyerQuestionTitles(kind: PreviewKind) {
  // These are the printed headings in the integrated collection PDF. Keep this
  // display-only list aligned with the PDF without changing report generation.
  if (kind === 'bundle') return [
    'What kind of person are you at your core?',
    'Which strengths help you most, and what can get in your way?',
    'What kind of work is the best fit for you?',
    'How are you most likely to earn and manage money?',
    'What do you need from a close relationship?',
    'How do you and your partner fit together?',
    'What recurring challenge deserves your attention?',
    'What should you know about the next 12 months?',
    'When could a longer-term life or work shift deserve attention?',
    'How do these parts of your life connect?',
  ]
  // The category PDF pages have a buyer-led order that differs from the
  // source chapter order. This display-only list mirrors the printed PDFs.
  if (kind === 'compatibility') return [
    'What makes us compatible?',
    'Why are we attracted to each other?',
    'What tends to cause friction between us?',
    'How do we express love differently?',
    'How do emotional closeness and everyday compatibility differ?',
    'Which upcoming periods may affect our relationship themes?',
    'What does this connection ask of each of us?',
  ]
  if (kind === 'year') return [
    'What is the overall theme of my next 12 months?',
    'What should I focus on most this year?',
    'What does it suggest for money?',
    'What does this period suggest for my career?',
    'What does it suggest for love?',
    'Which months have more supportive chart relationships?',
    'Which months require closer attention?',
  ]
  if (kind === 'business') return [
    'Does my chart support business-oriented traits?',
    'What kind of business work suits me?',
    'Am I better suited to working alone or with partners?',
    'What financial risks should I understand?',
    'When might expansion deserve a closer look?',
    'What do my upcoming cycles suggest about business activity?',
    'What should I be careful about in business?',
  ]
  return BUYER_QUESTIONS[kind].map(question => question.question)
}

/** Localize the product card labels only; report content and checkout data stay unchanged. */
export function localizedPreviewProduct(kind: PreviewKind, locale: string, translate: (key: string) => string) {
  const product = previewProduct(kind)
  if (locale !== 'ko') return { ...product, scope: undefined as string | undefined }
  return {
    ...product,
    title: translate(`site.product.${kind}.title`),
    subtitle: translate(`site.product.${kind}.subtitle`),
    description: translate(`site.product.${kind}.description`),
    scope: translate(`site.product.${kind}.scope`),
  }
}

