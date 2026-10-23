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
import { everydayExample, workExample, relationshipExample, moneyExample, everydayExampleText } from './personal-examples.ts'
import type { EverydayExample } from './personal-examples.ts'
import { buildReadingBrief, readingBriefText } from './reading-brief.ts'
import { THEME_FAMILY as FAMILY } from './theme-family.ts'
import { buildReportApplications, applicationText } from './report-applications.ts'
import type { ReportApplication } from './report-applications.ts'
import { explainCalculation, PAIR_METHOD_NOTE } from './calculation-notes.ts'
import type { CalculationExplanation } from './calculation-notes.ts'
import { buildDecisionFocus } from './decision-focus.ts'
import type { DecisionFocus } from './decision-focus.ts'

export const REPORT_EDITION = '2026.10-r2'

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
const MONEY_PROMPTS: Record<string, string> = {
  ownership: 'Before sharing a cost, agree **who will pay for each part**. Helping someone is easier when you know what you have already promised.',
  making: 'Count the **time and materials** behind something you make. Enjoying the work does not remove its cost.',
  resources: 'Check what an offer will cost **after the first week**. A good start still needs a plan you can keep up.',
  responsibility: 'A request can matter without needing an instant yes. **Check the deadline and the cost** before taking it on.',
  learning: 'Before buying another tool or course, decide **what you will use it for**. Give the things you already have a chance to help.',
}

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
  const moneyOpening = hasSteady && hasOpportunity
    ? '**Keep a steady base while checking new opportunities.** Both money themes appear in the parts of your chart used here.'
    : hasSteady
      ? '**Know what comes in, what goes out and what you have promised.** Your chart puts steady resources in focus.'
      : hasOpportunity
        ? '**An exciting offer needs a clear plan.** Your chart brings new opportunities and useful connections into focus.'
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
      id: 'personality', title: '01 · Your Personality', lead: personal.strength,
      example: everydayExample(result, 'personality'),
      paragraphs: [
        `Saju uses your birth day as the starting point for this part of the reading. Your symbol is **${self.name}**, pictured as ${personal.image}. That image points to ${personal.focus}.`,
        `Your birth month adds a focus on **${work.theme}**. Think about how that fits with your need for ${personal.need}.`,
        personal.example, personal.pressure, personal.balance,
      ],
      evidence: [`Your day stem is ${day.pillar.stem} (${self.name}); this is the reference marker for the reading.`, fact(month, 2)],
      tryThis: personal.practice,
      guidance: { keepClose: personal.keepClose, watchFor: personal.watchFor },
    },
    {
      id: 'career', title: '02 · Work That Suits You',
      example: workExample(result, 'career'),
      lead: `You may prefer work with **${work.setting}**.`,
      paragraphs: [
        `Your birth month connects with your birth day through a theme of **${work.theme}**. In everyday work, that points to ${work.contribution}.`,
        innerWork && month.branchSipsin !== month.stemSipsin
          ? `A second part of your birth month adds **${innerWork.theme}**. A role may feel easier when it leaves room for both ways of working.`
          : `This theme appears in both parts of your birth month. Look at the **daily routine**, as well as the job title.`,
        `Watch for **${work.friction}**. ${work.scene}`,
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
      id: 'money', title: '03 · Money and Everyday Choices', lead: moneyOpening,
      example: moneyExample(result, hasSteady, hasOpportunity),
      paragraphs: [
        wealth.length
          ? 'The chart gives this chapter its theme. **Your actual income and costs** tell you what you can afford. Use both parts when thinking about a choice.'
          : `Your work theme is **${work.theme}**. Check how your time and money support that work before taking on another cost.`,
        MONEY_PROMPTS[FAMILY[month.stemSipsin]],
        'For example, a low first payment may hide a regular cost. Write down **what you will pay each month** and how long it will continue.',
        '**Check the full commitment.** Include the money, the time and any work someone expects from you. A clear agreement makes a small choice easier to understand.',
      ],
      evidence: wealth.length ? wealth.map(item => `${item.location}: ${item.symbol} (${label(item.symbol)}).`) : hiddenWealth.length ? hiddenWealth : ['No 正財 or 偏財 appears in the checked top or main branch markers.', fact(month, 2)],
      tryThis: hasOpportunity ? 'Choose one appealing offer. Write down its full cost, the time it needs and what is still unknown.' : 'Choose one regular cost. Check whether it still fits your budget and what you need it for.',
      guidance: moneyGuidance,
    },
    {
      id: 'love', title: '04 · Relationships and Communication',
      example: relationshipExample(result),
      lead: `**${relationship.headline}.**`,
      paragraphs: [
        `Saju uses the two parts of your birth day to explore close relationships. Your reading points to a need for **${relationship.need}**.`,
        `Your own starting style also values **${personal.need}**. Notice whether you can say that clearly during an everyday conversation.`,
        `One habit to watch is **${relationship.friction}**. Try asking what the other person needs before deciding how to help.`,
        `You could say: **“${relationship.words}”** Give the other person time to answer.`,
        `For a small moment of connection, try this idea: **${CLOSENESS_PROMPTS[day.pillar.branch]}** Ask whether it fits what the other person enjoys, rather than assuming that your own preferred kind of care is theirs too.`,
        clashes.length
          ? 'Your chart also shows two parts pulling in different directions. If that fits, notice when one person wants space while another wants an answer. **Agree when to talk again.**'
          : 'The pairs checked here do not show a direct conflict in this part of the chart. You still need to talk about what each person wants.',
        '**Ask about the real situation.** This reading is about one person. Understanding a partner also takes listening to them.',
      ],
      evidence: [`Day pillar ${day.pillar.ganzi}: stem ${day.pillar.stem} (${self.name}) with branch ${day.pillar.branch}.`, fact(day, 1, true), ...clashes],
      tryThis: 'Try the example sentence in one conversation. Listen to the answer before offering a solution.',
      guidance: { keepClose: relationship.keepClose, watchFor: relationship.watchFor },
    },
    {
      id: 'social', title: '05 · Your Role Around Other People',
      lead: `In a wider group, your chart brings **${groupWork.theme}** into focus.`,
      paragraphs: [
        `This part comes from how your birth year connects with your birth day. It points to **${groupWork.contribution}**. Think about the role you often take with friends or colleagues.`,
        year.stemSipsin === month.stemSipsin
          ? 'Your group and work themes match. A role you take at work may follow you elsewhere. **Check whether you still want that role.**'
          : `Your work theme is **${work.theme}**. Your group theme is different. You can offer a different kind of help in each setting.`,
        result.input.unknownTime
          ? 'Your birth time is unknown, so this report uses three pillars. The time-based part is left out. An accurate time could add detail later.'
          : `Your birth time adds a focus on **${hourWork.theme}**. Leave room for that interest alongside what other people ask of you.`,
        'Think of a request you hear often. Choose which part you enjoy and which part needs a new agreement. **You can be helpful and have limits.**',
      ],
      evidence: [fact(year, 3), ...(result.input.unknownTime ? ['The birth hour was not supplied; no hour interpretation is included.'] : [fact(hour, 0)])],
      tryThis: 'Tell someone one task you are happy to help with. Say which part needs to be shared.',
      guidance: { keepClose: [`A shared task where ${groupWork.contribution} is welcome.`, 'Friends or colleagues who discuss which part of a request you actually want to take.'], watchFor: ['Letting a familiar group role follow you into every setting.', 'Helping with a request before checking whether it needs your particular contribution.'] },
    },
    {
      id: 'balance', title: '06 · Your Five-Element Picture',
      lead: `**${c.prominent.map(item => item.element).join(' and ')}** ${c.prominent.length === 1 ? 'appears' : 'appear'} most often in this simple count.`,
      paragraphs: [
        `Your chart has **${result.input.unknownTime ? 'six' : 'eight'} visible symbols**. Their element count is ${c.elements.map(item => `${item.element} ${item.count}`).join(', ')}. You can see the numbers in the table below.`,
        `In Saju imagery, ${c.prominent.map(item => item.element).join(' and ')} points to **${elementHabits.map(item => item.meaning).join('; ')}**. Use that image to notice a habit you already recognise.`,
        c.absent.length
          ? `${c.absent.map(item => item.element).join(' and ')} ${c.absent.length === 1 ? 'is' : 'are'} absent from this simple count. **A zero does not mean a missing ability.** Other parts of the full chart can contain those elements.`
          : 'All five elements appear in this count. That gives a varied picture. **It does not tell us how balanced your daily life feels.**',
        '**Try a different response to one small problem.** If you usually rush, pause and ask a question. If you usually wait, take one small step.',
        'The habits below are ideas to try. This count alone cannot identify a lucky element, colour or direction for you.',
      ],
      evidence: c.elements.map(item => `${item.element}: ${item.count} visible markers.`),
      tryThis: 'Choose one small problem. Try a response you would not usually choose and note what changes.',
      guidance: {
        keepClose: unique(elementHabits.flatMap(item => item.keepClose)),
        watchFor: unique(elementHabits.flatMap(item => item.watchFor)),
      },
    },
    {
      id: 'patterns', title: '07 · When Different Needs Pull Against Each Other',
      lead: clash ? '**Two parts of your chart pull in different directions.** Use this as a question about competing needs.' : combine ? '**Two parts of your chart form a connection.** Use this as a question about working together.' : '**No direct combination or clash appears in the pairs checked here.** Your other chart details still give this reading its themes.',
      paragraphs: [
        clash
          ? 'For example, you may want to finish work while someone needs your attention. **Name both needs** before choosing what to do. A chart pattern cannot tell us that this has happened.'
          : 'Look at how you handle a shared task. Which needs have been said clearly, and which ones are still being guessed?',
        combine
          ? 'Your chart also has a connection between two parts. Ask where a **shared goal** could make a task easier. Cooperation still needs a clear agreement.'
          : `Your starting style values **${personal.need}**. Your work theme adds **${work.theme}**. Make room for both when planning a task.`,
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
        : 'This later period is further ahead. Keep its theme open as your plans and circumstances change.'
      : `${asOfYear} falls within this period. Compare its theme with the tasks and choices in your life now.`
    const paragraphs = [
      when,
      `The main theme is **${cycleWork.theme}**. Use it to think about ${cycleWork.contribution}.`,
      cycle.branchSipsin === cycle.stemSipsin
        ? `Both parts focus on ${cycleWork.theme}. **Choose a small task** where you can put that theme into practice.`
        : `The second theme is **${inner.theme}**. Look for a plan that leaves room for both.`,
      index === 0 ? cycleWork.scene : index === 1
        ? `Before this period begins, try one small step: **${cycleWork.next}**`
        : `Keep the later years open to change. When your life changes, review what still fits. One possible step is: **${cycleWork.next}**`,
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
    lead: '**Choose one step for this week.** You do not need to change everything at once.',
    paragraphs: [
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
    'People, habits and work settings are suggested from the chapter themes. Color palettes and He Tu number pairs are optional symbols linked to the birth-day element, not lucky-event calculations or useful-element prescriptions.',
    'Combination and clash patterns do not automatically predict illness, separation or any other event.',
    PAIR_METHOD_NOTE,
    'This report covers one person. It does not include a two-person compatibility reading or a separate annual report.',
    ...(result.input.unknownTime ? ['An unknown birth time excludes all hour facts and pair relationships. Ten-year starting dates remain approximate until the time is confirmed.'] : []),
  ]
  const summary = [
    { label: 'Your personality', text: personal.headline },
    { label: 'Your work theme', text: work.title },
    { label: 'Your relationship message', text: relationship.headline },
  ]
  const chapterText = (chapter: ReportChapter) => [
    chapter.title, chapter.lead, ...(chapter.example ? everydayExampleText(chapter.example) : []), ...chapter.paragraphs, guidanceText(chapter.guidance),
    'From your chart: ' + chapter.evidence.join(' '), 'Try this: ' + chapter.tryThis,
  ]
  const extras = buildReportExtras('complete', result)
  const applications = buildReportApplications('complete', result)
  const fullText = plainReadingText([
    'THE FATE KEY · Your Life, Your Destiny', `Report edition ${REPORT_EDITION} · Timeline reference year ${asOfYear}`, formatBirth(result.input), pillarSummary(result).join(' · '), personal.headline,
    readingBriefText(buildReadingBrief(chapters[0], undefined, focus)),
    ...summary.map(item => `${item.label}: ${item.text}`),
    'How your themes work together', ...connections.flatMap(item => [item.title, item.basis, item.text, 'Ask yourself: ' + item.question, 'From your chart: ' + item.evidence.join(' ')]),
    ...chapters.flatMap(chapterText),
    '08 · Your Life Chapters', ...periods.map(period => `${period.period} · ${period.pillar} · ${period.headline}\n${period.text}`),
    ...chapterText(actionPlan),
    'Situations you can work through', ...applications.map(applicationText),
    reportExtrasText(extras),
    'How this reading is prepared', ...methodNotes,
  ].join('\n\n'))
  return { focus, calculation: explainCalculation(result.input), title: 'Your Life, Your Destiny', birthSummary: formatBirth(result.input), pillarSummary: pillarSummary(result), dayMaster: self.name, headline: personal.headline, summary, connections, referenceYear: asOfYear, chapters, periods, actionPlan, applications, extras, elements: c.elements, visibleMarkers: result.input.unknownTime ? 6 : 8, methodNotes, fullText, wordCount: fullText.split(/\s+/).length }
}
