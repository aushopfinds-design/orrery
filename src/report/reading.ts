import type { BirthInput, SajuResult } from '@orrery/core/types'

type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water'

const STEMS: Record<string, { name: string; element: Element; approach: string; caution: string; practice: string }> = {
  '甲': { name: 'Yang Wood', element: 'Wood', approach: 'You may prefer to build a clear path and keep moving toward a bigger goal.', caution: 'A fixed plan can become frustrating when people or circumstances change.', practice: 'Choose one important goal, then leave room to change the route.' },
  '乙': { name: 'Yin Wood', element: 'Wood', approach: 'You may notice small changes and find creative ways around obstacles.', caution: 'Adapting for everyone else can make your own needs disappear.', practice: 'State one non-negotiable need before saying yes.' },
  '丙': { name: 'Yang Fire', element: 'Fire', approach: 'You may lead with enthusiasm, openness and a desire to bring people together.', caution: 'Being available to everyone can drain your attention.', practice: 'Keep time for one quiet task that belongs only to you.' },
  '丁': { name: 'Yin Fire', element: 'Fire', approach: 'You may shine through careful attention, warmth and a sense of purpose.', caution: 'Thinking about every detail can make small decisions feel large.', practice: 'Define what good enough looks like before you start.' },
  '戊': { name: 'Yang Earth', element: 'Earth', approach: 'You may be drawn to steady commitments and practical responsibilities.', caution: 'Carrying too much alone can make asking for help difficult.', practice: 'Share one responsibility instead of silently taking on another.' },
  '己': { name: 'Yin Earth', element: 'Earth', approach: 'You may prefer patient, thoughtful work and making useful things grow.', caution: 'Looking after everyone can push your plans to the bottom of the list.', practice: 'Put your own next step on the calendar first.' },
  '庚': { name: 'Yang Metal', element: 'Metal', approach: 'You may like direct answers, clear standards and visible progress.', caution: 'A strong standard can sound harsher than you intend.', practice: 'Explain the reason behind your standard before enforcing it.' },
  '辛': { name: 'Yin Metal', element: 'Metal', approach: 'You may be attentive to quality, subtle differences and the right words.', caution: 'Waiting for a perfect result can keep good work unfinished.', practice: 'Set a time limit and publish the useful version first.' },
  '壬': { name: 'Yang Water', element: 'Water', approach: 'You may enjoy connecting ideas and seeing many possible routes.', caution: 'Too many interesting options can make a decision hard to finish.', practice: 'Pick one experiment and give it a clear end date.' },
  '癸': { name: 'Yin Water', element: 'Water', approach: 'You may learn by observing, listening and asking thoughtful questions.', caution: 'Keeping every thought private can leave others guessing.', practice: 'Say what you need plainly, even if your idea is still forming.' },
}

const BRANCH_ELEMENTS: Record<string, Element> = {
  '寅': 'Wood', '卯': 'Wood', '巳': 'Fire', '午': 'Fire',
  '辰': 'Earth', '戌': 'Earth', '丑': 'Earth', '未': 'Earth',
  '申': 'Metal', '酉': 'Metal', '亥': 'Water', '子': 'Water',
}
const STEM_ELEMENTS: Record<string, Element> = Object.fromEntries(
  Object.entries(STEMS).map(([stem, info]) => [stem, info.element]),
) as Record<string, Element>

const ELEMENT_MEANING: Record<Element, string> = {
  Wood: 'growth, learning and starting things',
  Fire: 'expression, visibility and connection',
  Earth: 'practical care, structure and follow-through',
  Metal: 'standards, judgment and clear boundaries',
  Water: 'reflection, flexibility and gathering information',
}
const RELATIONSHIP_FOCUS: Record<string, string> = {
  '子': 'whether each person needs time alone before talking',
  '丑': 'how much daily routine and reassurance feels comfortable',
  '寅': 'who sets the pace when something new begins',
  '卯': 'how kindness and clear boundaries can exist together',
  '辰': 'how decisions and practical duties are shared',
  '巳': 'what should stay private and what needs discussion',
  '午': 'how independence and attention are balanced',
  '未': 'how to care for someone without taking over',
  '申': 'when problem-solving helps and when listening matters more',
  '酉': 'how to handle different personal standards without blame',
  '戌': 'how trust is shown in everyday actions',
  '亥': 'whether feelings are said aloud or left for someone to guess',
}

const TEN_GODS: Record<string, { title: string; lens: string; caution: string; step: string }> = {
  '比肩': { title: 'Independence', lens: 'making your own decisions and working beside equals', caution: 'trying to do everything yourself', step: 'decide where independence helps and where teamwork saves time' },
  '劫財': { title: 'Peers and competition', lens: 'learning through peers, speed and competition', caution: 'taking on pressure just to keep up', step: 'compare progress with your last attempt, not someone else\'s' },
  '食神': { title: 'Craft and consistency', lens: 'creating useful work through regular practice', caution: 'staying comfortable when a change is needed', step: 'show one finished piece of work, not just the plan' },
  '傷官': { title: 'Original expression', lens: 'questioning routines and speaking honestly', caution: 'turning a good observation into an unnecessary argument', step: 'offer a better option along with your criticism' },
  '偏財': { title: 'Opportunity and exchange', lens: 'spotting opportunities and building connections', caution: 'chasing too many possibilities at once', step: 'check the cost and downside before a new commitment' },
  '正財': { title: 'Steady resources', lens: 'managing money, promises and day-to-day obligations', caution: 'measuring personal worth only through productivity', step: 'choose a repeatable spending or saving habit' },
  '偏官': { title: 'Challenge and pressure', lens: 'responding when decisions have real consequences', caution: 'mistaking constant urgency for progress', step: 'separate a genuine deadline from someone else\'s panic' },
  '七殺': { title: 'Challenge and pressure', lens: 'responding when decisions have real consequences', caution: 'mistaking constant urgency for progress', step: 'separate a genuine deadline from someone else\'s panic' },
  '正官': { title: 'Responsibility and trust', lens: 'working with clear expectations and dependable standards', caution: 'waiting for approval before trying something new', step: 'agree on the outcome, then choose your own method' },
  '偏印': { title: 'Independent learning', lens: 'finding unusual connections and learning your own way', caution: 'researching forever without acting', step: 'turn what you learned into one small test' },
  '正印': { title: 'Support and knowledge', lens: 'building confidence through support, study and preparation', caution: 'preparing so long that a chance passes', step: 'share what you know in a practical form' },
}

export interface ReadingSection {
  heading: string
  paragraphs: string[]
}
export interface ReadingPeriod {
  period: string
  pillar: string
  headline: string
  text: string
}
export interface EnglishReading {
  headline: string
  subtitle: string
  birthSummary: string
  pillarSummary: string[]
  dayMaster: string
  sections: ReadingSection[]
  periods: ReadingPeriod[]
  caveats: string[]
  fullText: string
}

function formatDate(input: BirthInput): string {
  return new Date(Date.UTC(input.year, input.month - 1, input.day))
    .toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
}

function describeGod(god: string, place: string): string {
  const info = TEN_GODS[god]
  if (!info) return 'This part of the chart is best explored alongside the other pillars rather than on its own.'
  return 'In the ' + place + ' pillar, the traditional ' + info.title.toLowerCase()
    + ' theme points toward ' + info.lens + '. The useful question is whether you are currently '
    + info.caution + '. One practical response is to ' + info.step + '.'
}

function getElements(result: SajuResult): Record<Element, number> {
  const counts: Record<Element, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 }
  for (const p of result.pillars) {
    const stem = STEM_ELEMENTS[p.pillar.stem]
    const branch = BRANCH_ELEMENTS[p.pillar.branch]
    if (stem) counts[stem]++
    if (branch) counts[branch]++
  }
  return counts
}

function getActivePeriods(result: SajuResult, asOfYear: number): ReadingPeriod[] {
  const cycles = result.daewoon
  if (!cycles.length) return []
  let index = 0
  for (let i = 0; i < cycles.length; i++) {
    if (cycles[i].startDate.getUTCFullYear() <= asOfYear) index = i
  }
  return cycles.slice(index, index + 3).map((cycle, i) => {
    const start = cycle.startDate.getUTCFullYear()
    const god = TEN_GODS[cycle.stemSipsin]
    const accent = god?.title ?? 'Change and reflection'
    const focus = god?.lens ?? 'noticing which habits are still useful'
    const suggestion = god?.step ?? 'review what is working before changing direction'
    const transitions = [
      'Use this period to review what has already become part of your everyday life.',
      'The next period offers a different question to think through.',
      'Farther ahead, look at what you want to protect or build on.',
    ]
    return {
      period: start + '–' + (start + 9),
      pillar: cycle.ganzi,
      headline: accent,
      text: transitions[i] + ' In this traditional cycle, ' + cycle.ganzi
        + ' is associated here with ' + focus + '. A grounded experiment is to ' + suggestion
        + '. This is a theme to reflect on, not a prediction that an event will occur.',
    }
  })
}

/** Turns calculated Saju pillars into an English, chart-specific reading.
 * All symbolic interpretations are framed as reflection, never as verified forecasts. */
export function buildEnglishReading(result: SajuResult, asOfYear = new Date().getFullYear()): EnglishReading {
  const { input } = result
  const [hour, day, month, year] = result.pillars
  const self = STEMS[day.pillar.stem]
  if (!self) throw new Error('Cannot produce a reading without a valid day pillar')
  const elements = getElements(result)
  const ranking = (Object.keys(elements) as Element[]).sort((a, b) => elements[b] - elements[a])
  const highest = ranking.filter(e => elements[e] === elements[ranking[0]])
  const absent = ranking.filter(e => elements[e] === 0)
  const monthGod = TEN_GODS[month.stemSipsin]
  const yearGod = TEN_GODS[year.stemSipsin]
  const hourGod = input.unknownTime ? null : TEN_GODS[hour.stemSipsin]
  const relationshipQuestion = RELATIONSHIP_FOCUS[day.pillar.branch] ?? 'what each person needs to feel heard'
  const wealthPositions = [
    ['year', year.stemSipsin],
    ['month', month.stemSipsin],
    ...(input.unknownTime ? [] : [['hour', hour.stemSipsin]]),
  ].filter((entry) => entry[1] === '正財' || entry[1] === '偏財').map(entry => entry[0])
  const moneyTheme = wealthPositions.length
    ? 'A traditional wealth-related symbol appears in the ' + wealthPositions.join(' and ')
      + ' stem position' + (wealthPositions.length === 1 ? '' : 's')
      + '. This does not predict income; use it to examine how you balance opportunity, budgets and follow-through.'
    : 'The visible stems do not show a direct traditional wealth-related label in these positions. That does not mean poor finances or missed opportunities; the full chart is more complex than that label.'
  const fiveElementReading = 'Across the visible stems and branches, '
    + highest.join(' and ') + (highest.length === 1 ? ' appears' : ' appear')
    + ' most often (' + highest.map(e => e + ': ' + elements[e]).join(', ') + '). '
    + 'In this tradition, that draws attention to ' + highest.map(e => ELEMENT_MEANING[e]).join(' and ')
    + '. A simple count is not a full strength-of-elements analysis; seasons and hidden stems also matter.'
    + (absent.length ? ' ' + absent.join(' and ') + (absent.length === 1 ? ' does' : ' do')
      + ' not appear in these visible positions. That is not a bad-luck score or an instruction to buy a remedy.' : '')

  const sections: ReadingSection[] = [
    {
      heading: '01 · Your starting point',
      paragraphs: [
        'Your Day Master is ' + self.name + ' (' + day.pillar.stem + '). Saju uses the heavenly stem of your day pillar as a starting symbol for how you approach life. '
          + self.approach + ' This is a lens for reflection, not a fixed personality label.',
        'The day pillar is ' + day.pillar.ganzi + ' and the month pillar is ' + month.pillar.ganzi
          + '. That pairing is why this reading uses your personal approach alongside your work-and-environment theme rather than giving everyone born in the same year the same story.',
        fiveElementReading,
      ],
    },
    {
      heading: '02 · Work and direction',
      paragraphs: [
        describeGod(month.stemSipsin, 'month'),
        'Your practical strength to test is this: ' + self.practice
          + ' Your potential blind spot is equally specific: ' + self.caution
          + ' Neither statement guarantees a career outcome.',
      ],
    },
    {
      heading: '03 · Money and everyday choices',
      paragraphs: [
        moneyTheme,
        'Your month pillar is ' + month.pillar.ganzi + '. Its stem is traditionally described as '
          + (monthGod?.title.toLowerCase() ?? month.stemSipsin)
          + '. For a decision involving money, turn that theme into a concrete rule: compare the up-front cost, ongoing obligations and the real alternative.',
      ],
    },
    {
      heading: '04 · Relationships and communication',
      paragraphs: [
        'Your day branch is ' + day.pillar.branch + ' (part of ' + day.pillar.ganzi + '). In traditional Saju this is one place readers look when reflecting on close relationships. A useful question for this symbol is ' + relationshipQuestion + '.',
        'Your ' + self.name + ' approach may show up in conversations too: ' + self.approach
          + ' Try asking a partner or friend whether this matches their experience instead of assuming the chart knows how they feel. One chart cannot establish compatibility.',
      ],
    },
    {
      heading: '05 · What other people may see',
      paragraphs: [
        'The year stem is ' + year.pillar.stem + ' and its traditional relationship to your Day Master is '
          + (yearGod?.title.toLowerCase() ?? year.stemSipsin) + '. '
          + 'In Saju, the year pillar is often used for the wider background around a person, not a verdict about their family.',
        input.unknownTime
          ? 'Your birth hour was not provided, so we have deliberately left the hour-pillar interpretation out. This reading is based on three pillars, and some details may change if the time is added.'
          : 'The hour pillar is ' + hour.pillar.ganzi + '. Its stem carries a '
            + (hourGod?.title.toLowerCase() ?? hour.stemSipsin)
            + ' theme. You can use it as a prompt for your longer-term priorities, not a promise about later life.',
      ],
    },
    {
      heading: '06 · Three things to try now',
      paragraphs: [
        '1. For work: choose a small task where you can test the ' + (monthGod?.title.toLowerCase() ?? 'work') + ' theme without changing your whole career.',
        '2. For relationships: have one conversation about ' + relationshipQuestion + '. Ask a real person, rather than guessing their answer.',
        '3. For money: review a single monthly expense and record what would change if you kept, reduced or cancelled it. A symbol cannot replace actual figures.',
      ],
    },
  ]

  const periods = getActivePeriods(result, asOfYear)
  const caveats = [
    'The input is interpreted as a Gregorian (solar-calendar) birth date. Place, historical time zone and birth time can change the calculated chart.',
    input.timezone === 'Asia/Seoul' || !input.timezone
      ? 'For Korean births, this calculator uses a Korean half-hour hour-boundary convention (for example, 03:00 is still the Chou hour). Other calculators may use standard two-hour clock boundaries and display a different hour pillar.'
      : 'For births outside Korea, this calculator applies longitude and an approximate equation-of-time adjustment, together with its half-hour hour-pillar convention. Near a two-hour or solar-term boundary, compare with another reputable calculator.',
    !input.timezone ? 'No birth time zone was provided, so the engine used Asia/Seoul. Re-enter the birth location for an overseas birth.' : '',
    !input.unknownTime && input.timezone && input.timezone !== 'Asia/Seoul' && input.longitude == null
      ? 'Birth longitude was missing. The calculation fell back to Seoul longitude. Re-enter the birthplace before relying on the hour pillar.' : '',
    'During a fall-back DST overlap, the time resolver selects the earlier occurrence of a repeated clock time. Confirm the birth record if this applies.',
    'These themes belong to a traditional cultural interpretation. They are not scientifically validated personality tests, financial forecasts or guarantees of future events.',
  ].filter(Boolean)

  const birthSummary = formatDate(input)
    + (input.unknownTime ? ' · birth time unknown' : ' · ' + String(input.hour).padStart(2, '0') + ':' + String(input.minute).padStart(2, '0'))
    + ' · ' + (input.timezone ?? 'Asia/Seoul (default)')
  const pillarSummary = [
    'Year: ' + year.pillar.ganzi,
    'Month: ' + month.pillar.ganzi,
    'Day: ' + day.pillar.ganzi,
    'Hour: ' + (input.unknownTime ? 'Unknown' : hour.pillar.ganzi),
  ]
  const headline = 'Your Saju, explained in everyday English'
  const subtitle = 'A chart-based reflection on your strengths, choices, relationships and next chapters.'
  const fullText = [
    headline, subtitle, birthSummary, pillarSummary.join(' · '),
    ...sections.flatMap(x => [x.heading, ...x.paragraphs]),
    '07 · Your ten-year chapters',
    ...periods.map(p => p.period + ' (' + p.pillar + ') — ' + p.headline + ': ' + p.text),
    'How to read this report', ...caveats,
  ].join('\n\n')
  return { headline, subtitle, birthSummary, pillarSummary, dayMaster: self.name, sections, periods, caveats, fullText }
}
