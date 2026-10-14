import type { SajuResult, BirthInput, PillarDetail } from '@orrery/core/types'
import { getRelation } from '@orrery/core/pillars'
import { buildEnglishReading, BRANCH_ELEMENTS, STEM_ELEMENTS, STEMS, TEN_GODS, ELEMENT_MEANING } from './reading.ts'
import type { ReadingElement, ReadingPeriod } from './reading.ts'
import { PERSONAL_PROFILES, WORK_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'

export interface ReportChapter {
  id: string
  title: string
  lead: string
  paragraphs: string[]
  evidence: string[]
  tryThis: string
}
export interface ElementCount { element: ReadingElement; count: number }
export interface CompleteReading {
  title: string
  birthSummary: string
  pillarSummary: string[]
  dayMaster: string
  headline: string
  summary: { label: string; text: string }[]
  chapters: ReportChapter[]
  periods: ReadingPeriod[]
  actionPlan: ReportChapter
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
}

const POSITIONS = ['hour', 'day', 'month', 'year']
const ELEMENT_ORDER: ReadingElement[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
const WEALTH_SYMBOLS = new Set(['正財', '偏財'])
const FAMILY: Record<string, string> = {
  '比肩': 'ownership', '劫財': 'ownership', '食神': 'making', '傷官': 'making',
  '正財': 'resources', '偏財': 'resources', '正官': 'responsibility', '偏官': 'responsibility',
  '七殺': 'responsibility', '正印': 'learning', '偏印': 'learning',
}
const MONEY_PROMPTS: Record<string, string> = {
  ownership: 'Notice which commitments are yours and which you accepted to keep up with somebody else. Generosity is easier to sustain when you know what you have already promised. Write down a limit before agreeing to another shared expense or unpaid piece of work.',
  making: 'Look at the time and materials behind something you produce. Enjoying a skill does not make its ongoing cost disappear. Keeping a simple record can help you see whether a useful activity still fits the time and resources you have available.',
  resources: 'Look at what a commitment asks of you after the first payment or first week. A promising start and a manageable routine are different questions. Make the recurring part visible so that your decision is based on the whole commitment.',
  responsibility: 'Notice when pressure makes a practical decision feel more urgent than it is. A request can be important without needing an immediate yes. Confirm the deadline, the amount involved and who is responsible before taking another obligation on yourself.',
  learning: 'Notice how often preparation creates another expense. A course, tool or source of advice is most useful when you know what you want to use it for. Name the first practical result you hope to get before adding another item to the list.',
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
      `Your starting symbol is ${c.self.name}, traditionally pictured as ${c.personal.image}. ${c.personal.strength}`,
      c.personal.pressure,
    ],
    workNote: `Your month marker adds ${label(c.month.stemSipsin)} to the picture. You may prefer work with ${c.work.setting}.`,
    elements: c.elements, visibleMarkers: result.input.unknownTime ? 6 : 8,
    evidence: [`Day stem ${c.day.pillar.stem} (${c.self.name}).`, fact(c.month, 2)],
    tryThis: c.self.practice, timeUnknown: Boolean(result.input.unknownTime),
  }
}

/** Editorial composition from actual calculated markers, with no invented
 * strength score, useful-god diagnosis, personality certainty or event forecast. */
export function buildCompleteReading(result: SajuResult, asOfYear = new Date().getFullYear()): CompleteReading {
  const c = context(result)
  const base = buildEnglishReading(result, asOfYear)
  const { hour, day, month, year, personal, self, work, available } = c
  const relationship = RELATIONSHIP_PROFILES[day.pillar.branch]
  if (!relationship) throw new Error('A valid relationship marker is needed')
  const innerWork = WORK_PROFILES[month.branchSipsin]
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
    ? 'Your chart contains both steady-resource and opportunity-related money markers. A useful way to read that mix is to keep a dependable base while allowing room for a new possibility. The two priorities can work together when you are clear about what is already committed and what is still optional.'
    : hasSteady
      ? 'The money-related markers checked in your chart lean toward steady resources. In everyday terms, this points toward the value of knowing what comes in, what goes out and what you have promised to deliver. Predictability can give you room to make a decision without needing every week to become a new opportunity.'
      : hasOpportunity
        ? 'The money-related markers checked in your chart lean toward opportunity and exchange. In everyday terms, this raises the question of how a promising idea becomes something manageable. Interest from other people, a useful connection or an appealing offer still needs time, a clear agreement and a realistic next step.'
        : hiddenWealth.length
          ? 'The top markers and main branch markers checked here do not contain a money-related symbol, but one appears inside a branch. That matters because a quick scan of the visible chart would miss part of the picture. Use this section to think about how resources support your other priorities, rather than treating a missing top marker as a verdict on your finances.'
          : 'The money-related symbols checked here are not prominent in your chart. This section therefore starts with the work theme that is present, rather than inventing a promise about wealth. Your real income, commitments and choices remain the useful starting point for understanding what is manageable in everyday life.'
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
  const overview = `Your birth-day marker suggests ${personal.need}. Your birth-month marker adds ${label(month.stemSipsin)}, a theme about ${TEN_GODS[month.stemSipsin].lens}. Read the two together: your preferred way of approaching a situation may be different from what helps you organise the work around it.`
  const chapters: ReportChapter[] = [
    {
      id: 'personality', title: '01 · Your Starting Style', lead: personal.strength,
      paragraphs: [
        `The ${self.name} symbol is traditionally pictured as ${personal.image}. We use that image to describe an approach, not a fixed label. ${overview}`,
        personal.example,
        personal.pressure,
        `${personal.balance} Think of a recent decision where this would have made the situation easier. What would you keep, and what could you change? A useful reading becomes clearer when you can connect it with a real example from your own life.`,
      ],
      evidence: [`Your day stem is ${day.pillar.stem} (${self.name}); this is the reference marker for the reading.`, fact(month, 2)],
      tryThis: self.practice,
    },
    {
      id: 'career', title: '02 · Work That Fits Your Way of Thinking', lead: `Look for work with ${work.setting}.`,
      paragraphs: [
        `The work theme here is ${label(month.stemSipsin)}. It comes from how your birth-month marker connects with the day marker used as your starting point. That is why this chapter pays attention to ${work.contribution}. Use the theme to compare work environments, rather than to choose a job from a fixed list.`,
        innerWork && month.branchSipsin !== month.stemSipsin
          ? `The second marker in your birth-month pair adds ${label(month.branchSipsin)}. That brings ${innerWork.contribution} into the reading too. A role may suit you better when it makes room for both, instead of asking you to rely on only one way of working.`
          : `Both markers in your birth-month pair repeat the same ${label(month.stemSipsin)} theme. That gives this chapter a consistent focus: how the daily task is organised matters as much as the title of the role. Compare the actual working routine with the conditions that help you contribute.`,
        `A possible source of friction is ${work.friction}. ${work.scene} Try to name the difference between a difficult task that teaches you something and a working arrangement that keeps creating the same avoidable problem.`,
        `Bring your starting style into that decision too: you may need ${personal.need}. Before saying yes to a role or project, ask how responsibility, feedback and the pace of work will be handled. A clear answer gives you something concrete to compare with your preferences.`,
      ],
      evidence: [fact(month, 2), fact(month, 2, true), `The comparison uses your day stem ${day.pillar.stem}; it is not based on your birth year alone.`],
      tryThis: work.next,
    },
    {
      id: 'money', title: '03 · Money, Commitments and Opportunity', lead: moneyOpening,
      paragraphs: [
        wealth.length ? `The markers behind that reading are ${wealth.map(item => `${item.location} (${label(item.symbol)})`).join('; ')}. Their location tells us which part of the birth chart supplied the theme. It does not tell us your earnings, savings or financial history, so those real figures belong in any practical decision.` : `The work theme available in your chart is ${label(month.stemSipsin)}. That gives this chapter a practical link with the way you handle tasks and commitments. Look at how time, effort and resources support that work before adding a claim about a financial outcome.`,
        MONEY_PROMPTS[FAMILY[month.stemSipsin]],
        `Separate what is already committed from what you are still free to choose. That can mean a recurring bill, a promise to another person or the time required to finish a project. Looking at the whole obligation makes it easier to see why a small decision sometimes feels larger than its first cost.`,
        `Bring the decision back to one question you can answer with real information: what will this ask of you each month? You can like an idea and still need a clearer agreement about its ongoing demands. Keep the cost, available time and other people's expectations in the same picture before deciding what to take on.`,
      ],
      evidence: wealth.length ? wealth.map(item => `${item.location}: ${item.symbol} (${label(item.symbol)}).`) : hiddenWealth.length ? hiddenWealth : [`No 正財 or 偏財 appears in the checked top or main branch markers.`, fact(month, 2)],
      tryThis: hasOpportunity ? 'Write down one appealing offer, the time it requires and the commitment you would have to make. Check what is still unknown before replying.' : 'Choose one regular commitment. Record what it costs in money or time and decide whether the agreement still fits your circumstances.',
    },
    {
      id: 'love', title: '04 · Closeness, Communication and Boundaries', lead: `Your relationship chapter starts with ${relationship.need}.`,
      paragraphs: [
        `Your birth-day pair supplies this chapter's starting point. One marker describes your preferred approach; the other is traditionally used to explore close relationships. Read together, they raise two questions: how you approach someone, and what makes everyday closeness feel comfortable for you. The original markers are shown in the chart notes below.`,
        `You may need ${personal.need}, while the day-branch prompt asks you to notice ${relationship.friction}. Both can be true in the same conversation. One person can care about keeping the connection warm while also needing a different pace, a clearer answer or a little more space.`,
        `For example, you might say: “${relationship.words}” This gives the other person something they can respond to. Adjust the wording to fit your situation; the useful part is making a need clear without deciding in advance how the other person must feel.`,
        clashes.length ? `There is also a clash marker involving your day branch: ${clashes.join('; ')}. We use that as a prompt to notice competing needs, such as a private preference and an outside expectation. It is not a prediction about a relationship ending or a reason to judge another person from one chart.` : `There is no direct day-branch clash in the pairs checked here. That does not remove the need to communicate. A useful conversation still depends on what is happening between real people, including needs that a birth chart cannot know.`,
        `This is a one-person reading. It cannot tell you another person's intentions or compare the fit between two birth charts. Start with your own part of the conversation, then ask the other person what would make the same situation easier for them.`,
      ],
      evidence: [`Day pillar ${day.pillar.ganzi}: stem ${day.pillar.stem} (${self.name}) with branch ${day.pillar.branch}.`, fact(day, 1, true), ...clashes],
      tryThis: `Use the sentence “${relationship.words}” as a starting point, then ask what the other person needs in return.`,
    },
    {
      id: 'social', title: '05 · The Role You Take Around Other People', lead: `Your year marker adds a theme of ${label(year.stemSipsin)}.`,
      paragraphs: [
        `The year stem ${year.pillar.stem} connects with your day stem through ${label(year.stemSipsin)}. In this chapter, we use that as a way to think about the role you take in a wider group: ${TEN_GODS[year.stemSipsin]?.lens ?? 'how you respond to other people'}. It can be different from the role that feels comfortable in a close relationship.`,
        year.stemSipsin === month.stemSipsin ? `Your year and month markers repeat the same ${label(year.stemSipsin)} theme. That gives the wider-group chapter a link with the work chapter: a contribution you make at work may also become the role people expect from you elsewhere. Check whether you choose that role or have simply become used to filling it.` : `Your wider-group theme is ${label(year.stemSipsin)}, while your work theme is ${label(month.stemSipsin)}. You do not have to take the same role everywhere. Notice whether a group expects the contribution you actually want to make, or keeps asking you to repeat a familiar role that no longer fits the situation.`,
        result.input.unknownTime ? 'Your birth time is unknown, so this report uses three pillars. The hour-based part of this chapter is left out rather than guessed. If you find the time later, the additional marker can change the reading of personal priorities and the timing of the ten-year chapters.' : `The hour stem ${hour.pillar.stem} adds ${label(hour.stemSipsin)}: ${TEN_GODS[hour.stemSipsin]?.lens ?? 'your longer-term priorities'}. Compare that theme with the year marker. One useful question is whether the role you take for other people also leaves room for what you want to develop over time.`,
        `Think about a request you receive repeatedly. What part of it do you enjoy, and what part have you never agreed to keep doing? Naming that difference lets you make a clearer offer. You do not have to stop being useful in order to make your own priorities visible.`,
      ],
      evidence: [fact(year, 3), ...(result.input.unknownTime ? ['The birth hour was not supplied; no hour interpretation is included.'] : [fact(hour, 0)])],
      tryThis: 'Choose one role you often take in a group. Tell someone which part you are happy to keep and which part needs a different agreement.',
    },
    {
      id: 'balance', title: '06 · What Your Chart Brings Into Focus', lead: `${c.prominent.map(item => item.element).join(' and ')} ${c.prominent.length === 1 ? 'appears' : 'appear'} most often in the visible markers of your chart.`,
      paragraphs: [
        `The visible count is ${c.elements.map(item => `${item.element} ${item.count}`).join(', ')} across ${result.input.unknownTime ? 'six' : 'eight'} markers. Each supplied pillar contributes one top marker and one branch marker. This is a simple view of what is present; it gives you a way to follow the reading without needing to memorise the original symbols.`,
        `In the language of this report, that emphasis brings ${c.prominent.map(item => ELEMENT_MEANING[item.element]).join('; ')} into focus. Look at the activities you naturally make time for. Then notice whether the same preference also takes over when the situation would benefit from another approach.`,
        c.absent.length ? `${c.absent.map(item => item.element).join(' and ')} ${c.absent.length === 1 ? 'does' : 'do'} not appear in this visible count. A missing visible marker does not mean a missing ability, and inner branch markers can contain an element that this simple view leaves out. You do not need to buy a remedy or change your life around a zero in the table.` : 'All five elements appear in the visible count. That shows a range of markers, but it does not prove that your life is automatically balanced. The useful question is which approaches you actually use and which ones you forget when a situation becomes demanding.',
        `Use the chart as a reminder to make room for a different kind of response. If you move quickly, try gathering one more piece of information. If you keep reflecting, try one small action. The value is in widening your options, rather than trying to force yourself into an ideal numerical balance.`,
      ],
      evidence: c.elements.map(item => `${item.element}: ${item.count} visible markers.`),
      tryThis: 'Pick one recent problem. Name the approach you used first, then try a different approach for one small part of it.',
    },
    {
      id: 'patterns', title: '07 · Where Priorities Meet or Pull Apart', lead: clash ? `A clash between ${clash.markers} brings a question about different priorities into the reading.` : combine ? `A combination between ${combine.markers} offers a prompt about how two parts of your chart can work together.` : 'The checked pairs do not show a direct stem or branch combination or clash.',
      paragraphs: [
        clash ? `The ${clash.markers} ${clash.layer} markers sit in the ${clash.positions} positions. In the traditional reading framework, a clash is a relationship between symbols, rather than a record of something that has happened. A practical way to use it is to ask where two reasonable needs are competing for the same time or attention.` : 'A combination or clash is one relationship checked between two chart markers. When neither is present in these pairs, we leave that layer out rather than inventing a hidden conflict or claiming that life will be easy. The day, month and other supplied markers still give the reading its personal starting points.',
        combine ? `The ${combine.markers} ${combine.layer} markers also form a combination in the ${combine.positions} positions. Read this as a prompt about cooperation: which parts of a situation become easier when they share an aim? A combination does not mean that every disagreement disappears or that an element has automatically transformed into something else.` : `A useful starting point is the relationship between your own preference for ${personal.need} and the work theme of ${label(month.stemSipsin)}. They do not need to compete, but making both visible can help you decide what the next agreement should include.`,
        `Choose a situation where the decision keeps going in circles. Write down the two priorities separately, using ordinary words rather than the chart symbols. Then ask what small change would protect the essential part of each. This can turn a vague feeling of pressure into a choice that people can discuss.`,
        'Check the result against your experience. A symbolic pattern is useful only if it helps you notice a real choice more clearly. If an example does not fit, leave it aside instead of trying to find an event that makes the reading seem correct.',
      ],
      evidence: interactions.length ? interactions.map(item => `${item.markers}: ${item.kind === '合' ? 'combination (合)' : 'clash (沖)'} between ${item.positions} ${item.layer} markers.`) : ['No direct stem or branch 合/沖 occurs in the supplied pillar pairs.'],
      tryThis: 'Write down two priorities in one difficult decision. Make one small change that gives each priority a clear place in the agreement.',
    },
  ]
  const periods = base.periods.map((period, index) => {
    const cycle = result.daewoon.find(item => item.ganzi === period.pillar && item.startDate.getUTCFullYear() === Number(period.period.split('–')[0]))!
    const top = TEN_GODS[cycle.stemSipsin]
    const inner = TEN_GODS[cycle.branchSipsin]
    const cycleWork = WORK_PROFILES[cycle.stemSipsin]
    const startYear = cycle.startDate.getUTCFullYear()
    const when = asOfYear < startYear ? 'This chapter has not started yet.' : index === 0 ? `${asOfYear} falls within this chapter.` : index === 1 ? 'This is the next chapter in the calculated sequence.' : 'This is the later chapter shown in this reading.'
    const examples = [
      `Start with one commitment you already have. Ask whether it gives you room for ${personal.need}, and whether the ${label(cycle.stemSipsin)} theme suggests a practical adjustment to the way you handle it.`,
      `Use this chapter as a planning question. What skill or habit could you begin learning while the earlier chapter is still in progress? ${cycleWork?.next ?? self.practice}`,
      `Keep this later chapter open as a question rather than a deadline. When your circumstances change, revisit the theme and choose which parts are still useful. Your present situation provides better detail than a distant date alone.`,
    ]
    const innerNote = cycle.branchSipsin === cycle.stemSipsin
      ? `Both markers in this cycle repeat that theme. Use it to compare the way you begin a task with the way you keep it going.`
      : `Its second marker adds ${cycle.branchSipsin} (${inner?.title ?? 'a supporting theme'}), a prompt about ${inner?.lens ?? 'your everyday circumstances'}.`
    return { ...period, headline: top?.title ?? period.headline,
      text: `${when} The year label ${period.period} summarises a ten-year cycle; its calculated starting date is ${cycle.startDate.toISOString().slice(0, 10)}. The first marker in ${cycle.ganzi} connects with your birth-day marker through ${cycle.stemSipsin} (${top?.title ?? 'a supporting theme'}), highlighting ${top?.lens ?? 'changing priorities'}. ${innerNote} ${examples[index]} Watch for ${top?.caution ?? 'treating a symbolic chapter as a fixed schedule'}. A useful next step is to ${top?.step ?? 'review a current agreement'}.` }
  })
  const actionPlan: ReportChapter = {
    id: 'next-moves', title: '09 · Three Moves to Try Next', lead: 'Use the reading on one real situation before trying to apply it to your whole life.',
    paragraphs: [
      `For your own pace: ${self.practice} Choose a small occasion where you can try this without turning it into another demand. Notice what changed in the conversation or the task, rather than judging yourself on whether you matched a description.`,
      `For work: ${work.next} Make the experiment specific enough to finish. A changed deadline, clearer division of responsibility or single demonstration gives you something you can compare with the previous way of working. Keep the version that makes the actual task easier.`,
      `For connection: ask about ${relationship.need}. Say what it means in everyday terms and invite the other person to explain their preference too. A useful agreement is one both people understand, rather than a rule one person has worked out privately from a reading.`,
      'After a week, write down what was useful, what did not fit and what you want to try again. Keep the reading as a starting point for that conversation with yourself. Your experience can add the detail that the birth chart cannot supply.',
    ],
    evidence: [`Day stem ${day.pillar.stem}; month stem ${month.pillar.stem} (${month.stemSipsin}); day branch ${day.pillar.branch}.`],
    tryThis: 'Choose one of these three moves and write down when you will try it.',
  }
  const methodNotes = [
    ...base.caveats.filter(note => !note.startsWith('Each monthly chapter') && !note.startsWith('Monthly headlines')),
    'Visible element counts are not a full assessment of day-master strength, chart structure or useful elements. This report does not claim to diagnose those advanced layers.',
    'The month-branch relationship uses the principal inner stem. Inner-stem money checks list symbols without assigning strength weights.',
    'Modern examples and conversation prompts are original editorial interpretations. Chart markers are calculated; the examples are not facts known about your life.',
    'Combination and clash markers are not automatically interpreted as transformation, illness, separation or a predicted event.',
    'A one-person life reading does not replace a two-person compatibility report, a separate annual reading or personal financial and medical advice.',
    ...(result.input.unknownTime ? ['An unknown birth time excludes all hour facts and pair relationships. Ten-year starting dates remain approximate until the time is confirmed.'] : []),
  ]
  const summary = [
    { label: 'Your starting style', text: personal.headline },
    { label: 'Your work theme', text: TEN_GODS[month.stemSipsin].title },
    { label: 'Your relationship prompt', text: relationship.need },
  ]
  const fullText = [
    'Complete Life Reading', formatBirth(result.input), pillarSummary(result).join(' · '), personal.headline,
    ...summary.map(item => `${item.label}: ${item.text}`),
    ...chapters.flatMap(chapter => [chapter.title, chapter.lead, ...chapter.paragraphs, 'From your chart: '+chapter.evidence.join(' '), 'Try this: '+chapter.tryThis]),
    '08 · Your Life Chapters', ...periods.map(period => `${period.period} · ${period.pillar} · ${period.headline}\n${period.text}`),
    actionPlan.title, actionPlan.lead, ...actionPlan.paragraphs,
    'How this reading is prepared', ...methodNotes,
  ].join('\n\n')
  return { title: 'Complete Life Reading', birthSummary: formatBirth(result.input), pillarSummary: pillarSummary(result), dayMaster: self.name, headline: personal.headline, summary, chapters, periods, actionPlan, elements: c.elements, visibleMarkers: result.input.unknownTime ? 6 : 8, methodNotes, fullText, wordCount: fullText.split(/\s+/).length }
}
