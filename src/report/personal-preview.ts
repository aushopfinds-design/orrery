import { buildFreeGlimpse } from './free-glimpse.ts'
import type { ReadingElement } from './reading.ts'
import { previewProduct } from './personal-products.ts'
import type { PreviewKind } from './personal-products.ts'
import { normalizePreviewBirth } from '../utils/preview-draft.ts'
import type { PreviewDraft } from '../utils/preview-draft.ts'

const LOCKED_QUESTIONS = [
  'What does your chart reveal about your money and career?',
  'What relationship patterns shape your love life?',
  'When could important changes appear in your life?',
  'What personal challenges may be holding you back?',
]

export interface PersonalPreview {
  title: string
  birthSummary: string
  personality: string
  strength: string
  symbol: { element: ReadingElement; colors: { name: string; hex: string }[]; numbers: [number, number] }
  lockedQuestions: string[]
  needsPartner: boolean
  timeUnknown: boolean
}

/** Builds a deliberately small free response. Paid readings are never generated here. */
export function buildPersonalPreview(kind: PreviewKind, draft: PreviewDraft): PersonalPreview {
  const first = normalizePreviewBirth(draft.first)
  if (!first) throw new Error('Valid birth details and a birthplace time zone are needed')
  const glimpse = buildFreeGlimpse(first)
  const needsPartner = (kind === 'compatibility' || kind === 'bundle') && !normalizePreviewBirth(draft.second)
  return {
    title: previewProduct(kind).title,
    ...glimpse,
    lockedQuestions: [...LOCKED_QUESTIONS],
    needsPartner,
    timeUnknown: Boolean(first.unknownTime),
  }
}

/** Plain-text export contains only the same brief free content shown on screen. */
export function personalPreviewText(preview: PersonalPreview): string {
  if (preview.needsPartner) throw new Error('Complete the birth details before saving a preview')
  return [
    'THE FATE KEY · FREE PERSONAL PREVIEW', preview.title, preview.birthSummary,
    preview.timeUnknown ? 'Birth time unknown; hour-based interpretation is not included.' : '',
    'Your Natural Personality', preview.personality,
    'Your Greatest Natural Strength', preview.strength,
    'Your Symbolic Colours & Numbers', `${preview.symbol.element} · ${preview.symbol.colors.map(color => color.name).join(', ')} · ${preview.symbol.numbers.join(', ')}`,
    'Discover Your Full Destiny', ...preview.lockedQuestions.map(question => `🔒 ${question}`),
    'You\'ve Seen a Glimpse. Now Discover the Full Picture.',
    'Your full personal reading explores the questions that matter most to you — with clear answers based on your birth chart.',
  ].filter(Boolean).join('\n\n')
}
