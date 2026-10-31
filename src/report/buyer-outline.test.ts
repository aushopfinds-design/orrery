import { purchaseMonths } from './purchase-timing.ts'
import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { BUYER_OUTLINES, BUYER_QUESTIONS, COLLECTION_BUYER_QUESTIONS, applyBuyerQuestions } from './buyer-outline.ts'
import { deliveredChapter } from './report-delivery.ts'
const a = calculateSaju(CATEGORY_SCENARIOS[0].first), b = calculateSaju(CATEGORY_SCENARIOS[0].second)
describe('Buyer questions, not a repeated six-part technical template', () => {
  it.each(Object.keys(BUYER_OUTLINES) as (keyof typeof BUYER_OUTLINES)[])('%s uses its own titles and reading order without breaking chapter anchors', kind => {
    const report = kind === 'complete' ? buildCompleteReading(a, 2026) : buildCategoryReading(kind, a, { year: kind === 'year' ? 2027 : 2026, second: kind === 'compatibility' ? b : undefined })
    expect(report.chapters.map(c => c.id)).toEqual(BUYER_OUTLINES[kind].map(([id]) => id))
    expect(report.chapters.map(c => c.title.replace(/^\d+ · /, ''))).toEqual(BUYER_OUTLINES[kind].map(([, title]) => title))
    expect(report.chapters[0].paragraphs.join(' ')).not.toContain('A provisional month-led structure candidate')
    expect(report.chapters[0].evidence.join(' ')).toContain('Month hidden stem')
  })
  it('answers the twelve-month question with the actual selected window', () => {
    const report = buildCategoryReading('year', a, { year: 2027, periodStart: '2026-11' })
    const firstAnswer = report.chapters[0].lead
    expect(firstAnswer).toContain('November 2026 to October 2027')
    expect(firstAnswer).toContain('broad annual themes shift during that window')
    expect(firstAnswer).not.toMatch(/^2027 brings/)
    expect(report.months.map(month => month.label)).toEqual([
      'November 2026', 'December 2026', 'January 2027', 'February 2027', 'March 2027', 'April 2027',
      'May 2027', 'June 2027', 'July 2027', 'August 2027', 'September 2027', 'October 2027',
    ])
  })
  it('does not label a money-topic month a good month without the shared balance and friction checks', () => {
    const report = buildCategoryReading('year', a, { year: 2027 })
    const supportive = report.chapters.find(c => c.id === 'annual-cycle-context')!
    const selected = purchaseMonths(a,2027).filter(p => ['conditional-opening','opening-with-caution','conditional-support'].includes(p.status))
    if (!selected.length) expect(supportive.lead).toContain('None of the twelve monthly comparisons establishes a supported opening')
    for (const point of selected) expect(supportive.evidence.join(' ')).toContain(point.date)
    expect(report.months).toHaveLength(12)
  })
  it('answers work and money questions while keeping career and business topics separate', () => {
    const career = buildCategoryReading('career', a, { year: 2026 }), business = buildCategoryReading('business', a, { year: 2026 })
    for (const [report, id] of [[career, 'feedback-and-boundaries'], [career, 'work-chapters'], [business, 'offer-test'], [business, 'customer-communication']] as const) {
      const chapter = report.chapters.find(c => c.id === id)!
      expect(chapter.evidence.join(' ')).toContain('2026-07-15')
      expect(chapter.evidence.join(' ')).toContain('2030-07-15')
      expect(chapter.paragraphs.join(' ')).not.toMatch(/guaranteed promotion|guaranteed launch date/)
    }
  })
  it('keeps seven questions in each standalone report and maps compatibility answers to their own chart detail', () => {
    for (const kind of ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing'] as const) {
      expect(BUYER_QUESTIONS[kind]).toHaveLength(7)
    }
    const make = (id: string, lead: string, paragraphs: string[]) => ({
      id, title: id, lead, paragraphs, evidence: [], tryThis: 'Make one clear agreement.',
      guidance: { keepClose: ['Name what each person needs.'], watchFor: ['A generic caution.'] }, icon: 'personality',
    })
    const chapters = [
      make('two-directions', 'The chart comparison points to a shared attraction theme.', ['Person A is drawn to direct conversation.', 'Person B is drawn to practical care.']),
      make('two-styles', 'The two charts connect through complementary ways of offering care.', []),
      make('close-conversation', 'Person A needs listening; Person B needs practical help with listening.', [
        'Person A tends to express love through focused conversation.',
        'Person B tends to express love through reliable practical help.',
        'The private-life pattern shows different expectations.',
        'The clearest friction is when advice arrives before listening, or help arrives without checking what was asked for.',
      ]),
      make('chart-patterns', 'Private closeness is stronger than sharing a daily routine; attraction and practical agreements are different kinds of fit.', []),
      make('shared-week', 'This connection asks each person to make room for the other’s different needs.', [
        'The day comparison shows a private-life difference.',
        'The month comparison shows a different daily routine.',
        'Each person needs a clear voice in shared decisions.',
        'The main challenge is agreeing on time, duties and who follows through.',
      ]),
      make('support-each-other', 'The timing comparison highlights different personal themes in 2027.', []),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'compatibility', chapters)
    expect((report.match(/^Question:/gm) ?? [])).toHaveLength(7)
    expect(report).toContain('Question: How do we express love differently?\n\nAnswer: Person A tends to express love through focused conversation.\n\nAnswer detail: Person B tends to express love through reliable practical help.')
    expect(report).toContain('Question: What tends to cause friction between us?\n\nAnswer: The clearest friction is when advice arrives before listening, or help arrives without checking what was asked for.')
    expect(report).toContain('Question: What does this connection ask of each of us?\n\nAnswer: This connection asks each person to make room for the other’s different needs.')
    expect(report).toContain('Question: How do emotional closeness and everyday compatibility differ?\n\nAnswer: Private closeness is stronger than sharing a daily routine; attraction and practical agreements are different kinds of fit.')
    expect(report).not.toContain('Question: What tends to cause friction between us?\n\nAnswer: A generic caution.')
  })
  it('keeps ten collection questions and maps relationship answers to their matching details', () => {
    expect(COLLECTION_BUYER_QUESTIONS.compatibility).toHaveLength(10)
    const make = (id: string, lead: string, paragraphs: string[] = [], action = 'Make one clear agreement.') => ({
      id, title: id, lead, paragraphs, evidence: [], tryThis: action,
      guidance: { keepClose: [action], watchFor: ['A chart-specific caution.'] }, icon: 'personality' as const,
    })
    const chapters = [
      make('two-directions', 'Attraction can grow through reassurance.'),
      make('two-styles', 'Different care needs can fit together.', ['Private closeness is stronger than sharing a daily routine.']),
      make('close-conversation', 'You value listening; your partner values practical help.', [
        'You need time to finish a concern.',
        'Your partner needs undivided attention.',
        'The private-life patterns connect.',
        'The clearest friction is advice arriving before listening.',
      ]),
      make('chart-patterns', 'Your main tension is correcting before clarifying the problem.'),
      make('shared-week', 'This connection asks each person to make room for different needs.', [], 'Agree on who owns one shared task.'),
      make('support-each-other', 'Each person has a separate relationship timeline.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'compatibility', chapters, [], 'collection')
    expect((report.match(/^Question:/gm) ?? [])).toHaveLength(10)
    expect(report).toContain('Question: How do we express love differently?\n\nAnswer: You need time to finish a concern.\n\nAnswer detail: Your partner needs undivided attention.')
    expect(report).toContain('Question: Where is closeness strongest, and where might daily routines be harder?\n\nAnswer: Private closeness is stronger than sharing a daily routine.')
    expect(report).toContain('Question: What recurring tension should we watch for?\n\nAnswer: Your main tension is correcting before clarifying the problem.')
    expect(report).toContain('Question: What does this connection ask of each of us?\n\nAnswer: This connection asks each person to make room for different needs.')
    expect(report).toContain('Question: What practical step could strengthen this connection?\n\nAnswer: Agree on who owns one shared task.')
  })
  it('maps wellbeing questions to the chapter that answers each one', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], action = 'A chart-specific practical step.', caution = 'A chart reading cannot diagnose health.') => ({
      id, title: id, lead, paragraphs, evidence: [], tryThis: action,
      guidance: { keepClose: [action], watchFor: [caution] }, icon: 'personality' as const,
    })
    const chapters = [
      make('everyday-pace', 'A personalized temperament answer.'),
      make('visible-elements', 'A clear explanation of the visible element pattern.'),
      make('workload-rhythm', 'A personalized daily pressure pattern.', [], 'A chart-specific practical step.', 'Notice when a capable response is taking too much of your time.'),
      make('support-and-space', 'A relationship support need.'),
      make('balance-week', 'A strength and its matching blind spot.', [], 'Choose a routine that fits.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'wellbeing', chapters)
    expect((report.match(/^Question:/gm) ?? [])).toHaveLength(7)
    expect(report).toContain('Question: What should I watch for when pressure builds?\n\nAnswer: Notice when a capable response is taking too much of your time.')
    expect(report).toContain('Question: What boundary could help protect my everyday balance?\n\nAnswer: Choose a routine that fits.')
    expect(report).not.toContain('Question: What kind of environment brings out my best?')
  })

})
