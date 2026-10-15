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
    kind: 'compatibility', title: 'Love Compatibility', referenceYear,
    applications: buildReportApplications('compatibility', first, { second }),
    extras: buildReportExtras('compatibility', first, { second }),
    headline: 'How you show care, make room for each other and find your way through differences.',
    subjects: [subject(first, 'Person A'), subject(second, 'Person B')],
    summary: [{ label: 'Person A’s starting style', text: a.personal.headline }, { label: 'Person B’s starting style', text: b.personal.headline }, { label: 'Your two-way connection', text: `${lensA.theme} · ${lensB.theme}` }],
    chapters: [
      chapter('two-styles', 'Two People, Two Starting Styles', '**Begin by making room for both people.** A shared relationship does not require an identical way of thinking.', [
        `Person A’s starting image is ${a.personal.image}. It points to **${a.personal.focus}**. In an ordinary decision, notice whether this image fits the way Person A begins.`,
        `Person B’s image is ${b.personal.image}. Its theme is **${b.personal.focus}**. Give Person B a chance to explain their approach before assuming it follows the same rules.`,
        `Person A’s suggested need is **${a.personal.need}**. Person B’s is **${b.personal.need}**. Read those needs aloud and ask each person which part feels useful.`,
        a.day.pillar.stem === b.day.pillar.stem ? 'The starting symbols match. That can make the images feel familiar. It does not mean your histories, opinions or priorities are identical.' : 'The starting symbols differ. Use that difference to ask a better question, rather than deciding that one approach is more caring or sensible.',
        'For example, one person may want to settle a plan while another wants more time to explain a concern. **Agree what needs deciding today** and which part can stay open.',
      ], [pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B')], 'Each person names one need they would like the other to understand. Listen without correcting the first answer.', personalGuidance, 'personality'),
      chapter('two-directions', 'How the Connection Looks from Each Side', '**The comparison has two directions.** What one person brings to a connection may be received differently from the other side.', [
        `Using Person A’s starting symbol as the reference, this chart comparison brings **${lensA.theme}** into focus. ${lensA.meaning}`,
        `Using Person B’s symbol as the reference, the theme is **${lensB.theme}**. ${lensB.meaning}`,
        `For Person A’s side, try this balance: **${lensA.balance}**`,
        `For Person B’s side, try this balance: **${lensB.balance}**`,
        aToB === bToA ? 'Both directions use the same traditional theme. Ask whether both people experience it in the same way. A shared label is a starting question, not a shared answer.' : 'The two labels differ because the reference person changes. Neither direction is a score, and neither tells us who cares more.',
        'Choose a recent, ordinary moment when you missed each other’s meaning. Ask what each person intended and what the other heard. **Compare the two explanations before choosing a solution.**',
      ], [`A → B: ${a.day.pillar.stem} comparing ${b.day.pillar.stem} = ${aToB}.`, `B → A: ${b.day.pillar.stem} comparing ${a.day.pillar.stem} = ${bToA}.`], `Take turns asking: “${lensA.question}” Then: “${lensB.question}”`, shared(['Time for each person to describe the same situation.', 'A distinction between what was intended and what was heard.'], ['Using one person’s explanation as the whole story.', 'Turning a traditional comparison into a measure of love.']), 'patterns', compatibilityExample(first, second)),
      chapter('close-conversation', 'Closeness and Everyday Conversation', '**Ask what kind of care is wanted.** A useful response begins with listening to the other person’s actual need.', [
        `Person A’s close-relationship theme is **${a.relationship.need}**. A conversation may work better when that need is stated directly.`,
        `Person B’s theme is **${b.relationship.need}**. Make room for both needs instead of assuming that your own preferred response will help everyone.`,
        `Person A could say: **“${a.relationship.words}”** Person B can answer what fits and what needs changing.`,
        `Person B could say: **“${b.relationship.words}”** Person A can listen before offering an explanation or a fix.`,
        `**An idea to try with Person A:** ${CLOSENESS_PROMPTS[a.day.pillar.branch]} Ask whether this feels like care to them before making it a regular ritual.`,
        `**An idea to try with Person B:** ${CLOSENESS_PROMPTS[b.day.pillar.branch]} If the ideas differ, give both a turn rather than making one person’s preference the rule.`,
        'Try this with a small situation, such as a changed plan or a difficult day. **Ask whether the person wants company, an idea or practical help.** You can care without guessing which one they need.',
      ], [pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B')], 'Plan one small moment of connection. Each person chooses a detail that matters to them, then names one thing they appreciated afterwards.', loveGuidance, 'love'),
      chapter('shared-routine', 'Sharing the Practical Work', '**Make the division of work visible.** A familiar routine is easier to keep when both people know what they have agreed.', [
        `Person A’s working theme is **${a.work.theme}**. That points to a preference for ${a.work.setting}. Consider how this appears in shared planning or practical tasks.`,
        `Person B’s theme is **${b.work.theme}**. Their suggested setting includes ${b.work.setting}. A different method may still lead to the same useful result.`,
        a.month.stemSipsin === b.month.stemSipsin ? 'Your main work themes match. You may both want a similar kind of contribution. Agree who will handle each task so the same job does not get done twice.' : 'Your main work themes differ. Name what each person enjoys handling, but do not make a permanent role out of a chart label. Check the real time and skill each task needs.',
        `A pressure point for Person A is **${a.work.friction}**. For Person B, it is **${b.work.friction}**. Choose a division that avoids adding unnecessary pressure to either side.`,
        'For example, planning a trip includes choosing, booking, checking details and following up. **Write down who will do each part.** Review the plan if someone’s available time changes.',
      ], [pillarFact(first, 2, 'Person A'), pillarFact(second, 2, 'Person B')], 'Choose one shared task. Agree the owner, the deadline and the support each person can ask for.', shared([`Person A: ${a.work.keepClose[0]}`, `Person B: ${b.work.keepClose[0]}`], ['Treating an agreed role as permanent when circumstances change.', 'Taking over a task without checking whether help is wanted.']), 'social'),
      chapter('shared-money', 'Money, Promises and Fair Agreements', '**Discuss the real figures and the full promise.** The chart gives us a conversation theme, not a financial forecast.', [
        `Person A’s checked money markers suggest a focus on **${moneyA.theme}**. Person B’s suggest **${moneyB.theme}**. Ask whether those themes fit the commitments you actually share.`,
        'Before sharing a cost, agree how much each person is comfortable contributing. Include the time and work around the choice, as well as the amount paid.',
        'A gift, loan and shared expense have different expectations. **Name which one you mean.** If the agreement is unclear, clear it up before adding another promise.',
        'A small recurring cost may feel different from a one-off purchase. Discuss how often the cost repeats and when you will review it. Neither person’s chart can tell you what the other can afford.',
        'Fair does not always mean identical. A useful agreement is understood by both people and can be discussed again when income, time or responsibilities change.',
      ], [...moneyA.facts.map(fact => 'Person A: ' + fact), ...moneyB.facts.map(fact => 'Person B: ' + fact)], 'Choose one shared cost. Write the amount, each person’s part and the date you will review the agreement.', shared(['Clear descriptions of gifts, loans and shared costs.', 'An agreement both people can explain in the same words.'], ['Assuming silence means someone accepts a financial promise.', 'Using a chart theme to judge someone’s financial worth.']), 'money'),
      chapter('chart-patterns', 'Where the Charts Meet', hasClash ? '**A direct clash pattern appears in the birth-day comparison.** Use it to explore different needs or timing, rather than to predict a bad outcome.' : hasCombine ? '**A combination pattern appears in the birth-day comparison.** It can prompt a discussion of cooperation without promising an easy relationship.' : '**The day pair has no direct combination or clash in the checked tables.** That absence does not give the relationship a grade.', [
        'This chapter compares the actual symbols in both charts. A recorded pattern is a traditional category. It does not tell us what happened between you or what will happen next.',
        hasClash ? 'If the image of two needs pulling apart fits a real conversation, ask whether you are discussing the same decision. One person may be answering a question the other did not mean to ask.' : 'If cooperation feels easy in one setting, name what makes it work. A useful habit can be repeated even when the next decision is harder.',
        'Other comparisons include the available birth-year, month, day and hour symbols. **An unknown birth hour is left out completely.** It is not replaced by a guessed relationship reading.',
        'For an ordinary disagreement, separate the topic from the way you are talking. Decide whether the issue needs a choice, more information or simply a calmer time to return.',
        'Use the chart notes to see which comparison produced a pattern. **Use the real conversation to decide what help is needed.** A symbol cannot decide whether a relationship is safe or right for you.',
      ], [...pairFacts(a.day.pillar.ganzi, b.day.pillar.ganzi, 'Birth-day comparison'), ...crossFacts], 'Name one point of agreement and one unresolved need. Choose a time to discuss the unresolved part.', shared(['Specific examples of when cooperation works.', 'A pause with an agreed time to return.'], ['Calling a person a bad match because of one symbol.', 'Using a combination as a reason to ignore a real concern.']), 'patterns'),
      chapter('support-each-other', 'Support without Taking Over', '**Good support leaves room for both people to act.** Ask what helps, rather than deciding which role the other person should fill.', [
        `Person A’s wider-group theme is **${a.group.theme}**. Person B’s is **${b.group.theme}**. These images can help you discuss the roles you take around friends and family.`,
        'A role that works in a group may not be what you need in private. Ask whether the person wants advice, reassurance or help with one specific job.',
        `For Person A, a useful starting habit is: **${a.personal.practice}** Make room for that step without treating it as a demand the other person must carry.`,
        `For Person B, the suggested step is: **${b.personal.practice}** Ask what support would make it easier and what they would prefer to do themselves.`,
        'For example, encouragement can mean listening to a draft, taking a practical task for a day or leaving someone uninterrupted. **Agree on the kind of help and when it ends.**',
      ], [pillarFact(first, 3, 'Person A'), pillarFact(second, 3, 'Person B'), pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B')], 'Each person asks for one kind of support and names one choice they want to keep for themselves.', personalGuidance, 'support'),
      chapter('shared-week', 'A Seven-Day Plan for Both of You', '**Try one conversation and one practical agreement.** Keep the experiment small enough for both people to take part.', [
        'In the first two days, each person describes one ordinary moment when they felt understood. Name the words or actions that helped, rather than asking the other person to guess.',
        `In the next conversation, make room for Person A’s need for **${a.relationship.need}** and Person B’s need for **${b.relationship.need}**. Both people get time to answer.`,
        'Choose one practical task or shared cost. Write down who will do each part, what help can be requested and when the agreement will be reviewed.',
        `For the week’s personal steps, Person A can try: **${a.personal.practice}** Person B can try: **${b.personal.practice}** Each person owns their own experiment.`,
        'At the end of the week, ask what helped and what did not fit. **Keep a useful agreement, change an unhelpful one and leave room for another answer.** The chart starts the discussion; the two people make the relationship.',
      ], [pillarFact(first, 1, 'Person A'), pillarFact(second, 1, 'Person B'), `Two-way day-stem relationships: ${aToB} / ${bToA}.`], 'Book a short review in seven days. Each person brings one useful example and one request for a change.', loveGuidance, 'next-moves'),
    ], months: [],
    methodNotes: [...commonMethod(first, referenceYear), ...commonMethod(second, referenceYear).filter(note => /unknown birth time|time zone was provided|Birth longitude|^For /i.test(note)).map(note => 'Person B: ' + note), 'Two-way themes use each person’s day stem as a separate reference. Pair-pattern checks compare only the supplied pillars across the two charts.', 'All cross-chart pairs are shown in the notes without strength weights. There is no compatibility percentage, relationship ranking, marriage forecast or claim of psychological assessment.'],
  })
}
