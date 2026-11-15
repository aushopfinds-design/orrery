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
import { workTask } from './personalised-choices.ts'
import { WORKING_LANGUAGE as LANGUAGE } from './purchase-language.ts'
import { DESTINY_COLLECTION_QUESTIONS } from './product-questions.ts'

export { DESTINY_COLLECTION_QUESTIONS } from './product-questions.ts'

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
  // Product 07 preserves the included Product 01 edition; targeted root-cause
  // narrative changes are applied only to standalone Product 01 reports.
  const complete = buildTraditionalCompleteFromPlan(plans.complete, true, false)
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
  const challenge = chapter(complete, 'life-challenges')
  const yearTheme = chapter(annual, 'annual-theme')
  const longTerm = chapter(complete, 'patterns')
  const lifeTimeline = complete.periods.length
    ? complete.periods.map(period => `${period.period} · ${period.pillar}: ${period.paragraphs.join(' ')}`)
    : ['No ten-year cycle falls within the available calculated range.']
  const coreProfile = PERSONAL_PROFILES[plans.complete.primary.dayStem]
  const privateNeed = RELATIONSHIP_PROFILES[plans.complete.primary.dayBranch].need
  const workTheme = LANGUAGE[plans.complete.primary.monthStemGod].name.en
  const workTaskText = workTask(plans.complete.primary)
  const challengeAnswer = `A major challenge is balancing ${workTaskText} with your need for ${privateNeed}. When work takes more time or attention, the personal need can be pushed aside; noticing that trade-off gives you room to choose differently.`
  const primaryMoney = plans.complete.primary
  const hasSteadyIncome = (items: { god: string }[]) => items.some(item => item.god === '正財')
  const hasVariableIncome = (items: { god: string }[]) => items.some(item => item.god === '偏財')
  const visibleSteady = hasSteadyIncome(primaryMoney.visibleMoney), visibleVariable = hasVariableIncome(primaryMoney.visibleMoney)
  const hiddenSteady = hasSteadyIncome(primaryMoney.hiddenMoney), hiddenVariable = hasVariableIncome(primaryMoney.hiddenMoney)
  const incomeSummary = visibleSteady && visibleVariable
    ? 'your chart points to both repeat income and new deals, so cash planning needs to account for both'
    : visibleSteady ? 'repeat income is the clearer route in your chart'
      : visibleVariable ? 'new customers or project fees are the clearer route in your chart'
        : hiddenSteady && hiddenVariable ? 'your chart gives small clues toward both repeat and project income, without showing an amount'
          : hiddenSteady ? 'your chart gives a small clue toward repeat income, but no amount'
            : hiddenVariable ? 'your chart gives a small clue toward project income, but no amount'
              : 'the chart gives clearer work-fit clues than direct income clues'
  const integratedCollectionAnswer = `Your work pattern centres on ${workTheme}, while ${incomeSummary}. They connect through delivery: opportunities help only when you can complete the work and collect payment. Your close relationships have a separate need: ${privateNeed}. These are related parts of your life, but the chart does not show that one causes another or guarantee an event.`
  const threeInsights = `Your chart brings together three distinct themes: ${coreProfile.focus} describes your personal starting style; ${workTheme} describes the work pattern; and in close relationships, ${privateNeed} matters most. They are separate clues, not a single fixed story.`
  const repeatingPatternText = plainReadingText(coreProfile.watchFor.at(-1) ?? coreProfile.watchFor[0])
  const repeatingPattern = `A pattern that may repeat is ${repeatingPatternText.charAt(0).toLowerCase()}${repeatingPatternText.slice(1)} This is a habit to notice, not a fixed outcome.`
  const finalMessage = `Let the chart be a prompt to notice your choices, not a rule that decides for you. Use the work, money and relationship themes as separate questions, then choose the next step that fits your real circumstances.`
  const collectionQuestions = [
    answer(1, DESTINY_COLLECTION_QUESTIONS[0], life, undefined, threeInsights),
    answer(2, DESTINY_COLLECTION_QUESTIONS[1], careerFit, undefined, `Your clearest opportunity is to use your chart's work pattern—${workTheme}—to solve a clear customer problem. Start with one offer you can deliver reliably.`),
    answer(3, DESTINY_COLLECTION_QUESTIONS[2], challenge, undefined, challengeAnswer),
    answer(4, DESTINY_COLLECTION_QUESTIONS[3], moneyFit, undefined, integratedCollectionAnswer),
    answer(5, DESTINY_COLLECTION_QUESTIONS[4], life, undefined, repeatingPattern),
    answer(6, DESTINY_COLLECTION_QUESTIONS[5], longTerm, undefined, 'No specific year stands out in the verified timing check. Use actual changes in work, money or relationships to decide when a new direction is worth considering.'),
    answer(7, DESTINY_COLLECTION_QUESTIONS[6], yearTheme, undefined, 'For the next three years, keep one simple record of time spent, costs and money received for your main work. Review it every month and change the offer or workload when the numbers do not support it. This is a practical check, not a prediction.'),
    answer(8, DESTINY_COLLECTION_QUESTIONS[7], strengthsOverview, undefined, `A strength you may overlook is this: ${plainReadingText(coreProfile.strength)} It can help you make a useful contribution even when the situation is uncertain.`),
    answer(9, DESTINY_COLLECTION_QUESTIONS[8], life, undefined, `A more fulfilling life gives you room to use your work strengths and still protect time for what restores you. Choose a weekly limit for extra duties, then keep one regular period for rest or the people who matter to you.`),
    [
      `10 · ${DESTINY_COLLECTION_QUESTIONS[9]}`,
      `Question: ${DESTINY_COLLECTION_QUESTIONS[9]}`,
      `Your Answer: ${plainReadingText(finalMessage)}`,
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
