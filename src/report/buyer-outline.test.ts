Warning: truncated output (original token count: 9435)
Total output lines: 451

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
  it('keeps the calculated day-sign attraction context in the delivered compatibility answer', () => {
    const reading = buildCategoryReading('compatibility', a, { second: b, year: 2026 })
    const report = applyBuyerQuestions(reading.fullText, 'compatibility', reading.chapters, [], 'standalone')
    expect(report).toContain('The day signs show neither a direct link nor a friction pattern')
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
      lead: id === 'working-style' ? 'Your chart links income-related effort with learning or support. This may create a time or cost pressure, but the chart cannot confirm that it is limiting your finances.' : 'A clear chart-based answer.',
      paragraphs: [],
      evidence: ['chart evidence'],
      tryThis: id === 'working-style' ? 'This is a possible chart pressure, not proof that it is blocking you now or the cause of a real financial problem.' : 'Review the actual terms.',
      guidance: { keepClose: ['Keep the answer specific.'], watchFor: ['Do not count a deal before payment arrives.'] },
      icon: 'personality' as const,
    }))
    const source = chapters.map(chapter => deliveredChapter(chapter).join('\n\n')).join('\n\n')
    const report = applyBuyerQuestions(source, 'career', chapters)
    const answer = report.split('Question: What tends to block my financial progress?')[1].split('\n\nQuestion:')[0]
    expect(answer).toContain('Your chart links income-related effort with learning or support')
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
    expect(report).toMatch(/Question: Why are we attracted to each other\?[\s\S]*Answer: You may be drawn to what your partner brings: a direct conversation that feels exciting\. Your partner may be drawn to w…4435 tokens truncated…fined duties and enough authority to use them.')
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

  it('separates compatibility evidence from repeated method notes and generic cautions', () => {
    const make = (id: string, lead: string, paragraphs: string[] = [], tryThis = 'Ask one clear question.') => ({
      id, title: id, lead, paragraphs, evidence: ['checked chart relationship'], tryThis,
      guidance: { keepClose: ['Ask one clear question.'], watchFor: ['Generic caution.'] }, icon: 'personality' as const,
    })
    const sources = [...new Set(BUYER_QUESTIONS.compatibility.map(question => question.source))]
    const chapters = sources.map(source => source === 'two-styles'
      ? make(source, 'This match has shared care needs.', ['Neither a strong private-life link nor a direct conflict appears in the comparison.'])
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
    expect(frictionContextReport).toContain('a possible attraction can exist alongside different instincts about private choices.')
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
    expect(report).toContain('Answer: Your core style is patient and precise.')
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
