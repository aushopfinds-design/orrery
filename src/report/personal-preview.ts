import { buildFreeGlimpse } from './free-glimpse.ts'
import type { ReadingElement } from './reading.ts'
import { previewProduct } from './personal-products.ts'
import type { PreviewKind } from './personal-products.ts'
import { normalizePreviewBirth } from '../utils/preview-draft.ts'
import type { PreviewDraft } from '../utils/preview-draft.ts'
import type { Locale } from '../i18n/store.ts'

const LOCKED_QUESTIONS = [
  'What does your chart reveal about your money and career?',
  'What relationship patterns shape your love life?',
  'When could important changes appear in your life?',
  'What personal challenges may be holding you back?',
]
const LOCKED_QUESTIONS_KO = [
  '내 사주가 돈과 직업에 대해 알려주는 것은 무엇일까요?',
  '내 연애에는 어떤 관계 패턴이 있을까요?',
  '삶에 중요한 변화는 언제 찾아올 수 있을까요?',
  '나를 가로막는 개인적인 어려움은 무엇일까요?',
]
const PRODUCT_TITLES_KO: Record<PreviewKind, string> = {
  complete: '나의 삶과 운명', year: '앞으로 12개월 리딩', compatibility: '관계 리딩', career: '직업과 재물 리딩',
  love: '나의 연애 리딩', bundle: '운명 종합 패키지', business: '사업과 창업 리딩', wellbeing: '성격과 오행 리딩',
}

export interface PersonalPreview {
  title: string
  birthSummary: string
  personality: string
  strength: string
  symbol: { element: ReadingElement; elementLabel?: string; colors: { name: string; hex: string }[]; numbers: [number, number] }
  lockedQuestions: string[]
  needsPartner: boolean
  timeUnknown: boolean
}

/** Builds a deliberately small free response. Paid readings are never generated here. */
export function buildPersonalPreview(kind: PreviewKind, draft: PreviewDraft, locale: Locale = 'en'): PersonalPreview {
  const first = normalizePreviewBirth(draft.first)
  if (!first) throw new Error('Valid birth details and a birthplace time zone are needed')
  const glimpse = buildFreeGlimpse(first, locale)
  const needsPartner = (kind === 'compatibility' || kind === 'bundle') && !normalizePreviewBirth(draft.second)
  return {
    title: locale === 'ko' ? PRODUCT_TITLES_KO[kind] : previewProduct(kind).title,
    ...glimpse,
    lockedQuestions: [...(locale === 'ko' ? LOCKED_QUESTIONS_KO : LOCKED_QUESTIONS)],
    needsPartner,
    timeUnknown: Boolean(first.unknownTime),
  }
}

/** Plain-text export contains only the same brief free content shown on screen. */
export function personalPreviewText(preview: PersonalPreview, locale: Locale = 'en'): string {
  if (preview.needsPartner) throw new Error('Complete the birth details before saving a preview')
  if (locale === 'ko') return [
    'THE FATE KEY · 무료 개인 미리보기', preview.title, preview.birthSummary,
    preview.timeUnknown ? '출생 시간을 알 수 없어 시주를 바탕으로 한 해석은 포함하지 않았습니다.' : '',
    '타고난 성격', preview.personality,
    '가장 큰 타고난 강점', preview.strength,
    '나를 상징하는 색과 숫자', `${preview.symbol.elementLabel ?? preview.symbol.element} · ${preview.symbol.colors.map(color => color.name).join(', ')} · ${preview.symbol.numbers.join(', ')}`,
    '나의 운명 전체 살펴보기', ...preview.lockedQuestions.map(question => `🔒 ${question}`),
    '살짝 엿보셨나요? 이제 전체 그림을 확인해 보세요.',
    '전체 맞춤 리포트에서는 태어난 사주를 바탕으로 가장 궁금한 질문에 명확히 답해 드립니다.',
  ].filter(Boolean).join('\n\n')
  return [
    'THE FATE KEY · FREE PERSONAL PREVIEW', preview.title, preview.birthSummary,
    preview.timeUnknown ? 'Birth time unknown; hour-based interpretation is not included.' : '',
    'Your Natural Personality', preview.personality,
    'Your Greatest Natural Strength', preview.strength,
    'Your Symbolic Colours & Numbers', `${preview.symbol.elementLabel ?? preview.symbol.element} · ${preview.symbol.colors.map(color => color.name).join(', ')} · ${preview.symbol.numbers.join(', ')}`,
    'Discover Your Full Destiny', ...preview.lockedQuestions.map(question => `🔒 ${question}`),
    'You\'ve Seen a Glimpse. Now Discover the Full Picture.',
    'Your full personal reading explores the questions that matter most to you — with clear answers based on your birth chart.',
  ].filter(Boolean).join('\n\n')
}
