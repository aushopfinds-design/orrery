Warning: truncated output (original token count: 20540)
Total output lines: 405

import { reportOverviewText, reportOverview } from './report-overview.ts'
import { humanMonth } from './period-voice.ts'
import { parseCalendarMonth } from './calendar-window.ts'
import { deliveredChapter, calculationAppendix } from './report-delivery.ts'
import { customerNarrative, customerPeriod } from './purchase-narrative.ts'
import { purchaseTimingSections } from './purchase-timing-sections.ts'
import { customerEnglish } from './customer-language.ts'
import { resolutionEnglish } from './resolution-language.ts'
import { buildInterpretationPlan } from './interpretation-plan.ts'
import type { InterpretationPlan } from './interpretation-plan.ts'
import { buyerOutline, type BuyerOutlineKind } from './buyer-outline.ts'
import { structuralAssessment, structuralFacts, englishStructuralAssessment, periodAssessment, STRUCTURE_POLICY } from './structural-assessment.ts'
import type { SajuResult } from '@orrery/core/types'
import type { ReportChapter, CompleteReading } from './complete-reading.ts'
import { buildFreeReading, REPORT_EDITION } from './complete-reading.ts'
import { finishReading, subject, pillarFact, selectedCycles, cycleFacts, validateYear } from './category-shared.ts'
import type { CategoryReading, ReportMonth } from './category-shared.ts'
import type { FocusCategory } from './category-catalog.ts'
import { buildReportExtras, reportExtrasText } from './report-extras.ts'
import { explainCalculation, PAIR_METHOD_NOTE, REFERENCE_CLOCK_NOTE, chartGlossaryFor } from './calculation-notes.ts'
import { plainReadingText } from './reading-text.ts'
import { STEMS } from './reading.ts'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { availablePillars, godText, natalAnalysis, natalPatterns, pairObservation, relationGod, fiveYearPoints, monthlyPoint, timingPoint, POSITION } from './traditional-analysis.ts'

const METHOD = [
  'This report contains no diagnosis, treatment or health-event prediction.',
  'This is a traditional Saju interpretation of calculated symbols, not a factual assessment of your personality or a validated prediction. The situations describe possible expressions, not events known to have happened.',
  'Emphasis means repetition in named positions. Visible relationships, principal branch stems and all hidden stems are listed separately; they are not added into a fortune score. A hidden principal stem also appears in the principal-branch comparison and is not an extra independent vote.',
  'Visible counts are not a full assessment of day-master strength. This report does not claim to diagnose that from counts. The separate FATE-qualitative-r1 rule requires agreement between the month, roots and exposed relationships. Mixed, unknown-hour and exceptional cases are deferred. It is a provisional interpretation policy, not a universal school or a validated outcome model.',
  'The separate FATE-ordinary-structure-r1 policy checks the month anchor, observed production chains and competing exposed relationships. It can return a conditional single balancing preference only for its bounded ordinary cases. A withheld result is explicit; no element transformation, universal structure success or climate prescription is certified.',
  'A money relationship is a traditional topic, not a forecast of income or return. A clash is not a forecast of loss, illness or separation; a combination does not guarantee cooperation or marriage.',
  PAIR_METHOD_NOTE,
  REFERENCE_CLOCK_NOTE,
]
function methods(result: SajuResult, second?: SajuResult, kind: BuyerOutlineKind = 'complete') {
  const timingNote = kind === 'wellbeing' ? [] : kind === 'year'
    ? ['Annual references use 15 July and monthly references use the 15th, each at 12:00 Asia/Seoul. They are comparison points, not the start or the full span of a Gregorian year or month. Solar-term boundaries can change the pillar within a calendar month.']
    : ['Annual references use 15 July at 12:00 Asia/Seoul. They are comparison points, not the start or the full span of a Gregorian year.']
  return [`Structural interpretation policy: ${STRUCTURE_POLICY}. Provisional evidence-led review edition; not a certified expert reading.`, ...explainCalculation(result.input).notes, ...(second ? explainCalculation(second.input).notes.map(note => `Your partner: ${note}`) : []), ...METHOD, ...timingNote,
    ...(result.input.unknownTime || second?.input.unknownTime ? ['An unknown birth time uses three pillars and excludes every hour fact, hidden stem and pair comparison. Ten-year starting dates remain approximate; no hour is inferred.'] : [])]
}
export function shortParagraphs(text: string): string[] {
  const sentences = customerEnglish(text).match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [text]
  const out: string[] = []; let current = ''
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/)
    if (words.length > 80) {
      if (current) { out.push(current); current = '' }
      for (let index = 0; index < words.length; index += 75) out.push(words.slice(index, index + 75).join(' '))
      continue
    }
    const next = (current + ' ' + sentence.trim()).trim()
    if (next.split(/\s+/).length > 80 && current) { out.push(current); current = sentence.trim() } else current = next
  }
  if (current) out.push(current)
  return out
}
function labelledParagraph(label: string, text: string) { return shortParagraphs(`${label}: ${text}`) }
function section(id: string, title: string, paragraphs: string[], evidence: string[], caution: string, action: string, icon = 'personality'): ReportChapter {
  const detailed = paragraphs.filter(text => /^(The checked positions are |No complete three-branch |A complete branch group |Only within the hidden stems|Every relationship found in the hidden stems|No same-element hidden stem)/.test(text) || /day stem has same-element roots/.test(text) || text.startsWith('The evidence lists every cross-chart pair.'))
  const readable = paragraphs.filter(text => !detailed.includes(text)).flatMap(shortParagraphs)
  return { id, title, lead: readable[0], paragraphs: readable.slice(1), evidence: [...new Set([...evidence, ...detailed])], tryThis: action, guidance: { keepClose: [action], watchFor: [caution] }, icon }
}
function chartFacts(result: SajuResult, indices = [1, 2]) { return indices.filter(i => !(i === 0 && result.input.unknownTime)).map(i => pillarFact(result, i)) }
function style(result: SajuResult) {
  const a = natalAnalysis(result), p = PERSONAL_PROFILES[a.day.pillar.stem]
  return [
    `Your birth-day sign is ${STEMS[a.day.pillar.stem].name}, traditionally pictured as ${p.image}. In everyday life, this points to ${p.focus}. You tend to need ${p.need}.`,
    p.strength,
    a.rootText,
    `Your birth month adds a ${a.season} theme to this picture. It is part of the traditional reading, but counting signs alone cannot tell us how easily you will handle extra demands.`,
  ]
}
function emphasis(result: SajuResult) {
  const a = natalAnalysis(result)
  return [a.emphasis,
    `Your birth-month stem describes ${godText(a.month.stemSipsin).meaning}. ${godText(a.month.stemSipsin).work}`,
    a.month.stemSipsin === a.month.branchSipsin ? `The principal stem within the birth month repeats ${godText(a.month.stemSipsin).name}. The public role and the routine underneath it therefore emphasise the same traditional relationship.` : `The principal stem within the birth month adds ${godText(a.month.branchSipsin).name}. ${godText(a.month.branchSipsin).work} That is a different layer from the visible month stem; neither cancels the other.`,
    a.hiddenOnly.length ? `Only within the hidden stems, the chart also contains ${a.hiddenOnly.map(god => godText(god).name).join(', ')}. These are less visible in this comparison and may be expressed through the responsibilities or setting rather than the first impression.` : 'Every relationship found in the hidden stems also appears in a checked visible or principal position. No extra hidden-only theme is added.',
  ]
}
function wealth(result: SajuResult) {
  const a = natalAnalysis(result), visible = a.visible.filter(item => item.god === '正財' || item.god === '偏財'), hidden = a.hidden.filter(item => item.god === '正財' || item.god === '偏財')
  const regular = visible.some(item => item.god === '正財'), opportunity = visible.some(item => item.god === '偏財')
  const conclusion = regular && opportunity ? 'Your chart shows two money themes: steady income from ongoing work, and new opportunities through customers or deals. These can work alongside each other; neither guarantees a higher income.' : regular ? 'Steady pay, repeat customers and manageable bills are the main money themes in this part of your chart.' : opportunity ? 'New customers, deals and work with changing fees are the main money themes in this part of your chart. A promising offer still needs to turn into paid work.' : hidden.length ? 'The signs linked with money appear in the less obvious parts of your chart. Earning may be tied to the skills, duties or contacts behind your main role, rather than being your most obvious theme.' : 'This part of your chart does not give a clear money pattern. That does not mean you cannot earn well. Your work, skills and real opportunities still matter.'
  const output = a.visible.some(item => item.god === '食神' || item.god === '傷官'), peers = a.visible.some(item => item.god === '比肩' || item.god === '劫財')
  const capacity = structuralAssessment(result)
  const capacityText = capacity.tendency === 'support-needed' ? 'Your chart suggests that extra demands may need more support. A new source of income could also mean more work, costs or duties to manage.' : capacity.tendency === 'supported' ? 'Your chart shows support for taking on useful work and managing resources. This gives you something to build on, but it cannot tell us whether a particular offer will make a profit.' : 'Your chart gives a mixed picture of how much extra work or responsibility may suit you. More money-related activity is not automatically an easier time financially.'
  return [conclusion, capacityText,
    `The checked positions are ${visible.length ? visible.map(item => `${item.source} (${godText(item.god).name})`).join('; ') : 'without a direct visible money relationship'}. ${hidden.length ? `The hidden check finds ${hidden.map(item => `${item.stem} in the ${item.source}`).join('; ')}. Hidden entries are supporting evidence, not additional strength points.` : 'No hidden money stem was found either.'}`,
    output ? 'Your chart also links money with skills and expression. This may show up as making a product, explaining an idea or providing a useful service. Having the skill and finding someone willing to pay for it are separate steps.' : 'This part of your chart does not show a clear link from producing something to earning from it. Income could still come through your qualifications, a job or a business agreement.',
    peers ? 'A peer relationship is visible too. In a money context, shared fees, family obligations or a collaboration can put independence and shared resources in the same decision. The caution is unclear division of money, not an assumed financial loss.' : 'No peer relationship appears in these checked positions. That removes this particular sharing-and-competition theme; it does not remove ordinary contractual or financial risks.',
  ]
}
function yearFlow(result: SajuResult, year: number, topic: 'work' | 'money' | 'business' | 'love' | 'balance', count = 5) {
  return fiveYearPoints(result, year, count).map((point, i) => {
    const g = godText(point.god), inner = godText(point.innerGod)
    return `${year + i} — ${g.name}${point.god !== point.innerGod ? `, with ${inner.name} underneath` : ' repeated in both checked layers'}. ${g[topic]} ${periodAssessment(result, point.pillar, point.date).text} ${point.clash.length ? `A clash touches the birth ${point.clash.map(item => POSITION[item.index]).join(' and ')} pillar${point.clash.length > 1 ? 's' : ''}; changing responsibilities or conflicting schedules are the caution to examine.` : point.active.length ? `A recorded pair pattern touches the birth ${point.active.map(item => POSITION[item.index]).join(' and ')} pillar${point.active.length > 1 ? 's' : ''}; the detailed evidence records which pattern.` : 'No pair pattern is recorded against the available birth pillars at this reference.'}`
  })
}
function timelineFacts(result: SajuResult, year: number, count = 5) { return fiveYearPoints(result, year, count).flatMap(point => { const assessment = periodAssessment(result, point.pillar, point.date); return [...point.facts, ...assessment.evidence, customerEnglish(assessment.text)] }) }
function cycles(result: SajuResult, year: number, topic: 'work' | 'business' | 'love' = 'work') {
  const found = selectedCycles(result, year)
  return found.length ? found.map(cycle => {
    const index = result.daewoon.indexOf(cycle), next = result.daewoon[index + 1]
    return `From the calculated start ${cycle.startDate.toISOString().slice(0, 10)}${next ? ` until the next start ${next.startDate.toISOString().slice(0, 10)}` : ' for the calculated ten-year cycle'}: ${godText(cycle.stemSipsin).name}, with ${godText(cycle.branchSipsin).name} as an underlying theme. ${godText(cycle.stemSipsin)[topic]} ${cycle.stemSipsin === result.pillars[2].stemSipsin ? 'The cycle repeats your birth-month stem relationship, bringing the same topic into the longer timing layer.' : `This differs from the birth-month stem’s ${godText(result.pillars[2].stemSipsin).name}, so the longer period adds a different demand to the natal work pattern.`}`
  }) : [`No current or upcoming ten-year cycle is available for ${year} in the calculated range. No later cycle or timing conclusion has been invented to fill that gap.`]
}
function structural(result: SajuResult) {
  const pattern = natalPatterns(result), active = pattern.pairs.filter(item => item.found.length)
  return [active.length ? `The available birth pillars contain ${active.length} pair comparison${active.length > 1 ? 's' : ''} with a recorded relationship. These are separate checks, not a total measure of conflict or luck.` : 'The available birth pillars contain no pair relationship in the checked tables. This reading does not invent a clash or a combination to make the chart sound more dramatic.',
    ...active.map(item => item.text),
    pattern.groups.length ? `A complete branch group is present: ${pattern.groups.map(item => `${item.type}${item.detail ? ` (${item.detail})` : ''}`).join('; ')}. All required branches are present; the report does not assume that the group transforms the chart’s elements.` : 'No complete three-branch or directional combination was found in the available natal branches. A two-branch partial pattern is not promoted into a complete group.',
    'The practical distinction is between attraction or attachment and friction or movement. A chart can contain both. These describe traditional tensions within the chart, not a record of family events or a prediction that a relationship will end.',
  ]
}
function elementPicture(result: SajuResult) {
  const snap = buildFreeReading(result), a = natalAnalysis(result), max = Math.max(...snap.elements.map(item => item.count)), top = snap.elements.filter(item => item.count === max), absent = snap.elements.filter(item => item.count === 0)
  return [
    `The visible element picture is ${snap.elements.map(item => `${item.element} ${item.count}`).join(', ')} across ${snap.visibleMarkers} symbols. ${top.map(item => item.element).join(' and ')} ${top.length > 1 ? 'are' : 'is'} most frequent in this unweighted count.`,
    a.rootText,
    'These counts help describe the chart. They are not scores for your personality, health or future.',
    absent.length ? `${absent.map(item => item.element).join(' and ')} ${absent.length > 1 ? 'do' : 'does'} not appear among the main signs. This does not mean you lack an ability or need to buy or consume something to change your chart.` : 'All five elements appear visibly. This is variety in the symbol picture, not proof of emotional balance, good health or equal strength between elements.',
  ]
}
function extras(kind: 'complete' | FocusCategory, result: SajuResult, chapters: ReportChapter[], year: number, second?: SajuResult) {
  const annual = kind === 'year' ? timingPoint(result, year) : undefined
  const original = buildReportExtras(kind, result, { year, second, ...(annual ? { annual: { god: annual.god, pillar: annual.pillar, theme: godText(annual.god).name } } : {}) })
  const chosen = chapters.slice(0, 3)
  return { ...original, compact: true,
    questions: chosen.map(item => ({ question: item.title.replace(/^\d+ · /, ''), answer: item.lead, basis: item.evidence[0] ?? '' })),
    keepClose: kind === 'complete' ? original.keepClose : chosen.map(item => ({ title: item.title, text: item.guidance.keepClose[0] })),
    stepBack: kind === 'complete' ? original.stepBack : [...chosen.filter(item => item.guidance.watchFor.length).map(item => ({ title: item.title, text: item.guidance.watchFor[0] })), ...original.stepBack].slice(0, 3),
    reminder: 'Use the reading to name a traditional pattern. Actual choices, consent and circumstances determine what happens.',
    experiment: { title: 'Before a consequential decision', steps: chosen.map(item => item.tryThis) },
    evidence: [...new Set(chosen.flatMap(item => item.evidence).slice(0, 5))],
  }
}
function withPurchaseTiming(chapters: ReportChapter[], plan: InterpretationPlan, targetedProduct01 = true, rootCauseFix = true) {
  const written = customerNarrative(plan,targetedProduct01,rootCauseFix), timing = purchaseTimingSections(plan,targetedProduct01,rootCauseFix)
  return chapters.map(item => {
    const added = written[item.id]
    if (!added) return item
    const body = added.lines.map(line => line.en).flatMap(shortParagraphs)
    const paragraphs = body.slice(1)
    if(!paragraphs.length) paragraphs.push(added.action.en)
    let lead = body[0]
    if(plan.kind==='career'){
      const answer=labelledParagraph('Direct answer',lead)
      lead=answer[0]
      if(answer.length>1)paragraphs.unshift(...answer.slice(1))
      if(paragraphs.length&&!['work-chapters','feedback-and-boundaries'].includes(item.id)&&!/^Reading basis:|^About this reading:/.test(paragraphs[0])){
        paragraphs.splice(0,1,...labelledParagraph('What this means for you',paragraphs[0]))
      }
      if(item.id==='feedback-and-boundaries'&&paragraphs.length){
        paragraphs.splice(0,1,...labelledParagraph('Important timing',paragraphs[0]))
      }
      if(item.id==='career-plan'&&paragraphs.length>1){
        const timingIndex=paragraphs.findIndex(text=>/\b(?:19|20)\d{2}\b/.test(text))
        if(timingIndex>=0)paragraphs.splice(timingIndex,1,...labelledParagraph('Important timing',paragraphs[timingIndex]))
        const last=paragraphs.length-1
        paragraphs.splice(last,1,...labelledParagraph('Bottom line',paragraphs[last]))
      }
    }
    return { ...item, lead, paragraphs, evidence: [...new Set([...item.evidence, ...(timing[item.id]?.evidence ?? [])])],
      showGuidance: added.showGuidance, tryThis: added.action.en, guidance:{keepClose:[added.action.en],watchFor:[added.caution.en]} }
  })
}
function withStructuralEvidence(chapters: ReportChapter[], plan: InterpretationPlan) {
  const a = englishStructuralAssessment(plan.primary.strength), b = plan.partner ? englishStructuralAssessment(plan.partner.strength) : undefined
  const periodFacts = plan.kind==='wellbeing' ? [] : [...(plan.kind==='year'?plan.annual.slice(0,1):plan.annual),...plan.months].map(point=>customerEnglish(periodAssessment(plan.first,point.pillar,point.date,point.yearPillar).text))
  const partnerFacts = plan.kind==='compatibility' && plan.second ? plan.partnerAnnual.map(point=>customerEnglish(periodAssessment(plan.second!,point.pillar,point.date,point.yearPillar).text)) : []
  const facts = (item: ReturnType<typeof structuralAssessment>) => [...item.evidence, item.verdict, item.paragraphs[3], item.balanceText]
  return chapters.map((item, index) => index ? item : { ...item,
    paragraphs: item.paragraphs,
    evidence: [...item.evidence, ...periodFacts, ...partnerFacts, ...facts(a).map(text => b ? 'You: ' + text : text), ...resolutionEnglish(plan.primary.resolution).map(c => b ? 'You: ' + c.text : c.text), ...(b ? [...facts(b), ...resolutionEnglish(plan.partner!.resolution).map(c => c.text)].map(text => 'Your partner: ' + text) : [])],
  })
}
function distinctChapters(chapters: ReportChapter[]) {
  const seen = new Set(chapters.map(item=>item.lead))
  return chapters.map(item=>{
    const paragraphs=item.paragraphs.filter(text=>{if(seen.has(text))return false;seen.add(text);return true})
    if(!paragraphs.length)paragraphs.push(item.tryThis)
    return {...item,paragraphs}
  })
}
function focusFrom(chapters: ReportChapter[]) {
  const first = chapters[0], next = chapters[1] ?? first
  return { headline: first.lead, synthesis: next.lead, firstStep: first.tryThis, pauseIf: first.guidance.watchFor[0], review: 'Compare this traditional reading with the actual situation before making a consequential decision.', evidence: first.evidence.filter(fact=>!/^\d{4}-\d{2}-\d{2}:|^Reference|^Active cycle|^Assessment/.test(fact)).slice(0,5) }
}
function opportunityWindow(result: SajuResult, year: number, gods: string[], area: string) {
  const points = fiveYearPoints(result, year)
  const matching = points.filter(point => [point.god, point.innerGod].some(god => gods.includes(god)))
  const changed = points.filter(point => point.comparisons.some(item => item.index === 2 && item.found.some(pattern => pattern.type === '沖')))
  return [
    matching.length ? `In the checked ${year}–${year + points.length - 1} window, ${matching.map(point => point.date.slice(0, 4)).join(', ')} carry the relationships relevant to ${area}. These are dates with a matching topic, not promises that the event will occur.` : `No sampled year in the checked ${year}–${year + points.length - 1} window carries the selected relationships for ${area}. The report does not invent a favourable year to fill the gap.`,
    changed.length ? `The birth-month pillar meets a clash at the ${changed.map(point => point.date.slice(0, 4)).join(', ')} annual references. A changed role, schedule or working arrangement is a possible expression; the comparison cannot establish a resignation, dismissal or business move.` : 'No birth-month clash is recorded at the annual reference points in this window. A real change can still occur without that particular structural signal.',
  ]
}
function buildSoloChapters(kind: 'complete' | 'career' | 'business' | 'wellbeing' | 'love', result: SajuResult, year: number) {
  const a = natalAnalysis(result), month = godText(a.month.stemSipsin), inner = godText(a.month.branchSipsin), relationship = RELATIONSHIP_PROFILES[a.day.pillar.branch]
  const money = wealth(result), pattern = natalPatterns(result)
  const hiddenFacts = a.hidden.map(item => `${item.stem} within ${item.source}: ${item.god} (${godText(item.god).name}).`)
  const make = (id: string, title: string, ps: string[], evidence: string[], caution: string, action: string, icon?: string) => section(id, title, ps, evidence, caution, action, icon)
  if (kind === 'love') {
    const dayLink = pattern.pairs.filter(item => item.facts.includes('/ day') || item.facts.startsWith('Birth day'))
    const fiveYears = fiveYearPoints(result, year, 10)
    return [
      make('love-style', 'How Do You Approach Love?', [`Your day-stem image is ${STEMS[a.day.pillar.stem].name}, traditionally associated with ${PERSONAL_PROFILES[a.day.pillar.stem].focus}. In close relationships, this may shape how you begin and what you need to feel respected.`, `The birth-day branch adds ${godText(a.day.branchSipsin).name}. ${godText(a.day.branchSipsin).love}`, `The birth month brings ${month.name} into the public side of life; ${inne…8540 tokens truncated…0).toUpperCase() + g.meaning.slice(1)} is a topic to consider, not an overall good-or-bad luck rating.`, `${point.god === a.month.stemSipsin ? 'This repeats your birth-month work theme.' : `This adds a different demand to your natal ${godText(a.month.stemSipsin).name} work theme.`}`, annualAssessment.text, ...point.active.map(item => item.text), `Across these twelve months, direct money relationships appear in ${moneyMonths.join(', ') || 'none of the months'}. Recorded clashes against available birth pillars occur in ${clashMonths.join(', ') || 'none of the months'}. These are topics and structural signals, not lists of profitable or unlucky months. Each monthly entry uses its own calendar-year pillar and solar-term reference.`], [...point.facts, ...annualAssessment.evidence, ...monthlyPoints.flatMap(item => item.point.facts)], g.pressure, 'Read the annual themes alongside your natal work relationship and each month’s reference.', 'personality'),
    section('annual-work', 'Work, Recognition and Changing Demands', [`The opening work theme is ${g.name}. ${g.work}`, `The underlying opening layer is ${inner.name}. ${inner.work}`, ...annualBackgrounds.slice(1), `Your natal work stem remains ${godText(a.month.stemSipsin).name}. ${godText(a.month.stemSipsin).work}`, `A role change, promotion or dismissal is not established by these relationships; they identify the kind of demand to examine.`], [...chartFacts(result, [2]), ...point.facts, ...monthlyPoints.map(item => item.point.facts[0])], g.pressure, 'Check the actual remit, resources and recognition attached to a new responsibility.', 'career'),
    section('annual-money', 'Money Themes and Their Monthly References', [`At the opening reference: ${g.money}`, `Underlying opening layer: ${inner.money}`, ...annualBackgrounds.slice(1), wealth(result)[0], `Direct money relationships appear in ${moneyMonths.join(', ') || 'none of the twelve months'}. Their presence names a topic; it does not measure profit. Their absence does not predict financial difficulty.`], [...point.facts, ...a.facts, ...monthlyPoints.flatMap(item => item.point.facts)], 'Do not use a symbolic month label to choose an investment, borrowing or an unaffordable commitment.', 'Use confirmed income, costs and the actual terms of an offer for financial decisions.', 'money'),
    section('annual-connections', 'Relationships and the Private-Life Layer', [`The annual stem brings ${g.name}. ${g.love}`, `The principal annual branch stem brings ${inner.name}. ${inner.love}`, point.comparisons.find(item => item.index === 1)!.text, `Your birth chart still points to ${RELATIONSHIP_PROFILES[a.day.pillar.branch].need}. The annual pattern adds a temporary comparison; it does not replace the natal relationship layer or tell us how another person feels.`], [...chartFacts(result, [1]), ...point.facts], 'A day-pillar clash does not establish separation, and a combination does not establish marriage.', 'Separate changes to shared time or responsibilities from assumptions about someone’s feelings.', 'love'),
    section('annual-cycle-context', 'Months With More Support', [supportiveMonths.length ? `${supportiveMonths.map(item => item.month.label).join(', ')} show a potentially supportive balance between the natal chart, active cycle and monthly reference without a separate checked friction signal. These are conditional opportunities, not guaranteed good months.` : 'No month meets the checks needed for us to call it easier. Your chart may point in different directions, or the shorter and longer periods may bring competing demands. The monthly reading below explains the themes we can support.', ...supportiveMonths.map(item => `${item.month.label} (${item.month.referenceDate}): ${godText(item.point.god).name} with ${godText(item.point.innerGod).name}. The balance reading points to ${item.assessment.direction === 'potential-support' ? 'added support' : 'an outlet for existing support'}, with no separate checked friction signal.`), ...cycles(result, year).slice(0, 1), 'These months reflect the separate support check; a month can still carry a specific money opportunity or require care under another check. The monthly chapters explain each distinction.'], [...cycleFacts(result, year), ...monthAssessments.flatMap(item => item.assessment.evidence)], 'These are representative points, not favourable dates for every day of a month.', 'Read an opportunity alongside the capacity and obligations it requires.', 'timeline'),
    section('annual-plan', 'Months That Need Extra Care', [carefulMonths.length ? `${carefulMonths.map(item => item.month.label).join(', ')} carry a checked friction signal or an added-demand reading. These references identify the kind of pressure to examine, not a prediction of a bad event.` : 'No monthly reference meets the stated friction or added-demand criteria. That does not certify a risk-free year; the reading leaves unsupported warnings out.', ...carefulMonths.map(item => `${item.month.label} (${item.month.referenceDate}): ${godText(item.point.god).name} with ${godText(item.point.innerGod).name}. ${item.assessment.tension ? 'A checked structural friction signal needs attention.' : 'The timing layers add demands to a chart that leans towards needing support.'}`), `The year’s personal caution is ${g.pressure}; the underlying layer adds ${inner.pressure}. A money topic and a clash can occur together, so activity and ease must not be confused.`, 'The twelve monthly chapters below retain their own actual pillars, work themes, financial commitments, relationship themes and cautions.'], [...point.facts, ...monthAssessments.flatMap(item => item.assessment.evidence)], g.pressure, 'Prioritise the real obligations and changing arrangements that match the stated chart evidence.', 'next-moves'),
  ]
  return { chapters, months }
}
function compatibilityChapters(first: SajuResult, second: SajuResult, year: number) {
  const a = natalAnalysis(first), b = natalAnalysis(second)
  const ab = relationGod(a.day.pillar.stem, b.day.pillar.stem), ba = relationGod(b.day.pillar.stem, a.day.pillar.stem)
  const ag = godText(ab), bg = godText(ba)
  const day = pairObservation(a.day.pillar.ganzi, b.day.pillar.ganzi, 'Birth-day comparison'), month = pairObservation(a.month.pillar.ganzi, b.month.pillar.ganzi, 'Birth-month comparison')
  const cross = a.available.flatMap(left => b.available.map(right => pairObservation(left.pillar.pillar.ganzi, right.pillar.pillar.ganzi, `Person A ${POSITION[left.index]} / Person B ${POSITION[right.index]}`)))
  const attraction = `Person A may look for ${ag.name} in this connection. For Person B, the stronger theme is ${bg.name}. The same relationship may feel different to each of you.`
  const bothFacts = [...chartFacts(first).map(fact => 'Person A: ' + fact), ...chartFacts(second).map(fact => 'Person B: ' + fact)]
  const needs = `Person A’s chart points to ${RELATIONSHIP_PROFILES[a.day.pillar.branch].need}. Person B’s chart points to ${RELATIONSHIP_PROFILES[b.day.pillar.branch].need}. ${a.day.pillar.branch === b.day.pillar.branch ? 'The branch theme matches, but the rest of the charts can still differ.' : 'The private-life themes differ, so the same gesture of care may not feel equally useful to both people.'}`
  const years = fiveYearPoints(first, year).map((p, i) => {
    const q = timingPoint(second, year + i)
    const firstFlow = periodAssessment(first, p.pillar, p.date), secondFlow = periodAssessment(second, q.pillar, q.date)
    return `${year + i}: Person A receives ${godText(p.god).name} with ${godText(p.innerGod).name}; Person B receives ${godText(q.god).name} with ${godText(q.innerGod).name}. ${p.comparisons.find(item => item.index === 1)!.text} For Person B: ${q.comparisons.find(item => item.index === 1)!.text} For Person A’s longer-cycle context: ${firstFlow.text} For Person B’s longer-cycle context: ${secondFlow.text} This compares the same year with both natal charts; it is not a combined marriage or separation forecast.`
  })
  return [
    section('two-styles', 'The Match: Attraction and Difference', [attraction, day.text, `Person A starts from ${STEMS[a.day.pillar.stem].name}; Person B starts from ${STEMS[b.day.pillar.stem].name}. ${a.day.pillar.stem === b.day.pillar.stem ? 'The same day stem gives a shared starting image, but it does not make your needs or histories identical.' : `Person A’s image is ${PERSONAL_PROFILES[a.day.pillar.stem].image}; Person B’s is ${PERSONAL_PROFILES[b.day.pillar.stem].image}.`}`, needs, 'The structural picture is more informative than a compatibility percentage: attraction, practical fit and the ability to handle disagreement are separate questions. No calculated score has been added.'], [...bothFacts, day.facts], 'A combination does not prove attraction, and a clash does not make someone a bad partner.', 'Compare the described difference with how both people actually make a shared decision.', 'personality'),
    section('two-directions', 'Why the Connection Feels Different to Each Person', [`For Person A, the connection brings ${ag.name}. ${ag.love}`, `For Person B, the connection brings ${bg.name}. ${bg.love}`, ab === ba ? 'Both directions produce the same traditional label. That makes the symbolic theme reciprocal; it does not establish equal feelings or equal effort.' : 'The two perspectives differ. One person may feel supported while the other feels challenged. Neither view, on its own, describes the whole relationship.', `Person A’s caution is ${ag.pressure}; Person B’s is ${bg.pressure}. In daily life, these can meet in a disagreement about who decides, who supports or who has already contributed enough.`], [`A → B: ${a.day.pillar.stem} comparing ${b.day.pillar.stem} = ${ab}.`, `B → A: ${b.day.pillar.stem} comparing ${a.day.pillar.stem} = ${ba}.`], 'Directional relationships do not tell us who loves more or who should have authority.', 'Give each person a separate account of the same interaction before deciding what it means.', 'patterns'),
    section('close-conversation', 'Closeness, Care and Private Friction', [needs, `For Person A: ${godText(a.day.branchSipsin).love}`, `For Person B: ${godText(b.day.branchSipsin).love}`, day.text, `The practical tension for Person A is ${RELATIONSHIP_PROFILES[a.day.pillar.branch].friction}; for Person B it is ${RELATIONSHIP_PROFILES[b.day.pillar.branch].friction}. Those are interpretations of the day-branch layer, not a record of what either person has done.`], [...bothFacts, day.facts], 'The chart cannot establish another person’s intentions or consent.', 'Name the form of care each person wants rather than using the chart to speak for them.', 'love'),
    section('shared-routine', 'Living and Organising Life Together', [`In everyday life, Person A's chart puts emphasis on ${godText(a.month.branchSipsin).name}. Person B's chart points to ${godText(b.month.branchSipsin).name}. This can affect how each of you handles tasks, time and responsibilities.`, `Person A: ${godText(a.month.branchSipsin).work}`, `Person B: ${godText(b.month.branchSipsin).work}`, month.text, day.found.some(item => item.type === '合') && month.found.some(item => item.type === '沖') ? 'The day layer combines while the month layer clashes. Attraction and attachment can therefore sit beside friction over schedules, duties or how a home is run; these are different layers of fit.' : day.found.some(item => item.type === '沖') && month.found.some(item => item.type === '合') ? 'The day layer clashes while the month layer combines. A workable routine can coexist with different private preferences; practical cooperation does not settle every emotional question.' : 'Compare private choices separately from the work of running a day together. The day and month checks describe different layers, even when their pattern labels happen to match.'], [...bothFacts, month.facts], 'A month-pillar pattern does not establish who actually does more work at home.', 'Make ownership of recurring tasks and the less visible follow-up explicit.', 'social'),
    section('shared-money', 'Shared Money and Different Priorities', [`Person A: ${wealth(first)[0]}`, `Person B: ${wealth(second)[0]}`, `From A’s side, the connection brings ${ag.name}. ${ag.money}`, `From B’s side, the connection brings ${bg.name}. ${bg.money}`, 'Money compatibility cannot be reduced to the presence of a money symbol. An actual shared cost needs agreement about contribution, ownership and what happens if one person’s circumstances change.'], [...a.facts.map(f => 'Person A: ' + f), ...b.facts.map(f => 'Person B: ' + f)], 'Do not use one person’s chart to decide their financial worth or entitlement to shared money.', 'Distinguish a gift, a loan and a shared expense before committing funds.', 'money'),
    section('chart-patterns', 'Where the Two Charts Connect and Conflict', [day.text, month.text, `Across all available pillars, ${cross.filter(item => item.found.length).length} of ${cross.length} pair comparisons contain a recorded relationship. These are overlapping structural checks, not independent votes or a compatibility score.`, ...cross.filter(item => item.found.length).slice(0, 4).map(item => item.text), 'The evidence lists every cross-chart pair. Incomplete three-branch punishment groups are not claimed from two branches alone, and an unknown hour contributes no guessed relationship.'], [day.facts, ...cross.map(item => item.facts)], 'The total number of patterns does not rank the relationship or predict its outcome.', 'Use the named pillars to distinguish private preferences, routine and wider obligations.', 'patterns'),
    section('support-each-other', 'How the Relationship Flow Changes Over Time', years, [...timelineFacts(first, year).map(f => 'Person A: ' + f), ...timelineFacts(second, year).map(f => 'Person B: ' + f)], 'One person’s annual pressure does not establish what will happen to the relationship.', 'Discuss how each person’s responsibilities and shared time change at the same reference year.', 'timeline'),
    section('shared-week', 'The Relationship Conclusion', [`The directional themes are ${ag.name} for Person A and ${bg.name} for Person B. The private-life comparison and the daily routine need to be assessed separately.`, day.text, month.text, needs, `The key directional cautions are ${ag.pressure} for Person A and ${bg.pressure} for Person B. The useful question is whether the actual relationship makes room for both people’s needs, rather than whether a symbol certifies the match.`], [...bothFacts, day.facts, month.facts], 'Use actual behaviour and safety to judge a relationship; no symbol overrides them.', 'Agree on one concrete difference in time, money or responsibility that both people can describe.', 'next-moves'),
  ]
}
export function buildTraditionalCategory(kind: FocusCategory, first: SajuResult, year: number, second?: SajuResult, periodStart?: string, periodTimezone?: string): CategoryReading {
  return buildTraditionalCategoryFromPlan(buildInterpretationPlan(kind, first, year, second, periodStart, periodTimezone))
}
export function buildTraditionalCategoryFromPlan(plan: InterpretationPlan): CategoryReading {
  if (plan.kind === 'complete') throw new Error('Use the complete-report writer for a complete plan')
  const { kind, first, second, referenceYear: year } = plan
  validateYear(year, first)
  if (kind === 'compatibility' && !second) throw new Error('Two birth charts are needed for compatibility')
  if (second) validateYear(year, second)
  const annual = kind === 'year' ? annualChapters(first, year, plan.periodStart) : undefined
  const chapters = distinctChapters(withStructuralEvidence(withPurchaseTiming(buyerOutline(kind, annual?.chapters ?? (kind === 'compatibility' ? compatibilityChapters(first, second!, year) : buildSoloChapters(kind as 'career' | 'business' | 'wellbeing' | 'love', first, year))), plan), plan))
  if (kind === 'wellbeing') {
    const reaction = PERSONAL_PROFILES[plan.primary.dayStem]?.pressure
    const workload = chapters.find(chapter => chapter.id === 'workload-rhythm')
    if (reaction && workload && !workload.paragraphs.includes(reaction)) workload.paragraphs.unshift(reaction)
  }
  const title = { career: 'My Money & Career', business: 'Born to Build a Business?', wellbeing: 'The Real You: Strengths & Weaknesses', compatibility: 'Our Love', love: 'My Love', year: 'Your Next 12 Months' }[kind]
  const focus = focusFrom(chapters)
  const yearMonthPoints = annual?.months.map(month => {
    const [monthYear, monthNumber] = month.referenceDate.split('-').map(Number)
    return monthlyPoint(first, monthYear, monthNumber)
  }) ?? []
  return finishReading({ focus, kind, title, headline: chapters[0].lead, referenceYear: year,
    ...(plan.periodStart ? { periodStart: plan.periodStart } : {}), ...(plan.periodTimezone ? { periodTimezone: plan.periodTimezone } : {}),
    subjects: second ? [subject(first, 'Person A'), subject(second, 'Person B')] : [subject(first)],
    summary: kind === 'year' ? [{ label: 'The twelve-month window', text: annual?.months.length ? `${annual.months[0].label} through ${annual.months.at(-1)!.label}` : 'Twelve calendar months' }, { label: 'Monthly money references', text: (annual?.months ?? []).filter((_, i) => yearMonthPoints[i].money.length).map(item => item.label).join(', ') || 'None of the twelve months contains a direct money relationship.' }, { label: 'Monthly clash references', text: (annual?.months ?? []).filter((_, i) => yearMonthPoints[i].clash.length).map(item => item.label).join(', ') || 'None of the twelve months clashes with an available birth pillar.' }] : kind === 'compatibility' ? [{ label: 'The connection', text: chapters[0].lead }, { label: 'Two directions', text: chapters[1].lead }, { label: 'Daily routine', text: pairObservation(first.pillars[2].pillar.ganzi, second!.pillars[2].pillar.ganzi, 'Birth-month comparison').text }] : chapters.slice(0, 3).map(item => ({ label: item.title, text: item.lead })),
    chapters, months: annual ? withPurchaseTiming(annual.months, plan).map((chapter,index) => ({...annual.months[index], ...chapter})) : [], applications: [], extras: extras(kind, first, chapters, year, second), methodNotes: methods(first, second, kind),
  })
}
function chapterText(item: ReportChapter) {
  return deliveredChapter(item).join('\n\n')
}
export function buildTraditionalComplete(result: SajuResult, year: number): CompleteReading {
  return buildTraditionalCompleteFromPlan(buildInterpretationPlan('complete', result, year))
}
export function buildTraditionalCompleteFromPlan(plan: InterpretationPlan, targetedProduct01 = true, rootCauseFix = true): CompleteReading {
  if (plan.kind !== 'complete') throw new Error('A complete interpretation plan is needed')
  const { first: result, referenceYear: year } = plan
  validateYear(year, result)
  const snap = buildFreeReading(result), a = natalAnalysis(result)
  const chapters = distinctChapters(withStructuralEvidence(withPurchaseTiming(buyerOutline('complete', buildSoloChapters('complete', result, year)), plan,targetedProduct01,rootCauseFix), plan),targetedProduct01).map((item, index) => ({ ...item, title: `${String(index + 1).padStart(2, '0')} · ${item.title}` }))
  const selected = selectedCycles(result, year)
  const periods = selected.map((cycle, index) => {
    const cycleIndex = result.daewoon.indexOf(cycle), next = result.daewoon[cycleIndex + 1]
    const g = godText(cycle.stemSipsin), inner = godText(cycle.branchSipsin)
    const start = cycle.startDate.toISOString().slice(0, 10), end = next?.startDate.toISOString().slice(0, 10)
    const ps = customerPeriod(plan,index).map(line=>line.en).flatMap(shortParagraphs)
    const evidence = [`Approximate FATE KEY cycle boundary reference: ${start}${end ? `; next approximate reference ${end}` : ''}. Cycle ${cycle.ganzi}: stem ${cycle.stemSipsin}; principal branch relationship ${cycle.branchSipsin}. Other calculation conventions may shift the start.`, ...availablePillars(result).map(({ pillar, index }) => pairObservation(cycle.ganzi, pillar.pillar.ganzi, `Cycle / birth ${POSITION[index]}`).facts)]
    return { period: `Around ${humanMonth(start)}${end ? ' – around ' + humanMonth(end) : ' onward'}`, pillar: cycle.ganzi, headline: cycle.stemSipsin === cycle.branchSipsin ? `${g.name} — repeated emphasis` : `${g.name} with ${inner.name}`, paragraphs: ps, evidence, guidance: { keepClose: [`Use the approximate start period around ${humanMonth(start)} when comparing changes in responsibility.`], watchFor: [g.pressure] }, tryThis: 'Compare work, money and private-life demands separately within this timing layer.', text: plainReadingText([...ps.filter(line => line !== g.pressure), `Practical point: Use the approximate start period around ${humanMonth(start)} when comparing changes in responsibility.`, 'Main caution: ' + g.pressure].join('\n\n')) }
  })
  const actionPlan = withPurchaseTiming([section('next-moves', 'Ten-Year Timeline by Year', yearFlow(result, year, 'work'), timelineFacts(result, year), 'Annual themes are not guaranteed events or deadlines for major life changes.', 'Compare a real change with its annual and longer-cycle evidence.', 'timeline')], plan,targetedProduct01,rootCauseFix)[0]
  const summary = reportOverview(chapters,targetedProduct01)
  const connections = [
    { id: 'work-fit', chapterId: 'career', title: 'Personal Style and Career', basis: `${STEMS[a.day.pillar.stem].name} / ${godText(a.month.stemSipsin).name}`, text: `The personal starting point is ${PERSONAL_PROFILES[a.day.pillar.stem].focus}; the public work relationship is ${godText(a.month.stemSipsin).name}. ${godText(a.month.stemSipsin).work}`, question: 'Does the role allow this contribution with enough authority and resources?', evidence: chartFacts(result) },
    { id: 'close-conversations', chapterId: 'love', title: 'Personal Needs and Close Relationships', basis: `Day stem ${a.day.pillar.stem}; day branch ${a.day.pillar.branch}`, text: `The day-stem need is ${PERSONAL_PROFILES[a.day.pillar.stem].need}; the day-branch theme is ${RELATIONSHIP_PROFILES[a.day.pillar.branch].need}. These are separate layers of the same chart.`, question: 'Does the actual relationship make room for both needs?', evidence: chartFacts(result, [1]) },
  ]
  const focus = focusFrom(chapters), extra = extras('complete', result, chapters, year), notes = methods(result, undefined, 'complete')
  const fullText = plainReadingText([`THE FATE KEY · My Life`, `Report edition ${REPORT_EDITION} · Reference year ${year}`, snap.birthSummary, snap.pillarSummary.join(' · '), reportOverviewText(chapters,targetedProduct01), ...chapters.map(chapterText), 'Ten-Year Cycles in Detail', ...periods.map(item => `${item.period} · ${item.pillar}\n\n${item.text}`), chapterText(actionPlan), reportExtrasText(extra, true), calculationAppendix([...connections.map(item=>({title:item.title,evidence:[item.basis,item.text,item.question,...item.evidence]})), { title: 'Reading focus', evidence: focus.evidence }, { title: 'Symbol guide evidence', evidence: extra.evidence }, ...chapters.map(item => ({ title: item.title, evidence: item.evidence })), ...periods.map(item => ({ title: item.period, evidence: item.evidence })), { title: actionPlan.title, evidence: actionPlan.evidence }]), 'Chart terms in plain English', ...chartGlossaryFor([...chapters.flatMap(item => item.evidence), ...actionPlan.evidence, '大運']).map(item => `${item.term}: ${item.meaning}`), 'How this reading is prepared', ...notes].join('\n\n'))
  return { focus, calculation: explainCalculation(result.input), title: 'My Life', birthSummary: snap.birthSummary, pillarSummary: snap.pillarSummary, dayMaster: snap.dayMaster, headline: chapters[0].lead, summary, connections, referenceYear: year, chapters, periods, actionPlan, applications: [], extras: extra, elements: snap.elements, visibleMarkers: snap.visibleMarkers, methodNotes: notes, fullText, wordCount: fullText.split(/\s+/).length }
}
