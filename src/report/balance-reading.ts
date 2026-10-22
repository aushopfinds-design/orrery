import { buildDecisionFocus } from './decision-focus.ts'
import { buildReportApplications } from './report-applications.ts'
import type { SajuResult } from '@orrery/core/types'
import { chapter, chartContext, commonMethod, finishReading, pillarFact, subject, validateYear } from './category-shared.ts'
import { ELEMENT_MEANING } from './reading.ts'
import { buildReportExtras } from './report-extras.ts'
import { everydayExample, relationshipExample } from './personal-examples.ts'

const ELEMENT_PRACTICE: Record<string, string> = {
  Wood: 'Choose a goal that still matters, then sketch a second route to it. Notice whether you can change the method without feeling that you have abandoned the aim.',
  Fire: 'After a lively conversation, leave a quiet gap before the next one. Notice whether the idea still feels like yours when nobody is waiting for a response.',
  Earth: 'Leave one familiar task with the person who agreed to do it. See what happens when being dependable includes trusting someone else to finish their part.',
  Metal: 'Name the two details that make the result useful. Let one less important detail stay unfinished, and check whether anyone actually needed it.',
  Water: 'Write down two possible routes, then test only one. Keep the other on paper so you can explore without reopening the decision all day.',
}

export function buildBalanceReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  validateYear(referenceYear, result)
  const c = chartContext(result)
  const decision = buildDecisionFocus('wellbeing', result)
  const maximum = Math.max(...c.snapshot.elements.map(item => item.count))
  const prominent = c.snapshot.elements.filter(item => item.count === maximum)
  const zero = c.snapshot.elements.filter(item => item.count === 0)
  return finishReading({ focus: decision, kind: 'wellbeing', title: 'Everyday Balance', referenceYear,
    applications: buildReportApplications('wellbeing', result),
    extras: buildReportExtras('wellbeing', result),
    headline: decision.headline, subjects: [subject(result)],
    summary: [{ label: 'A strength to use', text: c.personal.strength }, { label: 'A pressure to notice', text: c.personal.pressure }, { label: 'The visible element picture', text: prominent.map(item => item.element).join(' and ') + (prominent.length === 1 ? ' appears most often in this count' : ' appear most often in this count') }],
    chapters: [
      chapter('everyday-pace', 'Your Everyday Pace', everydayExample(result, 'wellbeing').scene, [
        c.personal.strength,
        `Your birth-day image is ${c.personal.image}. It gives this chapter a theme of **${c.personal.focus}**. The same response can help in one situation and become tiring when you keep using it after the situation changes.`,
        c.personal.pressure,
        `A useful condition for you is **${c.personal.need}**. Look at one ordinary day and ask where that condition appears, where it is missing and which small change is possible.`,
        'Think back to a moment when a natural strength became harder to use. Was the task still asking for that strength, or had it begun to need a different response? Name the change before deciding you simply needed to try harder.',
        `For one small situation, try this: **${c.personal.practice}** Afterwards, compare how the task felt with how it usually feels.`,
      ], [pillarFact(result, 1)], c.personal.practice, c.personal, 'personality', everydayExample(result, 'wellbeing')),
      chapter('visible-elements', 'Five Elements as a Habit Picture', "A small change to the day unsettles you, while someone else seems happy to improvise.", [
        "A familiar way of responding can be useful until the situation asks for something else. The element picture offers images to reflect on that response; it does not tell you how you must feel.",
        `The chart uses **${c.snapshot.visibleMarkers} visible symbols**. Their counts are ${c.snapshot.elements.map(item => `${item.element} ${item.count}`).join(', ')}. The diagram shows exactly those counts.`,
        `In traditional imagery, the most frequent visible elements are linked with **${prominent.map(item => ELEMENT_MEANING[item.element]).join('; ')}**. Choose one image that helps you notice an everyday response.`,
        zero.length ? `${zero.map(item => item.element).join(' and ')} ${zero.length === 1 ? 'does' : 'do'} not appear in this visible count. **A zero does not mean a missing ability or a health problem.** Inner parts of the chart can contain other symbols.` : 'All five elements appear in the visible count. That does not tell us whether a day feels balanced or whether a routine is sustainable.',
        ...prominent.map(item => `**An experiment from the ${item.element} image:** ${ELEMENT_PRACTICE[item.element]}`),
        'The count does not calculate a useful element, lucky colour, direction or object. You do not need to buy something or change a health routine because of a number in this diagram.',
      ], c.available.map(item => pillarFact(result, item.index)), 'Choose one familiar response. Try another approach to a small task and record whether it helps.', { keepClose: ['Curiosity about a habit you already recognise.', 'A small experiment you can stop or adjust.'], watchFor: ['Turning an element count into a judgment of your health.', 'Treating a zero as a defect that needs a purchase or a remedy.'] }, 'balance'),
      chapter('workload-rhythm', 'A Routine with Clear Edges', c.work.scene, [
        "A routine can fit the task while asking you to work in a way that feels awkward. This chapter looks at the conditions around the work, rather than asking you to change your whole personality.",
        `The birth-month part of this reading explores **${c.work.theme}**. It suggests you may do better with ${c.work.setting}. Think about where that is missing from the day you actually have.`,
        `You may find it difficult when you are **${c.work.friction}**. It may be easier to address one unclear duty than to describe the whole week as too much.`,
        c.month.stemSipsin === c.month.branchSipsin ? 'Both parts of your birth month repeat the same working theme. A small change to the conditions may be easier to judge than adding several new routines at once.' : `The inner part of your birth month adds **${c.inner.theme}**. A routine that only allows your more obvious contribution may leave this second preference unused. Think about whether the day gives both a place.`,
        "Choose one recurring task at home or work. Write its **start, stopping point and owner**. Add a small transition after it, such as putting the materials away before opening another task. The point is to let the task end, not give yourself another routine you must keep perfectly.",
        "Choose a time to stop and look at what is left, rather than carrying the task into every spare moment. **Once the job has an ending, it is easier to see which part can wait until tomorrow.** It does not make every delay a personal failure.",
      ], [pillarFact(result, 2)], c.work.next, c.work, 'career'),
      chapter('support-and-space', 'Support, Conversation and Your Own Space', relationshipExample(result).scene, [
        'Support can be well meant and still leave you feeling that the important part was missed. Describing that part gives the other person a chance to respond to the need you actually have.',
        `Your birth-day relationship theme values **${c.relationship.need}**. The pressure to notice is **${c.relationship.friction}**. This chapter is about recognising the kind of support you want, rather than improving a work routine.`,
        `You could say: **“${c.relationship.words}”** Give the other person a chance to say what they can offer too.`,
        `Comparing your birth-year symbol with your birth-day symbol brings up **${c.group.theme}**. See whether that fits a role people often give you. You do not have to keep being that person during your time off.`,
        'Describe one moment when support felt right and one when it missed the mark. Was the difference time, attention, practical help or having a choice? Give the other person an example they can recognise.',
        'Keep a distinction between requesting support and expecting someone to guess. **Name one need and one clear next step.** Let the answer tell you whether another form of help is needed.',
      ], [pillarFact(result, 1), pillarFact(result, 3)], 'Tell someone one kind of support you would welcome, and one task or choice you want to keep for yourself.', c.relationship, 'love'),
      chapter('balance-week', 'A Seven-Day Routine Experiment', "A new routine lasts through Monday. By Tuesday, a missed step makes you wonder whether to give up.", [
        "A plan that works only on a quiet day may ask too much of an ordinary week. Trying a smaller version can tell you more than judging yourself for not keeping the original one.",
        `For the first two days, observe one situation connected with **${c.personal.focus}**. Note the task, the interruption and the response you chose. You are trying to notice what happened, not give the whole day a score.`,
        `In the middle of the week, try one change that makes room for **${c.personal.need}**. Choose a clear stopping point, a smaller promise or a task to share. Keep the change small enough to compare with your first observations.`,
        `Before the week ends, try a conversation that makes room for **${c.relationship.need}**. Ask for one specific kind of help and let the other person say what they can offer.`,
        "At the end of seven days, note one helpful change, one part that did not fit and one adjustment for the next week. A few words about what happened are enough. You do not need to keep a perfect diary.",
        "Choose the change that helped on an ordinary busy day. **Keep that one for another week.** A useful result can be small: an easier start, a clearer conversation or less time spent reopening the same choice.",
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'At the end of the week, ask what felt easier and whether you want to keep the change.', { keepClose: ['One ordinary example from before and after the change.', 'A smaller version of the habit that works on a busy day.'], watchFor: ['Adding several new routine rules after one difficult day.', 'Judging the whole experiment by a perfect record instead of an easier task.'] }, 'next-moves'),
    ], months: [], methodNotes: [...commonMethod(result, referenceYear), 'Visible element counts are unweighted counts of the supplied stems and branches. They do not assess physical health, mental health or the strength of the full chart.', 'This report contains no diagnosis, treatment, symptom assessment, health prediction or recommendation for a medicine, supplement or remedy.'],
  })
}
