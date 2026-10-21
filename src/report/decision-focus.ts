import type { SajuResult } from '@orrery/core/types'
import { getFourPillars, getRelation } from '@orrery/core/pillars'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES, WORK_PROFILES } from './reading-profiles.ts'
import { everydayExample, workExample, monthlySituation } from './personal-examples.ts'
import { TEN_GODS } from './reading.ts'
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
  'ownership/ownership': { title: 'Know which choices are yours', tension: "You may both want a say. It helps to know which choices you are making together." },
  'ownership/making': { title: 'Let someone try what you have made', tension: "You may want to do it your own way, while still needing someone else to try the result." },
  'ownership/resources': { title: 'Leave time for your own plans', tension: "A tempting offer may use the time you wanted for your own plan. Decide what would have to wait." },
  'ownership/responsibility': { title: 'Know what is needed and what you can decide', tension: 'You may be happy to answer for the result while still wanting a say in how to do the work.' },
  'ownership/learning': { title: 'Ask for help without giving up your choice', tension: "Advice can help without deciding for you. Ask about the part you are unsure of." },
  'making/making': { title: 'Let this version be finished', tension: "You may enjoy improving it and still struggle to send it. Let someone try the version you have." },
  'making/resources': { title: 'Count the work around the main job', tension: 'Making the thing may be enjoyable; the preparation and extra replies can take longer than you expect.' },
  'making/responsibility': { title: 'Ask what the finished work needs to do', tension: 'You may want to try a different approach and still need to know when the result is finished.' },
  'making/learning': { title: 'Try it and see where you need help', tension: "Learning more may help, but trying it once can show exactly what you still need to understand." },
  'resources/resources': { title: 'Look beyond the exciting beginning', tension: "The new plan has to fit beside things you already promised. Check what it will need after the exciting start." },
  'resources/responsibility': { title: 'Check that you have the time and help', tension: 'You may want to say yes before knowing whether you will have enough time or help.' },
  'resources/learning': { title: 'Know what you want to use it for', tension: 'Before getting another tool or course, ask what you need it to help you do.' },
  'responsibility/responsibility': { title: 'Notice when you are doing more than was asked', tension: "A job can grow when every extra request sounds urgent. Check what you first agreed before adding more." },
  'responsibility/learning': { title: 'You can be responsible and still ask for help', tension: "Being responsible does not mean knowing everything already. Ask for the explanation or practice you need." },
  'learning/learning': { title: 'Use an answer before looking for another', tension: "Looking for an answer can keep giving you more things to read. Choose a question you need answered, then try the answer before searching again." },
}

type Route = { action: string; pause: string; review: string }
const ROUTES: Record<SoloKind, Record<Family, Route>> = {
  "career": {
    "ownership": {
      "action": "Think of a job you are doing now. Ask which choices are yours to make and which ones you need to check with someone else.",
      "pause": "You are expected to answer for the result, but cannot make the decisions needed to finish it.",
      "review": "Could you get on with the job after that conversation, or were you still waiting for permission?"
    },
    "making": {
      "action": "Show someone a piece of work they can actually try. Ask what helped and where they got stuck.",
      "pause": "You are being asked to change it again without being told what is not working.",
      "review": "Which part of their answer gave you something useful to change?"
    },
    "resources": {
      "action": "Look at an actual job offer. Put the pay beside the hours, travel and extra jobs you would be agreeing to.",
      "pause": "The pay sounds good, but nobody can explain what a normal week would involve.",
      "review": "Did the work take the time you expected, or were there jobs nobody had mentioned?"
    },
    "responsibility": {
      "action": "When another task arrives, ask what should come first and what can wait. Say what help you would need to finish it.",
      "pause": "Everything is called urgent and nobody is deciding which deadline can move.",
      "review": "Did you know what to finish first, or did the priorities keep changing while you worked?"
    },
    "learning": {
      "action": "Try a skill on a real task before signing up for more training. Ask someone who knows the job to look at the result.",
      "pause": "You keep preparing but never get a chance to use what you have learned.",
      "review": "What could you do afterwards that you could not do before?"
    }
  },
  "business": {
    "ownership": {
      "action": "Talk through an actual order with anyone helping you. Agree who finishes the work and who answers if the customer asks for a change.",
      "pause": "Several people are involved, but each thinks someone else will answer the customer.",
      "review": "Did the customer know who to contact, and did that person have what they needed to help?"
    },
    "making": {
      "action": "Let a willing tester use a simple version of the offer. Watch where they need help instead of explaining every part in advance.",
      "pause": "You are adding features before anyone has tried the thing you first promised.",
      "review": "What could the tester do on their own, and where did they need you to step in?"
    },
    "resources": {
      "action": "Follow a customer order from the first message to the last reply. Count the preparation and changes as well as the time spent making it.",
      "pause": "The customer keeps asking for more while the price and deadline stay the same.",
      "review": "Which part took longer or cost more than you expected?"
    },
    "responsibility": {
      "action": "Before starting an order, send a short message saying what is included, when it will be ready and what you need from the customer.",
      "pause": "You have promised a deadline but are still waiting for something only the customer can provide.",
      "review": "Did you both recognise when the job was finished, or were you expecting different things?"
    },
    "learning": {
      "action": "Ask someone who might use the offer how they handle the problem now. Let them try a small example before you buy another tool.",
      "pause": "You know plenty about the possible audience but have not spoken to anyone who actually has the problem.",
      "review": "Which answer changed what you would offer, and what are you still guessing about?"
    }
  },
  "wellbeing": {
    "ownership": {
      "action": "Keep a little time for something you want to do. Tell the people affected when you will be available again.",
      "pause": "Another request would take the only time you had left for your own plans.",
      "review": "Did having that time make the day feel more like your own?"
    },
    "making": {
      "action": "Before beginning a familiar task, decide what it needs to do. When it does that, try leaving the smaller improvements for another day.",
      "pause": "You are still improving something after it has already done the job you needed.",
      "review": "Was the simpler version enough, and what did you do with the time you kept?"
    },
    "resources": {
      "action": "Look at a favour you keep doing. Include the reminders, getting ready and clearing up when you think about how much time it takes.",
      "pause": "You keep agreeing because each request sounds small, although the week is already full.",
      "review": "Was it manageable on an ordinary busy day, or only when everything went well?"
    },
    "responsibility": {
      "action": "For a regular task at home or work, agree who is doing it and when it can be left until tomorrow.",
      "pause": "A job becomes yours every time you happen to notice it first.",
      "review": "Did the task stay with the person who agreed to do it, or quietly come back to you?"
    },
    "learning": {
      "action": "Try changing a small part of a familiar routine. Notice what happens before looking for another set of tips.",
      "pause": "Reading about a better routine has become another job while the original problem stays the same.",
      "review": "Was the change easy enough to repeat when the day was busy?"
    }
  },
  "year": {
    "ownership": {
      "action": "Look at a plan you have for the year. Which parts are your choice, and which would need someone else to agree too?",
      "pause": "Your plan assumes another person wants the same pace or has the same time available.",
      "review": "Which part did you choose for yourself, and which part still needs a conversation?"
    },
    "making": {
      "action": "Take something you want to do this year and make the first version small enough to finish this month.",
      "pause": "The plan keeps getting bigger while the first thing you wanted to make is still unfinished.",
      "review": "What do you have now that you did not have before you tried?"
    },
    "resources": {
      "action": "Before adding another yearly plan, look at the money and time you have already promised elsewhere. Decide what would need to change.",
      "pause": "The new idea needs time or money already being used for something you still want to keep.",
      "review": "Which plans still matter enough to keep giving them space?"
    },
    "responsibility": {
      "action": "Talk about a responsibility you expect to carry this year. Agree what it includes and when you will look at it again.",
      "pause": "A new request is becoming a long-term job before anyone has asked what help you would need.",
      "review": "Did the arrangement still work after your circumstances changed?"
    },
    "learning": {
      "action": "Think of something you want to learn this year. Give yourself a chance to use it before deciding you need another course.",
      "pause": "Looking for another source keeps delaying something you already know enough to try.",
      "review": "Which idea helped with an actual decision, and which question can wait?"
    }
  },
  "complete": {
    "ownership": {
      "action": "Think about a decision that matters to you now. Say what you want to choose yourself and what you need to decide with someone else.",
      "pause": "Keeping control of every detail is making it hard to hear another useful way forward.",
      "review": "Could you keep what mattered to you while allowing a different way to get there?"
    },
    "making": {
      "action": "Let someone use a version of something you have been working on. Ask what it helped them do before polishing another detail.",
      "pause": "Another private revision would change very little about what the result can do.",
      "review": "What did you learn from someone using it that you did not notice by yourself?"
    },
    "resources": {
      "action": "Before accepting a tempting invitation or offer, picture an ordinary week after you have said yes. Where would it fit?",
      "pause": "The exciting beginning is hiding something you would have to keep doing every week.",
      "review": "Was it something you still wanted to give time to after the first excitement passed?"
    },
    "responsibility": {
      "action": "Look at a duty you keep taking on. What did you first agree to do, and which extra parts have appeared since?",
      "pause": "Being reliable has started to mean accepting more work without being asked what you can manage.",
      "review": "Did talking about it help you keep the promise without carrying every extra job too?"
    },
    "learning": {
      "action": "Try the best answer you already have on something small. You can change your mind after seeing how it goes.",
      "pause": "You are waiting to understand everything before letting yourself take any step at all.",
      "review": "What became clearer when you tried, and what do you still need to find out?"
    }
  }
}

const HEADLINES: Record<Exclude<SoloKind, 'complete'>, Record<Family, string>> = {
  career: {
    ownership: 'Look for a job where you can get on with the work',
    making: 'Show what you can do',
    resources: 'Look at the week behind the pay figure',
    responsibility: 'Ask what is expected and who can help',
    learning: 'Learn something you will actually use',
  },
  business: {
    ownership: 'Make sure someone is answering the customer',
    making: 'Let someone try the thing you want to sell',
    resources: 'Find out what an order really takes',
    responsibility: 'Say what the customer will receive',
    learning: 'Start with what the customer needs',
  },
  wellbeing: {
    ownership: 'Keep a little of the day for yourself',
    making: 'Let a useful job be done',
    resources: "See how the favour fits a normal week",
    responsibility: 'Noticing a job does not make it yours',
    learning: 'Try a change before collecting more advice',
  },
  year: {
    ownership: 'Decide which plans you want for yourself',
    making: 'Make a start you can actually finish',
    resources: 'See what would have to wait',
    responsibility: 'Talk about what you are agreeing to',
    learning: 'Use what you learn while you learn it',
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
  const scene = kind === 'career' || kind === 'business' ? workExample(result, kind).scene
    : kind === 'year' ? monthlySituation(primaryGod, secondaryGod).scene
    : everydayExample(result, kind === 'complete' ? 'personality' : 'wellbeing').scene
  const themes = `${annual ? 'In this year’s reading' : 'In your birth-month reading'}, the main theme is **${primary.theme}**. ${primaryGod === secondaryGod ? 'The same theme appears in both chart positions.' : `The second theme is **${secondary.theme}**.`}`
  return {
    headline: kind === 'complete' ? bridge.title : HEADLINES[kind][a],
    synthesis: `${scene} ${bridge.tension} ${themes}`,
    firstStep: first.action,
    pauseIf: second.pause,
    review: `${second.review} Did the plan leave room for **${PERSONAL_PROFILES[day.pillar.stem].need}**?`,
    evidence: [
      `Birth-day stem ${day.pillar.stem}: the day’s main stem, used here to describe your personal needs.`,
      annual ? `Annual reference ${referenceYear}-07-15 12:00 Asia/Seoul: ${annual}; stem relationship ${primaryGod}. Birth-month stem ${month.pillar.stem}: ${secondaryGod}.` : `Birth-month pillar ${month.pillar.ganzi}: stem relationship ${primaryGod} (${TEN_GODS[primaryGod].title}); main hidden-stem relationship ${secondaryGod} (${TEN_GODS[secondaryGod].title}).`,
      'These two chart relationships are read together to explore the choice above. The scene is an example, rather than an event known from your life.',
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
  "pause/pause": {
    "title": "Take a break without losing the conversation",
    "step": "If you both need a break, agree who will bring the conversation up again and when. You can each write down what you want the other to understand first.",
    "pause": "Both of you are waiting for the other to speak, and neither knows when that will happen.",
    "review": "Did you come back when you said you would, and could both people finish what they wanted to say?"
  },
  "pause/reliability": {
    "title": "Say when you will be ready to talk",
    "step": "One person can ask for thinking time while the other asks for a clear plan. Agree a time to talk and stick to it, even if part of the answer is still uncertain.",
    "pause": "Time to think is starting to feel like being left without an answer.",
    "review": "Did knowing when you would talk make the wait easier?"
  },
  "pause/voice": {
    "title": "Give a quiet answer time to arrive",
    "step": "Let each person say what they want without correcting the first answer. If someone is not ready, agree when to return rather than deciding for them.",
    "pause": "The quicker answer is becoming the plan before the other person has had a turn.",
    "review": "Could both people recognise their own wishes in what you decided?"
  },
  "pause/presence": {
    "title": "Being quiet does not have to mean being distant",
    "step": "Try saying, “I want to be with you, but I need a little time to think.” Agree whether quiet company or time alone would help, and when you will talk.",
    "pause": "A request for quiet is being heard as a wish not to be together.",
    "review": "Did the pause feel comfortable for both of you, or did something still need explaining?"
  },
  "pause/listening": {
    "title": "Say a little now, and come back to the rest",
    "step": "The quieter person can share what they know so far. The other can listen without filling in the gaps. Agree when to talk about anything still unfinished.",
    "pause": "One person is guessing what the silence means instead of asking.",
    "review": "Did you understand more after listening, without asking for an answer the person was not ready to give?"
  },
  "reliability/reliability": {
    "title": "Let a small promise matter",
    "step": "Agree to something you can both realistically do this week. Say how you will let each other know if the plan needs to change.",
    "pause": "A change of plan is becoming proof that someone does not care.",
    "review": "Were the promises kept, or were changes explained before someone was left waiting?"
  },
  "reliability/voice": {
    "title": "Make a plan without deciding for each other",
    "step": "Let each person name something that matters to them. Agree the parts you want to rely on, and leave room for a choice the other person would make differently.",
    "pause": "Keeping the plan is starting to mean that one person never gets a say.",
    "review": "Did the plan feel dependable while still leaving room for both people’s preferences?"
  },
  "reliability/presence": {
    "title": "Plan time together and time for yourselves",
    "step": "Choose some time you both want to spend together. Also talk about the separate plans each person wants to keep, rather than leaving them to be discovered later.",
    "pause": "Doing something separately is being treated as breaking an agreement you never discussed.",
    "review": "Could you count on the time together without feeling guilty about the time apart?"
  },
  "reliability/listening": {
    "title": "Ask what would actually help",
    "step": "Before doing something for the other person, say what you think they need and ask whether you have understood. Then agree what help they would welcome.",
    "pause": "Finishing a practical job is being used to end a conversation the other person still needs.",
    "review": "Did the help answer what they asked for, rather than what you assumed would be useful?"
  },
  "voice/voice": {
    "title": "Let both wishes change the plan",
    "step": "Each person can name a detail they care about. Look for a plan that includes something from both answers, rather than deciding whose wish is more sensible.",
    "pause": "The conversation is turning into a contest about who has the better reason.",
    "review": "Can each person name something in the plan that they actually chose?"
  },
  "voice/presence": {
    "title": "Enjoy being together without agreeing to everything",
    "step": "Choose something you both want to do, and let each person suggest a detail. You can be close without giving up every separate preference.",
    "pause": "One person keeps saying yes because disagreeing feels like spoiling the time together.",
    "review": "Did you both enjoy it, and could either person say what they would change next time?"
  },
  "voice/listening": {
    "title": "Hear the feeling before answering the request",
    "step": "Give each person time to explain how they feel. Then ask what they would like to happen. Listening kindly does not mean you have already agreed to everything being asked.",
    "pause": "One person thinks a kind response was a yes to something the other person never meant to promise.",
    "review": "Did you agree to the same thing, and was either person able to say no?"
  },
  "presence/presence": {
    "title": "Stay close while keeping your own plans",
    "step": "Make time for something you both enjoy this week. Give the separate things each person wants to do the same chance to be discussed.",
    "pause": "One person is cancelling a personal plan because explaining it feels harder than giving it up.",
    "review": "Could you enjoy being together without either person losing the separate plan they wanted?"
  },
  "presence/listening": {
    "title": "Ask what kind of company feels right today",
    "step": "Offer to listen, spend quiet time together or help with a practical task. Let the person say which one they want before making the plan.",
    "pause": "Being together is being offered as the answer when the person has asked for something else.",
    "review": "Did the time together give them the kind of support they wanted?"
  },
  "listening/listening": {
    "title": "Hear both stories before trying to fix either",
    "step": "Take turns talking without interruptions. Before giving advice, say what you think the other person meant and ask whether you have it right.",
    "pause": "You are both preparing advice while the other person is still speaking.",
    "review": "Did each person feel understood, and is there still something practical you need to decide?"
  }
}

export function buildPairDecisionFocus(first: SajuResult, second: SajuResult): DecisionFocus {
  const a = first.pillars[1].pillar, b = second.pillars[1].pillar
  const protocol = CONVERSATIONS[pairKey(CARE[a.branch], CARE[b.branch], CARE_ORDER)]
  if (!protocol) throw new Error('Two valid relationship themes are needed for a shared decision focus')
  return {
    headline: protocol.title,
    synthesis: `Imagine a conversation where you both want to help, but each expects a different response. This reading uses the lower symbol in each birth-day pillar to explore care. Person A’s theme asks for **${RELATIONSHIP_PROFILES[a.branch].need}**. Person B’s asks for **${RELATIONSHIP_PROFILES[b.branch].need}**. ${a.branch === b.branch ? 'A matching symbol still leaves two people free to want different things in the same moment.' : 'Try the following format only if both people recognise these needs.'}`,
    firstStep: protocol.step,
    pauseIf: protocol.pause,
    review: protocol.review,
    evidence: [`Person A day pillar ${a.ganzi}; relationship branch ${a.branch}.`, `Person B day pillar ${b.ganzi}; relationship branch ${b.branch}.`, `Person A: ${CARE_STEP[CARE[a.branch]]} Person B: ${CARE_STEP[CARE[b.branch]]}`, 'These conversation formats are editorial groupings of the stated relationship themes, not additional traditional match categories or relationship scores.'],
  }
}

export function decisionFocusText(focus: DecisionFocus): string {
  return ['Your focus, in plain English', focus.headline, focus.synthesis, 'Try first: ' + focus.firstStep, 'Pause and clarify if: ' + focus.pauseIf, 'Review after the attempt: ' + focus.review, 'Why this focus: ' + focus.evidence.join(' ')].join('\n\n')
}
