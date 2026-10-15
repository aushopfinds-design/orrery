import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading, buildFreeReading } from './complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from './category-readings.ts'
import type { ReportChapter } from './complete-reading.ts'

import { previewProduct } from './personal-products.ts'
import type { PreviewKind } from './personal-products.ts'
import { normalizePreviewBirth } from '../utils/preview-draft.ts'
import type { PreviewDraft } from '../utils/preview-draft.ts'
import type { InsightQuestion, ReportExtras, SymbolCard } from './report-extras.ts'

export interface PersonalPreview {
  title: string
  subjects: { label: string; birthSummary: string; dayMaster: string; pillarSummary: string[] }[]
  headline: string
  summary: { label: string; text: string }[]
  excerpts: Pick<ReportChapter, 'id' | 'title' | 'icon' | 'lead' | 'paragraphs' | 'evidence'>[]
  contents: { id: string; title: string }[]
  monthly: { label: string; lead: string }[]
  needsPartner: boolean
  extras: { question: InsightQuestion; symbols: SymbolCard[] } | null
}
function excerpt(chapter: ReportChapter, paired = false) {
  return { id: chapter.id, title: chapter.title.replace(/^\d+ · /, ''), icon: chapter.icon ?? chapter.id, lead: chapter.lead, paragraphs: chapter.paragraphs.slice(0, paired ? 2 : 1), evidence: chapter.evidence.slice(0, 2) }
}
function extrasExcerpt(extras: ReportExtras) {
  return { question: extras.questions[0], symbols: extras.symbols }
}
/** A limited personal preview. No full text, purchase receipt or paid entitlement. */
export function buildPersonalPreview(kind: PreviewKind, draft: PreviewDraft): PersonalPreview {
  const first = normalizePreviewBirth(draft.first)
  if (!first) throw new Error('Valid birth details and a birthplace time zone are needed')
  const a = calculateSaju(first)
  const snapshot = buildFreeReading(a)
  const subjectA = { label: kind === 'compatibility' || kind === 'bundle' ? 'Person A' : 'Your birth details', birthSummary: snapshot.birthSummary, dayMaster: snapshot.dayMaster, pillarSummary: snapshot.pillarSummary }
  const second = normalizePreviewBirth(draft.second)
  const paired = kind === 'compatibility' || kind === 'bundle'
  if (paired && !second) return { title: previewProduct(kind).title, subjects: [subjectA], headline: snapshot.headline, summary: [], excerpts: [], contents: [], monthly: [], needsPartner: true, extras: null }
  const currentYear = new Date().getFullYear()
  const year = draft.year ?? currentYear + 1
  if (!Number.isInteger(year) || year < first.year || year > 2100 || year < 1900) throw new Error('Choose a valid report year')
  if (kind === 'complete') {
    const full = buildCompleteReading(a, currentYear)
    return { title: full.title, subjects: [subjectA], headline: full.headline, summary: full.summary, excerpts: ['career', 'love', 'money'].map(id => excerpt(full.chapters.find(chapter => chapter.id === id)!)), contents: [...full.chapters, { id: 'timeline', title: '08 · Your Ten-Year Chapters' }, full.actionPlan].map(chapter => ({ id: chapter.id, title: chapter.title.replace(/^\d+ · /, '') })), monthly: [], needsPartner: false, extras: extrasExcerpt(full.extras) }
  }
  const b = second ? calculateSaju(second) : undefined
  if (kind === 'bundle') {
    const bundle = buildBundleReading(a, b!, year, currentYear)
    return { title: 'Complete Bundle', subjects: bundle.compatibility.subjects, headline: bundle.complete.headline, summary: bundle.complete.summary, excerpts: [excerpt(bundle.complete.chapters[0]), excerpt(bundle.compatibility.chapters[1], true), excerpt(bundle.annual.chapters[0])], contents: [bundle.complete, bundle.compatibility, bundle.annual].map((report, index) => ({ id: `report-${index + 1}`, title: report.title })), monthly: [], needsPartner: false, extras: extrasExcerpt(bundle.compatibility.extras) }
  }
  const full = buildCategoryReading(kind, a, { second: b, year: kind === 'year' ? year : currentYear })
  return { title: full.title, subjects: paired ? full.subjects : [subjectA], headline: full.headline, summary: full.summary, excerpts: full.chapters.slice(0, 3).map(chapter => excerpt(chapter, paired)), contents: full.chapters.map(chapter => ({ id: chapter.id, title: chapter.title.replace(/^\d+ · /, '') })), monthly: full.months.map(month => ({ label: month.label, lead: month.lead })), needsPartner: false, extras: extrasExcerpt(full.extras) }
}
