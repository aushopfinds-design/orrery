import type { SajuResult, BirthInput, PillarDetail } from '@orrery/core/types'
import { getRelation } from '@orrery/core/pillars'
import { buildEnglishReading, BRANCH_ELEMENTS, STEM_ELEMENTS, STEMS, TEN_GODS } from './reading.ts'
import type { ReadingElement, ReadingPeriod } from './reading.ts'
import { PERSONAL_PROFILES, WORK_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import type { ReadingGuidance } from './reading-profiles.ts'
import { plainReadingText } from './reading-text.ts'
import { WORK_CONNECTIONS, RELATIONSHIP_CONNECTIONS, WORK_REFLECTIONS } from './reading-connections.ts'
import { buildReportExtras, reportExtrasText } from './report-extras.ts'
import type { ReportExtras } from './report-extras.ts'
import { CLOSENESS_PROMPTS } from './reading-scenarios.ts'
import { everydayExample, workExample, relationshipExample, everydayExampleText } from './personal-examples.ts'
import type { EverydayExample } from './personal-examples.ts'
import { buildReadingBrief, readingBriefText } from './reading-brief.ts'
import { THEME_FAMILY as FAMILY } from './theme-family.ts'
import { buildReportApplications, applicationText } from './report-applications.ts'
import type { ReportApplication } from './report-applications.ts'
import { chartGlossaryFor, explainCalculation, PAIR_METHOD_NOTE } from './calculation-notes.ts'
import type { CalculationExplanation } from './calculation-notes.ts'
import { buildDecisionFocus } from './decision-focus.ts'
import type { DecisionFocus } from './decision-focus.ts'
import { moneyTiming, moneyTimingFacts } from './timing-observations.ts'

export const REPORT_EDITION = '2026.10-r7'

export interface ReadingConnection {
  id: string
  title: string
  basis: string
  text: string
  question: string
  chapterId: string
  evidence: string[]
}

export interface ReportChapter {
  id: string
  icon?: string
  title: string
  lead: string
  paragraphs: string[]
  evidence: string[]
  tryThis: string
  guidance: ReadingGuidance
  example?: EverydayExample
}
export interface CompleteReadingPeriod extends ReadingPeriod {
  paragraphs: string[]
  evidence: string[]
  guidance: ReadingGuidance
  tryThis: string
}
export interface ElementCount { element: ReadingElement; count: number }
export interface CompleteReading {
  focus: DecisionFocus
  calculation: CalculationExplanation
  title: string
  birthSummary: string
  pillarSummary: string[]
  dayMaster: string
  headline: string
  summary: { label: string; text: string }[]
  connections: ReadingConnection[]
  referenceYear: number
  chapters: ReportChapter[]
  periods: CompleteReadingPeriod[]
  actionPlan: ReportChapter
  applications: ReportApplication[]
  extras: ReportExtras
  elements: ElementCount[]
  visibleMarkers: number
  methodNotes: string[]
  fullText: string
  wordCount: number
}
export interface FreeReading {
  title: string
  birthSummary: string
  pillarSummary: string[]
  dayMaster: string
  headline: string
  paragraphs: string[]
  workNote: string
  elements: ElementCount[]
  visibleMarkers: number
  evidence: string[]
  tryThis: string
  timeUnknown: boolean
  guidance: ReadingGuidance
}

const POSITIONS = ['hour', 'day', 'month', 'year']
const ELEMENT_ORDER: ReadingElement[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
const WEALTH_SYMBOLS = new Set(['正財', '偏財'])


function context(result: SajuResult) {
  const [hour, day, month, year] = result.pillars
  const personal = PERSONAL_PROFILES[day.pillar.stem]
  const self = STEMS[day.pillar.stem]
  if (!personal || !self) throw new Error('A valid day pillar is needed for this report')
  const work = WORK_PROFILES[month.stemSipsin]
  if (!work) throw new Error('A valid month relationship is needed for this report')
  const elements = ELEMENT_ORDER.map(element => ({ element, count: 0 }))
  const available = result.pillars.map((pillar, index) => ({ pillar, index }))
    .filter(({ index }) => !(result.input.unknownTime && index === 0))
  for (const { pillar } of available) {
    for (const element of [STEM_ELEMENTS[pillar.pillar.stem], BRANCH_ELEMENTS[pillar.pillar.branch]]) {
      const found = elements.find(item => item.element === element)
      if (found) found.count++
    }
  }
  const maximum = Math.max(...elements.map(item => item.count))
  const prominent = elements.filter(item => item.count === maximum)
  const absent = elements.filter(item => item.count === 0)
  return { hour, day, month, year, personal, self, work, available, elements, prominent, absent }
}

function formatBirth(input: BirthInput): string {
  const date = new Date(Date.UTC(input.year, input.month - 1, input.day)).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  return `${date} · ${input.unknownTime ? 'birth time unknown' : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`} · ${input.timezone ?? 'Asia/Seoul (default)'}`
}
function pillarSummary(result: SajuResult): string[] {
  return [3, 2, 1, 0].map(index => `${POSITIONS[index][0].toUpperCase()}${POSITIONS[index].slice(1)}: ${index === 0 && result.input.unknownTime ? 'Unknown' : result.pillars[index].pillar.ganzi}`)
}
function label(god: string): string { return TEN_GODS[god]?.title.toLowerCase() ?? 'a supporting theme' }
function fact(pillar: PillarDetail, index: number, branch = false): string {
  const marker = branch ? pillar.pillar.branch : pillar.pillar.stem
  const god = branch ? pillar.branchSipsin : pillar.stemSipsin
  return `${POSITIONS[index][0].toUpperCase()}${POSITIONS[index].slice(1)} ${branch ? 'branch' : 'stem'} ${marker}: ${TEN_GODS[god]?.title ?? (god === '本元' ? 'your starting point' : 'supporting theme')} (${god}).`
}
function branchClashesWithDay(result: SajuResult): string[] {
  return [...result.relations.pairs].flatMap(([key, relations]) => {
    const indices = key.split(',').map(Number)
    if (!indices.includes(1) || (result.input.unknownTime && indices.includes(0))) return []
    if (!relations.branch.some(relation => relation.type === '沖')) return []
    return [`${result.pillars[indices[0]].pillar.branch}–${result.pillars[indices[1]].pillar.branch} between the ${POSITIONS[indices[0]]} and ${POSITIONS[indices[1]]} markers`]
  })
}

export function buildFreeReading(result: SajuResult): FreeReading {
  const c = context(result)
  return {
    title: 'Your Free Saju Snapshot', birthSummary: formatBirth(result.input),
    pillarSummary: pillarSummary(result), dayMaster: c.self.name, headline: c.personal.headline,
    paragraphs: [
      c.personal.strength,
      c.personal.pressure,
    ],
    workNote: `Your birth month adds a focus on **${c.work.theme}**. You may prefer work with ${c.work.setting}.`,
    elements: c.elements, visibleMarkers: result.input.unknownTime ? 6 : 8,
    evidence: [`Day stem ${c.day.pillar.stem} (${c.self.name}).`, fact(c.month, 2)],
    tryThis: c.personal.practice, timeUnknown: Boolean(result.input.unknownTime),
    guidance: { keepClose: c.personal.keepClose.slice(0, 1), watchFor: c.personal.watchFor.slice(0, 1) },
  }
}

const ELEMENT_HABITS: Record<ReadingElement, ReadingGuidance & { meaning: string }> = {
  Wood: { meaning: 'growth and trying a new direction', keepClose: ['A small goal you can act on.', 'People who help you adjust the plan.'], watchFor: ['Pushing ahead after the plan stops fitting.', 'Adding a new goal before checking the current one.'] },
  Fire: { meaning: 'sharing ideas and bringing energy to a group', keepClose: ['People who share the effort.', 'Quiet time between busy tasks.'], watchFor: ['Using all your energy in the first burst.', 'Feeling you must be available all the time.'] },
  Earth: { meaning: 'steady care and following things through', keepClose: ['A routine with clear jobs and time to rest.', 'People who carry their share.'], watchFor: ['Taking on every task because you can.', 'Keeping a routine after it stops helping.'] },
  Metal: { meaning: 'clear standards and careful decisions', keepClose: ['A short list of the details that matter.', 'Feedback that is clear and kind.'], watchFor: ['Treating every detail as equally important.', 'Judging a different method before hearing why it works.'] },
  Water: { meaning: 'listening, learning and exploring options', keepClose: ['Time to think followed by one small action.', 'People who help you put an idea into words.'], watchFor: ['Thinking so long that the next step never happens.', 'Keeping every option open instead of choosing one test.'] },
}
const unique = (items: string[]) => [...new Set(items)]
const guidanceText = (guidance: ReadingGuidance) => [
  'Keep close:', ...guidance.keepClose.map(item => '• ' + item),
  'Watch out for:', ...guidance.watchFor.map(item => '• ' + item),
].join('\n')

/** Actual chart relationships choose each theme. Everyday advice is cultural
 * interpretation, not an observed fact or an advanced useful-element diagnosis. */
export function buildCompleteReading(result: SajuResult, asOfYear = new Date().getFullYear()): CompleteReading {
  const c = context(result)
  const focus = buildDecisionFocus('complete', result)
  const base = buildEnglishReading(result, asOfYear)
  const { hour, day, month, year, personal, self, work, available } = c
  const relationship = RELATIONSHIP_PROFILES[day.pillar.branch]
  if (!relationship) throw new Error('A valid relationship marker is needed')
  const innerWork = WORK_PROFILES[month.branchSipsin]
  const groupWork = WORK_PROFILES[year.stemSipsin]
  const hourWork = WORK_PROFILES[hour.stemSipsin]
  const wealth = available.flatMap(({ pillar, index }) => [
    ...(index === 1 ? [] : [{ symbol: pillar.stemSipsin, location: `${POSITIONS[index]} stem ${pillar.pillar.stem}` }]),
    { symbol: pillar.branchSipsin, location: `${POSITIONS[index]} branch ${pillar.pillar.branch}` },
  ]).filter(item => WEALTH_SYMBOLS.has(item.symbol))
  const hiddenWealth = available.flatMap(({ pillar, index }) => [...pillar.jigang.replace(/\s/g, '')].flatMap(stem => {
    const god = getRelation(day.pillar.stem, stem)?.hanja ?? ''
    return WEALTH_SYMBOLS.has(god) ? [`${stem} (${god}) inside the ${POSITIONS[index]} branch ${pillar.pillar.branch}`] : []
  }))
  const hasSteady = wealth.some(item => item.symbol === '正財')
  const hasOpportunity = wealth.some(item => item.symbol === '偏財')
  const annualMoney = moneyTiming(result, asOfYear)
  const steadyYears = annualMoney.filter(item => item.money.includes('正財')).map(item => item.year)
  const opportunityYears = annualMoney.filter(item => item.money.includes('偏財')).map(item => item.year)
  const moneyOpening = hasSteady && hasOpportunity
    ? '**Keep a steady base while checking new opportunities.** Both money themes appear in the parts of your chart used here.'
    : hasSteady
      ? '**Know what comes in, what goes out and what you have promised.** The checked money symbols are used here to explore everyday costs and promises.'
      : hasOpportunity
        ? "**An exciting offer needs a clear plan.** Your chart brings trying new things and getting to know people into focus."
        : hiddenWealth.length
          ? '**Look at the whole picture before judging your money habits.** A money theme appears within a less visible part of your chart.'
          : '**Start with your real costs and commitments.** The parts checked here do not show a clear money theme.'
  const moneyGuidance: ReadingGuidance = {
    keepClose: [
      hasOpportunity ? 'People who explain the cost and the work behind an offer.' : 'People who make clear, realistic agreements about shared costs.',
      hasSteady ? 'A simple record of regular income and costs.' : 'A written plan showing the time and money a choice needs.',
    ],
    watchFor: [
      hasOpportunity ? 'Saying yes before checking the full cost.' : 'Accepting another regular cost without checking your budget.',
      FAMILY[month.stemSipsin] === 'learning' ? 'Buying more preparation before using what you already have.' : 'Paying or doing extra work simply to keep someone happy.',
    ],
  }
  const clashes = branchClashesWithDay(result)
  const interactions = [...result.relations.pairs].flatMap(([key, relation]) => {
    const indices = key.split(',').map(Number)
    if (result.input.unknownTime && indices.includes(0)) return []
    return [
      ...relation.stem.filter(item => item.type === '合' || item.type === '沖').map(item => ({ kind: item.type, markers: indices.map(i => result.pillars[i].pillar.stem).join('–'), positions: indices.map(i => POSITIONS[i]).join(' and '), layer: 'stem' })),
      ...relation.branch.filter(item => item.type === '合' || item.type === '沖').map(item => ({ kind: item.type, markers: indices.map(i => result.pillars[i].pillar.branch).join('–'), positions: indices.map(i => POSITIONS[i]).join(' and '), layer: 'branch' })),
    ]
  })
  const combine = interactions.find(item => item.kind === '合')
  const clash = interactions.find(item => item.kind === '沖')
  const elementHabits = c.prominent.map(item => ELEMENT_HABITS[item.element])
  const workFamily = FAMILY[month.stemSipsin]
  const connections: ReadingConnection[] = [
    {
      id: 'work-fit', title: 'Your approach, in your working world',
      basis: `Your starting theme: ${personal.focus}. Your work theme: ${work.theme}.`,
      text: WORK_CONNECTIONS[day.pillar.stem][workFamily],
      question: WORK_REFLECTIONS[workFamily], chapterId: 'career',
      evidence: [`Day stem ${day.pillar.stem} (${self.name}).`, fact(month, 2)],
    },
    {
      id: 'close-conversations', title: 'How you show care, and what you need',
      basis: `Your relationship theme: ${relationship.need}.`,
      text: `${RELATIONSHIP_CONNECTIONS[day.pillar.stem]} Your close-relationship theme adds a need for **${relationship.need}**. Try saying: **“${relationship.words}”**`,
      question: 'Have I said what I need, and asked what the other person needs?', chapterId: 'love',
      evidence: [`Day pillar ${day.pillar.ganzi}: stem ${day.pillar.stem} (${self.name}) and branch ${day.pillar.branch}.`, fact(day, 1, true)],
    },
  ]
  const chapters: ReportChapter[] = [
    {
      id: 'personality', title: '01 · Your Personality', lead: personal.example,
      example: everydayExample(result, 'personality'),
      paragraphs: [
        personal.strength,
        `This part starts with the main symbol for your birth day: **${self.name}**. Its traditional image is ${personal.image}. Here, that image is used to explore ${personal.focus}.`,
        `Comparing your birth month with that day symbol adds **${work.theme}**. Does that idea leave room for ${personal.need} in the situation you are thinking about?`,
        personal.pressure, personal.balance,
      ],
      evidence: [`Your birth-day symbol is ${day.pillar.stem} (${self.name}); this is the reference marker for the reading.`, fact(month, 2)],
      tryThis: personal.practice,
      guidance: { keepClose: personal.keepClose, watchFor: personal.watchFor },
    },
    {
      id: 'career', title: '02 · Work That Suits You',
      example: workExample(result, 'career'),
      lead: workExample(result, 'career').scene,
      paragraphs: [
        'A task can be something you do well and still be frustrating in the wrong setting. Notice whether the difficult part is the work itself, the pace or the way other people respond to it.',
        `Here, Saju compares the main symbol in your birth month with the one for your birth day. This reading connects that relationship with **${work.theme}**. At work, that may show up as ${work.contribution}.`,
        innerWork && month.branchSipsin !== month.stemSipsin
          ? `A second part of your birth month adds **${innerWork.theme}**. A role may feel easier when it leaves room for both ways of working.`
          : `This theme appears in both parts of your birth month. Look at the **daily routine**, as well as the job title.`,
        `Watch for **${work.friction}**. If the opening situation feels familiar, ask which part of the arrangement creates that pressure.`,
        `Before accepting a role, ask about the **workload, feedback and freedom to make decisions**. Compare the answers with what helps you do your best work.`,
      ],
      evidence: [fact(month, 2), fact(month, 2, true), `The comparison uses your day stem ${day.pillar.stem}; it is not based on your birth year alone.`],
      tryThis: work.next,
      guidance: {
        keepClose: unique([...work.keepClose, ...(month.branchSipsin !== month.stemSipsin ? innerWork.keepClose.slice(0, 1) : [])]),
        watchFor: unique([...work.watchFor, ...(month.branchSipsin !== month.stemSipsin ? innerWork.watchFor.slice(0, 1) : [])]),
      },
    },
    {
      id: 'money', title: '03 · Money and Everyday Choices',
      lead: hasSteady && hasOpportunity ? 'A regular income feels reassuring, but a new offer makes you wonder whether you are missing something better.' : hasOpportunity ? 'An offer promises a good return. Before you count it as income, you want to know what has actually been agreed.' : hasSteady ? 'A few small subscriptions renew on the same week. None feels expensive until you see their combined total.' : 'A shared purchase sounds reasonable, until you realise that nobody has agreed who pays the next bill.',
      paragraphs: [
        moneyOpening,
        hasSteady && hasOpportunity
          ? 'Your chart contains both Direct Wealth and Indirect Wealth in the positions checked here. In this tradition, one introduces regular resources and the other introduces opportunities. The useful distinction is between income you can plan around and income that is still a possibility.'
          : hasSteady ? 'Direct Wealth appears in the positions listed below. It gives this chapter a focus on regular income, everyday spending and the satisfaction of knowing where the money goes.'
          : hasOpportunity ? 'Indirect Wealth appears in the positions listed below. Here it opens a discussion of offers, variable income and the difference between an attractive possibility and money already received.'
          : hiddenWealth.length ? 'A wealth relationship appears among the less visible part of the chart rather than the main positions checked here. It is one part of the chart, rather than a reason to label you good or bad with money.'
          : 'No Direct or Indirect Wealth relationship appears in the positions checked here. That does not describe your bank balance. This chapter therefore begins with spending decisions you can actually observe.',
        `Your birth-month work theme adds **${work.theme}**. Consider how ${work.contribution} could contribute to work someone is willing to pay for. A useful skill and a money symbol answer different questions; this reading connects them without assuming that either guarantees demand.`,
        `**Steady-income themes in the five-year sample:** ${steadyYears.length ? steadyYears.join(', ') + '.' : 'none in the checked annual comparisons.'} These are July reference dates. They can help you choose when to review an existing income arrangement, rather than predict the amount it will bring.`,
        `**New-opportunity themes in that sample:** ${opportunityYears.length ? opportunityYears.join(', ') + '.' : 'none in the checked annual comparisons.'} If an offer appears, look at how it would be paid and what you would risk. A year without this symbol can still contain opportunities.`,
        `The evidence below identifies ${wealth.length} visible wealth ${wealth.length === 1 ? 'relationship' : 'relationships'} in the checked positions. This is a count of symbols, not a measure of financial strength.`,
        'For your next review, write down regular income, regular bills and one optional purchase separately. That gives a real money decision a clearer shape than a general promise to spend less.',
      ],
      evidence: [...(wealth.length ? wealth.map(item => `${item.location}: ${item.symbol} (${label(item.symbol)}).`) : hiddenWealth.length ? hiddenWealth : ['No 正財 or 偏財 appears in the checked top or main branch markers.', fact(month, 2)]), ...moneyTimingFacts(result, asOfYear)],
      tryThis: hasOpportunity ? 'For one offer, separate confirmed income, possible income and costs you would pay either way.' : 'Choose one way you earn. Compare the work people pay for with the work you give away, and decide which agreement needs a review.',
      guidance: moneyGuidance,
    },
    {
      id: 'love', title: '04 · Relationships and Communication',
      example: relationshipExample(result),
      lead: relationshipExample(result).scene,
      paragraphs: [
        'You might want to stay easy to be around while also wanting the other person to notice that the plan mattered. Naming the disappointment can be more helpful than expecting them to hear it in a quiet reply.',
        `The lower half of your birth-day pair gives this chapter its relationship theme: **${relationship.need}**. This is about how care may become recognisable to you, rather than how much you can do for someone.`,
        `A caring action may miss the mark if it is not the kind of care you hoped for. For you, the distinction to explore is **${relationship.friction}**. Naming the feeling gives the other person something more useful than a hint.`,
        'When you feel let down, separate what happened from what you thought it meant. A changed plan and the feeling of not being valued may need two different conversations.',
        `You could say: **“${relationship.words}”** Give the other person time to answer.`,
        `For a small moment of connection, try this idea: **${CLOSENESS_PROMPTS[day.pillar.branch]}** Ask whether it fits what the other person enjoys, rather than assuming that your own preferred kind of care is theirs too.`,
        clashes.length
          ? 'The checked chart includes a clash pattern, which this reading uses as an image for different needs. If that reminds you of a real conversation, ask what each person needs and when you could talk again.'
          : 'No direct clash was found in the symbol pairs checked here. That is not a promise that you will always agree; you still need to ask what each person wants.',
        '**Ask about the real situation.** This reading is about one person. Understanding a partner also takes listening to them.',
      ],
      evidence: [`Day pillar ${day.pillar.ganzi}: stem ${day.pillar.stem} (${self.name}) with branch ${day.pillar.branch}.`, fact(day, 1, true), ...clashes],
      tryThis: 'Try the example sentence in one conversation. Listen to the answer before offering a solution.',
      guidance: { keepClose: relationship.keepClose, watchFor: relationship.watchFor },
    },
    {
      id: 'social', title: '05 · Your Role Around Other People',
      lead: 'A day out with friends turns into transport arrangements, questions and a final check that everyone is ready. Somehow, you are doing all three.',
      paragraphs: [
        'Being the person who keeps things moving can feel satisfying. It becomes less enjoyable when everyone assumes you will organise the next plan too, without asking whether you want to.',
        `Here, the symbol for your birth year is compared with the one for your birth day. This reading connects that relationship with **${groupWork.contribution}**. Is that a role you find yourself taking with friends or colleagues?`,
        year.stemSipsin === month.stemSipsin
          ? 'The birth-year and birth-month comparisons lead to the same idea. A role you take at work may follow you into other parts of life. **Do you still want to be the person doing that job?**'
          : `Your birth-month reading points instead to **${work.theme}**. It is fine to help in one way at work and in another way with friends.`,
        result.input.unknownTime
          ? 'Your birth time is unknown, so this report uses three pillars. The time-based part is left out. An accurate time could add detail later.'
          : `The supplied birth hour adds **${hourWork.theme}** to the reading. You can leave room for that interest without making it another thing you owe other people.`,
        'Think of a request you hear often. Choose which part you enjoy and which part needs a new agreement. **You can be helpful and have limits.**',
      ],
      evidence: [fact(year, 3), ...(result.input.unknownTime ? ['The birth hour was not supplied; no hour interpretation is included.'] : [fact(hour, 0)])],
      tryThis: 'Tell someone one task you are happy to help with. Say which part needs to be shared.',
      guidance: { keepClose: [`People who value ${groupWork.contribution}.`, 'Friends or colleagues who discuss which part of a request you actually want to take.'], watchFor: ['Letting a familiar group role follow you into every setting.', 'Helping with a request before checking whether it needs your particular contribution.'] },
    },
    {
      id: 'balance', title: '06 · Your Five-Element Picture',
      lead: 'Your usual way of handling a problem leaves you more stuck this time.',
      paragraphs: [
        'A familiar response can save effort, but it is not the only response available to you. The five-element images offer a way to describe different habits without treating any one habit as a fixed identity.',
        `Your chart has **${result.input.unknownTime ? 'six' : 'eight'} visible symbols**. Their element count is ${c.elements.map(item => `${item.element} ${item.count}`).join(', ')}. You can see the numbers in the table below.`,
        `In Saju imagery, ${c.prominent.map(item => item.element).join(' and ')} ${c.prominent.length === 1 ? 'points' : 'point'} to **${elementHabits.map(item => item.meaning).join('; ')}**. Use that image to notice a habit you already recognise.`,
        c.absent.length
          ? `${c.absent.map(item => item.element).join(' and ')} ${c.absent.length === 1 ? 'is' : 'are'} absent from this simple count. **A zero does not mean a missing ability.** Other parts of the full chart can contain those elements.`
          : 'All five elements appear in this count. That gives a varied picture. **It does not tell us how balanced your daily life feels.**',
        '**Try a different response to one small problem.** If you usually rush, pause and ask a question. If you usually wait, take one small step.',
        'The habits below are ideas to try. This count alone cannot identify a lucky element, colour or direction for you.',
      ],
      evidence: c.elements.map(item => `${item.element}: ${item.count} visible ${item.count === 1 ? 'marker' : 'markers'}.`),
      tryThis: 'Choose one small problem. Try a response you would not usually choose and note what changes.',
      guidance: {
        keepClose: unique(elementHabits.flatMap(item => item.keepClose)),
        watchFor: unique(elementHabits.flatMap(item => item.watchFor)),
      },
    },
    {
      id: 'patterns', title: '07 · When Different Needs Pull Against Each Other',
      lead: 'Something important needs finishing just as someone close asks for your attention. Saying yes to either need feels like letting the other one down.',
      paragraphs: [
        'Both needs can matter. The pressure often comes from treating the choice as proof of who you care about, instead of discussing what each person actually needs right now.',
        clash
          ? 'For example, you may want to finish work while someone needs your attention. **Name both needs** before choosing what to do. A chart pattern cannot tell us that this has happened.'
          : 'Look at how you handle a shared task. Which needs have been said clearly, and which ones are still being guessed?',
        combine
          ? 'Your chart also has a connection between two parts. Ask where a **shared goal** could make a task easier. Cooperation still needs a clear agreement.'
          : `Your birth-day reading points to **${personal.need}**. Your work theme adds **${work.theme}**. Make room for both when planning a task.`,
        'If a decision keeps going in circles, write down what each side needs. **Choose one small change** that gives both needs a place.',
        'Use a pattern only when it helps you understand a real choice. Leave examples that do not fit. Your experience gives the reading its everyday detail.',
      ],
      evidence: interactions.length ? interactions.map(item => `${item.markers}: ${item.kind === '合' ? 'combination (合)' : 'clash (沖)'} between ${item.positions} ${item.layer} markers.`) : ['No direct stem or branch 合/沖 occurs in the supplied pillar pairs.'],
      tryThis: 'Write down two needs in one difficult decision. Agree one small change that makes room for both.',
      guidance: {
        keepClose: [clash ? 'People who can discuss two different needs calmly.' : 'People who agree a shared goal before dividing the work.', 'A written plan for who will do what and when.'],
        watchFor: [clash ? 'Treating a different need as a personal attack.' : 'Assuming cooperation will happen without an agreement.', 'Using a chart symbol to predict a problem in real life.'],
      },
    },
  ]
  const periods: CompleteReadingPeriod[] = base.periods.map((period, index) => {
    const cycle = result.daewoon.find(item => item.ganzi === period.pillar && item.startDate.getUTCFullYear() === Number(period.period.split('–')[0]))!
    const cycleWork = WORK_PROFILES[cycle.stemSipsin]
    const inner = WORK_PROFILES[cycle.branchSipsin]
    const startDate = cycle.startDate.toISOString().slice(0, 10)
    const when = asOfYear < cycle.startDate.getUTCFullYear()
      ? index < 2
        ? 'This period is still ahead of you. Think about what you could practise before it begins.'
        : 'For this later chapter, consider what you would want to carry forward from earlier experience.'
      : `${asOfYear} falls within this period. Compare its theme with the tasks and choices in your life now.`
    const paragraphs = [
      cycleWork.scene,
      index === 0 ? `The current cycle highlights **${cycleWork.contribution}**. Consider where that approach is already helping, and where it asks something different of you.` : index === 1 ? `The next cycle introduces **${cycleWork.theme}**. A useful preparation is to notice one part of life where that approach is unfamiliar.` : `In this later cycle, **${cycleWork.contribution}** becomes the theme to revisit. Experience gained before then may change how you understand it.`,
      when,
      `The calculated period is compared with your birth-day symbol. This reading connects it with **${cycleWork.theme}**, which may show up as ${cycleWork.contribution}.`,
      cycle.branchSipsin === cycle.stemSipsin
        ? `Both parts lead to the same idea: ${cycleWork.theme}. See whether it helps you understand something you are already doing.`
        : index === 0 ? `The lower half of this cycle adds **${inner.theme}**. Look for a present situation where these two needs meet.` : index === 1 ? `Alongside that, the lower half brings **${inner.theme}**. Keep both in mind when considering what to practise next.` : `A second thread in this later chapter is **${inner.theme}**. Leave space for that reading to develop as your circumstances change.`,
      cycle.stemSipsin === '正財' || cycle.branchSipsin === '正財' || cycle.stemSipsin === '偏財' || cycle.branchSipsin === '偏財'
        ? `**Money in this life chapter:** ${cycle.stemSipsin === '正財' || cycle.branchSipsin === '正財' ? 'The steady-income theme appears in this cycle.' : ''} ${cycle.stemSipsin === '偏財' || cycle.branchSipsin === '偏財' ? 'A theme of new financial opportunities appears too.' : ''} It marks a topic to examine, not an amount you will earn.`.replace(/\s+/g, ' ').trim()
        : 'This ten-year pairing has no direct money symbol in the parts checked here. That does not mean your income will stand still.',
      index === 0 ? `If the situation fits, a possible reply is: **${cycleWork.next}**` : index === 1
        ? `Before this period begins, try one small step: **${cycleWork.next}**`
        : `Your life may look different by then. Keep this as an idea you can come back to, rather than a plan you have to follow. Something you could try is: **${cycleWork.next}**`,
    ]
    const evidence = [
      `Calculated start: ${startDate}. The year label ${period.period} is a short label for the ten-year cycle.`,
      `Cycle ${cycle.ganzi}: stem ${cycle.stemSipsin} (${TEN_GODS[cycle.stemSipsin]?.title}); branch ${cycle.branchSipsin} (${TEN_GODS[cycle.branchSipsin]?.title}).`,
    ]
    const guidance: ReadingGuidance = {
      keepClose: unique([...cycleWork.keepClose, ...(cycle.branchSipsin !== cycle.stemSipsin ? inner.keepClose.slice(0, 1) : [])]),
      watchFor: unique([...cycleWork.watchFor, ...(cycle.branchSipsin !== cycle.stemSipsin ? inner.watchFor.slice(0, 1) : [])]),
    }
    const text = plainReadingText([...paragraphs, guidanceText(guidance), 'Try this: ' + cycleWork.next, 'From your chart: ' + evidence.join(' ')].join('\n\n'))
    return { ...period, headline: cycleWork.title, paragraphs, evidence, guidance, tryThis: cycleWork.next, text }
  })
  const actionPlan: ReportChapter = {
    id: 'next-moves', title: '09 · Three Small Steps to Try',
    lead: 'Several ideas from this reading feel worth trying. The question is which one deserves a place in your week first.',
    paragraphs: [
      'Wanting to use an idea does not mean you need to turn every chapter into homework. Begin with the situation you recognise most clearly; leave the other suggestions for when they become relevant.',
      `**For yourself:** ${personal.practice}`,
      `**For work:** ${work.next}`,
      `**For a relationship:** Ask about ${relationship.need}. Listen to the answer before deciding what to do.`,
      'After a week, note what helped and what did not fit. **Keep the useful part.** Adjust the rest to your real life.',
    ],
    evidence: [`Day stem ${day.pillar.stem}; month stem ${month.pillar.stem} (${month.stemSipsin}); day branch ${day.pillar.branch}.`],
    tryThis: 'Choose one step above. Write down when you will try it.',
    guidance: { keepClose: ['One step with a date and a realistic place in your week.', 'A short note about the response you actually received.', 'Permission to keep only the part that helped.'], watchFor: ['Turning three possible steps into three new obligations.', 'Repeating an exercise after the situation it addressed has changed.', 'Using a missed day to dismiss an otherwise useful change.'] },
  }
  const methodNotes = [
    ...explainCalculation(result.input).notes,
    ...base.caveats.filter(note => !note.startsWith('Each monthly chapter') && !note.startsWith('Monthly headlines')),
    'Visible element counts are not a full assessment of day-master strength, chart structure or useful elements. This report does not claim to diagnose those advanced layers.',
    'The month-branch relationship uses the principal inner stem. Inner-stem money checks list symbols without assigning strength weights.',
    'Everyday examples and the Keep close / Watch out for lists are original cultural interpretations. They are ideas to try, not facts known about your life.',
    'The situation pages are optional editorial exercises. Birth-chart themes shape their personal checks and practice details; the situation itself is not inferred from the chart. Compare the choices with actual circumstances and review what happens.',
    'People, habits and work settings are suggested from the chapter themes. Colour palettes and He Tu number pairs are optional symbols linked to the birth-day element, not lucky-event calculations or useful-element prescriptions.',
    'Combination and clash patterns do not automatically predict illness, separation or any other event.',
    PAIR_METHOD_NOTE,
    'This report covers one person. It does not include a two-person compatibility reading or a separate annual report.',
    ...(result.input.unknownTime ? ['An unknown birth time excludes all hour facts and pair relationships. Ten-year starting dates remain approximate until the time is confirmed.'] : []),
  ]
  const summary = [
    { label: 'Who you are in this chart', text: `${personal.headline} Your birth-day stem is ${self.name}; your birth-month comparison brings ${work.theme}.` },
    { label: 'Important longer chapters', text: periods.length ? periods.map(period => `${period.period}: ${period.headline}`).join('; ') : 'No ten-year period is available in the calculated range for this reference year.' },
    { label: 'Your close relationship theme', text: `${relationship.headline} This comes from your birth-day branch.` },
  ]
  const chapterText = (chapter: ReportChapter) => [
    chapter.title, chapter.lead, ...chapter.paragraphs, ...(chapter.example ? everydayExampleText(chapter.example, chapter.lead !== chapter.example.scene) : []), guidanceText(chapter.guidance),
    'From your chart: ' + chapter.evidence.join(' '), 'Try this: ' + chapter.tryThis,
  ]
  const extras = buildReportExtras('complete', result, { year: asOfYear })
  const applications = buildReportApplications('complete', result)
  const fullText = plainReadingText([
    'THE FATE KEY · Complete Life Reading', `Report edition ${REPORT_EDITION} · Timeline reference year ${asOfYear}`, formatBirth(result.input), pillarSummary(result).join(' · '), personal.headline,
    readingBriefText(buildReadingBrief(chapters[0], undefined, focus)),
    ...summary.map(item => `${item.label}: ${item.text}`),
    'How your themes work together', ...connections.flatMap(item => [item.title, item.basis, item.text, 'Ask yourself: ' + item.question, 'From your chart: ' + item.evidence.join(' ')]),
    ...chapters.flatMap(chapterText),
    '08 · Your Life Chapters', ...periods.map(period => `${period.period} · ${period.pillar} · ${period.headline}\n${period.text}`),
    ...chapterText(actionPlan),
    'Situations you can work through', ...applications.map(applicationText),
    reportExtrasText(extras),
    'Chart terms in plain English', ...chartGlossaryFor([...chapters.flatMap(chapter => chapter.evidence), ...periods.flatMap(period => period.evidence), ...focus.evidence, '大運']).map(item => `${item.term}: ${item.meaning}`),
    'How this reading is prepared', ...methodNotes,
  ].join('\n\n'))
  return { focus, calculation: explainCalculation(result.input), title: 'Complete Life Reading', birthSummary: formatBirth(result.input), pillarSummary: pillarSummary(result), dayMaster: self.name, headline: personal.headline, summary, connections, referenceYear: asOfYear, chapters, periods, actionPlan, applications, extras, elements: c.elements, visibleMarkers: result.input.unknownTime ? 6 : 8, methodNotes, fullText, wordCount: fullText.split(/\s+/).length }
}
