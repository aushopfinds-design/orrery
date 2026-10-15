import { buildReportApplications } from './report-applications.ts'
import type { SajuResult } from '@orrery/core/types'
import { chapter, chartContext, commonMethod, cycleFacts, finishReading, moneyMarkers, pillarFact, selectedCycles, subject, validateYear } from './category-shared.ts'
import { FOCUS_WORK } from './category-profiles.ts'
import { WORK_CONNECTIONS } from './reading-connections.ts'
import { WORK_PROFILES } from './reading-profiles.ts'
import { buildReportExtras } from './report-extras.ts'
import { LIFE_FOCUS } from './reading-scenarios.ts'
import { workExample } from './personal-examples.ts'

export function buildCareerReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  validateYear(referenceYear, result)
  const c = chartContext(result)
  const focus = FOCUS_WORK[c.month.stemSipsin]
  const innerFocus = FOCUS_WORK[c.month.branchSipsin]
  const life = LIFE_FOCUS[c.month.stemSipsin]
  const money = moneyMarkers(result)
  const cycles = selectedCycles(result, referenceYear)
  const future = result.input.unknownTime ? null : WORK_PROFILES[c.hour.stemSipsin]
  return finishReading({ kind: 'career', title: 'Career & Money', referenceYear,
    applications: buildReportApplications('career', result),
    extras: buildReportExtras('career', result),
    headline: 'Find a workable role. Make the full commitment clear.', subjects: [subject(result)],
    summary: [{ label: 'Your working conditions', text: c.work.setting }, { label: 'Your useful contribution', text: c.work.contribution }, { label: 'Your money conversation', text: money.theme }],
    chapters: [
      chapter('working-style', 'A Work Style You Can Test', '**Look at the work you will do each day.** A job title alone cannot tell you whether the setting will fit.', [
        `Your starting style values **${c.personal.focus}**. Your birth month adds **${c.work.theme}**. We use both themes to explore how you work.`,
        WORK_CONNECTIONS[c.day.pillar.stem][c.family],
        `A setting worth comparing is one with **${c.work.setting}**. Ask whether the actual workload and decisions leave room for that setting.`,
        `A pressure point is **${c.work.friction}**. Think of one recent task where that pressure appeared. Write down what happened before deciding that the whole role is wrong.`,
        'Choose one small change you can discuss or test. A clearer brief, a better handover or a useful block of working time can tell you more than a broad label about your career.',
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Describe one task that suited you and one that drained your attention. Identify the working condition that differed.', c.work, 'career', workExample(result, 'career')),
      chapter('two-work-layers', 'What the Daily Routine Needs', '**Your chart may show more than one working theme.** A suitable role can make room for both instead of forcing you into one narrow label.', [
        `The main birth-month theme suggests tasks such as **${focus.tasks}**. Treat these as examples to compare with your experience, rather than occupations you are destined to enter.`,
        c.month.stemSipsin === c.month.branchSipsin ? 'Both parts of the birth month repeat the same traditional theme. Check the everyday routine closely: doing a familiar kind of work well still needs a realistic pace and useful feedback.' : `The inner part of the month adds **${c.inner.theme}**. It points to tasks such as ${innerFocus.tasks}. Notice which part is missing from the work you currently do.`,
        'For example, a role can offer interesting projects but little time to complete them. Another can offer clear duties but no chance to ask a useful question. Name the missing condition in ordinary terms.',
        `One question to ask is: **“${focus.interview}”** Listen for an example of what happens in practice, not just a reassuring promise.`,
        'Your qualifications, interests and real opportunities matter alongside this reading. A chart theme can help you frame a question; it cannot replace a job description or a trial of the actual work.',
      ], [pillarFact(result, 2), `Principal inner-stem relationship: ${c.month.branchSipsin}.`], 'Choose a real role or project. Compare its routine with both working themes and mark one question to ask.', c.inner, 'career'),
      chapter('proof-of-skill', 'Show What You Can Actually Do', '**Build evidence of one useful skill.** A concrete example makes your contribution easier for another person to understand.', [
        `Your work theme puts **${c.work.contribution}** in focus. Start with one task where that contribution can be seen, rather than listing every strength you hope to have.`,
        `A suitable experiment is: **${focus.proof}** Keep the example small enough to finish and explain clearly.`,
        `Your starting style also values **${c.personal.need}**. Decide what support or working time you need before beginning the experiment.`,
        'Record the brief, the decisions you made and the result. If it did not work as expected, name what you learned and which part you would change. An honest example is more useful than a polished claim without evidence.',
        'Ask someone who knows the task whether the result is useful. **Separate feedback about the work from a judgment of your worth.** Use a clear observation to choose the next improvement.',
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Finish one small example this week. Write three lines explaining the task, your contribution and what changed.', c.personal, 'personality'),
      chapter('feedback-and-boundaries', 'Feedback, Expectations and Limits', '**Agree what you are responsible for.** Useful feedback gives you a clearer next step instead of a larger, unexplained burden.', [
        `Your wider-group theme is **${c.group.theme}**. It points to ${c.group.contribution}. Consider whether other people expect that role from you at work.`,
        c.year.stemSipsin === c.month.stemSipsin ? 'The group and work themes match. You may be asked to repeat the same contribution in several settings. Check whether the total responsibility still fits your available time.' : `Your working theme, **${c.work.theme}**, differs from the wider-group theme. The contribution people expect may not be the part you find easiest to sustain. Name the difference before accepting another task.`,
        future ? `The birth-hour theme adds **${future.theme}**. Use that extra perspective when considering the kind of work you want to develop over time.` : 'Your birth hour is unknown. This report leaves the hour-based perspective out instead of inventing a long-term career conclusion.',
        `Ask your manager or teammate: **“${focus.interview}”** Then check three things: **who decides, what help is available and when you will review the result**.`,
        'If several requests compete, ask which one comes first and which can wait. **A clear limit protects an agreed result.** It does not require treating every request as a personal conflict.',
      ], [pillarFact(result, 3), pillarFact(result, 2), ...(result.input.unknownTime ? [] : [pillarFact(result, 0)])], 'Choose one unclear expectation. Ask for the priority, the definition of a finished result and the support available.', c.group, 'social'),
      chapter('money-commitments', 'Income, Pay and the Work Behind the Number', `**Your checked money theme is ${money.theme}.** Your working theme adds a question about ${life.incomeStyle}.`, [
        money.steady && money.opportunity ? 'The checked chart contains both steady-commitment and opportunity themes. Compare a reliable base with the time a new opening would need. Neither symbol tells you how much you will earn.' : money.opportunity ? 'The checked opportunity theme makes a useful prompt for reviewing a new role or side project. **Separate confirmed pay from hoped-for earnings**, and check the work needed after the appealing first step.' : money.steady ? 'The checked steady-commitment theme gives you a reason to look closely at regular duties and recurring pay. A familiar arrangement can still need a clearer description when the workload changes.' : 'A clear visible money theme is not present in the checked positions. Use your actual work and records to explore income habits; that absence does not mean a lack of earning ability.',
        `One pattern to examine is **${life.moneyWatch}**. This comes from your working theme, not a prediction about your bank balance.`,
        `For example: **${life.moneyExample}** Compare that scene with one offer, payslip or recurring duty you actually understand.`,
        `Before accepting more work, ask: **“${life.payQuestion}”** Write down the **agreed pay and expected hours**. Add extra duties, necessary costs and follow-up time. Mark any unanswered points.`,
        'Put two real options beside each other: **what is confirmed, what you must deliver and what remains uncertain**. Use the actual figures and appropriate advice for important financial decisions. The chart supplies a conversation theme; the agreement shows the commitment.',
      ], [...money.facts, pillarFact(result, 2)], 'Compare one real offer or recurring role using five lines: confirmed pay, expected hours, extra duties, necessary costs and unanswered questions.', { keepClose: ['A clear description of the role and how added duties are discussed.', 'Confirmed pay and a record of the time the work actually needs.'], watchFor: [life.moneyWatch, 'Treating a money marker as proof of future earnings.'] }, 'money'),
      chapter('work-chapters', 'Your Longer Working Chapters', '**Use a life-cycle theme to choose a small experiment.** A calculated period does not promise a promotion, a new job or a financial result.', [
        `These are the available current or upcoming ten-year chapters for **${referenceYear}**. The notes give each calculated starting date.`,
        ...(cycles.length ? cycles.map(cycle => {
          const start = cycle.startDate.getUTCFullYear()
          const theme = WORK_PROFILES[cycle.stemSipsin]
          const step = FOCUS_WORK[cycle.stemSipsin]
          return `For **${start}–${start + 9}**, the added theme is **${theme.theme}**. Try one skill test: **${step.proof}**`
        }) : ['No ten-year cycle is available for this reference year in the calculated range. The report does not invent a later cycle to fill the space.']),
        `Your birth-month theme remains **${c.work.theme}**. Try the added theme alongside the conditions that already help you work well.`,
        'Compare the completed task with the feedback. Keep the useful part, adjust what did not fit and choose one next step.',
      ], cycleFacts(result, referenceYear), 'Choose one cycle theme and one small task that would let you test it without changing your whole career.', c.work, 'timeline'),
      chapter('career-plan', 'A Thirty-Day Career Experiment', '**Choose one question, one example and one review date.** A small plan gives you something concrete to assess.', [
        `In the first week, choose one real task. Your own starting need is **${c.personal.need}**. Your work setting calls for **${c.work.setting}**. Check each one. Note a condition to keep and a change to discuss.`,
        `In the second week, build evidence: **${focus.proof}** Ask for feedback from someone who understands the task.`,
        'In the third week, review one commitment around time or money. Clarify what is included, which part may grow and what would need a new agreement.',
        `In the fourth week, use your starting-style practice: **${c.personal.practice}** Compare the result with what you expected, rather than judging the entire month as success or failure.`,
        'Finish with a short decision: keep the current approach, adjust one condition or test a different task. **Choose from what you learned.** The chart helps organise the questions; the work gives you the evidence.',
      ], [pillarFact(result, 1), pillarFact(result, 2), ...money.facts], 'Book a review in thirty days. Bring the example, the feedback and one decision about your next task.', { keepClose: [c.personal.keepClose[0], c.work.keepClose[0]], watchFor: [c.personal.watchFor[0], c.work.watchFor[0]] }, 'next-moves'),
    ], months: [], methodNotes: [...commonMethod(result, referenceYear), 'Working tasks, interview questions and portfolio experiments are original examples selected from the birth-month relationships and day-symbol themes. They are not a validated career aptitude test.', 'Money checks identify traditional visible or inner-stem markers without strength weights. They do not forecast income, investment results or business profitability.'],
  })
}

export function buildBusinessReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  validateYear(referenceYear, result)
  const c = chartContext(result)
  const focus = FOCUS_WORK[c.month.stemSipsin]
  const groupFocus = FOCUS_WORK[c.year.stemSipsin]
  const money = moneyMarkers(result)
  const cycles = selectedCycles(result, referenceYear)
  return finishReading({ kind: 'business', title: 'Business & Entrepreneurship', referenceYear,
    applications: buildReportApplications('business', result),
    extras: buildReportExtras('business', result),
    headline: 'A clear offer, a workable promise and room to learn.', subjects: [subject(result)],
    summary: [{ label: 'Your founder theme', text: c.personal.focus }, { label: 'An offer to test', text: focus.offer }, { label: 'Your capacity pressure', text: focus.capacity }],
    chapters: [
      chapter('founder-style', 'How You Begin Something of Your Own', '**Start with a small promise you can test.** A business idea needs a customer and a delivery plan, as well as enthusiasm.', [
        `Your starting theme is **${c.personal.focus}**. The image behind it is ${c.personal.image}. Consider what this suggests about the way you choose and refine an idea.`,
        `Your work theme adds **${c.work.theme}**. In a business setting, that points toward testing ${focus.offer}. This is an example of an approach, not a verdict on which industry you should enter.`,
        `A useful personal condition is **${c.personal.need}**. Leave room for it in the way you organise your work, instead of expecting a business to remove every pressure you already face.`,
        `One habit to watch is **${focus.capacity}**. Notice whether it appears when you imagine serving a real customer with a real deadline.`,
        'Write down one problem, one person who has it and one result you could provide. **Keep the first promise smaller than the whole vision.** A clear test can change the plan without requiring you to abandon the aim.',
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Describe one offer in a sentence: who it helps, what result it provides and what the first delivery includes.', c.personal, 'personality', workExample(result, 'business')),
      chapter('offer-test', 'Find Out Whether the Offer Is Useful', '**Listen for a real need before adding more features.** Interest in an idea is not the same as a clear reason to use it.', [
        `The birth-month theme suggests ${focus.offer}. A first experiment is: **${focus.experiment}**`,
        c.month.stemSipsin === c.month.branchSipsin ? 'Both parts of the month repeat the same theme. Keep the test focused so you can see whether the central promise is useful before expanding it.' : `The inner month adds **${c.inner.theme}**. Ask whether the offer needs room for that contribution too. A useful adjustment may be smaller than creating a second product.`,
        `Ask a willing tester: **“${focus.customer}”** Let them describe their current problem before explaining every part of your solution.`,
        'For example, a service can look attractive but require more effort from the customer than they want to give. Ask what they would need to do and which part would stop them using it.',
        'Record the questions that repeat and the parts that remain unclear. **Use the answers to improve one promise.** This reading cannot prove demand or replace contact with people who might use the offer.',
      ], [pillarFact(result, 2)], 'Talk to a few willing testers about one problem. Write down the words they use and one change you will test next.', c.work, 'career'),
      chapter('team-decisions', 'Roles, Collaboration and Decisions', '**Agree who owns each decision before the work becomes busy.** Good collaboration makes responsibilities easier to see.', [
        `Your wider-group theme is **${c.group.theme}**. It can suggest a contribution through ${c.group.contribution}. Compare that role with what a partner or teammate actually wants to do.`,
        `Your own main offer centres on **${c.work.theme}**. The group perspective suggests tasks involving ${groupFocus.tasks}. Decide which parts need separate owners and which need a shared answer.`,
        'A partner can bring a different method without becoming a permanent opposite to your own. Name the task, the needed skill and the person who will make the final decision.',
        'For a small launch, separate delivery, customer messages, records and changes to the offer. **Write down the handover.** Do not let every unfinished task silently fall to the person who notices it first.',
        'This is a one-person report. It does not calculate a co-founder match or decide how ownership should be divided. Use actual contributions, clear agreements and appropriate advice for those decisions.',
      ], [pillarFact(result, 3), pillarFact(result, 2)], 'Choose four recurring tasks. Assign an owner, a backup and one condition that requires a shared decision.', c.group, 'social'),
      chapter('delivery-capacity', 'Capacity, Costs and a Promise You Can Keep', '**Count the work behind one delivery.** A price or deadline is easier to explain when you understand what the promise includes.', [
        `Your checked money theme is **${money.theme}**. Use it to review commitments, rather than to estimate what the business will earn.`,
        `The business pressure to watch is **${focus.capacity}**. It may appear through extra revisions, recurring duties or requests that were never included in the first agreement.`,
        'List preparation, delivery, customer messages, revisions and follow-up. Add the materials or services needed for each part. Keep confirmed figures separate from rough estimates.',
        'For example, a short customer task may also need setup and several replies. **Include that work in the capacity plan.** A full calendar can still contain promises that have not been completed.',
        'Choose a delivery limit you can test with actual work. Record what takes longer than expected and review the offer before increasing the number of customers. The chart does not calculate a sustainable price or a profit margin.',
      ], money.facts, 'Complete one small delivery or realistic trial. Record the time, costs and work that was left outside the original brief.', { keepClose: ['An explicit list of what the offer includes.', 'Actual delivery records and room to review an estimate.'], watchFor: [focus.capacity, 'Calling expected revenue a confirmed result.'] }, 'money'),
      chapter('customer-communication', 'Customer Conversations and Clear Boundaries', '**Make the next step easy to understand.** A customer should know what you will do, what you need from them and when you will reply.', [
        `Your starting style values **${c.personal.need}**, while your working theme emphasises **${c.work.theme}**. In a customer conversation, turn those needs into a clear way to explain what you can deliver.`,
        `One useful customer question is: **“${focus.customer}”** Ask it before filling a gap with your own assumption.`,
        'Write a short confirmation of the result, the deadline and any customer input needed. Explain how a new request changes the work. **A clear boundary helps the customer choose**, rather than leaving them to guess.',
        'When feedback arrives, ask which part failed to meet the agreed result. Separate a useful correction from a new request that needs a fresh discussion.',
        'For example, a customer may ask for another version after the work is complete. Review what was included and explain the available next step. A calm, specific answer is easier to act on than an unexplained yes or no.',
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Draft a five-line customer confirmation: result, deadline, needed input, included changes and the next contact point.', { keepClose: ['A customer who can explain the result they need.', 'A written brief, a reply window and a clear way to discuss changes.'], watchFor: ['Treating a new request as an included revision without discussing it.', 'Promising an immediate reply when the delivery already needs your attention.'] }, 'social'),
      chapter('business-chapters', 'Life-Cycle Themes for Business Experiments', '**Use a period theme to shape an experiment.** The timing label does not tell you when to launch, borrow money or expect a return.', [
        `The available cycles are selected using **${referenceYear}**. Their exact calculated starts are in the notes. Compare a theme with the stage of your actual work.`,
        ...(cycles.length ? cycles.map(cycle => {
          const start = cycle.startDate.getUTCFullYear()
          const theme = WORK_PROFILES[cycle.stemSipsin]
          const step = FOCUS_WORK[cycle.stemSipsin]
          return `For **${start}–${start + 9}**, the added theme is **${theme.theme}**. A business experiment to consider is: **${step.experiment}** Review what the test teaches before expanding the offer.`
        }) : ['The calculated range has no ten-year cycle for this reference year. No business timing has been invented to replace it.']),
        `Your birth-month approach remains connected with **${c.work.theme}**. A later theme can add a question without requiring you to discard a delivery method that already works.`,
        'Actual demand, costs, capacity and obligations matter more than a symbolic timing label. **Choose a test you can explain and review.** Keep later plans open to information you do not yet have.',
      ], cycleFacts(result, referenceYear), 'Choose one period theme. Write a small customer or delivery experiment and a date to review the result.', c.work, 'timeline'),
      chapter('business-plan', 'A Thirty-Day Offer Experiment', '**One customer problem, one small offer, one honest review.** The aim is to learn what you can deliver and whether the result is useful.', [
        `In the first week, define the offer around **${focus.offer}**. Talk to willing testers and listen for the problem they want solved.`,
        `In the second week, try the delivery: **${focus.experiment}** Keep a record of the steps, the time and the questions that appear.`,
        `In the third week, review the pressure point of **${focus.capacity}**. Clarify one limit or simplify one recurring task before expanding the promise.`,
        `In the fourth week, use the starting-style practice: **${c.personal.practice}** Ask whether it helped you finish or understand the test.`,
        'Choose a next step from the evidence: repeat the small offer, adjust it or stop this version. **A useful lesson is still a result.** No part of the chart guarantees that an idea will become a profitable business.',
      ], [pillarFact(result, 1), pillarFact(result, 2), ...money.facts], 'Book a thirty-day review. Bring the customer questions, the delivery record and one decision about the next version.', { keepClose: [c.work.keepClose[0], c.personal.keepClose[0]], watchFor: [focus.capacity, c.personal.watchFor[0]] }, 'next-moves'),
    ], months: [], methodNotes: [...commonMethod(result, referenceYear), 'The report uses one birth chart. It is not a comparison of business partners, a company chart or a market-demand model.', 'Offer examples and launch experiments are editorial prompts. Profit, prices, legal duties, tax, ownership and borrowing decisions must be assessed from the actual business situation.'],
  })
}
