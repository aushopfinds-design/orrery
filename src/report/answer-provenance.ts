import type { ReportChapter } from './complete-reading.ts'
import { BUYER_QUESTIONS, type BuyerOutlineKind, type BuyerQuestion } from './buyer-outline.ts'

/** Internal, deterministic answer trace. Never place this object in customer text or PDF. */
export interface AnswerProvenance {
  questionId: string
  sourceChapterId: string
  ruleIds: string[]
  evidence: Array<{ id: string; value: string }>
  answerType: string
}

/** Build an internal evidence trace for Product 07's ten synthesis answers. */
export function buildCollectionAnswerProvenance(entries: Array<{
  questionId: string
  sourceChapterId: string
  ruleId: string
  chapters: ReportChapter[]
}>): AnswerProvenance[] {
  return entries.map(entry => {
    const evidence = entry.chapters.flatMap(chapter => chapter.evidence.map((value, index) => ({
      id: `chapter.${chapter.id}.evidence.${index + 1}`,
      value,
    })))
    if (!evidence.length) throw new Error(`Missing collection answer evidence: ${entry.questionId}`)
    return { questionId: entry.questionId, sourceChapterId: entry.sourceChapterId, ruleIds: [entry.ruleId], evidence, answerType: 'integrated-chart-synthesis' }
  })
}

function traceQuestion(kind: BuyerOutlineKind, question: BuyerQuestion, chapter: ReportChapter): AnswerProvenance {
  const evidence = chapter.evidence.map((value, index) => ({ id: `chapter.${chapter.id}.evidence.${index + 1}`, value }))
  // The rule identifier points to the actual chapter builder that selects the answer.
  // The underlying facts are copied from that generated chapter, not recomputed here.
  const ruleId = `purchase-narrative.customerNarrative.${kind}.${chapter.id}.v1`
  const answerType = question.id === 'proof-of-skill' ? 'employment-and-independent-signals'
    : question.id === 'money-commitments' ? 'chart-linked-earning-pattern'
    : question.id === 'feedback-and-boundaries' ? 'calculated-period-comparison'
    : question.id === 'career-plan' ? 'integrated-work-and-money-conclusion'
    : question.id === 'q-risk' ? 'chart-specific-financial-caution'
    : question.id === 'two-work-layers' ? 'visible-role-and-daily-work-fit'
    : 'career-money-overview'
  return { questionId: question.id, sourceChapterId: chapter.id, ruleIds: [ruleId], evidence, answerType }
}

function traceCompleteQuestion(question: BuyerQuestion, chapter: ReportChapter): AnswerProvenance {
  const evidence = chapter.evidence.map((value, index) => ({ id: `chapter.${chapter.id}.evidence.${index + 1}`, value }))
  return {
    questionId: question.id,
    sourceChapterId: chapter.id,
    ruleIds: [`purchase-narrative.customerNarrative.complete.${question.id}.v1`, `buyer-outline.applyBuyerQuestions.complete.${question.id}.v1`],
    evidence,
    answerType: question.id,
  }
}

/** The shipped career product is intentionally kept at its existing seven questions. */
export function buildAnswerProvenance(kind: BuyerOutlineKind, chapters: ReportChapter[]): AnswerProvenance[] {
  const byId = new Map(chapters.map(chapter => [chapter.id, chapter]))
  return BUYER_QUESTIONS[kind].map(question => {
    const chapter = byId.get(question.source)
    if (!chapter) throw new Error(`Missing answer provenance source: ${kind}/${question.source}`)
    return kind === 'complete' ? traceCompleteQuestion(question, chapter) : traceQuestion(kind, question, chapter)
  })
}
