import type { SajuResult } from '@orrery/core/types'
import { getFourPillars, getRelation } from '@orrery/core/pillars'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES, WORK_PROFILES } from './reading-profiles.ts'
import { THEME_FAMILY } from './theme-family.ts'

/** Editorial decision prompts selected by two calculated themes. These do not
 * rank chart strength, infer a life event or identify the reader's real problem. */
export interface DecisionFocus {
  headline: string
  synthesis: string
  firstStep: string
  pauseIf: string
  review: string
  evidence: string[]
}
type SoloKind = 'complete' | 'career' | 'business' | 'wellbeing' | 'year'
type Family = 'ownership' | 'making' | 'resources' | 'responsibility' | 'learning'
const ORDER: Family[] = ['ownership', 'making', 'resources', 'responsibility', 'learning']
const pairKey = (a: string, b: string, order: readonly string[]) => [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join('/')

const BRIDGES: Record<string, { title: string; tension: string }> = {
  'ownership/ownership': { title: 'Own a clear part, and leave room for other methods', tension: 'A shared wish for independence still needs an agreement about where each person can decide.' },
  'ownership/making': { title: 'Keep your direction and show an early version', tension: 'Control of the method can protect an idea, but feedback needs something another person can actually see.' },
  'ownership/resources': { title: 'Choose the commitment that leaves room for your own goal', tension: 'An attractive offer can use the time you wanted for an independent priority. Check what would have to move.' },
  'ownership/responsibility': { title: 'Agree the result, then clarify your freedom to act', tension: 'Independence and accountability can work together when the result is fixed and the method is open to discussion.' },
  'ownership/learning': { title: 'Use support without handing over the whole decision', tension: 'Advice can widen your options while the next choice remains yours. Decide which question you need help answering.' },
  'making/making': { title: 'Finish a useful version before improving every detail', tension: 'A strong interest in making something useful can still need a finishing rule. Feedback is easier to use on a version that exists.' },
  'making/resources': { title: 'Check what a useful result really takes to deliver', tension: 'Creating something and keeping its promise are different jobs. Include the preparation and follow-up around the visible result.' },
  'making/responsibility': { title: 'Make the standard clear enough to test a version', tension: 'A result needs both room to develop and a clear acceptance test. Separate a required correction from an optional improvement.' },
  'making/learning': { title: 'Let a small attempt tell you what to learn next', tension: 'More understanding can improve a result, but a short attempt may reveal the missing knowledge faster than more general preparation.' },
  'resources/resources': { title: 'Choose a promise you can still keep after the first step', tension: 'New openings and existing commitments share the same limited time. Compare the ongoing work as carefully as the appealing start.' },
  'resources/responsibility': { title: 'Match the promise with the time and authority it needs', tension: 'An agreement can name an attractive result without giving you the time, support or authority to deliver it.' },
  'resources/learning': { title: 'Give the next investment of effort a clear purpose', tension: 'A tool, course or new idea is useful when it answers a question in the current plan. Name that question before adding more preparation.' },
  'responsibility/responsibility': { title: 'Separate what is required from what you keep adding', tension: 'A clear duty can quietly grow when every extra request seems equally urgent. Revisit the original agreement before extending it.' },
  'responsibility/learning': { title: 'Ask for the support that lets you carry the responsibility', tension: 'Being accountable does not require already knowing everything. Identify the missing explanation or practice before promising a result.' },
  'learning/learning': { title: 'Choose a question whose answer you will actually use', tension: 'A thoughtful search can keep opening new questions. Give one question a practical use and a point at which to try the answer.' },
}

type Route = { action: string; pause: string; review: string }
const ROUTES: Record<SoloKind, Record<Family, Route>> = {
  career: {
    ownership: { action: 'Choose one real task. Agree which result is yours and which decisions you can make without asking again.', pause: 'The role holds you accountable while someone else controls every practical decision.', review: 'Did clearer decision rights remove a delay, or is a specific skill or resource still missing?' },
    making: { action: 'Choose a small piece of actual work. Show a usable version and ask what it must do to be accepted.', pause: 'Another revision is requested without explaining what is wrong with the current result.', review: 'Which observation improved the work, and which change was only a personal preference?' },
    resources: { action: 'Take one real offer or added duty. Put confirmed pay beside expected hours, extra work and necessary costs.', pause: 'An attractive title or payment leaves the hours, follow-up or added duties unclear.', review: 'What did the work require in practice, and does the confirmed agreement still cover it?' },
    responsibility: { action: 'Ask the person setting the task for its priority, the acceptance standard and the support available.', pause: 'You are expected to deliver a result without a clear priority, useful support or permission to decide.', review: 'Did the agreed standard make finishing easier, or did the requirement change after the work began?' },
    learning: { action: 'Pick a skill the current role actually needs. Use it in one small task before choosing more training.', pause: 'More preparation keeps replacing the chance to try the skill with useful feedback.', review: 'What could you do after the attempt that you could not show before it?' },
  },
  business: {
    ownership: { action: 'Choose one customer promise. Name the delivery owner and the changes that need a shared decision.', pause: 'A delivery depends on several people but nobody owns the handover or the final answer.', review: 'Could the customer tell who was responsible, and did the handover happen as agreed?' },
    making: { action: 'Make the smallest usable example of one offer. Ask a willing tester to try the actual result.', pause: 'New features keep being added before anyone has tried the central promise.', review: 'What did the tester use without help, and where did they stop or need an explanation?' },
    resources: { action: 'Trial one delivery. Record preparation, materials, customer messages, revisions and follow-up before expanding it.', pause: 'The customer promise grows while its delivery time, costs or included revisions stay unclear.', review: 'Which part used more time or money than expected, and what must the next brief make explicit?' },
    responsibility: { action: 'Write the result, deadline, included changes and customer input needed for one trial delivery.', pause: 'You are accepting responsibility for an outcome that also depends on unconfirmed customer input.', review: 'Did the written brief help both sides recognise completion, or did it leave a different expectation?' },
    learning: { action: 'Name one uncertainty about a customer problem. Test it with a small demonstration or a direct question.', pause: 'Research about a possible audience keeps replacing contact with a willing person who has the problem.', review: 'Which answer changed the offer, and which assumption still has no observation behind it?' },
  },
  wellbeing: {
    ownership: { action: 'Choose one ordinary part of the day you want to decide for yourself. Tell the people affected where that boundary begins.', pause: 'A request removes the only time you had reserved for your own ordinary priority.', review: 'Did the protected choice make the day easier to manage, and what still needs to be shared?' },
    making: { action: 'Choose one recurring task. Decide what a usable finish looks like and stop at that point once.', pause: 'A useful task keeps turning into another round of improvements after its purpose has been met.', review: 'Was the simpler finish enough, and what happened to the time you kept?' },
    resources: { action: 'Look at one recurring promise. Count the preparation and follow-up as well as the task itself.', pause: 'You keep renewing a small promise without looking at what it adds to an ordinary week.', review: 'Was the full commitment manageable on a normal day, rather than only on a good one?' },
    responsibility: { action: 'Name the owner, stopping point and next handover for one recurring duty at home or work.', pause: 'An unassigned task automatically becomes yours whenever you notice it.', review: 'Did the task stay with its agreed owner, or did the work quietly return to you?' },
    learning: { action: 'Observe one familiar situation, then try one small change. Use that example before collecting more routine advice.', pause: 'Reading about a better routine becomes another task while the ordinary problem stays untested.', review: 'Which change was easy enough to repeat without needing an ideal day?' },
  },
  year: {
    ownership: { action: 'Choose one personal plan for the year. Mark the decisions you want to own and the ones that involve someone else.', pause: 'A yearly aim assumes that another person has agreed to the same pace or priority.', review: 'What did you choose for yourself, and which part still needs a shared agreement?' },
    making: { action: 'Choose one annual intention. Turn it into a small result you can finish and review this month.', pause: 'The annual plan keeps gaining goals while the first result stays unfinished.', review: 'What exists now that did not exist before the attempt, and what is worth trying next?' },
    resources: { action: 'Review one recurring commitment before adding a new yearly promise. Include time, money and the work around it.', pause: 'A new plan needs resources already promised elsewhere, with no decision about what will move.', review: 'Which commitment still earns a place in the plan through its actual use or value to you?' },
    responsibility: { action: 'Choose one responsibility that matters this year. Agree its limit and a review date with anyone else involved.', pause: 'Every new request becomes a yearly obligation without a limit or a conversation about support.', review: 'Was the responsibility still fair and workable after the circumstances changed?' },
    learning: { action: 'Choose one thing you want to understand this year. Plan a small use for it before expanding the learning goal.', pause: 'Another source or plan delays a simple attempt you already have enough information to make.', review: 'Which idea helped with an actual choice, and which question can wait?' },
  },
  complete: {
    ownership: { action: 'Choose one decision in your current life. Name what you want to own and what genuinely needs another person’s agreement.', pause: 'Keeping control of every detail makes it harder to hear a useful alternative.', review: 'Did you protect the goal while allowing a different way to reach it?' },
    making: { action: 'Choose one useful thing you have been improving. Share a small finished version with someone who can use it.', pause: 'Another private revision changes little about what the result can actually do.', review: 'What did another person’s use reveal that checking alone did not?' },
    resources: { action: 'Choose one appealing invitation, purchase or promise. Write what it would add to your ordinary week.', pause: 'The appealing first step hides a recurring commitment you have not chosen deliberately.', review: 'Did the choice support something you value enough to keep giving it time?' },
    responsibility: { action: 'Choose one duty you keep carrying. Clarify what you agreed to do and which part needs a new conversation.', pause: 'Reliability is being measured by how much extra work you absorb without asking.', review: 'Did the clearer agreement protect the result as well as your available time?' },
    learning: { action: 'Choose one question that matters now. Try the best answer you already have in a small, reversible way.', pause: 'More understanding has become a condition for taking any next step at all.', review: 'What did the attempt clarify, and what genuinely needs more information?' },
  },
}

const HEADLINES: Record<Exclude<SoloKind, 'complete'>, Record<Family, string>> = {
  career: {
    ownership: 'Choose work with clear ownership and room to decide',
    making: 'Let a finished example show the skill you offer',
    resources: 'See the whole commitment behind the pay',
    responsibility: 'Match the job’s standard with the support to meet it',
    learning: 'Choose learning you can put to work',
  },
  business: {
    ownership: 'Give each customer promise a clear owner',
    making: 'Put one usable offer in front of a willing tester',
    resources: 'Count one delivery before expanding the offer',
    responsibility: 'Make the customer promise clear enough to deliver',
    learning: 'Let a customer question shape the next experiment',
  },
  wellbeing: {
    ownership: 'Leave one ordinary choice in your own hands',
    making: 'Give a useful task a simpler finishing point',
    resources: 'Make a recurring promise fit an ordinary week',
    responsibility: 'Stop the unassigned duty from becoming automatic',
    learning: 'Try one small change before adding another routine rule',
  },
  year: {
    ownership: 'Choose what you want to own in the year ahead',
    making: 'Turn an annual intention into a first result',
    resources: 'Make room before adding another yearly promise',
    responsibility: 'Give this year’s responsibilities a clear limit',
    learning: 'Give this year’s learning a practical use',
  },
}

export function buildDecisionFocus(kind: SoloKind, result: SajuResult, referenceYear?: number): DecisionFocus {
  if (kind === 'year' && (!Number.isInteger(referenceYear) || referenceYear! < result.input.year || referenceYear! < 1900 || referenceYear! > 2100)) throw new Error('Choose a valid reference year for the decision focus')
  const [, day, month] = result.pillars
  const annual = kind === 'year' ? getFourPillars(referenceYear!, 7, 15, 12, 0)[0] : undefined
  const primaryGod = annual ? getRelation(day.pillar.stem, annual[0])!.hanja : month.stemSipsin
  const secondaryGod = annual ? month.stemSipsin : month.branchSipsin
  const primary = WORK_PROFILES[primaryGod], secondary = WORK_PROFILES[secondaryGod]
  const a = THEME_FAMILY[primaryGod] as Family, b = THEME_FAMILY[secondaryGod] as Family
  const bridge = BRIDGES[pairKey(a, b, ORDER)]
  if (!primary || !secondary || !bridge) throw new Error('Two valid chart themes are needed for a decision focus')
  const first = ROUTES[kind][a], second = ROUTES[kind][b]
  const setting = annual ? 'The annual reference adds' : 'Your birth month brings'
  const secondSetting = annual ? 'your usual birth-month theme is' : 'a second working theme adds'
  const themes = primaryGod === secondaryGod
    ? `${setting} **${primary.theme}**, and the second checked position repeats it. Repetition selects a shared question; it is not a strength score.`
    : `${setting} **${primary.theme}**; ${secondSetting} **${secondary.theme}**.`
  return {
    headline: kind === 'complete' ? bridge.title : HEADLINES[kind][a],
    synthesis: `${themes} ${bridge.tension}`,
    firstStep: first.action,
    pauseIf: second.pause,
    review: `${second.review} Did the plan leave room for **${PERSONAL_PROFILES[day.pillar.stem].need}**?`,
    evidence: [
      `Birth-day stem ${day.pillar.stem}: starting-style need used in the review question.`,
      annual ? `Annual reference ${referenceYear}-07-15 12:00 Asia/Seoul: ${annual}; stem relationship ${primaryGod}. Birth-month stem ${month.pillar.stem}: ${secondaryGod}.` : `Birth-month pillar ${month.pillar.ganzi}: stem relationship ${primaryGod}; principal inner-stem relationship ${secondaryGod}.`,
      'The decision focus combines two editorial theme families. It does not infer an observed situation, weight chart strength or predict an outcome.',
    ],
  }
}

type Care = 'pause' | 'reliability' | 'voice' | 'presence' | 'listening'
const CARE_ORDER: Care[] = ['pause', 'reliability', 'voice', 'presence', 'listening']
const CARE: Record<string, Care> = { 子: 'pause', 丑: 'reliability', 寅: 'voice', 卯: 'voice', 辰: 'reliability', 巳: 'pause', 午: 'presence', 未: 'listening', 申: 'listening', 酉: 'voice', 戌: 'reliability', 亥: 'pause' }
const CARE_STEP: Record<Care, string> = {
  pause: 'Name the part you can say now and a specific time to return to the rest.',
  reliability: 'Choose one small action you can keep and say when it will happen.',
  voice: 'Name one preference you want heard and one choice the other person can make freely.',
  presence: 'Suggest a specific time together and a separate period for your own interests.',
  listening: 'Say whether you want listening, ideas or practical help before describing the problem.',
}
const CONVERSATIONS: Record<string, { title: string; step: string; pause: string; review: string }> = {
  'pause/pause': { title: 'Make the pause safe by agreeing how you will return', step: 'Both people write one sentence before talking. Agree who will reopen the conversation and when.', pause: 'Both people are waiting for the other to restart a conversation that has no return time.', review: 'Did the agreed return happen, and was there room for each person’s unfinished thought?' },
  'pause/reliability': { title: 'Give thinking time a dependable next step', step: 'Agree a time to return to one conversation and one small action that can wait until both people have answered.', pause: 'A request for thinking time is treated as a broken promise, or a promise is used to demand an immediate answer.', review: 'Was the pause respected and the next action kept, without either person having to guess?' },
  'pause/voice': { title: 'Make room to think and still give both preferences a voice', step: 'Each person names one preference. Leave the undecided part open until the agreed return time.', pause: 'The quicker answer becomes the final decision before the quieter person has had time to respond.', review: 'Did the later answer have a real chance to change the plan?' },
  'pause/presence': { title: 'Make space feel clear, and closeness feel chosen', step: 'Agree a period apart and a specific way to reconnect afterwards. Check that both parts are welcome.', pause: 'Time apart has no explanation, or shared time is used as proof that someone cares.', review: 'Did the arrangement give useful space and a welcome return, rather than another obligation?' },
  'pause/listening': { title: 'Let a feeling be heard without demanding an answer now', step: 'Hold one short conversation for listening only. Set another time for any decision that still needs thought.', pause: 'A feeling is being pushed toward a solution before the person is ready to choose one.', review: 'Could the person finish their thought, and is it clear which decision remains open?' },
  'reliability/reliability': { title: 'Make the promise small enough for both people to keep', step: 'Each person chooses one action for the week. Say what a change of plan would need to look like.', pause: 'Both people assume their own routine is the obvious way to show care.', review: 'Which action actually felt supportive, and which expectation had never been said aloud?' },
  'reliability/voice': { title: 'Keep the promise while leaving the method open to discussion', step: 'Agree one shared result. Let each person name a preferred way to reach it before dividing the work.', pause: 'A different preference is treated as refusal to follow through.', review: 'Was the agreed result kept, and did each person have a real say in the method?' },
  'reliability/presence': { title: 'Turn care into a plan that includes together and apart', step: 'Choose one dependable shared moment and one separate plan. Say how you will discuss a change.', pause: 'Keeping every routine together leaves one person no room for an interest of their own.', review: 'Did the plan feel dependable without making every separate activity a problem?' },
  'reliability/listening': { title: 'Hear the need before choosing the helpful action', step: 'First repeat the need in your own words. Then agree one action and when you will check whether it helped.', pause: 'Completing a practical task is being used to close a conversation the other person still needs to have.', review: 'Did the action answer the need that was actually expressed?' },
  'voice/voice': { title: 'Let both preferences affect the shared decision', step: 'Each person names one important detail. Choose an option that preserves one detail for each person.', pause: 'The conversation is becoming a contest over whose preference is more reasonable.', review: 'Can each person point to a part of the plan that reflects their own answer?' },
  'voice/presence': { title: 'Choose shared time without giving up a personal preference', step: 'Plan one shared activity and let each person choose a detail. Leave room for a separate interest too.', pause: 'Agreeing to everything is becoming the price of spending time together.', review: 'Was the shared time welcome to both people, and could either person say what they would change?' },
  'voice/listening': { title: 'Hear the feeling, then make the request clear', step: 'Give each person a turn to describe the feeling and then make one specific request. Ask what the other understood.', pause: 'A kind response is being taken as an agreement to a request that was never clearly made.', review: 'Did both people agree to the same request, including the part either person could decline?' },
  'presence/presence': { title: 'Choose closeness that leaves room for two separate lives', step: 'Each person chooses a shared moment and an independent plan for the week. Discuss both with equal interest.', pause: 'One person is cancelling an independent interest to avoid having to explain it.', review: 'Could both people enjoy closeness without having to give up the separate plan?' },
  'presence/listening': { title: 'Ask what kind of company would help today', step: 'Offer company, a listening conversation or practical help. Let the person choose before making the plan.', pause: 'Being together is assumed to help when the person has asked for a different kind of support.', review: 'Did the time together match the support requested, and could the person ask for something else?' },
  'listening/listening': { title: 'Make room for two stories before trying to solve either', step: 'Take one uninterrupted turn each. Before offering a solution, say back what you understood and ask whether it is right.', pause: 'Both people are preparing advice while the other is still speaking.', review: 'Did each person feel accurately heard, and which practical request still needs an answer?' },
}

export function buildPairDecisionFocus(first: SajuResult, second: SajuResult): DecisionFocus {
  const a = first.pillars[1].pillar, b = second.pillars[1].pillar
  const protocol = CONVERSATIONS[pairKey(CARE[a.branch], CARE[b.branch], CARE_ORDER)]
  if (!protocol) throw new Error('Two valid relationship themes are needed for a shared decision focus')
  return {
    headline: protocol.title,
    synthesis: `Person A’s theme asks for **${RELATIONSHIP_PROFILES[a.branch].need}**. Person B’s asks for **${RELATIONSHIP_PROFILES[b.branch].need}**. ${a.branch === b.branch ? 'A matching symbol still leaves two people free to want different things in the same moment.' : 'Try the following format only if both people recognise these needs.'}`,
    firstStep: protocol.step,
    pauseIf: protocol.pause,
    review: protocol.review,
    evidence: [`Person A day pillar ${a.ganzi}; relationship branch ${a.branch}.`, `Person B day pillar ${b.ganzi}; relationship branch ${b.branch}.`, `Person A: ${CARE_STEP[CARE[a.branch]]} Person B: ${CARE_STEP[CARE[b.branch]]}`, 'These conversation formats are editorial groupings of the stated relationship themes, not additional traditional match categories or relationship scores.'],
  }
}

export function decisionFocusText(focus: DecisionFocus): string {
  return ['Your focus, in plain English', focus.headline, focus.synthesis, 'Try first: ' + focus.firstStep, 'Pause and clarify if: ' + focus.pauseIf, 'Review after the attempt: ' + focus.review, 'Why this focus: ' + focus.evidence.join(' ')].join('\n\n')
}
