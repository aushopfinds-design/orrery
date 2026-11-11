import { BUYER_QUESTIONS, type BuyerOutlineKind, type BuyerQuestion } from './buyer-outline.ts'

/** Stable identities and the exact sequence printed by each paid PDF. */
export type PaidQuestionProduct = BuyerOutlineKind | 'bundle'
export type ReportQuestionDefinition = {
  id: string
  productId: string
  title: string
  order: number
  answerRole: string
  source: string
  answerSource: string
  evidenceRequirement: string
  timingRequirement: 'none' | 'independent-calculation-required'
}

const QUESTION_IDS_IN_PDF_ORDER: Record<BuyerOutlineKind, readonly string[]> = {
  complete: ['personality', 'social', 'career', 'money', 'love', 'patterns', 'q-turning-points'],
  career: ['two-work-layers', 'proof-of-skill', 'money-commitments', 'working-style', 'feedback-and-boundaries', 'work-chapters', 'career-plan'],
  compatibility: ['two-styles', 'two-directions', 'q-conflict', 'q-love-language', 'chart-patterns', 'support-each-other', 'shared-week'],
  year: ['annual-theme', 'q-year-focus', 'annual-money', 'annual-work', 'annual-connections', 'annual-cycle-context', 'annual-plan'],
  business: ['founder-style', 'offer-test', 'team-decisions', 'delivery-capacity', 'customer-communication', 'business-chapters', 'business-plan'],
  wellbeing: ['everyday-pace', 'visible-elements', 'workload-rhythm', 'q-pressure', 'support-and-space', 'balance-week', 'q-balance-action'],
  love: BUYER_QUESTIONS.love.map(question => question.id),
}

/** Approved Product 07 life-centered questions, in the locked customer-facing order. */
export const DESTINY_COLLECTION_QUESTIONS = [
  'What are the three most important things about my destiny?',
  'What is my greatest opportunity in life?',
  'What is my biggest challenge?',
  'How do my personality, career, money and love connect?',
  'What patterns keep repeating in my life?',
  'Which years are most important for me?',
  'What should I prioritise over the next three years?',
  'What am I not seeing about my potential?',
  'What will help me build a fulfilling life?',
  'What is the most important message from my chart?',
] as const

const COLLECTION_ANSWER_ROLES = [
  { id: 'collection-q1', answerRole: 'product07.three-core-destiny-insights', source: 'complete.personality' },
  { id: 'collection-q2', answerRole: 'product07.principal-life-opportunity', source: 'career.two-work-layers' },
  { id: 'collection-q3', answerRole: 'product07.main-personal-challenge', source: 'complete.life-challenges' },
  { id: 'collection-q4', answerRole: 'product07.cross-domain-life-connection', source: 'career.money-commitments' },
  { id: 'collection-q5', answerRole: 'product07.recurring-life-pattern', source: 'complete.personality' },
  { id: 'collection-q6', answerRole: 'product07.verified-important-years', source: 'complete.patterns' },
  { id: 'collection-q7', answerRole: 'product07.verified-three-year-priority', source: 'annual.annual-theme' },
  { id: 'collection-q8', answerRole: 'product07.underrecognized-potential', source: 'complete.social' },
  { id: 'collection-q9', answerRole: 'product07.fulfillment-conditions', source: 'complete.balance' },
  { id: 'collection-q10', answerRole: 'product07.personal-final-message', source: 'complete.balance' },
] as const

const PRODUCT_ROLE_OVERRIDES: Partial<Record<BuyerOutlineKind, Record<string, string>>> = {
  complete: { money: 'product01.income-pattern', love: 'product01.relationship-needs' },
  career: { 'career-plan': 'product02.career-and-money-priority' },
  business: { 'founder-style': 'product05.business-fit', 'delivery-capacity': 'product05.financial-risk', 'business-plan': 'product05.operational-risk' },
  wellbeing: { 'everyday-pace': 'product06.inner-personality', 'visible-elements': 'product06.visible-traits', 'workload-rhythm': 'product06.pressure-trigger', 'q-pressure': 'product06.pressure-response' },
}
const PRODUCT_IDS: Record<PaidQuestionProduct, string> = {
  complete: '01', career: '02', compatibility: '03', year: '04', business: '05', wellbeing: '06', bundle: '07', love: 'legacy-love',
}

function orderedStandaloneQuestions(kind: BuyerOutlineKind): ReportQuestionDefinition[] {
  const byId = new Map(BUYER_QUESTIONS[kind].map(question => [question.id, question]))
  const ids = QUESTION_IDS_IN_PDF_ORDER[kind]
  if (ids.length !== BUYER_QUESTIONS[kind].length || new Set(ids).size !== ids.length) {
    throw new Error(`Invalid paid question order for ${kind}`)
  }
  return ids.map((id, index) => {
    const question = byId.get(id)
    if (!question) throw new Error(`Unknown paid question ${kind}/${id}`)
    return standaloneDefinition(kind, question, index + 1)
  })
}

function standaloneDefinition(kind: BuyerOutlineKind, question: BuyerQuestion, order: number): ReportQuestionDefinition {
  // The annual-focus answer is printed beside the annual theme and reads that
  // chapter's practical action. Keep the question's original source metadata.
  const answerSource = kind === 'year' && question.role === 'year-priority' ? 'annual-theme' : question.source
  return {
    id: question.id,
    productId: PRODUCT_IDS[kind],
    title: kind === 'complete' && question.id === 'money' ? 'What is my natural pattern for earning money?'
      : kind === 'complete' && question.id === 'love' ? 'What do I need most in a close relationship?'
      : kind === 'career' && question.id === 'career-plan' ? 'What is my most important career and money insight?'
      : kind === 'business' && question.id === 'founder-style' ? 'Am I naturally suited to running a business?'
      : kind === 'wellbeing' && question.id === 'q-pressure' ? 'How do I tend to respond when I feel under pressure?'
      : question.question,
    order,
    answerRole: PRODUCT_ROLE_OVERRIDES[kind]?.[question.id] ?? `product${kind}.${question.role}`,
    source: question.source,
    answerSource,
    evidenceRequirement: `personal-chart-evidence:${question.source}`,
    timingRequirement: /timing|year|cycle|turning-point/i.test(question.role) ? 'independent-calculation-required' : 'none',
  }
}

const paidQuestionEntries = {
  complete: orderedStandaloneQuestions('complete'),
  career: orderedStandaloneQuestions('career'),
  compatibility: orderedStandaloneQuestions('compatibility'),
  year: orderedStandaloneQuestions('year'),
  business: orderedStandaloneQuestions('business'),
  wellbeing: orderedStandaloneQuestions('wellbeing'),
  // Kept for old individual-love orders and legacy sample pages.
  love: orderedStandaloneQuestions('love'),
  bundle: DESTINY_COLLECTION_QUESTIONS.map((title, index) => ({
    ...COLLECTION_ANSWER_ROLES[index], productId: PRODUCT_IDS.bundle, title, order: index + 1, answerSource: COLLECTION_ANSWER_ROLES[index].source,
    evidenceRequirement: `personal-chart-evidence:${COLLECTION_ANSWER_ROLES[index].answerRole}`,
    timingRequirement: [5, 6].includes(index) ? 'independent-calculation-required' as const : 'none' as const,
  })),
} satisfies Record<PaidQuestionProduct, ReportQuestionDefinition[]>

/** Single catalogue used by public samples, customer PDF QA and provenance. */
export const PRODUCT_QUESTIONS: Readonly<Record<PaidQuestionProduct, readonly ReportQuestionDefinition[]>> = paidQuestionEntries
export const PRODUCT_QUESTION_COUNTS: Readonly<Record<PaidQuestionProduct, number>> = {
  complete: 7, career: 7, compatibility: 7, year: 7, business: 7, wellbeing: 7, love: 10, bundle: 10,
}

export function productQuestions(kind: PaidQuestionProduct): readonly ReportQuestionDefinition[] {
  return PRODUCT_QUESTIONS[kind]
}

export function assertValidProductQuestionCatalogue() {
  for (const [kind, questions] of Object.entries(PRODUCT_QUESTIONS) as [PaidQuestionProduct, readonly ReportQuestionDefinition[]][]) {
    if (questions.length !== PRODUCT_QUESTION_COUNTS[kind]) throw new Error(`Wrong question count for ${kind}`)
    if (questions.some((question, index) => question.order !== index + 1 || !question.productId || !question.id || !question.title || !question.answerRole || !question.source || !question.answerSource || !question.evidenceRequirement || !question.timingRequirement)) {
      throw new Error(`Incomplete question definition for ${kind}`)
    }
    if (new Set(questions.map(question => question.id)).size !== questions.length) throw new Error(`Duplicate question ID for ${kind}`)
    if (new Set(questions.map(question => question.title)).size !== questions.length) throw new Error(`Duplicate question title for ${kind}`)
  }
}

assertValidProductQuestionCatalogue()
