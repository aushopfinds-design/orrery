import type { ReportChapter } from './complete-reading.ts'

/** A short route into an existing chapter, never a separate chart interpretation. */
export interface ReadingBrief {
  chapterId: string
  chapterTitle: string
  scope?: string
  support: string[]
  watchFor: string[]
  action: string
}

export function buildReadingBrief(chapter: ReportChapter, scope?: string): ReadingBrief {
  return {
    chapterId: chapter.id,
    chapterTitle: chapter.title.replace(/^\d+ · /, ''),
    ...(scope ? { scope } : {}),
    support: [...chapter.guidance.keepClose],
    watchFor: [...chapter.guidance.watchFor],
    action: chapter.tryThis,
  }
}

export function readingBriefText(brief: ReadingBrief): string {
  return [
    'Start with one small step',
    ...(brief.scope ? [brief.scope] : []),
    'What may help:', ...brief.support,
    'A habit to watch:', ...brief.watchFor,
    'A first step to try: ' + brief.action,
    'From the chapter: ' + brief.chapterTitle,
  ].join('\n')
}
