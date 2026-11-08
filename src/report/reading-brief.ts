import type { ReportChapter } from './complete-reading.ts'
import { decisionFocusText } from './decision-focus.ts'
import type { DecisionFocus } from './decision-focus.ts'

/** A concise decision focus and a route into the supporting chapter. */
export interface ReadingBrief {
  chapterId: string
  chapterTitle: string
  scope?: string
  focus?: DecisionFocus
  support: string[]
  watchFor: string[]
  action: string
}

export function buildReadingBrief(chapter: ReportChapter, scope?: string, focus?: DecisionFocus): ReadingBrief {
  return {
    chapterId: chapter.id,
    chapterTitle: chapter.title.replace(/^\d+ · /, ''),
    ...(scope ? { scope } : {}),
    ...(focus ? { focus } : {}),
    support: [...chapter.guidance.keepClose],
    watchFor: [...chapter.guidance.watchFor],
    action: chapter.tryThis,
  }
}

export function readingBriefText(brief: ReadingBrief): string {
  if (brief.focus) return [brief.scope, decisionFocusText(brief.focus)].filter(Boolean).join('\n\n')
  return [
    'Start with one small step',
    ...(brief.scope ? [brief.scope] : []),
    'What may help:', ...brief.support,
    'A habit to watch:', ...brief.watchFor,
    'A first step to try: ' + brief.action,
    'From the chapter: ' + brief.chapterTitle,
  ].join('\n')
}
