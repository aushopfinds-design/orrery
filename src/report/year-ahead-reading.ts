import { buildDecisionFocus } from './decision-focus.ts'
import { buildReportApplications } from './report-applications.ts'
import type { SajuResult } from '@orrery/core/types'
import { analyzePillarRelations, getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'
import { chapter, chartContext, commonMethod, cycleFacts, FAMILY, finishReading, moneyMarkers, pairFacts, pillarFact, selectedCycles, subject, validateYear } from './category-shared.ts'
import type { ReportMonth } from './category-shared.ts'
import { buildReportExtras } from './report-extras.ts'
import { FOCUS_WORK, MONTH_TASKS } from './category-profiles.ts'
import { WORK_PROFILES } from './reading-profiles.ts'
import { LIFE_FOCUS } from './reading-scenarios.ts'
import { annualExample, monthlySituation } from './personal-examples.ts'
import { REFERENCE_CLOCK_NOTE } from './calculation-notes.ts'

const MONTH_FOCUS = [
  ['Review a Promise', 'Which existing promise needs a clearer agreement?'],
  ['Choose a First Step', 'What small result would make a new plan easier to begin?'],
  ['Make a Request Clear', 'What have I expected someone to understand without saying it?'],
  ['Check the Full Commitment', 'What time, money or follow-up does this choice require?'],
  ['Find a Workable Rhythm', 'Which part of the routine helps, and which part keeps expanding?'],
  ['Use One Skill', 'What can I show or test with something I already know?'],
  ['Share the Practical Work', 'Who will handle each part, and where is support needed?'],
  ['Leave Room to Think', 'Which decision needs a pause and a clear time to return?'],
  ['Ask for Useful Feedback', 'What specific observation would help me improve the next version?'],
  ['Listen before Solving', 'Does this person want an idea, practical help or simply a chance to be heard?'],
  ['Finish One Useful Thing', 'Which open task would be most useful to complete before beginning another?'],
  ['Review What Helped', 'What worked in practice, and what no longer deserves a place in my plan?'],
] as const

const MONTH_SCENES = [
  [
    "Imagine a regular favour taking more of your week than it did when you first agreed to it.",
    "You can still care about keeping a promise while needing to talk about how it has changed."
  ],
  [
    "Imagine waiting for a free weekend to begin something that could start with twenty minutes today.",
    "Wanting a good start can quietly become a reason not to begin."
  ],
  [
    "Imagine feeling disappointed that someone did not help, then realising you never actually asked them.",
    "A need can feel obvious to you while remaining invisible to someone else."
  ],
  [
    "Imagine agreeing to a low first payment and only later reading how often it will repeat.",
    "The first step can feel manageable while the continuing cost asks for a different decision."
  ],
  [
    "Imagine a task that was meant to take an hour spreading across every spare moment of the day.",
    "Improving it may still feel useful, even after it has done the job you needed."
  ],
  [
    "Imagine being asked whether you can do something and wishing you had kept an example of the last time you did it.",
    "Seeing the result can make your ability easier to explain than finding the right words about yourself."
  ],
  [
    "Imagine a shared plan working only because one person remembers every small detail.",
    "The work can look evenly divided until you include the reminders and follow-up."
  ],
  [
    "Imagine being pressed for an answer while one important detail is still missing.",
    "Taking time to check that detail is different from avoiding the decision altogether."
  ],
  [
    "Imagine someone saying your work needs improving without explaining which part did not work.",
    "Vague criticism can feel personal when what you need is an observation you can use."
  ],
  [
    "Imagine someone telling you about a problem and going quiet as soon as you start offering solutions.",
    "Your intention may be kind while the kind of help you offered was not what they wanted."
  ],
  [
    "Imagine an exciting new idea arriving just as an older project reaches its difficult final part.",
    "Beginning again can feel easier than deciding whether to finish, reduce or stop the older work."
  ],
  [
    "Imagine looking back at the year and remembering unfinished plans before anything that actually helped.",
    "A fair review also makes room for changed circumstances and useful results you did not originally plan."
  ]
] as const

const MONTH_REVIEW = [
  { action: 'Write the scope, owner and next review date of one existing promise.', keep: 'One agreement with a clear owner and review date.', watch: 'Renewing a promise without checking what it now requires.', review: 'Compare the agreed task with what was actually delivered. Which expectation still needs to be said aloud?' },
  { action: 'Make a version of the first step that fits into twenty minutes.', keep: 'A small first result you can finish with the resources already available.', watch: 'Adding tools, purchases or extra goals before the first attempt.', review: 'Did the first attempt answer a useful question? Name the next thing to test, rather than expanding the whole plan.' },
  { action: 'Put one request into a single sentence and ask the other person what they understood.', keep: 'A direct request with enough room for an honest answer.', watch: 'Treating a hint or a silent expectation as an agreement.', review: 'Write down the request and the answer separately. Did you agree on the same practical next step?' },
  { action: 'List the upfront cost, ongoing work and person responsible for each part of one commitment.', keep: 'The full time and cost of an offer, including follow-up.', watch: "Comparing a headline price while overlooking work that needs doing again each week.", review: 'Which cost or responsibility was missing from the first description? Update the plan before extending it.' },
  { action: 'Track one recurring task for a week and choose a realistic stopping point.', keep: 'A workable finishing rule for the task that keeps expanding.', watch: 'Using every spare moment to improve something already usable.', review: 'Was the routine repeatable on an ordinary week? Keep the part that helped and shorten the part that expanded.' },
  { action: "Save one real example of a skill you used and ask for one specific thing they noticed about it.", keep: 'A finished example that shows what you can already do.', watch: 'Collecting more preparation without trying the skill in a real task.', review: 'What did the example demonstrate, and what still needs practice? Choose one small change for the next version.' },
  { action: 'Write who will handle each part of a shared task, including the less visible follow-up.', keep: 'A fair division of both visible tasks and follow-up.', watch: 'Assuming the most reliable person will absorb every unassigned task.', review: 'Compare the agreed responsibilities with the work each person actually did. Reassign one part if needed.' },
  { action: 'For one decision, name the missing fact and set a time to return to it.', keep: 'A useful pause with a clear return time and one fact to check.', watch: 'Turning a pause into an open-ended delay or answering under avoidable pressure.', review: 'Did the pause bring useful information? Decide what can now be answered and what remains uncertain.' },
  { action: 'Ask someone to comment on one specific part of a recent piece of work.', keep: 'An observation about the work that you can act on.', watch: 'Asking whether you are good enough when you need feedback on one detail.', review: 'Which observation changed the next version? Set aside vague praise or criticism that gives you no useful action.' },
  { action: 'Ask someone close whether they want listening, ideas or practical help before you respond.', keep: 'The kind of support the other person actually requested.', watch: 'Offering a solution before understanding what the conversation is for.', review: 'Did your response match the support requested? Ask what helped rather than judging the conversation by your intention.' },
  { action: 'Choose one open task to finish, reduce or deliberately stop before starting another.', keep: 'A clear decision about an unfinished commitment.', watch: 'Starting something new to avoid deciding what to do with the old task.', review: 'What was completed, changed or stopped? Notice whether closing the task freed time or clarified the next priority.' },
  { action: 'Review three real results from the year and choose one habit to carry forward.', keep: 'A short record of what helped in your actual circumstances.', watch: 'Judging the year by the original plan while ignoring what changed.', review: 'Keep one useful habit, revise one assumption and release one commitment. Use those three decisions to shape the next year.' },
] as const

export function buildYearAheadReading(result: SajuResult, year = new Date().getFullYear() + 1) {
  validateYear(year, result)
  const c = chartContext(result)
  const decision = buildDecisionFocus('year', result, year)
  const annualPillar = getFourPillars(year, 7, 15, 12, 0)[0]
  const annualGod = getRelation(c.day.pillar.stem, annualPillar[0])!.hanja
  const annualInnerGod = getRelation(c.day.pillar.stem, getJeonggi(annualPillar[1]))!.hanja
  const annual = WORK_PROFILES[annualGod]
  const inner = WORK_PROFILES[annualInnerGod]
  const focus = FOCUS_WORK[annualGod]
  const life = LIFE_FOCUS[annualGod]
  const januaryPillar = getFourPillars(year, 1, 15, 12, 0)[0]
  const cycles = selectedCycles(result, year)
  const money = moneyMarkers(result)
  const annualFacts = [`Annual label sampled on ${year}-07-15 at 12:00 Asia/Seoul: ${annualPillar}; day stem ${c.day.pillar.stem} comparing year stem ${annualPillar[0]} = ${annualGod}; principal inner stem ${getJeonggi(annualPillar[1])} = ${annualInnerGod}.`, ...c.available.flatMap(item => pairFacts(annualPillar, item.pillar.pillar.ganzi, `Annual / birth ${['hour', 'day', 'month', 'year'][item.index]}`))]
  const months: ReportMonth[] = Array.from({ length: 12 }, (_, index) => {
    const label = new Date(Date.UTC(year, index, 15)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    const referenceDate = `${year}-${String(index + 1).padStart(2, '0')}-15`
    const [yearPillar, pillar] = getFourPillars(year, index + 1, 15, 12, 0)
    const god = getRelation(c.day.pillar.stem, pillar[0])!.hanja
    const branchGod = getRelation(c.day.pillar.stem, getJeonggi(pillar[1]))!.hanja
    const theme = WORK_PROFILES[god]
    const monthlyLife = LIFE_FOCUS[god]
    const situation = monthlySituation(god, branchGod)
    const innerTheme = WORK_PROFILES[branchGod]
    const dayPattern = analyzePillarRelations(pillar, c.day.pillar.ganzi)
    const clash = [...dayPattern.stem, ...dayPattern.branch].some(item => item.type === '沖')
    const combine = [...dayPattern.stem, ...dayPattern.branch].some(item => item.type === '合')
    const exercise = MONTH_REVIEW[index]
    const practice = `${MONTH_TASKS[FAMILY[god]][index % 3]} ${exercise.action}`
    return {
      ...chapter(`month-${index + 1}`, label, `${MONTH_SCENES[index][0]} ${MONTH_SCENES[index][1]} The chart idea explored here is **${theme.theme}**.`, [
        `For ${label}, the reference month’s stem is compared with your birth-day stem. This reading connects that relationship with **${theme.theme}**. Use this question: **${MONTH_FOCUS[index][1]}**`,
        `**A situation to explore:** ${situation.scene} Before agreeing, ask: **“${situation.question}”**`,
        branchGod === god ? `Both parts repeat the same theme in this reference. **${practice}** Then review the real result.` : `The second part adds **${innerTheme.theme}**. Leave room for it when you try this step: **${practice}**`,
        `**Review this month's attempt:** ${exercise.review} ${clash ? 'The checked clash adds a question about two different needs.' : combine ? 'The checked combination adds a question about how to share the next step.' : ''}`.trim(),
        `**Outside work:** ${monthlyLife.connection}${branchGod !== god ? ` A second idea: ${LIFE_FOCUS[branchGod].connection}` : ''}`,
      ], [`Reference ${referenceDate}, 12:00 Asia/Seoul (shared comparison clock, not birthplace): year ${yearPillar}; month ${pillar}.`, `Month stem ${pillar[0]} relative to birth-day stem ${c.day.pillar.stem}: ${god}; principal inner stem ${getJeonggi(pillar[1])}: ${branchGod}.`, ...pairFacts(pillar, c.day.pillar.ganzi, 'Month / birth day'), ...pairFacts(pillar, c.month.pillar.ganzi, 'Month / birth month')], practice, { keepClose: [exercise.keep], watchFor: [exercise.watch] }, 'timeline'),
      label, referenceDate, pillar, yearPillar,
    }
  })
  const moneyMonths = months.filter(month => {
    const god = getRelation(c.day.pillar.stem, month.pillar[0])!.hanja
    return god === '正財' || god === '偏財'
  })
  const clashMonths = months.filter(month => {
    const relation = analyzePillarRelations(month.pillar, c.day.pillar.ganzi)
    return [...relation.stem, ...relation.branch].some(item => item.type === '沖')
  })
  return finishReading({ focus: decision, kind: 'year', title: `${year} Year Ahead`, referenceYear: year,
    applications: buildReportApplications('year', result, { year }),
    extras: buildReportExtras('year', result, { year, annual: { theme: annual.theme, god: annualGod, pillar: annualPillar } }),
    headline: `${year}: ${decision.headline}`, subjects: [subject(result)],
    summary: [{ label: `${year} at a glance`, text: `The year's stem brings ${annual.theme}; the principal branch stem adds ${inner.theme}.` }, { label: 'Money themes in the monthly references', text: moneyMonths.length ? moneyMonths.map(month => month.label).join(', ') : 'No month stem carries a direct money symbol at the sampled dates.' }, { label: 'Months with a day-pillar clash', text: clashMonths.length ? clashMonths.map(month => month.label).join(', ') : 'No direct day-pillar clash at the sampled dates.' }],
    chapters: [
      chapter('annual-theme', "What You Want From This Year", "Looking at your plans for the year, you realise that several no longer feel like your own choices.", [
        `**The chart answer for ${year}:** The year stem brings **${annual.theme}**, while the branch's principal stem adds **${inner.theme}**. ${moneyMonths.length ? `The sampled month stems connect with money themes in ${moneyMonths.map(month => month.label).join(', ')}.` : 'No sampled month stem directly carries a money symbol.'} ${clashMonths.length ? `The birth-day pillar meets a clash in the ${clashMonths.map(month => month.label).join(', ')} references; those months may be useful times to check competing priorities.` : 'None of the sampled months forms a direct clash with your birth-day pillar.'}`,
        "A plan can become familiar before you ask whether you still want it. This year’s reading gives you another way to look at that question, rather than a list of events you should expect.",
        `Your birth-day symbol is used here to explore **${c.personal.focus}**. Comparing it with the selected year’s symbol adds **${annual.theme}**. Think about a plan you already have: does either idea help you see what you want from it?`,
        annualGod === c.month.stemSipsin ? "The year and your birth month bring up the same idea in this reading. You can use it to look again at a familiar habit. Repetition in the chart does not mean an event is bound to happen." : `The birth-month reading points to **${c.work.theme}**, which is different from the annual idea. You can try a different response without deciding that the way you have always worked is wrong.`,
        `The lower symbol for the year adds **${inner.theme}**. It offers another question to think about, not another event you should expect to happen.`,
        `A question to carry through **${year}** is: **“${life.yearQuestion}”** Try it with a personal plan as well as a working responsibility.`,
        januaryPillar !== annualPillar ? 'The January reference still belongs to the earlier Saju year. The calendar year and the Saju year do not start at the same boundary. The monthly notes show the actual year and month symbols used.' : "The monthly notes show the year and month symbols calculated for each date. They are not assumptions that every symbol changes on the first day of a calendar month.",
      ], [pillarFact(result, 1), pillarFact(result, 2), ...annualFacts, `January reference: ${januaryPillar}; July reference: ${annualPillar}.`], 'Think about a plan you already have for the year. Which part of this reading helps you understand it, and what would you like to find out?', { keepClose: [`One annual intention that allows ${c.personal.need}.`, 'A distinction between the added annual theme and your existing circumstances.'], watchFor: ['Treating a yearly heading as an instruction to change everything.', 'Calling an annual theme good or bad before relating it to a real choice.'] }, 'personality', annualExample(result, year, annualGod, annualInnerGod, annualPillar)),
      chapter('annual-work', 'Work, Skills and a Useful First Result', "Several courses are saved for later, but the skill you wanted to learn is still untried.", [
        "Preparation can feel reassuring. When it keeps postponing the first attempt, trying a basic version may show you exactly what you need help with.",
        `The selected year’s comparison is used here to explore **${focus.tasks}**. Is there something on that list you already want to try, or something that would help with a job you have now?`,
        `Your birth-month reading still suggests **${c.work.setting}**. Leave room for that when you plan. A new yearly idea does not mean you have to give up the things that help you do good work.`,
        `A practical test is: **${focus.proof}** Start with what can be done in a short, realistic block of time.`,
        `Watch for **${annual.friction}**. If you recognise that situation, clarify the task or the agreement before treating the whole year as a success or failure.`,
        'Use a review date to compare the work with the result. Ask what helped, what took more time than expected and which part should be tried differently. Keep a record that can guide the next monthly step.',
      ], [pillarFact(result, 2), `Annual stem ${annualPillar[0]}: ${annualGod}.`], 'Choose one annual skill or project goal. Define the first useful result and a date to review it.', { keepClose: ['One skill or project result that can be reviewed this month.', `Time for the birth-month condition of ${c.work.setting}.`], watchFor: ['Adding annual goals without choosing which current task will move.', 'Treating a broad intention as progress before there is a first result.'] }, 'career'),
      chapter('annual-money', 'Money and the Promises Around It', "Your spending record shows several small payments for things you barely use anymore.", [
        `**When to pay attention:** ${moneyMonths.length ? `The ${moneyMonths.map(month => month.label).join(', ')} reference month stems relate to money for your day stem. Those are periods to examine concrete pay or offer decisions; they do not guarantee income.` : 'None of the twelve sampled month stems directly carries a money symbol. That does not rule out earning or opportunities.'}`,
        "Each purchase may have made sense at the time. Looking at them together can reveal how much of your next month is already spoken for before you add another plan.",
        `The money symbols in your birth chart are used here to explore **${money.theme}**. Comparing the selected year with your birth-day symbol adds **${annual.theme}**. See whether either idea helps you understand a real offer or regular task.`,
        "Write down the costs and the time you know about. List what is still uncertain in a separate column. It is easier to change a plan when you know which parts you were only guessing about.",
        `One thing to notice is **${life.moneyWatch}**. Before saying yes to a new plan, picture it alongside everything you are already paying for or doing.`,
        "For example, a new subscription, course or project can bring a regular cost after the first payment. Review how often the promise repeats and what would make you stop or change it.",
        'Use actual figures and suitable advice for important financial choices. **Do not choose a purchase, investment or borrowing decision because a month is labelled favourable.** This report does not calculate lucky dates or financial outcomes.',
      ], [...money.facts, `Annual relationships: stem ${annualGod}; principal inner stem ${annualInnerGod}.`], 'Review one recurring commitment before adding another. Note the full cost, the work needed and the date you will check it again.', { keepClose: ['Confirmed figures and written assumptions.', "A time to look again at something you pay for or do regularly."], watchFor: [life.moneyWatch, 'Treating an annual theme as a guaranteed financial result.'] }, 'money'),
      chapter('annual-connections', 'Relationships and Shared Expectations', "You fill the calendar with something important, then learn that someone close expected to spend that time together.", [
        "Excitement about a new plan does not mean you meant to leave them out. The conversation becomes easier when each person can say what they expected before either gives something up.",
        `The relationship part of your reading suggests you may appreciate **${c.relationship.need}**. Keep that need visible when busy plans or new responsibilities fill the calendar.`,
        `The birth-day reading also suggests you may appreciate **${c.personal.need}**. Tell the other person which part matters to you. The yearly reading cannot tell them how you feel.`,
        `A sentence to try is: **“${c.relationship.words}”** Use it in an ordinary conversation where you can listen to the answer.`,
        `The year’s comparison brings up **${annual.theme}**. In a relationship, one way to explore that idea is: **${life.connection}** Ask the other person what would work for them.`,
        'This is a one-person annual report. It does not compare a partner’s birth chart or predict marriage, separation or the arrival of a relationship. Use a two-person reading when you want to explore two sets of chart symbols.',
      ], [pillarFact(result, 1), ...pairFacts(annualPillar, c.day.pillar.ganzi, 'Annual / birth day')], 'Ask someone close what kind of support would help with one plan. Share your own need and agree a practical next step.', { keepClose: [`A conversation that makes room for ${c.relationship.need}.`, 'A shared plan the other person has actually had a chance to answer.'], watchFor: ['Expecting someone to rearrange their year around a plan they have not agreed to.', 'Using a one-person annual theme to predict another person’s feelings.'] }, 'love'),
      chapter('annual-cycle-context', 'The Longer Chapter Around This Year', "A short-term opportunity pulls you away from a longer goal that still matters.", [
        "The new option may be useful without replacing the older aim. It helps to ask what each choice would require now, instead of assuming one has to be the right direction for every part of your life.",
        `These are the longer periods available in the calculation for **${year}**. The dates in the notes show when each one begins; the year headings are only short labels.`,
        ...(cycles.length ? cycles.map(cycle => {
          const start = cycle.startDate.getUTCFullYear()
          const theme = WORK_PROFILES[cycle.stemSipsin]
          return `The **${start}–${start + 9}** cycle brings **${theme.theme}** into this reading. Compare it with the annual focus on ${annual.theme}. Ask whether there is something you want to do that leaves room for both ideas.`
        }) : ['No ten-year cycle is available in the calculated range for this reference year. This report keeps that gap visible instead of inventing a later period.']),
        "The longer period and the selected year may suggest different ideas. Keep the one that helps you think through a real choice. Neither can tell you that a particular event will happen.",
        'If the birth time is unknown, cycle starting dates remain approximate. Keep plans flexible around timing labels and use the monthly references as discussion points rather than exact deadlines.',
      ], cycleFacts(result, year), 'Write down one annual aim and one longer-term aim. Choose a small task that can support both.', { keepClose: ['An annual task that also supports a longer aim you still value.', 'The stated calculation dates alongside the broad period labels.'], watchFor: ['Turning a ten-year label into a deadline for a major life decision.', 'Abandoning an existing aim before checking whether the annual task could support it.'] }, 'timeline'),
      chapter('annual-plan', 'A Year You Can Review', "Months after January, an ambitious plan makes the year feel further off course than it really is.", [
        "Your circumstances may have changed since you wrote it. A useful review makes room for what you have learned, instead of asking you to keep a promise you would no longer choose.",
        `Your birth-day reading suggests **${c.personal.need}**. Think of a place for that in the week you already have. You do not need to wait until everything else is sorted out.`,
        `For the yearly idea, you could try this: **${life.yearStep}** Notice whether it helped before making it another thing you promise to do every month.`,
        'Give each season a review question: **What will I begin? What will I practise? What will I simplify? What will I carry forward?** These are planning stages you can move to fit your life, rather than predictions assigned to calendar quarters.',
        "At the end of the month, ask what helped, what turned out differently from what you expected and what you still want to do. A short note is enough.",
        `If you feel stuck, come back to the suggestion from your birth-day reading: **${c.personal.practice}** Ask whether it helps with the actual problem in front of you.`,
        'The twelve monthly pages below give calculated themes and guided questions. **They do not promise twelve sets of events.** Read the references, try a useful step and review what really happened.',
      ], [pillarFact(result, 1), `Annual stem relationship ${annualGod}; annual principal inner-stem relationship ${annualInnerGod}.`], 'At the end of the month, note what happened, what surprised you and what you still want to do.', { keepClose: ['A brief record of an actual result and one changed assumption.', 'A next step small enough to revise at the following review.'], watchFor: ['Keeping a yearly plan unchanged after the circumstances have changed.', 'Judging the whole year by a goal you no longer want.'] }, 'next-moves'),
    ], months,
    methodNotes: [...commonMethod(result, year), REFERENCE_CLOCK_NOTE, `The annual label uses the year pillar sampled at 12:00 Asia/Seoul on 15 July ${year}. It does not assume that the Saju year begins on 1 January.`, 'Every monthly reference is calculated separately for the 15th at 12:00 Asia/Seoul. It is a representative point, not the start or the full span of a Gregorian calendar month. Solar-term boundaries can change the pillar within a calendar month.', 'The monthly comparison uses the natal day stem, the reference month stem, its principal inner stem and pair-pattern checks against the natal day and month. It does not use guessed birth-hour relationships.', 'The sequence of monthly planning topics is editorial. The traditional comparison themes come from the calculated symbols. Neither part is an event forecast or a calculation of lucky dates.'],
  })
}
