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
export interface BuyerQuestion { id: string; question: string; source: string; part: AnswerPart; role: string }

/** Seven questions for the six standalone products. The collection keeps its existing question set. */
export const BUYER_QUESTIONS: Record<BuyerOutlineKind, BuyerQuestion[]> = {
  complete: [
    { id: 'personality', question: 'What kind of person am I?', source: 'personality', part: 'lead', role: 'identity' },
    { id: 'social', question: 'What helps me thrive, and what can hold me back?', source: 'social', part: 'lead-with-caution', role: 'strengths-and-limits' },
    { id: 'career', question: 'What kind of career suits me?', source: 'career', part: 'lead', role: 'career-fit' },
    { id: 'money', question: 'How does money work in my life?', source: 'money', part: 'lead', role: 'earning-pattern' },
    { id: 'love', question: 'What is my pattern in love?', source: 'love', part: 'lead', role: 'relationship-need' },
    { id: 'patterns', question: 'What are my biggest life challenges?', source: 'life-challenges', part: 'lead', role: 'recurring-challenge' },
    { id: 'q-turning-points', question: 'When may my life change direction?', source: 'patterns', part: 'turning-points', role: 'turning-point-timing' },
  ],
  career: [
    { id: 'two-work-layers', question: 'Which careers suit me best?', source: 'two-work-layers', part: 'lead', role: 'career-fit' },
    { id: 'proof-of-skill', question: 'Am I better suited to employment or independent work?', source: 'proof-of-skill', part: 'lead', role: 'work-structure-fit' },
    { id: 'money-commitments', question: 'How do I naturally make money?', source: 'money-commitments', part: 'lead', role: 'earning-route' },
    { id: 'working-style', question: 'What tends to block my financial progress?', source: 'working-style', part: 'lead', role: 'financial-blocker' },
    { id: 'feedback-and-boundaries', question: 'When might my career or money situation improve?', source: 'feedback-and-boundaries', part: 'lead', role: 'career-timing' },
    { id: 'work-chapters', question: 'What do the next ten years suggest for my work and money?', source: 'work-chapters', part: 'lead', role: 'long-cycle-work-theme' },
    { id: 'career-plan', question: 'What is the most important insight for my future?', source: 'career-plan', part: 'lead', role: 'career-priority' },
  ],
  compatibility: [
    { id: 'two-directions', question: 'Why are we attracted to each other?', source: 'two-directions', part: 'lead', role: 'attraction' },
    { id: 'two-styles', question: 'What makes us compatible?', source: 'two-styles', part: 'lead', role: 'overall-fit' },
    { id: 'q-conflict', question: 'What tends to cause friction between us?', source: 'close-conversation', part: 'paragraph:3', role: 'conflict-trigger' },
    { id: 'q-love-language', question: 'How do we express love differently?', source: 'close-conversation', part: 'paragraphs:2-3', role: 'care-expression' },
    { id: 'chart-patterns', question: 'How do emotional closeness and everyday compatibility differ?', source: 'chart-patterns', part: 'lead', role: 'closeness-vs-routine' },
    { id: 'shared-week', question: 'What does this connection ask of each of us?', source: 'shared-week', part: 'lead', role: 'mutual-adjustment' },
    { id: 'support-each-other', question: 'Which upcoming periods may affect our relationship themes?', source: 'support-each-other', part: 'lead', role: 'relationship-timing' },
  ],
  year: [
    { id: 'annual-theme', question: 'What is the overall theme of my next 12 months?', source: 'annual-theme', part: 'lead', role: 'year-overview' },
    { id: 'annual-work', question: 'What does this period suggest for my career?', source: 'annual-work', part: 'lead', role: 'career-theme' },
    { id: 'annual-money', question: 'What does it suggest for money?', source: 'annual-money', part: 'lead', role: 'money-theme' },
    { id: 'annual-connections', question: 'What does it suggest for love?', source: 'annual-connections', part: 'lead', role: 'relationship-theme' },
    { id: 'annual-cycle-context', question: 'Which months have more supportive chart relationships?', source: 'annual-cycle-context', part: 'lead', role: 'supportive-months' },
    { id: 'annual-plan', question: 'Which months require closer attention?', source: 'annual-plan', part: 'lead', role: 'caution-months' },
    { id: 'q-year-focus', question: 'What should I focus on most this year?', source: 'annual-plan', part: 'action', role: 'year-priority' },
  ],
  business: [
    { id: 'founder-style', question: 'Does my chart support business-oriented traits?', source: 'founder-style', part: 'lead', role: 'business-fit' },
    { id: 'offer-test', question: 'What kind of business work suits me?', source: 'offer-test', part: 'lead', role: 'offer-and-work-style' },
    { id: 'team-decisions', question: 'Am I better suited to working alone or with partners?', source: 'team-decisions', part: 'lead', role: 'partner-fit' },
    { id: 'customer-communication', question: 'When might expansion deserve a closer look?', source: 'customer-communication', part: 'lead', role: 'expansion-timing' },
    { id: 'delivery-capacity', question: 'What financial risks should I understand?', source: 'delivery-capacity', part: 'lead-with-caution', role: 'financial-risk' },
    { id: 'business-chapters', question: 'What do my upcoming cycles suggest about business activity?', source: 'business-chapters', part: 'lead', role: 'business-cycle' },
    { id: 'business-plan', question: 'What should I be careful about in business?', source: 'business-plan', part: 'caution', role: 'business-caution' },
  ],
  wellbeing: [
    { id: 'everyday-pace', question: 'What is my core personality?', source: 'everyday-pace', part: 'lead', role: 'core-personality' },
    { id: 'visible-elements', question: 'Which parts of my nature stand out?', source: 'visible-elements', part: 'lead', role: 'distinctive-traits' },
    { id: 'workload-rhythm', question: 'What tends to put me under pressure?', source: 'workload-rhythm', part: 'lead', role: 'pressure-trigger' },
    { id: 'q-pressure', question: 'What should I watch for when pressure builds?', source: 'workload-rhythm', part: 'paragraph:1', role: 'pressure-response' },
    { id: 'support-and-space', question: 'What do I need most in relationships?', source: 'support-and-space', part: 'lead', role: 'relationship-need' },
    { id: 'balance-week', question: 'How can my strengths become blind spots?', source: 'balance-week', part: 'lead', role: 'strength-blindspot' },
    { id: 'q-balance-action', question: 'What boundary could help protect my everyday balance?', source: 'balance-week', part: 'action', role: 'daily-boundary' },
  ],
  // This category is included only inside the collection, so it keeps its existing set.
  love: [
    { id: 'love-style', question: 'How do I tend to approach love?', source: 'love-style', part: 'lead', role: 'love-approach' },
    { id: 'love-needs', question: 'What helps me feel secure in a relationship?', source: 'love-needs', part: 'lead', role: 'security-need' },
    { id: 'love-attraction', question: 'What kind of connection suits me?', source: 'love-attraction', part: 'lead', role: 'attraction-pattern' },
    { id: 'love-friction', question: 'What relationship patterns may cause conflict?', source: 'love-friction', part: 'lead', role: 'conflict-pattern' },
    { id: 'q-love-strength', question: 'What is one of my strengths as a partner?', source: 'love-patterns', part: 'lead', role: 'partner-strength' },
    { id: 'love-timing', question: 'When may relationship priorities shift?', source: 'love-timing', part: 'lead', role: 'relationship-timing' },
    { id: 'love-outlook', question: 'What can help me build a relationship that fits?', source: 'love-outlook', part: 'lead', role: 'relationship-fit' },
    { id: 'q-love-friction-detail', question: 'Why might this pattern repeat?', source: 'love-friction', part: 'paragraph:0', role: 'pattern-origin' },
    { id: 'q-love-need-detail', question: 'What kind of care matters most to me?', source: 'love-needs', part: 'paragraph:0', role: 'care-need' },
    { id: 'q-love-timing-detail', question: 'What should I pay attention to in those periods?', source: 'love-timing', part: 'paragraph:0', role: 'timing-attention' },
  ],
}

export const COLLECTION_BUYER_QUESTIONS: Partial<Record<BuyerOutlineKind, BuyerQuestion[]>> = {
  complete: [
    { id: 'personality', question: 'What kind of person am I?', source: 'personality', part: 'lead', role: 'integrated-identity' },
    { id: 'social', question: 'What are my greatest strengths?', source: 'social', part: 'lead', role: 'core-strengths' },
    { id: 'q-hidden-weakness', question: 'What are my hidden weaknesses?', source: 'social', part: 'caution', role: 'hidden-limits' },
    { id: 'career', question: 'What kind of career suits me?', source: 'career', part: 'lead', role: 'career-direction' },
    { id: 'money', question: 'How does money work in my life?', source: 'money', part: 'lead', role: 'money-pattern' },
    { id: 'love', question: 'What is my pattern in love?', source: 'love', part: 'lead', role: 'relationship-pattern' },
    { id: 'patterns', question: 'What are my biggest life challenges?', source: 'life-challenges', part: 'lead', role: 'recurring-challenge' },
    { id: 'q-turning-points', question: 'When are my major turning points?', source: 'patterns', part: 'turning-points', role: 'turning-point-timing' },
    { id: 'q-next-cycle', question: 'What does my next ten-year cycle suggest?', source: 'patterns', part: 'next-cycle', role: 'long-cycle-theme' },
    { id: 'balance', question: 'What is the most important insight about my life?', source: 'balance', part: 'lead', role: 'life-synthesis' },
  ],
  career: [
    { id: 'two-work-layers', question: 'Which careers suit me best?', source: 'two-work-layers', part: 'lead', role: 'career-fit' },
    { id: 'proof-of-skill', question: 'Am I better suited to employment or independent work?', source: 'proof-of-skill', part: 'lead', role: 'work-structure-fit' },
    { id: 'money-commitments', question: 'How do I naturally make money?', source: 'money-commitments', part: 'lead', role: 'earning-route' },
    { id: 'q-earning-strength', question: 'What are my strongest earning abilities?', source: 'money-commitments', part: 'paragraph:0', role: 'earning-strength' },
    { id: 'q-earning-keeping', question: 'Am I better at earning money or keeping it?', source: 'money-commitments', part: 'paragraph:1', role: 'money-retention' },
    { id: 'working-style', question: 'What tends to block my financial progress?', source: 'working-style', part: 'lead', role: 'financial-blocker' },
    { id: 'q-risk', question: 'What should I know about financial risk?', source: 'working-style', part: 'caution', role: 'financial-risk' },
    { id: 'feedback-and-boundaries', question: 'Which upcoming periods deserve attention?', source: 'feedback-and-boundaries', part: 'lead', role: 'career-timing' },
    { id: 'work-chapters', question: 'How do my ten-year cycles affect work and money?', source: 'work-chapters', part: 'lead', role: 'long-cycle-work-theme' },
    { id: 'career-plan', question: 'What is my most important money and career insight?', source: 'career-plan', part: 'lead', role: 'career-money-synthesis' },
  ],
  compatibility: [
    { id: 'two-directions', question: 'Why are we attracted to each other?', source: 'two-directions', part: 'lead', role: 'attraction' },
    { id: 'two-styles', question: 'What makes us compatible?', source: 'two-styles', part: 'lead', role: 'overall-fit' },
    { id: 'close-conversation', question: 'Where are we different?', source: 'close-conversation', part: 'lead', role: 'key-difference' },
    { id: 'q-conflict', question: 'What causes conflict between us?', source: 'close-conversation', part: 'caution', role: 'conflict-trigger' },
    { id: 'q-love-language', question: 'How do we express love differently?', source: 'close-conversation', part: 'paragraphs:0-1', role: 'care-expression' },
    { id: 'chart-patterns', question: 'Where is closeness strongest, and where might daily routines be harder?', source: 'two-styles', part: 'paragraph:0', role: 'closeness-vs-routine' },
    { id: 'shared-week', question: 'What recurring tension should we watch for?', source: 'chart-patterns', part: 'lead', role: 'recurring-tension' },
    { id: 'q-commitment', question: 'What does this connection ask of each of us?', source: 'shared-week', part: 'lead', role: 'mutual-adjustment' },
    { id: 'support-each-other', question: 'Which upcoming periods may affect our relationship themes?', source: 'support-each-other', part: 'lead', role: 'relationship-timing' },
    { id: 'q-connection-insight', question: 'What practical step could strengthen this connection?', source: 'shared-week', part: 'action', role: 'practical-connection-step' },
  ],
  year: [
    { id: 'annual-theme', question: 'What is the overall theme of my next 12 months?', source: 'annual-theme', part: 'lead', role: 'year-overview' },
    { id: 'annual-work', question: 'What does this period suggest for my career?', source: 'annual-work', part: 'lead', role: 'career-theme' },
    { id: 'annual-money', question: 'What does it suggest for money?', source: 'annual-money', part: 'lead', role: 'money-theme' },
    { id: 'annual-connections', question: 'What does it suggest for love?', source: 'annual-connections', part: 'lead', role: 'relationship-theme' },
    { id: 'annual-cycle-context', question: 'Which months have more supportive chart relationships?', source: 'annual-cycle-context', part: 'lead', role: 'supportive-months' },
    { id: 'annual-plan', question: 'Which months require closer attention?', source: 'annual-plan', part: 'lead', role: 'caution-months' },
    { id: 'q-work-shift', question: 'When may work or money themes shift?', source: 'annual-work', part: 'paragraph:0', role: 'career-timing' },
    { id: 'q-relationship-themes', question: 'What relationship themes appear during this period?', source: 'annual-connections', part: 'paragraph:0', role: 'relationship-timing' },
    { id: 'q-key-periods', question: 'What are the three most important periods to understand?', source: 'annual-cycle-context', part: 'paragraph:0', role: 'key-periods' },
    { id: 'q-year-message', question: 'What should I do with this year’s main theme?', source: 'annual-theme', part: 'action', role: 'year-priority' },
  ],
  love: [
    { id: 'love-style', question: 'How do I tend to approach love?', source: 'love-style', part: 'lead', role: 'love-approach' },
    { id: 'love-needs', question: 'What helps me feel secure in a relationship?', source: 'love-needs', part: 'lead', role: 'security-need' },
    { id: 'love-attraction', question: 'What kind of connection suits me?', source: 'love-attraction', part: 'lead', role: 'attraction-pattern' },
    { id: 'love-friction', question: 'What relationship patterns may cause conflict?', source: 'love-friction', part: 'lead', role: 'conflict-pattern' },
    { id: 'q-love-strength', question: 'What is one of my strengths as a partner?', source: 'love-patterns', part: 'lead', role: 'partner-strength' },
    { id: 'love-timing', question: 'When may relationship priorities shift?', source: 'love-timing', part: 'lead', role: 'relationship-timing' },
    { id: 'love-outlook', question: 'What can help me build a relationship that fits?', source: 'love-outlook', part: 'lead', role: 'relationship-fit' },
    { id: 'q-love-friction-detail', question: 'Why might this pattern repeat?', source: 'love-friction', part: 'paragraph:0', role: 'pattern-origin' },
    { id: 'q-love-need-detail', question: 'What kind of care matters most to me?', source: 'love-needs', part: 'paragraph:0', role: 'care-need' },
    { id: 'q-love-timing-detail', question: 'What should I pay attention to in those periods?', source: 'love-timing', part: 'paragraph:0', role: 'timing-attention' },
  ],
}

type CareerYearEvidence = { year: number; direction: string; workTension: boolean; work: string; money: string; stemGod: string }
export function applyBuyerQuestions(text: string, kind: BuyerOutlineKind, chapters: ReportChapter[], periods: CompleteReadingPeriod[] = [], set: 'standalone' | 'collection' = 'standalone', careerYears: CareerYearEvidence[] = [], questionTitles: Record<string, string> = {}): string {
  const byId = new Map(chapters.map(chapter => [chapter.id, chapter]))
  const buyerQuestions = set === 'collection' ? COLLECTION_BUYER_QUESTIONS[kind] ?? BUYER_QUESTIONS[kind] : BUYER_QUESTIONS[kind]
  const questionsBySource = new Map<string, BuyerQuestion[]>()
  for (const question of buyerQuestions) {
    // The annual focus question draws its action from the annual-theme chapter,
    // while remaining next to the annual-plan chapter in the delivered order.
    const source = kind === 'year' && question.role === 'year-priority' ? 'annual-theme' : question.source
    if (!byId.has(source)) throw new Error(`Missing answer source: ${kind}/${source}`)
    questionsBySource.set(source, [...(questionsBySource.get(source) ?? []), question])
  }
  for (const [source, questions] of questionsBySource) {
    const chapter = byId.get(source)!, used = new Set<string>()
    const answer = (question: BuyerQuestion) => {
      let lead = chapter.lead
      let paragraphs: string[] = []
      if (kind === 'complete' && question.id === 'balance') {
        lead = `The most important life insight is that ${chapter.lead.charAt(0).toLowerCase()}${chapter.lead.slice(1)}`
      } else if (kind === 'year' && question.role === 'year-priority') {
        lead = byId.get('annual-theme')?.tryThis ?? chapter.tryThis
        // Make the answer a clear, self-contained takeaway rather than
        // repeating the same "focus" wording in the next sentence.
        if (/^Focus on the chart-linked work theme for this year:/i.test(lead)) {
          lead = lead.replace(/^Focus on the chart-linked work theme for this year: /i, 'The chart’s main work theme is ')
          lead = lead.replace(/ Check that duties and standards are clear\.?$/i, '').replace(/ Check that roles define your duties and standards, while leaving time for close relationships\.?$/i, '')
        }
        paragraphs = []
      } else if (kind === 'year' && question.role === 'career-theme') {
        // Keep the yearly career conclusion, its annual work reason and the
        // personal baseline. The separate timing question keeps its own date.
        paragraphs = chapter.paragraphs.slice(0, 2)
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'year' && question.role === 'year-overview') {
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'year' && question.role === 'money-theme') {
        const annualBasis = chapter.paragraphs[0]
        const monthTheme = chapter.paragraphs[2]
        paragraphs = annualBasis && monthTheme ? [`${annualBasis} ${monthTheme}`] : [annualBasis ?? monthTheme].filter((line): line is string => Boolean(line))
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'year' && question.role === 'relationship-theme') {
        paragraphs = chapter.paragraphs.slice(0, 2)
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'year' && question.role === 'supportive-months') {
        paragraphs = chapter.paragraphs.length ? [chapter.paragraphs.slice(0, 3).join(' ')] : []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'business' && question.role === 'partner-fit') {
        paragraphs = chapter.paragraphs.slice(0, 1)
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'business' && question.role === 'expansion-timing') {
        paragraphs = chapter.paragraphs.slice(0, 1)
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'compatibility' && question.role === 'attraction' && set === 'standalone') {
        const perspectives = [chapter.lead, ...chapter.paragraphs]
        const yours = perspectives.find(line => /^From your side:|^You:/.test(line))
        const theirs = perspectives.find(line => /^From your partner(?:'|’)s side:|^Your partner:/.test(line))
        const privateConnection = chapter.paragraphs.find(line => /^The day signs (?:also|show)/.test(line))
        const cleanPerspective = (line: string | undefined, prefix: RegExp) => line?.replace(prefix, '').replace(/^(?:The )?attraction may be\s*/i, '').replace(/\s+stand out[.!?]*$/i, '').replace(/[.!?]+$/u, '').trim().replace(/^(.+?) may feel (.+)$/i, '$1 that feels $2').replace(/^./u, char => char.toLowerCase())
        if (yours && theirs) {
          const yourDraw = cleanPerspective(yours, /^(?:From your side:|You:)\s*/)
          const partnerDraw = cleanPerspective(theirs, /^(?:From your partner(?:'|’)s side:|Your partner:)\s*/)
          lead = yourDraw === partnerDraw
            ? `Both chart directions point to a shared draw toward ${yourDraw}. This may be part of the attraction, but the chart cannot confirm either person’s actual feelings.`
            : `The chart points to two different possible draws: you may value ${yourDraw}; your partner may value ${partnerDraw}. This describes chart themes, not proof of either person’s actual feelings.`
          if (privateConnection) lead += ` ${privateConnection}`
        }
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'compatibility' && question.role === 'overall-fit') {
        // The opening answer gives the overall fit; the detailed private-life
        // comparison belongs in Q5 and should not be repeated here.
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'compatibility' && question.role === 'closeness-vs-routine' && set === 'standalone') {
        // This question asks for a comparison of two kinds of fit. Keep the
        // source's direct comparison and leave friction in its own answer.
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'compatibility' && question.role === 'mutual-adjustment' && set === 'standalone') {
        // Keep the final answer focused on what each person can adjust; earlier
        // answers already cover needs, pressure patterns and day/routine links.
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'wellbeing' && question.role === 'core-personality') {
        paragraphs = chapter.paragraphs.slice(0, 2)
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'wellbeing' && question.role === 'distinctive-traits') {
        // Use the personal interpretation that connects work and relationships;
        // the element-count discussion belongs with the chart explanation.
        lead = chapter.paragraphs.find(line => /public role|work role|parts of your nature/i.test(line)) ?? chapter.lead
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'wellbeing' && question.role === 'daily-boundary') {
        const pressure = byId.get('workload-rhythm')?.paragraphs.find(line => line.startsWith('The pressure to watch is '))
        lead = `Set a limit on new requests: agree what will wait before accepting added work. ${pressure ?? 'Your chart points to a specific work pattern to watch as demands build.'}`
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'wellbeing' && question.role === 'pressure-trigger') {
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'business' && question.role === 'financial-risk') {
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
      } else if (kind === 'compatibility' && question.role === 'conflict-trigger') {
        const friction = chapter.paragraphs.find(line => /^(?:Your likely friction is|The practical tension for Person A is)/.test(line))
        lead = friction?.startsWith('Your likely friction is')
          ? (() => {
              const parts = friction.match(/^Your likely friction is (.*?); your partner’s is (.*?)\.$/)
              if (!parts) return friction.replace(/^Your likely friction is /, 'The likely friction is ')
              if (parts[1].toLowerCase() === parts[2].toLowerCase()) return `You may both react to tension by ${parts[1]}. Because this pattern is shared, say what help you want before either of you tries to solve the problem.`
              return `Your friction point is ${parts[1]}. For your partner, tension may arise from ${parts[2]}.`
            })()
          : friction
            ? `A likely friction point is ${friction.split('Person A is ')[1]?.split(';')[0] ?? 'a difference in private-life preferences'} for Person A, and ${friction.split('for Person B it is ')[1]?.split('.')[0] ?? 'a different reading of the same situation'} for Person B.`
            : chapter.paragraphs.find(line => /^Your partner: /.test(line)) ?? chapter.paragraphs[3] ?? chapter.guidance.watchFor[0] ?? chapter.lead
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'compatibility' && question.role === 'relationship-timing' && set === 'standalone') {
        // The year comparison is the answer; keep its tailored action below,
        // without repeating another general relationship explanation.
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'compatibility' && question.role === 'care-expression') {
        const firstCare = chapter.paragraphs.find(line => /^You: /.test(line))
        const secondCare = chapter.paragraphs.find(line => /^Your partner: /.test(line))
        const careStyle = (line: string, prefix: RegExp) => line.replace(prefix, '').split(/(?<=[.!?])\s/)[0]
        const yourCare = firstCare ? careStyle(firstCare, /^You: /) : ''
        const partnerCare = secondCare ? careStyle(secondCare, /^Your partner: /) : ''
        lead = firstCare && secondCare
          ? yourCare === partnerCare
            ? `The chart points to a shared care style. You: ${yourCare} Your partner: ${partnerCare}`
            : `The chart suggests different care styles. You: ${yourCare} Your partner: ${partnerCare}`
          : `${chapter.paragraphs[0] ?? 'Your chart gives one clue about how care may be recognised.'} ${chapter.paragraphs[1] ?? 'Your partner’s chart gives a separate clue.'}`
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
        paragraphs = []
      } else if (kind === 'wellbeing' && question.role === 'pressure-response') {
        // Keep this answer about the response as pressure builds, separate
        // from Q3's trigger and Q1's general personality description.
        const warning = chapter.paragraphs.find(line => /^A distinct daily pressure response is /i.test(line))
          ?? chapter.paragraphs.find(line => /^(?:The pressure to watch is|Under pressure, watch for|As demands build|Under pressure, you may)/i.test(line))
          ?? chapter.guidance.watchFor.find(line => line !== chapter.lead && !chapter.paragraphs.includes(line))
          ?? chapter.guidance.watchFor[0]
          ?? chapter.paragraphs[0]
          ?? chapter.lead
        lead = warning.replace(/^The pressure to watch is that\s*/i, 'As pressure builds, ').replace(/^The pressure to watch is\s*/i, 'As pressure builds, ').replace(/^Under pressure, watch for\s*/i, 'As pressure builds, ').replace(/\s+This theme appears in both parts of your birth-month reading, so it may keep coming up in your routine\./i, '. This can recur in your routine because the same theme appears in both parts of your birth-month reading.')
          .replace(/^A distinct daily pressure response is /i, 'As pressure builds, ')
        paragraphs = []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'wellbeing' && question.role === 'relationship-need') {
        const support = chapter.paragraphs.find(line => line.startsWith('The support that suits this side'))
        paragraphs = support ? [support.split(/\s+The setting matters too:/i)[0]] : []
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'complete' && question.role === 'strengths-and-limits') {
        lead = chapter.lead
        paragraphs = chapter.paragraphs.slice(0, 2)
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'business' && question.id === 'business-plan') {
        const timingLines = chapter.paragraphs.filter(line => /^Why \d{4} is highlighted here/.test(line))
        const years = [...new Set(timingLines.map(line => /^Why (\d{4})/.exec(line)?.[1]).filter((year): year is string => Boolean(year)))]
        lead = years.length
          ? `Review ${years.join(', ')} before taking on larger business commitments; the checked annual comparison flags added demands in those years, not a forecast of failure.`
          : chapter.paragraphs.find(line => /^Give commitments in|^No period stands out/.test(line)) ?? chapter.guidance.watchFor[0] ?? chapter.lead
        paragraphs = timingLines.slice(0, 3).map(line => line.replace(/^Why (\d{4}) is highlighted here: /, '$1: '))
        chapter.paragraphs.forEach(line => used.add(line))
      } else if (kind === 'business' && question.id === 'business-chapters') {
        const cycles = chapter.paragraphs.filter(line => /^From the calculated start |^No current or upcoming ten-year cycle/.test(line))
        const years = chapter.paragraphs.filter(line => /^\d{4}:/.test(line))
        lead = cycles.length
          ? `The calculated business-cycle emphasis is: ${cycles.slice(0, 2).join(' ')}`
          : 'No ten-year cycle starts within the period this chart can calculate, so there is no supported long-range business phase to name. Use the annual business comparisons in this report for the available timing detail; they do not establish a launch date.'
        paragraphs = years.filter(line => /Opening|extra pressure|extra-care|caution/i.test(line)).slice(0, 3).map(line => line.split(/(?<=[.!?])\s/).slice(0, 2).join(' '))
        chapter.paragraphs.forEach(line => used.add(line))
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
        const selectedYears = chapter.paragraphs.filter(line => /^Why \d{4}/.test(line)).slice(0, kind === 'complete' ? 1 : 3)
        if (set === 'standalone' && kind === 'complete') {
          lead = chapter.lead
          // Keep Q7 focused on its strongest annual comparison. Full cycle
          // details remain in the report's dedicated timing chapters.
          // The lead already names the selected year and explains its theme;
          // retain only the follow-up implication, not a second restatement.
          paragraphs = selectedYears.map(line => line.replace(/^Why \d{4}[^:]*:\s*/, '').split(/(?<=[.!?])\s/).slice(1).join(' ')).filter(Boolean)
          chapter.paragraphs.forEach(line => used.add(line))
        } else {
          lead = chapter.lead
          const nextCycle = periods[1]
          paragraphs = [...chapter.paragraphs.filter(line => /\b20\d\d\b/.test(line)), ...(set === 'standalone' && nextCycle ? [`Your next ten-year cycle is ${nextCycle.period} (${nextCycle.pillar}). ${nextCycle.paragraphs[1] ?? nextCycle.paragraphs[0]}`] : [])]
        }
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
          const conclusion = `Your ${yearRange} outlook is mixed: work themes change, but the comparisons do not show a steady rise in income. The main themes include ${themeList.toLowerCase() || 'different work demands'}.`
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
          const checkedYears = [...new Set(careerYears.map(item => item.year).filter(year => year >= 1900))].sort((a, b) => a - b)
          const checkedRange = checkedYears.length ? `${checkedYears[0]}–${checkedYears.at(-1)}` : ''
          const themeLanguage: Record<string, string> = {
            Independence: 'independent work', 'Shared resources': 'shared work', 'Steady output': 'reliable production', Expression: 'improving methods',
            'Regular income': 'predictable pay', 'Commercial openings': 'new customers and deals', 'Formal responsibility': 'defined responsibilities',
            'Decisive pressure': 'demanding assignments', 'Learning and support': 'training and guidance', 'Specialist insight': 'independent problem-solving',
          }
          const otherThemes = [...new Set(careerYears.map(item => themeLanguage[item.stemGod]).filter(Boolean))].slice(0, 2)
          return [
            `Your Answer: ${supportYears.length
              ? `I cannot confirm a date when your career or finances will improve. Within the checked years${checkedRange ? ` (${checkedRange})` : ''}, ${supportYears.join(', ')} show possible support for work efforts, not a promised raise or job change.`
              : `I cannot identify a reliable improvement year${checkedRange ? ` within ${checkedRange}` : ''}. No checked year stands out; the annual comparisons emphasize ${otherThemes.join(' and ') || 'work themes to review'}, which do not establish a pay rise.`}`,
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
          ? /training (?:and|or) support/i.test(leadText)
            ? 'The chart points to a possible squeeze between paid work and the preparation or help needed to do it well; it cannot establish the cause of a real setback.'
            : sourceChapter.tryThis || 'This chart pattern cannot identify the cause of a real-world money problem.'
          : question.id === 'q-risk'
            ? sourceChapter.paragraphs.at(-1) ?? 'Your chart does not establish the cause of a real financial setback; compare its work pattern with your actual terms and workload.'
          : question.id === 'feedback-and-boundaries'
            ? 'Use the named years to review real work options and their pay terms; the chart cannot establish that circumstances or income will improve.'
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
          'working-style': lead.includes('possible pressure is the time or cost of training and support')
            ? 'A possible work/support cost pressure appears, but the chart cannot confirm it is a real financial blocker.'
            : lead.includes('training and support needs')
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
        const workSettingCheck = question.id === 'proof-of-skill'
          ? 'For a real choice, compare confirmed salary, hours and support in a job with paying customers, costs and payment terms in independent work.'
          : undefined
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
        const repeatFinancialAnswer=question.id==='working-style'
        const limitedIncomeAnswer=question.id==='money-commitments'&&/limited (?:sign|clue)(?: for| toward) (?:regular pay|customer or project income)/i.test(leadText)
        const omitBottomLine=question.id==='proof-of-skill'||question.id==='career-plan'||repeatFinancialAnswer||limitedIncomeAnswer
        const lines = [
          `Your Answer: ${answerText}`,
          ...(!repeatFinancialAnswer&&!limitedIncomeAnswer&&explanation && clean(explanation) !== answerText ? [`What This Means for You: ${clean(explanation)}`] : !repeatFinancialAnswer&&!limitedIncomeAnswer ? [`What This Means for You: Your chart's ${sourceChapter.id === 'feedback-and-boundaries' ? 'calculated work-period comparisons' : 'work pattern'} is the basis for this reading.`] : []),
          ...(workSettingCheck ? [`Practical Check: ${workSettingCheck}`] : []),
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
    const practicalOnly = (kind === 'business' && ['partner-fit', 'expansion-timing'].includes(questions[0].role))
      || (kind === 'compatibility' && ['mutual-adjustment', 'overall-fit', 'closeness-vs-routine', 'relationship-timing', 'care-expression'].includes(questions[0].role))
      || kind === 'compatibility' && questions.some(question => question.role === 'care-expression')
      || (kind === 'wellbeing' && ['pressure-response', 'relationship-need'].includes(questions.at(-1)?.role ?? ''))
    const suppressAllGuidance = kind === 'compatibility' && ['attraction', 'overall-fit'].includes(questions[0].role)
      || kind === 'compatibility' && questions[0].role === 'overall-fit'
    const suppressGuidance = kind === 'year' && ['annual-work', 'annual-money', 'annual-connections', 'annual-cycle-context'].includes(source)
      || kind === 'year' && questions.some(question => question.role === 'year-overview')
      || kind === 'year' && source === 'annual-plan' && questions[0].role === 'caution-months'
      || kind === 'business' && questions[0].role === 'financial-risk'
      || kind === 'business' && questions[0].role === 'business-cycle'
      || kind === 'business' && questions[0].role === 'business-caution'
    const guidance = kind === 'career' && set === 'standalone' || suppressGuidance || suppressAllGuidance
      || kind === 'wellbeing' && ['core-personality', 'distinctive-traits', 'pressure-trigger'].includes(questions[0].role)
      ? [] : chapter.showGuidance === false ? [] : [
        ...(set === 'collection' ? (!extraAnswers.some(item => item.lines.includes(chapter.tryThis)) ? ['Practical point: ' + chapter.tryThis] : []) : (!answeredLines.includes(chapter.tryThis) ? ['Practical point: ' + chapter.tryThis] : [])),
        ...(!practicalOnly ? (set === 'collection' ? (!extraAnswers.some(item => chapter.guidance.watchFor.includes(item.lines[0])) ? ['Main caution: ' + chapter.guidance.watchFor.join(' ')] : []) : (!answeredLines.some(line => chapter.guidance.watchFor.includes(line)) ? ['Main caution: ' + chapter.guidance.watchFor.join(' ')] : [])) : []),
      ]
    const qas = [
      `Question: ${questionTitles[questions[0].id] ?? questions[0].question}`,
      ...firstLines.map((line, index) => `${kind === 'career' && set === 'standalone' ? '' : index ? 'Answer detail: ' : 'Answer: '}${line}`),
      ...extraAnswers.flatMap(({ question, lines }) => [`Question: ${questionTitles[question.id] ?? question.question}`, ...lines.map((line, index) => `${kind === 'career' && set === 'standalone' ? '' : index ? 'Answer detail: ' : 'Answer: '}${line}`)]),
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
