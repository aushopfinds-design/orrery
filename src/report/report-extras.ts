import type { SajuResult } from '@orrery/core/types'
import { getRelation } from '@orrery/core/pillars'
import { PERSONAL_PROFILES, WORK_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { FOCUS_WORK, PAIR_LENSES } from './category-profiles.ts'
import { STEM_ELEMENTS, STEMS } from './reading.ts'
import type { ReadingElement } from './reading.ts'
import { plainReadingText } from './reading-text.ts'
import { LIFE_FOCUS } from './reading-scenarios.ts'

export type ExtrasKind = 'complete' | 'compatibility' | 'year' | 'career' | 'business' | 'wellbeing'
export interface InsightQuestion { question: string; answer: string; basis: string }
export interface EverydayChoice { title: string; text: string }
export interface SymbolCard {
  person: string
  element: ReadingElement
  colors: { name: string; hex: string }[]
  numbers: [number, number]
  use: string
  basis: string
}
export interface ReportExtras {
  questions: InsightQuestion[]
  keepClose: EverydayChoice[]
  stepBack: EverydayChoice[]
  symbols: SymbolCard[]
  reminder: string
  experiment: { title: string; steps: string[] }
  evidence: string[]
}

// Cultural correspondences, not an assessment of useful elements or probability.
// Color families follow the five-color tradition; secondary shades are our palette.
export const ELEMENT_SYMBOLS: Record<ReadingElement, { colors: SymbolCard['colors']; numbers: [number, number] }> = {
  Wood: { colors: [{ name: 'Blue-green', hex: '#28796c' }, { name: 'Leaf green', hex: '#75965a' }], numbers: [3, 8] },
  Fire: { colors: [{ name: 'Red', hex: '#b7463e' }, { name: 'Warm coral', hex: '#d78064' }], numbers: [2, 7] },
  Earth: { colors: [{ name: 'Yellow', hex: '#d4ad45' }, { name: 'Sand', hex: '#d7c3a0' }], numbers: [5, 10] },
  Metal: { colors: [{ name: 'White', hex: '#fffdf7' }, { name: 'Soft silver', hex: '#bbc4c9' }], numbers: [4, 9] },
  Water: { colors: [{ name: 'Black', hex: '#252b34' }, { name: 'Deep navy', hex: '#203d60' }], numbers: [1, 6] },
}
export const SYMBOL_NOTE = 'These “lucky” colors and numbers are traditional symbols for your birth-day element. Use them as personal reminders. They do not change the odds of an event or promise a result.'
export const SYMBOL_SOURCES = [
  { label: 'Five-color tradition · Korea.net', url: 'https://www.korea.net/NewsFocus/HonoraryReporters/view?articleId=218521' },
  { label: 'He Tu number pairs · historical text', url: 'https://zh.wikisource.org/wiki/河圖原' },
]

interface LifeDetail {
  people: string; space: string; habit: string; limit: string
  misread: string; gift: string; reminder: string
}
const LIFE_DETAILS: Record<string, LifeDetail> = {
  '甲': {
    people: 'Someone who asks where you want to go, then helps you compare routes.',
    space: 'A visible goal, a clear starting point and room to rearrange the steps.',
    habit: 'Keep the destination on one line. Rewrite the route when new information arrives.',
    limit: 'Staying loyal to a plan after the reason for it has changed.',
    misread: 'A suggestion to change the method can feel like doubt about your goal.',
    gift: 'You can give a scattered idea a direction that other people can understand.',
    reminder: 'I can change the route and still respect my goal.',
  },
  '乙': {
    people: 'Someone who checks your preference before accepting another compromise.',
    space: 'An adaptable plan with one part of your time kept for your own priorities.',
    habit: 'Before adjusting a plan, say which part you are happy to change and which part you need to keep.',
    limit: 'Making many small concessions without checking their total cost to your time.',
    misread: 'Being easy to work with can be mistaken for having no preference.',
    gift: 'You may spot a workable alternative when a direct approach has stopped helping.',
    reminder: 'Being flexible can include a clear no.',
  },
  '丙': {
    people: 'Someone who enjoys your enthusiasm and also notices when you need a quieter turn.',
    space: 'A welcoming place with a separate corner where you can finish without an audience.',
    habit: 'After sharing an idea, choose who owns the next step instead of carrying every reply yourself.',
    limit: 'Keeping the energy of the whole group going at the expense of your own task.',
    misread: 'A lively first response can make others assume that you have unlimited time.',
    gift: 'You can make an unfamiliar idea feel approachable enough for someone to try.',
    reminder: 'I can bring warmth without being available all the time.',
  },
  '丁': {
    people: 'Someone who appreciates the care behind your work and helps you decide when it is ready.',
    space: 'One task in view, useful light and a finishing point agreed before you begin.',
    habit: 'Choose the detail that changes the result. Give the rest a shorter time limit.',
    limit: 'Spending the same effort on a tiny finishing touch as on the main purpose.',
    misread: 'Thinking carefully can look like hesitation when you have not explained what you are checking.',
    gift: 'You may notice the small change that makes something easier for another person to use.',
    reminder: 'Care can be complete before every detail is perfect.',
  },
  '戊': {
    people: 'Someone who names their part of a promise and follows through without repeated reminders.',
    space: 'A dependable base with responsibilities written down and support you can actually request.',
    habit: 'Before filling a gap, ask who owns the task and how long your help is needed.',
    limit: 'Becoming the default backup for a problem that nobody has agreed to solve.',
    misread: 'Looking steady can make others miss the amount of work you are carrying.',
    gift: 'You can turn a vague promise into something practical that a group can rely on.',
    reminder: 'I can be dependable and still ask for help.',
  },
  '己': {
    people: 'Someone who notices the quiet work and makes room for your own unfinished plans.',
    space: 'A familiar routine with a place for your own project, not only everyone else’s needs.',
    habit: 'Put one personal task before a task that can safely wait.',
    limit: 'Using every free moment to tidy up another person’s loose ends.',
    misread: 'Offering practical care can hide the fact that you would welcome care too.',
    gift: 'You may make useful progress through small improvements that others overlook.',
    reminder: 'My own plans deserve a place in the day.',
  },
  '庚': {
    people: 'Someone who can give an honest answer without turning a difference into a contest.',
    space: 'A clear brief, the tools needed for it and room to discuss a different method.',
    habit: 'Explain which result matters before correcting the way someone reaches it.',
    limit: 'Turning a useful standard into a rule that leaves no room for another approach.',
    misread: 'A short answer can sound like a final judgment when you meant it as a practical suggestion.',
    gift: 'You can name the decision a group has been avoiding and help it move forward.',
    reminder: 'I can be clear and leave room for another view.',
  },
  '辛': {
    people: 'Someone who names what works as clearly as they name what needs improving.',
    space: 'An uncluttered place with a short definition of what a finished result needs to do.',
    habit: 'Check the few details a person will actually notice or use. Release the version that meets them.',
    limit: 'Treating a small flaw as a reason to hide an otherwise useful result.',
    misread: 'Noticing an imperfection can be mistaken for rejecting the whole effort.',
    gift: 'You may see the finishing detail that makes a message or piece of work feel considered.',
    reminder: 'A useful version deserves to be seen.',
  },
  '壬': {
    people: 'Someone who welcomes possibilities and then asks which one you want to test first.',
    space: 'A place to collect ideas beside a separate list for the one task you are doing now.',
    habit: 'Save new ideas without starting them. Finish one small test before opening the next.',
    limit: 'Letting an interesting new possibility replace the test that was nearly ready.',
    misread: 'Exploring alternatives can look like a lack of commitment unless you name the choice you are testing.',
    gift: 'You can connect information from different places and see an option others missed.',
    reminder: 'Choosing one test does not close every other door.',
  },
  '癸': {
    people: 'Someone who invites your view, leaves time for an answer and checks what silence means.',
    space: 'A quieter place to think, with an agreed moment to share what you have noticed.',
    habit: 'Offer a first answer before waiting for a complete explanation. You can add detail later.',
    limit: 'Keeping a concern private until other people have already made the decision.',
    misread: 'A quiet response can be taken as agreement when you are still considering the question.',
    gift: 'You may notice an overlooked concern and ask the question that makes it easier to discuss.',
    reminder: 'My first thought is worth hearing too.',
  },
}

const SYMBOL_USES: Record<ExtrasKind, string> = {
  complete: 'Use a color in a notebook or phone background. Let it remind you of one choice you want to make more deliberately.',
  compatibility: 'Choose a shade each for a shared note. Use the note to record one request from each person; neither palette is the better one.',
  year: 'Use a color to mark your own priorities in the year’s planner. The numbers can label a personal reminder, not a lucky date.',
  career: 'Use a shade to mark the tasks that show your best work. Keep the numbers as a reminder to review a choice before committing.',
  business: 'Try a shade in your private planning notes. Choose customer-facing colors for clarity and fit with your audience.',
  wellbeing: 'Try a small accent in a space you already use. Let it remind you to pause and notice what would make the routine easier.',
}
function symbolCard(result: SajuResult, kind: ExtrasKind, person = 'Your birth-day symbol'): SymbolCard {
  const stem = result.pillars[1].pillar.stem
  const element = STEM_ELEMENTS[stem]
  if (!element) throw new Error('A valid birth-day element is needed')
  const symbols = ELEMENT_SYMBOLS[element]
  return { person, element, colors: symbols.colors.map(color => ({ ...color })), numbers: [...symbols.numbers], use: SYMBOL_USES[kind], basis: `Your ${STEMS[stem].name} birth-day symbol belongs to ${element}. The colors and number pair follow that traditional association.` }
}

/** Added questions combine day, month and relationship themes; no invented events. */
export function buildReportExtras(kind: ExtrasKind, result: SajuResult, options: { second?: SajuResult; year?: number; annual?: { theme: string; god: string; pillar: string } } = {}): ReportExtras {
  const [, day, month] = result.pillars
  const personal = PERSONAL_PROFILES[day.pillar.stem]
  const work = WORK_PROFILES[month.stemSipsin]
  const relationship = RELATIONSHIP_PROFILES[day.pillar.branch]
  const detail = LIFE_DETAILS[day.pillar.stem]
  const focus = FOCUS_WORK[month.stemSipsin]
  const life = LIFE_FOCUS[month.stemSipsin]
  if (!personal || !work || !relationship || !detail || !focus) throw new Error('A valid chart is needed for the everyday guide')
  const dayBasis = `Your birth-day starting theme is ${personal.focus}.`
  const workBasis = `Your birth-month comparison brings ${work.theme} into focus.`
  const loveBasis = `Your birth-day relationship theme values ${relationship.need}.`
  const q = (question: string, answer: string, basis: string): InsightQuestion => ({ question, answer, basis })
  const card = (title: string, text: string): EverydayChoice => ({ title, text })
  let questions: InsightQuestion[]
  let keepClose = [card('People who make room for you', detail.people), card('A setting to try', detail.space), card('A habit worth keeping', detail.habit)]
  let stepBack = [card('A familiar trap', detail.limit), card('A misunderstanding to clear up', detail.misread), card('Pressure that needs a name', `Notice **${work.friction}**. Describe one real example before agreeing to more of it.`)]
  let experiment = { title: 'One week, one useful change', steps: [detail.habit, `Say to someone close: “${relationship.words}”`, 'After seven days, keep one change that helped and drop one that did not fit.'] }
  const symbols = [symbolCard(result, kind)]
  let reminder = detail.reminder
  const evidence = [`Birth-day stem ${day.pillar.stem} (${STEMS[day.pillar.stem].name}); birth-day branch ${day.pillar.branch}.`, `Birth-month stem ${month.pillar.stem}: ${month.stemSipsin}; day-stem reference ${day.pillar.stem}.`]
  switch (kind) {
    case 'complete':
      questions = [
        q('What is one strength I may overlook?', `**${detail.gift}** You may dismiss it because it feels ordinary to you. Think of a recent moment when someone found your contribution useful, and ask what part helped them.`, dayBasis),
        q('What kind of people should I keep close?', `**${detail.people}** In a close relationship, also look for room to discuss **${relationship.need}**. Notice how a person responds to an ordinary request; a birth sign cannot tell you whether they will respect it.`, `${dayBasis} ${loveBasis}`),
        q('What kind of work may feel more natural?', `Compare your experience with **${focus.tasks}**. The useful question is whether the actual role leaves room for **${personal.need}**. Choose one example from your past work before deciding whether the description fits.`, workBasis),
        q('What tends to get in my way?', `Watch for **${detail.limit.charAt(0).toLowerCase() + detail.limit.slice(1)}** Another person may see it differently: ${detail.misread.charAt(0).toLowerCase() + detail.misread.slice(1)} **Explain what matters to you before assuming the other person knows.**`, dayBasis),
      ]
      break
    case 'career':
      questions = [
        q('Which working conditions are worth looking for?', `Look for **${work.setting}**. Then ask: **“${focus.interview}”** A useful answer includes a recent example of how the team works, not only a promise about its culture.`, workBasis),
        q('How can I show what I can do?', `**${detail.gift}** Make it visible in a real example: **${focus.proof}** Add one sentence about the problem you solved and one about your own part. This gives someone a result to discuss alongside the chart’s suggested theme.`, `${dayBasis} ${workBasis}`),
        q('Should I change jobs or change the way I work?', `First separate the **task, workload and working conditions**. A role that uses ${work.contribution} may still feel difficult when you face ${work.friction}. Test one change you can discuss, then compare the result with a real alternative. The chart cannot choose the job for you.`, workBasis),
        q('What money habit should I watch at work?', `Watch for **${life.moneyWatch}**. Ask: **“${life.payQuestion}”** Put confirmed pay, expected hours and added duties on one page. Compare the whole agreement, rather than judging an offer by the headline amount alone.`, workBasis),
      ]
      keepClose = [card('Useful feedback', `Ask someone to discuss a piece of work involving **${focus.tasks}**.`), card('Working conditions', `Check for **${work.setting}** before judging a job by its title.`), card('A clear boundary', detail.habit)]
      stepBack = [card('Work without the right conditions', `Notice **${work.friction}** and ask what could change.`), card('Promises that keep expanding', 'Ask what will be removed or shared when another duty is added.'), card('A quiet source of friction', detail.misread)]
      experiment = { title: 'Build one example of your work', steps: [focus.proof, `Ask a colleague or manager: “${focus.interview}”`, 'Compare the answer with your example. Choose one working condition to discuss next.'] }
      break
    case 'business':
      questions = [
        q('What could I build an offer around?', `An idea to explore is **${focus.offer}**. Keep the first version specific enough that a customer can explain what they receive. **${focus.experiment}**`, workBasis),
        q('Who should I work with?', `Ask a possible collaborator: **“${focus.customer}”** You also need room for **${personal.need}**. Agree who owns the decision, who delivers the work and how a disagreement will be handled. Notice whether both people can explain the agreement in the same way.`, `${workBasis} ${dayBasis}`),
        q('What could make a good idea harder to finish?', `One pressure to examine is **${focus.capacity}**. Your starting style adds another: **${detail.limit.charAt(0).toLowerCase() + detail.limit.slice(1)}** Before adding a feature, ask which customer problem it solves and what existing work it replaces.`, `${workBasis} ${dayBasis}`),
        q('When is it worth growing the idea?', `Start with a delivery you can repeat and feedback from a real customer. **${focus.customer}** Check what you learned, what the next version needs and who will do the work. A chart theme can start the discussion; it cannot establish demand or profitability.`, workBasis),
      ]
      keepClose = [card('A customer with a clear need', focus.customer), card('A small offer you can deliver', `Explore **${focus.offer}** before adding another line of work.`), card('A partner who leaves room to discuss', detail.people)]
      stepBack = [card('A capacity trap', `Watch for **${focus.capacity}**.`), card('An offer nobody can explain', 'Write down the result, what is included and what needs a separate agreement.'), card('A personal habit to notice', detail.limit)]
      experiment = { title: 'Test the offer before making it bigger', steps: [focus.experiment, `Ask one potential customer: “${focus.customer}”`, 'Write down one part they understood and one part they questioned. Revise that part first.'] }
      break
    case 'year': {
      if (!options.annual || !options.year) throw new Error('The calculated annual theme and report year are needed')
      const annual = WORK_PROFILES[options.annual.god]
      const annualLife = LIFE_FOCUS[options.annual.god]
      const basis = `The ${options.year} annual comparison adds ${annual.theme} to your birth-day starting theme.`
      questions = [
        q(`What deserves my attention in ${options.year}?`, `Use **${annual.theme}** as a planning question. Your own style still needs **${personal.need}**. Pick one current plan where both can fit, instead of treating the year as a promise that something will happen.`, basis),
        q('How should I judge a new opportunity?', `Start with one question: **“${annualLife.yearQuestion}”** Then try a smaller version: **${annualLife.yearStep}** Compare what happens with your need for **${personal.need}** before adding another plan.`, `${basis} ${dayBasis}`),
        q(`What should I avoid carrying into ${options.year}?`, `Notice **${detail.limit.charAt(0).toLowerCase() + detail.limit.slice(1)}** The annual theme can also bring a reason to examine **${annual.friction}**. Name one commitment you want to review before adding another.`, basis),
        q('When should I make my next move?', 'Use the twelve monthly reflections as **check-in points**, then choose a date that fits your information, responsibilities and readiness. A reference-month symbol is not a lucky day. Start with a small step you can review rather than waiting for a date to guarantee the result.', basis),
      ]
      keepClose = [card('One focus for the year', `Bring **${annual.theme}** into one plan you already care about.`), card('A realistic way to try it', annualLife.yearStep), card('Your own pace', detail.habit)]
      stepBack = [card('An annual pressure to notice', `Watch for **${annual.friction}**.`), card('A habit to leave less room for', detail.limit), card('Waiting for a perfect date', 'Use actual readiness and the monthly questions to choose your next step.')]
      experiment = { title: `Begin your ${options.year} plan with one test`, steps: [annualLife.yearStep, `Leave room for **${personal.need}** while you try it.`, 'Book a review after the first small result. Change the plan using what you learned.'] }
      evidence.push(`Annual reference ${options.year}-07-15, 12:00 Asia/Seoul: ${options.annual.pillar}; day-stem comparison ${options.annual.god}.`)
      break
    }
    case 'wellbeing':
      questions = [
        q('What might be making a routine feel heavy?', `A pattern to notice is **${detail.limit.charAt(0).toLowerCase() + detail.limit.slice(1)}** Check one ordinary day: which task grew, which request stayed unclear and which part belonged to someone else? **Change one recurring pressure before rebuilding the whole routine.**`, dayBasis),
        q('What kind of space may suit me?', `Try **${detail.space.charAt(0).toLowerCase() + detail.space.slice(1)}** You do not need a new room. Clear one surface or agree one period without interruptions, and see whether the change helps you do the task you chose.`, dayBasis),
        q('What do I need from other people?', `Look for room to talk about **${relationship.need}**, alongside **${personal.need}**. Try saying: **“${relationship.words}”** Then ask which part of the request is realistic for the other person.`, `${loveBasis} ${dayBasis}`),
        q('What can I stop doing automatically?', `When a task creates **${work.friction}**, pause before responding in the usual way. **${detail.habit}** A boundary can be a clear answer about one task; it does not need to become a judgment about the whole relationship.`, workBasis),
      ]
      keepClose = [card('A space with a purpose', detail.space), card('Support you can ask for', detail.people), card('One smaller response', detail.habit)]
      stepBack = [card('An automatic habit', detail.limit), card('An unspoken expectation', detail.misread), card('A routine with no stopping point', `Name one recurring task connected with **${work.theme}** and decide when it can wait.`)]
      experiment = { title: 'Make one ordinary day easier to manage', steps: [detail.habit, 'Choose one surface, task or conversation to simplify. Record the change in one sentence.', 'After a week, notice whether it helped. Keep the useful part without turning the exercise into another duty.'] }
      break
    case 'compatibility': {
      if (!options.second) throw new Error('Two charts are needed for the relationship guide')
      const otherDay = options.second.pillars[1]
      const otherPersonal = PERSONAL_PROFILES[otherDay.pillar.stem]
      const otherLove = RELATIONSHIP_PROFILES[otherDay.pillar.branch]
      const otherDetail = LIFE_DETAILS[otherDay.pillar.stem]
      const lensA = PAIR_LENSES[getRelation(day.pillar.stem, otherDay.pillar.stem)!.hanja]
      const lensB = PAIR_LENSES[getRelation(otherDay.pillar.stem, day.pillar.stem)!.hanja]
      const basis = `Person A’s comparison theme is ${lensA.theme}; Person B’s is ${lensB.theme}.`
      questions = [
        q('Why can the same connection feel different to each of us?', `From Person A’s side, the comparison highlights **${lensA.theme}**. From Person B’s side, it highlights **${lensB.theme}**. Ask each person what they hoped for in the same recent moment. Two different answers can explain more than a match score.`, basis),
        q('What helps each of us feel cared for?', `**Person A:** make room for ${relationship.need}. **Person B:** make room for ${otherLove.need}. Each person names one small action that would help this week. A useful request is something the other person can understand and respond to.`, 'Each person’s birth-day branch supplies their own relationship theme.'),
        q('How can we handle a disagreement more clearly?', `**For Person A:** ${lensA.balance} **For Person B:** ${lensB.balance} Choose one topic and let both people finish an answer. Return to what was actually said before deciding what it means about the relationship.`, basis),
        q('What should we agree before sharing a plan?', `Person A’s starting style needs **${personal.need}**. Person B’s needs **${otherPersonal.need}**. Name the time, tasks and choices each person can offer. If those needs pull in different directions, change one part of the plan together.`, 'Both birth-day starting symbols are used separately.'),
      ]
      keepClose = [card('Care Person A can recognise', relationship.keepClose[0]), card('Care Person B can recognise', otherLove.keepClose[0]), card('A shared way to ask', `Take turns asking: **“${lensA.question}”** Then listen to the other answer.`)]
      stepBack = [card('A misunderstanding for Person A', detail.misread), card('A misunderstanding for Person B', otherDetail.misread), card('Assuming a chart replaces an answer', 'Check what each person wants today. Similar symbols do not make two people identical.')]
      symbols[0] = symbolCard(result, kind, 'Person A')
      symbols.push(symbolCard(options.second, kind, 'Person B'))
      reminder = 'We can understand a difference before trying to solve it.'
      experiment = { title: 'One conversation with room for both people', steps: [`Person A asks: **“${lensA.question}”** Person B answers first.`, `Person B asks: **“${lensB.question}”** Person A answers first.`, 'Agree one small request each. In seven days, ask what helped and what needs adjusting.'] }
      evidence.push(`Person B birth-day pillar ${otherDay.pillar.ganzi}; A → B ${getRelation(day.pillar.stem, otherDay.pillar.stem)!.hanja}; B → A ${getRelation(otherDay.pillar.stem, day.pillar.stem)!.hanja}.`)
      break
    }
  }
  return { questions, keepClose, stepBack, symbols, reminder, experiment, evidence }
}

export function reportExtrasText(extras: ReportExtras): string {
  return plainReadingText([
    'Your Everyday Compass', 'Questions you may be asking',
    ...extras.questions.flatMap(item => [item.question, item.answer, 'Why this appears: ' + item.basis]),
    'Bring closer', ...extras.keepClose.map(item => `${item.title}: ${item.text}`),
    'Give less space to', ...extras.stepBack.map(item => `${item.title}: ${item.text}`),
    'Lucky colors & numbers · traditional symbols',
    ...extras.symbols.flatMap(item => [item.person + ' · ' + item.element, 'Colors: ' + item.colors.map(color => color.name).join(' / '), 'Numbers: ' + item.numbers.join(' / '), item.basis, item.use]),
    SYMBOL_NOTE, 'A reminder to keep: ' + extras.reminder,
    extras.experiment.title, ...extras.experiment.steps.map((step, index) => `${index + 1}. ${step}`),
    'From the chart: ' + extras.evidence.join(' '),
    'Cultural references', ...SYMBOL_SOURCES.map(source => `${source.label}: ${source.url}`),
  ].join('\n\n'))
}
