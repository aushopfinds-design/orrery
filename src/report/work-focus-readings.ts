import { buildDecisionFocus } from './decision-focus.ts'
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
  const decision = buildDecisionFocus('career', result)
  const focus = FOCUS_WORK[c.month.stemSipsin]
  const innerFocus = FOCUS_WORK[c.month.branchSipsin]
  const life = LIFE_FOCUS[c.month.stemSipsin]
  const money = moneyMarkers(result)
  const cycles = selectedCycles(result, referenceYear)
  const future = result.input.unknownTime ? null : WORK_PROFILES[c.hour.stemSipsin]
  return finishReading({ focus: decision, kind: 'career', title: 'Career & Money', referenceYear,
    applications: buildReportApplications('career', result),
    extras: buildReportExtras('career', result),
    headline: decision.headline, subjects: [subject(result)],
    summary: [{ label: "What helps you do the work", text: c.work.setting }, { label: "What you can bring to the job", text: c.work.contribution }, { label: "What to ask about pay", text: money.theme }],
    chapters: [
      chapter('working-style', "What a Good Working Day Feels Like", "Imagine doing the same kind of work in two jobs. In one, you can get on with it. In the other, you spend the day waiting for answers.", [
        "The task may suit you while the way the job is organised does not. It can be a relief to name that difference instead of deciding you are simply bad at the work.",
        `The main symbol for your birth day gives this reading an idea about **${c.personal.focus}**. Comparing it with your birth month adds **${c.work.theme}**. The question is how those two ideas fit the way you actually work.`,
        WORK_CONNECTIONS[c.day.pillar.stem][c.family],
        `You may find the job easier with **${c.work.setting}**. Think about an ordinary working day: would you actually have that, or is it only something the job description promises?`,
        `Something that may make work harder is **${c.work.friction}**. Think about the last time this happened. Was it the task, the timing or the way someone asked you to do it that made it difficult?`,
        "Choose one small change you can discuss or test. Knowing what is expected, having help at the right point or getting time without interruptions may make a bigger difference than changing your job title.",
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Think of a task you enjoyed and one you found frustrating. What was different about the way you were asked to do them?', { keepClose: [`A real task with ${c.work.setting}.`, "Something about a recent job that made it easier to do well."], watchFor: [`A routine that leaves no room for ${c.personal.need}.`, 'Judging the role by its title before seeing an ordinary working day.'] }, 'career', workExample(result, 'career')),
      chapter('two-work-layers', 'What the Daily Routine Needs', "Imagine accepting a job because the projects sound interesting, then finding that meetings leave little time to finish them.", [
        "Enjoying the subject is only part of enjoying the job. You may also need a particular pace, enough help or a chance to work through an idea without interruption.",
        `The main birth-month symbol is used here to explore tasks such as **${focus.tasks}**. See whether any of these tasks sound familiar. They are examples, not a list of jobs you are meant to do.`,
        c.month.stemSipsin === c.month.branchSipsin ? "Both parts of your birth month lead to the same idea in this reading. Even if the work sounds familiar, ask how much you would be doing and who would help when something went wrong." : `The lower symbol in your birth month adds another idea: **${c.inner.theme}**. That may fit work such as ${innerFocus.tasks}. Is there room for that in your current day?`,
        'For example, a role can offer interesting projects but little time to complete them. Another can offer clear duties but no chance to ask a useful question. Name the missing condition in ordinary terms.',
        `You could ask: **“${focus.interview}”** A story about a recent working day tells you more than being told that everything is flexible.`,
        "Your qualifications, interests and real opportunities matter alongside this reading. Use the reading to think of questions, then compare the answers with the actual job.",
      ], [pillarFact(result, 2), `Principal inner-stem relationship: ${c.month.branchSipsin}.`], 'Pick a job you know. Think about an ordinary day there, and write the question you would most want answered before joining.', { keepClose: [`Time in the routine for ${c.inner.contribution}.`, 'An example of how the team handles competing tasks.'], watchFor: ['A role that promises variety but leaves no time to finish anything.', 'Assuming a familiar kind of work will automatically come with a suitable routine.'] }, 'career'),
      chapter('proof-of-skill', 'Show What You Can Actually Do', "Imagine being asked what you are good at and finding it hard to answer, even though you solve useful problems every week.", [
        "Describing a finished piece of work can feel easier than trying to sound impressive. The example lets someone see your contribution without expecting you to prove everything about yourself.",
        `The birth-month comparison is used here to explore **${c.work.contribution}**. Think of a time you actually did that. What did you do, and what became easier because of it?`,
        `Here is something you could show: **${focus.proof}** Choose a piece of work you can finish and explain without having to make it sound bigger than it was.`,
        `The birth-day part of this reading suggests you may appreciate **${c.personal.need}**. Say what help or time you need before you start, rather than hoping it will become available later.`,
        "Keep a note of what you were asked to do, what you changed and how it turned out. If it did not work as expected, name what you learned and which part you would change. You do not have to make the example sound perfect. Explaining what went wrong and what you changed can show just as much.",
        "Ask someone who knows the task whether the result is useful. **Separate feedback about the work from a judgment of your worth.** Ask which part helped and which part was hard to use. That gives you something you can actually change.",
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Keep an example of something you did this week. Note what you were asked to do, how you handled it and what happened.', { keepClose: ['A small finished example and someone who can assess its usefulness.', `Working time that makes room for ${c.personal.need}.`], watchFor: ['Collecting certificates without a chance to use the skill.', 'Treating feedback on one draft as a verdict on your whole ability.'] }, 'personality'),
      chapter('feedback-and-boundaries', 'Feedback, Expectations and Limits', "Imagine receiving two urgent requests just before you finish work. Each person assumes their task will come first.", [
        "Wanting to be dependable can make it tempting to accept both. The missing piece may be a decision about priority, rather than more effort from you.",
        `This part compares your birth-year symbol with your birth-day symbol. It is read here as **${c.group.theme}**. You might recognise that in ${c.group.contribution}, especially when other people look to you to do it.`,
        c.year.stemSipsin === c.month.stemSipsin ? "The birth-year and birth-month comparisons lead to the same idea. You may recognise a job you end up doing in several places. Add those jobs together before agreeing to another one." : `Your birth month points instead to **${c.work.theme}**. What people come to you for may be different from what you most enjoy doing. Talk about that difference before taking on another task.`,
        future ? `The supplied birth hour adds **${future.theme}** to the reading. You can keep that idea in mind when thinking about work you would like to do more of.` : 'Your birth hour is unknown. This report leaves the hour-based perspective out instead of inventing a long-term career conclusion.',
        `Ask your manager or teammate: **“${focus.interview}”** Make sure you know which choices you can make, who can help and when you will talk about how it went.`,
        "If several people need something at the same time, ask which one comes first and which can wait. **Saying what can wait helps you finish what was already promised.** You can discuss the order of the work without making it an argument about who cares more.",
      ], [pillarFact(result, 3), pillarFact(result, 2), ...(result.input.unknownTime ? [] : [pillarFact(result, 0)])], 'Ask about a job that feels unclear: what comes first, what needs to be finished and who can help?', { keepClose: ['A manager who can name the priority and provide the authority to deliver it.', `An explicit conversation about the expectation of ${c.group.contribution}.`], watchFor: ['Several urgent requests with no decision about which one can wait.', 'Taking responsibility for a result while the needed decision remains with someone else.'] }, 'social'),
      chapter('money-commitments', 'Income, Pay and the Work Behind the Number', "Imagine being offered more pay, then discovering that the new role also includes late replies and another regular shift.", [
        "The extra money can still matter. But you may feel differently about the offer once you know what an ordinary week would look like.",
        money.steady && money.opportunity ? 'The checked symbols include both kinds of money-related relationship. This reading uses one to look at regular costs and the other to look at new offers. Neither tells you how much you will earn.' : money.opportunity ? 'A money-related symbol connected with new offers appears in the checked positions. Think about a job or side project you are considering. **What pay has actually been agreed, and what are you hoping it might become?**' : money.steady ? 'A money-related symbol connected with regular costs and promises appears in the checked positions. Look at a job you do each week. If the work has grown, it may be time to ask whether the pay and the agreement still fit.' : 'The money-related symbols looked for here do not appear in the checked positions. That does not tell us how well you can earn or manage money. Start with the hours you work, the pay you receive and the costs you already know.',
        `One thing you might recognise is **${life.moneyWatch}**. This is the interpretation selected from your birth month, not a prediction about your bank balance.`,
        `For example: **${life.moneyExample}** Think about a real offer or job you know. Does the same question come up there?`,
        `Before accepting more work, ask: **“${life.payQuestion}”** Write down the **agreed pay and expected hours**. Add extra duties, necessary costs and follow-up time. Mark any unanswered points.`,
        "Compare two real options. For each one, write down what you know, what you would have to do and what still needs an answer. Use the actual figures and appropriate advice for important financial decisions. The chart can suggest a question. The actual offer tells you what you would be signing up for.",
      ], [...money.facts, pillarFact(result, 2)], 'Compare one real offer or recurring role using five lines: confirmed pay, expected hours, extra duties, necessary costs and unanswered questions.', { keepClose: ['A clear description of the role and how added duties are discussed.', 'Confirmed pay and a record of the time the work actually needs.'], watchFor: [life.moneyWatch, 'Treating a money marker as proof of future earnings.'] }, 'money'),
      chapter('work-chapters', 'Your Longer Working Chapters', "Imagine feeling ready for a different kind of work, but not knowing whether to change jobs or first try a different task where you are.", [
        "A change can be appealing without needing an immediate resignation. Trying a different task can help you separate curiosity about something new from frustration with the current routine.",
        `These are the available current or upcoming ten-year chapters for **${referenceYear}**. The notes give each calculated starting date.`,
        ...(cycles.length ? cycles.map(cycle => {
          const start = cycle.startDate.getUTCFullYear()
          const theme = WORK_PROFILES[cycle.stemSipsin]
          const step = FOCUS_WORK[cycle.stemSipsin]
          return `For **${start}–${start + 9}**, the added theme is **${theme.theme}**. Try one skill test: **${step.proof}**`
        }) : ['No ten-year cycle is available for this reference year in the calculated range. The report does not invent a later cycle to fill the space.']),
        `Your birth-month reading still points to **${c.work.theme}**. You do not have to give up something that helps you work well just because a period brings up another idea.`,
        'Compare the completed task with the feedback. Keep the useful part, adjust what did not fit and choose one next step.',
      ], cycleFacts(result, referenceYear), 'Try the period’s idea on a task you can do without changing jobs. See whether it helps before making a bigger decision.', { keepClose: ['A reversible skill test that fits the job you actually have.', 'A record of what a period theme helped you notice.'], watchFor: ['Treating a cycle label as a deadline to resign or change careers.', 'Abandoning a useful working condition simply because a new theme appears.'] }, 'timeline'),
      chapter('career-plan', "What to Try Over the Next Month", "Imagine reaching Friday with plenty of tasks finished but nothing saved that shows what you learned.", [
        "That can make progress hard to see. A useful next month might leave you with one piece of work you can explain, rather than another list of things you should improve.",
        `Start with a task you already do. Your birth-day reading suggests **${c.personal.need}**, while the birth-month reading points to **${c.work.setting}**. Which of those is already there, and which would you need to ask for?`,
        `During the following week, try this: **${focus.proof}** Show it to someone who knows the job and ask which part was useful.`,
        "Then look at a job or promise that takes your time or money. What did you first agree to, and has anything been added since? Talk about that part before it becomes the new normal.",
        `Towards the end of the month, try the suggestion from your birth-day reading: **${c.personal.practice}** What happened? Was any part easier, harder or simply different from what you expected?`,
        "You can keep doing what helped, ask for a change or try a different task. You do not have to give the whole month a pass or fail. Use what actually happened to choose what comes next.",
      ], [pillarFact(result, 1), pillarFact(result, 2), ...money.facts], 'Put a time in the calendar for next month. Look back at the work, what people said about it and what you want to try next.', { keepClose: ['One review date and the work you can bring to it.', 'A choice to keep, adjust or stop one part of the experiment.'], watchFor: ['Starting a second career experiment before reviewing the first.', 'Calling a month a failure without checking which working condition changed.'] }, 'next-moves'),
    ], months: [], methodNotes: [...commonMethod(result, referenceYear), 'Working tasks, interview questions and portfolio experiments are original examples selected from the birth-month relationships and day-symbol themes. They are not a validated career aptitude test.', 'Money checks identify traditional visible or inner-stem markers without strength weights. They do not forecast income, investment results or business profitability.'],
  })
}

export function buildBusinessReading(result: SajuResult, referenceYear = new Date().getFullYear()) {
  validateYear(referenceYear, result)
  const c = chartContext(result)
  const decision = buildDecisionFocus('business', result)
  const focus = FOCUS_WORK[c.month.stemSipsin]
  const groupFocus = FOCUS_WORK[c.year.stemSipsin]
  const money = moneyMarkers(result)
  const cycles = selectedCycles(result, referenceYear)
  return finishReading({ focus: decision, kind: 'business', title: 'Business & Entrepreneurship', referenceYear,
    applications: buildReportApplications('business', result),
    extras: buildReportExtras('business', result),
    headline: decision.headline, subjects: [subject(result)],
    summary: [{ label: "How you approach starting something", text: c.personal.focus }, { label: 'An offer to test', text: focus.offer }, { label: "Where the work can become too much", text: focus.capacity }],
    chapters: [
      chapter('founder-style', 'How You Begin Something of Your Own', "Imagine having an idea you can explain for half an hour, then being asked what a customer would actually receive first.", [
        "The larger idea may be exciting while the first offer is still unclear. Making that offer smaller can feel uncomfortable, but it lets someone decide whether it solves a real problem.",
        `Your birth-day symbol is pictured as ${c.personal.image}. This reading uses that image to explore **${c.personal.focus}**. See whether you recognise that in the way you begin an idea or change it after talking to someone.`,
        `The birth-month comparison adds **${c.work.theme}**. In a business, that could mean trying ${focus.offer}. It is a way to begin exploring an offer, not a rule about which industry you belong in.`,
        `Things may feel easier when you have **${c.personal.need}**. Think about how the business would make room for that on an ordinary day, not only when you have plenty of time.`,
        `You may recognise **${focus.capacity}**. Imagine an actual customer waiting for the work: which part would be difficult to keep doing for the same price or in the same time?`,
        'Write down one problem, one person who has it and one result you could provide. **Keep the first promise smaller than the whole vision.** A clear test can change the plan without requiring you to abandon the aim.',
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Describe one offer in a sentence: who it helps, what result it provides and what the first delivery includes.', { keepClose: ['One named customer problem and a first promise you can explain.', `A way of organising the trial that allows ${c.personal.need}.`], watchFor: ['Describing the whole future business before defining one delivery.', 'Choosing a business identity before asking whether the proposed result is useful.'] }, 'personality', workExample(result, 'business')),
      chapter('offer-test', 'Find Out Whether the Offer Is Useful', "Imagine showing someone your idea. They say it looks great, but cannot tell you when they would use it.", [
        "Encouragement can feel like proof that the offer is wanted. A more useful conversation may begin with how they deal with the problem now, before you explain another feature.",
        `The birth-month comparison is used here to explore ${focus.offer}. You could try it this way: **${focus.experiment}**`,
        c.month.stemSipsin === c.month.branchSipsin ? "Both parts of the month lead to the same idea. Let someone try the main part of the offer before deciding it needs more features." : `The inner month adds **${c.inner.theme}**. Ask whether the offer needs room for that contribution too. You may only need to change one part of the service, rather than add another product.`,
        `Ask a willing tester: **“${focus.customer}”** Let them describe their current problem before explaining every part of your solution.`,
        'For example, a service can look attractive but require more effort from the customer than they want to give. Ask what they would need to do and which part would stop them using it.',
        "Keep the customer’s own words, especially questions that come up more than once. Change the part people struggle to understand, then let someone try it again. Their response tells you something the chart cannot: whether they actually want to use it.",
      ], [pillarFact(result, 2)], 'Talk to a few willing testers about one problem. Write down the words they use and one change you will test next.', { keepClose: ['A willing tester who can describe the problem in their own words.', 'One observation about using the actual result.'], watchFor: ['Taking polite interest as evidence that someone will use the offer.', 'Explaining more features when the central promise is still unclear.'] }, 'career'),
      chapter('team-decisions', 'Roles, Collaboration and Decisions', "Imagine a customer waiting for a reply while you and a collaborator each assume the other has answered.", [
        "Both people may care about the customer. What is missing is a shared understanding of who handles the reply, not necessarily more enthusiasm or a better partnership.",
        `The idea taken from your birth year is **${c.group.theme}**. It can suggest a contribution through ${c.group.contribution}. Compare that role with what a partner or teammate actually wants to do.`,
        `The work idea selected from your birth month is **${c.work.theme}**. The birth-year reading also brings up ${groupFocus.tasks}. Decide who is doing each part and which choices you need to make together.`,
        "Someone can do a job differently from you without being the wrong person to work with. Talk about the actual task, what each person can do and who will decide if you disagree.",
        'For a small launch, separate delivery, customer messages, records and changes to the offer. **Write down the handover.** Do not let every unfinished task silently fall to the person who notices it first.',
        "This is a one-person report. It does not calculate a co-founder match or decide how ownership should be divided. Look at what each person is doing and get the advice you need before agreeing to ownership or other important terms.",
      ], [pillarFact(result, 3), pillarFact(result, 2)], 'Choose four recurring tasks. Assign an owner, a backup and one condition that requires a shared decision.', { keepClose: ['A named owner and backup for each recurring delivery task.', 'A written rule for changes that need a shared decision.'], watchFor: ['Two people waiting for the other to answer a customer.', 'Assigning permanent business roles from one person’s birth-chart theme.'] }, 'social'),
      chapter('delivery-capacity', "What One Order Really Takes", "Imagine finishing a paid order, then spending the evening on messages and changes that were never part of the price.", [
        "You may want the customer to feel well looked after. But extra care can quietly turn a worthwhile order into work you cannot keep repeating at that price.",
        `The checked money symbols are used here to explore **${money.theme}**. See whether that helps you understand an actual order. It does not tell you what the business will earn.`,
        `The business part of this reading asks you to notice **${focus.capacity}**. Does that happen through extra changes, repeat requests or things the customer did not originally ask you to include?`,
        "Write down everything one order involves, including getting ready, replying to messages and making changes afterwards. Put the costs you know beside the ones you are still estimating.",
        'For example, a short customer task may also need setup and several replies. **Include that work in the capacity plan.** A full calendar can still contain promises that have not been completed.',
        'Choose a delivery limit you can test with actual work. Record what takes longer than expected and review the offer before increasing the number of customers. The chart does not calculate a sustainable price or a profit margin.',
      ], money.facts, 'Complete one small delivery or realistic trial. Record the time, costs and work that was left outside the original brief.', { keepClose: ['An explicit list of what the offer includes.', 'Actual delivery records and room to review an estimate.'], watchFor: [focus.capacity, 'Calling expected revenue a confirmed result.'] }, 'money'),
      chapter('customer-communication', 'Customer Conversations and Clear Boundaries', "Imagine a customer saying, “I thought that was included,” after you have already finished what you agreed to make.", [
        "They may be disappointed while you feel your work has been overlooked. Before agreeing to another version, it helps to find the point where your two expectations became different.",
        `The birth-day part of this reading suggests **${c.personal.need}**. The birth-month comparison adds **${c.work.theme}**. Think about how you could make room for both while explaining the service to a customer.`,
        `One useful customer question is: **“${focus.customer}”** Ask it before filling a gap with your own assumption.`,
        "Agree a deadline, then send a short message saying what the customer will receive and what you need from them. If they ask for something extra, explain what that changes. **Knowing what is included helps the customer choose**, rather than leaving them to guess.",
        "If the customer is unhappy, ask what they expected to be different. Fixing something that was promised and adding something new are different conversations.",
        "For example, a customer may ask for another version after the work is complete. Review what was included and explain the available next step. Explain what you can do and what it would involve. That is more helpful than agreeing reluctantly or refusing without a reason.",
      ], [pillarFact(result, 1), pillarFact(result, 2)], 'Draft a five-line customer confirmation: result, deadline, needed input, included changes and the next contact point.', { keepClose: ['A customer who can explain the result they need.', 'A written brief, a reply window and a clear way to discuss changes.'], watchFor: ['Treating a new request as an included revision without discussing it.', 'Promising an immediate reply when the delivery already needs your attention.'] }, 'social'),
      chapter('business-chapters', "Trying Something New at the Right Size", "Imagine a new offer getting attention just as your existing customers need more follow-up than you expected.", [
        "Growing can feel urgent when interest appears. Keeping a delivery reliable and trying a new idea are different jobs; you do not have to expand both at once.",
        `The available cycles are selected using **${referenceYear}**. Their exact calculated starts are in the notes. Compare a theme with the stage of your actual work.`,
        ...(cycles.length ? cycles.map(cycle => {
          const start = cycle.startDate.getUTCFullYear()
          const theme = WORK_PROFILES[cycle.stemSipsin]
          const step = FOCUS_WORK[cycle.stemSipsin]
          return `For **${start}–${start + 9}**, the added theme is **${theme.theme}**. A business experiment to consider is: **${step.experiment}** Review what the test teaches before expanding the offer.`
        }) : ['The calculated range has no ten-year cycle for this reference year. No business timing has been invented to replace it.']),
        `Your birth-month approach remains connected with **${c.work.theme}**. A later theme can add a question without requiring you to discard a delivery method that already works.`,
        'Actual demand, costs, capacity and obligations matter more than a symbolic timing label. **Choose a test you can explain and review.** Keep later plans open to information you do not yet have.',
      ], cycleFacts(result, referenceYear), 'Choose one period theme. Write a small customer or delivery experiment and a date to review the result.', { keepClose: ['A small experiment suited to the actual stage of the offer.', 'Current demand and delivery records alongside the symbolic timing label.'], watchFor: ['Treating a cycle as evidence that an untested offer will sell.', 'Increasing a commitment before reviewing the trial delivery.'] }, 'timeline'),
      chapter('business-plan', "Try the Offer Before Making It Bigger", "Imagine spending a month improving a product page without anyone having tried the actual product.", [
        "The page may look better while the most important question stays unanswered: can someone use the result, and can you deliver it again? A trial order gives you a different kind of information.",
        `In the first week, define the offer around **${focus.offer}**. Talk to willing testers and listen for the problem they want solved.`,
        `In the second week, try the delivery: **${focus.experiment}** Keep a record of the steps, the time and the questions that appear.`,
        `In the third week, review the pressure point of **${focus.capacity}**. Clarify one limit or simplify one recurring task before expanding the promise.`,
        `Towards the end of the month, try this suggestion from your birth-day reading: **${c.personal.practice}** Did it help you finish the work or see what needed to change?`,
        "Choose a next step from the evidence: repeat the small offer, adjust it or stop this version. **Finding out that this version does not work is useful too.** No part of the chart guarantees that an idea will become a profitable business.",
      ], [pillarFact(result, 1), pillarFact(result, 2), ...money.facts], 'Book a thirty-day review. Bring the customer questions, the delivery record and one decision about the next version.', { keepClose: ['A review that includes what customers asked and what delivery actually required.', 'Permission to simplify or stop a version that did not answer the problem.'], watchFor: ['Expanding the offer to avoid deciding whether the first version was useful.', 'Counting activity while leaving the customer question unanswered.'] }, 'next-moves'),
    ], months: [], methodNotes: [...commonMethod(result, referenceYear), 'The report uses one birth chart. It is not a comparison of business partners, a company chart or a market-demand model.', 'Offer examples and launch experiments are editorial prompts. Profit, prices, legal duties, tax, ownership and borrowing decisions must be assessed from the actual business situation.'],
  })
}
