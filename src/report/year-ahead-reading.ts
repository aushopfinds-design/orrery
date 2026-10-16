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

const MONTH_REVIEW = [
  { action: 'Write the scope, owner and next review date of one existing promise.', keep: 'One agreement with a clear owner and review date.', watch: 'Renewing a promise without checking what it now requires.', review: 'Compare the agreed task with what was actually delivered. Which expectation still needs to be said aloud?' },
  { action: 'Make a version of the first step that fits into twenty minutes.', keep: 'A small first result you can finish with the resources already available.', watch: 'Adding tools, purchases or extra goals before the first attempt.', review: 'Did the first attempt answer a useful question? Name the next thing to test, rather than expanding the whole plan.' },
  { action: 'Put one request into a single sentence and ask the other person what they understood.', keep: 'A direct request with enough room for an honest answer.', watch: 'Treating a hint or a silent expectation as an agreement.', review: 'Write down the request and the answer separately. Did you agree on the same practical next step?' },
  { action: 'List the upfront cost, ongoing work and person responsible for each part of one commitment.', keep: 'The full time and cost of an offer, including follow-up.', watch: 'Comparing a headline price while overlooking recurring work.', review: 'Which cost or responsibility was missing from the first description? Update the plan before extending it.' },
  { action: 'Track one recurring task for a week and choose a realistic stopping point.', keep: 'A workable finishing rule for the task that keeps expanding.', watch: 'Using every spare moment to improve something already usable.', review: 'Was the routine repeatable on an ordinary week? Keep the part that helped and shorten the part that expanded.' },
  { action: 'Save one real example of a skill you used and ask for one specific observation about it.', keep: 'A finished example that shows what you can already do.', watch: 'Collecting more preparation without trying the skill in a real task.', review: 'What did the example demonstrate, and what still needs practice? Choose one small change for the next version.' },
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
      ...chapter(`month-${index + 1}`, label, `**${theme.title}.** ${MONTH_FOCUS[index][0]}.`, [
        `The monthly reference adds **${theme.theme}**. For ${label}, use this question: **${MONTH_FOCUS[index][1]}**`,
        `**A situation to explore:** ${situation.scene} Before agreeing, ask: **“${situation.question}”**`,
        branchGod === god ? `Both parts repeat the same theme in this reference. **${practice}** Then review the real result.` : `The second part adds **${innerTheme.theme}**. Leave room for it when you try this step: **${practice}**`,
        `**Review this month's attempt:** ${exercise.review} ${clash ? 'The checked clash adds a question about two different needs.' : combine ? 'The checked combination adds a question about how to share the next step.' : ''}`.trim(),
        `**Outside work:** ${monthlyLife.connection}${branchGod !== god ? ` A second idea: ${LIFE_FOCUS[branchGod].connection}` : ''}`,
      ], [`Reference ${referenceDate}, 12:00 Asia/Seoul (shared comparison clock, not birthplace): year ${yearPillar}; month ${pillar}.`, `Month stem ${pillar[0]} relative to birth-day stem ${c.day.pillar.stem}: ${god}; principal inner stem ${getJeonggi(pillar[1])}: ${branchGod}.`, ...pairFacts(pillar, c.day.pillar.ganzi, 'Month / birth day'), ...pairFacts(pillar, c.month.pillar.ganzi, 'Month / birth month')], practice, { keepClose: [exercise.keep], watchFor: [exercise.watch] }, 'timeline'),
      label, referenceDate, pillar, yearPillar,
    }
  })
  return finishReading({ focus: decision, kind: 'year', title: `${year} Year Ahead`, referenceYear: year,
    applications: buildReportApplications('year', result, { year }),
    extras: buildReportExtras('year', result, { year, annual: { theme: annual.theme, god: annualGod, pillar: annualPillar } }),
    headline: `${year}: ${decision.headline}`, subjects: [subject(result)],
    summary: [{ label: 'The annual theme', text: annual.theme }, { label: 'A second annual theme', text: inner.theme }, { label: 'Your own starting need', text: c.personal.need }],
    chapters: [
      chapter('annual-theme', 'Your Annual Theme and Your Starting Style', `**The added annual theme is ${annual.theme}.** Compare it with your own needs and the plans you actually have.`, [
        `Your starting style values **${c.personal.focus}**. This year adds a theme of **${annual.theme}**. Try both ideas with one small choice.`,
        annualGod === c.month.stemSipsin ? 'The annual and main birth-month themes match. That gives you a reason to review an existing working habit closely, rather than assuming that repetition promises a particular event.' : `Your usual working theme is **${c.work.theme}**. The added annual theme is different. Use it as an extra question when a familiar approach does not answer everything.`,
        `A second yearly theme is **${inner.theme}**. This reading uses both themes. One label cannot describe the whole year.`,
        `A question to carry through **${year}** is: **“${life.yearQuestion}”** Try it with a personal plan as well as a working responsibility.`,
        januaryPillar !== annualPillar ? 'The January reference still belongs to the earlier Saju year. The calendar year and the Saju year do not start at the same boundary. The monthly notes show the actual year and month symbols used.' : 'The monthly notes show the year and month symbols used at each reference point. They are not assumptions that every symbol changes on the first day of a calendar month.',
      ], [pillarFact(result, 1), pillarFact(result, 2), ...annualFacts, `January reference: ${januaryPillar}; July reference: ${annualPillar}.`], 'Choose one plan for the year. Write the annual theme beside your own starting need and name one question to check.', { keepClose: [`One annual intention that allows ${c.personal.need}.`, 'A distinction between the added annual theme and your existing circumstances.'], watchFor: ['Treating a yearly heading as an instruction to change everything.', 'Calling an annual theme good or bad before relating it to a real choice.'] }, 'personality', annualExample(result, year, annualGod, annualInnerGod, annualPillar)),
      chapter('annual-work', 'Work, Skills and a Useful First Result', '**Turn a broad yearly intention into something you can finish.** A task you can review gives you more information than a promise to change everything.', [
        `The annual theme points to tasks involving **${focus.tasks}**. Choose one example that fits your current responsibilities and interests.`,
        `Your birth-month setting values **${c.work.setting}**. Keep that need visible when you plan the task. An annual symbol does not remove the conditions that help you work well.`,
        `A practical test is: **${focus.proof}** Start with what can be done in a short, realistic block of time.`,
        `Watch for **${annual.friction}**. If that pressure appears, clarify the task or the agreement before treating the whole year as a success or failure.`,
        'Use a review date to compare the work with the result. Ask what helped, what took more time than expected and which part should be tried differently. Keep a record that can guide the next monthly step.',
      ], [pillarFact(result, 2), `Annual stem ${annualPillar[0]}: ${annualGod}.`], 'Choose one annual skill or project goal. Define the first useful result and a date to review it.', { keepClose: ['One skill or project result that can be reviewed this month.', `Time for the birth-month condition of ${c.work.setting}.`], watchFor: ['Adding annual goals without choosing which current task will move.', 'Treating a broad intention as progress before there is a first result.'] }, 'career'),
      chapter('annual-money', 'Money and the Promises Around It', '**Keep confirmed facts separate from hopes.** An annual theme is a prompt for reviewing commitments, not a forecast of earnings.', [
        `Your birth-chart money checks focus on **${money.theme}**. The annual theme adds **${annual.theme}**. Use those two views to examine one real offer or recurring duty.`,
        'Write down the costs and the time you know about. List what is still uncertain in a separate column. A plan is easier to revise when its assumptions are visible.',
        `The annual pressure to watch is **${life.moneyWatch}**. Check whether a new commitment would add that pressure to the costs and responsibilities you already carry.`,
        'For example, a new subscription, course or project can bring a recurring cost after the first payment. Review how often the promise repeats and what would make you stop or change it.',
        'Use actual figures and suitable advice for important financial choices. **Do not choose a purchase, investment or borrowing decision because a month is labelled favourable.** This report does not calculate lucky dates or financial outcomes.',
      ], [...money.facts, `Annual relationships: stem ${annualGod}; principal inner stem ${annualInnerGod}.`], 'Review one recurring commitment before adding another. Note the full cost, the work needed and the date you will check it again.', { keepClose: ['Confirmed figures and written assumptions.', 'A review date for recurring promises.'], watchFor: [life.moneyWatch, 'Treating an annual theme as a guaranteed financial result.'] }, 'money'),
      chapter('annual-connections', 'Relationships and Shared Expectations', '**Make room for a real answer.** The most useful relationship plan begins with asking what the other person needs.', [
        `Your close-relationship theme values **${c.relationship.need}**. Keep that need visible when busy plans or new responsibilities fill the calendar.`,
        `Your starting style also asks for **${c.personal.need}**. Say which part you need rather than assuming that an annual reading tells another person how to respond.`,
        `A sentence to try is: **“${c.relationship.words}”** Use it in an ordinary conversation where you can listen to the answer.`,
        `The annual theme is **${annual.theme}**. For a relationship, try this: **${life.connection}** Ask the other person what would work for them.`,
        'This is a one-person annual report. It does not compare a partner’s birth chart or predict marriage, separation or the arrival of a relationship. Use a two-person reading when you want to explore two sets of chart symbols.',
      ], [pillarFact(result, 1), ...pairFacts(annualPillar, c.day.pillar.ganzi, 'Annual / birth day')], 'Ask someone close what kind of support would help with one plan. Share your own need and agree a practical next step.', { keepClose: [`A conversation that makes room for ${c.relationship.need}.`, 'A shared plan the other person has actually had a chance to answer.'], watchFor: ['Expecting someone to rearrange their year around a plan they have not agreed to.', 'Using a one-person annual theme to predict another person’s feelings.'] }, 'love'),
      chapter('annual-cycle-context', 'The Longer Chapter Around This Year', '**One year sits within a longer story.** A ten-year cycle adds context without deciding what will happen in a particular month.', [
        `The following available cycles are selected using **${year}**. Their year labels are a summary; the notes give the calculated starting dates.`,
        ...(cycles.length ? cycles.map(cycle => {
          const start = cycle.startDate.getUTCFullYear()
          const theme = WORK_PROFILES[cycle.stemSipsin]
          return `The **${start}–${start + 9}** cycle brings **${theme.theme}** into this reading. Compare it with the annual focus on ${annual.theme}. A small question to carry forward is how both themes can fit one realistic plan.`
        }) : ['No ten-year cycle is available in the calculated range for this reference year. This report keeps that gap visible instead of inventing a later period.']),
        'A cycle theme and an annual theme can differ. Choose the part that helps you organise an actual task, then compare the result with your circumstances. Neither layer guarantees a particular event.',
        'If the birth time is unknown, cycle starting dates remain approximate. Keep plans flexible around timing labels and use the monthly references as discussion points rather than exact deadlines.',
      ], cycleFacts(result, year), 'Write down one annual aim and one longer-term aim. Choose a small task that can support both.', { keepClose: ['An annual task that also supports a longer aim you still value.', 'The stated calculation dates alongside the broad period labels.'], watchFor: ['Turning a ten-year label into a deadline for a major life decision.', 'Abandoning an existing aim before checking whether the annual task could support it.'] }, 'timeline'),
      chapter('annual-plan', 'A Year You Can Review', '**Plan in small steps and keep the evidence.** Your circumstances can change, so the plan needs room to change too.', [
        `Begin with your own starting need: **${c.personal.need}**. Choose one way to protect it in the calendar rather than waiting for a perfect time.`,
        `Begin a personal annual test: **${life.yearStep}** Use the first result to decide what deserves a place in the next month.`,
        'Give each season a review question: **What will I begin? What will I practise? What will I simplify? What will I carry forward?** These are planning stages you can move to fit your life, rather than predictions assigned to calendar quarters.',
        'At the end of each month, record one thing that helped, one assumption that changed and one task to carry forward. Keep the record short enough to use.',
        `When you feel stuck, return to the starting-style practice: **${c.personal.practice}** Ask whether it helps with the actual problem in front of you.`,
        'The twelve monthly pages below give calculated themes and guided questions. **They do not promise twelve sets of events.** Read the references, try a useful step and review what really happened.',
      ], [pillarFact(result, 1), `Annual stem relationship ${annualGod}; annual principal inner-stem relationship ${annualInnerGod}.`], 'Book a brief monthly review. Record one result, one changed assumption and one next step.', { keepClose: ['A brief record of an actual result and one changed assumption.', 'A next step small enough to revise at the following review.'], watchFor: ['Keeping a yearly plan unchanged after the circumstances have changed.', 'Judging the whole year by a goal you no longer want.'] }, 'next-moves'),
    ], months,
    methodNotes: [...commonMethod(result, year), REFERENCE_CLOCK_NOTE, `The annual label uses the year pillar sampled at 12:00 Asia/Seoul on 15 July ${year}. It does not assume that the Saju year begins on 1 January.`, 'Every monthly reference is calculated separately for the 15th at 12:00 Asia/Seoul. It is a representative point, not the start or the full span of a Gregorian calendar month. Solar-term boundaries can change the pillar within a calendar month.', 'The monthly comparison uses the natal day stem, the reference month stem, its principal inner stem and pair-pattern checks against the natal day and month. It does not use guessed birth-hour relationships.', 'The sequence of monthly planning topics is editorial. The traditional comparison themes come from the calculated symbols. Neither part is an event forecast or a calculation of lucky dates.'],
  })
}
