import { splitDeliveredReading, CALCULATION_NOTES } from './report-delivery.ts'
import { bundleNarrative } from './purchase-narrative.ts'
import { bundleInterpretationPlans } from './interpretation-plan.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategory, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
import type { ReportChapter } from './complete-reading.ts'
import type { SajuResult } from '@orrery/core/types'
import type { FocusCategory } from './category-catalog.ts'
import { buildCompatibilityReading } from './compatibility-reading.ts'
import { buildCareerReading, buildBusinessReading } from './work-focus-readings.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildBalanceReading } from './balance-reading.ts'
import { plainReadingText } from './reading-text.ts'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { WORKING_LANGUAGE as LANGUAGE } from './purchase-language.ts'

export { buildCompatibilityReading, buildCareerReading, buildBusinessReading, buildYearAheadReading, buildBalanceReading }
export function buildCategoryReading(kind: FocusCategory, first: SajuResult, options: { second?: SajuResult; year?: number; periodStart?: string; periodTimezone?: string } = {}) {
  const year = options.year ?? new Date().getFullYear()
  switch (kind) {
    case 'compatibility':
      if (!options.second) throw new Error('Two birth charts are needed for compatibility')
      return buildCompatibilityReading(first, options.second, year)
    case 'year': return buildYearAheadReading(first, options.year ?? new Date().getFullYear() + 1, options.periodStart, options.periodTimezone)
    case 'career': return buildCareerReading(first, year)
    case 'love': return buildTraditionalCategory(kind, first, year)
    case 'business': return buildBusinessReading(first, year)
    case 'wellbeing': return buildBalanceReading(first, year)
  }
}
export function buildBundleReading(first: SajuResult, second: SajuResult, annualYear = new Date().getFullYear() + 1, referenceYear = new Date().getFullYear(), periodStart?: string, periodTimezone?: string) {
  return buildBundleFromPlans(bundleInterpretationPlans(first, second, annualYear, referenceYear, periodStart, periodTimezone))
}
export function buildBundleFromPlans(plans: ReturnType<typeof bundleInterpretationPlans>) {
  const complete = buildTraditionalCompleteFromPlan(plans.complete)
  const compatibility = buildTraditionalCategoryFromPlan(plans.compatibility)
  const annual = buildTraditionalCategoryFromPlan(plans.annual)
  const career = buildTraditionalCategoryFromPlan(plans.career)
  const love = buildTraditionalCategoryFromPlan(plans.love)
  // The life report owns the shared glossary, method and symbolic keepsake appendix.
  // The relationship and annual sections retain their own calculated evidence.
  for (const report of [compatibility, annual, career, love]) {
    report.sharedAppendixInLifeReport = true
    const parts = splitDeliveredReading(report.fullText)
    report.fullText = parts.body.split('\n\nYour Everyday Compass')[0] + '\n\n' + CALCULATION_NOTES + '\n\n' + parts.appendix.split('\n\nChart terms in plain English')[0]
    report.wordCount = report.fullText.split(/\s+/).length
  }
  const overviewTitle = 'How Do Your Life, Love, Work and Year Connect?'
  const overviewParagraphs = bundleNarrative(plans).map(line=>line.en)
  const synthesis = plainReadingText(overviewParagraphs.join('\n\n'))
  const overview = { title: overviewTitle, fullText: [overviewTitle, synthesis].join('\n\n'), paragraphs: overviewParagraphs }
  const chapter = (report: { chapters: ReportChapter[] }, id: string) => {
    const found = report.chapters.find(item => item.id === id)
    if (!found) throw new Error(`Missing collection answer source: ${id}`)
    return found
  }
  const answer = (number: number, question: string, source: ReportChapter, timing?: string, collectionLead?: string) => {
    return [
      `${String(number).padStart(2, '0')} · ${question}`,
      `Question: ${question}`,
      `Your Answer: ${plainReadingText(collectionLead ?? source.lead)}`,
      ...(timing ? [`Important Timing: ${plainReadingText(timing)}`] : []),
    ].join('\n\n')
  }
  const life = chapter(complete, 'personality')
  const social = chapter(complete, 'social')
  const strengthsOverview = {
    ...life,
    title: 'Your Strengths and Blind Spots',
    lead: social.lead,
    paragraphs: [social.paragraphs[0] ?? social.tryThis, life.paragraphs[0] ?? life.tryThis],
    tryThis: social.tryThis,
  }
  const careerFit = chapter(career, 'two-work-layers')
  const moneyFit = chapter(career, 'money-commitments')
  const relationshipNeed = chapter(love, 'love-needs')
  const relationshipFit = chapter(compatibility, 'two-styles')
  const challenge = chapter(complete, 'life-challenges')
  const yearTheme = chapter(annual, 'annual-theme')
  const longTerm = chapter(complete, 'patterns')
  const nextCycle = complete.periods[1]
  const lifeTimeline = complete.periods.length
    ? complete.periods.map(period => `${period.period} · ${period.pillar}: ${period.paragraphs.join(' ')}`)
    : ['No ten-year cycle falls within the available calculated range.']
  const coreProfile = PERSONAL_PROFILES[plans.complete.primary.dayStem]
  const privateNeed = RELATIONSHIP_PROFILES[plans.complete.primary.dayBranch].need
  const workTheme = LANGUAGE[plans.complete.primary.monthStemGod].name.en
  const coreAnswer = `Your core style centres on ${coreProfile.focus}. This is the personal quality that shapes how you approach everyday choices.`
  const blindSpot = plainReadingText(coreProfile.watchFor.at(-1) ?? coreProfile.watchFor[0])
  const strengthAnswer = `Your clearest strength is this: ${plainReadingText(coreProfile.strength)} A blind spot to watch for is ${blindSpot.charAt(0).toLowerCase()}${blindSpot.slice(1)}`
  const challengeAnswer = `Under pressure, ${plainReadingText(coreProfile.pressure).replace(/^[A-Z]/, letter => letter.toLowerCase())} This is a possible response to strain, not a prediction that a problem must happen.`
  const primaryMoney = plans.complete.primary
  const hasSteadyIncome = (items: { god: string }[]) => items.some(item => item.god === '正財')
  const hasVariableIncome = (items: { god: string }[]) => items.some(item => item.god === '偏財')
  const visibleSteady = hasSteadyIncome(primaryMoney.visibleMoney), visibleVariable = hasVariableIncome(primaryMoney.visibleMoney)
  const hiddenSteady = hasSteadyIncome(primaryMoney.hiddenMoney), hiddenVariable = hasVariableIncome(primaryMoney.hiddenMoney)
  const collectionMoneyAnswer = visibleSteady && visibleVariable
    ? 'Your chart supports both repeat income and new deals or projects; each route needs different cash planning.'
    : visibleSteady
      ? 'Regular pay or repeat work is the clearer income route in your visible chart.'
      : visibleVariable
        ? 'New customers or project fees stand out more than a fixed pay route in your visible chart.'
        : hiddenSteady && hiddenVariable
          ? 'Both repeat pay and project income appear in less visible chart signs; neither indicates how much you will earn.'
          : hiddenSteady
            ? 'A possible regular-pay route appears in less visible chart signs; the chart does not estimate its amount.'
            : hiddenVariable
              ? 'A possible customer or project income route appears in less visible chart signs; it is not a promise of sales.'
              : 'The chart gives clearer clues about your work fit than about a direct source of income.'
  const earningPattern = collectionMoneyAnswer
  const annualWindow = `${annual.months[0]?.label ?? 'the next twelve months'} through ${annual.months.at(-1)?.label ?? ''}`
  const careerAnswer = `Your strongest work fit is a role centred on ${workTheme}. Look for a position where this is a regular task, not an occasional side responsibility.`
  const relationshipAnswer = `Your relationship needs include ${privateNeed}.`
  const partnerNeed = RELATIONSHIP_PROFILES[plans.compatibility.partner!.dayBranch].need
  const dayPair = plans.compatibility.pairPatterns.find(row => row.left === 'day' && row.right === 'day')!
  const dayFriction = dayPair.patterns.some(pattern => ['沖', '刑', '害', '破'].includes(pattern.type))
  const dayLink = dayPair.patterns.some(pattern => pattern.type === '合')
  const sharedNeed = privateNeed === partnerNeed
  const pairFit = dayFriction
    ? 'Your private styles can pull in different directions, so each person needs room for independent choices.'
    : dayLink
      ? sharedNeed ? 'The chart comparison supports shared plans, which builds on that common need.' : 'Your private styles support shared plans, while each person still needs a different kind of care.'
      : 'The chart shows no strong private-life link or clash; your stated needs are the clearest guide to how you fit.'
  const partnerAnswer = `${sharedNeed ? `You share a need for ${privateNeed}.` : `Your needs differ: you value ${privateNeed}, while your partner values ${partnerNeed}.`} ${pairFit}`
  const annualGod = LANGUAGE[plans.annual.annual[0].god]
  const annualInner = LANGUAGE[plans.annual.annual[0].innerGod]
  const annualWork = annualGod.work.en.split(/(?<=[.!?])\s/)[0].replace(/[.!?]+$/u, '').toLowerCase()
  const annualRelationship = annualInner.love.en.split(/(?<=[.!?])\s/)[0].replace(/[.!?]+$/u, '').toLowerCase()
  const annualSummary = `For ${annualWindow}, ${annualWork}. In close relationships, ${annualRelationship}. These are themes to compare with real choices, not promised events.`
  const longerShift = nextCycle
    ? `${nextCycle.period}. The longer-period emphasis moves toward ${nextCycle.headline.toLowerCase().replace(/ — repeated emphasis$/i, '')}.`
    : 'No further ten-year period is available in the supported calculation range, so this report does not add a later date.'
  const integratedCollectionAnswer = `Your work pattern centres on ${workTheme}; earning through it also depends on what you can deliver and collect. Your relationships need room for ${privateNeed}, so time is part of the money decision too. The full year runs ${annualWindow}; use its timing themes to review commitments, not predict results.`
  const collectionQuestions = [
    answer(1, 'What kind of person are you at your core?', life, undefined, coreAnswer),
    answer(2, 'Which strengths help you most, and what can get in your way?', strengthsOverview, undefined, strengthAnswer),
    answer(3, 'What kind of work is the best fit for you?', careerFit, undefined, careerAnswer),
    answer(4, 'How are you most likely to earn and manage money?', moneyFit, undefined, earningPattern),
    answer(5, 'What do you need from a close relationship?', relationshipNeed, undefined, relationshipAnswer),
    answer(6, 'How do you and your partner fit together?', relationshipFit, undefined, partnerAnswer),
    answer(7, 'What recurring challenge deserves your attention?', challenge, undefined, challengeAnswer),
    answer(8, 'What should you know about the next 12 months?', yearTheme, undefined, annualSummary),
    answer(9, 'When could a longer-term life or work shift deserve attention?', longTerm, undefined, longerShift),
    [
      '10 · How Do Your Life, Love, Work and Timing Fit Together?',
      'Question: How do these parts of your life connect?',
      `Your Answer: ${plainReadingText(integratedCollectionAnswer)}`,
      `Chart Links: ${plainReadingText(overviewParagraphs.slice(1, 3).join(' '))}`,
      `Shared Timing: ${plainReadingText(overviewParagraphs.slice(3, 5).join(' '))}`,
      `Practical Step: ${plainReadingText(overviewParagraphs.at(-1) ?? 'Compare work demands with actual pay and capacity, then make room for the relationship needs shown in both charts.')}`,
    ].join('\n\n'),
  ]
  const includedReports = [complete, compatibility, career, annual, love]
  const deliveredReports = includedReports.map(report => splitDeliveredReading(report.fullText))
  const deliveredBodies = deliveredReports.map(report => report.body.split('\n\n').filter(block => !block.includes('From the chart:')).join('\n\n'))
  const fullText = [
    'THE FATE KEY · Your Destiny Collection',
    overview.fullText,
    'Birth details', complete.birthSummary, ...complete.pillarSummary,
    "Your partner's birth details", compatibility.subjects[1].birthSummary,
    'Your Ten Questions', ...collectionQuestions,
    'Your Included Reports',
    ...deliveredBodies,
    CALCULATION_NOTES,
    'Chart evidence for these answers',
    ...deliveredReports.map(report => report.appendix),
    'Longer-term timing reference', ...lifeTimeline,
    'How this reading is prepared', ...complete.methodNotes,
  ].join('\n\n')
  const summary = [{ label: 'Your Life, Your Destiny', text: complete.summary[0].text }, { label: 'Your Next 12 Months', text: annual.summary[0].text }, { label: 'Are We Meant to Be?', text: compatibility.summary[0].text }, { label: 'Success, Money & Your Future', text: career.summary[0].text }, { label: 'Relationship Needs', text: love.summary[0].text }]
  return { title: 'Your Destiny Collection', complete, compatibility, annual, career, love, overview, summary, synthesis, fullText, wordCount: fullText.split(/\s+/).length }
}
