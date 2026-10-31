import type { CompleteReadingPeriod, ReportChapter } from './complete-reading.ts'
import { deliveredChapter } from './report-delivery.ts'
export const BUYER_OUTLINES = {
  complete: [['personality', "What Shapes Your Life and Destiny?"], ['social', "What Helps You Thrive — and What Holds You Back?"], ['career', "Where Could You Find Your Kind of Success?"], ['money', "How Are You Meant to Make Money?"], ['love', "What Do You Need in Love?"], ['life-challenges', "What Challenges Keep Returning in Your Life?"], ['patterns', "When Might Your Life Change Direction?"], ['balance', "Your Most Important Life Insight"]],
  compatibility: [['two-styles', "How Do You Fit Together?"], ['two-directions', "Why Are You Drawn to Each Other?"], ['close-conversation', "Why Do You See Things Differently?"], ['shared-routine', "Can Your Everyday Lives Fit Together?"], ['shared-money', "Can You Agree About Money?"], ['chart-patterns', "What Brings You Closer — and What Creates Friction?"], ['support-each-other', "How Might the Years Ahead Affect Your Relationship?"], ['shared-week', "What Does This Connection Ask of You?"]],
  year: [['annual-theme', "What Is the Main Story of Your Year?"], ['annual-money', "What Could Shape Your Money This Year?"], ['annual-work', "Where Could Work Take You This Year?"], ['annual-connections', "What Could This Year Bring to Your Love Life?"], ['annual-cycle-context', "What Should You Focus on Each Month?"], ['annual-plan', "When Might You Need Extra Care?"]],
  love: [['love-style', 'How Do You Approach Love?'], ['love-needs', 'What Helps You Feel Secure in a Relationship?'], ['love-attraction', 'What Kind of Connection Draws You In?'], ['love-friction', 'Where Can Relationships Feel Difficult?'], ['love-patterns', 'What Does Your Chart Show About Close Bonds?'], ['love-timing', 'When May Relationship Priorities Shift?'], ['love-outlook', 'How Can You Build a Relationship That Fits You?']],
  career: [['two-work-layers', 'What Kind of Career Suits You Best?'], ['proof-of-skill', 'Am I Better Suited to Employment or Running a Business?'], ['money-commitments', 'How Am I Most Likely to Make Money?'], ['working-style', 'What Could Hold Back My Financial Success?'], ['feedback-and-boundaries', 'When Might My Career or Financial Direction Change?'], ['work-chapters', 'What Do the Next Ten Years Suggest for My Work and Money?'], ['career-plan', 'What Should I Focus on to Build a Better Future?']],
  business: [['founder-style', "Were You Born to Build a Business?"], ['offer-test', "What Does Your Chart Say About Starting Out?"], ['team-decisions', "Could a Business Partner Help or Complicate Things?"], ['delivery-capacity', "How Could Your Business Earn and Keep Money?"], ['customer-communication', "When Might Expansion Deserve a Closer Look?"], ['business-chapters', "What Do Your Ten-Year Business Cycles Reveal?"], ['business-plan', "When Should You Be More Careful in Business?"]],
  wellbeing: [['everyday-pace', "Who Are You Beneath the Surface?"], ['visible-elements', "Which Parts of Your Nature Stand Out?"], ['workload-rhythm', "What Tends to Put You Under Pressure?"], ['support-and-space', "What Do You Need From the People Around You?"], ['balance-week', "How Can Your Strengths Become Blind Spots?"]],
} as const
export type BuyerOutlineKind = keyof typeof BUYER_OUTLINES
type AnswerPart = 'lead' | 'lead-with-caution' | 'caution' | 'action' | 'timing' | 'turning-points' | 'next-cycle' | `paragraph:${number}` | `paragraphs:${number}-${number}`
interface BuyerQuestion { id: string; question: string; source: string; part: AnswerPart }

/** Seven questions for the six standalone products. The collection keeps its existing question set. */
export const BUYER_QUESTIONS: Record<BuyerOutlineKind, BuyerQuestion[]> = {
  complete: [
    { id: 'personality', question: 'What kind of person am I?', source: 'personality', part: 'lead' },
    { id: 'social', question: 'What helps me thrive, and what can hold me back?', source: 'social', part: 'lead-with-caution' },
    { id: 'career', question: 'What kind of career suits me?', source: 'career', part: 'lead' },
    { id: 'money', question: 'How does money work in my life?', source: 'money', part: 'lead' },
    { id: 'love', question: 'What is my pattern in love?', source: 'love', part: 'lead' },
    { id: 'patterns', question: 'What are my biggest life challenges?', source: 'life-challenges', part: 'lead' },
    { id: 'q-turning-points', question: 'When may my life change direction?', source: 'patterns', part: 'turning-points' },
  ],
  career: [
    { id: 'two-work-layers', question: 'Which careers suit me best?', source: 'two-work-layers', part: 'lead' },
    { id: 'proof-of-skill', question: 'Am I better suited to employment or independent work?', source: 'proof-of-skill', part: 'lead' },
    { id: 'money-commitments', question: 'How do I naturally make money?', source: 'money-commitments', part: 'lead' },
    { id: 'working-style', question: 'What tends to block my financial progress?', source: 'working-style', part: 'lead' },
    { id: 'q-risk', question: 'What should I know about financial risk?', source: 'working-style', part: 'caution' },
    { id: 'feedback-and-boundaries', question: 'Which upcoming periods deserve attention?', source: 'feedback-and-boundaries', part: 'lead' },
    { id: 'career-plan', question: 'What is my most important money and career insight?', source: 'career-plan', part: 'lead' },
  ],
  compatibility: [
    { id: 'two-directions', question: 'Why are we attracted to each other?', source: 'two-directions', part: 'lead' },
    { id: 'two-styles', question: 'What makes us compatible?', source: 'two-styles', part: 'lead' },
    { id: 'q-conflict', question: 'What tends to cause friction between us?', source: 'close-conversation', part: 'paragraph:3' },
    { id: 'q-love-language', question: 'How do we express love differently?', source: 'close-conversation', part: 'paragraphs:0-1' },
    { id: 'chart-patterns', question: 'What are our strongest relationship qualities?', source: 'chart-patterns', part: 'lead' },
    { id: 'shared-week', question: 'What are our biggest relationship challenges?', source: 'shared-week', part: 'paragraph:3' },
    { id: 'support-each-other', question: 'Which upcoming periods may affect our relationship themes?', source: 'support-each-other', part: 'lead' },
  ],
  year: [
    { id: 'annual-theme', question: 'What is the overall theme of my next 12 months?', source: 'annual-theme', part: 'lead' },
    { id: 'annual-work', question: 'What does this period suggest for my career?', source: 'annual-work', part: 'lead' },
    { id: 'annual-money', question: 'What does it suggest for money?', source: 'annual-money', part: 'lead' },
    { id: 'annual-connections', question: 'What does it suggest for love?', source: 'annual-connections', part: 'lead' },
    { id: 'annual-cycle-context', question: 'Which months have more supportive chart relationships?', source: 'annual-cycle-context', part: 'lead' },
    { id: 'annual-plan', question: 'Which months require closer attention?', source: 'annual-plan', part: 'lead' },
    { id: 'q-year-focus', question: 'What should I focus on most this year?', source: 'annual-plan', part: 'action' },
  ],
  business: [
    { id: 'founder-style', question: 'Does my chart support business-oriented traits?', source: 'founder-style', part: 'lead' },
    { id: 'offer-test', question: 'What kind of business work suits me?', source: 'offer-test', part: 'lead' },
    { id: 'team-decisions', question: 'Am I better suited to working alone or with partners?', source: 'team-decisions', part: 'lead' },
    { id: 'customer-communication', question: 'What strengths can I bring to serving customers?', source: 'customer-communication', part: 'lead' },
    { id: 'delivery-capacity', question: 'What financial risks should I understand?', source: 'delivery-capacity', part: 'lead' },
    { id: 'business-chapters', question: 'What do my upcoming cycles suggest about business activity?', source: 'business-chapters', part: 'lead' },
    { id: 'business-plan', question: 'What should I be careful about in business?', source: 'business-plan', part: 'caution' },
  ],
  wellbeing: [
    { id: 'everyday-pace', question: 'What is my core personality?', source: 'everyday-pace', part: 'lead' },
    { id: 'q-how-others-see-me', question: 'How do others tend to experience me?', source: 'everyday-pace', part: 'paragraph:0' },
    { id: 'visible-elements', question: 'What are my natural strengths?', source: 'visible-elements', part: 'paragraph:0' },
    { id: 'workload-rhythm', question: 'What are my weaknesses?', source: 'workload-rhythm', part: 'lead' },
    { id: 'q-pressure', question: 'How do I respond under pressure?', source: 'workload-rhythm', part: 'caution' },
    { id: 'q-environment', question: 'What kind of environment brings out my best?', source: 'support-and-space', part: 'paragraph:0' },
    { id: 'support-and-space', question: 'What do I need most in relationships?', source: 'support-and-space', part: 'lead' },
  ],
  // This category is included only inside the collection, so it keeps its existing set.
  love: [
    { id: 'love-style', question: 'How do I tend to approach love?', source: 'love-style', part: 'lead' },
    { id: 'love-needs', question: 'What helps me feel secure in a relationship?', source: 'love-needs', part: 'lead' },
    { id: 'love-attraction', question: 'What kind of connection suits me?', source: 'love-attraction', part: 'lead' },
    { id: 'love-friction', question: 'What relationship patterns may cause conflict?', source: 'love-friction', part: 'lead' },
    { id: 'q-love-strength', question: 'What is one of my strengths as a partner?', source: 'love-patterns', part: 'lead' },
    { id: 'love-timing', question: 'When may relationship priorities shift?', source: 'love-timing', part: 'lead' },
    { id: 'love-outlook', question: 'What can help me build a relationship that fits?', source: 'love-outlook', part: 'lead' },
    { id: 'q-love-friction-detail', question: 'Why might this pattern repeat?', source: 'love-friction', part: 'paragraph:0' },
    { id: 'q-love-need-detail', question: 'What kind of care matters most to me?', source: 'love-needs', part: 'paragraph:0' },
    { id: 'q-love-timing-detail', question: 'What should I pay attention to in those periods?', source: 'love-timing', part: 'paragraph:0' },
  ],
}

const COLLECTION_BUYER_QUESTIONS: Partial<Record<BuyerOutlineKind, BuyerQuestion[]>> = {
  complete: [
    { id: 'personality', question: 'What kind of person am I?', source: 'personality', part: 'lead' },
    { id: 'social', question: 'What are my greatest strengths?', source: 'social', part: 'lead' },
    { id: 'q-hidden-weakness', question: 'What are my hidden weaknesses?', source: 'social', part: 'caution' },
    { id: 'career', question: 'What kind of career suits me?', source: 'career', part: 'lead' },
    { id: 'money', question: 'How does money work in my life?', source: 'money', part: 'lead' },
    { id: 'love', question: 'What is my pattern in love?', source: 'love', part: 'lead' },
    { id: 'patterns', question: 'What are my biggest life challenges?', source: 'life-challenges', part: 'lead' },
    { id: 'q-turning-points', question: 'When are my major turning points?', source: 'patterns', part: 'turning-points' },
    { id: 'q-next-cycle', question: 'What does my next ten-year cycle suggest?', source: 'patterns', part: 'next-cycle' },
    { id: 'balance', question: 'What is the most important insight about my life?', source: 'balance', part: 'lead' },
  ],
  career: [
    { id: 'two-work-layers', question: 'Which careers suit me best?', source: 'two-work-layers', part: 'lead' },
    { id: 'proof-of-skill', question: 'Am I better suited to employment or independent work?', source: 'proof-of-skill', part: 'lead' },
    { id: 'money-commitments', question: 'How do I naturally make money?', source: 'money-commitments', part: 'lead' },
    { id: 'q-earning-strength', question: 'What are my strongest earning abilities?', source: 'money-commitments', part: 'paragraph:0' },
    { id: 'q-earning-keeping', question: 'Am I better at earning money or keeping it?', source: 'money-commitments', part: 'paragraph:1' },
    { id: 'working-style', question: 'What tends to block my financial progress?', source: 'working-style', part: 'lead' },
    { id: 'q-risk', question: 'What should I know about financial risk?', source: 'working-style', part: 'caution' },
    { id: 'feedback-and-boundaries', question: 'Which upcoming periods deserve attention?', source: 'feedback-and-boundaries', part: 'lead' },
    { id: 'work-chapters', question: 'How do my ten-year cycles affect work and money?', source: 'work-chapters', part: 'lead' },
    { id: 'career-plan', question: 'What is my most important money and career insight?', source: 'career-plan', part: 'lead' },
  ],
  compatibility: [
    { id: 'two-directions', question: 'Why are we attracted to each other?', source: 'two-directions', part: 'lead' },
    { id: 'two-styles', question: 'What makes us compatible?', source: 'two-styles', part: 'lead' },
    { id: 'close-conversation', question: 'Where are we different?', source: 'close-conversation', part: 'lead' },
    { id: 'q-conflict', question: 'What causes conflict between us?', source: 'close-conversation', part: 'caution' },
    { id: 'q-love-language', question: 'How do we express love differently?', source: 'two-directions', part: 'paragraph:0' },
    { id: 'chart-patterns', question: 'What are our strongest relationship qualities?', source: 'chart-patterns', part: 'lead' },
    { id: 'shared-week', question: 'What are our biggest relationship challenges?', source: 'shared-week', part: 'caution' },
    { id: 'q-commitment', question: 'What do our individual charts suggest about commitment?', source: 'shared-week', part: 'lead' },
    { id: 'support-each-other', question: 'Which upcoming periods may affect our relationship themes?', source: 'support-each-other', part: 'lead' },
    { id: 'q-connection-insight', question: 'What is the most important insight about our connection?', source: 'shared-week', part: 'paragraph:0' },
  ],
  year: [
    { id: 'annual-theme', question: 'What is the overall theme of my next 12 months?', source: 'annual-theme', part: 'lead' },
    { id: 'annual-work', question: 'What does this period suggest for my career?', source: 'annual-work', part: 'lead' },
    { id: 'annual-money', question: 'What does it suggest for money?', source: 'annual-money', part: 'lead' },
    { id: 'annual-connections', question: 'What does it suggest for love?', source: 'annual-connections', part: 'lead' },
    { id: 'annual-cycle-context', question: 'Which months have more supportive chart relationships?', source: 'annual-cycle-context', part: 'lead' },
    { id: 'annual-plan', question: 'Which months require closer attention?', source: 'annual-plan', part: 'lead' },
    { id: 'q-work-shift', question: 'When may work or money themes shift?', source: 'annual-work', part: 'paragraph:0' },
    { id: 'q-relationship-themes', question: 'What relationship themes appear during this period?', source: 'annual-connections', part: 'paragraph:0' },
    { id: 'q-key-periods', question: 'What are the three most important periods to understand?', source: 'annual-cycle-context', part: 'paragraph:0' },
    { id: 'q-year-message', question: 'What is my overall message for the next 12 months?', source: 'annual-theme', part: 'paragraph:0' },
  ],
  love: [
    { id: 'love-style', question: 'How do I tend to approach love?', source: 'love-style', part: 'lead' },
    { id: 'love-needs', question: 'What helps me feel secure in a relationship?', source: 'love-needs', part: 'lead' },
    { id: 'love-attraction', question: 'What kind of connection suits me?', source: 'love-attraction', part: 'lead' },
    { id: 'love-friction', question: 'What relationship patterns may cause conflict?', source: 'love-friction', part: 'lead' },
    { id: 'q-love-strength', question: 'What is one of my strengths as a partner?', source: 'love-patterns', part: 'lead' },
    { id: 'love-timing', question: 'When may relationship priorities shift?', source: 'love-timing', part: 'lead' },
    { id: 'love-outlook', question: 'What can help me build a relationship that fits?', source: 'love-outlook', part: 'lead' },
    { id: 'q-love-friction-detail', question: 'Why might this pattern repeat?', source: 'love-friction', part: 'paragraph:0' },
    { id: 'q-love-need-detail', question: 'What kind of care matters most to me?', source: 'love-needs', part: 'paragraph:0' },
    { id: 'q-love-timing-detail', question: 'What should I pay attention to in those periods?', source: 'love-timing', part: 'paragraph:0' },
  ],
}

export function applyBuyerQuestions(text: string, kind: BuyerOutlineKind, chapters: ReportChapter[], periods: CompleteReadingPeriod[] = [], set: 'standalone' | 'collection' = 'standalone'): string {
  const byId = new Map(chapters.map(chapter => [chapter.id, chapter]))
  const buyerQuestions = set === 'collection' ? COLLECTION_BUYER_QUESTIONS[kind] ?? BUYER_QUESTIONS[kind] : BUYER_QUESTIONS[kind]
  const questionsBySource = new Map<string, BuyerQuestion[]>()
  for (const question of buyerQuestions) {
    if (!byId.has(question.source)) throw new Error(`Missing answer source: ${kind}/${question.source}`)
    questionsBySource.set(question.source, [...(questionsBySource.get(question.source) ?? []), question])
  }
  for (const [source, questions] of questionsBySource) {
    const chapter = byId.get(source)!, used = new Set<string>()
    const answer = (question: BuyerQuestion) => {
      let lead = chapter.lead
      let paragraphs: string[] = []
      if (kind === 'complete' && question.id === 'balance') {
        lead = `The most important life insight is that ${chapter.lead.charAt(0).toLowerCase()}${chapter.lead.slice(1)}`
      } else if (question.part === 'lead-with-caution') {
        lead = chapter.lead
        paragraphs = [...chapter.paragraphs, chapter.guidance.watchFor[0], chapter.tryThis].filter((line): line is string => Boolean(line))
      } else if (question.part === 'caution') {
        lead = chapter.guidance.watchFor[0] ?? chapter.tryThis
        paragraphs = chapter.tryThis ? [chapter.tryThis] : []
      } else if (question.part === 'action') {
        lead = chapter.tryThis || chapter.lead
        paragraphs = chapter.guidance.keepClose
      } else if (question.part === 'timing') {
        const index = chapter.paragraphs.findIndex(line => /\b20\d\d\b|cycle|period|month|year/i.test(line))
        lead = index >= 0 ? chapter.paragraphs[index] : chapter.tryThis
        paragraphs = index >= 0 ? chapter.paragraphs.slice(index + 1, index + 2) : []
      } else if (question.part === 'turning-points') {
        lead = chapter.lead
        const next = periods[1]
        paragraphs = [
          ...chapter.paragraphs.filter(line => /\b20\d\d\b/.test(line)),
          ...(set === 'standalone' && next ? [`Your next ten-year cycle is ${next.period} (${next.pillar}). ${next.paragraphs[1] ?? next.paragraphs[0]}`] : []),
        ]
      } else if (question.part === 'next-cycle') {
        const current = periods[0]
        const next = periods[1]
        if (!next) {
          lead = 'No next ten-year cycle is available in the supported calculation range, so this report does not invent a later cycle or timing conclusion.'
          paragraphs = []
        } else {
          lead = `Your next ten-year cycle is ${next.period} (${next.pillar}). ${next.paragraphs[1] ?? next.paragraphs[0]}`
          paragraphs = [
            ...(current ? [`Your current cycle is ${current.period} (${current.pillar}); the next cycle marks a change from that emphasis.`] : []),
            ...next.paragraphs.slice(2, 5),
          ]
        }
      } else if (question.part.startsWith('paragraphs:')) {
        const match = /^(\d+)-(\d+)$/.exec(question.part.slice('paragraphs:'.length))
        const start = Number(match?.[1]), end = Number(match?.[2])
        const selected = Number.isInteger(start) && Number.isInteger(end) && end >= start ? chapter.paragraphs.slice(start, end + 1) : []
        lead = selected[0] ?? chapter.tryThis
        paragraphs = selected.slice(1)
      } else if (question.part.startsWith('paragraph:')) {
        const index = Number(question.part.slice('paragraph:'.length))
        lead = chapter.paragraphs[index] ?? chapter.tryThis
        paragraphs = []
      }
      if (!lead?.trim()) throw new Error(`Empty buyer answer: ${kind}/${question.id}`)
      if (chapter.paragraphs.includes(lead)) used.add(lead)
      for (const line of paragraphs) if (chapter.paragraphs.includes(line)) used.add(line)
      return [lead, ...paragraphs].filter((line, index, all) => all.indexOf(line) === index)
    }
    const firstAnswer = set === 'collection' ? [chapter.lead] : answer(questions[0])
    const extraAnswers = questions.slice(1).map(question => ({ question, lines: answer(question) }))
    const firstLines = [
      ...(set === 'collection' ? [chapter.lead] : firstAnswer),
      ...chapter.paragraphs.filter(line => !used.has(line) && !(kind === 'complete' && source === 'personality' && chapter.guidance.watchFor.includes(line))),
    ]
    const answeredLines = [...firstLines, ...extraAnswers.flatMap(item => item.lines)]
    const guidance = chapter.showGuidance === false ? [] : [
      ...(set === 'collection' ? (!extraAnswers.some(item => item.lines.includes(chapter.tryThis)) ? ['Practical point: ' + chapter.tryThis] : []) : (!answeredLines.includes(chapter.tryThis) ? ['Practical point: ' + chapter.tryThis] : [])),
      ...(set === 'collection' ? (!extraAnswers.some(item => chapter.guidance.watchFor.includes(item.lines[0])) ? ['Main caution: ' + chapter.guidance.watchFor.join(' ')] : []) : (!answeredLines.some(line => chapter.guidance.watchFor.includes(line)) ? ['Main caution: ' + chapter.guidance.watchFor.join(' ')] : [])),
    ]
    const qas = [
      `Question: ${questions[0].question}`,
      ...firstLines.map((line, index) => `${index ? 'Answer detail: ' : 'Answer: '}${line}`),
      ...extraAnswers.flatMap(({ question, lines }) => [`Question: ${question.question}`, ...lines.map((line, index) => `${index ? 'Answer detail: ' : 'Answer: '}${line}`)]),
    ]
    const replacement = [chapter.title, ...qas, ...guidance].join('\n\n')
    const original = deliveredChapter(chapter).join('\n\n')
    if (!text.includes(original)) throw new Error(`Missing delivered source: ${kind}/${source}`)
    text = text.replace(original, replacement)
  }
  return text
}
/** Preserve chapter IDs for saved links, while making the reading order buyer-led. */
export function buyerOutline(kind: BuyerOutlineKind, chapters: ReportChapter[]) {
  const byId = new Map(chapters.map(item => [item.id, item]))
  return BUYER_OUTLINES[kind].map(([id, title]) => {
    const chapter = byId.get(id)
    if (!chapter) throw new Error(`Missing purchased topic: ${kind}/${id}`)
    return { ...chapter, title }
  })
}
