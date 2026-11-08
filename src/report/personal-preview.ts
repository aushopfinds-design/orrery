import type { PreviewKind } from './personal-products.ts'
import { previewProduct, buyerQuestionTitles } from './personal-products.ts'
import { normalizePreviewBirth } from '../utils/preview-draft.ts'
import type { PreviewDraft } from '../utils/preview-draft.ts'
import { plainReadingText } from './reading-text.ts'

/** Browser-safe preview data: product copy and questions only, never a calculated report. */
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

const SAMPLE_WORDING: Record<PreviewKind, string> = {
  complete: 'Illustrative wording: “Your report connects a personal theme with the questions that matter in daily life.”',
  career: 'Illustrative wording: “Your report explores how your working style and money patterns fit together.”',
  compatibility: 'Illustrative wording: “Your report looks at how two different communication styles can meet.”',
  year: 'Illustrative wording: “Your report explains how the year is organised and where to read each month.”',
  business: 'Illustrative wording: “Your report explores the working conditions that may support your business style.”',
  wellbeing: 'Illustrative wording: “Your report describes personal patterns in clear, everyday language.”',
  love: 'Illustrative wording: “Your report explores relationship themes in clear, everyday language.”',
  bundle: 'Illustrative wording: “Your report connects life, relationships, work, money and timing in one reading.”',
}

/** Validate required inputs, but do not calculate or return a personal interpretation. */
export function buildPersonalPreview(kind: PreviewKind, draft: PreviewDraft): PersonalPreview {
  const first = normalizePreviewBirth(draft.first)
  if (!first) throw new Error('Valid birth details and a birthplace time zone are needed')
  if (kind === 'compatibility' || kind === 'bundle') {
    if (!normalizePreviewBirth(draft.second)) {
      return { title: previewProduct(kind).title, subjects: [], headline: '', brief: null, applications: [], summary: [], excerpts: [], contents: [], monthly: [], needsPartner: true, extras: null }
    }
  }
  if (kind === 'year' && draft.year != null && (!Number.isInteger(draft.year) || draft.year < first.year || draft.year > 2100)) {
    throw new Error('Choose a valid report year')
  }
  const questions = buyerQuestionTitles(kind)
  return {
    title: previewProduct(kind).title,
    subjects: [],
    headline: '',
    brief: null,
    applications: [],
    summary: [],
    excerpts: [{ id: 'sample-wording', title: 'A short wording example', icon: 'sample', lead: SAMPLE_WORDING[kind], paragraphs: [], evidence: [] }],
    contents: questions.map((title, index) => ({ id: `question-${index + 1}`, title })),
    monthly: [],
    needsPartner: false,
    extras: null,
  }
}

/** Export only the safe product sample, question titles and generic wording. */
export function personalPreviewText(preview: PersonalPreview): string {
  if (preview.needsPartner || preview.excerpts.length === 0) throw new Error('Complete the birth details before saving a preview')
  return plainReadingText([
    'THE FATE KEY · FREE PERSONAL PREVIEW', preview.title,
    'This is not an issued paid report. It is a design and wording sample only; no personal reading or paid answer is included.',
    ...preview.excerpts.flatMap(section => [section.title, section.lead]),
    'Questions answered in the paid report',
    ...preview.contents.map((item, index) => `${index + 1}. ${item.title}`),
    'Full interpretations and timing are provided with the paid report.',
  ].join('\n\n'))
}
