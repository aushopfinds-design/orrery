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
  it('explains the chart context for attraction in plain language', () => {
    const reading = buildCategoryReading('compatibility', a, { second: b, year: 2026 })
    const report = applyBuyerQuestions(reading.fullText, 'compatibility', reading.chapters, [], 'standalone')
    expect(report).toContain('The private-life comparison adds no clear connection or conflict')
    expect(report).toContain('That overlap is your clearest point of fit; the personal-life signs add no separate connection or conflict.')
    expect(report).toMatch(/Question: Why are we attracted to each other\?[\s\S]*Answer: You may be drawn to what your partner brings:/)
    expect(report).toContain('Your partner may be drawn to what you bring: fresh ideas and open communication.')
    expect(report).not.toContain('during a disagreement in you')
  })
  it('gives every question a distinct answer role within its product', () => {
    for (const [kind, questions] of Object.entries(BUYER_QUESTIONS)) {
      expect(questions.every(question => question.role.trim().length > 0), `${kind} missing role`).toBe(true)
      expect(new Set(questions.map(question => question.role)).size, `${kind} repeats an answer role`).toBe(questions.length)
    }
    for (const [kind, questions] of Object.entries(COLLECTION_BUYER_QUESTIONS)) {
      if (!questions) continue
      expect(questions.every(question => question.role.trim().length > 0), `collection ${kind} missing role`).toBe(true)
      expect(new Set(questions.map(question => question.role)).size, `collection ${kind} repeats an answer role`).toBe(questions.length)
    }
  })
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
    expect(firstAnswer).toContain('November 2026 through October 2027')
    expect(firstAnswer).toContain('For November 2026 through October 2027, the chart points to')
    expect(firstAnswer).toMatch(/compared with your usual pattern/i)
    expect(firstAnswer).not.toContain('..')
    expect(firstAnswer).not.toMatch(/^2027 brings/)
    expect(report.months.map(month => month.label)).toEqual([
      'November 2026', 'December 2026', 'January 2027', 'February 2027', 'March 2027', 'April 2027',
      'May 2027', 'June 2027', 'July 2027', 'August 2027', 'September 2027', 'October 2027',
    ])
  })
  it('keeps the financial-blocker explanation and practical point distinct', () => {
    const sourceIds = [...new Set(BUYER_QUESTIONS.career.map(question => question.source))]
    const chapters = sourceIds.map(id => ({
      id,
      title: id,
      lead: id === 'working-style' ? 'The main pressure to check is whether training or support is taking time or money away from paid work. Your chart links these themes, but cannot confirm this is limiting your finances. Compare training costs and hours with income-producing work.' : 'A clear chart-based answer.',
      paragraphs: [],
      evidence: ['chart evidence'],
      tryThis: id === 'working-style' ? 'This is a possible chart pressure, not proof that it is blocking you now or the cause of a real financial problem.' : 'Review the actual terms.',
      guidance: { keepClose: ['Keep the answer specific.'], watchFor: ['Do not count a deal before payment arrives.'] },
      icon: 'personality' as const,
    }))
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'career', chapters)
    const answer = report.split('Question: What tends to block my financial progress?')[1].split('\n\nQuestion:')[0]
    expect(answer).toContain('The main pressure to check is whether training or support is taking time or money away from paid work')
    expect(answer).toContain('Compare training costs and hours with income-producing work')
    expect(answer).not.toMatch(/What This Means for You:|Bottom Line:/)
    expect(answer).not.toContain('Practical point:')
    expect(answer).not.toContain('This is a possible chart pressure')
  })
  it('does not label a money-topic month a good month without the shared balance and friction checks', () => {
    const report = buildCategoryReading('year', a, { year: 2027 })
    const supportive = report.chapters.find(c => c.id === 'annual-cycle-context')!
    const selected = purchaseMonths(a,2027).filter(p => ['conditional-opening','opening-with-caution','conditional-support'].includes(p.status))
    if (!selected.length) expect(supportive.lead).toContain('None of the twelve monthly comparisons establishes a supported opening')
    for (const point of selected) expect(supportive.evidence.join(' ')).toContain(point.date)
    expect(report.months).toHaveLength(12)
  })
  it('does not call quieter monthly themes supportive openings when none pass the full check', () => {
    const report = buildCategoryReading('year', calculateSaju(CATEGORY_SCENARIOS[2].first), { year: 2026, periodStart: '2026-11' })
    const answer = report.chapters.find(chapter => chapter.id === 'annual-cycle-context')!.lead
    expect(answer).toContain('The chart does not show a month meeting the combined conditions for a clear opening.')
    expect(answer).not.toContain('The clearest conditional activity openings are')
    expect(answer).toContain('This does not mean no opportunities will arise.')
    expect(answer).toContain('separate from the months with a checked friction')
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
      make('two-directions', 'From your side: A direct conversation may feel exciting.', ['From your partner’s side: Practical care may feel reassuring.', 'One person may feel supported while the other feels challenged.']),
      make('two-styles', 'The two charts connect through complementary ways of offering care.', []),
      make('close-conversation', 'Person A needs listening; Person B needs practical help with listening.', [
        'Your private-life need is being heard before someone offers a solution. Your partner’s is practical help as well as listening. The same gesture may therefore feel different to each of you.',
        'You: Focused conversation is one way you may show care.',
        'Your partner: Reliable practical help is one way they may show care.',
        'Your likely friction is advice arriving before listening; your partner’s is practical help arriving without checking what was asked for.',
      ]),
      make('chart-patterns', 'Emotional closeness depends more on how you respond to each other’s needs; everyday compatibility depends more on how your routines work together. For emotional closeness, neither a direct bond nor a direct conflict stands out. You value being heard before someone offers a solution; your partner values listening as well as practical help. For everyday compatibility, the routine comparison has no clear linking or clashing pattern.', []),
      make('shared-routine', 'The daily-routine comparison shows no clear link or clash.', ['Your everyday pattern: Careful work benefits from a steady pace.', 'Your partner’s everyday pattern: Creative projects need room for new ideas.']),
      make('shared-week', 'This connection asks each person to make room for the other’s different needs. Understanding the difference is more useful than a compatibility percentage.', [
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
    const q5 = report.split('Question: How do emotional closeness and everyday compatibility differ?')[1]?.split('\n\nshared-routine')[0]?.split('\n\nQuestion: ')[0] ?? ''
    expect(q5).toContain('Emotional closeness depends more on how you respond to each other’s needs')
    expect(q5).toContain('You value being heard before someone offers a solution')
    expect(q5).toContain('your partner values listening as well as practical help')
    expect(q5).toContain('Your daily chart pattern: Careful work benefits from a steady pace.')
    expect(q5.match(/Careful work benefits from a steady pace\./g)).toHaveLength(1)
    expect(report).toMatch(/Question: Why are we attracted to each other\?[\s\S]*Answer: You may be drawn to what your partner brings: a direct conversation that feels exciting\. Your partner may be drawn to what you bring: practical care that feels reassuring\./)
    expect(report).toContain('Question: How do we express love differently?\n\nAnswer: You may express love by making space for an honest conversation and staying with the other person’s point of view; your partner may express it through practical help, after checking what kind of support is wanted. For example, stay with the concern first, then offer practical help once your partner asks for it.')
    expect(report).not.toContain('These are chart-based tendencies, not proof of how either person behaves.')
    const sameStyleChapters = chapters.map(chapter => chapter.id === 'close-conversation'
      ? { ...chapter, paragraphs: [chapter.paragraphs[0], 'You: Keeping promises matters.', 'Your partner: Keeping promises matters.', ...chapter.paragraphs.slice(3)] }
      : chapter)
    const sameStyleReport = applyBuyerQuestions(sameStyleChapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n'), 'compatibility', sameStyleChapters)
    expect(sameStyleReport).toContain('Answer: You and your partner may express love in a similar way: following through on promises and handling practical commitments reliably. Keeping a promise is a clear shared sign of care.')
    expect(report).toContain('Question: What tends to cause friction between us?\n\nAnswer: Your friction point is advice arriving before listening; your partner’s is practical help arriving without checking what was asked for. A tense moment may start when your response meets the different signal your partner is watching for. Say what you need before either of you assumes what the other meant.')
    const sharedFrictionChapters = chapters.map(chapter => chapter.id === 'close-conversation'
      ? { ...chapter, paragraphs: chapter.paragraphs.map(line => line.startsWith('Your likely friction is ') ? 'Your likely friction is avoiding a difficult conversation; your partner’s is avoiding a difficult conversation.' : line) }
      : chapter)
    const sharedFrictionReport = applyBuyerQuestions(sharedFrictionChapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n'), 'compatibility', sharedFrictionChapters)
    expect(sharedFrictionReport).toContain('You may both react to tension by avoiding a difficult conversation. This can leave the same need unspoken on both sides, so name what would help before the conversation stalls.')
    expect(report).toContain('Question: What does this connection ask of each of us?\n\nAnswer: This connection asks each person to make room for the other’s different needs.')
    const adjustment = report.slice(report.indexOf('Question: What does this connection ask of each of us?')).split('\n\nQuestion: ')[0]
    expect(adjustment).not.toContain('Understanding the difference is more useful than a compatibility percentage.')
    expect(adjustment).not.toContain('Practical point:')
    expect(adjustment).not.toContain('Answer detail: The day comparison shows a private-life difference.')
    expect(adjustment).not.toContain('Answer detail: The main challenge is agreeing on time, duties and who follows through.')
    const timing = report.slice(report.indexOf('Question: Which upcoming periods may affect our relationship themes?'))
    expect(timing).not.toContain('Practical point:')
    expect(timing).not.toContain('Answer detail:')
    expect(timing).not.toContain('Main caution:')
    expect(report).toContain('Question: How do emotional closeness and everyday compatibility differ?\n\nAnswer: Emotional closeness depends more on how you respond to each other’s needs; everyday compatibility depends more on how your routines work together.')
    const closeness = report.slice(report.indexOf('Question: How do emotional closeness and everyday compatibility differ?')).split('\n\nshared-routine')[0].split('\n\nQuestion: ')[0]
    expect(closeness).toContain('Your daily chart pattern: Careful work benefits from a steady pace. Your partner\'s daily chart pattern: Creative projects need room for new ideas.')
    expect(closeness).not.toContain('likely tension')
    expect(closeness).toContain('You value being heard before someone offers a solution')
    expect(closeness).not.toContain('Practical point:')
    expect(report).not.toContain('Question: What tends to cause friction between us?\n\nAnswer: A generic caution.')
    const care = report.slice(report.indexOf('Question: How do we express love differently?')).split('\n\nQuestion: ')[0]
    expect(care).not.toContain('Practical point:')
    for (const [rawStyle, expected] of [
      ['Honest conversation matters more than polite silence. The difficulty is that a useful observation may sound like a judgement.', 'You may express love by speaking honestly while making room for your partner’s point of view; your partner may express it through practical help, after checking what kind of support is wanted.'],
      ['Clear commitment and respectful behaviour matter. A relationship can become too formal.', 'You may express love through respectful actions and clear commitments, while also saying what you feel; your partner may express it through practical help, after checking what kind of support is wanted.'],
    ]) {
      const variants = chapters.map(chapter => chapter.id === 'close-conversation'
        ? { ...chapter, paragraphs: chapter.paragraphs.map(line => line.startsWith('You: ') ? `You: ${rawStyle}` : line) }
        : chapter)
      const variant = applyBuyerQuestions(variants.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n'), 'compatibility', variants)
      const answer = variant.slice(variant.indexOf('Question: How do we express love differently?')).split('\n\nQuestion: ')[0]
      expect(answer).toContain(expected)
      expect(answer).not.toMatch(/You may (?:Honest conversation|Clear commitment)/)
    }
  })
  it('states identical closeness needs and daily patterns once in Product 03 Q5', () => {
    const profile = CATEGORY_SCENARIOS[1]
    const first = calculateSaju(profile.first), second = calculateSaju(profile.second)
    const reading = buildCategoryReading('compatibility', first, { second, year: 2026 })
    const report = applyBuyerQuestions(reading.fullText, 'compatibility', reading.chapters, [], 'standalone')
    const q5 = report.split('Question: How do emotional closeness and everyday compatibility differ?')[1]?.split('\n\nQuestion: ')[0] ?? ''
    expect(q5).toContain('You both value warm attention and time for your own interests.')
    expect(q5).toContain('You share this daily chart pattern: Independence becomes tiring when every task has to be handled alone.')
    expect(q5).not.toContain('your partner values warm attention and time for your own interests')
    expect(q5).not.toContain("Your partner's daily chart pattern: Independence becomes tiring when every task has to be handled alone.")
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
    expect(report).toContain('Question: How do we express love differently?\n\nAnswer: You need time to finish a concern. Your partner needs undivided attention.')
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
    expect(report).toContain('Question: What boundary could help protect my everyday balance?\n\nAnswer: Set a limit on new requests: agree what will wait before accepting added work. Your chart points to a specific work pattern to watch as demands build.')
    expect(report).not.toContain('Question: What kind of environment brings out my best?')
  })

  it('answers the distinctive-traits question with personal roles, not an element-count inventory', () => {
    const make = (id: string, lead: string, paragraphs: string[] = []) => ({
      id, title: id, lead, paragraphs, evidence: ['verified chart marker'], tryThis: 'Keep the answer tied to the chart.',
      guidance: { keepClose: ['Keep one clear boundary.'], watchFor: ['Avoid treating a count as an ability.'] }, icon: 'personality' as const,
    })
    const chapters = [
      make('everyday-pace', 'A personal temperament answer.'),
      make('visible-elements', 'The visible count is 3 Earth and 2 Metal.', [
        'Your public role draws on finding customers, while close relationships call for time to think before a difficult conversation.',
        'In the visible count, Earth appears 3 times and Metal appears 2 times.',
        'A missing visible element is not a missing ability; the rest of the chart still matters.',
      ]),
      make('workload-rhythm', 'A personal pressure trigger.', ['Under pressure, you may keep working past a useful stopping point.']),
      make('support-and-space', 'A relationship need.'),
      make('balance-week', 'A strength and its possible blind spot.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'wellbeing', chapters)
    const start = report.indexOf('Question: Which parts of my nature stand out?')
    const end = report.indexOf('\n\nQuestion: ', start + 1)
    const answer = report.slice(start, end)
    expect(answer).toContain('Answer: Your public role draws on finding customers')
    expect(answer).not.toContain('Answer: In the visible count, Earth appears')
    expect(answer).not.toContain('visible count')
  })

  it('answers pressure response with the chart-specific response pattern, distinct from its trigger', () => {
    const make = (id: string, lead: string, paragraphs: string[] = []) => ({
      id, title: id, lead, paragraphs, evidence: ['verified chart marker'], tryThis: 'Set a clear stopping point.',
      guidance: { keepClose: ['Name the task already using your time.'], watchFor: ['A chart-specific pressure response.'] }, icon: 'personality' as const,
    })
    const chapters = [
      make('everyday-pace', 'A general core style.'), make('visible-elements', 'A personal traits answer.'),
      make('workload-rhythm', 'The trigger is a full day with too many demands.', [
        'The pressure to watch is that you may keep refining small details after the result is ready.',
        'The birth-month pattern is the setting, not a claim about every day.',
      ]),
      make('support-and-space', 'A relationship need.'), make('balance-week', 'A strength and matching blind spot.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'wellbeing', chapters)
    expect(report).toContain('Question: What tends to put me under pressure?\n\nAnswer: The trigger is a full day with too many demands.')
    expect(report).toContain('Question: What should I watch for when pressure builds?\n\nAnswer: As pressure builds, you may keep refining small details after the result is ready.')
    expect(report.match(/Question: What should I watch for when pressure builds\?[\s\S]*?\n\n(?=support-and-space)/)?.[0]).toContain('after the result is ready')
  })

  it('keeps the relationship-needs answer focused on relationship support', () => {
    const make = (id: string) => ({
      id, title: id, lead: 'A chart-based personal answer.', paragraphs: [] as string[], evidence: ['chart evidence'],
      tryThis: 'Use a relevant practical step.', guidance: { keepClose: ['Keep the answer specific.'], watchFor: ['A relevant caution.'] }, icon: 'personality' as const,
    })
    const chapters = [...new Set(BUYER_QUESTIONS.wellbeing.map(question => question.source))].map(make)
    const sourceChapter = chapters.find(chapter => chapter.id === 'support-and-space')!
    sourceChapter.paragraphs = [
      'First chart detail.', 'Second chart detail.',
      'The support that suits this side of you is specific: someone who listens before offering a solution. The setting matters too: an uncluttered workspace with a short definition of a finished result.',
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'wellbeing', chapters)
    const answer = report.split('Question: What do I need most in relationships?')[1].split('\n\nQuestion:')[0]
    expect(answer).toContain('someone who listens before offering a solution')
    expect(answer).not.toContain('The setting matters too')
    expect(answer).not.toContain('uncluttered workspace')
  })

  it('answers the annual focus question with a chart-backed work theme', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], tryThis = 'Review your priorities.') => ({
      id, title: id, lead, paragraphs, evidence: [], tryThis,
      guidance: { keepClose: ['Review your priorities.'], watchFor: ['Avoid overcommitting.'] }, icon: 'personality' as const,
    })
    const chapters = [
      make('annual-theme', 'The year centres on changing demands at home and work.', [], 'Prioritize the chart-linked work theme.'),
      make('annual-work', 'Career outlook.'), make('annual-money', 'Money outlook.'),
      make('annual-connections', 'Relationship outlook.'), make('annual-cycle-context', 'Supportive months.'),
      make('annual-plan', 'Months needing care.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'year', chapters)
    expect(report).toContain('Question: What should I focus on most this year?\n\nAnswer: Prioritize the chart-linked work theme.')
  })

  it('avoids echoing the same instruction in the annual focus answer', () => {
    const make = (id: string, lead: string, action = 'Focus on the chart-linked work theme for this year: defined duties. Check that duties and standards are clear.') => ({
      id, title: id, lead, paragraphs: [], evidence: ['annual comparison'], tryThis: action,
      guidance: { keepClose: ['Keep the answer practical.'], watchFor: ['Do not treat timing as certain.'] }, icon: 'timeline' as const,
    })
    const chapters = [
      make('annual-theme', 'The chart theme is clear.'), make('annual-work', 'Career answer.'), make('annual-money', 'Money answer.'),
      make('annual-connections', 'Love answer.'), make('annual-cycle-context', 'No supportive month found.'), make('annual-plan', 'Extra care months.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'year', chapters)
    expect(report).toContain('Question: What should I focus on most this year?\n\nAnswer: The chart’s main work theme is defined duties.')
    expect(report).not.toContain('The chart’s main work theme is defined duties. Check that duties and standards are clear.')
  })

  it('does not repeat the same turning-point explanation inside the answer', () => {
    const make = (id: string) => ({
      id, title: id, lead: 'A clear conclusion.', paragraphs: [] as string[], evidence: ['checked chart comparison'], tryThis: 'Review the actual changes.',
      guidance: { keepClose: ['Review the actual changes.'], watchFor: ['Do not treat timing as certain.'] }, icon: 'timeline' as const,
    })
    const chapters = [...new Set(BUYER_QUESTIONS.complete.map(question => question.source))].map(make)
    const patterns = chapters.find(chapter => chapter.id === 'patterns')!
    patterns.lead = 'The clearest year to review a major change is 2032: a theme of new ideas connects work and relationships.'
    patterns.paragraphs = ['Why 2032 is highlighted here: The 2032 theme of new ideas connects work and relationships. Review how work demands and shared time fit together.']
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'complete', chapters)
    const answer = report.split('Question: When may my life change direction?')[1].split('\n\nQuestion:')[0]
    expect(answer).toContain('Review how work demands and shared time fit together.')
    expect(answer).not.toContain('Why 2032 is highlighted here')
    expect(answer.match(/The 2032 theme/g)).toBeNull()
  })

  it('keeps the yearly career answer to its distinct annual and personal chart reasons', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], tryThis = 'Review your priorities.') => ({
      id, title: id, lead, paragraphs, evidence: ['checked chart relationship'], tryThis,
      guidance: { keepClose: ['Generic advice.'], watchFor: ['Repeated caution.'] }, icon: 'personality' as const,
    })
    const chapters = [
      make('annual-theme', 'The year centres on changing demands at home and work.', [], 'Focus on the changed work demand.'),
      make('annual-work', 'For the fixed period, clear responsibility and standards are the strongest career theme.', [
        'The annual comparison points to defined duties and enough authority to use them.',
        'Your birth-chart work pattern centres on finding new customers.',
        'A sales channel is repeated again in the yearly career detail.',
        'The same blind spot appears in several other questions.',
        '2030 is the separate timing reference.',
      ]),
      make('annual-money', 'Money outlook.'), make('annual-connections', 'Relationship outlook.'),
      make('annual-cycle-context', 'Supportive months.'), make('annual-plan', 'Months needing care.'),
    ]
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'year', chapters)
    const career = report.split('annual-work\n\n')[1].split('\n\nannual-money')[0]
    expect(career).toContain('Answer: For the fixed period, clear responsibility and standards are the strongest career theme.')
    expect(career).toContain('Answer detail: The annual comparison points to defined duties and enough authority to use them.')
    expect(career).toContain('Answer detail: Your birth-chart work pattern centres on finding new customers.')
    expect(career).not.toContain('A sales channel is repeated again')
    expect(career).not.toContain('The same blind spot appears')
    expect(report.match(/^Question:/gm)).toHaveLength(7)
    expect(career).not.toContain('Practical point: Generic advice.')
    expect(career).not.toContain('Main caution: Repeated caution.')
  })

  it('keeps business partnership and expansion answers short and distinct', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], tryThis = 'Set a clear next step.') => ({
      id, title: id, lead, paragraphs, evidence: ['checked chart relationship'], tryThis,
      guidance: { keepClose: ['Set a clear next step.'], watchFor: ['Repeat the same caution.'] }, icon: 'personality' as const,
    })
    const sources = [...new Set(BUYER_QUESTIONS.business.map(question => question.source))]
    const chapters = sources.map(source => source === 'team-decisions'
      ? make(source, 'A partner helps when they add a skill you do not already carry.', ['Both work roles point to customer growth, leaving a delivery gap for the partner to own.', 'Further research may slow delivery.', 'The partner theme repeats the same work style.'])
      : source === 'customer-communication'
        ? make(source, 'Review demand and pricing after repeat sales.', ['A new channel adds follow-up work as well as orders.', 'A small offer for a clear customer group suits this style.', 'More channels can multiply delivery promises.'])
        : make(source, `Direct answer for ${source}.`, ['A chart-linked reason for this answer.']))
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'business', chapters)
    const partner = report.split('team-decisions\n\n')[1].split('\n\ncustomer-communication')[0]
    const expansion = report.split('customer-communication\n\n')[1].split('\n\ndelivery-capacity')[0]
    expect(partner).toContain('Answer: A partner helps when they add a skill you do not already carry.')
    expect(partner).toContain('Answer detail: Both work roles point to customer growth, leaving a delivery gap for the partner to own.')
    expect(partner).not.toContain('Further research may slow delivery.')
    expect(partner).not.toContain('Repeat the same caution.')
    expect(expansion).toContain('Answer: Review demand and pricing after repeat sales.')
    expect(expansion).toContain('Answer detail: A new channel adds follow-up work as well as orders.')
    expect(expansion).not.toContain('More channels can multiply delivery promises.')
    expect(report.match(/^Question:/gm)).toHaveLength(7)
  })

  it('explains the checked annual range when no ten-year business cycle starts', () => {
    const make = (id: string, lead = `Direct answer for ${id}.`, paragraphs: string[] = []) => ({
      id, title: id, lead, paragraphs, evidence: ['checked annual chart comparison'], tryThis: 'Review the actual customer demand.',
      guidance: { keepClose: ['Review the actual customer demand.'], watchFor: ['Do not treat timing as certain.'] }, icon: 'timeline' as const,
    })
    const sources = [...new Set(BUYER_QUESTIONS.business.map(question => question.source))]
    const chapters = sources.map(source => source === 'business-chapters'
      ? make(source, 'No current or upcoming ten-year cycle starts in the calculated period.', [
        '2026 yearly comparison: Opening signals appear in the annual comparison.',
        '2035 yearly comparison: Extra pressure calls for a closer review.',
      ])
      : make(source))
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'business', chapters)
    expect(report).toContain('No ten-year cycle starts within this chart’s calculated range. The available business-year comparisons cover 2026–2035; they offer annual context, not a supported long-range business phase or a launch date.')
    expect(report).toContain('2026: Opening signals appear in the annual comparison.')
    expect(report).toContain('2035: Extra pressure calls for a closer review.')
  })

  it('separates compatibility evidence from repeated method notes and generic cautions', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], tryThis = 'Ask one clear question.') => ({
      id, title: id, lead, paragraphs, evidence: ['checked chart relationship'], tryThis,
      guidance: { keepClose: ['Ask one clear question.'], watchFor: ['Generic caution.'] }, icon: 'personality' as const,
    })
    const sources = [...new Set(BUYER_QUESTIONS.compatibility.map(question => question.source))]
    const chapters = sources.map(source => source === 'two-styles'
      ? make(source, 'This match has shared care needs. The private-life chart comparison shows no clear tie or clash.', ['Neither a strong private-life link nor a direct conflict appears in the comparison.'])
      : source === 'two-directions'
        ? make(source, 'From your side: reassurance and feeling understood stand out.', [
          "From your partner's side: fresh ideas and direct speech stand out.",
          'The chart comparison is made in both directions.',
          'One person may feel supported while the other feels challenged.',
        ])
        : make(source, `Direct answer for ${source}.`, ['A personal chart detail.']))
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'compatibility', chapters)
    const answerFor = (question: string) => {
      const start = report.indexOf(`Question: ${question}`)
      const next = report.indexOf('\n\nQuestion: ', start + 1)
      return report.slice(start, next < 0 ? undefined : next)
    }
    const fit = answerFor('What makes us compatible?')
    const attraction = answerFor('Why are we attracted to each other?')
    expect(fit).toContain('Answer: This match has shared care needs.')
    expect(fit).not.toContain('The private-life chart comparison shows no clear tie or clash.')
    expect(fit).not.toContain('Neither a strong private-life link nor a direct conflict appears')
    expect(answerFor('How do emotional closeness and everyday compatibility differ?')).toContain('Answer: Direct answer for chart-patterns.')
    expect(answerFor('How do emotional closeness and everyday compatibility differ?')).not.toContain('Neither a strong private-life link nor a direct conflict appears')
    expect(fit).not.toContain('Main caution: Generic caution.')
    expect(attraction).toContain('Answer: You may be drawn to what your partner brings: reassurance and feeling understood. Your partner may be drawn to what you bring: fresh ideas and direct speech.')
    expect(attraction).not.toContain('One person may feel supported while the other feels challenged.')
    expect(attraction).not.toContain('comparison is made in both directions')
    expect(attraction).not.toContain('Practical point: Ask one clear question.')

    const sharedDirectionChapters = chapters.map(chapter => chapter.id === 'two-directions'
      ? { ...chapter, lead: 'From your side: Reassurance and feeling understood stand out.', paragraphs: ["From your partner’s side: Reassurance and feeling understood stand out."] }
      : chapter)
    const sharedDirectionReport = applyBuyerQuestions(
      sharedDirectionChapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n'),
      'compatibility', sharedDirectionChapters,
    )
    expect(sharedDirectionReport).toContain('Answer: Both directions point to a shared draw: you may each be drawn to reassurance and feeling understood in the connection.')
    expect(sharedDirectionReport).not.toContain('two different possible draws')

    const frictionContextChapters = chapters.map(chapter => chapter.id === 'two-directions'
      ? { ...chapter, paragraphs: [...chapter.paragraphs, 'The day signs also form a friction pattern: a possible attraction can exist alongside different instincts about private choices.'] }
      : chapter)
    const frictionContextReport = applyBuyerQuestions(
      frictionContextChapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n'),
      'compatibility', frictionContextChapters,
    )
    expect(frictionContextReport).toContain('The private-life comparison points to different instincts about personal choices. That difference can coexist with the attraction pattern described above.')
    expect(report.match(/^Question:/gm)).toHaveLength(7)
  })

  it('separates core personality, visible strengths, pressure triggers and support needs', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], tryThis = 'Use a practical next step.') => ({
      id, title: id, lead, paragraphs, evidence: ['checked chart relationship'], tryThis,
      guidance: { keepClose: ['Use a practical next step.'], watchFor: ['Generic caution.'] }, icon: 'personality' as const,
    })
    const sources = [...new Set(BUYER_QUESTIONS.wellbeing.map(question => question.source))]
    const chapters = sources.map(source => {
      if (source === 'everyday-pace') return make(source, 'Your core style is patient and precise.', ['Reading basis: use the three known pillars.', 'Your public role differs from your private pace.', 'The pressure reaction belongs in the pressure answer.', 'About this reading: symbolic, not a promise.'])
      if (source === 'visible-elements') return make(source, 'Your standout strength is careful attention.', ['Work and relationship needs are separate.', 'The visible chart contains 3 Wood and 1 Metal.', 'Water is absent from this visible count; that does not mean you lack ability.', 'An extra generic trait.', 'Another generic trait.'])
      if (source === 'workload-rhythm') return make(source, 'You feel pressure when a full workday leaves no time to switch off.', ['Under pressure, you may keep editing after the work is ready.', 'The birth-month pattern is the setting, not a claim about every day.', 'A repeated work pattern.'])
      if (source === 'support-and-space') return make(source, 'You need to be heard before someone offers a solution.', ['The same need appears again.', 'A recurring difficulty can arise when help is offered too soon.', 'A specific kind of support is someone who listens before advising.'])
      return make(source, `Direct answer for ${source}.`, ['A chart-linked reason.'])
    })
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'wellbeing', chapters)
    const coreAnswer = report.split('Question: What is my core personality?')[1]?.split('\n\nQuestion: ')[0] ?? ''
    expect(report).toContain('Answer: Your core style is patient and precise.')
    expect(coreAnswer).not.toContain('The pressure reaction belongs in the pressure answer.')
    expect(coreAnswer).not.toContain('Your public role differs from your private pace.')
    expect(report).not.toContain('The pressure reaction belongs in the pressure answer.')
    expect(report).not.toContain('About this reading: symbolic, not a promise.')
    expect(report).toContain('Your standout strength is careful attention.')
    expect(report).not.toContain('visible count')
    expect(report).not.toContain('The visible chart contains 3 Wood and 1 Metal.')
    expect(report).not.toContain('An extra generic trait.')
    expect(report).not.toContain('Another generic trait.')
    expect(report).toContain('Answer: You feel pressure when a full workday leaves no time to switch off.')
    expect(report).not.toContain('Answer detail: The birth-month pattern is the setting')
    expect(report).not.toContain('Answer detail: The same need appears again.')
    expect(report.match(/^Question:/gm)).toHaveLength(7)
  })

})
