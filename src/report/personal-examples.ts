import type { SajuResult } from '@orrery/core/types'
import { getRelation } from '@orrery/core/pillars'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES, WORK_PROFILES } from './reading-profiles.ts'

/** Authored situations selected by calculated chart themes. Never observed life facts. */
export interface EverydayExample {
  scene: string
  response: string
  check: string
  basis: string
  facts: string[]
}

type WorkSituation = { career: string; business: string; year: string; question: string; customer: string; inner: string }
const SITUATIONS: Record<string, WorkSituation> = {
  '比肩': {
    career: 'Imagine being given a project to lead, while someone else must approve every small decision.',
    business: 'Imagine a collaborator asking you to lead delivery while keeping every decision about the offer.',
    year: 'Imagine choosing a personal project while family or friends keep suggesting a different direction.',
    question: 'Which decisions can I make myself, and which ones need approval?',
    customer: 'Which part will I deliver, and which decisions will we make together?',
    inner: 'Who owns the next step?',
  },
  '劫財': {
    career: 'Imagine a team sharing a deadline, but one person quietly taking on most of the extra work.',
    business: 'Imagine a joint offer where both people expect the other to handle messages and follow-up.',
    year: 'Imagine friends planning several activities, while your own time and budget are already full.',
    question: 'How will we divide the extra work and recognise each person’s part?',
    customer: 'Who will handle delivery, messages and follow-up for this order?',
    inner: 'Is the work shared fairly?',
  },
  '食神': {
    career: 'Imagine finishing a useful piece of work, then being asked to add several small extras before sharing it.',
    business: 'Imagine a customer enjoying your first version, while you keep adding extras they did not request.',
    year: 'Imagine wanting to return to a hobby, but making the first session so ambitious that you never begin.',
    question: 'What would make this version useful enough to share today?',
    customer: 'Which part is useful already, and what can wait for another version?',
    inner: 'What useful result can be finished?',
  },
  '傷官': {
    career: 'Imagine spotting a quicker method, while your team is used to doing the task another way.',
    business: 'Imagine seeing a better way to solve a customer’s problem before they have finished explaining it.',
    year: 'Imagine wanting to change a shared routine, while someone close prefers the familiar version.',
    question: 'Could I show a small example, then hear what might be missing?',
    customer: 'Have I understood the problem before I suggest a different approach?',
    inner: 'Has the other person had time to explain?',
  },
  '正財': {
    career: 'Imagine keeping the same pay while another regular duty is added to your week.',
    business: 'Imagine agreeing one delivery price, then discovering that every order needs extra preparation and replies.',
    year: 'Imagine adding a small monthly cost, then noticing that several similar promises already fill your budget.',
    question: 'What changes when this extra duty becomes a regular part of the role?',
    customer: 'What preparation and follow-up are included in this delivery?',
    inner: 'What will this require each week?',
  },
  '偏財': {
    career: 'Imagine an appealing new role with a clear pay figure, but no clear answer about hours or extra duties.',
    business: 'Imagine a promising customer asking for a fast start before the scope and delivery date are agreed.',
    year: 'Imagine an invitation that sounds exciting, while the time and cost behind it are still unclear.',
    question: 'What is confirmed, and what work is still outside the written offer?',
    customer: 'Can we agree the first delivery before adding the next request?',
    inner: 'What is confirmed, and what is still a hope?',
  },
  '偏官': {
    career: 'Imagine two urgent requests arriving together, each described as the most important task.',
    business: 'Imagine a customer asking for a rush order while another delivery is already promised.',
    year: 'Imagine a busy week when several people need a quick answer, but their deadlines are different.',
    question: 'Which request comes first, and which task can move?',
    customer: 'Which deadline is essential, and what can wait or be reduced?',
    inner: 'Which deadline is real, and what can wait?',
  },
  '正官': {
    career: 'Imagine completing the agreed checklist, then adding more checks because you want the result to be dependable.',
    business: 'Imagine a customer agreeing to the brief, while you keep raising the standard before showing the result.',
    year: 'Imagine saying yes to a responsibility without checking whether everyone expects the same thing.',
    question: 'Which checks are required before we can call this finished?',
    customer: 'What must be included for us to agree that the delivery is complete?',
    inner: 'What does a finished result include?',
  },
  '偏印': {
    career: 'Imagine spending another afternoon researching a task that could already be tested in a small way.',
    business: 'Imagine wanting another tool or course before showing a simple version of your offer.',
    year: 'Imagine saving several ideas for a personal goal, without trying the smallest version of any one idea.',
    question: 'What can I test with what I already know?',
    customer: 'Could a small trial answer this question before we add another tool?',
    inner: 'What do I need to understand before I try this?',
  },
  '正印': {
    career: 'Imagine finishing your task, then spending the rest of the day answering questions about how to use it.',
    business: 'Imagine a finished order turning into ongoing support with no agreed ending.',
    year: 'Imagine asking several trusted people for advice, then finding it harder to choose your own next step.',
    question: 'What support is included, and when will the handover be complete?',
    customer: 'How much follow-up is included, and what will you handle after the handover?',
    inner: 'What help is needed, and when does it end?',
  },
}
SITUATIONS['七殺'] = SITUATIONS['偏官']

const STYLE: Record<string, { say: string; daily: string; social: string }> = {
  '甲': { say: 'I want to keep the goal, but I can change the way we reach it.', daily: 'Imagine keeping the same plan after a delay leaves too little time to finish it.', social: 'Imagine arranging a group plan, then hearing an idea that changes the route you had chosen.' },
  '乙': { say: 'I can change this part. I still need to keep time for my own task.', daily: 'Imagine adjusting your day for several small requests until your own plan disappears.', social: 'Imagine a group changing its plan again, while you have a need you have not yet mentioned.' },
  '丙': { say: 'I can help with the start. After that, I need time when I am not answering messages.', daily: 'Imagine answering messages between every task until there is no quiet time left.', social: 'Imagine getting everyone excited about a plan, then becoming the person who handles every reply.' },
  '丁': { say: 'I can give this careful attention. Let us agree when it needs to be finished.', daily: 'Imagine rewriting a short message several times after it already says what you mean.', social: 'Imagine choosing a thoughtful detail for someone, then worrying about whether it is quite right.' },
  '戊': { say: 'I can take care of this part. Who can share the next step?', daily: 'Imagine solving one practical problem, then silently taking over the tasks left behind it.', social: 'Imagine a shared plan going wrong and being the first person to fill every gap.' },
  '己': { say: 'I can help after I finish the time I have set aside for my own work.', daily: 'Imagine tidying several small jobs for other people while your own next step keeps waiting.', social: 'Imagine noticing what everyone needs, then reaching the end of the day without starting your own plan.' },
  '庚': { say: 'This detail matters because it affects the result. How does your method handle it?', daily: 'Imagine correcting a small mistake before hearing why the other person chose that method.', social: 'Imagine wanting a clear group decision while another person still wants to explain a concern.' },
  '辛': { say: 'Let us choose the few details that matter, then make the next decision.', daily: 'Imagine checking a nearly finished task again instead of sending it for useful feedback.', social: 'Imagine comparing several good options until a simple shared plan becomes difficult to settle.' },
  '壬': { say: 'I can see a few routes. Let us choose one to try before opening another.', daily: 'Imagine starting a new idea while the small test you began yesterday is still unfinished.', social: 'Imagine offering several ideas when the group needs one clear next step.' },
  '癸': { say: 'I need a little time to think. I will tell you my answer when we return to this.', daily: 'Imagine noticing a problem, but keeping your thought private while the task moves ahead.', social: 'Imagine listening through a shared decision without saying which part does not work for you.' },
}

const REQUEST: Record<string, string> = {
  '子': 'Could we talk for a few minutes before we choose the plan?',
  '丑': 'Could we choose a simple time and place that we can both keep?',
  '寅': 'Could we each suggest an idea before one of us decides?',
  '卯': 'Could I say what would work for me, then hear your answer?',
  '辰': 'Could we each take one part of arranging our time together?',
  '巳': 'Could we have a little time together without other messages or tasks?',
  '午': 'Could we plan time together and leave some time for our own interests?',
  '未': 'Could you listen first, then ask whether I would like a suggestion?',
  '申': 'Could we talk about how this felt before deciding how to fix it?',
  '酉': 'Could we each choose one detail that would make the plan enjoyable?',
  '戌': 'Could we agree one small promise and update each other if it changes?',
  '亥': 'Could I explain one feeling without needing to settle everything straight away?',
}


const WORK_CHECK: Record<string, string> = {
  '甲': 'Keep the main result clear. Be willing to change how you reach it.',
  '乙': 'Name one part you can change and one condition you need to keep.',
  '丙': 'Agree when you will be available and who can handle the other messages.',
  '丁': 'Choose a time to finish checking and give an answer.',
  '戊': 'Keep the work you agreed to own. Ask who will share the rest.',
  '己': 'Set aside time for your agreed task before adding another.',
  '庚': 'Explain the standard that matters, then hear the other person’s reason.',
  '辛': 'Pick three conditions that matter most. Stop comparing when those questions have clear answers.',
  '壬': 'Compare the options against one clear aim. Choose one small next step.',
  '癸': 'Ask for time to think, and agree when you will give your answer.',
}
const RELATIONSHIP_CHECK: Record<string, string> = {
  '甲': 'Ask whether you can keep the shared aim while changing the plan.',
  '乙': 'Name one preference you can change and one you want to keep.',
  '丙': 'Agree on time together and time when neither person needs to reply.',
  '丁': 'Say what matters without waiting for perfect words.',
  '戊': 'Ask which part of the plan each person will handle.',
  '己': 'Include your own request before offering more help.',
  '庚': 'Explain why the detail matters, then ask for the other person’s view.',
  '辛': 'Choose one detail that matters rather than checking the whole plan again.',
  '壬': 'Offer one idea first, then hear the other person’s preference.',
  '癸': 'Say what you need before quiet is taken as agreement.',
}
const YEAR_REPLY: Record<string, string> = {
  '比肩': 'I want to choose the goal myself. I would still welcome help with one part.',
  '劫財': 'I would like to join in. First, can we agree what time or cost each person will share?',
  '食神': 'Could I begin with one short session that I can enjoy this week?',
  '傷官': 'Could I explain what I would change, then hear what you want to keep?',
  '正財': 'Before I add this, I want to check the promises that already repeat each month.',
  '偏財': 'I am interested. Could we check the time and full cost before I agree?',
  '偏官': 'I can give this attention. Which part truly needs an answer now?',
  '正官': 'Could we say clearly what each person is agreeing to?',
  '偏印': 'I have a few ideas. I want to try one small step before collecting more.',
  '正印': 'Thank you for the advice. I want to choose one step and try it myself.',
}
const YEAR_CHECK: Record<string, string> = {
  '比肩': 'Which part of this choice do I want to make myself?',
  '劫財': 'What would a fair share of time or cost look like?',
  '食神': 'What is one small step I could enjoy or use?',
  '傷官': 'Have I heard the other person’s reason before suggesting a change?',
  '正財': 'What will this ask of me each week?',
  '偏財': 'What do I know about the time and cost, and what am I assuming?',
  '偏官': 'What truly needs an answer now?',
  '正官': 'What have we agreed, and what are we still guessing?',
  '偏印': 'What do I need to understand before trying one small step?',
  '正印': 'What help would let me take the next step myself?',
}
YEAR_REPLY['七殺'] = YEAR_REPLY['偏官']
YEAR_CHECK['七殺'] = YEAR_CHECK['偏官']

const dayFact = (r: SajuResult, name = '') => `${name}birth-day pillar ${r.pillars[1].pillar.ganzi}.`
const monthFact = (r: SajuResult) => `Birth-month pillar ${r.pillars[2].pillar.ganzi}: ${r.pillars[2].stemSipsin} / ${r.pillars[2].branchSipsin}.`

export function workExample(r: SajuResult, kind: 'career' | 'business'): EverydayExample {
  const [, day, month] = r.pillars
  const outer = SITUATIONS[month.stemSipsin]
  const inner = SITUATIONS[month.branchSipsin]
  return {
    scene: outer[kind],
    response: outer[kind === 'career' ? 'question' : 'customer'],
    check: `${month.stemSipsin === month.branchSipsin ? 'This theme repeats in both parts of your birth month.' : `Before agreeing, ask: “${inner.inner}”`} ${WORK_CHECK[day.pillar.stem]} Check the actual ${kind === 'career' ? 'role and workload' : 'customer brief and delivery time'}.`,
    basis: `${month.stemSipsin === month.branchSipsin ? `Both parts of your birth month repeat ${WORK_PROFILES[month.stemSipsin].theme}.` : `Your main birth-month theme is ${WORK_PROFILES[month.stemSipsin].theme}. The second theme is ${WORK_PROFILES[month.branchSipsin].theme}.`} Your birth-day style values ${PERSONAL_PROFILES[day.pillar.stem].focus}.`,
    facts: [dayFact(r), monthFact(r)],
  }
}

export function everydayExample(r: SajuResult, kind: 'personality' | 'wellbeing'): EverydayExample {
  const [, day, month] = r.pillars
  const style = STYLE[day.pillar.stem]
  return {
    scene: kind === 'personality' ? style.social : style.daily,
    response: style.say,
    check: kind === 'personality'
      ? `Ask one more question: “${SITUATIONS[month.branchSipsin].inner}” Notice whether your reply protects your own need and leaves room for another person.`
      : `If you want support, try: “${REQUEST[day.pillar.branch]}” Notice whether the task has a clearer ending after this conversation.`,
    basis: `Your birth-day style points to ${PERSONAL_PROFILES[day.pillar.stem].focus}. ${kind === 'personality' ? `The second birth-month theme adds ${WORK_PROFILES[month.branchSipsin].theme}.` : `Your relationship theme adds a need for ${RELATIONSHIP_PROFILES[day.pillar.branch].need}.`}`,
    facts: [dayFact(r), ...(kind === 'personality' ? [monthFact(r)] : [])],
  }
}

export function relationshipExample(r: SajuResult): EverydayExample {
  const [, day] = r.pillars
  return {
    scene: 'Imagine that a plan for time together changes at the last moment. You want to explain what matters without guessing the other person’s reason.',
    response: REQUEST[day.pillar.branch],
    check: RELATIONSHIP_CHECK[day.pillar.stem] + ' Listen for the other person’s own request before agreeing on the next step.',
    basis: `Your birth-day style points to ${PERSONAL_PROFILES[day.pillar.stem].focus}. Its relationship theme values ${RELATIONSHIP_PROFILES[day.pillar.branch].need}. These two parts shape the suggested conversation.`,
    facts: [dayFact(r)],
  }
}

export function compatibilityExample(a: SajuResult, b: SajuResult): EverydayExample {
  const dayA = a.pillars[1].pillar
  const dayB = b.pillars[1].pillar
  const aToB = getRelation(dayA.stem, dayB.stem)!.hanja
  const bToA = getRelation(dayB.stem, dayA.stem)!.hanja
  return {
    scene: 'Imagine that an evening plan changes and each person wants a different response. Give both people a turn to say what would help.',
    response: `Person A: “${REQUEST[dayA.branch]}” Person B: “${REQUEST[dayB.branch]}”`,
    check: dayA.stem === dayB.stem
      ? 'The starting styles share a symbol. Still ask for two separate answers; similar words can carry different needs.'
      : `For Person A: ${RELATIONSHIP_CHECK[dayA.stem]} For Person B: ${RELATIONSHIP_CHECK[dayB.stem]}`,
    basis: `Person A’s relationship theme values ${RELATIONSHIP_PROFILES[dayA.branch].need}. Person B’s values ${RELATIONSHIP_PROFILES[dayB.branch].need}. The comparison also checks each birth-day style from the other person’s side.`,
    facts: [dayFact(a, 'Person A: '), dayFact(b, 'Person B: '), `A → B: ${aToB}. B → A: ${bToA}.`],
  }
}

export function annualExample(r: SajuResult, year: number, god: string, innerGod: string, pillar: string): EverydayExample {
  return {
    scene: SITUATIONS[god].year,
    response: YEAR_REPLY[god],
    check: `For ${year}, ask: “${YEAR_CHECK[innerGod]}” Try it with one personal plan. Keep the step small enough to review.`,
    basis: `Your birth-day symbol is the reference for both yearly themes. The main yearly theme is ${WORK_PROFILES[god].theme}. The second adds ${WORK_PROFILES[innerGod].theme}.`,
    facts: [dayFact(r), `Annual reference ${year}-07-15, 12:00 Asia/Seoul: ${pillar}; ${god} / ${innerGod}.`],
  }
}

export function monthlySituation(god: string, innerGod: string) {
  return { scene: SITUATIONS[god].year, question: YEAR_CHECK[innerGod] }
}

export function moneyExample(r: SajuResult, steady: boolean, opportunity: boolean): EverydayExample {
  const [, day, month] = r.pillars
  return {
    scene: steady && opportunity
      ? 'Imagine an extra project arriving beside your regular work. The extra payment sounds useful, but it also needs evenings you have already promised elsewhere.'
      : opportunity
        ? 'Imagine an appealing offer with a clear first payment, but no clear answer about the work and costs that follow.'
        : steady
          ? 'Imagine a small regular payment continuing after you have stopped using what it pays for.'
          : 'Imagine choosing between two commitments. Neither has a clear total cost until you include the time and follow-up.',
    response: 'What is the full cost, what time does it need, and what have I already promised?',
    check: `Your work theme adds another check: “${SITUATIONS[month.branchSipsin].inner}” ${WORK_CHECK[day.pillar.stem]}`,
    basis: `The checked visible money themes are ${steady && opportunity ? 'both regular commitments and new opportunities' : steady ? 'regular commitments' : opportunity ? 'new opportunities' : 'not clearly present'}. Your second birth-month theme adds ${WORK_PROFILES[month.branchSipsin].theme}. This is not an estimate of earnings or ability.`,
    facts: [dayFact(r), monthFact(r), `Checked visible money themes: 正財 ${steady ? 'present' : 'not present'}; 偏財 ${opportunity ? 'present' : 'not present'}.`],
  }
}

export function everydayExampleText(example: EverydayExample, includeScene = true): string[] {
  return ['An everyday example to try', ...(includeScene ? [example.scene] : []), 'A response to try: ' + example.response,
    'What to notice: ' + example.check, 'Why this example: ' + example.basis, ...example.facts]
}
