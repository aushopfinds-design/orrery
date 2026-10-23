import { buildDecisionFocus } from './decision-focus.ts'
import { buildReportApplications } from './report-applications.ts'
import type { SajuResult } from '@orrery/core/types'
import { chapter, chartContext, commonMethod, finishReading, pillarFact, subject, validateYear } from './category-shared.ts'
import { ELEMENT_MEANING } from './reading.ts'
import { buildReportExtras } from './report-extras.ts'
import { everydayExample } from './personal-examples.ts'

export function buildBalanceReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  validateYear(referenceYear, result)
  const c = chartContext(result)
  const decision = buildDecisionFocus('wellbeing', result)
  const maximum = Math.max(...c.snapshot.elements.map(item => item.count))
  const prominent = c.snapshot.elements.filter(item => item.count === maximum)
  const zero = c.snapshot.elements.filter(item => item.count === 0)
  return finishReading({ focus: decision, kind: 'wellbeing', title: 'The Real You: Strengths & Weaknesses', referenceYear,
    applications: buildReportApplications('wellbeing', result),
    extras: buildReportExtras('wellbeing', result),
    headline: decision.headline, subjects: [subject(result)],
    summary: [{ label: 'Your own space', text: c.personal.need }, { label: 'A routine to examine', text: c.work.friction }, { label: 'The visible element picture', text: prominent.map(item => item.element).join(' and ') + (prominent.length === 1 ? ' appears most often in this count' : ' appear most often in this count') }],
    chapters: [
      chapter('everyday-pace', 'Your Everyday Pace', '**Notice where effort becomes an automatic yes.** A workable routine makes room for your needs as well as the tasks around you.', [
        `Your starting theme is **${c.personal.focus}**. The image behind it, ${c.personal.image}, can help you describe a familiar habit without treating the habit as a fixed identity.`,
        c.personal.pressure,
        `A useful condition for you is **${c.personal.need}**. Look at one ordinary day and ask where that condition appears, where it is missing and which small change is possible.`,
        'Try a brief **look back at one day**: what did you choose, what interrupted you and what did you take on without being asked? One sentence for each is enough. Look for the moment a useful task turned into an automatic duty.',
        'For a smaller response, try: **“I can help with this part. The other part will need to wait or be shared.”** Choose an ordinary task where that answer is realistic, and notice what changes.',
      ], [pillarFact(result, 1)], c.personal.practice, c.personal, 'personality', everydayExample(result, 'wellbeing')),
      chapter('visible-elements', 'Five Elements as a Habit Picture', `**${prominent.map(item => item.element).join(' and ')} ${prominent.length === 1 ? 'appears' : 'appear'} most often in the visible count.** This is a picture of symbols, not a score for health or personal balance.`, [
        `The chart uses **${c.snapshot.visibleMarkers} visible symbols**. Their counts are ${c.snapshot.elements.map(item => `${item.element} ${item.count}`).join(', ')}. The diagram shows exactly those counts.`,
        `In traditional imagery, the most frequent visible elements are linked with **${prominent.map(item => ELEMENT_MEANING[item.element]).join('; ')}**. Choose one image that helps you notice an everyday response.`,
        zero.length ? `${zero.map(item => item.element).join(' and ')} ${zero.length === 1 ? 'does' : 'do'} not appear in this visible count. **A zero does not mean a missing ability or a health problem.** Inner parts of the chart can contain other symbols.` : 'All five elements appear in the visible count. That does not tell us whether a day feels balanced or whether a routine is sustainable.',
        'Try changing one small response to an ordinary task. If you usually decide quickly, ask a question first. If you usually keep thinking, choose a small step you can review.',
        'The count does not calculate a useful element, lucky colour, direction or object. You do not need to buy something or change a health routine because of a number in this diagram.',
      ], c.available.map(item => pillarFact(result, item.index)), 'Choose one familiar response. Try another approach to a small task and record whether it helps.', { keepClose: ['Curiosity about a habit you already recognise.', 'A small experiment you can stop or adjust.'], watchFor: ['Turning an element count into a judgment of your health.', 'Treating a zero as a defect that needs a purchase or a remedy.'] }, 'balance'),
      chapter('workload-rhythm', 'A Routine with Clear Edges', '**Give recurring duties a visible limit.** A task can be useful without expanding into every free moment.', [
        `Your working theme is **${c.work.theme}**. A helpful setting has ${c.work.setting}. Check whether your daily routine offers that condition in practice.`,
        `The pressure to watch is **${c.work.friction}**. It may be easier to address one unclear duty than to describe the whole week as too much.`,
        c.work.scene,
        'Choose one recurring task at home or work. Write its **start, stopping point and owner**. Add a small transition after it, such as putting the materials away before opening another task. The aim is a visible ending rather than another ideal routine to maintain.',
        'Leave a point at which the work can be reviewed rather than endlessly carried forward. **A clear edge helps you see what is unfinished and what can wait.** It does not make every delay a personal failure.',
      ], [pillarFact(result, 2)], c.work.next, c.work, 'career'),
      chapter('support-and-space', 'Support, Conversation and Your Own Space', '**Ask for the kind of help you need.** People can respond more clearly when they know whether you want an idea, a practical hand or a chance to speak.', [
        `Your close-conversation theme values **${c.relationship.need}**. Your own starting style also needs **${c.personal.need}**. Try naming both parts in an ordinary conversation.`,
        `You could say: **“${c.relationship.words}”** Give the other person a chance to say what they can offer too.`,
        `A wider-group theme of **${c.group.theme}** may help you reflect on the role you take around other people. That role does not need to fill every private moment.`,
        'For example, being the person who notices an unfinished task can become a habit of silently taking it over. Ask who will handle the work before assuming it belongs to you.',
        'Keep a distinction between requesting support and expecting someone to guess. **Name one need and one clear next step.** Let the answer tell you whether another form of help is needed.',
      ], [pillarFact(result, 1), pillarFact(result, 3)], 'Tell someone one kind of support you would welcome, and one task or choice you want to keep for yourself.', c.relationship, 'love'),
      chapter('balance-week', 'A Seven-Day Routine Experiment', '**Change one small habit and review the result.** This is a personal reflection exercise, not a treatment plan.', [
        `For the first two days, observe one situation connected with **${c.personal.focus}**. Note the task, the interruption and the response you chose. You are collecting an example, not grading the whole day.`,
        `In the middle of the week, try one change that makes room for **${c.personal.need}**. Choose a clear stopping point, a smaller promise or a task to share. Keep the change small enough to compare with your first observations.`,
        `Before the week ends, try a conversation that makes room for **${c.relationship.need}**. Ask for one specific kind of help and let the other person say what they can offer.`,
        'At the end of seven days, note one helpful change, one part that did not fit and one adjustment for the next week. A small observation is enough; you do not need a perfect record.',
        'Use the chart images only where they help you ask a useful question. **Keep what works in your actual life.** If a concern involves your health or safety, seek suitable real-world support rather than relying on this report.',
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Book a short review in seven days. Bring one observation and one change you want to keep.', { keepClose: ['One ordinary example from before and after the change.', 'A smaller version of the habit that works on a busy day.'], watchFor: ['Adding several new routine rules after one difficult day.', 'Judging the whole experiment by a perfect record instead of an easier task.'] }, 'next-moves'),
    ], months: [], methodNotes: [...commonMethod(result, referenceYear), 'Visible element counts are unweighted counts of the supplied stems and branches. They do not assess physical health, mental health or the strength of the full chart.', 'This report contains no diagnosis, treatment, symptom assessment, health prediction or recommendation for a medicine, supplement or remedy.'],
  })
}
