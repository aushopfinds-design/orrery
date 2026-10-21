import { buildPairDecisionFocus } from './decision-focus.ts'
import { buildReportApplications } from './report-applications.ts'
import type { SajuResult } from '@orrery/core/types'
import { getRelation, analyzePillarRelations } from '@orrery/core/pillars'
import { chapter, chartContext, commonMethod, finishReading, moneyMarkers, pairFacts, pillarFact, subject, validateYear } from './category-shared.ts'
import { PAIR_LENSES } from './category-profiles.ts'
import type { ReadingGuidance } from './reading-profiles.ts'
import { buildReportExtras } from './report-extras.ts'
import { CLOSENESS_PROMPTS } from './reading-scenarios.ts'
import { compatibilityExample } from './personal-examples.ts'

export function buildCompatibilityReading(first: SajuResult, second: SajuResult, referenceYear = new Date().getFullYear()) {
  validateYear(referenceYear, first)
  validateYear(referenceYear, second)
  const decision = buildPairDecisionFocus(first, second)
  const a = chartContext(first)
  const b = chartContext(second)
  const aToB = getRelation(a.day.pillar.stem, b.day.pillar.stem)!.hanja
  const bToA = getRelation(b.day.pillar.stem, a.day.pillar.stem)!.hanja
  const lensA = PAIR_LENSES[aToB]
  const lensB = PAIR_LENSES[bToA]
  const dayPair = analyzePillarRelations(a.day.pillar.ganzi, b.day.pillar.ganzi)
  const hasClash = [...dayPair.stem, ...dayPair.branch].some(item => item.type === '沖')
  const hasCombine = [...dayPair.stem, ...dayPair.branch].some(item => item.type === '合')
  const crossFacts = a.available.flatMap(left => b.available.flatMap(right => pairFacts(left.pillar.pillar.ganzi, right.pillar.pillar.ganzi, `Person A ${['hour', 'day', 'month', 'year'][left.index]} / Person B ${['hour', 'day', 'month', 'year'][right.index]}`)))
  const moneyA = moneyMarkers(first)
  const moneyB = moneyMarkers(second)
  const shared = (keepClose: string[], watchFor: string[]): ReadingGuidance => ({ keepClose, watchFor })
  const personalGuidance = shared([`Person A: ${a.personal.keepClose[0]}`, `Person B: ${b.personal.keepClose[0]}`], [`Person A: ${a.personal.watchFor[0]}`, `Person B: ${b.personal.watchFor[0]}`])
  const loveGuidance = shared([`Person A: ${a.relationship.keepClose[0]}`, `Person B: ${b.relationship.keepClose[0]}`], [`Person A: ${a.relationship.watchFor[0]}`, `Person B: ${b.relationship.watchFor[0]}`])
  return finishReading({
    focus: decision, kind: 'compatibility', title: 'Love Compatibility', referenceYear,
    applications: buildReportApplications('compatibility', first, { second }),
    extras: buildReportExtras('compatibility', first, { second }),
    headline: decision.headline,
    subjects: [subject(first, 'Person A'), subject(second, 'Person B')],
    summary: [{ label: 'How Person A tends to begin', text: a.personal.headline }, { label: 'How Person B tends to begin', text: b.personal.headline }, { label: 'How it can feel from each side', text: `${lensA.theme} · ${lensB.theme}` }],
    chapters: [
      chapter('two-styles', "How You Each Make a Choice", "Imagine making plans for a weekend together. One person wants an answer now; the other wants to talk through a few possibilities first.", [
        "Both may want a good weekend. The tension can come from how each person reaches a decision, rather than from how much they care about spending time together.",
        `Person A’s birth-day symbol is pictured as ${a.personal.image}. The reading connects that image with **${a.personal.focus}**. Ask Person A whether it sounds like the way they approach a decision.`,
        `Person B’s symbol is pictured as ${b.personal.image}, which is used here to explore **${b.personal.focus}**. Let Person B explain what fits and what does not, even if their answer surprises you.`,
        `The reading suggests Person A may appreciate **${a.personal.need}**, while Person B may appreciate **${b.personal.need}**. These are ideas to discuss, not answers either person has to accept.`,
        a.day.pillar.stem === b.day.pillar.stem ? "Your birth-day symbols match, so the descriptions may sound familiar to both of you. You can still want different things and have different reasons for wanting them." : "Your birth-day symbols are different. Let that open a question about how each person thinks, rather than deciding that one way is better or more caring.",
        'For example, one person may want to settle a plan while another wants more time to explain a concern. **Agree what needs deciding today** and which part can stay open.',
      ], [pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B')], 'Take turns saying something you wish the other person understood. Let the first answer finish before explaining your own view.', personalGuidance, 'personality'),
      chapter('two-directions', 'How the Connection Looks from Each Side', "Imagine offering a suggestion you mean as encouragement, then hearing that it felt like criticism.", [
        "The same sentence can land differently from each side. Explaining your intention matters, but so does hearing what the other person actually took from it.",
        `Comparing the birth-day symbols from Person A’s side gives this reading an idea about **${lensA.theme}**. ${lensA.meaning}`,
        `Looking at the same comparison from Person B’s side gives **${lensB.theme}**. ${lensB.meaning}`,
        `For Person A, something to try is: **${lensA.balance}**`,
        `For Person B’s side, try this balance: **${lensB.balance}**`,
        aToB === bToA ? 'Both directions use the same traditional theme. Ask whether both people experience it in the same way. A shared label is a starting question, not a shared answer.' : 'The two labels differ because the reference person changes. Neither direction is a score, and neither tells us who cares more.',
        'Choose a recent, ordinary moment when you missed each other’s meaning. Ask what each person intended and what the other heard. **Compare the two explanations before choosing a solution.**',
      ], [`A → B: ${a.day.pillar.stem} comparing ${b.day.pillar.stem} = ${aToB}.`, `B → A: ${b.day.pillar.stem} comparing ${a.day.pillar.stem} = ${bToA}.`], `Take turns asking: “${lensA.question}” Then: “${lensB.question}”`, shared(['Time for each person to describe the same situation.', 'A distinction between what was intended and what was heard.'], ['Using one person’s explanation as the whole story.', 'Turning a traditional comparison into a measure of love.']), 'patterns', compatibilityExample(first, second)),
      chapter('close-conversation', 'Closeness and Everyday Conversation', "Imagine one of you coming home upset. The other starts solving the problem before the story is finished.", [
        "An answer can be a way of showing care. Listening can be another. Either person may feel missed when they expect the other to recognise the kind of care they wanted.",
        `Person A’s close-relationship theme is **${a.relationship.need}**. A conversation may work better when that need is stated directly.`,
        `Person B’s theme is **${b.relationship.need}**. Make room for both needs instead of assuming that your own preferred response will help everyone.`,
        `Person A could say: **“${a.relationship.words}”** Person B can answer what fits and what needs changing.`,
        `Person B could say: **“${b.relationship.words}”** Person A can listen before offering an explanation or a fix.`,
        `**An idea to try with Person A:** ${CLOSENESS_PROMPTS[a.day.pillar.branch]} Ask whether this feels like care to them before making it a regular ritual.`,
        `**An idea to try with Person B:** ${CLOSENESS_PROMPTS[b.day.pillar.branch]} If the ideas differ, give both a turn rather than making one person’s preference the rule.`,
        'Try this with a small situation, such as a changed plan or a difficult day. **Ask whether the person wants company, an idea or practical help.** You can care without guessing which one they need.',
      ], [pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B')], 'Plan one small moment of connection. Each person chooses a detail that matters to them, then names one thing they appreciated afterwards.', loveGuidance, 'love'),
      chapter('shared-routine', 'Sharing the Practical Work', "Imagine planning a trip together. One person makes the booking, but nobody checks the details or follows up when the plan changes.", [
        "Doing the visible job can feel like doing your share, while the less visible work keeps landing on someone else. That difference is easier to discuss when you name the actual tasks.",
        `Person A’s working theme is **${a.work.theme}**. That points to a preference for ${a.work.setting}. Consider how this appears in shared planning or practical tasks.`,
        `Person B’s theme is **${b.work.theme}**. Their suggested way of working includes ${b.work.setting}. You can do things differently and still finish the job together.`,
        a.month.stemSipsin === b.month.stemSipsin ? "The birth-month readings bring up the same idea. You may both reach for the same job. Say who is doing it, so neither of you is doing it twice while another task is missed." : "The birth-month readings bring up different ideas. Ask which jobs each person actually enjoys. A chart label does not mean someone has to keep doing the same job forever.",
        `Person A may find it difficult when they are **${a.work.friction}**. For Person B, that may mean **${b.work.friction}**. Choose a division that avoids adding unnecessary pressure to either side.`,
        'For example, planning a trip includes choosing, booking, checking details and following up. **Write down who will do each part.** Review the plan if someone’s available time changes.',
      ], [pillarFact(first, 2, 'Person A'), pillarFact(second, 2, 'Person B')], 'Choose one shared task. Agree the owner, the deadline and the support each person can ask for.', shared([`Person A: ${a.work.keepClose[0]}`, `Person B: ${b.work.keepClose[0]}`], ['Treating an agreed role as permanent when circumstances change.', 'Taking over a task without checking whether help is wanted.']), 'social'),
      chapter('shared-money', 'Money, Promises and Fair Agreements', "Imagine one person paying for something and later calling it a loan, while the other thought it was a gift.", [
        "The uncomfortable part may be the expectation attached to the money. Saying what the payment means before it is made can protect both people from a very different conversation later.",
        `The money-related symbols checked for Person A are used to explore **${moneyA.theme}**. For Person B, the reading explores **${moneyB.theme}**. Do either of those descriptions help explain how you think about a cost you share?`,
        'Before sharing a cost, agree how much each person is comfortable contributing. Include the time and work around the choice, as well as the amount paid.',
        'A gift, loan and shared expense have different expectations. **Name which one you mean.** If the agreement is unclear, clear it up before adding another promise.',
        "A small regular cost may feel different from a one-off purchase. Discuss how often the cost repeats and when you will review it. You still need to ask what each person can comfortably pay.",
        "A fair share does not have to be the same amount. A useful agreement is understood by both people and can be discussed again when income, time or responsibilities change.",
      ], [...moneyA.facts.map(fact => 'Person A: ' + fact), ...moneyB.facts.map(fact => 'Person B: ' + fact)], 'Choose one shared cost. Write the amount, each person’s part and the date you will review the agreement.', shared(['Clear descriptions of gifts, loans and shared costs.', 'An agreement both people can explain in the same words.'], ['Assuming silence means someone accepts a financial promise.', 'Using a chart theme to judge someone’s financial worth.']), 'money'),
      chapter('chart-patterns', 'Where the Charts Meet', "Imagine returning to the same disagreement even after both people think they have explained their side.", [
        "You may be trying to settle different questions: one about the decision itself, another about how it is being discussed. Separating those questions can make the conversation less circular.",
        hasClash ? 'The two calculated birth-day pillars contain a clash pattern. This reading uses that image to explore needs that pull in different directions; it does not predict conflict.' : hasCombine ? 'The two calculated birth-day pillars contain a combination pattern. This reading uses that image to explore cooperation, without assuming that agreement comes easily.' : 'No direct combination or clash appears between the two birth-day pillars in the checked tables. That is a calculation result, not a grade for the relationship.',
        'This chapter compares the actual symbols in both charts. A recorded pattern is a traditional category. It does not tell us what happened between you or what will happen next.',
        hasClash ? 'If the image of two needs pulling apart fits a real conversation, ask whether you are discussing the same decision. One person may be answering a question the other did not mean to ask.' : 'If cooperation feels easy in one setting, name what makes it work. A useful habit can be repeated even when the next decision is harder.',
        'Other comparisons include the available birth-year, month, day and hour symbols. **An unknown birth hour is left out completely.** It is not replaced by a guessed relationship reading.',
        'For an ordinary disagreement, separate the topic from the way you are talking. Decide whether the issue needs a choice, more information or simply a calmer time to return.',
        'The chart notes show which symbols were compared. What happens between you matters more than the label given to that comparison. A symbol cannot decide whether a relationship is safe or right for you.',
      ], [...pairFacts(a.day.pillar.ganzi, b.day.pillar.ganzi, 'Birth-day comparison'), ...crossFacts], 'Say which part you already agree on. Then choose a time to talk about the part that still matters to one of you.', shared(['Specific examples of when cooperation works.', 'A pause with an agreed time to return.'], ['Calling a person a bad match because of one symbol.', 'Using a combination as a reason to ignore a real concern.']), 'patterns'),
      chapter('support-each-other', 'Support without Taking Over', "Imagine helping someone with a personal project, then realising you have begun making decisions they wanted to make themselves.", [
        "Taking something off their hands may feel generous. It stops feeling helpful if the person loses a say in the result, so the kind and the limit of the help both matter.",
        `Person A’s wider-group theme is **${a.group.theme}**. Person B’s is **${b.group.theme}**. Think about whether either of you takes that role with friends or family, and whether you still want it when you are at home.`,
        "The way you help in a group may not be the way you want to be treated at home. Ask whether the person wants advice, reassurance or help with one specific job.",
        `For Person A, a useful starting habit is: **${a.personal.practice}** Make room for that step without treating it as a demand the other person must carry.`,
        `For Person B, the suggested step is: **${b.personal.practice}** Ask what support would make it easier and what they would prefer to do themselves.`,
        'For example, encouragement can mean listening to a draft, taking a practical task for a day or leaving someone uninterrupted. **Agree on the kind of help and when it ends.**',
      ], [pillarFact(first, 3, 'Person A'), pillarFact(second, 3, 'Person B'), pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B')], 'Ask for the help you would welcome, and say which part you still want to do yourself.', shared(['An explicit request for help and permission to ask for a different kind.', 'A clear ending to the task one person is helping with.'], ['Turning help into control over the other person’s decision.', 'Assuming the role someone takes in a group is what they need at home.']), 'support'),
      chapter('shared-week', 'A Seven-Day Plan for Both of You', "Imagine having a useful conversation, then finding a week later that the same misunderstanding has returned.", [
        "Understanding each other once does not automatically change a familiar routine. A small agreement you both remember can be more useful than trying to solve every relationship issue in one evening.",
        'In the first two days, each person describes one ordinary moment when they felt understood. Name the words or actions that helped, rather than asking the other person to guess.',
        `In the next conversation, make room for Person A’s need for **${a.relationship.need}** and Person B’s need for **${b.relationship.need}**. Both people get time to answer.`,
        'Choose one practical task or shared cost. Write down who will do each part, what help can be requested and when the agreement will be reviewed.',
        `For the week’s personal steps, Person A can try: **${a.personal.practice}** Person B can try: **${b.personal.practice}** Each person gets to decide what they want to try.`,
        "At the end of the week, ask what helped and what did not fit. **Keep a useful agreement, change an unhelpful one and leave room for another answer.** The reading can start a conversation. You still get to decide what works between you.",
      ], [pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B'), `Two-way day-stem relationships: ${aToB} / ${bToA}.`], 'Talk again at the end of the week. Each person can say what helped and what they would like to do differently.', shared(['One example from each person of an agreement that helped.', 'A change either person can request at the seven-day review.'], ['Treating one week as a test of whether the entire relationship is right.', 'Keeping an agreement simply because it was the original plan.']), 'next-moves'),
    ], months: [],
    methodNotes: [...commonMethod(first, referenceYear), ...commonMethod(second, referenceYear).filter(note => /unknown birth time|time zone was provided|Birth longitude|^For /i.test(note)).map(note => 'Person B: ' + note), 'Two-way themes use each person’s day stem as a separate reference. Pair-pattern checks compare only the supplied pillars across the two charts.', 'All cross-chart pairs are shown in the notes without strength weights. There is no compatibility percentage, relationship ranking, marriage forecast or claim of psychological assessment.'],
  })
}
