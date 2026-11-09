Warning: truncated output (original token count: 14169)
Total output lines: 598

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
    { id: 'balance-week', question: 'How can my strengths become blind spots?', source: 'ba…9169 tokens truncated…g together in your best fit.'
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
