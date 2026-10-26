import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading, buildFreeReading } from './complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from './category-readings.ts'
import type { ReportChapter } from './complete-reading.ts'

import { previewProduct } from './personal-products.ts'
import type { PreviewKind } from './personal-products.ts'
import { normalizePreviewBirth } from '../utils/preview-draft.ts'
import type { PreviewDraft } from '../utils/preview-draft.ts'
import type { InsightQuestion, ReportExtras, SymbolCard } from './report-extras.ts'
import { SYMBOL_NOTE } from './report-extras.ts'
import { plainReadingText } from './reading-text.ts'
import { everydayExampleText } from './personal-examples.ts'
import { buildReadingBrief, readingBriefText } from './reading-brief.ts'
import type { ReadingBrief } from './reading-brief.ts'
import { applicationText } from './report-applications.ts'
import type { ReportApplication } from './report-applications.ts'

export interface PersonalPreview {
  title: string
  subjects: { label: string; birthSummary: string; dayMaster: string; pillarSummary: string[] }[]
  headline: string
  brief: ReadingBrief | null
  applications: ReportApplication[]
  summary: { label: string; text: string }[]
  excerpts: Pick<ReportChapter, 'id' | 'title' | 'icon' | 'lead' | 'paragraphs' | 'evidence' | 'example'>[]
  contents: { id: string; title: string }[]
  monthly: { label: string; lead: string }[]
  needsPartner: boolean
  extras: { question: InsightQuestion; symbols: SymbolCard[] } | null
}
function excerpt(chapter: ReportChapter, paired = false) {
  const content = [chapter.lead, ...chapter.paragraphs].filter(line => !/^(Reading basis:|About this reading:)/.test(line))
  return { id: chapter.id, title: chapter.title.replace(/^\d+ · /, ''), icon: chapter.icon ?? chapter.id, lead: content[0] ?? chapter.lead, paragraphs: chapter.example ? [] : content.slice(1, 1 + Math.min(paired ? 2 : 1, Math.max(0, content.length - 2))), ...(chapter.example ? { example: chapter.example } : {}), evidence: chapter.evidence.slice(0, 2) }
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
  if (paired && !second) return { title: previewProduct(kind).title, subjects: [subjectA], headline: snapshot.headline, brief: null, applications: [], summary: [], excerpts: [], contents: [], monthly: [], needsPartner: true, extras: null }
  const currentYear = new Date().getFullYear()
  const year = draft.year ?? currentYear + 1
  if (!Number.isInteger(year) || year < first.year || year > 2100 || year < 1900) throw new Error('Choose a valid report year')
  if (kind === 'complete') {
    const full = buildCompleteReading(a, currentYear)
    return { title: full.title, subjects: [subjectA], headline: full.headline, brief: buildReadingBrief(full.chapters.find(chapter => chapter.id === 'career')!, undefined, full.focus), summary: full.summary, applications: full.applications, excerpts: ['career', 'love', 'money'].map(id => excerpt(full.chapters.find(chapter => chapter.id === id)!)), contents: [...full.chapters, { id: 'timeline', title: '08 · Your Ten-Year Chapters' }, full.actionPlan].map(chapter => ({ id: chapter.id, title: chapter.title.replace(/^\d+ · /, '') })), monthly: [], needsPartner: false, extras: extrasExcerpt(full.extras) }
  }
  const b = second ? calculateSaju(second) : undefined
  if (kind === 'bundle') {
    const bundle = buildBundleReading(a, b!, year, currentYear)
    return { title: 'Your Destiny Collection', subjects: bundle.compatibility.subjects, headline: bundle.complete.headline, brief: buildReadingBrief(bundle.complete.chapters[0], 'Person A · Your Life, Your Destiny', bundle.complete.focus), summary: bundle.summary, applications: [], excerpts: [excerpt(bundle.complete.chapters[0]), excerpt(bundle.compatibility.chapters[1], true), excerpt(bundle.annual.chapters[0])], contents: [bundle.complete, bundle.compatibility, bundle.annual].map((report, index) => ({ id: `report-${index + 1}`, title: report.title })), monthly: [], needsPartner: false, extras: extrasExcerpt(bundle.compatibility.extras) }
  }
  const full = buildCategoryReading(kind, a, { second: b, year: kind === 'year' ? year : currentYear })
  return { title: full.title, subjects: paired ? full.subjects : [subjectA], headline: full.headline, brief: buildReadingBrief(full.chapters[0], undefined, full.focus), summary: full.summary, applications: full.applications, excerpts: full.chapters.slice(0, 3).map(chapter => excerpt(chapter, paired)), contents: full.chapters.map(chapter => ({ id: chapter.id, title: chapter.title.replace(/^\d+ · /, '') })), monthly: full.months.map(month => ({ label: month.label, lead: month.lead })), needsPartner: false, extras: extrasExcerpt(full.extras) }
}

/** Export only what the visitor can read in the free preview. */
export function personalPreviewText(preview: PersonalPreview): string {
  if (preview.needsPartner || preview.excerpts.length === 0) throw new Error('Complete the birth details before saving a preview')
  return plainReadingText([
    'THE FATE KEY · FREE PERSONAL PREVIEW', preview.title,
    'Selected passages only. This is not an issued paid report.',
    ...preview.subjects.flatMap(person => [person.label, person.birthSummary, person.dayMaster, person.pillarSummary.join(' · ')]),
    preview.headline,
    ...(preview.brief ? [readingBriefText(preview.brief)] : []),
    ...(preview.applications.length ? ['Situations you can work through', ...preview.applications.map(applicationText)] : []),
    ...preview.summary.map(theme => `${theme.label}\n${theme.text}`),
    ...preview.excerpts.flatMap(section => [section.title, section.lead, ...(section.example ? everydayExampleText(section.example) : []), ...section.paragraphs, 'Chart notes: ' + section.evidence.join(' · ')]),
    ...(preview.extras ? [preview.extras.question.question, preview.extras.question.answer, 'Chart note: ' + preview.extras.question.basis,
      ...preview.extras.symbols.map(symbol => `${symbol.person} · ${symbol.element}\nColours: ${symbol.colors.map(color => color.name).join(', ')}\nNumbers: ${symbol.numbers.join(' · ')}\n${symbol.use}\n${symbol.basis}`), SYMBOL_NOTE] : []),
    ...preview.monthly.map(month => `${month.label}\n${month.lead}`),
    'Full report contents (the full chapters are not included in this preview)',
    ...preview.contents.map((item, index) => `${index + 1}. ${item.title}`),
    'Traditional Saju interpretation for personal reflection. These are not guaranteed outcomes.',
  ].join('\n\n'))
}
