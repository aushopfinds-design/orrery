import type { SajuResult } from '@orrery/core/types'
import { getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'
import { PERSONAL_PROFILES, WORK_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { WORK_CONNECTIONS, RELATIONSHIP_CONNECTIONS } from './reading-connections.ts'
import { FOCUS_WORK, PAIR_LENSES } from './category-profiles.ts'
import { annualExample, relationshipExample } from './personal-examples.ts'
import { THEME_FAMILY } from './theme-family.ts'
import { SITUATION_CASES } from './situation-cases.ts'
import type { ApplicationKind, ApplicationLens, SituationCase } from './situation-cases.ts'
import { plainReadingText } from './reading-text.ts'
import { LIFE_FOCUS } from './reading-scenarios.ts'

export interface ApplicationPattern {
  themes: { label: string; text: string }[]
  connections: string[]
  question: string
  facts: string[]
}
export interface ReportApplication extends SituationCase {
  kind: ApplicationKind
  scope: string
  pattern: ApplicationPattern
}
const SELF_CHECK: Record<string, string> = {
  '甲': 'Which part is the goal, and which part is only one way to reach it?',
  '乙': 'Which part can change without taking time you need for your own plans?',
  '丙': 'After the first enthusiastic yes, who will handle the replies and follow-up?',
  '丁': 'Which detail changes the result, and when will you stop checking it?',
  '戊': 'Which part is yours to carry, and who has agreed to carry the rest?',
  '己': 'Where is your own priority in this plan?',
  '庚': 'Have you explained the result you need and heard another way to reach it?',
  '辛': 'Which three details truly matter for this choice?',
  '壬': 'What would one small test tell you that more options would not?',
  '癸': 'What can you say now, even while one part remains uncertain?',
}

function context(r: SajuResult) {
  const [, day, month, year] = r.pillars
  const personal = PERSONAL_PROFILES[day.pillar.stem]
  const work = WORK_PROFILES[month.stemSipsin]
  const inner = WORK_PROFILES[month.branchSipsin]
  const relationship = RELATIONSHIP_PROFILES[day.pillar.branch]
  if (!personal || !work || !inner || !relationship) throw new Error('A valid birth chart is needed for a situation plan')
  return { day, month, year, personal, work, inner, relationship }
}
const dayFact = (r: SajuResult, name = '') => `${name}birth-day pillar ${r.pillars[1].pillar.ganzi}: starting stem ${r.pillars[1].pillar.stem}, relationship branch ${r.pillars[1].pillar.branch}.`
const monthFact = (r: SajuResult, name = '') => `${name}birth-month pillar ${r.pillars[2].pillar.ganzi}: main theme ${r.pillars[2].stemSipsin}, main hidden-stem theme ${r.pillars[2].branchSipsin}.`
const title: Record<Exclude<ApplicationKind, 'year'>, string> = {
  complete: 'Your Life, Your Destiny', career: 'Success, Money & Your Future', business: 'Born to Build a Business?',
  compatibility: 'Are We Meant to Be? · Person A and Person B', wellbeing: 'The Real You: Strengths & Weaknesses',
}

function pairPattern(a: SajuResult, b: SajuResult, lens: ApplicationLens, situation: string): ApplicationPattern {
  const first = context(a)
  const second = context(b)
  const aToB = getRelation(first.day.pillar.stem, second.day.pillar.stem)!.hanja
  const bToA = getRelation(second.day.pillar.stem, first.day.pillar.stem)!.hanja
  if (lens === 'shared-work') return {
    themes: [
      { label: 'Person A’s planning theme', text: first.work.theme },
      { label: 'Person B’s planning theme', text: second.work.theme },
    ],
    connections: [
      first.month.stemSipsin === second.month.stemSipsin
        ? 'The birth-month themes match. A similar preferred approach still needs separate owners for the real tasks.'
        : 'The birth-month themes differ. Use the difference to compare preferred ways of handling a task, without assigning permanent roles from a chart.',
      `Person A’s pressure point to examine is **${first.work.friction}**. Person B’s is **${second.work.friction}**. Ask whether either pattern actually appears before changing the agreement.`,
    ],
    question: `Person A: ${SELF_CHECK[first.day.pillar.stem]} Person B: ${SELF_CHECK[second.day.pillar.stem]}`,
    facts: [dayFact(a, 'Person A: '), dayFact(b, 'Person B: '), monthFact(a, 'Person A: '), monthFact(b, 'Person B: ')],
  }
  if (situation === 'time-together') return {
    themes: [
      { label: 'Person A’s requested kind of care to explore', text: first.relationship.need },
      { label: 'Person B’s requested kind of care to explore', text: second.relationship.need },
    ],
    connections: [
      `Person A can try: **“${relationshipExample(a).response}”** Their own starting need is **${first.personal.need}**. Check which detail actually makes shared time feel welcome.`,
      `Person B can try: **“${relationshipExample(b).response}”** Their own starting need is **${second.personal.need}**. A similar request still deserves its own answer.`,
    ],
    question: 'Ask each person: “Which part of the arrangement would you welcome, and which part would you change?”',
    facts: [dayFact(a, 'Person A: '), dayFact(b, 'Person B: ')],
  }
  return {
    themes: [
      { label: 'Person A’s close-conversation theme', text: first.relationship.need },
      { label: 'Person B’s close-conversation theme', text: second.relationship.need },
    ],
    connections: [
      `From Person A’s side, the comparison highlights **${PAIR_LENSES[aToB].theme}**. ${PAIR_LENSES[aToB].balance}`,
      `From Person B’s side, it highlights **${PAIR_LENSES[bToA].theme}**. ${PAIR_LENSES[bToA].balance}`,
    ],
    question: `Person A could ask: “${PAIR_LENSES[aToB].question}” Person B could ask: “${PAIR_LENSES[bToA].question}”`,
    facts: [dayFact(a, 'Person A: '), dayFact(b, 'Person B: '), `A → B day-stem comparison: ${aToB}. B → A: ${bToA}.`],
  }
}

function patternFor(kind: ApplicationKind, situation: SituationCase, r: SajuResult, second?: SajuResult, referenceYear?: number): ApplicationPattern {
  const { lens } = situation
  const c = context(r)
  const ownQuestion = SELF_CHECK[c.day.pillar.stem]
  if (kind === 'compatibility') {
    if (!second) throw new Error('Two birth charts are needed for relationship situation plans')
    return pairPattern(r, second, lens, situation.id)
  }
  if (kind === 'year') {
    const year = referenceYear ?? new Date().getFullYear() + 1
    if (!Number.isInteger(year) || year < r.input.year || year < 1900 || year > 2100) throw new Error('Choose a valid year for the situation plan')
    const pillar = getFourPillars(year, 7, 15, 12, 0)[0]
    const god = getRelation(c.day.pillar.stem, pillar[0])!.hanja
    const innerGod = getRelation(c.day.pillar.stem, getJeonggi(pillar[1]))!.hanja
    const example = annualExample(r, year, god, innerGod, pillar)
    const life = LIFE_FOCUS[god]
    const innerLife = LIFE_FOCUS[innerGod]
    const yearConnections = situation.id === 'annual-connections'
      ? [
        `Your own close-conversation theme values **${c.relationship.need}**. Try asking for that kind of care before making a recurring arrangement.`,
        `The main yearly theme adds this idea: **${life.connection}**${god === innerGod ? ' Both yearly parts repeat the theme.' : ` The second yearly theme adds: **${innerLife.connection}**`}`,
      ]
      : situation.id === 'new-responsibility'
        ? [
          `For an added responsibility, the yearly theme supplies this question: **“${life.yearQuestion}”** What helps you feel comfortable remains **${c.personal.need}**. Check whether the new arrangement leaves room for it.`,
          god === c.month.stemSipsin
            ? 'The annual and main birth-month themes match. Examine a recurring commitment you already understand before assuming a new responsibility needs a completely new approach.'
            : `Your usual birth-month theme is **${c.work.theme}**. The annual theme adds a different approach. Try it with one part of the responsibility before changing the whole arrangement.`,
        ]
        : [
          `A response to try with the main yearly theme is: **“${example.response}”** Use it to make the first result small enough to review.`,
          `The second yearly theme gives another planning question: **“${innerLife.yearQuestion}”** Keep your own check beside it: **${ownQuestion}**`,
        ]
    return {
      themes: [
        { label: `${year} main planning theme`, text: WORK_PROFILES[god].theme },
        { label: `${year} second planning theme`, text: WORK_PROFILES[innerGod].theme },
        { label: "What helps you feel comfortable", text: c.personal.need },
      ],
      connections: yearConnections,
      question: situation.id === 'annual-connections' ? `A request you can adapt: “${relationshipExample(r).response}” Then ask for the other person’s own preference.` : example.check,
      facts: [dayFact(r), ...(situation.id === 'new-responsibility' ? [monthFact(r)] : []), ...example.facts.slice(1)],
    }
  }
  if (lens === 'closeness') return {
    themes: [
      { label: "What helps you feel comfortable", text: c.personal.need },
      { label: 'Your close-conversation theme', text: c.relationship.need },
    ],
    connections: [RELATIONSHIP_CONNECTIONS[c.day.pillar.stem], `One request to adapt is: **“${relationshipExample(r).response}”** Ask the other person for their own answer too.`],
    question: ownQuestion,
    facts: [dayFact(r)],
  }
  if (lens === 'work' || lens === 'shared-work') {
    const focus = FOCUS_WORK[c.month.stemSipsin]
    const innerFocus = FOCUS_WORK[c.month.branchSipsin]
    const group = WORK_PROFILES[c.year.stemSipsin]
    const usesGroup = lens === 'shared-work' || situation.id === 'growing-workload'
    const workConnections = situation.id === 'first-offer'
      ? [
        `Your birth-month theme suggests testing **${focus.offer}**. One way to try it is: **${focus.experiment}** The test still needs a real customer problem.`,
        `Your own starting style values **${c.personal.focus}**. ${c.personal.balance} Use that check to decide what the first version needs, rather than adding everything you could provide.`,
      ]
      : situation.id === 'delivery-growing'
        ? [
          `The main business pressure suggested here is **${focus.capacity}**. Check your delivery record for it before changing the offer.`,
          c.month.stemSipsin === c.month.branchSipsin
            ? 'Both birth-month parts repeat the same theme. One clearly described finish is more useful than treating the repetition as two separate delivery problems.'
            : `The second birth-month theme adds a different pressure to examine: **${innerFocus.capacity}**. Separate the two pressures so one revised boundary addresses the actual problem.`,
        ]
        : situation.id === 'growing-workload'
          ? [
            `Your main working theme points to **${c.work.contribution}**. The wider-group theme points to **${group.contribution}**. Compare both with the duties people actually ask you to carry.`,
            `The birth-day reading suggests you may appreciate **${c.personal.need}**. When reviewing added work, name the support or condition this would require. The chart does not establish what your employer has agreed.`,
          ]
          : situation.id === 'career-change'
            ? [
              `The main birth-month theme suggests trying tasks such as **${focus.tasks}**. Compare the actual task with your interests, skill and available opportunities.`,
              c.month.stemSipsin === c.month.branchSipsin
                ? 'Both birth-month parts repeat the work theme. A different setting for a familiar task may answer more than another broad career label.'
                : `The second birth-month theme suggests tasks such as **${innerFocus.tasks}**. Test which part is absent from your current routine before deciding the whole kind of work is wrong.`,
            ]
            : [
              WORK_CONNECTIONS[c.day.pillar.stem][THEME_FAMILY[c.month.stemSipsin]],
              usesGroup
                ? c.year.stemSipsin === c.month.stemSipsin
                  ? 'The work and wider-group themes repeat. Check whether you are carrying the same responsibility in several places, rather than assuming you must own every task.'
                  : `The wider-group theme adds **${group.theme}** to your main work theme of **${c.work.theme}**. Compare the role you prefer with the contribution people actually ask for.`
                : c.month.stemSipsin === c.month.branchSipsin
                  ? `Both parts of the birth month repeat **${c.work.theme}**. The repetition does not add a second, different need. Check the real workload and available support.`
                  : `The second birth-month theme adds **${c.inner.theme}**. Compare that need with the main theme of **${c.work.theme}**, rather than treating one label as the whole picture.`,
            ]
    return {
      themes: [
        { label: 'Your starting approach', text: c.personal.focus },
        { label: kind === 'business' ? 'An offer suggested by your work theme' : 'Working conditions to compare', text: kind === 'business' ? focus.offer : c.work.setting },
        { label: usesGroup ? "The idea taken from your birth year" : 'The second birth-month theme', text: usesGroup ? group.theme : c.inner.theme },
      ],
      connections: workConnections,
      question: `${kind === 'business' ? focus.customer : focus.interview} Then check your own approach: ${ownQuestion}`,
      facts: [dayFact(r), monthFact(r), ...(usesGroup ? [`Birth-year pillar ${c.year.pillar.ganzi}: wider-group stem theme ${c.year.stemSipsin}.${kind === 'business' ? ' This is a one-person business reading.' : ''}`] : [])],
    }
  }
  return {
    themes: [
      { label: 'Your starting approach', text: c.personal.focus },
      { label: "Something that may make the day harder", text: c.work.friction },
    ],
    connections: situation.id === 'routine-fit'
      ? [`Your starting style suggests this practice: **${c.personal.practice}** Try it with one useful habit you already want to keep.`, `A condition suggested by the second birth-month theme is: **${c.inner.keepClose[0]}** Check which part could help the small routine, rather than simply asking yourself for more discipline.`]
      : [c.personal.balance, `Your birth-month theme brings **${c.work.theme}** into focus. Look for an actual example of the pressure above before deciding it is the part to change.`],
    question: ownQuestion,
    facts: [dayFact(r), monthFact(r)],
  }
}

function practicalDetails(kind: ApplicationKind, item: SituationCase, first: SajuResult, second?: SajuResult, referenceYear?: number): Pick<SituationCase, 'steps' | 'say'> {
  const c = context(first)
  const focus = FOCUS_WORK[c.month.stemSipsin]
  const steps: SituationCase['steps'] = [...item.steps]
  let say = item.say
  switch (`${kind}/${item.id}`) {
    case 'career/job-offer':
      steps[0] = `Choose three things about the working day to compare. One question suggested by your reading is whether the role has **${c.work.setting}**. Choose the other conditions from your own experience.`
      say = `${item.say}\n${focus.interview}`
      break
    case 'career/growing-workload':
      steps[1] = `Compare the extra duties with the suggested contributions of **${c.work.contribution}** and **${WORK_PROFILES[c.year.stemSipsin].contribution}**. Mark which duties were actually agreed, rather than assuming every useful contribution belongs to you.`
      say = LIFE_FOCUS[c.month.stemSipsin].payQuestion
      break
    case 'career/career-change':
      steps[1] = `Try one small task involving **${focus.tasks}**. At the review, add your own style’s question: **${SELF_CHECK[c.day.pillar.stem]}**`
      break
    case 'business/first-offer':
      steps[1] = focus.experiment
      say = focus.customer
      break
    case 'business/delivery-growing':
      steps[1] = `Review one actual delivery for the suggested pressure of **${focus.capacity}**. Record the replies, revisions and follow-up that really occurred before changing the estimate.`
      break
    case 'business/shared-decisions':
      steps[1] = `Compare the suggested group contribution of **${WORK_PROFILES[c.year.stemSipsin].contribution}** with the work you actually want to own. Assign tasks using real time, skill and authority, including a backup and a point for asking for help.`
      break
    case 'complete/two-good-options':
      steps[1] = `Use your personal check: **${SELF_CHECK[c.day.pillar.stem]}** Choose one small test that answers that question without taking on the whole plan.`
      break
    case 'complete/competing-needs':
      steps[0] = `Name the plan that keeps being moved. Your reading suggests making room for **${c.personal.need}**. Check whether that describes the part you actually want to protect.`
      break
    case 'complete/promise-growing':
      steps[1] = `Check the added request with your personal question: **${SELF_CHECK[c.day.pillar.stem]}** Then name the extra time, help or changed deadline it would need.`
      break
    case 'compatibility/repeated-argument': {
      if (!second) throw new Error('Two birth charts are needed for relationship situation plans')
      say = `Person A: “${relationshipExample(first).response}”\nPerson B: “${relationshipExample(second).response}”`
      break
    }
    case 'compatibility/time-together': {
      if (!second) throw new Error('Two birth charts are needed for relationship situation plans')
      const b = context(second)
      steps[0] = `Person A can check the suggested need for **${c.relationship.need}**. Person B can check **${b.relationship.need}**. Each names one detail that actually makes contact welcome, including a different preference if the suggested need does not fit.`
      break
    }
    case 'compatibility/shared-load': {
      if (!second) throw new Error('Two birth charts are needed for relationship situation plans')
      const b = context(second)
      steps[1] = `Check whether Person A’s suggested pressure of **${c.work.friction}** or Person B’s of **${b.work.friction}** appears in the task. Use an actual example to agree the owner or divided parts.`
      break
    }
    case 'year/annual-priority':
    case 'year/annual-connections': {
      const year = referenceYear ?? new Date().getFullYear() + 1
      const pillar = getFourPillars(year, 7, 15, 12, 0)[0]
      const god = getRelation(c.day.pillar.stem, pillar[0])!.hanja
      steps[0] = item.id === 'annual-priority'
        ? `Use the yearly theme’s question: **“${LIFE_FOCUS[god].yearQuestion}”** Choose one first result you could recognise from the answer.`
        : `${LIFE_FOCUS[god].connection} Use their answer to choose an arrangement in your real calendar.`
      break
    }
    case 'year/new-responsibility':
      steps[1] = `Use your personal check: **${SELF_CHECK[c.day.pillar.stem]}** Name an existing duty to reduce, move or share so the new arrangement leaves room for **${c.personal.need}**.`
      break
    case 'wellbeing/unfinished-day':
      steps[1] = `${c.personal.practice} Adapt the size and stopping point to the interruptions your actual day requires.`
      break
    case 'wellbeing/automatic-yes':
      steps[1] = `Before answering, use your personal question: **${SELF_CHECK[c.day.pillar.stem]}** Compare the request with something you have already promised, including your own task.`
      break
    case 'wellbeing/routine-fit':
      steps[1] = `${c.personal.practice} Attach a small version of that step to a reliable event or a realistic window in your actual day.`
      break
  }
  return { steps, say }
}

export function buildReportApplications(kind: ApplicationKind, first: SajuResult, options: { second?: SajuResult; year?: number } = {}): ReportApplication[] {
  if (kind === 'year') {
    const year = options.year ?? new Date().getFullYear() + 1
    if (!Number.isInteger(year) || year < first.input.year || year < 1900 || year > 2100) {
      throw new Error('Choose a valid year for the situation plan')
    }
  }
  return SITUATION_CASES[kind].map(item => ({
    ...item, ...practicalDetails(kind, item, first, options.second, options.year), id: `${kind}-${item.id}`, kind,
    scope: kind === 'year' ? `What Awaits You This Year? — ${options.year ?? new Date().getFullYear() + 1}` : title[kind],
    pattern: patternFor(kind, item, first, options.second, options.year),
  }))
}

export function applicationText(item: ReportApplication): string {
  return plainReadingText([
    item.scope, item.title, 'Example situation: ' + item.scene, item.question,
    'Why these themes are in the plan',
    ...item.pattern.themes.map(theme => `${theme.label}: ${theme.text}`),
    ...item.pattern.connections, 'A personal question to add: ' + item.pattern.question,
    'Two approaches to compare',
    ...item.choices.flatMap((choice, index) => [`${index + 1}. ${choice.title}`, 'May fit when: ' + choice.when, 'The trade-off: ' + choice.tradeoff]),
    'Words you could use: ' + item.say,
    'A small plan to try', ...item.steps.map((step, index) => `${index + 1}. ${step}`),
    'Three facts to write down', ...item.record.map(prompt => prompt + ' ______'),
    'Keep the approach if: ' + item.keep, 'Adjust it if: ' + item.adjust,
    'When this exercise may not fit: ' + item.doesNotFit,
    'Chart notes: ' + item.pattern.facts.join(' '),
    'The situation is an editorial example, not an event inferred from the chart. Let your actual circumstances and the results of the small test guide the choice.',
  ].join('\n\n'))
}
