import type { CompleteReadingPeriod, ReportChapter } from './complete-reading.ts'
import { deliveredChapter } from './report-delivery.ts'
export const BUYER_OUTLINES = {
  complete: [['personality', "What Shapes Your Life and Destiny?"], ['social', "What Helps You Thrive — and What Holds You Back?"], ['career', "Where Could You Find Your Kind of Success?"], ['money', "How Are You Meant to Make Money?"], ['love', "What Do You Need in Love?"], ['life-challenges', "What Challenges Keep Returning in Your Life?"], ['patterns', "When Might Your Life Change Direction?"], ['balance', "Your Most Important Life Insight"]],
  compatibility: [['two-styles', "How Do You Fit Together?"], ['two-directions', "Why Are You Drawn to Each Other?"], ['close-conversation', "Why Do You See Things Differently?"], ['shared-routine', "Can Your Everyday Lives Fit Together?"], ['shared-money', "Can You Agree About Money?"], ['chart-patterns', "What Brings You Closer — and What Creates Friction?"], ['support-each-other', "How Might the Years Ahead Affect Your Relationship?"], ['shared-week', "What Does This Connection Ask of You?"]],
  year: [['annual-theme', "What Is the Main Story of Your Year?"], ['annual-money', "What Could Shape Your Money This Year?"], ['annual-work', "Where Could Work Take You This Year?"], ['annual-connections', "What Could This Year Bring to Your Love Life?"], ['annual-cycle-context', "What Should You Focus on Each Month?"], ['annual-plan', "When Might You Need Extra Care?"]],
  love: [['love-style', 'How Do You Approach Love?'], ['love-needs', 'What Helps You Feel Secure in a Relationship?'], ['love-attraction', 'What Kind of Connection Draws You In?'], ['love-friction', 'Where Can Relationships Feel Difficult?'], ['love-patterns', 'What Does Your Chart Show About Close Bonds?'], ['love-timing', 'When May Relationship Priorities Shift?'], ['love-outlook', 'How Can You Build a Relationship That Fits You?']],
  career: [['two-work-layers', 'Which Careers Suit Me Best?'], ['proof-of-skill', 'Am I Better Suited to Employment or Independent Work?'], ['money-commitments', 'How Do I Naturally Make Money?'], ['working-style', 'What Tends to Block My Financial Progress?'], ['feedback-and-boundaries', 'When Might My Career or Money Situation Improve?'], ['work-chapters', 'What Do the Next Ten Years Suggest for My Work and Money?'], ['career-plan', 'What Is the Most Important Insight for My Future?']],
  business: [['founder-style', "Were You Born to Build a Business?"], ['offer-test', "What Does Your Chart Say About Starting Out?"], ['team-decisions', "Could a Business Partner Help or Complicate Things?"], ['delivery-capacity', "How Could Your Business Earn and Keep Money?"], ['customer-communication', "When Might Expansion Deserve a Closer Look?"], ['business-chapters', "What Do Your Ten-Year Business Cycles Reveal?"], ['business-plan', "When Should You Be More Careful in Business?"]],
  wellbeing: [['everyday-pace', "Who Are You Beneath the Surface?"], ['visible-elements', "Which Parts of Your Nature Stand Out?"], ['workload-rhythm', "What Tends to Put You Under Pressure?"], ['support-and-space', "What Do You Need From the People Around You?"], ['balance-week', "How Can Your Strengths Become Blind Spots?"]],
} as const
export type BuyerOutlineKind = keyof typeof BUYER_OUTLINES
type AnswerPart = 'lead' | 'lead-with-caution' | 'caution' | 'action' | 'timing' | 'turning-points' | 'next-cycle' | `paragraph:${number}` | `paragraphs:${number}-${number}`
export interface BuyerQuestion { id: string; question: string; source: string; part: AnswerPart }

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
    { id: 'feedback-and-boundaries', question: 'When might my career or money situation improve?', source: 'feedback-and-boundaries', part: 'lead' },
    { id: 'work-chapters', question: 'What do the next ten years suggest for my work and money?', source: 'work-chapters', part: 'lead' },
    { id: 'career-plan', question: 'What is the most important insight for my future?', source: 'career-plan', part: 'lead' },
  ],
  compatibility: [
    { id: 'two-directions', question: 'Why are we attracted to each other?', source: 'two-directions', part: 'lead' },
    { id: 'two-styles', question: 'What makes us compatible?', source: 'two-styles', part: 'lead' },
    { id: 'q-conflict', question: 'What tends to cause friction between us?', source: 'close-conversation', part: 'paragraph:3' },
    { id: 'q-love-language', question: 'How do we express love differently?', source: 'close-conversation', part: 'paragraphs:0-1' },
    { id: 'chart-patterns', question: 'How do emotional closeness and everyday compatibility differ?', source: 'chart-patterns', part: 'lead' },
    { id: 'shared-week', question: 'What does this connection ask of each of us?', source: 'shared-week', part: 'lead' },
    { id: 'support-each-other', question: 'Which upcoming periods may affect our relationship themes?', source: 'support-each-other', part: 'lead' },
  ],
  year: [
    { id: 'annual-theme', question: 'What is the overall theme of my next 12 months?', source: 'annual-theme', part: 'lead' },
    { id: 'annual-work', question: 'What does this period suggest for my career?', source: 'annual-work', part: 'lead' },
    { id: 'annual-money', question: 'What does it suggest for money?', source: 'annual-money', part: 'lead' },
    { id: 'annual-connections', question: 'What does it suggest for love?', source: 'annual-connections', part: 'lead' },
    { id: 'annual-cycle-context', question: 'Which months have more supportive chart relationships?', source: 'annual-cycle-context', part: 'lead' },
    { id: 'annual-plan', question: 'Which months require closer attention?', source: 'annual-plan', part: 'lead' },
    { id: 'q-year-focus', question: 'What should I focus on most this year?', source: 'annual-plan', part: 'lead' },
  ],
  business: [
    { id: 'founder-style', question: 'Does my chart support business-oriented traits?', source: 'founder-style', part: 'lead' },
    { id: 'offer-test', question: 'What kind of business work suits me?', source: 'offer-test', part: 'lead' },
    { id: 'team-decisions', question: 'Am I better suited to working alone or with partners?', source: 'team-decisions', part: 'lead' },
    { id: 'customer-communication', question: 'When might expansion deserve a closer look?', source: 'customer-communication', part: 'lead' },
    { id: 'delivery-capacity', question: 'What financial risks should I understand?', source: 'delivery-capacity', part: 'lead-with-caution' },
    { id: 'business-chapters', question: 'What do my upcoming cycles suggest about business activity?', source: 'business-chapters', part: 'lead' },
    { id: 'business-plan', question: 'What should I be careful about in business?', source: 'business-plan', part: 'caution' },
  ],
  wellbeing: [
    { id: 'everyday-pace', question: 'What is my core personality?', source: 'everyday-pace', part: 'lead' },
    { id: 'visible-elements', question: 'Which parts of my nature stand out?', source: 'visible-elements', part: 'lead' },
    { id: 'workload-rhythm', question: 'What tends to put me under pressure?', source: 'workload-rhythm', part: 'lead' },
    { id: 'q-pressure', question: 'What should I watch for when pressure builds?', source: 'workload-rhythm', part: 'paragraph:0' },
    { id: 'support-and-space', question: 'What do I need most in relationships?', source: 'support-and-space', part: 'lead' },
    { id: 'balance-week', question: 'How can my strengths become blind spots?', source: 'balance-week', part: 'lead' },
    { id: 'q-balance-action', question: 'What boundary could help protect my everyday balance?', source: 'balance-week', part: 'action' },
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

export const COLLECTION_BUYER_QUESTIONS: Partial<Record<BuyerOutlineKind, BuyerQuestion[]>> = {
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
    { id: 'q-love-language', question: 'How do we express love differently?', source: 'close-conversation', part: 'paragraphs:0-1' },
    { id: 'chart-patterns', question: 'Where is closeness strongest, and where might daily routines be harder?', source: 'two-styles', part: 'paragraph:0' },
    { id: 'shared-week', question: 'What recurring tension should we watch for?', source: 'chart-patterns', part: 'lead' },
    { id: 'q-commitment', question: 'What does this connection ask of each of us?', source: 'shared-week', part: 'lead' },
    { id: 'support-each-other', question: 'Which upcoming periods may affect our relationship themes?', source: 'support-each-other', part: 'lead' },
    { id: 'q-connection-insight', question: 'What practical step could strengthen this connection?', source: 'shared-week', part: 'action' },
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
    { id: 'q-year-message', question: 'What should I do with this year’s main theme?', source: 'annual-theme', part: 'action' },
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

type CareerYearEvidence = { year: number; direction: string; workTension: boolean; work: string; money: string; stemGod: string }
export function applyBuyerQuestions(text: string, kind: BuyerOutlineKind, chapters: ReportChapter[], periods: CompleteReadingPeriod[] = [], set: 'standalone' | 'collection' = 'standalone', careerYears: CareerYearEvidence[] = []): string {
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
      } else if (kind === 'year' && question.id === 'q-year-focus') {
        const months = /^Put (.+?) first on your review list\./.exec(chapter.lead)?.[1]
        lead = months
          ? `Focus first on the overlapping commitments in ${months}; this is a review priority, not a prediction that those are bad months.`
          : `Focus on the specific work and money commitments named in each month; no single month stands out under the extra-care checks.`
        paragraphs = chapter.paragraphs.slice(0, 1)
      } else if (kind === 'business' && question.id === 'delivery-capacity') {
        const moneyPattern = chapter.lead.toLowerCase()
        lead = moneyPattern.includes('combines repeat customers with new deals')
          ? 'Your main financial risk is relying on new-deal income to cover ongoing delivery for repeat customers before payment is secure.'
          : moneyPattern.includes('repeat sales and clearly priced ongoing work')
            ? 'Your main financial risk is underpricing ongoing service: repeat sales can still require costs after payment.'
            : moneyPattern.includes('finding buyers and making deals')
              ? 'Your main financial risk is uneven cash flow: income depends on new buyers, so fees can vary between deals.'
            : moneyPattern.includes('business money signs sit behind the main role')
              ? 'Your main financial risk is setting business costs around sales before the less visible income route has been tested.'
              : moneyPattern.includes('does not give a clear direct business money route')
                ? 'Your main financial risk is taking on fixed costs before a direct business income route is clear.'
                : 'Your main financial risk is counting a promising deal as income before payment arrives.'
        paragraphs = chapter.paragraphs.filter(line => line !== chapter.lead).slice(0, 2)
      } else if (kind === 'compatibility' && question.id === 'q-conflict') {
        lead = chapter.paragraphs.find(line => /^(?:Your likely friction is|The clearest friction is)/.test(line)) ?? chapter.guidance.watchFor[0] ?? chapter.lead
        paragraphs = chapter.paragraphs.filter(line => line !== lead).slice(0, 3)
      } else if (kind === 'wellbeing' && question.id === 'q-pressure') {
        lead = chapter.paragraphs[0] ?? chapter.guidance.watchFor[0] ?? chapter.lead
        paragraphs = chapter.paragraphs.slice(1, 2)
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
      if (kind === 'career' && set === 'standalone') {
        const clean = (value: string) => value.replace(/^(?:Direct answer|What this means for you|Important timing|Bottom line):\s*/i, '').trim()
        const sourceChapter = byId.get(question.source)!
        if (question.id === 'work-chapters') {
          const years = careerYears.filter(item => item.year >= 1900)
          const changedYears = [...new Set(years.filter(item => item.workTension).map(item => item.year))]
          const yearRange = years.length ? `${years[0].year}–${years.at(-1)!.year}` : 'next ten years'
          const themeLanguage: Record<string, string> = {
            Independence: 'independent work', 'Shared resources': 'shared work', 'Steady output': 'reliable production', Expression: 'improving methods',
            'Regular income': 'predictable pay', 'Commercial openings': 'new customers and deals', 'Formal responsibility': 'defined responsibilities',
            'Decisive pressure': 'demanding assignments', 'Learning and support': 'training and guidance', 'Specialist insight': 'independent problem-solving',
          }
          const importantThemes = [...new Set(years.map(item => themeLanguage[item.stemGod] ?? item.stemGod.toLowerCase()).filter(Boolean))].slice(0, 3)
          const themeList = importantThemes.length < 2 ? importantThemes.join('')
            : importantThemes.length === 2 ? `${importantThemes[0]} and ${importantThemes[1]}`
              : `${importantThemes.slice(0, -1).join(', ')}, and ${importantThemes.at(-1)}`
          const conclusion = `The ${yearRange} comparisons show changing work themes, including ${themeList.toLowerCase() || 'different work demands'}. They do not show a steady rise in income.`
          const importantTiming = changedYears.length
            ? `Work may feel more demanding in ${changedYears.join(', ')}. Treat these as review points, not predicted setbacks.`
            : 'No year stands out for a stronger work challenge in the checked comparisons.'
          return [
            `Your Answer: ${conclusion}`,
            ...(changedYears.length ? [`Important Timing: ${importantTiming}`] : []),
          ]
        }
        if (question.id === 'feedback-and-boundaries') {
          const supportYears = [...new Set(careerYears.filter(item => item.direction === 'Potential support / outlet under the stated rule').map(item => item.year))]
          const themeLanguage: Record<string, string> = {
            Independence: 'independent work', 'Shared resources': 'shared work', 'Steady output': 'reliable production', Expression: 'improving methods',
            'Regular income': 'predictable pay', 'Commercial openings': 'new customers and deals', 'Formal responsibility': 'defined responsibilities',
            'Decisive pressure': 'demanding assignments', 'Learning and support': 'training and guidance', 'Specialist insight': 'independent problem-solving',
          }
          const otherThemes = [...new Set(careerYears.map(item => themeLanguage[item.stemGod]).filter(Boolean))].slice(0, 2)
          return [
            `Your Answer: ${supportYears.length
              ? 'The calculations identify possible periods of career support, but not a guaranteed date for financial improvement.'
              : 'The calculations do not identify a year when career or financial progress is likely to improve.'}`,
            ...(supportYears.length ? [
              `Important Timing: ${supportYears.join(', ')} are the checked work-support periods; they do not promise a raise or job change.`,
            ] : [
              `What This Means for You: The checked years include ${otherThemes.join(' and ') || 'other work themes'}, but none stands out as a clear period of extra support.`,
            ]),
          ]
        }
        const details = question.id === 'q-risk'
          ? [sourceChapter.lead, ...sourceChapter.paragraphs]
          : question.id === 'career-plan'
            ? sourceChapter.paragraphs
            : paragraphs
        const factualTiming = question.id === 'feedback-and-boundaries'
          ? sourceChapter.paragraphs.filter(line => /\b(?:19|20)\d{2}\b/.test(line))
          : question.id === 'career-plan'
            ? sourceChapter.paragraphs.filter(line => /\b(?:19|20)\d{2}\b/.test(line))
            : []
        const timing = [...new Set([...details.filter(line => /\b(?:19|20)\d{2}\b/.test(line)), ...factualTiming])]
        const readableTiming = timing.map(line => clean(line)
          .replace(/^Why (\d{4}) is highlighted here: /, '$1: ')
          .replace(/An adjustment pattern links this period with your work side\./i, 'A calculated link brings focus to work arrangements.')
          .replace(/A direct clash links this period with your work side\./i, 'A calculated tension touches your work area.')
          .replace(/the ten-year theme of/gi, 'the longer-cycle theme of')
          .replace(/This period brings/gi, 'This year adds'))
        const explanationCandidates = details.filter(line => !timing.includes(line) && !/^(?:About this reading|Reading basis):/i.test(line))
        const leadText = clean(lead)
        const supportYears = [...new Set(careerYears.filter(item => item.direction === 'Potential support / outlet under the stated rule').map(item => item.year))]
        const explanation = question.id === 'working-style'
          ? sourceChapter.tryThis || 'This chart pattern cannot identify the cause of a real-world money problem.'
          : question.id === 'q-risk'
            ? sourceChapter.paragraphs.at(-1) ?? 'Your chart does not establish the cause of a real financial setback; compare its work pattern with your actual terms and workload.'
          : question.id === 'feedback-and-boundaries'
            ? 'A chart cannot establish when your situation will improve. These annual comparisons only identify work themes to review; they do not predict higher income.'
            : explanationCandidates.find(line => clean(line) !== leadText) ?? sourceChapter.paragraphs.find(line => clean(line) !== leadText && !timing.includes(line) && !/^(?:About this reading|Reading basis):/i.test(line)) ?? sourceChapter.lead
        const conclusions: Record<string, string> = {
          'two-work-layers': leadText.includes('finding customers')
            ? 'Customer growth fits best when delivery stays within your control.'
            : leadText.includes('dependable products')
              ? 'Protect the time needed to deliver reliable work.'
              : leadText.includes('specialist')
                ? 'Focused problem-solving time is central to this career fit.'
                : leadText.includes('Negotiation')
                  ? 'Make your contribution and credit clear in shared work.'
                  : leadText.includes('Product improvement')
                    ? 'Room to improve methods is central to this career fit.'
                    : leadText.includes('defined responsibility')
                      ? 'Responsibility should come with the authority to act.'
                      : leadText.includes('Technical problem-solving')
                        ? 'The work needs clear authority as well as a demanding problem.'
                        : leadText.includes('Training, research')
                          ? 'Choose work where knowledge is used, not only accumulated.'
                : leadText.includes('reliable delivery')
                  ? 'Clear duties, hours and pay belong together in your best fit.'
                  : 'Choose a role whose daily tasks use the strength named above.',
          'proof-of-skill': lead.includes('Structured employment is better supported')
            ? 'The chart gives the clearer edge to a structured role.'
            : lead.includes('Independent work is better supported')
              ? 'The chart gives the clearer edge to self-directed paid work.'
              : lead.includes('supports both employment and independent work')
                ? 'Neither route has a clear edge in this chart.'
                : 'The chart leaves the work setting open.',
          'money-commitments': lead.includes('two routes')
            ? 'Your chart supports a dependable base plus a second route through projects or customers.'
            : lead.includes('Regular pay')
              ? 'Repeatable paid work has clearer support than relying on a single large deal.'
              : lead.includes('Customer-facing or project-based')
                ? 'Customer or deal income is the clearer route; settle payment terms first.'
                : lead.includes('less direct')
                  ? 'Specialist work behind the public-facing role is the clearest earning route to examine.'
                  : 'The chart does not settle an income route; use actual skills, demand and terms.',
          'working-style': lead.includes('training and support needs')
            ? 'Paid work and the support needed to do it may compete for the same resources.'
            : lead.includes('demanding responsibilities')
              ? 'The chart points to obligations growing faster than money kept.'
              : lead.includes('specific financial blocker')
                ? 'Less-visible income signs do not establish a real financial setback.'
              : lead.includes('less direct')
                ? 'The chart shows a less direct earning route, not a confirmed financial cause.'
                : lead.includes('broken earning route')
                  ? 'The checked signs do not point to a broken income route.'
                  : lead.includes('complete link')
                    ? 'The chart points to a gap between skill and paid work, not a known setback.'
                    : 'The chart does not identify a specific financial blockage.',
          'career-plan': lead.includes('Your chart places')
            ? 'The chart links your work pattern and earning theme, but does not set your pay.'
            : lead.includes('your work fit and earning pattern sit in different chart areas')
              ? 'Your best-fit work and earning signs occupy different parts of the chart.'
              : lead.includes('no direct money sign') || lead.includes('no direct money sign appears')
                ? 'The chart points to a work direction, not a pay model.'
                : lead.includes('clear, but the chart gives weaker support')
            ? 'Add responsibility only when time and support can carry it.'
            : lead.includes('less clear about how much work this can carry')
              ? 'Compare real role demands with the capacity available.'
              : 'Career fit and the way work is paid are separate clues.',
        }
        const practicalAction = question.id === 'q-risk'
          ? 'When progress feels blocked, check whether your target, daily workload, authority and pay fit together before taking on more.'
          : ''
        const answerText = question.id === 'feedback-and-boundaries'
          ? supportYears.length
            ? 'The chart shows possible periods of work support, but it cannot identify a guaranteed improvement date.'
            : 'The checked annual data do not show a clear period when career or money is likely to improve.'
          : question.id === 'q-risk' ? clean(practicalAction) : clean(lead)
        const questionTiming = question.id === 'feedback-and-boundaries'
          ? supportYears.length
            ? `Important Timing: The annual comparison flags ${supportYears.join(', ')} for possible support or useful output; this is not a promise of higher pay.`
            : undefined
          : undefined
        const repeatFinancialAnswer=question.id==='working-style'&&/specific financial blocker|Less-visible money indicators alone/i.test(leadText)
        const limitedIncomeAnswer=question.id==='money-commitments'&&/limited sign for (?:regular pay|customer or project income)/i.test(leadText)
        const omitBottomLine=question.id==='proof-of-skill'||question.id==='career-plan'||repeatFinancialAnswer||limitedIncomeAnswer
        const lines = [
          `Your Answer: ${answerText}`,
          ...(!repeatFinancialAnswer&&!limitedIncomeAnswer&&explanation && clean(explanation) !== answerText ? [`What This Means for You: ${clean(explanation)}`] : !repeatFinancialAnswer&&!limitedIncomeAnswer ? [`What This Means for You: Your chart's ${sourceChapter.id === 'feedback-and-boundaries' ? 'calculated work-period comparisons' : 'work pattern'} is the basis for this reading.`] : []),
          ...(questionTiming ? [questionTiming] : readableTiming.map(line => `Important Timing: ${line}`)),
          ...(!omitBottomLine ? [`Bottom Line: ${conclusions[question.id] ?? 'Compare the chart theme with the actual work, terms and costs.'}`] : []),
        ]
        return lines
      }
      if (chapter.paragraphs.includes(lead)) used.add(lead)
      for (const line of paragraphs) if (chapter.paragraphs.includes(line)) used.add(line)
      return [lead, ...paragraphs].filter((line, index, all) => all.indexOf(line) === index)
    }
    const firstAnswer = set === 'collection' ? [chapter.lead] : answer(questions[0])
    const extraAnswers = questions.slice(1).map(question => ({ question, lines: answer(question) }))
    const firstLines = [
      ...(set === 'collection' ? [chapter.lead] : firstAnswer),
      ...(kind === 'career' && set === 'standalone' ? [] : chapter.paragraphs.filter(line => !used.has(line) && !(kind === 'complete' && source === 'personality' && chapter.guidance.watchFor.includes(line)))),
    ]
    const answeredLines = [...firstLines, ...extraAnswers.flatMap(item => item.lines)]
    const guidance = kind === 'career' && set === 'standalone' ? [] : chapter.showGuidance === false ? [] : [
      ...(set === 'collection' ? (!extraAnswers.some(item => item.lines.includes(chapter.tryThis)) ? ['Practical point: ' + chapter.tryThis] : []) : (!answeredLines.includes(chapter.tryThis) ? ['Practical point: ' + chapter.tryThis] : [])),
      ...(set === 'collection' ? (!extraAnswers.some(item => chapter.guidance.watchFor.includes(item.lines[0])) ? ['Main caution: ' + chapter.guidance.watchFor.join(' ')] : []) : (!answeredLines.some(line => chapter.guidance.watchFor.includes(line)) ? ['Main caution: ' + chapter.guidance.watchFor.join(' ')] : [])),
    ]
    const qas = [
      `Question: ${questions[0].question}`,
      ...firstLines.map((line, index) => `${kind === 'career' && set === 'standalone' ? '' : index ? 'Answer detail: ' : 'Answer: '}${line}`),
      ...extraAnswers.flatMap(({ question, lines }) => [`Question: ${question.question}`, ...lines.map((line, index) => `${kind === 'career' && set === 'standalone' ? '' : index ? 'Answer detail: ' : 'Answer: '}${line}`)]),
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
