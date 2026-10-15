/** Original decision exercises. A selected situation is never inferred from a birth chart. */
export type ApplicationKind = 'complete' | 'career' | 'business' | 'compatibility' | 'year' | 'wellbeing'
export type ApplicationLens = 'self' | 'work' | 'closeness' | 'shared-work' | 'annual'
export interface SituationCase {
  id: string
  title: string
  lens: ApplicationLens
  scene: string
  question: string
  choices: [
    { title: string; when: string; tradeoff: string },
    { title: string; when: string; tradeoff: string },
  ]
  say: string
  steps: [string, string, string]
  record: [string, string, string]
  keep: string
  adjust: string
  doesNotFit: string
}

export const SITUATION_CASES: Record<ApplicationKind, SituationCase[]> = {
  complete: [
    {
      id: 'two-good-options', title: 'Two good options, and no clear choice', lens: 'self',
      scene: 'If two plans both sound worthwhile, you may keep comparing without learning what either would be like in practice.',
      question: 'Which choice deserves a small test before I promise more time?',
      choices: [
        { title: 'Test the easier option first', when: 'You can try it with time and resources you already have.', tradeoff: 'An easy start can hide a poor fit. Check whether it answers the question you actually care about.' },
        { title: 'Check the harder option’s main uncertainty', when: 'One missing answer could change the whole choice.', tradeoff: 'Research can grow without an ending. Decide which answer is enough before you begin.' },
      ],
      say: 'Before I commit, I want to check one part in a smaller way. What would that involve?',
      steps: ['Name the one thing you want either option to improve.', 'Choose a test that answers the biggest unknown without taking on the whole plan.', 'After the test, compare the result with your original reason for considering it.'],
      record: ['What matters most to me?', 'What did the test actually show?', 'Which important question is still unanswered?'],
      keep: 'The test answers a real question and the next step fits time you can actually give.',
      adjust: 'You keep collecting options, but none of the new information changes the choice.',
      doesNotFit: 'If the decision has a firm deadline or cannot be tried safely in a small way, gather the essential facts first. A symbolic theme cannot choose for you.',
    },
    {
      id: 'competing-needs', title: 'My own plans keep coming last', lens: 'closeness',
      scene: 'If helping someone keeps displacing your own plans, the useful question is what you can share without quietly giving up something important.',
      question: 'How can I offer care and still keep a clear part of my own day?',
      choices: [
        { title: 'Offer one clearly limited part', when: 'You want to help and can name exactly what you have room to do.', tradeoff: 'The other person may still need more help. A smaller promise needs a clear handover.' },
        { title: 'Agree a different time or another helper', when: 'The request matters, but doing it now would displace an existing promise.', tradeoff: 'A later plan is useful only if both people understand who will do what in the meantime.' },
      ],
      say: 'I can help with this part. I also need to keep time for my own plan. What can we share or move?',
      steps: ['Name the plan that keeps being moved, including why it matters to you.', 'Make one specific offer rather than an open-ended promise to help.', 'Check afterwards whether the agreement left time for both people’s needs.'],
      record: ['What did I offer?', 'What did I keep for myself?', 'Did the other person understand the same limit?'],
      keep: 'Your offer is understood and the time you kept is still available afterwards.',
      adjust: 'The same request keeps growing after you thought the limit was agreed.',
      doesNotFit: 'If this is a one-off urgent need, a normal weekly arrangement may not fit. Discuss the immediate need and review the longer pattern later.',
    },
    {
      id: 'promise-growing', title: 'A small promise has become a large one', lens: 'work',
      scene: 'If a favour, group plan or regular task keeps expanding, doing it faster may leave the original agreement just as unclear.',
      question: 'Which part did I agree to, and which part needs a new conversation?',
      choices: [
        { title: 'Finish the original promise', when: 'The agreed result is still clear and the added request can wait.', tradeoff: 'Someone must decide what happens to the extra work. Leaving it unnamed can restart the same problem.' },
        { title: 'Agree a smaller revised promise', when: 'The new request changes the time, resources or purpose of the task.', tradeoff: 'Reopening the agreement takes a conversation, but prevents each person from assuming a different finish.' },
      ],
      say: 'This adds another part to the original plan. Which part should change so the promise remains realistic?',
      steps: ['Put the original result and the added request on separate lines.', 'Name what the extra part would need: time, help or a changed deadline.', 'Confirm the revised agreement in words that everyone involved understands.'],
      record: ['The original promise was…', 'The added part needs…', 'The new agreement is…'],
      keep: 'The next request is discussed before it becomes another silent duty.',
      adjust: 'You keep doing extra work while the other person still thinks the original promise covers it.',
      doesNotFit: 'If the original promise was never clear, begin by agreeing the result. Do not treat your own first assumption as something everyone accepted.',
    },
  ],
  career: [
    {
      id: 'job-offer', title: 'An appealing job offer with unanswered questions', lens: 'work',
      scene: 'If the pay or title looks attractive but the daily work is unclear, the missing details may matter more than another general comparison of careers.',
      question: 'What would I actually be agreeing to each week?',
      choices: [
        { title: 'Clarify the offer in writing', when: 'Hours, duties, support or the way extra work is handled are still unclear.', tradeoff: 'Written answers describe the promise. They do not show how the team behaves on a busy day.' },
        { title: 'Ask for an example of the real routine', when: 'The written role is clear but you cannot picture the working day.', tradeoff: 'One example may show an unusually good day. Ask what changes when work is busy or someone is absent.' },
      ],
      say: 'Could you walk me through a normal week, and explain what changes when extra duties are added?',
      steps: ['Choose three working conditions that matter most to you.', 'Ask for the written terms and a real example of how those conditions work.', 'Compare the answers with your current option, including travel, preparation and follow-up time.'],
      record: ['Which pay, hours and duties are confirmed?', 'What support is actually available?', 'Which unanswered point could change my choice?'],
      keep: 'The important answers agree with one another and you can explain the full commitment in plain words.',
      adjust: 'An appealing headline keeps distracting you from a duty or expectation that remains unclear.',
      doesNotFit: 'If the terms and routine are already clear, more questions may add little. Compare the conditions that matter to you using the facts you have.',
    },
    {
      id: 'growing-workload', title: 'More duties, but the same time and pay', lens: 'work',
      scene: 'If new duties keep arriving, the problem may be the total workload or unclear priorities, rather than a lack of effort.',
      question: 'What must change when another duty becomes part of the role?',
      choices: [
        { title: 'Clarify today’s priority', when: 'Two requests compete now and the person assigning them can choose what comes first.', tradeoff: 'This can solve today’s clash while leaving the recurring workload unchanged.' },
        { title: 'Review the recurring role', when: 'The same extra duties appear repeatedly and the original role no longer describes the work.', tradeoff: 'A useful review needs examples of the work and time involved, rather than only a broad feeling of being busy.' },
      ],
      say: 'I can complete this extra duty if we move or share another task. Which priority should change?',
      steps: ['Record one ordinary week of agreed work, extra duties and actual time.', 'Separate a one-off urgent task from work that is now recurring.', 'Ask for a clear priority or role review, then confirm what changes and when it will be checked.'],
      record: ['What was added?', 'What was removed, shared or moved?', 'What is the agreed date to review the workload?'],
      keep: 'The agreed change appears in the next working week, rather than only in the conversation.',
      adjust: 'You are asked to finish every task but no one will decide what can move or be shared.',
      doesNotFit: 'If the workload is already manageable, focus on the task or skill that needs help. More boundaries will not answer every working problem.',
    },
    {
      id: 'career-change', title: 'A different career, or a different working setting?', lens: 'work',
      scene: 'If you want a change, first separate the work itself from its workload, support and setting. A disliked setting can hide a task you still enjoy.',
      question: 'What small experience would help me tell the difference?',
      choices: [
        { title: 'Test a change within the current work', when: 'You still enjoy the main task but need clearer duties, feedback or support.', tradeoff: 'A small change may not fix a setting where the required support is unavailable.' },
        { title: 'Try a small task from another role', when: 'The task itself no longer fits your interests and you want evidence about another direction.', tradeoff: 'An interesting sample does not show every duty of a new role. Check its real requirements and routine too.' },
      ],
      say: 'Could I try one small task and hear how someone experienced in the role would judge the result?',
      steps: ['Name one task you want less of and one you would like more of.', 'Try a relevant task without treating the trial as a commitment to leave your current work.', 'Compare interest, skill requirements, available support and the actual time involved.'],
      record: ['Did I enjoy the task or only the idea of a fresh start?', 'What skill or support was missing?', 'What would I need to learn before comparing real roles?'],
      keep: 'You can name a useful task, explain what you learned and identify the next fact to check.',
      adjust: 'You collect career labels or courses without trying the work they are meant to prepare you for.',
      doesNotFit: 'If an urgent decision is required, the available time may not allow a trial. Use the essential facts and suitable real-world advice for the actual choice.',
    },
  ],
  business: [
    {
      id: 'first-offer', title: 'Testing an offer before building too much', lens: 'work',
      scene: 'If you have an idea but little evidence that someone needs it, a smaller delivery can answer more than another list of planned features.',
      question: 'What would a customer need to understand or use before this offer makes sense?',
      choices: [
        { title: 'Show a simple working example', when: 'The main uncertainty is whether people understand what the offer does.', tradeoff: 'Understanding or praising an example does not prove that someone will use it or pay for it.' },
        { title: 'Try one limited delivery', when: 'The customer’s problem is clear and you need to learn what delivering the result actually involves.', tradeoff: 'One delivery gives useful detail but does not prove repeat demand or a profitable price.' },
      ],
      say: 'What are you doing about this problem now, and which part of this example would actually help?',
      steps: ['Describe one customer, one problem and one result.', 'Choose the smallest example or delivery that answers the main uncertainty.', 'Record what the person used, what confused them and what the work needed from you.'],
      record: ['What did the customer do, rather than only say?', 'What time, materials and follow-up were needed?', 'Which part would I repeat or change?'],
      keep: 'People can explain the result in their own words and the delivery record shows what it takes to provide it.',
      adjust: 'You add features after compliments, while the original problem and actual use remain unclear.',
      doesNotFit: 'If customers already use the offer repeatedly, test the weakest delivery step or unanswered need rather than restarting the whole idea.',
    },
    {
      id: 'delivery-growing', title: 'Revisions and follow-up keep expanding', lens: 'work',
      scene: 'If an apparently small order needs repeated messages or extra versions, the missing detail may be where the delivery ends.',
      question: 'What belongs in the current promise, and what needs a separate agreement?',
      choices: [
        { title: 'Define the finish of this delivery', when: 'Both sides need a clearer result, revision limit or handover.', tradeoff: 'A clearer finish may require explaining why a new request changes the original work.' },
        { title: 'Separate ongoing support', when: 'The delivery is complete but the customer has a continuing need for help.', tradeoff: 'A separate service needs its own scope and capacity check. It is not automatically worth adding.' },
      ],
      say: 'This part is included in the current delivery. The new request needs a separate scope and timing discussion.',
      steps: ['List the original result, included changes and expected handover.', 'Record the actual replies, revisions and follow-up needed for one delivery.', 'Clarify one boundary before accepting the next request or order.'],
      record: ['What did the original brief include?', 'Which repeated task was missing from the estimate?', 'What will the next written confirmation explain?'],
      keep: 'The next customer can explain what is included and you can finish the agreed work within the time set aside.',
      adjust: 'The same hidden task appears in every delivery, even after you have explained the boundary.',
      doesNotFit: 'If an agreed result was not delivered properly, a needed correction is different from an extra request. Check the original promise before drawing the boundary.',
    },
    {
      id: 'shared-decisions', title: 'Working with someone without unclear ownership', lens: 'shared-work',
      scene: 'If two people both oversee everything, decisions may repeat while less visible work goes unclaimed.',
      question: 'Which decisions need one owner, and which genuinely need a shared answer?',
      choices: [
        { title: 'Assign an owner to each recurring task', when: 'The work is understood but responsibility and handovers are unclear.', tradeoff: 'An owner still needs authority, information and a backup. A name beside a task is not enough.' },
        { title: 'Run a small joint project first', when: 'You have not yet seen how the working arrangement handles real decisions or delays.', tradeoff: 'A useful trial can expose differences. It does not settle ownership, legal terms or the whole future relationship.' },
      ],
      say: 'Who can decide this part, what needs a shared answer, and when should we ask for help?',
      steps: ['Separate delivery, customer messages, records and changes to the offer.', 'Agree an owner, a backup and a clear point for asking the other person.', 'Review one actual handover or delay before expanding the arrangement.'],
      record: ['Which decision was made twice or not made at all?', 'Who had the information and authority needed?', 'What handover should change next time?'],
      keep: 'Each person can explain their own task and the point at which a shared decision is needed.',
      adjust: 'Responsibility is assigned without the authority or information to carry it out.',
      doesNotFit: 'This report uses one person’s chart. It cannot assess an unseen partner or decide ownership shares. Use the actual working trial and appropriate advice for those choices.',
    },
  ],
  compatibility: [
    {
      id: 'repeated-argument', title: 'The same small argument keeps returning', lens: 'closeness',
      scene: 'If a changed plan keeps becoming the same argument, compare what each person meant and heard before deciding who should change.',
      question: 'Are we answering the same question, or asking for different kinds of care?',
      choices: [
        { title: 'Talk through one recent moment', when: 'Both people can listen and name a specific example.', tradeoff: 'A useful conversation stays with that moment. A list of every past problem can hide the request that matters now.' },
        { title: 'Pause and agree when to return', when: 'Either person needs time before they can listen or answer clearly.', tradeoff: 'A pause needs a return time that both people accept. Otherwise one person may hear it as the conversation ending.' },
      ],
      say: 'When the plan changed, I hoped for one kind of response. What were you hoping I would understand?',
      steps: ['Each person describes the same moment without guessing the other person’s motive.', 'Take turns saying whether you wanted listening, an idea, reassurance or practical help.', 'Agree one small response to try the next time a similar plan changes.'],
      record: ['What did Person A mean, and what did Person B hear?', 'What did Person B mean, and what did Person A hear?', 'What response did both people agree to try?'],
      keep: 'Both people can describe the other person’s request and the next conversation becomes more specific.',
      adjust: 'The proposed change depends on one person doing all the listening or giving up every request.',
      doesNotFit: 'This exercise needs willing participation from both people. A chart comparison cannot establish the other person’s motives or make an unwilling conversation mutual.',
    },
    {
      id: 'time-together', title: 'Different needs for time together and personal space', lens: 'closeness',
      scene: 'If one person wants more contact while the other wants uninterrupted time, the useful detail is what each kind of time would actually look like.',
      question: 'What small arrangement could make room for both requests?',
      choices: [
        { title: 'Agree one short shared routine', when: 'Both want contact, but an unclear or busy schedule keeps displacing it.', tradeoff: 'A booked moment needs attention from both people. Being in the same place is not always the kind of contact requested.' },
        { title: 'Protect separate time, then reconnect', when: 'One or both need space to complete a task or settle their thoughts.', tradeoff: 'Space is easier to understand when the next contact is clear. Avoid asking the other person to guess when to return.' },
      ],
      say: 'What would make this time feel like proper time together, and what time do you want to keep for yourself?',
      steps: ['Each person names one detail that makes contact feel welcome.', 'Agree a small shared moment and any separate time needed around it.', 'After trying it, ask whether the arrangement felt wanted and workable to both people.'],
      record: ['What did Person A ask for?', 'What did Person B ask for?', 'What worked for both, and what felt like an obligation?'],
      keep: 'Both people can ask for contact or space without treating the request as a score of how much they care.',
      adjust: 'The arrangement looks equal on paper but repeatedly leaves one person’s actual request unanswered.',
      doesNotFit: 'If work, distance or care duties rule out the proposed timing, change the arrangement to fit those facts. A shared routine does not have to happen every day.',
    },
    {
      id: 'shared-load', title: 'Sharing the planning as well as the task', lens: 'shared-work',
      scene: 'If one person must notice, plan and remind before the other helps, the task may look shared while the responsibility is still uneven.',
      question: 'Who owns the whole task, including remembering and following up?',
      choices: [
        { title: 'Give one person ownership of a whole task', when: 'The task can be completed independently with a clear result and enough information.', tradeoff: 'Ownership needs room for a different method. Rechecking every detail can return the planning to the other person.' },
        { title: 'Plan together, then divide the parts', when: 'The task involves shared choices or information both people need to provide.', tradeoff: 'Shared planning still needs named next steps. Otherwise both may wait for the other person to begin.' },
      ],
      say: 'Can we include noticing, planning and follow-up when we decide who will own this task?',
      steps: ['Choose one recurring task and list its less visible preparation and follow-up.', 'Agree an owner or clearly divided parts, using actual time and ability.', 'Review whether reminders or repeat work were needed, then adjust the handover.'],
      record: ['Who noticed and planned the task?', 'Who completed it and followed up?', 'What information or authority was missing?'],
      keep: 'The agreement reduces reminders and both people understand when the task is finished.',
      adjust: 'One person remains responsible for noticing every unfinished part, even after ownership was supposedly shared.',
      doesNotFit: 'A task need not be divided equally to be fair. Changing work, care duties or available time can justify a different arrangement that both people understand.',
    },
  ],
  year: [
    {
      id: 'annual-priority', title: 'Several goals are competing for the year', lens: 'annual',
      scene: 'If your list for the year keeps growing, a useful plan shows what you will begin first and what you will deliberately leave for later.',
      question: 'Which first result would make the year easier to direct?',
      choices: [
        { title: 'Choose one first priority', when: 'Several goals compete for the same time, money or attention.', tradeoff: 'You need somewhere to keep the other ideas so choosing one does not turn into repeatedly reopening the decision.' },
        { title: 'Put related goals in sequence', when: 'One goal supplies the skill, time or information needed for another.', tradeoff: 'A sequence needs a visible finish for the first stage. Otherwise the later goal may wait indefinitely.' },
      ],
      say: 'This is the first result I am working towards. I will review the other plans after I have learned this part.',
      steps: ['Name one result you could recognise without a broad success label.', 'Choose a first task and a review date based on your actual calendar.', 'At the review, use what happened to keep, reduce or reorder the remaining plans.'],
      record: ['What is the first result?', 'What will wait while I test it?', 'What information would make me change the order?'],
      keep: 'You can point to a completed step and explain why the next task belongs before the others.',
      adjust: 'The calendar is full of new starts but no review changes what you do next.',
      doesNotFit: 'If the goals have separate time and resources, one need not displace the other. Use the real conflict, rather than forcing every plan into one priority.',
    },
    {
      id: 'new-responsibility', title: 'A new responsibility is joining an already full year', lens: 'annual',
      scene: 'If a new commitment arrives, look at the work it creates after the first week, alongside promises already in the calendar.',
      question: 'What needs to move or be shared before I add this?',
      choices: [
        { title: 'Start with a smaller agreed commitment', when: 'The new responsibility can begin in a limited, reviewable way.', tradeoff: 'The smaller version must still meet the real need. An unclear trial can quietly become the full promise.' },
        { title: 'Change an existing commitment first', when: 'The new work is clear but you cannot give it enough time alongside current duties.', tradeoff: 'Moving an old promise affects other people. Confirm the handover instead of assuming the time is now free.' },
      ],
      say: 'Before I add this, I need to agree what will move, what help is available and when we will review it.',
      steps: ['List the recurring work that follows the first commitment.', 'Name one existing duty to reduce, move or share.', 'Check the arrangement after it has met an ordinary busy week, not only the easiest first day.'],
      record: ['What repeats after the first week?', 'What support or handover is confirmed?', 'Which part needs a different arrangement?'],
      keep: 'The new duty and the older promises both have enough time and a clear owner.',
      adjust: 'You meet the new commitment only by repeatedly abandoning an older one without agreement.',
      doesNotFit: 'An immediate obligation may leave little choice about whether to begin. Focus then on the smallest practical support or handover you can arrange.',
    },
    {
      id: 'annual-connections', title: 'Keeping close relationships in a busy year', lens: 'annual',
      scene: 'If important contact keeps waiting for a quiet period that never arrives, try an arrangement that fits the year you actually have.',
      question: 'What repeatable form of contact would feel welcome to both people?',
      choices: [
        { title: 'Keep a small regular shared moment', when: 'Both want contact and have a predictable opening in their schedules.', tradeoff: 'A fixed routine can become another duty if the form of contact is not what either person enjoys.' },
        { title: 'Agree the next contact as you go', when: 'Distance, shifts or care duties make a fixed routine hard to keep.', tradeoff: 'Flexibility needs an explicit next step. Leaving it entirely open can return the planning to one person.' },
      ],
      say: 'What kind of contact would feel good this month, and what timing is actually realistic for you?',
      steps: ['Ask one person what kind of contact they would welcome.', 'Share your own need and choose one arrangement both can try.', 'Review the contact itself and the work of arranging it. Change the plan if either part feels one-sided.'],
      record: ['What contact did each person want?', 'Who arranged it and followed up?', 'What would make the next time easier?'],
      keep: 'The arrangement makes room for both answers and can survive an ordinary change of plans.',
      adjust: 'One person handles every invitation or the routine continues without either enjoying it.',
      doesNotFit: 'This is a one-person annual reading. It does not reveal what someone else wants or predict whether they will respond. Ask for their actual answer.',
    },
  ],
  wellbeing: [
    {
      id: 'unfinished-day', title: 'The day ends with too many unfinished tasks', lens: 'self',
      scene: 'If every interruption opens another task, a longer list may make it harder to see what can actually be finished today.',
      question: 'What would give one ordinary task a clearer ending?',
      choices: [
        { title: 'Finish one small task before switching', when: 'The interruptions can wait and one useful result is within reach.', tradeoff: 'A firm focus block needs room for genuinely urgent duties. It should not hide something that cannot wait.' },
        { title: 'Set a stopping point and a return note', when: 'An interruption matters and you need to leave the current task.', tradeoff: 'A return note helps only if you use it. Keep it short enough to show the next action immediately.' },
      ],
      say: 'I will finish this part first, or leave a clear next step before I switch. Which request truly needs attention now?',
      steps: ['Choose one ordinary task and name what finished means for today.', 'At an interruption, decide whether to finish that part or leave a short return note.', 'At the end of the day, review what actually interrupted the task and which part could change.'],
      record: ['What result was small enough to finish?', 'What interrupted it?', 'What made returning easier or harder?'],
      keep: 'You spend less time restarting the task and can recognise when the agreed part is done.',
      adjust: 'The plan needs a quiet block your real day cannot provide, or adds more record keeping than it saves.',
      doesNotFit: 'Some roles require frequent responses. In that setting, shorter stopping points may fit better than a long uninterrupted block.',
    },
    {
      id: 'automatic-yes', title: 'Saying yes before checking your own day', lens: 'closeness',
      scene: 'If you agree quickly and only later notice the cost, try making the size of the request clear before answering.',
      question: 'What can I realistically offer without hiding another need?',
      choices: [
        { title: 'Offer a clearly limited part', when: 'You want to help and know which part you have room to do.', tradeoff: 'The rest of the task still needs an owner. Name the handover rather than hoping the limit is understood.' },
        { title: 'Check the priority before answering', when: 'You do not yet know the time, deadline or effect on existing duties.', tradeoff: 'A pause needs an answer point. Leaving someone waiting without one can create a different unclear promise.' },
      ],
      say: 'Let me check what I have already promised. I can tell you which part I can take on after that.',
      steps: ['Ask what the request involves and when the result is needed.', 'Compare it with a promise already in your day, including your own task.', 'Give a clear answer about the part, timing or help you can actually offer.'],
      record: ['What did the request really need?', 'What did I already promise?', 'Was my final answer understood?'],
      keep: 'You can explain what you agreed to and still have room for the earlier promise.',
      adjust: 'A clear answer is followed by extra duties that nobody has discussed with you.',
      doesNotFit: 'Some duties are already part of an agreed role. In that case, ask about priority and support rather than treating every request as an optional favour.',
    },
    {
      id: 'routine-fit', title: 'A routine that fits a changing day', lens: 'self',
      scene: 'If an ideal routine keeps breaking, examine which part of the day is predictable and which part regularly changes.',
      question: 'Which small part can stay steady without requiring the whole day to be identical?',
      choices: [
        { title: 'Use one reliable daily anchor', when: 'A familiar event or time already happens on most ordinary days.', tradeoff: 'The anchor must remain small. Attaching a long list to it can make it another routine you cannot keep.' },
        { title: 'Use a flexible window', when: 'Shifts, travel or care duties change when a task can happen.', tradeoff: 'A flexible window needs a small first action. Otherwise it can become a vague promise to begin later.' },
      ],
      say: 'I want to keep this one small part steady. The time around it can change when the day needs it.',
      steps: ['Choose one practical habit you already find useful.', 'Attach a small version to a reliable event or a realistic window.', 'After several ordinary days, keep the part you used and reduce anything that became another burden.'],
      record: ['Which part of the day was actually predictable?', 'What was the smallest useful version?', 'What kept making the plan harder than it needed to be?'],
      keep: 'You use the routine on ordinary changing days without needing to rebuild the entire plan.',
      adjust: 'The routine works only on unusually quiet days or requires more preparation than the task itself.',
      doesNotFit: 'If the habit does not help with a real need, repeating it is not a goal in itself. This is an everyday planning exercise, not a health assessment.',
    },
  ],
}
