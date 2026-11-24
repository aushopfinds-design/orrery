import type { PreviewKind } from './personal-products.ts'
import { previewProduct, buyerQuestionTitles } from './personal-products.ts'
import { productQuestions } from './product-questions.ts'
import type { PreviewDraft } from '../utils/preview-draft.ts'
import { normalizePreviewBirth } from '../utils/preview-draft.ts'
import { calculateSaju } from '@orrery/core/saju'
import { buildTraditionalComplete } from './traditional-reading.ts'
import { buildCategoryReading, buildBundleReading } from './category-readings.ts'
import type { FocusCategory } from './category-catalog.ts'
import type { ReportChapter } from './complete-reading.ts'
import { plainReadingText } from './reading-text.ts'

const PREVIEW_PERCENT = 20

export interface PersonalPreview {
  title: string
  subjects: { label: string; birthSummary: string; dayMaster: string; pillarSummary: string[] }[]
  headline: ''
  brief: null
  applications: never[]
  summary: never[]
  excerpts: { id: string; title: string; icon: string; lead: string; paragraphs: never[]; evidence: never[] }[]
  contents: { id: string; title: string }[]
  monthly: never[]
  needsPartner: boolean
  extras: null
}

type AnswerPassage = { id: string; title: string; text: string }

function words(text: string) { return text.trim().split(/\s+/).filter(Boolean) }

function fitPassage(text: string, limit: number) {
  const tokens = words(text)
  if (tokens.length <= limit) return text
  const candidate = tokens.slice(0, limit).join(' ')
  const sentenceEnds = [...candidate.matchAll(/[.!?](?=\s|$)/g)]
  const sentenceEnd = sentenceEnds.at(-1)?.index
  if (sentenceEnd !== undefined && sentenceEnd > candidate.length * 0.55) return candidate.slice(0, sentenceEnd + 1)
  return candidate.replace(/[,:;—-]+$/, '') + '…'
}

function fromChapters(kind: PreviewKind, chapters: ReportChapter[]): AnswerPassage[] {
  return productQuestions(kind).map((question, index) => {
    const source = question.answerSource.split('.').at(-1)
    const chapter = chapters.find(item => item.id === source || item.id === question.id) ?? chapters[index]
    const text = chapter ? [chapter.lead, ...chapter.paragraphs].filter(Boolean).join('\n\n') : ''
    return { id: question.id, title: question.title, text }
  }).filter(item => item.text.trim().length > 0)
}

function bundlePassages(fullText: string): AnswerPassage[] {
  const block = fullText.split('Your Ten Questions')[1]?.split('Your Included Reports')[0] ?? ''
  const sections = block.split(/\n\n(?=\d{2} · )/).filter(Boolean)
  return productQuestions('bundle').map((question, index) => {
    const answer = sections[index]?.match(/Your Answer:\s*([\s\S]*?)(?=\n\nImportant Timing:|$)/)?.[1]?.trim() ?? ''
    return { id: question.id, title: question.title, text: answer }
  }).filter(item => item.text.length > 0)
}

/** Build the actual chart-based question passages locally, then expose a word-limited 20% excerpt. */
function selectedExcerpts(kind: PreviewKind, draft: PreviewDraft, year: number) {
  const first = normalizePreviewBirth(draft.first)
  if (!first) return []
  const firstChart = calculateSaju(first)
  let passages: AnswerPassage[] = []

  if (kind === 'bundle') {
    const second = normalizePreviewBirth(draft.second)
    if (!second) return []
    const reading = buildBundleReading(firstChart, calculateSaju(second), year)
    passages = bundlePassages(reading.fullText)
  } else if (kind === 'complete') {
    const reading = buildTraditionalComplete(firstChart, year)
    passages = fromChapters(kind, reading.chapters)
  } else {
    const second = draft.second ? normalizePreviewBirth(draft.second) : undefined
    const reading = buildCategoryReading(kind as FocusCategory, firstChart, {
      ...(second ? { second: calculateSaju(second) } : {}),
      year,
    })
    passages = fromChapters(kind, reading.chapters)
  }

  // Some paid questions intentionally point to the same shared chapter; show its answer once in the preview.
  passages = passages.filter((item, index, all) => all.findIndex(candidate => candidate.text.trim() === item.text.trim()) === index)
  const totalWords = passages.reduce((sum, item) => sum + words(item.text).length, 0)
  if (!totalWords) return []
  let remaining = Math.max(1, Math.ceil(totalWords * PREVIEW_PERCENT / 100))
  const excerpt: PersonalPreview['excerpts'] = []
  const icon = previewProduct(kind).icon
  for (const passage of passages) {
    if (remaining <= 0) break
    const passageWords = words(passage.text).length
    const lead = fitPassage(passage.text, remaining)
    const shownWords = words(lead.replace(/…$/, '')).length
    excerpt.push({ id: passage.id, title: passage.title, icon, lead, paragraphs: [], evidence: [] })
    remaining -= Math.max(1, Math.min(passageWords, shownWords))
  }
  return excerpt
}

/** Calculate report passages on the device; no birth details are sent to a server. */
export function buildPersonalPreview(kind: PreviewKind, draft: PreviewDraft): PersonalPreview {
  const first = normalizePreviewBirth(draft.first)
  if (!first) throw new Error('Valid birth details and a birthplace time zone are needed')
  if ((kind === 'compatibility' || kind === 'bundle') && !normalizePreviewBirth(draft.second)) {
    return { title: previewProduct(kind).title, subjects: [], headline: '', brief: null, applications: [], summary: [], excerpts: [], contents: [], monthly: [], needsPartner: true, extras: null }
  }
  if (kind === 'year' && draft.year != null && (!Number.isInteger(draft.year) || draft.year < first.year || draft.year > 2100)) {
    throw new Error('Choose a valid report year')
  }
  const year = draft.year ?? new Date().getFullYear() + 1
  return {
    title: previewProduct(kind).title,
    subjects: [],
    headline: '',
    brief: null,
    applications: [],
    summary: [],
    excerpts: selectedExcerpts(kind, draft, year),
    contents: buyerQuestionTitles(kind).map((title, index) => ({ id: `question-${index + 1}`, title })),
    monthly: [],
    needsPartner: false,
    extras: null,
  }
}

/** Export only the 20% answer excerpt and question titles; full answers remain with the paid report. */
export function personalPreviewText(preview: PersonalPreview): string {
  if (preview.needsPartner || preview.excerpts.length === 0) throw new Error('Complete the birth details before saving a preview')
  return plainReadingText([
    'THE FATE KEY · 20% PERSONAL PREVIEW', preview.title,
    'This preview is calculated from your chart on this device. It contains about 20% of the report question-answer text.',
    ...preview.excerpts.flatMap(section => [section.title, section.lead]),
    'Questions covered in the full report',
    ...preview.contents.map((item, index) => `${index + 1}. ${item.title}`),
    'The remaining 80% of question-answer content is included in the full report.',
  ].join('\n\n'))
}
